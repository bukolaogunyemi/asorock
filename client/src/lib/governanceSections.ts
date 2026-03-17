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
  stakeholders?: StakeholderConfig[];
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
  { role: "Director of National Intelligence", portfolioMatch: "Intelligence", lookupSource: "appointments", appointmentPosition: "Director of National Intelligence" },
];

const ECONOMY_OVERVIEW_CHARTS: ChartConfig[] = [
  {
    id: "inflation", title: "Inflation Rate", type: "line",
    historyKey: "inflation", currentKey: "inflation", format: "{value}%",
    warningThreshold: { condition: "gt", value: 20, message: "⚠️ Above IMF warning threshold" },
    crisisThreshold: { condition: "gt", value: 30, message: "🔴 Hyperinflation risk" },
  },
  {
    id: "fx-rate", title: "FX Rate", type: "line",
    historyKey: "fxRate", currentKey: "fxRate", format: "₦{value}/$",
    warningThreshold: { condition: "gt", value: 1500, message: "⚠️ Naira under pressure" },
  },
  {
    id: "gdp", title: "GDP", type: "line",
    historyKey: "gdp", currentKey: "gdp", format: "₦{value}T",
    warningThreshold: { condition: "lt", value: 450, message: "⚠️ Economy contracting" },
  },
];

const ECONOMY_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "international", name: "International Institutions", focus: "structural reform, fiscal transparency, social safety nets",
    quoteTemplates: { supportive: "Reform direction and social outcomes improving", cautious: "Fiscal trajectory and poverty indicators need attention", opposed: "Recommend immediate policy correction and stronger safety nets" } },
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
    levers: ["fuelSubsidy", "fxPolicy", "interestRate"] as PolicyLeverKey[],
    stakeholders: ECONOMY_STAKEHOLDERS,
    reforms: ECONOMY_REFORMS,
    briefingCooldownKey: "economy-briefing",
  },
  subsections: [
    {
      id: "budget", label: "Budget",
      team: [
        { role: "Minister of Finance", portfolioMatch: "Finance" },
        { role: "Director of National Intelligence", portfolioMatch: "Intelligence", lookupSource: "appointments", appointmentPosition: "Director of National Intelligence" },
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
        { id: "total-revenue", title: "Total Revenue", type: "line", historyKey: "revenueTotal", currentKey: "revenue.total", format: "₦{value}T" },
      ],
      levers: ["taxRate", "importTariffs"] as PolicyLeverKey[],
      stakeholders: [
        { id: "business", name: "Business Community", focus: "tax burden, compliance costs",
          quoteTemplates: { supportive: "Tax reforms boosting competitiveness", cautious: "Watching tax policy changes carefully", opposed: "Tax burden crushing private enterprise" } },
        { id: "oil-industry", name: "Oil & Gas Sector", focus: "production stability, revenue sharing",
          quoteTemplates: { supportive: "Operating environment improving", cautious: "Production challenges remain", opposed: "Investment climate deteriorating" } },
        { id: "international", name: "International Institutions", focus: "revenue diversification, fiscal transparency",
          quoteTemplates: { supportive: "Revenue diversification progressing", cautious: "Over-reliance on oil revenue persists", opposed: "Revenue base dangerously narrow" } },
        { id: "analysts", name: "Market Analysts", focus: "revenue adequacy, collection efficiency",
          quoteTemplates: { supportive: "Revenue trajectory sustainable", cautious: "Collection efficiency needs improvement", opposed: "Revenue shortfall threatens fiscal stability" } },
      ],
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
        { id: "reserves-debt", title: "Reserves", type: "line", historyKey: "reserves", currentKey: "reserves", format: "${value}B",
          warningThreshold: { condition: "lt", value: 20, message: "⚠️ Reserve depletion risk" } },
        { id: "debt-servicing", title: "Debt Servicing", type: "line", historyKey: null, currentKey: "expenditure.debtServicing", format: "₦{value}T" },
      ],
      levers: ["interestRate", "fxPolicy"] as PolicyLeverKey[],
      stakeholders: [
        { id: "bond-market", name: "Bond Investors", focus: "yields, default risk, repayment capacity",
          quoteTemplates: { supportive: "Nigeria bonds attractive, risk manageable", cautious: "Monitoring fiscal discipline closely", opposed: "Default risk rising, reducing exposure" } },
        { id: "international", name: "International Institutions", focus: "debt sustainability, concessional terms",
          quoteTemplates: { supportive: "Debt management framework sound", cautious: "Debt trajectory needs monitoring", opposed: "Debt sustainability at risk — restructuring may be needed" } },
        { id: "analysts", name: "Market Analysts", focus: "debt-to-GDP, debt servicing ratio",
          quoteTemplates: { supportive: "Fiscal position manageable", cautious: "Debt servicing consuming rising share of revenue", opposed: "Fiscal position unsustainable" } },
        { id: "business", name: "Business Community", focus: "crowding out, borrowing costs",
          quoteTemplates: { supportive: "Government borrowing not crowding out private sector", cautious: "Rising rates impacting business lending", opposed: "Government borrowing crowding out private investment" } },
      ],
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
      ],
      levers: ["importTariffs", "fxPolicy"] as PolicyLeverKey[],
      stakeholders: [
        { id: "business", name: "Business Community", focus: "import costs, market access, FX availability",
          quoteTemplates: { supportive: "Trade environment improving", cautious: "FX access and import costs a concern", opposed: "Trade restrictions strangling business" } },
        { id: "manufacturers", name: "Manufacturers Association", focus: "local production protection, input costs",
          quoteTemplates: { supportive: "Tariff policy supporting local industry", cautious: "Need more protection from cheap imports", opposed: "Local manufacturing cannot compete under current policy" } },
        { id: "international", name: "International Institutions", focus: "trade openness, WTO compliance",
          quoteTemplates: { supportive: "Trade liberalization on track", cautious: "Protectionist trends concerning", opposed: "Trade barriers harming economic integration" } },
        { id: "analysts", name: "Market Analysts", focus: "trade balance, FX pressure",
          quoteTemplates: { supportive: "Trade balance improving", cautious: "Import dependency creating FX pressure", opposed: "Trade deficit unsustainable" } },
      ],
      briefingCooldownKey: "economy-trade-briefing",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// INFRASTRUCTURE SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const INFRASTRUCTURE_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "power-generation", title: "Power Generation", type: "line", historyKey: "powerGeneration", currentKey: "powerGeneration" },
  { id: "road-network-score", title: "Road Network Score", type: "line", historyKey: "roadNetworkScore", currentKey: "roadNetworkScore" },
  { id: "broadband-penetration", title: "Broadband Penetration", type: "line", historyKey: "broadbandPenetration", currentKey: "broadbandPenetration" },
];

