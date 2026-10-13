import { Link, useParams } from 'react-router'
import '../styles/seance.css'
import GrapheColonnes from '../components/GrapheColonnes.tsx'
import GrapheLigne from '../components/GrapheLigne.tsx'
import Icone from '../components/Icone.tsx'
import Tuile from '../components/Tuile.tsx'
import { ICONES } from '../data/icones.ts'
import { SPORTS } from '../data/sports.ts'
import useSeance from '../hooks/useSeance.ts'
import { allureSeance, formatAllure, formatDateLongue, formatDuree, formatHeure, nombre, resumeSeance } from '../lib/format.ts'

// couleur de la courbe de fréquence cardiaque
const COULEUR_FC = '#d55181'

// étiquettes de l'axe du temps : une toutes les 5 minutes
const reperesMinutes = (duree: number) =>
  Array.from({ length: Math.floor(duree / 5) }, (_, i) => ({ index: i * 5 + 4, texte: `${i * 5 + 5} min` }))

function Seance() {
  const { id } = useParams()
  const { seance, detail, note, ecrireNote } = useSeance(id)

  if (!seance || !detail) {
    return (
      <div className="page">
        <p className="a-venir">Cette séance est introuvable.</p>
        <Link to="/historique" className="lien">← Retour à l'historique</Link>
      </div>
    )
  }

  const sport = SPORTS[seance.sport]
  const allure = allureSeance(seance)

  const courbeFc = (
    <section className="carte">
      <h2>Fréquence cardiaque</h2>
      <p className="sous-titre">En battements par minute, minute par minute.</p>
      <GrapheLigne
        points={detail.fc.map((valeur, i) => ({ libelle: `${i + 1}ᵉ minute`, valeur }))}
        reperes={reperesMinutes(seance.dureeMin)}
        couleur={COULEUR_FC}
        format={(valeur) => `${valeur} bpm`}
        entetes={['Minute', 'Fréquence']}
      />
    </section>
  )

  return (
    <div className="page">
      <Link to="/historique" className="lien detail-retour">
        <Icone trace={ICONES.retour} />
        Retour à l'historique
      </Link>

      <header className="detail-entete">
        <span className="detail-icone">
          <Icone trace={sport.icone} />
        </span>
        <div>
          <h1>
            {sport.nom}
            <span className="pastille">Séance terminée</span>
          </h1>
          <p>{formatDateLongue(seance.date)} · Début à {formatHeure(seance.date)}</p>
        </div>
      </header>

      <div className="grille-tuiles">
        <Tuile
          icone={seance.sport === 'musculation' ? ICONES.sport : ICONES.lieu}
          nom={seance.sport === 'musculation' ? 'Contenu' : 'Distance'}
          valeur={resumeSeance(seance)}
        />
        <Tuile icone={ICONES.horloge} nom="Durée" valeur={formatDuree(seance.dureeMin)} />
        {allure && <Tuile icone={ICONES.allure} nom="Allure moyenne" valeur={allure} />}
        <Tuile icone={ICONES.coeur} nom="FC moyenne" valeur={`${seance.fcMoyenne} bpm`} />
      </div>

      {detail.allure ? (
        <div className="grille-2 egales">
          <section className="carte">
            <h2>Allure pendant la séance</h2>
            <p className="sous-titre">En minutes par kilomètre : plus la courbe est haute, plus l'allure est rapide.</p>
            <GrapheLigne
              points={detail.allure.map((valeur, i) => ({ libelle: `${i + 1}ᵉ minute`, valeur }))}
              reperes={reperesMinutes(seance.dureeMin)}
              couleur={sport.couleur}
              format={(valeur) => `${formatAllure(valeur)}/km`}
              formatAxe={formatAllure}
              inverse
              entetes={['Minute', 'Allure']}
            />
          </section>
          {courbeFc}
        </div>
      ) : (
        courbeFc
      )}

      {detail.vitesses && detail.kilometres && (
        <div className="grille-2">
          <section className="carte">
            <h2>Répartition des vitesses</h2>
            <p className="sous-titre">Temps passé dans chaque tranche de vitesse, en km/h.</p>
            <GrapheColonnes
              series={[{ nom: 'Minutes', couleur: sport.couleur }]}
              colonnes={detail.vitesses.map((tranche) => ({
                cle: tranche.libelle,
                libelle: tranche.libelle,
                detail: `${tranche.libelle} km/h`,
                valeurs: [tranche.minutes],
              }))}
              unite={(n) => `${n} min`}
              entete="Vitesse"
            />
          </section>

          <section className="carte">
            <h2>Détail par kilomètre</h2>
            <p className="sous-titre">Le temps mis pour chaque kilomètre complet.</p>
            <div className="tableau">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Kilomètre</th>
                    <th scope="col">Temps</th>
                    <th scope="col">Vitesse</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.kilometres.map((secondes, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{formatAllure(secondes)}</td>
                      <td>{nombre(3600 / secondes)} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <section className="carte detail-notes">
        <label htmlFor="note">
          <span className="tuile-icone">
            <Icone trace={ICONES.note} />
          </span>
          Notes personnelles
        </label>
        <textarea
          id="note"
          rows={2}
          placeholder="Comment avez-vous vécu cette séance ?"
          value={note}
          onChange={(e) => ecrireNote(e.target.value)}
        />
      </section>
    </div>
  )
}

export default Seance
