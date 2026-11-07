import { type Sport } from './sports.ts'

// Une séance analysée et enregistrée par le backend, sans mesures inventées.
export interface Seance {
  id: string // sport + id : deux tables peuvent avoir le même id numérique
  nom: string
  sport: Sport
  date: Date // le jour de la séance (colonne date)
  heure?: Date // moment de la synchronisation (colonne synchronise_le) ; absent pour les anciennes séances
  dureeMin: number
  dureeSecondes: number
  quantite: number // km, mètres en natation, séries en musculation
  fcMoyenne: number
  fcMin: number
  fcMax: number
  allureMoyenne?: number
  indicateurs: { nom: string; valeur: string }[]
}
