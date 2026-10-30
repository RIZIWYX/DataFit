import { Link } from 'react-router'
import '../styles/historique.css'
import EtatVide from '../components/EtatVide.tsx'
import Icone from '../components/Icone.tsx'
import Segments from '../components/Segments.tsx'
import TitrePage from '../components/TitrePage.tsx'
import { ICONES } from '../data/icones.ts'
import useHistorique, { PERIODES, type Tri } from '../hooks/useHistorique.ts'
import { nbSeances } from '../lib/colonnes.ts'
import { formatDuree, formatHeure, nombre } from '../lib/format.ts'
import { type Categorie } from '../lib/historique.ts'
import { formatDureeSecondes } from '../lib/cardio.ts'

// Toutes les séances, de la plus récente à la plus ancienne, regroupées par mois.
// On cherche, on filtre, on ouvre le détail ; rien d'autre sur la page.
function Historique() {
  const {
    chargement, erreur, connecte, recharger,
    categorie,
    choisirCategorie,
    nbSemaines,
    choisirPeriode,
    tri,
    choisirTri,
    recherche,
    chercher,
    effacerFiltres,
    compte,
    groupes,
    total,
    reste,
    afficherPlus,
  } = useHistorique()

  const categories: { valeur: Categorie | 'tous'; nom: string }[] = [
    { valeur: 'tous', nom: 'Toutes' },
    { valeur: 'course', nom: 'Course à pied' },
    { valeur: 'programmees', nom: 'Programmées' },
  ]

  if (chargement || erreur) {
    return (
      <div className="ecran historique">
        <TitrePage surtitre="Entraînement" titre="Historique" />
        {chargement ? <p role="status">Chargement des séances…</p> : (
          <EtatVide icone={ICONES.info} titre="Historique indisponible" action={connecte ? (
            <button type="button" className="bouton secondaire" onClick={recharger}>Réessayer</button>
          ) : <Link to="/connexion" className="bouton secondaire">Se connecter</Link>}>
            {erreur}
          </EtatVide>
        )}
      </div>
    )
  }

  return (
    <div className="ecran historique">
      <TitrePage
        surtitre="Entraînement"
        titre="Historique"
      >
        Vos séances cardio enregistrées et vos séances programmées réalisées.
      </TitrePage>

      <div className="historique-outils">
        <label className="historique-recherche">
          <Icone trace={ICONES.recherche} />
          <span className="visuellement-cache">Rechercher une séance</span>
          <input
            type="search"
            placeholder="Rechercher : « course », « mardi », « squat »…"
            value={recherche}
            onChange={(e) => chercher(e.target.value)}
          />
        </label>
        <select aria-label="Période" value={nbSemaines} onChange={(e) => choisirPeriode(Number(e.target.value))}>
          {PERIODES.map((periode) => (
            <option key={periode.semaines} value={periode.semaines}>{periode.nom}</option>
          ))}
        </select>
        <select aria-label="Ordre" value={tri} onChange={(e) => choisirTri(e.target.value as Tri)}>
          <option value="recentes">Plus récentes d'abord</option>
          <option value="anciennes">Plus anciennes d'abord</option>
          <option value="longues">Plus longues d'abord</option>
        </select>
      </div>

      <Segments
        libelle="Type de séance"
        options={categories.map((c) => ({ ...c, compte: compte(c.valeur) }))}
        valeur={categorie}
        onChange={choisirCategorie}
      />

      {/* le total de ce qui est affiché, en une ligne */}
      <p className="historique-total" role="status">
        <strong>{nbSeances(total.nombre)}</strong>
        <span>{formatDuree(total.minutes)} d'entraînement</span>
        {total.km > 0 && <span>{nombre(total.km)} km</span>}
      </p>

      {groupes.length === 0 ? (
        <EtatVide
          icone={ICONES.recherche}
          titre={recherche || nbSemaines || categorie !== 'tous' ? 'Aucune séance ne correspond' : 'Aucune séance enregistrée'}
          action={
            <button type="button" className="bouton secondaire petit" onClick={effacerFiltres}>
              Effacer les filtres
            </button>
          }
        >
          {recherche || nbSemaines || categorie !== 'tous'
            ? 'Essayez une autre recherche, ou élargissez la période.'
            : <>Vos séances cardio apparaîtront ici après leur enregistrement. <Link to="/montre">Ouvrir la montre</Link>.</>}
        </EtatVide>
      ) : (
        groupes.map((groupe) => (
          <section key={groupe.titre || 'tri'} className="historique-groupe" aria-label={groupe.titre || 'Séances'}>
            {groupe.titre && (
              <h2 className="historique-mois">
                {groupe.titre}
                <small>{nbSeances(groupe.entrees.length)}</small>
              </h2>
            )}
            <ul className="liste-lignes historique-liste">
              {groupe.entrees.map((entree) => (
                <li key={entree.id}>
                  <Link to={entree.lien} className="ligne-historique">
                    <span className="ligne-historique-date">
                      <strong>{entree.date.getDate()}</strong>
                      <small>{entree.date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</small>
                    </span>
                    <span className="ligne-historique-icone" style={{ color: entree.couleur }}>
                      <Icone trace={entree.icone} />
                    </span>
                    <span className="ligne-historique-titre">
                      <strong>{entree.titre}</strong>
                      <small>
                        {entree.heureConnue !== false && <>{formatHeure(entree.date)} · </>}{entree.sousTitre}
                        {entree.exercices.length > 0 && ` · ${entree.exercices.join(', ')}`}
                      </small>
                    </span>
                    <span className="ligne-historique-mesure">{entree.mesure}</span>
                    <span className="ligne-historique-mesure secondaire">{entree.dureeSecondes !== undefined ? formatDureeSecondes(entree.dureeSecondes) : formatDuree(entree.dureeMin)}</span>
                    <span className="ligne-historique-mesure secondaire">{entree.fc ? `${entree.fc} bpm` : '–'}</span>
                    <Icone trace={ICONES.chevron} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {reste > 0 && (
        <button type="button" className="bouton secondaire historique-plus" onClick={afficherPlus}>
          Afficher plus de séances
          <small>{reste} restante{reste > 1 ? 's' : ''}</small>
        </button>
      )}
    </div>
  )
}

export default Historique
