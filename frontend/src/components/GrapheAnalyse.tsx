import { useId, useLayoutEffect, useRef, useState } from 'react'
import '../styles/graphiques-analyse.css'
import { type GraphiqueAnalyse, type PointAnalyse } from '../services/graphiquesService.ts'
import { nombre } from '../lib/format.ts'

const COULEURS = ['#19c7b1', '#e093cc', '#e8b35c', '#aaa0ff']

// une valeur lisible : sans décimale à partir de 100 (153 bpm), une seule à partir de 1 (11,1 km/h)
const precis = (n: number) => nombre(n, Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 1 ? 1 : 2)

// L'analyse écrit ses intervalles à l'anglaise ("96.00 – 104.38 bpm") : on les remet au format
// français, arrondis comme le reste ("96 – 104 bpm"). Les dates ("2026-11-08") ne sont pas touchées.
const adoucir = (libelle: string) => libelle.replace(/\d+\.\d+/g, (n) => precis(Number(n)))

// un intervalle de valeurs ("96.00 – 104.38 bpm" : tiret long entre deux espaces), par opposition
// à une catégorie ("effort"), une heure ("23:05") ou une date ("2026-11-12 · Nuit")
const estIntervalle = (libelle: string) => /^\s*-?\d+(\.\d+)?\s+–\s+-?\d+(\.\d+)?/.test(libelle)

// Graduations « rondes » (pas de 1, 2, 2,5 ou 5 × 10^n) qui couvrent [min, max] en 4 à 6 pas,
// au lieu de 5 valeurs régulières comme 90,64 / 110,07 / 129,5. Pour des comptes, pas entiers.
function graduations(min: number, max: number, entiers: boolean) {
  const brut = (max - min) / 4 || 1
  const puissance = 10 ** Math.floor(Math.log10(brut))
  const facteurs = entiers && puissance < 10 ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10]
  let pas = facteurs.find((f) => f * puissance >= brut)! * puissance
  if (entiers) pas = Math.max(1, Math.round(pas))
  const valeurs: number[] = []
  for (let v = Math.floor(min / pas) * pas; v <= Math.ceil(max / pas) * pas + pas / 1e6; v += pas) {
    valeurs.push(Number(v.toFixed(10)))
  }
  // autant de décimales que le pas (2,5 -> une ; 0,25 -> deux ; 20 -> aucune)
  const decimales = (String(Number(pas.toFixed(10))).split('.')[1] ?? '').length
  return { valeurs, libelle: (v: number) => nombre(v, decimales) }
}

