// Photos des disciplines, affichées en fond des cartes de séance (composant CarteSeance).
// Ce sont des versions allégées (WebP, 1400 px) des photos public/DataFit_*.jpg, rangées dans public/photos/.
import { DISCIPLINES } from './paliers.ts'

export const PHOTOS_DISCIPLINES: Record<string, string> = {
  sbd: '/photos/sbd.webp',
  street: '/photos/streetlifting.webp',
  halt: '/photos/halterophilie.webp',
  cali: '/photos/calisthenics.webp',
  athle: '/photos/athletisme.webp',
  nat: '/photos/natation.webp',
  soup: '/photos/souplesse.webp',
}

// La photo d'une séance planifiée : celle de la discipline de son premier exercice du catalogue.
// Rien si elle ne contient que des exercices libres.
export function photoDesExercices(exercices: { exerciceId: string | null }[]): string | undefined {
  for (const { exerciceId } of exercices) {
    const discipline = DISCIPLINES.find((d) => d.exercices.some((ex) => ex.id === exerciceId))
    if (discipline) return PHOTOS_DISCIPLINES[discipline.id]
  }
  return undefined
}
