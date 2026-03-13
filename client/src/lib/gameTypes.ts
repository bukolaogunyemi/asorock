export type Relationship = "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
export type EventSeverity = "critical" | "warning" | "info";
export type InboxPriority = "Normal" | "Urgent" | "Critical";
export type DifficultyId = "easy" | "standard" | "hard" | "nightmare";
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

export type PolicyLeverKey =
  | "fuelSubsidy"
  | "electricityTariff"
  | "fxPolicy"
  | "interestRate"
  | "taxRate"
  | "cashTransfers"
  | "importTariffs"
  | "minimumWage"
  | "publicSectorHiring";

export type AnyPolicyPosition =
  | FuelSubsidyPosition
  | ElectricityTariffPosition
  | FxPolicyPosition
  | InterestRatePosition
  | TaxRatePosition
  | CashTransferPosition
  | ImportTariffPosition
  | MinimumWagePosition
  | PublicSectorHiringPosition;

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
    | "policyLever";
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
  source: "opening" | "contextual" | "chain" | "policy";
  choices: EventChoice[];
  createdDay: number;
  expiresInDays?: number;
  policyLeverKey?: PolicyLeverKey;
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
}

export interface CharacterState {
  name: string;
  portfolio: string;
  loyalty: number;
  competence: number;
  ambition: number;
  faction: string;
  relationship: Relationship;
  avatar: string;
  traits: string[];
  betrayalThreshold: number;
  hooks: Hook[];
}

export interface FactionState {
  name: string;
  influence: number;
  loyalty: number;
  stance: "Allied" | "Cooperative" | "Neutral" | "Opposed" | "Hostile";
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
  priority: InboxPriority;
  read: boolean;
  relatedEventId?: string;
  source: "seed" | "system" | "decision" | "chain" | "court" | "random";
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

export interface DifficultyState {
  id: DifficultyId;
  approvalMult: number;
  crisisFreqMult: number;
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
  presidentParty: string;
  presidentEra: string;
  vicePresident: VicePresidentState;
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
  difficulty: DifficultyState;
  lastActionAtDay: Record<string, number>;
  victoryPath?: string;
  defeatState?: string;
  policyLevers: PolicyLeverState;
}

export interface SaveGameData {
  version: number;
  exportedAt: string;
  state: GameState;
}
