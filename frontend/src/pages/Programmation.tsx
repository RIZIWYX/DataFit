import { type CSSProperties, type SubmitEvent, useState } from 'react'
import { useSearchParams } from 'react-router'
import '../styles/programmation.css'
import Calendrier, { type Vue } from '../components/Calendrier.tsx'
import EditeurExercices from '../components/EditeurExercices.tsx'
import EtatVide from '../components/EtatVide.tsx'
import Fenetre from '../components/Fenetre.tsx'
import Icone from '../components/Icone.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import usePlanning from '../hooks/usePlanning.ts'
import { formatDateLongue, formatDuree, formatHeure, formatJourRelatif } from '../lib/format.ts'
import {
  COULEURS_PROGRAMMES,
  COULEUR_SEANCE_UNIQUE,
  type Creneau,
  type Programme,
  type SeancePlanifiee,
  ajouterJours,
  cleJour,
  couleurSeance,
  debutSemaine,
  depuisIso,
  nouvelId,
  planifier,
  resumeExercice,
  seancesAVenir,
  versIso,
} from '../lib/programmation.ts'

const VUES: { valeur: Vue; nom: string }[] = [
  { valeur: 'mois', nom: 'Mois' },
  { valeur: 'semaine', nom: 'Semaine' },
  { valeur: 'jour', nom: 'Jour' },
]
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// le titre de la période affichée : « octobre 2026 », « 12 – 18 oct. 2026 », « jeudi 15 octobre 2026 »
function titrePeriode(vue: Vue, reference: Date): string {
  if (vue === 'mois') return reference.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  if (vue === 'jour') return reference.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const lundi = debutSemaine(reference)
  const dimanche = ajouterJours(lundi, 6)
  const debut = lundi.toLocaleDateString('fr-FR', lundi.getMonth() === dimanche.getMonth() ? { day: 'numeric' } : { day: 'numeric', month: 'short' })
  return `${debut} – ${dimanche.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

// Programmation : les programmes (modèles) à gauche, le calendrier (leurs occurrences) à droite.
function Programmation() {
  const p = usePlanning()
  const { planning } = p
  const [parametres, setParametres] = useSearchParams()
  const [aujourdHui] = useState(() => new Date())
  const [vue, setVue] = useState<Vue>(() => (window.matchMedia('(max-width: 699px)').matches ? 'jour' : 'semaine'))
  // la fiche ouverte est dans l'adresse (?seance=…) : l'historique peut y mener directement
  const ouverteId = parametres.get('seance')
  const [reference, setReference] = useState(() => {
    const seance = planning.seances.find((s) => s.id === ouverteId)
    return seance ? depuisIso(seance.debut) : new Date()
  })
  const [masques, setMasques] = useState<string[]>([]) // programmes cachés ; « unique » : les séances hors programme
  const [edition, setEdition] = useState<SeancePlanifiee | null>(null)
  const [programmeEdite, setProgrammeEdite] = useState<{ programme: Programme; etape: Etape } | null>(null)
  const [message, setMessage] = useState('')

  const ouverte = planning.seances.find((s) => s.id === ouverteId)
  const visibles = planning.seances.filter((s) => !masques.includes(s.programmeId ?? 'unique'))
  const aVenir = seancesAVenir({ ...planning, seances: visibles }, aujourdHui).slice(0, 4)
  const couleur = (seance: SeancePlanifiee) => couleurSeance(seance, planning.programmes)

  const ouvrir = (id: string) => setParametres({ seance: id })
  const fermerFiche = () => setParametres({}, { replace: true })
  const basculerFiltre = (id: string) =>
    setMasques((liste) => (liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]))

  function avancer(sens: -1 | 1) {
    if (vue === 'mois') setReference(new Date(reference.getFullYear(), reference.getMonth() + sens, 1))
    else setReference(ajouterJours(reference, sens * (vue === 'semaine' ? 7 : 1)))
  }

  const nouvelleSeance = (debut: Date): SeancePlanifiee => ({
    id: nouvelId(),
    programmeId: null,
    modeleId: null,
    titre: '',
    debut: versIso(debut),
    dureeMin: 60,
    exercices: [],
    faite: false,
  })

  const nouveauProgramme = (): Programme => ({
    id: nouvelId(),
    nom: '',
    couleur: COULEURS_PROGRAMMES[planning.programmes.length % COULEURS_PROGRAMMES.length],
    seances: [],
  })

  function annoncer(texte: string) {
    setMessage(texte)
    window.setTimeout(() => setMessage(''), 4000)
  }

  return (
    <div className="ecran programmation">
      <TitrePage
        surtitre="Entraînement"
        titre="Programmation"
        actions={
          <>
            <button type="button" className="bouton secondaire" onClick={() => setProgrammeEdite({ programme: nouveauProgramme(), etape: 'infos' })}>
              <Icone trace={ICONES.ajouter} />
              Programme
            </button>
            <button type="button" className="bouton" onClick={() => setEdition(nouvelleSeance(new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate(), 18, 0)))}>
              <Icone trace={ICONES.ajouter} />
              Séance
            </button>
          </>
        }
      >
        Créez vos programmes, puis placez leurs séances dans le calendrier.
      </TitrePage>

      <p className="message-ok prog-message" role="status">
        {message && (
          <>
            <Icone trace={ICONES.valide} />
            {message}
          </>
        )}
      </p>

      <div className="prog-barre">
        <div className="prog-navigation">
          <button type="button" className="bouton-icone" onClick={() => avancer(-1)}>
            <Icone trace={ICONES.precedent} />
            <span className="visuellement-cache">Période précédente</span>
          </button>
          <button type="button" className="bouton secondaire petit" onClick={() => setReference(new Date())}>
            Aujourd'hui
          </button>
          <button type="button" className="bouton-icone" onClick={() => avancer(1)}>
            <Icone trace={ICONES.chevron} />
            <span className="visuellement-cache">Période suivante</span>
          </button>
          <h2 className="prog-periode" aria-live="polite">{titrePeriode(vue, reference)}</h2>
        </div>
        <Segments libelle="Vue du calendrier" options={VUES} valeur={vue} onChange={setVue} />
      </div>

      {/* deux blocs de même hauteur : les programmes à gauche, le calendrier à droite */}
      <div className="prog-mise-en-page">
        {/* ---------- les programmes (modèles) et ce qui arrive ---------- */}
        <aside className="prog-cote">
          <section className="panneau" aria-labelledby="prog-programmes">
            <header className="panneau-tete">
              <h2 id="prog-programmes" className="panneau-titre">Programmes</h2>
            </header>

            {planning.programmes.length === 0 ? (
              <EtatVide icone={ICONES.calendrier} titre="Aucun programme" />
            ) : (
              <ul className="prog-liste">
                {planning.programmes.map((programme) => {
                  const nb = planning.seances.filter((s) => s.programmeId === programme.id && !s.faite).length
                  return (
                    <li key={programme.id}>
                      <label className="prog-filtre" style={{ '--couleur': programme.couleur } as CSSProperties}>
                        <input type="checkbox" checked={!masques.includes(programme.id)} onChange={() => basculerFiltre(programme.id)} />
                        <span>
                          <strong>{programme.nom}</strong>
                          <small>
                            {programme.seances.length} séance{programme.seances.length > 1 ? 's' : ''} type · {nb} à venir
                          </small>
                        </span>
                      </label>
                      <div className="prog-liste-actions">
                        <button type="button" className="bouton-icone discret" onClick={() => setProgrammeEdite({ programme, etape: 'planifier' })}>
                          <Icone trace={ICONES.calendrier} />
                          <span className="visuellement-cache">Planifier {programme.nom}</span>
                        </button>
                        <button type="button" className="bouton-icone discret" onClick={() => setProgrammeEdite({ programme, etape: 'infos' })}>
                          <Icone trace={ICONES.crayon} />
                          <span className="visuellement-cache">Modifier {programme.nom}</span>
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <label className="prog-filtre prog-filtre-unique" style={{ '--couleur': COULEUR_SEANCE_UNIQUE } as CSSProperties}>
              <input type="checkbox" checked={!masques.includes('unique')} onChange={() => basculerFiltre('unique')} />
              <span>
                <strong>Séances uniques</strong>
                <small>hors programme</small>
              </span>
            </label>

            <div className="prog-cote-actions">
              <button type="button" className="bouton secondaire petit" onClick={() => setProgrammeEdite({ programme: nouveauProgramme(), etape: 'infos' })}>
                Nouveau programme
              </button>
              {planning.programmes.length === 0 && (
                <button
                  type="button"
                  className="bouton fantome"
                  onClick={() => annoncer(`Programme PPL créé : ${p.chargerExemple()} séances ajoutées au calendrier.`)}
                >
                  Essayer avec un exemple (PPL)
                </button>
              )}
            </div>
          </section>

          <section className="panneau" aria-labelledby="prog-a-venir">
            <header className="panneau-tete">
              <h2 id="prog-a-venir" className="panneau-titre">À venir</h2>
            </header>
            {aVenir.length === 0 ? (
              <p className="prog-rien">Rien de prévu pour l'instant.</p>
            ) : (
              <ul className="liste-lignes prog-a-venir">
                {aVenir.map((seance) => {
                  const debut = depuisIso(seance.debut)
                  return (
                    <li key={seance.id}>
                      <button type="button" onClick={() => ouvrir(seance.id)}>
                        <i style={{ background: couleur(seance) }} />
                        <span>
                          <strong>{seance.titre}</strong>
                          <small>
                            {formatJourRelatif(debut, aujourdHui)} · {formatHeure(debut)}
                          </small>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </aside>

        {/* ---------- le calendrier (les occurrences) ---------- */}
        <section className="prog-calendrier" aria-label="Calendrier">
          <Calendrier
            vue={vue}
            reference={reference}
            seances={visibles}
            couleur={couleur}
            aujourdHui={aujourdHui}
            onOuvrir={ouvrir}
            onCreer={(debut) => setEdition(nouvelleSeance(debut))}
            onDeplacer={(id, debut) => {
              p.deplacerSeance(id, versIso(debut))
              annoncer(`Séance déplacée au ${formatDateLongue(debut)} à ${formatHeure(debut)}.`)
            }}
            onVoirJour={(jour) => {
              setReference(jour)
              setVue('jour')
            }}
          />
        </section>
      </div>
      <p className="prog-aide">
        Cliquez sur un jour ou un créneau pour y créer une séance ; glissez une séance pour la déplacer.
      </p>

      {ouverte && (
        <FicheSeance
          seance={ouverte}
          programme={planning.programmes.find((pr) => pr.id === ouverte.programmeId)}
          couleur={couleur(ouverte)}
          aujourdHui={aujourdHui}
          onFermer={fermerFiche}
          onModifier={() => {
            setEdition(ouverte)
            fermerFiche()
          }}
          onBasculerFaite={() => p.basculerFaite(ouverte.id)}
          onSupprimer={() => {
            p.supprimerSeance(ouverte.id)
            fermerFiche()
            annoncer('Séance supprimée.')
          }}
        />
      )}

      {edition && (
        <FenetreSeance
          seance={edition}
          programmes={planning.programmes}
          existe={planning.seances.some((s) => s.id === edition.id)}
          onFermer={() => setEdition(null)}
          onEnregistrer={(seance) => {
            p.enregistrerSeance(seance)
            setEdition(null)
            setReference(depuisIso(seance.debut))
            annoncer('Séance enregistrée.')
          }}
        />
      )}

      {programmeEdite && (
        <FenetreProgramme
          initial={programmeEdite.programme}
          etapeInitiale={programmeEdite.etape}
          existe={planning.programmes.some((pr) => pr.id === programmeEdite.programme.id)}
          aujourdHui={aujourdHui}
          onFermer={() => setProgrammeEdite(null)}
          onEnregistrer={(programme) => {
            p.enregistrerProgramme(programme)
            setProgrammeEdite(null)
            annoncer(`Programme « ${programme.nom} » enregistré.`)
          }}
          onPlanifier={(programme, depart, semaines, creneaux) => {
            const nb = p.planifierProgramme(programme, depart, semaines, creneaux)
            setProgrammeEdite(null)
            setReference(depart)
            annoncer(`${nb} séance${nb > 1 ? 's' : ''} de « ${programme.nom} » ajoutée${nb > 1 ? 's' : ''} au calendrier.`)
          }}
          onSupprimer={(id) => {
            p.supprimerProgramme(id)
            setProgrammeEdite(null)
            annoncer('Programme supprimé, avec ses séances à venir.')
          }}
        />
      )}
    </div>
  )
}

// ---------- fiche d'une séance (clic dans le calendrier) ----------

type PropsFiche = {
  seance: SeancePlanifiee
  programme?: Programme
  couleur: string
  aujourdHui: Date
  onFermer: () => void
  onModifier: () => void
  onBasculerFaite: () => void
  onSupprimer: () => void
}

function FicheSeance({ seance, programme, couleur, aujourdHui, onFermer, onModifier, onBasculerFaite, onSupprimer }: PropsFiche) {
  const debut = depuisIso(seance.debut)
  const fin = new Date(debut.getTime() + seance.dureeMin * 60_000)
  // une séance ne peut être faite qu'à partir de son jour
  const aVenir = cleJour(debut) > cleJour(aujourdHui)

  return (
    <Fenetre
      ouverte
      titre={seance.titre || 'Séance'}
      onFermer={onFermer}
      pied={
        <>
          <button type="button" className="bouton-icone danger a-gauche" onClick={onSupprimer}>
            <Icone trace={ICONES.corbeille} />
            <span className="visuellement-cache">Supprimer la séance</span>
          </button>
          <button type="button" className="bouton secondaire" onClick={onModifier}>
            <Icone trace={ICONES.crayon} />
            Modifier
          </button>
          <button
            type="button"
            className={seance.faite ? 'bouton secondaire' : 'bouton'}
            disabled={aVenir && !seance.faite}
            title={aVenir && !seance.faite ? 'Possible à partir du jour de la séance' : undefined}
            onClick={onBasculerFaite}
          >
            <Icone trace={ICONES.valide} />
            {seance.faite ? 'Remettre à faire' : 'Marquer comme faite'}
          </button>
        </>
      }
    >
      <dl className="fiche-infos">
        <div>
          <dt>Quand</dt>
          <dd>
            {formatDateLongue(debut)}, {formatHeure(debut)} – {formatHeure(fin)} ({formatDuree(seance.dureeMin)})
          </dd>
        </div>
        <div>
          <dt>Programme</dt>
          <dd>
            <i className="fiche-pastille" style={{ background: couleur }} />
            {programme?.nom ?? 'Séance unique'}
          </dd>
        </div>
        <div>
          <dt>État</dt>
          <dd>{seance.faite ? <span className="etiquette">Faite</span> : 'À faire'}</dd>
        </div>
      </dl>

      {seance.exercices.length ? (
        <ol className="fiche-exercices">
          {seance.exercices.map((ex) => (
            <li key={ex.id}>
              <strong>{ex.nom || 'Exercice'}</strong>
              <span>{resumeExercice(ex) || '–'}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="prog-rien">Aucun exercice détaillé pour cette séance.</p>
      )}
      <p className="champ-aide">
        Une séance faite compte dans votre historique et dans la progression de ses exercices : avant de
        la marquer, ajustez si besoin ce que vous avez vraiment fait (Modifier). Pour la déplacer,
        glissez-la dans le calendrier ou modifiez sa date.
      </p>
    </Fenetre>
  )
}

// ---------- créer ou modifier une séance ----------

type PropsSeance = {
  seance: SeancePlanifiee
  programmes: Programme[]
  existe: boolean
  onFermer: () => void
  onEnregistrer: (seance: SeancePlanifiee) => void
}

function FenetreSeance({ seance, programmes, existe, onFermer, onEnregistrer }: PropsSeance) {
  const [brouillon, setBrouillon] = useState(seance)
  const [jour, heure] = brouillon.debut.split('T')
  const modifier = (modifications: Partial<SeancePlanifiee>) => setBrouillon({ ...brouillon, ...modifications })

  function valider(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    onEnregistrer({ ...brouillon, titre: brouillon.titre.trim() })
  }

  return (
    <Fenetre
      ouverte
      large
      titre={existe ? 'Modifier la séance' : 'Nouvelle séance'}
      onFermer={onFermer}
      pied={
        <>
          <button type="button" className="bouton secondaire" onClick={onFermer}>Annuler</button>
          <button type="submit" form="formulaire-seance" className="bouton" disabled={!brouillon.titre.trim()}>
            Enregistrer
          </button>
        </>
      }
    >
      <form id="formulaire-seance" className="prog-formulaire" onSubmit={valider}>
        <div className="champ">
          <label htmlFor="seance-titre">Nom de la séance</label>
          <input
            id="seance-titre"
            required
            autoFocus
            placeholder="ex. Push, Fractionné 10 × 400 m…"
            value={brouillon.titre}
            onChange={(e) => modifier({ titre: e.target.value })}
          />
        </div>
        <div className="champs-ligne">
          <div className="champ">
            <label htmlFor="seance-jour">Date</label>
            <input id="seance-jour" type="date" required value={jour} onChange={(e) => e.target.value && modifier({ debut: `${e.target.value}T${heure}` })} />
          </div>
          <div className="champ">
            <label htmlFor="seance-heure">Heure</label>
            <input id="seance-heure" type="time" required value={heure} onChange={(e) => e.target.value && modifier({ debut: `${jour}T${e.target.value}` })} />
          </div>
          <div className="champ">
            <label htmlFor="seance-duree">Durée (min)</label>
            <input
              id="seance-duree"
              type="number"
              min={5}
              step={5}
              value={brouillon.dureeMin}
              onChange={(e) => modifier({ dureeMin: Number(e.target.value) || 60 })}
            />
          </div>
        </div>
        <div className="champ">
          <label htmlFor="seance-programme">Programme</label>
          <select
            id="seance-programme"
            value={brouillon.programmeId ?? ''}
            onChange={(e) => modifier({ programmeId: e.target.value || null, modeleId: null })}
          >
            <option value="">Aucun : séance unique</option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>{programme.nom}</option>
            ))}
          </select>
        </div>
        <div className="champ">
          <span className="champ-nom">Exercices</span>
          <EditeurExercices exercices={brouillon.exercices} onChange={(exercices) => modifier({ exercices })} />
        </div>
      </form>
    </Fenetre>
  )
}

// ---------- créer ou modifier un programme, en trois étapes ----------

type Etape = 'infos' | 'seances' | 'planifier'

const ETAPES: { valeur: Etape; nom: string }[] = [
  { valeur: 'infos', nom: '1. Programme' },
  { valeur: 'seances', nom: '2. Séances types' },
  { valeur: 'planifier', nom: '3. Planifier' },
]

type PropsProgramme = {
  initial: Programme
  etapeInitiale: Etape
  existe: boolean
  aujourdHui: Date
  onFermer: () => void
  onEnregistrer: (programme: Programme) => void
  onPlanifier: (programme: Programme, depart: Date, semaines: number, creneaux: Creneau[]) => void
  onSupprimer: (id: string) => void
}

function FenetreProgramme({ initial, etapeInitiale, existe, aujourdHui, onFermer, onEnregistrer, onPlanifier, onSupprimer }: PropsProgramme) {
  const [programme, setProgramme] = useState(initial)
  const [etape, setEtape] = useState<Etape>(etapeInitiale)
  const [depart, setDepart] = useState(cleJour(aujourdHui))
  const [semaines, setSemaines] = useState(4)
  // par défaut, les séances types sont espacées d'un jour : lundi, mercredi, vendredi…
  const [creneaux, setCreneaux] = useState<Creneau[]>(() =>
    initial.seances.map((modele, i) => ({ modeleId: modele.id, jour: (i * 2) % 7, heure: '18:00' })),
  )

  const nomValide = programme.nom.trim() !== ''
  const modifierSeance = (id: string, modifications: Partial<Programme['seances'][number]>) =>
    setProgramme({ ...programme, seances: programme.seances.map((s) => (s.id === id ? { ...s, ...modifications } : s)) })

  function ajouterSeanceType() {
    const modele = { id: nouvelId(), nom: `Séance ${String.fromCharCode(65 + programme.seances.length)}`, dureeMin: 60, exercices: [] }
    setProgramme({ ...programme, seances: [...programme.seances, modele] })
    setCreneaux([...creneaux, { modeleId: modele.id, jour: (programme.seances.length * 2) % 7, heure: '18:00' }])
  }

  // les créneaux suivent les séances types (une séance retirée perd son créneau)
  const creneauxValides = creneaux.filter((c) => programme.seances.some((s) => s.id === c.modeleId))
  const dateDepart = new Date(`${depart}T00:00`)
  const nbAPlanifier = planifier(programme, dateDepart < aujourdHui ? aujourdHui : dateDepart, semaines, creneauxValides).length
  const finale = { ...programme, nom: programme.nom.trim() }

  return (
    <Fenetre
      ouverte
      large
      titre={existe ? `Programme « ${initial.nom} »` : 'Nouveau programme'}
      onFermer={onFermer}
      pied={
        <>
          {existe && (
            <button type="button" className="bouton-icone danger a-gauche" onClick={() => onSupprimer(programme.id)}>
              <Icone trace={ICONES.corbeille} />
              <span className="visuellement-cache">Supprimer le programme</span>
            </button>
          )}
          <button type="button" className="bouton secondaire" onClick={onFermer}>Annuler</button>
          {etape === 'infos' && (
            <button type="button" className="bouton" disabled={!nomValide} onClick={() => setEtape('seances')}>
              Suivant : les séances
            </button>
          )}
          {etape === 'seances' && (
            <>
              <button type="button" className="bouton secondaire" disabled={!nomValide} onClick={() => onEnregistrer(finale)}>
                Enregistrer
              </button>
              <button type="button" className="bouton" disabled={!nomValide || !programme.seances.length} onClick={() => setEtape('planifier')}>
                Suivant : planifier
              </button>
            </>
          )}
          {etape === 'planifier' && (
            <>
              <button type="button" className="bouton secondaire" disabled={!nomValide} onClick={() => onEnregistrer(finale)}>
                Enregistrer sans planifier
              </button>
              <button
                type="button"
                className="bouton"
                disabled={!nomValide || nbAPlanifier === 0}
                onClick={() => onPlanifier(finale, dateDepart < aujourdHui ? aujourdHui : dateDepart, semaines, creneauxValides)}
              >
                Planifier {nbAPlanifier} séance{nbAPlanifier > 1 ? 's' : ''}
              </button>
            </>
          )}
        </>
      }
    >
      <Segments libelle="Étapes" options={ETAPES} valeur={etape} onChange={(e) => nomValide && setEtape(e)} />

      {etape === 'infos' && (
        <div className="prog-formulaire">
          <div className="champ">
            <label htmlFor="programme-nom">Nom du programme</label>
            <input
              id="programme-nom"
              autoFocus
              placeholder="ex. PPL, Préparation 10 km…"
              value={programme.nom}
              onChange={(e) => setProgramme({ ...programme, nom: e.target.value })}
            />
          </div>
          <div className="champ">
            <span className="champ-nom">Couleur dans le calendrier</span>
            <div className="prog-couleurs" role="radiogroup" aria-label="Couleur">
              {COULEURS_PROGRAMMES.map((c, i) => (
                <label key={c} style={{ background: c }}>
                  <input
                    type="radio"
                    name="couleur"
                    checked={programme.couleur === c}
                    onChange={() => setProgramme({ ...programme, couleur: c })}
                  />
                  <span className="visuellement-cache">Couleur {i + 1}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {etape === 'seances' && (
        <div className="prog-modeles">
          {programme.seances.length === 0 && (
            <p className="prog-rien">Un programme contient des séances types : ajoutez la première.</p>
          )}
          {programme.seances.map((modele) => (
            <section key={modele.id} className="prog-modele" aria-label={modele.nom}>
              <div className="prog-modele-tete">
                <div className="champ">
                  <label htmlFor={`modele-${modele.id}`}>Nom de la séance</label>
                  <input id={`modele-${modele.id}`} value={modele.nom} onChange={(e) => modifierSeance(modele.id, { nom: e.target.value })} />
                </div>
                <div className="champ prog-modele-duree">
                  <label htmlFor={`duree-${modele.id}`}>Durée (min)</label>
                  <input
                    id={`duree-${modele.id}`}
                    type="number"
                    min={5}
                    step={5}
                    value={modele.dureeMin}
                    onChange={(e) => modifierSeance(modele.id, { dureeMin: Number(e.target.value) || 60 })}
                  />
                </div>
                <button
                  type="button"
                  className="bouton-icone discret danger"
                  onClick={() => setProgramme({ ...programme, seances: programme.seances.filter((s) => s.id !== modele.id) })}
                >
                  <Icone trace={ICONES.corbeille} />
                  <span className="visuellement-cache">Retirer la séance {modele.nom}</span>
                </button>
              </div>
              <EditeurExercices exercices={modele.exercices} onChange={(exercices) => modifierSeance(modele.id, { exercices })} />
            </section>
          ))}
          <button type="button" className="bouton secondaire petit prog-ajout-modele" onClick={ajouterSeanceType}>
            <Icone trace={ICONES.ajouter} />
            Ajouter une séance type
          </button>
        </div>
      )}

      {etape === 'planifier' &&
        (programme.seances.length === 0 ? (
          <EtatVide icone={ICONES.calendrier} titre="Aucune séance type à planifier">
            Ajoutez d'abord des séances au programme (étape 2).
          </EtatVide>
        ) : (
          <div className="prog-formulaire">
            <p className="champ-aide">
              Chaque séance type revient chaque semaine, au jour et à l'heure choisis. Les séances créées
              sont des copies : vous pourrez les déplacer ou les modifier une par une.
            </p>
            <div className="champs-ligne">
              <div className="champ">
                <label htmlFor="plan-depart">À partir du</label>
                <input id="plan-depart" type="date" value={depart} onChange={(e) => e.target.value && setDepart(e.target.value)} />
              </div>
              <div className="champ">
                <label htmlFor="plan-semaines">Pendant</label>
                <select id="plan-semaines" value={semaines} onChange={(e) => setSemaines(Number(e.target.value))}>
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>{n} semaine{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="tableau-donnees prog-creneaux">
              <thead>
                <tr>
                  <th scope="col">Séance</th>
                  <th scope="col">Jour</th>
                  <th scope="col">Heure</th>
                </tr>
              </thead>
              <tbody>
                {programme.seances.map((modele) => {
                  const creneau = creneauxValides.find((c) => c.modeleId === modele.id) ?? { modeleId: modele.id, jour: 0, heure: '18:00' }
                  const changer = (modifications: Partial<Creneau>) =>
                    setCreneaux([...creneaux.filter((c) => c.modeleId !== modele.id), { ...creneau, ...modifications }])
                  return (
                    <tr key={modele.id}>
                      <td><strong>{modele.nom}</strong></td>
                      <td>
                        <select aria-label={`Jour de ${modele.nom}`} value={creneau.jour} onChange={(e) => changer({ jour: Number(e.target.value) })}>
                          {JOURS.map((nom, i) => (
                            <option key={nom} value={i}>{nom}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="time"
                          aria-label={`Heure de ${modele.nom}`}
                          value={creneau.heure}
                          onChange={(e) => e.target.value && changer({ heure: e.target.value })}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
    </Fenetre>
  )
}

export default Programmation
