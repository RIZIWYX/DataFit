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

// Le compte a-t-il un mot de passe ? (faux : compte créé avec Google, sans mot de passe choisi)
export async function lireEtatMotDePasse(utilisateurId: IdentifiantUtilisateur): Promise<boolean> {
  const reponse = await fetch(`${API_URL}/api/compte/${utilisateurId}/mot-de-passe`)
  if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`)
  const data = (await reponse.json()) as { defini: boolean }
  return data.defini
}

// Change le mot de passe ; l'actuel est vide pour un compte Google qui n'en a pas encore.
export function changerMotDePasse(
  utilisateurId: IdentifiantUtilisateur,
  motDePasseActuel: string,
  nouveauMotDePasse: string,
): Promise<void> {
  return envoyer(
    `${utilisateurId}/mot-de-passe`,
    { motDePasseActuel, nouveauMotDePasse },
    "Le mot de passe n'a pas pu être changé.",
  )
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
