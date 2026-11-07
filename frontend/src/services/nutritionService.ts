
// Service pour la nutrition : appels REST vers /api/nutrition.
import type { Repas } from '../lib/nutrition.ts'
import {
  API_URL,
  envoyerSeance,
  type IdentifiantUtilisateur,
} from './sport/http.ts'

const CHEMIN = '/api/nutrition'

export interface NutritionRequest {
  date: string
  repas: Repas
  nom: string
  calories: number
  proteines: number
  glucides: number
  lipides: number
  objectif: string
}

export interface RepasEnregistre extends NutritionRequest {
  id: number
}

// Résultat renvoyé par le backend après l'analyse Python.
export interface AnalyseNutrition {
  id: number
  date: string
  nombreRepas: number
  variationCalories: number
  energieMacrosKcal: number
  ecartCaloriesMacros: number
  ecartCaloriesMacrosPct: number
  statistiques: Record<string, Record<string, number>>
  repartitionMacros: Record<string, number>
  correlationsCalories: Record<string, number | null>
  repartitionRepas: Record<string, Record<string, number>>
  repasPlusCalorique: string | null
  repasPlusProteine: string | null
  dateAnalyse: string
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

// Demande l'analyse nutritionnelle d'une journée précise.
export async function analyserNutrition(
  utilisateurId: IdentifiantUtilisateur,
  date: string,
): Promise<AnalyseNutrition> {
  const reponse = await fetch(
    `${API_URL}${CHEMIN}/${utilisateurId}/analyse/${date}`,
  )

  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur HTTP ${reponse.status}`)
  }

  return reponse.json() as Promise<AnalyseNutrition>
}
