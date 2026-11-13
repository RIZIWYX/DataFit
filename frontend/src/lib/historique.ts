// Les entrées de l'historique (séances de la montre) mises au format de la liste
import { type Seance } from '../data/seances.ts'
import { SPORTS, couleurSport, type Sport } from '../data/sports.ts'
import { distanceKm } from './activite.ts'
import { formatDateLongue, resumeSeance } from './format.ts'

export type Categorie = Sport

export interface Entree {
  id: string
  categorie: Categorie
  date: Date
  titre: string
  sousTitre: string // d'où vient la séance : "Montre", "PPL"...
  icone: string
  couleur: string
  dureeMin: number
  heureConnue?: boolean
  mesure: string // la mesure principale : "5,2 km", "3 exercices"
  km: number
  fc?: number
  exercices: string[]
  lien: string
}

// Les séances de la plus récente à la plus ancienne, avec l'heure de synchronisation quand elle existe.
// Utilisé par l'accueil et par l'historique pour avoir le même ordre partout.
// Le service renvoie les séances de la plus ancienne à la plus récente : on inverse d'abord pour
// qu'à date égale la dernière synchronisée reste devant (le tri est stable).
export function seancesRecentes(seances: Seance[]): Seance[] {
  const moment = (s: Seance) => (s.heure ?? s.date).getTime()
  return [...seances].reverse().sort((a, b) => moment(b) - moment(a))
}

export function entreesHistorique(seances: Seance[]): Entree[] {
  return seances.map((seance) => ({
    id: seance.id,
    categorie: seance.sport,
    // avec l'heure de synchronisation quand elle est connue : affichée, et départage les séances du même jour
    date: seance.heure ?? seance.date,
    titre: seance.nom,
    sousTitre: 'Montre',
    icone: SPORTS[seance.sport].icone,
    couleur: couleurSport(seance.sport),
    dureeMin: seance.dureeMin,
    heureConnue: Boolean(seance.heure),
    mesure: resumeSeance(seance),
    km: distanceKm(seance),
    fc: seance.fcMoyenne,
    exercices: [],
    lien: `/historique/${seance.id}`,
  }))

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
