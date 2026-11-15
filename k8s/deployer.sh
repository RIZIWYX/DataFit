#!/usr/bin/env bash
# Déploie DataFit sur le cluster Kubernetes de ton kubectl (minikube, kind, k3s...).
# usage : ./k8s/deployer.sh          (les images doivent déjà être construites : voir docs/kubernetes.md)
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v kubectl > /dev/null; then
  echo "kubectl n'est pas installé : voir docs/kubernetes.md."
  exit 1
fi
if [ ! -f k8s/secret.yaml ]; then
  echo "Il manque k8s/secret.yaml : copie k8s/secret.example.yaml en k8s/secret.yaml et mets tes valeurs."
  exit 1
fi
if grep -q "DB_PASSWORD: change-moi" k8s/secret.yaml; then
  echo "k8s/secret.yaml contient encore le mot de passe d'exemple : choisis-en un autre."
  exit 1
fi

echo "-> Namespace et secrets"
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml

echo "-> Fichiers SQL de db/ (ConfigMap db-sql)"
kubectl -n datafit create configmap db-sql --from-file=db/ --dry-run=client -o yaml | kubectl apply -f -

# un Job terminé ne peut pas être modifié : on le supprime pour relancer les tables à jour
kubectl -n datafit delete job db-migrations --ignore-not-found

echo "-> Application des manifestes"
kubectl apply -k k8s

echo "-> Attente de la base, des tables, puis du backend et du site (quelques minutes)"
kubectl -n datafit rollout status statefulset/db --timeout=300s
kubectl -n datafit wait --for=condition=complete job/db-migrations --timeout=300s
kubectl -n datafit rollout status deployment/backend --timeout=300s
kubectl -n datafit rollout status deployment/frontend --timeout=300s

echo "-> DataFit est déployé. Pour l'ouvrir : kubectl -n datafit port-forward svc/frontend 3000:80  puis http://localhost:3000"
echo "   (ou via l'Ingress : http://datafit.local, voir docs/kubernetes.md)"
