import { Link } from 'react-router'
import '../styles/pied-de-page.css'
import Logo from './Logo.tsx'

// lue une fois, au chargement du site (et pas à chaque affichage)
const ANNEE = new Date().getFullYear()

// Pied de page commun à la page de garde et aux pages légales.
// Les liens « Découvrir » visent des sections de la page de garde : on écrit "/#..."
// (et pas "#...") pour qu'ils marchent aussi depuis /cgu ou /donnees-personnelles.
// C'est la page de garde qui fait défiler jusqu'à la section (voir Landing.tsx).
function PiedDePage() {
  return (
    <footer className="pied refonte">
      <div className="pied-colonnes">
        <div className="pied-marque">
          <Link to="/" aria-label="DataFit, accueil">
            <Logo />
          </Link>
          <p>
            DataFit analyse vos séances de sport et vous aide à progresser : historique, rangs par
            exercice et suivi de votre activité.
          </p>
        </div>

        <nav aria-label="Découvrir DataFit">
          <h3>Découvrir</h3>
          <ul>
            <li><Link to="/#fonctionnement">Comment ça marche</Link></li>
            <li><Link to="/#fonctionnalites">Fonctionnalités</Link></li>
            <li><Link to="/#rangs">Le système de rangs</Link></li>
          </ul>
        </nav>

        <nav aria-label="Votre compte">
          <h3>Votre compte</h3>
          <ul>
            <li><Link to="/connexion?mode=inscription">Créer un compte</Link></li>
            <li><Link to="/connexion">Se connecter</Link></li>
          </ul>
        </nav>

        <div>
          <h3>Le projet</h3>
          <p>
            Projet de fin de licence réalisé par des étudiants de L3 Informatique et Sciences des
            données de l'Université de Rouen Normandie.
          </p>
          <Link to="/contact" className="pied-github">
            Nous contacter
          </Link>
        </div>
      </div>

      <div className="pied-bas">
        <span>© {ANNEE} DataFit</span>
        <span>Fait à Rouen</span>
        <Link to="/donnees-personnelles">Données personnelles</Link>
        <Link to="/cgu">CGU</Link>
      </div>
    </footer>
  )
}

export default PiedDePage
