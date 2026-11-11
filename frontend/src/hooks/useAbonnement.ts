import { useCallback, useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import type { Abonnement, Periodicite } from '../lib/abonnement.ts'
import * as service from '../services/abonnementService.ts'

// au retour de Stripe, le webhook peut arriver quelques secondes après : on relit plusieurs fois
const ESSAIS_APRES_PAIEMENT = 8
const DELAI_ESSAI_MS = 2000

// état de l'abonnement du compte connecté (lu sur le backend) et redirections vers Stripe
function useAbonnement(retourPaiement: boolean) {
  const compte = lireCompte()
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null)
  const [chargement, setChargement] = useState(compte !== null)
  const [enCours, setEnCours] = useState(false) // redirection vers Stripe en préparation
  const [activation, setActivation] = useState(retourPaiement) // paiement fait, abonnement pas encore reçu
  const [erreur, setErreur] = useState<string | null>(null)
  const id = compte?.id

  const recharger = useCallback(async () => {
    if (id === undefined) return null
    setChargement(true)
    setErreur(null)
    try {
      const lu = await service.lireAbonnement(id)
      setAbonnement(lu)
      return lu
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Chargement impossible.')
      return null
    } finally {
      setChargement(false)
    }
  }, [id])

  useEffect(() => {
    let annule = false
    void (async () => {
      let lu = await recharger()
      // retour de Stripe : on attend que le webhook ait enregistré l'abonnement
      for (let essai = 1; retourPaiement && !lu && !annule && essai < ESSAIS_APRES_PAIEMENT; essai++) {
        await new Promise((fin) => setTimeout(fin, DELAI_ESSAI_MS))
        if (!annule) lu = await recharger()
      }
      if (!annule) setActivation(false)
    })()
    return () => { annule = true }
  }, [recharger, retourPaiement])

  // demande l'adresse Stripe au backend puis quitte le site pour y aller
  const allerSur = async (demande: (id: number) => Promise<string>) => {
    if (id === undefined) return
    setEnCours(true)
    setErreur(null)
    try {
      window.location.assign(await demande(id))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Paiement indisponible.')
      setEnCours(false)
    }
  }

  return {
    connecte: compte !== null,
    abonnement,
    chargement,
    enCours,
    activation,
    erreur,
    recharger,
    payer: (p: Periodicite) => allerSur((i) => service.demanderPaiement(i, p)),
    gerer: () => allerSur(service.demanderPortail),
  }
}

export default useAbonnement
