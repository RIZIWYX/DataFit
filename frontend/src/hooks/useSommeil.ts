import { useState } from 'react'
import { NUITS_DEMO } from '../data/sommeil-demo.ts'
import { ecartCoucher, nuits } from '../lib/sommeil.ts'

// logique de la page sommeil : les nuits reçues, la dernière mise en avant, et la nuit consultée
function useSommeil() {
  const [aujourdHui] = useState(() => new Date())
  const liste = nuits(NUITS_DEMO, aujourdHui)
  const [choisie, setChoisie] = useState(liste.at(-1)?.id ?? '')

  return {
    nuits: liste,
    nuit: liste.find((n) => n.id === choisie) ?? liste.at(-1),
    choisirNuit: setChoisie,
    ecartCoucher: ecartCoucher(liste),
    dureeMoyenne: liste.length ? Math.round(liste.reduce((s, n) => s + n.minutes, 0) / liste.length) : 0,
  }
}

export default useSommeil
