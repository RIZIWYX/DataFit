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

// Ce que « Effacer mes données » (page Profil) peut effacer : les mêmes catégories que le backend
// (CategorieDonnees.java), avec leur nom affiché.
export type CategorieDonnees = 'seances' | 'sommeil' | 'nutrition' | 'performances'

export const CATEGORIES_DONNEES: { valeur: CategorieDonnees; nom: string }[] = [
  { valeur: 'seances', nom: 'Séances de la montre' },
  { valeur: 'sommeil', nom: 'Nuits' },
  { valeur: 'nutrition', nom: 'Repas et eau' },
  { valeur: 'performances', nom: 'Performances et rangs' },
]

// Les clés que l'application garde dans le navigateur pour chaque catégorie (rangées par compte,
// voir cleDuCompte). Où elles sont écrites : notes → useSeance, dernière séance et date de
// synchronisation → useMontre, nutrition → lib/nutrition, records → lib/records, rangs → useSport.
const CLES_PAR_CATEGORIE: Record<CategorieDonnees, string[]> = {
  seances: ['datafit-notes', 'datafit-derniere-seance', 'datafit-synchronisation'],
  sommeil: [],
  nutrition: ['datafit-nutrition'],
  performances: ['datafit-records', 'datafit-rangs'],
}

// Données effacées sur le serveur : on retire aussi leur copie gardée dans ce navigateur
export function oublierDonnees(id: number, categories: CategorieDonnees[]) {
  try {
    for (const categorie of categories) {
      for (const nom of CLES_PAR_CATEGORIE[categorie]) localStorage.removeItem(`${nom}:${id}`)
    }
  } catch {
    // stockage indisponible : rien à effacer
  }
}
