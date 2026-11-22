-- Rôle utilisé par le backend : il lit et écrit les données, mais ne peut ni créer, ni modifier,
-- ni supprimer de table, ni créer de rôle (point 5 de docs/audit-securite.md).
-- Ce fichier n'est pas dans db/*.sql : il a besoin du nom et du mot de passe du rôle, passés à psql :
--   psql -v app_user=datafit_app -v app_password=... -f db/roles/role_application.sql
-- Il est lancé par le propriétaire des tables (lancer.sh, la CI, Neon, le Job Kubernetes), après
-- les fichiers de db/. Rejouable : rien n'est recréé s'il existe déjà.

SELECT format('CREATE ROLE %I LOGIN', :'app_user')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user') \gexec

-- le mot de passe est remis à chaque fois : il suit celui de .env ou du secret
SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L',
              :'app_user', :'app_password') \gexec

SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'app_user') \gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'app_user') \gexec
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', :'app_user') \gexec
-- les colonnes SERIAL utilisent une séquence : il faut pouvoir la faire avancer
SELECT format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', :'app_user') \gexec

-- les tables ajoutées plus tard dans db/ reçoivent les mêmes droits automatiquement
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I',
              :'app_user') \gexec
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I',
              :'app_user') \gexec
