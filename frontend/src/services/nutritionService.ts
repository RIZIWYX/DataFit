// Service pour la nutrition : appels REST vers /api/nutrition (voir NutritionController).
// Une ligne par repas noté : son jour, son moment (petit-déjeuner…), son nom et ses apports.
import type { Repas } from '../lib/nutrition.ts'
import {
  API_URL,
  envoyerSeance,
  type IdentifiantUtilisateur,
} from './sport/http.ts'

const CHEMIN = '/api/nutrition'

export interface NutritionRequest {
  date: string // « AAAA-MM-JJ »
  repas: Repas
  nom: string
  calories: number
  proteines: number
  glucides: number
  lipides: number
  objectif: string
}

// la ligne créée en base, avec son id
export interface RepasEnregistre extends NutritionRequest {
  id: number
}

export function ajouterRepas(
  utilisateurId: IdentifiantUtilisateur,
  donnees: NutritionRequest,
): Promise<RepasEnregistre> {
  return envoyerSeance<NutritionRequest, RepasEnregistre>(
    CHEMIN,
    utilisateurId,
    'POST',
    donnees,
  )
}

// sans effet si la ligne n'existe plus : un repas supprimé deux fois ne fait pas d'erreur
export async function supprimerRepas(
  utilisateurId: IdentifiantUtilisateur,
  id: number,
): Promise<void> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${utilisateurId}/${id}`, {
    method: 'DELETE',
  })

  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur HTTP ${reponse.status}`)
  }
}
