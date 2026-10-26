import '../styles/landing.css'
import '../styles/installer.css'
import EnteteVitrine from '../components/EnteteVitrine.tsx'
import Icone from '../components/Icone.tsx'
import PiedDePage from '../components/PiedDePage.tsx'
import { ICONES } from '../data/icones.ts'

// Une case par téléchargement. Logos : public/plateformes (Devicon, licence MIT).
// Les boutons ne mènent encore nulle part : il faudra y mettre les liens des fichiers d'installation.
const PLATEFORMES = [
  { id: 'windows', logo: 'windows.svg', titre: 'Windows', texte: 'Pour les ordinateurs sous Windows 10 et 11.' },
  { id: 'linux', logo: 'linux.svg', titre: 'Linux', texte: 'Pour les ordinateurs sous Linux (Ubuntu, Debian, Fedora…).' },
  { id: 'macos', logo: 'apple.svg', titre: 'macOS', texte: 'Pour les ordinateurs sous macOS (Apple).' },
  { id: 'android', logo: 'android.svg', titre: 'Android', texte: 'Pour les smartphones et tablettes Android.' },
  { id: 'iphone', logo: 'apple.svg', titre: 'iPhone', texte: 'Pour les iPhone et iPad.' },
]

// Télécharger l'application DataFit (page ouverte depuis la page de garde)
function Installer() {
  return (
    <div className="vitrine refonte">
      <EnteteVitrine autrePage />

      <main className="installer">
        <div className="installer-tete">
          <p className="surtitre">Application</p>
          <h1 className="titre-page affiche">
            Installez <span className="installer-marque">DataFit.</span>
          </h1>
          <p>
            Choisissez votre appareil et téléchargez l'application.
            <br />
            DataFit vous suit partout, sur tous vos écrans.
          </p>
        </div>

        <ul className="installer-plateformes">
          {PLATEFORMES.map((p) => (
            <li key={p.id}>
              <img className="installer-logo" src={`/plateformes/${p.logo}`} alt="" width="64" height="64" />
              <h2>{p.titre}</h2>
              <p>{p.texte}</p>
              <button type="button" className="bouton">
                <Icone trace={ICONES.telecharger} />
                {/* « pour Windows » n'est affiché que s'il y a la place (installer.css) */}
                <span>
                  Télécharger<span className="installer-pour"> pour {p.titre}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      <PiedDePage />
    </div>
  )
}

export default Installer
