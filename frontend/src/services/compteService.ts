// Service du compte (page Profil) : appels REST vers /api/compte.
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

// Supprime définitivement le compte et toutes ses données. Le mot de passe sert de confirmation :
// le backend le vérifie avant d'effacer quoi que ce soit.
export async function supprimerCompte(utilisateurId: IdentifiantUtilisateur, motDePasse: string): Promise<void> {
  let reponse: Response
  try {
    reponse = await fetch(`${API_URL}/api/compte/${utilisateurId}/suppression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motDePasse }),
    })
  } catch {
    throw new Error('Impossible de contacter le serveur. Réessayez dans un instant.')
  }
  if (!reponse.ok) {
    const data = await reponse.json().catch(() => ({}))
    // nos contrôleurs renvoient { error: "message en français" } ; les erreurs produites par
    // Spring lui-même (validation...) ont un champ path et un texte technique
    throw new Error(data.error && !data.path ? data.error : "Le compte n'a pas pu être supprimé.")
  }
}
