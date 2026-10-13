import { useState } from 'react'
import { type Exercice, NOMS_RANGS, RANGS } from '../data/paliers.ts'
import {
  type Perfs,
  type Profil,
  estVerrouille,
  formatValeur,
  libelleMesure,
  progression,
  rang,
  seuils,
  texteProchain,
  valeur,
} from '../lib/rangs.ts'
import BadgeRang from './BadgeRang.tsx'

interface Props {
  exercice: Exercice
  perfs: Perfs
  profil: Profil
  onChange: (id: string, valeur: string) => void
}

const PLACEHOLDERS: Record<string, string> = {
  time: 'ex. 4:30',
  load: 'kg',
  lest: 'kg ajoutés',
  reps: 'reps',
  hold: 'secondes',
  dist: 'mètres',
}

function CarteExercice({ exercice: ex, perfs, profil, onChange }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const verrouille = estVerrouille(ex, perfs, profil)
  const r = verrouille ? -1 : rang(ex, perfs, profil)
  const s = seuils(ex, profil)
  const pct = verrouille ? 0 : progression(ex, perfs, profil)
  const idChamp = `perf-${ex.id}`

  // couleur de la jauge = couleur du rang visé
  const couleurJauge = r >= 0 ? `var(--rang-${RANGS[Math.min(7, r + 1)]})` : undefined

  return (
    <article className={`dash-ex${verrouille ? ' verrouille' : ''}`}>
      <div className="dash-ex-main">
        <div className="dash-ex-top">
          <label className="dash-ex-nom" htmlFor={idChamp}>{ex.nom}</label>
          <span className="dash-ex-unite">{libelleMesure(ex)}</span>
        </div>

        <div className="dash-ex-saisie">
          {ex.type === 'ladder' ? (
            <select id={idChamp} value={perfs[ex.id] ?? ''} onChange={(e) => onChange(ex.id, e.target.value)}>
              <option value="">Choisir…</option>
              {ex.etapes?.map((etape, i) => (
                <option key={etape} value={i}>{RANGS[i]} · {etape}</option>
              ))}
            </select>
          ) : (
            <input
              id={idChamp}
              inputMode={ex.type === 'time' ? 'text' : 'decimal'}
              placeholder={PLACEHOLDERS[ex.type]}
              value={perfs[ex.id] ?? ''}
              disabled={verrouille}
              onChange={(e) => onChange(ex.id, e.target.value)}
            />
          )}
          {r >= 0 && (
            <span className="dash-rang-nom" style={{ color: `var(--rang-${RANGS[r]})` }}>{NOMS_RANGS[r]}</span>
          )}
          {ex.type === 'load' && r >= 0 && (
            <span className="dash-note">{(valeur(ex, perfs) / profil.poidsRef).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} × PdC</span>
          )}
        </div>

        <div className="dash-jauge" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progression ${ex.nom}`}>
          <i style={{ width: `${pct}%`, background: couleurJauge }} />
        </div>

        <p className="dash-prochain">
          {verrouille
            ? 'Verrouillé · valide 1 muscle-up dans Calisthenics pour le débloquer.'
            : texteProchain(ex, perfs, profil, RANGS)}
        </p>

        <button type="button" className="dash-lien" aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>
          {ouvert ? 'Masquer les paliers' : 'Voir les paliers'}
        </button>
      </div>

      <BadgeRang rang={r} />

      {ouvert && (
        <div className="dash-paliers">
          <table>
            <thead>
              <tr>
                {RANGS.map((k) => (
                  <th key={k} style={{ color: `var(--rang-${k})` }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {ex.type === 'ladder'
                  ? ex.etapes?.map((etape, i) => (
                      <td key={etape} className={i === r ? 'actuel' : ''}>{etape}</td>
                    ))
                  : [
                      `${ex.type === 'time' ? '> ' : '< '}${formatValeur(ex, s![0])}`,
                      ...s!.map((x) => formatValeur(ex, x)),
                    ].map((txt, i) => (
                      <td key={RANGS[i]} className={i === r ? 'actuel' : ''}>{txt}</td>
                    ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}

export default CarteExercice
