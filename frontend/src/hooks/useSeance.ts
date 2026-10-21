import { useMemo, useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { detailSeance } from '../lib/detail-seance.ts'

const CLE_STOCKAGE = 'datafit-notes'

// Démonstration : les notes sont gardées dans le navigateur, une par séance.
function lireNotes(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? '{}')
  } catch {
    return {}
  }
}

// logique de la page d'une séance : la retrouver, préparer ses courbes, garder la note,
// et trouver les séances voisines pour passer de l'une à l'autre
function useSeance(id: string | undefined) {
  const seance = SEANCES_DEMO.find((s) => s.id === id)
  const detail = useMemo(() => (seance ? detailSeance(seance) : null), [seance])
  const [notes, setNotes] = useState(lireNotes)

  // de la plus ancienne à la plus récente
  const chronologie = [...SEANCES_DEMO].sort((a, b) => a.date.getTime() - b.date.getTime())
  const rang = chronologie.findIndex((s) => s.id === id)

  function ecrireNote(texte: string) {
    if (!seance) return
    const suivantes = { ...notes, [seance.id]: texte }
    setNotes(suivantes)
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(suivantes))
    } catch {
      // stockage indisponible (navigation privée…) : la note ne sera pas gardée
    }
  }

  return {
    seance,
    detail,
    note: seance ? (notes[seance.id] ?? '') : '',
    ecrireNote,
    precedente: rang > 0 ? chronologie[rang - 1] : undefined,
    suivante: rang >= 0 ? chronologie[rang + 1] : undefined,
  }
}

export default useSeance
