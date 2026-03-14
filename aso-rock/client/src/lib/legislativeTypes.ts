// client/src/lib/legislativeTypes.ts
import type { GameState } from "./gameTypes";

export interface GameStateModifier {
  target:
    | "approval"
    | "stability"
    | "politicalCapital"
    | "partyLoyalty"
    | "factionGrievance"
    | "macroEconomy"
    | "outrage"
    | "trust";
  delta: number;
  factionName?: string;
  macroKey?: string;
  delay?: number;
}

export type BillStage =
  | "introduction"
  | "committee"
  | "floor-debate"
  | "vote"
  | "passed"
  | "failed"
  | "stalled"
  | "vetoed"
  | "signed";

export interface VoteProjection {
  firmYes: number;
  leaningYes: number;
  undecided: number;
  leaningNo: number;
  firmNo: number;
}

export interface BillEffects {
  onPass: GameStateModifier[];
  onFail: GameStateModifier[];
}

export interface Amendment {
  description: string;
  sponsor: "ruling-backbench" | "opposition" | "cross-party" | "committee";
  effectModifiers: GameStateModifier[];
  supportSwing: { house: number; senate: number };
  accepted: boolean;
}

export interface Bill {
  id: string;
  title: string;
  description: string;
  subjectTag: "economy" | "security" | "governance" | "social" | "constitutional";
  sponsor: "executive" | "ruling-backbench" | "opposition" | "cross-party";
  stakes: "routine" | "significant" | "critical";
  houseStage: BillStage;
  senateStage: BillStage;
  houseSupport: VoteProjection;
  senateSupport: VoteProjection;
  introducedOnDay: number;
  signingDeadlineDay: number | null;
  effects: BillEffects;
  amendments: Amendment[];
  isCrisis: boolean;
  houseStageDaysRemaining: number;
  senateStageDaysRemaining: number;
  houseStageEnteredDay: number;
  senateStageEnteredDay: number;
  powerBrokerTag?: string;
}

export interface LeverCost {
  type: "politicalCapital" | "approval" | "partyLoyalty" | "billDilution";
  amount: number;
}

export interface InfluenceLever {
  id: string;
  name: string;
  description: string;
  costs: LeverCost[];
  houseSwing: number;
  senateSwing: number;
  sideEffects: GameStateModifier[];
  available: (state: GameState, bill: Bill) => boolean;
}

export interface ScheduledBill {
  template: Pick<Bill, "title" | "description" | "subjectTag" | "stakes" | "effects"> & {
    sponsor?: Bill["sponsor"];
  };
  targetDay: number;
  isCrisis: boolean;
}

export interface LegislativeState {
  activeBills: Bill[];
  passedBills: Bill[];
  failedBills: Bill[];
  pendingSignature: Bill[];
  legislativeCalendar: ScheduledBill[];
  adviserAccuracy: number;
  sessionStats: {
    billsIntroduced: number;
    billsPassed: number;
    billsVetoed: number;
    overrideAttempts: number;
    overrideSuccesses: number;
  };
}
