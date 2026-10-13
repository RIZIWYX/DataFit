import { type Sport } from './sports.ts'

export interface Seance {
  id: string
  sport: Sport
  date: Date // jour et heure de début
  dureeMin: number
  // la mesure principale : kilomètres (course), mètres (natation), exercices (musculation)
  quantite: number
  fcMoyenne: number // fréquence cardiaque moyenne, en battements par minute
}

// Démonstration : séances inventées, à remplacer par celles du backend.
// Elles sont datées par rapport à aujourd'hui (nombre de jours écoulés) pour que
// le site ait toujours des séances récentes à montrer.
const DEMO: [jours: number, sport: Sport, dureeMin: number, quantite: number][] = [
  [2, 'course', 32, 5.2],
  [4, 'musculation', 70, 3],
  [6, 'natation', 45, 1200],
  [8, 'course', 28, 4.6],
  [10, 'musculation', 55, 4],
  [11, 'course', 41, 6.8],
  [13, 'natation', 40, 1000],
  [15, 'course', 30, 5],
  [17, 'musculation', 65, 5],
  [19, 'course', 35, 5.6],
  [22, 'natation', 50, 1400],
  [23, 'course', 25, 4],
  [25, 'musculation', 60, 4],
  [27, 'course', 45, 7.5],
  [29, 'course', 30, 5.1],
  [31, 'musculation', 50, 3],
  [33, 'natation', 35, 900],
  [36, 'course', 27, 4.4],
  [38, 'course', 38, 6.1],
  [40, 'musculation', 75, 5],
  [43, 'natation', 45, 1100],
  [45, 'course', 33, 5.3],
  [50, 'course', 24, 3.8],
  [52, 'musculation', 45, 3],
  [54, 'course', 29, 4.7],
  [57, 'natation', 40, 1000],
  [59, 'course', 31, 5],
  [61, 'musculation', 60, 4],
  [64, 'course', 26, 4.2],
  [66, 'course', 36, 5.8],
  [68, 'natation', 35, 900],
  [71, 'musculation', 55, 4],
  [73, 'course', 29, 4.6],
  [75, 'course', 22, 3.5],
  [78, 'musculation', 50, 3],
  [80, 'natation', 30, 800],
  [82, 'course', 27, 4.3],
  [85, 'course', 24, 3.8],
  [87, 'musculation', 45, 3],
  [89, 'course', 20, 3.2],
]

const HEURES_DE_DEBUT = [[18, 10], [7, 30], [12, 15], [19, 0], [10, 30]]
const FC_DE_BASE: Record<Sport, number> = { course: 146, natation: 128, musculation: 114 }

export const SEANCES_DEMO: Seance[] = DEMO.map(([jours, sport, dureeMin, quantite], i) => {
  const [heures, minutes] = HEURES_DE_DEBUT[i % HEURES_DE_DEBUT.length]
  const date = new Date()
  date.setDate(date.getDate() - jours)
  date.setHours(heures, minutes, 0, 0)
  return { id: String(i + 1), sport, date, dureeMin, quantite, fcMoyenne: FC_DE_BASE[sport] + ((i * 7) % 9) }
})
