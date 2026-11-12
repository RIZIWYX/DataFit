import { type SubmitEvent } from 'react'
import { Link } from 'react-router'
import '../styles/profil.css'
import Icone from '../components/Icone.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useEffacementDonnees from '../hooks/useEffacementDonnees.ts'
import useProfil, { type ChampProfil } from '../hooks/useProfil.ts'
import useSuppressionCompte from '../hooks/useSuppressionCompte.ts'
import { CATEGORIES_DONNEES } from '../lib/compte.ts'
import { formatDateLongue, nombre } from '../lib/format.ts'
import {
  type Profil as DonneesProfil,
  NIVEAUX,
  OBJECTIFS,
  SEXES,
  bornesNaissance,
  initiales,
} from '../lib/profil.ts'

interface DefinitionChamp {
  cle: ChampProfil
  nom: string
  type: 'texte' | 'email' | 'nombre' | 'date' | 'choix' | 'multi'
  unite?: string
  min?: number
  max?: number
  pas?: number
  options?: { valeur: string; nom: string }[]
  aide?: string
  autoComplete?: string
}

interface GroupeChamps {
  titre: string
  champs: DefinitionChamp[]
}

// panneau de gauche : l'identité (le mot de passe suit, à part)
const IDENTITE: GroupeChamps = {
  titre: 'Identité',
  champs: [
    { cle: 'prenom', nom: 'Prénom', type: 'texte', autoComplete: 'given-name' },
    { cle: 'nom', nom: 'Nom', type: 'texte', autoComplete: 'family-name' },
    { cle: 'email', nom: 'Adresse e-mail', type: 'email', autoComplete: 'email' },
  ],
}

// panneau de droite : le profil sportif, en deux groupes
const PROFIL_SPORTIF: GroupeChamps[] = [
  {
    titre: 'Corps',
    champs: [
      { cle: 'dateNaissance', nom: 'Date de naissance', type: 'date', autoComplete: 'bday' },
      { cle: 'taille', nom: 'Taille', type: 'nombre', unite: 'cm', min: 100, max: 250 },
      { cle: 'poids', nom: 'Poids', type: 'nombre', unite: 'kg', min: 30, max: 250, pas: 0.1, aide: 'Fixe votre catégorie de poids pour les rangs.' },
      { cle: 'sexe', nom: 'Sexe', type: 'choix', options: SEXES, aide: 'Choisit les barèmes des rangs.' },
    ],
  },
  {
    titre: 'Pratique',
    champs: [
      { cle: 'niveau', nom: 'Niveau', type: 'choix', options: NIVEAUX },
      {
        cle: 'activites',
        nom: 'Activités préférées',
        type: 'multi',
        options: LISTE_SPORTS.map((sport) => ({ valeur: sport, nom: SPORTS[sport].nom })),
      },
      { cle: 'objectif', nom: 'Objectif principal', type: 'choix', options: OBJECTIFS },
    ],
  },
]

// la valeur d'un champ, en clair ; vide s'il n'est pas renseigné
function valeurAffichee(champ: DefinitionChamp, profil: DonneesProfil | null): string {
  const brut = profil?.[champ.cle]
  if (champ.type === 'nombre') return typeof brut === 'number' && brut > 0 ? `${nombre(brut)} ${champ.unite}` : ''
  // "T00:00" : la date est lue à minuit, heure locale (sinon en UTC, la veille selon le fuseau)
  if (champ.type === 'date') return typeof brut === 'string' && brut ? formatDateLongue(new Date(`${brut}T00:00`)) : ''
  if (champ.type === 'choix') return champ.options?.find((o) => o.valeur === brut)?.nom ?? ''
  if (champ.type === 'multi')
    return (Array.isArray(brut) ? brut : []).map((v) => champ.options?.find((o) => o.valeur === v)?.nom ?? v).join(', ')
  return typeof brut === 'string' ? brut : ''
}

// lit un champ dans un formulaire
function lireChamp(champ: DefinitionChamp, donnees: FormData): Partial<DonneesProfil> {
  const valeur =
    champ.type === 'nombre'
      ? Number(donnees.get(champ.cle)) || 0
      : champ.type === 'multi'
        ? donnees.getAll(champ.cle).map(String)
        : String(donnees.get(champ.cle) ?? '').trim()
  return { [champ.cle]: valeur } as Partial<DonneesProfil>
}

