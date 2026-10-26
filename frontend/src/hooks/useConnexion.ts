
import { type SubmitEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { enregistrerCompte, lireCompte } from '../lib/compte.ts'
import { effacerProfil } from '../lib/profil.ts'

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
  const navigate = useNavigate()

  const isInscription = mode === 'inscription'

  function basculerMode() {
    setMode(isInscription ? 'connexion' : 'inscription')
    setErreur('')
  }async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  setErreur('')

  const formData = new FormData(event.currentTarget)

  // Vérif propre à l'inscription : les deux mots de passe doivent correspondre
  if (isInscription && formData.get('mdp') !== formData.get('mdp2')) {
    setErreur('Les deux mots de passe ne sont pas identiques.')
    return
  }

  // On choisit la route selon le mode
  const url = isInscription
    ? '/api/auth/register'
    : '/api/auth/login'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('mdp'),
        // à l'inscription seulement : la case des conditions d'utilisation (le backend la vérifie aussi)
        ...(isInscription && { cguAcceptees: formData.get('cgu') === 'on' }),
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const parDefaut = isInscription
        ? "Impossible de créer le compte."
        : "Impossible de se connecter."
      // nos contrôleurs renvoient { error: "message en français" } ; les erreurs produites par
      // Spring lui-même (validation…) ont un champ path et un texte technique
      setErreur(data.error && !data.path ? data.error : parDefaut)
      return
    }

    // Succès : le chemin diffère selon le mode
    if (isInscription) {
      enregistrerCompte({ id: data.id, email: data.email })
      effacerProfil()
      navigate('/creation-profil')
    } else {
      // un autre compte que celui gardé dans ce navigateur : le profil gardé n'est pas le sien
      if (lireCompte()?.id !== data.id) effacerProfil()
      enregistrerCompte({ id: data.id, email: data.email })
      navigate('/dashboard')
    }
  } catch (e) {
    console.error(e) // en dev, pour voir la vraie cause dans la console
    setErreur(
      'Impossible de contacter le serveur. Vérifie que le backend est démarré.'
    )
  }
}
  return {
    mode,
    isInscription,
    basculerMode,
    mdpVisible,
    basculerMdp: () => setMdpVisible(!mdpVisible),
    erreur,
    handleSubmit,
  }
}

export default useConnexion
