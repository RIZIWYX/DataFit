import { Link, useParams } from 'react-router'
import '../styles/seance.css'
import EtatVide from '../components/EtatVide.tsx'
import GrapheColonnes from '../components/GrapheColonnes.tsx'
import GrapheLigne from '../components/GrapheLigne.tsx'
import Icone from '../components/Icone.tsx'
import Indicateur from '../components/Indicateur.tsx'
import LienFleche from '../components/LienFleche.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { SPORTS, couleurSport } from '../data/sports.ts'
import useSeance from '../hooks/useSeance.ts'
import {
  allureSeance,
  finSeance,
  formatAllure,
  formatDateLongue,
  formatDuree,
  formatHeure,
  formatJour,
  nombre,
  resumeSeance,
} from '../lib/format.ts'

// la fréquence cardiaque est la mesure clé de l'effort : la seule courbe en turquoise
const COULEUR_FC = 'var(--turquoise)'

// étiquettes de l'axe du temps : une toutes les 5 minutes
const reperesMinutes = (duree: number) =>
  Array.from({ length: Math.floor(duree / 5) }, (_, i) => ({ index: i * 5 + 4, texte: `${i * 5 + 5} min` }))

function Seance() {
  const { id } = useParams()
  const { seance, detail, note, ecrireNote, precedente, suivante } = useSeance(id)

  if (!seance || !detail) {
    return (
      <div className="ecran">
        <TitrePage surtitre="Historique" titre="Séance introuvable">
          Cette séance n'existe pas, ou plus.
        </TitrePage>
        <LienFleche to="/historique">Retour à l'historique</LienFleche>
      </div>
    )
  }

  const sport = SPORTS[seance.sport]
  const couleur = couleurSport(seance.sport)
  const allure = allureSeance(seance)
  const fcMax = Math.max(...detail.fc)
  // le kilomètre le plus rapide est mis en avant dans le tableau
  const meilleurKm = detail.kilometres ? Math.min(...detail.kilometres) : 0

  return (
    <div className="ecran seance">
      <Link to="/historique" className="lien-retour">
        <Icone trace={ICONES.retour} />
        Historique
      </Link>

      <TitrePage
        surtitre={`${formatDateLongue(seance.date)} · ${formatHeure(seance.date)} – ${formatHeure(finSeance(seance))}`}
        titre={sport.nom}
        actions={
          <span className="etiquette">
            <Icone trace={ICONES.montre} />
            Reçue de la montre
          </span>
        }
      />

      <dl className="indicateurs seance-chiffres">
        <Indicateur nom={seance.sport === 'musculation' ? 'Contenu' : 'Distance'} valeur={resumeSeance(seance)} />
        <Indicateur nom="Durée" valeur={formatDuree(seance.dureeMin)} />
        {allure && <Indicateur nom="Allure moyenne" valeur={allure} />}
        <Indicateur nom="FC moyenne" valeur={`${seance.fcMoyenne} bpm`} />
        <Indicateur nom="FC maximale" valeur={`${fcMax} bpm`} />
      </dl>

      <div className={detail.allure ? 'seance-grille' : 'seance-grille une'}>
        {detail.allure && (
          <Panneau titre="Allure">
            <GrapheLigne
              points={detail.allure.map((valeur, i) => ({ libelle: `${i + 1}ᵉ minute`, valeur }))}
              reperes={reperesMinutes(seance.dureeMin)}
              couleur={couleur}
              format={(valeur) => `${formatAllure(valeur)}/km`}
              formatAxe={formatAllure}
              inverse
              entetes={['Minute', 'Allure']}
            />
            <p className="seance-note">En minutes par kilomètre : plus la courbe est haute, plus l'allure est rapide.</p>
          </Panneau>
        )}
        <Panneau titre="Fréquence cardiaque">
          <GrapheLigne
            points={detail.fc.map((valeur, i) => ({ libelle: `${i + 1}ᵉ minute`, valeur }))}
            reperes={reperesMinutes(seance.dureeMin)}
            couleur={COULEUR_FC}
            format={(valeur) => `${valeur} bpm`}
            entetes={['Minute', 'Fréquence']}
          />
          <p className="seance-note">En battements par minute, mesurés chaque minute.</p>
        </Panneau>
      </div>

      {detail.vitesses && detail.kilometres && (
        <div className="seance-grille">
          <Panneau titre="Temps par kilomètre">
            <table className="tableau-donnees seance-km">
              <thead>
                <tr>
                  <th scope="col">Km</th>
                  <th scope="col">Temps</th>
                  <th scope="col" className="nombre">Vitesse</th>
                  <th scope="col"><span className="visuellement-cache">Comparaison</span></th>
                </tr>
              </thead>
              <tbody>
                {detail.kilometres.map((secondes, i) => (
                  <tr key={i} className={secondes === meilleurKm ? 'meilleur' : undefined}>
                    <td>{i + 1}</td>
                    <td>
                      {formatAllure(secondes)}
                      {secondes === meilleurKm && <span className="etiquette turquoise">Le plus rapide</span>}
                    </td>
                    <td className="nombre">{nombre(3600 / secondes)} km/h</td>
                    <td className="seance-km-barre" aria-hidden="true">
                      <i style={{ width: `${(meilleurKm / secondes) * 100}%` }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panneau>

          <Panneau titre="Répartition des vitesses">
            <GrapheColonnes
              series={[{ nom: 'Minutes', couleur }]}
              colonnes={detail.vitesses.map((tranche) => ({
                cle: tranche.libelle,
                libelle: tranche.libelle.replace(' – ', '\n'),
                detail: `${tranche.libelle} km/h`,
                valeurs: [tranche.minutes],
              }))}
              unite={(n) => `${n} min`}
              entete="Vitesse"
            />
            <p className="seance-note">Minutes passées dans chaque tranche de vitesse, en km/h.</p>
          </Panneau>
        </div>
      )}

      {seance.sport === 'musculation' && (
        <EtatVide
          icone={ICONES.trophee}
          titre="Le détail des exercices n'est pas transmis par la montre"
          action={<LienFleche to="/programmation">Planifier mes séances</LienFleche>}
        >
          Pour suivre charges, séries et répétitions, composez vos séances dans la Programmation et
          marquez-les comme faites.
        </EtatVide>
      )}

      <Panneau titre="Notes personnelles">
        <label className="visuellement-cache" htmlFor="note">Notes personnelles</label>
        <textarea
          id="note"
          className="seance-texte"
          rows={3}
          placeholder="Comment avez-vous vécu cette séance ?"
          value={note}
          onChange={(e) => ecrireNote(e.target.value)}
        />
        <p className="seance-note">Enregistrées automatiquement dans ce navigateur.</p>
      </Panneau>

      {/* passer à la séance d'avant ou d'après, sans repasser par la liste */}
      <nav className="seance-voisines" aria-label="Séances voisines">
        {precedente ? (
          <Link to={`/historique/${precedente.id}`}>
            <small>Séance précédente</small>
            <span>
              <Icone trace={ICONES.precedent} />
              {SPORTS[precedente.sport].nom} · {formatJour(precedente.date)}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {suivante && (
          <Link to={`/historique/${suivante.id}`} className="suivante">
            <small>Séance suivante</small>
            <span>
              {SPORTS[suivante.sport].nom} · {formatJour(suivante.date)}
              <Icone trace={ICONES.chevron} />
            </span>
          </Link>
        )}
      </nav>
    </div>
  )
}

export default Seance
