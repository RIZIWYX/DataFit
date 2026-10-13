import { Link } from 'react-router'
import PageLegale from '../components/PageLegale.tsx'
import { CONTACT_EMAIL, DEPOT_GITHUB } from '../data/projet.ts'

function Cgu() {
  return (
    <PageLegale titre="Conditions générales d'utilisation">
      <p>
        Ces conditions s'appliquent à l'utilisation du site DataFit. En créant un compte, tu
        reconnais les avoir lues et les accepter.
      </p>

      <section>
        <h2>Article 1 : Objet</h2>
        <p>
          Les présentes conditions générales d'utilisation (CGU) définissent les règles d'accès
          et d'utilisation de DataFit, ainsi que les engagements réciproques entre l'équipe
          projet et toute personne qui utilise le service (l'« utilisateur »).
        </p>
      </section>

      <section>
        <h2>Article 2 : Présentation du service</h2>
        <p>
          DataFit est un projet universitaire réalisé par une équipe de six étudiants de L3
          Informatique et de L3 Sciences des données de l'Université de Rouen Normandie. Il
          permet d'enregistrer ses séances de sport, d'en analyser l'effort, de suivre sa
          progression et d'obtenir un rang par exercice.
        </p>
        <p>
          Le service est gratuit et non commercial. Il est en cours de développement : ses
          fonctionnalités peuvent être ajoutées, modifiées ou retirées à tout moment.
        </p>
      </section>

      <section>
        <h2>Article 3 : Disponibilité</h2>
        <p>
          L'équipe fait de son mieux pour que DataFit fonctionne correctement, sans pouvoir le
          garantir : elle est tenue à une obligation de moyens, et non de résultat. Le service
          peut être interrompu, notamment pour maintenance, en cas de problème de sécurité ou
          à la fin du projet universitaire.
        </p>
        <p>
          Pour utiliser DataFit, tu as besoin d'un accès à Internet, à ta charge. Certaines
          fonctionnalités nécessitent une montre ou une ceinture cardio compatible.
        </p>
      </section>

      <section>
        <h2>Article 4 : Ton compte</h2>
        <p>
          La création d'un compte est nécessaire pour enregistrer tes séances. Tu t'engages à
          fournir des informations exactes et à ne créer un compte que pour toi-même.
        </p>
        <p>
          Tu es responsable de la confidentialité de ton mot de passe. Si tu penses qu'il a été
          découvert par quelqu'un d'autre, change-le sans attendre et préviens l'équipe.
        </p>
        <p>
          Tu peux supprimer ton compte à tout moment. L'équipe peut suspendre ou supprimer un
          compte qui ne respecte pas les présentes CGU.
        </p>
      </section>

      <section>
        <h2>Article 5 : Règles d'utilisation</h2>
        <p>En utilisant DataFit, tu t'engages à ne pas :</p>
        <ul>
          <li>tenter d'accéder aux comptes ou aux données d'autres utilisateurs ;</li>
          <li>perturber le fonctionnement du service ou chercher à en contourner la sécurité ;</li>
          <li>envoyer volontairement de fausses données en masse ou automatiser des requêtes abusives ;</li>
          <li>utiliser le service à des fins illégales.</li>
        </ul>
        <p>
          Si tu découvres une faille de sécurité, merci de la signaler à l'équipe plutôt que de
          l'exploiter.
        </p>
      </section>

      <section>
        <h2>Article 6 : Santé et pratique sportive</h2>
        <p>
          DataFit n'est pas un dispositif médical. Les analyses, alertes et rangs sont donnés à
          titre indicatif : ils ne remplacent pas l'avis d'un médecin ou d'un entraîneur
          qualifié.
        </p>
        <p>
          Avant de commencer ou d'intensifier une activité physique, demande l'avis d'un
          professionnel de santé, surtout en cas de problème de santé connu. Tu restes seul
          responsable de ta pratique : les rangs sont un repère, pas un objectif à atteindre à
          tout prix.
        </p>
      </section>

      <section>
        <h2>Article 7 : Propriété intellectuelle</h2>
        <p>
          Le code, le design, les textes, le logo et le système de rangs de DataFit appartiennent
          à l'équipe projet. Leur reproduction, en tout ou en partie, nécessite son accord,
          sauf mention contraire dans le{' '}
          <a href={DEPOT_GITHUB} target="_blank" rel="noopener noreferrer">dépôt du projet</a>.
        </p>
        <p>
          Les données que tu enregistres (séances, performances, profil) restent les tiennes.
        </p>
      </section>

      <section>
        <h2>Article 8 : Responsabilité</h2>
        <p>
          DataFit est fourni en l'état, dans le cadre d'un projet étudiant. L'équipe ne peut être
          tenue responsable d'une interruption du service, d'une perte de données ou d'une
          erreur dans les calculs. Elle n'est pas non plus responsable des appareils et services
          tiers (montres, ceintures cardio, hébergeurs) utilisés avec DataFit.
        </p>
      </section>

      <section>
        <h2>Article 9 : Données personnelles</h2>
        <p>
          La façon dont nous collectons et protégeons tes données est décrite dans notre{' '}
          <Link to="/donnees-personnelles">politique de confidentialité</Link>.
        </p>
      </section>

      <section>
        <h2>Article 10 : Modification des CGU</h2>
        <p>
          Ces CGU peuvent évoluer avec le projet. La date en haut de page indique la dernière
          mise à jour. En cas de changement important, tu en seras informé ; si tu n'acceptes
          pas les nouvelles conditions, tu peux supprimer ton compte.
        </p>
      </section>

      <section>
        <h2>Article 11 : Contact et loi applicable</h2>
        <p>
          Pour toute question sur ces CGU, contacte l'équipe{' '}
          {CONTACT_EMAIL ? (
            <>à l'adresse <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></>
          ) : (
            <>via la <a href={DEPOT_GITHUB} target="_blank" rel="noopener noreferrer">page GitHub du projet</a></>
          )}
          . Les présentes CGU sont régies par la loi française.
        </p>
      </section>
    </PageLegale>
  )
}

export default Cgu
