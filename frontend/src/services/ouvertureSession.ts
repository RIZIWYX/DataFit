// Ce qui se passe juste après une connexion réussie (e-mail ou Google).
import { type Compte, enregistrerCompte } from '../lib/compte.ts'
import { effacerProfil, enregistrerProfil } from '../lib/profil.ts'
import { chargerProfil } from './profilService.ts'

// Garde le compte dans le navigateur, charge son profil depuis le serveur (la source : le navigateur
// n'en garde qu'une copie, effacée à la déconnexion) et renvoie la page où aller.
// Lance une erreur si le serveur ne répond pas.
export async function ouvrirSession(compte: Compte): Promise<'/dashboard' | '/creation-profil'> {
  enregistrerCompte(compte)
  // la copie du navigateur ne doit rien garder d'un autre compte
  effacerProfil()

  const profil = await chargerProfil(compte.id)
  if (!profil) return '/creation-profil' // compte sans profil : à créer

  enregistrerProfil({ ...profil, email: compte.email })
  return '/dashboard'
}
