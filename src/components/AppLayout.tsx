import { Outlet } from 'react-router'
import '../styles/layout.css'
import '../styles/pages.css'
import Sidebar from './Sidebar.tsx'

function AppLayout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="app-content">
        {/* la page correspondant à l'URL s'affiche ici */}
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
