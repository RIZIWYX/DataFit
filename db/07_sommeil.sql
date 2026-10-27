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

    CONSTRAINT sommeil_horaires CHECK (heure_reveil > heure_coucher),
    CONSTRAINT sommeil_durees_positives CHECK (
        temps_au_lit_s >= 0 AND duree_sommeil_s >= 0 AND latence_endormissement_s >= 0
        AND duree_eveil_totale_s >= 0 AND eveil_nocturne_s >= 0 AND reveils_nb >= 0
        AND duree_eveil_s >= 0 AND duree_leger_s >= 0 AND duree_profond_s >= 0 AND duree_paradoxal_s >= 0),
    CONSTRAINT sommeil_efficacite CHECK (efficacite_sommeil_pct BETWEEN 0 AND 100),
    CONSTRAINT sommeil_fc CHECK (fc_min > 0 AND fc_min <= fc_moyenne AND fc_moyenne <= fc_max),
    -- une même nuit n'est pas enregistrée deux fois
    CONSTRAINT sommeil_nuit_unique UNIQUE (utilisateur_id, heure_coucher)
);
CREATE INDEX IF NOT EXISTS idx_sommeil_user_reveil ON sommeil (utilisateur_id, heure_reveil);
