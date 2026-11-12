import { cleDuCompte, lireCompte } from '../lib/compte.ts'
import { SERVICES_SPORT, type SeanceSport } from '../services/sport/index.ts'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CATEGORIES, DISCIPLINES, type Sexe, TOUS_LES_EXERCICES } from '../data/paliers.ts'
import { lireProfil } from '../lib/profil.ts'
import { noterRecord } from '../lib/records.ts'
import { type Perfs, type Profil, type ResumeDiscipline, categoriePourPoids, rangGlobal, resumeDisciplines } from '../lib/rangs.ts'
import { FORMATS_TEMPS, ecrireTemps, lireTemps } from '../lib/temps.ts'

// les exercices par identifiant front ('r100', 'crawl'...), pour savoir lesquels sont des temps
const EXERCICES = new Map(TOUS_LES_EXERCICES.map((ex) => [ex.id, ex]))
const estUnTemps = (idFront: string) => EXERCICES.get(idFront)?.type === 'time'


// un état par compte (voir cleDuCompte)
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
    const garde = JSON.parse(localStorage.getItem(cleDuCompte(CLE_STOCKAGE)) ?? '{}')
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
      localStorage.setItem(cleDuCompte(CLE_STOCKAGE), JSON.stringify(etat))
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
              // un temps arrive en secondes (270) : on l'affiche comme on le tape (4:30) ;
              // un autre nombre s'affiche avec une virgule (5,6 m), comme on l'a tapé
              perfsAjoutees[front] = estUnTemps(front) ? ecrireTemps(valeur) : String(valeur).replace('.', ',')
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
  // le rang global, calculé à partir des rangs de chaque discipline
  const rangAthlete = rangGlobal(resume)

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
  // Un temps est lu comme sur l'écran ("4:30" -> 270 s, envoyé en secondes) ; le reste est un nombre.
  // Renvoie le message à afficher si une valeur manque ou n'est pas comprise.
  function construireDTO(
    champs: Record<string, string>,
  ): { dto: Record<string, number> } | { erreur: string } {
    const dto: Record<string, number> = {}
    const tempsManquants: string[] = []
    for (const [back, front] of Object.entries(champs)) {
      const brut = String(etat.perfs[front] ?? '').trim()
      if (estUnTemps(front)) {
        const nom = EXERCICES.get(front)!.nom
        if (!brut) {
          tempsManquants.push(nom)
          continue
        }
        const secondes = lireTemps(brut)
        if (Number.isNaN(secondes)) return { erreur: `${nom} : temps non reconnu. Exemples : ${FORMATS_TEMPS}.` }
        dto[back] = secondes
        continue
      }
      const n = Number(brut.replace(',', '.'))
      if (!Number.isFinite(n)) {
        return { erreur: "Renseignez toutes les valeurs avec des nombres (positifs si c'est une charge ou une distance)." }
      }
      dto[back] = n
    }
    if (tempsManquants.length) {
      return { erreur: `Renseignez tous les temps avant d'enregistrer. Il manque : ${tempsManquants.join(', ')}.` }
    }
    return { dto }
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

    const resultat = construireDTO(service.champs)
    if ('erreur' in resultat) {
      majSauvegarde(disciplineId, { erreur: true, message: resultat.erreur })
      return
    }
    const dto = resultat.dto

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
            : "Impossible d'enregistrer la séance.",
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
    rangAthlete,
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
