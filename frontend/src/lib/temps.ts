// Les temps des épreuves (athlétisme, natation) : un seul format partout sur la page Performance.
// En base et dans les calculs, un temps est toujours un nombre de secondes (décimales possibles :
// 10,85 s au 100 m). À l'écran, il s'écrit comme sur un chrono :
//   moins d'une minute -> 10,85      moins d'une heure -> 4:30 (ou 4:30,5)      sinon -> 1:25:00

// Exemples montrés quand un temps n'est pas compris
export const FORMATS_TEMPS = '10,85 · 4:30 · 1:25:00'

const deuxChiffres = (n: number) => String(n).padStart(2, '0')

// Lit un temps tapé : "10,85" -> 10,85 s ; "4:30" -> 270 s ; "4:30,5" -> 270,5 s ; "1:25:00" -> 5100 s.
// Renvoie NaN si le texte n'est pas un temps : lettres, "4:5" (il faut "4:05"), "4:75" (75 secondes),
// trop de ":", ou un temps nul.
export function lireTemps(texte: string): number {
  const t = texte.trim().replace(',', '.')
  // un nombre, puis au plus deux groupes ":00", et des décimales seulement à la fin
  if (!/^\d+(:\d{2}){0,2}(\.\d+)?$/.test(t)) return NaN
  const morceaux = t.split(':').map(Number)
  // après le premier nombre, les minutes et les secondes vont de 0 à 59
  if (morceaux.slice(1).some((v) => v >= 60)) return NaN
  const secondes = morceaux.reduce((total, v) => total * 60 + v, 0)
  return secondes > 0 ? secondes : NaN
}

// Écrit un temps au format habituel, celui qu'on retape tel quel : 10,85 · 4:30 · 4:30,5 · 1:25:00.
// Arrondi au centième. Rien pour un temps nul ou absent.
export function ecrireTemps(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes <= 0) return ''
  const centiemes = Math.round(secondes * 100)
  const h = Math.floor(centiemes / 360000)
  const m = Math.floor((centiemes % 360000) / 6000)
  const s = ((centiemes % 6000) / 100).toLocaleString('fr-FR', {
    minimumIntegerDigits: h || m ? 2 : 1, // "4:05", mais "9,8" tout seul
    maximumFractionDigits: 2,
  })
  if (h) return `${h}:${deuxChiffres(m)}:${s}`
  if (m) return `${m}:${s}`
  return s
}

// Un temps affiché (paliers, records, écart au rang suivant) : comme à la saisie, avec « s »
// quand il fait moins d'une minute pour qu'on ne le prenne pas pour un autre nombre.
export function formatTemps(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes <= 0) return '0 s'
  const texte = ecrireTemps(secondes)
  return secondes < 59.995 ? `${texte} s` : texte
}

// Un exemple de temps réaliste pour une épreuve, tiré de ses paliers (le rang B) :
// "12,5" pour un 100 m, "21:00" pour un 5 km, "3:15:00" pour un marathon.
export function exempleTemps(paliers: number[] | undefined): string {
  const repere = paliers?.[3]
  return repere ? ecrireTemps(repere) : '4:30'
}
