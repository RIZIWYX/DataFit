import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { enregistrerCompte, lireCompte } from '../lib/compte.ts'
import { effacerProfil } from '../lib/profil.ts'

// le script de Google Identity Services (un seul chargement pour toute l'application)
let chargement: Promise<void> | null = null
function chargerScriptGoogle(): Promise<void> {
  chargement ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('script Google indisponible'))
    document.head.appendChild(script)
  })
  return chargement
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Google = any

// "Continuer avec Google". Google donne un jeton d'identité, le backend le vérifie et répond
// comme /api/auth/login ({ id, email }). Rien n'est affiché si le backend n'a pas de client Google.
function BoutonGoogle({ inscription }: { inscription: boolean }) {
  const zone = useRef<HTMLDivElement>(null)
  const [erreur, setErreur] = useState('')
  const [actif, setActif] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let annule = false

    async function connecter(credential: string) {
      setErreur('')
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          setErreur(data.error ?? 'Connexion Google impossible.')
          return
        }
        if (lireCompte()?.id !== data.id) effacerProfil()
        enregistrerCompte({ id: data.id, email: data.email })
        navigate('/dashboard')
      } catch (e) {
        console.error(e)
        setErreur('Impossible de contacter le serveur. Vérifie que le backend est démarré.')
      }
    }

    async function initialiser() {
      try {
        const config = await fetch('/api/auth/google/config').then((r) => r.json())
        if (!config.clientId) {
          setActif(false)
          return
        }
        await chargerScriptGoogle()
        if (annule || !zone.current) return
        const google: Google = (window as Google).google
        google.accounts.id.initialize({
          client_id: config.clientId,
          callback: (reponse: { credential: string }) => connecter(reponse.credential),
        })
        google.accounts.id.renderButton(zone.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: inscription ? 'signup_with' : 'continue_with',
          locale: 'fr',
          width: zone.current.clientWidth || 320,
        })
      } catch (e) {
        console.error(e)
        setActif(false)
      }
    }

    initialiser()
    return () => {
      annule = true
    }
  }, [inscription, navigate])

  if (!actif) return null

  return (
    <div className="cnx-google">
      <p className="cnx-separateur">
        <span>ou</span>
      </p>
      <div ref={zone} className="cnx-google-bouton" />
      {inscription && (
        <p className="champ-aide">En continuant avec Google, vous acceptez les conditions d'utilisation.</p>
      )}
      {erreur && (
        <p className="alerte" role="alert">
          {erreur}
        </p>
      )}
    </div>
  )
}

export default BoutonGoogle
