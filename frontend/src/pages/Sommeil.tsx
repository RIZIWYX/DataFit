import '../styles/sommeil.css'
import EtatVide from '../components/EtatVide.tsx'
import GrapheLigne from '../components/GrapheLigne.tsx'
import Icone from '../components/Icone.tsx'
import Indicateur from '../components/Indicateur.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useSommeil from '../hooks/useSommeil.ts'
import { formatDuree, formatHeure, formatJour } from '../lib/format.ts'
import { type Nuit, SEUIL_AGITATION, minutesDepuisMidi } from '../lib/sommeil.ts'

// les courbes de la nuit sont tracées par tranches de 5 minutes : plus lisibles qu'à la minute
const TRANCHE = 5
const parTranches = (valeurs: number[]) =>
  Array.from({ length: Math.ceil(valeurs.length / TRANCHE) }, (_, i) => {
    const tranche = valeurs.slice(i * TRANCHE, (i + 1) * TRANCHE)
    return tranche.reduce((a, b) => a + b, 0) / tranche.length
  })

// une étiquette à chaque heure pile
function reperesHeures(nuit: Nuit) {
  const decalage = (60 - nuit.coucher.getMinutes()) % 60
  const reperes = []
  for (let minute = decalage; minute < nuit.minutes; minute += 60) {
    const heure = new Date(nuit.coucher.getTime() + minute * 60_000)
    reperes.push({ index: Math.floor(minute / TRANCHE), texte: `${heure.getHours()} h` })
  }
  // une sur deux quand la nuit est longue
  return reperes.filter((_, i) => reperes.length < 8 || i % 2 === 0)
}

const libelleNuit = (nuit: Nuit) => `Nuit du ${formatJour(nuit.coucher)}`

// l'axe des horaires va de 20 h à 10 h
const AXE_DEBUT = 8 * 60 // 20 h, en minutes depuis midi
const AXE_DUREE = 14 * 60
const HEURES_AXE = [20, 22, 0, 2, 4, 6, 8, 10]

function Sommeil() {
  const { nuits, nuit, choisirNuit, ecartCoucher, dureeMoyenne } = useSommeil()

  if (!nuit) {
    return (
      <div className="ecran">
        <TitrePage surtitre="Suivi" titre="Sommeil" />
        <EtatVide icone={ICONES.sommeil} titre="Aucune nuit reçue">
          Portez votre montre la nuit : vos horaires, votre fréquence cardiaque et votre agitation
          apparaîtront ici après la synchronisation.
        </EtatVide>
      </div>
    )
  }

  const pointsHoraires = (valeurs: number[]) =>
    parTranches(valeurs).map((valeur, i) => {
      const debut = new Date(nuit.coucher.getTime() + i * TRANCHE * 60_000)
      return { libelle: `vers ${formatHeure(debut)}`, valeur }
    })

  return (
    <div className="ecran sommeil">
      <TitrePage
        surtitre="Suivi"
        titre="Sommeil"
      >
        Vos nuits, mesurées par la montre : horaires, durée, cœur et agitation.
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
          <Indicateur nom="Durée" valeur={formatDuree(nuit.minutes)} />
          <Indicateur nom="Coucher" valeur={formatHeure(nuit.coucher).replace(':', ' h ')} />
          <Indicateur nom="Lever" valeur={formatHeure(nuit.lever).replace(':', ' h ')} />
          <Indicateur nom="FC moyenne" valeur={`${nuit.fcMoyenne} bpm`} />
          <Indicateur nom="Nuit calme" valeur={`${Math.round((1 - nuit.minutesAgitees / nuit.minutes) * 100)} %`} />
        </dl>
      </section>

      <div className="sommeil-grille">
        <Panneau titre="Fréquence cardiaque nocturne">
          <GrapheLigne
            points={pointsHoraires(nuit.fc)}
            reperes={reperesHeures(nuit)}
            couleur="var(--turquoise)"
            format={(v) => `${Math.round(v)} bpm`}
            formatAxe={(v) => String(Math.round(v))}
          />
          <p className="sommeil-note">
            Moyenne par tranche de 5 minutes. La plus basse de la nuit : <strong>{nuit.fcMin} bpm</strong>.
          </p>
        </Panneau>

        <Panneau titre="Agitation">
          <GrapheLigne
            points={pointsHoraires(nuit.mouvement)}
            reperes={reperesHeures(nuit)}
            couleur="var(--blanc)"
            format={(v) => `${Math.round(v * 100)} %`}
            formatAxe={(v) => `${Math.round(v * 100)} %`}
            depuisZero
          />
          <p className="sommeil-note">
            Mouvement mesuré par la montre (0 % : immobile). Au-dessus de {Math.round(SEUIL_AGITATION * 100)} %
            sur 5 minutes, la minute compte comme agitée : <strong>{formatDuree(nuit.minutesAgitees)}</strong> cette
            nuit.
          </p>
        </Panneau>
      </div>

      <Panneau titre="Horaires et régularité">
        <dl className="sommeil-regularite">
          <div>
            <dt>Durée moyenne</dt>
            <dd>{formatDuree(dureeMoyenne)}</dd>
          </div>
          <div>
            <dt>Écart d'heure de coucher</dt>
            <dd>{formatDuree(ecartCoucher)}</dd>
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
                    width: `${(n.minutes / AXE_DUREE) * 100}%`,
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
                <th scope="col" className="nombre">Agitation</th>
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
                  <td className="nombre">{formatDuree(n.minutesAgitees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panneau>

      <p className="sommeil-limites">
        <Icone trace={ICONES.info} />
        La montre mesure la fréquence cardiaque et le mouvement. Elle ne mesure ni les phases de sommeil,
        ni l'oxygène du sang : DataFit ne les affiche donc pas.
      </p>
    </div>
  )
}

export default Sommeil
