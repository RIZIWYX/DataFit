// Données de la page Progression, exercice par exercice. Fonctions pures, sans React.
//
// Deux sources, et seulement celles-là (rien n'est inventé) :
// - l'historique des records saisis sur la page Performance (lib/records.ts) ;
// - les séances programmées marquées comme faites (lib/programmation.ts), avec leurs séries.
import { type Exercice } from '../data/paliers.ts'
import { type Profil, rang, valeur } from './rangs.ts'
import { type HistoriqueRecords } from './records.ts'
import { type Planning, depuisIso } from './programmation.ts'

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

// le rang correspondant à chaque record (0 = E … 7 = Z)
export const pointsRang = (ex: Exercice, records: PointDate[], profil: Profil): PointDate[] =>
  records.map((point) => ({ date: point.date, valeur: rang(ex, { [ex.id]: String(point.valeur) }, profil) }))

// Ce qu'une séance faite contient pour un exercice (additionné s'il y apparaît plusieurs fois).
export interface Realisation {
  date: Date
  chargeMax: number // kg
  reps: number // répétitions au total (séries × répétitions)
  volume: number // kg soulevés au total (séries × répétitions × charge)
  tenue: number // secondes, la plus longue
  distance: number // km
  duree: number // minutes
}

export function realisations(planning: Planning, exerciceId: string): Realisation[] {
  return planning.seances
    .filter((seance) => seance.faite && seance.exercices.some((ex) => ex.exerciceId === exerciceId))
    .map((seance) => {
      const lignes = seance.exercices.filter((ex) => ex.exerciceId === exerciceId)
      const somme = (f: (ex: (typeof lignes)[number]) => number) => lignes.reduce((total, ex) => total + f(ex), 0)
      return {
        date: depuisIso(seance.debut),
        chargeMax: Math.max(0, ...lignes.map((ex) => ex.charge ?? 0)),
        reps: somme((ex) => (ex.series ?? 1) * (ex.reps ?? 0)),
        volume: somme((ex) => (ex.series ?? 1) * (ex.reps ?? 0) * (ex.charge ?? 0)),
        tenue: Math.max(0, ...lignes.map((ex) => ex.tenue ?? 0)),
        distance: somme((ex) => ex.distance ?? 0),
        duree: somme((ex) => ex.duree ?? 0),
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// Les critères qu'on peut tracer pour un exercice, selon sa façon de se mesurer.
// Un critère n'apparaît que si au moins une séance faite le renseigne.
export type Critere = 'chargeMax' | 'reps' | 'volume' | 'tenue' | 'distance' | 'duree'

export const CRITERES: Record<Critere, { titre: string; unite: string; aide: string }> = {
  chargeMax: { titre: 'Charge', unite: 'kg', aide: 'La charge la plus lourde de chaque séance.' },
  reps: { titre: 'Répétitions', unite: 'reps', aide: 'Séries × répétitions, par séance.' },
  volume: { titre: "Volume d'entraînement", unite: 'kg', aide: 'Séries × répétitions × charge, par séance.' },
  tenue: { titre: 'Tenue', unite: 's', aide: 'La tenue la plus longue de chaque séance.' },
  distance: { titre: 'Distance', unite: 'km', aide: 'La distance parcourue, par séance.' },
  duree: { titre: 'Durée', unite: 'min', aide: "Le temps passé sur l'exercice, par séance." },
}

export function criteresDisponibles(ex: Exercice, liste: Realisation[]): Critere[] {
  const prevus: Critere[] =
    ex.type === 'load' || ex.type === 'lest'
      ? ['chargeMax', 'reps', 'volume']
      : ex.type === 'hold'
        ? ['tenue']
        : ex.type === 'time'
          ? ['distance', 'duree']
          : ['reps']
  return prevus.filter((critere) => liste.some((r) => r[critere] > 0))
}

// Les points d'une liste datée, ramenés à la période : ceux de la période, précédés du dernier
// point d'avant (la courbe part alors de la valeur en vigueur au début de la période).
export function dansPeriode(points: PointDate[], debut: Date): PointDate[] {
  const avant = points.filter((p) => p.date < debut).at(-1)
  const pendant = points.filter((p) => p.date >= debut)
  return avant ? [{ date: debut, valeur: avant.valeur }, ...pendant] : pendant
}
