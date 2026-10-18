import { Link } from 'react-router'
import '../styles/liste-seances.css'
import { ICONES } from '../data/icones.ts'
import { type Seance } from '../data/seances.ts'
import { SPORTS, couleurSport } from '../data/sports.ts'
import { formatDuree, formatHeure, formatJourRelatif, resumeSeance } from '../lib/format.ts'
import Icone from './Icone.tsx'

type Props = {
  seances: Seance[]
  aujourdHui: Date
}

// une ligne par séance : sport, quand, la mesure principale, la durée et la FC moyenne.
// Toute la ligne mène au détail de la séance.
function ListeSeances({ seances, aujourdHui }: Props) {
  return (
    <ul className="liste-lignes liste-seances">
      {seances.map((seance) => {
        const sport = SPORTS[seance.sport]
        return (
          <li key={seance.id}>
            <Link to={`/historique/${seance.id}`} className="ligne-seance">
              <span className="ligne-seance-icone" style={{ color: couleurSport(seance.sport) }}>
                <Icone trace={sport.icone} />
              </span>
              <span className="ligne-seance-titre">
                <strong>{sport.nom}</strong>
                <small>
                  {formatJourRelatif(seance.date, aujourdHui)} · {formatHeure(seance.date)}
                </small>
              </span>
              <span className="ligne-seance-mesure">{resumeSeance(seance)}</span>
              <span className="ligne-seance-mesure secondaire">{formatDuree(seance.dureeMin)}</span>
              <span className="ligne-seance-mesure secondaire">{seance.fcMoyenne} bpm</span>
              <Icone trace={ICONES.chevron} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default ListeSeances
