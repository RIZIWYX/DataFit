// Mise en forme des dates, durées et mesures. Fonctions pures : aucune dépendance à React.
import { type Seance } from '../data/seances.ts'

export const nombre = (n: number, decimales = 1) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: decimales })

// « 7 oct. »
export const formatJour = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

// « 11 oct. 2026 »
export const formatDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

// « 11 octobre 2026 »
export const formatDateLongue = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// « 18:10 »
export const formatHeure = (date: Date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// 32 → « 32 min » ; 70 → « 1 h 10 » ; 60 → « 1 h »
export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (!h) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

// 369 secondes → « 6'09" »
export function formatAllure(secondes: number): string {
  const total = Math.round(secondes)
  return `${Math.floor(total / 60)}'${String(total % 60).padStart(2, '0')}"`
}

// La mesure principale d'une séance : « 5,2 km », « 1 200 m » ou « 3 exercices ».
export function resumeSeance(seance: Seance): string {
  switch (seance.sport) {
    case 'course': return `${nombre(seance.quantite)} km`
    case 'natation': return `${nombre(seance.quantite, 0)} m`
    case 'musculation': return `${seance.quantite} exercice${seance.quantite > 1 ? 's' : ''}`
  }
}

// Allure moyenne : au kilomètre pour la course, aux 100 m pour la natation, rien sinon.
export function allureSeance(seance: Seance): string | null {
  const secondes = seance.dureeMin * 60
  switch (seance.sport) {
    case 'course': return `${formatAllure(secondes / seance.quantite)}/km`
    case 'natation': return `${formatAllure(secondes / (seance.quantite / 100))}/100 m`
    case 'musculation': return null
  }
}

export const finSeance = (seance: Seance) =>
  new Date(seance.date.getTime() + seance.dureeMin * 60 * 1000)
