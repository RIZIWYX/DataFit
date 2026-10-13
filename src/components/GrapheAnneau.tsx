import '../styles/graphes.css'

type Props = {
  parts: { nom: string; couleur: string; valeur: number }[]
  unite: string // ce qu'on compte, au pluriel : « séances »
}

const RAYON = 38
const TOUR = 2 * Math.PI * RAYON
const ECART = 1.4 // petit vide entre deux parts, dans la couleur du fond

// anneau : la part de chaque catégorie dans le total, avec les chiffres à côté
function GrapheAnneau({ parts, unite }: Props) {
  const total = parts.reduce((somme, part) => somme + part.valeur, 0)
  const visibles = parts.filter((part) => part.valeur > 0)
  const ecart = visibles.length > 1 ? ECART : 0
  const pourcent = (valeur: number) => (total ? Math.round((valeur / total) * 100) : 0)

  // où commence chaque part sur le tour : la somme des parts qui la précèdent
  const arcs = visibles.map((part, i) => ({
    ...part,
    debut: visibles.slice(0, i).reduce((somme, autre) => somme + (autre.valeur / total) * TOUR, 0),
    longueur: (part.valeur / total) * TOUR,
  }))

  return (
    <figure className="graphe anneau">
      <div className="anneau-dessin">
        <svg viewBox="0 0 100 100" role="img" aria-label={`${total} ${unite} au total`}>
          <circle className="anneau-fond" cx="50" cy="50" r={RAYON} />
          {arcs.map((arc) => (
            <circle
              key={arc.nom}
              cx="50"
              cy="50"
              r={RAYON}
              stroke={arc.couleur}
              strokeDasharray={`${Math.max(arc.longueur - ecart, 0.01)} ${TOUR}`}
              strokeDashoffset={-(arc.debut + ecart / 2)}
            >
              <title>{`${arc.nom} : ${arc.valeur} ${unite} (${pourcent(arc.valeur)} %)`}</title>
            </circle>
          ))}
        </svg>
        <p>
          <strong>{total}</strong>
          {unite}
        </p>
      </div>

      <ul className="anneau-legende">
        {parts.map((part) => (
          <li key={part.nom}>
            <i style={{ background: part.couleur }} />
            <span>{part.nom}</span>
            <b>{part.valeur}</b>
            <em>{pourcent(part.valeur)} %</em>
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default GrapheAnneau
