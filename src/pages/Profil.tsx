import '../styles/profil.css'
import EntetePage from '../components/EntetePage.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'
import { LISTE_SPORTS, SPORTS } from '../data/sports.ts'
import useProfil from '../hooks/useProfil.ts'
import { initiales } from '../lib/profil.ts'

const SEXES = [
  { valeur: 'H', nom: 'Homme' },
  { valeur: 'F', nom: 'Femme' },
]
const NIVEAUX = [
  { valeur: 'novice', nom: 'Novice' },
  { valeur: 'intermediaire', nom: 'Intermédiaire' },
  { valeur: 'pro', nom: 'Pro' },
]

function Profil() {
  const {
    profil,
    enregistrerInfos,
    messageInfos,
    enregistrerPreferences,
    messagePreferences,
    modifierMotDePasse,
    messageSecurite,
  } = useProfil()

  const lettres = profil ? initiales(profil) : ''
  const nomComplet = profil ? `${profil.prenom} ${profil.nom}`.trim() : ''

  return (
    <div className="page">
      <EntetePage titre="Mon profil" sousTitre="Gérez vos informations et vos préférences." />

      <div className="grille-2 egales">
        <section className="carte">
          <h2>Informations personnelles</h2>
          <p className="sous-titre">Mettez à jour vos informations de profil.</p>

          <div className="profil-identite">
            <span className="profil-avatar">{lettres || <img src="/avatar.svg" alt="" />}</span>
            <h3>{nomComplet || 'Votre nom'}</h3>
          </div>

          <form className="profil-formulaire" onSubmit={enregistrerInfos}>
            <div className="profil-champ">
              <label htmlFor="prenom">Prénom</label>
              <input type="text" id="prenom" name="prenom" autoComplete="given-name" defaultValue={profil?.prenom} required />
            </div>
            <div className="profil-champ">
              <label htmlFor="nom">Nom</label>
              <input type="text" id="nom" name="nom" autoComplete="family-name" defaultValue={profil?.nom} required />
            </div>
            <div className="profil-champ">
              <label htmlFor="email">Adresse e-mail</label>
              <input type="email" id="email" name="email" autoComplete="email" defaultValue={profil?.email} />
            </div>

            {/* le poids et le sexe servent à la page sport : ils sont obligatoires */}
            <div className="profil-mesures">
              <div className="profil-champ">
                <label htmlFor="age">Âge</label>
                <input type="number" id="age" name="age" min={10} max={100} inputMode="numeric" defaultValue={profil?.age || ''} />
              </div>
              <div className="profil-champ">
                <label htmlFor="taille">Taille (cm)</label>
                <input type="number" id="taille" name="taille" min={100} max={250} inputMode="numeric" defaultValue={profil?.taille || ''} />
              </div>
              <div className="profil-champ">
                <label htmlFor="poids">Poids (kg)</label>
                <input type="number" id="poids" name="poids" min={30} max={250} step="0.1" inputMode="decimal" defaultValue={profil?.poids || ''} required />
              </div>
            </div>

            <fieldset>
              <legend>Sexe</legend>
              <div className="profil-choix">
                {SEXES.map((sexe) => (
                  <div key={sexe.valeur}>
                    <input type="radio" id={`sexe-${sexe.valeur}`} name="sexe" value={sexe.valeur} defaultChecked={profil?.sexe === sexe.valeur} required />
                    <label htmlFor={`sexe-${sexe.valeur}`}>{sexe.nom}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="btn">Enregistrer</button>
            {messageInfos && (
              <p className="pastille" role="status">
                <Icone trace={ICONES.valide} />
                {messageInfos}
              </p>
            )}
          </form>
        </section>

        <div className="profil-colonne">
          <section className="carte">
            <h2>Préférences sportives</h2>
            <p className="sous-titre">Choisissez vos activités favorites et vos paramètres.</p>

            <form className="profil-formulaire" onSubmit={enregistrerPreferences}>
              <fieldset>
                <legend>Activités préférées</legend>
                <div className="profil-activites">
                  {LISTE_SPORTS.map((sport) => (
                    <div key={sport}>
                      <input
                        type="checkbox"
                        id={`activite-${sport}`}
                        name="activites"
                        value={sport}
                        defaultChecked={profil?.activites.includes(sport)}
                      />
                      <label htmlFor={`activite-${sport}`}>
                        <Icone trace={SPORTS[sport].icone} />
                        {SPORTS[sport].nom}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Niveau</legend>
                <div className="profil-choix">
                  {NIVEAUX.map((niveau) => (
                    <div key={niveau.valeur}>
                      <input type="radio" id={`niveau-${niveau.valeur}`} name="niveau" value={niveau.valeur} defaultChecked={profil?.niveau === niveau.valeur} />
                      <label htmlFor={`niveau-${niveau.valeur}`}>{niveau.nom}</label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <div className="profil-champ">
                <label htmlFor="unites">Unités de mesure</label>
                <select id="unites" defaultValue="metrique">
                  <option value="metrique">Unités métriques (km, kg)</option>
                  <option value="imperial" disabled>Unités impériales (mi, lb) : bientôt</option>
                </select>
              </div>

              <div className="profil-champ">
                <label htmlFor="objectif">Mon objectif (optionnel)</label>
                <input type="text" id="objectif" name="objectif" placeholder="Ajouter un objectif personnel" defaultValue={profil?.objectif} />
              </div>

              <button type="submit" className="btn">Enregistrer mes préférences</button>
              {messagePreferences && (
                <p className="pastille" role="status">
                  <Icone trace={ICONES.valide} />
                  {messagePreferences}
                </p>
              )}
            </form>
          </section>

          <section className="carte">
            <h2>Sécurité du compte</h2>
            <p className="sous-titre">Modifiez votre mot de passe.</p>
            <button type="button" className="btn ghost profil-large" onClick={modifierMotDePasse}>
              <Icone trace={ICONES.cadenas} />
              Modifier le mot de passe
            </button>
            {messageSecurite && <p className="profil-note" role="status">{messageSecurite}</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profil
