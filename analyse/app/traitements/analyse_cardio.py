from datetime import datetime

import numpy as np
import pandas as pd


def analyser_cardio(donnees):
    if not isinstance(donnees, dict) or donnees.get("sport") != "cardio":
        raise ValueError(
            "Les données doivent correspondre à une séance cardio."
        )

    mesures = donnees.get("mesures")

    if not isinstance(mesures, list) or not mesures:
        raise ValueError("La séance ne contient aucune mesure.")

    if any(not isinstance(m, dict) for m in mesures):
        raise ValueError(
            "Chaque mesure doit être un dictionnaire."
        )

    df = pd.DataFrame(mesures)

    colonnes = [
        "timestamp",
        "duree_s",
        "heart_rate",
        "speed_kmh",
        "distance_km"
    ]

    if not all(colonne in df.columns for colonne in colonnes):
        raise ValueError(
            "Des colonnes nécessaires à l'analyse sont absentes."
        )

    for colonne in colonnes[1:]:
        valeurs = df[colonne].tolist()

        if any(
            isinstance(v, bool) or not isinstance(v, (int, float))
            for v in valeurs
        ):
            raise ValueError(
                f"La colonne {colonne} doit contenir des nombres."
            )

        df[colonne] = df[colonne].astype(float)

        if not np.isfinite(df[colonne]).all():
            raise ValueError(
                f"La colonne {colonne} contient une valeur invalide."
            )

    if (df["duree_s"] <= 0).any() or (df["heart_rate"] <= 0).any():
        raise ValueError(
            "Les durées et les fréquences cardiaques doivent être positives."
        )

    if (df[["speed_kmh", "distance_km"]] < 0).any().any():
        raise ValueError(
            "Les vitesses et les distances doivent être positives ou nulles."
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
    vitesses = df["speed_kmh"].to_numpy()

    duree_totale = float(durees.sum())
    distance_totale = float(df["distance_km"].iloc[-1])

    if distance_totale <= 0:
        raise ValueError(
            "La distance totale doit être supérieure à zéro."
        )

    fc_moyenne = float(
        np.average(fc, weights=durees)
    )

    vitesse_moyenne = distance_totale * 3600 / duree_totale

    centre_vitesse = float(
        np.average(vitesses, weights=durees)
    )

    ecarts_vitesse = vitesses - centre_vitesse
    ecarts_fc = fc - fc_moyenne

    variance_vitesse = float(
        np.average(ecarts_vitesse ** 2, weights=durees)
    )

    variance_fc = float(
        np.average(ecarts_fc ** 2, weights=durees)
    )

    variation_vitesse = (
        100 * np.sqrt(variance_vitesse) / centre_vitesse
        if centre_vitesse > 0
        else None
    )

    correlation = None

    if (
        len(df) >= 2
        and variance_vitesse > 1e-12
        and variance_fc > 1e-12
    ):
        covariance = float(
            np.average(
                ecarts_vitesse * ecarts_fc,
                weights=durees
            )
        )

        correlation = covariance / np.sqrt(
            variance_vitesse * variance_fc
        )

        correlation = round(
            float(np.clip(correlation, -1, 1)),
            6
        )

    if correlation is None:
        raise ValueError(
            "La corrélation vitesse-FC est impossible à calculer : "
            "il faut au moins deux mesures avec une vitesse "
            "et une FC variables."
        )

    return {
        "fcMoy": int(round(fc_moyenne)),
        "fcMin": int(round(float(fc.min()))),
        "fcMax": int(round(float(fc.max()))),
        "correlationVitesseFc": correlation,
        "dureeS": int(round(duree_totale)),
        "distanceM": round(distance_totale * 1000, 6),
        "vitesseMoyKmh": round(vitesse_moyenne, 6),
        "vitesseMaxKmh": float(vitesses.max()),
        "tempsMoy1kmS": round(
            duree_totale / distance_totale,
            6
        ),
        "variationVitesse": (
            round(float(variation_vitesse), 6)
            if variation_vitesse is not None
            else None
        )
    }
