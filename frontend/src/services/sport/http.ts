// Helpers partagés entre les services de sport.
// Chaque service garde son typage ; cette couche ne gère que les appels HTTP.

// Vide par défaut : les appels partent vers /api/... sur l'adresse du site, que Vite (en dev, :5173)
// et nginx (dans Docker, :3000) transmettent au backend. Même adresse pour le site et l'API,
// donc pas de souci de CORS. VITE_API_URL ne sert que pour viser un autre backend.
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type IdentifiantUtilisateur = string | number

// GET /api/<sport>/<id>/aujourdhui : renvoie la séance du jour ou null si pas encore saisie
export async function recupererAujourdhui<T>(
  chemin: string,
  utilisateurId: IdentifiantUtilisateur,
): Promise<T | null> {
  const reponse = await fetch(
    `${API_URL}${chemin}/${utilisateurId}/aujourdhui`,
  )

  if (reponse.status === 204) return null

  if (!reponse.ok) {
    throw new Error(`Erreur HTTP ${reponse.status}`)
  }

  return reponse.json() as Promise<T>
}

// POST : crée la ligne du jour (bouton « Valider »)
// PUT  : modifie la ligne du jour (bouton « Modifier »)
export async function envoyerSeance<TRequete, TReponse>(
  chemin: string,
  utilisateurId: IdentifiantUtilisateur,
  methode: 'POST' | 'PUT',
  donnees: TRequete,
): Promise<TReponse> {
  const url =
    methode === 'POST'
      ? `${API_URL}${chemin}/${utilisateurId}`
      : `${API_URL}${chemin}/${utilisateurId}/aujourdhui`

  const reponse = await fetch(url, {
    method: methode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  })

  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur HTTP ${reponse.status}`)
  }

  return reponse.json() as Promise<TReponse>
}
