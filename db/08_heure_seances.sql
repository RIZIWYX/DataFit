-- L'heure des séances : la colonne date ne garde que le jour, ce qui ne permet pas de savoir
-- laquelle de deux séances du même jour est la plus récente. synchronise_le garde le moment
-- exact où la séance a été reçue de la montre.
-- Sans valeur par défaut pour les anciennes lignes : leur heure n'est pas connue, on ne l'invente pas.
-- Relancé à chaque ./lancer.sh : IF NOT EXISTS le rend sans effet la deuxième fois.
ALTER TABLE seance_cardio   ADD COLUMN IF NOT EXISTS synchronise_le TIMESTAMP;
ALTER TABLE seance_velo     ADD COLUMN IF NOT EXISTS synchronise_le TIMESTAMP;
ALTER TABLE seance_natation ADD COLUMN IF NOT EXISTS synchronise_le TIMESTAMP;
ALTER TABLE seance_muscu    ADD COLUMN IF NOT EXISTS synchronise_le TIMESTAMP;
