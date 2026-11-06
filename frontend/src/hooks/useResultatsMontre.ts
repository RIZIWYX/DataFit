import { useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import { recupererNuits, recupererSeances } from '../services/resultatsMontreService.ts'

// Les résultats sont relus à l'ouverture et après une synchronisation réussie.
function useResultats<T>(charger: (id: number, signal: AbortSignal) => Promise<{ donnees: T[]; erreur: string }>) {
  const utilisateurId = lireCompte()?.id
  const [tentative, setTentative] = useState(0)
  const [etat, setEtat] = useState<{ utilisateurId: number; tentative: number; donnees: T[]; erreur: string } | null>(null)
  useEffect(() => {
    const actualiser = () => setTentative((n) => n + 1)
    window.addEventListener('datafit-synchronisation', actualiser)
    return () => window.removeEventListener('datafit-synchronisation', actualiser)
  }, [])
  useEffect(() => {
    const controleur = new AbortController()
    if (utilisateurId === undefined) return
    charger(utilisateurId, controleur.signal).then((resultat) => {
      if (!controleur.signal.aborted) setEtat({ utilisateurId, tentative, ...resultat })
    }).catch((e: unknown) => {
      if (!controleur.signal.aborted) setEtat({ utilisateurId, tentative, donnees: [],
        erreur: e instanceof Error ? e.message : 'Impossible de contacter le serveur.' })
    })
    return () => controleur.abort()
  }, [utilisateurId, tentative, charger])
  const courant = etat?.utilisateurId === utilisateurId && etat?.tentative === tentative
  return {
    donnees: courant && etat ? etat.donnees : [],
    chargement: utilisateurId !== undefined && !courant,
    erreur: utilisateurId === undefined ? 'Connectez-vous pour consulter vos résultats.' : courant && etat ? etat.erreur : '',
    connecte: utilisateurId !== undefined,
    recharger: () => setTentative((n) => n + 1),
  }
}
export const useSeancesMontre = () => {
  const { donnees, ...etat } = useResultats(recupererSeances)
  return { seances: donnees, ...etat }
}
export const useNuitsMontre = () => {
  const { donnees, ...etat } = useResultats(recupererNuits)
  return { nuits: donnees, ...etat }
}
