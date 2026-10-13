import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { parSemaine } from '../lib/activite.ts'
import { lireProfil } from '../lib/profil.ts'

// périodes proposées dans le filtre, en nombre de semaines
export const PERIODES = [4, 8]

// logique de l'accueil : période choisie, et tout ce qui en découle pour l'affichage
function useDashboard() {
  const [nbSemaines, setNbSemaines] = useState(PERIODES[0])
  const [profil] = useState(lireProfil)
  // la date du jour est lue une seule fois, à l'ouverture de la page
  const [aujourdHui] = useState(() => new Date())

  // de la plus récente à la plus ancienne
  const seances = [...SEANCES_DEMO].sort((a, b) => b.date.getTime() - a.date.getTime())

  const semaines = parSemaine(seances, nbSemaines, aujourdHui)
  const nbSeances = semaines.reduce((total, semaine) => total + semaine.total, 0)

  return {
    prenom: profil?.prenom ?? '',
    nbSemaines,
    choisirPeriode: setNbSemaines,
    nbSeances,
    semaines,
    // rien s'il n'y a encore aucune séance
    derniereSeance: seances.at(0),
    seancesRecentes: seances.slice(0, 5),
  }
}

export default useDashboard
