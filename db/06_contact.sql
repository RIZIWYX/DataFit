-- Les messages envoyés depuis le formulaire de contact (page /contact).
-- Pas de lien vers utilisateur : on peut écrire sans avoir de compte.
CREATE TABLE IF NOT EXISTS message_contact (
    id        SERIAL PRIMARY KEY,
    nom       VARCHAR(100)  NOT NULL,
    email     VARCHAR(255)  NOT NULL,
    sujet     VARCHAR(50)   NOT NULL,  -- question, probleme, donnees ou autre
    message   VARCHAR(2000) NOT NULL,
    envoye_le TIMESTAMP     NOT NULL DEFAULT now()
);
