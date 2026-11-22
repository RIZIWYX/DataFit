# 04 - Sauvegardes avec restic

Fait le 22 novembre 2026.

## Pourquoi maintenant

Le serveur est un vieux portable avec un seul SSD. Avant d'y mettre de vraies données (la base de DataFit), il faut pouvoir tout récupérer après une panne de disque ou une erreur de manipulation.

J'ai choisi restic : les sauvegardes sont chiffrées, incrémentales (seuls les changements sont copiés), dédupliquées, et on peut revenir à n'importe quel snapshot.

## Installation et dépôt

```
sudo apt install restic
sudo sh -c 'openssl rand -base64 32 > /root/.restic-pass && chmod 600 /root/.restic-pass'
sudo mkdir -p /srv/backup/restic
sudo restic -r /srv/backup/restic --password-file /root/.restic-pass init
```

Le mot de passe est généré aléatoirement et n'est lisible que par root. J'en garde une copie hors du serveur : sans lui, les sauvegardes sont illisibles.

## Ce qui est sauvegardé

- `/opt/homelab` : fichiers Compose, configuration de Caddy et données des conteneurs
- `/etc` : toute la configuration du système (SSH, pare-feu, réseau, sysctl...)

Première sauvegarde : 913 fichiers, environ 1 Mo une fois compressé.

## Test de restauration

Une sauvegarde qui n'a jamais été restaurée ne prouve rien. Test fait dans un dossier temporaire :

```
sudo restic -r /srv/backup/restic --password-file /root/.restic-pass restore latest --target /tmp/test-restore --include /opt/homelab/docker-compose.yml
sudo diff /opt/homelab/docker-compose.yml /tmp/test-restore/opt/homelab/docker-compose.yml && echo "RESTAURATION OK"
```

Le fichier restauré est identique à l'original.

## Automatisation

Script `/usr/local/sbin/sauvegarde.sh` (droits 700) :

```
#!/bin/sh
set -e
export RESTIC_REPOSITORY=/srv/backup/restic
export RESTIC_PASSWORD_FILE=/root/.restic-pass
restic backup /opt/homelab /etc --exclude-caches
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
restic check
```

Il est lancé par un service et un timer systemd (`sauvegarde.service` et `sauvegarde.timer`) chaque nuit à 3h30, avec un décalage aléatoire de 15 minutes au maximum. `Persistent=true` rattrape la sauvegarde si le serveur était éteint à l'heure prévue.

Rétention : 7 sauvegardes quotidiennes, 4 hebdomadaires, 6 mensuelles. `restic check` vérifie l'intégrité du dépôt après chaque passage.

Vérifications :

```
systemctl list-timers sauvegarde.timer
journalctl -u sauvegarde.service
sudo restic -r /srv/backup/restic --password-file /root/.restic-pass snapshots
```

## Limite actuelle

Le dépôt est sur le même SSD que les données. Ça protège contre une erreur de manipulation, mais pas contre une panne du disque ou un vol du portable. La règle 3-2-1 demande au moins une copie sur une autre machine.

## Reste à faire

- [ ] Copie du dépôt hors du serveur
- [ ] Ajouter la base de données de DataFit (dump avant chaque sauvegarde) une fois le site déployé
- [ ] Alerte en cas d'échec de la sauvegarde
