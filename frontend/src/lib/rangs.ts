// Algo de calcul des rangs E → Z. Fonctions pures : aucune dépendance à React.
import { type Exercice, type Sexe, CATEGORIES, DISCIPLINES, POIDS_CALIBRAGE, TOUS_LES_EXERCICES } from '../data/paliers.ts'

export type Perfs = Record<string, string>

export interface Profil {
  sexe: Sexe
  poidsRef: number // poids de référence de la catégorie (kg)
}

// Catégorie de poids d'une personne (index dans CATEGORIES[sexe]) : la première dont
// la limite n'est pas dépassée. La dernière, « + », accueille tous les poids au-dessus.
export function categoriePourPoids(sexe: Sexe, poids: number): number {
  const categories = CATEGORIES[sexe]
  const index = categories.findIndex(([nom, limite]) => nom.startsWith('-') && poids <= limite)
  return index === -1 ? categories.length - 1 : index
}

// Seuils réels (rangs D à Z) pour un exercice et un profil.
// Charges et lests : seuil = ratio × Pcal^(1/3) × P^(2/3)  (force ∝ poids^(2/3)),
// arrondi à 2,5 kg pour une barre, à 1 kg pour un lest.
// Autres types : les valeurs du barème telles quelles.
export function seuils(ex: Exercice, profil: Profil): number[] | null {
  if (ex.type === 'ladder') return null
  const bareme = ex[profil.sexe] ?? []
  if (ex.type === 'load' || ex.type === 'lest') {
    const k = Math.cbrt(POIDS_CALIBRAGE[profil.sexe]) * Math.pow(profil.poidsRef, 2 / 3)
    const pas = ex.type === 'load' ? 2.5 : 1
    return bareme.map((ratio) => Math.round((ratio * k) / pas) * pas)
  }
  return bareme
}

// "4:30" → 270 s ; "1:25:00" → 5100 s ; "12,3" → 12,3 s
export function lireTemps(texte: string): number {
  const t = texte.trim().replace(',', '.')
  if (!t) return NaN
  const morceaux = t.split(':').map(Number)
  if (morceaux.some(Number.isNaN)) return NaN
  return morceaux.reduce((total, v) => total * 60 + v, 0)
}

export function valeur(ex: Exercice, perfs: Perfs): number {
  const brut = perfs[ex.id]
  if (brut === undefined || brut === '') return NaN
  if (ex.type === 'time') return lireTemps(brut)
  return Number(brut.replace(',', '.'))
}

// Rang de 0 (E) à 7 (Z), ou -1 si la perf n'est pas renseignée.
// On compte les seuils atteints : x ≥ s pour charge/reps/distance, x ≤ s pour un temps.
export function rang(ex: Exercice, perfs: Perfs, profil: Profil): number {
  const x = valeur(ex, perfs)
  if (Number.isNaN(x)) return -1
  if (ex.type === 'ladder') return Math.max(0, Math.min(7, Math.trunc(x)))
  const s = seuils(ex, profil) ?? []
  return s.filter((seuil) => (ex.type === 'time' ? x <= seuil : x >= seuil)).length
}

// Un exercice verrouillé (ex. muscle-up lesté) demande d'avoir validé un autre exercice.
export function estVerrouille(ex: Exercice, perfs: Perfs, profil: Profil): boolean {
  if (!ex.verrou) return false
  const requis = TOUS_LES_EXERCICES.find((e) => e.id === ex.verrou)
  return !requis || rang(requis, perfs, profil) < 1
}

// Progression vers le rang suivant, de 0 à 100.
export function progression(ex: Exercice, perfs: Perfs, profil: Profil): number {
  const r = rang(ex, perfs, profil)
  if (r < 0) return 0
  if (r === 7) return 100
  if (ex.type === 'ladder') return (r / 7) * 100
  const s = seuils(ex, profil) ?? []
  const x = valeur(ex, perfs)
  const bas = r === 0 ? (ex.type === 'time' ? s[0] * 1.3 : 0) : s[r - 1]
  const haut = s[r]
  const p = ex.type === 'time' ? (bas - x) / (bas - haut) : (x - bas) / (haut - bas)
  return Math.max(0, Math.min(100, p * 100))
}

// Rang moyen d'une liste d'exercices (exos non renseignés ou verrouillés ignorés).
export function rangMoyen(exercices: Exercice[], perfs: Perfs, profil: Profil): number {
  const rangs = exercices
    .filter((ex) => !estVerrouille(ex, perfs, profil))
    .map((ex) => rang(ex, perfs, profil))
    .filter((r) => r >= 0)
  if (rangs.length === 0) return -1
  return Math.round(rangs.reduce((a, b) => a + b, 0) / rangs.length)
}

