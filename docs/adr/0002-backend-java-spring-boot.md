# 0002. Backend en Java avec Spring Boot

- **Statut** : Accepté
- **Date** : 2026-10
- **Décideurs** : équipe informatique

## Contexte

Le back doit gérer les comptes, recevoir les séances et les stocker. L'équipe informatique maîtrise Java (cours de POO en L3) et doit pouvoir valoriser le projet en stage ou en emploi.

## Options envisagées

1. **Java + Spring Boot** : standard très répandu en entreprise en France ; gère pour nous le serveur HTTP, la conversion JSON, l'accès à la base (JPA) et la sécurité (Spring Security). Plus verbeux, démarrage plus lent.
2. **Node.js (Express ou Next.js)** : même langage que le front. Mais moins aligné avec les compétences Java visées, et moins de structure imposée.
3. **Python (FastAPI)** : même langage que l'équipe SD. Mais l'équipe info y est moins à l'aise, et ça mélangerait les responsabilités.

## Décision

Java 21 et Spring Boot 4, avec Maven (via le wrapper `mvnw`, qui évite d'installer Maven à la main).

## Conséquences

- Organisation en couches `controller / service / repository` (voir [Architecture](../architecture.md#backend)).
- Les tables ne sont **pas** créées automatiquement par Hibernate (`ddl-auto=none`) : c'est un choix volontaire, voir [ADR 0003](0003-postgresql.md).
- Spring Security sera ajouté pour l'authentification.
