# Roadmap - Homelab

Serveur auto-hébergé sur un vieux PC : héberge DataFit et mes projets, sécurisé, sauvegardé, surveillé et audité avec mes propres outils.

> Règles : chaque phase laisse un serveur fonctionnel et documenté. Rien n'est exposé sur Internet avant d'être sécurisé **et** sauvegardé. Chaque choix technique est justifié dans `docs/`.

**Choix d'architecture (à figer en Phase 0)**
- Exposition : **Cloudflare Tunnel** (aucun port ouvert sur la box). TLS public géré par Cloudflare, Caddy fait le routage interne.
- Admin à distance : **Tailscale** (SSH jamais exposé).
- Conséquence pour l'audit : un scan externe de mon IP publique doit trouver **0 port ouvert**.

---

## Phase 0 - Préparation (1 soirée)
- [ ] Inventaire du PC : CPU, RAM, disque, consommation électrique (wattmètre si possible)
- [ ] Santé du disque : `smartctl -a` ; passer sur SSD si possible
- [ ] Créer le dépôt GitHub `homelab` : README, `.gitignore` (`.env`, secrets, clés), `docs/`, `services/`
- [ ] Choisir et acheter un nom de domaine (~10 €/an), DNS chez Cloudflare
- [ ] Schéma réseau v1 : Internet -> Cloudflare -> tunnel -> serveur -> Caddy -> services
- [ ] Valider avec l'équipe DataFit : accord pour l'hébergement, et un second admin avec accès

## Phase 1 - Système de base
- [ ] Debian 12 (ou Ubuntu Server 24.04), sans interface graphique
- [ ] IP fixe en local (bail DHCP réservé sur la box)
- [ ] BIOS : redémarrage automatique après coupure de courant
- [ ] Utilisateur non-root avec sudo, fuseau horaire et NTP
- [ ] Mises à jour + `unattended-upgrades` (correctifs de sécurité)
- [ ] Doc : `docs/01-installation.md`

**Fini quand :** le serveur redémarre seul après une coupure et se met à jour seul.

## Phase 2 - Sécurisation
- [ ] SSH : clé uniquement, `PermitRootLogin no`, `PasswordAuthentication no`
- [ ] Tailscale installé ; SSH écoute uniquement sur le réseau Tailscale et le LAN
- [ ] Pare-feu `ufw` : tout refuser en entrée par défaut, n'ouvrir que le nécessaire
- [ ] `fail2ban` sur SSH
- [ ] Désactiver les services inutiles (`systemctl list-units --type=service`)
- [ ] État des lieux initial : `ss -tulpn` + `lynis audit system` (score noté)
- [ ] Doc : `docs/02-securisation.md` (chaque mesure + pourquoi)

**Fini quand :** connexion SSH possible uniquement par clé via Tailscale, score Lynis noté.

## Phase 3 - Conteneurs et reverse proxy
- [ ] Docker + docker compose (utilisateur admin dans le groupe `docker` en connaissance de cause)
- [ ] Caddy dans un conteneur, réseau Docker interne `proxy`
- [ ] Aucun service ne publie de port sur l'hôte, sauf le proxy (et seulement en local)
- [ ] Arborescence : `services/<nom>/compose.yml` + `.env.example`
- [ ] Rotation des logs Docker (`max-size`, `max-file` dans `daemon.json`)
- [ ] Service de test `whoami` en local

## Phase 4 - Sauvegardes (avant toute donnée réelle)
- [ ] Outil : `restic` (ou `borg`) - chiffré, dédupliqué
- [ ] Sauvegarde chaque nuit via timer systemd : volumes Docker + dumps de base
- [ ] Règle 3-2-1 : copie sur disque externe + copie distante chiffrée (Backblaze B2 ou autre)
- [ ] Rotation : 7 jours + 4 semaines + 6 mois
- [ ] **Tester une restauration complète** sur une autre machine ou VM et la chronométrer
- [ ] Doc : `docs/04-sauvegardes.md`

**Fini quand :** j'ai restauré une sauvegarde au moins une fois, avec la procédure écrite.

