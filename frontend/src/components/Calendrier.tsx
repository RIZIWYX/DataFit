import { type CSSProperties, type DragEvent, useEffect, useRef } from 'react'
import { ICONES } from '../data/icones.ts'
import { formatHeure } from '../lib/format.ts'
import { type SeancePlanifiee, ajouterJours, cleJour, debutSemaine, depuisIso } from '../lib/programmation.ts'
import Icone from './Icone.tsx'

export type Vue = 'mois' | 'semaine' | 'jour'

type Props = {
  vue: Vue
  reference: Date // un jour de la période affichée
  seances: SeancePlanifiee[] // déjà filtrées par programme
  couleur: (seance: SeancePlanifiee) => string
  aujourdHui: Date
  onOuvrir: (id: string) => void
  onCreer: (debut: Date) => void
  onDeplacer: (id: string, debut: Date) => void
  onVoirJour: (jour: Date) => void
}

// la grille horaire va de 6 h à minuit
const HEURE_DEBUT = 6
const HEURE_FIN = 24
const HAUTEUR_HEURE = 52 // px
const HEURES = Array.from({ length: HEURE_FIN - HEURE_DEBUT }, (_, i) => HEURE_DEBUT + i)
const NOMS_JOURS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']

const memeJour = (a: Date, b: Date) => cleJour(a) === cleJour(b)

// les séances d'un jour, de la plus tôt à la plus tard
const duJour = (seances: SeancePlanifiee[], jour: Date) =>
  seances.filter((s) => s.debut.startsWith(cleJour(jour))).sort((a, b) => a.debut.localeCompare(b.debut))

// Glisser-déposer : la séance déplacée garde son heure (vue mois) ou prend celle du créneau (vues horaires).
// Au clavier, on la déplace en modifiant sa date dans sa fiche.
const glisser = (id: string) => (event: DragEvent) => {
  event.dataTransfer.setData('text/plain', id)
  event.dataTransfer.effectAllowed = 'move'
}
const autoriserDepot = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

function Pastille({ seance, couleur, onOuvrir, style }: { seance: SeancePlanifiee; couleur: string; onOuvrir: (id: string) => void; style?: CSSProperties }) {
  const debut = depuisIso(seance.debut)
  return (
    <button
      type="button"
      draggable
      onDragStart={glisser(seance.id)}
      onClick={(e) => {
        e.stopPropagation()
        onOuvrir(seance.id)
      }}
      className={seance.faite ? 'cal-seance faite' : 'cal-seance'}
      style={{ '--couleur': couleur, ...style } as CSSProperties}
      title={`${seance.titre} · ${formatHeure(debut)}${seance.faite ? ' · faite' : ''}`}
    >
      <span className="cal-seance-heure">{formatHeure(debut)}</span>
      <span className="cal-seance-titre">{seance.titre}</span>
      {seance.faite && <Icone trace={ICONES.valide} />}
    </button>
  )
}

function Calendrier(props: Props) {
  return props.vue === 'mois' ? <VueMois {...props} /> : <VueHoraire {...props} />
}

// ---------- mois : une case par jour, trois séances visibles au plus ----------

