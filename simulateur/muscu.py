import hashlib
import json
import math
import random
from datetime import datetime, timedelta, timezone


NIVEAUX = {
    "novice": {
        "nombre_series": (8, 12),
        "repetitions": (8, 12),
        "secondes_par_repetition": (2.5, 4.0),
        "repos_s": (90, 150),
        "intensite_reserve": (0.50, 0.65)
    },
    "intermediaire": {
        "nombre_series": (10, 16),
        "repetitions": (6, 12),
        "secondes_par_repetition": (2.5, 4.0),
        "repos_s": (120, 210),
        "intensite_reserve": (0.55, 0.75)
    },
    "confirmer": {
        "nombre_series": (12, 20),
        "repetitions": (4, 10),
        "secondes_par_repetition": (2.5, 4.0),
        "repos_s": (150, 300),
        "intensite_reserve": (0.60, 0.80)
    }
}


def verifier_nombre(valeur, nom):
    if isinstance(valeur, bool) or not isinstance(valeur, (int, float)):
        raise ValueError(f"{nom} doit être un nombre.")

    if not math.isfinite(valeur) or valeur <= 0:
        raise ValueError(f"{nom} doit être positif et fini.")

    return float(valeur)


def verifier_profil(profil):
    age = verifier_nombre(profil.get("age"), "L'âge")
    verifier_nombre(profil.get("poids_kg"), "Le poids")
    verifier_nombre(profil.get("taille_cm"), "La taille")

    niveau = str(profil.get("niveau", "")).strip().lower()
    sexe = str(profil.get("sexe", "")).strip().upper()

    if niveau not in NIVEAUX:
        raise ValueError(
            "Niveau attendu : novice, intermediaire ou confirmer."
        )

    if sexe not in {"H", "F"}:
        raise ValueError("Sexe attendu : H ou F.")

    return age, niveau


def generer_reference_cardiaque(profil):
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
        f"muscu-reference-v1:{identite}".encode("utf-8")
    ).digest()

    generateur = random.Random(
        int.from_bytes(empreinte[:8], byteorder="big")
    )

    return generateur.uniform(60, 80)


