import { Link } from 'react-router'
import '../styles/dashboard.css'
import CarteSeance from '../components/CarteSeance.tsx'
import EntetePage from '../components/EntetePage.tsx'
import GrapheColonnes from '../components/GrapheColonnes.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useDashboard, { PERIODES } from '../hooks/useDashboard.ts'
import { colonnesDesSemaines, nbSeances as pluriel, seriesDesSports } from '../lib/colonnes.ts'
import { formatDate, formatDuree, resumeSeance } from '../lib/format.ts'

function Dashboard() {
  const {
    prenom,
    nbSemaines,
    choisirPeriode,
    nbSeances,
    semaines,
    derniereSeance,
    seancesRecentes,
  } = useDashboard()

  return (
    <div className="page">
      <EntetePage
        titre={`Bonjour${prenom ? ` ${prenom}` : ''} 👋`}
        sousTitre="Retrouvez vos séances et suivez votre progression."
      >
        <select
          aria-label="Période affichée"
          value={nbSemaines}
          onChange={(e) => choisirPeriode(Number(e.target.value))}
        >
          {PERIODES.map((n) => (
            <option key={n} value={n}>{n} dernières semaines</option>
          ))}
        </select>
      </EntetePage>

      <section className="carte dash-chiffre">
        <span className="dash-chiffre-icone">
          <Icone trace={ICONES.activite} />
        </span>
        <div>
          <p>Séances</p>
          <strong>{nbSeances}</strong>
          <p>sur les {nbSemaines} dernières semaines</p>
        </div>
      </section>

      <div className="grille-2">
        <section className="carte">
          <h2>Votre activité au fil des semaines</h2>
          <p className="sous-titre">Nombre de séances par semaine et par sport.</p>
          <GrapheColonnes
            series={seriesDesSports(LISTE_SPORTS)}
            colonnes={colonnesDesSemaines(semaines, LISTE_SPORTS)}
            unite={pluriel}
            entete="Semaine"
          />
        </section>

        <section className="carte dash-derniere">
          <h2>Dernière séance</h2>
          {derniereSeance ? (
            <CarteSeance
              sport={derniereSeance.sport}
              date={derniereSeance.date}
              duree={formatDuree(derniereSeance.dureeMin)}
              resume={resumeSeance(derniereSeance)}
              lien={`/historique/${derniereSeance.id}`}
            />
          ) : (
            <p className="sous-titre">Aucune séance pour l'instant.</p>
          )}
        </section>
      </div>

      <section className="carte">
        <div className="carte-titre">
          <h2>Séances récentes</h2>
          <Link to="/historique" className="lien">Voir l'historique →</Link>
        </div>
        <div className="tableau">
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Activité</th>
                <th scope="col">Durée</th>
                <th scope="col">Résumé</th>
                <th scope="col">Consulter</th>
              </tr>
            </thead>
            <tbody>
              {seancesRecentes.map((seance) => (
                <tr key={seance.id}>
                  <td>{formatDate(seance.date)}</td>
                  <td>
                    <span className="activite">
                      <span style={{ color: SPORTS[seance.sport].couleur }}>
                        <Icone trace={SPORTS[seance.sport].icone} />
                      </span>
                      {SPORTS[seance.sport].nom}
                    </span>
                  </td>
                  <td>{formatDuree(seance.dureeMin)}</td>
                  <td>{resumeSeance(seance)}</td>
                  <td>
                    <Link to={`/historique/${seance.id}`} className="lien">Consulter →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
