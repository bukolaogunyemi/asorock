import type { PolicyLeverKey } from "./gameTypes";

// ── Team Member Config ──────────────────────────────────────
export interface TeamMemberConfig {
  role: string;
  portfolioMatch: string;
  lookupSource?: "characters" | "appointments";
  appointmentPosition?: string;
}

// ── Chart Config ────────────────────────────────────────────
export type ChartType = "line" | "area" | "bar" | "stacked-area";

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  historyKey: string | null;
  currentKey: string;
  format?: string;
  warningThreshold?: { condition: "gt" | "lt"; value: number; message: string };
  crisisThreshold?: { condition: "gt" | "lt"; value: number; message: string };
  bars?: Array<{ key: string; label: string }>;
}

// ── Stakeholder Config ──────────────────────────────────────
export interface StakeholderConfig {
  id: string;
  name: string;
  focus: string;
  quoteTemplates: { supportive: string; cautious: string; opposed: string };
}

// ── Reform Config ───────────────────────────────────────────
export interface ReformConfig {
  id: string;
  title: string;
  advanceRate: number;
  revertRate: number;
  payoffDescription: string;
}

// ── Subsection Config ───────────────────────────────────────
export interface SubsectionConfig {
  id: string;
  label: string;
  team: TeamMemberConfig[];
  charts: ChartConfig[];
  levers: PolicyLeverKey[];
  briefingCooldownKey: string;
}

// ── Section Config ──────────────────────────────────────────
export interface GovernanceSectionConfig {
  id: string;
  label: string;
  overview: {
    team: TeamMemberConfig[];
    charts: ChartConfig[];
    levers: PolicyLeverKey[];
    stakeholders: StakeholderConfig[];
    reforms: ReformConfig[];
    briefingCooldownKey: string;
  };
  subsections: SubsectionConfig[];
}

// ═══════════════════════════════════════════════════════════
// ECONOMY SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const ECONOMY_OVERVIEW_TEAM: TeamMemberConfig[] = [
  { role: "Minister of Finance", portfolioMatch: "Finance" },
  { role: "CBN Governor", portfolioMatch: "CBN" },
  { role: "Chief Economic Adviser", portfolioMatch: "Chief Economic Adviser", lookupSource: "appointments", appointmentPosition: "Chief Economic Adviser" },
  { role: "Minister of Trade & Investment", portfolioMatch: "Trade" },
  { role: "Budget Director", portfolioMatch: "Budget", lookupSource: "appointments", appointmentPosition: "Budget Director" },
];

const ECONOMY_OVERVIEW_CHARTS: ChartConfig[] = [
  {
    id: "inflation", title: "Inflation Rate", type: "line",
    historyKey: "inflation", currentKey: "inflation", format: "{value}%",
    warningThreshold: { condition: "gt", value: 20, message: "⚠️ Above IMF warning threshold" },
    crisisThreshold: { condition: "gt", value: 30, message: "🔴 Hyperinflation risk" },
  },
  {
    id: "gdp-growth", title: "GDP Growth", type: "line",
    historyKey: "gdp", currentKey: "gdpGrowthRate", format: "{value}%",
    warningThreshold: { condition: "lt", value: 0, message: "⚠️ Economy contracting" },
  },
  {
    id: "fx-rate", title: "FX Rate", type: "line",
    historyKey: "fxRate", currentKey: "fxRate", format: "₦{value}/$",
    warningThreshold: { condition: "gt", value: 1500, message: "⚠️ Naira under pressure" },
  },
  {
    id: "unemployment", title: "Unemployment", type: "line",
    historyKey: "unemploymentRate", currentKey: "unemploymentRate", format: "{value}%",
    warningThreshold: { condition: "gt", value: 30, message: "⚠️ Social unrest risk" },
  },
  {
    id: "rev-vs-exp", title: "Revenue vs Expenditure", type: "stacked-area",
    historyKey: null, currentKey: "revenue.total",
    warningThreshold: { condition: "gt", value: 0, message: "⚠️ Fiscal deficit — borrowing required" },
  },
  {
    id: "budget-allocation", title: "Budget Allocation", type: "bar",
    historyKey: null, currentKey: "expenditure.total",
    bars: [
      { key: "expenditure.recurrent", label: "Recurrent" },
      { key: "expenditure.capital", label: "Capital" },
      { key: "expenditure.debtServicing", label: "Debt Service" },
      { key: "expenditure.transfers", label: "Transfers" },
    ],
  },
];

