import { type ReactNode, useEffect } from 'react'
import { Link } from 'react-router'
import '../styles/page-legale.css'
import Icone from './Icone.tsx'
import Logo from './Logo.tsx'
import PiedDePage from './PiedDePage.tsx'
import { ICONES } from '../data/icones.ts'
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
    <div className="legal refonte">
      <header className="legal-entete">
        <Link to="/" aria-label="DataFit, page de garde">
          <Logo />
        </Link>
        <Link to="/" className="lien-retour">
          <Icone trace={ICONES.retour} />
          Retour à la page de garde
        </Link>
      </header>

      <main className="legal-contenu">
        <p className="surtitre">
          <Link to="/">DataFit</Link> · Informations légales
        </p>
        <h1 className="titre-page">
          {titre}
          <span className="point">.</span>
        </h1>
        <p className="legal-date">En vigueur depuis le {DATE_PAGES_LEGALES}</p>
        {children}
      </main>

      <PiedDePage />
    </div>
  )
}

export default PageLegale
