type Props = {
  part: number // de 0 à 1
  libelle: string // pour les lecteurs d'écran : « Progression vers l'objectif »
  couleur?: string // blanc par défaut
}

// barre de progression fine
function Jauge({ part, libelle, couleur }: Props) {
  const pourcent = Math.round(Math.max(0, Math.min(1, part)) * 100)
  return (
    <div className="jauge" role="progressbar" aria-label={libelle} aria-valuenow={pourcent} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pourcent}%`, background: couleur }} />
    </div>
  )
}

export default Jauge