const INFRASTRUCTURE_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "power-unions", name: "Power Sector Unions", focus: "electricity workers, tariff protection, privatisation pace",
    quoteTemplates: { supportive: "Power sector reform protecting workers", cautious: "Monitoring privatisation impact on jobs", opposed: "Privatisation threatening workers' livelihoods" } },
  { id: "telecom-industry", name: "Telecom Industry", focus: "spectrum allocation, digital investment, regulatory environment",
    quoteTemplates: { supportive: "Digital investment environment improving", cautious: "Regulatory clarity still needed", opposed: "Policy uncertainty stalling telecom investment" } },
  { id: "construction-lobby", name: "Construction Lobby", focus: "infrastructure contracts, local content, procurement",
    quoteTemplates: { supportive: "Infrastructure spend creating industry opportunity", cautious: "Contract award process needs transparency", opposed: "Procurement delays and underfunding strangling construction sector" } },
  { id: "international-development-partners", name: "International Development Partners", focus: "infrastructure financing, project governance, climate resilience",
    quoteTemplates: { supportive: "Infrastructure governance and climate standards met", cautious: "Project execution and oversight need strengthening", opposed: "Governance failures risk development finance withdrawal" } },
];

export const INFRASTRUCTURE_CONFIG: GovernanceSectionConfig = {
  id: "infrastructure",
  label: "Infrastructure",
  overview: {
    team: [
      { role: "Minister of Power", portfolioMatch: "Power" },
      { role: "Minister of Works", portfolioMatch: "Works" },
      { role: "Minister of Communications", portfolioMatch: "Communications" },
      { role: "Minister of Petroleum", portfolioMatch: "Petroleum" },
    ],
    charts: INFRASTRUCTURE_OVERVIEW_CHARTS,
    levers: ["powerPrivatization", "oilSectorReform", "transportPriority", "digitalInvestment"] as PolicyLeverKey[],
    stakeholders: INFRASTRUCTURE_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "infrastructure-briefing",
  },
  subsections: [
    {
      id: "power", label: "Power",
      team: [{ role: "Minister of Power", portfolioMatch: "Power" }],
      charts: [{ id: "power-gen-sub", title: "Power Generation", type: "line", historyKey: "powerGeneration", currentKey: "powerGeneration" }],
      levers: ["powerPrivatization"] as PolicyLeverKey[],
      briefingCooldownKey: "infrastructure-power-briefing",
    },
    {
      id: "oil-gas", label: "Oil & Gas",
      team: [{ role: "Minister of Petroleum", portfolioMatch: "Petroleum" }],
      charts: [{ id: "oil-output-infra", title: "Oil Output", type: "line", historyKey: "oilOutput", currentKey: "oilOutput", format: "{value} mb/d" }],
      levers: ["oilSectorReform"] as PolicyLeverKey[],
      briefingCooldownKey: "infrastructure-oilgas-briefing",
    },
    {
      id: "transport", label: "Transport",
      team: [{ role: "Minister of Works", portfolioMatch: "Works" }],
      charts: [{ id: "road-network-sub", title: "Road Network Score", type: "line", historyKey: "roadNetworkScore", currentKey: "roadNetworkScore" }],
      levers: ["transportPriority"] as PolicyLeverKey[],
      briefingCooldownKey: "infrastructure-transport-briefing",
    },
    {
      id: "digital", label: "Digital",
      team: [{ role: "Minister of Communications", portfolioMatch: "Communications" }],
      charts: [{ id: "broadband-sub", title: "Broadband Penetration", type: "line", historyKey: "broadbandPenetration", currentKey: "broadbandPenetration" }],
      levers: ["digitalInvestment"] as PolicyLeverKey[],
      briefingCooldownKey: "infrastructure-digital-briefing",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// HEALTH SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const HEALTH_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "hospital-bed-ratio", title: "Hospital Bed Ratio", type: "line", historyKey: "hospitalBedRatio", currentKey: "hospitalBedRatio" },
  { id: "health-worker-density", title: "Health Worker Density", type: "line", historyKey: "healthWorkerDensity", currentKey: "healthWorkerDensity" },
  { id: "phc-coverage", title: "PHC Coverage", type: "line", historyKey: "phcCoverage", currentKey: "phcCoverage" },
];

const HEALTH_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "nma", name: "Nigerian Medical Association", focus: "doctor welfare, healthcare funding, brain drain",
    quoteTemplates: { supportive: "Health sector investment improving medical practice", cautious: "Funding and staffing levels still concerning", opposed: "Brain drain accelerating under current health policy" } },
  { id: "pharma-industry", name: "Pharma Industry", focus: "drug procurement, local manufacturing, regulation",
    quoteTemplates: { supportive: "Drug procurement environment supporting industry", cautious: "Regulatory and procurement delays persist", opposed: "Policy inconsistency undermining pharmaceutical investment" } },
  { id: "who-global-fund", name: "WHO / Global Fund", focus: "disease burden, healthcare access, aid conditionality",
    quoteTemplates: { supportive: "Health outcomes and governance meeting targets", cautious: "Key health indicators require urgent attention", opposed: "Aid conditionalities at risk — health system under strain" } },
  { id: "patient-advocacy", name: "Patient Advocacy Groups", focus: "access to care, drug availability, out-of-pocket costs",
    quoteTemplates: { supportive: "Healthcare access and affordability improving", cautious: "Many patients still falling through the gaps", opposed: "Ordinary Nigerians cannot afford basic healthcare" } },
];

