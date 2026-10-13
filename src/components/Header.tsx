import { Link } from 'react-router'

// utilisateur fictif en attendant la connexion
const user = { name: 'Utilisateur', avatar: '/avatar.svg' }

function Header() {
  return (
    <header className="nav">
      <Link to="/dashboard">
        <img src="/logo.jpeg" alt="DataFit" className="nav-logo" />
      </Link>
      <div className="user">
        <span className="user-name">{"bienvenue " + user.name +" !"}</span>
        <img src={user.avatar} alt="Photo de profil" className="user-avatar" />
      </div>
    </header>
  )
}

export default Header