def simuler_muscu(profil):
    age, niveau = verifier_profil(profil)
    configuration = NIVEAUX[niveau]
    generateur = random.Random()

    fc_reference = generer_reference_cardiaque(profil)
    fc_max_estimee = 208 - 0.7 * age

    if fc_max_estimee <= fc_reference:
        raise ValueError(
            "Le modèle cardiaque n'est pas applicable à ce profil."
        )

    reserve_cardiaque = fc_max_estimee - fc_reference

    nombre_series = generateur.randint(
        *configuration["nombre_series"]
    )

    intensite_reference = generateur.uniform(
        *configuration["intensite_reserve"]
    )

    constante_montee_s = generateur.uniform(20, 40)
    constante_descente_s = generateur.uniform(50, 100)

    intervalle_nominal_s = 5
    debut = datetime.now(timezone.utc).replace(microsecond=0)

    temps_ecoule = 0.0
    fc = fc_reference + generateur.uniform(0, 5)
    fluctuation = 0.0
    repetitions_total = 0

    mesures = []
    series = []
    pauses = []

    def ajouter_phase(
        phase,
        duree_s,
        intensite,
        numero_serie,
        repetitions_phase=0
    ):
        nonlocal temps_ecoule
        nonlocal fc
        nonlocal fluctuation
        nonlocal repetitions_total

        debut_phase = temps_ecoule
        repetitions_depart = repetitions_total
        temps_phase = 0.0

        fc_debut_phase = fc
        fc_apres_60s = None

        while temps_phase < duree_s:
            dt = min(
                intervalle_nominal_s,
                duree_s - temps_phase
            )

            if temps_phase < 60 < temps_phase + dt:
                dt = 60 - temps_phase

            fin_phase = duree_s - temps_phase <= dt
            fc_debut_intervalle = fc

            correlation = math.exp(-dt / 30)

            fluctuation = (
                correlation * fluctuation
                + generateur.gauss(
                    0,
                    0.015 * math.sqrt(1 - correlation ** 2)
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

            constante = (
                constante_montee_s
                if fc_cible >= fc
                else constante_descente_s
            )

            fc = (
                fc_cible
                + (fc_debut_intervalle - fc_cible)
                * math.exp(-dt / constante)
            )

            fc_moyenne_intervalle = (
                fc_cible
                + (fc_debut_intervalle - fc_cible)
                * constante / dt
                * (1 - math.exp(-dt / constante))
            )

            temps_phase = (
                duree_s if fin_phase else temps_phase + dt
            )

            temps_ecoule = debut_phase + temps_phase
            progression = temps_phase / duree_s

            repetitions_effectuees = min(
                repetitions_phase,
                int(repetitions_phase * progression)
            )

            if fin_phase:
                repetitions_effectuees = repetitions_phase

            repetitions_total = (
                repetitions_depart + repetitions_effectuees
            )

            if math.isclose(
                temps_phase,
                60,
                rel_tol=0,
                abs_tol=1e-8
            ):
                fc_apres_60s = fc

            mesures.append({
                "timestamp": (
                    debut + timedelta(seconds=temps_ecoule)
                ).isoformat(),
                "duree_s": dt,
                "heart_rate": round(fc, 2),
                "heart_rate_mean": round(
                    fc_moyenne_intervalle, 2
                ),
                "phase": phase,
                "set_id": numero_serie,
                "repetitions_in_set": repetitions_effectuees,
                "repetitions_total": repetitions_total
            })

        return {
            "debut_secondes": debut_phase,
            "fin_secondes": temps_ecoule,
            "fc_debut_bpm": round(fc_debut_phase, 2),
            "fc_fin_bpm": round(fc, 2),
            "fc_apres_60s_bpm": (
                round(fc_apres_60s, 2)
                if fc_apres_60s is not None
                else None
            )
        }

    for numero_serie in range(1, nombre_series + 1):
        progression_seance = (
            (numero_serie - 1) / max(1, nombre_series - 1)
        )

        repetitions = generateur.randint(
            *configuration["repetitions"]
        )

        secondes_par_repetition = generateur.uniform(
            *configuration["secondes_par_repetition"]
        )

        duree_effort = round(
            repetitions * secondes_par_repetition,
            3
        )

        facteur_preparation = (
            0.70 if numero_serie <= 2 else 1.0
        )

        intensite_effort = (
            intensite_reference * facteur_preparation
            + 0.03 * progression_seance
            + generateur.uniform(-0.03, 0.03)
        )

        effort = ajouter_phase(
            phase="effort",
            duree_s=duree_effort,
            intensite=intensite_effort,
            numero_serie=numero_serie,
            repetitions_phase=repetitions
        )

        derniere_serie = numero_serie == nombre_series

        if derniere_serie:
            duree_repos = generateur.randint(180, 300)
            type_repos = "recuperation_finale"
        else:
            duree_repos = generateur.randint(
                *configuration["repos_s"]
            )
            type_repos = "entre_series"

        repos = ajouter_phase(
            phase="repos",
            duree_s=duree_repos,
            intensite=generateur.uniform(0.03, 0.08),
            numero_serie=numero_serie
        )

        series.append({
            "set_id": numero_serie,
            "debut": (
                debut + timedelta(
                    seconds=effort["debut_secondes"]
                )
            ).isoformat(),
            "fin": (
                debut + timedelta(
                    seconds=effort["fin_secondes"]
                )
            ).isoformat(),
            "duree_s": duree_effort,
            "repetitions": repetitions,
            "fc_debut_bpm": effort["fc_debut_bpm"],
            "fc_fin_bpm": effort["fc_fin_bpm"],
            "repos_suivant_s": duree_repos,
            "type_repos_suivant": type_repos
        })

        pauses.append({
            "after_set_id": numero_serie,
            "type": type_repos,
            "debut": (
                debut + timedelta(
                    seconds=repos["debut_secondes"]
                )
            ).isoformat(),
            "fin": (
                debut + timedelta(
                    seconds=repos["fin_secondes"]
                )
            ).isoformat(),
            "duree_s": duree_repos,
            "fc_debut_bpm": repos["fc_debut_bpm"],
            "fc_apres_60s_bpm": repos["fc_apres_60s_bpm"],
            "fc_fin_bpm": repos["fc_fin_bpm"]
        })

    return {
        "sport": "muscu",
        "source": "simulation",
        "version_simulateur": "1.0",
        "scenario": "series_avec_pauses",
        "profil_utilise": dict(profil),
        "debut": debut.isoformat(),
        "fin": (
            debut + timedelta(seconds=temps_ecoule)
        ).isoformat(),
        "duree_secondes": temps_ecoule,
        "intervalle_nominal_secondes": intervalle_nominal_s,
        "parametres_simulation": {
            "fc_reference_bpm": round(fc_reference, 2),
            "fc_max_estimee_bpm": round(fc_max_estimee, 2),
            "intensite_fraction_reserve": round(
                intensite_reference, 4
            ),
            "constante_montee_s": round(
                constante_montee_s, 2
            ),
            "constante_descente_s": round(
                constante_descente_s, 2
            )
        },
        "modele": {
            "statut": "non_valide_sur_donnees_reelles",
            "formule_fc_max": "208 - 0.7 * age",
            "domaine_reference_formule": "adultes_en_bonne_sante",
            "extrapolation_mineur": age < 18,
            "fc_reference": "synthetique_non_mesuree",
            "facteurs_utilises": [
                "age",
                "niveau"
            ],
            "facteurs_conserves_sans_coefficient": [
                "poids_kg",
                "taille_cm",
                "sexe"
            ],
            "repetitions": "comptage_synthetique",
            "charge_soulevee": "non_simulee"
        },
        "mesures": mesures,
        "series": series,
        "pauses": pauses
    }