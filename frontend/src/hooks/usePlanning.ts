import { useState } from 'react'
import {
  type Creneau,
  type Planning,
  type Programme,
  type SeancePlanifiee,
  chargerPlanning,
  enregistrerPlanning,
  exemplePPL,
  planifier,
} from '../lib/programmation.ts'

// Le planning (programmes et séances du calendrier) et tout ce qui le modifie.
// Chaque modification est aussitôt gardée dans le navigateur.
function usePlanning() {
  const [planning, setPlanning] = useState(chargerPlanning)

  function changer(suivant: Planning) {
    setPlanning(suivant)
    enregistrerPlanning(suivant)
  }

  const remplacer = <T extends { id: string }>(liste: T[], element: T) =>
    liste.some((e) => e.id === element.id) ? liste.map((e) => (e.id === element.id ? element : e)) : [...liste, element]

  function planifierProgramme(programme: Programme, depart: Date, semaines: number, creneaux: Creneau[]) {
    const nouvelles = planifier(programme, depart, semaines, creneaux)
    changer({ programmes: remplacer(planning.programmes, programme), seances: [...planning.seances, ...nouvelles] })
    return nouvelles.length
  }

  return {
    planning,

    // ajoute un programme, ou remplace celui qui a le même identifiant
    enregistrerProgramme: (programme: Programme) =>
      changer({ ...planning, programmes: remplacer(planning.programmes, programme) }),

    // Supprime le modèle et ses séances à venir. Les séances déjà faites restent dans
    // l'historique, comme séances uniques.
    supprimerProgramme: (id: string) =>
      changer({
        programmes: planning.programmes.filter((p) => p.id !== id),
        seances: planning.seances
          .filter((s) => s.programmeId !== id || s.faite)
          .map((s) => (s.programmeId === id ? { ...s, programmeId: null, modeleId: null } : s)),
      }),

    planifierProgramme,

    enregistrerSeance: (seance: SeancePlanifiee) => changer({ ...planning, seances: remplacer(planning.seances, seance) }),

    deplacerSeance: (id: string, debut: string) =>
      changer({ ...planning, seances: planning.seances.map((s) => (s.id === id ? { ...s, debut } : s)) }),

    supprimerSeance: (id: string) => changer({ ...planning, seances: planning.seances.filter((s) => s.id !== id) }),

    basculerFaite: (id: string) =>
      changer({ ...planning, seances: planning.seances.map((s) => (s.id === id ? { ...s, faite: !s.faite } : s)) }),

    // un programme PPL d'exemple, planifié sur 4 semaines : lundi, mercredi et vendredi à 18 h
    chargerExemple: () => {
      const programme = exemplePPL()
      return planifierProgramme(
        programme,
        new Date(),
        4,
        programme.seances.map((modele, i) => ({ modeleId: modele.id, jour: i * 2, heure: '18:00' })),
      )
    },
  }
}

export default usePlanning
