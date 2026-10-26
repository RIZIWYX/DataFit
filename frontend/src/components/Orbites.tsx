import { useState } from 'react'
import '../styles/orbites.css'
import { ICONES } from '../data/icones.ts'
import { SPORTS } from '../data/sports.ts'

// Illustration de la page de garde : des orbites autour d'un même centre, et les sports
// posés dessus. Tout est calculé ici à partir de quatre ellipses ; styles dans orbites.css.

const CX = 320
const CY = 280

// une ellipse centrée : demi-axes rx et ry, inclinée de « angle » degrés
interface Orbite {
  rx: number
  ry: number
  angle: number
  classe: string
}

const ORBITES = {
  large: { rx: 296, ry: 124, angle: -16, classe: 'orbite' },
  turquoise: { rx: 262, ry: 168, angle: 24, classe: 'orbite turquoise' },
  pointillee: { rx: 306, ry: 214, angle: -4, classe: 'orbite pointillee' },
  interieure: { rx: 214, ry: 92, angle: 10, classe: 'orbite discrete' },
} satisfies Record<string, Orbite>

type NomOrbite = keyof typeof ORBITES

// position du point situé à « t » degrés le long de l'ellipse
function point({ rx, ry, angle }: Orbite, t: number) {
  const a = (angle * Math.PI) / 180
  const u = (t * Math.PI) / 180
  const x = rx * Math.cos(u)
  const y = ry * Math.sin(u)
  return { x: CX + x * Math.cos(a) - y * Math.sin(a), y: CY + x * Math.sin(a) + y * Math.cos(a) }
}

// tracé de l'ellipse en deux demi-arcs : il sert au dessin et au trajet des points animés
function trace(orbite: Orbite) {
  const { rx, ry, angle } = orbite
  const depart = point(orbite, 0)
  const milieu = point(orbite, 180)
  return `M${depart.x} ${depart.y}A${rx} ${ry} ${angle} 0 1 ${milieu.x} ${milieu.y}A${rx} ${ry} ${angle} 0 1 ${depart.x} ${depart.y}`
}

// les sports et la montre, posés sur les orbites
const NOEUDS: { orbite: NomOrbite; t: number; icone: string }[] = [
  { orbite: 'large', t: 198, icone: SPORTS.musculation.icone },
  { orbite: 'turquoise', t: 292, icone: SPORTS.course.icone },
  { orbite: 'large', t: 22, icone: SPORTS.natation.icone },
  { orbite: 'pointillee', t: 104, icone: ICONES.montre },
]

// petits points fixes, pour rythmer les traits
const POINTS: { orbite: NomOrbite; t: number; turquoise?: boolean }[] = [
  { orbite: 'large', t: 112 },
  { orbite: 'interieure', t: 250 },
  { orbite: 'pointillee', t: 312 },
  { orbite: 'turquoise', t: 44, turquoise: true },
  { orbite: 'pointillee', t: 214, turquoise: true },
]

// deux points qui circulent lentement (immobiles si l'utilisateur réduit les animations)
const SATELLITES: { orbite: NomOrbite; t: number; duree: string; turquoise?: boolean }[] = [
  { orbite: 'turquoise', t: 160, duree: '22s', turquoise: true },
  { orbite: 'large', t: 300, duree: '34s' },
]

function Orbites() {
  const [animer] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const z = point(ORBITES.turquoise, 128)

  return (
    <div className="orbites">
      <svg viewBox="0 0 640 560" aria-hidden="true">
        {Object.values(ORBITES).map((orbite) => (
          <path key={orbite.classe} className={orbite.classe} d={trace(orbite)} />
        ))}

        {POINTS.map(({ orbite, t, turquoise }) => {
          const { x, y } = point(ORBITES[orbite], t)
          return <circle key={`${orbite}-${t}`} className={turquoise ? 'orbite-point turquoise' : 'orbite-point'} cx={x} cy={y} r="3.5" />
        })}

        {SATELLITES.map(({ orbite, t, duree, turquoise }) => {
          const classe = turquoise ? 'orbite-point turquoise' : 'orbite-point'
          if (!animer) {
            const { x, y } = point(ORBITES[orbite], t)
            return <circle key={orbite} className={classe} cx={x} cy={y} r="4.5" />
          }
          return (
            <circle key={orbite} className={classe} r="4.5">
              <animateMotion dur={duree} repeatCount="indefinite" path={trace(ORBITES[orbite])} />
            </circle>
          )
        })}

        {NOEUDS.map(({ orbite, t, icone }) => {
          const { x, y } = point(ORBITES[orbite], t)
          return (
            <g key={`${orbite}-${t}`} className="orbite-noeud" transform={`translate(${x} ${y})`}>
              <circle r="28" />
              <path d={icone} transform="translate(-12 -12)" />
            </g>
          )
        })}

        {/* le rang le plus haut, en turquoise */}
        <g className="orbite-rang" transform={`translate(${z.x} ${z.y})`}>
          <circle r="22" />
          <text textAnchor="middle" dominantBaseline="central">Z</text>
        </g>
      </svg>

      {/* le logo au centre (provisoire : le contenu du centre reste à décider) */}
      <div className="orbites-centre">
        <img src="/logo.webp" alt="" width="232" height="200" />
      </div>
    </div>
  )
}

export default Orbites
