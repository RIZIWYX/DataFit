// Programmes d'entraînement et séances placées dans le calendrier. Fonctions pures, sans React.
//
// Un programme est un modèle (« PPL » : trois séances types, avec leurs exercices) ;
// le calendrier en contient les occurrences : des séances datées, copiées du modèle au moment
// de la planification. Modifier une occurrence ne touche donc pas au modèle, et inversement.
//
// Démonstration : tout est gardé dans le navigateur, en attendant le backend.
import { TOUS_LES_EXERCICES, type Exercice } from '../data/paliers.ts'
import { cleDuCompte } from './compte.ts'

export interface ExercicePrevu {
  id: string
  exerciceId: string | null // exercice du catalogue (data/paliers.ts), ou null pour un exercice libre
  nom: string
  series?: number
  reps?: number
  charge?: number // kg ; pour un exercice lesté, les kg ajoutés
  tenue?: number // secondes
  distance?: number // km
  duree?: number // minutes
}

export interface SeanceModele {
  id: string
  nom: string
  dureeMin: number
  exercices: ExercicePrevu[]
}

export interface Programme {
  id: string
  nom: string
  couleur: string
  seances: SeanceModele[]
}

export interface SeancePlanifiee {
  id: string
  programmeId: string | null // null : séance unique, hors programme
  modeleId: string | null
  titre: string
  debut: string // « 2026-10-16T18:00 », heure locale
  dureeMin: number
  exercices: ExercicePrevu[]
  faite: boolean
}

export interface Planning {
  programmes: Programme[]
  seances: SeancePlanifiee[]
}

// couleurs proposées pour les programmes ; jamais le turquoise, réservé au signal
export const COULEURS_PROGRAMMES = ['#ff8a3d', '#6e8bff', '#f5b83d', '#b18cff', '#ff8fc7', '#e4e4e7']
// les séances uniques, hors programme
export const COULEUR_SEANCE_UNIQUE = '#a4a4ad'

// ---------- identifiants et dates ----------

export const nouvelId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

const deux = (n: number) => String(n).padStart(2, '0')

// date et heure locales → « 2026-10-16T18:00 » (sans fuseau : c'est l'heure affichée)
export const versIso = (date: Date) =>
  `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}T${deux(date.getHours())}:${deux(date.getMinutes())}`

export const depuisIso = (iso: string) => new Date(iso)

// « 2026-10-16 » : la clé d'un jour, pour regrouper
export const cleJour = (date: Date) => versIso(date).slice(0, 10)

// lundi de la semaine d'une date, à minuit
export function debutSemaine(date: Date): Date {
  const jour = (date.getDay() + 6) % 7 // 0 = lundi
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - jour)
}

export const ajouterJours = (date: Date, jours: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + jours, date.getHours(), date.getMinutes())

// ---------- exercices ----------

export const exerciceDuCatalogue = (id: string | null): Exercice | undefined =>
  id ? TOUS_LES_EXERCICES.find((ex) => ex.id === id) : undefined

export type Champ = 'series' | 'reps' | 'charge' | 'tenue' | 'distance' | 'duree'

export const LIBELLES_CHAMPS: Record<Champ, string> = {
  series: 'Séries',
  reps: 'Répétitions',
  charge: 'Charge (kg)',
  tenue: 'Tenue (s)',
  distance: 'Distance (km)',
  duree: 'Durée (min)',
}

// Les réglages utiles dépendent de l'exercice : on ne propose que ceux qui ont un sens.
export function champsExercice(exerciceId: string | null): Champ[] {
  const ex = exerciceDuCatalogue(exerciceId)
  switch (ex?.type) {
    case 'load':
    case 'lest':
      return ['series', 'reps', 'charge']
    case 'hold':
      return ['series', 'tenue']
    case 'time':
      return ['distance', 'duree']
    case 'reps':
    case 'ladder':
    case 'dist':
      return ['series', 'reps']
    default:
      return ['series', 'reps', 'charge', 'duree'] // exercice libre : tout reste possible
  }
}

const nombre = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

// « 4 × 8 · 80 kg », « 5 km · 25 min », « 3 × 30 s »
export function resumeExercice(ex: ExercicePrevu): string {
  const lest = exerciceDuCatalogue(ex.exerciceId)?.type === 'lest'
  const morceaux: string[] = []
  if (ex.series && ex.reps) morceaux.push(`${ex.series} × ${ex.reps}`)
  else if (ex.series && ex.tenue) morceaux.push(`${ex.series} × ${ex.tenue} s`)
  else if (ex.reps) morceaux.push(`${ex.reps} reps`)
  else if (ex.series) morceaux.push(`${ex.series} séries`)
  if (ex.charge) morceaux.push(`${lest ? '+' : ''}${nombre(ex.charge)} kg`)
  if (ex.distance) morceaux.push(`${nombre(ex.distance)} km`)
  if (ex.duree) morceaux.push(`${nombre(ex.duree)} min`)
  return morceaux.join(' · ')
}

