// Détail d'une séance, minute par minute.
// Démonstration : ces courbes sont fabriquées à partir de la durée, de la distance et de la
// fréquence cardiaque moyenne de la séance. Elles seront remplacées par les mesures de la montre.
// Le tirage dépend de l'identifiant de la séance : une même séance donne toujours les mêmes courbes.
import { type Seance } from '../data/seances.ts'

export interface DetailSeance {
  fc: number[] // battements par minute, une valeur par minute
  // course à pied seulement :
  allure?: number[] // secondes par kilomètre, une valeur par minute
  kilometres?: number[] // temps de chaque kilomètre complet, en secondes
  vitesses?: { libelle: string; minutes: number }[] // temps passé dans chaque tranche de vitesse
}

// générateur de nombres « au hasard » reproductible (mulberry32)
function tirage(graine: number) {
  let etat = graine
  return () => {
    etat = (etat + 0x6d2b79f5) | 0
    let t = Math.imul(etat ^ (etat >>> 15), 1 | etat)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// variation lente autour de 0, bornée à ± amplitude
function ondulation(longueur: number, amplitude: number, hasard: () => number): number[] {
  let valeur = 0
  return Array.from({ length: longueur }, () => {
    valeur = valeur * 0.8 + (hasard() - 0.5) * amplitude
    return Math.max(-amplitude, Math.min(amplitude, valeur))
  })
}

const moyenne = (valeurs: number[]) => valeurs.reduce((a, b) => a + b, 0) / valeurs.length

export function detailSeance(seance: Seance): DetailSeance {
  const hasard = tirage(Number(seance.id) * 7919)
  const minutes = seance.dureeMin

  // fréquence cardiaque : montée pendant l'échauffement, puis plateau
  const brute = ondulation(minutes, 0.03, hasard).map(
    (ecart, i) => seance.fcMoyenne * (0.8 + 0.24 * (1 - Math.exp(-i / (minutes * 0.15))) + ecart),
  )
  const recalage = seance.fcMoyenne - moyenne(brute)
  const fc = brute.map((valeur) => Math.round(valeur + recalage))

  if (seance.sport !== 'course') return { fc }

  // allure : autour de l'allure moyenne, recalée pour retrouver la distance exacte
  const allureMoyenne = (minutes * 60) / seance.quantite
  const approchee = ondulation(minutes, 0.07, hasard).map((ecart) => allureMoyenne * (1 + ecart))
  const distance = approchee.reduce((total, a) => total + 60 / a, 0)
  const allure = approchee.map((a) => (a * distance) / seance.quantite)

  // temps de passage à chaque kilomètre entier
  const kilometres: number[] = []
  let parcouru = 0
  let dernierPassage = 0
  allure.forEach((a, minute) => {
    const avant = parcouru
    parcouru += 60 / a
    while (kilometres.length + 1 <= parcouru + 1e-9 && kilometres.length + 1 <= Math.floor(seance.quantite)) {
      const passage = (minute + (kilometres.length + 1 - avant) / (parcouru - avant)) * 60
      kilometres.push(passage - dernierPassage)
      dernierPassage = passage
    }
  })

  // minutes passées dans chaque tranche de 0,5 km/h
  const vitesse = allure.map((a) => 3600 / a)
  const debut = Math.floor(Math.min(...vitesse) * 2) / 2
  const fin = Math.ceil(Math.max(...vitesse) * 2) / 2
  const vitesses = []
  for (let bas = debut; bas < fin; bas += 0.5) {
    vitesses.push({
      libelle: `${bas.toLocaleString('fr-FR')} – ${(bas + 0.5).toLocaleString('fr-FR')}`,
      minutes: vitesse.filter((v) => v >= bas && (v < bas + 0.5 || bas + 0.5 >= fin)).length,
    })
  }

  return { fc, allure, kilometres, vitesses }
}
