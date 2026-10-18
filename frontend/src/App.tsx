import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import './styles/App.css'
import AppLayout from './components/AppLayout.tsx'
import Cgu from './pages/Cgu.tsx'
import Chatbot from './pages/Chatbot.tsx'
import Connexion from './pages/Connexion.tsx'
import CreationProfil from './pages/CreationProfil.tsx'
import Dashboard from './pages/Dashboard.tsx'
import DonneesPersonnelles from './pages/DonneesPersonnelles.tsx'
import Historique from './pages/Historique.tsx'
import Landing from './pages/Landing.tsx'
import Montre from './pages/Montre.tsx'
import Nutrition from './pages/Nutrition.tsx'
import PageIntrouvable from './pages/PageIntrouvable.tsx'
import Premium from './pages/Premium.tsx'
import Profil from './pages/Profil.tsx'
import Programmation from './pages/Programmation.tsx'
import Progression from './pages/Progression.tsx'
import Seance from './pages/Seance.tsx'
import Sommeil from './pages/Sommeil.tsx'
import Sport from './pages/Sport.tsx'

// l'onglet « Sport » s'appelle désormais « Performance » : les anciens liens
// (/sport?discipline=nat…) mènent à la nouvelle adresse, paramètres compris
function VersPerformance() {
  const { search } = useLocation()
  return <Navigate to={`/performance${search}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pages plein écran, sans navigation */}
        <Route path="/" element={<Landing />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/creation-profil" element={<CreationProfil />} />
        <Route path="/donnees-personnelles" element={<DonneesPersonnelles />} />
        <Route path="/cgu" element={<Cgu />} />

        {/* pages de l'application : elles partagent la navigation */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/performance" element={<Sport />} />
          <Route path="/sport" element={<VersPerformance />} />
          <Route path="/programmation" element={<Programmation />} />
          <Route path="/montre" element={<Montre />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/historique/:id" element={<Seance />} />
          <Route path="/progression" element={<Progression />} />
          <Route path="/sommeil" element={<Sommeil />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/profil" element={<Profil />} />
          {/* toute autre adresse */}
          <Route path="*" element={<PageIntrouvable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
