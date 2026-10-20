// Service pour la discipline « Calisthenics » : appels REST vers /api/calisthenics.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/calisthenics'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_CALISTHENICS: Record<string, string> = {
  pompe: 'pushup',
  dip: 'dips',
  pistol: 'pistol',
  traction: 'pullup',
  muscleup: 'mu',
  lSit: 'lsit',
  handstand: 'hspu',
  frontLever: 'fl',
  oap: 'oap',
  flag: 'flag',
  planche: 'planche',
  crucifix: 'cross',
}

export interface SeanceCalisthenics {
  id?: number
  date?: string
  pompe: number
  dip: number
  pistol: number
  traction: number
  muscleup: number
  lSit: number
  handstand: number
  frontLever: number
  oap: number
  flag: number
  planche: number
  crucifix: number
}

export interface CalisthenicsRequest {
  pompe: number
  dip: number
  pistol: number
  traction: number
  muscleup: number
  lSit: number
  handstand: number
  frontLever: number
  oap: number
  flag: number
  planche: number
  crucifix: number
}

export function recupererCalisthenics(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceCalisthenics | null> {
  return recupererAujourdhui<SeanceCalisthenics>(CHEMIN, utilisateurId)
}

export function validerCalisthenics(
  utilisateurId: IdentifiantUtilisateur,
  donnees: CalisthenicsRequest,
): Promise<SeanceCalisthenics> {
  return envoyerSeance<CalisthenicsRequest, SeanceCalisthenics>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierCalisthenics(
  utilisateurId: IdentifiantUtilisateur,
  donnees: CalisthenicsRequest,
): Promise<SeanceCalisthenics> {
  return envoyerSeance<CalisthenicsRequest, SeanceCalisthenics>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
