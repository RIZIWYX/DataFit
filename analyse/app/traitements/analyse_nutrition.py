
from datetime import date

import numpy as np
import pandas as pd


MOMENTS_AUTORISES = {
    "petit-dejeuner",
    "dejeuner",
    "diner",
    "collation",
}

COLONNES_NUMERIQUES = [
    "calories",
    "proteines",
    "glucides",
    "lipides",
]


def analyser_nutrition(donnees):
    if not isinstance(donnees, dict):
        raise ValueError(
            "Les données nutritionnelles doivent être un dictionnaire."
        )

    date_analyse = donnees.get("date")
    repas = donnees.get("repas")

    if not isinstance(date_analyse, str):
        raise ValueError(
            "La date doit être une chaîne au format YYYY-MM-DD."
        )

    try:
        date_valide = date.fromisoformat(date_analyse)
    except (ValueError, TypeError, OverflowError) as erreur:
        raise ValueError(
            "La date de l'analyse est invalide."
        ) from erreur

    if date_valide.isoformat() != date_analyse:
        raise ValueError(
            "La date doit respecter le format YYYY-MM-DD."
        )

    if not isinstance(repas, list) or not repas:
        raise ValueError(
            "La journée ne contient aucun repas."
        )

    if any(not isinstance(r, dict) for r in repas):
        raise ValueError(
            "Chaque repas doit être un dictionnaire."
        )

    colonnes_requises = [
        "moment",
        "nom",
        "objectif",
        "calories",
        "proteines",
        "glucides",
        "lipides",
    ]

    for index, r in enumerate(repas):
        if not all(c in r for c in colonnes_requises):
            raise ValueError(
                f"Le repas {index} contient des champs manquants."
            )

        if (
            not isinstance(r["moment"], str)
            or r["moment"] not in MOMENTS_AUTORISES
        ):
            raise ValueError(
                f"Le moment du repas {index} est invalide."
            )

        for champ in ("nom", "objectif"):
            if (
                not isinstance(r[champ], str)
                or not r[champ].strip()
            ):
                raise ValueError(
                    f"Le champ {champ} du repas {index} est invalide."
                )

        for colonne in COLONNES_NUMERIQUES:
            valeur = r[colonne]

            if (
                isinstance(valeur, (bool, np.bool_))
                or not isinstance(valeur, (int, float, np.number))
            ):
                raise ValueError(
                    f"{colonne} doit être numérique pour le repas {index}."
                )

            if not np.isfinite(valeur):
                raise ValueError(
                    f"{colonne} contient une valeur non finie."
                )

            if valeur < 0:
                raise ValueError(
                    f"{colonne} doit être positive ou nulle."
                )

    df = pd.DataFrame(repas)

    for colonne in COLONNES_NUMERIQUES:
        df[colonne] = df[colonne].astype(float)

    # Statistiques descriptives sur les repas
    statistiques = {}

    for colonne in COLONNES_NUMERIQUES:
        valeurs = df[colonne].to_numpy(dtype=float)

        statistiques[colonne] = {
            "total": float(np.sum(valeurs)),
            "moyenne": float(np.mean(valeurs)),
            "mediane": float(np.median(valeurs)),
            "minimum": float(np.min(valeurs)),
            "maximum": float(np.max(valeurs)),
            "ecart_type": float(np.std(valeurs, ddof=0)),
        }

    calories = df["calories"].to_numpy(dtype=float)
    proteines = df["proteines"].to_numpy(dtype=float)
    glucides = df["glucides"].to_numpy(dtype=float)
    lipides = df["lipides"].to_numpy(dtype=float)

    moyenne_calories = float(np.mean(calories))
    ecart_type_calories = float(np.std(calories, ddof=0))

    variation_calories = (
        100 * ecart_type_calories / moyenne_calories
        if moyenne_calories > 0
        else None
    )

    # Estimation énergétique selon les facteurs usuels :
    # protéines = 4 kcal/g, glucides = 4 kcal/g,
    # lipides = 9 kcal/g.
    energie_proteines = 4 * float(np.sum(proteines))
    energie_glucides = 4 * float(np.sum(glucides))
    energie_lipides = 9 * float(np.sum(lipides))

    energie_macros = (
        energie_proteines
        + energie_glucides
        + energie_lipides
    )

    repartition_macros = None

    if energie_macros > 0:
        repartition_macros = {
            "proteines_pct": round(
                100 * energie_proteines / energie_macros, 6
            ),
            "glucides_pct": round(
                100 * energie_glucides / energie_macros, 6
            ),
            "lipides_pct": round(
                100 * energie_lipides / energie_macros, 6
            ),
        }

    calories_totales = float(np.sum(calories))

    ecart_calories_macros = (
        calories_totales - energie_macros
    )

    ecart_calories_macros_pct = (
        100 * ecart_calories_macros / calories_totales
        if calories_totales > 0
        else None
    )

    # Corrélation de Pearson entre les calories et chaque macronutriment.
    # Une corrélation est indéfinie si une variable est constante.
    correlations = {}

    for colonne in COLONNES_NUMERIQUES[1:]:
        valeurs = df[colonne].to_numpy(dtype=float)

        if (
            len(df) >= 2
            and np.std(calories) > 0
            and np.std(valeurs) > 0
        ):
            correlations[colonne] = round(
                float(np.corrcoef(calories, valeurs)[0, 1]),
                6,
            )
        else:
            correlations[colonne] = None

    # Comparaison par type de repas.
    repartition_repas = {}

    for moment, groupe in df.groupby("moment", sort=False):
        repartition_repas[moment] = {
            "nombre": int(len(groupe)),
            "calories_totales": float(groupe["calories"].sum()),
            "calories_moyennes": float(groupe["calories"].mean()),
            "proteines_moyennes": float(groupe["proteines"].mean()),
            "glucides_moyens": float(groupe["glucides"].mean()),
            "lipides_moyens": float(groupe["lipides"].mean()),
        }

    repas_plus_calorique = str(
        df.loc[df["calories"].idxmax(), "moment"]
    )

    repas_plus_proteine = str(
        df.loc[df["proteines"].idxmax(), "moment"]
    )

    return {
        "date": date_analyse,
        "nombre_repas": int(len(df)),
        "statistiques": statistiques,
        "variation_calories": (
            round(float(variation_calories), 6)
            if variation_calories is not None
            else None
        ),
        "repartition_macros": repartition_macros,
        "energie_macros_kcal": round(energie_macros, 6),
        "ecart_calories_macros": round(
            ecart_calories_macros, 6
        ),
        "ecart_calories_macros_pct": (
            round(float(ecart_calories_macros_pct), 6)
            if ecart_calories_macros_pct is not None
            else None
        ),
        "correlations_calories": correlations,
        "repartition_repas": repartition_repas,
        "repas_plus_calorique": repas_plus_calorique,
        "repas_plus_proteine": repas_plus_proteine,
    }
