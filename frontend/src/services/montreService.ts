// Service de la montre : en attendant une vraie montre, chaque appel demande au backend de
// simuler des mesures, de les faire analyser puis d'enregistrer le résultat
// (voir CardioController, VeloController… et SommeilController).
import { API_URL, envoyerSeance, type IdentifiantUtilisateur } from './sport/http.ts'

// les sports que le simulateur sait produire (chemin /api/seances/<sport>)
export const SPORTS_MONTRE = ['cardio', 'velo', 'natation', 'muscu'] as const
export type SportMontre = (typeof SPORTS_MONTRE)[number]

// une séance : simulateur → analyse → enregistrement ; le nom est le seul champ envoyé
export function simulerSeance(utilisateurId: IdentifiantUtilisateur, sport: SportMontre, nom: string) {
  return envoyerSeance<{ nom: string }, unknown>(`/api/seances/${sport}`, utilisateurId, 'POST', { nom })
}

// une nuit : pas de corps, tout vient du simulateur et de l'analyse
export async function simulerNuit(utilisateurId: IdentifiantUtilisateur): Promise<unknown> {
  const reponse = await fetch(`${API_URL}/api/sommeil/${utilisateurId}`, { method: 'POST' })

  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur HTTP ${reponse.status}`)
  }

  return reponse.json()
}
