# Homelab

Serveur auto-hébergé sur un ancien portable, pour faire tourner DataFit en dehors de Vercel et apprendre l'administration système, le réseau et la sécurité.

## Architecture prévue

- Debian 13 sans interface graphique
- Docker Compose pour les services (front, back, base de données, simulateur, analyse)
- Caddy comme reverse proxy
- Cloudflare Tunnel pour l'exposition publique, sans aucun port ouvert sur la box
- Tailscale pour l'administration à distance

## Avancement

| Étape | État |
|---|---|
| Installation de Debian | Fait |
| Réseau Wi-Fi | Fait |
| Accès à distance (Tailscale) | Fait |
| Sécurisation (SSH, ufw, fail2ban, Lynis) | Fait |
| Docker | En cours |
| Caddy, sauvegardes, tunnel, supervision | À faire |
| Déploiement de DataFit | À faire |

## Documentation

- [Installation](docs/01-installation.md)
- [Sécurisation](docs/02-securisation.md)
- [Feuille de route](ROADMAP.md)
