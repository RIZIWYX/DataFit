// Service pour la discipline « SBD » : appels REST vers /api/sbd.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/sbd'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_SBD: Record<string, string> = {
  bench: 'bench',
  squat: 'squat',
  deadlift: 'dead',
}

export interface SeanceSBD {
  id?: number
  date?: string
  bench: number
  squat: number
  deadlift: number
}

export interface SBDRequest {
  bench: number
  squat: number
  deadlift: number
}

export type { IdentifiantUtilisateur }

export function recupererSBD(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceSBD | null> {
  return recupererAujourdhui<SeanceSBD>(CHEMIN, utilisateurId)
}

export function validerSBD(
  utilisateurId: IdentifiantUtilisateur,
  donnees: SBDRequest,
): Promise<SeanceSBD> {
  return envoyerSeance<SBDRequest, SeanceSBD>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierSBD(
  utilisateurId: IdentifiantUtilisateur,
  donnees: SBDRequest,
): Promise<SeanceSBD> {
  return envoyerSeance<SBDRequest, SeanceSBD>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
