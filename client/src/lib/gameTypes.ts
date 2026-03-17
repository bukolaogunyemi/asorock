import type { IdeologyProfile } from "./parties";
import type { ConstitutionalCandidate } from "./constitutionalOfficers";
import type { LegislativeState } from "./legislativeTypes";
import type { PatronageState } from "./godfatherTypes";
import type { FederalCharacterState } from "./federalCharacterTypes";
import type { IntelligenceState } from "./intelligenceTypes";
import type { PartyInternalsState } from "./partyTypes";
import type { EconomicState } from "./economicTypes";
import type { CharacterCompetencies, CareerEntry, InteractionEntry } from "./competencyTypes";
import type { GovernanceSectorState, BudgetAllocation, CrossSectorEffects, CrossSectorCascade } from "./sectorTypes";
import type { DirectorSystemState } from "./directorTypes";
import type { JudiciaryState } from "./judiciaryTypes";
import type { UnionLeaderState } from "./unionTypes";
import type { GovernorSystemState } from "./governorTypes";
import type { DiplomatSystemState } from "./diplomatTypes";
import type { MilitarySystemState } from "./militaryTypes";
import type { TraditionalRulerSystemState } from "./traditionalRulerTypes";
import type { ReligiousLeaderSystemState } from "./religiousLeaderTypes";

/** Tags a presidential decision with its ideological direction */
export interface IdeologyImpact {
  dimension: keyof IdeologyProfile;
  value: number; // -2 to +2
}

/** Groups political state for clean GameState integration */
export interface PoliticalState {
  partyLoyalty: number;          // 0–100, starts at 70
}

export type Relationship = "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
export type EventSeverity = "critical" | "warning" | "info";
export type InboxPriority = "Normal" | "Urgent" | "Critical";
export type GoverningPhase = "honeymoon" | "governance" | "pre-positioning" | "campaign" | "election";
export type MacroKey = "inflation" | "fxRate" | "reserves" | "debtToGdp" | "oilOutput" | "subsidyPressure";
export type CabalFocus = "economy" | "security" | "politics";

export type FuelSubsidyPosition = "full" | "partial" | "targeted" | "removed";
export type ElectricityTariffPosition = "subsidised" | "cost-reflective" | "tiered" | "market-rate";
export type FxPolicyPosition = "peg" | "managed-float" | "free-float";
export type InterestRatePosition = "accommodative" | "neutral" | "tightening" | "hawkish";
export type TaxRatePosition = "low" | "standard" | "elevated" | "high";
export type CashTransferPosition = "none" | "minimal" | "moderate" | "generous";
export type ImportTariffPosition = "open" | "moderate" | "protective" | "restrictive";
export type MinimumWagePosition = "frozen" | "modest" | "union-demand" | "populist";
export type PublicSectorHiringPosition = "freeze" | "essential-only" | "normal" | "expansion";

// ── Governance Sector Lever Positions ──
export type PowerPrivatizationPosition = "state-run" | "partial-private" | "full-private";
export type OilSectorReformPosition = "status-quo" | "pib-enforcement" | "full-deregulation";
export type TransportPriorityPosition = "roads" | "rail" | "multimodal";
export type DigitalInvestmentPosition = "minimal" | "moderate" | "aggressive";
export type HealthcareFundingPosition = "underfunded" | "basic" | "universal-push";
export type DrugProcurementPosition = "local-preference" | "open-tender" | "international-partnership";
export type UniversityAutonomyPosition = "centralized" | "partial-autonomy" | "full-autonomy";
export type EducationBudgetSplitPosition = "tertiary-heavy" | "balanced" | "basic-heavy";
export type LandReformPosition = "communal" | "mixed" | "titling-program";
export type AgricSubsidiesPosition = "none" | "input-subsidies" | "full-mechanization";
export type BorderPolicyPosition = "porous" | "standard" | "fortress";
export type NationalIdPushPosition = "voluntary" | "incentivized" | "mandatory";
export type GasFlarePolicyPosition = "tolerance" | "penalties" | "zero-flare";
export type ClimateAdaptationPosition = "minimal" | "moderate" | "aggressive";
export type NyscReformPosition = "status-quo" | "reformed" | "scrapped";
export type YouthEnterprisePosition = "minimal" | "startup-ecosystem" | "public-works";

