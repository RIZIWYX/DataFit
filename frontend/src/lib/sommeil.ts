// Outils de la page Sommeil. Les valeurs elles-mêmes viennent de la base (table sommeil),
// calculées par l'analyse : rien n'est inventé ni recalculé ici.

// heure d'une date en minutes depuis midi : 22:30 → 630, 06:30 → 1110 (la nuit ne se coupe pas à minuit)
export const minutesDepuisMidi = (date: Date) => ((date.getHours() + 12) % 24) * 60 + date.getMinutes()

// une durée en secondes, arrondie à la minute : 18 900 → « 5 h 15 », 360 → « 6 min »
export const dureeNuit = (secondes: number) => {
  const minutes = Math.round(secondes / 60)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

// « 01:18 » → « 01 h 18 »
export const heureNuit = (heure: string) => heure.replace(':', ' h ')
