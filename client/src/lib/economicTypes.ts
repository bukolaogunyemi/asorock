// client/src/lib/economicTypes.ts
export type SectorId = "oil" | "agriculture" | "manufacturing" | "services" | "tourism";

export type CascadeType =
  | "inflation-fx-spiral"
  | "unemployment-security-tourism"
  | "debt-austerity-recession"
  | "oil-fiscal-arrears"
  | "currency-manufacturing-unemployment";

export interface PolicyModifier {
  source: string;
  effect: number;
  duration: number;
}

export interface SectorState {
  id: SectorId;
  name: string;
  gdpShare: number;
  gdpValue: number;
  growthRate: number;
  employmentWeight: number;
  momentum: number;
  policyModifiers: PolicyModifier[];
}

export interface RevenueState {
  total: number;
  oil: number;
  tax: number;
  igr: number;
  trade: number;
  borrowing: number;
}

export interface ExpenditureState {
  total: number;
  recurrent: number;
  capital: number;
  debtServicing: number;
  transfers: number;
}

export interface CrisisIndicators {
  inflationZone: "green" | "yellow" | "red";
  unemploymentZone: "green" | "yellow" | "red";
  fxZone: "green" | "yellow" | "red";
  debtZone: "green" | "yellow" | "red";
  treasuryZone: "green" | "yellow" | "red";
  oilOutputZone: "green" | "yellow" | "red";
}

export interface CascadeEvent {
  id: string;
  type: CascadeType;
  triggerMetric: string;
  affectedMetrics: string[];
  turnsActive: number;
  severity: number;
  resolved: boolean;
}

export interface EconomicSnapshot {
  day: number;
  gdp: number;
  sectorGdpValues: Record<SectorId, number>;
  unemploymentRate: number;
  inflation: number;
  fxRate: number;
  treasuryLiquidity: number;
  debtToGdp: number;
  oilOutput: number;
}

export interface EconomicState {
  gdp: number;
  sectors: SectorState[];
  gdpGrowthRate: number;
  unemploymentRate: number;
  revenue: RevenueState;
  expenditure: ExpenditureState;
  treasuryLiquidity: number;
  treasuryMonthsOfCover: number;
  inflation: number;
  fxRate: number;
  fxRateBaseline: number;
  reserves: number;
  debtToGdp: number;
  oilOutput: number;
  subsidyPressure: number;
  crisisIndicators: CrisisIndicators;
  activeCascades: CascadeEvent[];
  history: EconomicSnapshot[];
}
