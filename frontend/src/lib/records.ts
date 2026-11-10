// Historique des records (une valeur par exercice et par jour), sert pour la page Progression
import { cleDuCompte } from './compte.ts'
import { cleJour } from './dates.ts'

// { exercice : { "2026-10-15" : "102,5" } } ; la valeur est le texte saisi, comme dans Performance
export type HistoriqueRecords = Record<string, Record<string, string>>

// un historique par compte (voir cleDuCompte)
const CLE_STOCKAGE = 'datafit-records'

export function lireHistoriqueRecords(): HistoriqueRecords {
  try {
    return JSON.parse(localStorage.getItem(cleDuCompte(CLE_STOCKAGE)) ?? '{}')
  } catch {
    return {}
  }
}

// Les records saisis avant que l'historique existe n'ont pas de date : on les compte comme
// connus à la date du jour, pour que la page Progression ne les ignore pas.
export function avecRecordsActuels(historique: HistoriqueRecords, perfs: Record<string, string>, jour: Date): HistoriqueRecords {
  const complet = { ...historique }
  for (const [id, brut] of Object.entries(perfs)) {
    if (brut.trim() && !Object.keys(complet[id] ?? {}).length) complet[id] = { [cleJour(jour)]: brut.trim() }
  }
  return complet
}

// Note la valeur du jour. Saisie lettre après lettre, elle remplace celle déjà notée aujourd'hui :
// seule la dernière valeur de la journée compte. Un champ vidé retire la valeur du jour.
export function noterRecord(exerciceId: string, brut: string, jour = new Date()) {
  const historique = lireHistoriqueRecords()
  const valeurs = { ...historique[exerciceId] }
  if (brut.trim()) valeurs[cleJour(jour)] = brut.trim()
  else delete valeurs[cleJour(jour)]
  historique[exerciceId] = valeurs
  try {
    localStorage.setItem(cleDuCompte(CLE_STOCKAGE), JSON.stringify(historique))
  } catch {
    // stockage indisponible : l'historique ne sera pas gardé
  }
}
