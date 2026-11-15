# Sécurité et données personnelles

DataFit manipule des comptes, des fréquences cardiaques et des positions GPS. Ce sont des données personnelles, et la fréquence cardiaque peut être considérée comme une **donnée de santé**, catégorie que le RGPD protège plus strictement. Ce document liste les règles à suivre.

## Secrets

Un **secret** est une information qui donne un accès : mot de passe de base, clé d'API, clé de signature des jetons.

- **Jamais dans le code ni dans Git.** Ils passent par des variables d'environnement, lues depuis un fichier `.env` en local (ignoré par Git) ou depuis les réglages de l'hébergeur en ligne.
- `.env.example` est commité, avec des valeurs factices, pour montrer quelles variables existent.
- Le dépôt étant **public**, tout ce qui est poussé est lisible par n'importe qui, **y compris dans l'historique**, même après suppression du fichier.

### Incident connu

Un ancien mot de passe de base de développement apparaît dans l'historique Git de `main`. Il ne doit plus être utilisé nulle part : changer tout mot de passe qui lui est identique. Réécrire l'historique pour l'effacer (`git filter-repo`) est possible mais oblige toute l'équipe à re-cloner ; changer le mot de passe suffit.

### Si un secret est poussé par erreur

1. Considérer le secret comme **compromis** : le changer immédiatement là où il est utilisé.
2. Le retirer du code et le passer en variable d'environnement.
3. Prévenir l'équipe.

Supprimer le fichier dans un nouveau commit ne suffit pas : le secret reste dans l'historique.

## Mots de passe

- Stockés sous forme d'**empreinte** (*hash*), jamais en clair ni chiffrés de façon réversible. Une empreinte se calcule facilement à partir du mot de passe, mais on ne peut pas retrouver le mot de passe à partir d'elle. À la connexion, on recalcule l'empreinte du mot de passe saisi et on compare.
- Algorithme : **BCrypt** (`BCryptPasswordEncoder`, déclaré dans `config/PasswordConfig.java`). Ces algorithmes sont volontairement lents et ajoutent un *sel* (valeur aléatoire propre à chaque compte) : deux utilisateurs avec le même mot de passe ont des empreintes différentes, et tester des millions de mots de passe devient très coûteux. **Jamais** MD5 ni SHA-256 seuls, beaucoup trop rapides.
- La colonne `mot_de_passe` (`VARCHAR(255)`) a la taille qu'il faut pour une empreinte BCrypt (60 caractères).
- Message d'erreur identique pour "e-mail inconnu" et "mauvais mot de passe", pour ne pas révéler quelles adresses ont un compte.
- **Aucun mail n'est envoyé** : l'adresse n'est pas confirmée à l'inscription (le compte marche tout de suite) et il n'y a pas de réinitialisation du mot de passe. Un mot de passe perdu ne se récupère pas depuis le site.

## Authentification

Le serveur sait **qui appelle** grâce à une **session** (corrigé le 15 novembre 2026, voir [audit-securite.md](audit-securite.md)) :

1. à la connexion, à l'inscription ou avec Google, le backend tire un jeton aléatoire de 256 bits, le donne au navigateur dans un cookie `datafit_session` (`HttpOnly`, `SameSite=Lax`, `Secure` en ligne) et ne garde en base (`session_utilisateur`) que son **empreinte SHA-256** ;
2. le navigateur renvoie ce cookie à chaque appel `/api/...`, sans que le JavaScript du site n'y touche ;
3. `securite/AuthInterceptor` s'exécute avant tous les contrôleurs : pas de session valide, **401** ; une adresse avec `{utilisateurId}` qui n'est pas celui du compte connecté, **403** ;
4. `POST /api/auth/logout` ferme la session et efface le cookie. Une session dure 7 jours.

