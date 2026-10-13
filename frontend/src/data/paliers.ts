// Barèmes des rangs E → Z : catégories de poids, disciplines, exercices et seuils.
// Pour ajuster un palier, on modifie seulement ce fichier.

export type Sexe = 'H' | 'F'

// Façon de mesurer la perf :
// load = charge sur la barre (kg) · lest = kg ajoutés au poids du corps
// reps = répétitions · hold = tenue en secondes · time = temps (plus bas = mieux)
// dist = distance en mètres · ladder = étape de progression (0 à 7)
export type TypeMesure = 'load' | 'lest' | 'reps' | 'hold' | 'time' | 'dist' | 'ladder'

export interface Exercice {
  id: string
  nom: string
  type: TypeMesure
  unite?: string
  // 7 seuils (rangs D à Z). Pour load et lest : ratios du poids de corps,
  // ajustés ensuite à la catégorie (voir lib/rangs.ts). Sinon : valeurs brutes.
  H?: number[]
  F?: number[]
  // pour type ladder : les 8 étapes, de E à Z
  etapes?: string[]
  // id d'un exercice qu'il faut avoir validé (rang ≥ D) pour débloquer celui-ci
  verrou?: string
}

export interface Discipline {
  id: string
  nom: string
  exercices: Exercice[]
}

export const RANGS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'Z'] as const
export const NOMS_RANGS = [
  'Éclaté au sol',
  'Débutant',
  'Confirmé',
  'Costaud',
  'Fort',
  'Monstre',
  'Double monstre',
  'GOAT',
] as const

// Catégories : limites L_k = L_0 × 1,15^k (L_0 = 50 kg hommes, 45 kg femmes).
// Le 2e nombre est le poids de référence utilisé dans les calculs (limite haute ;
// pour la catégorie « + », un palier de 15 % de plus).
export const CATEGORIES: Record<Sexe, [string, number][]> = {
  H: [['-50', 50], ['-58', 58], ['-66', 66], ['-76', 76], ['-87', 87], ['-101', 101], ['-116', 116], ['-133', 133], ['+133', 150]],
  F: [['-45', 45], ['-52', 52], ['-60', 60], ['-68', 68], ['-79', 79], ['-91', 91], ['-104', 104], ['+104', 120]],
}

// Poids de calibrage : les ratios sont exacts à ce poids de corps.
export const POIDS_CALIBRAGE: Record<Sexe, number> = { H: 75, F: 60 }

