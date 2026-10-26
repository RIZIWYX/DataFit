import type { ReactNode } from 'react'
import { Link } from 'react-router'
import '../styles/connexion.css'
import Icone from './Icone.tsx'
import Logo from './Logo.tsx'
import { ICONES } from '../data/icones.ts'

interface Props {
  accroche: { titre: string; texte: string } // le message de la partie gauche, sans le point final
  titre: string // le titre du formulaire, sans le point final
  children: ReactNode
}

// Mise en page des pages à formulaire hors de l'application (connexion, mot de passe oublié,
// contact) : à gauche le logo et un message, à droite le formulaire.
function CadreFormulaire({ accroche, titre, children }: Props) {
  return (
    <div className="cnx refonte">
      <aside className="cnx-visuel">
        <Link to="/" aria-label="DataFit, page de garde">
          <Logo />
        </Link>
        <div className="cnx-accroche">
          <h2 className="affiche">
            {accroche.titre}
            <span className="point">.</span>
          </h2>
          <p>{accroche.texte}</p>
        </div>
      </aside>

      <main className="cnx-panneau">
        <section className="cnx-carte" aria-labelledby="cnx-titre">
          <Link to="/" className="lien-retour cnx-retour">
            <Icone trace={ICONES.retour} />
            Page de garde
          </Link>

          <h1 id="cnx-titre" className="titre-page">
            {titre}
            <span className="point">.</span>
          </h1>

          {children}
        </section>
      </main>
    </div>
  )
}

export default CadreFormulaire
