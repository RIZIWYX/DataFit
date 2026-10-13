# API

Une **API** (*interface de programmation*) est l'ensemble des « portes » qu'un programme ouvre aux autres. Ici, le backend expose des adresses HTTP (les **endpoints**) que le front, le simulateur et plus tard l'application de bureau appellent. Ce document est le **contrat** entre les équipes : tant qu'on le respecte, chacun peut changer son code interne sans casser les autres.

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

### Existants

| Méthode | Adresse | Description | Réponse |
|---|---|---|---|
| `GET` | `/api/hello` | Vérifie que le back répond | texte |
| `GET` | `/api/heart-rate` | Démonstration, valeur fixe | `{ "bpm": 78, "status": "normal", "message": "…" }` |

Ces deux endpoints sont des tests ; ils seront retirés quand les vrais seront en place.

### Prévus 🚧

Proposition de départ, à ajuster en équipe. Toute modification passe par une PR qui met à jour ce tableau.

| Méthode | Adresse | Description | Connexion requise |
|---|---|---|---|
| `POST` | `/api/auth/inscription` | Crée un compte (`email`, `motDePasse`) | non |
| `POST` | `/api/auth/connexion` | Vérifie les identifiants, renvoie de quoi rester connecté | non |
| `POST` | `/api/auth/deconnexion` | Termine la session | oui |
| `GET` | `/api/profil` | Profil de l'utilisateur connecté | oui |
| `PUT` | `/api/profil` | Met à jour le profil (prénom, sexe, poids…) | oui |
| `GET` | `/api/seances` | Séances de l'utilisateur, filtrables : `?depuis=2026-09-01&sport=course` | oui |
| `GET` | `/api/seances/{id}` | Détail d'une séance, avec ses mesures | oui |
| `POST` | `/api/seances` | Enregistre une séance reçue de la montre ou du simulateur | oui |
| `DELETE` | `/api/seances/{id}` | Supprime une séance | oui |
| `GET` | `/api/performances` | Performances déclarées par exercice (pour les rangs) | oui |
| `PUT` | `/api/performances/{exerciceId}` | Enregistre une performance | oui |

Exemple de séance envoyée par le simulateur (`POST /api/seances`) :

```json
{
  "sport": "course",
  "debut": "2026-10-13T18:30:00Z",
  "mesures": [
    { "t": 0,  "fc": 92,  "vitesseKmh": 0.0,  "lat": 49.3842, "lon": 1.0712 },
    { "t": 1,  "fc": 95,  "vitesseKmh": 6.1,  "lat": 49.3842, "lon": 1.0713 }
  ]
}
```

`t` est le nombre de secondes écoulées depuis `debut`. Envoyer un décalage plutôt qu'une date complète par mesure allège beaucoup le message.

## Service d'analyse (Python)

🚧 Prévu.

Endpoints appelés **uniquement par le backend**, jamais par le front (voir [ADR 0006](adr/0006-service-analyse-python-separe.md)). Contrat à valider avec l'équipe SD.

| Méthode | Adresse | Entrée | Sortie |
|---|---|---|---|
| `GET` | `/sante` | — | `{ "statut": "ok" }`, pour vérifier que le service tourne |
| `POST` | `/analyse/seance` | la séance au format ci-dessus | indicateurs de la séance (zones d'effort, anomalies détectées) |
| `POST` | `/analyse/progression` | liste de séances résumées | tendance et indicateurs de progression |

Conseil pour avancer en parallèle : l'équipe SD peut écrire dès maintenant un fichier d'exemple d'entrée et de sortie (`analyse/tests/exemples/`). Le back s'en sert pour simuler les réponses avant que le vrai service existe.

## Appels depuis le front

- En développement (`npm run dev`, port 5173), le front appelle `http://localhost:8080/api/...`. Le back l'autorise grâce à l'annotation `@CrossOrigin` (voir [CORS](glossaire.md#cors)).
- Avec Docker, le front appelle `/api/...` sur sa propre adresse, et nginx transmet au back. Pas de CORS nécessaire.
- Recommandation : définir l'adresse du back dans une seule variable (`VITE_API_URL`) et centraliser les appels dans un fichier `frontend/src/lib/api.ts`, plutôt que d'écrire des `fetch` dans chaque hook.
