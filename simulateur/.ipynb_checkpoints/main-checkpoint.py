import importlib
import json
import logging
from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field


app = FastAPI(title="DataFit - Simulateurs")

logger = logging.getLogger(__name__)


class Profil(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)

    utilisateur_id: int = Field(gt=0)
    sexe: Literal["H", "F"]
    poids: float = Field(gt=0)
    taille: float = Field(gt=0)
    niveau: Literal["novice", "intermediaire", "confirmer"]
    date_naissance: date


class Seance(BaseModel):
    type: Literal["cardio", "natation", "muscu", "velo"]
    nom: str = Field(min_length=1, max_length=255)
    date: date


class DemandeSimulation(BaseModel):
    profil: Profil
    seance: Seance


SIMULATEURS = {
    "cardio": ("cardio", "simuler_cardio"),
    "natation": ("natation", "simuler_natation"),
    "muscu": ("muscu", "simuler_muscu"),
    "velo": ("velo", "simuler_velo")
}


def calculer_age(date_naissance, date_seance):
    if date_naissance >= date_seance:
        raise ValueError(
            "La date de naissance doit être antérieure "
            "à la date de la séance."
        )

    age = date_seance.year - date_naissance.year

    if (
        date_seance.month,
        date_seance.day
    ) < (
        date_naissance.month,
        date_naissance.day
    ):
        age -= 1

    if age == 0:
        return (date_seance - date_naissance).days / 365.2425

    return age


@app.post("/simuler")
def simuler(demande: DemandeSimulation):
    profil_recu = demande.profil
    seance_recue = demande.seance
    sport = seance_recue.type

    nom_seance = seance_recue.nom.strip()

    if not nom_seance:
        raise HTTPException(
            status_code=422,
            detail="Le nom de la séance ne doit pas être vide."
        )

    try:
        age = calculer_age(
            profil_recu.date_naissance,
            seance_recue.date
        )

    except ValueError as erreur:
        raise HTTPException(
            status_code=422,
            detail=str(erreur)
        ) from erreur

    profil_simulateur = {
        "id_utilisateur": profil_recu.utilisateur_id,
        "age": age,
        "poids_kg": profil_recu.poids,
        "taille_cm": profil_recu.taille,
        "sexe": profil_recu.sexe,
        "niveau": profil_recu.niveau
    }

    nom_module, nom_fonction = SIMULATEURS[sport]

    try:
        module = importlib.import_module(nom_module)
        simulateur = getattr(module, nom_fonction)

        if not callable(simulateur):
            raise TypeError(
                f"{nom_fonction} doit être une fonction."
            )

    except Exception as erreur:
        logger.exception(
            "Impossible de charger le simulateur %s",
            sport
        )

        raise HTTPException(
            status_code=500,
            detail="Le simulateur demandé n'est pas disponible."
        ) from erreur

    try:
        resultat = simulateur(profil_simulateur)

    except ValueError as erreur:
        raise HTTPException(
            status_code=422,
            detail=str(erreur)
        ) from erreur

    except Exception as erreur:
        logger.exception(
            "Échec de simulation pour l'utilisateur %s",
            profil_recu.utilisateur_id
        )

        raise HTTPException(
            status_code=500,
            detail="La simulation n'a pas pu être réalisée."
        ) from erreur

    try:
        if not isinstance(resultat, dict):
            raise TypeError(
                "Le simulateur doit renvoyer un dictionnaire."
            )

        if not isinstance(resultat.get("mesures"), list):
            raise TypeError(
                "Le résultat doit contenir une liste de mesures."
            )

        if not resultat["mesures"]:
            raise ValueError(
                "Le simulateur n'a généré aucune mesure."
            )

        reponse = {
            **resultat,
            "utilisateur_id": profil_recu.utilisateur_id,
            "sport": sport,
            "nom": nom_seance,
            "date": seance_recue.date.isoformat(),
            "source": "simulation",
            "profil_utilise": profil_recu.model_dump(mode="json")
        }

        json.dumps(reponse, allow_nan=False)

    except Exception as erreur:
        logger.exception(
            "Résultat invalide pour l'utilisateur %s",
            profil_recu.utilisateur_id
        )

        raise HTTPException(
            status_code=500,
            detail="Le simulateur a produit un résultat invalide."
        ) from erreur

    return reponse