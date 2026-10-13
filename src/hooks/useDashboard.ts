import { useEffect, useState } from 'react'
import { CATEGORIES, DISCIPLINES, type Sexe } from '../data/paliers.ts'
import { type Perfs, type Profil, rangMoyen } from '../lib/rangs.ts'

const CLE_STOCKAGE = 'datafit-rangs'

interface Etat {
  sexe: Sexe
  categorie: number // index dans CATEGORIES[sexe]
  onglet: string
  perfs: Perfs
}

const ETAT_INITIAL: Etat = { sexe: 'H', categorie: 3, onglet: 'sbd', perfs: {} }

// Démonstration : les perfs sont gardées dans le navigateur.
// À remplacer par un appel au backend quand l'API sera prête.
function chargerEtat(): Etat {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE)
    return brut ? { ...ETAT_INITIAL, ...JSON.parse(brut) } : ETAT_INITIAL
  } catch {
    return ETAT_INITIAL
  }
}

// logique du dashboard : profil choisi, perfs saisies et valeurs calculées pour l'affichage
function useDashboard() {
  const [etat, setEtat] = useState<Etat>(chargerEtat)

  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat))
    } catch {
      // stockage indisponible (navigation privée…) : on continue sans sauvegarder
    }
  }, [etat])

  const categories = CATEGORIES[etat.sexe]
  const indexCategorie = Math.min(etat.categorie, categories.length - 1)
  const [nomCategorie, poidsRef] = categories[indexCategorie]
  const profil: Profil = { sexe: etat.sexe, poidsRef }
  const discipline = DISCIPLINES.find((d) => d.id === etat.onglet) ?? DISCIPLINES[0]
  const parCategorie = discipline.exercices.some((ex) => ex.type === 'load' || ex.type === 'lest')

  // résumé par discipline : rang moyen et nombre d'exercices renseignés
  const resume = DISCIPLINES.map((d) => ({
    id: d.id,
    nom: d.nom,
    total: d.exercices.length,
    remplis: d.exercices.filter((ex) => (etat.perfs[ex.id] ?? '') !== '').length,
    rang: rangMoyen(d.exercices, etat.perfs, profil),
  }))

  const choisirSexe = (sexe: Sexe) => setEtat((e) => ({ ...e, sexe }))
  const choisirCategorie = (categorie: number) => setEtat((e) => ({ ...e, categorie }))
  const choisirOnglet = (onglet: string) => setEtat((e) => ({ ...e, onglet }))
  const majPerf = (id: string, v: string) =>
    setEtat((e) => ({ ...e, perfs: { ...e.perfs, [id]: v } }))
  const toutEffacer = () => setEtat((e) => ({ ...e, perfs: {} }))

  return {
    sexe: etat.sexe,
    perfs: etat.perfs,
    categories,
    indexCategorie,
    nomCategorie,
    poidsRef,
    profil,
    discipline,
    parCategorie,
    resume,
    choisirSexe,
    choisirCategorie,
    choisirOnglet,
    majPerf,
    toutEffacer,
  }
}

export default useDashboard
