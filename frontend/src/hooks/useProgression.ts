import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { LISTE_SPORTS, type Sport } from '../data/sports.ts'
import { dansLaPeriode, parSemaine } from '../lib/activite.ts'

export const PERIODES = [
  { semaines: 4, nom: '4 dernières semaines' },
  { semaines: 8, nom: '8 dernières semaines' },
  { semaines: 13, nom: '3 derniers mois' },
]

// logique de la page progression : période et sport choisis, puis les séries à tracer
function useProgression() {
  const [nbSemaines, setNbSemaines] = useState(13)
  const [sport, setSport] = useState<Sport | 'tous'>('tous')
  const [aujourdHui] = useState(() => new Date())

  const periode = dansLaPeriode(SEANCES_DEMO, nbSemaines, aujourdHui)
  const retenues = sport === 'tous' ? periode : periode.filter((seance) => seance.sport === sport)

  return {
    nbSemaines,
    choisirPeriode: setNbSemaines,
    sport,
    choisirSport: setSport,
    // les sports à tracer : tous, ou seulement celui qui est choisi
    sports: sport === 'tous' ? LISTE_SPORTS : [sport],
    semaines: parSemaine(retenues, nbSemaines, aujourdHui),
    // la répartition porte toujours sur tous les sports de la période
    repartition: LISTE_SPORTS.map((s) => ({
      sport: s,
      nombre: periode.filter((seance) => seance.sport === s).length,
    })),
  }
}

export default useProgression
