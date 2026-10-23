import { useEffect, useRef, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
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
import { ajouterRepas, supprimerRepas } from '../services/nutritionService.ts'

// logique de la page nutrition : les besoins du jour, le journal des repas et l'eau,
// jour par jour (jamais au-delà d'aujourd'hui)
function useNutrition() {
  // complet : l'application n'est accessible qu'une fois le profil rempli (AppLayout)
  const [profil] = useState(lireProfil)
  // le journal est aussi gardé dans une ref : l'envoi au serveur, qui dure, y lit toujours la dernière version
  const [journalInitial] = useState(lireJournal)
  const journalActuel = useRef(journalInitial)
  const [journal, setJournal] = useState(journalInitial)
  const [aujourdHui] = useState(() => new Date())
  const [jour, setJour] = useState(aujourdHui)

  function changer(modification: (journal: Journal) => Journal) {
    const suivant = modification(journalActuel.current)
    journalActuel.current = suivant
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

  // Chaque repas noté a sa propre ligne en base (voir NutritionController) : à l'ouverture de la page
  // et à chaque changement, on envoie ceux qui n'y sont pas encore et on supprime ceux qui ont été
  // retirés du journal. Ce qui reste à faire est gardé dans le journal : un envoi qui échoue
  // (serveur arrêté…) repart à la prochaine ouverture de la page ou au prochain changement.
  const utilisateurId = lireCompte()?.id
  const [erreurEnvoi, setErreurEnvoi] = useState(false)
  // chaque envoi attend la fin du précédent : un repas n'est jamais envoyé deux fois
  const envois = useRef(Promise.resolve())

  useEffect(() => {
    if (utilisateurId === undefined) return
    envois.current = envois.current.then(async () => {
      try {
        for (const aliment of journalActuel.current.aliments.filter((a) => a.idServeur === undefined)) {
          const ligne = await ajouterRepas(utilisateurId, {
            date: aliment.jour,
            repas: aliment.repas,
            nom: aliment.nom,
            calories: aliment.kcal,
            proteines: aliment.proteines,
            glucides: aliment.glucides,
            lipides: aliment.lipides,
            objectif,
          })
          changer((j) =>
            j.aliments.some((a) => a.id === aliment.id)
              ? { ...j, aliments: j.aliments.map((a) => (a.id === aliment.id ? { ...a, idServeur: ligne.id } : a)) }
              : // supprimé pendant l'envoi : sa ligne est retirée juste après
                { ...j, aSupprimer: [...j.aSupprimer, ligne.id] },
          )
        }
        for (const idServeur of journalActuel.current.aSupprimer) {
          await supprimerRepas(utilisateurId, idServeur)
          changer((j) => ({ ...j, aSupprimer: j.aSupprimer.filter((id) => id !== idServeur) }))
        }
        setErreurEnvoi(false)
      } catch {
        setErreurEnvoi(true)
      }
    })
  }, [utilisateurId, journal, objectif])

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
    choisirObjectif: (valeur: string) => changer((j) => ({ ...j, objectif: valeur })),
    activite,
    choisirActivite: (valeur: NiveauActivite) => changer((j) => ({ ...j, activite: valeur })),

    jour,
    aujourdHui,
    estAujourdhui: cle === cleJour(aujourdHui),
    jourPrecedent: () => setJour(decalerJour(jour, -1)),
    jourSuivant: () => setJour(decalerJour(jour, 1)),
    revenirAujourdhui: () => setJour(aujourdHui),

    alimentsDuJour,
    totauxDuJour: totaux(alimentsDuJour),
    ajouter: (aliment: Omit<Aliment, 'id' | 'jour' | 'idServeur'>) =>
      changer((j) => ({ ...j, aliments: [...j.aliments, nouvelAliment({ ...aliment, jour: cle })] })),
    supprimer: (id: string) =>
      changer((j) => {
        const idServeur = j.aliments.find((a) => a.id === id)?.idServeur
        return {
          ...j,
          aliments: j.aliments.filter((a) => a.id !== id),
          // déjà en base : sa ligne est à supprimer aussi
          aSupprimer: idServeur === undefined ? j.aSupprimer : [...j.aSupprimer, idServeur],
        }
      }),
    erreurEnvoi,

    verres,
    changerVerres: (nombre: number) =>
      changer((j) => ({ ...j, verres: { ...j.verres, [cle]: Math.max(0, nombre) } })),

    semaine,
  }
}

export default useNutrition
