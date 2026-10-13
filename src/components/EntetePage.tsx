import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { initiales, lireProfil } from '../lib/profil.ts'

type Props = {
  titre: string
  sousTitre: string
  children?: ReactNode // filtres de la page, affichés à gauche de l'avatar
}

// haut de chaque page de l'application : titre, sous-titre, filtres et avatar
function EntetePage({ titre, sousTitre, children }: Props) {
  const profil = lireProfil()
  const lettres = profil ? initiales(profil) : ''

  return (
    <header className="page-entete">
      <div>
        <h1>{titre}</h1>
        <p>{sousTitre}</p>
      </div>
      <div className="page-outils">
        {children}
        <Link to="/profil" className="avatar" aria-label="Mon profil">
          {lettres || <img src="/avatar.svg" alt="" />}
        </Link>
      </div>
    </header>
  )
}

export default EntetePage