/** Tracé avec abscisses numériques réelles : les intervalles irréguliers restent à leur place. */
export default function GrapheAnalyse({ graphique: g }: { graphique: GraphiqueAnalyse }) {
  const id = useId()
  // Le tracé se dessine à la largeur réelle de son cadre : le texte garde sa taille sur un téléphone
  // comme sur un grand écran, sans barre de défilement sous le graphique.
  const cadre = useRef<HTMLDivElement>(null)
  const [largeur, setLargeur] = useState(640)
  useLayoutEffect(() => {
    const element = cadre.current
    if (!element) return
    const mesurer = () => setLargeur(Math.round(element.clientWidth) || 640)
    mesurer()
    const observateur = new ResizeObserver(mesurer)
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [])
  const points = g.series.flatMap((s) => s.points)
  if (!points.length) return <p>Aucune mesure disponible pour ce graphique.</p>
  const marge = { gauche: g.reperesY ? 85 : 64, droite: 25, haut: 24, bas: 55 }
  const W = Math.max(280, largeur), H = 300, w = W - marge.gauche - marge.droite, h = H - marge.haut - marge.bas
  const barre = g.type === 'histogramme'
  const demi = barre ? (g.largeurColonne ?? 0.8) / 2 : 0
  let xmin = Math.min(...points.map((p) => p.x)) - demi
  let xmax = Math.max(...points.map((p) => p.x)) + demi
  if (xmin === xmax) { xmin -= 0.5; xmax += 0.5 }
  const donneesY = points.map((p) => p.y)
  const valeursY = [...donneesY, ...(g.references ?? []).map((r) => r.valeur), ...(g.reperesY ?? []).map((r) => r.valeur)]
  let ymin = barre || g.depuisZero ? Math.min(0, ...valeursY) : Math.min(...valeursY)
  let ymax = Math.max(...valeursY)

  // Axe vertical : les repères fournis (phases du sommeil) avec une petite marge, comme avant ;
  // sinon des graduations rondes calculées sur les vraies valeurs (98 % monte à 100 %, pas à 150 %),
  // et l'axe s'étend jusqu'à la première et la dernière graduation.
  let yticks = g.reperesY
  if (yticks) {
    const ecart = Math.max(ymax - ymin, Math.abs(ymax) * 0.05, 1)
    if (!barre && !g.depuisZero) ymin -= ecart * 0.08
    ymax += ecart * 0.08
  } else {
    if (ymin === ymax) {
      const ecart = Math.max(Math.abs(ymax) * 0.05, 1)
      ymin -= ecart
      ymax += ecart
    }
    // des mesures positives ne descendent pas sous zéro
    if (ymin < 0 && Math.min(...valeursY) >= 0) ymin = 0
    const grad = graduations(ymin, ymax, donneesY.every(Number.isInteger))
    ymin = grad.valeurs[0]
    ymax = grad.valeurs.at(-1)!
    yticks = grad.valeurs.map((valeur) => ({ valeur, libelle: grad.libelle(valeur) }))
  }
  const x = (n: number) => marge.gauche + (n - xmin) / (xmax - xmin) * w
  const y = (n: number) => marge.haut + h - (n - ymin) / (ymax - ymin) * h

  // Axe horizontal : en nombres (minutes, longueurs, intervalles de bpm ou de km/h), des graduations
  // rondes ; en libellés (heures, dates, catégories), quelques points de la série, comme avant.
  const base = g.series[0].points
  const axeNumerique = base.every((p) => p.libelle === undefined || estIntervalle(p.libelle))
  const labels = (p: PointAnalyse) => p.libelle?.includes(' · ')
    ? p.libelle.split(' · ')[0].split('-').reverse().slice(0, 2).join('/')
    : p.libelle ?? precis(p.x)
  let xticks: { valeur: number; libelle: string }[]
  if (axeNumerique) {
    const grad = graduations(xmin, xmax, points.every((p) => Number.isInteger(p.x)))
    xticks = grad.valeurs.filter((v) => v >= xmin - 1e-9 && v <= xmax + 1e-9).map((valeur) => ({ valeur, libelle: grad.libelle(valeur) }))
  } else {
    const indices = [...new Set(Array.from({ length: Math.min(5, base.length) }, (_, i) => Math.round(i * (base.length - 1) / Math.max(1, Math.min(5, base.length) - 1))))]
    xticks = indices.map((i) => ({ valeur: base[i].x, libelle: labels(base[i]) }))
  }
  // une graduation collée à un bord s'aligne sur lui pour ne pas déborder du graphique
  const ancre = (v: number) => x(v) - marge.gauche < 18 ? 'start' : W - marge.droite - x(v) < 18 ? 'end' : 'middle'

  const nomX = (p: PointAnalyse) => p.libelle ? adoucir(p.libelle) : `${precis(p.x)} ${g.uniteX}`.trim()
  // les unités qui comptent quelque chose (mesures, séries, réveils...) au singulier sous 2 : « 1 mesure »
  const unite = (n: number) => g.uniteY.length > 2 && g.uniteY.endsWith('s') && Number.isInteger(n) && Math.abs(n) < 2
    ? g.uniteY.slice(0, -1) : g.uniteY
  const nomY = (n: number) => g.reperesY?.find((r) => r.valeur === n)?.libelle ?? `${precis(n)} ${unite(n)}`.trim()

  return (
    <figure className="analyse-graphe">
      <ul className="analyse-legende" aria-label="Séries">
        {g.series.map((s, i) => <li key={s.nom}><i style={{ background: COULEURS[i % COULEURS.length] }} />{s.nom}</li>)}
        {g.references?.map((r) => <li key={r.nom}>{r.nom} : {nomY(r.valeur)}</li>)}
      </ul>
      <div className="analyse-cadre" ref={cadre}>
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
                const titre = `${s.nom} · ${nomX(p)} : ${nomY(p.y)}`
                return barre ? <rect key={i} x={x(p.x - demi) + 1} y={y(p.y)} width={Math.max(1, x(p.x + demi) - x(p.x - demi) - 2)} height={Math.max(0, y(0) - y(p.y))} fill={couleur}><title>{titre}</title></rect>
                  : <circle key={i} cx={x(p.x)} cy={y(p.y)} r={g.type === 'nuage' ? 3.2 : s.points.length > 100 ? 1.8 : 3} fill={couleur} opacity={g.type === 'nuage' ? 0.65 : 1}><title>{titre}</title></circle>
              })}
            </g>
          })}
        </g>
        {xticks.map((t) => <text key={t.valeur} x={x(t.valeur)} y={H - 31} textAnchor={ancre(t.valeur)}>{t.libelle}</text>)}
        <text x={marge.gauche + w / 2} y={H - 7} textAnchor="middle">{g.axeX}{g.uniteX ? ` (${g.uniteX})` : ''}</text>
      </svg>
      </div>
      {g.note && <figcaption>{g.note}</figcaption>}
      <details className="analyse-chiffres">
        <summary>Voir les valeurs du graphique</summary>
        <div className="analyse-tableau"><table>
          <thead><tr><th>Série</th><th>{g.axeX}</th><th>{g.axeY}{g.uniteY ? ` (${g.uniteY})` : ''}</th></tr></thead>
          <tbody>{g.series.flatMap((s) => s.points.map((p, i) => <tr key={`${s.nom}-${i}`}>
            <td>{s.nom}</td><td>{nomX(p)}</td><td>{nomY(p.y)}</td>
          </tr>))}</tbody>
        </table></div>
      </details>
    </figure>
  )
}
