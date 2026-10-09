import { type SubmitEvent, useState } from 'react'
import DataFitPanel from '../components/DataFitPanel.tsx'

function Profil() {
  const [message, setMessage] = useState('')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const profil = {
      prenom: String(formData.get('prenom') ?? ''),
      nom: String(formData.get('nom') ?? ''),
      age: Number(formData.get('age')),
      taille: Number(formData.get('taille')),
      poids: Number(formData.get('poids')),
      sport: String(formData.get('sport') ?? ''),
      sexe: String(formData.get('sexe') ?? ''),
      niveau: String(formData.get('niveau') ?? ''),
    }

    // Démonstration uniquement : à remplacer par un appel API/backend.
    sessionStorage.setItem('datafit-profil-demo', JSON.stringify(profil))
    setMessage('Profil enregistré temporairement dans ce navigateur (mode démonstration).')
  }

  return (
    <div className="datafit-root">
      <div className="page">
        <DataFitPanel
          title="Dis-nous qui court."
          description="Ton âge, ton sexe et ton poids servent à calibrer ta fréquence cardiaque et tes allures."
        />

        <main className="contenu">
          <section className="carte">
            <h1>Complète ton profil</h1>
            <p className="sous-titre">Dernière étape avant ta première séance.</p>

            <form onSubmit={handleSubmit}>
              <div className="duo">
                <div className="champ">
                  <label htmlFor="prenom">Prénom</label>
                  <input type="text" id="prenom" name="prenom" autoComplete="given-name" required />
                </div>
                <div className="champ">
                  <label htmlFor="nom">Nom</label>
                  <input type="text" id="nom" name="nom" autoComplete="family-name" required />
                </div>
              </div>

              <div className="duo">
                <div className="champ">
                  <label htmlFor="age">Âge</label>
                  <input type="number" id="age" name="age" min={10} max={100} inputMode="numeric" required />
                </div>
                <div className="champ">
                  <label htmlFor="taille">Taille (cm)</label>
                  <input type="number" id="taille" name="taille" min={100} max={250} inputMode="numeric" required />
                </div>
              </div>

              <div className="duo">
                <div className="champ">
                  <label htmlFor="poids">Poids (kg)</label>
                  <input type="number" id="poids" name="poids" min={30} max={250} step="0.1" inputMode="decimal" required />
                </div>
                <div className="champ">
                  <label htmlFor="sport">Sport pratiqué</label>
                  <select id="sport" name="sport" defaultValue="" required>
                    <option value="" disabled>Choisir…</option>
                    <option value="course">Course à pied</option>
                    <option value="marche">Marche</option>
                    <option value="velo">Vélo</option>
                    <option value="natation">Natation</option>
                    <option value="fitness">Fitness</option>
                    <option value="musculation">Musculation</option>
                    <option value="collectif">Sport collectif</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <fieldset className="champ">
                <legend className="legende">Sexe</legend>
                <div className="choix">
                  <div>
                    <input type="radio" id="sexe-h" name="sexe" value="H" required />
                    <label htmlFor="sexe-h">Homme</label>
                  </div>
                  <div>
                    <input type="radio" id="sexe-f" name="sexe" value="F" />
                    <label htmlFor="sexe-f">Femme</label>
                  </div>
                </div>
              </fieldset>

              <fieldset className="champ">
                <legend className="legende">Ton niveau</legend>
                <div className="choix">
                  <div>
                    <input type="radio" id="niv-n" name="niveau" value="novice" required />
                    <label htmlFor="niv-n">Novice</label>
                  </div>
                  <div>
                    <input type="radio" id="niv-i" name="niveau" value="intermediaire" />
                    <label htmlFor="niv-i">Intermédiaire</label>
                  </div>
                  <div>
                    <input type="radio" id="niv-p" name="niveau" value="pro" />
                    <label htmlFor="niv-p">Pro</label>
                  </div>
                </div>
              </fieldset>

              {message && <p className="message" role="status">{message}</p>}
              <button type="submit" className="btn btn-principal">Enregistrer mon profil</button>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Profil
