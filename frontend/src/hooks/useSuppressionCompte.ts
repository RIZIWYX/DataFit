import { type SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { lireCompte, oublierCompte } from '../lib/compte.ts'
import { effacerProfil } from '../lib/profil.ts'
import { supprimerCompte } from '../services/compteService.ts'

// Suppression du compte depuis la page Profil : un bouton ouvre la confirmation, le mot de passe
// confirme, puis on efface ce que gardait le navigateur et on revient à la page de garde.
function useSuppressionCompte() {
  const navigate = useNavigate()
  const [ouverte, setOuverte] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function confirmer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const compte = lireCompte()
    if (!compte) {
      setErreur("Aucun compte n'est connecté dans ce navigateur : reconnectez-vous puis réessayez.")
      return
    }

    setEnCours(true)
    setErreur('')
    try {
      await supprimerCompte(compte.id, String(new FormData(event.currentTarget).get('mot-de-passe') ?? ''))
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Le compte n'a pas pu être supprimé.")
      setEnCours(false)
      return
    }

    // le compte n'existe plus : rien ne doit rester de lui dans ce navigateur
    oublierCompte(compte.id)
    effacerProfil()
    // replace : le bouton « retour » du navigateur ne ramène pas sur un profil qui n'existe plus
    navigate('/', { replace: true })
  }

  return {
    ouverte,
    enCours,
    erreur,
    ouvrir: () => {
      setOuverte(true)
      setErreur('')
    },
    fermer: () => {
      setOuverte(false)
      setErreur('')
    },
    confirmer,
  }
}

export default useSuppressionCompte
