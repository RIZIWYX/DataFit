import '../styles/dashboard.css'
import BadgeRang from '../components/BadgeRang.tsx'
import CarteExercice from '../components/CarteExercice.tsx'
import { DISCIPLINES, NOMS_RANGS, RANGS } from '../data/paliers.ts'
import useDashboard from '../hooks/useDashboard.ts'

function Dashboard() {
  const {
    sexe,
    perfs,
    categories,
    indexCategorie,
    nomCategorie,
    poidsRef,
    profil,
    discipline,
    parCategorie,
    resume,
    choisirSexe,
    choisirCategorie,
    choisirOnglet,
    majPerf,
    toutEffacer,
  } = useDashboard()

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
                aria-pressed={sexe === s}
                onClick={() => choisirSexe(s)}
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
            onChange={(e) => choisirCategorie(Number(e.target.value))}
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
        <button type="button" className="btn ghost small" onClick={toutEffacer}>
          Tout effacer
        </button>
      </section>

      <section className="dash-resume" aria-label="Résumé par discipline">
        {resume.map((d) => (
          <button key={d.id} type="button" className="dash-resume-carte" onClick={() => choisirOnglet(d.id)}>
            <BadgeRang rang={d.rang} petit />
            <span>
              {d.nom}
              <small>{d.remplis}/{d.total} renseignés</small>
            </span>
          </button>
        ))}
      </section>

      <nav className="dash-onglets" role="tablist" aria-label="Disciplines">
        {DISCIPLINES.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === discipline.id}
            onClick={() => choisirOnglet(d.id)}
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
              ? `Seuils pour ${sexe === 'H' ? 'homme' : 'femme'} ${nomCategorie} kg`
              : `Seuils ${sexe === 'H' ? 'hommes' : 'femmes'}, toutes catégories`}
          </span>
        </div>
        {discipline.exercices.map((ex) => (
          <CarteExercice key={ex.id} exercice={ex} perfs={perfs} profil={profil} onChange={majPerf} />
        ))}
      </section>
    </div>
  )
}

export default Dashboard
