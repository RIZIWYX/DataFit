// Nutrition : les besoins estimés à partir du profil, et le journal des repas saisis.
// Fonctions pures, sauf la lecture et l'écriture du journal (gardé dans le navigateur).
// Les besoins sont des estimations (équation de Mifflin-St Jeor), pas une prescription.

import { cleDuCompte } from './compte.ts'
import { type Profil } from './profil.ts'
import { nouvelId } from './programmation.ts'

// ---------- besoins ----------

export type NiveauActivite = 'sedentaire' | 'leger' | 'modere' | 'intense'

// facteurs d'activité usuels : dépense de la journée = métabolisme de base × facteur
export const ACTIVITES: { valeur: NiveauActivite; nom: string; detail: string; facteur: number }[] = [
  { valeur: 'sedentaire', nom: 'Sédentaire', detail: 'peu ou pas de sport', facteur: 1.2 },
  { valeur: 'leger', nom: 'Léger', detail: '1 à 3 séances par semaine', facteur: 1.375 },
  { valeur: 'modere', nom: 'Modéré', detail: '3 à 5 séances par semaine', facteur: 1.55 },
  { valeur: 'intense', nom: 'Intense', detail: '6 séances ou plus par semaine', facteur: 1.725 },
]

// proposé tant que l'utilisateur n'a rien choisi, d'après le niveau du profil
export const activiteParDefaut = (niveau: string): NiveauActivite =>
  niveau === 'pro' ? 'intense' : niveau === 'intermediaire' ? 'modere' : 'leger'

// selon l'objectif : un écart à la dépense, et les protéines par kilo de poids
// (les objectifs sont ceux du profil, voir OBJECTIFS dans profil.ts)
const REPERES_OBJECTIF: Record<string, { ecart: number; proteinesParKg: number; explication: string }> = {
  'Perdre du poids': { ecart: -0.15, proteinesParKg: 2, explication: '15 % sous la dépense, protéines hautes pour garder le muscle' },
  'Prendre du muscle': { ecart: 0.1, proteinesParKg: 1.8, explication: '10 % au-dessus de la dépense, pour construire' },
  'Gagner en force': { ecart: 0.05, proteinesParKg: 1.8, explication: 'un léger surplus de 5 %' },
  'Améliorer mon endurance': { ecart: 0, proteinesParKg: 1.4, explication: 'autant que la dépense, les glucides en premier' },
  'Rester en forme': { ecart: 0, proteinesParKg: 1.2, explication: 'autant que la dépense' },
}
const REPERES_PAR_DEFAUT = REPERES_OBJECTIF['Rester en forme']

// part des calories apportée par les lipides ; les glucides complètent
export const PART_LIPIDES = 0.25
// kcal par gramme
export const KCAL = { proteines: 4, glucides: 4, lipides: 9 }

// les calories d'un aliment dont on ne connaît que les grammes de chaque macronutriment
export const kcalDesMacros = (proteines: number, glucides: number, lipides: number) =>
  Math.round(proteines * KCAL.proteines + glucides * KCAL.glucides + lipides * KCAL.lipides)
// repère d'hydratation courant : 35 ml par kilo, boissons comprises
const EAU_PAR_KG = 35
export const VERRE_ML = 250

export function age(dateNaissance: string, aujourdHui: Date): number {
  const naissance = new Date(`${dateNaissance}T00:00`)
  let ans = aujourdHui.getFullYear() - naissance.getFullYear()
  const anniversairePasse =
    aujourdHui.getMonth() > naissance.getMonth() ||
    (aujourdHui.getMonth() === naissance.getMonth() && aujourdHui.getDate() >= naissance.getDate())
  if (!anniversairePasse) ans -= 1
  return ans
}

export interface Besoins {
  age: number
  metabolismeBase: number // kcal dépensées au repos
  depense: number // kcal dépensées dans la journée, activité comprise
  ecart: number // ajustement de l'objectif : -0,15 = 15 % de moins
  explication: string
  proteinesParKg: number
  kcal: number // la cible du jour
  proteines: number // g
  glucides: number // g
  lipides: number // g
  eauMl: number
}

