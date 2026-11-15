import { useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import { donnerConsentementSante, lireConsentementSante } from '../services/consentementService.ts'

// 'inconnu' : on interroge le serveur · 'donne' : l'application peut s'ouvrir
// 'absent' : pas encore consenti (compte ancien ou créé avec Google) · 'erreur' : serveur injoignable
export type StatutConsentement = 'inconnu' | 'donne' | 'absent' | 'erreur'

// Le consentement aux données de santé du compte connecté (RGPD, article 9). Les comptes créés par
// e-mail l'ont donné à l'inscription ; les autres le donnent ici, avant que l'application s'ouvre.
function useConsentementSante() {
  const [compte] = useState(lireCompte)
  // sans compte (démonstration) il n'y a rien à demander : les appels à l'API échoueraient de toute façon
  const [statut, setStatut] = useState<StatutConsentement>(compte ? 'inconnu' : 'donne')
  const [enCours, setEnCours] = useState(false)
  const [essai, setEssai] = useState(0)

  useEffect(() => {
    if (!compte) return
    let annule = false
    lireConsentementSante(compte.id)
      .then((date) => !annule && setStatut(date ? 'donne' : 'absent'))
      .catch(() => !annule && setStatut('erreur'))
    return () => {
      annule = true
    }
  }, [compte, essai])

  async function accepter() {
    if (!compte || enCours) return
    setEnCours(true)
    try {
      await donnerConsentementSante(compte.id)
      setStatut('donne')
    } catch {
      setStatut('erreur')
    } finally {
      setEnCours(false)
    }
  }

  return {
    statut,
    enCours,
    accepter,
    reessayer: () => {
      setStatut('inconnu')
      setEssai((n) => n + 1)
    },
  }
}

export default useConsentementSante