Le numéro de compte reste dans l'adresse (`/api/sommeil/{utilisateurId}`) mais il est **vérifié**, jamais cru. Pour une nouvelle route : si elle contient `{utilisateurId}`, elle est protégée sans rien faire ; sinon (numéro dans le corps de la requête, par exemple), lire le compte connecté avec `@RequestAttribute(AuthInterceptor.ATTRIBUT_UTILISATEUR)` et le comparer. Une route publique doit être ajoutée **exprès** à la liste de `AuthInterceptor` : par défaut tout est protégé.

Le front ne voit jamais le jeton. Quand une session expire, l'API répond 401 et `lib/session.ts` renvoie vers la page de connexion. Pas de jeton anti-CSRF : la protection repose sur `SameSite=Lax`, le JSON et CORS (voir l'audit).

## Limites d'essais

`AuthInterceptor` limite par adresse IP la connexion, l'inscription, Google et le contact ; `ConnexionController` bloque 15 minutes une adresse e-mail après 5 échecs. nginx a ses propres limites devant (`frontend/nginx.conf`). Détail des seuils dans l'audit. Les compteurs sont en mémoire (`LimiteurTentatives`).

## CORS

La configuration est globale, dans `config/CorsConfig.java`. Les sites autorisés viennent de la variable `CORS_ORIGINS` (séparés par des virgules ; par défaut `localhost:3000`, `localhost:5173` et le site en ligne). En développement, Vite transmet les appels au back, donc pas besoin de CORS. Pour un autre domaine, changer la variable, pas le code. Ne jamais mettre `*` sur une API qui gère des comptes.

## Autres règles

- **HTTPS partout** en ligne : sans lui, mots de passe et données circulent en clair. Mettre `SESSION_COOKIE_SECURISE=true` dès que le site est en HTTPS.
- **En-têtes de sécurité** (CSP, `X-Frame-Options`...) : dans `frontend/nginx.conf` (Docker, Kubernetes) et `frontend/vercel.json` (en ligne). Toute nouvelle ressource externe (script, image, police) doit être ajoutée aux **deux** CSP.
- **Services internes** : base, backend et services Python ne sont publiés que sur `127.0.0.1`, et tournent sans root. Swagger des services Python éteint (`DOCS_ACTIVES=1` pour le rallumer).
- **Valider toutes les entrées côté back** (annotations `@Valid`, `@Email`, `@NotBlank`...). La validation du front sert le confort de l'utilisateur ; seule celle du back protège.
- **Requêtes SQL paramétrées** uniquement (ce que fait JPA par défaut). Jamais de requête construite en collant du texte saisi par l'utilisateur : c'est la porte ouverte à l'injection SQL.
- **Dépendances à jour** : *Dependabot* est configuré (`.github/dependabot.yml`) et la CI lance `npm audit`. Les versions Python sont figées dans `requirements.txt` : les mettre à jour par les PR de Dependabot, pas à la main.
- **Logs** : ne jamais y écrire de mot de passe, de jeton ni de données de santé. `spring.jpa.show-sql` est éteint par défaut (`JPA_SHOW_SQL=true` pour déboguer, jamais en production).
- **Mot de passe** : 72 octets au plus (BCrypt ignore le reste) ; les adresses e-mail sont enregistrées en minuscules.

## Données personnelles (RGPD)

Le RGPD s'applique dès qu'on traite des données sur des personnes identifiables. Principes à respecter dans la conception :

- **Minimisation** : ne collecter que ce qui sert. Les mesures brutes de la montre (dont la position) ne sont pas conservées : seuls les indicateurs calculés le sont.
- **Consentement** : l'acceptation des CGU est datée dans `utilisateur.cgu_acceptees_le`.
- **Information** : la page `/donnees-personnelles` explique ce qui est collecté, pourquoi, combien de temps et comment l'effacer. Elle doit rester fidèle à ce que fait réellement le code.
- **Droit d'accès et d'effacement** : toutes les tables sont liées au compte par `ON DELETE CASCADE`, donc supprimer un compte supprime toutes ses données. La suppression du compte et l'effacement par catégorie existent (page Profil) ; l'endpoint d'export reste à écrire 🚧.
- **Données de test** : utiliser le simulateur, pas les vraies données d'un membre de l'équipe dans le dépôt.

