# Kubernetes

Docker Compose lance DataFit sur **une** machine. **Kubernetes** (« k8s ») fait tourner les mêmes conteneurs sur un *cluster* et s'occupe de les relancer s'ils tombent, de les mettre à jour sans coupure et de limiter qui peut parler à qui. Les fichiers sont dans [`k8s/`](../k8s).

> **État : testé le 15 novembre 2026 sur un cluster [kind](https://kind.sigs.k8s.io) (Kubernetes 1.37, un nœud, avec `kubectl` 1.37).** Le déploiement complet fonctionne : base, création des tables, backend, services Python et site démarrent ; inscription, connexion, isolation entre comptes (403), séance simulée de bout en bout (backend, simulateur, analyse, disque des mesures) ; les comptes, les sessions et les mesures survivent à la suppression des pods de la base et du backend ; les NetworkPolicy bloquent bien ce qu'elles doivent (un pod quelconque ne joint que le site, le site ne joint que le backend, seul le backend joint la base et les services Python). Le test a fait corriger un défaut : PostgreSQL ne démarrait pas avec `drop: ALL` (il tourne maintenant directement avec l'utilisateur `postgres`).
>
> **Pas testé :** l'Ingress (il faut un contrôleur Ingress nginx), le HTTPS, Stripe et Google, et tout ce qui n'est pas un cluster local à un nœud.

## Ce que contient `k8s/`

| Fichier | Rôle |
|---|---|
| `namespace.yaml` | l'espace `datafit`, séparé du reste du cluster |
| `configmap.yaml` | réglages non secrets (adresses des services, CORS, `SITE_URL`) |
| `secret.example.yaml` | modèle des secrets (mot de passe de la base, clés Stripe, Google) |
| `db.yaml` | PostgreSQL : StatefulSet + disque de 5 Go + Service `db` |
| `migrations.yaml` | Job qui crée les tables avec `db/*.sql` (rejouable) |
| `backend.yaml` | Spring Boot : Deployment, disque des mesures de la montre (2 Go), Service `backend` |
| `services-python.yaml` | simulateur et analyse : Deployments et Services |
| `frontend.yaml` | le site (nginx) : 2 répliques et Service `frontend` |
| `network-policies.yaml` | pare-feu interne : seul le backend joint la base et les services Python |
| `ingress.yaml` | l'adresse d'entrée `datafit.local` |
| `kustomization.yaml` | liste de tout cela : `kubectl apply -k k8s` applique le tout |
| `deployer.sh` | enchaîne les étapes ci-dessous |

Comme avec Docker Compose, **seul le site est exposé** : la base, le backend et les services Python n'ont qu'une adresse interne au cluster (`ClusterIP`).

Le backend, les services Python et le Job des tables tournent sans root, avec un système de fichiers en lecture seule (seuls `/tmp` et le disque des mesures sont modifiables) et sans capacité Linux superflue. nginx démarre en root pour ouvrir le port 80 puis perd ses droits : on y interdit seulement l'élévation de droits.

## Essayer en local

**Outils** : `kubectl` et un petit cluster local, au choix [minikube](https://minikube.sigs.k8s.io), [kind](https://kind.sigs.k8s.io) ou k3s. Docker est déjà installé pour le projet.

**1. Démarrer un cluster**

```bash
minikube start
minikube addons enable ingress   # pour l'adresse datafit.local (facultatif)
```

**2. Construire les 4 images et les donner au cluster**

Les manifestes utilisent des images locales (`imagePullPolicy: IfNotPresent`) : rien n'est téléchargé depuis un registre.

```bash
docker build -t datafit-backend:latest backend
docker build -t datafit-frontend:latest frontend
docker build -t datafit-simulateur:latest simulateur
docker build -t datafit-analyse:latest analyse
```

```bash
minikube image load datafit-backend:latest datafit-frontend:latest datafit-simulateur:latest datafit-analyse:latest
# avec kind : kind load docker-image datafit-backend:latest datafit-frontend:latest datafit-simulateur:latest datafit-analyse:latest
```

Avec Docker installé par **snap** (cas de `lancer.sh`), `kind load` échoue sur `/tmp` (snap ne le voit pas) : lance-le avec un dossier de ton home, `mkdir -p ~/kind-tmp && TMPDIR=~/kind-tmp kind load docker-image ...`.

**3. Créer les secrets** (ils ne sont jamais commités : `k8s/secret.yaml` est dans le `.gitignore`)

```bash
cp k8s/secret.example.yaml k8s/secret.yaml
# puis ouvre k8s/secret.yaml et change DB_PASSWORD
```

**4. Déployer**

```bash
./k8s/deployer.sh
```

Le script crée le namespace et les secrets, met les fichiers de `db/` dans un ConfigMap, applique tout, puis attend la base, les tables, le backend et le site.

**5. Ouvrir le site**

```bash
kubectl -n datafit port-forward svc/frontend 3000:80
```

puis http://localhost:3000. Pour passer par l'Ingress : ajouter `<résultat de minikube ip> datafit.local` au fichier `hosts` et ouvrir http://datafit.local.

## Commandes utiles

```bash
kubectl -n datafit get pods                   # l'état de chaque pod (Running, CrashLoopBackOff...)
kubectl -n datafit logs deploy/backend        # les logs du backend
kubectl -n datafit describe pod <nom>         # pourquoi un pod ne démarre pas
kubectl -n datafit delete namespace datafit   # tout supprimer, disques compris
```

## Mettre à jour le code

Reconstruire l'image, la recharger dans le cluster, puis relancer : `kubectl -n datafit rollout restart deploy/backend` (idem `frontend`, `simulateur`, `analyse`). Les nouvelles tables de `db/` passent en relançant `./k8s/deployer.sh`.

## Points d'attention

- **Une seule réplique du backend** : les mesures de la montre sont des fichiers sur un disque qu'un seul pod peut monter, et le limiteur d'essais garde ses compteurs en mémoire. Pour passer à plusieurs répliques, il faudra un stockage partagé et un limiteur partagé (Redis).
- **Une seule base**, sans réplication ni sauvegarde automatique : `pg_dump` à la main pour l'instant.
- **Les NetworkPolicy** ne protègent que si le réseau du cluster les applique (kind les applique, vérifié ; Calico et Cilium aussi ; minikube : `minikube start --cni=calico`). Sans cela elles sont acceptées mais sans effet.
- **HTTPS** : l'Ingress est en HTTP. En ligne, ajouter un certificat (cert-manager), puis mettre `SESSION_COOKIE_SECURISE: "true"` dans `configmap.yaml` ; sinon les cookies de session seront refusés ou circuleront en clair. Changer aussi `SITE_URL` et `CORS_ORIGINS` pour le vrai domaine.
- **Images** : construites en local. Pour un vrai cluster, les pousser vers un registre (GitHub Container Registry...) et mettre leur adresse dans les manifestes.
- **Stripe** : le webhook de Stripe doit pouvoir joindre `/api/stripe/webhook` : une adresse publique est nécessaire, `datafit.local` ne suffit pas.
