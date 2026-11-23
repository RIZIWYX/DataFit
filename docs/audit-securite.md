# Audit de sécurité

Audit réalisé le **15 novembre 2026** (issue #59) sur le code de `main` (jusqu'à la PR #56), puis corrections (issues #60, #61 et #63). Il reprend et met à jour le constat du 3 novembre 2026, établi avant la suppression de compte et l'effacement des données.

**Méthode.** Lecture du code (backend, front, Python, `docker-compose.yml`, nginx, CI), puis vérification en vrai : la pile complète a été lancée dans un projet Docker jetable (base neuve, supprimée ensuite) et attaquée avec `curl`. Ce n'est **pas** un test d'intrusion : aucun scanner automatique (OWASP ZAP, Trivy...) n'a été utilisé, et les services en ligne (Vercel, Render, Neon, Stripe) n'ont pas été testés.

## Résultat

| # | Gravité | Constat | État |
|---|---|---|---|
| 1 | **Critique** | L'API ne vérifie pas qui l'appelle : changer le numéro dans l'adresse donne accès aux données d'un autre compte (IDOR / BOLA) | **Corrigé** |
| 2 | Élevé | Base, backend et services Python ouverts sur toutes les interfaces réseau | **Corrigé** (Docker) |
| 3 | Élevé | Aucune limite d'essais (connexion, inscription, contact) | **Corrigé** |
| 4 | Moyen | Pas d'en-têtes de sécurité HTTP, version de nginx affichée | **Corrigé** |
| 5 | Moyen | Le backend se connecte avec le super-utilisateur de la base | **Corrigé** |
| 6 | Moyen | Conteneurs en root, dépendances Python non figées, Swagger actif | **Corrigé** |
| 7 | Moyen | RGPD : pas de suppression de compte, pas de consentement santé, données en clair dans le navigateur | **En partie** (consentement et profil faits, voir le détail) |
| 8 | Faible | E-mails sensibles à la casse, 72 octets BCrypt, SQL dans les logs, pas d'audit des dépendances | **Corrigé** |
| 9 | À prévoir | Pas de HTTPS, origine CORS écrite en dur | **En partie** |

## Détail

### 1. Authentification et contrôle d'accès : corrigé

**Avant.** La connexion renvoyait le numéro du compte, le front le gardait dans le `localStorage` et le plaçait dans chaque adresse (`/api/sommeil/{utilisateurId}`). Le serveur croyait ce numéro. Les numéros se suivent (1, 2, 3...), donc n'importe qui, même sans compte, pouvait lire, modifier ou supprimer les données de santé d'un autre.

**Maintenant.** La connexion, l'inscription et « Continuer avec Google » ouvrent une **session** : un jeton aléatoire de 256 bits, donné au navigateur dans un cookie `HttpOnly` (illisible par le JavaScript, donc par une faille XSS), `SameSite=Lax`, et `Secure` en ligne. La base ne garde que l'empreinte SHA-256 du jeton (table `session_utilisateur`) : une fuite de la base ne donne aucun jeton utilisable. Une session dure 7 jours, se ferme à la déconnexion et disparaît avec le compte.

`AuthInterceptor` s'exécute avant tous les contrôleurs de `/api/**` :
- route publique (connexion, inscription, Google, contact, déconnexion, webhook Stripe) : passe ;
- sinon, pas de session valide : **401** ;
- sinon, si l'adresse contient `{utilisateurId}` et que ce n'est pas le compte connecté : **403** ;
- la création du profil (qui prend le numéro dans le corps de la requête) est vérifiée dans `ProfilController`.

Vérifié en vrai avec deux comptes : sans cookie 401, jeton falsifié 401, jeton fermé 401, lire / écrire / supprimer / lire le profil / créer le profil d'un autre compte 403, ses propres données 200.

### 2. Services exposés : corrigé pour Docker

`docker-compose.yml` publie la base (5433), le backend (8080) et les services Python (8000, 8001) sur `127.0.0.1` : joignables depuis la machine, plus depuis le réseau. Seul le site (3000) reste public. Les conteneurs continuent de se parler par le réseau interne de Docker. Vérifié avec `ss -ltn`. Pour Kubernetes, des `NetworkPolicy` n'autorisent que les chemins nécessaires (`k8s/network-policies.yaml`, voir [kubernetes.md](kubernetes.md)).

### 3. Limites d'essais : corrigé

Trois niveaux :
- **nginx** : 10 requêtes par minute et par adresse IP (rafale de 5) sur connexion, inscription et Google ; 5 par minute sur le contact ;
- **backend, par IP** (`AuthInterceptor`) : 30 connexions / 15 min, 10 inscriptions / heure, 5 messages de contact / heure ;
- **backend, par adresse e-mail** : après 5 échecs de connexion, blocage de 15 minutes, même en changeant d'IP ou de casse (vérifié : 5 réponses 400 puis 429).

Compteurs en mémoire : ils repartent à zéro au redémarrage du backend.

### 4. En-têtes de sécurité : corrigé

nginx (`frontend/nginx.conf`) et Vercel (`frontend/vercel.json`) envoient une `Content-Security-Policy` (le site ne charge que ses fichiers et le bouton Google), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` et `Permissions-Policy` ; Vercel ajoute `Strict-Transport-Security`. nginx n'affiche plus sa version.

La CSP a été vérifiée dans un navigateur (servie par nginx, compte créé par l'interface) : inscription, création du profil, synchronisation de la montre, les 13 pages du site, séance et graphiques, rechargement complet d'une page. Aucune violation, aucun appel refusé. Le bouton « Continuer avec Google » a aussi été testé avec un identifiant client factice : le script et la fenêtre de Google se chargent sans violation (la connexion Google elle-même n'a pas été testée, il faudrait un vrai compte Google). Si une page se comporte mal plus tard, la console du navigateur (« Refused to ... because it violates the Content Security Policy ») indique quoi autoriser.

### 5. Super-utilisateur de la base : corrigé

**Avant.** Le backend utilisait `POSTGRES_USER`, qui peut supprimer des tables et créer des rôles : une injection SQL ou une faille du backend aurait eu tous les droits.

**Maintenant.** Le backend se connecte avec un rôle à part, `datafit_app`, qui n'a que `SELECT`, `INSERT`, `UPDATE` et `DELETE` sur les tables (et le droit de faire avancer les séquences). Il ne peut ni créer, ni modifier, ni supprimer une table, ni créer de rôle. Les tables restent créées par le propriétaire de la base.

Le rôle est décrit dans `db/roles/role_application.sql` (rejouable) et créé partout :
- **en local** : `lancer.sh` ajoute `DB_APP_USER` et `DB_APP_PASSWORD` à `.env` la première fois, crée le rôle après les tables et `docker-compose.yml` donne ce rôle au backend ;
- **CI** : le rôle est créé après les tables et les tests tournent avec lui (un droit manquant fait échouer la CI) ;
- **Neon** : le workflow « Base Neon » crée le rôle si le secret `NEON_APP_PASSWORD` existe ; Render utilise `DB_USER=datafit_app` ;
- **Kubernetes** : le Job `db-migrations` crée le rôle, le backend lit `DB_APP_USER` / `DB_APP_PASSWORD` du secret.

`ALTER DEFAULT PRIVILEGES` donne automatiquement les mêmes droits aux tables ajoutées plus tard dans `db/`.

### 6. Conteneurs et services Python : corrigé

- Backend et services Python tournent avec un utilisateur sans droits (uid 10001), plus en root. Le volume des mesures est remis à cet utilisateur par un service `permissions-mesures` (un volume existant appartient encore à root).
- `requirements.txt` des deux services : versions figées (celles qui tournent aujourd'hui).
- Swagger (`/docs`, `/openapi.json`) éteint par défaut, activable avec `DOCS_ACTIVES=1`. Le healthcheck passe par une route `/sante`.
- Dependabot (`.github/dependabot.yml`) propose chaque semaine les mises à jour Maven, npm, pip, Docker et GitHub Actions.

### 7. RGPD : en partie

Fait depuis l'audit du 3 novembre : suppression du compte et effacement des données par catégorie (PR #51 et #52). Fait ensuite pour l'issue #61 :
- **consentement propre aux données de santé** : case distincte et jamais cochée d'avance à l'inscription, date enregistrée (`utilisateur.sante_acceptee_le`), vérifiée par le backend. Les comptes anciens et ceux créés avec Google le donnent sur un écran dédié avant d'ouvrir l'application ;
- le **profil** gardé dans le navigateur n'est plus qu'une copie : le serveur fait foi (rechargé à chaque connexion) et la copie est effacée à la déconnexion. Cela corrige aussi un défaut : se connecter depuis un navigateur neuf renvoyait vers la création du profil.

Reste :
- le **journal nutrition, l'historique des records, les rangs et les notes de séance** restent dans le `localStorage` après la déconnexion, car une partie n'existe que là (notes, historique des records, objectif du journal). Inventaire complet dans [securite.md](securite.md#données-gardées-dans-le-navigateur). La vraie correction est de les ranger sur le serveur ; les chiffrer dans le navigateur n'apporterait rien (la clé y serait aussi) ;
- pas d'export des données (droit d'accès / portabilité) ;
- pas de bouton « retirer mon consentement » à part : le retrait passe par « Effacer mes données » ou « Supprimer mon compte ».

### 8. Détails : corrigé

- Les adresses e-mail sont mises en minuscules à l'inscription et la connexion les compare sans tenir compte de la casse (les anciens comptes restent joignables). Vérifié : `Alice@Test.fr` puis `alice@test.fr` donne « déjà utilisée ».
- La limite du mot de passe est maintenant aussi comptée en **octets** (72 au plus, BCrypt ignore le reste).
- `spring.jpa.show-sql` est éteint par défaut (`JPA_SHOW_SQL=true` pour déboguer) : plus aucune requête SQL dans les logs, vérifié.
- La CI lance `npm audit` (échoue sur une faille haute ou critique : 0 aujourd'hui).

### 9. Mise en ligne : en partie

- L'origine CORS est maintenant une variable d'environnement (`CORS_ORIGINS`) et le cookie `Secure` s'active avec `SESSION_COOKIE_SECURISE=true`. **À régler sur Render** : `SESSION_COOKIE_SECURISE=true`.
- nginx écoute toujours en HTTP : le HTTPS doit venir de l'hébergeur (Vercel le fait déjà) ou de l'Ingress Kubernetes (exemple dans `k8s/ingress.yaml`).

## Nouveaux points à connaître

Ces limites viennent des corrections elles-mêmes :

- **Pas de jeton anti-CSRF.** La protection repose sur `SameSite=Lax` (le cookie n'est pas envoyé quand un autre site déclenche un POST), sur les requêtes JSON et sur CORS restreint. C'est suffisant ici ; si l'API accepte un jour des formulaires classiques, ajouter un jeton.
- **Blocage par adresse e-mail** : quelqu'un peut empêcher un compte de se connecter pendant 15 minutes en saisissant exprès 5 mauvais mots de passe. Compromis assumé : l'autre choix laisserait deviner les mots de passe.
- **Les comptes ouverts avant ce changement** n'ont pas de session : ils sont renvoyés vers la page de connexion (une fois), puis tout fonctionne.
- Pas de « se déconnecter partout » ni de renouvellement de session : une session vaut 7 jours.
- Le mot de passe est toujours redemandé pour supprimer le compte ou effacer des données (en plus de la session).

## Points sans problème

- Mots de passe hachés en BCrypt, même message pour « adresse inconnue » et « mauvais mot de passe ».
- Requêtes SQL paramétrées (JPA et `JdbcTemplate` avec `?`) ; le seul nom de table construit dans une requête (`CompteService`) vient d'une liste fixe, jamais de la requête.
- Mesures de la montre : les noms de fichiers sont fabriqués avec des nombres et une liste fixe de sports : pas de traversée de dossiers.
- Webhook Stripe : la signature est vérifiée.
- Connexion Google : le jeton est vérifié par Google, son destinataire (`aud`) et l'adresse vérifiée sont contrôlés.
- `npm audit` : 0 faille.

## Rappel : mot de passe d'un ancien commit

Un ancien mot de passe de base de développement figure dans l'historique de `main` (voir [securite.md](securite.md)). S'il est encore utilisé quelque part (Neon, Render), le changer.