export const HEALTH_CONFIG: GovernanceSectionConfig = {
  id: "health",
  label: "Health",
  overview: {
    team: [
      { role: "Minister of Health", portfolioMatch: "Health" },
      { role: "NAFDAC Director-General", portfolioMatch: "NAFDAC" },
    ],
    charts: HEALTH_OVERVIEW_CHARTS,
    levers: ["healthcareFunding", "drugProcurement"] as PolicyLeverKey[],
    stakeholders: HEALTH_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "health-briefing",
  },
  subsections: [],
};

// ═══════════════════════════════════════════════════════════
// EDUCATION SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const EDUCATION_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "literacy-rate", title: "Literacy Rate", type: "line", historyKey: "literacyRate", currentKey: "literacyRate" },
  { id: "out-of-school-children", title: "Out-of-School Children", type: "line", historyKey: "outOfSchoolChildren", currentKey: "outOfSchoolChildren" },
  { id: "asuu-strike-risk", title: "ASUU Strike Risk", type: "line", historyKey: "asuuStrikeRisk", currentKey: "asuuStrikeRisk" },
];

const EDUCATION_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "asuu", name: "ASUU", focus: "university funding, staff welfare, academic freedom",
    quoteTemplates: { supportive: "University autonomy and funding commitments on track", cautious: "Monitoring implementation of education agreements", opposed: "Strike action unavoidable if funding commitments not met" } },
  { id: "nut", name: "NUT (Teachers Union)", focus: "basic education funding, teacher welfare, school infrastructure",
    quoteTemplates: { supportive: "Teacher welfare and school conditions improving", cautious: "Basic education still underfunded", opposed: "Teachers and pupils abandoned by government policy" } },
  { id: "private-education", name: "Private Education Sector", focus: "regulation, school fees, accreditation",
    quoteTemplates: { supportive: "Regulatory environment enabling private investment in education", cautious: "Regulatory burden on private schools needs review", opposed: "Overregulation strangling private education expansion" } },
  { id: "student-unions", name: "Student Unions", focus: "school fees, campus welfare, graduate employment",
    quoteTemplates: { supportive: "Students benefiting from education reforms", cautious: "Fees and welfare concerns remain unresolved", opposed: "Students are bearing the cost of government neglect" } },
];

