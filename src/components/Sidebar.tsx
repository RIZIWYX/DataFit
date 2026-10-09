import { Link, NavLink } from 'react-router'

const pages = [
  { to: '/dashboard', label: 'Accueil' },
  { to: '/profil', label: 'Profil' },
  { to: '/programmation', label: 'Programmation' },
  { to: '/cardio', label: 'Cardio-vasculaire' },
  { to: '/fitness', label: 'Fitness' },
  { to: '/historique', label: 'Historique' },
  { to: '/parametres', label: 'Paramètres' },
  { to: '/aide', label: 'Aide' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        {pages.map((page) => (
          <NavLink key={page.to} to={page.to}>
            {page.label}
          </NavLink>
        ))}
        {/* pas encore de comptes : renvoie à la page d'accueil du site */}
        <Link to="/">Déconnexion</Link>
      </nav>
    </aside>
  )
}

export default Sidebar