// Résumé de chaque discipline : rang moyen, nombre d'exercices renseignés,
// et les exercices classés (renseignés et non verrouillés), du meilleur au moins bon.
// À rang égal, celui qui est le plus près du rang suivant passe devant.
export function resumeDisciplines(perfs: Perfs, profil: Profil) {
  return DISCIPLINES.map((d) => ({
    id: d.id,
    nom: d.nom,
    total: d.exercices.length,
    remplis: d.exercices.filter((ex) => (perfs[ex.id] ?? '') !== '').length,
    rang: rangMoyen(d.exercices, perfs, profil),
    exercices: d.exercices
      .filter((ex) => !estVerrouille(ex, perfs, profil))
      .map((ex) => ({
        id: ex.id,
        nom: ex.nom,
        rang: rang(ex, perfs, profil),
        progression: progression(ex, perfs, profil),
      }))
      .filter((ex) => ex.rang >= 0)
      .sort((a, b) => b.rang - a.rang || b.progression - a.progression),
  }))
}

export type ResumeDiscipline = ReturnType<typeof resumeDisciplines>[number]

// Nombre minimum de disciplines travaillées (sur 7) pour obtenir un rang global.
export const MIN_DISCIPLINES_RANG_GLOBAL = 5

// Rang global de l'athlète : moyenne des rangs des disciplines travaillées.
// Une discipline sans exercice renseigné (rang -1) est ignorée, sinon elle ferait baisser la moyenne.
// rang = -1 tant que moins de 5 disciplines sur 7 sont travaillées.
export function rangGlobal(resume: ResumeDiscipline[]) {
  const rangs = resume.map((d) => d.rang).filter((r) => r >= 0)
  const rang =
    rangs.length < MIN_DISCIPLINES_RANG_GLOBAL
      ? -1
      : Math.round(rangs.reduce((a, b) => a + b, 0) / rangs.length)
  return { rang, disciplines: rangs.length }
}

// ---------- affichage ----------

const nombre = (n: number, decimales = 1) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: decimales })

export function formatTemps(t: number): string {
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  if (h) return `${h} h ${String(m).padStart(2, '0')}`
  if (m) return `${m}:${String(Math.round(s)).padStart(2, '0')}`
  return `${nombre(s, 2)} s`
}

export function formatValeur(ex: Exercice, x: number): string {
  switch (ex.type) {
    case 'load': return `${nombre(x)} kg`
    case 'lest': return `+${nombre(x)} kg`
    case 'reps': return `${nombre(x)} reps`
    case 'hold': return `${nombre(x)} s`
    case 'dist': return `${nombre(x, 2)} m`
    case 'time': return formatTemps(x)
    default: return String(x)
  }
}

const UNITE_ECART: Record<string, string> = { load: ' kg', lest: ' kg', reps: ' reps', hold: ' s', dist: ' m' }

// Texte « Prochain : A à 102,5 kg · 12,5 kg à prendre »
export function texteProchain(ex: Exercice, perfs: Perfs, profil: Profil, nomsRangs: readonly string[]): string {
  const r = rang(ex, perfs, profil)
  if (r < 0) return 'Pas encore renseigné.'
  if (r === 7) return 'Palier max atteint.'
  if (ex.type === 'ladder') return `Prochain : ${nomsRangs[r + 1]} · ${ex.etapes?.[r + 1] ?? ''}`
  const s = seuils(ex, profil) ?? []
  const x = valeur(ex, perfs)
  const cible = s[r]
  const ecart =
    ex.type === 'time'
      ? `${formatTemps(Math.max(0, x - cible))} à gagner`
      : `${ex.type === 'lest' ? '+' : ''}${nombre(Math.max(0, cible - x), 2)}${UNITE_ECART[ex.type]} à prendre`
  return `Prochain : ${nomsRangs[r + 1]} à ${formatValeur(ex, cible)} · ${ecart}`
}

export function libelleMesure(ex: Exercice): string {
  switch (ex.type) {
    case 'load': return 'charge max (1RM), en kg'
    case 'lest': return 'lest max sur 1 rep, en kg'
    case 'reps': return ex.unite ?? 'reps max'
    case 'hold': return 'tenue max, en secondes'
    case 'dist': return 'meilleure marque, en mètres'
    case 'time': return `${ex.unite ? `${ex.unite} · ` : ''}temps (m:ss ou h:mm:ss)`
    case 'ladder': return 'étape atteinte'
  }
}