export type PolicyLeverKey =
  | "fuelSubsidy"
  | "electricityTariff"
  | "fxPolicy"
  | "interestRate"
  | "taxRate"
  | "cashTransfers"
  | "importTariffs"
  | "minimumWage"
  | "publicSectorHiring"
  | "powerPrivatization"
  | "oilSectorReform"
  | "transportPriority"
  | "digitalInvestment"
  | "healthcareFunding"
  | "drugProcurement"
  | "universityAutonomy"
  | "educationBudgetSplit"
  | "landReform"
  | "agricSubsidies"
  | "borderPolicy"
  | "nationalIdPush"
  | "gasFlarePolicy"
  | "climateAdaptation"
  | "nyscReform"
  | "youthEnterprise";

export type AnyPolicyPosition =
  | FuelSubsidyPosition
  | ElectricityTariffPosition
  | FxPolicyPosition
  | InterestRatePosition
  | TaxRatePosition
  | CashTransferPosition
  | ImportTariffPosition
  | MinimumWagePosition
  | PublicSectorHiringPosition
  | PowerPrivatizationPosition
  | OilSectorReformPosition
  | TransportPriorityPosition
  | DigitalInvestmentPosition
  | HealthcareFundingPosition
  | DrugProcurementPosition
  | UniversityAutonomyPosition
  | EducationBudgetSplitPosition
  | LandReformPosition
  | AgricSubsidiesPosition
  | BorderPolicyPosition
  | NationalIdPushPosition
  | GasFlarePolicyPosition
  | ClimateAdaptationPosition
  | NyscReformPosition
  | YouthEnterprisePosition;

export interface SingleLeverState {
  position: AnyPolicyPosition;
  pendingPosition: AnyPolicyPosition | null;
  cooldownUntilDay: number;
}

export interface PolicyLeverState {
  fuelSubsidy: SingleLeverState;
  electricityTariff: SingleLeverState;
  fxPolicy: SingleLeverState;
  interestRate: SingleLeverState;
  taxRate: SingleLeverState;
  cashTransfers: SingleLeverState;
  importTariffs: SingleLeverState;
  minimumWage: SingleLeverState;
  publicSectorHiring: SingleLeverState;
  powerPrivatization: SingleLeverState;
  oilSectorReform: SingleLeverState;
  transportPriority: SingleLeverState;
  digitalInvestment: SingleLeverState;
  healthcareFunding: SingleLeverState;
  drugProcurement: SingleLeverState;
  universityAutonomy: SingleLeverState;
  educationBudgetSplit: SingleLeverState;
  landReform: SingleLeverState;
  agricSubsidies: SingleLeverState;
  borderPolicy: SingleLeverState;
  nationalIdPush: SingleLeverState;
  gasFlarePolicy: SingleLeverState;
  climateAdaptation: SingleLeverState;
  nyscReform: SingleLeverState;
  youthEnterprise: SingleLeverState;
}

export interface ReformProgress {
  id: string;
  progress: number; // 0-100
  turnsActive: number;
  status: "active" | "stalled" | "not-started" | "complete";
}

export interface Effect {
  target:
    | "approval"
    | "treasury"
    | "stability"
    | "outrage"
    | "trust"
    | "stress"
    | "politicalCapital"
    | "health"
    | "judicialIndependence"
    | "character"
    | "faction"
    | "governorApproval"
    | "governorLoyalty"
    | "macro"
    | "metric"
    | "policyLever"
    | "grievance";
  characterName?: string;
  factionName?: string;
  governorName?: string;
  macroKey?: MacroKey;
  leverKey?: PolicyLeverKey;
  leverPosition?: AnyPolicyPosition;
  skipCooldown?: boolean;
  delta: number;
  description: string;
}

