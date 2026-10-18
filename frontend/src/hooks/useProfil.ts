import { useState } from 'react'
import { type Profil, enregistrerProfil, lireProfil } from '../lib/profil.ts'

export type ChampProfil =
  | 'prenom'
  | 'nom'
  | 'email'
  | 'dateNaissance'
  | 'taille'
  | 'poids'
  | 'sexe'
  | 'niveau'
  | 'activites'
  | 'objectif'

// logique de la page profil : les informations, affichées en lecture,
// et modifiées une par une (un seul champ ouvert à la fois)
function useProfil() {
  const [profil, setProfil] = useState(lireProfil)
  const [enEdition, setEnEdition] = useState<ChampProfil | null>(null)
  const [message, setMessage] = useState('')

  function enregistrer(modifications: Partial<Profil>, confirmation: string) {
    setProfil(enregistrerProfil(modifications))
    setEnEdition(null)
    setMessage(confirmation)
  }

  return {
    profil,
    enEdition,
    editer: (champ: ChampProfil) => {
      setEnEdition(champ)
      setMessage('')
    },
    annuler: () => setEnEdition(null),
    enregistrer,
    message,
  }
}

export default useProfil
