CREATE TABLE IF NOT EXISTS seance_cardio (
    id                     SERIAL PRIMARY KEY,
    utilisateur_id         INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date                   DATE         NOT NULL,
    nom                    VARCHAR(255) NOT NULL,
    fc_moy                 INT          NOT NULL,   -- fc moyenne
    fc_min                 INT          NOT NULL,
    fc_max                 INT          NOT NULL,
    correlation_vitesse_fc FLOAT        NOT NULL,   -- entre -1 et 1
    duree_s                INT          NOT NULL,   -- duree totale
    distance_m             FLOAT        NOT NULL,
    vitesse_moy_kmh        FLOAT        NOT NULL,
    vitesse_max_kmh        FLOAT        NOT NULL,
    temps_moy_1km_s        FLOAT        NOT NULL,   -- temps moyen pour parcourir 1 km
    variation_vitesse      FLOAT        NOT NULL    -- variation relative de la vitesse
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
    duree_s                   INT          NOT NULL,   -- duree totale
    distance_m                FLOAT        NOT NULL,
    temps_moy_100m_s          FLOAT        NOT NULL,   -- temps moyen sur 100 m
    duree_longueur_rapide_s   FLOAT        NOT NULL,   -- longueur la plus rapide
    duree_moy_longueur_s      FLOAT        NOT NULL,   -- duree moyenne d'une longueur
    variation_duree_longueurs FLOAT        NOT NULL,   -- variation relative
    total_cycles_bras         INT          NOT NULL,
    temps_nage_s              INT          NOT NULL,   -- temps passe a nager
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
    fc_moy_effort        INT          NOT NULL,   -- fc moyenne pendant l'effort
    fc_moy_pause         INT          NOT NULL,   -- fc moyenne pendant la pause
    duree_s              INT          NOT NULL,   -- duree totale de la seance
    duree_effort_s       INT          NOT NULL,   -- duree totale des efforts
    duree_pause_s        INT          NOT NULL,   -- duree totale des pauses
    nb_series            INT          NOT NULL,
    duree_moy_pause_s    FLOAT        NOT NULL,
    baisse_fc_apres_60s  FLOAT        NOT NULL    -- baisse moyenne de fc apres 60 s de pause
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
    correlation_fc_vitesse FLOAT        NOT NULL,   -- pendant le deplacement
    duree_s                INT          NOT NULL,   -- duree totale
    temps_pedalage_s       INT          NOT NULL,   -- temps passe a pedaler
    temps_roue_libre_s     INT          NOT NULL,   -- en mouvement sans pedaler
    temps_pause_s          INT          NOT NULL,
    distance_m             FLOAT        NOT NULL,
    vitesse_moy_kmh        FLOAT        NOT NULL,
    vitesse_max_kmh        FLOAT        NOT NULL,
    variation_vitesse      FLOAT        NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seance_velo_user_date ON seance_velo (utilisateur_id, date);