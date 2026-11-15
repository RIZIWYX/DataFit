-- Sessions de connexion : une ligne par navigateur connecté.
-- Le navigateur garde un jeton aléatoire dans un cookie HttpOnly ; ici on ne garde que son
-- empreinte SHA-256 : une fuite de la base ne donne donc pas de jeton utilisable.
-- Une ligne par session : se déconnecter ou expirer la supprime, supprimer le compte aussi (CASCADE).

CREATE TABLE IF NOT EXISTS session_utilisateur (
    jeton_hash     CHAR(64) PRIMARY KEY,
    utilisateur_id INT       NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    cree_le        TIMESTAMP NOT NULL DEFAULT now(),
    expire_le      TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_utilisateur ON session_utilisateur (utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session_utilisateur (expire_le);
