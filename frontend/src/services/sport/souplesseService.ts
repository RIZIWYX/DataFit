// Service pour la discipline « Souplesse » : appels REST vers /api/souplesse.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/souplesse'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_SOUPLESSE: Record<string, string> = {
  facial: 'gef',
  anteropost: 'geap',
  todebout: 'toed',
  toassis: 'toes',
}

export interface SeanceSouplesse {
  id?: number
  date?: string
  facial: number
  anteropost: number
  todebout: number
  toassis: number
}

export interface SouplesseRequest {
  facial: number
  anteropost: number
  todebout: number
  toassis: number
}

export function recupererSouplesse(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceSouplesse | null> {
  return recupererAujourdhui<SeanceSouplesse>(CHEMIN, utilisateurId)
}

export function validerSouplesse(
  utilisateurId: IdentifiantUtilisateur,
  donnees: SouplesseRequest,
): Promise<SeanceSouplesse> {
  return envoyerSeance<SouplesseRequest, SeanceSouplesse>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierSouplesse(
  utilisateurId: IdentifiantUtilisateur,
  donnees: SouplesseRequest,
): Promise<SeanceSouplesse> {
  return envoyerSeance<SouplesseRequest, SeanceSouplesse>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
