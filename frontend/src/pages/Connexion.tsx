import { Link } from 'react-router'
import '../styles/connexion.css'
import Icone from '../components/Icone.tsx'
import Logo from '../components/Logo.tsx'
import Orbites from '../components/Orbites.tsx'
import Segments from '../components/Segments.tsx'
import { ICONES } from '../data/icones.ts'
import useConnexion from '../hooks/useConnexion.ts'

// Connexion et inscription : à gauche l'identité de la page de garde, à droite le formulaire.
function Connexion() {
  const {
    mode,
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
    <div className="cnx refonte">
      <aside className="cnx-visuel">
        <Link to="/" aria-label="DataFit, page de garde">
          <Logo />
        </Link>
        <div className="cnx-accroche">
          <p className="surtitre">DataFit · Votre activité en chiffres</p>
          <h2 className="affiche">
            Chaque séance
            <br />
            compte<span className="point">.</span>
          </h2>
        </div>
        <Orbites />
      </aside>

      <main className="cnx-panneau">
        <section className="cnx-carte" aria-labelledby="cnx-titre">
          <Link to="/" className="lien-retour cnx-retour">
            <Icone trace={ICONES.retour} />
            Page de garde
          </Link>

          <h1 id="cnx-titre" className="titre-page">
            {isInscription ? 'Créer un compte' : 'Se connecter'}
            <span className="point">.</span>
          </h1>
          <p className="cnx-sous-titre">
            {isInscription ? 'Quelques secondes suffisent pour commencer.' : 'Heureux de vous revoir.'}
          </p>

          <Segments
            libelle="Connexion ou inscription"
            options={[
              { valeur: 'connexion', nom: 'Connexion' },
              { valeur: 'inscription', nom: 'Inscription' },
            ]}
            valeur={mode}
            onChange={(choix) => choix !== mode && basculerMode()}
          />

          <form onSubmit={handleSubmit}>
            <div className="champ">
              <label htmlFor="email">Adresse e-mail</label>
              <div className="cnx-champ">
                <Icone trace={ICONES.enveloppe} />
                <input id="email" name="email" type="email" autoComplete="email" placeholder="exemple@email.com" required />
              </div>
            </div>

            <div className="champ">
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
                <button type="button" className="cnx-oeil" aria-pressed={mdpVisible} onClick={basculerMdp}>
                  <Icone trace={ICONES.oeil} />
                  <span className="visuellement-cache">
                    {mdpVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  </span>
                </button>
              </div>
              {isInscription && <p className="champ-aide">8 caractères minimum.</p>}
            </div>

            {isInscription && (
              <div className="champ">
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
              </div>
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

            {erreur && (
              <p className="alerte" role="alert">
                <Icone trace={ICONES.info} />
                {erreur}
              </p>
            )}
            {message && (
              <p className="cnx-message" role="status">
                <Icone trace={ICONES.info} />
                {message}
              </p>
            )}

            <button type="submit" className="bouton cnx-envoyer">
              {isInscription ? 'Créer mon compte' : 'Se connecter'}
              <Icone trace={ICONES.fleche} />
            </button>
          </form>

        </section>
      </main>
    </div>
  )
}

export default Connexion
