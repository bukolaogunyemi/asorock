// Aso Rock — Game State Data
import type { AnyPolicyPosition, PolicyLeverKey } from "./gameTypes";
import {
  cabinetRoster as hcCabinetRoster,
  cabinetCandidates as hcCabinetCandidates,
  keyCharacters as hcKeyCharacters,
} from "./handcraftedCharacters";

// ── Approval ──────────────────────────────────────────────
export const approval = { approve: 43, disapprove: 49, undecided: 8 } as const;

// ── Day-based Indicator Series (D1–D42) ──────────────────
export const days = ["D1","D4","D7","D11","D14","D18","D21","D25","D28","D32","D35","D42"] as const;

export const indicatorSeries: { week: string; inflation: number; fx: number; approval: number }[] = [
  { week: "D1", inflation: 28.1, fx: 152, approval: 48 },
  { week: "D4", inflation: 28.6, fx: 154, approval: 47 },
  { week: "D7", inflation: 29.2, fx: 155, approval: 47 },
  { week: "D11", inflation: 29.9, fx: 157, approval: 46 },
  { week: "D14", inflation: 30.4, fx: 159, approval: 46 },
  { week: "D18", inflation: 30.8, fx: 160, approval: 45 },
  { week: "D21", inflation: 31.2, fx: 162, approval: 45 },
  { week: "D25", inflation: 31.7, fx: 163, approval: 44 },
  { week: "D28", inflation: 32.1, fx: 165, approval: 44 },
  { week: "D32", inflation: 32.8, fx: 167, approval: 44 },
  { week: "D35", inflation: 33.2, fx: 168, approval: 43 },
  { week: "D42", inflation: 33.7, fx: 170, approval: 43 },
];

// ── Budget Allocation (₦ Trillions) ─────────────────────
export const budgetAllocation: { sector: string; amount: number }[] = [
  { sector: "Security", amount: 3.4 },
  { sector: "Education", amount: 2.1 },
  { sector: "Health", amount: 1.5 },
  { sector: "Infrastructure", amount: 2.8 },
  { sector: "Debt Service", amount: 6.2 },
  { sector: "Transfers", amount: 1.2 },
];

// ── Regional Approval ────────────────────────────────────
export const regionalApproval: { region: string; approval: number }[] = [
  { region: "North-West", approval: 39 },
  { region: "North-East", approval: 41 },
  { region: "North-Central", approval: 44 },
  { region: "South-West", approval: 52 },
  { region: "South-East", approval: 33 },
  { region: "South-South", approval: 45 },
];

// ── Risk Radar ───────────────────────────────────────────
export const riskRadar: { axis: string; value: number }[] = [
  { axis: "Inflation", value: 8.5 },
  { axis: "FX Stability", value: 7.8 },
  { axis: "Security", value: 7.2 },
  { axis: "Power Supply", value: 6.9 },
  { axis: "Anti-Corruption", value: 6.1 },
  { axis: "Legislative Ctrl", value: 6.6 },
  { axis: "Youth Trust", value: 7.4 },
  { axis: "State Relations", value: 6.0 },
];

// ── Cabinet Roster ───────────────────────────────────────
export interface Minister {
  name: string;
  portfolio: string;
  loyalty: number;
  competence: number;
  ambition: number;
  faction: string;
  scandalRisk: "Low" | "Medium" | "High";
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
  avatar: string;
  age?: number;
  state?: string;
  gender?: string;
}

export const cabinetRoster: Minister[] = hcCabinetRoster;

// ── Ministry Positions & Candidates ─────────────────────
export const ministryPositions = [
  "Finance", "Petroleum", "Trade & Investment",
  "Health", "Education", "Youth Development", "Labour & Employment",
  "Works & Housing", "Power", "Communications & Digital Economy",
  "Defence", "Justice", "Interior", "Foreign Affairs",
  "Agriculture & Rural Development", "Environment",
] as const;

export type MinistryPosition = (typeof ministryPositions)[number];

export interface CabinetCandidate extends Minister {
  tradeOff: string;
}

/** Each portfolio has 2-3 candidates. The first matches the original cabinetRoster entry. */
export const cabinetCandidates: Partial<Record<MinistryPosition, CabinetCandidate[]>> = hcCabinetCandidates;

// ── Factions ─────────────────────────────────────────────
export const factions: { name: string; influence: number }[] = [
  { name: "Northern Caucus", influence: 28 },
  { name: "South-West Alliance", influence: 22 },
  { name: "South-East Bloc", influence: 14 },
  { name: "Presidential Guard", influence: 18 },
  { name: "Military Circle", influence: 8 },
  { name: "Technocrats", influence: 6 },
  { name: "Youth Movement", influence: 4 },
];

// ── Key Characters ───────────────────────────────────────
export interface Character {
  name: string;
  portfolio: string;
  agenda: string;
  opinion: string;
  loyalty: number;
  competence: number;
  ambition: number;
  faction: string;
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
  avatar: string;
  age?: number;
  state?: string;
  gender?: string;
}

export const characters: Character[] = hcKeyCharacters;

// ── Intrigue Plots ───────────────────────────────────────
export interface IntriguePlot {
  name: string;
  mastermind: string;
  heat: number;
  evidence: number;
  potentialDamage: "Low" | "Medium" | "High" | "Critical";
}

export const intriguePlots: IntriguePlot[] = [
  { name: "Senate Budget Rider", mastermind: "Sen. Rotimi Balogun", heat: 65, evidence: 40, potentialDamage: "High" },
  { name: "Governors' Fiscal Revolt", mastermind: "Gov. Sani Lapai", heat: 50, evidence: 30, potentialDamage: "Critical" },
  { name: "Party Leadership Challenge", mastermind: "Chief Ugochukwu Mbah", heat: 72, evidence: 55, potentialDamage: "High" },
  { name: "Labour Strike Threat", mastermind: "Comrade Mwuese Tarka", heat: 80, evidence: 70, potentialDamage: "Medium" },
];

// ── Economy Macro Table ──────────────────────────────────
export const macroMetrics: { metric: string; value: string; trend: "up" | "down" | "stable"; note: string }[] = [
  { metric: "GDP Growth (Q4 ann.)", value: "2.8%", trend: "down", note: "Below 3% target" },
  { metric: "Inflation (YoY)", value: "33.7%", trend: "up", note: "Highest since 2005" },
  { metric: "FX Rate (₦/USD)", value: "₦1,702", trend: "up", note: "Parallel market ₦1,850" },
  { metric: "Oil Production", value: "1.42 mbpd", trend: "stable", note: "OPEC+ quota: 1.58" },
  { metric: "External Reserves", value: "$33.2B", trend: "down", note: "4.8 months import cover" },
  { metric: "Public Debt / GDP", value: "42.3%", trend: "up", note: "IMF threshold: 40%" },
];

