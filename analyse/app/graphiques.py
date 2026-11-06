"""Données des graphiques des notebooks, calculées depuis les mesures conservées.

La réponse contient des séries numériques : le front dessine les graphes, sans
reconstruire une courbe depuis une moyenne ni exécuter matplotlib côté serveur.
"""
from datetime import date
import math
import numpy as np
import pandas as pd



def _nombre(v):
    return isinstance(v, (float, int, np.number)) and not isinstance(v, bool) and math.isfinite(float(v))


def _serie(nom, xs, ys, libelles=None, **options):
    points = []
    for i, (x, y) in enumerate(zip(xs, ys)):
        if not _nombre(x) or not _nombre(y):
            continue
        p = {"x": float(x), "y": float(y)}
        if libelles is not None:
            p["libelle"] = str(libelles[i])
        points.append(p)
    return {"nom": nom, "points": points, **options}


def _graphe(id_, titre, serie, unite_y, *, type_="ligne", axe_x="Temps écoulé", unite_x="min", **options):
    return {"id": id_, "titre": titre, "type": type_, "axeX": axe_x,
            "axeY": options.pop("axeY", titre), "uniteX": unite_x, "uniteY": unite_y,
            "series": serie, **options}


def _histogramme(id_, titre, valeurs, unite):
    effectifs, bornes = np.histogram(np.asarray(valeurs, dtype=float), bins=8)
    centres = (bornes[:-1] + bornes[1:]) / 2
    libelles = [f"{a:.2f} – {b:.2f} {unite}" for a, b in zip(bornes[:-1], bornes[1:])]
    return _graphe(id_, titre, [_serie("Nombre de mesures", centres, effectifs, libelles)],
                   "mesures", type_="histogramme", axe_x=titre, unite_x=unite,
                   largeurColonne=float(bornes[1] - bornes[0]))


def graphiques_seance(donnees):
    sport = donnees.get("sport")
    if sport not in {"cardio", "velo", "natation", "muscu"}:
        raise ValueError("Sport inconnu pour les graphiques.")
    lignes = donnees.get("mesures")
    if not isinstance(lignes, list) or not lignes or any(not isinstance(m, dict) for m in lignes):
        raise ValueError("Les mesures originales sont nécessaires aux graphiques.")
    df = pd.DataFrame(lignes)
    for nom in ["duree_s", "heart_rate"]:
        if nom not in df or not all(_nombre(v) for v in df[nom]):
            raise ValueError(f"Mesures {nom} absentes ou invalides.")
    dt = df["duree_s"].to_numpy(dtype=float)
    if (dt <= 0).any():
        raise ValueError("Les intervalles des mesures doivent être positifs.")
    temps = np.cumsum(dt) / 60
    fc = df["heart_rate"].to_numpy(dtype=float)
    graphes = [_graphe("fc", "Fréquence cardiaque", [_serie("FC mesurée", temps, fc)], "bpm",
                        references=[{"nom": "FC moyenne pondérée", "valeur": float(np.average(fc, weights=dt))}])]
    vitesse = None
    if "speed_kmh" in df:
        vitesse = df["speed_kmh"].to_numpy(dtype=float)
    elif sport == "natation" and "distance_m" in df:
        # La montre de natation mesure la distance cumulée : vitesse par intervalle.
        vitesse = np.diff(df["distance_m"].to_numpy(dtype=float), prepend=0) / dt * 3.6
    if vitesse is not None:
        graphes.append(_graphe("vitesse", "Vitesse", [_serie("Vitesse" if sport != "natation" else "Vitesse calculée par intervalle", temps, vitesse)], "km/h"))
    if "distance_km" in df or "distance_m" in df:
        distance = df["distance_km"] if "distance_km" in df else df["distance_m"] / 1000
        graphes.append(_graphe("distance", "Distance cumulée", [_serie("Distance", temps, distance)], "km", depuisZero=True))
    if vitesse is not None:
        graphes.extend([
            _graphe("relation-vitesse-fc", "Relation vitesse / fréquence cardiaque",
                    [_serie("Mesures", vitesse, fc)], "bpm", type_="nuage", axe_x="Vitesse", unite_x="km/h"),
            _histogramme("distribution-vitesse", "Distribution des vitesses", vitesse, "km/h"),
        ])
    graphes.append(_histogramme("distribution-fc", "Distribution de la fréquence cardiaque", fc, "bpm"))
    if sport == "natation" and "length_id" in df:
        nage = df[df["phase"] == "nage"] if "phase" in df else df
        durees = nage.groupby("length_id", sort=False)["duree_s"].sum()
        graphes.append(_graphe("longueurs", "Durée par longueur", [_serie("Durée", list(range(1, len(durees) + 1)), durees)], "s", type_="histogramme", axe_x="Longueur", unite_x="", largeurColonne=0.8))
    if sport == "muscu":
        if "repetitions_total" in df:
            graphes.append(_graphe("repetitions", "Répétitions cumulées", [_serie("Répétitions", temps, df["repetitions_total"])], "répétitions", type_="paliers", depuisZero=True))
        if "phase" in df:
            totaux = df.groupby("phase", sort=False)["duree_s"].sum() / 60
            graphes.append(_graphe("effort-repos", "Répartition effort / repos", [_serie("Durée", list(range(len(totaux))), totaux, list(totaux.index))], "min", type_="histogramme", axe_x="Phase", unite_x="", largeurColonne=0.8))
    return {"version": 1, "graphiques": graphes}



