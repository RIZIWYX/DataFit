import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import CadreFormulaire from '../components/CadreFormulaire.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'

type Etat = { statut: 'attente' } | { statut: 'confirme'; email: string } | { statut: 'echec'; message: string }

// Un lien ne sert qu'une fois. En développement, React affiche la page deux fois de suite
// (mode strict) : on garde la réponse de chaque jeton pour ne l'envoyer qu'une seule fois.
const demandes = new Map<string, Promise<Etat>>()

function confirmer(jeton: string): Promise<Etat> {
  if (!demandes.has(jeton)) {
    demandes.set(
      jeton,
      fetch('/api/auth/verifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeton }),
      })
        .then(async (response): Promise<Etat> => {
          const data = await response.json().catch(() => ({}))
          if (response.ok) return { statut: 'confirme', email: data.email ?? '' }
          return {
            statut: 'echec',
            message: data.error && !data.path ? data.error : "Ce lien n'est pas valide.",
          }
        })
        .catch((): Etat => ({
          statut: 'echec',
          message: 'Impossible de contacter le serveur. Réessayez dans quelques instants.',
        })),
    )
  }
  return demandes.get(jeton)!
}

// La page ouverte par le lien du mail de confirmation : /verifier-email?jeton=…
function VerifierEmail() {
  const [parametres] = useSearchParams()
  const jeton = parametres.get('jeton') ?? ''
  const [etat, setEtat] = useState<Etat>(
    jeton ? { statut: 'attente' } : { statut: 'echec', message: "Ce lien est incomplet : il manque le jeton." },
  )

  useEffect(() => {
    if (!jeton) return
    let actif = true
    confirmer(jeton).then((resultat) => actif && setEtat(resultat))
    return () => {
      actif = false
    }
  }, [jeton])

  return (
    <CadreFormulaire
      accroche={{
        titre: 'Plus qu’une étape',
        texte: 'Une fois votre adresse confirmée, connectez-vous et complétez votre profil sportif.',
      }}
      titre={etat.statut === 'echec' ? 'Lien non valide' : 'Confirmation de l’adresse'}
    >
      {etat.statut === 'attente' && (
        <p className="cnx-message" role="status">
          <Icone trace={ICONES.info} />
          Vérification en cours…
        </p>
      )}

      {etat.statut === 'confirme' && (
        <>
          <p className="cnx-message" role="status">
            <Icone trace={ICONES.valide} />
            <span>
              Votre adresse {etat.email && <strong>{etat.email}</strong>} est confirmée : votre compte est actif.
            </span>
          </p>
          <Link to="/connexion" className="bouton cnx-envoyer">
            Se connecter
            <Icone trace={ICONES.fleche} />
          </Link>
        </>
      )}

      {etat.statut === 'echec' && (
        <>
          <p className="alerte" role="alert">
            <Icone trace={ICONES.info} />
            {etat.message}
          </p>
          <p className="cnx-message">
            Connectez-vous avec votre adresse et votre mot de passe : si l'adresse n'est pas encore confirmée,
            vous pourrez recevoir un nouveau lien.
          </p>
          <Link to="/connexion" className="bouton cnx-envoyer">
            Aller à la connexion
            <Icone trace={ICONES.fleche} />
          </Link>
        </>
      )}
    </CadreFormulaire>
  )
}

export default VerifierEmail
