import { type SubmitEvent } from 'react'
import '../styles/profil.css'
import Icone from '../components/Icone.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useProfil, { type ChampProfil } from '../hooks/useProfil.ts'
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

// les informations du profil, en trois groupes
const GROUPES_CHAMPS: { titre: string; champs: DefinitionChamp[] }[] = [
  {
    titre: 'Identité',
    champs: [
      { cle: 'prenom', nom: 'Prénom', type: 'texte', autoComplete: 'given-name' },
      { cle: 'nom', nom: 'Nom', type: 'texte', autoComplete: 'family-name' },
      { cle: 'email', nom: 'Adresse e-mail', type: 'email', autoComplete: 'email' },
    ],
  },
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
  // « T00:00 » : la date est lue à minuit, heure locale (sinon en UTC, la veille selon le fuseau)
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
  const nomComplet = `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim()

  function enregistrerChamp(champ: DefinitionChamp, event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    enregistrer(lireChamp(champ, new FormData(event.currentTarget)), `${champ.nom} enregistré.`)
  }

  return (
    <div className="ecran profil">
      <TitrePage surtitre="Compte" titre="Profil">
        Vos informations et votre objectif principal.
      </TitrePage>

      <div className="profil-zones">
        {/* ---------- informations personnelles ---------- */}
        <section className="profil-infos" aria-labelledby="profil-infos-titre">
          <header className="profil-identite">
            <span className="profil-avatar" aria-hidden="true">
              {profil ? initiales(profil) || <Icone trace={ICONES.profil} /> : <Icone trace={ICONES.profil} />}
            </span>
            <div>
              <h2 id="profil-infos-titre">{nomComplet || 'Informations personnelles'}</h2>
              <p>{profil?.email || 'Les informations qui personnalisent DataFit.'}</p>
            </div>
          </header>

          <p className="message-ok profil-message" role="status">
            {message && (
              <>
                <Icone trace={ICONES.valide} />
                {message}
              </>
            )}
          </p>

          {/* tout est en lecture, un crayon par information
              (le premier remplissage se fait sur la page de création du profil) */}
          {GROUPES_CHAMPS.map((groupe) => (
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
          ))}

          <div className="profil-groupe">
            <h3>Sécurité</h3>
            <dl>
              <div className="profil-ligne">
                <dt>Mot de passe</dt>
                <dd className="vide">Modifiable quand les comptes existeront</dd>
                <span className="etiquette">Bientôt</span>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profil
