import { Link } from 'react-router'
import CadreFormulaire from '../components/CadreFormulaire.tsx'
import Icone from '../components/Icone.tsx'
import Segments from '../components/Segments.tsx'
import { ICONES } from '../data/icones.ts'
import useConnexion from '../hooks/useConnexion.ts'

// le message de la partie gauche, selon le mode
const ACCROCHES = {
  connexion: {
    titre: 'Heureux de vous revoir',
    texte: 'Connectez-vous pour retrouver vos performances et reprendre là où vous en étiez.',
  },
  inscription: {
    titre: 'Votre progression commence ici',
    texte:
      'Créez votre compte, complétez votre profil sportif et commencez à suivre vos performances avec DataFit.',
  },
}

// Connexion et inscription : à gauche le logo et un message d'accueil, à droite le formulaire.
function Connexion() {
  const {
    mode,
    isInscription,
    basculerMode,
    mdpVisible,
    basculerMdp,
    erreur,
    handleSubmit,
    lienEnvoyeA,
    aConfirmer,
    renvoi,
    renvoyerMail,
    allerALaConnexion,
  } = useConnexion()

  // le bouton « renvoyer le mail », et ce qu'il devient une fois cliqué
  const boutonRenvoi = (email: string) =>
    renvoi === 'fait' ? (
      <p className="cnx-message" role="status">
        <Icone trace={ICONES.valide} />
        Un nouveau lien vient de partir. Il peut mettre quelques minutes à arriver.
      </p>
    ) : (
      <button
        type="button"
        className="cnx-lien cnx-centre"
        disabled={renvoi === 'envoi'}
        onClick={() => renvoyerMail(email)}
      >
        {renvoi === 'envoi' ? 'Envoi…' : 'Renvoyer le mail de confirmation'}
      </button>
    )

  // compte créé : il reste à ouvrir le lien reçu par mail
  if (lienEnvoyeA) {
    return (
      <CadreFormulaire accroche={ACCROCHES.inscription} titre="Vérifiez vos e-mails">
        <p className="cnx-message" role="status">
          <Icone trace={ICONES.enveloppe} />
          <span>
            Un lien de confirmation vient d'être envoyé à <strong>{lienEnvoyeA}</strong>. Ouvrez-le pour activer
            votre compte, puis connectez-vous. Pensez à regarder dans vos courriers indésirables.
          </span>
        </p>
        <button type="button" className="bouton cnx-envoyer" onClick={allerALaConnexion}>
          J'ai confirmé, me connecter
          <Icone trace={ICONES.fleche} />
        </button>
        {boutonRenvoi(lienEnvoyeA)}
      </CadreFormulaire>
    )
  }

  return (
    <CadreFormulaire
      accroche={isInscription ? ACCROCHES.inscription : ACCROCHES.connexion}
      titre={isInscription ? 'Créer un compte' : 'Se connecter'}
    >
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
            <Link to="/mot-de-passe-oublie" className="cnx-lien">
              Mot de passe oublié ?
            </Link>
          </div>
        )}

        {/* les liens s'ouvrent dans un nouvel onglet : le formulaire déjà rempli reste là */}
        {isInscription && (
          <label className="cnx-cgu">
            <input type="checkbox" name="cgu" required />
            <span>
              J'accepte les{' '}
              <Link to="/cgu" target="_blank" className="cnx-lien">
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="/donnees-personnelles" target="_blank" className="cnx-lien">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
        )}

        {erreur && (
          <p className="alerte" role="alert">
            <Icone trace={ICONES.info} />
            {erreur}
          </p>
        )}
        {/* bon mot de passe, mais adresse pas encore confirmée */}
        {aConfirmer && boutonRenvoi(aConfirmer)}

        <button type="submit" className="bouton cnx-envoyer">
          {isInscription ? 'Créer mon compte' : 'Se connecter'}
          <Icone trace={ICONES.fleche} />
        </button>
      </form>
    </CadreFormulaire>
  )
}

export default Connexion
