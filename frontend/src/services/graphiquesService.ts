import { API_URL } from './sport/http.ts'

export interface PointAnalyse { x: number; y: number; libelle?: string }
export interface SerieAnalyse { nom: string; points: PointAnalyse[]; pointilles?: boolean }
export interface GraphiqueAnalyse {
  id: string
  titre: string
  type: 'ligne' | 'nuage' | 'histogramme' | 'paliers'
  axeX: string
  axeY: string
  uniteX: string
  uniteY: string
  series: SerieAnalyse[]
  reperesY?: { valeur: number; libelle: string }[]
  references?: { nom: string; valeur: number }[]
  largeurColonne?: number
  depuisZero?: boolean
  note?: string
}
export interface ReponseGraphiques { version: number; graphiques: GraphiqueAnalyse[] }

export async function recupererGraphiques(chemin: string, signal?: AbortSignal): Promise<ReponseGraphiques | null> {
  const reponse = await fetch(`${API_URL}${chemin}`, { signal })
  if (reponse.status === 204) return null
  if (!reponse.ok) throw new Error(`Impossible de charger les graphiques (HTTP ${reponse.status}).`)
  const donnees: unknown = await reponse.json()
  if (!donnees || typeof donnees !== 'object' || !('graphiques' in donnees) || !Array.isArray(donnees.graphiques)) {
    throw new Error('Le serveur a renvoyé des graphiques invalides.')
  }
  const resultat = donnees as ReponseGraphiques
  for (const graphe of resultat.graphiques) {
    if (!Array.isArray(graphe.series) || graphe.series.some((s) => !Array.isArray(s.points)
      || s.points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)))) {
      throw new Error('Le graphique contient des mesures invalides.')
    }
  }
  return resultat
}
