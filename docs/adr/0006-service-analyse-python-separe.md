# 0006. Analyse des données dans un service Python séparé

- **Statut** : Proposé — à valider avec l'équipe sciences des données
- **Date** : 2026-10-13
- **Décideurs** : équipe DataFit

## Contexte

L'équipe SD écrit ses traitements en Python (pandas, numpy, éventuellement scikit-learn). Le back est en Java. Il faut que le back puisse obtenir les résultats de ces traitements.

## Options envisagées

1. **Service Python séparé, appelé en HTTP** : le code SD tourne dans son propre programme et expose quelques endpoints. Chaque équipe garde son langage ; le seul point de contact est le format JSON échangé. Coût : un programme de plus à lancer.
2. **Lancer un script Python depuis Java** (processus externe) : pas de service en plus, mais fragile (chemins, versions de Python, erreurs difficiles à remonter) et lent si on relance Python à chaque séance.
3. **Traitements par lots** : un script Python lit la base la nuit et écrit les résultats. Simple, mais résultats non immédiats, et le script accède directement à la base (contraire à la règle « seul le back parle à la base »).
4. **Réécrire les traitements en Java** : un seul langage, mais retire à l'équipe SD la maîtrise de son travail.

## Décision proposée

Option 1. Framework suggéré : **FastAPI**, léger, qui génère automatiquement une documentation interactive de ses endpoints (`/docs`) et valide le format des données reçues.

## Conséquences

- Le contrat d'échange back ↔ analyse doit être écrit tôt dans [API](../api.md#service-danalyse-python), pour que les deux équipes avancent en parallèle avec des données fictives.
- Un service `analyse` sera ajouté à `docker-compose.yml`, avec son `Dockerfile`.
- Le service Python ne se connecte pas à la base : il reçoit les données dans la requête et renvoie les résultats.
