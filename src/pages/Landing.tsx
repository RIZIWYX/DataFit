import { Link } from 'react-router'
import '../styles/landing.css'

function Landing() {
  return (
    <div className="landing">
      <main>
        <section className="hero">
          <img src="/logo.jpeg" alt="DataFit" className="hero-logo" />
          <h1> Au dela de </h1>
             <h1>vos <span>limites.</span></h1>
          <p>DataFit analyse tes séances et t'aide à progresser à ton rythme.</p>
          <div className="cta">
            <Link to="/dashboard" className="btn">Commencer</Link>
            <a href="#" className="btn small">Download</a>
            <a href="#features" className="btn ghost">En savoir plus</a>
          </div>
        </section>
      </main>


    </div>
  )
}

export default Landing
