# Documentation technique de DataFit

Ce dossier contient la documentation technique du projet. Le [`README.md`](../README.md) à la racine sert de porte d'entrée rapide (qu'est-ce que DataFit, comment le lancer) ; ici, on va plus loin : comment le système est construit, pourquoi on l'a construit comme ça, et comment travailler dessus sans casser le travail des autres.

## Par où commencer

| Tu es… | Lis d'abord |
|---|---|
| Nouveau sur le projet | [Architecture](architecture.md), puis [Guide de développement](developpement.md) |
| Sur le point de pousser du code | [Guide de contribution](contribution.md) |
| En train de toucher au back ou au front qui l'appelle | [API](api.md) |
| En train de toucher aux tables | [Base de données](base-de-donnees.md) |
| Côté sciences des données | [Architecture § Service d'analyse](architecture.md#service-danalyse-python) et [API](api.md) |
| Jury, enseignant, recruteur | [Architecture](architecture.md) et les [décisions d'architecture](adr/) |

## Sommaire

- [**Architecture**](architecture.md) : vue d'ensemble, les composants du système, comment circulent les données, état d'avancement.
- [**Décisions d'architecture (ADR)**](adr/) : chaque choix technique important, avec le contexte, les options écartées et leurs conséquences.
- [**API**](api.md) : conventions et liste des adresses (« endpoints ») du back.
- [**Base de données**](base-de-donnees.md) : schéma des tables et règles pour le faire évoluer.
- [**Guide de développement**](developpement.md) : installer, lancer, configurer, résoudre les problèmes fréquents.
- [**Guide de contribution**](contribution.md) : branches, messages de commit, pull requests, relecture, « définition de terminé ».
- [**Déploiement**](deploiement.md) : où et comment le projet est mis en ligne.
- [**Sécurité et données personnelles**](securite.md) : secrets, mots de passe, RGPD.
- [**Glossaire**](glossaire.md) : tous les termes techniques employés, expliqués simplement.

## Règles pour cette documentation

1. **La doc vit avec le code.** Elle est dans le dépôt Git, donc elle se modifie dans la même pull request que le code qu'elle décrit. Une PR qui ajoute un endpoint ajoute sa ligne dans `api.md`.
2. **On écrit pour quelqu'un qui arrive.** Chaque terme technique est expliqué la première fois qu'il apparaît, ou renvoie au [glossaire](glossaire.md).
3. **On est honnête sur l'état réel.** Ce qui est prévu mais pas fait est marqué **🚧 prévu**. Une doc qui décrit un système imaginaire est pire que pas de doc.
4. **Les schémas sont du texte.** Ils sont écrits en [Mermaid](https://mermaid.js.org/), que GitHub affiche directement en image. Ils se modifient comme du code et se relisent dans les PR.

> Dernière mise à jour générale : octobre 2026.
