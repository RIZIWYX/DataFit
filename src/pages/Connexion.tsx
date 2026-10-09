import { type SubmitEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import DataFitPanel from '../components/DataFitPanel.tsx'

type Mode = 'connexion' | 'inscription'

function Connexion() {
  const [mode, setMode] = useState<Mode>('connexion')
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const isInscription = mode === 'inscription'

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

  return (
    <div className="datafit-root">
      <div className="page">
        <DataFitPanel
          title="Chaque minute compte."
          description="Suis ta fréquence cardiaque, ta vitesse et tes progrès, séance après séance."
        />

        <main className="contenu">
          <section className="carte" aria-labelledby="titre">
            <h1 id="titre">
              {isInscription ? 'Crée ton compte' : 'Content de te revoir'}
            </h1>
            <p className="sous-titre">
              {isInscription
                ? 'Quelques secondes suffisent pour commencer.'
                : 'Connecte-toi pour retrouver tes séances.'}
            </p>

            <div className="onglets" role="tablist" aria-label="Connexion ou inscription">
              <button
                type="button"
                role="tab"
                aria-selected={!isInscription}
                onClick={() => {
                  setMode('connexion')
                  setErreur('')
                  setMessage('')
                }}
              >
                Se connecter
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isInscription}
                onClick={() => {
                  setMode('inscription')
                  setErreur('')
                  setMessage('')
                }}
              >
                Créer un compte
              </button>
            </div>

            <button type="button" className="btn ghost" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5836-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"/>
                <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1636 6.6559 3.5795 9 3.5795z"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="separateur">ou avec ton e-mail</div>

            <form onSubmit={handleSubmit}>
              <div className="champ">
                <label htmlFor="email">Adresse e-mail</label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="champ">
                <label htmlFor="mdp">Mot de passe</label>
                <input
                  id="mdp"
                  name="mdp"
                  type="password"
                  autoComplete={isInscription ? 'new-password' : 'current-password'}
                  minLength={isInscription ? 8 : undefined}
                  required
                />
                {isInscription && <span className="aide">8 caractères minimum.</span>}
              </div>

              {isInscription && (
                <div className="champ">
                  <label htmlFor="mdp2">Confirmer le mot de passe</label>
                  <input
                    id="mdp2"
                    name="mdp2"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              )}

              {erreur && <p className="erreur" role="alert">{erreur}</p>}
              {message && <p className="message" role="status">{message}</p>}

              <button type="submit" className="btn btn-principal">
                {isInscription ? 'Créer mon compte' : 'Se connecter'}
              </button>
            </form>

            <p className="retour">
              <Link to="/">Retour à l’accueil</Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Connexion
