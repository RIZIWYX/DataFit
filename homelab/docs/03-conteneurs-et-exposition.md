# 03 - Docker, reverse proxy et premier tunnel

Fait entre le 15 et le 19 novembre 2026.

## Docker

Installation avec le script officiel :

```
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker admin
```

Il faut se déconnecter puis se reconnecter pour que le groupe `docker` soit pris en compte. Vérification :

```
groups
docker run hello-world
docker compose version
```

Le service tourne et démarre avec le système (`systemctl status docker` : enabled, active).

Le groupe `docker` donne en pratique les mêmes droits que root. C'est un choix assumé pour un serveur où je suis le seul administrateur.

## Organisation

Tous les services sont dans `/opt/homelab`, qui appartient à l'utilisateur `admin` :

```
sudo mkdir -p /opt/homelab
sudo chown -R admin:admin /opt/homelab
```

```
/opt/homelab/
  docker-compose.yml
  caddy/
    Caddyfile
    data/
    config/
```

## Étape 1 : un conteneur de test

Un premier conteneur `nginx:alpine` (nom `homelab-test`), publié uniquement en local sur `127.0.0.1:8080`.

```
docker compose up -d
curl http://localhost:8080
```

La page d'accueil de nginx s'affiche : Docker et Compose fonctionnent.

## Étape 2 : Caddy comme reverse proxy

Ajout d'un conteneur `caddy:2` (nom `homelab-caddy`) sur un réseau Docker dédié `homelab_proxy`. Caddy redirige les requêtes vers le conteneur de test.

Changements :

- le conteneur de test ne publie plus aucun port sur la machine, il n'est joignable que par Caddy à l'intérieur du réseau Docker
- seul Caddy publie un port, et seulement en local : `127.0.0.1:8081 -> 80`
- les données et la configuration de Caddy sont gardées dans `caddy/data` et `caddy/config`

Vérification :

```
docker ps
curl http://localhost:8081
```

`docker ps` montre bien `80/tcp` sans redirection pour le test, et `127.0.0.1:8081->80/tcp` pour Caddy. La page nginx s'affiche en passant par Caddy.

Pourquoi publier uniquement sur `127.0.0.1` : Docker écrit ses propres règles iptables et passe par-dessus ufw. Un port publié sur `0.0.0.0` serait accessible depuis le réseau même si ufw le bloque.

## Étape 3 : premier tunnel Cloudflare (test)

Ajout d'un conteneur `cloudflare/cloudflared` (nom `homelab-cloudflared`) dans le même réseau que Caddy, qui envoie le trafic vers `http://caddy:80`.

Pour ce premier essai, c'est un "quick tunnel" : pas besoin de compte ni de nom de domaine, Cloudflare donne une adresse temporaire en `*.trycloudflare.com`.

```
docker compose up -d
docker compose logs -f cloudflared
```

Ce que montrent les logs :

- tunnel créé avec une adresse `trycloudflare.com`
- connexion enregistrée sur le point de présence Cloudflare de Paris (`cdg09`) en QUIC
- tous les tests de connectivité passent (DNS, UDP, TCP, API Cloudflare)

Le serveur est donc joignable depuis Internet sans aucun port ouvert sur la box : c'est le serveur qui ouvre la connexion vers Cloudflare.

### Limites du quick tunnel

- l'adresse change à chaque redémarrage du conteneur
- aucune garantie de disponibilité, réservé aux tests
- pas de contrôle d'accès

Il faudra le remplacer par un tunnel nommé, avec un compte Cloudflare et mon propre nom de domaine.

### Avertissement dans les logs

```
failed to sufficiently increase receive buffer size (was: 208 kiB, wanted: 7168 kiB, got: 416 kiB)
```

Sans gravité, mais QUIC est moins performant. Correction prévue :

```
echo -e "net.core.rmem_max = 7500000\nnet.core.wmem_max = 7500000" | sudo tee /etc/sysctl.d/91-quic.conf
sudo sysctl --system
docker compose restart cloudflared
```

## Reste à faire

- [ ] Corriger la taille des buffers UDP pour QUIC
- [ ] Rotation des logs Docker dans `/etc/docker/daemon.json` (`max-size` et `max-file`), à vérifier
- [ ] Acheter un nom de domaine et passer à un tunnel nommé
- [ ] Mettre en place les sauvegardes (restic) avant d'exposer de vraies données
- [ ] En-têtes de sécurité dans Caddy (HSTS, CSP, X-Frame-Options, Referrer-Policy)
- [ ] Déployer DataFit derrière Caddy
