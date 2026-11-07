# DataFit

[![CI](https://github.com/RIZIWYX/DataFit/actions/workflows/ci.yml/badge.svg)](https://github.com/RIZIWYX/DataFit/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Java%2021-6DB33F)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-green)](LICENSE)

Application de suivi sportif. DataFit récupère les séances d'une montre connectée (fréquence cardiaque, vitesse, position), les range par sport (course, natation, musculation) et montre au sportif ses progrès : performances, rangs E → Z par exercice, programmation des séances dans un calendrier, sommeil.

## Architecture

```
Navigateur ──> frontend (React, nginx :3000) ──/api──> backend (Spring Boot :8080) ──> PostgreSQL
                                                            │
                                                            ├──> simulateur (FastAPI :8000)
                                                            └──> analyse (FastAPI :8001)
```

Projet d'équipe de 5 étudiants (informatique et sciences des données).

## Le dépôt

| Dossier | Contenu |
|---|---|
| `frontend/` | le site : React, TypeScript, Vite |
| `backend/` | l'API : Java 21, Spring Boot |
| `db/` | le script qui crée les tables PostgreSQL au premier démarrage |
| `analyse/` | le service d'analyse des séances (Python, FastAPI) |
| `simulateur/` | le simulateur de montre connectée (Python, FastAPI) |
| `analyse/notebooks/` | les carnets Jupyter de l'équipe sciences des données |
| `docs/` | la documentation technique |

## Lancer le projet

Tout d'un coup (la base, le backend et le site), avec Docker :

```bash
./lancer.sh
```

Le site est sur http://localhost:3000. Le script s'occupe du reste :

- il crée `.env` s'il n'existe pas encore : c'est lui qui donne le mot de passe de la base, à Docker comme au backend ;
- Docker s'utilise sans `sudo` : au tout premier lancement, si besoin, le script t'ajoute au groupe `docker` (ton mot de passe Ubuntu est demandé cette fois-là seulement) ;
- à chaque lancement, il redonne à la base le mot de passe de `.env` et crée les tables des fichiers `.sql` de `db/` qui manqueraient, sans rien effacer.

Pour repartir d'une base vide (comptes de test effacés) : `./lancer.sh --reinitialiser`.

Le site seul, pour développer :

```bash
cd frontend
npm install
npm run dev
```

Le site est sur http://localhost:5173, rechargé à chaque sauvegarde. Ses appels `/api/...` sont transmis au backend sur le port 8080.

## Pour aller plus loin

- [Documentation technique](docs/README.md) : architecture, API, base de données, contribution.
- [Guide de développement](docs/developpement.md) : installation détaillée et problèmes fréquents.
- [Charte graphique](docs/charte-graphique.md) : couleurs, typographie et composants du site.

## Licence

[MIT](LICENSE) © Rayane Graïne et l'équipe DataFit
