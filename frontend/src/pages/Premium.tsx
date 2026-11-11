import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import '../styles/premium.css'
import EtatVide from '../components/EtatVide.tsx'
import Fenetre from '../components/Fenetre.tsx'
import Icone from '../components/Icone.tsx'
import LienFleche from '../components/LienFleche.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useAbonnement from '../hooks/useAbonnement.ts'
import { economieAnnuelle, FORMULES, formatPrix, type Periodicite } from '../lib/abonnement.ts'

const PREMIUM = FORMULES.find((f) => f.id === 'premium')!
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const unite = (p: Periodicite) => (p === 'mensuel' ? '/ mois' : '/ an')

// Page de l'abonnement premium : choix mensuel / annuel, paiement et gestion sur les pages de Stripe.
// L'abonnement affiché vient du backend, lui-même tenu à jour par le webhook Stripe.
function Premium() {
  // retour de Stripe : /premium?paiement=reussi ou /premium?paiement=annule
  const [parametres] = useSearchParams()
  const retour = parametres.get('paiement')
  const { connecte, abonnement, chargement, enCours, activation, erreur, recharger, payer, gerer } =
    useAbonnement(retour === 'reussi')
  const [periodicite, setPeriodicite] = useState<Periodicite>('annuel')
  const [confirmation, setConfirmation] = useState(false)
  const economie = economieAnnuelle(PREMIUM)
  const fermer = () => setConfirmation(false)

  // une fois l'abonnement chargé, le sélecteur montre sa périodicité
  useEffect(() => {
    if (abonnement) setPeriodicite(abonnement.periodicite)
  }, [abonnement])

  if (!connecte || (chargement && !abonnement && !activation)) {
    return (
      <div className="ecran premium">
        <TitrePage surtitre="Services" titre="Premium" />
        {connecte ? <p role="status">Chargement de l'abonnement...</p> : (
          <EtatVide icone={ICONES.cadenas} titre="Connectez-vous"
            action={<LienFleche to="/connexion">Se connecter</LienFleche>}>
            L'abonnement est rattaché à votre compte DataFit.
          </EtatVide>
        )}
      </div>
    )
  }

  return (
    <div className="ecran premium">
      <TitrePage surtitre="Services" titre="Premium">
        Débloquez toute l'analyse de vos performances. Sans engagement, résiliable en un clic.
      </TitrePage>

      <p className="alerte premium-info premium-demo" role="note">
        <Icone trace={ICONES.info} />
        Paiement en mode test Stripe : utilisez la carte 4242 4242 4242 4242, une date future et n'importe quel code.
      </p>

      {retour === 'reussi' && (activation ? (
        <p className="alerte premium-info" role="status">Paiement reçu, activation de votre abonnement...</p>
      ) : abonnement ? (
        <p className="alerte premium-succes" role="status">
          <Icone trace={ICONES.valide} />Bienvenue dans Premium : votre abonnement est actif.
        </p>
      ) : (
        <p className="alerte" role="alert">
          Paiement reçu, mais l'abonnement n'est pas encore activé. Réessayez dans un instant.{' '}
          <button type="button" className="bouton fantome petit" onClick={recharger}>Actualiser</button>
        </p>
      ))}
      {retour === 'annule' && !abonnement && (
        <p className="alerte premium-info" role="status">Paiement annulé : aucun montant n'a été prélevé.</p>
      )}

      {erreur && (
        <p className="alerte" role="alert">
          {erreur}{' '}
          <button type="button" className="bouton fantome petit" onClick={recharger}>Réessayer</button>
        </p>
      )}

      {abonnement && (
        <Panneau titre="Mon abonnement" className="premium-mon-abo">
          <div className="premium-etat">
            <span className={abonnement.resilie ? 'voyant' : 'voyant actif'} />
            <strong>
              Premium {abonnement.periodicite === 'mensuel' ? 'mensuel' : 'annuel'}
            </strong>
            <span className="etiquette turquoise">{abonnement.resilie ? 'Résilié' : 'Actif'}</span>
          </div>
          <dl className="premium-details">
            <div>
              <dt>Montant</dt>
              <dd>{formatPrix(PREMIUM.prix[abonnement.periodicite])} {unite(abonnement.periodicite)}</dd>
            </div>
            <div>
              <dt>Abonné depuis</dt>
              <dd>{formatDate(abonnement.debut)}</dd>
            </div>
            <div>
              <dt>{abonnement.resilie ? 'Accès jusqu\'au' : 'Prochain renouvellement'}</dt>
              <dd>{formatDate(abonnement.renouvellement)}</dd>
            </div>
          </dl>
          <div className="premium-actions">
            {abonnement.resilie && (
              <p className="premium-note">
                Votre abonnement ne sera pas renouvelé. Vous gardez l'accès Premium jusqu'au{' '}
                {formatDate(abonnement.renouvellement)}.
              </p>
            )}
            <button type="button" className="bouton" disabled={enCours} onClick={gerer}>
              {abonnement.resilie ? 'Réactiver l\'abonnement' : 'Gérer mon abonnement'}
            </button>
            {!abonnement.resilie && (
              <button type="button" className="bouton contour premium-resilier" disabled={enCours} onClick={gerer}>
                Résilier l'abonnement
              </button>
            )}
            <p className="premium-note">
              Changement de formule, de carte, résiliation et factures se font sur l'espace sécurisé de Stripe.
            </p>
          </div>
        </Panneau>
      )}

      <div className="premium-barre">
        <Segments
          libelle="Périodicité"
          options={[
            { valeur: 'mensuel', nom: 'Mensuel' },
            { valeur: 'annuel', nom: 'Annuel' },
          ]}
          valeur={periodicite}
          onChange={setPeriodicite}
        />
        {economie > 0 && <span className="etiquette turquoise">Annuel : -{economie} %</span>}
      </div>

      <div className="premium-formules">
        {FORMULES.map((f) => {
          const estPremium = f.id === 'premium'
          const actuelle = estPremium ? !!abonnement : !abonnement
          return (
            <article key={f.id} className={estPremium ? 'premium-carte vedette' : 'premium-carte'}>
              <header>
                <h2>{f.nom}</h2>
                {estPremium && <span className="etiquette turquoise"><Icone trace={ICONES.premium} />Recommandé</span>}
              </header>
              <p className="premium-carte-texte">{f.description}</p>
              <p className="premium-prix">
                <span className="chiffre">{formatPrix(f.prix[periodicite])}</span>
                {f.prix[periodicite] > 0 && <small>{unite(periodicite)}</small>}
              </p>
              {estPremium && periodicite === 'annuel' && (
                <p className="premium-carte-texte">soit {formatPrix(f.prix.annuel / 12)} par mois</p>
              )}
              <ul className="premium-avantages">
                {f.avantages.map((a) => (
                  <li key={a}><Icone trace={ICONES.valide} />{a}</li>
                ))}
              </ul>
              {actuelle ? (
                <button type="button" className="bouton secondaire" disabled>Formule actuelle</button>
              ) : estPremium ? (
                <button type="button" className="bouton" disabled={enCours} onClick={() => setConfirmation(true)}>
                  S'abonner
                </button>
              ) : null}
            </article>
          )
        })}
      </div>

      <Fenetre
        ouverte={confirmation}
        titre="Confirmer l'abonnement"
        onFermer={fermer}
        pied={
          <>
            <button type="button" className="bouton fantome" onClick={fermer}>Annuler</button>
            <button type="button" className="bouton" disabled={enCours} onClick={() => payer(periodicite)}>
              {enCours ? 'Redirection...' : `Payer ${formatPrix(PREMIUM.prix[periodicite])}`}
            </button>
          </>
        }
      >
        <p>
          Premium {periodicite}, {formatPrix(PREMIUM.prix[periodicite])} {unite(periodicite)}.
          Renouvellement automatique, résiliable à tout moment.
        </p>
        <p className="premium-note">
          Vous allez être redirigé vers la page de paiement sécurisée de Stripe : DataFit ne voit jamais
          votre numéro de carte.
        </p>
      </Fenetre>
    </div>
  )
}

export default Premium
