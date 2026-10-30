import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

// Champs JSON de l'entité Java montre/cardio/Cardio, renvoyés par le GET.
export interface SeanceCardio {
  id: number
  date: string
  nom: string
  fcMoy: number
  fcMin: number
  fcMax: number
  correlationVitesseFc: number | null
  dureeS: number
  distanceM: number
  vitesseMoyKmh: number
  vitesseMaxKmh: number
  tempsMoy1kmS: number
  variationVitesse: number | null
}

export async function recupererCardio(
  utilisateurId: IdentifiantUtilisateur,
  signal?: AbortSignal,
): Promise<SeanceCardio[]> {
  const reponse = await fetch(
    `${API_URL}/api/seances/cardio/${encodeURIComponent(utilisateurId)}`,
    { signal },
  )
  if (!reponse.ok) {
    throw new Error(`Impossible de charger les séances cardio (HTTP ${reponse.status}).`)
  }
  const donnees: unknown = await reponse.json()
  if (!Array.isArray(donnees)) throw new Error('Le serveur a renvoyé un historique invalide.')
  return donnees as SeanceCardio[]
}
