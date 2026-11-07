# API

Une **API** (*interface de programmation*) est l'ensemble des « portes » qu'un programme ouvre aux autres. Ici, le backend expose des adresses HTTP (les **endpoints**) que le front appelle. Ce document est le **contrat** entre les équipes : tant qu'on le respecte, chacun peut changer son code interne sans casser les autres.

## Conventions

Ces règles suivent le style **REST**, le plus répandu pour les API web.

**Adresses**
- Toutes commencent par `/api/`.
- Elles désignent des *ressources* au pluriel, avec des noms : `/api/seances`, `/api/seances/42`. Pas de verbe dans l'adresse (`/api/getSeances` est à éviter) : c'est la méthode HTTP qui dit l'action.
- En minuscules, mots séparés par des tirets : `/api/frequence-cardiaque`.

**Méthodes HTTP**

| Méthode | Sens | Exemple |
|---|---|---|
| `GET` | lire | `GET /api/seances` : liste mes séances |
| `POST` | créer | `POST /api/seances` : enregistre une séance |
| `PUT` | remplacer entièrement | `PUT /api/profil` |
| `PATCH` | modifier en partie | `PATCH /api/profil` (seulement le poids) |
| `DELETE` | supprimer | `DELETE /api/seances/42` |

**Format**
- Corps des requêtes et des réponses en JSON, encodé en UTF-8.
- Noms de champs en `camelCase` (`fcMoyenne`, `dureeMin`), comme en Java et en TypeScript.
- Dates au format **ISO 8601** avec fuseau : `"2026-10-13T18:30:00Z"`. Jamais de date sous forme de texte libre (`"13/10"`).
- Unités du système international, précisées dans le nom si besoin : `distanceM`, `dureeS`, `poidsKg`.

**Codes de réponse**

