import { type ReactNode, useEffect } from 'react'
import { Link } from 'react-router'
import '../styles/page-legale.css'
import PiedDePage from './PiedDePage.tsx'
import { DATE_PAGES_LEGALES } from '../data/projet.ts'

interface Props {
  titre: string
  children: ReactNode
}

// Mise en page commune aux pages légales (données personnelles, CGU)
function PageLegale({ titre, children }: Props) {
  // en arrivant depuis le bas d'une autre page, on repart du haut
  // ('instant' : sinon le scroll-behavior: smooth du site anime la remontée)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="legal">
      <header className="legal-entete">
        <Link to="/">
          <img src="/logo.jpeg" alt="DataFit" className="nav-logo" />
        </Link>
        <Link to="/" className="legal-retour">← Retour à l'accueil</Link>
      </header>

      <main className="legal-contenu">
        <p className="legal-fil">
          <Link to="/">Accueil</Link> › {titre}
        </p>
        <h1>{titre}</h1>
        <p className="legal-date">En vigueur depuis le {DATE_PAGES_LEGALES}</p>
        {children}
      </main>

      <PiedDePage />
    </div>
  )
}

export default PageLegale
