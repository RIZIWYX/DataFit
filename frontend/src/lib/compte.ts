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

// Ce que l'application garde dans le navigateur (journal nutrition, records, notes, rangs)
// est rangé par compte : "datafit-nutrition:12" pour le compte 12. Un nouveau compte part donc
// de zéro, et chacun retrouve ses données en se reconnectant. Sans compte : le nom seul.
export function cleDuCompte(nom: string): string {
  const compte = lireCompte()
  return compte ? `${nom}:${compte.id}` : nom
}

// Compte supprimé : on efface ce que l'application gardait pour lui dans ce navigateur, le compte
// lui-même et toutes les clés rangées par compte ("datafit-nutrition:12"...). Le profil, gardé
// sans numéro de compte, est effacé à part (effacerProfil).
export function oublierCompte(id: number) {
  try {
    for (const cle of Object.keys(localStorage)) {
      if (cle === CLE_STOCKAGE || (cle.startsWith('datafit-') && cle.endsWith(`:${id}`))) {
        localStorage.removeItem(cle)
      }
    }
  } catch {
    // stockage indisponible : rien à effacer
  }
}
