import csv
import math
import random
from datetime import datetime, timedelta, timezone


NIVEAUX = {
    "novice": {
        "vitesse": 8.0,
        "intensite": 0.78,
        "fc_repos": 72
    },
    "intermediaire": {
        "vitesse": 11.5,
        "intensite": 0.82,
        "fc_repos": 62
    },
    "confirmer": {
        "vitesse": 15.5,
        "intensite": 0.86,
        "fc_repos": 48
    }
}


def verifier_nombre(valeur, nom):
    if isinstance(valeur, bool) or not isinstance(valeur, (int, float)):
        raise ValueError(f"{nom} doit être un nombre.")

    if not math.isfinite(valeur) or valeur <= 0:
        raise ValueError(f"{nom} doit être positif et fini.")

    return float(valeur)


def construire_profil(niveau, sexe, age, poids):
    if niveau not in NIVEAUX:
        raise ValueError(
            "Niveau attendu : novice, intermediaire ou confirmer."
        )

    if sexe not in {"H", "F"}:
        raise ValueError("Sexe attendu : H ou F.")

    age = verifier_nombre(age, "L'âge")
    poids = verifier_nombre(poids, "Le poids")
    parametres = NIVEAUX[niveau]

    fc_max = 208 - 0.7 * age

    fc_repos = (
        parametres["fc_repos"]
        + (4 if sexe == "F" else 0)
        + 0.1 * (age - 25)
    )

    fc_cible = (
        parametres["intensite"] * fc_max
        + (3 if sexe == "F" else 0)
        + 0.1 * (poids - 70)
    )

    vitesse = parametres["vitesse"]

    if sexe == "F":
        vitesse *= 0.90

    vitesse *= 1 - 0.002 * (poids - 70)
    vitesse *= 1 - 0.003 * max(0, age - 30)

    if not 0 < fc_repos < fc_cible < fc_max or vitesse <= 0:
        raise ValueError(
            "Les coefficients du modèle initial ne sont pas "
            "applicables à ce profil."
        )

    return {
        "fc_max": fc_max,
        "fc_repos": fc_repos,
        "fc_cible": fc_cible,
        "vitesse": vitesse
    }


def simuler(niveau, sexe, age, poids, distance_km, debut=None):
    distance_km = verifier_nombre(distance_km, "La distance")
    parametres = construire_profil(niveau, sexe, age, poids)

    debut = debut or datetime.now(timezone.utc).replace(
        microsecond=0
    )

    fc = min(
        parametres["fc_repos"] + 10,
        parametres["fc_max"]
    )

    distance = 0.0
    temps_ecoule = 0.0
    lignes = []

    while distance < distance_km:
        numero = len(lignes) + 1

        echauffement = min(
            1.0,
            0.5 + 0.5 * numero / 5
        )

        facteur_vitesse = max(
            0.5,
            min(1.5, random.gauss(1, 0.04))
        )

        vitesse = round(
            parametres["vitesse"]
            * echauffement
            * facteur_vitesse,
            2
        )

        if vitesse <= 0:
            raise ValueError(
                "La vitesse calculée est trop faible pour ce modèle."
            )

        reste = distance_km - distance
        dernier_intervalle = reste <= vitesse / 60

        if dernier_intervalle:
            duree_s = reste * 3600 / vitesse
        else:
            duree_s = 60.0

        derive = min(
            10,
            0.15 * (temps_ecoule + duree_s) / 60
        )

        fc_cible = (
            parametres["fc_repos"]
            + (
                parametres["fc_cible"]
                - parametres["fc_repos"]
            ) * echauffement
            + derive
        )

        fc_cible = min(fc_cible, parametres["fc_max"])

        fraction_minute = duree_s / 60

        adaptation = 1 - 0.5 ** fraction_minute

        ecart_bruit = 1.5 * math.sqrt(
            (1 - 0.5 ** (2 * fraction_minute))
            / (1 - 0.5 ** 2)
        )

        fc += (
            adaptation * (fc_cible - fc)
            + random.gauss(0, ecart_bruit)
        )

        fc = max(
            parametres["fc_repos"],
            min(parametres["fc_max"], fc)
        )

        temps_ecoule += duree_s

        if dernier_intervalle:
            distance = distance_km
        else:
            distance += vitesse * duree_s / 3600

        lignes.append({
            "timestamp": (
                debut + timedelta(seconds=temps_ecoule)
            ).isoformat(),
            "minute": numero,
            "duree_s": duree_s,
            "heart_rate": round(fc),
            "speed_kmh": vitesse,
            "distance_km": round(distance, 6)
        })

        if dernier_intervalle:
            break

    return lignes


def simuler_cardio(profil):
    niveau = str(profil.get("niveau", "")).strip().lower()
    sexe = str(profil.get("sexe", "")).strip().upper()

    age = verifier_nombre(profil.get("age"), "L'âge")
    poids = verifier_nombre(profil.get("poids_kg"), "Le poids")

    distance_cible = random.choice([
        3.0, 4.0, 5.0, 6.0, 7.0, 8.0
    ])

    debut = datetime.now(timezone.utc).replace(microsecond=0)

    mesures = simuler(
        niveau,
        sexe,
        age,
        poids,
        distance_cible,
        debut
    )

    duree = sum(
        mesure["duree_s"]
        for mesure in mesures
    )

    return {
        "sport": "cardio",
        "discipline": "course_a_pied",
        "source": "simulation",
        "version_simulateur": "1.1",
        "scenario": "course_continue_sans_pause",
        "profil_utilise": dict(profil),
        "debut": debut.isoformat(),
        "fin": mesures[-1]["timestamp"],
        "duree_secondes": duree,
        "intervalle_nominal_secondes": 60,
        "parametres_simulation": {
            "distance_cible_km": distance_cible
        },
        "modele": {
            "statut": (
                "coefficients_initiaux_non_valides_sur_donnees_reelles"
            ),
            "formule_fc_max": "208 - 0.7 * age",
            "domaine_reference_formule": "adultes_en_bonne_sante",
            "extrapolation_mineur": age < 18,
            "fc_repos": "estimee_non_mesuree",
            "coefficients_sexe_poids_niveau": (
                "hypotheses_du_fichier_initial"
            )
        },
        "mesures": mesures
    }


def ecrire_csv(lignes, chemin):
    if not lignes:
        raise ValueError("Aucune mesure à enregistrer.")

    with open(
        chemin,
        "w",
        newline="",
        encoding="utf-8"
    ) as fichier:
        writer = csv.DictWriter(
            fichier,
            fieldnames=lignes[0].keys()
        )

        writer.writeheader()
        writer.writerows(lignes)