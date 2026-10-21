-- Comptes utilisateurs et leur profil.
-- A charger en premier : toutes les autres tables referencent utilisateur(id).

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
