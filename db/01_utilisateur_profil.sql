-- Comptes utilisateurs et leur profil.
-- A charger en premier : toutes les autres tables referencent utilisateur(id).

CREATE TABLE IF NOT EXISTS utilisateur (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(255) NOT NULL,
    cree_le       TIMESTAMP NOT NULL DEFAULT now(),
    cgu_acceptees_le TIMESTAMP,  -- date d'acceptation des CGU, vide pour les comptes plus anciens
    -- confirmation de l'adresse e-mail : vide tant que le lien reçu par mail n'a pas été ouvert
    email_verifie_le         TIMESTAMP,
    jeton_verification_hash  VARCHAR(64),  -- SHA-256 du jeton envoyé par mail (jamais le jeton lui-même)
    jeton_expire_le          TIMESTAMP,
    verification_envoyee_le  TIMESTAMP     -- dernier envoi du mail, pour limiter les renvois
);
-- bases créées avant cette colonne (CREATE TABLE IF NOT EXISTS ne modifie pas une table existante)
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS cgu_acceptees_le TIMESTAMP;

-- bases créées avant la confirmation de l'e-mail : on ajoute les colonnes, et les comptes qui
-- existent déjà sont considérés comme confirmés (sinon ils ne pourraient plus se connecter).
-- Fait une seule fois : au lancement suivant, la colonne existe et rien n'est touché.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'utilisateur'
                     AND column_name = 'email_verifie_le') THEN
        ALTER TABLE utilisateur
            ADD COLUMN email_verifie_le TIMESTAMP,
            ADD COLUMN jeton_verification_hash VARCHAR(64),
            ADD COLUMN jeton_expire_le TIMESTAMP,
            ADD COLUMN verification_envoyee_le TIMESTAMP;
        UPDATE utilisateur SET email_verifie_le = cree_le;
    END IF;
END $$;

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
