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
import {
  ajouterRepas,
  supprimerRepas,
  analyserNutrition,
  type AnalyseNutrition,
} from '../services/nutritionService.ts'

function useNutrition() {
  const [profil] = useState(lireProfil)
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
  const objectif = journal.objectif ?? profil?.objectif ?? ''
  const activite = journal.activite ?? activiteParDefaut(profil?.niveau ?? '')
  const besoins = profil
    ? calculerBesoins(profil, objectif, activite, aujourdHui)
    : null

  const alimentsDuJour = journal.aliments.filter((a) => a.jour === cle)
  const verres = journal.verres[cle] ?? 0

  const utilisateurId = lireCompte()?.id
  const [erreurEnvoi, setErreurEnvoi] = useState(false)
  const envois = useRef(Promise.resolve())

  useEffect(() => {
    if (utilisateurId === undefined) return

    envois.current = envois.current.then(async () => {
      try {
        for (const aliment of journalActuel.current.aliments.filter(
          (a) => a.idServeur === undefined,
        )) {
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
              ? {
                  ...j,
                  aliments: j.aliments.map((a) =>
                    a.id === aliment.id
                      ? { ...a, idServeur: ligne.id }
                      : a,
                  ),
                }
              : { ...j, aSupprimer: [...j.aSupprimer, ligne.id] },
          )
        }

        for (const idServeur of journalActuel.current.aSupprimer) {
          await supprimerRepas(utilisateurId, idServeur)
          changer((j) => ({
            ...j,
            aSupprimer: j.aSupprimer.filter((id) => id !== idServeur),
          }))
        }

        setErreurEnvoi(false)
      } catch {
        setErreurEnvoi(true)
      }
    })
  }, [utilisateurId, journal, objectif])

  const [analyse, setAnalyse] = useState<AnalyseNutrition | null>(null)
  const [chargementAnalyse, setChargementAnalyse] = useState(false)
  const [erreurAnalyse, setErreurAnalyse] = useState<string | null>(null)

  async function lancerAnalyse() {
    if (utilisateurId === undefined) {
      setErreurAnalyse('Utilisateur non identifié.')
      return
    }

    setChargementAnalyse(true)
    setErreurAnalyse(null)
    setAnalyse(null)

    try {
      const resultat = await analyserNutrition(utilisateurId, cle)
      setAnalyse(resultat)
    } catch (erreur) {
      setErreurAnalyse(
        erreur instanceof Error
          ? erreur.message
          : "Impossible de réaliser l'analyse.",
      )
    } finally {
      setChargementAnalyse(false)
    }
  }

  // Les sept jours qui finissent au jour affiché.
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const date = decalerJour(jour, i - 6)
    const cleDate = cleJour(date)
    const aliments = journal.aliments.filter((a) => a.jour === cleDate)

    return {
      date,
      nombreRepas: aliments.length,
      alimentsDifferents: new Set(
        aliments.map((a) => a.nom.trim().toLocaleLowerCase()),
      ).size,
    }
  })

  return {
    profil,
    besoins,
    objectif,
    choisirObjectif: (valeur: string) =>
      changer((j) => ({ ...j, objectif: valeur })),

    activite,
    choisirActivite: (valeur: NiveauActivite) =>
      changer((j) => ({ ...j, activite: valeur })),

    jour,
    aujourdHui,
    estAujourdhui: cle === cleJour(aujourdHui),
    jourPrecedent: () => setJour(decalerJour(jour, -1)),
    jourSuivant: () => setJour(decalerJour(jour, 1)),
    revenirAujourdhui: () => setJour(aujourdHui),

    alimentsDuJour,
    totauxDuJour: totaux(alimentsDuJour),

    ajouter: (aliment: Omit<Aliment, 'id' | 'jour' | 'idServeur'>) =>
      changer((j) => ({
        ...j,
        aliments: [...j.aliments, nouvelAliment({ ...aliment, jour: cle })],
      })),

    supprimer: (id: string) =>
      changer((j) => {
        const idServeur = j.aliments.find((a) => a.id === id)?.idServeur

        return {
          ...j,
          aliments: j.aliments.filter((a) => a.id !== id),
          aSupprimer:
            idServeur === undefined
              ? j.aSupprimer
              : [...j.aSupprimer, idServeur],
        }
      }),

    erreurEnvoi,

    analyse,
    lancerAnalyse,
    chargementAnalyse,
    erreurAnalyse,

    verres,
    changerVerres: (nombre: number) =>
      changer((j) => ({
        ...j,
        verres: { ...j.verres, [cle]: Math.max(0, nombre) },
      })),

    semaine,
  }
}

export default useNutrition