import '../styles/legende-sports.css'
import { SPORTS, couleurSport, type Sport } from '../data/sports.ts'

type Props = {
  sports: Sport[]
}

// la couleur de chaque sport, en une ligne
function LegendeSports({ sports }: Props) {
  return (
    <ul className="legende-sports">
      {sports.map((sport) => (
        <li key={sport}>
          <i style={{ background: couleurSport(sport) }} />
          {SPORTS[sport].nom}
        </li>
      ))}
    </ul>
  )
}

export default LegendeSports
