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
    nom         VARCHAR(255) NOT NULL,
    prenom      VARCHAR(255) NOT NULL,
    sexe        VARCHAR(10) NOT NULL,
    poids       FLOAT NOT NULL,
    taille      FLOAT NOT NULL,
    objectif    VARCHAR(255) NOT NULL,
    niveau      VARCHAR(50) NOT NULL,
    activite    VARCHAR(50) NOT NULL,
    date_naissance DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS NUTRITION (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    OBJECTIF      VARCHAR(255) NOT NULL,
    date          DATE NOT NULL,
    calories      FLOAT NOT NULL,
    proteines     FLOAT NOT NULL,
    glucides      FLOAT NOT NULL,
    lipides       FLOAT NOT NULL
);
CREATE TABLE IF NOT EXISTS HISTORIQUE_SEANCE (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    nom           VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS SBD (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    BENCH         FLOAT NOT NULL,
    SQUAT        FLOAT NOT NULL,
    DEADLIFT      FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS HALTEROFILIE (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    ARACHER       FLOAT NOT NULL,
    EPOLEJETTE   FLOAT NOT NULL,
);

CREATE TABLE IF NOT EXISTS STREETLIFTING (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    TRACTION      FLOAT NOT NULL,
    DIP           FLOAT NOT NULL,
    POMPE         FLOAT NOT NULL,
    MUSCLEUP      FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS CALISTHENICS (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    TRACTION      FLOAT NOT NULL,
    DIP           FLOAT NOT NULL,
    POMPE         FLOAT NOT NULL,
    MUSCLEUP      FLOAT NOT NULL,
    PISTOL        FLOAT NOT NULL,
    L_SIT         FLOAT NOT NULL,
    HANDSTAND     FLOAT NOT NULL,
    FRONT_LEVER   FLOAT NOT NULL,
    OAP           FLOAT NOT NULL,
    FLAG          FLOAT NOT NULL,
    PLANCHE       FLOAT NOT NULL,
    CRUCIFIX       FLOAT NOT NULL
);
CREATE TABLE IF NOT EXISTS NATATION (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    CRAWL          FLOAT NOT NULL,
    DOS            FLOAT NOT NULL,
    BRASSEE        FLOAT NOT NULL,
    PAPILLON       FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS SOUPLESSE (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    FACIAL       FLOAT NOT NULL,
    ANTEROPOST     FLOAT NOT NULL,
    TODEBOUT      FLOAT NOT NULL,
    TOASSIS      FLOAT NOT NULL,
);

CREATE TABLE IF NOT EXISTS ATHLETISME (
    utilisateur_id INT PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    100M        FLOAT NOT NULL,
    400M        FLOAT NOT NULL,
    800M        FLOAT NOT NULL,
    1500M       FLOAT NOT NULL,
    5000M       FLOAT NOT NULL,
    10000M      FLOAT NOT NULL,
    SEMI_MARATHON  FLOAT NOT NULL,
    TRIATHLON     FLOAT NOT NULL,
    IRONMAN       FLOAT NOT NULL,
    LONGUEUR      FLOAT NOT NULL,
    HAUTEUR       FLOAT NOT NULL,
    MARATHON      FLOAT NOT NULL
);