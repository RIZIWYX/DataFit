import '../styles/graphiques-analyse.css'
import '../styles/sommeil.css'
import EtatVide from '../components/EtatVide.tsx'
import GraphiquesNuit from '../components/GraphiquesNuit.tsx'
import GraphiquesNuits from '../components/GraphiquesNuits.tsx'
import Icone from '../components/Icone.tsx'
import Indicateur from '../components/Indicateur.tsx'
import LienFleche from '../components/LienFleche.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useSommeil from '../hooks/useSommeil.ts'
import { formatDuree, formatHeure, formatJour, nombre } from '../lib/format.ts'
import { dureeNuit, heureNuit, minutesDepuisMidi } from '../lib/sommeil.ts'

const libelleNuit = (nuit: { lever: Date }) => `Nuit du ${formatJour(nuit.lever)}`

// l'axe des horaires va de 20 h à 10 h
const AXE_DEBUT = 8 * 60 // 20 h, en minutes depuis midi
const AXE_DUREE = 14 * 60
const HEURES_AXE = [20, 22, 0, 2, 4, 6, 8, 10]
// au-delà, les boutons de choix ne tiennent plus : les plus anciennes se choisissent dans l'historique
const NUITS_BOUTONS = 7

// Les nuits reçues de la montre : chaque valeur vient de la table sommeil (calculée par l'analyse),
// chaque courbe des graphiques calculés par l'analyse sur les mesures de la nuit.
function Sommeil() {
  const { nuits, nuit, choisirNuit, ecartCoucher, dureeMoyenne, chargement, erreur, recharger } = useSommeil()

  if (!nuit) {
    return (
      <div className="ecran sommeil">
        <TitrePage surtitre="Suivi" titre="Sommeil" />
        {chargement ? <p role="status">Chargement des nuits…</p> : erreur ? (
          <EtatVide icone={ICONES.info} titre="Chargement impossible"
            action={<button className="bouton secondaire" onClick={recharger}>Réessayer</button>}>{erreur}</EtatVide>
        ) : <EtatVide icone={ICONES.sommeil} titre="Aucune nuit reçue"
            action={<LienFleche to="/montre">Synchroniser la montre</LienFleche>}>
          Portez votre montre la nuit : vos horaires, votre fréquence cardiaque et vos phases de sommeil
          apparaîtront ici après la synchronisation.
        </EtatVide>}
      </div>
    )
  }

  const recentes = nuits.slice(-NUITS_BOUTONS)
  const options = recentes.some((n) => n.id === nuit.id) ? recentes : [nuit, ...recentes.slice(1)]
  const part = (secondes: number) => `${nombre((secondes / nuit.tempsAuLitS) * 100, 0)} % du temps au lit`
  const phases = [
    { nom: 'Sommeil léger', duree: nuit.dureeLegerS, classe: 'leger' },
    { nom: 'Sommeil profond', duree: nuit.dureeProfondS, classe: 'profond' },
    { nom: 'Sommeil paradoxal', duree: nuit.dureeParadoxalS, classe: 'paradoxal' },
    { nom: 'Éveil', duree: nuit.dureeEveilS, classe: 'eveil' },
  ]

  return (
    <div className="ecran sommeil">
      <TitrePage
        surtitre="Suivi"
        titre="Sommeil"
      >
        Vos nuits, mesurées par la montre puis analysées : horaires, durée, phases et fréquence cardiaque.
      </TitrePage>

      {erreur && <p className="alerte" role="alert">{erreur}</p>}

      <div className="sommeil-barre">
        <Segments
          libelle="Nuit affichée"
          options={options.map((n) => ({ valeur: n.id, nom: libelleNuit(n) }))}
          valeur={nuit.id}
          onChange={choisirNuit}
        />
      </div>

      <section className="sommeil-bande" aria-label={libelleNuit(nuit)}>
        <dl className="indicateurs">
          <Indicateur nom="Durée de sommeil" valeur={dureeNuit(nuit.dureeSommeilS)} />
          <Indicateur nom="Coucher" valeur={heureNuit(formatHeure(nuit.coucher))} />
          <Indicateur nom="Lever" valeur={heureNuit(formatHeure(nuit.lever))} />
          <Indicateur nom="FC moyenne" valeur={`${nombre(nuit.fcMoyenne)} bpm`} />
          <Indicateur nom="Efficacité du sommeil" valeur={`${nombre(nuit.efficaciteSommeilPct)} %`} />
        </dl>
      </section>

      <div className="sommeil-grille">
        <Panneau titre="Fréquence cardiaque nocturne">
          <dl className="indicateurs">
            <Indicateur nom="Minimum" valeur={`${nombre(nuit.fcMin)} bpm`} />
            <Indicateur nom="Moyenne" valeur={`${nombre(nuit.fcMoyenne)} bpm`} />
            <Indicateur nom="Maximum" valeur={`${nombre(nuit.fcMax)} bpm`} />
          </dl>
        </Panneau>
        <Panneau titre="Réveils et repos">
          <dl className="indicateurs">
            <Indicateur nom="Réveils" valeur={String(nuit.reveilsNb)} />
            <Indicateur nom="Endormissement" valeur={dureeNuit(nuit.latenceEndormissementS)} />
            <Indicateur nom="Éveil nocturne" valeur={dureeNuit(nuit.eveilNocturneS)} />
            <Indicateur nom="Temps au lit" valeur={dureeNuit(nuit.tempsAuLitS)} />
          </dl>
        </Panneau>
      </div>

      <Panneau titre="Phases du sommeil">
        {/* une barre proportionnelle au temps passé dans chaque phase */}
        <div className="sommeil-phases" aria-hidden="true">
          {phases.filter((p) => p.duree > 0).map((p) => (
            <i key={p.classe} className={p.classe} style={{ flexGrow: p.duree }} title={`${p.nom} : ${dureeNuit(p.duree)}`} />
          ))}
        </div>
        <dl className="indicateurs sommeil-phases-chiffres">
          {phases.map((p) => (
            <Indicateur key={p.classe} nom={p.nom} valeur={dureeNuit(p.duree)}
              ecart={{ sens: 'stable', texte: part(p.duree) }} />
          ))}
        </dl>
        <p className="sommeil-note">
          Phases estimées par l'analyse à partir du mouvement et de la fréquence cardiaque : une indication,
          pas un diagnostic médical.
        </p>
      </Panneau>

      <GraphiquesNuit id={nuit.id} />

      <Panneau titre="Horaires et régularité">
        <dl className="sommeil-regularite">
          <div>
            <dt>Durée moyenne</dt>
            <dd>{dureeMoyenne === null ? '–' : formatDuree(dureeMoyenne)}</dd>
          </div>
          <div>
            <dt>Écart d'heure de coucher</dt>
            <dd>{ecartCoucher === null ? '–' : formatDuree(ecartCoucher)}</dd>
          </div>
          <div>
            <dt>Nuits enregistrées</dt>
            <dd>{nuits.length}</dd>
          </div>
        </dl>

        {/* une barre par nuit, du coucher au lever, sur un axe de 20 h à 10 h */}
        <div className="sommeil-horaires" role="list">
          {recentes.map((n) => (
            <div key={n.id} role="listitem" className={n.id === nuit.id ? 'choisie' : undefined}>
              <span className="sommeil-horaires-nuit">{libelleNuit(n)}</span>
              <span className="sommeil-horaires-piste">
                <i
                  style={{
                    left: `${Math.max(0, ((minutesDepuisMidi(n.coucher) - AXE_DEBUT) / AXE_DUREE) * 100)}%`,
                    width: `${Math.min(100, (n.tempsAuLitS / 60 / AXE_DUREE) * 100)}%`,
                  }}
                  title={`${formatHeure(n.coucher)} – ${formatHeure(n.lever)}`}
                />
              </span>
              <span className="visuellement-cache">
                {formatHeure(n.coucher)} – {formatHeure(n.lever)}
              </span>
            </div>
          ))}
          <div className="sommeil-horaires-axe" aria-hidden="true">
            <span />
            <span className="sommeil-horaires-piste">
              {HEURES_AXE.map((h, i) => (
                <small key={h} style={{ left: `${(i * 2 * 60 * 100) / AXE_DUREE}%` }}>
                  {h} h
                </small>
              ))}
            </span>
          </div>
        </div>
      </Panneau>

      <GraphiquesNuits nbNuits={nuits.length} />

      <Panneau titre="Historique des nuits">
        <div className="sommeil-tableau">
          <table className="tableau-donnees">
            <thead>
              <tr>
                <th scope="col">Nuit</th>
                <th scope="col">Coucher</th>
                <th scope="col">Lever</th>
                <th scope="col" className="nombre">Durée</th>
                <th scope="col" className="nombre">Efficacité</th>
                <th scope="col" className="nombre">FC moy.</th>
                <th scope="col" className="nombre">FC min.</th>
                <th scope="col" className="nombre">Réveils</th>
              </tr>
            </thead>
            <tbody>
              {[...nuits].reverse().map((n) => (
                <tr key={n.id} className={n.id === nuit.id ? 'choisie' : undefined}>
                  <td>
                    <button type="button" className="sommeil-lien-nuit" aria-pressed={n.id === nuit.id}
                      onClick={() => { choisirNuit(n.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                      {libelleNuit(n)}
                    </button>
                  </td>
                  <td>{formatHeure(n.coucher)}</td>
                  <td>{formatHeure(n.lever)}</td>
                  <td className="nombre">{dureeNuit(n.dureeSommeilS)}</td>
                  <td className="nombre">{nombre(n.efficaciteSommeilPct)} %</td>
                  <td className="nombre">{nombre(n.fcMoyenne)} bpm</td>
                  <td className="nombre">{nombre(n.fcMin)} bpm</td>
                  <td className="nombre">{n.reveilsNb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panneau>

      <p className="sommeil-limites">
        <Icone trace={ICONES.info} />
        Les valeurs affichées sont celles enregistrées après analyse de chaque nuit. Les courbes ne sont
        disponibles que pour les nuits synchronisées depuis la conservation des mesures.
      </p>
    </div>
  )
}

export default Sommeil
