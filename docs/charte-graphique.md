# Charte graphique DataFit

Noir, turquoise, blanc. Toutes les pages du site suivent cette charte ; la page de garde et l'accueil (tableau de bord) en sont la référence.

## Principe : le turquoise est un signal

Le fond est noir, le texte blanc, et le turquoise, la couleur du logo, reste rare pour rester visible. Il marque :

- l'action principale d'un écran (un seul bouton turquoise plein) ;
- la page en cours dans la navigation ;
- aujourd'hui, dans la bande des jours et le calendrier ;
- une hausse dans les chiffres clés ;
- le rang le plus haut (Z) ;
- le point qui termine les grands titres (« Vos progrès**.** »), la signature de la charte.

Le turquoise ne sert jamais de couleur de sport ni de couleur décorative. Sur un fond turquoise, le texte est toujours noir : le blanc y serait illisible.

## Logo

Le symbole « D » (une courbe de progression) tient lieu de première lettre : il est suivi de « ata » en blanc et de « fit » dans le dégradé du symbole. Le symbole est une image, `frontend/public/logo.webp` ; le nom est du texte, dans la police du site. Sur tablette, quand la barre de navigation est réduite, seul le symbole reste.

| Fichier (`frontend/public/`) | Usage |
|---|---|
| `logo.webp` | le symbole détouré, dans l'interface (composant `Logo`) |
| `favicon.png` | l'icône de l'onglet du navigateur (64 px, carré noir arrondi) |
| `apple-touch-icon.png` | l'icône ajoutée à l'écran d'accueil d'un téléphone (180 px, fond noir) |

## Couleurs

Toutes les couleurs sont des variables CSS, déclarées une seule fois dans `frontend/src/styles/charte.css`.

| Rôle | Variable | Valeur | Usage |
|---|---|---|---|
| Noir | `--noir` | `#09090a` | fond des pages |
| | `--noir-1` | `#111113` | panneaux |
| | `--noir-2` | `#19191c` | survol, champs, éléments posés sur un panneau |
| | `--noir-3` | `#222226` | éléments éteints (jour sans séance) |
| | `--trait` / `--trait-fort` | `#26262b` / `#3a3a41` | séparateurs / bordures de boutons et champs |
| Blanc | `--blanc` | `#f7f7f8` | texte principal |
| | `--gris` | `#a4a4ad` | texte secondaire (7,6:1 sur un panneau) |
| | `--gris-2` | `#82828b` | étiquettes, axes, notes (5,5:1) |
| Turquoise | `--turquoise` | `#0cd0d0` | boutons et repères (texte noir dessus : 10:1) ; texte d'accent sur fond noir (9,8:1) |
| | `--turquoise-survol` | `#4adcdc` | bouton principal survolé |
| | `--turquoise-voile` | turquoise à 14 % | fond des étiquettes turquoise |
| États | `--vert` / `--ambre` | `#3ecf8e` / `#f5b83d` | connecté, réussi / attention |
| | `--erreur` | `#ff5c5c` | message d'erreur, bouton de suppression survolé (6,2:1) |

### Sports

Sur fond noir, les trois sports ont trois teintes et trois clartés bien séparées (gris clair, orange, bleu) : ils restent distincts pour les daltoniens, et aucun ne se confond avec le turquoise du signal. La fonction `couleurSport()` de `data/sports.ts` renvoie la bonne variable.

| Sport | Variable | Valeur |
|---|---|---|
| Musculation | `--sport-musculation` | `#e4e4e7` |
| Course à pied | `--sport-course` | `#ff8a3d` |
| Natation | `--sport-natation` | `#6e8bff` |

## Typographie

Une seule famille, **Archivo**, servie par le site (paquet `@fontsource-variable/archivo`, version à largeur variable) : aucun appel à Google Fonts. On fait varier sa largeur plutôt que de multiplier les polices.

| Classe | Réglage | Usage |
|---|---|---|
| `.affiche` | largeur 125 %, graisse 850 | grands titres de la page de garde |
| `.titre-page` | largeur 118 %, graisse 800 | titre d'une page de l'application, suivi du point turquoise |
| `.chiffre` | largeur 110 %, graisse 750, chiffres tabulaires | chiffres clés |
| `.surtitre` | capitales espacées, 0,72 rem | petite étiquette au-dessus d'un titre |
| texte courant | largeur 100 %, graisse 400 | |

## Navigation

- **Ordinateur** (≥ 1100 px) : barre latérale noire, pages groupées. *Accueil*, puis *Entraînement* (Programmation, Historique, Progression, Performance) et *Suivi* (Sommeil, Montre). En bas, l'utilisateur : son profil, et la déconnexion, qui est une action et pas une page.
- **Tablette** (700 à 1099 px) : la même barre réduite aux icônes, le nom de la page en infobulle.
- **Téléphone** (< 700 px) : barre du haut (logo, avatar) et quatre onglets en bas (Accueil, Programmation, Historique, Progression). « Plus » ouvre un panneau avec les autres pages et la déconnexion.

