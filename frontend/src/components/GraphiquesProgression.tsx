import { lireCompte } from '../lib/compte.ts'
import { type Sport } from '../data/sports.ts'
import { useGraphiques } from '../hooks/useGraphiques.ts'
import Panneau from './Panneau.tsx'
import GrapheAnalyse from './GrapheAnalyse.tsx'

const TYPES = { course: 'cardio', natation: 'natation', musculation: 'muscu', velo: 'velo', tous: 'tous' }
export default function GraphiquesProgression({ sport, semaines }: { sport: Sport | 'tous'; semaines: number }) {
  const id = lireCompte()?.id
  const g = useGraphiques(id ? `/api/graphiques/progression/${id}?sport=${TYPES[sport]}&semaines=${semaines}` : null)
  return <section className="graphiques-section" aria-label="Progression des mesures de la montre">
    <h2>Évolution des résultats de la montre</h2>
    {g.chargement && <p role="status">Calcul des graphiques de progression...</p>}
    {g.erreur && <div className="alerte" role="alert">{g.erreur} <button className="bouton secondaire petit" onClick={g.recharger}>Réessayer</button></div>}
    {!g.chargement && !g.erreur && g.graphiques.length === 0 && <p>Aucune séance enregistrée sur cette période.</p>}
    <div className="graphiques-grille">
      {g.graphiques.map((graphe) => <Panneau key={graphe.id} titre={graphe.titre}><GrapheAnalyse graphique={graphe} /></Panneau>)}
    </div>
  </section>
}
