// Préparation des semaines pour le graphique en colonnes (composant GrapheColonnes).
import { type Colonne, type Serie } from '../components/GrapheColonnes.tsx'
import { SPORTS, type Sport } from '../data/sports.ts'
import { type Semaine } from './activite.ts'
import { formatJour } from './format.ts'

export const seriesDesSports = (sports: Sport[]): Serie[] =>
  sports.map((sport) => ({ nom: SPORTS[sport].nom, couleur: SPORTS[sport].couleur }))

// une colonne par semaine, un étage par sport
export const colonnesDesSemaines = (semaines: Semaine[], sports: Sport[]): Colonne[] =>
  semaines.map((semaine, i) => {
    // « 7\noct. » : le jour sur une ligne, le mois en dessous, seulement quand il change
    const [jour, mois] = formatJour(semaine.debut).split(' ')
    const nouveauMois = i === 0 || semaines[i - 1].debut.getMonth() !== semaine.debut.getMonth()
    return {
      cle: String(semaine.debut.getTime()),
      libelle: `${jour}\n${nouveauMois ? mois : ' '}`,
      detail: `Du ${formatJour(semaine.debut)} au ${formatJour(semaine.fin)}`,
      valeurs: sports.map((sport) => semaine.parSport[sport]),
    }
  })

export const nbSeances = (n: number) => `${n} séance${n > 1 ? 's' : ''}`
