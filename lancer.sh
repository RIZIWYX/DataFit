#!/usr/bin/env bash
# Lance tout DataFit d'une seule commande, avec Docker : la base, le backend et le site.
#
#   ./lancer.sh                   tout lancer (Ctrl+C pour arrêter)
#   ./lancer.sh --reinitialiser   repartir d'une base vide (efface les comptes et profils de test)
#
# À chaque lancement, la base est remise d'accord avec .env (mot de passe) et avec
# db/init.sql (tables manquantes), sans rien effacer.
set -euo pipefail
cd "$(dirname "$0")"

# le mot de passe de la base vient de .env : créé depuis l'exemple s'il n'existe pas encore
if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ .env créé à partir de .env.example"
fi
set -a
. ./.env
set +a

# Docker sans sudo si possible ; sinon avec (le mot de passe de ta session est demandé une fois)
docker=(docker)
if ! docker info > /dev/null 2>&1; then
  echo "→ Docker demande les droits administrateur : tape le mot de passe de ta session Ubuntu."
  if ! sudo docker info > /dev/null; then
    echo "Docker ne répond pas : est-il installé et démarré ? Voir docs/developpement.md."
    exit 1
  fi
  docker=(sudo docker)
fi
compose() { "${docker[@]}" compose "$@"; }

if [ "${1:-}" = "--reinitialiser" ]; then
  echo "→ Suppression de la base locale…"
  compose down --volumes
fi

# un conteneur d'une autre installation occupe déjà le port de la base : on l'arrête (ses données restent)
notre_base=$(compose ps -q db 2> /dev/null || true)
for id in $("${docker[@]}" ps -q --no-trunc --filter publish=5433); do
  if [ "$id" != "$notre_base" ]; then
    nom=$("${docker[@]}" inspect -f '{{.Name}}' "$id")
    echo "→ Le conteneur ${nom#/} occupe déjà le port 5433 : arrêt (ses données sont gardées)."
    "${docker[@]}" stop "$id" > /dev/null
  fi
done

echo "→ Démarrage de la base…"
compose up -d --wait db

# La base garde le mot de passe donné à sa création : on lui redonne celui de .env,
# puis on crée les tables de db/init.sql qui manqueraient (CREATE TABLE IF NOT EXISTS).
# À l'intérieur du conteneur, psql se connecte sans mot de passe.
psql_base() {
  compose exec -T db sh -c \
    'PGOPTIONS="-c client_min_messages=warning" psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
}
mot_de_passe_sql=${DB_PASSWORD//\'/\'\'} # une apostrophe s'écrit '' en SQL
if ! psql_base <<< "ALTER ROLE \"$DB_USER\" WITH PASSWORD '$mot_de_passe_sql';" \
  || ! psql_base < db/init.sql; then
  echo "La base n'a pas pu être mise à jour. Pour repartir d'une base neuve : ./lancer.sh --reinitialiser"
  exit 1
fi
echo "→ Base prête : mot de passe et tables à jour."

echo "→ Site : http://localhost:3000 · Backend : http://localhost:8080 · Base : localhost:5433"
compose up --build
