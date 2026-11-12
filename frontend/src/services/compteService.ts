// Service du compte (page Profil) : appels REST vers /api/compte.
import { type CategorieDonnees } from '../lib/compte.ts'
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

// POST vers /api/compte/... ; en cas d'erreur, un message en français à afficher tel quel
async function envoyer(chemin: string, corps: object, parDefaut: string): Promise<void> {
  let reponse: Response
  try {
    reponse = await fetch(`${API_URL}/api/compte/${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    })
  } catch {
    throw new Error('Impossible de contacter le serveur. Réessayez dans un instant.')
  }
  if (!reponse.ok) {
    const data = await reponse.json().catch(() => ({}))
    // nos contrôleurs renvoient { error: "message en français" } ; les erreurs produites par
    // Spring lui-même (validation...) ont un champ path et un texte technique
    throw new Error(data.error && !data.path ? data.error : parDefaut)
  }
}

// Supprime définitivement le compte et toutes ses données. Le mot de passe sert de confirmation :
// le backend le vérifie avant d'effacer quoi que ce soit.
export function supprimerCompte(utilisateurId: IdentifiantUtilisateur, motDePasse: string): Promise<void> {
  return envoyer(`${utilisateurId}/suppression`, { motDePasse }, "Le compte n'a pas pu être supprimé.")
}

// Efface les données des catégories choisies ; le compte et le profil restent.
export function effacerDonnees(
  utilisateurId: IdentifiantUtilisateur,
  motDePasse: string,
  categories: CategorieDonnees[],
): Promise<void> {
  return envoyer(`${utilisateurId}/effacement`, { categories, motDePasse }, "Les données n'ont pas pu être effacées.")
}
