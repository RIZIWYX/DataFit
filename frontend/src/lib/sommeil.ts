// Les nuits mesurées par la montre, et ce qu'on peut en tirer sans rien inventer :
// horaires, durée, fréquence cardiaque nocturne et agitation. Fonctions pures.
import { type NuitBrute } from '../data/sommeil-demo.ts'

// au-delà de ce mouvement (lissé sur 5 minutes), la minute est comptée comme agitée :
// le même seuil que l'analyse de l'équipe données (SD/analyse_nuit.ipynb)
export const SEUIL_AGITATION = 0.45

export interface Nuit {
  id: string
  coucher: Date // premier relevé
  lever: Date // dernier relevé
  minutes: number
  fc: number[]
  mouvement: number[]
  fcMoyenne: number
  fcMin: number
  fcMax: number
  minutesAgitees: number
}

const moyenne = (valeurs: number[]) => valeurs.reduce((a, b) => a + b, 0) / valeurs.length

// moyenne glissante centrée sur 5 minutes
const lisser = (valeurs: number[]) =>
  valeurs.map((_, i) => moyenne(valeurs.slice(Math.max(0, i - 2), i + 3)))

export function nuits(brutes: NuitBrute[], aujourdHui: Date): Nuit[] {
  return brutes
    .map((brute, i) => {
      const [h, m] = brute.debut.split(':').map(Number)
      const coucher = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate() - brute.joursAvant, h, m)
      const minutes = brute.fc.length
      return {
        id: String(i + 1),
        coucher,
        lever: new Date(coucher.getTime() + (minutes - 1) * 60_000),
        minutes,
        fc: brute.fc,
        mouvement: brute.mouvement,
        fcMoyenne: Math.round(moyenne(brute.fc)),
        fcMin: Math.min(...brute.fc),
        fcMax: Math.max(...brute.fc),
        minutesAgitees: lisser(brute.mouvement).filter((v) => v >= SEUIL_AGITATION).length,
      }
    })
    .sort((a, b) => a.coucher.getTime() - b.coucher.getTime())
}

// heure d'une date en minutes depuis midi : 22:30 → 630, 06:30 → 1110 (la nuit ne se coupe pas à minuit)
export const minutesDepuisMidi = (date: Date) => ((date.getHours() + 12) % 24) * 60 + date.getMinutes()

// écart, en minutes, entre l'heure de coucher la plus tôt et la plus tardive
export function ecartCoucher(liste: Nuit[]): number {
  const heures = liste.map((nuit) => minutesDepuisMidi(nuit.coucher))
  return heures.length ? Math.max(...heures) - Math.min(...heures) : 0
}
