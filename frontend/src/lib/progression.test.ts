import { describe, expect, it } from 'vitest'
import { TOUS_LES_EXERCICES } from '../data/paliers.ts'
import { dansPeriode, pointsRang, pointsRecord } from './progression.ts'
import { avecRecordsActuels, type HistoriqueRecords } from './records.ts'

const squat = TOUS_LES_EXERCICES.find((e) => e.id === 'squat')!
const jour = (iso: string) => new Date(`${iso}T12:00`)

describe('pointsRecord', () => {
  it('trie du plus ancien au plus récent et ignore ce qui n\'est pas un nombre', () => {
    const historique: HistoriqueRecords = {
      squat: { '2026-10-20': '80', '2026-09-01': '60', '2026-10-01': 'abc', '2026-09-15': '72,5' },
    }
    expect(pointsRecord(squat, historique).map((p) => p.valeur)).toEqual([60, 72.5, 80])
  })

  it('renvoie une liste vide sans historique', () => {
    expect(pointsRecord(squat, {})).toEqual([])
  })
})

describe('dansPeriode', () => {
  const points = [
    { date: jour('2026-08-01'), valeur: 50 },
    { date: jour('2026-09-10'), valeur: 60 },
    { date: jour('2026-10-10'), valeur: 70 },
  ]

  it('part de la valeur en vigueur au début de la période', () => {
    const resultat = dansPeriode(points, jour('2026-09-20'))
    expect(resultat[0]).toEqual({ date: jour('2026-09-20'), valeur: 60 })
    expect(resultat.map((p) => p.valeur)).toEqual([60, 70])
  })

  it('garde seulement ceux de la période s\'il n\'y a rien avant', () => {
    expect(dansPeriode(points, jour('2026-07-01')).map((p) => p.valeur)).toEqual([50, 60, 70])
  })
})

describe('pointsRang', () => {
  it('donne le rang de chaque record', () => {
    const profil = { sexe: 'H' as const, poidsRef: 75 }
    const points = [
      { date: jour('2026-09-01'), valeur: 40 },
      { date: jour('2026-10-01'), valeur: 140 },
    ]
    const rangs = pointsRang(squat, points, profil).map((p) => p.valeur)
    expect(rangs[1]).toBeGreaterThan(rangs[0])
  })
})

describe('avecRecordsActuels', () => {
  it('date à aujourd\'hui un record saisi avant l\'historique, sans toucher aux autres', () => {
    const historique: HistoriqueRecords = { bench: { '2026-10-01': '50' } }
    const complet = avecRecordsActuels(historique, { squat: '80', bench: '55', dead: '  ' }, new Date(2026, 10, 15))

    expect(complet.squat).toEqual({ '2026-11-15': '80' })
    expect(complet.bench).toEqual({ '2026-10-01': '50' })
    expect(complet.dead).toBeUndefined()
  })
})
