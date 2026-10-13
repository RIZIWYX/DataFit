import { Outlet } from 'react-router'
import '../styles/layout.css'
import Header from './Header.tsx'
import Sidebar from './Sidebar.tsx'

function AppLayout() {
  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          {/* la page correspondant à l'URL s'affiche ici */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
