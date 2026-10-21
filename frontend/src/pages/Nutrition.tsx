import { type SubmitEvent, useState } from 'react'
import '../styles/nutrition.css'
import EtatVide from '../components/EtatVide.tsx'
import Fenetre from '../components/Fenetre.tsx'
import Icone from '../components/Icone.tsx'
import Jauge from '../components/Jauge.tsx'
import Panneau from '../components/Panneau.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useNutrition from '../hooks/useNutrition.ts'
import { formatDateLongue, formatJour, formatJourRelatif, nombre } from '../lib/format.ts'
import {
  ACTIVITES,
  type Aliment,
  type Besoins,
  KCAL,
  PART_LIPIDES,
  REPAS,
  type Repas,
  type Totaux,
  VERRE_ML,
  kcalDesMacros,
} from '../lib/nutrition.ts'
import { OBJECTIFS } from '../lib/profil.ts'

type DonneesNutrition = ReturnType<typeof useNutrition>

// les quatre compteurs du jour : ce qui est mangé face à ce qu'il faut
const COMPTEURS: { cle: keyof Totaux; nom: string; unite: string }[] = [
  { cle: 'kcal', nom: 'Calories', unite: 'kcal' },
  { cle: 'proteines', nom: 'Protéines', unite: 'g' },
  { cle: 'glucides', nom: 'Glucides', unite: 'g' },
  { cle: 'lipides', nom: 'Lipides', unite: 'g' },
]

const entier = (n: number) => nombre(Math.round(n), 0)

