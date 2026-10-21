import { type ReactNode, useEffect, useId, useRef } from 'react'
import { ICONES } from '../data/icones.ts'
import Icone from './Icone.tsx'

type Props = {
  ouverte: boolean
  titre: string
  onFermer: () => void // Échap, clic à côté, bouton fermer
  children: ReactNode
  pied?: ReactNode // les actions, en bas
  large?: boolean
}

// Fenêtre modale (élément <dialog> du navigateur : le focus y reste enfermé, Échap la ferme).
// Son contenu n'existe que pendant qu'elle est ouverte : un formulaire repart de zéro à chaque fois.
function Fenetre({ ouverte, titre, onFermer, children, pied, large = false }: Props) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const element = dialogue.current
    if (!element) return
    if (ouverte && !element.open) element.showModal()
    if (!ouverte && element.open) element.close()
  }, [ouverte])

  return (
    <dialog
      ref={dialogue}
      className={large ? 'fenetre large refonte' : 'fenetre refonte'}
      aria-labelledby={id}
      onClose={onFermer}
      onClick={(e) => e.target === e.currentTarget && onFermer()}
    >
      {ouverte && (
        <div className="fenetre-contenu">
          <header className="fenetre-tete">
            <h2 id={id}>{titre}</h2>
            <button type="button" className="bouton-icone discret" onClick={onFermer}>
              <Icone trace={ICONES.fermer} />
              <span className="visuellement-cache">Fermer</span>
            </button>
          </header>
          <div className="fenetre-corps">{children}</div>
          {pied && <footer className="fenetre-pied">{pied}</footer>}
        </div>
      )}
    </dialog>
  )
}

export default Fenetre