METRIQUES = {
    "cardio": [("vitesseMoyKmh", "Vitesse moyenne", "km/h"), ("fcMoy", "Fréquence cardiaque moyenne", "bpm"), ("dureeS", "Durée des séances", "min"), ("variationVitesse", "Régularité de la vitesse", "%"), ("distanceM", "Distance par séance", "km"), ("tempsMoy1kmS", "Allure moyenne au kilomètre", "s/km")],
    "velo": [("vitesseMoyKmh", "Vitesse moyenne", "km/h"), ("fcMoy", "Fréquence cardiaque moyenne", "bpm"), ("dureeS", "Durée des séances", "min"), ("variationVitesse", "Régularité de la vitesse", "%"), ("distanceM", "Distance par séance", "km"), ("tempsPauseS", "Temps de pause", "min")],
    "natation": [("tempsMoy100mS", "Allure moyenne aux 100 m", "s/100 m"), ("fcMoy", "Fréquence cardiaque moyenne", "bpm"), ("dureeS", "Durée des séances", "min"), ("variationDureeLongueurs", "Régularité des longueurs", "%"), ("distanceM", "Distance par séance", "m"), ("dureeLongueurRapideS", "Meilleure longueur", "s")],
    "muscu": [("nbSeries", "Nombre de séries", "séries"), ("fcMoy", "Fréquence cardiaque moyenne", "bpm"), ("dureeS", "Durée des séances", "min"), ("dureePauseS", "Temps de repos", "min"), ("baisseFcApres60s", "Récupération cardiaque après 60 s", "bpm")],
}
NOMS = {"cardio": "Course à pied", "velo": "Vélo", "natation": "Natation", "muscu": "Musculation"}


def graphiques_progression(donnees):
    lignes = donnees.get("seances", [])
    if not isinstance(lignes, list) or any(not isinstance(s, dict) for s in lignes):
        raise ValueError("L’historique doit être une liste de séances.")
    graphes = []
    for sport, metriques in METRIQUES.items():
        seances = sorted([s for s in lignes if s.get("sport") == sport], key=lambda s: (str(s.get("date", "")), s.get("id", 0)))
        for champ, titre, unite in metriques:
            valeurs = [s for s in seances if _nombre(s.get(champ))]
            if not valeurs:
                continue
            ys = [float(s[champ]) / (3600 if unite == "h" else 60 if unite == "min" else 1000 if champ == "distanceM" and unite == "km" else 1) for s in valeurs]
            xs = list(range(1, len(valeurs) + 1))
            libelles = [f"{s['date']} · {s.get('nom', 'Nuit')}" for s in valeurs]
            series = [_serie(titre, xs, ys, libelles)]
            if champ in {"vitesseMoyKmh", "fcMoy", "fcMoyenne"}:
                mobile = pd.Series(ys).rolling(3, min_periods=1).mean()
                series.append(_serie("Moyenne mobile (3 séances)", xs, mobile, libelles, pointilles=True))
            graphes.append(_graphe(f"{sport}-{champ}", f"{NOMS[sport]} · {titre}", series, unite, axe_x="Séances par ordre chronologique", unite_x="", note="Chaque point correspond à une séance enregistrée ; les sports sont comparés séparément."))
        # Le notebook compare des courses sur 5 km : aucune extrapolation à une autre distance.
        if sport == "cardio":
            cinq = [s for s in seances if _nombre(s.get("distanceM")) and abs(s["distanceM"] - 5000) <= 1 and _nombre(s.get("dureeS"))]
            if cinq:
                graphes.append(_graphe("cardio-5km", "Course à pied · Temps sur 5 km", [_serie("Temps sur 5 km", range(1, len(cinq) + 1), [s["dureeS"] / 60 for s in cinq], [s["date"] for s in cinq])], "min", axe_x="Courses de 5 km", unite_x=""))
    return {"version": 1, "graphiques": graphes}
