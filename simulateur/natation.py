import hashlib
import json
import math
import random
from datetime import datetime, timedelta, timezone


NIVEAUX = {
    "novice": {
        "nombre_longueurs": (16, 32),
        "vitesse_m_s": (0.55, 0.80),
        "longueurs_par_bloc": (2, 4),
        "repos_s": (45, 90),
        "intensite_reserve": (0.45, 0.60),
        "distance_par_cycle_taille": (1.10, 1.45)
    },
    "intermediaire": {
        "nombre_longueurs": (32, 60),
        "vitesse_m_s": (0.80, 1.10),
        "longueurs_par_bloc": (4, 8),
        "repos_s": (30, 75),
        "intensite_reserve": (0.50, 0.70),
        "distance_par_cycle_taille": (1.35, 1.75)
    },
    "confirmer": {
        "nombre_longueurs": (48, 80),
        "vitesse_m_s": (1.10, 1.40),
        "longueurs_par_bloc": (6, 12),
        "repos_s": (30, 60),
        "intensite_reserve": (0.55, 0.75),
        "distance_par_cycle_taille": (1.60, 2.00)
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
    poids = verifier_nombre(profil.get("poids_kg"), "Le poids")
    taille = verifier_nombre(profil.get("taille_cm"), "La taille")

    niveau = str(profil.get("niveau", "")).strip().lower()
    sexe = str(profil.get("sexe", "")).strip().upper()

    if niveau not in NIVEAUX:
        raise ValueError(
            "Niveau attendu : novice, intermediaire ou confirmer."
        )

    if sexe not in {"H", "F"}:
        raise ValueError("Sexe attendu : H ou F.")

    return age, poids, taille, niveau


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
        f"natation-reference-v1:{identite}".encode("utf-8")
    ).digest()

    generateur = random.Random(
        int.from_bytes(empreinte[:8], byteorder="big")
    )

    return generateur.uniform(60, 80)


def simuler_natation(profil):
    age, poids, taille_cm, niveau = verifier_profil(profil)

    configuration = NIVEAUX[niveau]
    generateur = random.Random()

    longueur_bassin_m = 25
    type_nage = "crawl"
    intervalle_nominal_s = 5

    nombre_longueurs = generateur.randint(
        *configuration["nombre_longueurs"]
    )

    vitesse_reference = generateur.uniform(
        *configuration["vitesse_m_s"]
    )

    intensite_reference = generateur.uniform(
        *configuration["intensite_reserve"]
    )

    distance_par_cycle = (
        taille_cm / 100
        * generateur.uniform(
            *configuration["distance_par_cycle_taille"]
        )
    )

    fc_reference = generer_reference_cardiaque(profil)
    fc_max_estimee = 208 - 0.7 * age

    if fc_max_estimee <= fc_reference:
        raise ValueError(
            "Le modèle cardiaque n'est pas applicable à ce profil."
        )

    reserve_cardiaque = fc_max_estimee - fc_reference

    constante_montee_s = generateur.uniform(35, 60)
    constante_descente_s = generateur.uniform(45, 90)

    debut = datetime.now(timezone.utc).replace(microsecond=0)

    temps_ecoule = 0.0
    distance_totale = 0.0
    mouvements_total = 0
    longueurs_terminees = 0

    fc = fc_reference + generateur.uniform(0, 5)
    fluctuation = 0.0

    mesures = []
    longueurs = []
    pauses = []

    def ajouter_phase(
        phase,
        duree_s,
        intensite,
        distance_phase_m=0.0,
        mouvements_phase=0,
        numero_longueur=None
    ):
        nonlocal temps_ecoule
        nonlocal distance_totale
        nonlocal mouvements_total
        nonlocal longueurs_terminees
        nonlocal fc
        nonlocal fluctuation

        debut_phase = temps_ecoule
        distance_depart = distance_totale
        mouvements_depart = mouvements_total

        temps_phase = 0.0

        while temps_phase < duree_s:
            dt = min(
                intervalle_nominal_s,
                duree_s - temps_phase
            )

            fin_phase = duree_s - temps_phase <= intervalle_nominal_s
            fc_debut = fc

            correlation = math.exp(-dt / 30)

            fluctuation = (
                correlation * fluctuation
                + generateur.gauss(
                    0,
                    0.012 * math.sqrt(1 - correlation ** 2)
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
                + (fc_debut - fc_cible)
                * math.exp(-dt / constante)
            )

            fc_moyenne_intervalle = (
                fc_cible
                + (fc_debut - fc_cible)
                * constante / dt
                * (1 - math.exp(-dt / constante))
            )

            temps_phase = (
                duree_s if fin_phase else temps_phase + dt
            )

            progression = temps_phase / duree_s
            temps_ecoule = debut_phase + temps_phase

            distance_totale = (
                distance_depart
                + distance_phase_m * progression
            )

            mouvements_effectues = min(
                mouvements_phase,
                int(mouvements_phase * progression)
            )

            if fin_phase:
                mouvements_effectues = mouvements_phase

                if phase == "nage":
                    longueurs_terminees += 1

            mouvements_total = (
                mouvements_depart + mouvements_effectues
            )

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
                "length_id": numero_longueur,
                "distance_m": round(distance_totale, 4),
                "lengths_completed": longueurs_terminees,
                "stroke_count_total": mouvements_total
            })

    numero = 0

    while numero < nombre_longueurs:
        taille_bloc = min(
            generateur.randint(
                *configuration["longueurs_par_bloc"]
            ),
            nombre_longueurs - numero
        )

        for _ in range(taille_bloc):
            numero += 1
            progression_seance = numero / nombre_longueurs

            facteur_echauffement = min(
                1.0,
                0.75 + 0.25 * (numero - 1) / 3
            )

            facteur_retour_calme = (
                0.80
                if numero > nombre_longueurs - 2
                else 1.0
            )

            fatigue = 1 - 0.04 * progression_seance

            vitesse = (
                vitesse_reference
                * facteur_echauffement
                * facteur_retour_calme
                * fatigue
                * generateur.uniform(0.96, 1.04)
            )

            duree_longueur = round(
                longueur_bassin_m / vitesse,
                3
            )

            distance_cycle_longueur = (
                distance_par_cycle
                * (1 - 0.04 * progression_seance)
                * generateur.uniform(0.96, 1.04)
            )

            mouvements = max(
                1,
                round(
                    longueur_bassin_m
                    / distance_cycle_longueur
                )
            )

            intensite = (
                intensite_reference
                * facteur_echauffement
                * facteur_retour_calme
                + 0.03 * progression_seance
            )

            debut_longueur = temps_ecoule

            ajouter_phase(
                phase="nage",
                duree_s=duree_longueur,
                intensite=intensite,
                distance_phase_m=longueur_bassin_m,
                mouvements_phase=mouvements,
                numero_longueur=numero
            )

            longueurs.append({
                "length_id": numero,
                "debut": (
                    debut + timedelta(
                        seconds=debut_longueur
                    )
                ).isoformat(),
                "fin": (
                    debut + timedelta(seconds=temps_ecoule)
                ).isoformat(),
                "duree_s": duree_longueur,
                "distance_m": longueur_bassin_m,
                "stroke_count": mouvements,
                "type_nage": type_nage
            })

        if numero < nombre_longueurs:
            duree_pause = generateur.randint(
                *configuration["repos_s"]
            )

            debut_pause = temps_ecoule

            ajouter_phase(
                phase="repos",
                duree_s=duree_pause,
                intensite=0.05
            )

            pauses.append({
                "debut": (
                    debut + timedelta(seconds=debut_pause)
                ).isoformat(),
                "fin": (
                    debut + timedelta(seconds=temps_ecoule)
                ).isoformat(),
                "duree_s": duree_pause
            })

    return {
        "sport": "natation",
        "source": "simulation",
        "version_simulateur": "3.0",
        "scenario": "crawl_piscine_avec_pauses",
        "profil_utilise": dict(profil),
        "type_nage": type_nage,
        "longueur_bassin_m": longueur_bassin_m,
        "debut": debut.isoformat(),
        "fin": (
            debut + timedelta(seconds=temps_ecoule)
        ).isoformat(),
        "duree_secondes": temps_ecoule,
        "intervalle_nominal_secondes": intervalle_nominal_s,
        "parametres_simulation": {
            "fc_reference_bpm": round(fc_reference, 2),
            "fc_max_estimee_bpm": round(fc_max_estimee, 2),
            "vitesse_reference_m_s": round(
                vitesse_reference, 4
            ),
            "distance_par_cycle_reference_m": round(
                distance_par_cycle, 4
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
                "niveau",
                "taille_cm"
            ],
            "facteurs_conserves_sans_coefficient": [
                "poids_kg",
                "sexe"
            ],
            "mouvements": "cycles_du_bras_portant_la_montre"
        },
        "mesures": mesures,
        "longueurs": longueurs,
        "pauses": pauses
    }