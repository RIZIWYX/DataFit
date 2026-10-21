import { Link, Navigate } from 'react-router'
import '../styles/creation-profil.css'
import Icone from '../components/Icone.tsx'
import Logo from '../components/Logo.tsx'
import { ICONES } from '../data/icones.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useCreationProfil from '../hooks/useCreationProfil.ts'
import { NIVEAUX, OBJECTIFS, SEXES, lireProfil, profilComplet } from '../lib/profil.ts'

// lettres (accents compris), espaces, apostrophes et tirets : la même règle que le backend
const MOTIF_NOM = "[\\p{L} '\\-]+"
const AIDE_NOM = 'Lettres, espaces, apostrophes et tirets uniquement.'

interface PropsChoix {
  nom: string
  libelle: string
  options: { valeur: string; nom: string }[]
  large?: boolean
}

// un choix unique parmi quelques boutons (sexe, niveau, objectif)
function Choix({ nom, libelle, options, large = false }: PropsChoix) {
  return (
    <fieldset className={`creation-choix${large ? ' large' : ''}`}>
      <legend className="champ-nom">{libelle}</legend>
      <div className="creation-options">
        {options.map((option) => (
          <label key={option.valeur}>
            <input type="radio" name={nom} value={option.valeur} required />
            {option.nom}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// Création du profil, juste après l'inscription : une page plein écran, sans la navigation.
// On n'entre dans l'application qu'une fois tout rempli (voir AppLayout).
function CreationProfil() {
  const { compte, bornes, erreur, envoi, handleSubmit } = useCreationProfil()

  // déjà rempli : rien à faire ici
  if (profilComplet(lireProfil())) return <Navigate to="/dashboard" replace />

  return (
    <div className="creation refonte">
      <header className="creation-tete">
        <Link to="/" aria-label="DataFit, page de garde">
          <Logo />
        </Link>
        <ol className="creation-etapes" aria-label="Étapes de l'inscription">
          <li className={compte ? 'faite' : undefined}>
            <span className="creation-etape-numero">{compte ? <Icone trace={ICONES.valide} /> : 1}</span>
            Compte
          </li>
          <li aria-current="step">
            <span className="creation-etape-numero">2</span>
            Profil
          </li>
        </ol>
      </header>

      <main className="creation-contenu">
        <div>
          <p className="surtitre">Dernière étape</p>
          <h1 className="titre-page">
            Complétez votre profil<span className="point">.</span>
          </h1>
          {compte && (
            <p className="creation-intro">
              Votre compte <strong>{compte.email}</strong> est créé. Ces informations personnalisent DataFit :
              toutes sont obligatoires, et vous pourrez les modifier ensuite depuis la page Profil.
            </p>
          )}
        </div>

        {compte ? (
          <form className="creation-formulaire" onSubmit={handleSubmit}>
            <section className="creation-groupe" aria-labelledby="creation-identite">
              <h2 id="creation-identite">Identité</h2>
              <div className="creation-champs">
                <div className="champ">
                  <label htmlFor="creation-prenom">Prénom</label>
                  <input
                    id="creation-prenom"
                    name="prenom"
                    autoComplete="given-name"
                    maxLength={255}
                    pattern={MOTIF_NOM}
                    title={AIDE_NOM}
                    autoFocus
                    required
                  />
                </div>
                <div className="champ">
                  <label htmlFor="creation-nom">Nom</label>
                  <input
                    id="creation-nom"
                    name="nom"
                    autoComplete="family-name"
                    maxLength={255}
                    pattern={MOTIF_NOM}
                    title={AIDE_NOM}
                    required
                  />
                </div>
                <div className="champ">
                  <label htmlFor="creation-naissance">Date de naissance</label>
                  <input
                    id="creation-naissance"
                    name="dateNaissance"
                    type="date"
                    autoComplete="bday"
                    min={bornes.min}
                    max={bornes.max}
                    required
                  />
                </div>
                <Choix nom="sexe" libelle="Sexe" options={SEXES} />
              </div>
            </section>

            <section className="creation-groupe" aria-labelledby="creation-corps">
              <h2 id="creation-corps">Corps</h2>
              <p className="creation-groupe-texte">
                Avec le sexe, le poids fixe votre catégorie et les barèmes de vos rangs.
              </p>
              <div className="creation-champs">
                <div className="champ">
                  <label htmlFor="creation-taille">Taille (cm)</label>
                  <input
                    id="creation-taille"
                    name="taille"
                    type="number"
                    inputMode="numeric"
                    min={100}
                    max={250}
                    step={1}
                    required
                  />
                </div>
                <div className="champ">
                  <label htmlFor="creation-poids">Poids (kg)</label>
                  <input
                    id="creation-poids"
                    name="poids"
                    type="number"
                    inputMode="decimal"
                    min={30}
                    max={250}
                    step={0.1}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="creation-groupe" aria-labelledby="creation-pratique">
              <h2 id="creation-pratique">Pratique</h2>
              <div className="creation-champs">
                <Choix nom="niveau" libelle="Niveau" options={NIVEAUX} large />
                <fieldset className="creation-choix large">
                  <legend className="champ-nom">Activités pratiquées</legend>
                  <div className="creation-options">
                    {LISTE_SPORTS.map((sport) => (
                      <label key={sport}>
                        <input type="checkbox" name="activites" value={sport} />
                        <Icone trace={SPORTS[sport].icone} />
                        {SPORTS[sport].nom}
                      </label>
                    ))}
                  </div>
                  <p className="champ-aide">Une ou plusieurs.</p>
                </fieldset>
                <Choix nom="objectif" libelle="Objectif principal" options={OBJECTIFS} large />
              </div>
            </section>

            {erreur && (
              <p className="alerte" role="alert">
                <Icone trace={ICONES.info} />
                {erreur}
              </p>
            )}

            <button type="submit" className="bouton creation-envoyer" disabled={envoi}>
              {envoi ? 'Enregistrement…' : 'Accéder à DataFit'}
              {!envoi && <Icone trace={ICONES.fleche} />}
            </button>
          </form>
        ) : (
          // arrivé ici sans s'être inscrit depuis ce navigateur : le profil n'aurait pas de compte
          <section className="creation-groupe creation-sans-compte">
            <p>Le profil se rattache à un compte : commencez par en créer un.</p>
            <Link to="/connexion?mode=inscription" className="bouton">
              Créer un compte
              <Icone trace={ICONES.fleche} />
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}

export default CreationProfil
