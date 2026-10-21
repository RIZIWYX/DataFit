# 0003. PostgreSQL comme base de données

- **Statut** : Accepté
- **Date** : 2026-10
- **Décideurs** : équipe informatique

## Contexte

Il faut stocker des utilisateurs, des séances, et beaucoup de mesures horodatées (une valeur de fréquence cardiaque par seconde, par exemple). Les données sont liées entre elles (une séance appartient à un utilisateur).

## Options envisagées

1. **PostgreSQL** : base relationnelle libre, très utilisée en entreprise, robuste. Gère bien les relations et les contraintes d'intégrité. Extension TimescaleDB disponible si les séries temporelles deviennent volumineuses.
2. **MySQL / MariaDB** : comparable, mais PostgreSQL est plus strict et plus riche (types, JSON, index).
3. **MongoDB** (base de documents) : souple, mais on perd les contraintes entre tables, alors que nos données sont très structurées.
4. **Prisma** comme couche d'accès : écarté, car il impose un back en Node.js (voir ADR 0002).

## Décision

PostgreSQL 17, accédée depuis Java avec Spring Data JPA.

## Conséquences

- La structure des tables est écrite en SQL, à la main, et versionnée (voir [Base de données](../base-de-donnees.md)).
- En local, la base tourne dans Docker ; pas besoin de l'installer sur sa machine.
