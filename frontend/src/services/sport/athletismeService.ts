// Service pour la discipline « Athletisme » : appels REST vers /api/athletisme.
// Les champs renvoyés par le backend correspondent aux colonnes de la table.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './http.ts'

const CHEMIN = '/api/athletisme'

// Correspondance (champ back -> id exercice front) : utilisée par useSport
// pour pré-remplir les bons champs quand une séance existe déjà aujourd'hui, et
// pour construire la requête à partir des valeurs saisies.
export const CHAMPS_ATHLETISME: Record<string, string> = {
  m100: 'r100',
  m400: 'r400',
  m800: 'r800',
  m1500: 'r1500',
  m5000: 'r5k',
  m10000: 'r10k',
  semiMarathon: 'r21k',
  marathon: 'r42k',
  triathlon: 'tri',
  ironman: 'iron',
  longueur: 'long',
  hauteur: 'haut',
}

export interface SeanceAthletisme {
  id?: number
  date?: string
  m100: number
  m400: number
  m800: number
  m1500: number
  m5000: number
  m10000: number
  semiMarathon: number
  marathon: number
  triathlon: number
  ironman: number
  longueur: number
  hauteur: number
}

export interface AthletismeRequest {
  m100: number
  m400: number
  m800: number
  m1500: number
  m5000: number
  m10000: number
  semiMarathon: number
  marathon: number
  triathlon: number
  ironman: number
  longueur: number
  hauteur: number
}

export function recupererAthletisme(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceAthletisme | null> {
  return recupererAujourdhui<SeanceAthletisme>(CHEMIN, utilisateurId)
}

export function validerAthletisme(
  utilisateurId: IdentifiantUtilisateur,
  donnees: AthletismeRequest,
): Promise<SeanceAthletisme> {
  return envoyerSeance<AthletismeRequest, SeanceAthletisme>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierAthletisme(
  utilisateurId: IdentifiantUtilisateur,
  donnees: AthletismeRequest,
): Promise<SeanceAthletisme> {
  return envoyerSeance<AthletismeRequest, SeanceAthletisme>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
