import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { DISCIPLINES, TOUS_LES_EXERCICES } from '../data/paliers.ts'
import { SEANCES_DEMO } from '../data/seances.ts'
import { LISTE_SPORTS, type Sport } from '../data/sports.ts'
import { bilan, joursEcoules, parSemaine } from '../lib/activite.ts'
import { chargerPlanning } from '../lib/programmation.ts'
import { criteresDisponibles, dansPeriode, pointsRang, pointsRecord, realisations } from '../lib/progression.ts'
import { avecRecordsActuels, lireHistoriqueRecords } from '../lib/records.ts'
import { chargerEtat, lireProfilRangs } from './useSport.ts'

export const PERIODES = [
  { semaines: 4, nom: '4 dernières semaines' },
  { semaines: 13, nom: '3 derniers mois' },
  { semaines: 26, nom: '6 derniers mois' },
  { semaines: 52, nom: '12 derniers mois' },
]

// logique de la page progression : la période, puis soit la vue d'ensemble des séances
// (filtrée par sport), soit un exercice choisi dans le menu (?exercice=squat dans l'adresse)
function useProgression() {
  const [parametres, setParametres] = useSearchParams()
  const [nbSemaines, setNbSemaines] = useState(13)
  const [sport, setSport] = useState<Sport | 'tous'>('tous')
  const [aujourdHui] = useState(() => new Date())
  const [perfs] = useState(() => chargerEtat().perfs)
  const [historique] = useState(() => avecRecordsActuels(lireHistoriqueRecords(), perfs, aujourdHui))
  const [planning] = useState(chargerPlanning)
  const [profil] = useState(lireProfilRangs)

  const exercice = TOUS_LES_EXERCICES.find((ex) => ex.id === parametres.get('exercice'))
  const choisirExercice = (id: string) => setParametres(id ? { exercice: id } : {}, { replace: true })

  // premier jour de la période, à minuit
  const debut = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate() - nbSemaines * 7 + 1)

  // ---------- vue d'ensemble : les séances de la montre ----------
  const duSport = SEANCES_DEMO.filter((seance) => sport === 'tous' || seance.sport === sport)
  const ecart = (seance: (typeof SEANCES_DEMO)[number]) => joursEcoules(seance.date, aujourdHui)
  const periode = duSport.filter((s) => ecart(s) >= 0 && ecart(s) < nbSemaines * 7)
  // la période d'avant, de même longueur, pour comparer
  const avant = duSport.filter((s) => ecart(s) >= nbSemaines * 7 && ecart(s) < nbSemaines * 14)
  const toutesPeriode = SEANCES_DEMO.filter((s) => ecart(s) >= 0 && ecart(s) < nbSemaines * 7)

  // ---------- un exercice ----------
  const records = exercice ? dansPeriode(pointsRecord(exercice, historique), debut) : []
  const realisees = exercice ? realisations(planning, exercice.id).filter((r) => r.date >= debut) : []

  // combien de mesures chaque exercice a déjà, pour le signaler dans le menu
  const nbMesures = (id: string) => Object.keys(historique[id] ?? {}).length + realisations(planning, id).length

  return {
    nbSemaines,
    choisirPeriode: setNbSemaines,
    disciplines: DISCIPLINES.map((d) => ({
      ...d,
      exercices: d.exercices.map((ex) => ({ ...ex, mesures: nbMesures(ex.id) })),
    })),
    exercice,
    choisirExercice,

    sport,
    choisirSport: setSport,
    sports: sport === 'tous' ? LISTE_SPORTS : [sport],
    semaines: parSemaine(periode, nbSemaines, aujourdHui),
    bilan: bilan(periode),
    bilanAvant: bilan(avant),
    seancesPeriode: [...periode].sort((a, b) => a.date.getTime() - b.date.getTime()),
    repartition: LISTE_SPORTS.map((s) => ({ sport: s, nombre: toutesPeriode.filter((seance) => seance.sport === s).length })),

    profilRempli: profil !== null,
    recordActuel: exercice ? perfs[exercice.id] : undefined,
    records,
    rangs: exercice && profil ? pointsRang(exercice, records, profil) : [],
    profil,
    realisees,
    criteres: exercice ? criteresDisponibles(exercice, realisees) : [],
    debut,
    aujourdHui,
  }
}

export default useProgression
