-- =========================================================
-- Seances capturees depuis la montre connectee (simulateur).
-- Une ligne = une seance. Plusieurs seances possibles par jour.
-- Distinct des tables sport.* (saisie manuelle de perfs).
-- Unites : _s = secondes, _m = metres, _kmh = km/h, fc en bpm.
-- =========================================================

CREATE TABLE IF NOT EXISTS seance_cardio (
    id                     SERIAL PRIMARY KEY,
    utilisateur_id         INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date                   DATE         NOT NULL,
    nom                    VARCHAR(255) NOT NULL,
    fc_moy                 INT          NOT NULL,
    fc_min                 INT          NOT NULL,
    fc_max                 INT          NOT NULL,
    correlation_vitesse_fc FLOAT        NOT NULL,
    duree_s                INT          NOT NULL,
    distance_m             FLOAT        NOT NULL,
    vitesse_moy_kmh        FLOAT        NOT NULL,
    vitesse_max_kmh        FLOAT        NOT NULL,
    temps_moy_1km_s        FLOAT        NOT NULL,
    variation_vitesse      FLOAT        NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seance_cardio_user_date ON seance_cardio (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS seance_natation (
    id                        SERIAL PRIMARY KEY,
    utilisateur_id            INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date                      DATE         NOT NULL,
    nom                       VARCHAR(255) NOT NULL,
    fc_min                    INT          NOT NULL,
    fc_moy                    INT          NOT NULL,
    fc_max                    INT          NOT NULL,
    duree_s                   INT          NOT NULL,
    distance_m                FLOAT        NOT NULL,
    temps_moy_100m_s          FLOAT        NOT NULL,
    duree_longueur_rapide_s   FLOAT        NOT NULL,
    duree_moy_longueur_s      FLOAT        NOT NULL,
    variation_duree_longueurs FLOAT        NOT NULL,
    total_cycles_bras         INT          NOT NULL,
    temps_nage_s              INT          NOT NULL,
    temps_pause_s             INT          NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seance_natation_user_date ON seance_natation (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS seance_muscu (
    id                   SERIAL PRIMARY KEY,
    utilisateur_id       INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date                 DATE         NOT NULL,
    nom                  VARCHAR(255) NOT NULL,
    fc_min               INT          NOT NULL,
    fc_moy               INT          NOT NULL,
    fc_max               INT          NOT NULL,
    fc_moy_effort        INT          NOT NULL,
    fc_moy_pause         INT          NOT NULL,
    duree_s              INT          NOT NULL,
    duree_effort_s       INT          NOT NULL,
    duree_pause_s        INT          NOT NULL,
    nb_series            INT          NOT NULL,
    duree_moy_pause_s    FLOAT        NOT NULL,
    baisse_fc_apres_60s  FLOAT        NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seance_muscu_user_date ON seance_muscu (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS seance_velo (
    id                     SERIAL PRIMARY KEY,
    utilisateur_id         INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date                   DATE         NOT NULL,
    nom                    VARCHAR(255) NOT NULL,
    fc_min                 INT          NOT NULL,
    fc_moy                 INT          NOT NULL,
    fc_max                 INT          NOT NULL,
    correlation_fc_vitesse FLOAT        NOT NULL,
    duree_s                INT          NOT NULL,
    temps_pedalage_s       INT          NOT NULL,
    temps_roue_libre_s     INT          NOT NULL,
    temps_pause_s          INT          NOT NULL,
    distance_m             FLOAT        NOT NULL,
    vitesse_moy_kmh        FLOAT        NOT NULL,
    vitesse_max_kmh        FLOAT        NOT NULL,
    variation_vitesse      FLOAT        NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seance_velo_user_date ON seance_velo (utilisateur_id, date);
