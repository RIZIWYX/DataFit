import { useState } from 'react'
import {
  type Aliment,
  type Journal,
  type NiveauActivite,
  activiteParDefaut,
  calculerBesoins,
  cleJour,
  decalerJour,
  enregistrerJournal,
  lireJournal,
  nouvelAliment,
  totaux,
} from '../lib/nutrition.ts'
import { lireProfil } from '../lib/profil.ts'

// logique de la page nutrition : les besoins du jour, le journal des repas et l'eau,
// jour par jour (jamais au-delà d'aujourd'hui)
function useNutrition() {
  // complet : l'application n'est accessible qu'une fois le profil rempli (AppLayout)
  const [profil] = useState(lireProfil)
  const [journal, setJournal] = useState(lireJournal)
  const [aujourdHui] = useState(() => new Date())
  const [jour, setJour] = useState(aujourdHui)

  function changer(suivant: Journal) {
    setJournal(suivant)
    enregistrerJournal(suivant)
  }

  const cle = cleJour(jour)
  // choisis sur la page ; au départ, ceux du profil
  const objectif = journal.objectif ?? profil?.objectif ?? ''
  const activite = journal.activite ?? activiteParDefaut(profil?.niveau ?? '')
  const besoins = profil ? calculerBesoins(profil, objectif, activite, aujourdHui) : null
  const alimentsDuJour = journal.aliments.filter((a) => a.jour === cle)
  const verres = journal.verres[cle] ?? 0

  // les 7 jours qui finissent au jour affiché, du plus ancien au plus récent
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const date = decalerJour(jour, i - 6)
    const cleDate = cleJour(date)
    return { date, kcal: totaux(journal.aliments.filter((a) => a.jour === cleDate)).kcal }
  })

  return {
    profil,
    besoins,
    objectif,
    choisirObjectif: (valeur: string) => changer({ ...journal, objectif: valeur }),
    activite,
    choisirActivite: (valeur: NiveauActivite) => changer({ ...journal, activite: valeur }),

    jour,
    aujourdHui,
    estAujourdhui: cle === cleJour(aujourdHui),
    jourPrecedent: () => setJour(decalerJour(jour, -1)),
    jourSuivant: () => setJour(decalerJour(jour, 1)),
    revenirAujourdhui: () => setJour(aujourdHui),

    alimentsDuJour,
    totauxDuJour: totaux(alimentsDuJour),
    ajouter: (aliment: Omit<Aliment, 'id' | 'jour'>) =>
      changer({ ...journal, aliments: [...journal.aliments, nouvelAliment({ ...aliment, jour: cle })] }),
    supprimer: (id: string) => changer({ ...journal, aliments: journal.aliments.filter((a) => a.id !== id) }),

    verres,
    changerVerres: (nombre: number) =>
      changer({ ...journal, verres: { ...journal.verres, [cle]: Math.max(0, nombre) } }),

    semaine,
  }
}

export default useNutrition
