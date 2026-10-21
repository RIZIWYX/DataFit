import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { ICONES } from '../data/icones.ts'
import Icone from './Icone.tsx'

type Props = {
  to: string
  children: ReactNode
}

// lien d'action discret suivi d'une flèche : « Historique → »
function LienFleche({ to, children }: Props) {
  return (
    <Link to={to} className="lien-fleche">
      {children}
      <Icone trace={ICONES.fleche} />
    </Link>
  )
}

export default LienFleche
