import '../styles/sommeil.css'
import EtatVide from '../components/EtatVide.tsx'
import Icone from '../components/Icone.tsx'
import Indicateur from '../components/Indicateur.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useSommeil from '../hooks/useSommeil.ts'
import { formatDuree, formatHeure, formatJour } from '../lib/format.ts'
import { minutesDepuisMidi } from '../lib/sommeil.ts'
import { formatDureeSecondes } from '../lib/cardio.ts'

const libelleNuit = (nuit: { coucher: Date }) => `Nuit du ${formatJour(nuit.coucher)}`

// l'axe des horaires va de 20 h à 10 h
const AXE_DEBUT = 8 * 60 // 20 h, en minutes depuis midi
const AXE_DUREE = 14 * 60
const HEURES_AXE = [20, 22, 0, 2, 4, 6, 8, 10]

function Sommeil() {
  const { nuits, nuit, choisirNuit, ecartCoucher, dureeMoyenne, chargement, erreur, recharger } = useSommeil()

  if (!nuit) {
    return (
      <div className="ecran">
        <TitrePage surtitre="Suivi" titre="Sommeil" />
        {chargement ? <p role="status">Chargement des nuits…</p> : erreur ? (
          <EtatVide icone={ICONES.info} titre="Chargement impossible"
            action={<button className="bouton secondaire" onClick={recharger}>Réessayer</button>}>{erreur}</EtatVide>
        ) : <EtatVide icone={ICONES.sommeil} titre="Aucune nuit reçue">
          Portez votre montre la nuit : vos horaires, votre fréquence cardiaque et votre agitation
          apparaîtront ici après la synchronisation.
        </EtatVide>}
      </div>
    )
  }

  return (
    <div className="ecran sommeil">
      <TitrePage
        surtitre="Suivi"
        titre="Sommeil"
      >
        Vos nuits, mesurées par la montre : horaires, durée et fréquence cardiaque.
      </TitrePage>

      <div className="sommeil-barre">
        <Segments
          libelle="Nuit affichée"
          options={nuits.map((n) => ({ valeur: n.id, nom: libelleNuit(n) }))}
          valeur={nuit.id}
          onChange={choisirNuit}
        />
      </div>

      <section className="sommeil-bande" aria-label={libelleNuit(nuit)}>
        <dl className="indicateurs">
          <Indicateur nom="Durée" valeur={formatDureeSecondes(nuit.dureeSommeilS)} />
          <Indicateur nom="Coucher" valeur={formatHeure(nuit.coucher).replace(':', ' h ')} />
          <Indicateur nom="Lever" valeur={formatHeure(nuit.lever).replace(':', ' h ')} />
          <Indicateur nom="FC moyenne" valeur={`${nuit.fcMoyenne} bpm`} />
          <Indicateur nom="Efficacité du sommeil" valeur={`${nuit.efficaciteSommeilPct} %`} />
        </dl>
      </section>

      <div className="sommeil-grille">
        <Panneau titre="Fréquence cardiaque nocturne">
          <dl className="indicateurs">
            <Indicateur nom="Minimum" valeur={`${nuit.fcMin} bpm`} />
            <Indicateur nom="Moyenne" valeur={`${nuit.fcMoyenne} bpm`} />
            <Indicateur nom="Maximum" valeur={`${nuit.fcMax} bpm`} />
          </dl>
        </Panneau>
        <Panneau titre="Réveils et repos">
          <dl className="indicateurs">
            <Indicateur nom="Réveils" valeur={String(nuit.reveilsNb)} />
            <Indicateur nom="Endormissement" valeur={formatDureeSecondes(nuit.latenceEndormissementS)} />
            <Indicateur nom="Éveil nocturne" valeur={formatDureeSecondes(nuit.eveilNocturneS)} />
            <Indicateur nom="Temps au lit" valeur={formatDureeSecondes(nuit.tempsAuLitS)} />
          </dl>
        </Panneau>
      </div>

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
        </dl>

        {/* une barre par nuit, du coucher au lever, sur un axe de 20 h à 10 h */}
        <div className="sommeil-horaires" role="list">
          {nuits.map((n) => (
            <div key={n.id} role="listitem" className={n.id === nuit.id ? 'choisie' : undefined}>
              <span className="sommeil-horaires-nuit">{libelleNuit(n)}</span>
              <span className="sommeil-horaires-piste">
                <i
                  style={{
                    left: `${((minutesDepuisMidi(n.coucher) - AXE_DEBUT) / AXE_DUREE) * 100}%`,
                    width: `${(n.tempsAuLitS / 60 / AXE_DUREE) * 100}%`,
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

      <Panneau titre="Historique des nuits">
        <div className="sommeil-tableau">
          <table className="tableau-donnees">
            <thead>
              <tr>
                <th scope="col">Nuit</th>
                <th scope="col">Coucher</th>
                <th scope="col">Lever</th>
                <th scope="col" className="nombre">Durée</th>
                <th scope="col" className="nombre">FC moy.</th>
                <th scope="col" className="nombre">FC min.</th>
                <th scope="col" className="nombre">Réveils</th>
              </tr>
            </thead>
            <tbody>
              {[...nuits].reverse().map((n) => (
                <tr key={n.id}>
                  <td>{libelleNuit(n)}</td>
                  <td>{formatHeure(n.coucher)}</td>
                  <td>{formatHeure(n.lever)}</td>
                  <td className="nombre">{formatDuree(n.minutes)}</td>
                  <td className="nombre">{n.fcMoyenne} bpm</td>
                  <td className="nombre">{n.fcMin} bpm</td>
                  <td className="nombre">{n.reveilsNb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panneau>

      <p className="sommeil-limites">
        <Icone trace={ICONES.info} />
        Les résultats affichés proviennent des analyses enregistrées. Les relevés minute par minute
        ne sont pas disponibles pour tracer les courbes.
      </p>
    </div>
  )
}

export default Sommeil
