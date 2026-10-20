import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.set_page_config(
    page_title="DataFit",
    page_icon="🏃",
    layout="wide"
)

st.title("🏃 DataFit")
st.subheader("Analyse historique des performances")

historique = pd.read_csv("historique_datafit_exemple.csv")
historique["date"] = pd.to_datetime(historique["date"])

sportifs = sorted(historique["id_sportif"].unique())

id_sportif = st.selectbox(
    "Choisir un sportif",
    sportifs
)

df = historique[
    historique["id_sportif"] == id_sportif
].copy()

df = df.sort_values("date")

nb_seances = len(df)
distance_totale = df["distance_km"].sum()
vitesse_moyenne = df["vitesse_moyenne"].mean()
fc_moyenne = df["fc_moyenne"].mean()

col1, col2, col3, col4 = st.columns(4)

col1.metric("Nombre de séances", nb_seances)
col2.metric("Distance totale", f"{distance_totale:.2f} km")
col3.metric("Vitesse moyenne", f"{vitesse_moyenne:.2f} km/h")
col4.metric("FC moyenne", f"{fc_moyenne:.1f} bpm")

st.divider()

st.subheader("Évolution de la vitesse moyenne")

fig1, ax1 = plt.subplots(figsize=(10, 4))

ax1.plot(
    df["date"],
    df["vitesse_moyenne"],
    marker="o",
    label="Vitesse moyenne"
)

ax1.set_xlabel("Date")
ax1.set_ylabel("Vitesse (km/h)")
ax1.grid(True)
ax1.legend()

st.pyplot(fig1)
plt.close(fig1)

st.subheader("Évolution de la fréquence cardiaque")

fig2, ax2 = plt.subplots(figsize=(10, 4))

ax2.plot(
    df["date"],
    df["fc_moyenne"],
    marker="o",
    label="FC moyenne"
)

ax2.set_xlabel("Date")
ax2.set_ylabel("FC (bpm)")
ax2.grid(True)
ax2.legend()

st.pyplot(fig2)
plt.close(fig2)

st.subheader("Historique des séances")

st.dataframe(df, use_container_width=True)
