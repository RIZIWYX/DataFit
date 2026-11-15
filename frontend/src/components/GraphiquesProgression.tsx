import { lireCompte } from '../lib/compte.ts'
import { LISTE_SPORTS, SPORTS, type Sport } from '../data/sports.ts'
import { useGraphiques } from '../hooks/useGraphiques.ts'
import { graphiquesCles } from '../lib/graphiquesCles.ts'
import Panneau from './Panneau.tsx'
import GrapheAnalyse from './GrapheAnalyse.tsx'

const TYPES = { course: 'cardio', natation: 'natation', musculation: 'muscu', velo: 'velo', tous: 'tous' }

type Props = {
  sport: Sport | 'tous'
  semaines: number
  // « Voir tous les graphiques » d'un sport : change le sport affiché sur la page
  choisirSport: (sport: Sport) => void
}

export default function GraphiquesProgression({ sport, semaines, choisirSport }: Props) {
  const id = lireCompte()?.id
  const g = useGraphiques(id ? `/api/graphiques/progression/${id}?sport=${TYPES[sport]}&semaines=${semaines}` : null)
  // « Tous les sports » : trois graphiques par sport ; le détail complet quand on choisit un sport
  const resume = sport === 'tous'
  const affiches = resume ? graphiquesCles(g.graphiques) : g.graphiques

  return <section className="graphiques-section" aria-label="Progression des mesures de la montre">
    <h2>Évolution des résultats de la montre</h2>
    {g.chargement && <p role="status">Calcul des graphiques de progression...</p>}
    {g.erreur && <div className="alerte" role="alert">{g.erreur} <button className="bouton secondaire petit" onClick={g.recharger}>Réessayer</button></div>}
    {!g.chargement && !g.erreur && g.graphiques.length === 0 && <p>Aucune séance enregistrée sur cette période.</p>}
    <div className="graphiques-grille">
      {affiches.map((graphe) => <Panneau key={graphe.id} titre={graphe.titre}><GrapheAnalyse graphique={graphe} /></Panneau>)}
    </div>
    {resume && g.graphiques.length > 0 && (
      <div className="graphiques-details">
        <p className="progression-note">
          Les graphiques essentiels de chaque sport. Régularité, temps de pause, récupération et les autres
          mesures s'affichent en choisissant un sport.
        </p>
        <div className="graphiques-details-boutons">
          {LISTE_SPORTS.map((s) => (
            <button key={s} type="button" className="bouton contour petit" onClick={() => choisirSport(s)}>
              Tous les graphiques · {SPORTS[s].nom}
            </button>
          ))}
        </div>
      </div>
    )}
  </section>
}
