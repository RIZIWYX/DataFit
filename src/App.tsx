import { BrowserRouter, Link, Route, Routes } from 'react-router'
import './styles/App.css'
import AppLayout from './components/AppLayout.tsx'
import Connexion from './pages/Connexion.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Historique from './pages/Historique.tsx'
import Landing from './pages/Landing.tsx'
import Montre from './pages/Montre.tsx'
import Profil from './pages/Profil.tsx'
import Progression from './pages/Progression.tsx'
import Seance from './pages/Seance.tsx'
import Sommeil from './pages/Sommeil.tsx'
import Sport from './pages/Sport.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pages plein écran, sans sidebar */}
        <Route path="/" element={<Landing />} />
        <Route path="/connexion" element={<Connexion />} />

        {/* pages de l'application : elles partagent la sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sport" element={<Sport />} />
          <Route path="/montre" element={<Montre />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/historique/:id" element={<Seance />} />
          <Route path="/progression" element={<Progression />} />
          <Route path="/sommeil" element={<Sommeil />} />
          <Route path="/profil" element={<Profil />} />
          {/* toute autre adresse */}
          <Route
            path="*"
            element={
              <div className="page">
                <p className="a-venir">Cette page n'existe pas.</p>
                <Link to="/dashboard" className="lien">← Retour à l'accueil</Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
