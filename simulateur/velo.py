import hashlib
import json
import math
import random
from datetime import datetime, timedelta, timezone


NIVEAUX = {
    "novice": {
        "duree_minutes": (25, 40),
        "vitesse_kmh": (14, 20),
        "pedalage_s": (180, 420),
        "roue_libre_s": (10, 25),
        "nombre_arrets": (0, 2),
        "arret_s": (30, 90),
        "intensite_reserve": (0.40, 0.60)
    },
    "intermediaire": {
        "duree_minutes": (40, 65),
        "vitesse_kmh": (20, 26),
        "pedalage_s": (300, 600),
        "roue_libre_s": (10, 25),
        "nombre_arrets": (0, 2),
        "arret_s": (30, 90),
        "intensite_reserve": (0.45, 0.65)
    },
    "confirmer": {
        "duree_minutes": (60, 90),
        "vitesse_kmh": (26, 32),
        "pedalage_s": (420, 900),
        "roue_libre_s": (10, 25),
        "nombre_arrets": (0, 2),
        "arret_s": (30, 90),
        "intensite_reserve": (0.50, 0.70)
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
        f"velo-reference-v1:{identite}".encode("utf-8")
    ).digest()

    generateur = random.Random(
        int.from_bytes(empreinte[:8], byteorder="big")
    )

    return generateur.uniform(60, 80)


def generer_programme(configuration, generateur):
    duree_totale_s = (
        generateur.randint(*configuration["duree_minutes"]) * 60
    )

    echauffement_s = generateur.randint(3, 6) * 60
    retour_calme_s = generateur.randint(3, 6) * 60
    fin_partie_principale = duree_totale_s - retour_calme_s

    nombre_arrets = generateur.randint(
        *configuration["nombre_arrets"]
    )

    instants_arrets = [
        echauffement_s
        + (fin_partie_principale - echauffement_s)
        * numero / (nombre_arrets + 1)
        for numero in range(1, nombre_arrets + 1)
    ]

    programme = [{
        "phase": "pedalage",
        "type": "echauffement",
        "duree_s": echauffement_s
    }]

    temps = echauffement_s
    indice_arret = 0

    while temps < fin_partie_principale:
        if (
            indice_arret < len(instants_arrets)
            and temps >= instants_arrets[indice_arret]
        ):
            duree = min(
                generateur.randint(*configuration["arret_s"]),
                fin_partie_principale - temps
            )

            programme.append({
                "phase": "arret",
                "type": "pause",
                "duree_s": duree
            })

            temps += duree
            indice_arret += 1
            continue

        prochaine_limite = fin_partie_principale

        if indice_arret < len(instants_arrets):
            prochaine_limite = min(
                prochaine_limite,
                instants_arrets[indice_arret]
            )

        duree = min(
            generateur.randint(*configuration["pedalage_s"]),
            prochaine_limite - temps
        )

        if duree > 0:
            programme.append({
                "phase": "pedalage",
                "type": "endurance",
                "duree_s": duree
            })

            temps += duree

        if temps < prochaine_limite:
            duree = min(
                generateur.randint(*configuration["roue_libre_s"]),
                prochaine_limite - temps
            )

            programme.append({
                "phase": "roue_libre",
                "type": "roue_libre",
                "duree_s": duree
            })

            temps += duree

    programme.append({
        "phase": "pedalage",
        "type": "retour_calme",
        "duree_s": retour_calme_s
    })

    return programme


def simuler_velo(profil):
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

    vitesse_reference = generateur.uniform(
        *configuration["vitesse_kmh"]
    )

    intensite_reference = generateur.uniform(
        *configuration["intensite_reserve"]
    )

    constante_montee_s = generateur.uniform(35, 60)
    constante_descente_s = generateur.uniform(45, 90)

    programme = generer_programme(configuration, generateur)

    debut = datetime.now(timezone.utc).replace(microsecond=0)

    temps_ecoule = 0.0
    distance_km = 0.0
    vitesse = 0.0
    fc = fc_reference + generateur.uniform(0, 5)

    variation_vitesse = 0.0
    fluctuation_cardiaque = 0.0

    intervalle_nominal_s = 5
    mesures = []
    phases = []

    for segment in programme:
        phase = segment["phase"]
        type_segment = segment["type"]
        duree_segment = segment["duree_s"]

        debut_segment = temps_ecoule
        temps_segment = 0.0

        while temps_segment < duree_segment:
            dt = min(
                intervalle_nominal_s,
                duree_segment - temps_segment
            )

            progression = (
                temps_segment + dt / 2
            ) / duree_segment

            vitesse_debut = vitesse

            if phase == "pedalage":
                correlation_vitesse = math.exp(-dt / 30)

                variation_vitesse = (
                    correlation_vitesse * variation_vitesse
                    + generateur.gauss(
                        0,
                        0.025
                        * math.sqrt(1 - correlation_vitesse ** 2)
                    )
                )

                if type_segment == "echauffement":
                    facteur = 0.55 + 0.45 * progression

                elif type_segment == "retour_calme":
                    facteur = 0.90 - 0.45 * progression

                else:
                    facteur = 1.0

                vitesse_cible = (
                    vitesse_reference
                    * facteur
                    * max(0.80, min(1.20, 1 + variation_vitesse))
                )

                constante_vitesse_s = (
                    15 if vitesse_cible >= vitesse else 10
                )

                exponentielle = math.exp(
                    -dt / constante_vitesse_s
                )

                vitesse = (
                    vitesse_cible
                    + (vitesse_debut - vitesse_cible)
                    * exponentielle
                )

                vitesse_moyenne_intervalle = (
                    vitesse_cible
                    + (vitesse_debut - vitesse_cible)
                    * constante_vitesse_s / dt
                    * (1 - exponentielle)
                )

                intensite = intensite_reference * (
                    vitesse_cible / vitesse_reference
                ) ** 2

            elif phase == "roue_libre":
                constante_roue_libre_s = 45

                exponentielle = math.exp(
                    -dt / constante_roue_libre_s
                )

                vitesse = vitesse_debut * exponentielle

                vitesse_moyenne_intervalle = (
                    vitesse_debut
                    * constante_roue_libre_s / dt
                    * (1 - exponentielle)
                )

                intensite = 0.08

            else:
                vitesse = 0.0
                vitesse_moyenne_intervalle = 0.0
                intensite = 0.02

            correlation_fc = math.exp(-dt / 30)

            fluctuation_cardiaque = (
                correlation_fc * fluctuation_cardiaque
                + generateur.gauss(
                    0,
                    0.012 * math.sqrt(1 - correlation_fc ** 2)
                )
            )

            intensite_effective = max(
                0.0,
                min(0.90, intensite + fluctuation_cardiaque)
            )

            fc_cible = (
                fc_reference
                + intensite_effective * reserve_cardiaque
            )

            constante_fc_s = (
                constante_montee_s
                if fc_cible >= fc
                else constante_descente_s
            )

            fc_debut = fc
            exponentielle_fc = math.exp(-dt / constante_fc_s)

            fc = (
                fc_cible
                + (fc_debut - fc_cible) * exponentielle_fc
            )

            fc_moyenne_intervalle = (
                fc_cible
                + (fc_debut - fc_cible)
                * constante_fc_s / dt
                * (1 - exponentielle_fc)
            )

            distance_km += (
                vitesse_moyenne_intervalle * dt / 3600
            )

            temps_segment = min(
                duree_segment,
                temps_segment + dt
            )

            temps_ecoule = debut_segment + temps_segment

            mesures.append({
                "timestamp": (
                    debut + timedelta(seconds=temps_ecoule)
                ).isoformat(),
                "duree_s": dt,
                "heart_rate": round(fc, 2),
                "heart_rate_mean": round(
                    fc_moyenne_intervalle, 2
                ),
                "speed_kmh": round(vitesse, 3),
                "speed_mean_kmh": round(
                    vitesse_moyenne_intervalle, 3
                ),
                "distance_km": round(distance_km, 6),
                "phase": phase
            })

        phases.append({
            "phase": phase,
            "type": type_segment,
            "debut": (
                debut + timedelta(seconds=debut_segment)
            ).isoformat(),
            "fin": (
                debut + timedelta(seconds=temps_ecoule)
            ).isoformat(),
            "duree_s": duree_segment
        })

    return {
        "sport": "velo",
        "source": "simulation",
        "version_simulateur": "1.0",
        "scenario": "parcours_plat_sans_vent",
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
            "vitesse_reference_kmh": round(
                vitesse_reference, 3
            ),
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
            "freinage": "instantane_aux_arrets",
            "cadence": "non_simulee",
            "puissance": "non_simulee"
        },
        "mesures": mesures,
        "phases": phases
    }