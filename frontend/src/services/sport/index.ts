// Registre central des services sport : useSport s'en sert pour piloter
// Valider/Modifier sans connaître les spécificités de chaque discipline.
import {
  CHAMPS_SBD,
  modifierSBD,
  recupererSBD,
  type SBDRequest,
  type SeanceSBD,
  validerSBD,
} from './sbdService.ts'
import {
  CHAMPS_HALTEROFILIE,
  modifierHalterofilie,
  recupererHalterofilie,
  type HalterofilieRequest,
  type SeanceHalterofilie,
  validerHalterofilie,
} from './halterofilieService.ts'
import {
  CHAMPS_STREETLIFTING,
  modifierStreetlifting,
  recupererStreetlifting,
  type SeanceStreetlifting,
  type StreetliftingRequest,
  validerStreetlifting,
} from './streetliftingService.ts'
import {
  CHAMPS_CALISTHENICS,
  modifierCalisthenics,
  recupererCalisthenics,
  type CalisthenicsRequest,
  type SeanceCalisthenics,
  validerCalisthenics,
} from './calisthenicsService.ts'
import {
  CHAMPS_NATATION,
  modifierNatation,
  recupererNatation,
  type NatationRequest,
  type SeanceNatation,
  validerNatation,
} from './natationService.ts'
import {
  CHAMPS_SOUPLESSE,
  modifierSouplesse,
  recupererSouplesse,
  type SeanceSouplesse,
  type SouplesseRequest,
  validerSouplesse,
} from './souplesseService.ts'
import {
  CHAMPS_ATHLETISME,
  modifierAthletisme,
  recupererAthletisme,
  type AthletismeRequest,
  type SeanceAthletisme,
  validerAthletisme,
} from './athletismeService.ts'
import type { IdentifiantUtilisateur } from './http.ts'

// Interface commune à toutes les disciplines, lue par useSport.
export interface ServiceSport {
  // id côté data/paliers.ts (ex. 'sbd', 'halt', 'nat')
  disciplineId: string
  // Correspondance (champ back → id exercice front) pour pré-remplir et envoyer
  champs: Record<string, string>
  recuperer(utilisateurId: IdentifiantUtilisateur): Promise<SeanceSport | null>
  valider(
    utilisateurId: IdentifiantUtilisateur,
    donnees: Record<string, number>,
  ): Promise<SeanceSport>
  modifier(
    utilisateurId: IdentifiantUtilisateur,
    donnees: Record<string, number>,
  ): Promise<SeanceSport>
}

// Toutes les séances suivent la même forme : des champs numériques indexés
// par leur nom back + id et date optionnels.
export type SeanceSport =
  | SeanceSBD
  | SeanceHalterofilie
  | SeanceStreetlifting
  | SeanceCalisthenics
  | SeanceNatation
  | SeanceSouplesse
  | SeanceAthletisme

// Chaque entrée convertit l'appel typé en appel générique via Record<string, number>.
export const SERVICES_SPORT: Record<string, ServiceSport> = {
  sbd: {
    disciplineId: 'sbd',
    champs: CHAMPS_SBD,
    recuperer: (id) => recupererSBD(id),
    valider: (id, d) => validerSBD(id, d as unknown as SBDRequest),
    modifier: (id, d) => modifierSBD(id, d as unknown as SBDRequest),
  },
  halt: {
    disciplineId: 'halt',
    champs: CHAMPS_HALTEROFILIE,
    recuperer: (id) => recupererHalterofilie(id),
    valider: (id, d) => validerHalterofilie(id, d as unknown as HalterofilieRequest),
    modifier: (id, d) => modifierHalterofilie(id, d as unknown as HalterofilieRequest),
  },
  street: {
    disciplineId: 'street',
    champs: CHAMPS_STREETLIFTING,
    recuperer: (id) => recupererStreetlifting(id),
    valider: (id, d) => validerStreetlifting(id, d as unknown as StreetliftingRequest),
    modifier: (id, d) => modifierStreetlifting(id, d as unknown as StreetliftingRequest),
  },
  cali: {
    disciplineId: 'cali',
    champs: CHAMPS_CALISTHENICS,
    recuperer: (id) => recupererCalisthenics(id),
    valider: (id, d) => validerCalisthenics(id, d as unknown as CalisthenicsRequest),
    modifier: (id, d) => modifierCalisthenics(id, d as unknown as CalisthenicsRequest),
  },
  nat: {
    disciplineId: 'nat',
    champs: CHAMPS_NATATION,
    recuperer: (id) => recupererNatation(id),
    valider: (id, d) => validerNatation(id, d as unknown as NatationRequest),
    modifier: (id, d) => modifierNatation(id, d as unknown as NatationRequest),
  },
  soup: {
    disciplineId: 'soup',
    champs: CHAMPS_SOUPLESSE,
    recuperer: (id) => recupererSouplesse(id),
    valider: (id, d) => validerSouplesse(id, d as unknown as SouplesseRequest),
    modifier: (id, d) => modifierSouplesse(id, d as unknown as SouplesseRequest),
  },
  athle: {
    disciplineId: 'athle',
    champs: CHAMPS_ATHLETISME,
    recuperer: (id) => recupererAthletisme(id),
    valider: (id, d) => validerAthletisme(id, d as unknown as AthletismeRequest),
    modifier: (id, d) => modifierAthletisme(id, d as unknown as AthletismeRequest),
  },
}
