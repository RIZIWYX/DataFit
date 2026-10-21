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

Tout d'un coup (la base, le backend et le site), avec Docker :

```bash
./lancer.sh
```

Le site est sur http://localhost:3000. Le script s'occupe du reste :

- il crée `.env` s'il n'existe pas encore : c'est lui qui donne le mot de passe de la base, à Docker comme au backend ;
- si Docker demande les droits administrateur, il passe par `sudo` (ton mot de passe Ubuntu est demandé une fois) ;
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
