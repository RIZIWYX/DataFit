import { type SeanceCardio } from '../services/cardioMontreService.ts'
import { type Entree } from './historique.ts'
import { SPORTS, couleurSport } from '../data/sports.ts'
import { nombre } from './format.ts'

// LocalDate de Java : on construit une date locale, sans décalage UTC ni heure supposée.
export function dateCardio(date: string): Date {
  const [annee, mois, jour] = date.split('-').map(Number)
  return new Date(annee, mois - 1, jour)
}

export function formatDureeSecondes(secondes: number): string {
  const total = Math.round(secondes)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h ? `${h} h ${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} s`
    : `${m} min ${String(s).padStart(2, '0')} s`
}

export function entreeCardio(seance: SeanceCardio): Entree {
  return {
    id: `cardio-${seance.id}`, categorie: 'course', date: dateCardio(seance.date),
    titre: seance.nom, sousTitre: SPORTS.course.nom,
    icone: SPORTS.course.icone, couleur: couleurSport('course'),
    dureeMin: seance.dureeS / 60, dureeSecondes: seance.dureeS, heureConnue: false,
    mesure: `${nombre(seance.distanceM / 1000, 2)} km`, km: seance.distanceM / 1000,
    fc: seance.fcMoy, exercices: [], lien: `/historique/cardio/${seance.id}`,
  }
}
