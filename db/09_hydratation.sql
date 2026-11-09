-- L'eau notée sur la page Nutrition : une ligne par ajout (bouton +0,25 L, +0,5 L, +1 L).
-- Garder chaque ajout, et pas seulement le total du jour, permet d'annuler le dernier.
CREATE TABLE IF NOT EXISTS hydratation (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT       NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE      NOT NULL,
    ml             INT       NOT NULL CHECK (ml > 0 AND ml <= 5000),
    ajoute_le      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hydratation_user_date ON hydratation (utilisateur_id, date);
