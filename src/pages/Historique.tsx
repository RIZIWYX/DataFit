import { Link } from 'react-router'
import '../styles/historique.css'
import EntetePage from '../components/EntetePage.tsx'
import Icone from '../components/Icone.tsx'
import { LISTE_SPORTS, SPORTS, type Sport } from '../data/sports.ts'
import useHistorique, { PERIODES, type Tri } from '../hooks/useHistorique.ts'
import { nbSeances as pluriel } from '../lib/colonnes.ts'
import { formatDate, formatDuree, resumeSeance } from '../lib/format.ts'

function Historique() {
  const {
    sport,
    nbSemaines,
    tri,
    choisirSport,
    choisirPeriode,
    choisirTri,
    seances,
    nbSeances,
    page,
    nbPages,
    allerALaPage,
  } = useHistorique()

  return (
    <div className="page">
      <EntetePage titre="Historique des séances" sousTitre="Retrouvez et consultez toutes vos activités." />

      <section className="carte historique-filtres" aria-label="Filtres">
        <select aria-label="Sport" value={sport} onChange={(e) => choisirSport(e.target.value as Sport | 'tous')}>
          <option value="tous">Tous les sports</option>
          {LISTE_SPORTS.map((s) => (
            <option key={s} value={s}>{SPORTS[s].nom}</option>
          ))}
        </select>
        <select aria-label="Période" value={nbSemaines} onChange={(e) => choisirPeriode(Number(e.target.value))}>
          {PERIODES.map((periode) => (
            <option key={periode.semaines} value={periode.semaines}>{periode.nom}</option>
          ))}
        </select>
        <select aria-label="Ordre" value={tri} onChange={(e) => choisirTri(e.target.value as Tri)}>
          <option value="recentes">Plus récentes</option>
          <option value="anciennes">Plus anciennes</option>
          <option value="longues">Plus longues</option>
        </select>
      </section>

      <section className="carte">
        {seances.length > 0 ? (
          <div className="tableau">
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Sport</th>
                  <th scope="col">Durée</th>
                  <th scope="col">Résumé</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {seances.map((seance) => (
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
        ) : (
          <p className="a-venir">Aucune séance ne correspond à ces filtres.</p>
        )}

        <div className="historique-pied">
          <p>{pluriel(nbSeances)}</p>
          <div className="historique-pages">
            <button type="button" aria-label="Page précédente" disabled={page <= 1} onClick={() => allerALaPage(page - 1)}>
              ‹
            </button>
            <span>Page {page} sur {nbPages}</span>
            <button type="button" aria-label="Page suivante" disabled={page >= nbPages} onClick={() => allerALaPage(page + 1)}>
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Historique
