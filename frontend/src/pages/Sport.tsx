import '../styles/sport.css'
import BadgeRang from '../components/BadgeRang.tsx'
import CarteExercice from '../components/CarteExercice.tsx'
import EtatVide from '../components/EtatVide.tsx'
import LienFleche from '../components/LienFleche.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import { NOMS_RANGS, RANGS } from '../data/paliers.ts'
import useSport from '../hooks/useSport.ts'
import { nombre } from '../lib/format.ts'

// Performance (ex-« Sport ») : les records par exercice et leur rang, de E à Z.
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

    // Boutons Valider / Modifier (générique pour toutes les disciplines).
    disciplineBranchee,
    seanceDuJour,
    chargement,
    sauvegarde,
    message,
    erreur,
    valider,
    modifier,
  } = useSport()

  return (
    <div className="ecran sport">
      <TitrePage surtitre="Entraînement" titre="Performance">
        Vos records par exercice, convertis en rangs.
      </TitrePage>

      {/* l'échelle des huit rangs, en rappel */}
      <ol className="sport-echelle" aria-label="Les rangs, du plus bas au plus haut">
        {RANGS.map((r, i) => (
          <li key={r} className={r === 'Z' ? 'z' : undefined}>
            <b>{r}</b>
            <i style={r === 'Z' ? undefined : { background: `var(--rang-${r})` }} />
            <span>{NOMS_RANGS[i]}</span>
          </li>
        ))}
      </ol>

      {profilRempli ? (
        <>
          {/* le sexe et la catégorie viennent du profil : ils ne se modifient pas ici */}
          <section className="sport-profil" aria-label="Votre catégorie">
            <dl>
              <div>
                <dt>Sexe</dt>
                <dd>{sexe === 'H' ? 'Homme' : 'Femme'}</dd>
              </div>
              <div>
                <dt>Poids</dt>
                <dd>{nombre(poids)} kg</dd>
              </div>
              <div>
                <dt>Catégorie</dt>
                <dd>{nomCategorie} kg</dd>
              </div>
              <div>
                <dt>Poids de référence</dt>
                <dd>{poidsRef} kg</dd>
              </div>
            </dl>
            <div className="sport-profil-actions">
              <LienFleche to="/profil">Modifier mon profil</LienFleche>
            </div>
          </section>

          {/* une discipline par bouton : son rang moyen et le nombre d'exercices renseignés */}
          <div className="sport-disciplines" role="tablist" aria-label="Disciplines">
            {resume.map((d) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={d.id === discipline.id}
                onClick={() => choisirOnglet(d.id)}
              >
                <span>
                  <strong>{d.nom}</strong>
                  <small>
                    {d.remplis}/{d.total} renseignés
                  </small>
                </span>
                <BadgeRang rang={d.rang} petit />
              </button>
            ))}
          </div>

          <section className="sport-panneau" role="tabpanel" aria-labelledby="sport-discipline">
            <header className="sport-panneau-titre">
              <h2 id="sport-discipline">
                {discipline.nom}
                <span className="point">.</span>
              </h2>
              <span className="sport-note">
                {parCategorie
                  ? `Seuils pour ${sexe === 'H' ? 'homme' : 'femme'}, catégorie ${nomCategorie} kg`
                  : `Seuils ${sexe === 'H' ? 'hommes' : 'femmes'}, toutes catégories`}
              </span>
            </header>
            {discipline.exercices.map((ex) => (
              <CarteExercice key={ex.id} exercice={ex} perfs={perfs} profil={profil} onChange={majPerf} />
            ))}

            {/* Boutons Valider / Modifier pour la discipline affichée */}
            {disciplineBranchee && (
              <div className="sport-sbd-actions">
                {chargement && (
                  <p role="status">Chargement de votre séance...</p>
                )}

                <div className="sport-sbd-boutons">
                  <button
                    type="button"
                    className="sport-sbd-valider"
                    disabled={chargement || sauvegarde || !!seanceDuJour}
                    onClick={valider}
                  >
                    {sauvegarde && !seanceDuJour
                      ? 'Enregistrement...'
                      : 'Valider'}
                  </button>

                  <button
                    type="button"
                    className="sport-sbd-modifier"
                    disabled={chargement || sauvegarde || !seanceDuJour}
                    onClick={modifier}
                  >
                    {sauvegarde && seanceDuJour
                      ? 'Modification...'
                      : 'Modifier'}
                  </button>
                </div>

                {message && (
                  <p
                    className={
                      erreur ? 'sport-sbd-message erreur' : 'sport-sbd-message'
                    }
                    role="status"
                    aria-live="polite"
                  >
                    {message}
                  </p>
                )}

                {seanceDuJour && (
                  <p className="sport-sbd-etat">
                    Une séance {discipline.nom} est enregistrée pour aujourd'hui.
                  </p>
                )}
              </div>
            )}
          </section>
        </>
      ) : (
        <EtatVide
          icone={ICONES.profil}
          titre="Complétez votre profil pour voir vos rangs"
          action={<LienFleche to="/profil">Compléter mon profil</LienFleche>}
        >
          Votre sexe et votre poids fixent votre catégorie, et les seuils de chaque exercice en dépendent.
        </EtatVide>
      )}
    </div>
  )
}

export default Sport
