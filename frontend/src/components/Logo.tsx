// Logo DataFit : le symbole « D » (une courbe de progression) tient lieu de première lettre,
// suivi de « ata » et « fit ». Le symbole est une image (public/logo.webp), le nom du texte
// dans la police de la charte. Styles : .logo dans charte.css.
function Logo() {
  return (
    <span className="logo">
      <img src="/logo.webp" alt="" width="70" height="60" />
      <span className="logo-nom" aria-hidden="true">
        ata<em>fit</em>
      </span>
      {/* le nom lu par les lecteurs d'écran, d'un seul tenant */}
      <span className="visuellement-cache">DataFit</span>
    </span>
  )
}

export default Logo