## Composants

| Composant / classe | Rôle |
|---|---|
| `Logo` | symbole « D » suivi du nom ; lu « DataFit » par les lecteurs d'écran |
| `TitrePage` | surtitre, titre avec point turquoise, phrase, actions |
| `Panneau` (`.panneau`) | bloc de contenu : titre court en capitales, action à droite |
| `.bouton` | action principale, turquoise ; variantes `.secondaire`, `.contour`, `.fantome`, `.petit` |
| `LienFleche` | lien d'action discret suivi d'une flèche |
| `Indicateur` | chiffre clé, unités en petit, écart avec la période précédente |
| `CarteSeance` | grande carte d'une séance (dernière faite, prochaine prévue) : photo de la discipline en noir et blanc, chiffres clés, lien |
| `ListeSeances`, `.liste-lignes` | lignes cliquables séparées par un trait |
| `LegendeSports` | pastilles de couleur des sports, sous un graphique ou à côté d'un filtre |
| `.etiquette` | état en quelques mots ; `.turquoise` pour le mettre en avant |
| `.voyant` | point d'état, vert quand actif |
| `EtatVide` | absence de données : cadre pointillé, explication et suite possible |
| `Segments` | choix exclusif entre quelques options visibles (filtres, vues, étapes) ; l'option choisie passe en blanc |
| `Fenetre` | fenêtre modale (`<dialog>`) ; sur téléphone, elle monte du bas de l'écran |
| `Jauge` | barre de progression fine (objectifs) |
| `.tableau-donnees` | tableau de chiffres : en-têtes en petites capitales, chiffres alignés |
| `.champ`, `.champs-ligne` | un champ de formulaire avec son nom au-dessus ; plusieurs petits champs sur une ligne |
| `.alerte` | erreur, en rouge d'état |

Graphiques : `GrapheColonnes`, `GrapheLigne` et `GrapheAnneau` lisent les variables `--d-*`, traduites en noir dans `charte.css`. La fréquence cardiaque et les records sont les seules courbes en turquoise ; les sports gardent leur couleur ; une série neutre est blanche.

Toutes les pages portent la classe `.refonte`, qui applique la charte (page de garde, connexion, pages légales, application et fenêtres modales).

## Pages

| Page | Contenu |
|---|---|
| Accueil | les 7 derniers jours (chiffres clés et bande des jours), la dernière séance et la prochaine séance prévue côte à côte, puis les objectifs, les rangs et la montre, et les séances précédentes |
| Programmation | programmes (modèles de séances) et calendrier (leurs occurrences) : vues mois, semaine et jour, filtre par programme, création à une date et une heure, déplacement par glisser-déposer, fiche au clic, séance « faite » |
| Historique | toutes les séances, montre et programmation réunies : recherche, filtres, tri, regroupement par mois |
| Progression | vue d'ensemble des séances (comparée à la période précédente) ou un exercice choisi dans le menu : seuls les graphiques que les données permettent de calculer sont affichés |
| Performance | l'ancienne page « Sport », renommée (l'adresse `/sport` mène à `/performance`) |
| Sommeil | horaires, durée, fréquence cardiaque et agitation des nuits ; pas de phases de sommeil, que la montre ne mesure pas |
| Montre | état, synchronisation, mesures transmises (et celles qui ne le sont pas), données reçues |
| Profil | informations en lecture, modifiables une par une (crayon) ; objectifs par discipline, en cours, atteints ou abandonnés |

## D'où viennent les données

Rien n'est inventé à l'écran : chaque graphique ne montre que ce qui est mesuré ou saisi. En attendant le backend, les séances de la montre et les nuits viennent de fichiers d'exemple.

| Donnée | Source | Gardée dans |
|---|---|---|
| Séances de la montre | exemple, `data/seances.ts` (`SEANCES_DEMO`) | — |
| Nuits | exemple, `data/sommeil-demo.ts`, généré depuis `SD/sommeil_mesures.csv` | — |
| Records et rangs | saisis dans Performance ; chaque record est daté (une valeur par jour) pour la Progression | navigateur (`datafit-rangs`, `datafit-records`) |
| Programmes et séances planifiées | créés dans Programmation ; une séance « faite » compte dans l'Historique et la Progression | navigateur (`datafit-programmation`) |
| Objectifs | fixés dans le Profil ; l'avancement vient des records ou des séances | navigateur (`datafit-objectifs`) |
| Profil | saisi dans le Profil | navigateur (`datafit-profil`) |

La connexion ne vérifie pas encore les identifiants, et la déconnexion ramène à la page de connexion (`hooks/useDeconnexion.ts`) : c'est là qu'il faudra brancher le backend.

## Accessibilité

- Contrastes de texte vérifiés (au moins 4,5:1).
- Focus clavier toujours visible : contour blanc.
- Les animations (points qui circulent sur les orbites de la page de garde) s'arrêtent si l'utilisateur a demandé à réduire les animations.