export const EDUCATION_CONFIG: GovernanceSectionConfig = {
  id: "education",
  label: "Education",
  overview: {
    team: [
      { role: "Minister of Education", portfolioMatch: "Education" },
      { role: "Minister of Science & Technology", portfolioMatch: "Science" },
    ],
    charts: EDUCATION_OVERVIEW_CHARTS,
    levers: ["universityAutonomy", "educationBudgetSplit"] as PolicyLeverKey[],
    stakeholders: EDUCATION_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "education-briefing",
  },
  subsections: [],
};

// ═══════════════════════════════════════════════════════════
// AGRICULTURE SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const AGRICULTURE_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "food-price-index", title: "Food Price Index", type: "line", historyKey: "foodPriceIndex", currentKey: "foodPriceIndex" },
  { id: "crop-yield-index", title: "Crop Yield Index", type: "line", historyKey: "cropYieldIndex", currentKey: "cropYieldIndex" },
  { id: "post-harvest-loss", title: "Post-Harvest Loss", type: "line", historyKey: "postHarvestLoss", currentKey: "postHarvestLoss" },
];

const AGRICULTURE_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "farmers-associations", name: "Farmers Associations", focus: "input subsidies, land access, crop prices",
    quoteTemplates: { supportive: "Agricultural policy supporting smallholder farmers", cautious: "Subsidy access and land rights remain unresolved", opposed: "Farmers left behind by broken agricultural policy" } },
  { id: "herder-cooperatives", name: "Herder Cooperatives", focus: "grazing routes, land conflict, water access",
    quoteTemplates: { supportive: "Grazing rights and conflict mediation improving", cautious: "Herder-farmer tensions require sustained attention", opposed: "Herder communities under threat from policy neglect" } },
  { id: "agribusiness-exporters", name: "Agribusiness Exporters", focus: "export corridors, value chain investment, FX access",
    quoteTemplates: { supportive: "Export environment enabling agribusiness expansion", cautious: "FX access and infrastructure still constrain export potential", opposed: "Export bottlenecks and policy uncertainty killing agribusiness" } },
  { id: "food-importers", name: "Food Importers", focus: "import tariffs, food security, price stability",
    quoteTemplates: { supportive: "Import policy supporting food security and price stability", cautious: "Import costs rising — monitoring impact on food prices", opposed: "Import restrictions driving food inflation and shortages" } },
];

