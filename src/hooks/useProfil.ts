import { type SubmitEvent, useState } from 'react'

// logique de la page profil : lecture du formulaire et enregistrement
function useProfil() {
  const [message, setMessage] = useState('')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const profil = {
      prenom: String(formData.get('prenom') ?? ''),
      nom: String(formData.get('nom') ?? ''),
      age: Number(formData.get('age')),
      taille: Number(formData.get('taille')),
      poids: Number(formData.get('poids')),
      sport: String(formData.get('sport') ?? ''),
      sexe: String(formData.get('sexe') ?? ''),
      niveau: String(formData.get('niveau') ?? ''),
    }

    // Démonstration uniquement : à remplacer par un appel API/backend.
    sessionStorage.setItem('datafit-profil-demo', JSON.stringify(profil))
    setMessage('Profil enregistré temporairement dans ce navigateur (mode démonstration).')
  }

  return { message, handleSubmit }
}

export default useProfil
