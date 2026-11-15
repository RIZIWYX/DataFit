// Consentement au traitement des données de santé : appels vers /api/compte/{id}/consentement-sante.
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

const chemin = (utilisateurId: IdentifiantUtilisateur) =>
  `${API_URL}/api/compte/${utilisateurId}/consentement-sante`

// La date du consentement (ISO), ou null s'il n'a pas encore été donné.
export async function lireConsentementSante(utilisateurId: IdentifiantUtilisateur): Promise<string | null> {
  const reponse = await fetch(chemin(utilisateurId))
  if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`)
  return ((await reponse.json()) as { accepteLe: string | null }).accepteLe
}

// Enregistre le consentement et renvoie sa date.
export async function donnerConsentementSante(utilisateurId: IdentifiantUtilisateur): Promise<string> {
  const reponse = await fetch(chemin(utilisateurId), { method: 'POST' })
  if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`)
  return ((await reponse.json()) as { accepteLe: string }).accepteLe
}
