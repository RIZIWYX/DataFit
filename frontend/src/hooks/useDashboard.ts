import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { bilan, parJour } from '../lib/activite.ts'
import { avancement, lireObjectifs } from '../lib/objectifs.ts'
import { lireProfil } from '../lib/profil.ts'
import { chargerPlanning, seancesAVenir } from '../lib/programmation.ts'
import { chargerEtat, lireResumeRangs } from './useSport.ts'

// logique de l'accueil : les 7 derniers jours, la dernière séance faite et la prochaine prévue,
// les objectifs en cours, les rangs et les séances précédentes
function useDashboard() {
  const [profil] = useState(lireProfil)
  const [rangs] = useState(lireResumeRangs)
  const [planning] = useState(chargerPlanning)
  const [objectifs] = useState(lireObjectifs)
  const [perfs] = useState(() => chargerEtat().perfs)
  // la date du jour est lue une seule fois, à l'ouverture de la page
  const [aujourdHui] = useState(() => new Date())

  // de la plus récente à la plus ancienne
  const seances = [...SEANCES_DEMO].sort((a, b) => b.date.getTime() - a.date.getTime())

  // 14 jours : les 7 derniers, et les 7 d'avant pour comparer
  const quinzaine = parJour(seances, 14, aujourdHui)
  const avant = quinzaine.slice(0, 7)
  const jours = quinzaine.slice(7)

  // les objectifs en cours, les plus avancés d'abord (ceux qu'on ne peut pas mesurer en dernier)
  const enCours = objectifs
    .filter((o) => o.statut === 'en-cours')
    .map((objectif) => ({ objectif, avancement: avancement(objectif, perfs, SEANCES_DEMO, aujourdHui) }))
    .sort((a, b) => (b.avancement?.part ?? -1) - (a.avancement?.part ?? -1))

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
    objectifs: enCours,
    // ancien champ texte du profil, affiché tant qu'aucun objectif n'est fixé
    objectifTexte: profil?.objectif ?? '',
    // null : profil incomplet ; sinon les disciplines où au moins un record est saisi, les meilleures d'abord
    rangs: rangs && rangs.filter((d) => d.remplis > 0).sort((a, b) => b.rang - a.rang || b.remplis - a.remplis),
  }
}

export default useDashboard
