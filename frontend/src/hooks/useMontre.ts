import { useState } from 'react'
import { cleDuCompte, lireCompte } from '../lib/compte.ts'
import { lireProfil } from '../lib/profil.ts'
import { useSeancesMontre } from './useResultatsMontre.ts'
import useSommeil from './useSommeil.ts'
import { SPORTS_MONTRE, simulerNuit, simulerSeance } from '../services/montreService.ts'

// La connexion à la montre reste simulée. Les résultats affichés sont ceux du backend.
// Une synchronisation produit des mesures, les analyse puis les enregistre en base.
function lireSynchronisation(): Date | null {
  try {
    const date = localStorage.getItem(cleDuCompte('datafit-synchronisation'))
    return date && Number.isFinite(Date.parse(date)) ? new Date(date) : null
  } catch { return null }
}

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

  const resultats = useSeancesMontre()
  const sommeil = useSommeil()
  const seances = resultats.seances
  const derniereSeance = seances.at(-1)
  const nuitsRecues = sommeil.nuits
  const derniereNuit = nuitsRecues.at(-1)
  const [synchronisation, setSynchronisation] = useState(lireSynchronisation)

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
      // Ne pas attribuer les résultats à un compte changé pendant la requête.
      if (lireCompte()?.id !== compte.id) return
      if (seance.status === 'fulfilled' && seance.value && typeof seance.value === 'object' && 'id' in seance.value) {
        try {
          localStorage.setItem(cleDuCompte('datafit-derniere-seance'), `${sport}-${seance.value.id}`)
        } catch { /* facultatif */ }
      }
      const date = new Date()
      setSynchronisation(date)
      try { localStorage.setItem(cleDuCompte('datafit-synchronisation'), date.toISOString()) } catch { /* facultatif */ }
      window.dispatchEvent(new Event('datafit-synchronisation'))
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
    erreur: [erreur, resultats.erreur, sommeil.erreur].filter(Boolean).join(' '),
    chargement: resultats.chargement || sommeil.chargement,
    derniereSeance,
    derniereCourse: seances.findLast((s) => s.sport === 'course'),
    nbSeances: seances.length,
    premiereDonnee: seances[0]?.date,
    derniereNuit,
    nbNuits: nuitsRecues.length,
  }
}

export default useMontre
