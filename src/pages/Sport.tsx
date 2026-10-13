import { Link } from 'react-router'
import '../styles/sport.css'
import BadgeRang from '../components/BadgeRang.tsx'
import CarteExercice from '../components/CarteExercice.tsx'
import EntetePage from '../components/EntetePage.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'
import { DISCIPLINES, NOMS_RANGS, RANGS } from '../data/paliers.ts'
import useSport from '../hooks/useSport.ts'
import { nombre } from '../lib/format.ts'

function Sport() {
  const {
    profilRempli,
    sexe,
    poids,
    perfs,
    nomCategorie,
    poidsRef,
    profil,
    discipline,
    parCategorie,
    resume,
    choisirOnglet,
    majPerf,
    toutEffacer,
  } = useSport()

  return (
    <div className="page sport">
      <EntetePage titre="Sport" sousTitre="Vos performances par discipline." />

      <div className="sport-echelle">
        {RANGS.map((r, i) => (
          <div key={r}>
            <b>{r}</b>
            <i style={{ background: `var(--rang-${r})` }} />
            <span>{NOMS_RANGS[i]}</span>
          </div>
        ))}
      </div>

      {profilRempli ? (
        <>
          <p className="bandeau-info">
            <Icone trace={ICONES.info} />
            Entre tes perfs : chaque exercice te donne un rang, selon ton sexe et ta catégorie de poids.
            Elles restent enregistrées dans ton navigateur.
          </p>

          {/* le sexe et la catégorie viennent du profil : ils ne se modifient pas ici */}
          <section className="carte sport-profil" aria-label="Profil">
            <div className="sport-champ">
              <span className="sport-label">Sexe</span>
              <span className="sport-valeur">{sexe === 'H' ? 'Homme' : 'Femme'}</span>
            </div>
            <div className="sport-champ">
              <span className="sport-label">Poids</span>
              <span className="sport-valeur">{nombre(poids)} kg</span>
            </div>
            <div className="sport-champ">
              <span className="sport-label">Catégorie</span>
              <span className="sport-valeur">{nomCategorie} kg</span>
            </div>
            <div className="sport-champ">
              <span className="sport-label">Poids de référence</span>
              <span className="sport-valeur">{poidsRef} kg</span>
            </div>
            <div className="sport-espace" />
            <Link to="/profil" className="lien">Modifier mon profil</Link>
            <button type="button" className="btn ghost petit" onClick={toutEffacer}>
              Tout effacer
            </button>
          </section>

          <section className="sport-resume" aria-label="Résumé par discipline">
            {resume.map((d) => (
              <button key={d.id} type="button" className="sport-resume-carte" onClick={() => choisirOnglet(d.id)}>
                <BadgeRang rang={d.rang} petit />
                <span>
                  {d.nom}
                  <small>{d.remplis}/{d.total} renseignés</small>
                </span>
              </button>
            ))}
          </section>

          <nav className="sport-onglets" role="tablist" aria-label="Disciplines">
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

          <section className="sport-panneau" role="tabpanel" aria-label={discipline.nom}>
            <div className="sport-panneau-titre">
              <h2>{discipline.nom}</h2>
              <span className="sport-note">
                {parCategorie
                  ? `Seuils pour ${sexe === 'H' ? 'homme' : 'femme'} ${nomCategorie} kg`
                  : `Seuils ${sexe === 'H' ? 'hommes' : 'femmes'}, toutes catégories`}
              </span>
            </div>
            {discipline.exercices.map((ex) => (
              <CarteExercice key={ex.id} exercice={ex} perfs={perfs} profil={profil} onChange={majPerf} />
            ))}
          </section>
        </>
      ) : (
        <section className="carte">
          <h2>Complète ton profil pour voir tes rangs</h2>
          <p className="sous-titre">
            Ton sexe et ton poids fixent ta catégorie, et les seuils de chaque exercice en dépendent.
          </p>
          <Link to="/profil" className="btn">Compléter mon profil</Link>
        </section>
      )}
    </div>
  )
}

export default Sport
