// Les entrées de l'historique : les séances reçues de la montre et les séances programmées
// marquées comme faites, mises au même format pour être listées ensemble. Fonctions pures.
import { ICONES } from '../data/icones.ts'
import { type Seance } from '../data/seances.ts'
import { SPORTS, couleurSport, type Sport } from '../data/sports.ts'
import { distanceKm } from './activite.ts'
import { formatDateLongue, resumeSeance } from './format.ts'
import { type Planning, couleurSeance, depuisIso } from './programmation.ts'

export type Categorie = Sport | 'programmees'

export interface Entree {
  id: string
  categorie: Categorie
  date: Date
  titre: string
  sousTitre: string // d'où vient la séance : « Montre », « PPL »…
  icone: string
  couleur: string
  dureeMin: number
  dureeSecondes?: number
  heureConnue?: boolean
  mesure: string // la mesure principale : « 5,2 km », « 3 exercices »
  km: number
  fc?: number
  exercices: string[]
  lien: string
}

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export function entreesHistorique(seances: Seance[], planning: Planning): Entree[] {
  const montre: Entree[] = seances.map((seance) => ({
    id: seance.id,
    categorie: seance.sport,
    date: seance.date,
    titre: SPORTS[seance.sport].nom,
    sousTitre: 'Montre',
    icone: SPORTS[seance.sport].icone,
    couleur: couleurSport(seance.sport),
    dureeMin: seance.dureeMin,
    mesure: resumeSeance(seance),
    km: distanceKm(seance),
    fc: seance.fcMoyenne,
    exercices: [],
    lien: `/historique/${seance.id}`,
  }))

  const programmees: Entree[] = planning.seances
    .filter((seance) => seance.faite)
    .map((seance) => ({
      id: `p-${seance.id}`,
      categorie: 'programmees',
      date: depuisIso(seance.debut),
      titre: seance.titre,
      sousTitre: planning.programmes.find((p) => p.id === seance.programmeId)?.nom ?? 'Séance unique',
      icone: ICONES.calendrier,
      couleur: couleurSeance(seance, planning.programmes),
      dureeMin: seance.dureeMin,
      mesure: pluriel(seance.exercices.length, 'exercice'),
      km: seance.exercices.reduce((total, ex) => total + (ex.distance ?? 0), 0),
      exercices: seance.exercices.map((ex) => ex.nom),
      lien: `/programmation?seance=${seance.id}`,
    }))

  return [...montre, ...programmees]
}

// texte sans accents ni majuscules, pour une recherche tolérante
export const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// tout ce que la recherche peut retrouver : le sport, la date en toutes lettres, la mesure, les exercices
export const texteRecherche = (entree: Entree) =>
  normaliser(
    [
      entree.titre,
      entree.sousTitre,
      entree.date.toLocaleDateString('fr-FR', { weekday: 'long' }),
      formatDateLongue(entree.date),
      entree.mesure,
      ...entree.exercices,
    ].join(' '),
  )
