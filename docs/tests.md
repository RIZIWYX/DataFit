# Tests

Les tests tournent à chaque `push` et à chaque pull request (`.github/workflows/ci.yml`) : une croix rouge sur la PR veut dire qu'un test a échoué.

| Partie | Outil | Où | Lancer en local |
|---|---|---|---|
| Backend (Java) | JUnit 5, Mockito | `backend/src/test/` | `cd backend && ./mvnw test` |
| Site (React) | Vitest | `frontend/src/**/*.test.ts` | `cd frontend && npm test` |
| Analyse et simulateur (Python) | unittest, FastAPI `TestClient` | `analyse/tests/`, `simulateur/tests/` | `pip install -r requirements-test.txt` puis `python -m unittest discover -s tests -v` |

## Ce qui est couvert

**Backend** (74 tests)
- *Unitaires, sans base* : suppression du compte et effacement des données (`CompteServiceTest`, `EffacementTablesTest`, qui vérifie que chaque nouvelle table liée à un compte est rangée), abonnement Stripe, hydratation, archives des mesures, inscription (`AuthServiceTest` : e-mail en minuscules, 72 octets, deux consentements), consentement santé, sessions, limiteur d'essais, contrôle d'accès (`AuthInterceptorTest`).
- *Intégration, avec une vraie base* : `AccesApiIntegrationTest` lance le serveur et joue des scénarios avec de vrais cookies : sans session 401 ; un compte ne lit, ne modifie, ne supprime rien chez un autre (403) ; création du profil d'un autre refusée ; consentement santé exigé à l'inscription ; déconnexion qui ferme la session côté serveur ; le jeton n'est jamais en base (seulement son empreinte) ; limite de 5 échecs par adresse e-mail.
- `BackendApplicationTests` vérifie que toute l'application démarre.

Ces tests d'intégration demandent une base PostgreSQL avec les tables de `db/` : `./lancer.sh` en local (port 5433, mot de passe de `.env`), ou le service `postgres` de la CI. Ils créent des comptes `it-…@test.invalid` et les suppriment à la fin.

**Site** (~40 tests) : les calculs, qui sont la partie la plus facile à casser sans le voir : lecture et écriture des temps (`4:30`, `1:25:00`), rangs et paliers, progression, conseils handstand/OAP, historique des records, compte et profil gardés dans le navigateur (déconnexion, suppression, effacement).

**Python** (24 tests) : routes `/sante`, documentation éteinte, validation des entrées (niveau, poids, dates, types de séance), graphiques.

## Ce qui n'est pas couvert

- **Les pages React** (rendu, formulaires, navigation) : aucun test de composant ; ils ont été vérifiés à la main dans un navigateur, pas automatiquement. Un test de bout en bout (Playwright) serait la suite logique.
- **Stripe et Google** : le code qui parle à ces services n'est testé qu'avec des simulations (Stripe), ou pas du tout (jeton Google).
- **Kubernetes** : les manifestes ont été essayés sur un cluster kind, mais sans test automatique.
- **Charge et performances** : rien.
- Le backend n'a pas de mesure de couverture (JaCoCo) : on ne sait pas quelle part du code les tests exécutent.

## Écrire un test

- Un test par comportement, nommé par une phrase (`unCompteSansConsentementLeDonneEnUneFoisEtGardeSaDate`, `n'a pas de conseil sans performance`).
- Backend : préférer un test unitaire avec Mockito (rapide, sans base) ; n'utiliser l'intégration que pour ce qui traverse plusieurs couches (cookies, base, HTTP).
- Site : tester les fonctions de `src/lib/`, pas les détails du rendu. `localStorage` n'existe pas sous Vitest : voir `lib/compte.test.ts` pour un exemple de simulation.
- Un bug corrigé reçoit d'abord un test qui l'attrape.
