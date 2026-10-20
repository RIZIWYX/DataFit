
import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

st.set_page_config(
    page_title="DataFit - Analyse de séance",
    page_icon="🏃",
    layout="wide"
)

st.title("🏃 DataFit")
st.subheader("Analyse d'une séance sportive")

fichier = st.file_uploader(
    "Choisissez le fichier CSV de votre séance",
    type=["csv"]
)

if fichier is not None:

    df = pd.read_csv(fichier)

    colonnes = [
        "timestamp", "duree_s", "heart_rate",
        "speed_kmh", "distance_km"
    ]

    if not all(col in df.columns for col in colonnes):
        st.error("Le fichier CSV ne contient pas les colonnes nécessaires.")
        st.stop()

    if df.empty:
        st.error("Le fichier est vide.")
        st.stop()

    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    if df["duree_s"].isna().any() or (df["duree_s"] <= 0).any():
        st.error("Les durées des mesures doivent être positives.")
        st.stop()

    df["temps_min"] = df["duree_s"].cumsum() / 60

    # Statistiques générales

    duree_secondes = df["duree_s"].sum()
    distance_totale = df["distance_km"].iloc[-1]

    fc_moyenne = (
        (df["heart_rate"] * df["duree_s"]).sum()
        / duree_secondes
    )

    fc_min = df["heart_rate"].min()
    fc_max = df["heart_rate"].max()

    vitesse_moyenne = distance_totale / (duree_secondes / 3600)
    vitesse_min = df["speed_kmh"].min()
    vitesse_max = df["speed_kmh"].max()

    vitesse_ecart_type = df["speed_kmh"].std()

    regularite = (
        vitesse_ecart_type / vitesse_moyenne * 100
        if vitesse_moyenne > 0 else np.nan
    )

    correlation = df["heart_rate"].corr(df["speed_kmh"])

    allure = (
        duree_secondes / distance_totale
        if distance_totale > 0 else np.nan
    )

    # Tableau de bord

    st.divider()
    st.header("Bilan de la séance")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Distance totale", f"{distance_totale:.2f} km")
    col2.metric("Durée", f"{int(duree_secondes // 60)} min {int(duree_secondes % 60)} s")
    col3.metric("Vitesse moyenne", f"{vitesse_moyenne:.2f} km/h")
    col4.metric("FC moyenne", f"{fc_moyenne:.1f} bpm")

    col5, col6, col7, col8 = st.columns(4)

    col5.metric("Vitesse maximale", f"{vitesse_max:.2f} km/h")
    col6.metric("FC maximale", f"{fc_max:.0f} bpm")
    col7.metric(
        "Allure moyenne",
        f"{int(allure // 60)}:{int(allure % 60):02d} min/km"
        if np.isfinite(allure) else "N/A"
    )
    col8.metric(
        "Régularité (CV)",
        f"{regularite:.2f} %"
        if pd.notna(regularite) else "N/A"
    )

    st.divider()
    st.header("Graphiques de la séance")

    fig, axes = plt.subplots(3, 2, figsize=(14, 14))

    # 1. Fréquence cardiaque
    axes[0, 0].plot(
        df["temps_min"], df["heart_rate"],
        marker="o", label="FC"
    )
    axes[0, 0].axhline(
        fc_moyenne, linestyle="--",
        label="FC moyenne"
    )
    axes[0, 0].set_title("Évolution de la FC")
    axes[0, 0].set_ylabel("bpm")
    axes[0, 0].legend()

    # 2. Vitesse
    axes[0, 1].plot(
        df["temps_min"], df["speed_kmh"],
        marker="o", label="Vitesse"
    )
    axes[0, 1].axhline(
        vitesse_moyenne, linestyle="--",
        label="Vitesse moyenne"
    )
    axes[0, 1].set_title("Évolution de la vitesse")
    axes[0, 1].set_ylabel("km/h")
    axes[0, 1].legend()

    # 3. Distance cumulée
    axes[1, 0].plot(
        df["temps_min"], df["distance_km"]
    )
    axes[1, 0].set_title("Distance cumulée")
    axes[1, 0].set_ylabel("km")

    # 4. Corrélation FC / vitesse
    axes[1, 1].scatter(
        df["speed_kmh"], df["heart_rate"]
    )
    axes[1, 1].set_title("Relation FC / vitesse")
    axes[1, 1].set_xlabel("Vitesse (km/h)")
    axes[1, 1].set_ylabel("FC (bpm)")

    # 5. Distribution de la vitesse
    axes[2, 0].hist(
        df["speed_kmh"], bins=10
    )
    axes[2, 0].set_title("Distribution de la vitesse")
    axes[2, 0].set_xlabel("km/h")

    # 6. Distribution de la FC
    axes[2, 1].hist(
        df["heart_rate"], bins=10
    )
    axes[2, 1].set_title("Distribution de la FC")
    axes[2, 1].set_xlabel("bpm")

    for ax in axes.flat:
        ax.grid(alpha=0.3)

    plt.tight_layout()
    st.pyplot(fig)
    plt.close(fig)

    st.divider()
    st.header("Analyse statistique")

    st.write(f"**Fréquence cardiaque minimale :** {fc_min:.0f} bpm")
    st.write(f"**Vitesse minimale :** {vitesse_min:.2f} km/h")

    if pd.notna(correlation):
        st.write(f"**Corrélation FC / vitesse :** {correlation:.3f}")
    else:
        st.write("**Corrélation FC / vitesse :** non calculable")

    st.divider()
    st.header("Mesures de la séance")

    st.dataframe(df, use_container_width=True)

else:
    st.info("Importez un fichier CSV pour afficher votre analyse.")
