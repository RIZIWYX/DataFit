import { useState } from 'react'
import { useNuitsMontre } from './useResultatsMontre.ts'
import { minutesDepuisMidi } from '../lib/sommeil.ts'

export default function useSommeil() {
  const { nuits: resultats, ...etat } = useNuitsMontre()
  const liste = resultats.map((n) => ({
    ...n, id: String(n.id), coucher: new Date(n.heureCoucher), lever: new Date(n.heureReveil),
    minutes: n.dureeSommeilS / 60,
  }))
  const [choisie, setChoisie] = useState('')
  const heures = liste.map((n) => minutesDepuisMidi(n.coucher))
  return {
    ...etat, nuits: liste,
    nuit: liste.find((n) => n.id === choisie) ?? liste.at(-1),
    choisirNuit: setChoisie,
    ecartCoucher: heures.length > 1 ? Math.max(...heures) - Math.min(...heures) : null,
    dureeMoyenne: liste.length ? liste.reduce((s, n) => s + n.minutes, 0) / liste.length : null,
  }
}
