import '../styles/graphiques-analyse.css'
import '../styles/montre.css'
import GrapheColonnes from '../components/GrapheColonnes.tsx'
import Icone from '../components/Icone.tsx'
import Indicateur from '../components/Indicateur.tsx'
import { Link } from 'react-router'
import LienFleche from '../components/LienFleche.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { LISTE_SPORTS, SPORTS, couleurSport } from '../data/sports.ts'
import useMontre from '../hooks/useMontre.ts'
import { parSemaine } from '../lib/activite.ts'
import { colonnesDesSemaines, nbSeances, seriesDesSports } from '../lib/colonnes.ts'
import { allureSeance, formatDate, formatDuree, formatHeure, formatJourRelatif, resumeSeance } from '../lib/format.ts'
import { dureeNuit } from '../lib/sommeil.ts'

// les semaines montrées par le graphique de ce que la montre a envoyé
const SEMAINES_RECUES = 8

// La montre : son état maintenant, ce qu'elle mesure (et ce qu'elle ne mesure pas),
// et ce qu'elle a envoyé jusqu'ici.
function Montre() {
  const m = useMontre()
  const { aujourdHui } = m

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
      // le mouvement sert à repérer les réveils : on affiche ce que l'analyse en a tiré
      valeur: m.derniereNuit
        ? `${m.derniereNuit.reveilsNb} réveil${m.derniereNuit.reveilsNb > 1 ? 's' : ''}, ${dureeNuit(m.derniereNuit.eveilNocturneS)} d'éveil, dernière nuit`
        : '–',
    },
  ]

  return (
    <div className="ecran montre">
      <TitrePage
        surtitre="Suivi"
        titre="Montre"
      >
        Les résultats de vos séances et nuits synchronisées.
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
          <p className="montre-note">Montre simulée : les résultats affichés sont ceux enregistrés après analyse.</p>
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
                : '–'}
            </strong>
          </p>
          <div className="montre-actions">
            <button type="button" className="bouton" disabled={!m.connectee || m.enCours} onClick={m.synchroniser}>
              <Icone trace={ICONES.synchro} />
              {m.enCours ? 'Synchronisation...' : 'Synchroniser'}
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

        {/* à côté de la montre : ce qu'elle a envoyé jusqu'ici */}
        <Panneau titre="Données reçues" className="montre-recu">
          <dl className="indicateurs montre-totaux">
            <Indicateur nom="Séances" valeur={String(m.nbSeances)} />
            <Indicateur nom="Nuits" valeur={String(m.nbNuits)} />
          </dl>
          {m.premiereDonnee && <p className="montre-note">Depuis le {formatDate(m.premiereDonnee)}.</p>}
          <div className="montre-liens">
            <LienFleche to="/historique">Historique</LienFleche>
            <LienFleche to="/sommeil">Sommeil</LienFleche>
          </div>
        </Panneau>
      </section>

      {m.chargement && <p role="status">Chargement des résultats...</p>}

      {/* ce que la montre a envoyé : semaine par semaine, puis la dernière séance */}
      <div className="montre-grille">
        <Panneau titre="Séances reçues par semaine">
          {m.seances.length > 0 ? (
            <GrapheColonnes
              series={seriesDesSports(LISTE_SPORTS)}
              colonnes={colonnesDesSemaines(parSemaine(m.seances, SEMAINES_RECUES, aujourdHui), LISTE_SPORTS)}
              unite={nbSeances}
              entete="Semaine"
            />
          ) : (
            <p className="montre-note">Aucune séance reçue pour l'instant : le graphique se dessinera au fil des synchronisations.</p>
          )}
        </Panneau>

        {m.derniereSeance ? (
          <Panneau titre="Dernière séance reçue">
            <Link to={`/historique/${m.derniereSeance.id}`} className="montre-seance">
              <span className="montre-seance-icone" style={{ color: couleurSport(m.derniereSeance.sport) }}>
                <Icone trace={SPORTS[m.derniereSeance.sport].icone} />
              </span>
              <span className="montre-seance-titre">
                <strong>{m.derniereSeance.nom}</strong>
                <small>
                  {formatJourRelatif(m.derniereSeance.date, aujourdHui)}
                  {m.derniereSeance.heure && `, ${formatHeure(m.derniereSeance.heure)}`}
                </small>
              </span>
              <Icone trace={ICONES.chevron} />
            </Link>
            <dl className="indicateurs compacts montre-seance-chiffres">
              <Indicateur nom={m.derniereSeance.sport === 'musculation' ? 'Séries' : 'Distance'} valeur={resumeSeance(m.derniereSeance)} />
              <Indicateur nom="Durée" valeur={formatDuree(m.derniereSeance.dureeMin)} />
              <Indicateur nom="FC moyenne" valeur={`${m.derniereSeance.fcMoyenne} bpm`} />
            </dl>
            <div className="montre-liens">
              <LienFleche to={`/historique/${m.derniereSeance.id}`}>Voir l'analyse</LienFleche>
              <LienFleche to="/historique">Toutes les séances</LienFleche>
            </div>
          </Panneau>
        ) : (
          <Panneau titre="Dernière séance reçue">
            <p className="montre-note">Aucune séance reçue pour l'instant : synchronisez la montre après votre prochain entraînement.</p>
          </Panneau>
        )}
      </div>

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
          Les valeurs affichées proviennent des analyses enregistrées. Les courbes minute par minute
          sont dans le détail de chaque séance et sur la page Sommeil.
        </p>
      </Panneau>

      <p className="montre-limites">
        <Icone trace={ICONES.info} />
        Pendant une séance, les mesures restent sur la montre. Elles arrivent dans DataFit à la
        synchronisation suivante.
      </p>
    </div>
  )
}

export default Montre
