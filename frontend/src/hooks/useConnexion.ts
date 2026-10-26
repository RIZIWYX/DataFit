
import { type SubmitEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { enregistrerCompte, lireCompte } from '../lib/compte.ts'
import { effacerProfil } from '../lib/profil.ts'

type Mode = 'connexion' | 'inscription'
type Renvoi = 'pret' | 'envoi' | 'fait'

// Logique de la page de connexion et d'inscription.
// Un compte créé doit d'abord confirmer son adresse e-mail (lien reçu par mail, page /verifier-email) :
// tant que ce n'est pas fait, le backend refuse la connexion et on propose de renvoyer le mail.
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
  // l'adresse à laquelle le lien de confirmation vient d'être envoyé (après l'inscription)
  const [lienEnvoyeA, setLienEnvoyeA] = useState('')
  // l'adresse d'un compte qui a tenté de se connecter sans l'avoir confirmée
  const [aConfirmer, setAConfirmer] = useState('')
  const [renvoi, setRenvoi] = useState<Renvoi>('pret')
  const navigate = useNavigate()

  const isInscription = mode === 'inscription'

  function basculerMode() {
    setMode(isInscription ? 'connexion' : 'inscription')
    setErreur('')
    setAConfirmer('')
  }

  // revient au formulaire de connexion, après l'écran « vérifiez vos mails »
  function allerALaConnexion() {
    setLienEnvoyeA('')
    setRenvoi('pret')
    setMode('connexion')
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur('')
    setAConfirmer('')
    setRenvoi('pret')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()

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
          email,
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
        if (data.code === 'EMAIL_NON_VERIFIE') setAConfirmer(email)
        return
      }

      // Succès : le chemin diffère selon le mode
      if (isInscription) {
        // pas encore de connexion : il faut d'abord ouvrir le lien reçu par mail
        setLienEnvoyeA(data.email ?? email)
      } else {
        // un autre compte que celui gardé dans ce navigateur : le profil gardé n'est pas le sien
        // (un nouveau compte passe ainsi par la création du profil)
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

  // Renvoie le lien de confirmation. Le backend répond toujours pareil (il ne dit pas si
  // l'adresse a un compte) et n'envoie pas plus d'un mail par minute.
  async function renvoyerMail(email: string) {
    setRenvoi('envoi')
    try {
      await fetch('/api/auth/renvoyer-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setRenvoi('fait')
    } catch (e) {
      console.error(e)
      setRenvoi('pret')
      setErreur('Impossible de contacter le serveur. Vérifie que le backend est démarré.')
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
    lienEnvoyeA,
    aConfirmer,
    renvoi,
    renvoyerMail,
    allerALaConnexion,
  }
}

export default useConnexion
