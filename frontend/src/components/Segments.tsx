import Icone from './Icone.tsx'

export interface OptionSegment<T> {
  valeur: T
  nom: string
  icone?: string
  compte?: number // affiché en petit après le nom
}

type Props<T> = {
  libelle: string // pour les lecteurs d'écran : « Sport affiché »
  options: OptionSegment<T>[]
  valeur: T
  onChange: (valeur: T) => void
}

// choix exclusif entre quelques options, toutes visibles : l'option choisie passe en blanc
function Segments<T extends string | number>({ libelle, options, valeur, onChange }: Props<T>) {
  return (
    <div className="segments" role="group" aria-label={libelle}>
      {options.map((option) => (
        <button
          key={option.valeur}
          type="button"
          aria-pressed={option.valeur === valeur}
          onClick={() => onChange(option.valeur)}
        >
          {option.icone && <Icone trace={option.icone} />}
          {option.nom}
          {option.compte !== undefined && <small>{option.compte}</small>}
        </button>
      ))}
    </div>
  )
}

export default Segments