// ── Markets Time Series ──────────────────────────────────
export const marketsSeries: { week: string; reserves: number; oilPrice: number }[] = [
  { week: "D1", reserves: 35.1, oilPrice: 82 },
  { week: "D4", reserves: 34.8, oilPrice: 80 },
  { week: "D7", reserves: 34.5, oilPrice: 79 },
  { week: "D11", reserves: 34.2, oilPrice: 78 },
  { week: "D14", reserves: 34.0, oilPrice: 77 },
  { week: "D18", reserves: 33.8, oilPrice: 76 },
  { week: "D21", reserves: 33.6, oilPrice: 75 },
  { week: "D25", reserves: 33.5, oilPrice: 74 },
  { week: "D28", reserves: 33.4, oilPrice: 73 },
  { week: "D32", reserves: 33.3, oilPrice: 72 },
  { week: "D35", reserves: 33.2, oilPrice: 71 },
  { week: "D42", reserves: 33.2, oilPrice: 70 },
];

// ── Revenue Mix ──────────────────────────────────────────
export const revenueMix: { source: string; pct: number }[] = [
  { source: "Oil", pct: 41 },
  { source: "VAT", pct: 18 },
  { source: "Customs", pct: 14 },
  { source: "CIT", pct: 12 },
  { source: "Other", pct: 15 },
];

// ── Policy Lever Definitions ─────────────────────────────

export interface PolicyModifiers {
  inflation: number;
  fxRate: number;
  reserves: number;
  debtToGdp: number;
  subsidyPressure: number;
  approval: number;
  treasury: number;
  trust: number;
}

export interface PolicyLeverDef {
  displayName: string;
  positions: { value: AnyPolicyPosition; label: string }[];
  zeroImpactPosition: AnyPolicyPosition;
  modifiers: Record<string, PolicyModifiers>;
}

export const POLICY_MODIFIER_SCALE = 1.0;
export const POLICY_COOLDOWN_DAYS = 14;

