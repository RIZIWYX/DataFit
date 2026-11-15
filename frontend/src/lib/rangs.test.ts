import { describe, expect, it } from 'vitest'
import { CATEGORIES, TOUS_LES_EXERCICES, type Exercice } from '../data/paliers.ts'
import {
  type Profil,
  categoriePourPoids,
  conseilProchain,
  estVerrouille,
  progression,
  rang,
  rangGlobal,
  rangMoyen,
  seuils,
  texteProchain,
  valeur,
} from './rangs.ts'

const exercice = (id: string): Exercice => {
  const ex = TOUS_LES_EXERCICES.find((e) => e.id === id)
  if (!ex) throw new Error(`exercice inconnu : ${id}`)
  return ex
}

const HOMME: Profil = { sexe: 'H', poidsRef: 75 }

describe('categoriePourPoids', () => {
  it('prend la première catégorie dont la limite n\'est pas dépassée', () => {
    const [nom, limite] = CATEGORIES.H[categoriePourPoids('H', 70)]
    expect(nom.startsWith('-')).toBe(true)
    expect(70).toBeLessThanOrEqual(limite)
  })

  it('range un poids très élevé dans la dernière catégorie', () => {
    expect(categoriePourPoids('H', 300)).toBe(CATEGORIES.H.length - 1)
    expect(categoriePourPoids('F', 300)).toBe(CATEGORIES.F.length - 1)
  })
})

describe('valeur', () => {
  it('lit un nombre avec virgule ou point, et un temps en secondes', () => {
    expect(valeur(exercice('squat'), { squat: '102,5' })).toBe(102.5)
    expect(valeur(exercice('r400'), { r400: '1:40' })).toBe(100)
  })

  it('renvoie NaN quand rien n\'est saisi', () => {
    expect(valeur(exercice('squat'), {})).toBeNaN()
    expect(valeur(exercice('squat'), { squat: '' })).toBeNaN()
  })
})

describe('rang', () => {
  it('vaut -1 sans performance', () => {
    expect(rang(exercice('pushup'), {}, HOMME)).toBe(-1)
  })

  it('compte les seuils atteints (répétitions)', () => {
    // pompes, homme : 5, 15, 30, 45, 60, 80, 100
    expect(rang(exercice('pushup'), { pushup: '4' }, HOMME)).toBe(0)
    expect(rang(exercice('pushup'), { pushup: '5' }, HOMME)).toBe(1)
    expect(rang(exercice('pushup'), { pushup: '45' }, HOMME)).toBe(4)
    expect(rang(exercice('pushup'), { pushup: '500' }, HOMME)).toBe(7)
  })

  it('un temps plus bas est meilleur', () => {
    // 100 m, homme : 18, 15, 13,5, 12,5, 11,5, 10,8, 10
    expect(rang(exercice('r100'), { r100: '20' }, HOMME)).toBe(0)
    expect(rang(exercice('r100'), { r100: '12,5' }, HOMME)).toBe(4)
    expect(rang(exercice('r100'), { r100: '9,9' }, HOMME)).toBe(7)
  })

  it('une échelle donne directement son étape, bornée de 0 à 7', () => {
    expect(rang(exercice('hspu'), { hspu: '3' }, HOMME)).toBe(3)
    expect(rang(exercice('hspu'), { hspu: '12' }, HOMME)).toBe(7)
    expect(rang(exercice('hspu'), { hspu: '-2' }, HOMME)).toBe(0)
  })

  it('une charge se rapporte au poids de la catégorie', () => {
    const lourd: Profil = { sexe: 'H', poidsRef: 100 }
    const squat = exercice('squat')
    // un seuil plus haut pour une catégorie plus lourde : le même squat vaut un rang plus bas
    expect(seuils(squat, lourd)![3]).toBeGreaterThan(seuils(squat, HOMME)![3])
    expect(rang(squat, { squat: '140' }, lourd)).toBeLessThanOrEqual(rang(squat, { squat: '140' }, HOMME))
  })
})

describe('progression', () => {
  it('est de 0 sans performance et de 100 au rang maximum', () => {
    expect(progression(exercice('pushup'), {}, HOMME)).toBe(0)
    expect(progression(exercice('pushup'), { pushup: '500' }, HOMME)).toBe(100)
  })

  it('reste entre 0 et 100 et croît avec la performance', () => {
    const a = progression(exercice('pushup'), { pushup: '20' }, HOMME)
    const b = progression(exercice('pushup'), { pushup: '28' }, HOMME)
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(100)
    expect(b).toBeGreaterThan(a)
  })
})

describe('exercice verrouillé', () => {
  it('le muscle-up lesté demande d\'avoir validé le muscle-up', () => {
    const verrouille = TOUS_LES_EXERCICES.find((e) => e.verrou)
    expect(verrouille, 'un exercice a un verrou').toBeDefined()
    const requis = verrouille!.verrou!
    expect(estVerrouille(verrouille!, {}, HOMME)).toBe(true)
    expect(estVerrouille(verrouille!, { [requis]: '100' }, HOMME)).toBe(false)
  })
})

