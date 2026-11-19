// La session de connexion est un cookie HttpOnly posé par le serveur : le site ne le voit jamais,
// le navigateur le renvoie tout seul à chaque appel /api/... Quand il a expiré (ou n'existe pas
// encore : compte gardé avant cette protection), le serveur répond 401. Plutôt que d'afficher
// une erreur sur chaque page, on renvoie vers la connexion.

let installe = false

// À appeler une fois, au démarrage : surveille toutes les réponses de l'API.
export function surveillerSession() {
  if (installe) return
  installe = true

  const fetchOriginal = window.fetch.bind(window)
  window.fetch = async (entree, options) => {
    const reponse = await fetchOriginal(entree, options)
    if (reponse.status === 401 && estAppelProtege(entree) && window.location.pathname !== '/connexion') {
      window.location.assign('/connexion')
    }
    return reponse
  }
}

// les appels de connexion eux-mêmes (/api/auth/...) ne sont pas concernés : un 401 y serait
// une erreur à afficher dans le formulaire, pas une session expirée
function estAppelProtege(entree: RequestInfo | URL): boolean {
  const adresse = typeof entree === 'string' ? entree : entree instanceof URL ? entree.href : entree.url
  const chemin = adresse.replace(/^https?:\/\/[^/]+/, '')
  return chemin.startsWith('/api/') && !chemin.startsWith('/api/auth/')
}
