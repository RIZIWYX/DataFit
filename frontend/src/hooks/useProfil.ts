import { type SubmitEvent, useState } from 'react'
import { enregistrerProfil, lireProfil } from '../lib/profil.ts'

// logique de la page profil : relire le profil gardé, puis enregistrer chaque carte séparément
function useProfil() {
  const [profil, setProfil] = useState(lireProfil)
  const [messageInfos, setMessageInfos] = useState('')
  const [messagePreferences, setMessagePreferences] = useState('')
  const [messageSecurite, setMessageSecurite] = useState('')

  function enregistrerInfos(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setProfil(
      enregistrerProfil({
        prenom: String(formData.get('prenom') ?? '').trim(),
        nom: String(formData.get('nom') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        age: Number(formData.get('age')),
        taille: Number(formData.get('taille')),
        poids: Number(formData.get('poids')),
        sexe: String(formData.get('sexe') ?? ''),
      }),
    )
    setMessageInfos('Informations enregistrées dans ce navigateur.')
  }

  function enregistrerPreferences(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setProfil(
      enregistrerProfil({
        activites: formData.getAll('activites').map(String),
        niveau: String(formData.get('niveau') ?? ''),
        objectif: String(formData.get('objectif') ?? '').trim(),
      }),
    )
    setMessagePreferences('Préférences enregistrées dans ce navigateur.')
  }

  // Démonstration : pas de compte ni de mot de passe sans backend.
  function modifierMotDePasse() {
    setMessageSecurite('Le changement de mot de passe sera possible quand les comptes existeront.')
  }

  return {
    profil,
    enregistrerInfos,
    messageInfos,
    enregistrerPreferences,
    messagePreferences,
    modifierMotDePasse,
    messageSecurite,
  }
}

export default useProfil
