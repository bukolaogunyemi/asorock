// client/src/lib/partyTypes.ts
export type NWCPosition =
  | "national-chairman"
  | "vice-chairman"
  | "national-secretary"
  | "national-treasurer"
  | "publicity-secretary"
  | "organising-secretary"
  | "legal-adviser"
  | "youth-women-leader";

export type OppositionStrategy = "obstruct" | "negotiate" | "attack";

export interface NWCMember {
  characterId: string;
  name: string;
  position: NWCPosition;
  zone: string;
  state: string;
  competence: number;
  loyalty: number;
  disposition: "supportive" | "neutral" | "hostile";
  factionAlignment?: string;
  godfatherId?: string;
}

export interface PartyState {
  id: string;
  name: string;
  abbreviation: string;
  nwc: NWCMember[];
  legislativeSeats: { house: number; senate: number };
  isRulingParty: boolean;
  isMainOpposition: boolean;
  partyControlScore?: number;
  oppositionStrategy?: OppositionStrategy;
  strategyReassessmentDay?: number;
}

export interface AtRiskEntry {
  id: string;
  currentParty: string;
  zone: string;
  seatCount: number;
  seatType: "house" | "senate";
  partyLoyalty: number;
  defectionProbability: number;
}

export interface Defection {
  id: string;
  fromParty: string;
  toParty: string;
  day: number;
  trigger: "player-poaching" | "godfather-pull" | "party-crisis" | "election-cycle" | "opposition-poaching";
  zone: string;
  seatType: "house" | "senate" | "governor";
  seatCount: number;
  governorId?: string;
  description: string;
}

export interface DefectionState {
  atRiskLegislators: AtRiskEntry[];
  recentDefections: Defection[];
  poachingCooldown: Record<string, number>;
}

export interface ConventionRace {
  position: NWCPosition;
  candidates: { characterId: string; name: string; supportScore: number }[];
  playerBacked?: string;
  winner?: string;
}

export interface ConventionState {
  phase: "inactive" | "pre-convention" | "voting" | "post-convention";
  conventionDay: number;
  races: ConventionRace[];
  playerPCSpent: number;
}

export interface PartyInternalsState {
  parties: PartyState[];
  rulingPartyId: string;
  mainOppositionIds: string[];
  defections: DefectionState;
  convention: ConventionState;
  partyLoyaltyDrift: number;
}
