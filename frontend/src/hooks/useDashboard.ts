import { useState } from 'react'
import { useSeancesMontre } from './useResultatsMontre.ts'
import { bilan, parJour } from '../lib/activite.ts'
import { lireProfil } from '../lib/profil.ts'
import { chargerPlanning, seancesAVenir } from '../lib/programmation.ts'
import { lireResumeRangs } from './useSport.ts'

// logique de l'accueil : les 7 derniers jours, la dernière séance faite et la prochaine prévue,
// les rangs par sport et les séances précédentes
function useDashboard() {
  const resultats = useSeancesMontre()
  const [profil] = useState(lireProfil)
  const [rangs] = useState(lireResumeRangs)
  const [planning] = useState(chargerPlanning)
  // la date du jour est lue une seule fois, à l'ouverture de la page
  const [aujourdHui] = useState(() => new Date())

  // de la plus récente à la plus ancienne. Le service les range déjà dans l'ordre (à date égale,
  // la séance tout juste synchronisée en dernier) : on inverse, sans retrier par date seule,
  // sinon deux séances du même jour gardent l'ordre de la plus ancienne en premier.
  const seances = [...resultats.seances].reverse()

  const jours = parJour(seances, 7, aujourdHui)

  return {
    chargement: resultats.chargement, erreur: resultats.erreur,
    prenom: profil?.prenom ?? '',
    aujourdHui,
    semaine: bilan(jours.flatMap((jour) => jour.seances)),
    derniereSeance: seances.at(0),
    seancesPrecedentes: seances.slice(1, 6),
    programmes: planning.programmes,
    prochaines: seancesAVenir(planning, aujourdHui).slice(0, 3),
    // null : profil incomplet ; sinon les disciplines où au moins un record est saisi, les meilleures d'abord
    rangs: rangs && rangs.filter((d) => d.remplis > 0).sort((a, b) => b.rang - a.rang || b.remplis - a.remplis),
  }
}

export default useDashboard