// ---------- planification ----------

export interface Creneau {
  modeleId: string
  jour: number // 0 = lundi … 6 = dimanche
  heure: string // « 18:00 »
}

// Place les séances d'un programme dans le calendrier : chaque séance type à son jour et
// à son heure, pendant n semaines à partir de la semaine de « depart ».
// Les créneaux déjà passés de la première semaine sont ignorés.
export function planifier(programme: Programme, depart: Date, semaines: number, creneaux: Creneau[]): SeancePlanifiee[] {
  const lundi = debutSemaine(depart)
  const seances: SeancePlanifiee[] = []
  for (let s = 0; s < semaines; s++) {
    for (const creneau of creneaux) {
      const modele = programme.seances.find((m) => m.id === creneau.modeleId)
      if (!modele) continue
      const [h, m] = creneau.heure.split(':').map(Number)
      const debut = ajouterJours(lundi, s * 7 + creneau.jour)
      debut.setHours(h || 0, m || 0, 0, 0)
      if (debut < depart) continue
      seances.push({
        id: nouvelId(),
        programmeId: programme.id,
        modeleId: modele.id,
        titre: modele.nom,
        debut: versIso(debut),
        dureeMin: modele.dureeMin,
        exercices: modele.exercices.map((ex) => ({ ...ex, id: nouvelId() })),
        faite: false,
      })
    }
  }
  return seances
}

// ---------- lecture ----------

export const couleurSeance = (seance: SeancePlanifiee, programmes: Programme[]) =>
  programmes.find((p) => p.id === seance.programmeId)?.couleur ?? COULEUR_SEANCE_UNIQUE

// les séances à venir (pas encore faites, pas encore commencées), de la plus proche à la plus lointaine
export function seancesAVenir(planning: Planning, maintenant: Date): SeancePlanifiee[] {
  return planning.seances
    .filter((s) => !s.faite && depuisIso(s.debut) >= maintenant)
    .sort((a, b) => a.debut.localeCompare(b.debut))
}

// ---------- stockage ----------

// un planning par compte (voir cleDuCompte)
const CLE_STOCKAGE = 'datafit-programmation'

export function chargerPlanning(): Planning {
  try {
    const garde = JSON.parse(localStorage.getItem(cleDuCompte(CLE_STOCKAGE)) ?? '{}')
    return { programmes: garde.programmes ?? [], seances: garde.seances ?? [] }
  } catch {
    return { programmes: [], seances: [] }
  }
}

export function enregistrerPlanning(planning: Planning) {
  try {
    localStorage.setItem(cleDuCompte(CLE_STOCKAGE), JSON.stringify(planning))
  } catch {
    // stockage indisponible (navigation privée…) : le planning ne sera pas gardé
  }
}

// ---------- exemple ----------

const ex = (exerciceId: string | null, nom: string, reglages: Partial<ExercicePrevu>): ExercicePrevu => ({
  id: nouvelId(),
  exerciceId,
  nom,
  ...reglages,
})

// Un programme « Push Pull Legs » prêt à l'emploi, créé seulement si l'utilisateur le demande.
export function exemplePPL(): Programme {
  return {
    id: nouvelId(),
    nom: 'PPL',
    couleur: COULEURS_PROGRAMMES[0],
    seances: [
      {
        id: nouvelId(),
        nom: 'Push',
        dureeMin: 60,
        exercices: [
          ex('bench', 'Développé couché', { series: 4, reps: 8, charge: 70 }),
          ex('dipw', 'Dips lesté', { series: 3, reps: 8, charge: 10 }),
          ex('pushup', 'Pompes', { series: 3, reps: 15 }),
        ],
      },
      {
        id: nouvelId(),
        nom: 'Pull',
        dureeMin: 60,
        exercices: [
          ex('pullup', 'Tractions', { series: 4, reps: 8 }),
          ex('pullw', 'Traction lestée', { series: 3, reps: 5, charge: 10 }),
          ex('dead', 'Soulevé de terre', { series: 3, reps: 5, charge: 120 }),
        ],
      },
      {
        id: nouvelId(),
        nom: 'Legs',
        dureeMin: 70,
        exercices: [
          ex('squat', 'Squat', { series: 4, reps: 6, charge: 100 }),
          ex('pistol', 'Pistol squat', { series: 3, reps: 6 }),
          ex(null, 'Fentes marchées', { series: 3, reps: 12, charge: 20 }),
        ],
      },
    ],
  }
}
