import { useState } from 'react'
import { FORMATS_TEMPS, ecrireTemps, lireTemps } from '../lib/temps.ts'

interface Props {
  id: string
  valeur: string
  exemple: string // un temps réaliste pour l'épreuve, montré dans le champ ("12,5", "3:15:00")
  desactive?: boolean
  onChange: (valeur: string) => void
}

// Le seul champ de saisie d'un temps sur la page Performance (athlétisme, natation).
// On tape comme on lit un chrono : 10,85 · 4:30 · 1:25:00. Un texte qui n'est pas un temps est
// signalé sous le champ quand on le quitte ; un temps valide y est réécrit au format habituel
// ("270" devient "4:30").
function ChampTemps({ id, valeur, exemple, desactive = false, onChange }: Props) {
  // l'erreur n'apparaît qu'en quittant le champ, pas pendant qu'on tape "4:3"
  const [quitte, setQuitte] = useState(false)
  const invalide = valeur.trim() !== '' && Number.isNaN(lireTemps(valeur))
  const idErreur = `${id}-erreur`

  function quitter() {
    setQuitte(true)
    const secondes = lireTemps(valeur)
    if (!Number.isNaN(secondes) && ecrireTemps(secondes) !== valeur) onChange(ecrireTemps(secondes))
  }

  return (
    <>
      <input
        id={id}
        // "text" et pas "decimal" : le clavier numérique des téléphones n'a pas de « : »
        inputMode="text"
        autoComplete="off"
        placeholder={`ex. ${exemple}`}
        value={valeur}
        disabled={desactive}
        aria-invalid={quitte && invalide}
        aria-describedby={quitte && invalide ? idErreur : undefined}
        onChange={(e) => {
          // on recommence à taper : le message attend qu'on quitte le champ à nouveau
          setQuitte(false)
          onChange(e.target.value)
        }}
        onBlur={quitter}
      />
      {quitte && invalide && (
        <p id={idErreur} className="sport-erreur" role="alert">
          Temps non reconnu. Exemples : {FORMATS_TEMPS}.
        </p>
      )}
    </>
  )
}

export default ChampTemps
