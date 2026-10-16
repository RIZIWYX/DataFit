import { Link } from 'react-router'
import '../styles/dashboard.css'
import BadgeRang from '../components/BadgeRang.tsx'
import BandeJours from '../components/BandeJours.tsx'
import CarteSeance from '../components/CarteSeance.tsx'
import EtatVide from '../components/EtatVide.tsx'
import Indicateur from '../components/Indicateur.tsx'
import Jauge from '../components/Jauge.tsx'
import LienFleche from '../components/LienFleche.tsx'
import ListeSeances from '../components/ListeSeances.tsx'
import Panneau from '../components/Panneau.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { photoDesExercices } from '../data/photos.ts'
import { SPORTS, couleurSport } from '../data/sports.ts'
import useDashboard from '../hooks/useDashboard.ts'
import useMontre from '../hooks/useMontre.ts'
import { nbSeances } from '../lib/colonnes.ts'
import { ecart } from '../lib/ecart.ts'
import { allureSeance, formatDuree, formatHeure, formatJourRelatif, nombre, resumeSeance } from '../lib/format.ts'
import { titreObjectif } from '../lib/objectifs.ts'
import { couleurSeance, depuisIso } from '../lib/programmation.ts'

const km = (n: number) => `${nombre(n)} km`

// L'accueil : une synthèse, pas un inventaire. Ce que j'ai fait (la semaine, la dernière séance)
// et ce qui m'attend (la prochaine séance, mes objectifs) ; le détail est dans les pages dédiées.
function Dashboard() {
  const d = useDashboard()
  const montre = useMontre()
  const { aujourdHui, semaine, semainePrecedente, derniereSeance } = d

  const heure = aujourdHui.getHours()
  const salut = heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour'
  const resume = semaine.nbSeances
    ? `${nbSeances(semaine.nbSeances)} et ${formatDuree(semaine.minutes)} d'entraînement ces 7 derniers jours.`
    : "Aucune séance ces 7 derniers jours : c'est le moment de s'y remettre."

  // la prochaine séance planifiée, et celles qui la suivent
  const [prochaine, ...ensuite] = d.prochaines
  const debutProchaine = prochaine && depuisIso(prochaine.debut)
  const quand = (date: Date) => `${formatJourRelatif(date, aujourdHui)} · ${formatHeure(date)}`

  return (
    <div className="ecran accueil">
      <TitrePage
        surtitre={aujourdHui.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        titre={d.prenom ? `${salut} ${d.prenom}` : salut}
      >
        {resume}
      </TitrePage>

      {/* la semaine : chiffres clés et bande des jours, directement sur le fond */}
      <section className="accueil-semaine" aria-labelledby="accueil-semaine-titre">
        <div>
          <h2 id="accueil-semaine-titre" className="surtitre">7 derniers jours</h2>
          <dl className="indicateurs">
            <Indicateur
              nom="Séances"
              valeur={String(semaine.nbSeances)}
              ecart={ecart(semaine.nbSeances, semainePrecedente.nbSeances, String)}
            />
            <Indicateur
              nom="Entraînement"
              valeur={formatDuree(semaine.minutes)}
              ecart={ecart(semaine.minutes, semainePrecedente.minutes, formatDuree)}
            />
            <Indicateur nom="Distance" valeur={km(semaine.km)} ecart={ecart(semaine.km, semainePrecedente.km, km)} />
          </dl>
          <p className="accueil-note">
            Comparé aux 7 jours précédents. La distance réunit course et natation.
          </p>
        </div>
        <BandeJours jours={d.jours} />
      </section>

      {/* côte à côte : ce que j'ai fait en dernier, ce qui m'attend ensuite */}
      <div className="accueil-cartes">
        {derniereSeance ? (
          <CarteSeance
            surtitre={`Dernière séance · ${quand(derniereSeance.date)}`}
            titre={SPORTS[derniereSeance.sport].nom}
            icone={SPORTS[derniereSeance.sport].icone}
            couleur={couleurSport(derniereSeance.sport)}
            image={SPORTS[derniereSeance.sport].image}
            mesures={[
              { nom: derniereSeance.sport === 'musculation' ? 'Contenu' : 'Distance', valeur: resumeSeance(derniereSeance) },
              { nom: 'Durée', valeur: formatDuree(derniereSeance.dureeMin) },
              ...(allureSeance(derniereSeance) ? [{ nom: 'Allure', valeur: allureSeance(derniereSeance)! }] : []),
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
            <p className="carte-seance-detail">Vos séances apparaîtront ici dès que la montre les aura envoyées.</p>
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
              { nom: 'Programme', valeur: d.programmes.find((p) => p.id === prochaine.programmeId)?.nom ?? 'Séance unique' },
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
                {ensuite.map((s) => `${s.titre}, ${formatJourRelatif(depuisIso(s.debut), aujourdHui).toLowerCase()}`).join(' · ')}
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

      {/* l'état du moment : objectifs, rangs, montre ; trois panneaux de même hauteur */}
      <div className="accueil-etat">
        <Panneau titre="Objectifs" action={d.objectifs.length > 0 && <LienFleche to="/profil">Profil</LienFleche>}>
          {d.objectifs.length ? (
            <ul className="accueil-objectifs">
              {d.objectifs.slice(0, 3).map(({ objectif, avancement }) => (
                <li key={objectif.id}>
                  <strong>{titreObjectif(objectif)}</strong>
                  {avancement ? (
                    <>
                      <Jauge
                        part={avancement.part}
                        libelle={`Avancement : ${titreObjectif(objectif)}`}
                        couleur={avancement.part >= 1 ? 'var(--turquoise)' : undefined}
                      />
                      <small>
                        <b>{Math.round(avancement.part * 100)} %</b> · {avancement.actuel}
                      </small>
                    </>
                  ) : (
                    <small>Pas encore mesurable</small>
                  )}
                </li>
              ))}
            </ul>
          ) : d.objectifTexte ? (
            <p className="accueil-objectif-texte">{d.objectifTexte}</p>
          ) : (
            <EtatVide icone={ICONES.cible} titre="Aucun objectif en cours" action={<LienFleche to="/profil">Fixer un objectif</LienFleche>}>
              Un temps sur 5 km, une charge au squat, un nombre de séances par semaine…
            </EtatVide>
          )}
        </Panneau>

        <Panneau
          titre="Performance"
          action={d.rangs?.length ? <LienFleche to="/performance">Tous les rangs</LienFleche> : undefined}
        >
          {d.rangs === null ? (
            <EtatVide icone={ICONES.profil} titre="Profil à compléter" action={<LienFleche to="/profil">Compléter mon profil</LienFleche>}>
              Votre sexe et votre poids servent à calculer vos rangs, de E à Z.
            </EtatVide>
          ) : d.rangs.length === 0 ? (
            <EtatVide icone={ICONES.trophee} titre="Aucun record enregistré" action={<LienFleche to="/performance">Saisir mes records</LienFleche>}>
              Entrez vos meilleures performances : chaque exercice vous donnera un rang.
            </EtatVide>
          ) : (
            <ul className="liste-lignes liste-rangs">
              {d.rangs.slice(0, 4).map((discipline) => (
                <li key={discipline.id}>
                  <Link to={`/performance?discipline=${discipline.id}`}>
                    <span>
                      <strong>{discipline.nom}</strong>
                      <small>
                        {discipline.remplis} / {discipline.total} exercice{discipline.total > 1 ? 's' : ''}
                      </small>
                    </span>
                    <BadgeRang rang={discipline.rang} petit />
                  </Link>
                </li>
              ))}
            </ul>
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
              <dd>{montre.synchronisation ? quand(montre.synchronisation).replace(' · ', ', ') : 'Jamais'}</dd>
            </div>
            <div>
              <dt>Dernière nuit</dt>
              <dd>
                <Link to="/sommeil" className="accueil-sommeil">
                  {montre.derniereNuit ? formatDuree(montre.derniereNuit.minutes) : 'Aucune'}
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
        <Panneau titre="Séances précédentes" action={<LienFleche to="/historique">Historique</LienFleche>}>
          <ListeSeances seances={d.seancesPrecedentes} aujourdHui={aujourdHui} />
        </Panneau>
      )}
    </div>
  )
}

export default Dashboard