function VueMois({ reference, seances, couleur, aujourdHui, onOuvrir, onCreer, onDeplacer, onVoirJour }: Props) {
  const premier = new Date(reference.getFullYear(), reference.getMonth(), 1)
  const debut = debutSemaine(premier)
  const nbJoursMois = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate()
  const nbSemaines = Math.ceil((((premier.getDay() + 6) % 7) + nbJoursMois) / 7)
  const jours = Array.from({ length: nbSemaines * 7 }, (_, i) => ajouterJours(debut, i))

  function deposer(event: DragEvent, jour: Date) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    const seance = seances.find((s) => s.id === id)
    if (!seance) return
    const ancienne = depuisIso(seance.debut)
    onDeplacer(id, new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), ancienne.getHours(), ancienne.getMinutes()))
  }

  return (
    <div className="cal-mois">
      <div className="cal-mois-entete" aria-hidden="true">
        {NOMS_JOURS.map((nom) => (
          <span key={nom}>{nom}</span>
        ))}
      </div>
      <div className="cal-mois-grille">
        {jours.map((jour) => {
          const liste = duJour(seances, jour)
          const classes = ['cal-jour']
          if (jour.getMonth() !== reference.getMonth()) classes.push('hors-mois')
          if (memeJour(jour, aujourdHui)) classes.push('aujourdhui')
          return (
            <div
              key={jour.getTime()}
              className={classes.join(' ')}
              onClick={() => onCreer(new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), 18, 0))}
              onDragOver={autoriserDepot}
              onDrop={(e) => deposer(e, jour)}
              title="Cliquer pour ajouter une séance ce jour-là"
            >
              <span className="cal-jour-numero">{jour.getDate()}</span>
              {liste.slice(0, 3).map((seance) => (
                <Pastille key={seance.id} seance={seance} couleur={couleur(seance)} onOuvrir={onOuvrir} />
              ))}
              {liste.length > 3 && (
                <button
                  type="button"
                  className="cal-plus"
                  onClick={(e) => {
                    e.stopPropagation()
                    onVoirJour(jour)
                  }}
                >
                  + {liste.length - 3} autre{liste.length > 4 ? 's' : ''}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- semaine et jour : une grille horaire ----------

function VueHoraire({ vue, reference, seances, couleur, aujourdHui, onOuvrir, onCreer, onDeplacer }: Props) {
  const jours =
    vue === 'semaine'
      ? Array.from({ length: 7 }, (_, i) => ajouterJours(debutSemaine(reference), i))
      : [new Date(reference.getFullYear(), reference.getMonth(), reference.getDate())]
  const defilement = useRef<HTMLDivElement>(null)

  // à l'ouverture, la grille montre la journée à partir de 7 h
  useEffect(() => {
    defilement.current?.scrollTo({ top: (7 - HEURE_DEBUT) * HAUTEUR_HEURE })
  }, [vue])

  function deposer(event: DragEvent, jour: Date, heure: number) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    const seance = seances.find((s) => s.id === id)
    if (!seance) return
    const ancienne = depuisIso(seance.debut)
    onDeplacer(id, new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), heure, ancienne.getMinutes()))
  }

  // la position d'une heure dans la grille, en pixels
  const position = (date: Date) => (date.getHours() + date.getMinutes() / 60 - HEURE_DEBUT) * HAUTEUR_HEURE
  const maintenant = position(aujourdHui)

  return (
    <div className={`cal-horaire ${vue}`} style={{ '--colonnes': jours.length, '--hauteur-heure': `${HAUTEUR_HEURE}px` } as CSSProperties}>
      <div className="cal-horaire-entete">
        <span />
        {jours.map((jour) => (
          <span key={jour.getTime()} className={memeJour(jour, aujourdHui) ? 'aujourdhui' : undefined}>
            <small>{NOMS_JOURS[(jour.getDay() + 6) % 7]}</small>
            <b>{jour.getDate()}</b>
          </span>
        ))}
      </div>

      <div ref={defilement} className="cal-horaire-defilement">
        <div className="cal-horaire-grille">
          <div className="cal-heures" aria-hidden="true">
            {HEURES.map((heure) => (
              <span key={heure}>{heure} h</span>
            ))}
          </div>

          {jours.map((jour) => {
            const liste = duJour(seances, jour)
            // séances qui se chevauchent : côte à côte, sur des « couloirs »
            const finsCouloirs: number[] = []
            const places = liste.map((seance) => {
              const debut = depuisIso(seance.debut).getTime()
              let couloir = finsCouloirs.findIndex((fin) => fin <= debut)
              if (couloir === -1) couloir = finsCouloirs.length
              finsCouloirs[couloir] = debut + seance.dureeMin * 60_000
              return couloir
            })
            const nbCouloirs = Math.max(1, finsCouloirs.length)

            return (
              <div key={jour.getTime()} className={memeJour(jour, aujourdHui) ? 'cal-colonne aujourdhui' : 'cal-colonne'}>
                {HEURES.map((heure) => (
                  <div
                    key={heure}
                    className="cal-creneau"
                    title={`Ajouter une séance à ${heure} h`}
                    onClick={() => onCreer(new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), heure, 0))}
                    onDragOver={autoriserDepot}
                    onDrop={(e) => deposer(e, jour, heure)}
                  />
                ))}

                {liste.map((seance, i) => {
                  const debut = depuisIso(seance.debut)
                  return (
                    <Pastille
                      key={seance.id}
                      seance={seance}
                      couleur={couleur(seance)}
                      onOuvrir={onOuvrir}
                      style={{
                        top: Math.max(0, position(debut)),
                        height: Math.max(26, (seance.dureeMin / 60) * HAUTEUR_HEURE - 3),
                        left: `calc(${(places[i] / nbCouloirs) * 100}% + 3px)`,
                        width: `calc(${100 / nbCouloirs}% - 6px)`,
                      }}
                    />
                  )
                })}

                {/* l'heure qu'il est : un trait turquoise dans la colonne du jour */}
                {memeJour(jour, aujourdHui) && maintenant >= 0 && (
                  <span className="cal-maintenant" style={{ top: maintenant }} aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Calendrier
