import { type SubmitEvent, useState } from 'react'
import '../styles/nutrition.css'
import EtatVide from '../components/EtatVide.tsx'
import Fenetre from '../components/Fenetre.tsx'
import Icone from '../components/Icone.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useNutrition from '../hooks/useNutrition.ts'
import {
  formatDateLongue,
  formatJour,
  formatJourRelatif,
  nombre,
} from '../lib/format.ts'
import {
  type Aliment,
  REPAS,
  type Repas,
  AJOUTS_EAU_ML,
  kcalDesMacros,
} from '../lib/nutrition.ts'

type DonneesNutrition = ReturnType<typeof useNutrition>

const entier = (n: number) => nombre(Math.round(n), 0)

function Nutrition() {
  const n = useNutrition()
  const [ajout, setAjout] = useState(false)
  const [afficherAnalyse, setAfficherAnalyse] = useState(false)

  const libelleJour = formatJourRelatif(n.jour, n.aujourdHui)

  const totalAliments = n.alimentsDuJour.length
  const alimentsDifferents = new Set(
    n.alimentsDuJour.map((a) => a.nom.trim().toLocaleLowerCase()),
  ).size

  const totalProteines = n.totauxDuJour.proteines
  const totalGlucides = n.totauxDuJour.glucides
  const totalLipides = n.totauxDuJour.lipides

  return (
    <div className="ecran nutrition">
      <TitrePage
        surtitre="Suivi"
        titre="Nutrition"
        actions={
          <div className="nutrition-jour" role="group" aria-label="Jour affiché">
            <button
              type="button"
              className="bouton-icone"
              onClick={n.jourPrecedent}
            >
              <Icone trace={ICONES.precedent} />
              <span className="visuellement-cache">Jour précédent</span>
            </button>

            <span className="nutrition-jour-nom" aria-live="polite">
              {libelleJour}
              <small>{formatDateLongue(n.jour)}</small>
            </span>

            <button
              type="button"
              className="bouton-icone"
              onClick={n.jourSuivant}
              disabled={n.estAujourdhui}
            >
              <Icone trace={ICONES.chevron} />
              <span className="visuellement-cache">Jour suivant</span>
            </button>

            {!n.estAujourdhui && (
              <button
                type="button"
                className="bouton secondaire petit"
                onClick={n.revenirAujourdhui}
              >
                Aujourd'hui
              </button>
            )}
          </div>
        }
      >
        Retrouvez vos repas, vos habitudes alimentaires et les statistiques
        associées.
      </TitrePage>

      {n.erreurEnvoi && (
        <p className="alerte" role="alert">
          <Icone trace={ICONES.info} />
          Certains repas n'ont pas pu être enregistrés sur votre compte :
          ils restent gardés sur cet appareil et seront renvoyés ultérieurement.
        </p>
      )}

      <section className="nutrition-apercu" aria-label="Résumé de la journée">
        <div className="nutrition-apercu-carte">
          <span>Repas et aliments saisis</span>
          <strong>{totalAliments}</strong>
          <small>Entrées enregistrées pour cette journée</small>
        </div>

        <div className="nutrition-apercu-carte">
          <span>Noms d'aliments différents</span>
          <strong>{alimentsDifferents}</strong>
          <small>Selon les noms renseignés dans le journal</small>
        </div>

        <div className="nutrition-apercu-carte">
          <span>Hydratation enregistrée</span>
          <strong>{nombre(n.eauMl / 1000, 2)} L</strong>
          <small>
            {n.besoins ? `Objectif : ${nombre(n.besoins.eauMl / 1000, 2)} L` : `${n.nombreAjoutsEau} ajout(s) enregistré(s)`}
          </small>
        </div>
      </section>

      <Panneau
        titre={`Journal · ${libelleJour}`}
        className="nutrition-journal"
        action={
          <button
            type="button"
            className="bouton petit"
            onClick={() => setAjout(true)}
          >
            <Icone trace={ICONES.ajouter} />
            Ajouter
          </button>
        }
      >
        {n.alimentsDuJour.length === 0 ? (
          <EtatVide
            icone={ICONES.nutrition}
            titre="Rien de noté pour ce jour"
            action={
              <button
                type="button"
                className="bouton secondaire petit"
                onClick={() => setAjout(true)}
              >
                Noter un repas
              </button>
            }
          >
            Notez les aliments de vos repas pour retrouver leur composition
            nutritionnelle dans votre journal.
          </EtatVide>
        ) : (
          REPAS.map((repas) => {
            const aliments = n.alimentsDuJour.filter(
              (a) => a.repas === repas.valeur,
            )

            if (aliments.length === 0) return null

            return (
              <div key={repas.valeur} className="nutrition-repas">
                <h3>
                  {repas.nom}
                  <span>
                    {entier(
                      aliments.reduce((t, a) => t + a.kcal, 0),
                    )}{' '}
                    kcal
                  </span>
                </h3>

                <ul>
                  {aliments.map((aliment) => (
                    <LigneAliment
                      key={aliment.id}
                      aliment={aliment}
                      onSupprimer={() => n.supprimer(aliment.id)}
                    />
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </Panneau>

      <div className="nutrition-grille">
        <Panneau titre="Composition des repas">
          {totalAliments === 0 ? (
            <p className="nutrition-note">
              Les informations apparaîtront après l'enregistrement d'un repas.
            </p>
          ) : (
            <div className="nutrition-composition">
              <div>
                <span>Protéines</span>
                <strong>{nombre(totalProteines)} g</strong>
              </div>
              <div>
                <span>Glucides</span>
                <strong>{nombre(totalGlucides)} g</strong>
              </div>
              <div>
                <span>Lipides</span>
                <strong>{nombre(totalLipides)} g</strong>
              </div>
            </div>
          )}

          <p className="nutrition-note">
            Ces valeurs décrivent uniquement les aliments saisis dans le journal.
          </p>
        </Panneau>

        <Hydratation n={n} />
      </div>

      <Panneau titre="Analyse nutritionnelle">
        <p>
          Consultez les statistiques calculées à partir des repas enregistrés
          pour cette journée.
        </p>

        {totalAliments === 0 && (
          <p className="nutrition-note">
            Aucun repas enregistré pour cette journée. Ajoutez un repas pour
            pouvoir lancer l'analyse.
          </p>
        )}

        <button
          type="button"
          className="bouton"
          onClick={async () => {
            setAfficherAnalyse(true)
            await n.lancerAnalyse()
          }}
          disabled={n.chargementAnalyse || totalAliments === 0}
        >
          {n.chargementAnalyse
            ? 'Analyse en cours...'
            : 'Analyser cette journée'}
        </button>

        {n.erreurAnalyse && (
          <p className="alerte" role="alert">
            {n.erreurAnalyse}
          </p>
        )}

        {n.chargementAnalyse && (
          <p aria-live="polite">Calcul des statistiques en cours...</p>
        )}

        {afficherAnalyse && n.analyse && (
          <div className="nutrition-analyse">
            <div>
              <h3>Résumé de la journée</h3>

              <div className="nutrition-analyse-resume">
                <CarteAnalyse
                  titre="Repas analysés"
                  valeur={String(n.analyse.nombreRepas)}
                />
                <CarteAnalyse
                  titre="Énergie estimée depuis les macros"
                  valeur={`${entier(n.analyse.energieMacrosKcal)} kcal`}
                />
                <CarteAnalyse
                  titre="Écart calories / macros"
                  valeur={`${entier(n.analyse.ecartCaloriesMacros)} kcal`}
                />
              </div>
            </div>

            <section className="nutrition-analyse-section">
              <h3>Répartition des macronutriments</h3>

              <div className="nutrition-analyse-macros">
                {([
                  ['Protéines', n.analyse.repartitionMacros.proteines_pct],
                  ['Glucides', n.analyse.repartitionMacros.glucides_pct],
                  ['Lipides', n.analyse.repartitionMacros.lipides_pct],
                ] as const).map(([nom, valeur]) => {
                  const pourcentage = Number.isFinite(valeur)
                    ? Math.min(100, Math.max(0, valeur))
                    : 0

                  return (
                    <div className="nutrition-analyse-macro" key={nom}>
                      <div className="nutrition-analyse-macro-entete">
                        <strong>{nom}</strong>
                        <span>{nombre(pourcentage)} %</span>
                      </div>

                      <div
                        className="nutrition-analyse-barre"
                        role="progressbar"
                        aria-label={nom}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pourcentage}
                      >
                        <span style={{ width: `${pourcentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="nutrition-analyse-section">
              <h3>Repas de la journée</h3>
              <p>
                Repas avec le plus de calories déclarées :{' '}
                <strong>
                  {n.analyse.repasPlusCalorique ?? 'Non disponible'}
                </strong>
              </p>
              <p>
                Repas avec le plus de protéines déclarées :{' '}
                <strong>
                  {n.analyse.repasPlusProteine ?? 'Non disponible'}
                </strong>
              </p>
            </section>

            <section className="nutrition-analyse-section">
              <h3>Statistiques des apports enregistrés</h3>

              <div className="nutrition-analyse-statistiques">
                {Object.entries(n.analyse.statistiques).map(
                  ([cle, stats]) => (
                    <div className="nutrition-analyse-stat" key={cle}>
                      <strong>
                        {cle.charAt(0).toUpperCase() + cle.slice(1)}
                      </strong>
                      <small>Total : {nombre(stats.total)}</small>
                      <small>Moyenne : {nombre(stats.moyenne)}</small>
                      <small>Minimum : {nombre(stats.minimum)}</small>
                      <small>Maximum : {nombre(stats.maximum)}</small>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        )}
      </Panneau>

      <Semaine n={n} />

      <p className="nutrition-limites">
        <Icone trace={ICONES.info} />
        Ces statistiques décrivent uniquement les repas saisis. Elles sont
        indicatives et ne constituent pas un avis médical.
      </p>

      {ajout && (
        <FenetreAjout
          onAjouter={n.ajouter}
          onFermer={() => setAjout(false)}
        />
      )}
    </div>
  )
}

function CarteAnalyse({
  titre,
  valeur,
}: {
  titre: string
  valeur: string
}) {
  return (
    <div className="nutrition-analyse-carte">
      <small>{titre}</small>
      <strong>{valeur}</strong>
    </div>
  )
}

function LigneAliment({
  aliment,
  onSupprimer,
}: {
  aliment: Aliment
  onSupprimer: () => void
}) {
  return (
    <li className="nutrition-aliment">
      <div>
        <strong>{aliment.nom}</strong>
        <small>
          P {entier(aliment.proteines)} g · G {entier(aliment.glucides)} g ·
          L {entier(aliment.lipides)} g
        </small>
      </div>

      <span className="nutrition-aliment-kcal">
        {entier(aliment.kcal)} kcal
      </span>

      <button
        type="button"
        className="bouton-icone discret danger"
        onClick={onSupprimer}
      >
        <Icone trace={ICONES.corbeille} />
        <span className="visuellement-cache">
          Supprimer : {aliment.nom}
        </span>
      </button>
    </li>
  )
}

function Hydratation({ n }: { n: DonneesNutrition }) {
  const litres = (ml: number) => `${nombre(ml / 1000, 2)} L`
  const objectif = n.besoins?.eauMl
  const progression = objectif ? Math.min(100, Math.round((n.eauMl / objectif) * 100)) : 0

  return (
    <Panneau titre="Hydratation">
      <p className="nutrition-eau-total" aria-live="polite">
        <strong className="chiffre">{litres(n.eauMl)}</strong>
        {objectif !== undefined && <span> / {litres(objectif)}</span>}
      </p>

      {objectif !== undefined && (
        <div
          className="nutrition-eau-barre"
          role="progressbar"
          aria-label="Objectif d'hydratation"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progression}
        >
          <span style={{ width: `${progression}%` }} />
        </div>
      )}

      <div className="nutrition-eau-ajouts">
        {AJOUTS_EAU_ML.map((ml) => (
          <button
            key={ml}
            type="button"
            className="bouton secondaire"
            onClick={() => n.ajouterEau(ml)}
            disabled={n.chargementEau}
          >
            +{litres(ml)}
            <span className="visuellement-cache"> d'eau</span>
          </button>
        ))}
      </div>

      <div className="nutrition-eau-pied">
        <p className="nutrition-note">
          {objectif === undefined
            ? 'Complétez votre profil pour obtenir un objectif.'
            : n.eauMl >= objectif
              ? 'Objectif atteint pour cette journée.'
              : `Encore ${litres(objectif - n.eauMl)} pour atteindre l'objectif (35 ml par kilo).`}
        </p>
        <button
          type="button"
          className="nutrition-eau-annuler"
          onClick={n.annulerEau}
          disabled={n.chargementEau || n.nombreAjoutsEau === 0}
        >
          Annuler le dernier ajout
        </button>
      </div>
    </Panneau>
  )
}

function Semaine({ n }: { n: DonneesNutrition }) {
  const maximum = Math.max(
    1,
    ...n.semaine.map((j) => j.nombreRepas),
  )

  return (
    <Panneau titre="Repas enregistrés · 7 derniers jours">
      <p className="nutrition-note">
        Nombre d'entrées enregistrées dans le journal, jour par jour.
      </p>

      <div className="nutrition-semaine">
        <div
          className="nutrition-semaine-zone"
          role="list"
          aria-label="Nombre de repas enregistrés sur sept jours"
        >
          {n.semaine.map((j) => (
            <div
              key={j.date.toISOString()}
              role="listitem"
              className="nutrition-semaine-colonne"
            >
              <strong>{j.nombreRepas || ''}</strong>
              <i
                style={{
                  height: `${(j.nombreRepas / maximum) * 100}%`,
                }}
              />
              <span className="visuellement-cache">
                {formatJour(j.date)} : {j.nombreRepas} entrée(s),{' '}
                {j.alimentsDifferents} nom(s) d'aliments différent(s)
              </span>
            </div>
          ))}
        </div>

        <div className="nutrition-semaine-jours" aria-hidden="true">
          {n.semaine.map((j) => (
            <small key={j.date.toISOString()}>
              {formatJour(j.date)}
            </small>
          ))}
        </div>
      </div>

      <div className="nutrition-semaine-detail">
        {n.semaine.map((j) => (
          <div key={j.date.toISOString()}>
            <span>{formatJour(j.date)}</span>
            <strong>
              {j.nombreRepas} entrée{j.nombreRepas > 1 ? 's' : ''}
            </strong>
            <small>
              {j.alimentsDifferents} nom(s) différent(s)
            </small>
          </div>
        ))}
      </div>
    </Panneau>
  )
}

function FenetreAjout({
  onAjouter,
  onFermer,
}: {
  onAjouter: DonneesNutrition['ajouter']
  onFermer: () => void
}) {
  const [repas, setRepas] = useState<Repas>(() =>
    repasSelonHeure(new Date()),
  )
  const [nom, setNom] = useState('')
  const [proteines, setProteines] = useState('')
  const [glucides, setGlucides] = useState('')
  const [lipides, setLipides] = useState('')
  const [kcal, setKcal] = useState('')

  const lire = (texte: string) =>
    Math.max(0, Number(texte.replace(',', '.')) || 0)

  const kcalCalculees = kcalDesMacros(
    lire(proteines),
    lire(glucides),
    lire(lipides),
  )

  const kcalFinales = kcal ? lire(kcal) : kcalCalculees
  const valide = kcalFinales > 0 || lire(proteines) > 0

  function valider(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valide) return

    onAjouter({
      repas,
      nom: nom.trim() || 'Saisie rapide',
      kcal: Math.round(kcalFinales),
      proteines: lire(proteines),
      glucides: lire(glucides),
      lipides: lire(lipides),
    })

    onFermer()
  }

  const champ = (
    id: string,
    libelle: string,
    valeur: string,
    changer: (v: string) => void,
    placeholder = '0',
  ) => (
    <div className="champ">
      <label htmlFor={id}>{libelle}</label>
      <input
        id={id}
        inputMode="decimal"
        placeholder={placeholder}
        value={valeur}
        onChange={(e) =>
          changer(e.target.value.replace(/[^\d.,]/g, ''))
        }
      />
    </div>
  )

  return (
    <Fenetre
      ouverte
      titre="Ajouter à votre journée"
      onFermer={onFermer}
      pied={
        <>
          <button
            type="button"
            className="bouton secondaire"
            onClick={onFermer}
          >
            Annuler
          </button>

          <button
            type="submit"
            form="formulaire-aliment"
            className="bouton"
            disabled={!valide}
          >
            Ajouter
          </button>
        </>
      }
    >
      <form
        id="formulaire-aliment"
        className="nutrition-formulaire"
        onSubmit={valider}
      >
        <div className="champ">
          <span className="champ-nom">Repas</span>
          <Segments
            libelle="Repas"
            options={REPAS}
            valeur={repas}
            onChange={setRepas}
          />
        </div>

        <div className="champ">
          <label htmlFor="aliment-nom">Aliment (facultatif)</label>
          <input
            id="aliment-nom"
            value={nom}
            maxLength={80}
            placeholder="ex. Poulet et riz, fruit et yaourt..."
            onChange={(e) => setNom(e.target.value)}
          />
        </div>

        <div className="champs-ligne">
          {champ(
            'aliment-proteines',
            'Protéines (g)',
            proteines,
            setProteines,
          )}
          {champ(
            'aliment-glucides',
            'Glucides (g)',
            glucides,
            setGlucides,
          )}
          {champ(
            'aliment-lipides',
            'Lipides (g)',
            lipides,
            setLipides,
          )}
        </div>

        {champ(
          'aliment-kcal',
          'Calories (kcal)',
          kcal,
          setKcal,
          kcalCalculees ? String(kcalCalculees) : '0',
        )}

        <p className="champ-aide">
          {kcal
            ? 'Calories saisies à la main.'
            : kcalCalculees
              ? `Estimation calculée à partir des macronutriments : ${entier(kcalCalculees)} kcal.`
              : 'Laissez vide : elles seront estimées à partir des macronutriments.'}
        </p>
      </form>
    </Fenetre>
  )
}

function repasSelonHeure(maintenant: Date): Repas {
  const heure = maintenant.getHours()

  if (heure < 11) return 'petit-dejeuner'
  if (heure < 15) return 'dejeuner'
  if (heure >= 18) return 'diner'

  return 'collation'
}

export default Nutrition