## Phase 5 - Exposition sur Internet
- [ ] `cloudflared` en conteneur, tunnel vers Caddy
- [ ] `whoami.<domaine>` accessible en HTTPS
- [ ] En-têtes de sécurité dans Caddy : HSTS, CSP, X-Frame-Options, Referrer-Policy
- [ ] Optionnel : Cloudflare Access (login) devant les interfaces d'admin
- [ ] Vérifier : SSL Labs (A+), securityheaders.com (A), scan externe = 0 port ouvert
- [ ] Doc : `docs/05-exposition.md` (pourquoi le tunnel plutôt que l'ouverture de ports)

## Phase 6 - Supervision
- [ ] Uptime Kuma sur le serveur : alertes Discord/Telegram par service
- [ ] **Sonde externe** (UptimeRobot, Healthchecks.io ou Kuma sur un VPS) : alerte si le serveur entier tombe
- [ ] Healthchecks.io pingé par le job de sauvegarde : alerte si une sauvegarde échoue
- [ ] Alerte disque plein et température (Netdata, ou script simple)
- [ ] Optionnel : Prometheus + Grafana
- [ ] Page de statut publique `status.<domaine>`

## Phase 7 - DataFit (projet d'équipe)
- [ ] Conteneuriser backend + base de données
- [ ] Base sur un réseau Docker séparé, joignable uniquement par le backend
- [ ] Secrets dans `.env` (jamais commité), utilisateur de base avec droits minimaux
- [ ] DataFit intégré aux sauvegardes et à la supervision dès le premier jour
- [ ] Sous-domaine `datafit.<domaine>`
- [ ] Noter clairement qui a fait quoi dans le déploiement

## Phase 8 - Mes projets perso
> Isolation : un réseau Docker par projet, conteneurs non-root, `read_only` quand c'est possible, limites CPU/RAM.
- [ ] Yappli : PHP + PostgreSQL en conteneurs (Vercel/Neon gardé en secours)
- [ ] TriLama : service de tri des candidatures
- [ ] phishdetect : API branchée sur TriLama (non exposée publiquement si inutile)
- [ ] Un sous-domaine par projet exposé

## Phase 9 - Sécurité offensive / défensive avec mes outils
- [ ] PHPScan en CI sur Yappli : bloque le déploiement si faille critique
- [ ] Scanner de ports : audit externe (attendu : 0 port) et interne (comparer à `ss -tulpn`)
- [ ] Analyse de trafic : observer les flux entrants/sortants, repérer les connexions inattendues
- [ ] eBPF (projet L3) : alerte si un backend lance un shell ou ouvre une connexion inhabituelle
- [ ] Scan des images Docker avec Trivy
- [ ] Relancer Lynis et comparer au score de la Phase 2
- [ ] Rapport d'audit `docs/09-audit.md` : testé, trouvé, corrigé, avant/après

## Phase 10 - Automatisation
- [ ] Déploiement auto : GitHub Actions -> serveur via Tailscale
- [ ] Ansible pour réinstaller le serveur de zéro (tester sur une VM)
- [ ] Mises à jour des images Docker : Renovate/Dependabot sur le dépôt + mise à jour planifiée
- [ ] Objectif : serveur reconstruit depuis zéro + restauration en moins de 2 h

## Phase 11 - Valorisation
- [ ] README final : schéma d'architecture, services, choix de sécurité, captures
- [ ] Carte "Infrastructure" sur le portfolio + lien vers la page de statut
- [ ] Ligne CV : "Homelab auto-hébergé (Linux, Docker, Caddy, Cloudflare Tunnel, Tailscale, restic, supervision, audit eBPF)"
- [ ] Pitch entretien : "je l'héberge, je le sauvegarde, je le surveille, je l'audite" + une anecdote réelle (panne, alerte, faille trouvée)

---

## Pistes d'évolution
- Segmentation réseau (VLAN) si un routeur le permet
- SIEM léger (Wazuh) pour corréler les alertes
- Honeypot (Cowrie) sur une machine isolée pour observer de vraies attaques
- Second nœud pour tester la haute disponibilité
- Onduleur (UPS) avec arrêt propre automatique (NUT)