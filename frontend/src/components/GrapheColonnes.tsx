import { type CSSProperties } from 'react'
import '../styles/graphes.css'
import { graduations } from '../lib/activite.ts'

export interface Serie {
  nom: string
  couleur: string
}

export interface Colonne {
  cle: string
  libelle: string // sous la colonne ; « \n » fait passer à la ligne
  detail: string // en clair, pour la bulle et le tableau : « Du 7 au 13 oct. »
  valeurs: number[] // une valeur par série, dans le même ordre que les séries
}

type Props = {
  series: Serie[]
  colonnes: Colonne[]
  unite: (n: number) => string // la valeur avec son unité : « 3 séances »
  entete: string // titre de la première colonne du tableau
  legende?: boolean // false : la légende est affichée ailleurs sur la page
}

const somme = (valeurs: number[]) => valeurs.reduce((a, b) => a + b, 0)

// colonnes fines, empilées quand il y a plusieurs séries (un étage par série)
function GrapheColonnes({ series, colonnes, unite, entete, legende = true }: Props) {
  const axe = graduations(0, Math.max(1, ...colonnes.map((colonne) => somme(colonne.valeurs))), 1)
  const maximum = axe[0]
  const plusieurs = series.length > 1

  return (
    <figure className="graphe">
      {/* une seule série : le titre de la carte dit déjà ce qui est tracé */}
      {plusieurs && legende && (
        <ul className="graphe-legende">
          {series.map((serie) => (
            <li key={serie.nom}>
              <i style={{ background: serie.couleur }} />
              {serie.nom}
            </li>
          ))}
        </ul>
      )}

      <div className="graphe-plan">
        <div className="graphe-axe" aria-hidden="true">
          {axe.map((valeur) => (
            <span key={valeur}>{valeur}</span>
          ))}
        </div>

        {/* --pas : nombre d'intervalles de l'axe, pour espacer les lignes du quadrillage */}
        <div className="graphe-zone" style={{ '--pas': axe.length - 1 } as CSSProperties}>
          {colonnes.map((colonne) => {
            const total = somme(colonne.valeurs)
            return (
              <div
                key={colonne.cle}
                className="graphe-colonne"
                tabIndex={0}
                aria-label={`${colonne.detail} : ${unite(total)}`}
                style={{ '--hauteur': `${(total / maximum) * 100}%` } as CSSProperties}
              >
                {total > 0 && <span className="graphe-total">{total}</span>}
                <div className="graphe-pile">
                  {series.map(
                    (serie, i) =>
                      colonne.valeurs[i] > 0 && (
                        <i key={serie.nom} style={{ flexGrow: colonne.valeurs[i], background: serie.couleur }} />
                      ),
                  )}
                </div>

                <div className="graphe-bulle" role="tooltip">
                  <strong>{plusieurs ? colonne.detail : unite(total)}</strong>
                  {plusieurs
                    ? series.map((serie, i) => (
                        <span key={serie.nom}>
                          <i style={{ background: serie.couleur }} />
                          <b>{colonne.valeurs[i]}</b>
                          {serie.nom}
                        </span>
                      ))
                    : <span>{colonne.detail}</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div />
        <div className="graphe-libelles" aria-hidden="true">
          {colonnes.map((colonne) => (
            <span key={colonne.cle}>{colonne.libelle}</span>
          ))}
        </div>
      </div>

      {/* les mêmes chiffres en tableau, lisibles sans survoler le graphique */}
      <details className="graphe-chiffres">
        <summary>Voir les chiffres</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{entete}</th>
              {series.map((serie) => (
                <th key={serie.nom} scope="col">{serie.nom}</th>
              ))}
              {plusieurs && <th scope="col">Total</th>}
            </tr>
          </thead>
          <tbody>
            {colonnes.map((colonne) => (
              <tr key={colonne.cle}>
                <th scope="row">{colonne.detail}</th>
                {colonne.valeurs.map((valeur, i) => (
                  <td key={series[i].nom}>{valeur}</td>
                ))}
                {plusieurs && <td>{somme(colonne.valeurs)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}

export default GrapheColonnes
