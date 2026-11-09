// Service de l'abonnement premium : appels REST vers /api/abonnement.
import type { Abonnement, Periodicite } from '../lib/abonnement.ts'
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

const CHEMIN = '/api/abonnement'

async function lireReponse(reponse: Response): Promise<Abonnement | null> {
  if (reponse.status === 204) return null
  if (!reponse.ok) {
    let message = `Erreur HTTP ${reponse.status}`
    try {
      message = ((await reponse.json()) as { error?: string }).error ?? message
    } catch {
      // réponse sans JSON : on garde le code HTTP
    }
    throw new Error(message)
  }
  return reponse.json() as Promise<Abonnement>
}

const json = (methode: string, corps?: unknown): RequestInit => ({
  method: methode,
  headers: { 'Content-Type': 'application/json' },
  body: corps === undefined ? undefined : JSON.stringify(corps),
})

// l'abonnement en cours, ou null pour la formule gratuite
export async function lireAbonnement(id: IdentifiantUtilisateur) {
  return lireReponse(await fetch(`${API_URL}${CHEMIN}/${id}`))
}

export async function souscrire(id: IdentifiantUtilisateur, periodicite: Periodicite) {
  return lireReponse(await fetch(`${API_URL}${CHEMIN}/${id}`, json('POST', { periodicite })))
}

export async function resilier(id: IdentifiantUtilisateur) {
  return lireReponse(await fetch(`${API_URL}${CHEMIN}/${id}/resilier`, json('POST')))
}

export async function reactiver(id: IdentifiantUtilisateur) {
  return lireReponse(await fetch(`${API_URL}${CHEMIN}/${id}/reactiver`, json('POST')))
}

export async function changerPeriodicite(id: IdentifiantUtilisateur, periodicite: Periodicite) {
  return lireReponse(await fetch(`${API_URL}${CHEMIN}/${id}/periodicite`, json('PUT', { periodicite })))
}
