// Page Progression, vue « Tous les sports » : les graphiques de la montre se comptent par dizaines
// (une quinzaine par sport). On n'en montre que trois par sport, les plus parlants ; les autres
// s'affichent quand on choisit un sport. Les identifiants sont ceux de analyse/app/graphiques.py
// ("<sport>-<mesure>"), dans l'ordre d'affichage.
export const IDS_GRAPHIQUES_CLES = [
  // course à pied : à quelle vitesse, sur quelle distance, avec quel effort
  'cardio-vitesseMoyKmh',
  'cardio-distanceM',
  'cardio-fcMoy',
  // vélo
  'velo-vitesseMoyKmh',
  'velo-distanceM',
  'velo-fcMoy',
  // natation : allure aux 100 m, distance, effort
  'natation-tempsMoy100mS',
  'natation-distanceM',
  'natation-fcMoy',
  // musculation : volume (séries), durée, effort
  'muscu-nbSeries',
  'muscu-dureeS',
  'muscu-fcMoy',
] as const

// Garde les graphiques clés, dans l'ordre de IDS_GRAPHIQUES_CLES (donc groupés par sport).
// Un graphique clé sans données n'existe pas dans la réponse : il est simplement absent.
export function graphiquesCles<T extends { id: string }>(graphiques: T[]): T[] {
  return IDS_GRAPHIQUES_CLES.flatMap((id) => graphiques.filter((g) => g.id === id))
}
