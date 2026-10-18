// Objectifs sportifs du profil, et leur avancement quand les données permettent de le calculer.
// Fonctions pures ; démonstration : les objectifs sont gardés dans le navigateur.
import { DISCIPLINES, RANGS, TOUS_LES_EXERCICES, type Exercice } from '../data/paliers.ts'
import { type Seance } from '../data/seances.ts'
import { distanceKm, joursEcoules } from './activite.ts'
import { formatDateLongue, nombre } from './format.ts'
import { type Perfs, formatTemps, formatValeur, valeur } from './rangs.ts'

export type StatutObjectif = 'en-cours' | 'atteint' | 'abandonne'

// objectifs de régularité : une moyenne par semaine, calculée sur les séances
export type MesureVolume = 'seances' | 'heures' | 'km-course' | 'km-natation'

export const MESURES_VOLUME: Record<MesureVolume, { nom: string; unite: string }> = {
  seances: { nom: 'Séances par semaine', unite: 'séances' },
  heures: { nom: "Heures d'entraînement par semaine", unite: 'h' },
  'km-course': { nom: 'Kilomètres de course par semaine', unite: 'km' },
  'km-natation': { nom: 'Kilomètres de natation par semaine', unite: 'km' },
}

// le total de force athlétique : squat + développé couché + soulevé de terre
export const TOTAL_SBD = 'total-sbd'
const EXERCICES_TOTAL = ['squat', 'bench', 'dead']

export interface Objectif {
  id: string
  discipline: string // id de la discipline (data/paliers.ts), ou « regularite »
  exerciceId?: string // objectif de record : l'exercice, ou TOTAL_SBD
  mesure?: MesureVolume // objectif de régularité
  cible: number // dans l'unité de l'exercice (un temps en secondes), ou par semaine
  echeance?: string // « 2027-06-30 »
  statut: StatutObjectif
}

export const GROUPES_OBJECTIFS = [
  ...DISCIPLINES.map((d) => ({ id: d.id, nom: d.nom })),
  { id: 'regularite', nom: 'Régularité' },
]

export const exerciceObjectif = (objectif: Objectif): Exercice | undefined =>
  TOUS_LES_EXERCICES.find((ex) => ex.id === objectif.exerciceId)

// « Squat : 140 kg », « 5 km en moins de 20:00 », « Séances par semaine : 4 »
export function titreObjectif(objectif: Objectif): string {
  if (objectif.mesure) {
    const { nom, unite } = MESURES_VOLUME[objectif.mesure]
    return `${nom} : ${nombre(objectif.cible)} ${unite}`
  }
  if (objectif.exerciceId === TOTAL_SBD) return `Total SBD : ${nombre(objectif.cible)} kg`
  const ex = exerciceObjectif(objectif)
  if (!ex) return 'Objectif'
  if (ex.type === 'time') return `${ex.nom} en moins de ${formatTemps(objectif.cible)}`
  if (ex.type === 'ladder') return `${ex.nom} : ${ex.etapes?.[objectif.cible] ?? RANGS[objectif.cible]}`
  return `${ex.nom} : ${formatValeur(ex, objectif.cible)}`
}

export const texteEcheance = (objectif: Objectif) =>
  objectif.echeance ? `Avant le ${formatDateLongue(new Date(`${objectif.echeance}T12:00`))}` : 'Sans échéance'

export interface Avancement {
  actuel: string // la valeur du moment, en clair
  part: number // de 0 à 1
}

// Avancement d'un objectif, ou null quand rien ne permet de le mesurer
// (aucun record saisi pour cet exercice, par exemple).
export function avancement(objectif: Objectif, perfs: Perfs, seances: Seance[], aujourdHui: Date): Avancement | null {
  if (objectif.mesure) {
    // moyenne par semaine sur les 4 dernières semaines
    const recentes = seances.filter((s) => {
      const jours = joursEcoules(s.date, aujourdHui)
      return jours >= 0 && jours < 28
    })
    const total = {
      seances: recentes.length,
      heures: recentes.reduce((t, s) => t + s.dureeMin, 0) / 60,
      'km-course': recentes.filter((s) => s.sport === 'course').reduce((t, s) => t + distanceKm(s), 0),
      'km-natation': recentes.filter((s) => s.sport === 'natation').reduce((t, s) => t + distanceKm(s), 0),
    }[objectif.mesure]
    const moyenne = total / 4
    return {
      actuel: `${nombre(moyenne)} ${MESURES_VOLUME[objectif.mesure].unite} en moyenne sur 4 semaines`,
      part: Math.min(1, moyenne / objectif.cible),
    }
  }

  if (objectif.exerciceId === TOTAL_SBD) {
    const valeurs = EXERCICES_TOTAL.map((id) => valeur(TOUS_LES_EXERCICES.find((ex) => ex.id === id)!, perfs))
    if (valeurs.some(Number.isNaN)) return null
    const total = valeurs.reduce((a, b) => a + b, 0)
    return { actuel: `${nombre(total)} kg aujourd'hui`, part: Math.min(1, total / objectif.cible) }
  }

  const ex = exerciceObjectif(objectif)
  if (!ex) return null
  const x = valeur(ex, perfs)
  if (Number.isNaN(x)) return null
  // pour un temps, plus bas est mieux
  const part = ex.type === 'time' ? objectif.cible / x : ex.type === 'ladder' ? x / Math.max(1, objectif.cible) : x / objectif.cible
  const texte = ex.type === 'ladder' ? `Étape actuelle : ${ex.etapes?.[x] ?? RANGS[x]}` : `${formatValeur(ex, x)} aujourd'hui`
  return { actuel: texte, part: Math.max(0, Math.min(1, part)) }
}

// ---------- stockage ----------

const CLE_STOCKAGE = 'datafit-objectifs'

export function lireObjectifs(): Objectif[] {
  try {
    return JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? '[]')
  } catch {
    return []
  }
}

export function enregistrerObjectifs(objectifs: Objectif[]) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(objectifs))
  } catch {
    // stockage indisponible : les objectifs ne seront pas gardés
  }
}
