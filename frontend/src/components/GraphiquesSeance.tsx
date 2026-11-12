import Panneau from './Panneau.tsx'
import GrapheAnalyse from './GrapheAnalyse.tsx'
import { useGraphiquesSeance } from '../hooks/useGraphiques.ts'

// Graphiques calculés par l'analyse mais pas affichés (issue #19) : la distance cumulée est une droite
// qui redit la distance totale, et la distribution des vitesses redit la courbe de vitesse.
// Leurs valeurs restent calculées : il suffit de retirer un identifiant ici pour les remettre.
const MASQUES = new Set(['distance', 'distribution-vitesse'])

export default function GraphiquesSeance({ id }: { id: string }) {
  const g = useGraphiquesSeance(id)
  const graphiques = g.graphiques.filter((graphe) => !MASQUES.has(graphe.id))
  return <section className="graphiques-section" aria-label="Graphiques de la séance">
    <h2>Graphiques de la séance</h2>
    {g.chargement && <p role="status">Chargement des mesures de la séance...</p>}
    {g.erreur && <div className="alerte" role="alert">{g.erreur} <button className="bouton secondaire petit" onClick={g.recharger}>Réessayer</button></div>}
    {g.absent && <p className="seance-note">Les relevés détaillés de cette ancienne séance n'ont pas été conservés. Les prochaines séances synchronisées disposeront de leurs courbes.</p>}
    <div className="graphiques-grille">
      {graphiques.map((graphe) => <Panneau key={graphe.id} titre={graphe.titre}><GrapheAnalyse graphique={graphe} /></Panneau>)}
    </div>
  </section>
}
