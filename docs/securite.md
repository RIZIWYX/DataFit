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

**État actuel, à corriger en priorité.** La connexion renvoie l'identifiant de l'utilisateur, que le front garde dans le navigateur (`localStorage`) et place dans l'adresse des appels suivants (`/api/sommeil/{utilisateurId}`). Le serveur ne vérifie pas que la personne qui appelle est bien ce compte : en changeant le nombre dans l'adresse, on peut lire ou modifier les données d'un autre utilisateur.

C'est une faille de type BOLA/IDOR (OWASP API Security n°1), à corriger avant toute mise en ligne avec de vrais comptes.

Pistes pour corriger :

| Approche | Principe | Pour DataFit |
|---|---|---|
| **Session + cookie** | le serveur garde la liste des personnes connectées ; le navigateur renvoie un cookie à chaque requête | simple et sûr pour le site web ; le cookie doit être `HttpOnly`, `Secure`, `SameSite` |
| **Jeton JWT** | le serveur remet un jeton signé que le client renvoie dans l'en-tête `Authorization` | pratique pour l'application de bureau et la montre ; plus délicat à révoquer |

Dans les deux cas, l'identifiant ne vient plus de l'adresse mais de la session ou du jeton, et chaque endpoint ne travaille que sur les données de l'utilisateur connecté.

## CORS

La configuration est globale, dans `config/CorsConfig.java`, et n'autorise que `http://localhost:3000`. En développement, Vite transmet les appels au back, donc pas besoin de CORS. En production, remplacer par l'adresse réelle du front. Ne jamais mettre `*` sur une API qui gère des comptes.

## Autres règles

- **HTTPS partout** en ligne : sans lui, mots de passe et données circulent en clair.
- **Valider toutes les entrées côté back** (annotations `@Valid`, `@Email`, `@NotBlank`...). La validation du front sert le confort de l'utilisateur ; seule celle du back protège.
- **Requêtes SQL paramétrées** uniquement (ce que fait JPA par défaut). Jamais de requête construite en collant du texte saisi par l'utilisateur : c'est la porte ouverte à l'injection SQL.
- **Dépendances à jour** : activer *Dependabot* sur GitHub, qui ouvre des PR quand une bibliothèque a une faille connue.
- **Logs** : ne jamais y écrire de mot de passe, de jeton ni de données de santé. `spring.jpa.show-sql=true` est pratique en développement mais doit être désactivé en production.

## Données personnelles (RGPD)

Le RGPD s'applique dès qu'on traite des données sur des personnes identifiables. Principes à respecter dans la conception :

- **Minimisation** : ne collecter que ce qui sert. Les mesures brutes de la montre (dont la position) ne sont pas conservées : seuls les indicateurs calculés le sont.
- **Consentement** : l'acceptation des CGU est datée dans `utilisateur.cgu_acceptees_le`.
- **Information** : la page `/donnees-personnelles` explique ce qui est collecté, pourquoi, combien de temps et comment l'effacer. Elle doit rester fidèle à ce que fait réellement le code.
- **Droit d'accès et d'effacement** : toutes les tables sont liées au compte par `ON DELETE CASCADE`, donc supprimer un compte supprime toutes ses données. Les endpoints d'export et de suppression de compte restent à écrire 🚧.
- **Données de test** : utiliser le simulateur, pas les vraies données d'un membre de l'équipe dans le dépôt.

