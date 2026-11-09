// Abonnement premium : formules, prix affichés et types. L'état de l'abonnement vient du backend
// (/api/abonnement, voir services/abonnementService.ts) ; démonstration, sans vrai paiement.

export type Periodicite = 'mensuel' | 'annuel'

export interface Formule {
  id: 'gratuit' | 'premium'
  nom: string
  description: string
  prix: Record<Periodicite, number> // en euros TTC
  avantages: string[]
}

export const FORMULES: Formule[] = [
  {
    id: 'gratuit',
    nom: 'Gratuit',
    description: "L'essentiel pour suivre vos séances.",
    prix: { mensuel: 0, annuel: 0 },
    avantages: ['Synchronisation de la montre', 'Historique des 30 derniers jours', 'Suivi du sommeil et de la nutrition'],
  },
  {
    id: 'premium',
    nom: 'Premium',
    description: 'Toute l\'analyse DataFit, sans limite.',
    prix: { mensuel: 7.99, annuel: 79.9 },
    avantages: [
      'Historique complet',
      'Prédiction des performances',
      'Classements et rangs détaillés',
      'Graphiques d\'analyse avancés',
      'Export de vos données',
    ],
  },
]

export interface Abonnement {
  formule: 'premium'
  periodicite: Periodicite
  debut: string // ISO
  renouvellement: string // ISO : fin de la période payée
  resilie: boolean // vrai : l'accès reste actif jusqu'au renouvellement, puis s'arrête
}

// économie de l'annuel par rapport à 12 mois, en %
export function economieAnnuelle(f: Formule): number {
  const douzeMois = f.prix.mensuel * 12
  return douzeMois === 0 ? 0 : Math.round((1 - f.prix.annuel / douzeMois) * 100)
}

export const formatPrix = (euros: number) =>
  euros === 0 ? '0 €' : euros.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