export const AGRICULTURE_CONFIG: GovernanceSectionConfig = {
  id: "agriculture",
  label: "Agriculture",
  overview: {
    team: [
      { role: "Minister of Agriculture", portfolioMatch: "Agriculture" },
      { role: "Minister of Water Resources", portfolioMatch: "Water Resources" },
    ],
    charts: AGRICULTURE_OVERVIEW_CHARTS,
    levers: ["landReform", "agricSubsidies"] as PolicyLeverKey[],
    stakeholders: AGRICULTURE_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "agriculture-briefing",
  },
  subsections: [],
};

// ═══════════════════════════════════════════════════════════
// INTERIOR SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const INTERIOR_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "border-security-score", title: "Border Security Score", type: "line", historyKey: "borderSecurityScore", currentKey: "borderSecurityScore" },
  { id: "national-id-penetration", title: "National ID Penetration", type: "line", historyKey: "nationalIdPenetration", currentKey: "nationalIdPenetration" },
  { id: "prison-occupancy-rate", title: "Prison Occupancy Rate", type: "line", historyKey: "prisonOccupancyRate", currentKey: "prisonOccupancyRate" },
];

const INTERIOR_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "police-commission", name: "Police Service Commission", focus: "police reform, deployment, welfare",
    quoteTemplates: { supportive: "Security and police reform moving in the right direction", cautious: "Implementation of reform commitments needs acceleration", opposed: "Police under-resourced and morale at breaking point" } },
  { id: "human-rights-orgs", name: "Human Rights Organisations", focus: "civil liberties, detention conditions, police brutality",
    quoteTemplates: { supportive: "Human rights standards improving under current governance", cautious: "Pockets of abuse and impunity persist", opposed: "Human rights violations systemic and unaddressed" } },
  { id: "immigration-lawyers", name: "Immigration Lawyers", focus: "visa policy, refugee protection, due process",
    quoteTemplates: { supportive: "Immigration processes becoming more transparent and fair", cautious: "Legal delays and due process gaps need attention", opposed: "Immigration policy violating fundamental rights" } },
  { id: "traditional-rulers", name: "Traditional Rulers", focus: "community security, border management, local governance",
    quoteTemplates: { supportive: "Traditional institutions empowered to support community security", cautious: "Local security arrangements need better coordination", opposed: "Communities abandoned — security vacuum deepening" } },
];

export const INTERIOR_CONFIG: GovernanceSectionConfig = {
  id: "interior",
  label: "Interior",
  overview: {
    team: [
      { role: "Minister of Interior", portfolioMatch: "Interior" },
      { role: "Inspector General of Police", portfolioMatch: "Police", lookupSource: "appointments", appointmentPosition: "Inspector General of Police" },
    ],
    charts: INTERIOR_OVERVIEW_CHARTS,
    levers: ["borderPolicy", "nationalIdPush"] as PolicyLeverKey[],
    stakeholders: INTERIOR_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "interior-briefing",
  },
  subsections: [],
};

// ═══════════════════════════════════════════════════════════
// ENVIRONMENT SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const ENVIRONMENT_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "gas-flare-index", title: "Gas Flare Index", type: "line", historyKey: "gasFlareIndex", currentKey: "gasFlareIndex" },
  { id: "climate-adaptation-score", title: "Climate Adaptation Score", type: "line", historyKey: "climateAdaptationScore", currentKey: "climateAdaptationScore" },
  { id: "desertification-index", title: "Desertification Index", type: "line", historyKey: "desertificationIndex", currentKey: "desertificationIndex" },
];

const ENVIRONMENT_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "oil-communities", name: "Oil Producing Communities", focus: "environmental remediation, benefit sharing, pollution",
    quoteTemplates: { supportive: "Communities seeing real remediation and benefit-sharing progress", cautious: "Cleanup and compensation processes still too slow", opposed: "Decades of environmental destruction with no accountability" } },
  { id: "environmental-ngos", name: "Environmental NGOs", focus: "gas flaring, deforestation, climate commitments",
    quoteTemplates: { supportive: "Nigeria's environmental commitments being acted upon", cautious: "Progress on emissions and deforestation remains insufficient", opposed: "Climate pledges meaningless without enforcement action" } },
  { id: "industrial-polluters", name: "Industrial Polluters", focus: "compliance costs, enforcement, transition timelines",
    quoteTemplates: { supportive: "Regulatory environment enabling responsible investment", cautious: "Compliance timelines need to be realistic for industry", opposed: "Overzealous enforcement threatening industrial viability" } },
  { id: "climate-finance", name: "Climate Finance Partners", focus: "green investment, adaptation funding, NDC implementation",
    quoteTemplates: { supportive: "Nigeria on track for climate finance deployment", cautious: "NDC implementation pace needs to accelerate", opposed: "Climate finance at risk without credible policy commitments" } },
];

