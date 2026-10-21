// Service pour la nutrition : appels REST vers /api/nutrition (voir NutritionController).
// Le backend garde une ligne par jour : les totaux des repas de la journée et l'objectif.
import {
  envoyerSeance,
  recupererAujourdhui,
  type IdentifiantUtilisateur,
} from './sport/http.ts'

const CHEMIN = '/api/nutrition'

export interface JourneeNutrition {
  id?: number
  date?: string
  calories: number
  proteines: number
  glucides: number
  lipides: number
  objectif: string
}

export interface NutritionRequest {
  calories: number
  proteines: number
  glucides: number
  lipides: number
  objectif: string
}

export function recupererNutrition(
  utilisateurId: IdentifiantUtilisateur,
): Promise<JourneeNutrition | null> {
  return recupererAujourdhui<JourneeNutrition>(CHEMIN, utilisateurId)
}

export function validerNutrition(
  utilisateurId: IdentifiantUtilisateur,
  donnees: NutritionRequest,
): Promise<JourneeNutrition> {
  return envoyerSeance<NutritionRequest, JourneeNutrition>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

export function modifierNutrition(
  utilisateurId: IdentifiantUtilisateur,
  donnees: NutritionRequest,
): Promise<JourneeNutrition> {
  return envoyerSeance<NutritionRequest, JourneeNutrition>(
    CHEMIN,
    utilisateurId,
    'PUT',
    donnees,
  )
}
