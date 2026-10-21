CREATE TABLE IF NOT EXISTS historique_seance (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE         NOT NULL,
    nom            VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_historique_user_date ON historique_seance (utilisateur_id, date);
