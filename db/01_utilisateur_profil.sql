-- Comptes utilisateurs et leur profil.
-- A charger en premier : toutes les autres tables referencent utilisateur(id).

CREATE TABLE IF NOT EXISTS utilisateur (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(255) NOT NULL,
    cree_le       TIMESTAMP NOT NULL DEFAULT now(),
    cgu_acceptees_le TIMESTAMP  -- date d'acceptation des CGU, vide pour les comptes plus anciens
);
-- bases créées avant cette colonne (CREATE TABLE IF NOT EXISTS ne modifie pas une table existante)
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS cgu_acceptees_le TIMESTAMP;

-- l'adresse e-mail n'est plus confirmée par un lien envoyé par mail : on retire les colonnes
-- de cette confirmation des bases qui les ont encore (sans effet sur une base neuve)
ALTER TABLE utilisateur
    DROP COLUMN IF EXISTS email_verifie_le,
    DROP COLUMN IF EXISTS jeton_verification_hash,
    DROP COLUMN IF EXISTS jeton_expire_le,
    DROP COLUMN IF EXISTS verification_envoyee_le;

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

-- le niveau « pro » s'appelle « confirmer » : la valeur attendue par le simulateur de la montre
UPDATE profil SET niveau = 'confirmer' WHERE niveau = 'pro';
