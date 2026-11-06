import { type Sport } from './sports.ts'

// Une séance analysée et enregistrée par le backend, sans mesures inventées.
export interface Seance {
  id: string // sport + id : deux tables peuvent avoir le même id numérique
  nom: string
  sport: Sport
  date: Date // le backend conserve le jour, sans heure de début
  dureeMin: number
  dureeSecondes: number
  quantite: number // km, mètres en natation, séries en musculation
  fcMoyenne: number
  fcMin: number
  fcMax: number
  allureMoyenne?: number
  indicateurs: { nom: string; valeur: string }[]
}
