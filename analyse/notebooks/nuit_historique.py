import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def analyser_nuit(fichier="sommeil_mesures.csv", id_nuit=1):
    """Analyse descriptive et classification indicative d'une seule nuit."""
    df = pd.read_csv(fichier, parse_dates=["date_heure"])
    colonnes = {"id_nuit", "date_heure", "fc_bpm", "mouvement"}
    if not colonnes.issubset(df.columns):
        raise ValueError(f"Colonnes nécessaires : {sorted(colonnes)}")

    nuit = (df.loc[df["id_nuit"] == id_nuit]
              .sort_values("date_heure").copy().reset_index(drop=True))
    if nuit.empty:
        raise ValueError(f"Nuit {id_nuit} absente du fichier")

    # Moyennes glissantes sur 5 minutes : réduction du bruit.
    nuit["fc_lissee"] = nuit["fc_bpm"].rolling(5, center=True, min_periods=1).mean()
    nuit["mouvement_lisse"] = nuit["mouvement"].rolling(5, center=True, min_periods=1).mean()
    fc_mediane = nuit["fc_lissee"].median()

    # Classification expérimentale, non médicale.
    conditions = [
        nuit["mouvement_lisse"] >= 0.45,
        (nuit["mouvement_lisse"] < 0.12) & (nuit["fc_lissee"] <= fc_mediane - 4),
        (nuit["mouvement_lisse"] < 0.22) & (nuit["fc_lissee"] >= fc_mediane + 2),
    ]
    nuit["phase_estimee"] = np.select(
        conditions, ["Éveillé", "Profond (estimé)", "REM (hypothèse)"],
        default="Léger (estimé)"
    )

    # Regrouper les minutes consécutives de même classe.
    groupe = (nuit["phase_estimee"] != nuit["phase_estimee"].shift()).cumsum()
    periodes = (nuit.groupby(groupe)
                .agg(debut=("date_heure", "first"),
                     derniere_mesure=("date_heure", "last"),
                     phase=("phase_estimee", "first"),
                     nb_mesures=("date_heure", "size"))
                .reset_index(drop=True))
    periodes["fin"] = periodes["derniere_mesure"] + pd.Timedelta(minutes=1)
    periodes = periodes[["debut", "fin", "phase", "nb_mesures"]]
    periodes = periodes.rename(columns={"nb_mesures": "minutes"})

    print(f"\n=== Analyse de la nuit {id_nuit} ===")
    print("Début des mesures :", nuit["date_heure"].iloc[0])
    print("Fin estimée de l'enregistrement :", nuit["date_heure"].iloc[-1] + pd.Timedelta(minutes=1))
    print("Durée enregistrée :", len(nuit), "minutes (si une mesure par minute)")
    print(f"FC moyenne : {nuit['fc_bpm'].mean():.1f} BPM")
    print(f"FC min/max : {nuit['fc_bpm'].min():.1f} / {nuit['fc_bpm'].max():.1f} BPM")
    print(f"Mouvement moyen : {nuit['mouvement'].mean():.3f}")
    print("\nDurées par phase estimée (minutes) :")
    print(nuit["phase_estimee"].value_counts().to_string())
    print("\nHoraires des périodes estimées :")
    print(periodes.to_string(index=False))

    codes = {"Éveillé": 3, "REM (hypothèse)": 2,
             "Léger (estimé)": 1, "Profond (estimé)": 0}
    fig, axes = plt.subplots(3, 1, figsize=(12, 9), sharex=True)
    axes[0].plot(nuit["date_heure"], nuit["fc_bpm"], label="FC mesurée")
    axes[0].plot(nuit["date_heure"], nuit["fc_lissee"], label="FC lissée")
    axes[0].set_ylabel("FC (BPM)")
    axes[0].legend()
    axes[0].grid(alpha=0.25)

    axes[1].plot(nuit["date_heure"], nuit["mouvement"], label="Mouvement")
    axes[1].plot(nuit["date_heure"], nuit["mouvement_lisse"], label="Mouvement lissé")
    axes[1].axhline(0.45, linestyle="--", label="Seuil indicatif éveil")
    axes[1].set_ylabel("Intensité (0 à 1)")
    axes[1].legend()
    axes[1].grid(alpha=0.25)

    axes[2].step(nuit["date_heure"], nuit["phase_estimee"].map(codes), where="post")
    axes[2].set_yticks([0, 1, 2, 3], ["Profond", "Léger", "REM ?", "Éveillé"])
    axes[2].set_ylabel("Phase estimée")
    axes[2].set_xlabel("Heure")
    axes[2].grid(alpha=0.25)
    fig.suptitle(f"DataFit — Nuit {id_nuit} (phases indicatives)")
    fig.autofmt_xdate()
    plt.tight_layout()
    plt.show()
    return nuit, periodes


# Dans Jupyter Notebook :
# nuit, periodes = analyser_nuit("sommeil_mesures.csv", id_nuit=1)
