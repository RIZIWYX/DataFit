import { type ReactNode } from 'react'
import Icone from './Icone.tsx'

type Props = {
  icone: string // tracé de l'icône (voir data/icones.ts)
  titre: string
  children?: ReactNode // une phrase : pourquoi c'est vide, et ce qui viendra
  action?: ReactNode
}

// absence de données : un cadre pointillé qui explique et propose la suite
function EtatVide({ icone, titre, children, action }: Props) {
  return (
    <div className="etat-vide">
      <span className="etat-vide-icone">
        <Icone trace={icone} />
      </span>
      <p className="etat-vide-titre">{titre}</p>
      {children && <p className="etat-vide-texte">{children}</p>}
      {action}
    </div>
  )
}

export default EtatVide
