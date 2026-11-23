import { describe, expect, it } from 'vitest'
import { ecrireTemps, exempleTemps, formatTemps, lireTemps } from './temps.ts'

describe('lireTemps', () => {
  it('lit les secondes, les minutes et les heures', () => {
    expect(lireTemps('10,85')).toBeCloseTo(10.85)
    expect(lireTemps('10.85')).toBeCloseTo(10.85)
    expect(lireTemps('4:30')).toBe(270)
    expect(lireTemps('4:30,5')).toBeCloseTo(270.5)
    expect(lireTemps('1:25:00')).toBe(5100)
  })

  it('ignore les espaces autour', () => {
    expect(lireTemps('  4:30 ')).toBe(270)
  })

  it('refuse ce qui n\'est pas un temps', () => {
    for (const texte of ['', 'abc', '4:5', '4:75', '1:2:3:4', '0', '0:00', '-3', '4:30:99']) {
      expect(lireTemps(texte), texte).toBeNaN()
    }
  })
})

describe('ecrireTemps', () => {
  it('écrit comme sur un chrono', () => {
    expect(ecrireTemps(270)).toBe('4:30')
    expect(ecrireTemps(245)).toBe('4:05')
    expect(ecrireTemps(5100)).toBe('1:25:00')
    expect(ecrireTemps(9.8)).toBe('9,8')
    expect(ecrireTemps(270.5)).toBe('4:30,5')
  })

  it('ne renvoie rien pour un temps nul, négatif ou absent', () => {
    expect(ecrireTemps(0)).toBe('')
    expect(ecrireTemps(-4)).toBe('')
    expect(ecrireTemps(Number.NaN)).toBe('')
  })

  it('se relit tel quel', () => {
    for (const secondes of [9.85, 59, 270, 270.5, 3725, 5100]) {
      expect(lireTemps(ecrireTemps(secondes))).toBeCloseTo(secondes, 2)
    }
  })
})

describe('formatTemps', () => {
  it('ajoute « s » sous une minute seulement', () => {
    expect(formatTemps(10.85)).toBe('10,85 s')
    expect(formatTemps(270)).toBe('4:30')
    expect(formatTemps(0)).toBe('0 s')
  })
})

describe('exempleTemps', () => {
  it('prend le rang B des paliers, ou 4:30 sans palier', () => {
    expect(exempleTemps([18, 15, 13.5, 12.5, 11.5, 10.8, 10])).toBe('12,5')
    expect(exempleTemps(undefined)).toBe('4:30')
  })
})
