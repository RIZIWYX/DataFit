import { useNavigate } from 'react-router'
import { oublierIdentite } from '../lib/compte.ts'
import { effacerProfil } from '../lib/profil.ts'

// La déconnexion est une action, pas une page : on ferme la session côté serveur (le cookie
// de session est effacé par la réponse), on retire du navigateur le compte et le profil, puis on
// revient à la page de connexion.
// Même si le serveur ne répond pas, on part : la session expirera d'elle-même.
function useDeconnexion() {
  const navigate = useNavigate()
  return async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // serveur injoignable : rien de plus à faire ici
    }
    oublierIdentite()
    effacerProfil()
    navigate('/connexion')
  }
}

export default useDeconnexion
