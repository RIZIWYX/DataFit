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
```

C'est tout : au premier lancement, `./lancer.sh` crée `.env` à partir de `.env.example`. Ce fichier n'est jamais commité (il est dans `.gitignore`). Le mot de passe d'exemple suffit pour travailler en local, et tu peux le changer quand tu veux : au lancement suivant, le script le redonne à la base.

`.env` est la seule source du mot de passe : Docker Compose le lit pour créer la base et lancer le back, et le back lancé hors Docker le lit aussi (`spring.config.import` dans `application.properties`).

### Utiliser Docker sans sudo

Si Docker demande les droits administrateur, `./lancer.sh` passe par `sudo` et te demande ton mot de passe Ubuntu. Pour ne plus avoir à le taper, ajoute-toi une fois pour toutes au groupe `docker` :

```bash
sudo groupadd -f docker
sudo usermod -aG docker $USER
sudo snap restart docker   # si Docker est installé avec snap ; sinon : sudo service docker restart
```

Puis ferme et rouvre ton terminal (sous WSL : `wsl --shutdown` depuis Windows, puis rouvre Ubuntu). Être dans ce groupe revient à avoir les droits administrateur sur Docker : c'est l'usage normal sur une machine de développement.

## Lancer tout le projet (Docker)

```bash
./lancer.sh
```

| Service | Adresse sur ta machine |
|---|---|
| Site (front servi par nginx) | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Base PostgreSQL | `localhost:5433` |

Ce que fait le script, dans l'ordre :

1. crée `.env` depuis `.env.example` s'il n'existe pas ;
2. passe par `sudo` si Docker l'exige ;
3. arrête un éventuel ancien conteneur qui occuperait déjà le port 5433 (ses données sont gardées) ;
4. démarre la base, lui redonne le mot de passe de `.env` et crée les tables de `db/init.sql` qui manquent (rien n'est effacé) ;
5. reconstruit les images si le code a changé et lance le back et le site (`docker compose up --build`).

Pour arrêter : `Ctrl+C`, puis `docker compose down`.

`./lancer.sh --reinitialiser` supprime la base locale avant de tout relancer : elle est recréée vide, avec toutes les tables de `db/init.sql`. Les comptes et profils de test sont effacés.

C'est le mode à utiliser pour **vérifier que tout marche ensemble** avant d'ouvrir une PR. Pour coder au quotidien, le mode suivant est plus rapide.

## Développer une seule partie

### Front

```bash
cd frontend
npm install        # la première fois, ou quand package.json a changé
npm run dev
```

Site sur http://localhost:5173, rechargé à chaque sauvegarde. Les appels `/api/...` sont transmis au back sur le port 8080 (`server.proxy` dans `vite.config.ts`, le même rôle que nginx dans Docker) : lance aussi le back pour tout ce qui touche aux comptes.

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
./mvnw spring-boot:run
```

Rien à exporter : le back lit le `.env` du projet, et son adresse de base par défaut est déjà `localhost:5433`, le port publié par Docker. Lance-le depuis le dossier `backend/` (y compris dans IntelliJ ou VS Code) : c'est de là qu'il cherche `../.env`.

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
| `DB_URL` | back | `jdbc:postgresql://localhost:5433/datafit` | adresse de la base |

Toute nouvelle variable doit être ajoutée **ici et dans `.env.example`**, avec une valeur d'exemple sans danger.

## Problèmes fréquents

**`port is already allocated`** : un autre programme utilise déjà le port (souvent un PostgreSQL installé sur la machine, ou un ancien conteneur). `docker ps` pour voir les conteneurs qui tournent, `docker compose down` pour les arrêter.

**Le back démarre puis s'arrête avec une erreur de connexion à la base** : la base n'est pas lancée, ou `DB_PASSWORD` / `DB_URL` sont faux. Avec Docker Compose, le back attend que la base soit prête (`healthcheck`) ; en local, vérifie le port 5433.

**`password authentication failed for user "datafit_user"`** : la base a un autre mot de passe que celui de `.env` (PostgreSQL ne le lit qu'à sa création). Relance `./lancer.sh` : il le remet d'accord avec `.env`.

**`permission denied while trying to connect to the docker API`** : voir [Utiliser Docker sans sudo](#utiliser-docker-sans-sudo).

**J'ai modifié `db/init.sql` et rien n'a changé** : PostgreSQL ne l'exécute qu'à la création de la base. `./lancer.sh` crée les **nouvelles** tables à chaque lancement, mais ne modifie pas une table qui existe déjà (ajout de colonne…) : pour ça, `./lancer.sh --reinitialiser`, ou une commande `ALTER TABLE`. Voir [Base de données](base-de-donnees.md#faire-évoluer-le-schéma).

**Après un `git pull`, le front ne compile plus** : `package.json` a sans doute changé. Relance `npm install` dans `frontend/`.

**Page blanche ou 404 en rafraîchissant `/dashboard` sur le site déployé** : l'hébergeur doit renvoyer `index.html` pour toutes les adresses (c'est le rôle de `vercel.json` et `nginx.conf`).

**Erreur CORS dans la console du navigateur** : le front appelle le back depuis une adresse non autorisée. Voir [CORS](glossaire.md#cors).

**`permission denied` sur `./mvnw`** : `chmod +x mvnw`.
