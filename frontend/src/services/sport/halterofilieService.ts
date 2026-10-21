// Service pour la discipline « Halterofilie » : appels REST vers /api/halterofilie.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/halterofilie'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_HALTEROFILIE: Record<string, string> = {
  aracher: 'snatch',
  epolejette: 'cj',
}

export interface SeanceHalterofilie {
  id?: number
  date?: string
  aracher: number
  epolejette: number
}

export interface HalterofilieRequest {
  aracher: number
  epolejette: number
}

export function recupererHalterofilie(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceHalterofilie | null> {
  return recupererAujourdhui<SeanceHalterofilie>(CHEMIN, utilisateurId)
}

export function validerHalterofilie(
  utilisateurId: IdentifiantUtilisateur,
  donnees: HalterofilieRequest,
): Promise<SeanceHalterofilie> {
  return envoyerSeance<HalterofilieRequest, SeanceHalterofilie>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierHalterofilie(
  utilisateurId: IdentifiantUtilisateur,
  donnees: HalterofilieRequest,
): Promise<SeanceHalterofilie> {
  return envoyerSeance<HalterofilieRequest, SeanceHalterofilie>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
