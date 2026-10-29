import { Link, useParams } from 'react-router'
import '../styles/seance.css'
import EtatVide from '../components/EtatVide.tsx'
import Indicateur from '../components/Indicateur.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useCardioSeances from '../hooks/useCardioSeances.ts'
import { dateCardio, formatDureeSecondes } from '../lib/cardio.ts'
import { formatAllure, formatDateLongue, nombre } from '../lib/format.ts'

// Résultats enregistrés par Java : aucune courbe reconstruite à partir des moyennes.
export default function SeanceCardio() {
  const { id } = useParams()
  const { seances, chargement, erreur, connecte, recharger } = useCardioSeances()
  const seance = seances.find((s) => String(s.id) === id)
  const chronologie = [...seances].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
  const rang = chronologie.findIndex((s) => String(s.id) === id)
  const precedente = chronologie[rang - 1]
  const suivante = rang >= 0 ? chronologie[rang + 1] : undefined

  if (chargement || erreur || !seance) {
    return (
      <div className="ecran seance">
        <TitrePage surtitre="Historique" titre="Séance cardio" />
        {chargement ? <p role="status">Chargement de la séance…</p> : (
          <EtatVide icone={ICONES.info} titre={erreur ? 'Chargement impossible' : 'Séance introuvable'}
            action={erreur ? (connecte
              ? <button type="button" className="bouton secondaire" onClick={recharger}>Réessayer</button>
              : <Link to="/connexion" className="bouton secondaire">Se connecter</Link>) : undefined}>
            {erreur || 'Cette séance ne figure pas dans votre historique cardio.'}
          </EtatVide>
        )}
        <Link to="/historique">Retour à l’historique</Link>
      </div>
    )
  }

  const optionnel = (valeur: number | null, suffixe = '') =>
    valeur === null ? 'Non disponible' : `${nombre(valeur, 2)}${suffixe}`

  return (
    <div className="ecran seance">
      <Link to="/historique" className="lien-retour">← Historique</Link>
      <TitrePage surtitre={`Course à pied · ${formatDateLongue(dateCardio(seance.date))}`}
        titre={seance.nom} />

      <dl className="indicateurs seance-chiffres">
        <Indicateur nom="Distance" valeur={`${nombre(seance.distanceM / 1000, 2)} km`} />
        <Indicateur nom="Durée" valeur={formatDureeSecondes(seance.dureeS)} />
        <Indicateur nom="Allure moyenne" valeur={`${formatAllure(seance.tempsMoy1kmS)}/km`} />
        <Indicateur nom="FC moyenne" valeur={`${seance.fcMoy} bpm`} />
      </dl>

      <div className="seance-grille">
        <Panneau titre="Fréquence cardiaque">
          <dl className="indicateurs">
            <Indicateur nom="Minimum" valeur={`${seance.fcMin} bpm`} />
            <Indicateur nom="Moyenne" valeur={`${seance.fcMoy} bpm`} />
            <Indicateur nom="Maximum" valeur={`${seance.fcMax} bpm`} />
          </dl>
        </Panneau>
        <Panneau titre="Vitesse et régularité">
          <dl className="indicateurs">
            <Indicateur nom="Vitesse moyenne" valeur={`${nombre(seance.vitesseMoyKmh, 2)} km/h`} />
            <Indicateur nom="Vitesse maximale" valeur={`${nombre(seance.vitesseMaxKmh, 2)} km/h`} />
            <Indicateur nom="Variation de vitesse" valeur={optionnel(seance.variationVitesse, ' %')} />
            <Indicateur nom="Corrélation vitesse–FC" valeur={optionnel(seance.correlationVitesseFc)} />
          </dl>
          <p className="seance-note">Une variation plus faible indique une vitesse plus régulière.
            Une corrélation proche de 1 indique que vitesse et fréquence cardiaque augmentent ensemble.</p>
        </Panneau>
      </div>

      <nav className="seance-voisines" aria-label="Séances cardio voisines">
        {precedente ? <Link to={`/historique/cardio/${precedente.id}`}><small>Séance précédente</small><span>{precedente.nom}</span></Link> : <span />}
        {suivante && <Link to={`/historique/cardio/${suivante.id}`} className="suivante"><small>Séance suivante</small><span>{suivante.nom}</span></Link>}
      </nav>
    </div>
  )
}