export const ENVIRONMENT_CONFIG: GovernanceSectionConfig = {
  id: "environment",
  label: "Environment",
  overview: {
    team: [
      { role: "Minister of Environment", portfolioMatch: "Environment" },
      { role: "NNPCL Group CEO", portfolioMatch: "NNPCL", lookupSource: "appointments", appointmentPosition: "NNPCL Group CEO" },
    ],
    charts: ENVIRONMENT_OVERVIEW_CHARTS,
    levers: ["gasFlarePolicy", "climateAdaptation"] as PolicyLeverKey[],
    stakeholders: ENVIRONMENT_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "environment-briefing",
  },
  subsections: [],
};

// ═══════════════════════════════════════════════════════════
// YOUTH & EMPLOYMENT SECTION CONFIG
// ═══════════════════════════════════════════════════════════

const YOUTH_EMPLOYMENT_OVERVIEW_CHARTS: ChartConfig[] = [
  { id: "youth-unemployment-rate", title: "Youth Unemployment Rate", type: "line", historyKey: "youthUnemploymentRate", currentKey: "youthUnemploymentRate" },
  { id: "nysc-deployment-rate", title: "NYSC Deployment Rate", type: "line", historyKey: "nyscDeploymentRate", currentKey: "nyscDeploymentRate" },
  { id: "social-unrest-risk", title: "Social Unrest Risk", type: "line", historyKey: "socialUnrestRisk", currentKey: "socialUnrestRisk" },
];

const YOUTH_EMPLOYMENT_STAKEHOLDERS: StakeholderConfig[] = [
  { id: "nysc-alumni", name: "NYSC Alumni Network", focus: "scheme relevance, graduate employment, deployment conditions",
    quoteTemplates: { supportive: "NYSC reforms improving scheme value and graduate outcomes", cautious: "Deployment conditions and post-service employment need more attention", opposed: "NYSC has become a burden with no tangible graduate benefit" } },
  { id: "tech-startup", name: "Tech Startup Ecosystem", focus: "youth enterprise, digital skills, startup funding",
    quoteTemplates: { supportive: "Policy environment enabling youth entrepreneurship to thrive", cautious: "Funding access and regulatory clarity still holding back startups", opposed: "Tech ecosystem starved of support while youth unemployment soars" } },
  { id: "trade-unions-youth", name: "Youth Wing of Trade Unions", focus: "labour rights, minimum wage, job quality",
    quoteTemplates: { supportive: "Youth labour rights and employment quality improving", cautious: "Minimum wage and informal sector protections still inadequate", opposed: "Young workers exploited in a broken labour market" } },
  { id: "youth-civic", name: "Youth Civic Organisations", focus: "democratic participation, anti-corruption, social justice",
    quoteTemplates: { supportive: "Government engaging youth voices in governance", cautious: "Youth disillusionment still high — more must be done", opposed: "Youth uprising inevitable if government does not act" } },
];

export const YOUTH_EMPLOYMENT_CONFIG: GovernanceSectionConfig = {
  id: "youth-employment",
  label: "Labour",
  overview: {
    team: [
      { role: "Minister of Youth", portfolioMatch: "Youth" },
      { role: "Minister of Labour", portfolioMatch: "Labour" },
    ],
    charts: YOUTH_EMPLOYMENT_OVERVIEW_CHARTS,
    levers: ["nyscReform", "youthEnterprise"] as PolicyLeverKey[],
    stakeholders: YOUTH_EMPLOYMENT_STAKEHOLDERS,
    reforms: [],
    briefingCooldownKey: "youth-employment-briefing",
  },
  subsections: [],
};
