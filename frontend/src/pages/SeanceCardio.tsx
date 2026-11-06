import { Navigate, useParams } from 'react-router'

// Compatibilité avec les anciens liens de l'historique cardio.
export default function SeanceCardio() {
  const { id } = useParams()
  return <Navigate to={`/historique/cardio-${id}`} replace />
}
