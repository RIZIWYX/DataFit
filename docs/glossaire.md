# Glossaire

Les termes techniques employés dans la documentation, par ordre alphabétique.

### ADR
*Architecture Decision Record.* Fiche courte qui note une décision technique, son contexte et ses conséquences. Voir [adr/](adr/).

### API
Ensemble des « portes » qu'un programme ouvre à d'autres programmes. Pour un back web, ce sont des adresses HTTP. Voir [API](api.md).

### C4
Méthode pour décrire une architecture logicielle en quatre niveaux de zoom : *Contexte* (le système et son entourage), *Conteneurs* (les programmes qui le composent), *Composants* (l'intérieur d'un programme), *Code*.

### CI (intégration continue)
Vérification automatique de chaque modification (compilation, lint, tests) par un serveur, avant qu'elle soit fusionnée.

### Clé primaire / clé étrangère
La clé primaire identifie de façon unique une ligne d'une table (`id`). Une clé étrangère est une colonne qui pointe vers la clé primaire d'une autre table (`utilisateur_id` dans `seance`), et la base garantit qu'elle pointe vers une ligne qui existe.

### Conteneur (Docker)
Programme qui tourne isolé, avec tout ce dont il a besoin (système, bibliothèques), décrit par un `Dockerfile`. Plus léger qu'une machine virtuelle, parce qu'il partage le noyau du système hôte.

### CORS
*Cross-Origin Resource Sharing.* Par sécurité, un navigateur refuse qu'une page chargée depuis une adresse (`localhost:5173`) lise la réponse d'une autre adresse (`localhost:8080`), sauf si cette dernière l'autorise explicitement. L'erreur apparaît dans la console du navigateur, pas dans les logs du back.

### DTO
*Data Transfer Object.* Classe qui décrit uniquement les données échangées en JSON. On ne renvoie pas directement les entités de la base, pour ne pas exposer par accident des champs internes (comme l'empreinte du mot de passe).

### Endpoint
Une adresse précise de l'API associée à une méthode HTTP, par exemple `GET /api/seances`.

### Entité (JPA)
Classe Java qui correspond à une table de la base ; chaque objet correspond à une ligne.

### Hash (empreinte)
Résultat d'une fonction à sens unique : facile à calculer, impossible à inverser. Utilisé pour stocker les mots de passe. Voir [Sécurité](securite.md#mots-de-passe).

### Hook
En React, fonction dont le nom commence par `use` et qui gère un état ou un effet (`useState`, ou nos propres `useDashboard`, `useSeance`…). Chez nous, chaque page a son hook qui contient toute sa logique.

### JPA / Hibernate
JPA est la norme Java pour faire correspondre des classes à des tables ; Hibernate en est l'implémentation utilisée par Spring. Spring Data JPA génère en plus les requêtes courantes à partir du nom des méthodes (`findByEmail`).

### JSON
Format texte d'échange de données (`{ "bpm": 78 }`), lisible par tous les langages.

### JWT
*JSON Web Token.* Jeton signé par le serveur qui prouve l'identité de l'utilisateur, renvoyé à chaque requête.

### Lint
Analyse automatique du code qui signale erreurs probables et mauvaises pratiques sans l'exécuter. Chez nous : oxlint pour le front.

### localStorage
Petit espace de stockage du navigateur, propre à chaque site et à chaque navigateur. Le front y range pour l'instant le profil et les performances ; ces données ne quittent pas l'ordinateur et disparaissent si on vide le navigateur.

### Migration
Fichier SQL numéroté qui décrit un changement du schéma de la base. Un outil (Flyway) applique automatiquement celles qui manquent. Voir [Base de données](base-de-donnees.md#faire-évoluer-le-schéma).

### Monorepo
Un seul dépôt Git qui contient plusieurs programmes. Voir [ADR 0001](adr/0001-depot-unique.md).

### OpenAPI (Swagger)
Format standard pour décrire une API, souvent généré depuis le code, et qui produit une page de documentation interactive.

### Pull request (PR)
Demande de fusion d'une branche dans `main`, sur GitHub. C'est là que se fait la relecture.

### Rebase
Opération Git qui « rejoue » tes commits par-dessus la dernière version d'une autre branche. `git pull --rebase` garde un historique linéaire, sans commit de fusion.

### REST
Style d'API où les adresses désignent des ressources (`/api/seances/42`) et où la méthode HTTP (`GET`, `POST`, `DELETE`…) dit l'action.

### Reverse proxy
Serveur placé devant d'autres, qui reçoit les requêtes et les transmet au bon destinataire. Chez nous, nginx transmet `/api/...` au back.

### SPA
*Single Page Application.* Site dont le serveur envoie une seule page HTML ; ensuite, c'est le JavaScript dans le navigateur qui change le contenu selon l'adresse. D'où la règle « toutes les adresses renvoient `index.html` ».

### Spring Boot
Framework Java qui fournit tout le nécessaire pour un back web (serveur HTTP, JSON, base de données, sécurité) avec une configuration minimale.

### Variable d'environnement
Valeur fournie à un programme par le système au moment où il démarre, et non écrite dans son code. Permet d'utiliser le même code avec des réglages différents (local, production) et de garder les secrets hors du dépôt.

### Volume (Docker)
Espace de stockage géré par Docker, qui survit à l'arrêt et à la reconstruction des conteneurs. Les données PostgreSQL y sont gardées. `docker compose down -v` le supprime.
