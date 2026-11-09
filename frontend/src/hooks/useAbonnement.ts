import { useCallback, useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import type { Abonnement, Periodicite } from '../lib/abonnement.ts'
import * as service from '../services/abonnementService.ts'

// état de l'abonnement du compte connecté, lu et modifié via le backend (aucun paiement réel)
function useAbonnement() {
  const compte = lireCompte()
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null)
  const [chargement, setChargement] = useState(compte !== null)
  const [enCours, setEnCours] = useState(false) // une action est en cours d'envoi
  const [erreur, setErreur] = useState<string | null>(null)
  const id = compte?.id

  const recharger = useCallback(async () => {
    if (id === undefined) return
    setChargement(true)
    setErreur(null)
    try {
      setAbonnement(await service.lireAbonnement(id))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Chargement impossible.')
    } finally {
      setChargement(false)
    }
  }, [id])

  useEffect(() => {
    void recharger()
  }, [recharger])

  // envoie une action puis affiche l'état renvoyé par le backend
  const agir = async (action: (id: number) => Promise<Abonnement | null>) => {
    if (id === undefined) return
    setEnCours(true)
    setErreur(null)
    try {
      setAbonnement(await action(id))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Action impossible.')
    } finally {
      setEnCours(false)
    }
  }

  return {
    connecte: compte !== null,
    abonnement,
    chargement,
    enCours,
    erreur,
    recharger,
    souscrire: (p: Periodicite) => agir((i) => service.souscrire(i, p)),
    resilier: () => agir(service.resilier),
    reactiver: () => agir(service.reactiver),
    changerPeriodicite: (p: Periodicite) => agir((i) => service.changerPeriodicite(i, p)),
  }
}

export default useAbonnement
