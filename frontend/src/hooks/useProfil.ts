import { useEffect, useState } from 'react'
import { lireCompte } from '../lib/compte.ts'
import { type Profil, enregistrerProfil, lireProfil } from '../lib/profil.ts'
import { chargerProfil, modifierProfil } from '../services/profilService.ts'

export type ChampProfil =
  | 'prenom'
  | 'nom'
  | 'email'
  | 'dateNaissance'
  | 'taille'
  | 'poids'
  | 'sexe'
  | 'niveau'
  | 'activites'
  | 'objectif'

// logique de la page profil : les informations, affichées en lecture,
// et modifiées une par une (un seul champ ouvert à la fois).
// Le profil est enregistré en base ; une copie reste dans le navigateur pour les autres pages.
function useProfil() {
  const [profil, setProfil] = useState(lireProfil)
  const [enEdition, setEnEdition] = useState<ChampProfil | null>(null)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [utilisateurId] = useState(() => lireCompte()?.id)

  // au chargement : la version en base fait foi (profil modifié depuis un autre appareil…)
  useEffect(() => {
    if (utilisateurId === undefined) return
    let annule = false
    chargerProfil(utilisateurId)
      .then((enBase) => {
        if (!annule && enBase) setProfil(enregistrerProfil(enBase))
      })
      .catch(() => {
        // backend injoignable : on garde la copie du navigateur
      })
    return () => {
      annule = true
    }
  }, [utilisateurId])

  async function enregistrer(modifications: Partial<Profil>, confirmation: string) {
    if (!profil || envoi) return
    setErreur('')

    if (modifications.activites?.length === 0) {
      setErreur('Choisissez au moins une activité.')
      return
    }

    // sans compte (démonstration) : seulement dans le navigateur
    if (utilisateurId === undefined) {
      setProfil(enregistrerProfil(modifications))
      setEnEdition(null)
      setMessage(confirmation)
      return
    }

    setEnvoi(true)
    try {
      const enBase = await modifierProfil(utilisateurId, { ...profil, ...modifications })
      setProfil(enregistrerProfil(enBase))
      setEnEdition(null)
      setMessage(confirmation)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Impossible de contacter le serveur.')
    } finally {
      setEnvoi(false)
    }
  }

  return {
    profil,
    enEdition,
    editer: (champ: ChampProfil) => {
      setEnEdition(champ)
      setMessage('')
      setErreur('')
    },
    annuler: () => {
      setEnEdition(null)
      setErreur('')
    },
    enregistrer,
    message,
    erreur,
    envoi,
  }
}

export default useProfil
