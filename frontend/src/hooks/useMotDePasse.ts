import { type SubmitEvent, useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import { changerMotDePasse, lireEtatMotDePasse } from '../services/compteService.ts'

export const LONGUEUR_MIN_MOT_DE_PASSE = 8

// Changement du mot de passe depuis la page Profil : un bouton ouvre le formulaire
// (actuel, nouveau, confirmation). Un compte créé avec Google n'a pas de mot de passe connu :
// on lui propose d'en définir un, sans demander l'actuel.
function useMotDePasse() {
  const [utilisateurId] = useState(() => lireCompte()?.id)
  // null tant que le serveur n'a pas répondu (ou sans compte) : on suppose un mot de passe défini
  const [defini, setDefini] = useState<boolean | null>(null)
  const [ouvert, setOuvert] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (utilisateurId === undefined) return
    let annule = false
    lireEtatMotDePasse(utilisateurId)
      .then((etat) => {
        if (!annule) setDefini(etat)
      })
      .catch(() => {
        // serveur injoignable : le formulaire demandera le mot de passe actuel
      })
    return () => {
      annule = true
    }
  }, [utilisateurId])

  const aUnMotDePasse = defini !== false

  async function confirmer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enCours) return
    if (utilisateurId === undefined) {
      setErreur("Aucun compte n'est connecté dans ce navigateur : reconnectez-vous puis réessayez.")
      return
    }

    const donnees = new FormData(event.currentTarget)
    const actuel = String(donnees.get('mot-de-passe-actuel') ?? '')
    const nouveau = String(donnees.get('nouveau-mot-de-passe') ?? '')
    const confirmation = String(donnees.get('confirmation-mot-de-passe') ?? '')

    // mêmes règles que le serveur, pour répondre tout de suite
    if (nouveau.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      setErreur(`Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`)
      return
    }
    if (nouveau !== confirmation) {
      setErreur('Les deux mots de passe ne sont pas identiques.')
      return
    }
    if (aUnMotDePasse && nouveau === actuel) {
      setErreur("Le nouveau mot de passe doit être différent de l'ancien.")
      return
    }

    setEnCours(true)
    setErreur('')
    try {
      await changerMotDePasse(utilisateurId, aUnMotDePasse ? actuel : '', nouveau)
      setMessage(aUnMotDePasse ? 'Mot de passe modifié.' : 'Mot de passe défini.')
      setDefini(true)
      setOuvert(false)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Le mot de passe n'a pas pu être changé.")
    } finally {
      setEnCours(false)
    }
  }

  return {
    aUnMotDePasse,
    ouvert,
    enCours,
    erreur,
    message,
    ouvrir: () => {
      setOuvert(true)
      setErreur('')
      setMessage('')
    },
    fermer: () => {
      setOuvert(false)
      setErreur('')
    },
    confirmer,
  }
}

export default useMotDePasse
