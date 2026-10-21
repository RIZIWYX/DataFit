import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def simuler_sommeil(
    type_sommeil,
    regularite,
    activite_avant,
    heure_coucher,
    nb_nuits,
    seed=None
):
    rng = np.random.default_rng(seed)

    profils = {
        "bon": {
            "duree": (450, 540),
            "reveils": (0, 2),
            "agitation": 0.7
        },
        "normal": {
            "duree": (390, 510),
            "reveils": (1, 4),
            "agitation": 1.0
        },
        "agite": {
            "duree": (360, 510),
            "reveils": (4, 9),
            "agitation": 2.0
        },
        "court": {
            "duree": (240, 360),
            "reveils": (1, 4),
            "agitation": 1.0
        }
    }

    if type_sommeil not in profils:
        raise ValueError("Type : bon, normal, agite ou court")

    if regularite not in ["regulier", "irregulier"]:
        raise ValueError("Régularité invalide")

    if activite_avant not in ["faible", "moyenne", "elevee"]:
        raise ValueError("Activité invalide")

    if nb_nuits < 1:
        raise ValueError("nb_nuits doit être >= 1")

    # Vérification de l'heure donnée par l'utilisateur
    try:
        heure, minute = map(int, heure_coucher.split(":"))
        if not (0 <= heure <= 23 and 0 <= minute <= 59):
            raise ValueError
    except (ValueError, AttributeError):
        raise ValueError("L'heure doit être au format HH:MM, ex : 22:30")

    profil = profils[type_sommeil]

    effet_activite = {
        "faible": 0,
        "moyenne": 3,
        "elevee": 6
    }

    fc_base = rng.uniform(58, 72)

    mesures = []

    date_depart = datetime.now().date() - timedelta(days=nb_nuits)

    for nuit in range(nb_nuits):

        # Heure de coucher choisie par l'utilisateur
        variation = 25 if regularite == "regulier" else 120

        coucher_min = heure * 60 + minute + int(
            rng.integers(-variation, variation + 1)
        )

        date_nuit = date_depart + timedelta(days=nuit)

        coucher = datetime.combine(
            date_nuit, datetime.min.time()
        ) + timedelta(minutes=coucher_min)

        duree_lit = int(rng.integers(
            profil["duree"][0],
            profil["duree"][1] + 1
        ))

        # États cachés :
        # 0 = éveil, 1 = léger, 2 = profond, 3 = REM
        etats = np.ones(duree_lit, dtype=int)

        latence = int(rng.integers(5, 21))

        if type_sommeil == "agite":
            latence += int(rng.integers(5, 21))

        latence = min(latence, duree_lit // 4)
        etats[:latence] = 0

        
        position = latence
        cycle = 0

        while position < duree_lit:

            profond = max(5, 30 - cycle * 5)
            rem = min(35, 12 + cycle * 5)

            phases = [
                (1, int(rng.integers(15, 26))),
                (2, profond),
                (1, int(rng.integers(10, 21))),
                (3, rem)
            ]

            for phase, longueur in phases:
                fin = min(position + longueur, duree_lit)
                etats[position:fin] = phase
                position = fin

            cycle += 1

       
        nb_reveils = int(rng.integers(
            profil["reveils"][0],
            profil["reveils"][1] + 1
        ))

        for _ in range(nb_reveils):

            debut = int(rng.integers(
                latence,
                max(latence + 1, duree_lit - 5)
            ))

            duree_reveil = int(rng.integers(2, 11))
            fin = min(debut + duree_reveil, duree_lit)

            etats[debut:fin] = 0

       
        fc_precedente = fc_base + 8
        mouvement_precedent = 0.3

        parametres = {
            0: (10, 0.65),
            1: (0, 0.18),
            2: (-8, 0.04),
            3: (3, 0.12)
        }

        for minute_nuit, etat in enumerate(etats):

            decalage_fc, niveau_mouvement = parametres[etat]

            fc_cible = (
                fc_base
                + decalage_fc
                + effet_activite[activite_avant]
            )

            fc = (
                0.75 * fc_precedente
                + 0.25 * fc_cible
                + rng.normal(0, 1.8)
            )

            fc = float(np.clip(fc, 42, 110))
            fc_precedente = fc

            mouvement_cible = (
                niveau_mouvement
                * profil["agitation"]
            )

            mouvement = (
                0.4 * mouvement_precedent
                + 0.6 * mouvement_cible
                + rng.normal(0, 0.06)
            )

            if rng.random() < 0.025:
                mouvement += rng.uniform(0.1, 0.4)

            mouvement = float(np.clip(mouvement, 0, 1))
            mouvement_precedent = mouvement

            instant = coucher + timedelta(minutes=minute_nuit)

            mesures.append({
                "id_nuit": nuit + 1,
                "date_heure": instant,
                "fc_bpm": round(fc, 1),
                "mouvement": round(mouvement, 3)
            })

  
    df = pd.DataFrame(mesures)
    df.to_csv("sommeil_mesures.csv", index=False)

    print("Simulation terminée !")
    print("Nombre de nuits :", nb_nuits)
    print("Nombre de mesures :", len(df))

    return df


# Exemple d'utilisation
df = simuler_sommeil(
    type_sommeil="agite",
    regularite="irregulier",
    activite_avant="moyenne",
    heure_coucher="22:30",
    nb_nuits=2
)

display(df.head(10))



#type_sommeil = bon ,normal , agite 
#regularite = irregulier , regulier 
#activité-avant = faible , moyenne ,elevee
df = simuler_sommeil(
    type_sommeil="bon",
    regularite="regulier",
    activite_avant="faible",
    nb_nuits=1
)

display(df.head(10))


#utilisé dans un autre fichier 
#from simulateur_sommeil_datafit import simuler_sommeil

#mesures, verite = simuler_sommeil(
    #type_sommeil="agite",
    #regularite="irregulier",
    #activite_avant="moyenne",
    #nb_nuits=30
#)

#display(mesures.head(10))
