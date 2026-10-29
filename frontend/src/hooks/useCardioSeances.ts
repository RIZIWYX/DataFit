import { useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import { recupererCardio, type SeanceCardio } from '../services/cardioMontreService.ts'

// À chaque ouverture de page : lecture des séances du compte connecté, sans simulation.
export default function useCardioSeances() {
  const utilisateurId = lireCompte()?.id
  const [tentative, setTentative] = useState(0)
  const [etat, setEtat] = useState<{
    utilisateurId: number | undefined
    seances: SeanceCardio[]
    tentative: number
    erreur: string
  } | null>(null)

  useEffect(() => {
    const controleur = new AbortController()
    if (utilisateurId === undefined) {
      return () => controleur.abort()
    }
    recupererCardio(utilisateurId, controleur.signal)
      .then((seances) => {
        if (!controleur.signal.aborted) setEtat({ utilisateurId, tentative, seances, erreur: '' })
      })
      .catch((erreur: unknown) => {
        if (!controleur.signal.aborted) {
          setEtat({
            utilisateurId, tentative, seances: [],
            erreur: erreur instanceof Error ? erreur.message : 'Impossible de contacter le serveur.',
          })
        }
      })
    return () => controleur.abort()
  }, [utilisateurId, tentative])

  // Un changement de compte ne doit jamais exposer les résultats du compte précédent.
  const courant = etat !== null && etat.utilisateurId === utilisateurId && etat.tentative === tentative
  return {
    seances: courant ? etat.seances : [],
    chargement: utilisateurId !== undefined && !courant,
    erreur: utilisateurId === undefined ? 'Connectez-vous pour consulter vos séances.' : courant ? etat.erreur : '',
    connecte: utilisateurId !== undefined,
    recharger: () => setTentative((n) => n + 1),
  }
}
