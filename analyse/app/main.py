
import logging

from fastapi import FastAPI, HTTPException

from app.traitements.analyse_cardio import analyser_cardio
from app.traitements.analyse_velo import analyser_velo
from app.traitements.analyse_natation import analyser_natation
from app.traitements.analyse_muscu import analyser_muscu
from app.traitements.analyse_nutrition import analyser_nutrition
from app.traitements.analyse_sommeil import analyser_sommeil

app = FastAPI(title="DataFit - Analyses des séances")

logger = logging.getLogger(__name__)

ANALYSEURS = {
    "cardio": analyser_cardio,
    "velo": analyser_velo,
    "natation": analyser_natation,
    "muscu": analyser_muscu,
    "nutrition": analyser_nutrition,
    "sommeil": analyser_sommeil
}


@app.post("/analyser")
def analyser(donnees: dict):
    sport = donnees.get("sport")

    if not isinstance(sport, str) or sport not in ANALYSEURS:
        raise HTTPException(
            status_code=422,
            detail="Analyse attendue : cardio, velo, natation, muscu, nutrition ou sommeil."
        )

    try:
        return ANALYSEURS[sport](donnees)

    except ValueError as erreur:
        raise HTTPException(
            status_code=422,
            detail=str(erreur)
        ) from erreur

    except Exception as erreur:
        logger.exception(
            "Échec de l'analyse de la séance %s",
            sport
        )

        raise HTTPException(
            status_code=500,
            detail="L'analyse de la séance n'a pas pu être réalisée."
        ) from erreur