const arrondi = (n: number, pas: number) => Math.round(n / pas) * pas

export function calculerBesoins(
  profil: Profil,
  objectif: string,
  activite: NiveauActivite,
  aujourdHui: Date,
): Besoins {
  const ans = age(profil.dateNaissance, aujourdHui)
  // Mifflin-St Jeor : la plus fiable des formules courantes pour les adultes
  const metabolismeBase =
    10 * profil.poids + 6.25 * profil.taille - 5 * ans + (profil.sexe === 'H' ? 5 : -161)
  const facteur = ACTIVITES.find((a) => a.valeur === activite)?.facteur ?? 1.375
  const depense = metabolismeBase * facteur
  const reperes = REPERES_OBJECTIF[objectif] ?? REPERES_PAR_DEFAUT

  const kcal = arrondi(depense * (1 + reperes.ecart), 10)
  const proteines = Math.round(profil.poids * reperes.proteinesParKg)
  const lipides = Math.round((kcal * PART_LIPIDES) / KCAL.lipides)
  const glucides = Math.max(
    0,
    Math.round((kcal - proteines * KCAL.proteines - lipides * KCAL.lipides) / KCAL.glucides),
  )

  return {
    age: ans,
    metabolismeBase: arrondi(metabolismeBase, 10),
    depense: arrondi(depense, 10),
    ecart: reperes.ecart,
    explication: reperes.explication,
    proteinesParKg: reperes.proteinesParKg,
    kcal,
    proteines,
    glucides,
    lipides,
    eauMl: arrondi(profil.poids * EAU_PAR_KG, 100),
  }
}

// ---------- journal ----------

export type Repas = 'petit-dejeuner' | 'dejeuner' | 'diner' | 'collation'

export const REPAS: { valeur: Repas; nom: string }[] = [
  { valeur: 'petit-dejeuner', nom: 'Petit-déjeuner' },
  { valeur: 'dejeuner', nom: 'Déjeuner' },
  { valeur: 'diner', nom: 'Dîner' },
  { valeur: 'collation', nom: 'Collations' },
]

export interface Aliment {
  id: string
  jour: string // « AAAA-MM-JJ »
  repas: Repas
  nom: string
  kcal: number
  proteines: number // g
  glucides: number // g
  lipides: number // g
}

export interface Journal {
  aliments: Aliment[]
  verres: Record<string, number> // verres d'eau bus, par jour
  // choisis sur la page ; sinon, ceux du profil
  objectif?: string
  activite?: NiveauActivite
}

export interface Totaux {
  kcal: number
  proteines: number
  glucides: number
  lipides: number
}

const JOURNAL_VIDE: Journal = { aliments: [], verres: {} }
// un journal par compte (voir cleDuCompte)
const CLE_STOCKAGE = 'datafit-nutrition'

export function lireJournal(): Journal {
  try {
    return { ...JOURNAL_VIDE, ...JSON.parse(localStorage.getItem(cleDuCompte(CLE_STOCKAGE)) ?? '{}') }
  } catch {
    return JOURNAL_VIDE
  }
}

export function enregistrerJournal(journal: Journal) {
  try {
    localStorage.setItem(cleDuCompte(CLE_STOCKAGE), JSON.stringify(journal))
  } catch {
    // stockage indisponible (navigation privée…) : le journal ne sera pas gardé
  }
}

export const nouvelAliment = (aliment: Omit<Aliment, 'id'>): Aliment => ({ ...aliment, id: nouvelId() })

export function totaux(aliments: Aliment[]): Totaux {
  return aliments.reduce(
    (t, a) => ({
      kcal: t.kcal + a.kcal,
      proteines: t.proteines + a.proteines,
      glucides: t.glucides + a.glucides,
      lipides: t.lipides + a.lipides,
    }),
    { kcal: 0, proteines: 0, glucides: 0, lipides: 0 },
  )
}

// date locale → « AAAA-MM-JJ » (la clé d'un jour dans le journal)
export function cleJour(date: Date): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`
}

export function decalerJour(date: Date, jours: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + jours)
}
