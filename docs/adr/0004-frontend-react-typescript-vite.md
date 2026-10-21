# 0004. Frontend en React + TypeScript + Vite

- **Statut** : Accepté
- **Date** : 2026-10
- **Décideurs** : équipe informatique

## Contexte

Le site a une dizaine de pages avec beaucoup de graphiques et d'éléments répétés (cartes de séance, badges de rang). Il doit être agréable à développer et reconnu sur un CV.

## Options envisagées

1. **React + TypeScript** : bibliothèque d'interface la plus demandée sur le marché. TypeScript ajoute des types à JavaScript : beaucoup d'erreurs sont détectées avant même de lancer le site.
2. **PHP + HTML/CSS** : connu de l'équipe, mais peu adapté à une interface riche et réactive.
3. **Next.js** : React avec rendu côté serveur. Inutile ici, puisque le serveur est déjà en Java ; ça ajouterait un second serveur.

## Décision

React 19, TypeScript, Vite (outil qui lance le serveur de développement et construit le site final), React Router pour la navigation, oxlint pour le contrôle de qualité du code.

## Conséquences

- Le front est une application monopage (*SPA*) : l'hébergeur doit renvoyer `index.html` pour toutes les adresses (rôle de `vercel.json` et de `nginx.conf`).
- Pas de bibliothèque de graphiques : les graphes sont des composants faits maison (`GrapheLigne`, `GrapheColonnes`, `GrapheAnneau`). Plus de contrôle, mais plus de code à maintenir.
