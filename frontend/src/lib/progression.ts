// Données de la page Progression
// source : l'historique des records (records.ts)
import { type Exercice } from '../data/paliers.ts'
import { type Profil, rang, valeur } from './rangs.ts'
import { type HistoriqueRecords } from './records.ts'

export interface PointDate {
  date: Date
  valeur: number
}

// les records d'un exercice, du plus ancien au plus récent
export function pointsRecord(ex: Exercice, historique: HistoriqueRecords): PointDate[] {
  return Object.entries(historique[ex.id] ?? {})
    .map(([jour, brut]) => ({ date: new Date(`${jour}T12:00`), valeur: valeur(ex, { [ex.id]: brut }) }))
    .filter((point) => !Number.isNaN(point.valeur))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// le rang correspondant à chaque record (0 = E ... 7 = Z)
export const pointsRang = (ex: Exercice, records: PointDate[], profil: Profil): PointDate[] =>
  records.map((point) => ({ date: point.date, valeur: rang(ex, { [ex.id]: String(point.valeur) }, profil) }))

// Les points d'une liste datée, ramenés à la période : ceux de la période, précédés du dernier
// point d'avant (la courbe part alors de la valeur en vigueur au début de la période).
export function dansPeriode(points: PointDate[], debut: Date): PointDate[] {
  const avant = points.filter((p) => p.date < debut).at(-1)
  const pendant = points.filter((p) => p.date >= debut)
  return avant ? [{ date: debut, valeur: avant.valeur }, ...pendant] : pendant
}
