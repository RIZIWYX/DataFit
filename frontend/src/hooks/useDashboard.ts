import { useState } from 'react'
import { useSeancesMontre } from './useResultatsMontre.ts'
import { bilan, parJour } from '../lib/activite.ts'
import { seancesRecentes } from '../lib/historique.ts'
import { lireProfil } from '../lib/profil.ts'
import { lireResumeRangs } from './useSport.ts'

// logique de l'accueil : les 7 derniers jours, la dernière séance,
// les rangs par sport et les séances précédentes
function useDashboard() {
  const resultats = useSeancesMontre()
  const [profil] = useState(lireProfil)
  const [rangs] = useState(lireResumeRangs)
  // la date du jour est lue une seule fois, à l'ouverture de la page
  const [aujourdHui] = useState(() => new Date())

  // même ordre que la page Historique
  const seances = seancesRecentes(resultats.seances)

  const jours = parJour(seances, 7, aujourdHui)

  return {
    chargement: resultats.chargement, erreur: resultats.erreur,
    prenom: profil?.prenom ?? '',
    aujourdHui,
    semaine: bilan(jours.flatMap((jour) => jour.seances)),
    derniereSeance: seances.at(0),
    seancesPrecedentes: seances.slice(1, 6),
    // null : profil incomplet ; sinon les disciplines où au moins un record est saisi, les meilleures d'abord
    rangs: rangs && rangs.filter((d) => d.remplis > 0).sort((a, b) => b.rang - a.rang || b.remplis - a.remplis),
  }
}

export default useDashboard
