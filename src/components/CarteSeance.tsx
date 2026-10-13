import { Link } from 'react-router'
import '../styles/carte-seance.css'
import { SPORTS, type Sport } from '../data/sports.ts'
import Icone from './Icone.tsx'

type Props = {
  sport: Sport
  date: Date
  duree: string
  resume: string
  lien?: string // page ouverte par le bouton ; sans lien, pas de bouton
}

// encadré d'une séance : le nom, la photo et l'icône sont retrouvés à partir du sport
function CarteSeance({ sport, date, duree, resume, lien }: Props) {
  const { nom, image, icone } = SPORTS[sport]
  const dateTexte = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <article className="seance">
      {image && <img className="seance-photo" src={image} alt="" />}
      <div className="seance-contenu">
        <div className="seance-entete">
          <span className="seance-icone">
            <Icone trace={icone} />
          </span>
          <div>
            <h3>{nom}</h3>
            <p className="seance-date">{dateTexte}</p>
          </div>
        </div>
        <p className="seance-infos">
          <span>{duree}</span>
          <span>{resume}</span>
        </p>
        {lien && <Link to={lien} className="btn">Consulter la séance →</Link>}
      </div>
    </article>
  )
}

export default CarteSeance
