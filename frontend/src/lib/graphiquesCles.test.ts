import { describe, expect, it } from 'vitest'
import { IDS_GRAPHIQUES_CLES, graphiquesCles } from './graphiquesCles.ts'

const g = (id: string) => ({ id, titre: id })

describe('graphiquesCles', () => {
  it('garde trois graphiques par sport, groupés par sport', () => {
    expect(IDS_GRAPHIQUES_CLES).toHaveLength(12)
    for (const sport of ['cardio', 'velo', 'natation', 'muscu']) {
      expect(IDS_GRAPHIQUES_CLES.filter((id) => id.startsWith(`${sport}-`)), sport).toHaveLength(3)
    }
  })

  it('écarte les graphiques qui ne sont pas essentiels', () => {
    const tous = [
      g('cardio-variationVitesse'), g('cardio-vitesseMoyKmh'), g('cardio-5km'), g('cardio-tempsMoy1kmS'),
      g('velo-tempsPauseS'), g('velo-fcMoy'), g('muscu-baisseFcApres60s'), g('muscu-dureePauseS'),
    ]
    expect(graphiquesCles(tous).map((x) => x.id)).toEqual(['cardio-vitesseMoyKmh', 'velo-fcMoy'])
  })

  it('suit toujours l\'ordre des sports, quel que soit l\'ordre de la réponse', () => {
    const melange = [g('muscu-fcMoy'), g('cardio-fcMoy'), g('natation-distanceM'), g('cardio-vitesseMoyKmh')]
    expect(graphiquesCles(melange).map((x) => x.id)).toEqual([
      'cardio-vitesseMoyKmh', 'cardio-fcMoy', 'natation-distanceM', 'muscu-fcMoy',
    ])
  })

  it('ne renvoie rien sans données, et ne plante pas', () => {
    expect(graphiquesCles([])).toEqual([])
    expect(graphiquesCles([g('cardio-5km')])).toEqual([])
  })

  it('chaque identifiant clé existe dans l\'analyse (analyse/app/graphiques.py)', () => {
    // la liste des mesures de l'analyse, recopiée : si elle change, ce test le fait remarquer
    const mesures: Record<string, string[]> = {
      cardio: ['vitesseMoyKmh', 'fcMoy', 'dureeS', 'variationVitesse', 'distanceM', 'tempsMoy1kmS'],
      velo: ['vitesseMoyKmh', 'fcMoy', 'dureeS', 'variationVitesse', 'distanceM', 'tempsPauseS'],
      natation: ['tempsMoy100mS', 'fcMoy', 'dureeS', 'variationDureeLongueurs', 'distanceM', 'dureeLongueurRapideS'],
      muscu: ['nbSeries', 'fcMoy', 'dureeS', 'dureePauseS', 'baisseFcApres60s'],
    }
    for (const id of IDS_GRAPHIQUES_CLES) {
      const [sport, mesure] = id.split('-')
      expect(mesures[sport], id).toContain(mesure)
    }
  })
})
