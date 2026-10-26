from datetime import datetime

import numpy as np
import pandas as pd


def analyser_velo(donnees):
    if not isinstance(donnees, dict) or donnees.get("sport") != "velo":
        raise ValueError(
            "Les données doivent correspondre à une séance vélo."
        )

    mesures = donnees.get("mesures")

    if not isinstance(mesures, list) or not mesures:
        raise ValueError("La séance ne contient aucune mesure.")

    if any(not isinstance(m, dict) for m in mesures):
        raise ValueError(
            "Chaque mesure doit être un dictionnaire."
        )

    df = pd.DataFrame(mesures)

    numeriques = [
        "duree_s",
        "heart_rate",
        "heart_rate_mean",
        "speed_kmh",
        "speed_mean_kmh",
        "distance_km"
    ]

    colonnes = ["timestamp", "phase", *numeriques]

    if not all(colonne in df.columns for colonne in colonnes):
        raise ValueError(
            "Des colonnes nécessaires à l'analyse sont absentes."
        )

    for colonne in numeriques:
        if any(
            isinstance(v, bool) or not isinstance(v, (int, float))
            for v in df[colonne].tolist()
        ):
            raise ValueError(
                f"La colonne {colonne} doit contenir des nombres."
            )

        df[colonne] = df[colonne].astype(float)

        if not np.isfinite(df[colonne]).all():
            raise ValueError(
                f"La colonne {colonne} contient une valeur invalide."
            )

    if (
        df[["duree_s", "heart_rate", "heart_rate_mean"]] <= 0
    ).any().any():
        raise ValueError(
            "Les durées et les fréquences cardiaques doivent être positives."
        )

    if (
        df[["speed_kmh", "speed_mean_kmh", "distance_km"]] < 0
    ).any().any():
        raise ValueError(
            "Les vitesses et les distances doivent être positives ou nulles."
        )

    phases = ["pedalage", "roue_libre", "arret"]

    if not df["phase"].isin(phases).all():
        raise ValueError(
            "Phase attendue : pedalage, roue_libre ou arret."
        )

    try:
        dates = pd.Series(
            pd.to_datetime(
                [
                    datetime.fromisoformat(
                        str(v).replace("Z", "+00:00")
                    )
                    for v in df["timestamp"]
                ],
                utc=True
            )
        )
    except (ValueError, TypeError, OverflowError) as erreur:
        raise ValueError(
            "Les dates des mesures sont invalides."
        ) from erreur

    ecarts = dates.diff().iloc[1:].dt.total_seconds()

    if (ecarts <= 0).any():
        raise ValueError(
            "Les mesures doivent être dans l'ordre chronologique."
        )

    if not np.allclose(
        ecarts,
        df["duree_s"].iloc[1:],
        atol=0.001,
        rtol=1e-7
    ):
        raise ValueError(
            "Les dates ne correspondent pas aux durées des mesures."
        )

    if (df["distance_km"].diff().dropna() < 0).any():
        raise ValueError(
            "La distance cumulée ne doit pas diminuer."
        )

    durees = df["duree_s"].to_numpy()
    fc = df["heart_rate"].to_numpy()
    fc_intervalles = df["heart_rate_mean"].to_numpy()
    vitesses = df["speed_kmh"].to_numpy()
    vitesses_intervalles = df["speed_mean_kmh"].to_numpy()

    duree_totale = float(durees.sum())
    distance_totale = float(df["distance_km"].iloc[-1])

    if distance_totale <= 0:
        raise ValueError(
            "La distance totale doit être supérieure à zéro."
        )

    fc_moyenne = float(
        np.average(fc_intervalles, weights=durees)
    )

    vitesse_moyenne = distance_totale * 3600 / duree_totale

    centre_vitesse = float(
        np.average(vitesses_intervalles, weights=durees)
    )

    if centre_vitesse <= 0:
        raise ValueError(
            "La vitesse moyenne des mesures doit être supérieure à zéro."
        )

    ecarts_vitesse = vitesses_intervalles - centre_vitesse

    variance_vitesse = float(
        np.average(ecarts_vitesse ** 2, weights=durees)
    )

    variation = round(
        float(
            100 * np.sqrt(variance_vitesse) / centre_vitesse
        ),
        6
    )

    deplacement = df["phase"].isin(
        ["pedalage", "roue_libre"]
    ).to_numpy()

    x = vitesses_intervalles[deplacement]
    y = fc_intervalles[deplacement]
    poids = durees[deplacement]

    correlation = None

    if len(x) >= 2:
        dx = x - np.average(x, weights=poids)
        dy = y - np.average(y, weights=poids)

        vx = float(
            np.average(dx ** 2, weights=poids)
        )

        vy = float(
            np.average(dy ** 2, weights=poids)
        )

        if vx > 1e-12 and vy > 1e-12:
            covariance = float(
                np.average(dx * dy, weights=poids)
            )

            correlation = covariance / np.sqrt(vx * vy)

            correlation = round(
                float(np.clip(correlation, -1, 1)),
                6
            )

    if correlation is None:
        raise ValueError(
            "La corrélation vitesse-FC est impossible à calculer : "
            "il faut au moins deux mesures en déplacement "
            "avec une vitesse et une FC variables."
        )

    temps_phases = [
        float(
            df.loc[df["phase"] == phase, "duree_s"].sum()
        )
        for phase in phases
    ]

    durees_entieres = [
        int(np.floor(t))
        for t in temps_phases
    ]

    reste = int(round(duree_totale)) - sum(durees_entieres)

    ordre = sorted(
        range(3),
        key=lambda i: temps_phases[i] - durees_entieres[i],
        reverse=True
    )

    for i in ordre[:reste]:
        durees_entieres[i] += 1

    pedalage_s, roue_libre_s, pause_s = durees_entieres

    return {
        "fcMin": int(round(float(fc.min()))),
        "fcMoy": int(round(fc_moyenne)),
        "fcMax": int(round(float(fc.max()))),
        "correlationFcVitesse": correlation,
        "dureeS": sum(durees_entieres),
        "tempsPedalageS": pedalage_s,
        "tempsRoueLibreS": roue_libre_s,
        "tempsPauseS": pause_s,
        "distanceM": round(distance_totale * 1000, 6),
        "vitesseMoyKmh": round(vitesse_moyenne, 6),
        "vitesseMaxKmh": float(vitesses.max()),
        "variationVitesse": variation
    }
