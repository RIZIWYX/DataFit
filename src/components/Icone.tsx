type Props = {
  trace: string // tracé SVG (attribut d), dessiné sur une grille de 24 × 24
}

// icône au trait : elle prend la couleur du texte qui l'entoure (style .icone dans App.css)
function Icone({ trace }: Props) {
  return (
    <svg className="icone" viewBox="0 0 24 24" aria-hidden="true">
      <path d={trace} />
    </svg>
  )
}

export default Icone
