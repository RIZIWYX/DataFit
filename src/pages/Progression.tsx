import { Link } from 'react-router'
import '../styles/progression.css'
import EntetePage from '../components/EntetePage.tsx'
import GrapheAnneau from '../components/GrapheAnneau.tsx'
import GrapheColonnes from '../components/GrapheColonnes.tsx'
import GrapheLigne from '../components/GrapheLigne.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'
import { DISCIPLINES } from '../data/paliers.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useProgression, { PERIODES } from '../hooks/useProgression.ts'
import { colonnesDesSemaines, nbSeances, seriesDesSports } from '../lib/colonnes.ts'
import { formatDuree, formatJour } from '../lib/format.ts'

// couleur de la courbe quand tous les sports sont réunis, et gris des parts mises en retrait
const COULEUR_TOTAL = '#0ba599'
const GRIS = '#c5d2cf'

function Progression() {
  const { nbSemaines, choisirPeriode, sport, choisirSport, sports, semaines, repartition } = useProgression()

  // une étiquette sur deux quand il y a beaucoup de semaines
  const pas = semaines.length > 8 ? 2 : 1

  return (
    <div className="page">
      <EntetePage titre="Votre progression" sousTitre="Comparez vos séances au fil du temps.">
        <select
          aria-label="Période affichée"
          value={nbSemaines}
          onChange={(e) => choisirPeriode(Number(e.target.value))}
        >
          {PERIODES.map((periode) => (
            <option key={periode.semaines} value={periode.semaines}>{periode.nom}</option>
          ))}
        </select>
      </EntetePage>

      <div className="progression-sports" role="group" aria-label="Sport affiché">
        <button type="button" aria-pressed={sport === 'tous'} onClick={() => choisirSport('tous')}>
          <Icone trace={ICONES.tous} />
          Tous les sports
        </button>
        {LISTE_SPORTS.map((s) => (
          <button key={s} type="button" aria-pressed={sport === s} onClick={() => choisirSport(s)}>
            <Icone trace={SPORTS[s].icone} />
            {SPORTS[s].nom}
          </button>
        ))}
      </div>

      <div className="grille-2">
        <div className="progression-colonne">
          <section className="carte">
            <h2>Régularité de pratique</h2>
            <p className="sous-titre">Nombre de séances par semaine.</p>
            <GrapheColonnes
              series={seriesDesSports(sports)}
              colonnes={colonnesDesSemaines(semaines, sports)}
              unite={nbSeances}
              entete="Semaine"
            />
          </section>

          <section className="carte">
            <h2>Temps de pratique par semaine</h2>
            <p className="sous-titre">Durée totale de vos séances, en heures.</p>
            <GrapheLigne
              points={semaines.map((semaine) => ({
                libelle: `Du ${formatJour(semaine.debut)} au ${formatJour(semaine.fin)}`,
                valeur: semaine.minutes / 60,
              }))}
              reperes={semaines
                .map((semaine, index) => ({ index, texte: formatJour(semaine.debut) }))
                .filter((repere) => (semaines.length - 1 - repere.index) % pas === 0)}
              couleur={sport === 'tous' ? COULEUR_TOTAL : SPORTS[sport].couleur}
              format={(heures) => formatDuree(Math.round(heures * 60))}
              formatAxe={(heures) => `${heures.toLocaleString('fr-FR')} h`}
              depuisZero
              marqueurs
              entetes={['Semaine', 'Durée']}
            />
          </section>
        </div>

        <div className="progression-colonne">
          <section className="carte">
            <h2>Répartition par sport</h2>
            <p className="sous-titre">Part des séances sur la période.</p>
            <GrapheAnneau
              parts={repartition.map((part) => ({
                nom: SPORTS[part.sport].nom,
                // un sport choisi : il garde sa couleur, les autres passent en gris
                couleur: sport === 'tous' || sport === part.sport ? SPORTS[part.sport].couleur : GRIS,
                valeur: part.nombre,
              }))}
              unite="séances"
            />
          </section>

          <section className="carte">
            <h2>Explorer une discipline</h2>
            <p className="sous-titre">Retrouvez vos rangs et vos paliers sur la page Sport.</p>
            <ul className="progression-disciplines">
              {DISCIPLINES.map((discipline) => (
                <li key={discipline.id}>
                  <Link to={`/sport?discipline=${discipline.id}`}>
                    {discipline.nom}
                    <span aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Progression
