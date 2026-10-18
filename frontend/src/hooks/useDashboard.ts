import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { bilan, parJour } from '../lib/activite.ts'
import { lireProfil } from '../lib/profil.ts'
import { chargerPlanning, seancesAVenir } from '../lib/programmation.ts'
import { lireResumeRangs } from './useSport.ts'

// logique de l'accueil : les 7 derniers jours, la dernière séance faite et la prochaine prévue,
// l'objectif principal, les rangs et les séances précédentes
function useDashboard() {
  const [profil] = useState(lireProfil)
  const [rangs] = useState(lireResumeRangs)
  const [planning] = useState(chargerPlanning)
  // la date du jour est lue une seule fois, à l'ouverture de la page
  const [aujourdHui] = useState(() => new Date())

  // de la plus récente à la plus ancienne
  const seances = [...SEANCES_DEMO].sort((a, b) => b.date.getTime() - a.date.getTime())

  // 14 jours : les 7 derniers, et les 7 d'avant pour comparer
  const quinzaine = parJour(seances, 14, aujourdHui)
  const avant = quinzaine.slice(0, 7)
  const jours = quinzaine.slice(7)

  return {
    prenom: profil?.prenom ?? '',
    aujourdHui,
    jours,
    semaine: bilan(jours.flatMap((jour) => jour.seances)),
    semainePrecedente: bilan(avant.flatMap((jour) => jour.seances)),
    derniereSeance: seances.at(0),
    seancesPrecedentes: seances.slice(1, 6),
    programmes: planning.programmes,
    prochaines: seancesAVenir(planning, aujourdHui).slice(0, 3),
    // l'objectif principal du profil
    objectif: profil?.objectif ?? '',
    // null : profil incomplet ; sinon les disciplines où au moins un record est saisi, les meilleures d'abord
    rangs: rangs && rangs.filter((d) => d.remplis > 0).sort((a, b) => b.rang - a.rang || b.remplis - a.remplis),
  }
}

export default useDashboard
