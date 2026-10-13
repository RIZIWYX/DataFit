# 0001. Un seul dépôt pour tout le projet

- **Statut** : Accepté
- **Date** : 2026-10-13
- **Décideurs** : équipe DataFit

## Contexte

Le projet mélange quatre programmes (front, back, analyse, simulateur) écrits dans trois langages, par deux équipes. Il faut que tout le monde puisse lancer l'ensemble facilement, et qu'un changement de format d'échange soit visible des deux côtés.

## Options envisagées

1. **Un dépôt par programme** (*polyrepo*). Chaque partie est indépendante. Mais il faut cloner et synchroniser 4 dépôts, et un changement qui touche le back et le front se retrouve éclaté en deux PR difficiles à relire ensemble.
2. **Un seul dépôt avec un dossier par programme** (*monorepo*). Un seul clone, un seul `docker compose up`, une PR peut modifier le back et le front d'un coup.

## Décision

Un seul dépôt, `RIZIWYX/DataFit`, avec un dossier par programme : `frontend/`, `backend/`, `analyse/`, `simulateur/`, `db/`, `docs/`.

## Conséquences

- Chaque dossier garde ses propres dépendances et son propre `Dockerfile` : on ne mélange pas le Python avec le Java.
- Vercel doit savoir que le front est dans `frontend/` (réglage *Root Directory*).
- Il faut des règles de branches claires, puisque tout le monde travaille au même endroit (voir [Contribution](../contribution.md)).
