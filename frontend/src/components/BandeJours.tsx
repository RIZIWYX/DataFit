import { type CSSProperties } from 'react'
import { Link } from 'react-router'
import { LISTE_SPORTS, SPORTS, couleurSport } from '../data/sports.ts'
import { type Jour } from '../lib/activite.ts'
import { formatDateLongue, formatDuree } from '../lib/format.ts'
import LegendeSports from './LegendeSports.tsx'

type Props = {
  jours: Jour[] // du plus ancien à aujourd'hui
}

// Les derniers jours côte à côte : une barre par jour, haute comme le temps d'entraînement,
// un étage par séance (cliquable, couleur du sport). Aujourd'hui est marqué d'un point turquoise.
function BandeJours({ jours }: Props) {
  // une heure au moins en haut de l'échelle : une petite séance ne remplit pas toute la hauteur
  const maximum = Math.max(60, ...jours.map((jour) => jour.minutes))

  return (
    <div className="bande">
      <ol className="bande-jours" aria-label="Séances jour par jour">
        {jours.map((jour, i) => (
          <li key={jour.date.getTime()} className={i === jours.length - 1 ? 'aujourdhui' : undefined}>
            <div className="bande-piste">
              {jour.seances.length ? (
                <div className="bande-barre" style={{ '--part': jour.minutes / maximum } as CSSProperties}>
                  {jour.seances.map((seance) => (
                    <Link
                      key={seance.id}
                      to={`/historique/${seance.id}`}
                      className="bande-segment"
                      style={{ flexGrow: seance.dureeMin, background: couleurSport(seance.sport) }}
                      aria-label={`${SPORTS[seance.sport].nom}, ${formatDuree(seance.dureeMin)}, ${formatDateLongue(seance.date)}`}
                      title={`${SPORTS[seance.sport].nom} · ${formatDuree(seance.dureeMin)}`}
                    />
                  ))}
                </div>
              ) : (
                <span className="bande-repos">
                  <span className="visuellement-cache">Aucune séance</span>
                </span>
              )}
            </div>
            <span className="bande-jour">
              {jour.date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
            </span>
            <span className="bande-date">{jour.date.getDate()}</span>
          </li>
        ))}
      </ol>

      <LegendeSports sports={LISTE_SPORTS} />
    </div>
  )
}

export default BandeJours
