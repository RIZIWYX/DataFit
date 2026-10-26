import { type SubmitEvent, useState } from 'react'
import { Link } from 'react-router'
import CadreFormulaire from '../components/CadreFormulaire.tsx'
import Icone from '../components/Icone.tsx'
import { ICONES } from '../data/icones.ts'
import { lireCompte } from '../lib/compte.ts'

// les valeurs sont celles qu'accepte le backend (ContactRequest)
const SUJETS = [
  { valeur: 'question', nom: 'Une question sur DataFit' },
  { valeur: 'probleme', nom: 'Un problème sur le site' },
  { valeur: 'donnees', nom: 'Mes données personnelles' },
  { valeur: 'autre', nom: 'Autre chose' },
]

const LONGUEUR_MAX = 2000

// Formulaire de contact : le message est enregistré par le backend, l'équipe le lit ensuite.
function Contact() {
  const [longueur, setLongueur] = useState(0)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [envoye, setEnvoye] = useState(false)

  async function envoyer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur('')
    setEnvoi(true)
    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.get('nom'),
          email: formData.get('email'),
          sujet: formData.get('sujet'),
          message: formData.get('message'),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        // 5xx : backend arrêté (le proxy répond à sa place) ou en panne ; sinon un champ refusé
        setErreur(
          response.status >= 500
            ? "Le serveur ne répond pas pour l'instant. Réessayez dans quelques minutes."
            : data.error && !data.path
              ? data.error
              : "Le message n'a pas été accepté. Vérifiez les champs, puis réessayez."
        )
        return
      }
      setEnvoye(true)
    } catch (e) {
      console.error(e) // en dev, pour voir la vraie cause dans la console
      setErreur('Impossible de contacter le serveur. Vérifie que le backend est démarré.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <CadreFormulaire
      accroche={{
        titre: 'Une question, une idée',
        texte:
          "Un problème sur le site, une question sur vos données ou une suggestion : écrivez-nous, l'équipe DataFit vous répond par e-mail.",
      }}
      titre="Nous contacter"
    >
      {envoye ? (
        <>
          <p className="cnx-message" role="status">
            <Icone trace={ICONES.valide} />
            Merci, votre message est bien arrivé. Nous vous répondrons à l'adresse e-mail indiquée.
          </p>
          <Link to="/" className="bouton cnx-envoyer">
            Retour à la page de garde
            <Icone trace={ICONES.fleche} />
          </Link>
        </>
      ) : (
        <form onSubmit={envoyer}>
          <div className="champ">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" autoComplete="name" maxLength={100} required />
          </div>

          <div className="champ">
            <label htmlFor="email">Adresse e-mail</label>
            <div className="cnx-champ">
              <Icone trace={ICONES.enveloppe} />
              {/* déjà connu si un compte a été ouvert sur ce navigateur */}
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="exemple@email.com"
                defaultValue={lireCompte()?.email ?? ''}
                maxLength={255}
                required
              />
            </div>
          </div>

          <div className="champ">
            <label htmlFor="sujet">Sujet</label>
            <select id="sujet" name="sujet" defaultValue="question" required>
              {SUJETS.map((s) => (
                <option key={s.valeur} value={s.valeur}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              maxLength={LONGUEUR_MAX}
              required
              onChange={(e) => setLongueur(e.target.value.length)}
            />
            <p className="champ-aide">
              {longueur} / {LONGUEUR_MAX} caractères
            </p>
          </div>

          {erreur && (
            <p className="alerte" role="alert">
              <Icone trace={ICONES.info} />
              {erreur}
            </p>
          )}

          <button type="submit" className="bouton cnx-envoyer" disabled={envoi}>
            {envoi ? 'Envoi…' : 'Envoyer le message'}
            <Icone trace={ICONES.fleche} />
          </button>
        </form>
      )}
    </CadreFormulaire>
  )
}

export default Contact
