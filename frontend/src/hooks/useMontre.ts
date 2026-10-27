import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { NUITS_DEMO } from '../data/sommeil-demo.ts'
import { lireCompte } from '../lib/compte.ts'
import { finSeance } from '../lib/format.ts'
import { lireProfil } from '../lib/profil.ts'
import { nuits } from '../lib/sommeil.ts'
import { SPORTS_MONTRE, simulerNuit, simulerSeance } from '../services/montreService.ts'

// Aucune vraie montre n'est reliée au site pour l'instant : l'état « connectée » est simulé dans
// la page, et « Synchroniser » demande au backend de simuler une séance et une nuit, de les faire
// analyser puis de les enregistrer. Les chiffres affichés viennent encore des données de démonstration.
const IDENTIFIANT = 'DF-001'

const NOMS_SPORTS = { cardio: 'course', velo: 'vélo', natation: 'natation', muscu: 'musculation' }

// logique de la page montre : état de la connexion, dernière synchronisation et données reçues
function useMontre() {
  const [profil] = useState(lireProfil)
  const [aujourdHui] = useState(() => new Date())
  const [connectee, setConnectee] = useState(true)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

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

  // une séance d'un sport tiré au hasard, et la nuit ; l'une peut réussir sans l'autre
  async function synchroniser() {
    const compte = lireCompte()
    setMessage('')
    setErreur('')
    if (!compte) {
      setErreur('Connectez-vous pour synchroniser la montre.')
      return
    }

    setEnCours(true)
    const sport = SPORTS_MONTRE[Math.floor(Math.random() * SPORTS_MONTRE.length)]
    const [seance, nuit] = await Promise.allSettled([
      simulerSeance(compte.id, sport, `Séance de ${NOMS_SPORTS[sport]}`),
      simulerNuit(compte.id),
    ])
    setEnCours(false)

    const recues = [
      seance.status === 'fulfilled' && `une séance de ${NOMS_SPORTS[sport]}`,
      nuit.status === 'fulfilled' && 'une nuit',
    ].filter(Boolean)
    if (recues.length) {
      setSynchronisation(new Date())
      setMessage(`Synchronisation terminée : ${recues.join(' et ')} reçue${recues.length > 1 ? 's' : ''}.`)
    }
    const echecs = [seance.status === 'rejected' && 'la séance', nuit.status === 'rejected' && 'la nuit'].filter(
      Boolean,
    )
    if (echecs.length) setErreur(`Impossible de récupérer ${echecs.join(' ni ')} : réessayez plus tard.`)
  }

  function basculerConnexion() {
    setConnectee(!connectee)
    setMessage('')
    setErreur('')
  }

  return {
    aujourdHui,
    nom: profil?.prenom ? `Montre de ${profil.prenom}` : 'Ma montre DataFit',
    identifiant: IDENTIFIANT,
    connectee,
    basculerConnexion,
    synchronisation,
    synchroniser,
    enCours,
    message,
    erreur,
    derniereSeance,
    derniereCourse: seances.findLast((s) => s.sport === 'course'),
    nbSeances: seances.length,
    premiereDonnee: seances[0]?.date,
    derniereNuit,
    nbNuits: nuitsRecues.length,
  }
}

export default useMontre
