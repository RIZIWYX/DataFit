import '../styles/indicateur.css'
import { ICONES } from '../data/icones.ts'
import { type Ecart } from '../lib/ecart.ts'
import Icone from './Icone.tsx'

type Props = {
  nom: string
  valeur: string // « 2 h 27 », « 6,4 km » : les unités sont écrites plus petit que les chiffres
  ecart?: Ecart // comparaison avec la période précédente
}

// un chiffre clé, à poser dans une liste <dl className="indicateurs">
function Indicateur({ nom, valeur, ecart }: Props) {
  // les morceaux impairs sont les nombres (« +12,5 », « 4:30 », « 6'09 »), les autres les unités ;
  // une valeur sans chiffre (« A ») s'affiche telle quelle
  const morceaux = /\d/.test(valeur) ? valeur.split(/([+−-]?\d+(?:[,.:']\d+)*)/) : ['', valeur, '']

  return (
    <div className="indicateur">
      <dt>{nom}</dt>
      <dd className="indicateur-valeur chiffre">
        {morceaux.map((morceau, i) =>
          i % 2 ? (
            <span key={i}>{morceau}</span>
          ) : (
            morceau.trim() && (
              <span key={i} className="unite">
                {morceau.trim()}
              </span>
            )
          ),
        )}
      </dd>
      {ecart && (
        <dd className={`indicateur-ecart ${ecart.sens}`}>
          {ecart.sens !== 'stable' && (
            <>
              <Icone trace={ecart.sens === 'hausse' ? ICONES.hausse : ICONES.baisse} />
              <span className="visuellement-cache">{ecart.sens === 'hausse' ? 'En hausse de' : 'En baisse de'}</span>
            </>
          )}
          {ecart.texte}
        </dd>
      )}
    </div>
  )
}

export default Indicateur
