// Service pour le profil : appels REST vers /api/profil.
import type { Profil } from '../lib/profil.ts'
import { API_URL, type IdentifiantUtilisateur } from './sport/http.ts'

const CHEMIN = '/api/profil'

// le profil tel que le renvoie le backend (une seule colonne « activite », séparée par des virgules)
interface ProfilServeur {
  utilisateurId: number
  nom: string
  prenom: string
  sexe: string
  poids: number
  taille: number
  objectif: string
  niveau: string
  activite: string
  dateNaissance: string // AAAA-MM-JJ
}

export type ProfilSansEmail = Omit<Profil, 'email'>

const versProfil = (p: ProfilServeur): ProfilSansEmail => ({
  prenom: p.prenom,
  nom: p.nom,
  sexe: p.sexe,
  poids: p.poids,
  taille: p.taille,
  objectif: p.objectif,
  // les profils créés avant la correction gardent « pro » : c'est « confirmer »
  niveau: p.niveau === 'pro' ? 'confirmer' : p.niveau,
  activites: p.activite ? p.activite.split(',').filter(Boolean) : [],
  dateNaissance: p.dateNaissance,
})

// nos contrôleurs renvoient { error: "message en français" } ; 5xx : backend arrêté ou en panne
async function messageErreur(reponse: Response): Promise<string> {
  if (reponse.status >= 500) return 'Le serveur ne répond pas correctement. Réessayez plus tard.'
  const data = await reponse.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : 'Le serveur a refusé la modification.'
}

// le profil enregistré en base ; null si le compte n'a pas encore de profil
export async function chargerProfil(utilisateurId: IdentifiantUtilisateur): Promise<ProfilSansEmail | null> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${utilisateurId}`)
  if (reponse.status === 404) return null
  if (!reponse.ok) throw new Error(await messageErreur(reponse))
  return versProfil((await reponse.json()) as ProfilServeur)
}

// enregistre le profil complet ; renvoie la version gardée en base
export async function modifierProfil(
  utilisateurId: IdentifiantUtilisateur,
  profil: Profil,
): Promise<ProfilSansEmail> {
  const reponse = await fetch(`${API_URL}${CHEMIN}/${utilisateurId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: profil.nom,
      prenom: profil.prenom,
      sexe: profil.sexe,
      poids: profil.poids,
      taille: profil.taille,
      objectif: profil.objectif,
      niveau: profil.niveau,
      activite: profil.activites.join(','),
      dateNaissance: profil.dateNaissance,
    }),
  })
  if (!reponse.ok) throw new Error(await messageErreur(reponse))
  return versProfil((await reponse.json()) as ProfilServeur)
}
