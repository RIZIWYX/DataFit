import hashlib
import json
import math
import random
from datetime import datetime, timedelta, timezone


CONFIGURATIONS = {
    "novice": {
        "duree_minutes": (10, 20),
        "maintien_secondes": (15, 30),
        "transition_secondes": (10, 20)
    },
    "intermediaire": {
        "duree_minutes": (15, 25),
        "maintien_secondes": (20, 45),
        "transition_secondes": (10, 20)
    },
    "confirmer": {
        "duree_minutes": (20, 35),
        "maintien_secondes": (30, 60),
        "transition_secondes": (10, 20)
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
    generateur
):
    phases = []
    instant = debut_secondes
    pas = 5

    while instant < fin_secondes:
        minimum, maximum = configuration["maintien_secondes"]

        duree_maintien = generateur.randrange(
            minimum,
            maximum + pas,
            pas
        )

        fin_maintien = min(
            instant + duree_maintien,
            fin_secondes
        )

        phases.append({
            "type": "maintien",
            "debut_secondes": instant,
            "fin_secondes": fin_maintien,
            "intensite": generateur.uniform(0.05, 0.12)
        })

        instant = fin_maintien

        if instant < fin_secondes:
            minimum, maximum = configuration["transition_secondes"]

            duree_transition = generateur.randrange(
                minimum,
                maximum + pas,
                pas
            )

            fin_transition = min(
                instant + duree_transition,
                fin_secondes
            )

            phases.append({
                "type": "transition",
                "debut_secondes": instant,
                "fin_secondes": fin_transition,
                "intensite": generateur.uniform(0.08, 0.16)
            })

            instant = fin_transition

    return phases


def simuler_souplesse(profil):
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

    preparation_minutes = generateur.randint(2, 3)
    retour_calme_minutes = generateur.randint(2, 3)

    duree_secondes = duree_minutes * 60
    fin_preparation = preparation_minutes * 60
    debut_retour_calme = (
        duree_secondes - retour_calme_minutes * 60
    )

    constante_montee = generateur.uniform(30, 60)
    constante_descente = generateur.uniform(40, 80)
    variabilite_intensite = 0.008

    programme = generer_programme(
        configuration,
        fin_preparation,
        debut_retour_calme,
        generateur
    )

    pas_calcul_secondes = 1
    intervalle_mesures_secondes = 5

    indice_phase = 0
    fluctuation = 0.0
    fc = fc_reference + generateur.uniform(0, 3)

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

        if milieu_intervalle < fin_preparation:
            progression = milieu_intervalle / fin_preparation
            intensite = 0.03 + 0.07 * progression

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

            intensite = 0.05 * (1 - progression)

        fluctuation = (
            correlation * fluctuation
            + generateur.gauss(
                0,
                variabilite_intensite
                * math.sqrt(1 - correlation ** 2)
            )
        )

        intensite_effective = max(
            0.0,
            min(0.25, intensite + fluctuation)
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
        "sport": "souplesse",
        "source": "simulation",
        "version_simulateur": "1.0",
        "scenario": "etirements_statiques_doux",
        "profil_utilise": dict(profil),
        "modele": {
            "statut": "non_valide_sur_donnees_reelles",
            "formule_fc_max": "208 - 0.7 * age",
            "domaine_reference_formule": "adultes_en_bonne_sante",
            "formule_specifique_souplesse": False,
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
            "constante_montee_secondes": round(
                constante_montee, 2
            ),
            "constante_descente_secondes": round(
                constante_descente, 2
            ),
            "preparation_secondes": fin_preparation,
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