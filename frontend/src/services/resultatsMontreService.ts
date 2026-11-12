import { type Seance } from '../data/seances.ts'
import { type Sport } from '../data/sports.ts'
import { dateCardio, formatDureeSecondes } from '../lib/cardio.ts'
import { nombre, formatAllure } from '../lib/format.ts'
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'
import { SPORTS_MONTRE, type SportMontre } from './montreService.ts'

// Noms des propriétés JSON des entités Java existantes. Pas de modification de la BDD.
interface ResultatSeance {
  id: number
  date: string
  nom: string
  dureeS: number
  fcMoy: number
  fcMin: number
  fcMax: number
  [champ: string]: string | number | null
}
export interface NuitEnregistree {
  id: number
  heureCoucher: string
  heureReveil: string
  tempsAuLitS: number
  dureeSommeilS: number
  latenceEndormissementS: number
  dureeEveilTotaleS: number
  eveilNocturneS: number
  reveilsNb: number
  efficaciteSommeilPct: number
  fcMoyenne: number
  fcMin: number
  fcMax: number
  dureeEveilS: number
  dureeLegerS: number
  dureeProfondS: number
  dureeParadoxalS: number
}
const SPORTS: Record<SportMontre, Sport> = {
  cardio: 'course', velo: 'velo', natation: 'natation', muscu: 'musculation',
}
const valeur = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

export function convertirSeance(sport: SportMontre, s: ResultatSeance): Seance {
  const indicateurs: Seance['indicateurs'] = []
  const ajouter = (champ: string, nom: string, format: (n: number) => string) => {
    if (valeur(s[champ])) indicateurs.push({ nom, valeur: format(s[champ]) })
  }
  // une décimale suffit à lire une vitesse (11,1 km/h) ; un pourcentage de variation se lit entier
  const vitesse = (n: number) => `${nombre(n, 1)} km/h`
  const pourcentage = (n: number) => `${nombre(n, 0)} %`
  const bpm = (n: number) => `${nombre(n)} bpm`
  if (sport === 'cardio' || sport === 'velo') {
    ajouter('vitesseMoyKmh', 'Vitesse moyenne', vitesse)
    ajouter('vitesseMaxKmh', 'Vitesse maximale', vitesse)
    ajouter('variationVitesse', 'Variation de vitesse', pourcentage)
  }
  // la corrélation vitesse–FC (correlationVitesseFc, correlationFcVitesse) reste calculée par l'analyse
  // mais n'est plus affichée (issue #19) : un coefficient comme 0,89 ne dit rien à un sportif
  if (sport === 'velo') {
    ajouter('tempsPedalageS', 'Pédalage', formatDureeSecondes)
    ajouter('tempsRoueLibreS', 'Roue libre', formatDureeSecondes)
    ajouter('tempsPauseS', 'Pauses', formatDureeSecondes)
  }
  if (sport === 'natation') {
    ajouter('dureeLongueurRapideS', 'Meilleure longueur', formatDureeSecondes)
    ajouter('dureeMoyLongueurS', 'Durée moyenne par longueur', formatDureeSecondes)
    ajouter('variationDureeLongueurs', 'Variation des longueurs', pourcentage)
    ajouter('totalCyclesBras', 'Cycles de bras', (n) => nombre(n, 0))
    ajouter('tempsNageS', 'Temps de nage', formatDureeSecondes)
    ajouter('tempsPauseS', 'Pauses', formatDureeSecondes)
  }
  if (sport === 'muscu') {
    ajouter('nbSeries', 'Séries', (n) => nombre(n, 0))
    ajouter('fcMoyEffort', "FC moyenne à l'effort", bpm)
    ajouter('fcMoyPause', 'FC moyenne au repos', bpm)
    ajouter('dureeEffortS', "Temps d'effort", formatDureeSecondes)
    ajouter('dureePauseS', 'Temps de repos', formatDureeSecondes)
    ajouter('dureeMoyPauseS', 'Repos moyen', formatDureeSecondes)
    ajouter('baisseFcApres60s', 'Baisse de FC après 60 s', bpm)
  }
  const allure = sport === 'cardio' ? s.tempsMoy1kmS : sport === 'natation' ? s.tempsMoy100mS : null
  if (valeur(allure)) indicateurs.unshift({
    nom: 'Allure moyenne', valeur: `${formatAllure(allure)}${sport === 'cardio' ? '/km' : '/100 m'}`,
  })
  return {
    id: `${sport}-${s.id}`, nom: s.nom, sport: SPORTS[sport], date: dateCardio(s.date),
    heure: typeof s.synchroniseLe === 'string' && Number.isFinite(Date.parse(s.synchroniseLe)) ? new Date(s.synchroniseLe) : undefined,
    dureeMin: s.dureeS / 60, dureeSecondes: s.dureeS,
    quantite: sport === 'muscu' ? Number(s.nbSeries) : Number(s.distanceM) / (sport === 'natation' ? 1 : 1000),
    fcMoyenne: s.fcMoy, fcMin: s.fcMin, fcMax: s.fcMax,
    allureMoyenne: valeur(allure) ? allure : undefined, indicateurs,
  }
}

export async function lireHistorique<T>(chemin: string, id: IdentifiantUtilisateur, signal?: AbortSignal): Promise<T[]> {
  const reponse = await fetch(`${API_URL}${chemin}/${encodeURIComponent(id)}`, { signal })
  if (!reponse.ok) throw new Error(`Chargement impossible (HTTP ${reponse.status}).`)
  const donnees: unknown = await reponse.json()
  if (!Array.isArray(donnees)) throw new Error('Historique invalide reçu du serveur.')
  return donnees as T[]
}

export async function recupererSeances(id: IdentifiantUtilisateur, signal?: AbortSignal) {
  const resultats = await Promise.allSettled(SPORTS_MONTRE.map(async (sport) => {
    const lignes = await lireHistorique<ResultatSeance>(`/api/seances/${sport}`, id, signal)
    return lignes.map((s) => convertirSeance(sport, s))
  }))
  // De la plus ancienne à la plus récente : par jour, puis par heure de synchronisation
  // (synchronise_le). Les anciennes séances n'ont pas d'heure : elles passent avant celles du
  // même jour qui en ont une, et la séance tout juste synchronisée dans ce navigateur reste
  // reconnue par son id, comme avant.
  let derniere = ''
  try { derniere = localStorage.getItem(`datafit-derniere-seance:${id}`) ?? '' } catch { /* facultatif */ }
  const seances = resultats.flatMap((r) => r.status === 'fulfilled' ? r.value : [])
    .sort((a, b) => a.date.getTime() - b.date.getTime()
      || (a.heure?.getTime() ?? 0) - (b.heure?.getTime() ?? 0)
      || Number(a.id === derniere) - Number(b.id === derniere)
      || Number(a.id.split('-')[1]) - Number(b.id.split('-')[1]))
  const manquants = SPORTS_MONTRE.filter((_, i) => resultats[i].status === 'rejected')
  return { donnees: seances, erreur: manquants.length ? `Impossible de charger : ${manquants.join(', ')}.` : '' }
}

export async function recupererNuits(id: IdentifiantUtilisateur, signal?: AbortSignal) {
  const donnees = await lireHistorique<NuitEnregistree>('/api/sommeil', id, signal)
  return { donnees: donnees.sort((a, b) => a.heureCoucher.localeCompare(b.heureCoucher)), erreur: '' }
}
