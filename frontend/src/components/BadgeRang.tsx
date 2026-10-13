import { RANGS } from '../data/paliers.ts'

interface Props {
  rang: number // -1 = pas renseigné, 0 = E … 7 = Z
  petit?: boolean
}

function BadgeRang({ rang, petit = false }: Props) {
  const lettre = rang >= 0 ? RANGS[rang] : null
  const classes = ['sport-badge', petit ? 'petit' : '', lettre === 'Z' ? 'z' : '', lettre ? '' : 'vide']
    .filter(Boolean)
    .join(' ')
  const style = lettre && lettre !== 'Z' ? { background: `var(--rang-${lettre})` } : undefined

  return (
    <span className={classes} style={style} aria-label={lettre ? `Rang ${lettre}` : 'Pas de rang'}>
      {lettre ?? '–'}
    </span>
  )
}

export default BadgeRang
