import { Link } from 'react-router'
import '../styles/pied-de-page.css'
import { DEPOT_GITHUB } from '../data/projet.ts'

// Pied de page commun à la page d'accueil et aux pages légales.
// Les liens « Découvrir » visent des sections de la page d'accueil : on écrit "/#..."
// (et pas "#...") pour qu'ils marchent aussi depuis /cgu ou /donnees-personnelles.
// C'est la page d'accueil qui fait défiler jusqu'à la section (voir Landing.tsx).
function PiedDePage() {
  return (
    <footer className="footer">
      <div className="footer-colonnes">
        <div>
          <Link to="/">
            <img src="/logo.jpeg" alt="DataFit" className="nav-logo" />
          </Link>
          <p className="footer-description">
            DataFit analyse tes séances de sport et t'aide à progresser : suivi de l'effort,
            charge d'entraînement, historique et rangs par exercice.
          </p>
        </div>

        <nav aria-label="Découvrir DataFit">
          <h3>Découvrir</h3>
          <ul>
            <li><Link to="/#features">Comment ça marche</Link></li>
            <li><Link to="/#fonctionnalites">Fonctionnalités</Link></li>
            <li><Link to="/#rangs">Le système de rangs</Link></li>
          </ul>
        </nav>

        <nav aria-label="Ton compte">
          <h3>Ton compte</h3>
          <ul>
            <li><Link to="/connexion?mode=inscription">Créer un compte</Link></li>
            <li><Link to="/connexion">Se connecter</Link></li>
          </ul>
        </nav>

        <div>
          <h3>Le projet</h3>
          <p className="footer-description">
            Projet de fin de licence réalisé par des étudiants de L3 Informatique et
            Sciences des données de l'Université de Rouen Normandie.
          </p>
          <a href={DEPOT_GITHUB} target="_blank" rel="noopener noreferrer" className="footer-lien-github">
            Voir le code sur GitHub
          </a>
        </div>
      </div>

      <div className="footer-bas">
        <span>DataFit</span>
        <span>© {new Date().getFullYear()} Tous droits réservés</span>
        <span>Fait à Rouen</span>
        <Link to="/donnees-personnelles">Données personnelles</Link>
        <Link to="/cgu">CGU</Link>
      </div>
    </footer>
  )
}

export default PiedDePage
