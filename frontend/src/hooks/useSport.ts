import { lireCompte } from '../lib/compte.ts'
import {
  recupererSBD,
  validerSBD,
  modifierSBD,
  type SeanceSBD,
  type SBDRequest,
} from '../services/sport/sbdService.ts'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CATEGORIES, DISCIPLINES, type Sexe } from '../data/paliers.ts'
import { lireProfil } from '../lib/profil.ts'
import { noterRecord } from '../lib/records.ts'
import { type Perfs, type Profil, type ResumeDiscipline, categoriePourPoids, resumeDisciplines } from '../lib/rangs.ts'


const CLE_STOCKAGE = 'datafit-rangs'

interface Etat {
  onglet: string
  perfs: Perfs
}

const ETAT_INITIAL: Etat = { onglet: 'sbd', perfs: {} }

// Démonstration : les perfs sont gardées dans le navigateur.
// À remplacer par un appel au backend quand l'API sera prête.
export function chargerEtat(): Etat {
  try {
    const garde = JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? '{}')
    return { onglet: garde.onglet ?? ETAT_INITIAL.onglet, perfs: garde.perfs ?? {} }
  } catch {
    return ETAT_INITIAL
  }
}

// Le sexe et le poids ne se choisissent pas ici : ils viennent de la page profil.
// Rien tant que le profil n'est pas rempli.
export function lireMorphologie(): { sexe: Sexe; poids: number } | null {
  const profil = lireProfil()
  if (!profil || (profil.sexe !== 'H' && profil.sexe !== 'F') || !(profil.poids > 0)) return null
  return { sexe: profil.sexe, poids: profil.poids }
}

function useSport() {
  const [parametres] = useSearchParams()
  const demandee = parametres.get('discipline')

  const [etat, setEtat] = useState<Etat>(() => {
    const garde = chargerEtat()
    return demandee && DISCIPLINES.some((d) => d.id === demandee)
      ? { ...garde, onglet: demandee }
      : garde
  })

  const [morphologie] = useState(lireMorphologie)
  const utilisateurId = lireCompte()?.id

  const [seanceSBD, setSeanceSBD] = useState<SeanceSBD | null>(null)
  const [chargementSBD, setChargementSBD] = useState(false)
  const [sauvegardeSBD, setSauvegardeSBD] = useState(false)
  const [messageSBD, setMessageSBD] = useState('')
  const [erreurSBD, setErreurSBD] = useState(false)

  // Conserve la sauvegarde locale des performances et des onglets.
  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat))
    } catch {
      // Le stockage local peut être indisponible.
    }
  }, [etat])

  // Charge la séance du jour depuis le backend.
  useEffect(() => {
    if (!utilisateurId) return

    let annule = false

    async function charger() {
      setChargementSBD(true)
      setMessageSBD('')
      setErreurSBD(false)

      try {
        const seance = await recupererSBD(utilisateurId!)

        if (annule) return

        setSeanceSBD(seance)

        // Remplit les champs avec les valeurs enregistrées.
        if (seance) {
          setEtat((ancien) => ({
            ...ancien,
            perfs: {
              ...ancien.perfs,
              bench: String(seance.bench),
              squat: String(seance.squat),
              dead: String(seance.deadlift),
            },
          }))
        }
      } catch (erreur) {
        if (!annule) {
          setErreurSBD(true)
          setMessageSBD(
            erreur instanceof Error
              ? erreur.message
              : 'Impossible de charger la séance SBD.',
          )
        }
      } finally {
        if (!annule) setChargementSBD(false)
      }
    }

    void charger()

    return () => {
      annule = true
    }
  }, [utilisateurId])

  const { sexe, poids } = morphologie ?? {
    sexe: 'H' as const,
    poids: 0,
  }

  const [nomCategorie, poidsRef] =
    CATEGORIES[sexe][categoriePourPoids(sexe, poids)]

  const profil: Profil = { sexe, poidsRef }
  const discipline =
    DISCIPLINES.find((d) => d.id === etat.onglet) ?? DISCIPLINES[0]

  const parCategorie = discipline.exercices.some(
    (ex) => ex.type === 'load' || ex.type === 'lest',
  )

  const resume = resumeDisciplines(etat.perfs, profil)

  const choisirOnglet = (onglet: string) => {
    setEtat((e) => ({ ...e, onglet }))
  }

  const majPerf = (id: string, v: string) => {
    setEtat((e) => ({
      ...e,
      perfs: { ...e.perfs, [id]: v },
    }))
    noterRecord(id, v)
  }

  async function envoyerSBD(mode: 'valider' | 'modifier') {
    if (!utilisateurId) {
      setErreurSBD(true)
      setMessageSBD('Connectez-vous pour enregistrer votre séance.')
      return
    }

    if (chargementSBD || sauvegardeSBD) return

    const bench = Number(
      String(etat.perfs.bench ?? '').replace(',', '.'),
    )
    const squat = Number(
      String(etat.perfs.squat ?? '').replace(',', '.'),
    )
    const deadlift = Number(
      String(etat.perfs.dead ?? '').replace(',', '.'),
    )

    if (
      ![bench, squat, deadlift].every(
        (v) => Number.isFinite(v) && v > 0,
      )
    ) {
      setErreurSBD(true)
      setMessageSBD(
        'Renseignez les trois charges avec des valeurs positives.',
      )
      return
    }

    const donnees: SBDRequest = { bench, squat, deadlift }

    setSauvegardeSBD(true)
    setMessageSBD('')
    setErreurSBD(false)

    try {
      const seance =
        mode === 'valider'
          ? await validerSBD(utilisateurId, donnees)
          : await modifierSBD(utilisateurId, donnees)

      setSeanceSBD(seance)
      setMessageSBD(
        mode === 'valider'
          ? 'Séance SBD enregistrée avec succès.'
          : 'Séance SBD modifiée avec succès.',
      )
    } catch (erreur) {
      setErreurSBD(true)
      setMessageSBD(
        erreur instanceof Error
          ? erreur.message
          : 'Impossible d’enregistrer la séance.',
      )
    } finally {
      setSauvegardeSBD(false)
    }
  }

  return {
    profilRempli: morphologie !== null,
    sexe,
    poids,
    perfs: etat.perfs,
    nomCategorie,
    poidsRef,
    profil,
    discipline,
    parCategorie,
    resume,
    choisirOnglet,
    majPerf,

    // État et actions spécifiques au SBD.
    seanceSBD,
    chargementSBD,
    sauvegardeSBD,
    messageSBD,
    erreurSBD,
    validerSBD: () => envoyerSBD('valider'),
    modifierSBD: () => envoyerSBD('modifier'),
  }
}


// Le profil de calcul des rangs (sexe et poids de référence de la catégorie),
// ou null tant que le profil n'est pas rempli.
export function lireProfilRangs(): Profil | null {
  const morphologie = lireMorphologie()
  if (!morphologie) return null
  const { sexe, poids } = morphologie
  const [, poidsRef] = CATEGORIES[sexe][categoriePourPoids(sexe, poids)]
  return { sexe, poidsRef }
}

// Pour l'accueil : le résumé des rangs par discipline, lu dans le navigateur.
// null tant que le profil (sexe et poids) n'est pas rempli : sans lui, pas de rang.
export function lireResumeRangs(): ResumeDiscipline[] | null {
  const profil = lireProfilRangs()
  return profil && resumeDisciplines(chargerEtat().perfs, profil)
}

export default useSport
