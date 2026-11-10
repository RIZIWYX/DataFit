// Appels "montre" : le backend simule la séance, l'envoie à l'analyse puis l'enregistre
import { API_URL, envoyerSeance, type IdentifiantUtilisateur } from './sport/http.ts'

// les sports que le simulateur sait produire (chemin /api/seances/<sport>)
export const SPORTS_MONTRE = ['cardio', 'velo', 'natation', 'muscu'] as const
export type SportMontre = (typeof SPORTS_MONTRE)[number]

// une séance : simulateur -> analyse -> enregistrement ; le nom est le seul champ envoyé
export function simulerSeance(utilisateurId: IdentifiantUtilisateur, sport: SportMontre, nom: string) {
  return envoyerSeance<{ nom: string }, unknown>(`/api/seances/${sport}`, utilisateurId, 'POST', { nom })
}

// une nuit : pas de corps, tout vient du simulateur et de l'analyse.
// nouvelle = false quand une nuit existait déjà ce jour-là (le backend répond 200 au lieu de 201)
export async function simulerNuit(utilisateurId: IdentifiantUtilisateur): Promise<{ nouvelle: boolean }> {
  const reponse = await fetch(`${API_URL}/api/sommeil/${utilisateurId}`, { method: 'POST' })

  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur HTTP ${reponse.status}`)
  }

  return { nouvelle: reponse.status === 201 }
}
