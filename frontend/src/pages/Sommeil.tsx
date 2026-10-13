import '../styles/sommeil.css'
import EntetePage from '../components/EntetePage.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'

const A_VENIR = [
  { nom: 'Durée des nuits', icone: ICONES.horloge },
  { nom: 'Horaires de sommeil', icone: ICONES.lit },
  { nom: 'Ressenti au réveil', icone: ICONES.sourire },
]

// le suivi du sommeil n'existe pas encore : la page annonce ce qui est prévu
function Sommeil() {
  return (
    <div className="page">
      <EntetePage titre="Votre sommeil" sousTitre="Prenez soin de votre repos, pour de meilleures journées." />

      <section className="carte sommeil-annonce">
        <span className="sommeil-lune">
          <Icone trace={ICONES.sommeil} />
        </span>
        <h2>Le suivi du sommeil arrive bientôt</h2>
        <p>Retrouvez prochainement vos nuits et observez la régularité de votre repos.</p>

        <ul>
          {A_VENIR.map((element) => (
            <li key={element.nom}>
              <span className="tuile-icone">
                <Icone trace={element.icone} />
              </span>
              {element.nom}
              <span className="pastille neutre">À venir</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Sommeil
