// Ce qui ne dépend que du sport : son nom, sa photo et son icône.
// Pour ajouter un sport : son id dans le type Sport, une ligne dans SPORTS,
// puis sa couleur (--sport-…) dans charte.css.

export type Sport = 'course' | 'musculation' | 'natation'

export interface InfosSport {
  nom: string
  // photo rangée dans public/photos/ (carte de séance) ; sans photo, la carte garde un fond uni
  image?: string
  // tracé SVG (attribut d), dessiné sur une grille de 24 × 24
  icone: string
}

// l'ordre des lignes est aussi l'ordre d'empilement dans le graphique (la première en bas)
export const SPORTS: Record<Sport, InfosSport> = {
  course: {
    nom: 'Course à pied',
    image: '/photos/course.webp',
    icone:
      'M13 4.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M13 8.5l-2.5 4.5 3 2.5-.5 4.5M10.5 13l-2 3.5-4 .5M13 8.5l3.5 2.5 3-1M13 8.5l-4 .5-1.5 3',
  },
  natation: {
    nom: 'Natation',
    image: '/photos/natation.webp',
    icone:
      'M6.5 8a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M10.5 12l4-3 3.5 2.5M3 16c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0M3 20c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0',
  },
  musculation: {
    nom: 'Musculation',
    image: '/photos/sbd.webp',
    icone: 'M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11',
  },
}

export const LISTE_SPORTS = Object.keys(SPORTS) as Sport[]

// Couleur d'un sport : une variable CSS de charte.css. Les trois ont été choisies pour rester
// distinguables par les daltoniens : en changer une demande de revérifier.
export const couleurSport = (sport: Sport) => `var(--sport-${sport})`
