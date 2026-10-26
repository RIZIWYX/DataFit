import { Link } from 'react-router'
import Logo from './Logo.tsx'

interface Props {
  // sur une autre page que la page de garde, les liens du menu y ramènent ("/#rangs" et pas "#rangs")
  autrePage?: boolean
}

// En-tête de la page de garde, repris par la page de téléchargement (styles : landing.css)
function EnteteVitrine({ autrePage = false }: Props) {
  const ancre = (id: string) => (autrePage ? `/#${id}` : `#${id}`)

  return (
    <header className="vitrine-entete">
      <Link to="/" aria-label="DataFit, accueil">
        <Logo />
      </Link>
      <nav className="vitrine-menu" aria-label="Découvrir DataFit">
        <a href={ancre('fonctionnement')}>Fonctionnement</a>
        <a href={ancre('fonctionnalites')}>Fonctionnalités</a>
        <a href={ancre('rangs')}>Rangs</a>
      </nav>
      <div className="vitrine-compte">
        <Link to="/connexion" className="vitrine-connexion">Se connecter</Link>
        <Link to="/connexion?mode=inscription" className="bouton contour petit">S'inscrire</Link>
      </div>
    </header>
  )
}

export default EnteteVitrine
