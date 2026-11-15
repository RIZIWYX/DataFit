import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleDuCompte, enregistrerCompte, lireCompte, oublierCompte, oublierDonnees, oublierIdentite } from './compte.ts'
import { effacerProfil, enregistrerProfil, lireProfil, profilComplet } from './profil.ts'

// Un localStorage minimal : les tests tournent sans navigateur. Object.keys(localStorage) doit lister
// les clés, comme dans un navigateur : on les recopie comme propriétés à chaque écriture.
function stockageAvecCles() {
  const donnees = new Map<string, string>()
  const objet: Record<string, unknown> = {}
  const synchroniser = () => {
    for (const cle of Object.keys(objet)) if (!donnees.has(cle)) delete objet[cle]
    for (const cle of donnees.keys()) objet[cle] = donnees.get(cle)
  }
  Object.defineProperties(objet, {
    getItem: { value: (cle: string) => donnees.get(cle) ?? null, enumerable: false },
    setItem: { value: (cle: string, valeur: string) => { donnees.set(cle, valeur); synchroniser() }, enumerable: false },
    removeItem: { value: (cle: string) => { donnees.delete(cle); synchroniser() }, enumerable: false },
  })
  vi.stubGlobal('localStorage', objet)
  return donnees
}

describe('compte gardé dans le navigateur', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    stockageAvecCles()
  })

  it('garde puis relit le compte', () => {
    expect(lireCompte()).toBeNull()
    enregistrerCompte({ id: 12, email: 'a@b.fr' })
    expect(lireCompte()).toEqual({ id: 12, email: 'a@b.fr' })
  })

  it('range les clés par compte', () => {
    expect(cleDuCompte('datafit-nutrition')).toBe('datafit-nutrition')
    enregistrerCompte({ id: 12, email: 'a@b.fr' })
    expect(cleDuCompte('datafit-nutrition')).toBe('datafit-nutrition:12')
  })

  it('à la déconnexion, retire le compte et le profil mais garde les saisies rangées par compte', () => {
    enregistrerCompte({ id: 12, email: 'a@b.fr' })
    enregistrerProfil({ prenom: 'Léa', nom: 'Martin' })
    localStorage.setItem('datafit-notes:12', '{"s1":"bien"}')

    oublierIdentite()
    effacerProfil()

    expect(lireCompte()).toBeNull()
    expect(lireProfil()).toBeNull()
    expect(localStorage.getItem('datafit-notes:12')).toBe('{"s1":"bien"}')
  })

  it('à la suppression du compte, efface tout ce qui est rangé pour lui, et rien pour les autres', () => {
    enregistrerCompte({ id: 12, email: 'a@b.fr' })
    localStorage.setItem('datafit-nutrition:12', '{}')
    localStorage.setItem('datafit-records:12', '{}')
    localStorage.setItem('datafit-nutrition:13', '{}')
    localStorage.setItem('autre-site', 'x')

    oublierCompte(12)

    expect(localStorage.getItem('datafit-compte')).toBeNull()
    expect(localStorage.getItem('datafit-nutrition:12')).toBeNull()
    expect(localStorage.getItem('datafit-records:12')).toBeNull()
    expect(localStorage.getItem('datafit-nutrition:13')).toBe('{}')
    expect(localStorage.getItem('autre-site')).toBe('x')
  })

  it('« Effacer mes données » retire les clés des catégories choisies seulement', () => {
    localStorage.setItem('datafit-nutrition:12', '{}')
    localStorage.setItem('datafit-records:12', '{}')
    localStorage.setItem('datafit-notes:12', '{}')

    oublierDonnees(12, ['nutrition', 'performances'])

    expect(localStorage.getItem('datafit-nutrition:12')).toBeNull()
    expect(localStorage.getItem('datafit-records:12')).toBeNull()
    expect(localStorage.getItem('datafit-notes:12')).toBe('{}')
  })

  it('ne plante pas quand le stockage est indisponible', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('bloqué') },
      setItem: () => { throw new Error('bloqué') },
      removeItem: () => { throw new Error('bloqué') },
    })
    expect(lireCompte()).toBeNull()
    expect(() => enregistrerCompte({ id: 1, email: 'a@b.fr' })).not.toThrow()
    expect(() => oublierIdentite()).not.toThrow()
  })
})

describe('profilComplet', () => {
  const complet = {
    prenom: 'Léa', nom: 'Martin', email: 'a@b.fr', dateNaissance: '1994-05-12', taille: 168, poids: 62,
    sexe: 'F', niveau: 'novice', activites: ['course'], objectif: 'Rester en forme',
  }

  it('exige tous les champs de la création du profil', () => {
    expect(profilComplet(null)).toBe(false)
    expect(profilComplet(complet)).toBe(true)
    for (const [champ, vide] of [['prenom', ''], ['dateNaissance', ''], ['taille', 0], ['poids', 0], ['activites', []], ['objectif', '']] as const) {
      expect(profilComplet({ ...complet, [champ]: vide }), champ).toBe(false)
    }
  })
})
