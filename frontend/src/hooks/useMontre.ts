import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { finSeance } from '../lib/format.ts'
import { lireProfil } from '../lib/profil.ts'

// Démonstration : aucune vraie montre n'est reliée au site pour l'instant.
// L'état « connectée » et la synchronisation sont simulés dans la page.
const IDENTIFIANT = 'DF-001'

// logique de la page montre : état de la connexion et dernière séance reçue
function useMontre() {
  const [profil] = useState(lireProfil)
  const [connectee, setConnectee] = useState(true)
  const [message, setMessage] = useState('')

  // la séance la plus récente : c'est la dernière que la montre a envoyée
  const derniereSeance = [...SEANCES_DEMO].sort((a, b) => b.date.getTime() - a.date.getTime()).at(0)

  // au départ, la dernière synchronisation date de la fin de cette séance
  const [synchronisation, setSynchronisation] = useState(() =>
    derniereSeance ? finSeance(derniereSeance) : null,
  )

  function synchroniser() {
    setSynchronisation(new Date())
    setMessage('Aucune nouvelle séance à récupérer.')
  }

  function basculerConnexion() {
    setConnectee(!connectee)
    setMessage('')
  }

  return {
    nom: profil?.prenom ? `Montre de ${profil.prenom}` : 'Ma montre DataFit',
    identifiant: IDENTIFIANT,
    connectee,
    basculerConnexion,
    synchronisation,
    synchroniser,
    message,
    derniereSeance,
  }
}

export default useMontre
