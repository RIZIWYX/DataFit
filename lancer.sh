#!/usr/bin/env bash
# Lance la base, le backend et le site avec Docker
# usage : ./lancer.sh  ou  ./lancer.sh --reinitialiser (base vide)
set -euo pipefail
cd "$(dirname "$0")"

# Docker installé avec snap : /snap/bin manque au PATH des terminaux non interactifs
[[ ":$PATH:" == *:/snap/bin:* ]] || PATH="$PATH:/snap/bin"
if ! command -v docker > /dev/null; then
  echo "Docker n'est pas installé : voir docs/developpement.md."
  exit 1
fi

# ajoute l'utilisateur au groupe docker si besoin (pour ne pas avoir à utiliser sudo)
docker_repond() { docker info > /dev/null 2>&1; }
groupe_du_socket() { stat -c %G /var/run/docker.sock 2> /dev/null; }
dans_le_groupe() { [[ " $1 " == *" docker "* ]]; } # $1 : la liste de "id -nG"
if ! docker_repond && [ -z "${DATAFIT_GROUPE_DOCKER:-}" ]; then
  moi=$(id -un)
  if ! dans_le_groupe "$(id -nG "$moi")" || [ "$(groupe_du_socket)" != docker ]; then
    echo "-> Configuration unique de Docker sans sudo : tape le mot de passe de ta session Ubuntu."
    echo "  Il ne sera plus demandé aux prochains lancements."
    sudo groupadd -f docker
    sudo usermod -aG docker "$moi"
    # avec snap il faut disable/enable pour que docker prenne en compte le groupe
    if snap list docker > /dev/null 2>&1; then
      sudo snap disable docker > /dev/null
      sudo snap enable docker > /dev/null
    fi
    for _ in {1..30}; do
      [ "$(groupe_du_socket)" = docker ] && break
      sleep 1
    done
  fi
  # le terminal actuel n'a pas encore le groupe : on relance le script avec
  if ! dans_le_groupe "$(id -nG)"; then
    if sudo -n true 2> /dev/null; then
      exec sudo -u "$moi" -g docker env DATAFIT_GROUPE_DOCKER=1 bash "$PWD/${0##*/}" "$@"
    fi
    echo "Ce terminal a été ouvert avant ton ajout au groupe docker : ouvre-en un nouveau et relance ./lancer.sh."
    exit 1
  fi
fi
# Docker vient peut-être de redémarrer : on lui laisse 20 secondes
if ! docker_repond; then
  for _ in {1..20}; do
    sleep 1
    docker_repond && break
  done
  if ! docker_repond; then
    echo "Docker ne répond pas : est-il installé et démarré ? Voir docs/developpement.md."
    exit 1
  fi
fi
compose() { docker compose "$@"; }

# le mot de passe de la base vient de .env : créé depuis l'exemple s'il n'existe pas encore
if [ ! -f .env ]; then
  cp .env.example .env
  echo "-> .env créé à partir de .env.example"
fi
set -a
. ./.env
set +a

if [ "${1:-}" = "--reinitialiser" ]; then
  echo "-> Suppression de la base locale..."
  compose down --volumes
fi

# un conteneur d'une autre installation occupe déjà le port de la base : on l'arrête (ses données restent)
notre_base=$(compose ps -q db 2> /dev/null || true)
for id in $(docker ps -q --no-trunc --filter publish=5433); do
  if [ "$id" != "$notre_base" ]; then
    nom=$(docker inspect -f '{{.Name}}' "$id")
    echo "-> Le conteneur ${nom#/} occupe déjà le port 5433 : arrêt (ses données sont gardées)."
    docker stop "$id" > /dev/null
  fi
done

echo "-> Démarrage de la base..."
compose up -d --wait db

# remet le mot de passe de .env et crée les tables manquantes (fichiers de db/ dans l'ordre)
psql_base() {
  compose exec -T db sh -c \
    'PGOPTIONS="-c client_min_messages=warning" psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
}
mot_de_passe_sql=${DB_PASSWORD//\'/\'\'} # une apostrophe s'écrit '' en SQL
if ! psql_base <<< "ALTER ROLE \"$DB_USER\" WITH PASSWORD '$mot_de_passe_sql';" \
  || ! cat db/*.sql | psql_base; then
  echo "La base n'a pas pu être mise à jour. Pour repartir d'une base neuve : ./lancer.sh --reinitialiser"
  exit 1
fi
echo "-> Base prête : mot de passe et tables à jour."

echo "-> Site : http://localhost:3000 | Backend : http://localhost:8080 | Base : localhost:5433"
compose up --build
