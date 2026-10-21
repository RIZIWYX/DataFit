import hashlib
import json
import math
import random
from datetime import datetime, timedelta, timezone


CONFIGURATIONS = {
    "novice": {
        "duree_minutes": (20, 35),
        "intensite_reserve": (0.50, 0.65),
        "variabilite_intensite": 0.025
    },
    "intermediaire": {
        "duree_minutes": (30, 50),
        "intensite_reserve": (0.55, 0.70),
        "variabilite_intensite": 0.020
    },
    "confirmer": {
        "duree_minutes": (40, 70),
        "intensite_reserve": (0.60, 0.75),
        "variabilite_intensite": 0.015
    }
}


def verifier_profil(profil):
    age = profil.get("age")

    if isinstance(age, bool) or not isinstance(age, (int, float)):
        raise ValueError("L'âge doit être un nombre.")

    if not math.isfinite(age) or age <= 0:
        raise ValueError("L'âge doit être positif et fini.")

    niveau = profil.get("niveau")

    if not isinstance(niveau, str):
        raise ValueError("Le niveau doit être une chaîne de caractères.")

    niveau = niveau.strip().lower()

    if niveau not in CONFIGURATIONS:
        raise ValueError(
            "Niveau attendu : novice, intermediaire ou confirmer."
        )

    return float(age), niveau


def generer_reference_utilisateur(profil):
    identifiant = profil.get("id_utilisateur")

    if identifiant is not None:
        identite = str(identifiant)
    else:
        identite = json.dumps(
            profil,
            sort_keys=True,
            ensure_ascii=False,
            allow_nan=False
        )

    empreinte = hashlib.sha256(
        f"course-reference-v2:{identite}".encode("utf-8")
    ).digest()

    generateur = random.Random(
        int.from_bytes(empreinte[:8], byteorder="big")
    )

    return generateur.uniform(60, 80)


def simuler_course(profil):
    age, niveau = verifier_profil(profil)
    configuration = CONFIGURATIONS[niveau]
    generateur = random.Random()

    fc_reference = generer_reference_utilisateur(profil)
    fc_max_estimee = 208 - 0.7 * age

    if fc_max_estimee <= fc_reference:
        raise ValueError(
            "Le modèle ne peut pas être appliqué à ce profil : "
            "la FC maximale estimée est inférieure à la référence."
        )

    reserve_cardiaque = fc_max_estimee - fc_reference

    duree_minutes = generateur.randint(
        *configuration["duree_minutes"]
    )

    echauffement_minutes = generateur.randint(3, 6)
    retour_calme_minutes = generateur.randint(3, 6)

    duree_secondes = duree_minutes * 60
    fin_echauffement = echauffement_minutes * 60
    debut_retour_calme = (
        duree_secondes - retour_calme_minutes * 60
    )

    intensite_course = generateur.uniform(
        *configuration["intensite_reserve"]
    )

    derive_finale = generateur.uniform(0.0, 0.04)
    constante_montee = generateur.uniform(35, 60)
    constante_descente = generateur.uniform(45, 90)

    intervalle_secondes = 5
    fluctuation = 0.0
    fc = fc_reference + generateur.uniform(0, 5)

    debut = datetime.now(timezone.utc).replace(microsecond=0)

    mesures = [{
        "date_heure": debut.isoformat(),
        "temps_secondes": 0,
        "fc_bpm": round(fc, 1)
    }]

    for seconde in range(
        intervalle_secondes,
        duree_secondes + 1,
        intervalle_secondes
    ):
        if seconde <= fin_echauffement:
            progression = seconde / fin_echauffement

            intensite = (
                0.15
                + progression * (intensite_course - 0.15)
            )

        elif seconde <= debut_retour_calme:
            progression = (
                (seconde - fin_echauffement)
                / (debut_retour_calme - fin_echauffement)
            )

            intensite = (
                intensite_course
                + derive_finale * progression
            )

        else:
            progression = (
                (seconde - debut_retour_calme)
                / (retour_calme_minutes * 60)
            )

            intensite = (
                (intensite_course + derive_finale)
                * (1 - progression)
            )

        fluctuation = (
            0.85 * fluctuation
            + generateur.gauss(
                0,
                configuration["variabilite_intensite"]
                * math.sqrt(1 - 0.85 ** 2)
            )
        )

        intensite_effective = max(
            0.0,
            min(0.90, intensite + fluctuation)
        )

        fc_cible = (
            fc_reference
            + intensite_effective * reserve_cardiaque
        )

        if fc_cible >= fc:
            constante_temps = constante_montee
        else:
            constante_temps = constante_descente

        adaptation = (
            1 - math.exp(-intervalle_secondes / constante_temps)
        )

        fc += adaptation * (fc_cible - fc)

        instant = debut + timedelta(seconds=seconde)

        mesures.append({
            "date_heure": instant.isoformat(),
            "temps_secondes": seconde,
            "fc_bpm": round(fc, 1)
        })

    return {
        "sport": "course",
        "source": "simulation",
        "version_simulateur": "2.0",
        "scenario": "endurance_continue",
        "profil_utilise": dict(profil),
        "modele": {
            "statut": "non_valide_sur_donnees_reelles",
            "formule_fc_max": "208 - 0.7 * age",
            "domaine_reference_formule": "adultes_en_bonne_sante",
            "extrapolation_mineur": age < 18,
            "facteurs_utilises": [
                "age",
                "niveau"
            ],
            "reference_cardiaque": "synthetique_non_mesuree"
        },
        "parametres_simulation": {
            "fc_reference_bpm": round(fc_reference, 2),
            "fc_max_estimee_bpm": round(fc_max_estimee, 2),
            "intensite_fraction_reserve": round(
                intensite_course, 4
            ),
            "derive_fraction_reserve": round(derive_finale, 4),
            "constante_montee_secondes": round(
                constante_montee, 2
            ),
            "constante_descente_secondes": round(
                constante_descente, 2
            ),
            "echauffement_secondes": fin_echauffement,
            "retour_calme_secondes": retour_calme_minutes * 60
        },
        "debut": debut.isoformat(),
        "fin": (
            debut + timedelta(seconds=duree_secondes)
        ).isoformat(),
        "duree_secondes": duree_secondes,
        "intervalle_secondes": intervalle_secondes,
        "mesures": mesures
    }