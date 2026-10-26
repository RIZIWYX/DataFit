import { type CSSProperties, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import '../styles/landing.css'
import EnteteVitrine from '../components/EnteteVitrine.tsx'
import Icone from '../components/Icone.tsx'
import LienFleche from '../components/LienFleche.tsx'
import Orbites from '../components/Orbites.tsx'
import PiedDePage from '../components/PiedDePage.tsx'
import { ICONES } from '../data/icones.ts'
import { NOMS_RANGS, RANGS } from '../data/paliers.ts'

// les trois temps d'une séance
const ETAPES = [
  {
    titre: 'Vous vous entraînez',
    texte: 'Votre montre enregistre la séance : fréquence cardiaque, vitesse et distance, minute par minute.',
  },
  {
    titre: 'DataFit analyse',
    texte: 'À la fin de la séance, les mesures arrivent dans DataFit : allure, temps au kilomètre, effort cardiaque.',
  },
  {
    titre: 'Vous progressez',
    texte: 'Votre tableau de bord résume votre semaine, vos rangs et votre évolution, séance après séance.',
  },
]

// ce que fait l'application
const FONCTIONNALITES = [
  {
    icone: ICONES.tous,
    titre: 'Tableau de bord',
    texte: "Votre semaine en un coup d'œil : séances, temps d'entraînement, distance parcourue.",
  },
  {
    icone: ICONES.chrono,
    titre: 'Historique',
    texte: 'Toutes vos séances, filtrées par sport et par période, avec le détail de chacune.',
  },
  {
    icone: ICONES.trophee,
    titre: 'Performance',
    texte: 'Vos records par exercice, convertis en rangs de E à Z selon votre catégorie.',
  },
  {
    icone: ICONES.tendance,
    titre: 'Progression',
    texte: 'Exercice par exercice : record, rang, charge, répétitions et volume au fil des semaines.',
  },
  {
    icone: ICONES.montre,
    titre: 'Montre',
    texte: 'Les séances terminées sont récupérées depuis votre montre, sans saisie.',
  },
  {
    icone: ICONES.calendrier,
    titre: 'Programmation',
    texte: 'Retrouvez toute votre programmation dans un calendrier, séance par séance.',
  },
  {
    icone: ICONES.sommeil,
    titre: 'Sommeil',
    texte: 'Horaires, durée, régularité et fréquence cardiaque de vos nuits, mesurés par la montre.',
  },
  {
    icone: ICONES.nutrition,
    titre: 'Nutrition',
    texte:
      'Vos besoins en calories, protéines, glucides, lipides et eau, calculés selon votre objectif, face à ce que vous mangez et buvez.',
  },
]

const ENGAGEMENTS = [
  { titre: 'Rien sans votre accord.', texte: "Aucune donnée n'est collectée sans votre consentement." },
  { titre: 'Hébergées en Europe.', texte: 'Vos données restent sur des serveurs européens.' },
  {
    titre: "Pas un outil médical.",
    texte: "Les alertes comparent une séance à vos propres habitudes : ce n'est pas un diagnostic.",
  },
]

function Landing() {
  const { hash } = useLocation()

  // React Router ne fait pas défiler jusqu'à l'ancre (#rangs…) quand on arrive
  // d'une autre page : on cherche la section après l'affichage et on y va nous-mêmes.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="vitrine refonte">
      <EnteteVitrine />

      <main>
        <section className="vitrine-hero">
          <div className="hero-texte">
            {/* le logo complet, au-dessus du titre (le nom est déjà annoncé par celui de l'en-tête) */}
            <img className="hero-logo" src="/logo-complet.svg" alt="" width="1455" height="415" />
            <h1 className="hero-titre affiche">
              Au-delà
              <br />
              de vos <span className="hero-limites">limites</span>
              <span className="point">.</span>
            </h1>
            <Link to="/installer" className="bouton hero-application">
              <Icone trace={ICONES.telecharger} />
              Télécharger l'application
            </Link>
          </div>
          <Orbites />
        </section>

        <section id="fonctionnement" className="vitrine-section">
          <h2 className="titre-section affiche">
            Comment ça marche&nbsp;<span className="point">?</span>
          </h2>
          <ol className="vitrine-etapes">
            {ETAPES.map((etape, i) => (
              <li key={etape.titre}>
                <span className="etape-numero" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{etape.titre}</h3>
                <p>{etape.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="fonctionnalites" className="vitrine-section vitrine-fonctions">
          <div className="fonctions-intro">
            <p className="surtitre">Fonctionnalités</p>
            {/* une phrase par ligne */}
            <h2 className="titre-section affiche fonctions-titre">
              <span>Analysez vos séances.</span>
              <span>Mesurez vos progrès.</span>
              <span>
                Repoussez vos limites<span className="point">.</span>
              </span>
            </h2>
            <Link to="/connexion?mode=inscription" className="bouton">Créer mon compte</Link>
          </div>
          <ul className="fonctions-liste">
            {FONCTIONNALITES.map((f) => (
              <li key={f.titre}>
                <span className="fonction-icone">
                  <Icone trace={f.icone} />
                </span>
                <div>
                  <h3>{f.titre}</h3>
                  <p>{f.texte}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="rangs" className="vitrine-rangs">
          <div className="vitrine-section">
            <div className="rangs-tete">
              <div>
                <p className="surtitre">Le système de rangs</p>
                <h2 className="titre-section affiche">
                  De E à Z<span className="point">.</span>
                </h2>
              </div>
              <p>
                Pour chaque exercice, votre record devient un rang, calculé selon votre sexe et votre
                catégorie de poids. Vous savez où vous en êtes, et quel palier viser ensuite.
              </p>
            </div>

            {/* une marche par rang, de plus en plus haute ; le dernier en turquoise */}
            <ol className="echelle">
              {RANGS.map((lettre, i) => (
                <li key={lettre} className={lettre === 'Z' ? 'z' : undefined}>
                  <span className="echelle-lettre">{lettre}</span>
                  <span
                    className="echelle-marche"
                    style={{ '--hauteur': 0.12 + (i / (RANGS.length - 1)) * 0.88 } as CSSProperties}
                  />
                  <span className="echelle-nom">{NOMS_RANGS[i]}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="donnees" className="vitrine-section vitrine-donnees">
          <div>
            <p className="surtitre">Confidentialité</p>
            <h2 className="titre-section affiche">
              Vos données vous appartiennent<span className="point">.</span>
            </h2>
          </div>
          <div>
            <ul className="donnees-liste">
              {ENGAGEMENTS.map((e) => (
                <li key={e.titre}>
                  <Icone trace={ICONES.valide} />
                  <p>
                    <strong>{e.titre}</strong> {e.texte}
                  </p>
                </li>
              ))}
            </ul>
            <LienFleche to="/donnees-personnelles">Lire la politique de confidentialité</LienFleche>
          </div>
        </section>

        <section className="vitrine-appel">
          <h2 className="affiche">
            <span>À vous de jouer maintenant&nbsp;!</span>
            <span>
              DataFit mesure la suite<span className="point">.</span>
            </span>
          </h2>
          <Link to="/connexion?mode=inscription" className="bouton">
            Créer mon compte
            <Icone trace={ICONES.fleche} />
          </Link>
        </section>
      </main>

      <PiedDePage />
    </div>
  )
}

export default Landing