describe('rangMoyen et rangGlobal', () => {
  it('ignorent ce qui n\'est pas renseigné', () => {
    const exos = [exercice('pushup'), exercice('dips')]
    expect(rangMoyen(exos, {}, HOMME)).toBe(-1)
    // 30 pompes atteignent 3 seuils (5, 15, 30) : rang 3 ; les dips non renseignés sont ignorés
    expect(rangMoyen(exos, { pushup: '30' }, HOMME)).toBe(3)
  })

  it('rangGlobal exige au moins 5 disciplines travaillées', () => {
    const resume = (rangs: number[]) => rangs.map((r) => ({ rang: r })) as Parameters<typeof rangGlobal>[0]
    expect(rangGlobal(resume([3, 3, 3, 3])).rang).toBe(-1)
    expect(rangGlobal(resume([3, 3, 3, 3, 3])).rang).toBe(3)
    // une discipline sans exercice renseigné (rang -1) ne fait pas baisser la moyenne
    expect(rangGlobal(resume([2, 4, 3, 3, 3, -1, -1])).rang).toBe(3)
  })
})

describe('texteProchain', () => {
  it('dit ce qu\'il reste à faire', () => {
    expect(texteProchain(exercice('pushup'), {}, HOMME, ['E', 'D'])).toBe('Pas encore renseigné.')
    expect(texteProchain(exercice('pushup'), { pushup: '500' }, HOMME, [])).toBe('Palier max atteint.')
    expect(texteProchain(exercice('pushup'), { pushup: '10' }, HOMME, ['E', 'D', 'C'])).toContain('5 reps à prendre')
  })

  it('pour une échelle, annonce l\'étape suivante', () => {
    const texte = texteProchain(exercice('hspu'), { hspu: '1' }, HOMME, ['E', 'D', 'C', 'B'])
    expect(texte).toContain('Pike push-up pieds surélevés')
  })
})

describe('handstand : tenue libre (secondes) et échelle des HSPU', () => {
  it('sont deux exercices distincts', () => {
    expect(exercice('hs').type).toBe('hold')
    expect(exercice('hspu').type).toBe('ladder')
    // l'échelle ne contient plus de tenue : seulement des poussées
    expect(exercice('hspu').etapes!.join(' ')).not.toMatch(/ATR/)
  })

  it('la tenue se range comme le L-sit : un rang par seuil atteint', () => {
    // seuils : 3, 10, 20, 30, 45, 60, 90 secondes
    expect(rang(exercice('hs'), { hs: '2' }, HOMME)).toBe(0)
    expect(rang(exercice('hs'), { hs: '3' }, HOMME)).toBe(1)
    expect(rang(exercice('hs'), { hs: '25' }, HOMME)).toBe(3)
    expect(rang(exercice('hs'), { hs: '90' }, HOMME)).toBe(7)
    expect(texteProchain(exercice('hs'), { hs: '25' }, HOMME, ['E', 'D', 'C', 'B', 'A'])).toContain('5 s à prendre')
  })

  it('les deux sont indépendants : une tenue ne change pas l\'étape des HSPU', () => {
    const perfs = { hs: '60', hspu: '1' }
    expect(rang(exercice('hs'), perfs, HOMME)).toBe(6)
    expect(rang(exercice('hspu'), perfs, HOMME)).toBe(1)
  })
})

describe('conseilProchain (handstand, OAP)', () => {
  it('donne le conseil de l\'étape suivante et le rythme du niveau', () => {
    const conseil = conseilProchain(exercice('hspu'), 1, 'novice')
    expect(conseil?.etape).toContain('surélevés')
    expect(conseil?.rythme).toContain('novice')
    expect(conseilProchain(exercice('hs'), 2, 'novice')?.etape).toContain('20 s')
    expect(conseilProchain(exercice('oap'), 3, 'confirmer')?.rythme).toContain('confirmé')
  })

  it('prend le niveau intermédiaire quand le niveau est inconnu', () => {
    expect(conseilProchain(exercice('oap'), 0, '')?.rythme).toContain('intermédiaire')
  })

  it('n\'a pas de conseil sans performance, au rang maximum, ou hors échelle', () => {
    expect(conseilProchain(exercice('hspu'), -1, 'novice')).toBeNull()
    expect(conseilProchain(exercice('hspu'), 7, 'novice')).toBeNull()
    expect(conseilProchain(exercice('pushup'), 2, 'novice')).toBeNull()
    expect(conseilProchain(exercice('fl'), 2, 'novice')).toBeNull() // pas de conseils écrits pour cette échelle
  })

  it('a un conseil écrit pour chacune des 7 étapes à atteindre', () => {
    for (const id of ['hspu', 'oap', 'hs']) {
      const ex = exercice(id)
      for (let etape = 1; etape <= 7; etape++) {
        expect(ex.conseils?.[etape], `${id} étape ${etape}`).toBeTruthy()
      }
      expect(ex.conseils, id).toHaveLength(8) // un conseil par rang, de E à Z
    }
  })
})
