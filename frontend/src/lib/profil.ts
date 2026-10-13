// Profil de l'utilisateur.
// Démonstration : il est gardé dans le navigateur. À remplacer par le compte
// connecté quand le backend sera prêt.

export interface Profil {
  prenom: string
  nom: string
  email: string
  // 0 = pas encore renseigné
  age: number
  taille: number // cm
  poids: number // kg : fixe la catégorie de poids de la page sport
  sexe: string // « H » ou « F » : choisit les barèmes de la page sport
  niveau: string
  activites: string[] // sports préférés (identifiants de data/sports.ts)
  objectif: string
}

const PROFIL_VIDE: Profil = {
  prenom: '',
  nom: '',
  email: '',
  age: 0,
  taille: 0,
  poids: 0,
  sexe: '',
  niveau: '',
  activites: [],
  objectif: '',
}

const CLE_STOCKAGE = 'datafit-profil'

// Rien tant que l'utilisateur n'a rien enregistré.
export function lireProfil(): Profil | null {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE)
    if (!brut) return null
    const garde = JSON.parse(brut)
    return {
      ...PROFIL_VIDE,
      ...garde,
      // les profils enregistrés avant n'avaient qu'un seul « sport pratiqué »
      activites: garde.activites ?? (garde.sport ? [garde.sport] : []),
    }
  } catch {
    return null
  }
}

// Enregistre une partie du profil (une carte de la page) sans toucher au reste.
export function enregistrerProfil(modifications: Partial<Profil>): Profil {
  const profil = { ...(lireProfil() ?? PROFIL_VIDE), ...modifications }
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(profil))
  } catch {
    // stockage indisponible (navigation privée…) : le profil ne sera pas gardé
  }
  return profil
}

// premières lettres du prénom et du nom, pour l'avatar
export const initiales = (profil: Profil) =>
  ((profil.prenom[0] ?? '') + (profil.nom[0] ?? '')).toUpperCase()
