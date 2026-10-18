
import { type SubmitEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

type Mode = 'connexion' | 'inscription'

// Logique de la page de connexion et d'inscription
function useConnexion() {
  // /connexion?mode=inscription ouvre directement l'inscription
  const [parametres] = useSearchParams()
  const [mode, setMode] = useState<Mode>(
    parametres.get('mode') === 'inscription'
      ? 'inscription'
      : 'connexion'
  )

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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur('')
    setMessage('')

    const formData = new FormData(event.currentTarget)

    // Inscription
    if (isInscription) {
      if (formData.get('mdp') !== formData.get('mdp2')) {
        setErreur('Les deux mots de passe ne sont pas identiques.')
        return
      }

      try {
        const response = await fetch(
          'http://localhost:8080/api/auth/register',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.get('email'),
              password: formData.get('mdp'),
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setErreur(
            data.error || data.message || "Impossible de créer le compte."
          )
          return
        }

        // L'inscription a réussi : revenir au formulaire de connexion
        setMessage('Compte créé avec succès !')
        setMode('connexion')
        return
      } catch {
        setErreur(
          'Impossible de contacter le serveur. Vérifie que le backend est démarré.'
        )
      }

      return
    }

    // Connexion encore en démonstration
    navigate('/dashboard')
  }

  function motDePasseOublie() {
    setMessage(
      'La réinitialisation du mot de passe n’est pas encore disponible.'
    )
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
