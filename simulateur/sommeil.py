import numpy as np
from datetime import datetime, timedelta


def simuler_sommeil(profil):
    rng = np.random.default_rng()

    niveau = profil.get("niveau")

    parametres_niveaux = {
        "novice": {
            "probabilites": [0.20, 0.40, 0.30, 0.10],
            "probabilite_regulier": 0.40,
            "coucher": (22 * 60, 25 * 60),
            "fc_base": (62, 74)
        },
        "intermediaire": {
            "probabilites": [0.45, 0.35, 0.15, 0.05],
            "probabilite_regulier": 0.65,
            "coucher": (21 * 60 + 30, 24 * 60),
            "fc_base": (56, 68)
        },
        "confirmer": {
            "probabilites": [0.65, 0.25, 0.07, 0.03],
            "probabilite_regulier": 0.85,
            "coucher": (21 * 60, 23 * 60 + 30),
            "fc_base": (48, 62)
        }
    }

    profils_sommeil = {
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

    if niveau not in parametres_niveaux:
        raise ValueError(
            "Le niveau doit être novice, intermediaire ou confirmer."
        )

    configuration = parametres_niveaux[niveau]

    type_sommeil = str(
        rng.choice(
            ["bon", "normal", "agite", "court"],
            p=configuration["probabilites"]
        )
    )

    regularite = (
        "regulier"
        if rng.random() < configuration["probabilite_regulier"]
        else "irregulier"
    )

    profil_sommeil = profils_sommeil[type_sommeil]

    coucher_reference_min = int(
        rng.integers(
            configuration["coucher"][0],
            configuration["coucher"][1] + 1
        )
    )

    variation = 25 if regularite == "regulier" else 120

    coucher_min = coucher_reference_min + int(
        rng.integers(-variation, variation + 1)
    )

    date_depart = datetime.now().date() - timedelta(days=1)

    coucher = datetime.combine(
        date_depart,
        datetime.min.time()
    ) + timedelta(minutes=coucher_min)

    duree_lit = int(
        rng.integers(
            profil_sommeil["duree"][0],
            profil_sommeil["duree"][1] + 1
        )
    )

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

    nb_reveils_tires = int(
        rng.integers(
            profil_sommeil["reveils"][0],
            profil_sommeil["reveils"][1] + 1
        )
    )

    for _ in range(nb_reveils_tires):
        debut = int(
            rng.integers(
                latence + 1,
                duree_lit - 5
            )
        )

        duree_reveil = int(rng.integers(2, 11))

        fin = min(debut + duree_reveil, duree_lit)

        etats[debut:fin] = 0

    fc_base = float(
        rng.uniform(
            configuration["fc_base"][0],
            configuration["fc_base"][1]
        )
    )

    fc_precedente = fc_base + 8
    mouvement_precedent = 0.3

    parametres_etats = {
        0: (10, 0.65),
        1: (0, 0.18),
        2: (-8, 0.04),
        3: (3, 0.12)
    }

    mesures = []

    for minute_nuit, etat in enumerate(etats):
        decalage_fc, niveau_mouvement = parametres_etats[
            int(etat)
        ]

        fc_cible = fc_base + decalage_fc

        fc = (
            0.75 * fc_precedente
            + 0.25 * fc_cible
            + rng.normal(0, 1.8)
        )

        fc = float(np.clip(fc, 42, 110))

        fc_precedente = fc

        mouvement_cible = (
            niveau_mouvement
            * profil_sommeil["agitation"]
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
            "id_nuit": 1,
            "date_heure": instant.isoformat(),
            "fc_bpm": round(fc, 1),
            "mouvement": round(mouvement, 3)
        })

    duree_eveil_min = int(
        np.count_nonzero(etats == 0)
    )

    duree_sommeil_min = duree_lit - duree_eveil_min

    eveil_nocturne_min = duree_eveil_min - latence

    reveils_reels = int(
        np.count_nonzero(
            (etats[1:] == 0)
            & (etats[:-1] != 0)
        )
    )

    fc_mesures = [
        mesure["fc_bpm"]
        for mesure in mesures
    ]

    reveil = coucher + timedelta(minutes=duree_lit)

    return {
        "niveau": niveau,
        "source": "simulation",
        "frequence_mesure_s": 60,
        "parametres_generes": {
            "type_sommeil_simule": type_sommeil,
            "regularite_simulee": regularite,
            "fc_base_simulee": round(fc_base, 1)
        },
        "bilan": {
            "heure_coucher": coucher.isoformat(),
            "heure_reveil": reveil.isoformat(),
            "temps_au_lit_s": duree_lit * 60,
            "duree_sommeil_s": duree_sommeil_min * 60,
            "latence_endormissement_s": latence * 60,
            "duree_eveil_totale_s": duree_eveil_min * 60,
            "eveil_nocturne_s": eveil_nocturne_min * 60,
            "reveils_nb": reveils_reels,
            "efficacite_sommeil_pct": round(
                100 * duree_sommeil_min / duree_lit,
                2
            ),
            "fc_moyenne": round(
                float(np.mean(fc_mesures)),
                1
            ),
            "fc_min": min(fc_mesures),
            "fc_max": max(fc_mesures),
            "phases_simulees_s": {
                "eveil": duree_eveil_min * 60,
                "leger": int(
                    np.count_nonzero(etats == 1)
                ) * 60,
                "profond": int(
                    np.count_nonzero(etats == 2)
                ) * 60,
                "paradoxal": int(
                    np.count_nonzero(etats == 3)
                ) * 60
            }
        },
        "mesures": mesures
    }

