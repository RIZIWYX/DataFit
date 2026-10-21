import { Link } from 'react-router'
import PageLegale from '../components/PageLegale.tsx'
import { CONTACT_EMAIL, DEPOT_GITHUB } from '../data/projet.ts'

// résumé en questions / réponses, affiché en tête de page
const RESUME = [
  {
    theme: 'Collecte et partage',
    questions: [
      ['Vendons-nous tes données personnelles ?', 'Non'],
      ['Partageons-nous tes données avec des partenaires ou des annonceurs ?', 'Non'],
      ['Utilisons-nous des données de santé, comme ta fréquence cardiaque ?', 'Oui, avec ton accord'],
      ['Supprimons-nous tes données si tu supprimes ton compte ?', 'Oui'],
    ],
  },
  {
    theme: 'Suivi',
    questions: [
      ['Enregistrons-nous ta position pendant une séance ?', 'Oui'],
      ["Enregistrons-nous ta position en dehors d'une séance ?", 'Non'],
      ['Utilisons-nous des cookies publicitaires ou de mesure d\'audience ?', 'Non'],
      ['Suivons-nous ta navigation sur d\'autres sites ?', 'Non'],
    ],
  },
  {
    theme: 'Communication',
    questions: [
      ['Te prévenons-nous en cas de changement important de cette politique ?', 'Oui'],
      ['T\'envoyons-nous de la publicité ?', 'Non'],
    ],
  },
]

// moyen de contacter l'équipe : l'adresse mail si elle existe, sinon le dépôt GitHub
function Contact() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <a href={DEPOT_GITHUB} target="_blank" rel="noopener noreferrer">la page GitHub du projet</a>
  )
}

