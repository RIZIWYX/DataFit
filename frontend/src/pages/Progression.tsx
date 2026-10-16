import '../styles/progression.css'
import BadgeRang from '../components/BadgeRang.tsx'
import EtatVide from '../components/EtatVide.tsx'
import GrapheAnneau from '../components/GrapheAnneau.tsx'
import GrapheColonnes from '../components/GrapheColonnes.tsx'
import GrapheLigne from '../components/GrapheLigne.tsx'
import Indicateur from '../components/Indicateur.tsx'
import LegendeSports from '../components/LegendeSports.tsx'
import LienFleche from '../components/LienFleche.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { DISCIPLINES, NOMS_RANGS, RANGS, type Exercice } from '../data/paliers.ts'
import { LISTE_SPORTS, SPORTS, couleurSport } from '../data/sports.ts'
import useProgression, { PERIODES } from '../hooks/useProgression.ts'
import { joursEcoules, parSemaine } from '../lib/activite.ts'
import { colonnesDesSemaines, colonnesParSemaine, nbSeances, seriesDesSports } from '../lib/colonnes.ts'
import { ecart } from '../lib/ecart.ts'
import { formatAllure, formatDuree, formatJour, nombre } from '../lib/format.ts'
import { CRITERES, type PointDate } from '../lib/progression.ts'
import { formatValeur, libelleMesure, rang, valeur } from '../lib/rangs.ts'

// cinq étiquettes de date au plus, réparties sous la courbe
function reperesDates(points: { date: Date }[]) {
  const n = points.length
  const indices = [...new Set(Array.from({ length: Math.min(5, n) }, (_, i) => Math.round((i * (n - 1)) / Math.max(1, Math.min(5, n) - 1))))]
  return indices.map((index) => ({ index, texte: formatJour(points[index].date) }))
}

const km = (n: number) => `${nombre(n)} km`

