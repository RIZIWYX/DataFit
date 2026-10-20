import argparse
import csv
import random
from datetime import datetime, timedelta
# FC frequence cardiaque en btm (battement par minute)

# Profils par niveau : vitesse moyenne (km/h), intensité (% de FC max), FC au repos
NIVEAUX = {
    "novice":        {"vitesse": 8.0,  "intensite": 0.78, "fc_repos": 72},
    "intermediaire": {"vitesse": 11.5, "intensite": 0.82, "fc_repos": 62},
    "pro":           {"vitesse": 15.5, "intensite": 0.86, "fc_repos": 48},
}


def construire_profil(niveau, sexe, age, poids):
    p = NIVEAUX[niveau]
    fc_max = 208 - 0.7 * age                      # formule de Tanaka
    fc_repos = p["fc_repos"] + (4 if sexe == "F" else 0) + 0.1 * (age - 25)
    fc_cible = p["intensite"] * fc_max + (3 if sexe == "F" else 0)
    fc_cible += 0.1 * (poids - 70)

    vitesse = p["vitesse"]
    if sexe == "F":
        vitesse *= 0.90
    vitesse *= 1 - 0.002 * (poids - 70)
    vitesse *= 1 - 0.003 * max(0, age - 30)

    return {"fc_max": fc_max, "fc_repos": fc_repos,
            "fc_cible": fc_cible, "vitesse": vitesse}


def simuler(niveau, sexe, age, poids, distance_km):
    """Retourne la liste de toutes les mesures (une par minute)."""
    prof = construire_profil(niveau, sexe, age, poids)
    fc = prof["fc_repos"] + 10
    distance = 0.0
    minute = 0
    debut = datetime.now().replace(second=0, microsecond=0)
    lignes = []

    while distance < distance_km:
        minute += 1
        echauffement = min(1.0, 0.5 + 0.5 * minute / 5)

        vitesse = prof["vitesse"] * echauffement * random.gauss(1, 0.04)

        derive = min(10, 0.15 * minute)
        fc_voulue = prof["fc_repos"] + (prof["fc_cible"] - prof["fc_repos"]) * echauffement + derive
        fc += 0.5 * (fc_voulue - fc) + random.gauss(0, 1.5)
        fc = max(prof["fc_repos"], min(prof["fc_max"], fc))

        pas = vitesse / 60          # km parcourus en une minute pleine
        duree_s = 60
        if distance + pas >= distance_km:
            reste = distance_km - distance
            duree_s = round(60 * reste / pas)   # secondes réellement nécessaires
            pas = reste
        distance += pas

        lignes.append({
            "timestamp": (debut + timedelta(minutes=minute - 1, seconds=duree_s)).isoformat(),
            "minute": minute,
            "duree_s": duree_s,
            "heart_rate": round(fc),
            "speed_kmh": round(vitesse, 2),
            "distance_km": round(distance, 3),
        })
    return lignes


def ecrire_csv(lignes, chemin):
    with open(chemin, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=lignes[0].keys())
        writer.writeheader()
        writer.writerows(lignes)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Simulateur de montre connectée -> CSV")
    ap.add_argument("--niveau", choices=NIVEAUX.keys(), required=True)
    ap.add_argument("--sexe", choices=["H", "F"], required=True)
    ap.add_argument("--age", type=int, required=True)
    ap.add_argument("--poids", type=float, required=True, help="en kg")
    ap.add_argument("--distance", type=float, required=True, help="en km")
    ap.add_argument("--sortie", default="seance.csv", help="nom du fichier CSV")
    a = ap.parse_args()

    lignes = simuler(a.niveau, a.sexe, a.age, a.poids, a.distance)
    ecrire_csv(lignes, a.sortie)
    print(f"{len(lignes)} lignes écrites dans {a.sortie}")