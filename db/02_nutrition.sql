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
