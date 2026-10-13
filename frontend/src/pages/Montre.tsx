import { Link } from 'react-router'
import '../styles/montre.css'
import EntetePage from '../components/EntetePage.tsx'
import Icone from '../components/Icone.tsx'
import Tuile from '../components/Tuile.tsx'
import { ICONES } from '../data/icones.ts'
import { SPORTS } from '../data/sports.ts'
import useMontre from '../hooks/useMontre.ts'
import {
  allureSeance,
  finSeance,
  formatDateLongue,
  formatDuree,
  formatHeure,
  formatJour,
  resumeSeance,
} from '../lib/format.ts'

function Montre() {
  const {
    nom,
    identifiant,
    connectee,
    basculerConnexion,
    synchronisation,
    synchroniser,
    message,
    derniereSeance,
  } = useMontre()

  const allure = derniereSeance && allureSeance(derniereSeance)

  return (
    <div className="page">
      <EntetePage titre="Ma montre" sousTitre="Synchronisez vos séances terminées et retrouvez vos données." />

      <div className="grille-2 egales">
        <section className="carte">
          <h2>Montre associée</h2>
          <div className="montre-fiche">
            {/* dessin de la montre : bracelet, boîtier, cadran */}
            <svg className="montre-dessin" viewBox="0 0 120 180" aria-hidden="true">
              <rect x="38" y="4" width="44" height="60" rx="10" fill="#1b2529" />
              <rect x="38" y="116" width="44" height="60" rx="10" fill="#1b2529" />
              <circle cx="60" cy="90" r="46" fill="#0f1f24" />
              <circle cx="60" cy="90" r="40" fill="#03120f" />
              <circle cx="60" cy="90" r="28" fill="none" stroke="#32ddcb" strokeWidth="3" strokeDasharray="130 176" strokeLinecap="round" transform="rotate(-90 60 90)" />
              <path d="M52 96h4l2.5-9 4 16 2.5-7h4" fill="none" stroke="#8df2ad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h3>{nom}</h3>
              <p>Identifiant : {identifiant}</p>
              <p className={`montre-etat${connectee ? ' connectee' : ''}`}>
                <i />
                {connectee ? 'Connectée' : 'Déconnectée'}
              </p>
              {synchronisation && (
                <p>
                  Dernière synchronisation : {formatJour(synchronisation)} à {formatHeure(synchronisation)}
                </p>
              )}
              <button type="button" className="btn ghost petit" onClick={basculerConnexion}>
                {connectee ? 'Déconnecter la montre' : 'Reconnecter la montre'}
              </button>
            </div>
          </div>
        </section>

        <section className="carte montre-synchro">
          <h2>Synchronisation</h2>
          <div className="montre-synchro-etat">
            <span className="tuile-icone">
              <Icone trace={connectee ? ICONES.valide : ICONES.info} />
            </span>
            <div>
              <h3>{connectee ? 'Données à jour' : 'Montre déconnectée'}</h3>
              <p>
                {connectee
                  ? 'Les données sont récupérées après la fin de chaque séance.'
                  : 'Reconnectez la montre pour récupérer vos prochaines séances.'}
              </p>
            </div>
          </div>
          <button type="button" className="btn" disabled={!connectee} onClick={synchroniser}>
            Synchroniser la dernière séance
          </button>
          <p className="montre-message" role="status">{message}</p>
        </section>
      </div>

      <p className="bandeau-info">
        <Icone trace={ICONES.info} />
        Pendant une séance, les mesures restent sur la montre. Elles apparaissent ici après synchronisation.
      </p>

      {derniereSeance && (
        <section className="carte">
          <div className="carte-titre montre-recue-titre">
            <h2>Dernière séance reçue</h2>
            <span className="pastille">
              <Icone trace={ICONES.valide} />
              Synchronisée
            </span>
          </div>

          <div className="montre-recue">
            <span className="tuile-icone">
              <Icone trace={SPORTS[derniereSeance.sport].icone} />
            </span>
            <div>
              <h3>{SPORTS[derniereSeance.sport].nom}</h3>
              <p>{formatDateLongue(derniereSeance.date)}</p>
            </div>
            <p>Début : {formatHeure(derniereSeance.date)}</p>
            <p>Fin : {formatHeure(finSeance(derniereSeance))}</p>
          </div>

          <div className="grille-tuiles">
            <Tuile icone={ICONES.horloge} nom="Durée" valeur={formatDuree(derniereSeance.dureeMin)} />
            <Tuile
              icone={derniereSeance.sport === 'musculation' ? ICONES.sport : ICONES.lieu}
              nom={derniereSeance.sport === 'musculation' ? 'Contenu' : 'Distance'}
              valeur={resumeSeance(derniereSeance)}
            />
            {allure && <Tuile icone={ICONES.allure} nom="Allure moyenne" valeur={allure} />}
            <Tuile icone={ICONES.coeur} nom="FC moyenne" valeur={`${derniereSeance.fcMoyenne} bpm`} />
          </div>

          <div className="montre-pied">
            <p>Cette séance est disponible dans votre historique.</p>
            <Link to={`/historique/${derniereSeance.id}`} className="btn">Consulter la séance</Link>
            <Link to="/historique" className="lien">Voir l'historique →</Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Montre