// la saisie d'un champ, selon son type
function Saisie({ champ, profil, autoFocus = false }: { champ: DefinitionChamp; profil: DonneesProfil | null; autoFocus?: boolean }) {
  const id = `profil-${champ.cle}`
  const brut = profil?.[champ.cle]
  const bornes = champ.type === 'date' ? bornesNaissance() : undefined
  if (champ.type === 'choix' || champ.type === 'multi') {
    return (
      <div className="profil-options" role={champ.type === 'choix' ? 'radiogroup' : 'group'} aria-label={champ.nom}>
        {champ.options?.map((option, i) => (
          <label key={option.valeur}>
            <input
              type={champ.type === 'choix' ? 'radio' : 'checkbox'}
              name={champ.cle}
              value={option.valeur}
              autoFocus={autoFocus && i === 0}
              defaultChecked={Array.isArray(brut) ? brut.includes(option.valeur) : brut === option.valeur}
            />
            {option.nom}
          </label>
        ))}
      </div>
    )
  }
  return (
    <input
      id={id}
      name={champ.cle}
      type={champ.type === 'nombre' ? 'number' : champ.type === 'email' ? 'email' : champ.type === 'date' ? 'date' : 'text'}
      inputMode={champ.type === 'nombre' ? 'decimal' : undefined}
      min={bornes?.min ?? champ.min}
      max={bornes?.max ?? champ.max}
      step={champ.pas}
      autoComplete={champ.autoComplete}
      autoFocus={autoFocus}
      defaultValue={typeof brut === 'number' ? brut || '' : typeof brut === 'string' ? brut : ''}
    />
  )
}

