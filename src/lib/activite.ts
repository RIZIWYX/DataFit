// Regroupement des séances par semaine. Fonctions pures : aucune dépendance à React.
import { type Seance } from '../data/seances.ts'
import { LISTE_SPORTS, type Sport } from '../data/sports.ts'

const JOUR = 24 * 60 * 60 * 1000

export interface Semaine {
  debut: Date
  fin: Date
  parSport: Record<Sport, number> // nombre de séances de chaque sport
  total: number // nombre de séances
  minutes: number // durée totale des séances
}

const debutDuJour = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const decaler = (date: Date, jours: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + jours)

// Nombre de jours entre une date et aujourd'hui (0 = aujourd'hui, 1 = hier…).
export function joursEcoules(date: Date, aujourdHui: Date): number {
  return Math.round((debutDuJour(aujourdHui).getTime() - debutDuJour(date).getTime()) / JOUR)
}

// Les séances des n dernières semaines (n × 7 jours, aujourd'hui compris).
export function dansLaPeriode(seances: Seance[], nbSemaines: number, aujourdHui: Date): Seance[] {
  return seances.filter((seance) => {
    const jours = joursEcoules(seance.date, aujourdHui)
    return jours >= 0 && jours < nbSemaines * 7
  })
}

// Les n dernières semaines, de la plus ancienne à la plus récente. Ce sont des
// semaines glissantes de 7 jours : la dernière finit aujourd'hui.
export function parSemaine(seances: Seance[], nbSemaines: number, aujourdHui: Date): Semaine[] {
  const semaines: Semaine[] = Array.from({ length: nbSemaines }, (_, i) => {
    const recul = (nbSemaines - 1 - i) * 7
    return {
      debut: decaler(aujourdHui, -recul - 6),
      fin: decaler(aujourdHui, -recul),
      parSport: Object.fromEntries(LISTE_SPORTS.map((sport) => [sport, 0])) as Record<Sport, number>,
      total: 0,
      minutes: 0,
    }
  })

  for (const seance of dansLaPeriode(seances, nbSemaines, aujourdHui)) {
    const jours = joursEcoules(seance.date, aujourdHui)
    const semaine = semaines[nbSemaines - 1 - Math.floor(jours / 7)]
    semaine.parSport[seance.sport] += 1
    semaine.total += 1
    semaine.minutes += seance.dureeMin
  }
  return semaines
}

// Graduations d'un axe en nombres ronds, de la plus haute à la plus basse.
// On vise environ quatre intervalles entre le minimum et le maximum.
// pasMinimum : 1 pour un axe qui compte des choses entières (des séances).
export function graduations(minimum: number, maximum: number, pasMinimum = 0): number[] {
  const brut = Math.max(maximum - minimum, 1e-9) / 4
  const puissance = 10 ** Math.floor(Math.log10(brut))
  const rond = [1, 2, 5, 10].map((facteur) => facteur * puissance).find((p) => p >= brut) ?? brut
  const pas = Math.max(rond, pasMinimum)
  const bas = Math.floor(minimum / pas) * pas
  const haut = Math.max(Math.ceil(maximum / pas) * pas, bas + pas)
  const valeurs: number[] = []
  for (let valeur = haut; valeur > bas - pas / 2; valeur -= pas) {
    valeurs.push(Math.round(valeur * 1000) / 1000)
  }
  return valeurs
}
