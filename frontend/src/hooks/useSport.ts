import { lireCompte } from '../lib/compte.ts'
import { SERVICES_SPORT, type SeanceSport } from '../services/sport/index.ts'
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

// État de la saisie du jour pour une discipline donnée.
interface EtatSauvegarde {
  seance: SeanceSport | null
  chargement: boolean
  sauvegarde: boolean
  message: string
  erreur: boolean
}

const ETAT_SAUVEGARDE_VIDE: EtatSauvegarde = {
  seance: null,
  chargement: false,
  sauvegarde: false,
  message: '',
  erreur: false,
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

  // Un état de sauvegarde par discipline (sbd, halt, nat, ...)
  const [sauvegardes, setSauvegardes] = useState<Record<string, EtatSauvegarde>>(
    {},
  )

  // Conserve la sauvegarde locale des performances et des onglets.
  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat))
    } catch {
      // Le stockage local peut être indisponible.
    }
  }, [etat])

  // Charge la séance du jour de chaque discipline depuis le backend.
  useEffect(() => {
    if (!utilisateurId) return

    let annule = false

    async function chargerDiscipline(disciplineId: string) {
      const service = SERVICES_SPORT[disciplineId]
      if (!service) return

      majSauvegarde(disciplineId, { chargement: true, message: '', erreur: false })

      try {
        const seance = await service.recuperer(utilisateurId!)
        if (annule) return

        majSauvegarde(disciplineId, { seance, chargement: false })

        // Si une séance existe déjà, pré-remplit les champs du front.
        if (seance) {
          const perfsAjoutees: Perfs = {}
          for (const [back, front] of Object.entries(service.champs)) {
            const valeur = (seance as unknown as Record<string, unknown>)[back]
            if (typeof valeur === 'number') {
              perfsAjoutees[front] = String(valeur)
            }
          }
          setEtat((ancien) => ({
            ...ancien,
            perfs: { ...ancien.perfs, ...perfsAjoutees },
          }))
        }
      } catch (erreur) {
        if (annule) return
        majSauvegarde(disciplineId, {
          chargement: false,
          erreur: true,
          message:
            erreur instanceof Error
              ? erreur.message
              : 'Impossible de charger la séance.',
        })
      }
    }

    // Charge toutes les disciplines en parallèle.
    for (const disciplineId of Object.keys(SERVICES_SPORT)) {
      void chargerDiscipline(disciplineId)
    }

    return () => {
      annule = true
    }
    // utilisateurId ne change pas pendant une session normale
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilisateurId])

  function majSauvegarde(disciplineId: string, patch: Partial<EtatSauvegarde>) {
    setSauvegardes((anciens) => ({
      ...anciens,
      [disciplineId]: {
        ...(anciens[disciplineId] ?? ETAT_SAUVEGARDE_VIDE),
        ...patch,
      },
    }))
  }

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

  // Construit le DTO back à partir des perfs saisies, selon le mapping du service.
  // Renvoie null si une valeur manque ou n'est pas un nombre fini.
  function construireDTO(
    champs: Record<string, string>,
  ): Record<string, number> | null {
    const dto: Record<string, number> = {}
    for (const [back, front] of Object.entries(champs)) {
      const brut = String(etat.perfs[front] ?? '').replace(',', '.')
      const n = Number(brut)
      if (!Number.isFinite(n)) return null
      dto[back] = n
    }
    return dto
  }

  async function envoyerSeance(
    disciplineId: string,
    mode: 'valider' | 'modifier',
  ) {
    const service = SERVICES_SPORT[disciplineId]
    if (!service) return

    if (!utilisateurId) {
      majSauvegarde(disciplineId, {
        erreur: true,
        message: 'Connectez-vous pour enregistrer votre séance.',
      })
      return
    }

    const etatCourant = sauvegardes[disciplineId] ?? ETAT_SAUVEGARDE_VIDE
    if (etatCourant.chargement || etatCourant.sauvegarde) return

    const dto = construireDTO(service.champs)
    if (!dto) {
      majSauvegarde(disciplineId, {
        erreur: true,
        message:
          'Renseignez toutes les valeurs avec des nombres (positifs si c’est une charge, un temps ou une distance).',
      })
      return
    }

    majSauvegarde(disciplineId, {
      sauvegarde: true,
      message: '',
      erreur: false,
    })

    try {
      const seance =
        mode === 'valider'
          ? await service.valider(utilisateurId, dto)
          : await service.modifier(utilisateurId, dto)

      majSauvegarde(disciplineId, {
        seance,
        sauvegarde: false,
        message:
          mode === 'valider'
            ? 'Séance enregistrée avec succès.'
            : 'Séance modifiée avec succès.',
      })
    } catch (erreur) {
      majSauvegarde(disciplineId, {
        sauvegarde: false,
        erreur: true,
        message:
          erreur instanceof Error
            ? erreur.message
            : 'Impossible d’enregistrer la séance.',
      })
    }
  }

  // État de la discipline couramment ouverte, pour l'affichage des boutons.
  const sauvegardeCourante =
    sauvegardes[discipline.id] ?? ETAT_SAUVEGARDE_VIDE

  // Les disciplines branchées sur le backend (pour masquer les boutons sinon).
  const disciplineBranchee = Boolean(SERVICES_SPORT[discipline.id])

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

    // Pour les boutons Valider/Modifier (générique pour toutes les disciplines).
    disciplineBranchee,
    seanceDuJour: sauvegardeCourante.seance,
    chargement: sauvegardeCourante.chargement,
    sauvegarde: sauvegardeCourante.sauvegarde,
    message: sauvegardeCourante.message,
    erreur: sauvegardeCourante.erreur,
    valider: () => envoyerSeance(discipline.id, 'valider'),
    modifier: () => envoyerSeance(discipline.id, 'modifier'),
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
