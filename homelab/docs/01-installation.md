# 01 - Installation du système

Installation faite le 15 novembre 2026.

## Matériel

| Élément | Détail |
|---|---|
| Machine | Ancien portable Asus |
| Disque | SSD Lexar 256 Go |
| Mémoire | 8 Go |
| Wi-Fi | Realtek RTL8723BE, 2,4 GHz uniquement |
| Ethernet | Realtek RTL8402, non utilisé (pas de câble) |
| Démarrage | UEFI, Secure Boot désactivé |

## Système

- Debian 13 (Trixie), image netinst 13.7.0 amd64
- Pas d'interface graphique : seulement le serveur SSH et les utilitaires de base
- Nom de la machine : `homelab`
- Utilisateur `admin` avec sudo, compte root désactivé (mot de passe root laissé vide à l'installation)

### Partitions

Partitionnement assisté sur tout le disque, une seule partition pour le système.

| Partition | Taille | Point de montage |
|---|---|---|
| sda1 | 976 Mo | /boot/efi |
| sda2 | 229,7 Go | / |
| sda3 | 7,9 Go | swap |

Je n'ai pas chiffré le disque : avec LVM chiffré, il faudrait taper une phrase de passe à chaque démarrage, et le serveur ne pourrait pas redémarrer seul après une coupure.

## Clé d'installation

L'image ISO a été écrite sur une clé USB de 32 Go avec l'outil Disques d'Ubuntu (Restaurer l'image disque).

## Problèmes rencontrés

### Mémoire pleine pendant l'installation

L'installation s'arrêtait avec `fclose: no space left on device`. Dans la console de l'installateur (Alt+F2), le SSD était bien monté avec plus de 200 Go libres, mais la mémoire vive était presque pleine (environ 117 Mo disponibles sur 8 Go). L'installateur travaille en mémoire, et quelque chose l'avait remplie. Ma piste principale est le pilote Wi-Fi Realtek, connu pour générer des erreurs PCIe en boucle sur ces portables, mais je n'ai pas pu le prouver (pas de `du` dans la console BusyBox).

Après un deuxième échec, la session était inutilisable. J'ai recommencé l'installation en passant par le partage de connexion de mon téléphone et sans environnement graphique, et elle s'est terminée.

Le noyau installé démarre avec `pcie_aspm=off pci=noaer` (visible dans `/proc/cmdline`). Ces options coupent les erreurs PCIe, je les garde.

### Demande de changement de support

L'installateur demandait en boucle d'insérer le support d'installation : la clé n'était plus montée. Je l'ai remontée à la main depuis la console :

```
mkdir -p /cdrom
mount -t iso9660 -o ro /dev/sdb1 /cdrom
mkdir -p /target/media/cdrom0
mount --bind /cdrom /target/media/cdrom0
```

### Wi-Fi non géré par NetworkManager

Après l'installation, `nmcli` affichait la carte `wlp3s0` comme "non-géré". L'installateur l'avait déclarée dans `/etc/network/interfaces` avec le réseau utilisé pendant l'installation.

Ce que j'ai fait :

- installé `firmware-realtek`, `network-manager` et `wpasupplicant`
- commenté les lignes `wlp3s0` dans `/etc/network/interfaces`
- redémarré

La carte est ensuite passée sous NetworkManager.

J'ai aussi limité la taille du journal système à 200 Mo (`SystemMaxUse=200M` dans `/etc/systemd/journald.conf.d/limite.conf`) pour qu'un pilote trop bavard ne puisse pas remplir le disque.

### Portail captif de la résidence

Le Wi-Fi de la résidence est géré par Wifirst et demande de se connecter sur une page web. Cette page a besoin de JavaScript, donc impossible de s'y connecter avec un navigateur en mode texte comme `w3m`.

J'ai exporté les requêtes de la connexion depuis Firefox (fichier HAR) pour comprendre le fonctionnement. La connexion finale est un POST vers le boîtier Wi-Fi avec des identifiants générés par Wifirst. J'aurais pu le rejouer avec `curl`, mais j'ai trouvé plus simple : Wifirst propose une "box virtuelle", c'est-à-dire un réseau Wi-Fi privé en WPA2 avec sa propre clé, sans portail. C'est cette solution que j'utilise.

### Le serveur ne voyait presque aucun réseau

`nmcli dev wifi list` n'affichait qu'un seul réseau, alors que mon PC en voyait une vingtaine, dont mon réseau privé en 2,4 GHz. C'est un problème connu du pilote `rtl8723be` qui choisit la mauvaise antenne. La correction :

```
echo "options rtl8723be ant_sel=1" | sudo tee /etc/modprobe.d/rtl8723be.conf
sudo modprobe -r rtl8723be && sudo modprobe rtl8723be
```

Attention, il faut bien écrire `options` avec un s, sinon la ligne est ignorée.

### Serveur injoignable quand l'écran est fermé

Premier problème : en fermant l'écran, le portable se mettait en veille. Corrigé dans `/etc/systemd/logind.conf` :

```
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
```

puis :

```
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

J'ai aussi désactivé l'économie d'énergie du Wi-Fi dans NetworkManager (`wifi.powersave = 2` dans `/etc/NetworkManager/conf.d/wifi-powersave.conf`).

Le serveur décrochait pourtant toujours. J'ai essayé d'ajouter `fwlps=0 ips=0 swlps=0` (désactivation des économies d'énergie du pilote) avec `ant_sel=1`, mais la carte ne trouvait plus aucun réseau. La configuration qui fonctionne finalement est :

```
options rtl8723be ant_sel=2 fwlps=0 ips=0 swlps=0
```

On peut vérifier les valeurs réellement chargées avec `grep . /sys/module/rtl8723be/parameters/*`.

Le journal a donné la vraie cause :

```
21:04:28  Lid closed.
21:05:04  CTRL-EVENT-DISCONNECTED reason=4
21:05:20  state change: activated -> failed (reason 'ssid-not-found')
```

Il n'y a pas de mise en veille : c'est le signal qui disparaît. Sur ce portable, les antennes Wi-Fi sont dans l'écran, et une fois fermé il ne capte plus rien.

Solution retenue : l'écran reste ouvert et la console s'éteint toute seule après 60 secondes (`consoleblank=60` ajouté à `GRUB_CMDLINE_LINUX_DEFAULT`, puis `update-grub`). Pour pouvoir le fermer un jour, il faudra une clé Wi-Fi USB avec antenne ou un câble Ethernet.

Bon point : quand le signal revient, le Wi-Fi et Tailscale se reconnectent seuls en une seconde environ.

J'ai aussi supprimé la connexion au réseau public de la résidence (`nmcli connection delete PlanetCampus`) pour que le serveur ne s'y accroche jamais à la place du réseau privé.

## Reste à faire

- [x] Veille désactivée
- [x] Mises à jour automatiques avec `unattended-upgrades`
- [x] Reconnexion Wi-Fi sans limite d'essais (`connection.autoconnect-retries 0`)
- [ ] Redémarrage automatique après coupure de courant dans le BIOS, si l'option existe
- [ ] IP fixe en local : impossible, la box est gérée par Wifirst. L'adresse stable est celle de Tailscale.
