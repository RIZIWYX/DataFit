import Panneau from './Panneau.tsx'
import GrapheAnalyse from './GrapheAnalyse.tsx'
import { useGraphiquesNuits } from '../hooks/useGraphiques.ts'

// L'évolution d'une nuit à l'autre, d'après les valeurs enregistrées en base.
export default function GraphiquesNuits({ nbNuits }: { nbNuits: number }) {
  const g = useGraphiquesNuits(nbNuits)
  return <section className="graphiques-section" aria-label="Évolution des nuits">
    <h2>Évolution de vos nuits</h2>
    {g.chargement && <p role="status">Calcul de l’évolution des nuits…</p>}
    {g.erreur && <div className="alerte" role="alert">{g.erreur} <button className="bouton secondaire petit" onClick={g.recharger}>Réessayer</button></div>}
    {!g.chargement && !g.erreur && g.graphiques.length === 0 && <p>Aucune nuit enregistrée.</p>}
    {nbNuits === 1 && !g.chargement && <p className="sommeil-note">Une seule nuit pour l’instant : l’évolution se dessinera au fil des synchronisations.</p>}
    <div className="graphiques-grille">
      {g.graphiques.map((graphe) => <Panneau key={graphe.id} titre={graphe.titre}><GrapheAnalyse graphique={graphe} /></Panneau>)}
    </div>
  </section>
}
