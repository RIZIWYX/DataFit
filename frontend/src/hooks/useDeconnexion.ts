import { useNavigate } from 'react-router'

// La déconnexion est une action, pas une page.
// Démonstration : il n'y a pas encore de comptes côté serveur, se déconnecter ramène donc
// à la page de connexion (comme l'ancien lien de la barre latérale). Quand l'authentification
// existera, c'est ici qu'on fermera la session avant de partir.
function useDeconnexion() {
  const navigate = useNavigate()
  return () => navigate('/connexion')
}

export default useDeconnexion
