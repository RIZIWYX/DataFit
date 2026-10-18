// Profil de l'utilisateur.
// Démonstration : il est gardé dans le navigateur. À remplacer par le compte
// connecté quand le backend sera prêt.

export interface Profil {
  prenom: string
  nom: string
  email: string
  dateNaissance: string // « AAAA-MM-JJ » ; vide = pas encore renseignée
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
  dateNaissance: '',
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

// Nouveau compte : le profil gardé dans le navigateur ne lui appartient pas, il est à refaire.
export function effacerProfil() {
  try {
    localStorage.removeItem(CLE_STOCKAGE)
  } catch {
    // stockage indisponible : rien à effacer
  }
}

// Complet quand tout ce que demande la page de création du profil est rempli.
// Tant qu'il ne l'est pas, l'application reste fermée (AppLayout).
export const profilComplet = (profil: Profil | null) =>
  profil !== null &&
  profil.prenom !== '' &&
  profil.nom !== '' &&
  profil.dateNaissance !== '' &&
  profil.sexe !== '' &&
  profil.taille > 0 &&
  profil.poids > 0 &&
  profil.niveau !== '' &&
  profil.activites.length > 0 &&
  profil.objectif !== ''

// les choix proposés, communs à la création du profil et à la page Profil
export const SEXES = [
  { valeur: 'H', nom: 'Homme' },
  { valeur: 'F', nom: 'Femme' },
]
export const NIVEAUX = [
  { valeur: 'novice', nom: 'Novice' },
  { valeur: 'intermediaire', nom: 'Intermédiaire' },
  { valeur: 'pro', nom: 'Confirmé' },
]
// l'objectif est gardé en toutes lettres : l'accueil l'affiche tel quel
export const OBJECTIFS = [
  'Gagner en force',
  'Prendre du muscle',
  'Améliorer mon endurance',
  'Perdre du poids',
  'Rester en forme',
].map((nom) => ({ valeur: nom, nom }))

// dates de naissance acceptées : entre 10 et 100 ans, au format des champs date (« AAAA-MM-JJ »)
export function bornesNaissance(aujourdHui = new Date()) {
  const ilYa = (ans: number) => {
    const date = new Date(aujourdHui.getFullYear() - ans, aujourdHui.getMonth(), aujourdHui.getDate())
    const deuxChiffres = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`
  }
  return { min: ilYa(100), max: ilYa(10) }
}

// premières lettres du prénom et du nom, pour l'avatar
export const initiales = (profil: Profil) =>
  ((profil.prenom[0] ?? '') + (profil.nom[0] ?? '')).toUpperCase()
