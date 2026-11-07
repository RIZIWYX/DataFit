import { Link, useParams } from 'react-router'
import '../styles/seance.css'
import GraphiquesSeance from '../components/GraphiquesSeance.tsx'
import EtatVide from '../components/EtatVide.tsx'
import Icone from '../components/Icone.tsx'
import Indicateur from '../components/Indicateur.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { SPORTS } from '../data/sports.ts'
import useSeance from '../hooks/useSeance.ts'
import { formatDureeSecondes } from '../lib/cardio.ts'
import { allureSeance, formatDateLongue, formatHeure, resumeSeance } from '../lib/format.ts'

export default function Seance() {
  const { id } = useParams()
  const { seance, note, ecrireNote, precedente, suivante, chargement, erreur, recharger } = useSeance(id)
  if (!seance) return (
    <div className="ecran seance">
      <TitrePage surtitre="Historique" titre="Séance" />
      {chargement ? <p role="status">Chargement de la séance…</p> : (
        <EtatVide icone={ICONES.info} titre={erreur ? 'Chargement impossible' : 'Séance introuvable'}
          action={erreur ? <button className="bouton secondaire" onClick={recharger}>Réessayer</button> : undefined}>
          {erreur || 'Cette séance ne figure pas dans vos données enregistrées.'}
        </EtatVide>
      )}
      <Link to="/historique">Retour à l’historique</Link>
    </div>
  )
  const allure = allureSeance(seance)
  return (
    <div className="ecran seance">
      <Link to="/historique" className="lien-retour"><Icone trace={ICONES.retour} />Historique</Link>
      <TitrePage surtitre={`${SPORTS[seance.sport].nom} · ${formatDateLongue(seance.date)}${seance.heure ? `, ${formatHeure(seance.heure)}` : ''}`}
        titre={seance.nom} actions={<span className="etiquette"><Icone trace={ICONES.montre} />Reçue de la montre</span>} />
      {erreur && <p className="alerte" role="alert">{erreur}</p>}
      <dl className="indicateurs seance-chiffres">
        <Indicateur nom={seance.sport === 'musculation' ? 'Séries' : 'Distance'} valeur={resumeSeance(seance)} />
        <Indicateur nom="Durée" valeur={formatDureeSecondes(seance.dureeSecondes)} />
        {allure && <Indicateur nom="Allure moyenne" valeur={allure} />}
        <Indicateur nom="FC moyenne" valeur={`${seance.fcMoyenne} bpm`} />
        <Indicateur nom="FC maximale" valeur={`${seance.fcMax} bpm`} />
      </dl>
      <div className="seance-grille">
        <Panneau titre="Fréquence cardiaque">
          <dl className="indicateurs">
            <Indicateur nom="Minimum" valeur={`${seance.fcMin} bpm`} />
            <Indicateur nom="Moyenne" valeur={`${seance.fcMoyenne} bpm`} />
            <Indicateur nom="Maximum" valeur={`${seance.fcMax} bpm`} />
          </dl>
        </Panneau>
        {seance.indicateurs.length > 0 && <Panneau titre={seance.sport === 'course' ? 'Vitesse et régularité' : 'Résultats de la séance'}>
          <dl className="indicateurs">
            {seance.indicateurs.map((m) => <Indicateur key={m.nom} nom={m.nom} valeur={m.valeur} />)}
          </dl>
        </Panneau>}
      </div>
      <GraphiquesSeance id={seance.id} />
      <Panneau titre="Notes personnelles">
        <label className="visuellement-cache" htmlFor="note">Notes personnelles</label>
        <textarea id="note" className="seance-texte" rows={3} placeholder="Comment avez-vous vécu cette séance ?"
          value={note} onChange={(e) => ecrireNote(e.target.value)} />
        <p className="seance-note">Enregistrées automatiquement dans ce navigateur.</p>
      </Panneau>
      <nav className="seance-voisines" aria-label="Séances voisines">
        {precedente ? <Link to={`/historique/${precedente.id}`}><small>Séance précédente</small><span>{precedente.nom}</span></Link> : <span />}
        {suivante && <Link to={`/historique/${suivante.id}`} className="suivante"><small>Séance suivante</small><span>{suivante.nom}</span></Link>}
      </nav>
    </div>
  )
}
