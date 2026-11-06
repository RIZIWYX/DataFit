import { useState } from 'react'
import { cleDuCompte } from '../lib/compte.ts'
import { useSeancesMontre } from './useResultatsMontre.ts'

const CLE_STOCKAGE = 'datafit-notes'
function lireNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(cleDuCompte(CLE_STOCKAGE)) ?? '{}') }
  catch { return {} }
}
export default function useSeance(id: string | undefined) {
  const { seances, ...etat } = useSeancesMontre()
  const seance = seances.find((s) => s.id === id)
  const [notes, setNotes] = useState(lireNotes)
  const rang = seances.findIndex((s) => s.id === id)
  function ecrireNote(texte: string) {
    if (!seance) return
    const suivantes = { ...notes, [seance.id]: texte }
    setNotes(suivantes)
    try { localStorage.setItem(cleDuCompte(CLE_STOCKAGE), JSON.stringify(suivantes)) } catch { /* facultatif */ }
  }
  return {
    ...etat, seance, note: seance ? notes[seance.id] ?? '' : '', ecrireNote,
    precedente: rang > 0 ? seances[rang - 1] : undefined,
    suivante: rang >= 0 ? seances[rang + 1] : undefined,
  }
}
