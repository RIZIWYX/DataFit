import { useId } from 'react'
import '../styles/graphiques-analyse.css'
import { type GraphiqueAnalyse } from '../services/graphiquesService.ts'
import { nombre } from '../lib/format.ts'

const COULEURS = ['#19c7b1', '#e093cc', '#e8b35c', '#aaa0ff']
const nombres = (n: number) => nombre(n, 2)

/** Tracé avec abscisses numériques réelles : les intervalles irréguliers restent à leur place. */
export default function GrapheAnalyse({ graphique: g }: { graphique: GraphiqueAnalyse }) {
  const id = useId()
  const points = g.series.flatMap((s) => s.points)
  if (!points.length) return <p>Aucune mesure disponible pour ce graphique.</p>
  const marge = { gauche: g.reperesY ? 85 : 64, droite: 25, haut: 24, bas: 55 }
  const W = 640, H = 300, w = W - marge.gauche - marge.droite, h = H - marge.haut - marge.bas
  const barre = g.type === 'histogramme'
  const demi = barre ? (g.largeurColonne ?? 0.8) / 2 : 0
  let xmin = Math.min(...points.map((p) => p.x)) - demi
  let xmax = Math.max(...points.map((p) => p.x)) + demi
  if (xmin === xmax) { xmin -= 0.5; xmax += 0.5 }
  const valeursY = [...points.map((p) => p.y), ...(g.references ?? []).map((r) => r.valeur), ...(g.reperesY ?? []).map((r) => r.valeur)]
  let ymin = barre || g.depuisZero ? Math.min(0, ...valeursY) : Math.min(...valeursY)
  let ymax = Math.max(...valeursY)
  const ecart = Math.max(ymax - ymin, Math.abs(ymax) * 0.05, 1)
  if (!barre && !g.depuisZero) ymin -= ecart * 0.08
  ymax += ecart * 0.08
  const x = (n: number) => marge.gauche + (n - xmin) / (xmax - xmin) * w
  const y = (n: number) => marge.haut + h - (n - ymin) / (ymax - ymin) * h
  const yticks = g.reperesY ?? Array.from({ length: 5 }, (_, i) => {
    const valeur = ymin + (ymax - ymin) * i / 4
    return { valeur, libelle: nombres(valeur) }
  })
  const base = g.series[0].points
  const indices = [...new Set(Array.from({ length: Math.min(5, base.length) }, (_, i) => Math.round(i * (base.length - 1) / Math.max(1, Math.min(5, base.length) - 1))))]
  const labels = (p: typeof base[number]) => p.libelle?.includes(' · ')
    ? p.libelle.split(' · ')[0].split('-').reverse().slice(0, 2).join('/')
    : p.libelle ?? nombres(p.x)
  const nomY = (n: number) => g.reperesY?.find((r) => r.valeur === n)?.libelle ?? `${nombres(n)} ${g.uniteY}`.trim()

  return (
    <figure className="analyse-graphe">
      <ul className="analyse-legende" aria-label="Séries">
        {g.series.map((s, i) => <li key={s.nom}><i style={{ background: COULEURS[i % COULEURS.length] }} />{s.nom}</li>)}
        {g.references?.map((r) => <li key={r.nom}>{r.nom} : {nomY(r.valeur)}</li>)}
      </ul>
      <div className="analyse-cadre">
      <svg className="analyse-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-titre ${id}-description`}>
        <title id={`${id}-titre`}>{g.titre}</title>
        <desc id={`${id}-description`}>{g.axeX}{g.uniteX ? ` (${g.uniteX})` : ''} ; {g.axeY} ({g.uniteY}). Les valeurs sont disponibles dans le tableau sous le graphique.</desc>
        <defs><clipPath id={`${id}-clip`}><rect x={marge.gauche - 1} y={marge.haut - 2} width={w + 2} height={h + 4} /></clipPath></defs>
        {yticks.map((t) => <g key={t.valeur}>
          <line x1={marge.gauche} x2={W - marge.droite} y1={y(t.valeur)} y2={y(t.valeur)} className="analyse-grille" />
          <text x={marge.gauche - 10} y={y(t.valeur) + 4} textAnchor="end">{t.libelle}</text>
        </g>)}
        <text x={marge.gauche} y={13}>{g.uniteY}</text>
        <g clipPath={`url(#${id}-clip)`}>
          {g.references?.map((r) => <line key={r.nom} x1={marge.gauche} x2={W - marge.droite} y1={y(r.valeur)} y2={y(r.valeur)} stroke="#68767c" strokeDasharray="6 4" />)}
          {g.series.map((s, si) => {
            const couleur = COULEURS[si % COULEURS.length]
            const trait = s.points.map((p, i) => i === 0 ? `M${x(p.x)},${y(p.y)}`
              : g.type === 'paliers' ? `H${x(p.x)}V${y(p.y)}` : `L${x(p.x)},${y(p.y)}`).join(' ')
            return <g key={s.nom}>
              {!barre && g.type !== 'nuage' && <path d={trait} fill="none" stroke={couleur} strokeWidth="2" strokeDasharray={s.pointilles ? '7 5' : undefined} vectorEffect="non-scaling-stroke" />}
              {s.points.map((p, i) => {
                const titre = `${s.nom} · ${p.libelle ?? `${nombres(p.x)} ${g.uniteX}`} : ${nomY(p.y)}`
                return barre ? <rect key={i} x={x(p.x - demi) + 1} y={y(p.y)} width={Math.max(1, x(p.x + demi) - x(p.x - demi) - 2)} height={Math.max(0, y(0) - y(p.y))} fill={couleur}><title>{titre}</title></rect>
                  : <circle key={i} cx={x(p.x)} cy={y(p.y)} r={g.type === 'nuage' ? 3.2 : s.points.length > 100 ? 1.8 : 3} fill={couleur} opacity={g.type === 'nuage' ? 0.65 : 1}><title>{titre}</title></circle>
              })}
            </g>
          })}
        </g>
        {indices.map((i, n) => <text key={i} x={x(base[i].x)} y={H - 31} textAnchor={n === 0 ? 'start' : n === indices.length - 1 ? 'end' : 'middle'}>{labels(base[i])}</text>)}
        <text x={marge.gauche + w / 2} y={H - 7} textAnchor="middle">{g.axeX}{g.uniteX ? ` (${g.uniteX})` : ''}</text>
      </svg>
      </div>
      {g.note && <figcaption>{g.note}</figcaption>}
      <details className="analyse-chiffres">
        <summary>Voir les valeurs du graphique</summary>
        <div className="analyse-tableau"><table>
          <thead><tr><th>Série</th><th>{g.axeX}</th><th>{g.axeY}{g.uniteY ? ` (${g.uniteY})` : ''}</th></tr></thead>
          <tbody>{g.series.flatMap((s) => s.points.map((p, i) => <tr key={`${s.nom}-${i}`}>
            <td>{s.nom}</td><td>{p.libelle ?? `${nombres(p.x)} ${g.uniteX}`}</td><td>{nomY(p.y)}</td>
          </tr>))}</tbody>
        </table></div>
      </details>
    </figure>
  )
}
