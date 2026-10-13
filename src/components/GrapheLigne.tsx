import { type CSSProperties, type KeyboardEvent, type PointerEvent, useState } from 'react'
import '../styles/graphes.css'
import { graduations } from '../lib/activite.ts'

export interface Point {
  libelle: string // en clair, pour la bulle et le tableau : « 12e minute »
  valeur: number
}

type Props = {
  points: Point[]
  reperes: { index: number; texte: string }[] // étiquettes sous l'axe horizontal
  couleur: string
  format: (valeur: number) => string // la valeur avec son unité : « 146 bpm »
  formatAxe?: (valeur: number) => string // version courte pour l'axe vertical
  inverse?: boolean // petites valeurs en haut (pour une allure : plus bas = plus rapide)
  depuisZero?: boolean // l'axe vertical part de 0
  marqueurs?: boolean // un point visible sur chaque valeur (pour les séries courtes)
  entetes: [string, string] // titres des deux colonnes du tableau
}

// une courbe sur un fond légèrement teinté, avec une ligne de lecture au survol
function GrapheLigne({
  points,
  reperes,
  couleur,
  format,
  formatAxe = String,
  inverse = false,
  depuisZero = false,
  marqueurs = false,
  entetes,
}: Props) {
  const [actif, setActif] = useState<number | null>(null)

  const valeurs = points.map((point) => point.valeur)
  const axe = graduations(depuisZero ? 0 : Math.min(...valeurs), Math.max(...valeurs))
  const haut = axe[0]
  const bas = axe[axe.length - 1]

  // position d'un point, en pourcentage de la zone de tracé
  const x = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * 100 : 50)
  const y = (valeur: number) => {
    const ratio = (haut - valeur) / (haut - bas)
    return (inverse ? 1 - ratio : ratio) * 100
  }

  const trait = points.map((point, i) => `${i ? 'L' : 'M'}${x(i)} ${y(point.valeur)}`).join('')

  function suivre(event: PointerEvent<HTMLDivElement>) {
    const cadre = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - cadre.left) / cadre.width))
    setActif(Math.round(ratio * (points.length - 1)))
  }

  // au clavier : les flèches déplacent la ligne de lecture
  function deplacer(event: KeyboardEvent<HTMLDivElement>) {
    const sens = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
    if (!sens) return
    event.preventDefault()
    setActif((i) => Math.min(points.length - 1, Math.max(0, (i ?? points.length - 1) + sens)))
  }

  return (
    <figure className="graphe">
      <div className="graphe-plan">
        <div className="graphe-axe" aria-hidden="true">
          {(inverse ? [...axe].reverse() : axe).map((valeur) => (
            <span key={valeur}>{formatAxe(valeur)}</span>
          ))}
        </div>

        <div
          className="ligne-zone"
          style={{ '--pas': axe.length - 1 } as CSSProperties}
          tabIndex={0}
          role="group"
          aria-label="Courbe : les flèches gauche et droite lisent les valeurs une à une"
          onPointerMove={suivre}
          onPointerLeave={() => setActif(null)}
          onFocus={() => setActif((i) => i ?? points.length - 1)}
          onBlur={() => setActif(null)}
          onKeyDown={deplacer}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="ligne-aire" d={`${trait}L100 100L0 100Z`} style={{ fill: couleur }} />
            <path className="ligne-trait" d={trait} style={{ stroke: couleur }} />
          </svg>

          {marqueurs &&
            points.map((point, i) => (
              <i
                key={point.libelle}
                className="ligne-point"
                style={{ left: `${x(i)}%`, top: `${y(point.valeur)}%`, background: couleur }}
              />
            ))}

          {actif !== null && (
            <>
              <span className="ligne-repere" style={{ left: `${x(actif)}%` }} />
              <i
                className="ligne-point"
                style={{ left: `${x(actif)}%`, top: `${y(points[actif].valeur)}%`, background: couleur }}
              />
              <div
                className={`graphe-bulle visible${x(actif) > 50 ? ' a-gauche' : ''}`}
                style={{ left: `${x(actif)}%`, top: `${y(points[actif].valeur)}%` }}
                role="status"
              >
                <strong>{format(points[actif].valeur)}</strong>
                <span>{points[actif].libelle}</span>
              </div>
            </>
          )}
        </div>

        <div />
        <div className="ligne-reperes" aria-hidden="true">
          {reperes.map((repere) => (
            <span key={repere.index} style={{ left: `${x(repere.index)}%` }}>{repere.texte}</span>
          ))}
        </div>
      </div>

      {/* les mêmes chiffres en tableau, lisibles sans survoler le graphique */}
      <details className="graphe-chiffres">
        <summary>Voir les chiffres</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{entetes[0]}</th>
              <th scope="col">{entetes[1]}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.libelle}>
                <th scope="row">{point.libelle}</th>
                <td>{format(point.valeur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}

export default GrapheLigne
