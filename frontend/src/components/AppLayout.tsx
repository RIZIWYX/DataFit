import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import '../styles/layout.css'
import useConsentementSante from '../hooks/useConsentementSante.ts'
import { lireProfil, profilComplet } from '../lib/profil.ts'
import ConsentementSante from './ConsentementSante.tsx'
import Navigation from './Navigation.tsx'

// le cadre de toutes les pages de l'application : la navigation, et la zone de page à côté
function AppLayout() {
  const { pathname } = useLocation()
  const zone = useRef<HTMLElement>(null)
  const consentement = useConsentementSante()

  // c'est la zone de page qui défile (la navigation reste en place) :
  // en changeant de page, on la remet en haut
  useEffect(() => {
    zone.current?.scrollTo(0, 0)
  }, [pathname])

  // l'application reste fermée tant que le profil n'est pas complet
  if (!profilComplet(lireProfil())) return <Navigate to="/creation-profil" replace />

  // et tant que le consentement aux données de santé n'est pas donné (RGPD, article 9) :
  // la vérification auprès du serveur est en cours, ou l'écran de consentement s'affiche
  if (consentement.statut !== 'donne') return <ConsentementSante {...consentement} />

  return (
    <div className="app">
      <Navigation />
      <main ref={zone} className="app-content refonte">
        {/* la page correspondant à l'URL s'affiche ici */}
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
