import { type SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'

type Mode = 'connexion' | 'inscription'

// logique de la page de connexion : onglet choisi, messages et envoi du formulaire
function useConnexion() {
  const [mode, setMode] = useState<Mode>('connexion')
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const isInscription = mode === 'inscription'

  function choisirMode(nouveauMode: Mode) {
    setMode(nouveauMode)
    setErreur('')
    setMessage('')
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur('')
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const mdp = String(formData.get('mdp') ?? '')

    if (isInscription) {
      const confirmation = String(formData.get('mdp2') ?? '')
      if (mdp !== confirmation) {
        setErreur('Les deux mots de passe ne sont pas identiques.')
        return
      }

      // Démonstration d'interface : la création de compte nécessite un backend.
      sessionStorage.setItem('datafit-email-inscription', email)
      navigate('/profil')
      return
    }

    // La vérification réelle des identifiants nécessite un backend d'authentification.
    setMessage('L’interface fonctionne, mais la connexion réelle n’est pas encore configurée.')
  }

  function handleGoogle() {
    setMessage('La connexion Google doit être configurée avec un fournisseur d’authentification.')
  }

  return { isInscription, erreur, message, choisirMode, handleSubmit, handleGoogle }
}

export default useConnexion
