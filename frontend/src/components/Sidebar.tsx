import { Link, NavLink } from 'react-router'
import { ICONES } from '../data/icones.ts'
import Icone from './Icone.tsx'

const pages = [
  { to: '/dashboard', label: 'Accueil', icone: ICONES.accueil },
  { to: '/sport', label: 'Sport', icone: ICONES.sport },
  { to: '/montre', label: 'Montre', icone: ICONES.montre },
  { to: '/historique', label: 'Historique', icone: ICONES.historique },
  { to: '/progression', label: 'Progression', icone: ICONES.progression },
  { to: '/sommeil', label: 'Sommeil', icone: ICONES.sommeil },
  { to: '/profil', label: 'Mon profil', icone: ICONES.profil },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="sidebar-logo">
        <img src="/logo.jpeg" alt="DataFit" className="nav-logo" />
      </Link>

      <nav>
        {pages.map((page) => (
          <NavLink key={page.to} to={page.to}>
            <Icone trace={page.icone} />
            {page.label}
          </NavLink>
        ))}
      </nav>

      {/* pas encore de comptes : renvoie simplement à la page de connexion */}
      <Link to="/connexion" className="sidebar-deconnexion">
        <Icone trace={ICONES.deconnexion} />
        Déconnexion
      </Link>
    </aside>
  )
}

export default Sidebar
