import { type SubmitEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

type Mode = 'connexion' | 'inscription'

// logique de la page de connexion : mode choisi, messages et envoi du formulaire
function useConnexion() {
  // /connexion?mode=inscription ouvre directement le formulaire d'inscription
  const [parametres] = useSearchParams()
  const [mode, setMode] = useState<Mode>(parametres.get('mode') === 'inscription' ? 'inscription' : 'connexion')
  const [mdpVisible, setMdpVisible] = useState(false)
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const isInscription = mode === 'inscription'

  function basculerMode() {
    setMode(isInscription ? 'connexion' : 'inscription')
    setErreur('')
    setMessage('')
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur('')
    setMessage('')

    const formData = new FormData(event.currentTarget)

    if (isInscription) {
      if (formData.get('mdp') !== formData.get('mdp2')) {
        setErreur('Les deux mots de passe ne sont pas identiques.')
        return
      }
      // Démonstration : pas de création de compte sans backend. On passe au profil à remplir.
      navigate('/profil')
      return
    }

    // Démonstration : les identifiants ne sont pas vérifiés sans backend. On ouvre l'application.
    navigate('/dashboard')
  }

  function motDePasseOublie() {
    setMessage('La réinitialisation du mot de passe n’est pas encore disponible.')
  }

  return {
    mode,
    isInscription,
    basculerMode,
    mdpVisible,
    basculerMdp: () => setMdpVisible(!mdpVisible),
    erreur,
    message,
    handleSubmit,
    motDePasseOublie,
  }
}

export default useConnexion
