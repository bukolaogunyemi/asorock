// client/src/lib/godfatherTypes.ts
import type { GameStateModifier, LeverCost } from "./legislativeTypes";

export type GodfatherArchetype =
  | "business-oligarch"
  | "military-elder"
  | "party-boss"
  | "labour-civil"
  | "religious-leader"
  | "regional-strongman"
  | "media-mogul";

export interface GodfatherTraits {
  aggression: number;
  loyalty: number;
  greed: number;
  visibility: number;
}

export interface GodfatherConnection {
  entityType: "governor" | "legislator-bloc" | "cabinet" | "media" | "business" | "street";
  entityId?: string;
  description: string;
  effect: GameStateModifier[];
  revealed: boolean;
}

export interface GodfatherStable {
  governors: string[];
  legislativeBloc: { house: number; senate: number };
  cabinetCandidates: string[];
  connections: GodfatherConnection[];
  militaryInterests?: string[];
  diplomaticInterests?: string[];
  directorInterests?: string[];
  traditionalRulerAllies?: string[];
  religiousLeaderAllies?: string[];
}

export interface GodfatherContract {
  id: string;
  description: string;
  deliveredByGodfather: boolean;
  deadlineDay: number;
  playerDelivered: boolean;
  consequence: GameStateModifier[];
}

export interface Godfather {
  id: string;
  name: string;
  archetype: GodfatherArchetype;
  zone: string;
  description: string;
  traits: GodfatherTraits;
  disposition: "friendly" | "neutral" | "cold" | "hostile";
  dealStyle: "contract" | "favour-bank";
  interests: string[];
  stable: GodfatherStable;
  escalationStage: 0 | 1 | 2 | 3 | 4;
  favourDebt: number;
  activeContracts: GodfatherContract[];
  neutralized: boolean;
  influenceScore: number;
}

export interface GodfatherDeal {
  godfatherId: string;
  type: "contract" | "favour";
  godfatherOffers: string;
  playerOwes: string;
  estimatedCost: LeverCost[];
  estimatedBenefit: string;
}

export interface PatronageState {
  godfathers: Godfather[];
  patronageIndex: number;
  activeDeals: number;
  neutralizedGodfathers: string[];
  approachCooldowns: Record<string, number>;
}
