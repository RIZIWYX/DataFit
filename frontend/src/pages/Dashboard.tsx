
import { Link } from 'react-router'
import '../styles/dashboard.css'
import BadgeRang from '../components/BadgeRang.tsx'
import CarteSeance from '../components/CarteSeance.tsx'
import EtatVide from '../components/EtatVide.tsx'
import LienFleche from '../components/LienFleche.tsx'
import ListeSeances from '../components/ListeSeances.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { NOMS_RANGS } from '../data/paliers.ts'
import { photoDesExercices } from '../data/photos.ts'
import { SPORTS, couleurSport } from '../data/sports.ts'
import useDashboard from '../hooks/useDashboard.ts'
import useMontre from '../hooks/useMontre.ts'
import { nbSeances } from '../lib/colonnes.ts'
import {
  allureSeance,
  formatDuree,
  formatHeure,
  formatJourRelatif,
  resumeSeance,
} from '../lib/format.ts'
import { couleurSeance, depuisIso } from '../lib/programmation.ts'
import type { ResumeDiscipline } from '../lib/rangs.ts'

// L'accueil : une synthèse, pas un inventaire. Ce que j'ai fait (la semaine, la dernière séance)
// et ce qui m'attend (la prochaine séance, mon objectif) ; le détail est dans les pages dédiées.
function Dashboard() {
  const d = useDashboard()
  const montre = useMontre()
  const { aujourdHui, semaine, derniereSeance } = d

  const heure = aujourdHui.getHours()
  const salut = heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour'
  const resume = semaine.nbSeances
    ? `${nbSeances(semaine.nbSeances)} et ${formatDuree(semaine.minutes)} d'entraînement ces 7 derniers jours.`
    : "Aucune séance ces 7 derniers jours : c'est le moment de s'y remettre."

  // La prochaine séance planifiée, et celles qui la suivent
  const [prochaine, ...ensuite] = d.prochaines
  const debutProchaine = prochaine && depuisIso(prochaine.debut)
  const quand = (date: Date) =>
    `${formatJourRelatif(date, aujourdHui)} · ${formatHeure(date)}`

  // les sports classés vont du meilleur rang au moins bon : le premier et le dernier
  // (le « pire » seulement s'il y a au moins deux sports, sinon ce serait le même)
  const classes = d.rangs?.filter((discipline) => discipline.rang >= 0) ?? []
  const meilleure = classes.at(0)
  const pire = classes.length > 1 ? classes.at(-1) : undefined

  return (
    <div className="ecran accueil">
      <TitrePage
        surtitre={aujourdHui.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
        titre={d.prenom ? `${salut} ${d.prenom}` : salut}
      >
        {resume}
      </TitrePage>

      {/* Ce que j'ai fait en dernier, ce qui m'attend ensuite */}
      <div className="accueil-cartes">
        {derniereSeance ? (
          <CarteSeance
            surtitre={`Dernière séance · ${quand(derniereSeance.date)}`}
            titre={SPORTS[derniereSeance.sport].nom}
            icone={SPORTS[derniereSeance.sport].icone}
            couleur={couleurSport(derniereSeance.sport)}
            image={SPORTS[derniereSeance.sport].image}
            mesures={[
              {
                nom: derniereSeance.sport === 'musculation' ? 'Contenu' : 'Distance',
                valeur: resumeSeance(derniereSeance),
              },
              { nom: 'Durée', valeur: formatDuree(derniereSeance.dureeMin) },
              ...(allureSeance(derniereSeance)
                ? [{ nom: 'Allure', valeur: allureSeance(derniereSeance)! }]
                : []),
              { nom: 'FC moyenne', valeur: `${derniereSeance.fcMoyenne} bpm` },
            ]}
            lien={`/historique/${derniereSeance.id}`}
            action="Voir la séance"
          />
        ) : (
          <CarteSeance
            surtitre="Dernière séance"
            titre="Aucune séance"
            icone={ICONES.montre}
            couleur="var(--gris-2)"
            mesures={[]}
            lien="/montre"
            action="Synchroniser la montre"
          >
            <p className="carte-seance-detail">
              Vos séances apparaîtront ici dès que la montre les aura envoyées.
            </p>
          </CarteSeance>
        )}

        {prochaine && debutProchaine ? (
          <CarteSeance
            surtitre={`Prochaine séance · ${quand(debutProchaine)}`}
            titre={prochaine.titre}
            icone={ICONES.calendrier}
            couleur={couleurSeance(prochaine, d.programmes)}
            image={photoDesExercices(prochaine.exercices)}
            mesures={[
              { nom: 'Durée prévue', valeur: formatDuree(prochaine.dureeMin) },
              { nom: 'Exercices', valeur: String(prochaine.exercices.length) },
              {
                nom: 'Programme',
                valeur:
                  d.programmes.find((p) => p.id === prochaine.programmeId)?.nom ??
                  'Séance unique',
              },
            ]}
            lien={`/programmation?seance=${prochaine.id}`}
            action="Voir dans le calendrier"
          >
            {prochaine.exercices.length > 0 && (
              <p className="carte-seance-detail">
                {prochaine.exercices.slice(0, 4).map((ex) => ex.nom).join(' · ')}
                {prochaine.exercices.length > 4 && ' …'}
              </p>
            )}
            {ensuite.length > 0 && (
              <p className="carte-seance-detail">
                <strong>Ensuite :</strong>{' '}
                {ensuite
                  .map(
                    (s) =>
                      `${s.titre}, ${formatJourRelatif(
                        depuisIso(s.debut),
                        aujourdHui,
                      ).toLowerCase()}`,
                  )
                  .join(' · ')}
              </p>
            )}
          </CarteSeance>
        ) : (
          <CarteSeance
            surtitre="Prochaine séance"
            titre="Rien de prévu"
            icone={ICONES.calendrier}
            couleur="var(--gris-2)"
            mesures={[]}
            lien="/programmation"
            action="Planifier une séance"
          >
            <p className="carte-seance-detail">
              Créez un programme ou une séance : la prochaine à faire s'affichera ici.
            </p>
          </CarteSeance>
        )}
      </div>

      {/* Le sport où j'ai le meilleur rang, celui où j'ai le moins bon, et la montre */}
      <div className="accueil-etat">
        <Panneau titre="Meilleure performance">
          {d.rangs === null ? (
            <EtatVide
              icone={ICONES.profil}
              titre="Profil à compléter"
              action={<LienFleche to="/profil">Compléter mon profil</LienFleche>}
            >
              Votre sexe et votre poids servent à calculer vos rangs, de E à Z.
            </EtatVide>
          ) : meilleure ? (
            <RangDuSport discipline={meilleure} exercice={meilleure.exercices.at(0)} libelle="Meilleur exercice" />
          ) : (
            <EtatVide
              icone={ICONES.trophee}
              titre="Aucun record enregistré"
              action={<LienFleche to="/performance">Saisir mes records</LienFleche>}
            >
              Entrez vos meilleures performances : chaque exercice vous donnera un rang.
            </EtatVide>
          )}
        </Panneau>

        <Panneau titre="Pire performance">
          {pire ? (
            <RangDuSport discipline={pire} exercice={pire.exercices.at(-1)} libelle="Exercice le plus faible" />
          ) : (
            <EtatVide icone={ICONES.tendance} titre="Rien à comparer">
              {meilleure
                ? 'Saisissez un record dans un autre sport : celui où votre rang est le plus bas apparaîtra ici.'
                : 'Dès que deux sports auront un rang, celui où il est le plus bas apparaîtra ici.'}
            </EtatVide>
          )}
        </Panneau>

        <Panneau titre="Montre" action={<LienFleche to="/montre">Gérer</LienFleche>}>
          <div className="accueil-montre">
            <span className={montre.connectee ? 'voyant actif' : 'voyant'} />
            <span>
              <strong>{montre.connectee ? 'Connectée' : 'Déconnectée'}</strong>
              <small>{montre.nom}</small>
            </span>
          </div>
          <dl className="accueil-details">
            <div>
              <dt>Dernière synchronisation</dt>
              <dd>
                {montre.synchronisation
                  ? quand(montre.synchronisation).replace(' · ', ', ')
                  : 'Jamais'}
              </dd>
            </div>
            <div>
              <dt>Dernière nuit</dt>
              <dd>
                <Link to="/sommeil" className="accueil-sommeil">
                  {montre.derniereNuit
                    ? formatDuree(montre.derniereNuit.minutes)
                    : 'Aucune'}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Séances reçues</dt>
              <dd>{montre.nbSeances}</dd>
            </div>
          </dl>
        </Panneau>
      </div>

      {d.seancesPrecedentes.length > 0 && (
        <Panneau
          titre="Séances précédentes"
          action={<LienFleche to="/historique">Historique</LienFleche>}
        >
          <ListeSeances seances={d.seancesPrecedentes} aujourdHui={aujourdHui} />
        </Panneau>
      )}
    </div>
  )
}

// un sport et son rang (la lettre en grand, le nom du rang), puis, en dessous, un de ses exercices
function RangDuSport({
  discipline,
  exercice,
  libelle,
}: {
  discipline: ResumeDiscipline
  exercice?: ResumeDiscipline['exercices'][number]
  libelle: string // ce que l'exercice représente : « Meilleur exercice »…
}) {
  return (
    <Link to={`/performance?discipline=${discipline.id}`} className="accueil-rang">
      <span className="accueil-rang-sport">
        <BadgeRang rang={discipline.rang} />
        <span>
          <strong>{discipline.nom}</strong>
          <span className="accueil-rang-nom">{NOMS_RANGS[discipline.rang]}</span>
        </span>
      </span>
      {exercice && (
        <span className="accueil-rang-exercice">
          <span>
            <small>{libelle}</small>
            <span>{exercice.nom}</span>
          </span>
          <BadgeRang rang={exercice.rang} petit />
        </span>
      )}
    </Link>
  )
}

export default Dashboard
