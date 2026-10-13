# 0005. Docker Compose pour lancer le projet

- **Statut** : Accepté
- **Date** : 2026-10-13
- **Décideurs** : équipe informatique

## Contexte

Le projet demande Java 21, Node 22, PostgreSQL et bientôt Python. Installer et configurer tout ça à l'identique sur chaque machine (Windows, WSL, Linux, macOS) est long et source du classique « ça marche chez moi ».

## Options envisagées

1. **Installation manuelle** de chaque outil, documentée. Simple au départ, mais les versions divergent vite entre les machines.
2. **Docker Compose** : chaque programme tourne dans un conteneur dont la recette (`Dockerfile`) est dans le dépôt. Une commande lance tout, avec les mêmes versions partout.

## Décision

Docker Compose, avec un `Dockerfile` par programme et un `docker-compose.yml` à la racine. Les `Dockerfile` sont *multi-étapes* : une étape pour compiler, une étape finale légère qui ne contient que le nécessaire pour exécuter.

## Conséquences

- Il faut Docker installé (Docker Desktop sous Windows, avec WSL).
- Le développement quotidien du front reste plus rapide avec `npm run dev` (rechargement instantané) ; Docker sert à vérifier que l'ensemble fonctionne ensemble.
- Les secrets passent par un fichier `.env` non commité (voir [Sécurité](../securite.md)).
