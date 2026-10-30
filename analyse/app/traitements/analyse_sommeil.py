import numpy as np
import pandas as pd

# Seuils repris de analyse_nuit.py (version notebook de l'équipe données).
# Classification indicative, non médicale.
SEUIL_EVEIL = 0.45
SEUIL_MOUVEMENT_PROFOND = 0.12
SEUIL_MOUVEMENT_PARADOXAL = 0.22
ECART_FC_PROFOND = 4
ECART_FC_PARADOXAL = 2
FENETRE_LISSAGE = 5  # mesures (5 minutes à une mesure par minute)


def analyser_sommeil(donnees):
    """Résume une nuit simulée : les 16 valeurs de la table `sommeil`.

    Entrée : le JSON renvoyé par le simulateur (champ "sport" = "sommeil",
    liste "mesures" avec date_heure, fc_bpm, mouvement).
    Sortie : un dictionnaire en snake_case, comme les colonnes de la table
    et le record Java ResultatSommeil.
    """
    if not isinstance(donnees, dict) or donnees.get("sport") != "sommeil":
        raise ValueError("Une nuit de sommeil est attendue.")

    mesures = donnees.get("mesures")
    if not isinstance(mesures, list) or not mesures:
        raise ValueError("mesures doit être une liste non vide.")
    if any(not isinstance(m, dict) for m in mesures):
        raise ValueError("Chaque mesure doit être un dictionnaire.")

    pas_s = donnees.get("frequence_mesure_s", 60)
    if isinstance(pas_s, bool) or not isinstance(pas_s, (int, float)) or pas_s <= 0:
        raise ValueError("frequence_mesure_s doit être un nombre positif.")

    nuit = pd.DataFrame(mesures)
    colonnes = ["date_heure", "fc_bpm", "mouvement"]
    if not all(c in nuit.columns for c in colonnes):
        raise ValueError(f"Colonnes nécessaires dans mesures : {colonnes}.")

    for c in ("fc_bpm", "mouvement"):
        valeurs = nuit[c].tolist()
        if any(isinstance(v, bool) or not isinstance(v, (int, float)) for v in valeurs):
            raise ValueError(f"mesures.{c} doit contenir des nombres.")
        nuit[c] = nuit[c].astype(float)
        if not np.isfinite(nuit[c]).all():
            raise ValueError(f"Valeur invalide dans mesures.{c}.")

    if (nuit["fc_bpm"] <= 0).any():
        raise ValueError("La fréquence cardiaque doit être positive.")
    if ((nuit["mouvement"] < 0) | (nuit["mouvement"] > 1)).any():
        raise ValueError("Le mouvement doit être compris entre 0 et 1.")

    try:
        nuit["date_heure"] = pd.to_datetime(nuit["date_heure"])
    except (ValueError, TypeError) as erreur:
        raise ValueError("date_heure doit être une date valide.") from erreur

    nuit = nuit.sort_values("date_heure").reset_index(drop=True)

    # 1. lissage sur 5 minutes pour réduire le bruit
    fc_lissee = nuit["fc_bpm"].rolling(FENETRE_LISSAGE, center=True, min_periods=1).mean()
    mouvement_lisse = nuit["mouvement"].rolling(FENETRE_LISSAGE, center=True, min_periods=1).mean()
    fc_reference = fc_lissee.median()

    # 2. phase estimée de chaque mesure (même règles que analyse_nuit.py)
    phase = np.select(
        [
            mouvement_lisse.to_numpy() >= SEUIL_EVEIL,
            (mouvement_lisse.to_numpy() < SEUIL_MOUVEMENT_PROFOND)
            & (fc_lissee.to_numpy() <= fc_reference - ECART_FC_PROFOND),
            (mouvement_lisse.to_numpy() < SEUIL_MOUVEMENT_PARADOXAL)
            & (fc_lissee.to_numpy() >= fc_reference + ECART_FC_PARADOXAL),
        ],
        ["eveil", "profond", "paradoxal"],
        default="leger",
    )

    # 3. comptages, en nombre de mesures
    nb = len(nuit)
    eveil = phase == "eveil"
    nb_eveil = int(eveil.sum())
    nb_sommeil = nb - nb_eveil
    # latence : mesures avant le premier moment qui n'est pas de l'éveil
    latence = int(np.argmax(~eveil)) if nb_sommeil > 0 else nb
    # un réveil = passage du sommeil à l'éveil
    reveils = int((eveil[1:] & ~eveil[:-1]).sum())

    def secondes(nombre):
        return int(round(nombre * pas_s))

    return {
        "heure_coucher": nuit["date_heure"].iloc[0].isoformat(),
        "heure_reveil": (nuit["date_heure"].iloc[-1] + pd.Timedelta(seconds=pas_s)).isoformat(),
        "temps_au_lit_s": secondes(nb),
        "duree_sommeil_s": secondes(nb_sommeil),
        "latence_endormissement_s": secondes(latence),
        "duree_eveil_totale_s": secondes(nb_eveil),
        "eveil_nocturne_s": secondes(nb_eveil - latence),
        "reveils_nb": reveils,
        "efficacite_sommeil_pct": round(100 * nb_sommeil / nb, 2),
        "fc_moyenne": round(float(nuit["fc_bpm"].mean()), 1),
        "fc_min": float(nuit["fc_bpm"].min()),
        "fc_max": float(nuit["fc_bpm"].max()),
        "duree_eveil_s": secondes(nb_eveil),
        "duree_leger_s": secondes(int((phase == "leger").sum())),
        "duree_profond_s": secondes(int((phase == "profond").sum())),
        "duree_paradoxal_s": secondes(int((phase == "paradoxal").sum())),
    }