export interface Consequence {
  id: string;
  sourceEvent: string;
  delayDays: number;
  effects: Effect[];
  description: string;
}

export interface ChoiceRequirement {
  metric:
    | "approval"
    | "treasury"
    | "stability"
    | "outrage"
    | "trust"
    | "stress"
    | "politicalCapital"
    | "health"
    | "judicialIndependence"
    | MacroKey;
  min?: number;
  max?: number;
  description?: string;
}

export interface EventChoice {
  id: string;
  label: string;
  context: string;
  requirements?: ChoiceRequirement[];
  consequences: Consequence[];
  nextStepId?: string;
  chainEnd?: boolean;
}

export interface ActiveEvent {
  id: string;
  title: string;
  severity: EventSeverity;
  description: string;
  category: "economy" | "security" | "governance" | "politics" | "diplomacy" | "media";
  source: "opening" | "contextual" | "chain" | "policy" | "faction-demand" | "cabinet-appointment" | "team-briefing" | "fec-memo" | "minister-summons" | "godfather-pressure";
  choices: EventChoice[];
  factionKey?: string;
  createdDay: number;
  expiresInDays?: number;
  policyLeverKey?: PolicyLeverKey;
  /** For cabinet-appointment events: the ministry position being filled */
  cabinetPortfolio?: string;
}

export interface QuickActionDefinition {
  id: string;
  label: string;
  icon: string;
  context: string;
  summary: string;
  consequences: Consequence[];
}

export interface Hook {
  id: string;
  target: string;
  type: "financial" | "personal" | "political" | "criminal";
  severity: "minor" | "major" | "devastating";
  description: string;
  discovered: boolean;
  usable: boolean;
  evidence: number;
  underInvestigation: boolean;
  used: boolean;
  deployed?: boolean;
  deploymentType?: "leverage" | "trade" | "blackmail";
  leverageTarget?: string;
  tradeRecipient?: string;
  blackmailDesperation?: number;
  sourceOperation?: string;
}

export interface FECMemo {
  id: string;
  ministerKey: string;
  portfolio: string;
  title: string;
  description: string;
  urgency: "routine" | "important" | "urgent";
  choices: EventChoice[];
  sectorAffected: string;
}

export interface MinisterStatus {
  lastSummonedDay: number;
  lastDirectiveDay: number;
  onProbation: boolean;
  probationStartDay: number;
  appointmentDay: number;
  pendingMemos: FECMemo[];
}

export interface CharacterState {
  name: string;
  portfolio: string;
  competencies: CharacterCompetencies;
  faction: string;
  relationship: Relationship;
  avatar: string;
  traits: string[];
  hooks: Hook[];
  biography?: string;
  education?: string;
  religion?: string;
  ethnicity?: string;
  party?: string;
  careerHistory: CareerEntry[];
  interactionLog: InteractionEntry[];
  age?: number;
  state?: string;
  gender?: string;
  title?: string;
  /** @deprecated Use competencies.personal.loyalty */
  loyalty?: number;
  /** @deprecated Use relevant professional competency */
  competence?: number;
  /** @deprecated Use competencies.personal.ambition */
  ambition?: number;
  /** @deprecated Use deriveBetrayalThreshold(competencies.personal) */
  betrayalThreshold?: number;
}

export interface FactionState {
  name: string;
  influence: number;
  loyalty: number;
  stance: "Allied" | "Cooperative" | "Neutral" | "Opposed" | "Hostile";
  grievance: number;
  firedThresholds: number[];
}

export interface EventChainInstance {
  chainId: string;
  currentStepIndex: number;
  startedDay: number;
  resolved: boolean;
}

export interface CourtCase {
  id: string;
  title: string;
  court: "Supreme Court" | "Appeal Court" | "Federal High Court" | "ECOWAS Court";
  status: "Filed" | "Hearing" | "Deliberation" | "Decided";
  plaintiff: string;
  defendant: string;
  stakes: "Low" | "Medium" | "High" | "Constitutional";
  description: string;
  daysToDecision: number;
}

