# Conventions Git - DataFit

Règles communes à toute l'équipe pour garder un historique propre et éviter les conflits.

## 1. Branches

### Format

```
type/description-courte
```

- minuscules, mots séparés par des tirets `-`
- pas d'accents, pas d'espaces, pas de `_`
- une branche = un sujet ; elle est supprimée après le merge

### Types

| Préfixe     | Quand l'utiliser                                   | Exemple                         |
|-------------|----------------------------------------------------|---------------------------------|
| `feat/`     | nouvelle fonctionnalité                            | `feat/connexion-google`         |
| `fix/`      | correction de bug                                  | `fix/correction-affichage`      |
| `hotfix/`   | correction urgente sur le site en ligne            | `hotfix/crash-inscription`      |
| `refactor/` | réorganisation du code sans changer le comportement | `refactor/historique-montre`    |
| `chore/`    | maintenance : config, dépendances, ménage          | `chore/supprime-fichiers-inutiles` |
| `docs/`     | documentation uniquement                           | `docs/deploiement-render`       |
| `test/`     | ajout ou correction de tests                       | `test/analyse-sommeil`          |

Avec un ticket (GitHub Issue) : `fix/42-niveau-pro-simulateur`.

## 2. Commits

### Format (Conventional Commits)

```
type: description à l'impératif, en minuscules
```

- mêmes types que les branches : `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- une ligne courte (moins de 72 caractères), qui dit **ce que fait** le commit
- précision possible entre parenthèses : la partie du projet touchée

### Exemples

```
feat(auth): ajoute la connexion avec Google
fix(simulateur): accepte le niveau "confirmer" au lieu de "pro"
refactor(historique): affiche toutes les séances de la montre
chore: supprime e.yml ajouté par erreur
docs: explique le déploiement sur Render et Neon
```

À éviter : `modif`, `fix`, `update`, `test 2`, `ça marche`.

## 3. Workflow

1. Partir d'un `main` à jour :
   ```bash
   git checkout main
   git pull origin main
   git checkout -b type/description
   ```
2. Travailler, commiter souvent (petits commits clairs).
3. Avant de pousser, récupérer `main` pour régler les conflits chez soi :
   ```bash
   git pull origin main
   ```
4. Tester en local : `./lancer.sh`.
5. Pousser et ouvrir une pull request :
   ```bash
   git push -u origin type/description
   gh pr create --base main --fill
   ```
6. Faire relire par un coéquipier, puis merger :
   ```bash
   gh pr merge --merge --delete-branch
   ```

## 4. Règles d'équipe

- **Personne ne pousse directement sur `main`** : tout passe par une pull request.
- **On ne merge que du code testé en local** : un merge sur `main` redéploie automatiquement le site (Vercel) et les services (Render).
- **Jamais de secrets dans Git** : `.env`, mots de passe, clés API restent hors du dépôt. Utiliser `git add <dossier>` plutôt que `git add .`.
- **Modification de `db/`** : prévenir l'équipe et appliquer le changement sur la base en ligne (Neon, SQL Editor), qui ne se met pas à jour toute seule.
- **Branche finie = branche supprimée**, sur GitHub et en local.

## 5. Raccourcis utiles

```bash
git branch -r --no-merged origin/main | cat      # branches pas encore fusionnées
git branch --merged main | grep -v '^\*\|main' | xargs -r git branch -d   # ménage local
git fetch origin --prune                         # oublie les branches supprimées sur GitHub
git log --oneline -10 | cat                      # 10 derniers commits, sans pager
```

Quand `:` apparaît en bas du terminal (pager `less`), appuyer sur `q` pour sortir.
