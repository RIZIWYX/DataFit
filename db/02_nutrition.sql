-- Les repas notés sur la page Nutrition : une ligne par repas, avec son moment de la journée.
CREATE TABLE IF NOT EXISTS nutrition (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT          NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date           DATE         NOT NULL,
    repas          VARCHAR(20)  NOT NULL,  -- petit-dejeuner, dejeuner, diner ou collation
    nom            VARCHAR(255) NOT NULL,
    objectif       VARCHAR(255) NOT NULL,
    calories       FLOAT        NOT NULL,
    proteines      FLOAT        NOT NULL,
    glucides       FLOAT        NOT NULL,
    lipides        FLOAT        NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition (utilisateur_id, date);

-- Bases créées avec l'ancienne version (une ligne par jour : les totaux de la journée, sans la
-- colonne repas). CREATE TABLE IF NOT EXISTS ne modifie pas une table qui existe déjà : on la
-- passe ici à une ligne par repas. Les anciennes lignes sont des sommes qui ne correspondent à
-- aucun repas : elles sont retirées, et la page Nutrition renvoie ensuite chaque repas noté.
DO $$
DECLARE
    contrainte TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'nutrition' AND column_name = 'repas') THEN
        DELETE FROM nutrition;
        -- plus d'UNIQUE (utilisateur_id, date) : plusieurs repas le même jour
        FOR contrainte IN SELECT conname FROM pg_constraint
                          WHERE conrelid = 'nutrition'::regclass AND contype = 'u' LOOP
            EXECUTE format('ALTER TABLE nutrition DROP CONSTRAINT %I', contrainte);
        END LOOP;
        ALTER TABLE nutrition ADD COLUMN repas VARCHAR(20) NOT NULL;
        ALTER TABLE nutrition ADD COLUMN IF NOT EXISTS nom VARCHAR(255) NOT NULL;
    END IF;
END $$;
