# Guide de développement

Comment installer, lancer et configurer DataFit sur ta machine.

## Prérequis

| Outil | Version | Pour quoi | Obligatoire ? |
|---|---|---|---|
| Git | récente | récupérer le code | oui |
| Docker + Docker Compose | récente | tout lancer d'un coup | oui |
| Node.js | 22 | développer le front sans Docker | pour le front |
| Java (JDK) | 21 | développer le back sans Docker | pour le back |
| Python | 3.12 ou plus | service d'analyse, simulateur | pour l'équipe SD |

Sous Windows, travaille dans **WSL** (le sous-système Linux de Windows) et clone le dépôt dans ton dossier Linux (`~/...`), pas dans `/mnt/c/...` : les accès disque y sont beaucoup plus lents et `npm` peut s'y comporter bizarrement.

Pas besoin d'installer Maven : le dépôt contient `mvnw`, un script qui télécharge la bonne version tout seul.

## Première installation

```bash
git clone git@github.com:RIZIWYX/DataFit.git
cd DataFit
cp .env.example .env
```

Ouvre `.env` et remplace `change-moi` par un mot de passe à toi. Ce fichier n'est jamais commité (il est dans `.gitignore`).

## Lancer tout le projet (Docker)

```bash
docker compose up --build
```

| Service | Adresse sur ta machine |
|---|---|
| Site (front servi par nginx) | http://localhost:3000 |
| Backend | http://localhost:8080/api/hello |
| Base PostgreSQL | `localhost:5433` |

`--build` reconstruit les images si le code a changé. Pour arrêter : `Ctrl+C`, puis `docker compose down`.

C'est le mode à utiliser pour **vérifier que tout marche ensemble** avant d'ouvrir une PR. Pour coder au quotidien, le mode suivant est plus rapide.

## Développer une seule partie

### Front

```bash
cd frontend
npm install        # la première fois, ou quand package.json a changé
npm run dev
```

Site sur http://localhost:5173, rechargé à chaque sauvegarde.

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | vérifie les types TypeScript puis construit le site dans `dist/` |
| `npm run lint` | contrôle de qualité du code (oxlint) |
| `npm run preview` | sert le contenu de `dist/`, pour tester la version finale |

### Back

Le back a besoin d'une base. Le plus simple : ne lancer **que** la base avec Docker, et le back sur ta machine.

```bash
docker compose up -d db          # -d : en arrière-plan
cd backend
export DB_URL=jdbc:postgresql://localhost:5433/datafit
export DB_USER=datafit_user
export DB_PASSWORD=le-mot-de-passe-de-ton-.env
./mvnw spring-boot:run
```

Attention au port : Docker publie la base sur **5433**, alors que la valeur par défaut de `application.properties` est 5432. D'où le `DB_URL` ci-dessus.

Dans IntelliJ ou VS Code, mets ces trois variables dans la configuration de lancement plutôt que de les retaper.

### Service d'analyse 🚧

Commandes à compléter par l'équipe SD une fois le service écrit. Base recommandée :

```bash
cd analyse
python -m venv .venv             # environnement isolé pour ce projet
source .venv/bin/activate
pip install -r requirements.txt
```

Un **environnement virtuel** (`.venv`) garde les bibliothèques du projet séparées de celles du système : deux projets peuvent ainsi utiliser deux versions différentes de pandas. Ajouter `.venv/` au `.gitignore`.

## Variables d'environnement

| Variable | Utilisée par | Défaut | Rôle |
|---|---|---|---|
| `DB_USER` | base, back | `datafit_user` (back) | utilisateur PostgreSQL |
| `DB_PASSWORD` | base, back | **aucun**, obligatoire | mot de passe PostgreSQL |
| `DB_URL` | back | `jdbc:postgresql://localhost:5432/datafit` | adresse de la base |

Toute nouvelle variable doit être ajoutée **ici et dans `.env.example`**, avec une valeur d'exemple sans danger.

## Problèmes fréquents

**`port is already allocated`** : un autre programme utilise déjà le port (souvent un PostgreSQL installé sur la machine, ou un ancien conteneur). `docker ps` pour voir les conteneurs qui tournent, `docker compose down` pour les arrêter.

**Le back démarre puis s'arrête avec une erreur de connexion à la base** : la base n'est pas lancée, ou `DB_PASSWORD` / `DB_URL` sont faux. Avec Docker Compose, le back attend que la base soit prête (`healthcheck`) ; en local, vérifie le port 5433.

**J'ai modifié `db/init.sql` et rien n'a changé** : normal, il ne s'exécute qu'à la création de la base. Voir [Base de données](base-de-donnees.md#faire-évoluer-le-schéma).

**Après un `git pull`, le front ne compile plus** : `package.json` a sans doute changé. Relance `npm install` dans `frontend/`.

**Page blanche ou 404 en rafraîchissant `/dashboard` sur le site déployé** : l'hébergeur doit renvoyer `index.html` pour toutes les adresses (c'est le rôle de `vercel.json` et `nginx.conf`).

**Erreur CORS dans la console du navigateur** : le front appelle le back depuis une adresse non autorisée. Voir [CORS](glossaire.md#cors).

**`permission denied` sur `./mvnw`** : `chmod +x mvnw`.