function Profil() {
  const { profil, enEdition, editer, annuler, enregistrer, message } = useProfil()
  const suppression = useSuppressionCompte()
  const effacement = useEffacementDonnees()
  const nomComplet = `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim()

  function enregistrerChamp(champ: DefinitionChamp, event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    enregistrer(lireChamp(champ, new FormData(event.currentTarget)), `${champ.nom} enregistré.`)
  }

  // un groupe d'informations : tout est en lecture, un crayon par information
  // (le premier remplissage se fait sur la page de création du profil)
  const afficherGroupe = (groupe: GroupeChamps) => (
    <div key={groupe.titre} className="profil-groupe">
      <h3>{groupe.titre}</h3>
      <dl>
        {groupe.champs.map((champ) => {
          const valeur = valeurAffichee(champ, profil)
          return enEdition === champ.cle ? (
            <form
              key={champ.cle}
              className="profil-ligne en-edition"
              onSubmit={(e) => enregistrerChamp(champ, e)}
              onKeyDown={(e) => e.key === 'Escape' && annuler()}
            >
              {champ.type === 'choix' || champ.type === 'multi' ? (
                <span className="champ-nom">{champ.nom}</span>
              ) : (
                <label htmlFor={`profil-${champ.cle}`} className="champ-nom">
                  {champ.nom}
                  {champ.unite && ` (${champ.unite})`}
                </label>
              )}
              <Saisie champ={champ} profil={profil} autoFocus />
              {champ.aide && <p className="champ-aide">{champ.aide}</p>}
              <div className="profil-ligne-actions">
                <button type="submit" className="bouton petit">Enregistrer</button>
                <button type="button" className="bouton secondaire petit" onClick={annuler}>
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div key={champ.cle} className="profil-ligne">
              <dt>{champ.nom}</dt>
              <dd className={valeur ? undefined : 'vide'}>{valeur || 'Non renseigné'}</dd>
              <button type="button" className="bouton-icone discret" onClick={() => editer(champ.cle)}>
                <Icone trace={ICONES.crayon} />
                <span className="visuellement-cache">Modifier : {champ.nom}</span>
              </button>
            </div>
          )
        })}
      </dl>
    </div>
  )

  return (
    <div className="ecran profil">
      <TitrePage
        surtitre="Compte"
        titre="Profil"
        actions={
          // à côté du titre : visible quel que soit le panneau modifié, sans décaler les panneaux
          <p className="message-ok profil-message" role="status">
            {message && (
              <>
                <Icone trace={ICONES.valide} />
                {message}
              </>
            )}
          </p>
        }
      >
        Vos informations et votre objectif principal.
      </TitrePage>

      {/* deux panneaux de même largeur : la personne à gauche, le sportif à droite */}
      <div className="profil-zones">
        <section className="profil-panneau" aria-labelledby="profil-infos-titre">
          <header className="profil-tete">
            <span className="profil-avatar" aria-hidden="true">
              {profil ? initiales(profil) || <Icone trace={ICONES.profil} /> : <Icone trace={ICONES.profil} />}
            </span>
            <div>
              <h2 id="profil-infos-titre">{nomComplet || 'Informations personnelles'}</h2>
              <p>{profil?.email || 'Les informations qui personnalisent DataFit.'}</p>
            </div>
          </header>

          {afficherGroupe(IDENTITE)}

          <div className="profil-groupe profil-securite">
            <h3>Sécurité</h3>
            <dl>
              <div className="profil-ligne">
                <dt>Mot de passe</dt>
                <dd className="vide">Modifiable quand les comptes existeront</dd>
                <span className="etiquette">Bientôt</span>
              </div>

              {/* effacement de certaines données : le compte et le profil restent */}
              {effacement.ouvert ? (
                <form
                  className="profil-ligne en-edition profil-suppression"
                  aria-labelledby="effacement-titre"
                  onSubmit={effacement.confirmer}
                  onKeyDown={(e) => e.key === 'Escape' && !effacement.enCours && effacement.fermer()}
                >
                  <p id="effacement-titre" className="profil-suppression-titre">
                    Effacer vos données ?
                  </p>
                  <p className="profil-suppression-texte">
                    Votre compte, votre profil et votre abonnement restent. Ce que vous cochez est
                    effacé pour de bon, sur le serveur et dans ce navigateur.
                  </p>
                  <span id="effacement-choix" className="champ-nom">
                    Données à effacer
                  </span>
                  <div className="profil-options" role="group" aria-labelledby="effacement-choix">
                    {CATEGORIES_DONNEES.map((categorie) => (
                      <label key={categorie.valeur}>
                        <input type="checkbox" name="categorie" value={categorie.valeur} defaultChecked />
                        {categorie.nom}
                      </label>
                    ))}
                  </div>
                  <label htmlFor="effacement-mdp" className="champ-nom">
                    Votre mot de passe, pour confirmer
                  </label>
                  <input
                    id="effacement-mdp"
                    name="mot-de-passe"
                    type="password"
                    autoComplete="current-password"
                    required
                    autoFocus
                  />
                  <p className="champ-aide">
                    Compte créé avec « Continuer avec Google » ? Il n'a pas de mot de passe :
                    demandez l'effacement depuis la page <Link to="/contact">Contact</Link>.
                  </p>
                  {effacement.erreur && (
                    <p className="alerte" role="alert">
                      <Icone trace={ICONES.info} />
                      {effacement.erreur}
                    </p>
                  )}
                  <div className="profil-ligne-actions">
                    <button type="submit" className="bouton petit profil-danger plein" disabled={effacement.enCours}>
                      {effacement.enCours ? 'Effacement…' : 'Effacer'}
                    </button>
                    <button
                      type="button"
                      className="bouton secondaire petit"
                      disabled={effacement.enCours}
                      onClick={effacement.fermer}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profil-ligne">
                  <dt>Données</dt>
                  {effacement.message ? (
                    <dd className="message-ok" role="status">
                      <Icone trace={ICONES.valide} />
                      {effacement.message}
                    </dd>
                  ) : (
                    <dd className="vide">Séances, nuits, repas, performances</dd>
                  )}
                  <button type="button" className="bouton petit profil-danger" onClick={effacement.ouvrir}>
                    Effacer mes données
                  </button>
                </div>
              )}

              {/* suppression du compte : un bouton, puis une confirmation par mot de passe */}
              {suppression.ouverte ? (
                <form
                  className="profil-ligne en-edition profil-suppression"
                  aria-labelledby="suppression-titre"
                  onSubmit={suppression.confirmer}
                  onKeyDown={(e) => e.key === 'Escape' && !suppression.enCours && suppression.fermer()}
                >
                  <p id="suppression-titre" className="profil-suppression-titre">
                    Supprimer définitivement votre compte ?
                  </p>
                  <p className="profil-suppression-texte">
                    Votre profil, vos séances, vos nuits, vos repas, vos performances et les mesures de
                    votre montre seront effacés. Un abonnement Premium en cours sera arrêté tout de
                    suite. Rien ne pourra être récupéré.
                  </p>
                  <label htmlFor="suppression-mdp" className="champ-nom">
                    Votre mot de passe, pour confirmer
                  </label>
                  <input
                    id="suppression-mdp"
                    name="mot-de-passe"
                    type="password"
                    autoComplete="current-password"
                    required
                    autoFocus
                  />
                  <p className="champ-aide">
                    Compte créé avec « Continuer avec Google » ? Il n'a pas de mot de passe :
                    demandez sa suppression depuis la page <Link to="/contact">Contact</Link>.
                  </p>
                  {suppression.erreur && (
                    <p className="alerte" role="alert">
                      <Icone trace={ICONES.info} />
                      {suppression.erreur}
                    </p>
                  )}
                  <div className="profil-ligne-actions">
                    <button type="submit" className="bouton petit profil-danger plein" disabled={suppression.enCours}>
                      {suppression.enCours ? 'Suppression…' : 'Supprimer définitivement'}
                    </button>
                    <button
                      type="button"
                      className="bouton secondaire petit"
                      disabled={suppression.enCours}
                      onClick={suppression.fermer}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profil-ligne">
                  <dt>Compte</dt>
                  <dd className="vide">Suppression définitive, avec toutes vos données</dd>
                  <button type="button" className="bouton petit profil-danger" onClick={suppression.ouvrir}>
                    Supprimer mon compte
                  </button>
                </div>
              )}
            </dl>
          </div>
        </section>

        <section className="profil-panneau" aria-labelledby="profil-sport-titre">
          <header className="profil-tete">
            <span className="profil-avatar discret" aria-hidden="true">
              <Icone trace={ICONES.trophee} />
            </span>
            <div>
              <h2 id="profil-sport-titre">Profil sportif</h2>
              <p>Ce qui sert à calculer vos rangs et à personnaliser DataFit.</p>
            </div>
          </header>

          {PROFIL_SPORTIF.map(afficherGroupe)}
        </section>
      </div>
    </div>
  )
}

export default Profil
