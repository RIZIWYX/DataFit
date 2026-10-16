// Écart entre deux périodes, prêt à afficher sous un chiffre clé (composant Indicateur).

// texte : l'écart sans signe (« 12 min ») ; le sens donne la flèche
export type Ecart = { sens: 'hausse' | 'baisse' | 'stable'; texte: string }

// « 12 min » en hausse, « 1 » en baisse, ou « Stable » quand l'écart arrondi est nul
export function ecart(valeur: number, avant: number, texte: (n: number) => string): Ecart {
  const difference = valeur - avant
  if (texte(Math.abs(difference)) === texte(0)) return { sens: 'stable', texte: 'Stable' }
  return { sens: difference > 0 ? 'hausse' : 'baisse', texte: texte(Math.abs(difference)) }
}
