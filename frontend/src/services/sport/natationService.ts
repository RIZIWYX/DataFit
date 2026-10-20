// Service pour la discipline « Natation » : appels REST vers /api/natation.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/natation'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_NATATION: Record<string, string> = {
  crawl: 'crawl',
  dos: 'dos',
  brassee: 'brasse',
  papillon: 'pap',
}

export interface SeanceNatation {
  id?: number
  date?: string
  crawl: number
  dos: number
  brassee: number
  papillon: number
}

export interface NatationRequest {
  crawl: number
  dos: number
  brassee: number
  papillon: number
}

export function recupererNatation(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceNatation | null> {
  return recupererAujourdhui<SeanceNatation>(CHEMIN, utilisateurId)
}

export function validerNatation(
  utilisateurId: IdentifiantUtilisateur,
  donnees: NatationRequest,
): Promise<SeanceNatation> {
  return envoyerSeance<NatationRequest, SeanceNatation>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierNatation(
  utilisateurId: IdentifiantUtilisateur,
  donnees: NatationRequest,
): Promise<SeanceNatation> {
  return envoyerSeance<NatationRequest, SeanceNatation>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
