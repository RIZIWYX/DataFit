# 02 - Sécurisation

Fait le 15 novembre 2026.

## Principe

L'administration du serveur ne passe que par Tailscale, et SSH n'accepte que les clés. Même si `sshd` écoute sur toutes les interfaces, le pare-feu ne le laisse passer que sur l'interface Tailscale.

## Accès à distance avec Tailscale

Je n'ai pas accès à la box de la résidence, donc pas question d'ouvrir un port. De toute façon, je ne voulais pas exposer SSH sur Internet. Tailscale crée un réseau privé chiffré entre mes appareils : je peux me connecter avec `ssh admin@homelab` depuis n'importe quel réseau.

```
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

## SSH

Copie de ma clé depuis mon PC :

```
ssh-copy-id admin@homelab
```

Puis désactivation du mot de passe et de root dans `/etc/ssh/sshd_config.d/10-durcissement.conf` :

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

Et quelques réglages suggérés par Lynis dans `/etc/ssh/sshd_config.d/20-lynis.conf` :

```
MaxAuthTries 3
MaxSessions 4
LogLevel VERBOSE
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no
ClientAliveCountMax 2
AllowUsers admin
```

Avant chaque rechargement, je vérifie la configuration avec `sudo sshd -t`, et je garde une session ouverte pendant les tests.

Vérifications faites : connexion par clé sans mot de passe, et `ssh -o PubkeyAuthentication=no admin@homelab` refusé avec `Permission denied (publickey)`.

## Pare-feu

```
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow in on tailscale0 to any port 22 proto tcp
sudo ufw enable
```

SSH n'est donc pas joignable depuis le Wi-Fi local, seulement par Tailscale (IPv4 et IPv6).

## fail2ban

Installé avec la règle `sshd` par défaut. J'ai copié `jail.conf` en `jail.local` pour que mes réglages ne soient pas écrasés par les mises à jour.

## Autres mesures

- Services inutiles désactivés : `ModemManager` et `bluetooth`
- Outils ajoutés : `needrestart`, `libpam-tmpdir`, `apt-listbugs`, `debsums`, `rkhunter`
- Durcissement du noyau dans `/etc/sysctl.d/90-durcissement.conf` :

```
kernel.kptr_restrict = 2
kernel.sysrq = 0
kernel.unprivileged_bpf_disabled = 1
net.core.bpf_jit_harden = 2
kernel.yama.ptrace_scope = 1
dev.tty.ldisc_autoload = 0
fs.protected_fifos = 2
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.conf.all.send_redirects = 0
```

## Ports ouverts

Résultat de `sudo ss -tulpn` :

| Port | Service | Remarque |
|---|---|---|
| 22/tcp | sshd | Filtré par ufw, seulement via Tailscale |
| 41641/udp | tailscaled | Tunnel Tailscale |
| Ports internes | tailscaled | Uniquement sur l'adresse Tailscale |

Rien d'autre n'écoute.

## Audit Lynis

| | Score |
|---|---|
| Avant durcissement | 67 / 100 |
| Après durcissement | 78 / 100 |

Aucun avertissement dans les deux cas. Après les changements, Lynis détecte aussi un scanner de malware (rkhunter).

### Suggestions que je n'ai pas appliquées

- Changer le port SSH : inutile puisque SSH n'est accessible que par Tailscale.
- Mettre `/home` et `/var` sur des partitions séparées : il faudrait tout réinstaller.
- `rp_filter = 1` et `modules_disabled = 1` : risque de casser Tailscale et Docker.
- `unprivileged_bpf_disabled = 1` est appliqué, mais je le réévaluerai quand je travaillerai sur la partie eBPF.

## Points à surveiller

- Mon réseau Tailscale contient aussi les machines d'autres membres de l'équipe. Par défaut, ils peuvent joindre le serveur. Il faudra écrire une règle d'accès (ACL) dans la console Tailscale si ce n'est pas voulu.
- Si Tailscale tombe, il reste l'accès direct avec l'écran et le clavier du portable.
