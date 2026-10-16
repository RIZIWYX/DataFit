import { useState } from 'react'
import { SEANCES_DEMO } from '../data/seances.ts'
import { type Objectif, type StatutObjectif, avancement, enregistrerObjectifs, lireObjectifs } from '../lib/objectifs.ts'
import { nouvelId } from '../lib/programmation.ts'
import { chargerEtat } from './useSport.ts'

// les objectifs du profil : liste, ajout, changement de statut, suppression
function useObjectifs() {
  const [objectifs, setObjectifs] = useState(lireObjectifs)
  const [perfs] = useState(() => chargerEtat().perfs)
  const [aujourdHui] = useState(() => new Date())

  function changer(suivants: Objectif[]) {
    setObjectifs(suivants)
    enregistrerObjectifs(suivants)
  }

  return {
    objectifs,
    avancement: (objectif: Objectif) => avancement(objectif, perfs, SEANCES_DEMO, aujourdHui),
    // le record actuel d'un exercice, pour aider à choisir une cible
    recordActuel: (exerciceId: string) => perfs[exerciceId],
    ajouter: (objectif: Omit<Objectif, 'id' | 'statut'>) =>
      changer([...objectifs, { ...objectif, id: nouvelId(), statut: 'en-cours' }]),
    changerStatut: (id: string, statut: StatutObjectif) =>
      changer(objectifs.map((o) => (o.id === id ? { ...o, statut } : o))),
    supprimer: (id: string) => changer(objectifs.filter((o) => o.id !== id)),
  }
}

export default useObjectifs
