import { useState } from 'react'
import useCardioSeances from './useCardioSeances.ts'
import { entreeCardio } from '../lib/cardio.ts'
import { joursEcoules } from '../lib/activite.ts'
import { type Categorie, type Entree, entreesHistorique, normaliser, texteRecherche } from '../lib/historique.ts'
import { chargerPlanning } from '../lib/programmation.ts'

// nombre de séances affichées d'un coup ; « Afficher plus » en ajoute autant
const PAR_LOT = 15

// semaines : 0 = pas de limite
export const PERIODES = [
  { semaines: 0, nom: 'Toutes les dates' },
  { semaines: 4, nom: '4 dernières semaines' },
  { semaines: 13, nom: '3 derniers mois' },
  { semaines: 52, nom: '12 derniers mois' },
]

const TRIS = {
  recentes: (a: Entree, b: Entree) => b.date.getTime() - a.date.getTime(),
  anciennes: (a: Entree, b: Entree) => a.date.getTime() - b.date.getTime(),
  longues: (a: Entree, b: Entree) => b.dureeMin - a.dureeMin,
}
export type Tri = keyof typeof TRIS

export interface Groupe {
  titre: string // « Octobre 2026 », ou rien quand le tri n'est pas chronologique
  entrees: Entree[]
}

// logique de l'historique : recherche, filtres, tri, regroupement par mois et affichage par lots
function useHistorique() {
  const { seances, chargement, erreur, connecte, recharger } = useCardioSeances()
  const [categorie, setCategorie] = useState<Categorie | 'tous'>('tous')
  const [nbSemaines, setNbSemaines] = useState(0)
  const [tri, setTri] = useState<Tri>('recentes')
  const [recherche, setRecherche] = useState('')
  const [nbAffichees, setNbAffichees] = useState(PAR_LOT)
  const [aujourdHui] = useState(() => new Date())
  const [planning] = useState(chargerPlanning)

  const mots = normaliser(recherche).split(/\s+/).filter(Boolean)
  // la période et la recherche d'abord : les compteurs des catégories en dépendent
  const candidates = [...seances.map(entreeCardio), ...entreesHistorique([], planning)]
    .filter((entree) => !nbSemaines || joursEcoules(entree.date, aujourdHui) < nbSemaines * 7)
    .filter((entree) => {
      const texte = texteRecherche(entree)
      return mots.every((mot) => texte.includes(mot))
    })

  const retenues = candidates
    .filter((entree) => categorie === 'tous' || entree.categorie === categorie)
    .sort(TRIS[tri])
  const affichees = retenues.slice(0, nbAffichees)

  // regroupement par mois, seulement quand l'ordre est chronologique
  const groupes: Groupe[] = []
  for (const entree of affichees) {
    const mois = entree.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const titre = tri === 'longues' ? '' : mois[0].toUpperCase() + mois.slice(1)
    const dernier = groupes.at(-1)
    if (dernier && dernier.titre === titre) dernier.entrees.push(entree)
    else groupes.push({ titre, entrees: [entree] })
  }

  // tout changement de filtre repart du premier lot
  const filtrer = <T,>(changer: (valeur: T) => void) => (valeur: T) => {
    changer(valeur)
    setNbAffichees(PAR_LOT)
  }

  return {
    chargement, erreur, connecte, recharger,
    aujourdHui,
    categorie,
    choisirCategorie: filtrer(setCategorie),
    nbSemaines,
    choisirPeriode: filtrer(setNbSemaines),
    tri,
    choisirTri: filtrer(setTri),
    recherche,
    chercher: filtrer(setRecherche),
    effacerFiltres: () => {
      setCategorie('tous')
      setNbSemaines(0)
      setRecherche('')
      setNbAffichees(PAR_LOT)
    },
    // nombre d'entrées par catégorie, pour les compteurs des filtres
    compte: (c: Categorie | 'tous') => candidates.filter((e) => c === 'tous' || e.categorie === c).length,
    groupes,
    total: {
      nombre: retenues.length,
      minutes: retenues.reduce((somme, e) => somme + e.dureeMin, 0),
      km: retenues.reduce((somme, e) => somme + e.km, 0),
    },
    reste: retenues.length - affichees.length,
    afficherPlus: () => setNbAffichees((n) => n + PAR_LOT),
  }
}

export default useHistorique