function Progression() {
  const p = useProgression()

  return (
    <div className="ecran progression">
      <TitrePage
        surtitre="Entraînement"
        titre="Progression"
        actions={
          <select aria-label="Période analysée" value={p.nbSemaines} onChange={(e) => p.choisirPeriode(Number(e.target.value))}>
            {PERIODES.map((periode) => (
              <option key={periode.semaines} value={periode.semaines}>{periode.nom}</option>
            ))}
          </select>
        }
      >
        L'évolution de vos séances, et de chaque exercice.
      </TitrePage>

      {/* le choix principal de la page : tout, ou un exercice de la page Performance */}
      <div className="progression-choix champ">
        <label htmlFor="progression-exercice">Que voulez-vous analyser ?</label>
        <select id="progression-exercice" value={p.exercice?.id ?? ''} onChange={(e) => p.choisirExercice(e.target.value)}>
          <option value="">Vue d'ensemble : toutes les séances</option>
          {p.disciplines.map((discipline) => (
            <optgroup key={discipline.id} label={discipline.nom}>
              {discipline.exercices.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nom}
                  {ex.mesures > 0 ? ` · ${ex.mesures} mesure${ex.mesures > 1 ? 's' : ''}` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {p.exercice ? <VueExercice p={p} exercice={p.exercice} /> : <VueEnsemble p={p} />}
    </div>
  )
}

type DonneesPage = ReturnType<typeof useProgression>

// ---------- vue d'ensemble : les séances reçues de la montre ----------

function VueEnsemble({ p }: { p: DonneesPage }) {
  const sportSeul = p.sport === 'course' || p.sport === 'natation' ? p.sport : null
  // sans séance sur la période d'avant, un écart ne voudrait rien dire
  const comparable = p.bilanAvant.nbSeances > 0
  // allure moyenne de chaque séance : au kilomètre (course), aux 100 m (natation)
  const allures = sportSeul
    ? p.seancesPeriode.map((seance) => ({
        date: seance.date,
        valeur: (seance.dureeMin * 60) / (sportSeul === 'course' ? seance.quantite : seance.quantite / 100),
      }))
    : []

  return (
    <>
      <div className="progression-barre">
        <Segments
          libelle="Sport affiché"
          options={[
            { valeur: 'tous' as const, nom: 'Tous les sports', icone: ICONES.tous },
            ...LISTE_SPORTS.map((s) => ({ valeur: s, nom: SPORTS[s].nom, icone: SPORTS[s].icone })),
          ]}
          valeur={p.sport}
          onChange={p.choisirSport}
        />
        <LegendeSports sports={p.sports} />
      </div>

      <section className="progression-bande" aria-label="Comparaison avec la période précédente">
        <dl className="indicateurs compacts">
          <Indicateur
            nom="Séances"
            valeur={String(p.bilan.nbSeances)}
            ecart={comparable ? ecart(p.bilan.nbSeances, p.bilanAvant.nbSeances, String) : undefined}
          />
          <Indicateur
            nom="Entraînement"
            valeur={formatDuree(p.bilan.minutes)}
            ecart={comparable ? ecart(p.bilan.minutes, p.bilanAvant.minutes, formatDuree) : undefined}
          />
          {p.sport !== 'musculation' && (
            <Indicateur
              nom="Distance"
              valeur={km(p.bilan.km)}
              ecart={comparable ? ecart(p.bilan.km, p.bilanAvant.km, km) : undefined}
            />
          )}
        </dl>
        <p className="progression-note">
          {comparable
            ? 'Écarts par rapport à la période précédente, de même longueur.'
            : 'Aucune séance sur la période précédente : pas de comparaison possible.'}
        </p>
      </section>

      <div className="progression-grille">
        <Panneau titre="Régularité · séances par semaine">
          <GrapheColonnes
            series={seriesDesSports(p.sports)}
            colonnes={colonnesDesSemaines(p.semaines, p.sports)}
            unite={nbSeances}
            entete="Semaine"
            legende={false}
          />
        </Panneau>

        <Panneau titre="Temps d'entraînement par semaine">
          <GrapheLigne
            points={p.semaines.map((semaine) => ({
              libelle: `Du ${formatJour(semaine.debut)} au ${formatJour(semaine.fin)}`,
              valeur: semaine.minutes / 60,
            }))}
            reperes={reperesDates(p.semaines.map((semaine) => ({ date: semaine.debut })))}
            couleur={p.sport === 'tous' ? 'var(--blanc)' : couleurSport(p.sport)}
            format={(heures) => formatDuree(Math.round(heures * 60))}
            formatAxe={(heures) => `${heures.toLocaleString('fr-FR')} h`}
            depuisZero
            marqueurs
            entetes={['Semaine', 'Durée']}
          />
        </Panneau>

        <Panneau titre="Répartition par sport">
          <GrapheAnneau
            parts={p.repartition.map((part) => ({
              nom: SPORTS[part.sport].nom,
              // un sport choisi : il garde sa couleur, les autres passent en retrait
              couleur: p.sport === 'tous' || p.sport === part.sport ? couleurSport(part.sport) : 'var(--noir-3)',
              valeur: part.nombre,
            }))}
            unite="séances"
          />
        </Panneau>

        {sportSeul && allures.length > 1 ? (
          <Panneau titre={`Allure moyenne par séance · ${sportSeul === 'course' ? 'au km' : 'aux 100 m'}`}>
            <GrapheLigne
              points={allures.map((a) => ({ libelle: formatJour(a.date), valeur: a.valeur }))}
              reperes={reperesDates(allures)}
              couleur={couleurSport(sportSeul)}
              format={(s) => `${formatAllure(s)}${sportSeul === 'course' ? '/km' : '/100 m'}`}
              formatAxe={formatAllure}
              inverse
              marqueurs
              entetes={['Séance', 'Allure']}
            />
          </Panneau>
        ) : (
          <Panneau titre="Aller plus loin">
            <EtatVide icone={ICONES.tendance} titre="Analysez un exercice en particulier">
              Choisissez un exercice dans le menu ci-dessus : record, rang, charge, répétitions et volume,
              selon ce qui a été mesuré. Choisissez la course ou la natation pour voir l'évolution de
              votre allure.
            </EtatVide>
          </Panneau>
        )}
      </div>
    </>
  )
}

// ---------- un exercice ----------

type PropsCourbe = {
  points: PointDate[]
  titre: string
  aide?: string
  format: (valeur: number) => string
  axe?: (valeur: number) => string
  inverse?: boolean // pour un temps : plus bas = mieux, donc en haut
  depuisZero?: boolean // pour une quantité (répétitions, volume…) : l'axe part de 0
  couleur?: string
}

// une courbe datée ; avec un seul point, une phrase plutôt qu'un graphique vide
function CourbeDatee({ points, titre, aide, format, axe, inverse, depuisZero, couleur = 'var(--blanc)' }: PropsCourbe) {
  return (
    <Panneau titre={titre}>
      {points.length > 1 ? (
        <GrapheLigne
          points={points.map((point) => ({ libelle: formatJour(point.date), valeur: point.valeur }))}
          reperes={reperesDates(points)}
          couleur={couleur}
          format={format}
          formatAxe={axe ?? format}
          inverse={inverse}
          depuisZero={depuisZero}
          marqueurs
          entetes={['Date', titre]}
        />
      ) : (
        <p className="progression-unique">
          Une seule mesure pour l'instant : <strong>{format(points[0].valeur)}</strong>, le{' '}
          {formatJour(points[0].date)}. La courbe apparaîtra dès la deuxième.
        </p>
      )}
      {aide && <p className="progression-note">{aide}</p>}
    </Panneau>
  )
}

function VueExercice({ p, exercice }: { p: DonneesPage; exercice: Exercice }) {
  const discipline = DISCIPLINES.find((d) => d.exercices.some((ex) => ex.id === exercice.id))
  const plusBasMieux = exercice.type === 'time'
  const format = (v: number) =>
    exercice.type === 'ladder' ? `Étape ${RANGS[v] ?? v}` : formatValeur(exercice, v)

  const actuel = p.records.at(-1)
  const premier = p.records[0]
  const recordActuel = p.recordActuel ? valeur(exercice, { [exercice.id]: p.recordActuel }) : NaN
  const rangActuel = p.profil && p.recordActuel ? rang(exercice, { [exercice.id]: p.recordActuel }, p.profil) : -1

  // évolution sur la période, dans le sens du progrès (un temps qui baisse est un progrès)
  let evolution = '–'
  if (actuel && premier && p.records.length > 1 && exercice.type !== 'ladder') {
    const difference = actuel.valeur - premier.valeur
    const progres = plusBasMieux ? -difference : difference
    evolution = progres === 0 ? 'Stable' : `${progres > 0 ? '+' : '−'}${formatValeur(exercice, Math.abs(difference)).replace('+', '')}`
  }

  // séances faites contenant l'exercice, semaine par semaine
  const semaines = parSemaine([], p.nbSemaines, p.aujourdHui)
  const parSemaineFaites = semaines.map(() => 0)
  for (const r of p.realisees) {
    const index = semaines.length - 1 - Math.floor(joursEcoules(r.date, p.aujourdHui) / 7)
    if (index >= 0) parSemaineFaites[index] += 1
  }

  return (
    <>
      <section className="progression-exercice" aria-label={exercice.nom}>
        <div>
          <p className="surtitre">{discipline?.nom} · {libelleMesure(exercice)}</p>
          <h2>
            {exercice.nom}
            <span className="point">.</span>
          </h2>
        </div>
        <div className="progression-exercice-actions">
          {p.profilRempli && <BadgeRang rang={rangActuel} />}
          <LienFleche to={`/performance?discipline=${discipline?.id ?? ''}`}>Mettre à jour mon record</LienFleche>
        </div>
      </section>

      <dl className="indicateurs compacts progression-bande">
        <Indicateur nom="Record actuel" valeur={Number.isNaN(recordActuel) ? '–' : format(recordActuel)} />
        <Indicateur nom="Évolution sur la période" valeur={evolution} />
        <Indicateur nom="Rang" valeur={rangActuel >= 0 ? NOMS_RANGS[rangActuel] : '–'} />
        <Indicateur nom="Séances faites" valeur={String(p.realisees.length)} />
      </dl>

      <div className="progression-grille">
        {p.records.length > 0 && (
          <CourbeDatee points={p.records} titre="Record" aide="Votre record à chaque mise à jour dans Performance." format={format} inverse={plusBasMieux} couleur="var(--turquoise)" />
        )}
        {p.rangs.length > 0 && (
          <CourbeDatee
            points={p.rangs}
            titre="Rang"
            aide="Le rang que ce record vous donnait."
            format={(v) => `${RANGS[v] ?? '–'} · ${NOMS_RANGS[v] ?? ''}`}
            axe={(v) => RANGS[v] ?? ''}
          />
        )}

        {p.criteres.map((critere) => (
          <CourbeDatee
            key={critere}
            points={p.realisees.map((r) => ({ date: r.date, valeur: r[critere] }))}
            titre={CRITERES[critere].titre}
            aide={CRITERES[critere].aide}
            depuisZero={critere !== 'chargeMax'}
            format={(v) => `${nombre(v)} ${CRITERES[critere].unite}`}
          />
        ))}

        {p.realisees.length > 0 && (
          <Panneau titre="Séances faites par semaine">
            <GrapheColonnes
              series={[{ nom: 'Séances', couleur: 'var(--blanc)' }]}
              colonnes={colonnesParSemaine(semaines, (semaine) => [parSemaineFaites[semaines.indexOf(semaine)]])}
              unite={nbSeances}
              entete="Semaine"
            />
          </Panneau>
        )}
      </div>

      {/* ce qui manque, et comment l'obtenir : jamais de graphique sans données */}
      {(p.records.length === 0 || p.realisees.length === 0) && (
        <div className="progression-manques">
          {p.records.length === 0 && (
            <EtatVide
              icone={ICONES.trophee}
              titre="Aucun record sur la période"
              action={<LienFleche to={`/performance?discipline=${discipline?.id ?? ''}`}>Saisir un record</LienFleche>}
            >
              Chaque record saisi dans Performance est daté : en le mettant à jour au fil du temps, vous
              verrez sa courbe et celle de votre rang.
            </EtatVide>
          )}
          {p.realisees.length === 0 && (
            <EtatVide
              icone={ICONES.calendrier}
              titre="Aucune séance faite avec cet exercice"
              action={<LienFleche to="/programmation">Planifier une séance</LienFleche>}
            >
              Ajoutez-le à une séance de la Programmation, puis marquez-la comme faite :{' '}
              {exercice.type === 'load' || exercice.type === 'lest'
                ? 'charge, répétitions et volume apparaîtront ici.'
                : exercice.type === 'time'
                  ? 'distance et durée apparaîtront ici.'
                  : 'vos répétitions apparaîtront ici.'}
            </EtatVide>
          )}
        </div>
      )}
    </>
  )
}

export default Progression
