// id et e-mail du compte, gardés dans le navigateur (utilisés par la création du profil)

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
    // stockage indisponible (navigation privée...) : le compte ne sera pas gardé
  }
}

// Ce que l'application garde dans le navigateur (journal nutrition, programmes, records, notes, rangs)
// est rangé par compte : "datafit-nutrition:12" pour le compte 12. Un nouveau compte part donc
// de zéro, et chacun retrouve ses données en se reconnectant. Sans compte : le nom seul.
export function cleDuCompte(nom: string): string {
  const compte = lireCompte()
  return compte ? `${nom}:${compte.id}` : nom
}
