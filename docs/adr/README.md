# Décisions d'architecture (ADR)

Un **ADR** (*Architecture Decision Record*) est une fiche courte qui note **une** décision technique importante : le contexte, ce qu'on a choisi, ce qu'on a écarté, et ce que ça implique.

Pourquoi c'est utilisé en entreprise : dans six mois, personne ne se souviendra *pourquoi* on a pris PostgreSQL plutôt que MongoDB. Sans trace, on rediscute sans fin les mêmes choix, ou on les défait sans comprendre ce qu'ils protégeaient. Pour un jury, c'est aussi la preuve que les choix ont été réfléchis.

## Règles

- Une décision = un fichier, numéroté dans l'ordre : `0007-titre-court.md`.
- On part du [modèle](0000-modele.md).
- Un ADR **accepté ne se modifie plus**. Si on change d'avis, on écrit un nouvel ADR qui le *remplace*, et on passe l'ancien en statut « Remplacé par 00XX ». L'historique des décisions reste lisible.
- Statuts possibles : **Proposé** (en discussion), **Accepté**, **Remplacé**, **Abandonné**.
- On écrit un ADR quand la décision est coûteuse à défaire : un langage, une base, un framework, une façon de découper le système, une règle de sécurité.

## Liste

| N° | Décision | Statut |
|---|---|---|
| [0001](0001-depot-unique.md) | Un seul dépôt pour tout le projet | Accepté |
| [0002](0002-backend-java-spring-boot.md) | Backend en Java avec Spring Boot | Accepté |
| [0003](0003-postgresql.md) | PostgreSQL comme base de données | Accepté |
| [0004](0004-frontend-react-typescript-vite.md) | Frontend en React + TypeScript + Vite | Accepté |
| [0005](0005-docker-compose.md) | Docker Compose pour lancer le projet | Accepté |
| [0006](0006-service-analyse-python-separe.md) | Analyse des données dans un service Python séparé | Proposé |
