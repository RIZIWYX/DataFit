-- Script exécuté une seule fois, à la création de la base.
-- Les tables du projet viendront ici (ex : utilisateur).
CREATE TABLE IF NOT EXISTS utilisateur (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(255) NOT NULL,
    cree_le       TIMESTAMP NOT NULL DEFAULT now()
);
