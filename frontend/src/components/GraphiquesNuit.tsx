import Panneau from './Panneau.tsx'
import GrapheAnalyse from './GrapheAnalyse.tsx'
import { useGraphiquesNuit } from '../hooks/useGraphiques.ts'

// Les graphiques de la nuit affichée, calculés par l'analyse sur les mesures de la montre.
export default function GraphiquesNuit({ id }: { id: string }) {
  const g = useGraphiquesNuit(id)
  return <section className="graphiques-section" aria-label="Graphiques de la nuit">
    <h2>Graphiques de la nuit</h2>
    {g.chargement && <p role="status">Chargement des mesures de la nuit…</p>}
    {g.erreur && <div className="alerte" role="alert">{g.erreur} <button className="bouton secondaire petit" onClick={g.recharger}>Réessayer</button></div>}
    {g.absent && <p className="sommeil-note">Les relevés détaillés de cette ancienne nuit n’ont pas été conservés. Les prochaines nuits synchronisées disposeront de leurs courbes.</p>}
    <div className="graphiques-grille">
      {g.graphiques.map((graphe) => <Panneau key={graphe.id} titre={graphe.titre}><GrapheAnalyse graphique={graphe} /></Panneau>)}
    </div>
  </section>
}
