import Icone from './Icone.tsx'

type Props = {
  icone: string // tracé de l'icône (voir data/icones.ts)
  nom: string
  valeur: string
}

// une mesure mise en avant : « Distance · 5,2 km »
function Tuile({ icone, nom, valeur }: Props) {
  return (
    <div className="tuile">
      <span className="tuile-icone">
        <Icone trace={icone} />
      </span>
      <div>
        <p>{nom}</p>
        <strong>{valeur}</strong>
      </div>
    </div>
  )
}

export default Tuile
