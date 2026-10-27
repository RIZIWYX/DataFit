import '../styles/montre.css'
import Icone from '../components/Icone.tsx'
import LienFleche from '../components/LienFleche.tsx'
import ListeSeances from '../components/ListeSeances.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useMontre from '../hooks/useMontre.ts'
import { allureSeance, formatDate, formatHeure, formatJourRelatif, resumeSeance } from '../lib/format.ts'

// La montre : son état maintenant, ce qu'elle mesure (et ce qu'elle ne mesure pas),
// et ce qu'elle a envoyé jusqu'ici.
function Montre() {
  const m = useMontre()
  const { aujourdHui } = m
  const calme = m.derniereNuit && Math.round((1 - m.derniereNuit.minutesAgitees / m.derniereNuit.minutes) * 100)

  const mesures = [
    {
      nom: 'Fréquence cardiaque',
      quand: 'Pendant les séances et la nuit',
      valeur: m.derniereSeance ? `${m.derniereSeance.fcMoyenne} bpm en moyenne, dernière séance` : '–',
    },
    {
      nom: 'Vitesse et allure',
      quand: 'Pendant les courses',
      valeur: m.derniereCourse ? `${allureSeance(m.derniereCourse)} en moyenne, dernière course` : '–',
    },
    {
      nom: 'Distance',
      quand: 'Course et natation',
      valeur: m.derniereCourse ? `${resumeSeance(m.derniereCourse)}, dernière course` : '–',
    },
    {
      nom: 'Mouvement',
      quand: 'La nuit',
      valeur: calme !== undefined ? `Nuit calme à ${calme} %, dernière nuit` : '–',
    },
  ]

  return (
    <div className="ecran montre">
      <TitrePage
        surtitre="Suivi"
        titre="Montre"
      >
        L'état de votre montre et les données qu'elle transmet à DataFit.
      </TitrePage>

      {/* maintenant : la montre, son état, la synchronisation */}
      <section className="montre-etat" aria-label="État de la montre">
        <svg className="montre-dessin" viewBox="0 0 120 180" aria-hidden="true">
          <rect x="38" y="2" width="44" height="58" rx="10" className="montre-bracelet" />
          <rect x="38" y="120" width="44" height="58" rx="10" className="montre-bracelet" />
          <circle cx="60" cy="90" r="47" className="montre-boitier" />
          <circle cx="60" cy="90" r="40" className="montre-cadran" />
          <circle cx="60" cy="90" r="29" className="montre-arc" pathLength="100" strokeDasharray="68 32" transform="rotate(-90 60 90)" />
          <path d="M45 92h6l3-8 5 15 3-9 2 2h11" className="montre-pouls" />
        </svg>

        <div className="montre-infos">
          <h2>{m.nom}</h2>
          <p className="montre-statut">
            <span className={m.connectee ? 'voyant actif' : 'voyant'} />
            {m.connectee ? 'Connectée' : 'Déconnectée'}
            <span className="montre-identifiant">· {m.identifiant}</span>
          </p>
          <p className="montre-synchro">
            Dernière synchronisation :{' '}
            <strong>
              {m.synchronisation
                ? `${formatJourRelatif(m.synchronisation, aujourdHui)}, ${formatHeure(m.synchronisation)}`
                : 'jamais'}
            </strong>
          </p>
          <div className="montre-actions">
            <button type="button" className="bouton" disabled={!m.connectee || m.enCours} onClick={m.synchroniser}>
              <Icone trace={ICONES.synchro} />
              {m.enCours ? 'Synchronisation…' : 'Synchroniser'}
            </button>
            <button type="button" className="bouton secondaire" onClick={m.basculerConnexion}>
              {m.connectee ? 'Déconnecter la montre' : 'Reconnecter la montre'}
            </button>
          </div>
          <p className="message-ok" role="status">
            {m.message && (
              <>
                <Icone trace={ICONES.valide} />
                {m.message}
              </>
            )}
          </p>
          {m.erreur && (
            <p className="alerte" role="alert">
              <Icone trace={ICONES.info} />
              {m.erreur}
            </p>
          )}
          {!m.connectee && (
            <p className="montre-aide">Reconnectez la montre pour récupérer vos prochaines séances et nuits.</p>
          )}
        </div>
      </section>

      <div className="montre-grille">
        <Panneau titre="Ce que la montre mesure">
          <div className="montre-tableau">
            <table className="tableau-donnees">
              <thead>
                <tr>
                  <th scope="col">Mesure</th>
                  <th scope="col">Quand</th>
                  <th scope="col">Dernière valeur reçue</th>
                </tr>
              </thead>
              <tbody>
                {mesures.map((mesure) => (
                  <tr key={mesure.nom}>
                    <td><strong>{mesure.nom}</strong></td>
                    <td>{mesure.quand}</td>
                    <td>{mesure.valeur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="montre-note">
            Un relevé par minute. Ne sont pas transmis : les phases de sommeil, l'oxygène du sang, la
            variabilité cardiaque et le nombre de pas.
          </p>
        </Panneau>

        <Panneau titre="Données reçues">
          <dl className="montre-totaux">
            <div>
              <dt>Séances</dt>
              <dd className="chiffre">{m.nbSeances}</dd>
            </div>
            <div>
              <dt>Nuits</dt>
              <dd className="chiffre">{m.nbNuits}</dd>
            </div>
          </dl>
          {m.premiereDonnee && <p className="montre-note">Depuis le {formatDate(m.premiereDonnee)}.</p>}
          <div className="montre-liens">
            <LienFleche to="/historique">Historique</LienFleche>
            <LienFleche to="/sommeil">Sommeil</LienFleche>
          </div>
        </Panneau>
      </div>

      {m.derniereSeance && (
        <Panneau titre="Dernière séance reçue" action={<LienFleche to="/historique">Toutes les séances</LienFleche>}>
          <ListeSeances seances={[m.derniereSeance]} aujourdHui={aujourdHui} />
        </Panneau>
      )}

      <p className="montre-limites">
        <Icone trace={ICONES.info} />
        Pendant une séance, les mesures restent sur la montre. Elles arrivent dans DataFit à la
        synchronisation suivante.
      </p>
    </div>
  )
}

export default Montre
