// Service de l'abonnement premium : appels REST vers /api/abonnement.
// Le paiement se fait sur les pages de Stripe : le backend renvoie seulement l'adresse où aller.
import type { Abonnement, Periodicite } from '../lib/abonnement.ts'
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

const CHEMIN = '/api/abonnement'

async function verifier(reponse: Response) {
  if (reponse.ok) return
  let message = `Erreur HTTP ${reponse.status}`
  try {
    message = ((await reponse.json()) as { error?: string }).error ?? message
  } catch {
    // réponse sans JSON : on garde le code HTTP
  }
  throw new Error(message)
}

const post = (corps?: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: corps === undefined ? undefined : JSON.stringify(corps),
})

// l'abonnement en cours, ou null pour la formule gratuite
export async function lireAbonnement(id: IdentifiantUtilisateur): Promise<Abonnement | null> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${id}`)
  if (reponse.status === 204) return null
  await verifier(reponse)
  return reponse.json() as Promise<Abonnement>
}

// adresse de la page de paiement Stripe
export async function demanderPaiement(id: IdentifiantUtilisateur, periodicite: Periodicite): Promise<string> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${id}/paiement`, post({ periodicite }))
  await verifier(reponse)
  return ((await reponse.json()) as { url: string }).url
}

// adresse du portail Stripe (gérer, changer de formule, résilier, réactiver)
export async function demanderPortail(id: IdentifiantUtilisateur): Promise<string> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${id}/portail`, post())
  await verifier(reponse)
  return ((await reponse.json()) as { url: string }).url
}
