// Service pour l'eau bue (page Nutrition) : appels REST vers /api/hydratation.
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

const CHEMIN = '/api/hydratation'

export interface AjoutEau {
  id: number
  date: string // AAAA-MM-JJ
  ml: number
}

async function verifier(reponse: Response) {
  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur HTTP ${reponse.status}`)
  }
}

// les ajouts d'eau d'une journée, du plus ancien au plus récent
export async function lireEau(utilisateurId: IdentifiantUtilisateur, date: string): Promise<AjoutEau[]> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${utilisateurId}/${date}`)
  await verifier(reponse)
  return reponse.json() as Promise<AjoutEau[]>
}

export async function ajouterEau(
  utilisateurId: IdentifiantUtilisateur,
  date: string,
  ml: number,
): Promise<AjoutEau> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${utilisateurId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, ml }),
  })
  await verifier(reponse)
  return reponse.json() as Promise<AjoutEau>
}

export async function supprimerEau(utilisateurId: IdentifiantUtilisateur, id: number): Promise<void> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${utilisateurId}/${id}`, { method: 'DELETE' })
  await verifier(reponse)
}
