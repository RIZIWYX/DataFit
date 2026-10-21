import hashlib
import json
import math
import random
from datetime import datetime, timedelta, timezone


CONFIGURATIONS = {
    "novice": {
        "duree_minutes": (30, 45),
        "effort_secondes": (5, 10),
        "pause_secondes": (120, 180),
        "intensite_reserve": (0.60, 0.75),
        "variabilite_intensite": 0.020
    },
    "intermediaire": {
        "duree_minutes": (40, 60),
        "effort_secondes": (5, 15),
        "pause_secondes": (120, 240),
        "intensite_reserve": (0.65, 0.80),
        "variabilite_intensite": 0.020
    },
    "confirmer": {
        "duree_minutes": (50, 75),
        "effort_secondes": (5, 15),
        "pause_secondes": (180, 300),
        "intensite_reserve": (0.65, 0.85),
        "variabilite_intensite": 0.020
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


def generer_programme(
    configuration,
    debut_secondes,
    fin_secondes,
    intensite_base,
    generateur
):
    phases = []
    instant = debut_secondes
    pas = 5

    while instant < fin_secondes:
        minimum, maximum = configuration["effort_secondes"]

        duree_effort = generateur.randrange(
            minimum,
            maximum + pas,
            pas
        )

        fin_effort = min(
            instant + duree_effort,
            fin_secondes
        )

        phases.append({
            "type": "effort",
            "debut_secondes": instant,
            "fin_secondes": fin_effort,
            "intensite": intensite_base
            + generateur.uniform(-0.04, 0.04)
        })

        instant = fin_effort

        if instant < fin_secondes:
            minimum, maximum = configuration["pause_secondes"]

            duree_pause = generateur.randrange(
                minimum,
                maximum + pas,
                pas
            )

            fin_pause = min(
                instant + duree_pause,
                fin_secondes
            )

            phases.append({
                "type": "pause",
                "debut_secondes": instant,
                "fin_secondes": fin_pause,
                "intensite": generateur.uniform(0.05, 0.12)
            })

            instant = fin_pause

    return phases


def simuler_halterophilie(profil):
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

    echauffement_minutes = generateur.randint(5, 10)
    retour_calme_minutes = generateur.randint(3, 6)

    duree_secondes = duree_minutes * 60
    fin_echauffement = echauffement_minutes * 60
    debut_retour_calme = (
        duree_secondes - retour_calme_minutes * 60
    )

    intensite_base = generateur.uniform(
        *configuration["intensite_reserve"]
    )

    constante_montee = generateur.uniform(20, 40)
    constante_descente = generateur.uniform(50, 100)

    programme = generer_programme(
        configuration,
        fin_echauffement,
        debut_retour_calme,
        intensite_base,
        generateur
    )

    pas_calcul_secondes = 1
    intervalle_mesures_secondes = 5

    indice_phase = 0
    fluctuation = 0.0
    fc = fc_reference + generateur.uniform(0, 5)

    debut = datetime.now(timezone.utc).replace(microsecond=0)

    mesures = [{
        "date_heure": debut.isoformat(),
        "temps_secondes": 0,
        "fc_bpm": round(fc, 1)
    }]

    correlation = 0.85 ** (pas_calcul_secondes / 5)

    for seconde in range(
        pas_calcul_secondes,
        duree_secondes + 1,
        pas_calcul_secondes
    ):
        milieu_intervalle = seconde - pas_calcul_secondes / 2

        if milieu_intervalle < fin_echauffement:
            progression = milieu_intervalle / fin_echauffement
            intensite = 0.10 + 0.20 * progression

        elif milieu_intervalle < debut_retour_calme:
            while (
                indice_phase < len(programme) - 1
                and milieu_intervalle
                >= programme[indice_phase]["fin_secondes"]
            ):
                indice_phase += 1

            intensite = programme[indice_phase]["intensite"]

        else:
            progression = (
                (milieu_intervalle - debut_retour_calme)
                / (retour_calme_minutes * 60)
            )

            intensite = 0.08 * (1 - progression)

        fluctuation = (
            correlation * fluctuation
            + generateur.gauss(
                0,
                configuration["variabilite_intensite"]
                * math.sqrt(1 - correlation ** 2)
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
            1 - math.exp(
                -pas_calcul_secondes / constante_temps
            )
        )

        fc += adaptation * (fc_cible - fc)

        if seconde % intervalle_mesures_secondes == 0:
            instant = debut + timedelta(seconds=seconde)

            mesures.append({
                "date_heure": instant.isoformat(),
                "temps_secondes": seconde,
                "fc_bpm": round(fc, 1)
            })

    return {
        "sport": "halterophilie",
        "source": "simulation",
        "version_simulateur": "1.0",
        "scenario": "tentatives_breves_pauses_longues",
        "profil_utilise": dict(profil),
        "modele": {
            "statut": "non_valide_sur_donnees_reelles",
            "formule_fc_max": "208 - 0.7 * age",
            "domaine_reference_formule": "adultes_en_bonne_sante",
            "formule_specifique_halterophilie": False,
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
                intensite_base, 4
            ),
            "constante_montee_secondes": round(
                constante_montee, 2
            ),
            "constante_descente_secondes": round(
                constante_descente, 2
            ),
            "echauffement_secondes": fin_echauffement,
            "retour_calme_secondes": retour_calme_minutes * 60,
            "pas_calcul_secondes": pas_calcul_secondes
        },
        "debut": debut.isoformat(),
        "fin": (
            debut + timedelta(seconds=duree_secondes)
        ).isoformat(),
        "duree_secondes": duree_secondes,
        "intervalle_secondes": intervalle_mesures_secondes,
        "mesures": mesures
    }