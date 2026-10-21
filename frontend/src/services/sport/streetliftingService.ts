// Service pour la discipline « Streetlifting » : appels REST vers /api/streetlifting.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/streetlifting'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_STREETLIFTING: Record<string, string> = {
  traction: 'pullw',
  dip: 'dipw',
  pompe: 'pushw',
  muscleup: 'muw',
}

export interface SeanceStreetlifting {
  id?: number
  date?: string
  traction: number
  dip: number
  pompe: number
  muscleup: number
}

export interface StreetliftingRequest {
  traction: number
  dip: number
  pompe: number
  muscleup: number
}

export function recupererStreetlifting(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceStreetlifting | null> {
  return recupererAujourdhui<SeanceStreetlifting>(CHEMIN, utilisateurId)
}

export function validerStreetlifting(
  utilisateurId: IdentifiantUtilisateur,
  donnees: StreetliftingRequest,
): Promise<SeanceStreetlifting> {
  return envoyerSeance<StreetliftingRequest, SeanceStreetlifting>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierStreetlifting(
  utilisateurId: IdentifiantUtilisateur,
  donnees: StreetliftingRequest,
): Promise<SeanceStreetlifting> {
  return envoyerSeance<StreetliftingRequest, SeanceStreetlifting>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
