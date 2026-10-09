import { Link } from 'react-router'

type Props = {
  title: string
  description: string
}

// panneau de gauche des pages connexion et profil
function DataFitPanel({ title, description }: Props) {
  return (
    <aside className="vitrine">
      <Link to="/" className="logo">DataFit</Link>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
        <svg className="ecg" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M0 60H110l12-8 10 8h14l10-48 14 70 10-22h20l14-10 14 10H400" />
        </svg>
      </div>
    </aside>
  )
}

export default DataFitPanel
