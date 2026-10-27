from datetime import datetime

import numpy as np
import pandas as pd


def analyser_natation(donnees):
    if not isinstance(donnees, dict) or donnees.get("sport") != "natation":
        raise ValueError("Une séance de natation est attendue.")

    def lire_table(nom, colonnes, numeriques, vide=False):
        lignes = donnees.get(nom)

        if not isinstance(lignes, list):
            raise ValueError(f"{nom} doit être une liste.")

        if not lignes:
            if vide:
                return pd.DataFrame(columns=colonnes)
            raise ValueError(f"{nom} ne doit pas être vide.")

        if any(not isinstance(ligne, dict) for ligne in lignes):
            raise ValueError(
                f"Chaque élément de {nom} doit être un dictionnaire."
            )

        table = pd.DataFrame(lignes)

        if not all(c in table.columns for c in colonnes):
            raise ValueError(
                f"Des colonnes nécessaires sont absentes dans {nom}."
            )

        for c in numeriques:
            if any(
                isinstance(v, bool) or not isinstance(v, (int, float))
                for v in table[c].tolist()
            ):
                raise ValueError(
                    f"{nom}.{c} doit contenir des nombres."
                )

            table[c] = table[c].astype(float)

            if not np.isfinite(table[c]).all() or (table[c] < 0).any():
                raise ValueError(
                    f"Valeur invalide dans {nom}.{c}."
                )

        if (table["duree_s"] <= 0).any():
            raise ValueError(
                f"Les durées de {nom} doivent être positives."
            )

        return table

    df = lire_table(
        "mesures",
        [
            "timestamp",
            "duree_s",
            "heart_rate",
            "heart_rate_mean",
            "phase",
            "distance_m"
        ],
        [
            "duree_s",
            "heart_rate",
            "heart_rate_mean",
            "distance_m"
        ]
    )

    longueurs = lire_table(
        "longueurs",
        [
            "length_id",
            "duree_s",
            "distance_m",
            "stroke_count"
        ],
        [
            "length_id",
            "duree_s",
            "distance_m",
            "stroke_count"
        ]
    )

    pauses = lire_table(
        "pauses",
        ["duree_s"],
        ["duree_s"],
        vide=True
    )

    if (df[["heart_rate", "heart_rate_mean"]] <= 0).any().any():
        raise ValueError(
            "Les fréquences cardiaques doivent être positives."
        )

    if not df["phase"].isin(["nage", "repos"]).all():
        raise ValueError(
            "Les phases doivent être nage ou repos."
        )

    if (longueurs["distance_m"] <= 0).any():
        raise ValueError(
            "Les distances des longueurs doivent être positives."
        )

    if (
        longueurs[["length_id", "stroke_count"]] % 1 != 0
    ).any().any():
        raise ValueError(
            "Les identifiants et nombres de cycles doivent être entiers."
        )

    if longueurs["length_id"].duplicated().any():
        raise ValueError(
            "Les identifiants des longueurs doivent être distincts."
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
            "Les dates et les durées des mesures sont incohérentes."
        )

    if (df["distance_m"].diff().dropna() < 0).any():
        raise ValueError(
            "La distance cumulée ne doit pas diminuer."
        )

    longueurs = longueurs.sort_values(
        "length_id"
    ).reset_index(drop=True)

    durees = df["duree_s"].to_numpy()
    fc = df["heart_rate"].to_numpy()

    duree_totale = float(durees.sum())

    temps_nage = float(
        df.loc[df["phase"] == "nage", "duree_s"].sum()
    )

    temps_pause = float(
        df.loc[df["phase"] == "repos", "duree_s"].sum()
    )

    distance_totale = float(df["distance_m"].iloc[-1])

    if distance_totale <= 0 or temps_nage <= 0:
        raise ValueError(
            "La distance totale et le temps de nage doivent être positifs."
        )

    controles = [
        (
            float(longueurs["duree_s"].sum()),
            temps_nage
        ),
        (
            float(pauses["duree_s"].sum()),
            temps_pause
        ),
        (
            float(longueurs["distance_m"].sum()),
            distance_totale
        )
    ]

    for calcule, attendu in controles:
        if not np.isclose(
            calcule,
            attendu,
            atol=0.001,
            rtol=1e-7
        ):
            raise ValueError(
                "Les longueurs ou les pauses sont incohérentes "
                "avec les mesures."
            )

    fc_moyenne = float(
        np.average(
            df["heart_rate_mean"],
            weights=durees
        )
    )

    durees_longueurs = longueurs["duree_s"].to_numpy()

    moyenne_longueur = float(
        durees_longueurs.mean()
    )

    variation = float(
        100
        * durees_longueurs.std(ddof=0)
        / moyenne_longueur
    )

    temps_nage_s = int(round(temps_nage))
    duree_s = int(round(duree_totale))
    temps_pause_s = duree_s - temps_nage_s

    return {
        "fcMin": int(round(float(fc.min()))),
        "fcMoy": int(round(fc_moyenne)),
        "fcMax": int(round(float(fc.max()))),
        "dureeS": duree_s,
        "distanceM": round(distance_totale, 6),
        "tempsMoy100mS": round(
            temps_nage * 100 / distance_totale,
            6
        ),
        "dureeLongueurRapideS": float(
            durees_longueurs.min()
        ),
        "dureeMoyLongueurS": round(
            moyenne_longueur,
            6
        ),
        "variationDureeLongueurs": round(
            variation,
            6
        ),
        "totalCyclesBras": int(
            longueurs["stroke_count"].sum()
        ),
        "tempsNageS": temps_nage_s,
        "tempsPauseS": temps_pause_s
    }