export interface GovernorState {
  name: string;
  zone: string;
  party: "Ruling" | "Opposition" | "Independent";
  loyalty: number;
  competence: number;
  approval: number;
  relationship: Relationship;
  avatar: string;
  demands: string;
}

export interface TurnLogEntry {
  day: number;
  date: string;
  event: string;
  effects: string[];
  category: "decision" | "event" | "chain" | "court" | "system" | "inbox" | "quick-action" | "cabal" | "hook";
}

export interface GameInboxMessage {
  id: string;
  sender: string;
  role: string;
  initials: string;
  subject: string;
  preview: string;
  fullText: string;
  day: number;
  date?: string;
  priority: InboxPriority;
  read: boolean;
  relatedEventId?: string;
  responseOptions?: { label: string; actionId: string }[];
  source: "seed" | "system" | "decision" | "chain" | "court" | "random" | "faction-demand";
  // --- New fields for master-detail redesign ---
  respondedAction?: string;
  respondedLabel?: string;
  contextData?: {
    senderLoyalty?: number;
    relatedEventTitle?: string;
    relevantMetrics?: { label: string; value: string; color: string }[];
    factionName?: string;
  };
}

export interface DaySummary {
  day: number;
  date: string;
  headline: string;
  items: string[];
  pendingCritical: number;
}

export interface ApprovalHistoryPoint {
  day: number;
  approval: number;
}

export interface MacroEconomicState {
  inflation: number;
  fxRate: number;
  reserves: number;
  debtToGdp: number;
  oilOutput: number;
  subsidyPressure: number;
}

export interface MacroHistoryPoint extends MacroEconomicState {
  day: number;
}

export interface LegacyMilestoneRecord {
  title: string;
  date: string;
  pillar: string;
  impact: number;
  description: string;
  day: number;
}

export interface VicePresidentState {
  name: string;
  loyalty: number;
  ambition: number;
  relationship: Relationship;
  mood: "Steady" | "Restless" | "Plotting";
}

export interface CampaignPromiseState {
  id: string;
  title: string;
  category: "economy" | "security" | "governance" | "welfare";
  targetDay: number;
  progress: number;
  status: "active" | "fulfilled" | "broken";
}

export interface AppointmentState {
  office: string;
  appointee: string;
  confirmed: boolean;
}

export interface TermState {
  current: number;
  daysInOffice: number;
  daysUntilElection: number;
  daysUntilMediaChat: number;
  daysUntilFactionReport: number;
  daysUntilEconomicSnapshot: number;
  reelectionsWon: number;
  overstayDays: number;
  governingPhase: GoverningPhase;
  electionMomentum: number;
}

export interface HealthCrisisState {
  consecutiveHighStressDays: number;
  rumorsActive: boolean;
  announced: boolean;
  concealmentActive: boolean;
  recoveryTurnsRemaining: number;
}

export interface CabalChoice {
  id: string;
  label: string;
  summary: string;
  consequences: Consequence[];
}

export interface CabalMeetingState {
  day: number;
  focus: CabalFocus;
  adviser: string;
  role: string;
  title: string;
  brief: string;
  recommendedChoiceId?: string;
  resolved: boolean;
  choices: CabalChoice[];
}

export interface BriefItem {
  severity: "critical" | "warning" | "intel" | "memo";
  text: string;
  relatedEventId?: string;
}

export interface IntelligenceBriefData {
  day: number;
  executiveSummary: string;
  sections: {
    political: BriefItem[];
    economic: BriefItem[];
    security: BriefItem[];
    diplomatic: BriefItem[];
  };
  metricChanges: { label: string; from: number; to: number }[];
  dismissed: boolean;
}