| Code | Quand |
|---|---|
| `200 OK` | lecture ou modification réussie |
| `201 Created` | création réussie (la réponse contient l'objet créé) |
| `204 No Content` | suppression réussie, rien à renvoyer |
| `400 Bad Request` | données envoyées invalides (champ manquant, mauvais format) |
| `401 Unauthorized` | pas connecté, ou jeton invalide |
| `403 Forbidden` | connecté, mais pas le droit (la séance d'un autre) |
| `404 Not Found` | la ressource n'existe pas |
| `409 Conflict` | conflit (adresse e-mail déjà utilisée) |
| `500 Internal Server Error` | bug côté serveur : ne doit jamais être renvoyé volontairement |

**Erreurs** : toujours le même format, pour que le front puisse les afficher de façon uniforme. Spring Boot sait produire ce format standard (*Problem Details*, RFC 9457) :

```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Un compte existe déjà avec cette adresse e-mail."
}
```

**Versionnement** : tant que le projet n'a qu'un seul client que nous maîtrisons, pas de `/api/v1/`. Si l'application de bureau doit continuer à marcher pendant qu'on change l'API, on ajoutera une version.

## Documentation générée automatiquement (recommandé)

En entreprise, la liste des endpoints n'est en général pas écrite à la main mais **générée depuis le code**, au format **OpenAPI** (anciennement *Swagger*). Pour Spring Boot, la bibliothèque `springdoc-openapi` le fait : une fois ajoutée au `pom.xml`, une page interactive est disponible sur `http://localhost:8080/swagger-ui.html`, où l'on peut lire et tester chaque endpoint. FastAPI fait la même chose nativement sur `/docs`.

Quand ce sera en place, le tableau ci-dessous ne gardera que les règles métier non visibles dans le code.

## Endpoints du backend

Liste tirée du code (`backend/src/main/java/com/datafit/backend/`). `{utilisateurId}` est l'identifiant renvoyé par la connexion. Voir [Sécurité § Authentification](securite.md#authentification) pour la limite actuelle de ce choix.

### Comptes

| Méthode | Adresse | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Crée un compte, utilisable tout de suite (aucun mail de confirmation), renvoie `{ id, email }` |
| `POST` | `/api/auth/login` | Vérifie les identifiants, renvoie `{ id, email }` |
| `POST` | `/api/profil/register/profil` | Crée le profil (nom, sexe, poids, taille, objectif, niveau, activité, date de naissance) |
| `POST` | `/api/contact` | Enregistre un message du formulaire de contact |

### Séances de la montre

Une séance est lancée par le front, puis le backend enchaîne simulateur, analyse et enregistrement (voir [Architecture § Flux principal](architecture.md#4-flux-principal--dune-séance-au-tableau-de-bord)).

| Méthode | Adresse | Description |
|---|---|---|
| `POST` | `/api/seances/{sport}/{utilisateurId}` | Lance une séance simulée et l'enregistre une fois analysée |
| `GET` | `/api/seances/{sport}/{utilisateurId}` | Historique, de la plus récente à la plus ancienne |
| `GET` | `/api/seances/{sport}/{utilisateurId}/dernier` | Dernière séance, `204` s'il n'y en a pas |

`{sport}` vaut `cardio`, `velo`, `natation` ou `muscu`.

### Sommeil

| Méthode | Adresse | Description |
|---|---|---|
| `POST` | `/api/sommeil/{utilisateurId}` | Simule une nuit, l'analyse et l'enregistre |
| `GET` | `/api/sommeil/{utilisateurId}` | Toutes les nuits |
| `GET` | `/api/sommeil/{utilisateurId}/jour/{date}` | Nuit d'une date donnée |
| `GET` | `/api/sommeil/{utilisateurId}/{id}/graphiques` | Graphiques d'une nuit (FC, mouvements, phases) ; `204` si ses mesures n'ont pas été conservées |
| `GET` | `/api/sommeil/{utilisateurId}/graphiques` | Évolution des nuits enregistrées (durée, efficacité, FC…) |
| `DELETE` | `/api/sommeil/{utilisateurId}/{id}` | Supprime une nuit |

### Nutrition

| Méthode | Adresse | Description |
|---|---|---|
| `POST` | `/api/nutrition/{utilisateurId}` | Ajoute un repas |
| `GET` | `/api/nutrition/{utilisateurId}` | Tous les repas |
| `GET` | `/api/nutrition/{utilisateurId}/jour/{date}` | Repas d'une journée |
| `DELETE` | `/api/nutrition/{utilisateurId}/{id}` | Supprime un repas |
| `POST` | `/api/nutrition/{utilisateurId}/analyser/{date}` | Lance l'analyse de la journée (service Python) |
| `GET` | `/api/nutrition/{utilisateurId}/analyse/{date}` | Résultat de l'analyse de la journée |

### Performances déclarées (rangs)

Une ligne par utilisateur et par jour pour chaque discipline.

| Méthode | Adresse | Description |
|---|---|---|
| `POST` | `/api/{discipline}/{utilisateurId}` | Enregistre les performances du jour |
| `PUT` | `/api/{discipline}/{utilisateurId}/aujourdhui` | Corrige celles du jour |
| `GET` | `/api/{discipline}/{utilisateurId}` | Historique |
| `GET` | `/api/{discipline}/{utilisateurId}/aujourdhui` | Performances du jour |
| `GET` | `/api/{discipline}/{utilisateurId}/dernier` | Dernières performances |

`{discipline}` vaut `sbd`, `halterofilie`, `streetlifting`, `calisthenics`, `natation`, `souplesse` ou `athletisme`.

## Services Python

Appelés **uniquement par le backend**, jamais par le front (voir [ADR 0006](adr/0006-service-analyse-python-separe.md)). Tous deux sont écrits avec FastAPI, qui publie leur documentation interactive sur `/docs`.

| Service | Méthode | Adresse | Entrée | Sortie |
|---|---|---|---|---|
| Simulateur (`:8000`) | `POST` | `/simuler` | `{ profil: { utilisateur_id, sexe, poids, taille, niveau, date_naissance }, seance: { type, nom, date } }` | mesures brutes de la séance |
| Analyse (`:8001`) | `POST` | `/analyser` | mesures, avec un champ `sport` : `cardio`, `velo`, `natation`, `muscu`, `nutrition` ou `sommeil` | indicateurs calculés (FC, vitesses, durées, phases de sommeil, macros…) |

Les deux renvoient `422` si l'entrée est invalide.

## Appels depuis le front

- En développement (`npm run dev`, port 5173), Vite transmet les appels `/api/...` au back sur le port 8080.
- Avec Docker, le front appelle `/api/...` sur sa propre adresse, et nginx transmet au back. Pas de CORS nécessaire.
- Les appels sont regroupés dans `frontend/src/services/` (un fichier par domaine : montre, nutrition, chaque discipline), plutôt que dispersés dans les pages.
