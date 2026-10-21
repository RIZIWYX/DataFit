import { useId } from 'react'
import '../styles/editeur-exercices.css'
import { ICONES } from '../data/icones.ts'
import { DISCIPLINES } from '../data/paliers.ts'
import {
  type ExercicePrevu,
  LIBELLES_CHAMPS,
  champsExercice,
  exerciceDuCatalogue,
  nouvelId,
} from '../lib/programmation.ts'
import Icone from './Icone.tsx'

type Props = {
  exercices: ExercicePrevu[]
  onChange: (exercices: ExercicePrevu[]) => void
}

// Les exercices d'une séance. Chacun vient du catalogue de la page Performance (ou est libre),
// et ne propose que les réglages qui ont un sens pour lui : séries, répétitions et charge pour
// un squat, distance et durée pour un 10 km, tenue pour un L-sit…
function EditeurExercices({ exercices, onChange }: Props) {
  const idAjout = useId()

  const modifier = (id: string, modifications: Partial<ExercicePrevu>) =>
    onChange(exercices.map((ex) => (ex.id === id ? { ...ex, ...modifications } : ex)))

  const deplacer = (index: number, sens: -1 | 1) => {
    const liste = [...exercices]
    const [element] = liste.splice(index, 1)
    liste.splice(index + sens, 0, element)
    onChange(liste)
  }

  function ajouter(choix: string) {
    if (!choix) return
    const catalogue = exerciceDuCatalogue(choix)
    onChange([...exercices, { id: nouvelId(), exerciceId: catalogue?.id ?? null, nom: catalogue?.nom ?? '' }])
  }

  return (
    <div className="editeur">
      {exercices.length === 0 ? (
        <p className="editeur-vide">Aucun exercice pour l'instant : ajoutez-en un ci-dessous.</p>
      ) : (
        <ol className="editeur-liste">
          {exercices.map((ex, i) => (
            <li key={ex.id} className="editeur-ligne">
              <span className="editeur-numero">{i + 1}</span>
              <div className="editeur-corps">
                {ex.exerciceId ? (
                  <strong>{ex.nom}</strong>
                ) : (
                  <input
                    aria-label="Nom de l'exercice"
                    placeholder="Nom de l'exercice (ex. rowing barre)"
                    value={ex.nom}
                    onChange={(e) => modifier(ex.id, { nom: e.target.value })}
                  />
                )}
                <div className="editeur-reglages">
                  {champsExercice(ex.exerciceId).map((champ) => (
                    <label key={champ} className="champ">
                      <span className="champ-nom">{LIBELLES_CHAMPS[champ]}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={champ === 'charge' || champ === 'distance' ? 0.5 : 1}
                        value={ex[champ] ?? ''}
                        onChange={(e) => modifier(ex.id, { [champ]: e.target.value === '' ? undefined : Number(e.target.value) })}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="editeur-boutons">
                <button type="button" className="bouton-icone discret" disabled={i === 0} onClick={() => deplacer(i, -1)}>
                  <Icone trace={ICONES.hausse} />
                  <span className="visuellement-cache">Monter {ex.nom}</span>
                </button>
                <button
                  type="button"
                  className="bouton-icone discret"
                  disabled={i === exercices.length - 1}
                  onClick={() => deplacer(i, 1)}
                >
                  <Icone trace={ICONES.baisse} />
                  <span className="visuellement-cache">Descendre {ex.nom}</span>
                </button>
                <button
                  type="button"
                  className="bouton-icone discret danger"
                  onClick={() => onChange(exercices.filter((autre) => autre.id !== ex.id))}
                >
                  <Icone trace={ICONES.corbeille} />
                  <span className="visuellement-cache">Retirer {ex.nom || "l'exercice"}</span>
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* choisir dans la liste ajoute l'exercice aussitôt */}
      <label className="visuellement-cache" htmlFor={idAjout}>Ajouter un exercice</label>
      <select id={idAjout} className="editeur-ajout" value="" onChange={(e) => ajouter(e.target.value)}>
        <option value="">+ Ajouter un exercice…</option>
        {DISCIPLINES.map((discipline) => (
          <optgroup key={discipline.id} label={discipline.nom}>
            {discipline.exercices.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.nom}</option>
            ))}
          </optgroup>
        ))}
        <optgroup label="Autre">
          <option value="libre">Exercice libre (nom à saisir)</option>
        </optgroup>
      </select>
    </div>
  )
}

export default EditeurExercices