function Nutrition() {
  const n = useNutrition()
  const [ajout, setAjout] = useState(false)
  const { besoins } = n

  if (!besoins) {
    return (
      <div className="ecran">
        <TitrePage surtitre="Suivi" titre="Nutrition" />
        <EtatVide icone={ICONES.nutrition} titre="Profil incomplet">
          Votre poids, votre taille, votre sexe et votre date de naissance servent à calculer vos besoins.
        </EtatVide>
      </div>
    )
  }

  const libelleJour = formatJourRelatif(n.jour, n.aujourdHui)

  return (
    <div className="ecran nutrition">
      <TitrePage
        surtitre="Suivi"
        titre="Nutrition"
        actions={
          <div className="nutrition-jour" role="group" aria-label="Jour affiché">
            <button type="button" className="bouton-icone" onClick={n.jourPrecedent}>
              <Icone trace={ICONES.precedent} />
              <span className="visuellement-cache">Jour précédent</span>
            </button>
            <span className="nutrition-jour-nom" aria-live="polite">
              {libelleJour}
              <small>{formatDateLongue(n.jour)}</small>
            </span>
            <button type="button" className="bouton-icone" onClick={n.jourSuivant} disabled={n.estAujourdhui}>
              <Icone trace={ICONES.chevron} />
              <span className="visuellement-cache">Jour suivant</span>
            </button>
            {!n.estAujourdhui && (
              <button type="button" className="bouton secondaire petit" onClick={n.revenirAujourdhui}>
                Aujourd'hui
              </button>
            )}
          </div>
        }
      >
        Ce qu'il vous faut selon votre objectif, et ce que vous avez mangé.
      </TitrePage>

      {/* ---------- objectif et activité : ils fixent les besoins ---------- */}
      <section className="nutrition-reglages" aria-label="Objectif et activité">
        <div className="nutrition-reglage">
          <h2 className="surtitre">Votre objectif</h2>
          <Segments libelle="Objectif" options={OBJECTIFS} valeur={n.objectif} onChange={n.choisirObjectif} />
          <p>{premiereLettre(besoins.explication)}.</p>
        </div>
        <div className="nutrition-reglage">
          <h2 className="surtitre">Votre activité</h2>
          <Segments
            libelle="Activité"
            options={ACTIVITES.map((a) => ({ valeur: a.valeur, nom: a.nom }))}
            valeur={n.activite}
            onChange={n.choisirActivite}
          />
          <p>{premiereLettre(ACTIVITES.find((a) => a.valeur === n.activite)?.detail ?? '')}.</p>
        </div>
      </section>

      {/* ---------- le jour : mangé / besoin ---------- */}
      <section className="nutrition-compteurs" aria-label={`Bilan : ${libelleJour}`}>
        {COMPTEURS.map((c) => (
          <Compteur key={c.cle} nom={c.nom} unite={c.unite} mange={n.totauxDuJour[c.cle]} besoin={besoins[c.cle]} />
        ))}
      </section>

      {n.erreurEnvoi && (
        <p className="alerte" role="alert">
          <Icone trace={ICONES.info} />
          Les repas d'aujourd'hui n'ont pas pu être enregistrés sur votre compte : ils restent gardés sur cet
          appareil, et seront renvoyés au prochain changement.
        </p>
      )}

      <div className="nutrition-grille">
        <Panneau
          titre={`Journal · ${libelleJour}`}
          className="nutrition-journal"
          action={
            <button type="button" className="bouton petit" onClick={() => setAjout(true)}>
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
                <button type="button" className="bouton secondaire petit" onClick={() => setAjout(true)}>
                  Noter un repas
                </button>
              }
            >
              Notez ce que vous mangez : les grammes de protéines, de glucides et de lipides suffisent, les
              calories se calculent toutes seules.
            </EtatVide>
          ) : (
            REPAS.map((repas) => {
              const aliments = n.alimentsDuJour.filter((a) => a.repas === repas.valeur)
              if (aliments.length === 0) return null
              return (
                <div key={repas.valeur} className="nutrition-repas">
                  <h3>
                    {repas.nom}
                    <span>{entier(aliments.reduce((t, a) => t + a.kcal, 0))} kcal</span>
                  </h3>
                  <ul>
                    {aliments.map((aliment) => (
                      <LigneAliment key={aliment.id} aliment={aliment} onSupprimer={() => n.supprimer(aliment.id)} />
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </Panneau>

        <div className="nutrition-cote">
          <Calcul besoins={besoins} />
          <Hydratation n={n} besoinMl={besoins.eauMl} />
        </div>
      </div>

      <Semaine n={n} besoin={besoins.kcal} />

      <p className="nutrition-limites">
        <Icone trace={ICONES.info} />
        Des repères généraux, calculés à partir de votre profil : pas un avis médical. DataFit ne connaît que ce que
        vous notez ici.
      </p>

      {ajout && <FenetreAjout onAjouter={n.ajouter} onFermer={() => setAjout(false)} />}
    </div>
  )
}

const premiereLettre = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)

// ---------- un compteur : mangé / besoin, la jauge, ce qui reste ----------

function Compteur({ nom, unite, mange, besoin }: { nom: string; unite: string; mange: number; besoin: number }) {
  const reste = besoin - mange
  const atteint = reste <= 0
  return (
    <div className="compteur">
      <p className="compteur-nom">{nom}</p>
      <p className="compteur-valeur chiffre">
        {entier(mange)}
        <span className="compteur-besoin">
          / {entier(besoin)} {unite}
        </span>
      </p>
      <Jauge
        part={besoin > 0 ? mange / besoin : 0}
        libelle={`${nom} : ${entier(mange)} sur ${entier(besoin)} ${unite}`}
        couleur={atteint ? 'var(--turquoise)' : undefined}
      />
      <p className={atteint ? 'compteur-reste atteint' : 'compteur-reste'}>
        {reste === 0
          ? 'Atteint'
          : atteint
            ? `Dépassé de ${entier(-reste)} ${unite}`
            : `Reste ${entier(reste)} ${unite}`}
      </p>
    </div>
  )
}

function LigneAliment({ aliment, onSupprimer }: { aliment: Aliment; onSupprimer: () => void }) {
  return (
    <li className="nutrition-aliment">
      <div>
        <strong>{aliment.nom}</strong>
        <small>
          P {entier(aliment.proteines)} g · G {entier(aliment.glucides)} g · L {entier(aliment.lipides)} g
        </small>
      </div>
      <span className="nutrition-aliment-kcal">{entier(aliment.kcal)} kcal</span>
      <button type="button" className="bouton-icone discret danger" onClick={onSupprimer}>
        <Icone trace={ICONES.corbeille} />
        <span className="visuellement-cache">Supprimer : {aliment.nom}</span>
      </button>
    </li>
  )
}

// ---------- comment les besoins sont calculés ----------

function Calcul({ besoins }: { besoins: Besoins }) {
  const ajustement =
    besoins.ecart === 0 ? 'aucun' : `${besoins.ecart > 0 ? '+' : '−'} ${Math.round(Math.abs(besoins.ecart) * 100)} %`
  return (
    <Panneau titre="Comment c'est calculé">
      <dl className="nutrition-calcul">
        <div>
          <dt>Métabolisme de base</dt>
          <dd>{entier(besoins.metabolismeBase)} kcal</dd>
        </div>
        <div>
          <dt>Dépense avec votre activité</dt>
          <dd>{entier(besoins.depense)} kcal</dd>
        </div>
        <div>
          <dt>Ajustement de l'objectif</dt>
          <dd>{ajustement}</dd>
        </div>
        <div className="total">
          <dt>Besoin du jour</dt>
          <dd>{entier(besoins.kcal)} kcal</dd>
        </div>
      </dl>
      <ul className="nutrition-regles">
        <li>
          <strong>Protéines</strong> : {nombre(besoins.proteinesParKg)} g par kilo de poids.
        </li>
        <li>
          <strong>Lipides</strong> : {Math.round(PART_LIPIDES * 100)} % des calories ({KCAL.lipides} kcal par gramme).
        </li>
        <li>
          <strong>Glucides</strong> : le reste des calories ({KCAL.glucides} kcal par gramme).
        </li>
      </ul>
      <p className="nutrition-note">
        Métabolisme de base : formule de Mifflin-St Jeor, avec votre poids, votre taille, votre sexe et votre âge (
        {besoins.age} ans).
      </p>
    </Panneau>
  )
}

// ---------- hydratation ----------

function Hydratation({ n, besoinMl: besoin }: { n: DonneesNutrition; besoinMl: number }) {
  const bu = n.verres * VERRE_ML
  const litres = (ml: number) => `${nombre(ml / 1000)} L`
  return (
    <Panneau titre="Hydratation">
      <div className="nutrition-eau">
        <button
          type="button"
          className="bouton-icone"
          onClick={() => n.changerVerres(n.verres - 1)}
          disabled={n.verres === 0}
        >
          <span aria-hidden="true">−</span>
          <span className="visuellement-cache">Retirer un verre</span>
        </button>
        <p className="chiffre" aria-live="polite">
          {litres(bu)}
          <span> / {litres(besoin)}</span>
        </p>
        <button type="button" className="bouton-icone" onClick={() => n.changerVerres(n.verres + 1)}>
          <Icone trace={ICONES.ajouter} />
          <span className="visuellement-cache">Ajouter un verre</span>
        </button>
      </div>
      <Jauge part={bu / besoin} libelle={`Eau : ${litres(bu)} sur ${litres(besoin)}`} />
      <p className="nutrition-note">
        {n.verres} verre{n.verres > 1 ? 's' : ''} de {VERRE_ML} ml. Repère : 35 ml par kilo de poids.
      </p>
    </Panneau>
  )
}

// ---------- les 7 derniers jours ----------

function Semaine({ n, besoin }: { n: DonneesNutrition; besoin: number }) {
  // l'échelle va au plus haut des jours, et au moins jusqu'au besoin
  const haut = Math.max(besoin, ...n.semaine.map((j) => j.kcal)) * 1.1
  return (
    <Panneau titre="Calories · 7 derniers jours">
      <div className="nutrition-semaine">
        {/* une colonne par jour ; le trait marque le besoin du jour */}
        <div className="nutrition-semaine-zone" role="list">
          <span className="nutrition-semaine-besoin" style={{ bottom: `${(besoin / haut) * 100}%` }} aria-hidden="true">
            <small>{entier(besoin)} kcal</small>
          </span>
          {n.semaine.map((j) => (
            <div key={j.date.toISOString()} role="listitem" className="nutrition-semaine-colonne">
              <i style={{ height: `${(j.kcal / haut) * 100}%` }} className={j.kcal >= besoin ? 'atteint' : undefined} />
              <span className="visuellement-cache">
                {formatJour(j.date)} : {j.kcal ? `${entier(j.kcal)} kcal` : 'rien de noté'}
              </span>
            </div>
          ))}
        </div>
        <div className="nutrition-semaine-jours" aria-hidden="true">
          {n.semaine.map((j) => (
            <small key={j.date.toISOString()}>{formatJour(j.date)}</small>
          ))}
        </div>
      </div>
    </Panneau>
  )
}

// ---------- ajout : les grammes suffisent, les calories se calculent ----------

function FenetreAjout({
  onAjouter,
  onFermer,
}: {
  onAjouter: DonneesNutrition['ajouter']
  onFermer: () => void
}) {
  // lu une seule fois, à l'ouverture de la fenêtre
  const [repas, setRepas] = useState<Repas>(() => repasSelonHeure(new Date()))
  const [nom, setNom] = useState('')
  const [proteines, setProteines] = useState('')
  const [glucides, setGlucides] = useState('')
  const [lipides, setLipides] = useState('')
  const [kcal, setKcal] = useState('')

  const lire = (texte: string) => Math.max(0, Number(texte.replace(',', '.')) || 0)
  const kcalCalculees = kcalDesMacros(lire(proteines), lire(glucides), lire(lipides))
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

  const champ = (id: string, libelle: string, valeur: string, changer: (v: string) => void, placeholder = '0') => (
    <div className="champ">
      <label htmlFor={id}>{libelle}</label>
      <input
        id={id}
        inputMode="decimal"
        placeholder={placeholder}
        value={valeur}
        onChange={(e) => changer(e.target.value.replace(/[^\d.,]/g, ''))}
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
          <button type="button" className="bouton secondaire" onClick={onFermer}>
            Annuler
          </button>
          <button type="submit" form="formulaire-aliment" className="bouton" disabled={!valide}>
            Ajouter
          </button>
        </>
      }
    >
      <form id="formulaire-aliment" className="nutrition-formulaire" onSubmit={valider}>
        <div className="champ">
          <span className="champ-nom">Repas</span>
          <Segments libelle="Repas" options={REPAS} valeur={repas} onChange={setRepas} />
        </div>
        <div className="champ">
          <label htmlFor="aliment-nom">Aliment (facultatif)</label>
          <input
            id="aliment-nom"
            value={nom}
            maxLength={80}
            placeholder="ex. Poulet et riz, shaker de whey…"
            onChange={(e) => setNom(e.target.value)}
          />
        </div>
        <div className="champs-ligne">
          {champ('aliment-proteines', 'Protéines (g)', proteines, setProteines)}
          {champ('aliment-glucides', 'Glucides (g)', glucides, setGlucides)}
          {champ('aliment-lipides', 'Lipides (g)', lipides, setLipides)}
        </div>
        {champ('aliment-kcal', 'Calories (kcal)', kcal, setKcal, kcalCalculees ? String(kcalCalculees) : '0')}
        <p className="champ-aide">
          {kcal
            ? 'Calories saisies à la main.'
            : kcalCalculees
              ? `Calculées à partir des grammes : ${entier(kcalCalculees)} kcal. Tapez une valeur pour la remplacer.`
              : "Laissez vide : elles se calculent à partir des grammes (4 kcal par gramme de protéines ou de glucides, 9 pour les lipides)."}
        </p>
      </form>
    </Fenetre>
  )
}

// le repas proposé selon l'heure
function repasSelonHeure(maintenant: Date): Repas {
  const heure = maintenant.getHours()
  if (heure < 11) return 'petit-dejeuner'
  if (heure < 15) return 'dejeuner'
  if (heure >= 18) return 'diner'
  return 'collation'
}

export default Nutrition
