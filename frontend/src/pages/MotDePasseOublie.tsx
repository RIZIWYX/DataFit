import { type SubmitEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import CadreFormulaire from '../components/CadreFormulaire.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'

// Réinitialisation du mot de passe, en deux temps :
// 1. /mot-de-passe-oublie : on tape son adresse e-mail, un lien est envoyé ;
// 2. /mot-de-passe-oublie?jeton=… (le lien de l'e-mail) : on choisit un nouveau mot de passe.
// Côté front seulement pour l'instant : l'envoi de l'e-mail et l'enregistrement du nouveau
// mot de passe restent à brancher sur le backend (voir les deux « À brancher » plus bas).
function MotDePasseOublie() {
  const [parametres] = useSearchParams()
  const jeton = parametres.get('jeton')

  return jeton ? <NouveauMotDePasse /> : <DemandeLien />
}

// ---------- 1. demander le lien ----------

function DemandeLien() {
  const [envoyeA, setEnvoyeA] = useState('')

  function envoyer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    // À brancher : POST /api/auth/mot-de-passe-oublie { email }
    setEnvoyeA(email)
  }

  return (
    <CadreFormulaire
      accroche={{
        titre: 'Ça arrive aux meilleurs',
        texte: 'Indiquez votre adresse e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.',
      }}
      titre="Mot de passe oublié"
    >
      {envoyeA ? (
        <>
          {/* le même message qu'un compte existe ou non : sinon, on révélerait quelles adresses en ont un */}
          <p className="cnx-message" role="status">
            <Icone trace={ICONES.enveloppe} />
            <span>
              Si un compte DataFit existe pour <strong>{envoyeA}</strong>, un lien de réinitialisation vient de
              lui être envoyé. Pensez à regarder dans vos courriers indésirables.
            </span>
          </p>
          <Link to="/connexion" className="bouton cnx-envoyer">
            Retour à la connexion
            <Icone trace={ICONES.fleche} />
          </Link>
          <button type="button" className="cnx-lien cnx-centre" onClick={() => setEnvoyeA('')}>
            Utiliser une autre adresse
          </button>
        </>
      ) : (
        <form onSubmit={envoyer}>
          <div className="champ">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="cnx-champ">
              <Icone trace={ICONES.enveloppe} />
              <input id="email" name="email" type="email" autoComplete="email" placeholder="exemple@email.com" required />
            </div>
          </div>

          <button type="submit" className="bouton cnx-envoyer">
            Recevoir le lien
            <Icone trace={ICONES.fleche} />
          </button>

          <Link to="/connexion" className="cnx-lien cnx-centre">
            Je me souviens de mon mot de passe
          </Link>
        </form>
      )}
    </CadreFormulaire>
  )
}

// ---------- 2. choisir un nouveau mot de passe ----------

function NouveauMotDePasse() {
  const [mdpVisible, setMdpVisible] = useState(false)
  const [erreur, setErreur] = useState('')
  const [fait, setFait] = useState(false)

  function enregistrer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (formData.get('mdp') !== formData.get('mdp2')) {
      setErreur('Les deux mots de passe ne sont pas identiques.')
      return
    }
    setErreur('')
    // À brancher : POST /api/auth/reinitialiser { jeton, password }
    setFait(true)
  }

  return (
    <CadreFormulaire
      accroche={{
        titre: 'Un nouveau départ',
        texte: 'Choisissez un nouveau mot de passe, puis reconnectez-vous pour retrouver vos performances.',
      }}
      titre="Nouveau mot de passe"
    >
      {fait ? (
        <>
          <p className="cnx-message" role="status">
            <Icone trace={ICONES.valide} />
            Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter avec le nouveau.
          </p>
          <Link to="/connexion" className="bouton cnx-envoyer">
            Se connecter
            <Icone trace={ICONES.fleche} />
          </Link>
        </>
      ) : (
        <form onSubmit={enregistrer}>
          <div className="champ">
            <label htmlFor="mdp">Nouveau mot de passe</label>
            <div className="cnx-champ">
              <Icone trace={ICONES.cadenas} />
              <input
                id="mdp"
                name="mdp"
                type={mdpVisible ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
              <button
                type="button"
                className="cnx-oeil"
                aria-pressed={mdpVisible}
                onClick={() => setMdpVisible(!mdpVisible)}
              >
                <Icone trace={ICONES.oeil} />
                <span className="visuellement-cache">
                  {mdpVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                </span>
              </button>
            </div>
            <p className="champ-aide">8 caractères minimum.</p>
          </div>

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
                maxLength={72}
                required
              />
            </div>
          </div>

          {erreur && (
            <p className="alerte" role="alert">
              <Icone trace={ICONES.info} />
              {erreur}
            </p>
          )}

          <button type="submit" className="bouton cnx-envoyer">
            Enregistrer le mot de passe
            <Icone trace={ICONES.fleche} />
          </button>
        </form>
      )}
    </CadreFormulaire>
  )
}

export default MotDePasseOublie
