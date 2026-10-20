
const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '')

export interface SeanceSBD {
  id?: number
  bench: number
  squat: number
  deadlift: number
  date?: string
}

export interface SBDRequest {
  bench: number
  squat: number
  deadlift: number
}

export type IdentifiantUtilisateur = string | number

async function envoyer(
  url: string,
  methode: 'POST' | 'PUT',
  donnees: SBDRequest,
): Promise<SeanceSBD> {
  const response = await fetch(`${API_URL}${url}`, {
    method: methode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      detail || `Erreur HTTP ${response.status}`,
    )
  }

  return response.json() as Promise<SeanceSBD>
}

export async function recupererSBD(
  utilisateurId: IdentifiantUtilisateur,
): Promise<SeanceSBD | null> {
  const response = await fetch(
    `${API_URL}/api/sbd/${utilisateurId}/aujourdhui`,
  )

  if (response.status === 204) return null

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`)
  }

  return response.json() as Promise<SeanceSBD>
}

export function validerSBD(
  utilisateurId: IdentifiantUtilisateur,
  donnees: SBDRequest,
): Promise<SeanceSBD> {
  return envoyer(
    `/api/sbd/${utilisateurId}`,
    'POST',
    donnees,
  )
}

export function modifierSBD(
  utilisateurId: IdentifiantUtilisateur,
  donnees: SBDRequest,
): Promise<SeanceSBD> {
  return envoyer(
    `/api/sbd/${utilisateurId}/aujourdhui`,
    'PUT',
    donnees,
  )
}
