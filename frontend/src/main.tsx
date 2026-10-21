import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// police de la charte, servie par le site lui-même (aucun appel à Google Fonts) ;
// version « wdth » : largeur variable, de 62 % à 125 %
import '@fontsource-variable/archivo/wdth.css'
import './styles/charte.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
