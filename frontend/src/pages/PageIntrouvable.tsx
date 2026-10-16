import LienFleche from '../components/LienFleche.tsx'
import TitrePage from '../components/TitrePage.tsx'

// toute adresse inconnue de l'application
function PageIntrouvable() {
  return (
    <div className="ecran">
      <TitrePage surtitre="Erreur 404" titre="Page introuvable">
        Cette page n'existe pas, ou plus. Le lien est peut-être incomplet.
      </TitrePage>
      <LienFleche to="/dashboard">Retour à l'accueil</LienFleche>
    </div>
  )
}

export default PageIntrouvable
