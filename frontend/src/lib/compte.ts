// Compte créé à l'inscription : son identifiant (renvoyé par le backend) et son adresse e-mail.
// Gardé dans le navigateur en attendant une vraie connexion : la page de création du profil
// en a besoin pour rattacher le profil au bon utilisateur.

export interface Compte {
  id: number
  email: string
}

const CLE_STOCKAGE = 'datafit-compte'

// Rien tant qu'aucun compte n'a été créé depuis ce navigateur.
export function lireCompte(): Compte | null {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE)
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

export function enregistrerCompte(compte: Compte) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(compte))
  } catch {
    // stockage indisponible (navigation privée…) : le compte ne sera pas gardé
  }
}
