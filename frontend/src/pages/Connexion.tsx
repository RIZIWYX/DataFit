import { Link } from 'react-router'
import '../styles/connexion.css'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'
import useConnexion from '../hooks/useConnexion.ts'

function Connexion() {
  const {
    isInscription,
    basculerMode,
    mdpVisible,
    basculerMdp,
    erreur,
    message,
    handleSubmit,
    motDePasseOublie,
  } = useConnexion()

  return (
    <div className="cnx">
      <aside className="cnx-photo">
        <Link to="/">
          <img src="/logo.jpeg" alt="DataFit" className="nav-logo" />
        </Link>
        <div>
          <h2>
            Chaque séance
            <br />
            raconte <span>une histoire.</span>
          </h2>
          <p>Analysez vos performances. Suivez votre progression.</p>
        </div>
      </aside>

      <main className="cnx-panneau">
        <section className="cnx-carte" aria-labelledby="cnx-titre">
          <h1 id="cnx-titre">{isInscription ? 'Créez votre compte' : 'Heureux de vous revoir'}</h1>
          <p className="cnx-sous-titre">
            {isInscription
              ? 'Quelques secondes suffisent pour commencer.'
              : 'Connectez-vous à votre espace sportif.'}
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Adresse e-mail</label>
            <div className="cnx-champ">
              <Icone trace={ICONES.enveloppe} />
              <input id="email" name="email" type="email" autoComplete="email" placeholder="exemple@email.com" required />
            </div>

            <label htmlFor="mdp">Mot de passe</label>
            <div className="cnx-champ">
              <Icone trace={ICONES.cadenas} />
              <input
                id="mdp"
                name="mdp"
                type={mdpVisible ? 'text' : 'password'}
                autoComplete={isInscription ? 'new-password' : 'current-password'}
                minLength={isInscription ? 8 : undefined}
                required
              />
              <button
                type="button"
                aria-label={mdpVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={mdpVisible}
                onClick={basculerMdp}
              >
                <Icone trace={ICONES.oeil} />
              </button>
            </div>
            {isInscription && <p className="cnx-aide">8 caractères minimum.</p>}

            {isInscription && (
              <>
                <label htmlFor="mdp2">Confirmer le mot de passe</label>
                <div className="cnx-champ">
                  <Icone trace={ICONES.cadenas} />
                  <input
                    id="mdp2"
                    name="mdp2"
                    type={mdpVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </>
            )}

            {!isInscription && (
              <div className="cnx-options">
                <label>
                  <input type="checkbox" name="souvenir" defaultChecked />
                  Se souvenir de moi
                </label>
                <button type="button" className="cnx-lien" onClick={motDePasseOublie}>
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {erreur && <p className="cnx-erreur" role="alert">{erreur}</p>}
            {message && <p className="cnx-message" role="status">{message}</p>}

            <button type="submit" className="btn">
              {isInscription ? 'Créer mon compte' : 'Se connecter'} →
            </button>
          </form>

          <p className="cnx-bascule">
            {isInscription ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button type="button" className="cnx-lien" onClick={basculerMode}>
              {isInscription ? 'Se connecter' : 'Créer un compte'}
            </button>
          </p>
        </section>
      </main>
    </div>
  )
}

export default Connexion
