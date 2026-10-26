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

`./lancer.sh` n'utilise jamais `sudo docker`. Si tu n'es pas encore dans le groupe `docker`, il t'y ajoute **au premier lancement** : ton mot de passe Ubuntu est demandé cette fois-là seulement, puis le script continue sans redémarrage. Les lancements suivants ne demandent plus rien.

Pour le faire à la main (même effet) :

```bash
sudo groupadd -f docker
sudo usermod -aG docker $USER
sudo snap disable docker && sudo snap enable docker   # si Docker est installé avec snap ; sinon : sudo service docker restart
```

Avec le Docker de snap, `snap restart` ne suffit pas : le snap garde une copie figée de `/etc/group` et ne voit le nouveau groupe qu'après `disable` / `enable` (ou un redémarrage de WSL : `wsl --shutdown` depuis Windows). Ensuite, ouvre un nouveau terminal pour que `docker` marche aussi en dehors du script. Ubuntu 26.04 n'a plus les commandes `sg` ni `newgrp`. Être dans ce groupe revient à avoir les droits administrateur sur Docker : c'est l'usage normal sur une machine de développement.

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

1. t'ajoute au groupe `docker` si ce n'est pas encore fait (une seule fois), pour utiliser Docker sans `sudo` ;
2. crée `.env` depuis `.env.example` s'il n'existe pas ;
3. arrête un éventuel ancien conteneur qui occuperait déjà le port 5433 (ses données sont gardées) ;
4. démarre la base, lui redonne le mot de passe de `.env` et crée les tables des fichiers `.sql` de `db/` qui manquent, dans l'ordre de leur numéro (rien n'est effacé) ;
5. reconstruit les images si le code a changé et lance le back et le site (`docker compose up --build`).

Pour arrêter : `Ctrl+C`, puis `docker compose down`.

`./lancer.sh --reinitialiser` supprime la base locale avant de tout relancer : elle est recréée vide, avec toutes les tables des fichiers de `db/`. Les comptes et profils de test sont effacés.

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
| `RESEND_API_KEY` | back | vide | clé Resend pour envoyer les mails ; vide = pas d'envoi, le lien s'affiche dans les logs du back |
| `MAIL_EXPEDITEUR` | back | `DataFit <onboarding@resend.dev>` | expéditeur des mails (entre guillemets dans `.env`) |
| `APP_URL` | back | `http://localhost:3000` | adresse du site, pour le lien des mails (`http://localhost:5173` avec Vite) |

Toute nouvelle variable doit être ajoutée **ici et dans `.env.example`**, avec une valeur d'exemple sans danger.

## Confirmation de l'adresse e-mail (Resend)

Un compte créé reste **inactif** tant que son adresse n'est pas confirmée : à l'inscription, le back envoie un mail avec un lien `APP_URL/verifier-email?jeton=…`, valable 24 heures et utilisable une seule fois. Tant que le lien n'a pas été ouvert, la connexion est refusée et la page de connexion propose de renvoyer le mail (un envoi par minute au plus). Les comptes créés avant cette fonctionnalité sont considérés comme confirmés.

Seule l'empreinte SHA-256 du jeton est enregistrée en base (colonnes `email_verifie_le`, `jeton_verification_hash`, `jeton_expire_le`, `verification_envoyee_le` de `utilisateur`) : si la base fuit, les liens ne sont pas utilisables.

**Sans clé Resend** (le cas par défaut), aucun mail ne part : le lien est écrit dans les logs du back. Avec Docker :

```bash
docker compose logs backend | grep verifier-email
```

**Pour envoyer de vrais mails :**

1. Crée un compte sur [resend.com](https://resend.com), puis une clé dans **API Keys** (elle n'est affichée qu'une fois).
2. Mets-la dans `.env` : `RESEND_API_KEY=re_…`, puis relance `./lancer.sh`.
3. Avec l'expéditeur par défaut `onboarding@resend.dev`, Resend n'envoie **qu'à l'adresse de ton compte Resend** (les autres sont refusées, l'erreur s'affiche dans les logs du back). Pour écrire à n'importe qui, ajoute ton domaine dans **Domains**, pose les enregistrements DNS demandés, puis mets une adresse de ce domaine dans `MAIL_EXPEDITEUR`.
4. Pour tester sans vraie boîte, Resend fournit des adresses de test : `delivered@resend.dev` (livré), `bounced@resend.dev` (rejeté), `complained@resend.dev` (signalé comme spam).

## Problèmes fréquents

**`port is already allocated`** : un autre programme utilise déjà le port (souvent un PostgreSQL installé sur la machine, ou un ancien conteneur). `docker ps` pour voir les conteneurs qui tournent, `docker compose down` pour les arrêter.

**Le back démarre puis s'arrête avec une erreur de connexion à la base** : la base n'est pas lancée, ou `DB_PASSWORD` / `DB_URL` sont faux. Avec Docker Compose, le back attend que la base soit prête (`healthcheck`) ; en local, vérifie le port 5433.

**`password authentication failed for user "datafit_user"`** : la base a un autre mot de passe que celui de `.env` (PostgreSQL ne le lit qu'à sa création). Relance `./lancer.sh` : il le remet d'accord avec `.env`.

**`permission denied while trying to connect to the docker API`** : voir [Utiliser Docker sans sudo](#utiliser-docker-sans-sudo).

**J'ai modifié un fichier de `db/` et rien n'a changé** : PostgreSQL ne les exécute qu'à la création de la base. `./lancer.sh` crée les **nouvelles** tables à chaque lancement, mais ne modifie pas une table qui existe déjà (ajout de colonne…) : pour ça, `./lancer.sh --reinitialiser`, ou une commande `ALTER TABLE`. Voir [Base de données](base-de-donnees.md#faire-évoluer-le-schéma).

**Après un `git pull`, le front ne compile plus** : `package.json` a sans doute changé. Relance `npm install` dans `frontend/`.

**Page blanche ou 404 en rafraîchissant `/dashboard` sur le site déployé** : l'hébergeur doit renvoyer `index.html` pour toutes les adresses (c'est le rôle de `vercel.json` et `nginx.conf`).

**Erreur CORS dans la console du navigateur** : le front appelle le back depuis une adresse non autorisée. Voir [CORS](glossaire.md#cors).

**`permission denied` sur `./mvnw`** : `chmod +x mvnw`.