export interface GameState {
  day: number;
  date: string;
  phase: "menu" | "setup" | "playing" | "victory" | "defeat";
  approval: number;
  treasury: number;
  politicalCapital: number;
  stability: number;
  presidentName: string;
  presidentOrigin: string;
  presidentTraits: string[];
  stress: number;
  presidentAge: number;
  presidentGender: string;
  presidentState: string;
  presidentEducation: string;
  presidentTitle: string;
  presidentEthnicity: string;
  presidentReligion: string;
  presidentOccupation: string;
  presidentParty: string;
  partyLoyalty: number; // 0–100, starts at 70
  politicalState: PoliticalState;
  presidentEra: string;
  vicePresident: VicePresidentState;
  constitutionalOfficers: ConstitutionalCandidate[];
  personalAssistant: string;
  campaignPromises: CampaignPromiseState[];
  appointments: AppointmentState[];
  term: TermState;
  health: number;
  healthCrisis: HealthCrisisState;
  macroEconomy: MacroEconomicState;
  macroHistory: MacroHistoryPoint[];
  cabalMeeting: CabalMeetingState | null;
  characters: Record<string, CharacterState>;
  factions: Record<string, FactionState>;
  activeChains: EventChainInstance[];
  activeEvents: ActiveEvent[];
  pendingConsequences: Consequence[];
  victoryProgress: Record<string, number>;
  failureRisks: Record<string, number>;
  outrage: number;
  trust: number;
  activeCases: CourtCase[];
  judicialIndependence: number;
  governors: GovernorState[];
  turnLog: TurnLogEntry[];
  inboxMessages: GameInboxMessage[];
  headlines: string[];
  dailySummary: DaySummary | null;
  approvalHistory: ApprovalHistoryPoint[];
  legacyMilestones: LegacyMilestoneRecord[];
  cabinetAppointments: Record<string, string | null>;
  ministerStatuses: Record<string, MinisterStatus>;
  cabinetRetreats: {
    lastRetreatDay: number;
    priorities: string[];
    lastFECDay: number;
    fecCooldownUntil: number;
    pendingFECMemos: FECMemo[];
  };
  lastActionAtDay: Record<string, number>;
  victoryPath?: string;
  defeatState?: string;
  policyLevers: PolicyLeverState;
  legislature: LegislativeState;
  patronage: PatronageState;
  federalCharacter: FederalCharacterState;
  intelligence: IntelligenceState;
  partyInternals: PartyInternalsState;
  economy: EconomicState;
  lastBriefData: IntelligenceBriefData | null;
  reforms: ReformProgress[];
  // Governance sector states
  infrastructure: GovernanceSectorState;
  healthSector: GovernanceSectorState;
  education: GovernanceSectorState;
  agriculture: GovernanceSectorState;
  interior: GovernanceSectorState;
  environment: GovernanceSectorState;
  youthEmployment: GovernanceSectorState;
  budgetAllocation: BudgetAllocation;
  internationalReputation: number;
  crossSectorEffects: CrossSectorEffects;
  crossSectorCascades: CrossSectorCascade[];
  defeatVictoryCounters: DefeatVictoryCounters;
  // ── New NPC system slices (added 2026-03-17) ──
  directors: DirectorSystemState;
  judiciary: JudiciaryState;
  unionLeaders: UnionLeaderState;
  governorSystem: GovernorSystemState;
  diplomats: DiplomatSystemState;
  military: MilitarySystemState;
  traditionalRulers: TraditionalRulerSystemState;
  religiousLeaders: ReligiousLeaderSystemState;
}

/**
 * Consecutive-turn counters used by defeat/victory condition checks.
 * These are incremented each turn the relevant condition is met, and reset when not.
 */
export interface DefeatVictoryCounters {
  /** Turns where agriculture.indicators.foodPriceIndex > 95 (defeat: famine at 3+) */
  famineTurns: number;
  /** Turns where infrastructure.indicators.powerGenerationGW < 2.0 (defeat: blackout at 5+) */
  blackoutTurns: number;
  /** Turns where 3+ sectors have crisisZone "red" (defeat: governance crisis at 4+) */
  governanceCrisisTurns: number;
  /** Turns where economy.gdpGrowthRate > 0 (victory: economic titan at 12+) */
  gdpGrowthPositiveTurns: number;
}

export interface SaveGameData {
  version: number;
  exportedAt: string;
  state: GameState;
}