export const DISCIPLINES: Discipline[] = [
  {
    id: 'sbd',
    nom: 'SBD',
    exercices: [
      { id: 'bench', nom: 'Développé couché', type: 'load', H: [0.5, 0.75, 1, 1.35, 1.65, 2, 2.4], F: [0.3, 0.5, 0.7, 0.9, 1.1, 1.35, 1.6] },
      { id: 'squat', nom: 'Squat', type: 'load', H: [0.75, 1, 1.5, 2, 2.5, 3, 3.6], F: [0.5, 0.75, 1.1, 1.5, 1.9, 2.3, 2.75] },
      { id: 'dead', nom: 'Soulevé de terre', type: 'load', H: [1, 1.25, 1.8, 2.3, 2.8, 3.4, 4], F: [0.75, 1, 1.4, 1.8, 2.3, 2.75, 3.2] },
    ],
  },
  {
    id: 'street',
    nom: 'Streetlifting',
    exercices: [
      { id: 'pullw', nom: 'Traction lestée', type: 'lest', H: [0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1.1], F: [0.03, 0.08, 0.18, 0.3, 0.45, 0.6, 0.8] },
      { id: 'dipw', nom: 'Dips lesté', type: 'lest', H: [0.1, 0.3, 0.5, 0.75, 1, 1.3, 1.6], F: [0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1.15] },
      { id: 'pushw', nom: 'Pompe lestée', type: 'lest', H: [0.1, 0.25, 0.4, 0.6, 0.8, 1, 1.25], F: [0.05, 0.15, 0.25, 0.4, 0.55, 0.7, 0.9] },
      { id: 'muw', nom: 'Muscle-up lesté', type: 'lest', H: [0.03, 0.08, 0.15, 0.25, 0.38, 0.5, 0.65], F: [0.02, 0.05, 0.1, 0.16, 0.25, 0.33, 0.42], verrou: 'mu' },
    ],
  },
  {
    id: 'halt',
    nom: 'Haltérophilie',
    exercices: [
      { id: 'snatch', nom: 'Arraché', type: 'load', H: [0.5, 0.75, 1, 1.25, 1.5, 1.8, 2.1], F: [0.35, 0.5, 0.7, 0.9, 1.1, 1.3, 1.55] },
      { id: 'cj', nom: 'Épaulé-jeté', type: 'load', H: [0.6, 0.9, 1.2, 1.5, 1.85, 2.2, 2.55], F: [0.45, 0.65, 0.9, 1.15, 1.4, 1.65, 1.95] },
    ],
  },
  {
    id: 'cali',
    nom: 'Calisthenics',
    exercices: [
      { id: 'pushup', nom: 'Pompes', type: 'reps', H: [5, 15, 30, 45, 60, 80, 100], F: [2, 8, 18, 30, 40, 55, 70] },
      { id: 'dips', nom: 'Dips', type: 'reps', H: [3, 10, 20, 30, 40, 50, 60], F: [1, 5, 10, 18, 25, 32, 40] },
      { id: 'pistol', nom: 'Pistol squat', type: 'reps', unite: 'reps par jambe', H: [1, 3, 8, 15, 25, 35, 50], F: [1, 3, 8, 12, 20, 30, 40] },
      { id: 'pullup', nom: 'Tractions', type: 'reps', H: [1, 5, 10, 15, 22, 30, 40], F: [1, 3, 6, 10, 15, 20, 28] },
      { id: 'mu', nom: 'Muscle-up', type: 'reps', H: [1, 3, 5, 8, 12, 16, 20], F: [1, 2, 3, 5, 8, 10, 15] },
      { id: 'lsit', nom: 'L-sit', type: 'hold', H: [3, 10, 20, 30, 45, 60, 90], F: [3, 10, 20, 30, 45, 60, 90] },
      { id: 'hspu', nom: 'Handstand / HSPU', type: 'ladder', etapes: ['Rien encore', 'Pike push-up ×10', 'ATR contre le mur 30 s', '1 HSPU contre le mur', 'ATR libre 10 s ou 5 HSPU mur', '1 HSPU libre', '5 HSPU libres', '90° push-up'] },
      { id: 'fl', nom: 'Front lever', type: 'ladder', etapes: ['Rien encore', 'Tuck 5 s', 'Tuck 15 s', 'Advanced tuck 10 s', 'One leg ou straddle 5 s', 'Full 3 s', 'Full 10 s', 'Full 20 s ou 5 front lever pull-ups'] },
      { id: 'oap', nom: 'Traction à un bras (OAP)', type: 'ladder', etapes: ['Moins de 10 tractions', '10 tractions strictes', 'Tractions archer ×5', 'OAP assistée (serviette, doigt)', 'Négative à un bras 5 s', '1 OAP', '3 OAP chaque bras', '5+ OAP chaque bras'] },
      { id: 'flag', nom: 'Drapeau (human flag)', type: 'ladder', etapes: ['Rien encore', 'Drapeau vertical 10 s', 'Tuck flag 5 s', 'Straddle 3 s', 'Straddle 10 s', 'Full 3 s', 'Full 10 s', 'Full 20 s ou flag press'] },
      { id: 'planche', nom: 'Planche', type: 'ladder', etapes: ['Rien encore', 'Frog stand 30 s', 'Tuck 10 s', 'Advanced tuck 10 s', 'Straddle 3 s', 'Straddle 10 s ou full 3 s', 'Full 5 s', 'Full 15 s ou planche push-ups'] },
      { id: 'cross', nom: 'Crucifix (anneaux)', type: 'ladder', etapes: ['Rien encore', 'Support anneaux 30 s', 'Support RTO 30 s', 'Cross avec élastique', 'Cross partielle (bras à 45°)', 'Iron cross 2 s', 'Iron cross 5 s', 'Iron cross 10 s ou maltese'] },
    ],
  },
  {
    id: 'athle',
    nom: 'Athlétisme',
    exercices: [
      { id: 'r100', nom: '100 m', type: 'time', H: [18, 15, 13.5, 12.5, 11.5, 10.8, 10], F: [21, 18, 16, 14.5, 13.2, 12.2, 11.2] },
      { id: 'r400', nom: '400 m', type: 'time', H: [100, 80, 70, 62, 56, 50, 46], F: [115, 95, 82, 72, 64, 57, 52] },
      { id: 'r800', nom: '800 m', type: 'time', H: [240, 195, 165, 145, 130, 118, 108], F: [270, 225, 195, 170, 150, 135, 124] },
      { id: 'r1500', nom: '1500 m', type: 'time', H: [480, 390, 330, 290, 260, 235, 220], F: [540, 450, 390, 345, 305, 275, 250] },
      { id: 'r5k', nom: '5 km', type: 'time', H: [2100, 1680, 1440, 1260, 1110, 990, 870], F: [2400, 1920, 1650, 1440, 1260, 1110, 990] },
      { id: 'r10k', nom: '10 km', type: 'time', H: [4200, 3480, 3000, 2640, 2340, 2100, 1860], F: [4800, 3960, 3420, 3000, 2640, 2340, 2100] },
      { id: 'r21k', nom: 'Semi-marathon (21,1 km)', type: 'time', H: [9000, 7500, 6300, 5580, 4920, 4380, 3900], F: [10200, 8400, 7200, 6300, 5520, 4920, 4380] },
      { id: 'r42k', nom: 'Marathon', type: 'time', H: [19800, 16200, 13500, 11700, 10200, 9000, 8100], F: [21600, 18000, 15300, 13200, 11700, 10200, 9000] },
      { id: 'tri', nom: 'Triathlon (olympique)', type: 'time', H: [13500, 11400, 9900, 9000, 8100, 7500, 6600], F: [15300, 12600, 11100, 9900, 9000, 8280, 7500] },
      { id: 'iron', nom: 'Ironman', type: 'time', H: [61200, 54000, 46800, 41400, 36000, 32400, 29700], F: [61200, 57600, 50400, 45000, 39600, 35400, 32400] },
      { id: 'long', nom: 'Saut en longueur', type: 'dist', H: [3, 4, 4.8, 5.5, 6.2, 7, 7.8], F: [2.5, 3.2, 3.9, 4.5, 5.1, 5.8, 6.5] },
      { id: 'haut', nom: 'Saut en hauteur', type: 'dist', H: [1, 1.25, 1.45, 1.6, 1.8, 2, 2.2], F: [0.9, 1.1, 1.25, 1.4, 1.55, 1.7, 1.85] },
    ],
  },
  {
    id: 'nat',
    nom: 'Natation',
    exercices: [
      { id: 'crawl', nom: 'Crawl', type: 'time', unite: '100 m', H: [150, 120, 95, 80, 68, 58, 52], F: [170, 135, 108, 90, 76, 64, 57] },
      { id: 'dos', nom: 'Dos', type: 'time', unite: '100 m', H: [165, 135, 105, 90, 76, 64, 57], F: [185, 150, 120, 100, 84, 70, 63] },
      { id: 'pap', nom: 'Papillon', type: 'time', unite: '100 m', H: [170, 135, 105, 88, 72, 60, 54], F: [190, 150, 118, 98, 82, 67, 60] },
      { id: 'brasse', nom: 'Brasse', type: 'time', unite: '100 m', H: [180, 145, 115, 100, 85, 70, 62], F: [200, 165, 130, 112, 95, 79, 70] },
    ],
  },
  {
    id: 'soup',
    nom: 'Souplesse',
    exercices: [
      { id: 'gef', nom: 'Grand écart facial', type: 'ladder', etapes: ['Bassin à plus de 50 cm du sol', 'Bassin à 40–50 cm', 'Bassin à 30–40 cm', 'Bassin à 20–30 cm', 'Bassin à 10–20 cm', 'Bassin à moins de 10 cm', 'Grand écart au sol', 'Oversplit (pieds surélevés de 20 cm)'] },
      { id: 'geap', nom: 'Grand écart antéro-postérieur', type: 'ladder', etapes: ['Bassin à plus de 50 cm du sol', 'Bassin à 40–50 cm', 'Bassin à 30–40 cm', 'Bassin à 20–30 cm', 'Bassin à 10–20 cm', 'Bassin à moins de 10 cm', 'Grand écart au sol, bassin de face', 'Oversplit (pied avant surélevé de 20 cm)'] },
      { id: 'toed', nom: 'Toucher orteils · debout', type: 'ladder', etapes: ['Mains au-dessus des tibias', 'Mains à mi-tibias', 'Mains aux chevilles', 'Bout des doigts sur les orteils', 'Doigts à plat au sol', 'Paumes à plat au sol', 'Mains à plat derrière les talons', 'Ventre collé aux cuisses, poignets au sol'] },
      { id: 'toes', nom: 'Toucher orteils · assis (pike)', type: 'ladder', etapes: ['Mains aux genoux', 'Mains à mi-tibias', 'Mains aux chevilles', 'Attrape les orteils', 'Attrape la plante des pieds', 'Mains 10 cm au-delà des pieds', 'Torse posé sur les cuisses', 'Front sur les tibias, compression totale'] },
    ],
  },
]

export const TOUS_LES_EXERCICES = DISCIPLINES.flatMap((d) => d.exercices)
