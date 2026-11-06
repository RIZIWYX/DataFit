
export function dateCardio(date: string): Date {
  const [annee, mois, jour] = date.split('-').map(Number)
  return new Date(annee, mois - 1, jour)
}

export function formatDureeSecondes(secondes: number): string {
  const total = Math.round(secondes)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h
    ? `${h} h ${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} s`
    : `${m} min ${String(s).padStart(2, '0')} s`
}
