import { type SubmitEvent, useState } from 'react'
import '../styles/profil.css'
import EtatVide from '../components/EtatVide.tsx'
import Fenetre from '../components/Fenetre.tsx'
import Icone from '../components/Icone.tsx'
import Jauge from '../components/Jauge.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { DISCIPLINES, TOUS_LES_EXERCICES } from '../data/paliers.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useObjectifs from '../hooks/useObjectifs.ts'
import useProfil, { type ChampProfil } from '../hooks/useProfil.ts'
import { nombre } from '../lib/format.ts'
import {
  GROUPES_OBJECTIFS,
  MESURES_VOLUME,
  type MesureVolume,
  type Objectif,
  type StatutObjectif,
  TOTAL_SBD,
  texteEcheance,
  titreObjectif,
} from '../lib/objectifs.ts'
import { type Profil as DonneesProfil, initiales } from '../lib/profil.ts'
import { libelleMesure, lireTemps } from '../lib/rangs.ts'

const SEXES = [
  { valeur: 'H', nom: 'Homme' },
  { valeur: 'F', nom: 'Femme' },
]
const NIVEAUX = [
  { valeur: 'novice', nom: 'Novice' },
  { valeur: 'intermediaire', nom: 'Intermédiaire' },
  { valeur: 'pro', nom: 'Confirmé' },
]

interface DefinitionChamp {
  cle: ChampProfil
  nom: string
  type: 'texte' | 'email' | 'nombre' | 'choix' | 'multi'
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
      { cle: 'age', nom: 'Âge', type: 'nombre', unite: 'ans', min: 10, max: 100 },
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
    ],
  },
]

// la valeur d'un champ, en clair ; vide s'il n'est pas renseigné
function valeurAffichee(champ: DefinitionChamp, profil: DonneesProfil | null): string {
  const brut = profil?.[champ.cle]
  if (champ.type === 'nombre') return typeof brut === 'number' && brut > 0 ? `${nombre(brut)} ${champ.unite}` : ''
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
      type={champ.type === 'nombre' ? 'number' : champ.type === 'email' ? 'email' : 'text'}
      inputMode={champ.type === 'nombre' ? 'decimal' : undefined}
      min={champ.min}
      max={champ.max}
      step={champ.pas}
      autoComplete={champ.autoComplete}
      autoFocus={autoFocus}
      defaultValue={typeof brut === 'number' ? brut || '' : typeof brut === 'string' ? brut : ''}
    />
  )
}

