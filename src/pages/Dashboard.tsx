import { useEffect, useState } from 'react'
import '../dashboard.css'
import BadgeRang from '../components/BadgeRang.tsx'
import CarteExercice from '../components/CarteExercice.tsx'
import { CATEGORIES, DISCIPLINES, NOMS_RANGS, RANGS, type Sexe } from '../data/paliers.ts'
import { type Perfs, type Profil, rangMoyen } from '../lib/rangs.ts'

const CLE_STOCKAGE = 'datafit-rangs'

interface Etat {
  sexe: Sexe
  categorie: number // index dans CATEGORIES[sexe]
  onglet: string
  perfs: Perfs
}

const ETAT_INITIAL: Etat = { sexe: 'H', categorie: 3, onglet: 'sbd', perfs: {} }

// Démonstration : les perfs sont gardées dans le navigateur.
// À remplacer par un appel au backend quand l'API sera prête.
function chargerEtat(): Etat {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE)
    return brut ? { ...ETAT_INITIAL, ...JSON.parse(brut) } : ETAT_INITIAL
  } catch {
    return ETAT_INITIAL
  }
}

function Dashboard() {
  const [etat, setEtat] = useState<Etat>(chargerEtat)

  useEffect(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat))
    } catch {
      // stockage indisponible (navigation privée…) : on continue sans sauvegarder
    }
  }, [etat])

  const categories = CATEGORIES[etat.sexe]
  const indexCategorie = Math.min(etat.categorie, categories.length - 1)
  const [nomCategorie, poidsRef] = categories[indexCategorie]
  const profil: Profil = { sexe: etat.sexe, poidsRef }
  const discipline = DISCIPLINES.find((d) => d.id === etat.onglet) ?? DISCIPLINES[0]
  const parCategorie = discipline.exercices.some((ex) => ex.type === 'load' || ex.type === 'lest')

  const majPerf = (id: string, v: string) =>
    setEtat((e) => ({ ...e, perfs: { ...e.perfs, [id]: v } }))

  return (
    <div className="dash">
      <section className="dash-hero">
        <h1>Rangs <span className="dash-grad">E → Z</span></h1>
        <p>
          Entre tes perfs, choisis ton sexe et ta catégorie de poids : chaque exo te donne un rang,
          de « éclaté au sol » à « GOAT », et ce qu'il te manque pour le palier suivant.
        </p>
        <div className="dash-echelle">
          {RANGS.map((r, i) => (
            <div key={r}>
              <b>{r}</b>
              <i style={{ background: `var(--rang-${r})` }} />
              <span>{NOMS_RANGS[i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="dash-profil" aria-label="Profil">
        <div className="dash-champ">
          <span className="dash-label">Sexe</span>
          <div className="dash-seg" role="group" aria-label="Sexe">
            {(['H', 'F'] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={etat.sexe === s}
                onClick={() => setEtat((e) => ({ ...e, sexe: s }))}
              >
                {s === 'H' ? 'Homme' : 'Femme'}
              </button>
            ))}
          </div>
        </div>
        <div className="dash-champ">
          <label className="dash-label" htmlFor="dash-categorie">Catégorie</label>
          <select
            id="dash-categorie"
            value={indexCategorie}
            onChange={(e) => setEtat((s) => ({ ...s, categorie: Number(e.target.value) }))}
          >
            {categories.map(([nom], i) => (
              <option key={nom} value={i}>{nom} kg</option>
            ))}
          </select>
        </div>
        <div className="dash-champ">
          <span className="dash-label">Poids de référence</span>
          <span className="dash-valeur">{poidsRef} kg</span>
        </div>
        <div className="dash-espace" />
        <button type="button" className="btn ghost small" onClick={() => setEtat((e) => ({ ...e, perfs: {} }))}>
          Tout effacer
        </button>
      </section>

      <section className="dash-resume" aria-label="Résumé par discipline">
        {DISCIPLINES.map((d) => {
          const remplis = d.exercices.filter((ex) => (etat.perfs[ex.id] ?? '') !== '').length
          return (
            <button key={d.id} type="button" className="dash-resume-carte" onClick={() => setEtat((e) => ({ ...e, onglet: d.id }))}>
              <BadgeRang rang={rangMoyen(d.exercices, etat.perfs, profil)} petit />
              <span>
                {d.nom}
                <small>{remplis}/{d.exercices.length} renseignés</small>
              </span>
            </button>
          )
        })}
      </section>

      <nav className="dash-onglets" role="tablist" aria-label="Disciplines">
        {DISCIPLINES.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === discipline.id}
            onClick={() => setEtat((e) => ({ ...e, onglet: d.id }))}
          >
            {d.nom}
          </button>
        ))}
      </nav>

      <section className="dash-panneau" role="tabpanel" aria-label={discipline.nom}>
        <div className="dash-panneau-titre">
          <h2>{discipline.nom}</h2>
          <span className="dash-note">
            {parCategorie
              ? `Seuils pour ${etat.sexe === 'H' ? 'homme' : 'femme'} ${nomCategorie} kg`
              : `Seuils ${etat.sexe === 'H' ? 'hommes' : 'femmes'}, toutes catégories`}
          </span>
        </div>
        {discipline.exercices.map((ex) => (
          <CarteExercice key={ex.id} exercice={ex} perfs={etat.perfs} profil={profil} onChange={majPerf} />
        ))}
      </section>
    </div>
  )
}

export default Dashboard
