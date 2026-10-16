import { type ReactNode, useId } from 'react'

type Props = {
  titre: string
  action?: ReactNode // lien ou bouton affiché à droite du titre
  className?: string
  children: ReactNode
}

// bloc de contenu d'une page refondue : un titre court en capitales, une action, le contenu
function Panneau({ titre, action, className, children }: Props) {
  const id = useId()

  return (
    <section className={className ? `panneau ${className}` : 'panneau'} aria-labelledby={id}>
      <header className="panneau-tete">
        <h2 id={id} className="panneau-titre">{titre}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

export default Panneau
