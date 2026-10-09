import { Link } from 'react-router'

function Landing() {
  return (
    <>
      <header className="nav">
        <img src="/logo.jpeg" alt="DataFit" className="nav-logo" />
        <nav>
          <a href="#contact">Contact</a>
          <Link to="/connexion" className="btn ghost small">Connexion</Link>
          <a href="#" className="btn small">Download</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <img src="/logo.jpeg" alt="DataFit" className="hero-logo" />
          <h1>Ton sport, <span>en données.</span></h1>
          <p>DataFit analyse tes séances et t'aide à progresser à ton rythme.</p>
          <div className="cta">
            <Link to="/dashboard" className="btn">Commencer</Link>
            <a href="#features" className="btn ghost">En savoir plus</a>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        © 2026 DataFit
      </footer>
    </>
  )
}

export default Landing