function Profil() {
  const { profil, premiereVisite, enEdition, editer, annuler, enregistrer, message } = useProfil()
  const nomComplet = `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim()

  function enregistrerChamp(champ: DefinitionChamp, event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    enregistrer(lireChamp(champ, new FormData(event.currentTarget)), `${champ.nom} enregistré.`)
  }

  function enregistrerTout(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const donnees = new FormData(event.currentTarget)
    const modifications = GROUPES_CHAMPS.flatMap((g) => g.champs).reduce(
      (total, champ) => ({ ...total, ...lireChamp(champ, donnees) }),
      {},
    )
    enregistrer(modifications, 'Profil créé. Vous pouvez modifier chaque information à tout moment.')
  }

  return (
    <div className="ecran profil">
      <TitrePage surtitre="Compte" titre="Profil">
        Vos informations, et les objectifs que vous vous fixez.
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

          {premiereVisite ? (
            // juste après l'inscription : tout se remplit d'un coup, une seule fois
            <form className="profil-accueil" onSubmit={enregistrerTout}>
              <p className="profil-accueil-texte">
                <strong>Bienvenue.</strong> Quelques informations pour commencer : le sexe et le poids
                servent à calculer vos rangs.
              </p>
              {GROUPES_CHAMPS.map((groupe) => (
                <fieldset key={groupe.titre}>
                  <legend>{groupe.titre}</legend>
                  {groupe.champs.map((champ) => (
                    <div key={champ.cle} className="champ">
                      {champ.type === 'choix' || champ.type === 'multi' ? (
                        <span className="champ-nom">{champ.nom}</span>
                      ) : (
                        <label htmlFor={`profil-${champ.cle}`}>
                          {champ.nom}
                          {champ.unite && ` (${champ.unite})`}
                        </label>
                      )}
                      <Saisie champ={champ} profil={profil} />
                      {champ.aide && <p className="champ-aide">{champ.aide}</p>}
                    </div>
                  ))}
                </fieldset>
              ))}
              <button type="submit" className="bouton">Enregistrer mon profil</button>
            </form>
          ) : (
            // ensuite : tout est en lecture, un crayon par information
            GROUPES_CHAMPS.map((groupe) => (
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
            ))
          )}

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

        <ZoneObjectifs />
      </div>
    </div>
  )
}

// ---------- objectifs sportifs ----------

const STATUTS: { valeur: StatutObjectif; nom: string }[] = [
  { valeur: 'en-cours', nom: 'En cours' },
  { valeur: 'atteint', nom: 'Atteints' },
  { valeur: 'abandonne', nom: 'Abandonnés' },
]

function ZoneObjectifs() {
  const o = useObjectifs()
  const [statut, setStatut] = useState<StatutObjectif>('en-cours')
  const [ajout, setAjout] = useState(false)

  const visibles = o.objectifs.filter((objectif) => objectif.statut === statut)
  const groupes = GROUPES_OBJECTIFS.map((g) => ({ ...g, objectifs: visibles.filter((x) => x.discipline === g.id) })).filter(
    (g) => g.objectifs.length,
  )

  return (
    <section className="profil-objectifs" aria-labelledby="profil-objectifs-titre">
      <header className="profil-objectifs-tete">
        <h2 id="profil-objectifs-titre">
          Objectifs<span className="point">.</span>
        </h2>
        <button type="button" className="bouton petit" onClick={() => setAjout(true)}>
          <Icone trace={ICONES.ajouter} />
          Ajouter un objectif
        </button>
      </header>

      <Segments
        libelle="Statut des objectifs"
        options={STATUTS.map((s) => ({ ...s, compte: o.objectifs.filter((x) => x.statut === s.valeur).length }))}
        valeur={statut}
        onChange={setStatut}
      />

      {groupes.length === 0 ? (
        <EtatVide
          icone={ICONES.cible}
          titre={statut === 'en-cours' ? 'Aucun objectif en cours' : `Aucun objectif ${statut === 'atteint' ? 'atteint' : 'abandonné'}`}
          action={
            statut === 'en-cours' && (
              <button type="button" className="bouton secondaire petit" onClick={() => setAjout(true)}>
                Fixer un premier objectif
              </button>
            )
          }
        >
          Un objectif par discipline : un temps sur 5 km, une charge au squat, un total SBD, un nombre de
          séances par semaine…
        </EtatVide>
      ) : (
        groupes.map((groupe) => (
          <div key={groupe.id} className="profil-objectifs-groupe">
            <h3>{groupe.nom}</h3>
            <ul>
              {groupe.objectifs.map((objectif) => (
                <LigneObjectif key={objectif.id} objectif={objectif} o={o} />
              ))}
            </ul>
          </div>
        ))
      )}

      {ajout && <FenetreObjectif o={o} onFermer={() => setAjout(false)} />}
    </section>
  )
}

type DonneesObjectifs = ReturnType<typeof useObjectifs>

function LigneObjectif({ objectif, o }: { objectif: Objectif; o: DonneesObjectifs }) {
  const avancement = o.avancement(objectif)
  const cibleAtteinte = objectif.statut === 'en-cours' && avancement && avancement.part >= 1

  return (
    <li className={`objectif ${objectif.statut}`}>
      <div className="objectif-tete">
        <div>
          <strong>{titreObjectif(objectif)}</strong>
          <small>{texteEcheance(objectif)}</small>
        </div>
        {cibleAtteinte && <span className="etiquette turquoise">Cible atteinte</span>}
        {objectif.statut === 'atteint' && <span className="etiquette">Atteint</span>}
      </div>

      {avancement ? (
        <div className="objectif-avancement">
          <Jauge
            part={avancement.part}
            libelle={`Avancement : ${titreObjectif(objectif)}`}
            couleur={avancement.part >= 1 ? 'var(--turquoise)' : undefined}
          />
          <p>
            <span>{avancement.actuel}</span>
            <strong>{Math.round(avancement.part * 100)} %</strong>
          </p>
        </div>
      ) : (
        <p className="objectif-vide">
          Pas encore mesurable : saisissez votre record de cet exercice dans Performance.
        </p>
      )}

      <div className="objectif-actions">
        {objectif.statut === 'en-cours' ? (
          <>
            <button type="button" onClick={() => o.changerStatut(objectif.id, 'atteint')}>
              <Icone trace={ICONES.valide} />
              Marquer comme atteint
            </button>
            <button type="button" onClick={() => o.changerStatut(objectif.id, 'abandonne')}>
              Abandonner
            </button>
          </>
        ) : (
          <button type="button" onClick={() => o.changerStatut(objectif.id, 'en-cours')}>
            Remettre en cours
          </button>
        )}
        <button type="button" className="danger" onClick={() => o.supprimer(objectif.id)}>
          <Icone trace={ICONES.corbeille} />
          Supprimer
        </button>
      </div>
    </li>
  )
}

// ajout d'un objectif, en trois choix : la discipline, ce qu'on vise, la valeur
function FenetreObjectif({ o, onFermer }: { o: DonneesObjectifs; onFermer: () => void }) {
  const [groupe, setGroupe] = useState('sbd')
  const [cle, setCle] = useState('')
  const [cible, setCible] = useState('')
  const [echeance, setEcheance] = useState('')

  const discipline = DISCIPLINES.find((d) => d.id === groupe)
  const choix =
    groupe === 'regularite'
      ? (Object.keys(MESURES_VOLUME) as MesureVolume[]).map((m) => ({ id: m, nom: MESURES_VOLUME[m].nom }))
      : [
          ...(groupe === 'sbd' ? [{ id: TOTAL_SBD, nom: 'Total SBD (squat + couché + terre)' }] : []),
          ...(discipline?.exercices ?? []).map((ex) => ({ id: ex.id, nom: ex.nom })),
        ]
  const exercice = TOUS_LES_EXERCICES.find((ex) => ex.id === cle)
  const mesure = groupe === 'regularite' ? (cle as MesureVolume) : undefined

  // la cible saisie, dans l'unité de l'exercice (un temps « 19:30 » devient 1170 secondes)
  const valeurCible = exercice?.type === 'time' ? lireTemps(cible) : Number(cible.replace(',', '.'))
  const valide = cle !== '' && cible !== '' && !Number.isNaN(valeurCible) && (exercice?.type === 'ladder' || valeurCible > 0)

  const unite = mesure
    ? MESURES_VOLUME[mesure].unite
    : cle === TOTAL_SBD
      ? 'kg, les trois mouvements additionnés'
      : exercice
        ? libelleMesure(exercice)
        : ''
  const record = cle && cle !== TOTAL_SBD && !mesure ? o.recordActuel(cle) : undefined

  function valider(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valide) return
    o.ajouter({
      discipline: groupe,
      ...(mesure ? { mesure } : { exerciceId: cle }),
      cible: valeurCible,
      echeance: echeance || undefined,
    })
    onFermer()
  }

  return (
    <Fenetre
      ouverte
      titre="Nouvel objectif"
      onFermer={onFermer}
      pied={
        <>
          <button type="button" className="bouton secondaire" onClick={onFermer}>Annuler</button>
          <button type="submit" form="formulaire-objectif" className="bouton" disabled={!valide}>
            Ajouter l'objectif
          </button>
        </>
      }
    >
      <form id="formulaire-objectif" className="profil-formulaire-objectif" onSubmit={valider}>
        <div className="champ">
          <label htmlFor="objectif-groupe">Discipline</label>
          <select
            id="objectif-groupe"
            value={groupe}
            onChange={(e) => {
              setGroupe(e.target.value)
              setCle('')
              setCible('')
            }}
          >
            {GROUPES_OBJECTIFS.map((g) => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>

        <div className="champ">
          <label htmlFor="objectif-cle">Ce que vous visez</label>
          <select
            id="objectif-cle"
            value={cle}
            onChange={(e) => {
              setCle(e.target.value)
              setCible('')
            }}
          >
            <option value="">Choisir…</option>
            {choix.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        {cle && (
          <div className="champ">
            <label htmlFor="objectif-cible">Valeur visée</label>
            {exercice?.type === 'ladder' ? (
              <select id="objectif-cible" value={cible} onChange={(e) => setCible(e.target.value)}>
                <option value="">Choisir une étape…</option>
                {exercice.etapes?.map((etape, i) => (
                  <option key={etape} value={i}>{etape}</option>
                ))}
              </select>
            ) : (
              <input
                id="objectif-cible"
                inputMode={exercice?.type === 'time' ? 'text' : 'decimal'}
                placeholder={exercice?.type === 'time' ? 'ex. 19:30' : ''}
                value={cible}
                onChange={(e) => setCible(e.target.value)}
              />
            )}
            <p className="champ-aide">
              {unite}
              {record && ` · votre record actuel : ${record}`}
            </p>
          </div>
        )}

        <div className="champ">
          <label htmlFor="objectif-echeance">Échéance (facultative)</label>
          <input id="objectif-echeance" type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} />
        </div>
      </form>
    </Fenetre>
  )
}

export default Profil
