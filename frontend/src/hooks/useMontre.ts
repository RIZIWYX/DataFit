import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { NUITS_DEMO } from '../data/sommeil-demo.ts'
import { finSeance } from '../lib/format.ts'
import { lireProfil } from '../lib/profil.ts'
import { nuits } from '../lib/sommeil.ts'

// Démonstration : aucune vraie montre n'est reliée au site pour l'instant.
// L'état « connectée » et la synchronisation sont simulés dans la page.
const IDENTIFIANT = 'DF-001'

// logique de la page montre : état de la connexion, dernière synchronisation et données reçues
function useMontre() {
  const [profil] = useState(lireProfil)
  const [aujourdHui] = useState(() => new Date())
  const [connectee, setConnectee] = useState(true)
  const [message, setMessage] = useState('')

  // de la plus ancienne à la plus récente
  const seances = [...SEANCES_DEMO].sort((a, b) => a.date.getTime() - b.date.getTime())
  const derniereSeance = seances.at(-1)
  const nuitsRecues = nuits(NUITS_DEMO, aujourdHui)
  const derniereNuit = nuitsRecues.at(-1)

  // au départ, la dernière synchronisation est la plus récente des données reçues
  const [synchronisation, setSynchronisation] = useState(() => {
    const dates = [derniereSeance && finSeance(derniereSeance), derniereNuit?.lever].filter((d): d is Date => !!d)
    return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null
  })

  function synchroniser() {
    setSynchronisation(new Date())
    setMessage('Synchronisation terminée : aucune nouvelle donnée à récupérer.')
  }

  function basculerConnexion() {
    setConnectee(!connectee)
    setMessage('')
  }

  return {
    aujourdHui,
    nom: profil?.prenom ? `Montre de ${profil.prenom}` : 'Ma montre DataFit',
    identifiant: IDENTIFIANT,
    connectee,
    basculerConnexion,
    synchronisation,
    synchroniser,
    message,
    derniereSeance,
    derniereCourse: seances.findLast((s) => s.sport === 'course'),
    nbSeances: seances.length,
    premiereDonnee: seances[0]?.date,
    derniereNuit,
    nbNuits: nuitsRecues.length,
  }
}

export default useMontre
