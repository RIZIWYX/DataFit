import { Link } from 'react-router'
import '../styles/consentement.css'
import useDeconnexion from '../hooks/useDeconnexion.ts'
import type { StatutConsentement } from '../hooks/useConsentementSante.ts'

interface Props {
  statut: StatutConsentement
  enCours: boolean
  accepter: () => void
  reessayer: () => void
}

// Affiché à la place de l'application tant que le consentement aux données de santé n'est pas donné :
// comptes plus anciens et comptes créés avec Google (ceux créés par e-mail l'ont coché à l'inscription).
function ConsentementSante({ statut, enCours, accepter, reessayer }: Props) {
  const deconnecter = useDeconnexion()

  if (statut === 'inconnu') return null

  if (statut === 'erreur') {
    return (
      <main className="consentement refonte">
        <section className="consentement-carte" role="alert">
          <h1>Vérification impossible</h1>
          <p>Le serveur ne répond pas : nous ne pouvons pas vérifier votre consentement pour le moment.</p>
          <div className="consentement-actions">
            <button type="button" className="bouton" onClick={reessayer}>
              Réessayer
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="consentement refonte">
      <section className="consentement-carte" aria-labelledby="consentement-titre">
        <p className="surtitre">Vos données de santé</p>
        <h1 id="consentement-titre">Votre accord est nécessaire</h1>
        <p>
          DataFit calcule vos indicateurs à partir de votre fréquence cardiaque, de votre sommeil et de votre
          poids. Ce sont des <strong>données de santé</strong>, que le RGPD protège plus strictement : nous ne
          pouvons les traiter qu'avec votre consentement explicite.
        </p>
        <ul>
          <li>Elles servent uniquement à vous montrer vos séances, vos nuits et vos progrès.</li>
          <li>
            Vous pouvez retirer votre accord à tout moment : en effaçant vos données ou en supprimant votre
            compte depuis la page Profil, ou en nous le demandant depuis la page Contact.
          </li>
          <li>
            Détail dans la{' '}
            <Link to="/donnees-personnelles" target="_blank">
              politique de confidentialité
            </Link>
            .
          </li>
        </ul>
        <div className="consentement-actions">
          <button type="button" className="bouton" onClick={accepter} disabled={enCours}>
            Je consens au traitement de mes données de santé
          </button>
          <button type="button" className="bouton contour" onClick={deconnecter} disabled={enCours}>
            Je refuse et je me déconnecte
          </button>
        </div>
      </section>
    </main>
  )
}

export default ConsentementSante
