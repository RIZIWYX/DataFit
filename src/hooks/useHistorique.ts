import { useState } from 'react'
import { type Seance, SEANCES_DEMO } from '../data/seances.ts'
import { type Sport } from '../data/sports.ts'
import { dansLaPeriode } from '../lib/activite.ts'

const PAR_PAGE = 8

// semaines : 0 = pas de limite
export const PERIODES = [
  { semaines: 0, nom: 'Toutes les dates' },
  { semaines: 4, nom: '4 dernières semaines' },
  { semaines: 13, nom: '3 derniers mois' },
]

const TRIS = {
  recentes: (a: Seance, b: Seance) => b.date.getTime() - a.date.getTime(),
  anciennes: (a: Seance, b: Seance) => a.date.getTime() - b.date.getTime(),
  longues: (a: Seance, b: Seance) => b.dureeMin - a.dureeMin,
}
export type Tri = keyof typeof TRIS

// logique de l'historique : filtres, tri et découpage en pages
function useHistorique() {
  const [sport, setSport] = useState<Sport | 'tous'>('tous')
  const [nbSemaines, setNbSemaines] = useState(0)
  const [tri, setTri] = useState<Tri>('recentes')
  const [page, setPage] = useState(1)
  const [aujourdHui] = useState(() => new Date())

  const retenues = (nbSemaines ? dansLaPeriode(SEANCES_DEMO, nbSemaines, aujourdHui) : [...SEANCES_DEMO])
    .filter((seance) => sport === 'tous' || seance.sport === sport)
    .sort(TRIS[tri])

  const nbPages = Math.max(1, Math.ceil(retenues.length / PAR_PAGE))
  const pageCourante = Math.min(page, nbPages)

  return {
    sport,
    nbSemaines,
    tri,
    // changer un filtre ramène à la première page
    choisirSport: (valeur: Sport | 'tous') => { setSport(valeur); setPage(1) },
    choisirPeriode: (valeur: number) => { setNbSemaines(valeur); setPage(1) },
    choisirTri: (valeur: Tri) => { setTri(valeur); setPage(1) },
    seances: retenues.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE),
    nbSeances: retenues.length,
    page: pageCourante,
    nbPages,
    allerALaPage: setPage,
  }
}

export default useHistorique
