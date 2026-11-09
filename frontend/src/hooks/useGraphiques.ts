import { useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import { recupererGraphiques, type ReponseGraphiques } from '../services/graphiquesService.ts'

export function useGraphiques(chemin: string | null) {
  const [tentative, setTentative] = useState(0)
  const cle = `${chemin}:${tentative}`
  const [etat, setEtat] = useState<{ cle: string; resultat: ReponseGraphiques | null; erreur: string } | null>(null)
  useEffect(() => {
    if (!chemin) return
    const controleur = new AbortController()
    recupererGraphiques(chemin, controleur.signal).then((resultat) => {
      if (!controleur.signal.aborted) setEtat({ cle, resultat, erreur: '' })
    }).catch((e: unknown) => {
      if (!controleur.signal.aborted) setEtat({ cle, resultat: null,
        erreur: e instanceof Error ? e.message : 'Impossible de contacter le serveur.' })
    })
    return () => controleur.abort()
  }, [chemin, cle])
  const courant = etat?.cle === cle
  return {
    graphiques: courant && etat?.resultat ? etat.resultat.graphiques : [],
    chargement: chemin !== null && !courant,
    erreur: courant ? etat?.erreur ?? '' : '',
    absent: chemin !== null && courant && !etat?.erreur && etat?.resultat === null,
    recharger: () => setTentative((n) => n + 1),
  }
}
export function useGraphiquesSeance(id: string | undefined) {
  const utilisateur = lireCompte()?.id
  const match = id?.match(/^(cardio|velo|natation|muscu)-(\d+)$/)
  const chemin = utilisateur && match
    ? `/api/seances/${match[1]}/${utilisateur}/${match[2]}/graphiques` : null
  return useGraphiques(chemin)
}
// Les courbes d'une nuit (FC, mouvements, phases), conservées à la synchronisation.
export function useGraphiquesNuit(id: string | undefined) {
  const utilisateur = lireCompte()?.id
  const chemin = utilisateur && id && /^\d+$/.test(id) ? `/api/sommeil/${utilisateur}/${id}/graphiques` : null
  return useGraphiques(chemin)
}
// L'évolution des nuits enregistrées (durée, efficacité, FC...), d'après la table sommeil.
// `version` change à chaque nouvelle nuit reçue : les graphiques sont alors recalculés.
export function useGraphiquesNuits(version: number) {
  const utilisateur = lireCompte()?.id
  return useGraphiques(utilisateur ? `/api/sommeil/${utilisateur}/graphiques?nuits=${version}` : null)
}