export const POLICY_LEVER_DEFS: Record<PolicyLeverKey, PolicyLeverDef> = {
  fuelSubsidy: {
    displayName: "Fuel Subsidy",
    positions: [
      { value: "full", label: "Full subsidy" },
      { value: "partial", label: "Partial removal" },
      { value: "targeted", label: "Targeted only" },
      { value: "removed", label: "Fully removed" },
    ],
    zeroImpactPosition: "targeted",
    modifiers: {
      full:     { inflation: 0.8, fxRate: 0, reserves: -0.3, debtToGdp: 0.3, subsidyPressure: 4.0, approval: 3, treasury: -0.15, trust: 0 },
      partial:  { inflation: 0.3, fxRate: 0, reserves: -0.1, debtToGdp: 0.1, subsidyPressure: 1.5, approval: 1, treasury: -0.05, trust: 0 },
      targeted: { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      removed:  { inflation: -0.5, fxRate: 0, reserves: 0.3, debtToGdp: -0.3, subsidyPressure: -3.5, approval: -6, treasury: 0.10, trust: 2 },
    },
  },
  electricityTariff: {
    displayName: "Electricity Tariff",
    positions: [
      { value: "subsidised", label: "Subsidised" },
      { value: "cost-reflective", label: "Cost-reflective" },
      { value: "tiered", label: "Tiered pricing" },
      { value: "market-rate", label: "Market rate" },
    ],
    zeroImpactPosition: "cost-reflective",
    modifiers: {
      subsidised:         { inflation: 0.4, fxRate: 0, reserves: -0.2, debtToGdp: 0.2, subsidyPressure: 2.0, approval: 2, treasury: -0.08, trust: 0 },
      "cost-reflective":  { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      tiered:             { inflation: -0.1, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: -0.5, approval: -1, treasury: 0.04, trust: 1 },
      "market-rate":      { inflation: -0.3, fxRate: 0, reserves: 0.15, debtToGdp: -0.15, subsidyPressure: -1.5, approval: -5, treasury: 0.07, trust: 2 },
    },
  },
  fxPolicy: {
    displayName: "FX Policy",
    positions: [
      { value: "peg", label: "Fixed peg" },
      { value: "managed-float", label: "Managed float" },
      { value: "free-float", label: "Free float" },
    ],
    zeroImpactPosition: "managed-float",
    modifiers: {
      peg:              { inflation: -0.3, fxRate: -80, reserves: -0.6, debtToGdp: 0.2, subsidyPressure: 0, approval: 2, treasury: -0.08, trust: -1 },
      "managed-float":  { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "free-float":     { inflation: 0.4, fxRate: 60, reserves: 0.3, debtToGdp: -0.1, subsidyPressure: 0, approval: -3, treasury: 0.04, trust: 3 },
    },
  },
  interestRate: {
    displayName: "Interest Rate (CBN)",
    positions: [
      { value: "accommodative", label: "Accommodative" },
      { value: "neutral", label: "Neutral" },
      { value: "tightening", label: "Tightening" },
      { value: "hawkish", label: "Hawkish" },
    ],
    zeroImpactPosition: "neutral",
    modifiers: {
      accommodative: { inflation: 0.6, fxRate: 20, reserves: 0, debtToGdp: 0.2, subsidyPressure: 0, approval: 1, treasury: 0.03, trust: -1 },
      neutral:       { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      tightening:    { inflation: -0.4, fxRate: -15, reserves: 0.1, debtToGdp: -0.1, subsidyPressure: 0, approval: -1, treasury: -0.02, trust: 1 },
      hawkish:       { inflation: -0.8, fxRate: -30, reserves: 0.2, debtToGdp: -0.2, subsidyPressure: 0, approval: -3, treasury: -0.05, trust: 2 },
    },
  },
  taxRate: {
    displayName: "Tax Rate (VAT)",
    positions: [
      { value: "low", label: "Low" },
      { value: "standard", label: "Standard" },
      { value: "elevated", label: "Elevated" },
      { value: "high", label: "High" },
    ],
    zeroImpactPosition: "standard",
    modifiers: {
      low:      { inflation: 0.1, fxRate: 0, reserves: 0, debtToGdp: 0.3, subsidyPressure: 0, approval: 2, treasury: -0.08, trust: 0 },
      standard: { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      elevated: { inflation: -0.1, fxRate: 0, reserves: 0, debtToGdp: -0.15, subsidyPressure: 0, approval: -2, treasury: 0.06, trust: 0 },
      high:     { inflation: -0.2, fxRate: 0, reserves: 0, debtToGdp: -0.3, subsidyPressure: 0, approval: -5, treasury: 0.12, trust: 1 },
    },
  },
  cashTransfers: {
    displayName: "Cash Transfers",
    positions: [
      { value: "none", label: "None" },
      { value: "minimal", label: "Minimal" },
      { value: "moderate", label: "Moderate" },
      { value: "generous", label: "Generous" },
    ],
    zeroImpactPosition: "minimal",
    modifiers: {
      none:     { inflation: -0.2, fxRate: 0, reserves: 0.1, debtToGdp: -0.1, subsidyPressure: -1.0, approval: -4, treasury: 0.06, trust: -1 },
      minimal:  { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      moderate: { inflation: 0.2, fxRate: 0, reserves: -0.1, debtToGdp: 0.15, subsidyPressure: 1.0, approval: 3, treasury: -0.06, trust: 1 },
      generous: { inflation: 0.5, fxRate: 0, reserves: -0.3, debtToGdp: 0.3, subsidyPressure: 2.5, approval: 5, treasury: -0.12, trust: 1 },
    },
  },
  importTariffs: {
    displayName: "Import Tariffs",
    positions: [
      { value: "open", label: "Open" },
      { value: "moderate", label: "Moderate" },
      { value: "protective", label: "Protective" },
      { value: "restrictive", label: "Restrictive" },
    ],
    zeroImpactPosition: "moderate",
    modifiers: {
      open:        { inflation: 0.1, fxRate: 15, reserves: -0.1, debtToGdp: 0, subsidyPressure: -0.5, approval: -2, treasury: -0.03, trust: 2 },
      moderate:    { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      protective:  { inflation: -0.1, fxRate: -10, reserves: 0.05, debtToGdp: 0, subsidyPressure: 0.3, approval: 1, treasury: 0.02, trust: 0 },
      restrictive: { inflation: -0.3, fxRate: -25, reserves: 0.1, debtToGdp: 0, subsidyPressure: 1.0, approval: 2, treasury: 0.05, trust: -1 },
    },
  },
  minimumWage: {
    displayName: "Minimum Wage",
    positions: [
      { value: "frozen", label: "Frozen" },
      { value: "modest", label: "Modest increase" },
      { value: "union-demand", label: "Union demand" },
      { value: "populist", label: "Populist raise" },
    ],
    zeroImpactPosition: "modest",
    modifiers: {
      frozen:         { inflation: 0, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: 0.5, approval: -4, treasury: 0.04, trust: -1 },
      modest:         { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "union-demand": { inflation: 0.3, fxRate: 0, reserves: -0.1, debtToGdp: 0.15, subsidyPressure: 0.5, approval: 3, treasury: -0.06, trust: 1 },
      populist:       { inflation: 0.6, fxRate: 0, reserves: -0.2, debtToGdp: 0.3, subsidyPressure: 1.5, approval: 6, treasury: -0.12, trust: 0 },
    },
  },
  publicSectorHiring: {
    displayName: "Public Sector Hiring",
    positions: [
      { value: "freeze", label: "Hiring freeze" },
      { value: "essential-only", label: "Essential only" },
      { value: "normal", label: "Normal recruitment" },
      { value: "expansion", label: "Expansion drive" },
    ],
    zeroImpactPosition: "normal",
    modifiers: {
      freeze:           { inflation: -0.1, fxRate: 0, reserves: 0.1, debtToGdp: -0.1, subsidyPressure: 0, approval: -3, treasury: 0.05, trust: 1 },
      "essential-only": { inflation: 0, fxRate: 0, reserves: 0.03, debtToGdp: -0.03, subsidyPressure: 0, approval: -1, treasury: 0.02, trust: 0 },
      normal:           { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      expansion:        { inflation: 0.2, fxRate: 0, reserves: -0.1, debtToGdp: 0.15, subsidyPressure: 0, approval: 2, treasury: -0.06, trust: -1 },
    },
  },
  powerPrivatization: {
    displayName: "Power Sector Privatisation",
    positions: [
      { value: "state-run", label: "State-run" },
      { value: "partial-private", label: "Partial private" },
      { value: "full-private", label: "Full privatisation" },
    ],
    zeroImpactPosition: "partial-private",
    modifiers: {
      "state-run":      { inflation: 0.1, fxRate: 0, reserves: -0.1, debtToGdp: 0.2, subsidyPressure: 2.0, approval: 1, treasury: -0.06, trust: 0 },
      "partial-private":{ inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "full-private":   { inflation: -0.2, fxRate: 0, reserves: 0.1, debtToGdp: -0.15, subsidyPressure: -1.5, approval: -3, treasury: 0.05, trust: 1 },
    },
  },
  oilSectorReform: {
    displayName: "Oil Sector Reform",
    positions: [
      { value: "status-quo", label: "Status quo" },
      { value: "pib-enforcement", label: "PIB enforcement" },
      { value: "full-deregulation", label: "Full deregulation" },
    ],
    zeroImpactPosition: "pib-enforcement",
    modifiers: {
      "status-quo":        { inflation: 0, fxRate: 0, reserves: -0.2, debtToGdp: 0.1, subsidyPressure: 1.5, approval: 1, treasury: -0.05, trust: -1 },
      "pib-enforcement":   { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "full-deregulation": { inflation: 0.2, fxRate: 10, reserves: 0.2, debtToGdp: -0.2, subsidyPressure: -2.0, approval: -4, treasury: 0.08, trust: 2 },
    },
  },
  transportPriority: {
    displayName: "Transport Priority",
    positions: [
      { value: "roads", label: "Roads focus" },
      { value: "rail", label: "Rail focus" },
      { value: "multimodal", label: "Multimodal" },
    ],
    zeroImpactPosition: "multimodal",
    modifiers: {
      roads:       { inflation: -0.1, fxRate: 0, reserves: -0.05, debtToGdp: 0.1, subsidyPressure: 0, approval: 2, treasury: -0.04, trust: 0 },
      rail:        { inflation: -0.1, fxRate: 0, reserves: -0.1, debtToGdp: 0.15, subsidyPressure: 0, approval: 1, treasury: -0.06, trust: 1 },
      multimodal:  { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
    },
  },
  digitalInvestment: {
    displayName: "Digital Investment",
    positions: [
      { value: "minimal", label: "Minimal" },
      { value: "moderate", label: "Moderate" },
      { value: "aggressive", label: "Aggressive" },
    ],
    zeroImpactPosition: "moderate",
    modifiers: {
      minimal:    { inflation: 0, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: 0, approval: -1, treasury: 0.03, trust: -1 },
      moderate:   { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      aggressive: { inflation: 0.1, fxRate: 0, reserves: -0.1, debtToGdp: 0.1, subsidyPressure: 0, approval: 2, treasury: -0.05, trust: 1 },
    },
  },
  healthcareFunding: {
    displayName: "Healthcare Funding",
    positions: [
      { value: "underfunded", label: "Underfunded" },
      { value: "basic", label: "Basic provision" },
      { value: "universal-push", label: "Universal push" },
    ],
    zeroImpactPosition: "basic",
    modifiers: {
      underfunded:      { inflation: 0, fxRate: 0, reserves: 0.1, debtToGdp: -0.1, subsidyPressure: 0, approval: -4, treasury: 0.05, trust: -1 },
      basic:            { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "universal-push": { inflation: 0.2, fxRate: 0, reserves: -0.1, debtToGdp: 0.2, subsidyPressure: 1.0, approval: 4, treasury: -0.07, trust: 1 },
    },
  },
  drugProcurement: {
    displayName: "Drug Procurement",
    positions: [
      { value: "local-preference", label: "Local preference" },
      { value: "open-tender", label: "Open tender" },
      { value: "international-partnership", label: "International partnership" },
    ],
    zeroImpactPosition: "open-tender",
    modifiers: {
      "local-preference":           { inflation: 0.1, fxRate: 0, reserves: 0, debtToGdp: 0.05, subsidyPressure: 0.5, approval: 1, treasury: -0.02, trust: 0 },
      "open-tender":                { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "international-partnership":  { inflation: -0.1, fxRate: 0, reserves: -0.05, debtToGdp: 0, subsidyPressure: -0.5, approval: 1, treasury: -0.01, trust: 1 },
    },
  },
  universityAutonomy: {
    displayName: "University Autonomy",
    positions: [
      { value: "centralized", label: "Centralised" },
      { value: "partial-autonomy", label: "Partial autonomy" },
      { value: "full-autonomy", label: "Full autonomy" },
    ],
    zeroImpactPosition: "partial-autonomy",
    modifiers: {
      centralized:       { inflation: 0, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: 0.5, approval: -1, treasury: 0.02, trust: -1 },
      "partial-autonomy":{ inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "full-autonomy":   { inflation: 0, fxRate: 0, reserves: -0.05, debtToGdp: 0.05, subsidyPressure: -0.5, approval: 1, treasury: -0.02, trust: 1 },
    },
  },
  educationBudgetSplit: {
    displayName: "Education Budget Split",
    positions: [
      { value: "tertiary-heavy", label: "Tertiary-heavy" },
      { value: "balanced", label: "Balanced" },
      { value: "basic-heavy", label: "Basic-heavy" },
    ],
    zeroImpactPosition: "balanced",
    modifiers: {
      "tertiary-heavy": { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      balanced:         { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "basic-heavy":    { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 1, treasury: 0, trust: 0 },
    },
  },
  landReform: {
    displayName: "Land Reform",
    positions: [
      { value: "communal", label: "Communal tenure" },
      { value: "mixed", label: "Mixed system" },
      { value: "titling-program", label: "Titling programme" },
    ],
    zeroImpactPosition: "mixed",
    modifiers: {
      communal:          { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 1, treasury: 0, trust: 0 },
      mixed:             { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "titling-program": { inflation: -0.1, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: 0, approval: 1, treasury: -0.02, trust: 1 },
    },
  },
  agricSubsidies: {
    displayName: "Agricultural Subsidies",
    positions: [
      { value: "none", label: "None" },
      { value: "input-subsidies", label: "Input subsidies" },
      { value: "full-mechanization", label: "Full mechanisation" },
    ],
    zeroImpactPosition: "input-subsidies",
    modifiers: {
      none:                { inflation: 0.2, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: -1.0, approval: -3, treasury: 0.04, trust: -1 },
      "input-subsidies":   { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "full-mechanization":{ inflation: -0.2, fxRate: 0, reserves: -0.1, debtToGdp: 0.15, subsidyPressure: 1.0, approval: 3, treasury: -0.06, trust: 1 },
    },
  },
  borderPolicy: {
    displayName: "Border Policy",
    positions: [
      { value: "porous", label: "Porous" },
      { value: "standard", label: "Standard" },
      { value: "fortress", label: "Fortress" },
    ],
    zeroImpactPosition: "standard",
    modifiers: {
      porous:   { inflation: 0.1, fxRate: 5, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: -1, treasury: -0.01, trust: -1 },
      standard: { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      fortress: { inflation: -0.1, fxRate: -5, reserves: 0.05, debtToGdp: 0, subsidyPressure: 0, approval: 1, treasury: 0.02, trust: 1 },
    },
  },
  nationalIdPush: {
    displayName: "National ID Push",
    positions: [
      { value: "voluntary", label: "Voluntary" },
      { value: "incentivized", label: "Incentivised" },
      { value: "mandatory", label: "Mandatory" },
    ],
    zeroImpactPosition: "incentivized",
    modifiers: {
      voluntary:    { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      incentivized: { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      mandatory:    { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: -1, treasury: -0.01, trust: -1 },
    },
  },
  gasFlarePolicy: {
    displayName: "Gas Flare Policy",
    positions: [
      { value: "tolerance", label: "Tolerance" },
      { value: "penalties", label: "Penalties" },
      { value: "zero-flare", label: "Zero-flare mandate" },
    ],
    zeroImpactPosition: "penalties",
    modifiers: {
      tolerance:   { inflation: 0, fxRate: 0, reserves: 0.05, debtToGdp: 0, subsidyPressure: 0, approval: -1, treasury: 0.02, trust: -1 },
      penalties:   { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "zero-flare":{ inflation: 0, fxRate: 0, reserves: -0.05, debtToGdp: 0.05, subsidyPressure: 0, approval: 1, treasury: -0.02, trust: 1 },
    },
  },
  climateAdaptation: {
    displayName: "Climate Adaptation",
    positions: [
      { value: "minimal", label: "Minimal" },
      { value: "moderate", label: "Moderate" },
      { value: "aggressive", label: "Aggressive" },
    ],
    zeroImpactPosition: "moderate",
    modifiers: {
      minimal:    { inflation: 0, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: 0, approval: -1, treasury: 0.02, trust: -1 },
      moderate:   { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      aggressive: { inflation: 0, fxRate: 0, reserves: -0.1, debtToGdp: 0.1, subsidyPressure: 0, approval: 2, treasury: -0.04, trust: 1 },
    },
  },
  nyscReform: {
    displayName: "NYSC Reform",
    positions: [
      { value: "status-quo", label: "Status quo" },
      { value: "reformed", label: "Reformed scheme" },
      { value: "scrapped", label: "Scrapped" },
    ],
    zeroImpactPosition: "reformed",
    modifiers: {
      "status-quo": { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      reformed:     { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 1, treasury: -0.01, trust: 1 },
      scrapped:     { inflation: 0, fxRate: 0, reserves: 0.02, debtToGdp: -0.02, subsidyPressure: -0.5, approval: -2, treasury: 0.02, trust: -1 },
    },
  },
  youthEnterprise: {
    displayName: "Youth Enterprise",
    positions: [
      { value: "minimal", label: "Minimal support" },
      { value: "startup-ecosystem", label: "Startup ecosystem" },
      { value: "public-works", label: "Public works" },
    ],
    zeroImpactPosition: "startup-ecosystem",
    modifiers: {
      minimal:             { inflation: 0, fxRate: 0, reserves: 0.05, debtToGdp: -0.05, subsidyPressure: 0, approval: -2, treasury: 0.03, trust: -1 },
      "startup-ecosystem": { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 },
      "public-works":      { inflation: 0.1, fxRate: 0, reserves: -0.05, debtToGdp: 0.1, subsidyPressure: 0.5, approval: 3, treasury: -0.04, trust: 0 },
    },
  },
};

// ── Security Threat Radar ────────────────────────────────
export const securityThreats: { threat: string; severity: number }[] = [
  { threat: "Banditry (NW)", severity: 8.8 },
  { threat: "Boko Haram (NE)", severity: 7.5 },
  { threat: "Kidnapping", severity: 7.2 },
  { threat: "Piracy (GoG)", severity: 5.5 },
  { threat: "Farmer-Herder", severity: 6.8 },
  { threat: "IPOB (SE)", severity: 6.2 },
  { threat: "Oil Theft", severity: 7.0 },
  { threat: "Cyber Crime", severity: 4.5 },
];

// ── Security Theaters ────────────────────────────────────
export interface TheaterRow {
  zone: string;
  opName: string;
  troops: string;
  status: "Active" | "Standby" | "Escalated";
  effectiveness: number;
}

export const securityTheaters: TheaterRow[] = [
  { zone: "North-West", opName: "Op. Hadarin Daji", troops: "12,000", status: "Escalated", effectiveness: 42 },
  { zone: "North-East", opName: "Op. Hadin Kai", troops: "28,000", status: "Active", effectiveness: 61 },
  { zone: "North-Central", opName: "Op. Safe Haven", troops: "6,500", status: "Active", effectiveness: 55 },
  { zone: "South-East", opName: "Op. UDO KA", troops: "8,000", status: "Active", effectiveness: 48 },
  { zone: "South-South", opName: "Op. Delta Safe", troops: "9,200", status: "Active", effectiveness: 52 },
  { zone: "Gulf of Guinea", opName: "Op. Calm Waters", troops: "3,500", status: "Standby", effectiveness: 68 },
];

// ── Security Incidents per Week ──────────────────────────
export const securityIncidents: { week: string; nw: number; ne: number }[] = [
  { week: "D1", nw: 12, ne: 8 },
  { week: "D4", nw: 15, ne: 7 },
  { week: "D7", nw: 14, ne: 9 },
  { week: "D11", nw: 18, ne: 6 },
  { week: "D14", nw: 20, ne: 8 },
  { week: "D18", nw: 17, ne: 10 },
  { week: "D21", nw: 22, ne: 7 },
  { week: "D25", nw: 19, ne: 9 },
  { week: "D28", nw: 25, ne: 8 },
  { week: "D32", nw: 23, ne: 11 },
  { week: "D35", nw: 28, ne: 9 },
  { week: "D42", nw: 30, ne: 10 },
];

// ── Diplomacy ────────────────────────────────────────────
export interface DiplomacyPartner {
  partner: string;
  relation: "Strong" | "Neutral" | "Strained" | "Tense";
  tradeVol: string;
  keyIssue: string;
}

export const diplomacyRelations: DiplomacyPartner[] = [
  { partner: "United States", relation: "Neutral", tradeVol: "$8.2B", keyIssue: "Security cooperation & governance" },
  { partner: "China", relation: "Strong", tradeVol: "$12.4B", keyIssue: "Infrastructure loans & debt terms" },
  { partner: "United Kingdom", relation: "Neutral", tradeVol: "$5.1B", keyIssue: "Anti-corruption & asset recovery" },
  { partner: "ECOWAS", relation: "Strained", tradeVol: "$3.8B", keyIssue: "Niger crisis & regional leadership" },
  { partner: "Saudi Arabia", relation: "Strong", tradeVol: "$2.1B", keyIssue: "OPEC+ production quotas" },
  { partner: "France", relation: "Tense", tradeVol: "$1.9B", keyIssue: "Sahel influence competition" },
];

export interface TradeDeal {
  deal: string;
  partner: string;
  value: string;
  status: "Negotiating" | "Pending Approval" | "Signed" | "Stalled";
}

export const tradePipeline: TradeDeal[] = [
  { deal: "Kaduna Mega Refinery Export Pact", partner: "EU", value: "$2.8B", status: "Negotiating" },
  { deal: "Rail Corridor Expansion", partner: "China", value: "$4.5B", status: "Pending Approval" },
  { deal: "LNG Long-Term Supply", partner: "Germany", value: "$3.2B", status: "Signed" },
  { deal: "Agri-Tech Partnership", partner: "Brazil", value: "$800M", status: "Stalled" },
];

// ── Diplomacy Key Personnel ─────────────────────────────
export interface DiplomacyPersonnel {
  name: string;
  title: string;
  shortTitle: string;
  loyalty: number;
  competence: number;
  tenure: string;
  note: string;
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
  avatar: string;
  age?: number;
  state?: string;
  gender?: string;
}

export const diplomacyPersonnel: DiplomacyPersonnel[] = [
  { name: "Amb. Ibrahim Garba", title: "Minister of Foreign Affairs", shortTitle: "Foreign", loyalty: 72, competence: 78, tenure: "Since Aug 2023", note: "Career diplomat. Managing ECOWAS crisis and US relations reset.", relationship: "Friendly", avatar: "IG", age: 59, state: "Bauchi", gender: "Male" },
  { name: "Amb. Folasade Akinwale", title: "Perm Rep to UN", shortTitle: "UN Rep", loyalty: 68, competence: 82, tenure: "Since Sep 2023", note: "Strong multilateral credentials. Key to IMF/World Bank engagement.", relationship: "Neutral", avatar: "FA", age: 55, state: "Lagos", gender: "Female" },
  { name: "Alhaji Murtala Ringim", title: "MoS Foreign Affairs (Diaspora)", shortTitle: "Diaspora", loyalty: 80, competence: 65, tenure: "Since May 2023", note: "Northern Caucus link. Manages diaspora remittance policy.", relationship: "Friendly", avatar: "MR", age: 63, state: "Niger", gender: "Male" },
  { name: "Amb. Chioma Ezeigbo", title: "Ambassador to Spain & EU Trade Lead", shortTitle: "EU Envoy", loyalty: 55, competence: 75, tenure: "Since Oct 2023", note: "High-profile appointment. EU trade negotiations lead.", relationship: "Neutral", avatar: "CE", age: 52, state: "Anambra", gender: "Female" },
];

// ── Media & Sentiment ────────────────────────────────────
export const mediaSentiment: { week: string; positive: number; negative: number; neutral: number }[] = [
  { week: "D1", positive: 35, negative: 40, neutral: 25 },
  { week: "D4", positive: 33, negative: 42, neutral: 25 },
  { week: "D7", positive: 30, negative: 45, neutral: 25 },
  { week: "D11", positive: 32, negative: 43, neutral: 25 },
  { week: "D14", positive: 28, negative: 48, neutral: 24 },
  { week: "D18", positive: 30, negative: 46, neutral: 24 },
  { week: "D21", positive: 27, negative: 50, neutral: 23 },
  { week: "D25", positive: 29, negative: 47, neutral: 24 },
  { week: "D28", positive: 26, negative: 51, neutral: 23 },
  { week: "D32", positive: 28, negative: 49, neutral: 23 },
  { week: "D35", positive: 25, negative: 52, neutral: 23 },
  { week: "D42", positive: 24, negative: 53, neutral: 23 },
];

export const narratives: { narrative: string; source: string; reach: string; sentiment: "Positive" | "Negative" | "Neutral"; trend: "up" | "down" | "stable" }[] = [
  { narrative: "Fuel subsidy pain — cost of living crisis", source: "Social Media", reach: "42M", sentiment: "Negative", trend: "up" },
  { narrative: "Kaduna refinery — energy independence hope", source: "Mainstream Press", reach: "28M", sentiment: "Positive", trend: "stable" },
  { narrative: "NW banditry — government inaction narrative", source: "Opposition Media", reach: "18M", sentiment: "Negative", trend: "up" },
  { narrative: "Digital economy growth — tech hub momentum", source: "International", reach: "12M", sentiment: "Positive", trend: "stable" },
  { narrative: "FX black market — naira collapse fears", source: "Social Media", reach: "35M", sentiment: "Negative", trend: "up" },
];

export const headlines: { title: string; source: string; body: string }[] = [
  { title: "Senate Moves to Block Emergency Powers Extension", source: "Vanguard", body: "The Nigerian Senate has signaled resistance to the President's request for extended emergency powers in the North-West. Senior opposition senators argue the current deployment has yielded insufficient results and demand a comprehensive security review before any extension. The ruling party whip is scrambling to secure enough votes." },
  { title: "CBN Holds Rate at 27.5% Despite Political Pressure", source: "BusinessDay", body: "The Central Bank of Nigeria maintained its benchmark rate at 27.5%, defying pressure from the Presidency and business groups to cut rates. Governor Hadiza Bichi cited persistent inflationary pressures and the need to attract foreign portfolio investment. The decision has widened the rift between Aso Rock and the CBN." },
  { title: "ECOWAS Summit: Nigeria Faces Isolation Over Niger Stance", source: "West African Tribune", body: "Nigeria's hardline position on the Niger military government has left it increasingly isolated within ECOWAS. Several member states have quietly resumed trade with Niamey, undermining Lagos-led sanctions. Diplomatic sources suggest a face-saving compromise is being brokered, but hardliners in the security establishment oppose any concession." },
  { title: "Fuel Queues Return to Lagos as Depots Run Dry", source: "Punch", body: "Long queues resurfaced across Lagos filling stations as several depots reported zero stock. NNPCL blamed logistics bottlenecks and pipeline vandalism in the Delta region. The Presidency urged calm, promising resolution within 48 hours, but marketers say the subsidy arrears crisis is the real cause." },
  { title: "Protests Erupt in Kano Over Rising Food Prices", source: "Northern Vanguard", body: "Hundreds of youth took to the streets of Kano's Sabon Gari market demanding government action on soaring food prices. A bag of rice now costs ₦92,000, up 40% in three months. Security forces used tear gas to disperse the crowds. Northern governors have called an emergency meeting." },
  { title: "Tech Giants Threaten Exit Over Digital Tax Framework", source: "TechCabal", body: "Meta and Google have formally objected to the proposed 10% digital services tax, warning it could trigger service restrictions. The Finance Ministry insists the levy is necessary to broaden the tax base. Industry watchers say a compromise at 5% is likely, but the optics of foreign firms dictating policy are politically toxic." },
  { title: "Supreme Court Upholds State Police Bill in Landmark Ruling", source: "ThisDay", body: "In a 5-2 decision, the Supreme Court ruled that the State Police Establishment Act is constitutional, ending years of legal challenges. Governors hailed the verdict as a victory for federalism. Critics warn that arming state governments could entrench regional power brokers and exacerbate ethnic tensions." },
];

// ── Media Key Personnel ─────────────────────────────────
export interface MediaPersonnel {
  name: string;
  title: string;
  shortTitle: string;
  loyalty: number;
  competence: number;
  tenure: string;
  note: string;
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
  avatar: string;
}

export const mediaPersonnel: MediaPersonnel[] = [
  { name: "Chief Folu Adebanjo", title: "Minister of Information", shortTitle: "Info Min", loyalty: 90, competence: 72, tenure: "Since Aug 2023", note: "Veteran media operative. Loyal propagandist but credibility questioned by press corps.", relationship: "Friendly", avatar: "FA" },
  { name: "Barr. Tayo Omisakin", title: "Special Adviser Media & Publicity", shortTitle: "SA Media", loyalty: 85, competence: 78, tenure: "Since May 2023", note: "Presidential spokesperson. Controls narrative framing. Under pressure from negative sentiment spiral.", relationship: "Friendly", avatar: "TO" },
  { name: "Dr. Kunle Adeyemo", title: "Chairman, NTV Board", shortTitle: "NTV", loyalty: 65, competence: 70, tenure: "Since Sep 2023", note: "Former presidential spokesperson. Moderate voice. NTV viewership declining.", relationship: "Neutral", avatar: "KA" },
  { name: "Hajia Bilkisu Abubakar", title: "Director, Social Media Strategy", shortTitle: "Social", loyalty: 75, competence: 80, tenure: "Since Jun 2023", note: "Manages government social media response. Battling misinformation on FX narrative.", relationship: "Friendly", avatar: "BA" },
];

// ── Event Feed ───────────────────────────────────────────
export interface GameEvent {
  id: string;
  title: string;
  week: string;
  severity: "info" | "warning" | "critical";
  description: string;
  actions: { label: string; context: string }[];
}

export const eventFeed: GameEvent[] = [
  {
    id: "evt-1",
    title: "NW Banditry Escalation",
    week: "Day 42",
    severity: "critical",
    description: "Armed bandits attacked three villages in Zamfara, displacing 15,000 civilians. The military reports stretched supply lines and requests additional air support. Governor demands federal intervention.",
    actions: [
      { label: "Deploy Air Support", context: "Authorise 2 additional attack helicopters to NW theater. Cost: ₦4.2B/month." },
      { label: "Negotiate Ceasefire", context: "Open back-channel talks with bandit leaders via traditional rulers." },
    ],
  },
  {
    id: "evt-2",
    title: "Labour Union Ultimatum",
    week: "Day 42",
    severity: "warning",
    description: "The NLC has issued a 14-day ultimatum for fuel price rollback or face a nationwide strike. Previous strikes cost ₦200B/day in economic output. Labour leader Mwuese Tarka is rallying coalition support.",
    actions: [
      { label: "Offer Wage Increase", context: "Propose 15% minimum wage increase as compromise. Cost: ₦180B/year." },
      { label: "Stand Firm", context: "Maintain current policy; prepare security contingency for strike." },
    ],
  },
  {
    id: "evt-3",
    title: "IMF Review Delegation Arriving",
    week: "Day 42",
    severity: "info",
    description: "IMF Article IV team arrives next week for assessment. Key focus areas: fiscal consolidation, FX unification, and subsidy reform progress. A positive review could unlock $3.4B standby facility.",
    actions: [
      { label: "Prepare Briefing", context: "Task Finance Minister to prepare comprehensive fiscal report." },
      { label: "Fast-Track Reforms", context: "Announce FX market reforms ahead of delegation visit." },
    ],
  },
  {
    id: "evt-4",
    title: "AFCON Preparation Crisis",
    week: "Day 38",
    severity: "warning",
    description: "Super Eagles camp in disarray — 3 key players withdrew from squad citing safety concerns. Sports Minister under fire for mismanaged preparations. Public mood volatile with tournament 3 months away.",
    actions: [
      { label: "Presidential Intervention", context: "Call emergency meeting with NFF and offer federal support package." },
      { label: "Replace Sports Minister", context: "Sack current minister and appoint technocrat from private sector." },
    ],
  },
];

// ── Security Procurement (for scatter-like chart) ────────
export const securityProcurement: { item: string; cost: number; effectiveness: number; status: string }[] = [
  { item: "Attack Helicopters (x4)", cost: 85, effectiveness: 78, status: "Delivered" },
  { item: "APCs (x120)", cost: 42, effectiveness: 65, status: "In Transit" },
  { item: "Drone Fleet (x12)", cost: 28, effectiveness: 82, status: "Operational" },
  { item: "Naval Patrol Boats (x6)", cost: 35, effectiveness: 70, status: "Ordered" },
  { item: "Body Armor (x10,000)", cost: 12, effectiveness: 55, status: "Delivered" },
  { item: "Comm Equipment", cost: 18, effectiveness: 72, status: "Deployed" },
];

// ── President Character Card ─────────────────────────────
export const presidentStats: { stat: string; value: number }[] = [
  { stat: "Charisma", value: 78 },
  { stat: "Diplomacy", value: 65 },
  { stat: "Economics", value: 55 },
  { stat: "Military", value: 42 },
  { stat: "Integrity", value: 60 },
  { stat: "Party Loyalty", value: 83 },
  { stat: "Leadership", value: 72 },
  { stat: "Negotiation", value: 68 },
  { stat: "Crisis Mgmt", value: 58 },
  { stat: "Public Speaking", value: 75 },
  { stat: "Intelligence", value: 70 },
  { stat: "Stamina", value: 62 },
];

export const presidentTraits: string[] = [
  "Yoruba",
  "Populist",
  "Pro-Market",
  "Federalist",
  "Ex-Governor",
  "Pragmatist",
];

// ── President Bio Template Data ─────────────────────────
export const presidentBioData = {
  universities: ["University of Lagos", "Ahmadu Bello University", "University of Nigeria Nsukka", "Obafemi Awolowo University", "University of Ibadan", "Bayero University Kano"],
  postgrad: ["Harvard Kennedy School (MPA)", "Oxford University (MBA)", "London School of Economics (MSc)", "Georgetown University (LLM)", "NIPSS Kuru (National Defence College)", "Lagos Business School (AMP)"],
  previousPositions: ["Governor (2 terms)", "Senator (Federal Republic)", "Minister of Works & Housing", "MD of First Bank Nigeria", "Group CEO of NNPC", "DG of NIMC", "Special Adviser to the President"],
  workHistory: ["PricewaterhouseCoopers (Partner)", "Shell Petroleum Nigeria", "Central Bank of Nigeria", "Gambo Industries (VP Strategy)", "Federal Ministry of Finance", "Nigerian Bar Association (Chairman)"],
  familyDescriptions: ["Married with 4 children — spouse is a prominent Lagos socialite and education advocate", "Married with 3 children — wife is a retired federal judge", "Married with 5 children — family traces lineage to Sokoto Caliphate royalty", "Married with 2 children — spouse runs an NGO focused on maternal health in the North-East"],
  hobbies: ["polo enthusiast", "avid chess player", "patron of the Nigerian Philharmonic", "amateur historian", "keen golfer"],
};

export const presidentTrends: { label: string; direction: "up" | "down" | "stable"; note: string }[] = [
  { label: "Public Trust", direction: "down", note: "-3 this quarter" },
  { label: "Party Standing", direction: "stable", note: "Holding firm" },
  { label: "International Rep.", direction: "up", note: "+2 after UN speech" },
  { label: "Health", direction: "stable", note: "85% — Stable" },
];

// ── ECOWAS Regional Stability ────────────────────────────
export const ecowasStability: { country: string; stability: number }[] = [
  { country: "Nigeria", stability: 47 },
  { country: "Ghana", stability: 72 },
  { country: "Senegal", stability: 68 },
  { country: "Côte d'Ivoire", stability: 61 },
  { country: "Niger", stability: 22 },
  { country: "Mali", stability: 18 },
];

// ── Presidential Legacy Score ────────────────────────────
export const legacyBreakdown = { positive: 34, neutral: 45, negative: 21 } as const;

export const legacyPillars: { pillar: string; score: number; trend: "up" | "down" | "stable" }[] = [
  { pillar: "Economic Reform", score: 38, trend: "down" },
  { pillar: "Security & Peace", score: 29, trend: "down" },
  { pillar: "Infrastructure", score: 52, trend: "up" },
  { pillar: "Anti-Corruption", score: 41, trend: "stable" },
  { pillar: "Social Welfare", score: 33, trend: "down" },
  { pillar: "Democratic Process", score: 48, trend: "stable" },
];

export const legacyScore = {
  current: 52,
  dayOneScore: 45,
  grade: "C+" as const,
  trend: "up" as const,
  description: "Moderate progress — infrastructure gains offset by economic pain and security failures.",
};

// ── Quick Actions ────────────────────────────────────────
export const quickActions: { label: string; icon: string; context: string }[] = [
  { label: "National Address", icon: "Mic", context: "Deliver a televised national address — choose topic: economy, security, or unity. Affects approval ±3-5%." },
  { label: "Reshuffle Cabinet", icon: "Shuffle", context: "Initiate cabinet reshuffle — remove underperforming ministers and appoint new ones. Risks faction backlash." },
  { label: "Emergency Powers", icon: "ShieldAlert", context: "Invoke emergency powers for 4 weeks — enhanced security but costs 15 approval points with opposition and civil society." },
  { label: "CBN Directive", icon: "Landmark", context: "Issue directive to Central Bank — risk undermining independence. Options: rate cut, FX intervention, or printing." },
  { label: "State Visit", icon: "Plane", context: "Schedule state visit — choose destination: Washington, Beijing, Riyadh, or Abuja (domestic tour). Each has different diplomatic yield." },
  { label: "Probe Commission", icon: "Search", context: "Launch anti-corruption probe — target a ministry or agency. May uncover scandals or create political enemies." },
];

// ── Active Events with 3 Choices ─────────────────────────
export interface ActiveEvent {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  description: string;
  choices: { label: string; context: string }[];
}

export const activeEvents: ActiveEvent[] = [
  {
    id: "ae-1",
    title: "Niger Delta Pipeline Crisis",
    severity: "critical",
    description: "Militants have sabotaged the Trans-Forcados pipeline, cutting oil output by 180,000 bpd. Revenue loss: ₦12B/week. Local communities demand amnesty program renewal.",
    choices: [
      { label: "Military Response", context: "Deploy JTF to secure pipeline infrastructure. Cost: ₦8B. Risk: civilian casualties and international criticism." },
      { label: "Negotiate Amnesty", context: "Reopen amnesty talks with militant leaders. Cost: ₦25B/year. Risk: sets precedent for future extortion." },
      { label: "Community Investment", context: "Launch ₦50B Niger Delta development fund. Long-term solution but slow to show results. Militants may reject." },
    ],
  },
  {
    id: "ae-2",
    title: "IMF Loan Proposal",
    severity: "info",
    description: "IMF offers $3.4B standby facility contingent on FX unification, subsidy removal, and tax reform. Accept/reject deadline: 2 turns.",
    choices: [
      { label: "Accept Terms", context: "Agree to all conditions. Unlocks $3.4B but triggers street protests and political backlash. Approval -8%." },
      { label: "Counter-Propose", context: "Propose phased reform timeline over 18 months. IMF may accept reduced facility of $2.1B." },
      { label: "Reject Publicly", context: "Reject as sovereignty infringement. Boosts nationalist support (+5 approval) but FX market crashes further." },
    ],
  },
  {
    id: "ae-3",
    title: "Governorship Elections",
    severity: "warning",
    description: "Off-cycle elections in 3 key states. Ruling party at risk of losing 2 of 3. Opposition leveraging cost-of-living anger. INEC reports security concerns.",
    choices: [
      { label: "Deploy Resources", context: "Channel party war chest (₦45B) to swing states. Ethically questionable; media may expose." },
      { label: "Free & Fair", context: "Publicly commit to non-interference. Risk losing 2 states but gain democratic credibility (+3 legacy)." },
      { label: "Delay Elections", context: "Cite security concerns to postpone by 3 months. Buys time but opposition cries foul. International criticism." },
    ],
  },
];

// ── Footer / Turn Info ───────────────────────────────────
export const turnInfo = {
  currentDate: "14 March 2025",
  dayNumber: 42,
  nextElection: "Feb 2027",
  autosave: true,
} as const;

// ── Security Key Personnel ───────────────────────────────
export interface SecurityPersonnel {
  name: string;
  title: string;
  shortTitle: string;
  loyalty: number;
  competence: number;
  tenure: string;
  note: string;
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
  avatar: string;
}

export const securityPersonnel: SecurityPersonnel[] = [
  { name: "Brig. Kashim Konduga (Rtd)", title: "National Security Adviser", shortTitle: "NSA", loyalty: 88, competence: 76, tenure: "Since May 2023", note: "Hawkish — advocates for expanded emergency powers in NW.", relationship: "Friendly", avatar: "KK" },
  { name: "Gen. Ibrahim Attahiru II", title: "Chief of Army Staff", shortTitle: "COAS", loyalty: 75, competence: 82, tenure: "Since Jan 2024", note: "Competent field commander. Privately frustrated with procurement delays.", relationship: "Friendly", avatar: "IA" },
  { name: "V/Adm. Abubakar Gambo", title: "Chief of Naval Staff", shortTitle: "CNS", loyalty: 70, competence: 68, tenure: "Since Jun 2023", note: "Focused on Gulf of Guinea piracy. Needs budget for patrol boats.", relationship: "Neutral", avatar: "AG" },
  { name: "AVM Isiaka Amao", title: "Chief of Air Staff", shortTitle: "CAS", loyalty: 72, competence: 85, tenure: "Since May 2023", note: "Key to NW air campaign. Drone fleet operational under his command.", relationship: "Friendly", avatar: "IA2" },
  { name: "IGP Usman Baba Alkali", title: "Inspector General of Police", shortTitle: "IGP", loyalty: 60, competence: 58, tenure: "Since Apr 2023", note: "Under pressure from #EndSARS legacy. Police morale low. Reform bill stalled.", relationship: "Wary", avatar: "UA" },
  { name: "Maj. Gen. Christopher Musa", title: "Chief of Defence Staff", shortTitle: "CDS", loyalty: 80, competence: 78, tenure: "Since Jun 2023", note: "Coordinates inter-service operations. Trusted by the President.", relationship: "Friendly", avatar: "CM" },
];

// ── Economic Key Personnel ──────────────────────────────
export interface EconomicPersonnel {
  name: string;
  title: string;
  shortTitle: string;
  loyalty: number;
  competence: number;
  tenure: string;
  note: string;
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile";
  avatar: string;
}

export const economicPersonnel: EconomicPersonnel[] = [
  { name: "Alh. Aminu Kazeem", title: "Minister of Finance", shortTitle: "Finance", loyalty: 78, competence: 85, tenure: "Since May 2023", note: "Northern Caucus loyalist. Key to IMF negotiations and fiscal consolidation.", relationship: "Friendly", avatar: "AK" },
  { name: "Hajia Hadiza Bichi", title: "CBN Governor", shortTitle: "CBN", loyalty: 55, competence: 92, tenure: "Since Jun 2023", note: "Technocratic independence — resists political pressure on rates.", relationship: "Neutral", avatar: "HB" },
  { name: "Engr. Abubakar Lawal", title: "NNPCL Group CEO", shortTitle: "NNPC", loyalty: 65, competence: 78, tenure: "Since Jul 2023", note: "Manages oil revenue pipeline. Under scrutiny for subsidy accounting.", relationship: "Neutral", avatar: "AL" },
  { name: "Dr. Rotimi Ajayi", title: "EFCC Chairman", shortTitle: "EFCC", loyalty: 82, competence: 70, tenure: "Since Oct 2023", note: "Presidential appointee. Anti-corruption enforcement a political tool.", relationship: "Friendly", avatar: "RA" },
  { name: "Barr. Gbenga Oyelaran", title: "FIRS Chairman", shortTitle: "FIRS", loyalty: 75, competence: 80, tenure: "Since Sep 2023", note: "Driving tax revenue expansion. Digital tax bill his priority.", relationship: "Friendly", avatar: "GO" },
  { name: "Chief Adaeze Okonkwo", title: "Minister of Petroleum", shortTitle: "Petroleum", loyalty: 65, competence: 72, tenure: "Since May 2023", note: "Under scrutiny. South-East political figure with high ambition.", relationship: "Wary", avatar: "AO" },
];

// ── Legislature — Senate & House Split ────────────────────
export const senateSeats = { ruling: 59, opposition: 46, independent: 4, total: 109 } as const;
export const houseSeats = { ruling: 201, opposition: 154, independent: 5, total: 360 } as const;

export interface PoliticalEvent {
  date: string;
  event: string;
  impact: string;
  type: "opportunity" | "threat" | "milestone";
}

export const politicalTimeline: PoliticalEvent[] = [
  { date: "Day 1", event: "Inauguration", impact: "Initial goodwill — 58% approval", type: "milestone" },
  { date: "Day 12", event: "Fuel subsidy removal announced", impact: "Approval dropped 10 points overnight", type: "threat" },
  { date: "Day 18", event: "Kaduna Mega Refinery commissioning", impact: "+4 approval, positive press cycle", type: "opportunity" },
  { date: "Day 28", event: "NW banditry escalation", impact: "Security threat level raised to Elevated", type: "threat" },
  { date: "Day 35", event: "UN General Assembly speech", impact: "+2 international reputation", type: "opportunity" },
  { date: "Day 42", event: "Labour ultimatum issued", impact: "Strike risk — 14-day countdown", type: "threat" },
];

// ── Legacy Tab — Extended Data ───────────────────────────
export interface LegacyMilestone {
  title: string;
  date: string;
  pillar: string;
  impact: number;
  description: string;
}

export const legacyMilestones: LegacyMilestone[] = [
  { title: "Fuel Subsidy Partial Removal", date: "Day 12", pillar: "Economic Reform", impact: -8, description: "Bold but costly — triggered inflation spike and social unrest. Long-term fiscal benefit unclear." },
  { title: "Kaduna Mega Refinery Support", date: "Day 18", pillar: "Infrastructure", impact: 12, description: "Federal backing for refinery commissioning. Energy independence narrative boosted public mood." },
  { title: "NW Security Surge", date: "Day 28", pillar: "Security & Peace", impact: -4, description: "Troop deployment to Zamfara. Results mixed — incidents decreased 15% but civilian displacement increased." },
  { title: "Digital Economy Tax Bill", date: "Day 30", pillar: "Economic Reform", impact: 5, description: "Passed first reading with bipartisan support. Projected ₦800B annual revenue." },
  { title: "Anti-Corruption Probe (Ministry of Petroleum)", date: "Day 35", pillar: "Anti-Corruption", impact: 7, description: "Launched investigation into $2.1B procurement irregularities. Chief Okonkwo under scrutiny." },
];

export const approvalHistory: { day: number; approval: number }[] = [
  { day: 1, approval: 58 }, { day: 5, approval: 56 }, { day: 10, approval: 52 },
  { day: 12, approval: 42 }, { day: 15, approval: 44 }, { day: 18, approval: 48 },
  { day: 22, approval: 47 }, { day: 25, approval: 46 }, { day: 28, approval: 44 },
  { day: 32, approval: 45 }, { day: 35, approval: 46 }, { day: 38, approval: 44 },
  { day: 42, approval: 43 },
];