const ECONOMY_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "imf", name: "IMF", focus: "structural reform, fiscal transparency",
    quoteTemplates: { supportive: "Approve of reform direction", cautious: "Concerned about fiscal trajectory", opposed: "Recommend immediate policy correction" } },
  { id: "world-bank", name: "World Bank", focus: "poverty reduction, social safety nets",
    quoteTemplates: { supportive: "Social protection improving", cautious: "Poverty indicators need attention", opposed: "Social safety net inadequate" } },
  { id: "business", name: "Business Community", focus: "ease of doing business, predictable FX",
    quoteTemplates: { supportive: "Business climate improving", cautious: "Market uncertainty rising", opposed: "Investment climate hostile" } },
  { id: "labour", name: "Labour Unions", focus: "wages, jobs, subsidy protection",
    quoteTemplates: { supportive: "Workers' interests protected", cautious: "Watching policy changes closely", opposed: "Workers bearing the cost of reform" } },
  { id: "analysts", name: "Market Analysts", focus: "fiscal discipline, reserve adequacy",
    quoteTemplates: { supportive: "Fundamentals are sound", cautious: "Monitoring fiscal indicators", opposed: "Fiscal position unsustainable" } },
];

const ECONOMY_REFORMS: ReformConfig[] = [
  { id: "subsidy-reform", title: "Subsidy Reform Program", advanceRate: 2, revertRate: -1, payoffDescription: "Fiscal savings unlocked — treasury +₦0.3T/turn" },
  { id: "tax-modernisation", title: "Tax Modernisation", advanceRate: 1.5, revertRate: -1, payoffDescription: "Revenue base expanded — tax revenue +20%" },
  { id: "trade-liberalisation", title: "Trade Liberalisation", advanceRate: 1, revertRate: -1, payoffDescription: "Trade corridors opened — GDP growth +0.5%" },
];

