from datetime import datetime

import numpy as np
import pandas as pd


def analyser_muscu(donnees):
    if not isinstance(donnees, dict) or donnees.get("sport") != "muscu":
        raise ValueError("Une séance de musculation est attendue.")

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
            "set_id",
            "repetitions_total"
        ],
        [
            "duree_s",
            "heart_rate",
            "heart_rate_mean",
            "set_id",
            "repetitions_total"
        ]
    )

    series = lire_table(
        "series",
        ["set_id", "duree_s", "repetitions"],
        ["set_id", "duree_s", "repetitions"]
    )

    pauses = lire_table(
        "pauses",
        [
            "after_set_id",
            "duree_s",
            "fc_debut_bpm",
            "fc_apres_60s_bpm",
            "fc_fin_bpm"
        ],
        [
            "after_set_id",
            "duree_s",
            "fc_debut_bpm",
            "fc_fin_bpm"
        ],
        vide=True
    )

    if (df[["heart_rate", "heart_rate_mean"]] <= 0).any().any():
        raise ValueError(
            "Les fréquences cardiaques doivent être positives."
        )

    if not df["phase"].isin(["effort", "repos"]).all():
        raise ValueError(
            "Les phases doivent être effort ou repos."
        )

    for table, colonnes in [
        (df, ["set_id", "repetitions_total"]),
        (series, ["set_id", "repetitions"]),
        (pauses, ["after_set_id"])
    ]:
        if (
            not table.empty
            and (table[colonnes] % 1 != 0).any().any()
        ):
            raise ValueError(
                "Les identifiants et répétitions doivent être entiers."
            )

    if (
        series["set_id"].duplicated().any()
        or pauses["after_set_id"].duplicated().any()
    ):
        raise ValueError(
            "Les séries et leurs pauses doivent avoir "
            "des identifiants distincts."
        )

    if (
        not df["set_id"].isin(series["set_id"]).all()
        or not pauses["after_set_id"].isin(series["set_id"]).all()
    ):
        raise ValueError(
            "Une mesure ou une pause fait référence "
            "à une série inconnue."
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

    if (df["repetitions_total"].diff().dropna() < 0).any():
        raise ValueError(
            "Le nombre cumulé de répétitions ne doit pas diminuer."
        )

    series = series.sort_values(
        "set_id"
    ).reset_index(drop=True)

    pauses = pauses.sort_values(
        "after_set_id"
    ).reset_index(drop=True)

    effort = df.loc[df["phase"] == "effort"]
    repos = df.loc[df["phase"] == "repos"]

    if effort.empty or repos.empty or pauses.empty:
        raise ValueError(
            "La séance doit contenir des efforts et des pauses."
        )

    temps_effort = float(effort["duree_s"].sum())
    temps_repos = float(repos["duree_s"].sum())

    controles = [
        (
            float(series["duree_s"].sum()),
            temps_effort
        ),
        (
            float(pauses["duree_s"].sum()),
            temps_repos
        ),
        (
            float(series["repetitions"].sum()),
            float(df["repetitions_total"].iloc[-1])
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
                "Les séries ou les pauses sont incohérentes "
                "avec les mesures."
            )

    for serie in series.to_dict("records"):
        mesures_serie = effort.loc[
            effort["set_id"] == serie["set_id"]
        ]

        repos_serie = repos.loc[
            repos["set_id"] == serie["set_id"]
        ]

        pause_serie = pauses.loc[
            pauses["after_set_id"] == serie["set_id"]
        ]

        if not np.isclose(
            mesures_serie["duree_s"].sum(),
            serie["duree_s"],
            atol=0.001,
            rtol=1e-7
        ):
            raise ValueError(
                "La durée d'une série est incohérente."
            )

        if not np.isclose(
            repos_serie["duree_s"].sum(),
            pause_serie["duree_s"].sum(),
            atol=0.001,
            rtol=1e-7
        ):
            raise ValueError(
                "La durée de repos d'une série est incohérente."
            )

    baisses = []

    for pause in pauses.to_dict("records"):
        if (
            pause["fc_debut_bpm"] <= 0
            or pause["fc_fin_bpm"] <= 0
        ):
            raise ValueError(
                "Les fréquences cardiaques des pauses "
                "doivent être positives."
            )

        if pause["duree_s"] < 60:
            continue

        valeur = pause["fc_apres_60s_bpm"]

        if (
            isinstance(valeur, bool)
            or not isinstance(valeur, (int, float))
            or not np.isfinite(valeur)
            or valeur <= 0
        ):
            raise ValueError(
                "La FC à 60 secondes est absente ou invalide "
                "pour une pause d'au moins 60 secondes."
            )

        baisses.append(
            float(pause["fc_debut_bpm"] - valeur)
        )

    if not baisses:
        raise ValueError(
            "La récupération à 60 secondes nécessite au moins "
            "une pause d'au moins 60 secondes avec une FC à cet instant."
        )

    def moyenne_fc(table):
        return float(
            np.average(
                table["heart_rate_mean"],
                weights=table["duree_s"]
            )
        )

    fc_moyenne = moyenne_fc(df)
    fc_effort = moyenne_fc(effort)
    fc_repos = moyenne_fc(repos)

    duree_totale = temps_effort + temps_repos
    duree_s = int(round(duree_totale))
    effort_s = int(round(temps_effort))

    return {
        "fcMin": int(round(float(df["heart_rate"].min()))),
        "fcMoy": int(round(fc_moyenne)),
        "fcMax": int(round(float(df["heart_rate"].max()))),
        "fcMoyEffort": int(round(fc_effort)),
        "fcMoyPause": int(round(fc_repos)),
        "dureeS": duree_s,
        "dureeEffortS": effort_s,
        "dureePauseS": duree_s - effort_s,
        "nbSeries": int(len(series)),
        "dureeMoyPauseS": round(
            float(pauses["duree_s"].mean()),
            6
        ),
        "baisseFcApres60s": round(
            float(np.mean(baisses)),
            6
        )
    }
