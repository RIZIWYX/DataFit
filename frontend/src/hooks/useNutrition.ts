import { useEffect, useRef, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import {
  type Aliment,
  type Journal,
  type NiveauActivite,
  activiteParDefaut,
  ajoutsEau,
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
import {
  ajouterEau as envoyerEau,
  lireEau,
  supprimerEau,
} from '../services/hydratationService.ts'

// un ajout d'eau affiché : local identifie l'ajout dans la page, id sa ligne en base une fois enregistré
interface AjoutAffiche {
  local: number
  ml: number
  id?: number
}

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
  // remplace les ajouts d'eau gardés dans le navigateur pour un jour ; l'ancien compteur de verres est retiré
  function changerEauLocale(jourEau: string, modification: (ajouts: number[]) => number[]) {
    changer((j) => {
      const verres = Object.fromEntries(Object.entries(j.verres).filter(([jourVerres]) => jourVerres !== jourEau))
      return { ...j, verres, eau: { ...j.eau, [jourEau]: modification(ajoutsEau(j, jourEau)) } }
    })
  }

  const utilisateurId = lireCompte()?.id
  const [erreurEnvoi, setErreurEnvoi] = useState(false)
  const envois = useRef(Promise.resolve())

  // ---------- eau ----------
  // Connecté : l'eau est enregistrée en base (une ligne par ajout). Sinon : dans le navigateur.
  const [eauBase, setEauBaseEtat] = useState<{ jour: string; ajouts: AjoutAffiche[] } | null>(null)
  const eauBaseActuelle = useRef(eauBase)
  const compteurEau = useRef(0)

  function setEauBase(modification: (eau: typeof eauBase) => typeof eauBase) {
    eauBaseActuelle.current = modification(eauBaseActuelle.current)
    setEauBaseEtat(eauBaseActuelle.current)
  }

  // charge l'eau du jour affiché ; la première fois, l'eau notée dans le navigateur est envoyée en base
  useEffect(() => {
    if (utilisateurId === undefined) return
    let annule = false
    setEauBase(() => null)

    async function charger(id: number) {
      try {
        let lignes = await lireEau(id, cle)
        const locales = ajoutsEau(journalActuel.current, cle)
        if (lignes.length === 0 && locales.length > 0) {
          for (const ml of locales) await envoyerEau(id, cle, ml)
          changerEauLocale(cle, () => [])
          lignes = await lireEau(id, cle)
        }
        if (annule) return
        setEauBase(() => ({
          jour: cle,
          ajouts: lignes.map((l) => ({ local: ++compteurEau.current, ml: l.ml, id: l.id })),
        }))
      } catch {
        if (!annule) {
          setErreurEnvoi(true)
          setEauBase(() => ({ jour: cle, ajouts: [] }))
        }
      }
    }

    charger(utilisateurId)
    return () => {
      annule = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilisateurId, cle])

  const connecte = utilisateurId !== undefined
  const chargementEau = connecte && eauBase?.jour !== cle
  const eauDuJour = connecte
    ? (eauBase?.jour === cle ? eauBase.ajouts.map((a) => a.ml) : [])
    : ajoutsEau(journal, cle)
  const eauMl = eauDuJour.reduce((somme, ml) => somme + ml, 0)

  function ajouterEau(ml: number) {
    if (utilisateurId === undefined) {
      changerEauLocale(cle, (ajouts) => [...ajouts, ml])
      return
    }
    const local = ++compteurEau.current
    const jourEau = cle
    setEauBase((eau) => (eau && eau.jour === jourEau ? { ...eau, ajouts: [...eau.ajouts, { local, ml }] } : eau))

    envoyerEau(utilisateurId, jourEau, ml)
      .then((ligne) => {
        const toujoursLa = eauBaseActuelle.current?.ajouts.some((a) => a.local === local)
        if (!toujoursLa) {
          // annulé pendant l'envoi : on retire la ligne qui vient d'être créée
          supprimerEau(utilisateurId, ligne.id).catch(() => setErreurEnvoi(true))
          return
        }
        setEauBase((eau) =>
          eau && { ...eau, ajouts: eau.ajouts.map((a) => (a.local === local ? { ...a, id: ligne.id } : a)) },
        )
        setErreurEnvoi(false)
      })
      .catch(() => {
        setErreurEnvoi(true)
        setEauBase((eau) => eau && { ...eau, ajouts: eau.ajouts.filter((a) => a.local !== local) })
      })
  }

  function annulerEau() {
    if (utilisateurId === undefined) {
      changerEauLocale(cle, (ajouts) => ajouts.slice(0, -1))
      return
    }
    const dernier = eauBaseActuelle.current?.jour === cle ? eauBaseActuelle.current.ajouts.at(-1) : undefined
    if (!dernier) return
    setEauBase((eau) => eau && { ...eau, ajouts: eau.ajouts.slice(0, -1) })
    // sans id, l'envoi est en cours : la ligne sera retirée à son arrivée (voir ajouterEau)
    if (dernier.id !== undefined) {
      supprimerEau(utilisateurId, dernier.id).catch(() => {
        setErreurEnvoi(true)
        setEauBase((eau) => eau && { ...eau, ajouts: [...eau.ajouts, dernier] })
      })
    }
  }

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

    eauMl,
    nombreAjoutsEau: eauDuJour.length,
    chargementEau,
    ajouterEau,
    annulerEau,

    semaine,
  }
}

export default useNutrition