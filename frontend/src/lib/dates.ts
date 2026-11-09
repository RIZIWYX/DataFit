// Petites fonctions de dates et d'identifiants partagées par plusieurs pages
export const nouvelId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

// "2026-10-16", en heure locale
export const cleJour = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
