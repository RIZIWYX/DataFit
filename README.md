# DataFit

Application de suivi sportif. DataFit récupère les séances d'une montre connectée (fréquence cardiaque, vitesse, position), les range par sport (course, natation, musculation) et montre au sportif ses progrès : performances, rangs E → Z par exercice, programmation des séances dans un calendrier, sommeil.

## Le dépôt

| Dossier | Contenu |
|---|---|
| `frontend/` | le site : React, TypeScript, Vite |
| `backend/` | l'API : Java 21, Spring Boot |
| `db/` | le script qui crée les tables PostgreSQL au premier démarrage |
| `analyse/` | le service d'analyse en Python 🚧 prévu |
| `simulateur/` | le simulateur de montre 🚧 prévu |
| `SD/` | les carnets Jupyter de l'équipe sciences des données |
| `docs/` | la documentation technique |

## Lancer le projet

Tout d'un coup, avec Docker :

```bash
cp .env.example .env    # puis remplacer « change-moi » par un mot de passe
docker compose up --build
```

Le site est sur http://localhost:3000.

Le site seul, pour développer :

```bash
cd frontend
npm install
npm run dev
```

Le site est sur http://localhost:5173, rechargé à chaque sauvegarde.

## Pour aller plus loin

- [Documentation technique](docs/README.md) : architecture, API, base de données, contribution.
- [Guide de développement](docs/developpement.md) : installation détaillée et problèmes fréquents.
- [Charte graphique](docs/charte-graphique.md) : couleurs, typographie et composants du site.
