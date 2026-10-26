import { type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import '../styles/carte-seance.css'
import { ICONES } from '../data/icones.ts'
import Icone from './Icone.tsx'

type Props = {
  surtitre: string // « Dernière séance · Mardi · 18:10 »
  titre: string
  icone: string // tracé de l'icône (sport, ou calendrier pour une séance planifiée)
  couleur: string // couleur du sport ou du programme, portée par l'icône
  image?: string // photo de la discipline ; sans photo, la carte garde un fond uni
  mesures: { nom: string; valeur: string }[]
  children?: ReactNode // un détail en plus : exercices prévus, suite du programme…
  lien: string
  action: string // texte du bouton
}

// Grande carte d'une séance : la photo de la discipline à droite, en noir et blanc sous un voile,
// et par-dessus le nom, les chiffres clés et un bouton vers le détail.
function CarteSeance({ surtitre, titre, icone, couleur, image, mesures, children, lien, action }: Props) {
  return (
    <article className={image ? 'carte-seance' : 'carte-seance sans-photo'} style={{ '--couleur': couleur } as CSSProperties}>
      {image && (
        <>
          <img className="carte-seance-photo" src={image} alt="" loading="lazy" />
          <div className="carte-seance-voile" />
        </>
      )}
      <div className="carte-seance-contenu">
        <div className="carte-seance-entete">
          <span className="carte-seance-icone">
            <Icone trace={icone} />
          </span>
          <div>
            <p className="surtitre">{surtitre}</p>
            <h2 className="carte-seance-titre">
              {titre}
              <span className="point">.</span>
            </h2>
          </div>
        </div>

        {mesures.length > 0 && (
          <dl className="carte-seance-mesures">
            {mesures.map((mesure) => (
              <div key={mesure.nom}>
                <dt>{mesure.nom}</dt>
                <dd>{mesure.valeur}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}

        <Link to={lien} className="bouton secondaire petit carte-seance-action">
          {action}
          <Icone trace={ICONES.fleche} />
        </Link>
      </div>
    </article>
  )
}

export default CarteSeance
