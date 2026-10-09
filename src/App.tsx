import { BrowserRouter, Route, Routes } from 'react-router'
import './styles/App.css'
import './styles/datafit.css'
import AppLayout from './components/AppLayout.tsx'
import Connexion from './pages/Connexion.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Landing from './pages/Landing.tsx'
import Profil from './pages/Profil.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* pages plein écran, sans header ni sidebar */}
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/profil" element={<Profil />} />

        {/* pages de l'application : elles partagent le header et la sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* pages pas encore codées (programmation, fitness, ...) */}
          <Route path="*" element={<p className="a-venir">Page en construction</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
