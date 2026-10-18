import { type SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { lireCompte } from '../lib/compte.ts'
import { bornesNaissance, enregistrerProfil } from '../lib/profil.ts'

// Logique de la page de création du profil, juste après l'inscription :
// tout est obligatoire, et l'application reste fermée tant que le profil n'est pas enregistré
function useCreationProfil() {
  const [compte] = useState(lireCompte)
  const [bornes] = useState(() => bornesNaissance())
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!compte || envoi) return
    setErreur('')

    const formData = new FormData(event.currentTarget)
    const texte = (nom: string) => String(formData.get(nom) ?? '').trim()

    // les cases à cocher ne peuvent pas être rendues obligatoires par le navigateur
    const activites = formData.getAll('activites').map(String)
    if (activites.length === 0) {
      setErreur('Choisissez au moins une activité.')
      return
    }

    const profil = {
      prenom: texte('prenom'),
      nom: texte('nom'),
      dateNaissance: texte('dateNaissance'),
      sexe: texte('sexe'),
      taille: Number(texte('taille')),
      poids: Number(texte('poids')),
      niveau: texte('niveau'),
      activites,
      objectif: texte('objectif'),
    }

    setEnvoi(true)
    try {
      const response = await fetch(
        '/api/profil/register/profil',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            utilisateurId: compte.id,
            prenom: profil.prenom,
            nom: profil.nom,
            dateNaissance: profil.dateNaissance,
            sexe: profil.sexe,
            taille: profil.taille,
            poids: profil.poids,
            niveau: profil.niveau,
            // la table n'a qu'une colonne « activite » : les activités y sont séparées par des virgules
            activite: activites.join(','),
            objectif: profil.objectif,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        // 5xx : backend arrêté (le proxy répond à sa place) ou en panne.
        // Sinon, nos contrôleurs renvoient { error: "message en français" } ;
        // les erreurs produites par Spring lui-même (validation…) ont un champ path et un texte technique
        setErreur(
          response.status >= 500
            ? 'Le serveur ne répond pas correctement. Vérifiez que le backend est démarré.'
            : data.error && !data.path
              ? data.error
              : 'Le serveur a refusé le profil. Vérifiez les informations, puis réessayez.'
        )
        return
      }

      // gardé aussi dans le navigateur : les pages de l'application le lisent ici
      enregistrerProfil({ ...profil, email: compte.email })
      navigate('/dashboard', { replace: true })
    } catch {
      setErreur(
        'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
      )
    } finally {
      setEnvoi(false)
    }
  }

  return {
    compte,
    bornes,
    erreur,
    envoi,
    handleSubmit,
  }
}

export default useCreationProfil
