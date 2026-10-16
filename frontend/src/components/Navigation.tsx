import { useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import '../styles/navigation.css'
import { ICONES } from '../data/icones.ts'
import useDeconnexion from '../hooks/useDeconnexion.ts'
import { initiales, lireProfil } from '../lib/profil.ts'
import Icone from './Icone.tsx'
import Logo from './Logo.tsx'

interface Page {
  to: string
  nom: string
  icone: string
  bientot?: boolean // page annoncée, pas encore développée
}

// Les pages, par groupes : ce qu'on fait (entraînement), ce qui est mesuré (suivi).
// Le profil et la déconnexion sont en bas, avec l'utilisateur.
const GROUPES: { titre?: string; pages: Page[] }[] = [
  { pages: [{ to: '/dashboard', nom: 'Accueil', icone: ICONES.accueil }] },
  {
    titre: 'Entraînement',
    pages: [
      { to: '/programmation', nom: 'Programmation', icone: ICONES.calendrier },
      { to: '/historique', nom: 'Historique', icone: ICONES.chrono },
      { to: '/progression', nom: 'Progression', icone: ICONES.tendance },
      { to: '/performance', nom: 'Performance', icone: ICONES.trophee },
    ],
  },
  {
    titre: 'Suivi',
    pages: [
      { to: '/sommeil', nom: 'Sommeil', icone: ICONES.sommeil },
      { to: '/montre', nom: 'Montre', icone: ICONES.montre },
    ],
  },
]

// Sur téléphone : quatre onglets en bas de l'écran, le reste derrière « Plus ».
const ONGLETS = ['/dashboard', '/programmation', '/historique', '/progression']
const TOUTES = GROUPES.flatMap((groupe) => groupe.pages)
const PAGES_ONGLETS = TOUTES.filter((page) => ONGLETS.includes(page.to))
const PAGES_PLUS = TOUTES.filter((page) => !ONGLETS.includes(page.to))

function Navigation() {
  const deconnecter = useDeconnexion()
  const { pathname } = useLocation()
  const feuille = useRef<HTMLDialogElement>(null)

  // relu à chaque changement de page : un profil tout juste enregistré apparaît aussitôt
  const profil = lireProfil()
  const nom = `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim() || 'Mon profil'
  const lettres = profil ? initiales(profil) : ''
  const avatar = (
    <span className="nav-avatar" aria-hidden="true">
      {lettres || <Icone trace={ICONES.profil} />}
    </span>
  )

  const fermer = () => feuille.current?.close()
  const plusActif = [...PAGES_PLUS.map((page) => page.to), '/profil'].some((to) => pathname.startsWith(to))

  return (
    <>
      {/* ordinateur : barre latérale ; tablette : la même, réduite aux icônes */}
      <aside className="nav-app">
        <Link to="/dashboard" className="nav-app-logo" aria-label="DataFit, accueil">
          <Logo />
        </Link>

        <nav className="nav-groupes" aria-label="Navigation principale">
          {GROUPES.map((groupe) => (
            <div key={groupe.titre ?? 'accueil'} className="nav-groupe">
              {groupe.titre && <h2 className="nav-groupe-titre">{groupe.titre}</h2>}
              <ul>
                {groupe.pages.map((page) => (
                  <li key={page.to}>
                    <LienNav page={page} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="nav-utilisateur">
          <NavLink to="/profil" className="nav-profil" data-nom="Profil">
            {avatar}
            <span className="nav-texte">
              <strong>{nom}</strong>
              <small>Voir le profil</small>
            </span>
          </NavLink>
          <button type="button" className="nav-deconnexion" onClick={deconnecter} data-nom="Se déconnecter">
            <Icone trace={ICONES.deconnexion} />
            <span className="visuellement-cache">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* téléphone : barre du haut et onglets en bas */}
      <header className="barre-haut">
        <Link to="/dashboard" aria-label="DataFit, accueil">
          <Logo />
        </Link>
        <Link to="/profil" aria-label="Mon profil">
          {avatar}
        </Link>
      </header>

      <nav className="barre-onglets" aria-label="Navigation principale">
        {PAGES_ONGLETS.map((page) => (
          <NavLink key={page.to} to={page.to} className="onglet">
            <Icone trace={page.icone} />
            <span>{page.nom}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={plusActif ? 'onglet active' : 'onglet'}
          aria-haspopup="dialog"
          onClick={() => feuille.current?.showModal()}
        >
          <Icone trace={ICONES.plus} />
          <span>Plus</span>
        </button>
      </nav>

      {/* « Plus » : un panneau qui monte du bas ; un clic à côté ou Échap le referme */}
      <dialog
        ref={feuille}
        className="feuille refonte"
        aria-label="Autres pages"
        onClick={(e) => e.target === e.currentTarget && fermer()}
      >
        <div className="feuille-contenu">
          <ul>
            {PAGES_PLUS.map((page) => (
              <li key={page.to}>
                <LienNav page={page} onClick={fermer} />
              </li>
            ))}
            <li>
              <LienNav page={{ to: '/profil', nom: 'Profil', icone: ICONES.profil }} onClick={fermer} />
            </li>
          </ul>
          <button
            type="button"
            className="nav-lien feuille-deconnexion"
            onClick={() => {
              fermer()
              deconnecter()
            }}
          >
            <Icone trace={ICONES.deconnexion} />
            <span className="nav-texte">Se déconnecter</span>
          </button>
        </div>
      </dialog>
    </>
  )
}

// un lien de la navigation ; data-nom sert d'infobulle quand seule l'icône est visible
function LienNav({ page, onClick }: { page: Page; onClick?: () => void }) {
  return (
    <NavLink to={page.to} className="nav-lien" onClick={onClick} data-nom={page.nom}>
      <Icone trace={page.icone} />
      <span className="nav-texte">{page.nom}</span>
      {page.bientot && <span className="etiquette nav-texte">Bientôt</span>}
    </NavLink>
  )
}

export default Navigation
