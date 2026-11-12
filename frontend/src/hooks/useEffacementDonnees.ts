import { type SubmitEvent, useState } from 'react'
import { CATEGORIES_DONNEES, type CategorieDonnees, lireCompte, oublierDonnees } from '../lib/compte.ts'
import { effacerDonnees } from '../services/compteService.ts'

// « Effacer mes données » sur la page Profil : un bouton ouvre la confirmation, on coche ce qu'on
// efface, le mot de passe confirme. Le compte et le profil restent.
function useEffacementDonnees() {
  const [ouvert, setOuvert] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')

  async function confirmer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const compte = lireCompte()
    if (!compte) {
      setErreur("Aucun compte n'est connecté dans ce navigateur : reconnectez-vous puis réessayez.")
      return
    }
    const donnees = new FormData(event.currentTarget)
    const choisies = donnees.getAll('categorie').map(String) as CategorieDonnees[]
    if (choisies.length === 0) {
      setErreur('Cochez au moins une catégorie de données.')
      return
    }

    setEnCours(true)
    setErreur('')
    try {
      await effacerDonnees(compte.id, String(donnees.get('mot-de-passe') ?? ''), choisies)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Les données n'ont pas pu être effacées.")
      setEnCours(false)
      return
    }

    // effacées sur le serveur : leur copie dans ce navigateur part aussi
    oublierDonnees(compte.id, choisies)
    const noms = CATEGORIES_DONNEES.filter((c) => choisies.includes(c.valeur)).map((c) => c.nom.toLowerCase())
    setMessage(`Effacé : ${noms.join(', ')}.`)
    setEnCours(false)
    setOuvert(false)
  }

  return {
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

export default useEffacementDonnees
