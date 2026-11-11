-- Une ligne = une nuit d'un utilisateur, résumée par l'analyse des mesures de la montre.
-- Durées en secondes, fréquences cardiaques en bpm.
CREATE TABLE IF NOT EXISTS sommeil (
    id                       SERIAL PRIMARY KEY,
    utilisateur_id           INT       NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    heure_coucher            TIMESTAMP NOT NULL,   -- moment où la personne se met au lit
    heure_reveil             TIMESTAMP NOT NULL,   -- moment où elle sort du lit
    temps_au_lit_s           INT       NOT NULL,   -- durée totale passée au lit
    duree_sommeil_s          INT       NOT NULL,   -- temps au lit moins l'éveil
    latence_endormissement_s INT       NOT NULL,   -- temps mis pour s'endormir
    duree_eveil_totale_s     INT       NOT NULL,   -- tous les moments d'éveil, latence comprise
    eveil_nocturne_s         INT       NOT NULL,   -- éveil après l'endormissement (éveil total moins latence)
    reveils_nb               INT       NOT NULL,   -- nombre de réveils pendant la nuit
    efficacite_sommeil_pct   FLOAT     NOT NULL,   -- part du temps au lit passée à dormir
    fc_moyenne               FLOAT     NOT NULL,
    fc_min                   FLOAT     NOT NULL,
    fc_max                   FLOAT     NOT NULL,
    duree_eveil_s            INT       NOT NULL,   -- temps total en phase d'éveil
    duree_leger_s            INT       NOT NULL,   -- sommeil léger
    duree_profond_s          INT       NOT NULL,   -- sommeil profond
    duree_paradoxal_s        INT       NOT NULL,   -- sommeil paradoxal (REM)
    -- jour de la nuit = jour du réveil ("la nuit du 21" quand on se réveille le 21), calculé par la base
    date_nuit                DATE      GENERATED ALWAYS AS (heure_reveil::date) STORED,

    CONSTRAINT sommeil_horaires CHECK (heure_reveil > heure_coucher),
    CONSTRAINT sommeil_durees_positives CHECK (
        temps_au_lit_s >= 0 AND duree_sommeil_s >= 0 AND latence_endormissement_s >= 0
        AND duree_eveil_totale_s >= 0 AND eveil_nocturne_s >= 0 AND reveils_nb >= 0
        AND duree_eveil_s >= 0 AND duree_leger_s >= 0 AND duree_profond_s >= 0 AND duree_paradoxal_s >= 0),
    CONSTRAINT sommeil_efficacite CHECK (efficacite_sommeil_pct BETWEEN 0 AND 100),
    CONSTRAINT sommeil_fc CHECK (fc_min > 0 AND fc_min <= fc_moyenne AND fc_moyenne <= fc_max),
    -- une seule nuit par jour et par utilisateur
    CONSTRAINT sommeil_une_nuit_par_jour UNIQUE (utilisateur_id, date_nuit)
);
CREATE INDEX IF NOT EXISTS idx_sommeil_user_reveil ON sommeil (utilisateur_id, heure_reveil);

-- Bases créées avant la règle « une seule nuit par jour » (CREATE TABLE IF NOT EXISTS ne modifie
-- pas une table existante) : on leur ajoute date_nuit et la nouvelle contrainte ici.
-- Relancé à chaque ./lancer.sh : sans effet sur une base neuve ou déjà mise à jour.
ALTER TABLE sommeil ADD COLUMN IF NOT EXISTS
    date_nuit DATE GENERATED ALWAYS AS (heure_reveil::date) STORED;
-- l'ancienne règle (une nuit par heure de coucher) est remplacée par celle-ci
ALTER TABLE sommeil DROP CONSTRAINT IF EXISTS sommeil_nuit_unique;
-- avant d'ajouter la contrainte : s'il y a déjà plusieurs nuits le même jour, on garde celle que
-- l'appli affiche (le réveil le plus tard, comme SommeilService.duJour) et on supprime les autres
DELETE FROM sommeil s
USING sommeil autre
WHERE autre.utilisateur_id = s.utilisateur_id
  AND autre.date_nuit = s.date_nuit
  AND (autre.heure_reveil > s.heure_reveil
       OR (autre.heure_reveil = s.heure_reveil AND autre.id > s.id));
-- PostgreSQL n'a pas de ADD CONSTRAINT IF NOT EXISTS : on vérifie d'abord qu'elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conrelid = 'sommeil'::regclass AND conname = 'sommeil_une_nuit_par_jour') THEN
        ALTER TABLE sommeil ADD CONSTRAINT sommeil_une_nuit_par_jour UNIQUE (utilisateur_id, date_nuit);
    END IF;
END $$;
