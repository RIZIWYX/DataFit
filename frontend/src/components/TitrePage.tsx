import { type ReactNode } from 'react'

type Props = {
  surtitre?: string // petite étiquette au-dessus du titre
  titre: string
  children?: ReactNode // une phrase sous le titre
  actions?: ReactNode // affichées à droite
}

// haut d'une page refondue : le titre se termine par le point turquoise de la charte
function TitrePage({ surtitre, titre, children, actions }: Props) {
  return (
    <header className="titre-page-bloc">
      <div>
        {surtitre && <p className="surtitre">{surtitre}</p>}
        <h1 className="titre-page">
          {titre}
          <span className="point">.</span>
        </h1>
        {children && <p className="titre-page-texte">{children}</p>}
      </div>
      {actions && <div className="titre-page-actions">{actions}</div>}
    </header>
  )
}

export default TitrePage