export const ECONOMY_CONFIG: GovernanceSectionConfig = {
  id: "economy",
  label: "Economy",
  overview: {
    team: ECONOMY_OVERVIEW_TEAM,
    charts: ECONOMY_OVERVIEW_CHARTS,
    levers: ["fuelSubsidy", "fxPolicy", "interestRate", "taxRate", "cashTransfers", "importTariffs", "minimumWage", "publicSectorHiring"] as PolicyLeverKey[],
    stakeholders: ECONOMY_STAKEHOLDERS,
    reforms: ECONOMY_REFORMS,
    briefingCooldownKey: "economy-briefing",
  },
  subsections: [
    {
      id: "budget", label: "Budget",
      team: [
        { role: "Minister of Finance", portfolioMatch: "Finance" },
        { role: "Budget Director", portfolioMatch: "Budget", lookupSource: "appointments", appointmentPosition: "Budget Director" },
      ],
      charts: [
        { id: "budget-allocation-expanded", title: "Budget Allocation", type: "bar", historyKey: null, currentKey: "expenditure.total",
          bars: [
            { key: "expenditure.recurrent", label: "Recurrent" },
            { key: "expenditure.capital", label: "Capital" },
            { key: "expenditure.debtServicing", label: "Debt Service" },
            { key: "expenditure.transfers", label: "Transfers" },
          ] },
        { id: "rev-vs-exp-budget", title: "Revenue vs Expenditure", type: "stacked-area", historyKey: null, currentKey: "revenue.total" },
        { id: "treasury", title: "Treasury Liquidity", type: "line", historyKey: "treasuryLiquidity", currentKey: "treasuryLiquidity", format: "₦{value}T" },
        { id: "months-cover", title: "Months of Cover", type: "line", historyKey: null, currentKey: "treasuryMonthsOfCover", format: "{value} months",
          warningThreshold: { condition: "lt", value: 3, message: "⚠️ Critical liquidity" } },
      ],
      levers: ["fuelSubsidy", "cashTransfers", "publicSectorHiring"] as PolicyLeverKey[],
      briefingCooldownKey: "economy-budget-briefing",
    },
    {
      id: "revenue", label: "Revenue",
      team: [
        { role: "FIRS Chairman", portfolioMatch: "FIRS" },
        { role: "Customs Comptroller", portfolioMatch: "Customs" },
        { role: "Minister of Finance", portfolioMatch: "Finance" },
      ],
      charts: [
        { id: "oil-revenue", title: "Oil Revenue", type: "line", historyKey: "revenueOil", currentKey: "revenue.oil", format: "₦{value}T" },
        { id: "tax-revenue", title: "Tax Revenue", type: "line", historyKey: "revenueTax", currentKey: "revenue.tax", format: "₦{value}T" },
        { id: "igr", title: "IGR", type: "line", historyKey: "revenueIgr", currentKey: "revenue.igr", format: "₦{value}T" },
        { id: "trade-revenue", title: "Trade Revenue", type: "line", historyKey: "revenueTrade", currentKey: "revenue.trade", format: "₦{value}T" },
        { id: "total-revenue", title: "Total Revenue", type: "line", historyKey: "revenueTotal", currentKey: "revenue.total", format: "₦{value}T" },
        { id: "revenue-to-gdp", title: "Revenue-to-GDP", type: "line", historyKey: null, currentKey: "revenue.total", format: "{value}%" },
      ],
      levers: ["taxRate", "importTariffs"] as PolicyLeverKey[],
      briefingCooldownKey: "economy-revenue-briefing",
    },
    {
      id: "debt", label: "Debt",
      team: [
        { role: "Minister of Finance", portfolioMatch: "Finance" },
        { role: "CBN Governor", portfolioMatch: "CBN" },
        { role: "Chief Economic Adviser", portfolioMatch: "Chief Economic Adviser", lookupSource: "appointments", appointmentPosition: "Chief Economic Adviser" },
      ],
      charts: [
        { id: "debt-to-gdp", title: "Debt-to-GDP", type: "line", historyKey: "debtToGdp", currentKey: "debtToGdp", format: "{value}%",
          warningThreshold: { condition: "gt", value: 40, message: "⚠️ Approaching sustainability limit" } },
        { id: "debt-servicing", title: "Debt Servicing", type: "line", historyKey: null, currentKey: "expenditure.debtServicing", format: "₦{value}T" },
        { id: "reserves-debt", title: "Reserves", type: "line", historyKey: "reserves", currentKey: "reserves", format: "${value}B",
          warningThreshold: { condition: "lt", value: 20, message: "⚠️ Reserve depletion risk" } },
        { id: "borrowing", title: "Borrowing", type: "line", historyKey: "revenueBorrowing", currentKey: "revenue.borrowing", format: "₦{value}T" },
      ],
      levers: ["interestRate", "fxPolicy"] as PolicyLeverKey[],
      briefingCooldownKey: "economy-debt-briefing",
    },
    {
      id: "trade", label: "Trade",
      team: [
        { role: "Minister of Trade & Investment", portfolioMatch: "Trade" },
        { role: "Minister of Finance", portfolioMatch: "Finance" },
      ],
      charts: [
        { id: "fx-rate-trade", title: "FX Rate", type: "line", historyKey: "fxRate", currentKey: "fxRate", format: "₦{value}/$",
          warningThreshold: { condition: "gt", value: 1500, message: "⚠️ Naira under pressure" } },
        { id: "trade-revenue-sub", title: "Trade Revenue", type: "line", historyKey: "revenueTrade", currentKey: "revenue.trade", format: "₦{value}T" },
        { id: "oil-output", title: "Oil Output", type: "line", historyKey: "oilOutput", currentKey: "oilOutput", format: "{value} mb/d" },
        { id: "import-impact", title: "Import Policy Impact", type: "bar", historyKey: null, currentKey: "fxRate" },
      ],
      levers: ["importTariffs", "fxPolicy"] as PolicyLeverKey[],
      briefingCooldownKey: "economy-trade-briefing",
    },
  ],
};
