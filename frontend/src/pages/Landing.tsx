import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import '../styles/landing.css'
import '../styles/sport.css' // couleurs des badges de rang
import Icone from '../components/Icone.tsx'
import BadgeRang from '../components/BadgeRang.tsx'
import PiedDePage from '../components/PiedDePage.tsx'
import { ICONES } from '../data/icones.ts'
import { RANGS } from '../data/paliers.ts'

// les 3 étapes du parcours d'une séance
const ETAPES = [
  {
    icone: ICONES.montre,
    titre: "Tu t'entraînes",
    texte: 'Ta montre ou ta ceinture cardio enregistre ta séance : fréquence cardiaque, vitesse, parcours.',
  },
  {
    icone: ICONES.activite,
    titre: 'DataFit analyse',
    texte: "Tes données sont envoyées à DataFit, qui calcule tes zones d'effort et ta charge d'entraînement.",
  },
  {
    icone: ICONES.progression,
    titre: 'Tu progresses',
    texte: 'Ton tableau de bord te montre où tu en es et comment tu évolues, séance après séance.',
  },
]

const FONCTIONNALITES = [
  {
    icone: ICONES.coeur,
    titre: 'Suivi des séances',
    texte: 'Fréquence cardiaque, vitesse et parcours de chaque séance, au même endroit.',
  },
  {
    icone: ICONES.allure,
    titre: "Analyse de l'effort",
    texte: "Temps passé dans chaque zone d'effort et charge d'entraînement pour doser tes semaines.",
  },
  {
    icone: ICONES.historique,
    titre: 'Historique',
    texte: 'Retrouve toutes tes séances passées et compare-les entre elles.',
  },
]

function Landing() {
  const { hash } = useLocation()

  // React Router ne fait pas défiler jusqu'à l'ancre (#features...) quand on arrive
  // d'une autre page : on cherche la section après l'affichage et on y va nous-mêmes.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="landing">
      <main>
        <section className="hero">
          <img src="/logo.jpeg" alt="DataFit" className="hero-logo" />
          <h1>Au-delà de</h1>
          <h1>vos <span>limites.</span></h1>
          <p>DataFit analyse tes séances et t'aide à progresser à ton rythme.</p>
          <div className="cta">
            <Link to="/connexion?mode=inscription" className="btn">Commencer</Link>
            <a href="#" className="btn small">Download</a>
            <a href="#features" className="btn ghost">En savoir plus</a>
          </div>
        </section>

        {/* cible du bouton « En savoir plus » */}
        <section id="features" className="features">
          <h2>Comment ça marche</h2>
          <ol className="etapes">
            {ETAPES.map((etape, i) => (
              <li key={etape.titre} className="etape">
                <span className="etape-icone"><Icone trace={etape.icone} /></span>
                <span className="etape-numero">Étape {i + 1}</span>
                <h3>{etape.titre}</h3>
                <p>{etape.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="fonctionnalites" className="features">
          <h2>Ce que DataFit fait pour toi</h2>
          <div className="grid">
            {FONCTIONNALITES.map((f) => (
              <div key={f.titre} className="card">
                <span className="etape-icone"><Icone trace={f.icone} /></span>
                <h3>{f.titre}</h3>
                <p>{f.texte}</p>
              </div>
            ))}
          </div>

          {/* carte mise en avant : ce qui différencie DataFit */}
          <div id="rangs" className="card carte-rangs">
            <div>
              <h3>Des rangs de E à Z</h3>
              <p>
                Pour chaque exercice, ta performance est convertie en rang selon ton sexe et
                ta catégorie de poids. Tu sais où tu te situes et quel palier viser ensuite.
              </p>
            </div>
            <div className="rangs-ligne">
              {RANGS.map((lettre, i) => (
                <BadgeRang key={lettre} rang={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="features">
          <div id="donnees" className="card carte-donnees">
            <span className="etape-icone"><Icone trace={ICONES.cadenas} /></span>
            <div>
              <h3>Tes données t'appartiennent</h3>
              <ul>
                <li>Rien n'est collecté sans ton accord.</li>
                <li>Tes données sont hébergées en Europe.</li>
                <li>
                  DataFit n'est pas un outil médical : les alertes comparent une séance à tes
                  propres habitudes, ce n'est pas un diagnostic.
                </li>
              </ul>
              <Link to="/donnees-personnelles" className="lien-politique">
                Lire notre politique de confidentialité →
              </Link>
            </div>
          </div>
        </section>

        <section className="features fin">
          <h2>Prêt à dépasser tes limites ?</h2>
          <Link to="/connexion?mode=inscription" className="btn">Commencer</Link>
        </section>
      </main>

      <PiedDePage />
    </div>
  )
}

export default Landing
