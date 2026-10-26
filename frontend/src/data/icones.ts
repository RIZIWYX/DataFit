// Tracés des icônes : l'attribut d d'un chemin SVG, dessiné sur une grille de 24 × 24.
// Ils s'affichent avec le composant Icone. Les icônes des sports sont dans sports.ts.

export const ICONES = {
  // navigation
  accueil: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  montre: 'M8 7h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 7l.7-3.5h4.6L15 7M9 17l.7 3.5h4.6L15 17',
  sommeil: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  // une fourchette et un couteau
  nutrition: 'M7 3.5V9a2 2 0 0 0 4 0V3.5M9 3.5v17M16.5 20.5V3.5c1.8.8 2.5 3 2.5 6v3.5h-2.5',
  // une bulle de discussion
  chatbot: 'M5 5.5h14a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-8l-4 3.5V17H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 11.25h.01M12 11.25h.01M15.5 11.25h.01',
  // une couronne
  premium: 'M4 8l4 4 4-7 4 7 4-4-1.5 10.5h-13zM5.5 20h13',
  profil: 'M8.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5',
  deconnexion: 'M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14.5 8l4 4-4 4M18.5 12H9.5',
  calendrier: 'M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM4 10h16M8.5 3.5v4M15.5 3.5v4M8 14h2M14 14h2M8 17h2',
  chrono: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5V8H8M12 8.5V12l2.5 1.5',
  tendance: 'M4 17l5-5 3.5 3.5L20 8M15 8h5v5',
  trophee: 'M8 4.5h8V9a4 4 0 0 1-8 0zM8 6.5H5.5V8a3 3 0 0 0 3 3M16 6.5h2.5V8a3 3 0 0 1-3 3M12 13v3.5M8.5 20h7M10 16.5h4V20h-4z',
  plus: 'M4.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M10.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M16.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0',

  // actions et repères
  valide: 'M5 12.5l4.5 4.5L19 7.5',
  info: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M12 11v5.5M12 7.6v.2',
  retour: 'M19 12H5M11 6l-6 6 6 6',
  note: 'M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5zM9 12h6M9 15.5h6',
  tous: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
  fleche: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'M9.5 6l6 6-6 6',
  precedent: 'M14.5 6l-6 6 6 6',
  hausse: 'M12 19V5M6 11l6-6 6 6',
  baisse: 'M12 5v14M6 13l6 6 6-6',
  cible: 'M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M7.5 12a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
  fermer: 'M6 6l12 12M18 6L6 18',
  crayon: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  corbeille: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5',
  ajouter: 'M12 5v14M5 12h14',
  recherche: 'M4 10.5a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M15.5 15.5L20 20',
  synchro: 'M19.5 12a7.5 7.5 0 0 1-13.2 4.9M4.5 12a7.5 7.5 0 0 1 13.2-4.9M18 3.5v4h-4M6 20.5v-4h4',

  // connexion
  enveloppe: 'M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM3.5 7.5l8.5 6 8.5-6',
  cadenas: 'M7 11h10a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 7 11zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  oeil: 'M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zM9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
  // page de téléchargement de l'application
  telecharger: 'M12 3.5v11.5M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15',
}
