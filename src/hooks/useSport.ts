import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CATEGORIES, DISCIPLINES, type Sexe } from '../data/paliers.ts'
import { lireProfil } from '../lib/profil.ts'
import { type Perfs, type Profil, categoriePourPoids, rangMoyen } from '../lib/rangs.ts'

const CLE_STOCKAGE = 'datafit-rangs'

interface Etat {
  onglet: string
  perfs: Perfs
}

const ETAT_INITIAL: Etat = { onglet: 'sbd', perfs: {} }

// Démonstration : les perfs sont gardées dans le navigateur.
// À remplacer par un appel au backend quand l'API sera prête.
function chargerEtat(): Etat {
  try {
    const garde = JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? '{}')
    return { onglet: garde.onglet ?? ETAT_INITIAL.onglet, perfs: garde.perfs ?? {} }
  } catch {
    return ETAT_INITIAL
  }
}

// Le sexe et le poids ne se choisissent pas ici : ils viennent de la page profil.
// Rien tant que le profil n'est pas rempli.
function lireMorphologie(): { sexe: Sexe; poids: number } | null {
  const profil = lireProfil()
  if (!profil || (profil.sexe !== 'H' && profil.sexe !== 'F') || !(profil.poids > 0)) return null
  return { sexe: profil.sexe, poids: profil.poids }
}

// logique de la page sport : catégorie tirée du profil, perfs saisies et valeurs calculées
function useSport() {
  // /sport?discipline=nat ouvre directement l'onglet demandé
  const [parametres] = useSearchParams()
  const demandee = parametres.get('discipline')

  const [etat, setEtat] = useState<Etat>(() => {
    const garde = chargerEtat()
    return demandee && DISCIPLINES.some((d) => d.id === demandee) ? { ...garde, onglet: demandee } : garde
  })
  const [morphologie] = useState(lireMorphologie)

  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat))
    } catch {
      // stockage indisponible (navigation privée…) : on continue sans sauvegarder
    }
  }, [etat])

  // sans profil, la page n'affiche pas les rangs : ces valeurs ne servent alors qu'à éviter les cas vides
  const { sexe, poids } = morphologie ?? { sexe: 'H' as const, poids: 0 }
  const [nomCategorie, poidsRef] = CATEGORIES[sexe][categoriePourPoids(sexe, poids)]
  const profil: Profil = { sexe, poidsRef }
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

  const choisirOnglet = (onglet: string) => setEtat((e) => ({ ...e, onglet }))
  const majPerf = (id: string, v: string) =>
    setEtat((e) => ({ ...e, perfs: { ...e.perfs, [id]: v } }))
  const toutEffacer = () => setEtat((e) => ({ ...e, perfs: {} }))

  return {
    profilRempli: morphologie !== null,
    sexe,
    poids,
    perfs: etat.perfs,
    nomCategorie,
    poidsRef,
    profil,
    discipline,
    parCategorie,
    resume,
    choisirOnglet,
    majPerf,
    toutEffacer,
  }
}

export default useSport