function DonneesPersonnelles() {
  return (
    <PageLegale titre="Politique de confidentialité">
      <p>
        DataFit traite des informations sur ta pratique sportive, dont certaines touchent à ta
        santé. Cette page explique, sans jargon, quelles données nous collectons, pourquoi, qui
        y a accès et comment tu gardes la main dessus, conformément au Règlement général sur la
        protection des données (RGPD) et aux recommandations de la CNIL.
      </p>

      <section>
        <h2>En résumé</h2>
        {RESUME.map((bloc) => (
          <div key={bloc.theme} className="legal-resume">
            <h3>{bloc.theme}</h3>
            <dl>
              {bloc.questions.map(([question, reponse]) => (
                <div key={question}>
                  <dt>{question}</dt>
                  <dd className={reponse === 'Non' ? 'non' : 'oui'}>{reponse}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>

      <section>
        <h2>1. Qui sommes-nous ?</h2>
        <p>
          DataFit est un projet universitaire, non commercial, réalisé par une équipe de six
          étudiants de L3 Informatique et de L3 Sciences des données de l'Université de Rouen
          Normandie. Le service est gratuit et en cours de développement. L'équipe projet est
          responsable du traitement de tes données.
        </p>
        <p>
          Pour toute question sur cette politique ou sur tes données, tu peux nous contacter
          via <Contact />.
        </p>
      </section>

      <section>
        <h2>2. Les données que nous collectons</h2>
        <h3>Ton compte</h3>
        <p>
          Ton prénom, ton nom, ton adresse e-mail et ton mot de passe. Le mot de passe n'est
          jamais conservé en clair : il est transformé (haché) avant d'être enregistré, et
          personne dans l'équipe ne peut le lire.
        </p>
        <h3>Ton profil</h3>
        <p>
          Ton âge, ta taille, ton poids, ton sexe, ton niveau, tes sports préférés et ton
          objectif. Le poids et le sexe servent à te placer dans la bonne catégorie pour le
          calcul des rangs. Tu peux laisser les autres champs vides.
        </p>
        <h3>Tes séances</h3>
        <p>
          Les mesures envoyées par ta montre ou ta ceinture cardio pendant une séance :
          fréquence cardiaque, vitesse, position GPS et heure de chaque mesure. La position
          n'est enregistrée que pendant une séance que tu as lancée.
        </p>
        <h3>Tes performances</h3>
        <p>Les résultats que tu saisis pour chaque exercice (charge, répétitions, temps…).</p>
        <h3>Données techniques</h3>
        <p>
          Comme tout site web, notre serveur enregistre des journaux techniques (adresse IP,
          date et heure des requêtes, type de navigateur). Ils servent uniquement à faire
          fonctionner et à sécuriser le service.
        </p>
      </section>

      <section>
        <h2>3. Les données de santé</h2>
        <p>
          Ta fréquence cardiaque et ton poids sont des données de santé au sens du RGPD. Ce sont
          des données dites sensibles, qui demandent une protection renforcée. Nous ne les
          collectons qu'avec ton consentement explicite, que tu donnes à l'inscription. Tu peux
          le retirer à tout moment : les données de santé associées à ton compte sont alors
          supprimées.
        </p>
        <p>
          DataFit n'est pas un dispositif médical. Les analyses et alertes comparent tes séances
          à tes propres habitudes : elles ne constituent ni un diagnostic ni un avis médical.
        </p>
      </section>

      <section>
        <h2>4. Ce que nous faisons de tes données</h2>
        <ul>
          <li>
            <strong>Te fournir le service</strong> : afficher tes séances, calculer tes zones
            d'effort, ta charge d'entraînement, ta progression et tes rangs.
          </li>
          <li>
            <strong>Sécuriser le service</strong> : protéger ton compte et détecter les usages
            abusifs.
          </li>
          <li>
            <strong>Améliorer nos analyses</strong> : l'équipe peut étudier des statistiques
            anonymisées, c'est-à-dire qui ne permettent pas de t'identifier.
          </li>
        </ul>
        <p>
          Nous ne faisons pas de publicité, nous ne vendons aucune donnée et nous ne t'adressons
          pas de communications commerciales.
        </p>
      </section>

      <section>
        <h2>5. Qui a accès à tes données ?</h2>
        <p>
          Seul notre serveur accède à la base de données ; ton navigateur ne s'y connecte jamais
          directement. Tes données ne sont visibles que par toi : il n'y a pas de profil public.
        </p>
        <p>
          Le site, le serveur et la base de données sont confiés à des hébergeurs techniques.
          Ils stockent les données pour nous mais n'ont pas le droit de les exploiter. La base de
          données est hébergée dans l'Union européenne.
        </p>
        <p>
          Les démonstrations du projet, notamment lors de la soutenance, utilisent en priorité
          des données simulées. Enfin, nous ne communiquerions tes données à une autorité que si
          la loi nous y obligeait.
        </p>
      </section>

      <section>
        <h2>6. Comment nous protégeons tes données</h2>
        <ul>
          <li>Les échanges entre ton navigateur et DataFit sont chiffrés (HTTPS).</li>
          <li>Les mots de passe sont hachés avant d'être enregistrés.</li>
          <li>Seul le serveur détient les identifiants d'accès à la base de données.</li>
          <li>Chaque requête vérifie que tu n'accèdes qu'à tes propres données.</li>
        </ul>
        <p>
          En cas de fuite de données présentant un risque pour toi, nous préviendrons la CNIL et
          les personnes concernées, comme la loi l'exige.
        </p>
      </section>

      <section>
        <h2>7. Combien de temps nous les gardons</h2>
        <p>
          Tes données sont conservées tant que ton compte existe. Si tu supprimes ton compte,
          elles sont effacées définitivement. DataFit étant un projet universitaire, les comptes
          et les données associées seront supprimés à la fin du projet si le service n'est pas
          poursuivi.
        </p>
      </section>

      <section>
        <h2>8. Cookies et stockage dans ton navigateur</h2>
        <p>
          DataFit n'utilise ni cookies publicitaires ni outils de mesure d'audience. Le site
          enregistre certaines informations dans ton navigateur (stockage local) pour fonctionner,
          par exemple pour garder tes préférences. Ces informations restent sur ton appareil et
          tu peux les effacer depuis les réglages de ton navigateur.
        </p>
      </section>

      <section>
        <h2>9. Tes droits</h2>
        <p>Le RGPD te donne les droits suivants sur tes données :</p>
        <ul>
          <li><strong>Accès</strong> : savoir quelles données nous avons sur toi.</li>
          <li><strong>Rectification</strong> : corriger une donnée inexacte.</li>
          <li><strong>Effacement</strong> : faire supprimer tes données.</li>
          <li><strong>Portabilité</strong> : récupérer tes données dans un format lisible.</li>
          <li><strong>Opposition et limitation</strong> : refuser ou restreindre certains traitements.</li>
          <li><strong>Retrait du consentement</strong> : à tout moment, pour les données de santé.</li>
        </ul>
        <p>
          Tu peux modifier la plupart de tes informations directement depuis ta page profil.
          Pour exercer les autres droits, contacte-nous via <Contact />. Si tu estimes que tes
          droits ne sont pas respectés, tu peux adresser une réclamation à la CNIL
          (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).
        </p>
      </section>

      <section>
        <h2>10. Modifications de cette politique</h2>
        <p>
          Nous pouvons faire évoluer cette politique, notamment au fil du développement du projet.
          La date en haut de page indique la dernière mise à jour, et nous te préviendrons en cas
          de changement important. Les conditions d'utilisation du service sont décrites dans
          les <Link to="/cgu">CGU</Link>.
        </p>
      </section>
    </PageLegale>
  )
}

export default DonneesPersonnelles
