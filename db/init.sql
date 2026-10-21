-- Script exécuté une seule fois, à la création de la base.
-- Les tables du projet viendront ici (ex : utilisateur).
CREATE TABLE IF NOT EXISTS utilisateur (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(255) NOT NULL,
    cree_le       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profil (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom            VARCHAR(255) NOT NULL,
    prenom         VARCHAR(255) NOT NULL,
    sexe           VARCHAR(10)  NOT NULL,
    poids          FLOAT        NOT NULL,
    taille         FLOAT        NOT NULL,
    objectif       VARCHAR(255) NOT NULL,
    niveau         VARCHAR(50)  NOT NULL,
    activite       VARCHAR(50)  NOT NULL,
    date_naissance DATE         NOT NULL
);

CREATE TABLE IF NOT EXISTS nutrition (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE         NOT NULL,
    objectif       VARCHAR(255) NOT NULL,
    calories       FLOAT        NOT NULL,
    proteines      FLOAT        NOT NULL,
    glucides       FLOAT        NOT NULL,
    lipides        FLOAT        NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS historique_seance (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE         NOT NULL,
    nom            VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_historique_user_date ON historique_seance (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS sbd (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    bench          FLOAT NOT NULL,
    squat          FLOAT NOT NULL,
    deadlift       FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_sbd_user_date ON sbd (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS halterofilie (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    aracher        FLOAT NOT NULL,
    epolejette     FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_halterofilie_user_date ON halterofilie (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS streetlifting (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    traction       FLOAT NOT NULL,
    dip            FLOAT NOT NULL,
    pompe          FLOAT NOT NULL,
    muscleup       FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_streetlifting_user_date ON streetlifting (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS calisthenics (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    traction       FLOAT NOT NULL,
    dip            FLOAT NOT NULL,
    pompe          FLOAT NOT NULL,
    muscleup       FLOAT NOT NULL,
    pistol         FLOAT NOT NULL,
    l_sit          FLOAT NOT NULL,
    handstand      FLOAT NOT NULL,
    front_lever    FLOAT NOT NULL,
    oap            FLOAT NOT NULL,
    flag           FLOAT NOT NULL,
    planche        FLOAT NOT NULL,
    crucifix       FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_calisthenics_user_date ON calisthenics (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS natation (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    crawl          FLOAT NOT NULL,
    dos            FLOAT NOT NULL,
    brassee        FLOAT NOT NULL,
    papillon       FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_natation_user_date ON natation (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS souplesse (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    facial         FLOAT NOT NULL,
    anteropost     FLOAT NOT NULL,
    todebout       FLOAT NOT NULL,
    toassis        FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_souplesse_user_date ON souplesse (utilisateur_id, date);

CREATE TABLE IF NOT EXISTS athletisme (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT   NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE  NOT NULL,
    m_100          FLOAT NOT NULL,
    m_400          FLOAT NOT NULL,
    m_800          FLOAT NOT NULL,
    m_1500         FLOAT NOT NULL,
    m_5000         FLOAT NOT NULL,
    m_10000        FLOAT NOT NULL,
    semi_marathon  FLOAT NOT NULL,
    marathon       FLOAT NOT NULL,
    triathlon      FLOAT NOT NULL,
    ironman        FLOAT NOT NULL,
    longueur       FLOAT NOT NULL,
    hauteur        FLOAT NOT NULL,
    UNIQUE (utilisateur_id, date)
);
CREATE INDEX IF NOT EXISTS idx_athletisme_user_date ON athletisme (utilisateur_id, date);
