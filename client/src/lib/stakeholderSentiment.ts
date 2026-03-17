import type { PolicyLeverState } from "./gameTypes";
import type { EconomicState } from "./economicTypes";
import { ECONOMY_CONFIG, type StakeholderConfig } from "./governanceSections";

export type Sentiment = "supportive" | "cautious" | "opposed";

export interface StakeholderSentiment {
  id: string;
  name: string;
  sentiment: Sentiment;
  quote: string;
}

type LeverPos = string;
function pos(levers: PolicyLeverState, key: string): LeverPos {
  return (levers as unknown as Record<string, { position: string }>)[key]?.position ?? "";
}

const TAX_ORDER = ["low", "standard", "elevated", "high"];
const TARIFF_ORDER = ["open", "moderate", "protective", "restrictive"];
const TRANSFERS_ORDER = ["none", "minimal", "moderate", "generous"];
const INTEREST_ORDER = ["dovish", "neutral", "hawkish"];

function lte(val: string, threshold: string, order: string[]): boolean {
  return order.indexOf(val) <= order.indexOf(threshold);
}
function gte(val: string, threshold: string, order: string[]): boolean {
  return order.indexOf(val) >= order.indexOf(threshold);
}

/* ─── Overview stakeholder functions ───────────────────────── */

function computeInternational(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const fx = pos(levers, "fxPolicy");
  const subsidy = pos(levers, "fuelSubsidy");
  const tax = pos(levers, "taxRate");
  const transfers = pos(levers, "cashTransfers");
  const unemployment = eco.unemploymentRate ?? 20;
  const inflation = eco.inflation ?? 15;

  if (fx === "peg" || subsidy === "full") return "opposed";
  if (transfers === "none" && unemployment > 30) return "opposed";

  const reformOk = fx === "free-float" && (subsidy === "removed" || subsidy === "targeted") && gte(tax, "standard", TAX_ORDER);
  const socialOk = gte(transfers, "moderate", TRANSFERS_ORDER) && inflation < 15;
  if (reformOk && socialOk) return "supportive";
  if (reformOk || socialOk) return "cautious";

  return "cautious";
}

function computeBusiness(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const tax = pos(levers, "taxRate");
  const tariffs = pos(levers, "importTariffs");
  const fx = pos(levers, "fxPolicy");
  const inflation = eco.inflation ?? 12;
  const fxRate = eco.fxRate ?? 900;
  if (tax === "high" || tariffs === "restrictive") return "opposed";
  if (lte(tax, "standard", TAX_ORDER) && lte(tariffs, "moderate", TARIFF_ORDER) && fx !== "peg") return "supportive";
  if (inflation > 15 || fxRate > 1200) return "cautious";
  return "cautious";
}

function computeLabour(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const wage = pos(levers, "minimumWage");
  const hiring = pos(levers, "publicSectorHiring");
  const subsidy = pos(levers, "fuelSubsidy");
  const transfers = pos(levers, "cashTransfers");
  if (subsidy === "removed" && lte(transfers, "minimal", TRANSFERS_ORDER)) return "opposed";
  if ((wage === "union-demand" || wage === "populist") && (hiring === "normal" || hiring === "expansion")) return "supportive";
  if (subsidy === "partial" || wage === "modest") return "cautious";
  return "cautious";
}

function computeAnalysts(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const reserves = eco.reserves ?? 25;
  const debtToGdp = eco.debtToGdp ?? 35;
  const inflation = eco.inflation ?? 15;
  if (reserves < 15 || debtToGdp > 50) return "opposed";
  if (reserves > 30 && debtToGdp < 35 && inflation < 12) return "supportive";
  if (reserves < 25 || inflation > 18) return "cautious";
  return "cautious";
}

/* ─── Subsection-specific stakeholder functions ────────────── */

/** Oil & Gas Sector — wants stable FX, low tariffs for equipment, high output */
function computeOilIndustry(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const fx = pos(levers, "fxPolicy");
  const tariffs = pos(levers, "importTariffs");
  const oilOutput = eco.oilOutput ?? 1.5;
  if (fx === "peg") return "opposed";
  if (oilOutput < 1.2) return "opposed";
  if (fx === "free-float" && lte(tariffs, "moderate", TARIFF_ORDER) && oilOutput >= 1.5) return "supportive";
  return "cautious";
}

/** Bond Investors — want manageable debt, good reserves, controlled inflation */
function computeBondMarket(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const debtToGdp = eco.debtToGdp ?? 35;
  const reserves = eco.reserves ?? 25;
  const inflation = eco.inflation ?? 15;
  const interestRate = pos(levers, "interestRate");
  if (debtToGdp > 50 || reserves < 15) return "opposed";
  if (interestRate === "dovish" && inflation > 18) return "opposed";
  if (debtToGdp < 35 && reserves > 25 && inflation < 15) return "supportive";
  return "cautious";
}

/** Manufacturers Association — want protective tariffs, stable FX, low rates */
function computeManufacturers(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const tariffs = pos(levers, "importTariffs");
  const fx = pos(levers, "fxPolicy");
  const interestRate = pos(levers, "interestRate");
  if (tariffs === "open") return "opposed";
  if (gte(tariffs, "protective", TARIFF_ORDER) && fx !== "peg" && !gte(interestRate, "hawkish", INTEREST_ORDER)) return "supportive";
  return "cautious";
}

/* ─── Infrastructure stakeholder functions ──────────────────── */

/** Power Unions — favor state-run power, oppose full privatization */
function computePowerUnions(levers: PolicyLeverState): Sentiment {
  const priv = pos(levers, "powerPrivatization");
  if (priv === "full-private") return "opposed";
  if (priv === "state-run") return "supportive";
  return "cautious";
}

/** Telecom Industry — favor aggressive digital investment */
function computeTelecomIndustry(levers: PolicyLeverState): Sentiment {
  const digital = pos(levers, "digitalInvestment");
  if (digital === "aggressive") return "supportive";
  if (digital === "minimal") return "opposed";
  return "cautious";
}

/** Construction Lobby — favor roads transport priority and high infrastructure budget */
function computeConstructionLobby(levers: PolicyLeverState): Sentiment {
  const transport = pos(levers, "transportPriority");
  const digital = pos(levers, "digitalInvestment");
  if (transport === "roads") return "supportive";
  if (transport === "multimodal" && digital !== "minimal") return "cautious";
  return "cautious";
}

/** International Development Partners — favor reform, privatization, transparency */
function computeInternationalDevPartners(levers: PolicyLeverState): Sentiment {
  const priv = pos(levers, "powerPrivatization");
  const digital = pos(levers, "digitalInvestment");
  const fx = pos(levers, "fxPolicy");
  if (priv === "full-private" && digital === "aggressive") return "supportive";
  if (priv === "state-run" && fx === "peg") return "opposed";
  return "cautious";
}

/* ─── Health stakeholder functions ─────────────────────────── */

/** Nigerian Medical Association — favor expanded funding, resist outsourced procurement */
function computeNma(levers: PolicyLeverState): Sentiment {
  const funding = pos(levers, "healthcareFunding");
  const procurement = pos(levers, "drugProcurement");
  if (funding === "universal-push" && procurement !== "international-partnership") return "supportive";
  if (funding === "underfunded") return "opposed";
  return "cautious";
}

/** Pharma Industry — favor open-tender drug procurement */
function computePharmaIndustry(levers: PolicyLeverState): Sentiment {
  const procurement = pos(levers, "drugProcurement");
  if (procurement === "open-tender") return "supportive";
  if (procurement === "local-preference") return "cautious";
  return "cautious";
}

/** WHO / Global Fund — favor expanded funding and centralized procurement */
function computeWhoGlobalFund(levers: PolicyLeverState): Sentiment {
  const funding = pos(levers, "healthcareFunding");
  const procurement = pos(levers, "drugProcurement");
  if (funding === "universal-push" && procurement === "international-partnership") return "supportive";
  if (funding === "underfunded") return "opposed";
  return "cautious";
}

/** Patient Advocacy — favor expanded healthcare funding */
function computePatientAdvocacy(levers: PolicyLeverState): Sentiment {
  const funding = pos(levers, "healthcareFunding");
  if (funding === "universal-push") return "supportive";
  if (funding === "underfunded") return "opposed";
  return "cautious";
}

/* ─── Education stakeholder functions ──────────────────────── */

/** ASUU — favor university autonomy (autonomous), oppose centralized */
function computeAsuu(levers: PolicyLeverState): Sentiment {
  const autonomy = pos(levers, "universityAutonomy");
  if (autonomy === "full-autonomy") return "supportive";
  if (autonomy === "centralized") return "opposed";
  return "cautious";
}

/** NUT (Nigeria Union of Teachers) — favor primary-heavy budget split */
function computeNut(levers: PolicyLeverState): Sentiment {
  const split = pos(levers, "educationBudgetSplit");
  if (split === "basic-heavy") return "supportive";
  if (split === "tertiary-heavy") return "opposed";
  return "cautious";
}

/** Private Education Sector — favor deregulated (full) autonomy */
function computePrivateEducation(levers: PolicyLeverState): Sentiment {
  const autonomy = pos(levers, "universityAutonomy");
  if (autonomy === "full-autonomy") return "supportive";
  if (autonomy === "centralized") return "opposed";
  return "cautious";
}

/** Student Unions — favor balanced budget split and expanded funding */
function computeStudentUnions(levers: PolicyLeverState): Sentiment {
  const split = pos(levers, "educationBudgetSplit");
  const autonomy = pos(levers, "universityAutonomy");
  if (split === "balanced" && autonomy !== "centralized") return "supportive";
  if (split === "basic-heavy" && autonomy === "centralized") return "opposed";
  return "cautious";
}

/* ─── Agriculture stakeholder functions ─────────────────────── */

/** Farmers Associations — favor communal land reform, input subsidies */
function computeFarmersAssociations(levers: PolicyLeverState): Sentiment {
  const land = pos(levers, "landReform");
  const subsidies = pos(levers, "agricSubsidies");
  if (land === "communal" && subsidies === "input-subsidies") return "supportive";
  if (land === "titling-program" && subsidies === "none") return "opposed";
  return "cautious";
}

/** Herder Cooperatives — favor communal land reform */
function computeHerderCooperatives(levers: PolicyLeverState): Sentiment {
  const land = pos(levers, "landReform");
  if (land === "communal") return "supportive";
  if (land === "titling-program") return "opposed";
  return "cautious";
}

/** Agribusiness Exporters — favor commercial (titling) land reform, market-price subsidy approach */
function computeAgribusinessExporters(levers: PolicyLeverState): Sentiment {
  const land = pos(levers, "landReform");
  const subsidies = pos(levers, "agricSubsidies");
  if (land === "titling-program" && subsidies === "full-mechanization") return "supportive";
  if (land === "communal" && subsidies === "none") return "opposed";
  return "cautious";
}

/** Food Importers — oppose subsidies and protectionist policies (favor none subsidy) */
function computeFoodImporters(levers: PolicyLeverState): Sentiment {
  const subsidies = pos(levers, "agricSubsidies");
  const tariffs = pos(levers, "importTariffs");
  if (subsidies === "none" && lte(tariffs, "moderate", TARIFF_ORDER)) return "supportive";
  if (subsidies === "full-mechanization" && gte(tariffs, "protective", TARIFF_ORDER)) return "opposed";
  return "cautious";
}

/* ─── Interior stakeholder functions ───────────────────────── */

/** Police Commission — favor fortress border, mandatory national ID */
function computePoliceCommission(levers: PolicyLeverState): Sentiment {
  const border = pos(levers, "borderPolicy");
  const id = pos(levers, "nationalIdPush");
  if (border === "fortress" && id === "mandatory") return "supportive";
  if (border === "porous" && id === "voluntary") return "opposed";
  return "cautious";
}

/** Human Rights Orgs — oppose fortress border, favor voluntary national ID */
function computeHumanRightsOrgs(levers: PolicyLeverState): Sentiment {
  const border = pos(levers, "borderPolicy");
  const id = pos(levers, "nationalIdPush");
  if (border !== "fortress" && id === "voluntary") return "supportive";
  if (border === "fortress" && id === "mandatory") return "opposed";
  return "cautious";
}

/** Immigration Lawyers — favor standard border policy */
function computeImmigrationLawyers(levers: PolicyLeverState): Sentiment {
  const border = pos(levers, "borderPolicy");
  if (border === "standard") return "supportive";
  if (border === "fortress") return "cautious";
  return "cautious";
}

/** Traditional Rulers — favor voluntary ID, standard border */
function computeTraditionalRulers(levers: PolicyLeverState): Sentiment {
  const border = pos(levers, "borderPolicy");
  const id = pos(levers, "nationalIdPush");
  if (border === "standard" && id === "voluntary") return "supportive";
  if (border === "fortress" && id === "mandatory") return "opposed";
  return "cautious";
}

/* ─── Environment stakeholder functions ─────────────────────── */

/** Oil Communities — favor zero-flare gas policy, aggressive climate adaptation */
function computeOilCommunities(levers: PolicyLeverState): Sentiment {
  const flare = pos(levers, "gasFlarePolicy");
  const climate = pos(levers, "climateAdaptation");
  if (flare === "zero-flare" && climate === "aggressive") return "supportive";
  if (flare === "tolerance" && climate === "minimal") return "opposed";
  return "cautious";
}

/** Environmental NGOs — favor zero-flare, aggressive adaptation */
function computeEnvironmentalNgos(levers: PolicyLeverState): Sentiment {
  const flare = pos(levers, "gasFlarePolicy");
  const climate = pos(levers, "climateAdaptation");
  if (flare === "zero-flare" && climate === "aggressive") return "supportive";
  if (flare === "tolerance" || climate === "minimal") return "opposed";
  return "cautious";
}

/** Industrial Polluters — favor tolerance gas flare, minimal adaptation */
function computeIndustrialPolluters(levers: PolicyLeverState): Sentiment {
  const flare = pos(levers, "gasFlarePolicy");
  const climate = pos(levers, "climateAdaptation");
  if (flare === "tolerance" && climate === "minimal") return "supportive";
  if (flare === "zero-flare" || climate === "aggressive") return "opposed";
  return "cautious";
}

/** Climate Finance — favor aggressive adaptation, zero-flare */
function computeClimateFinance(levers: PolicyLeverState): Sentiment {
  const flare = pos(levers, "gasFlarePolicy");
  const climate = pos(levers, "climateAdaptation");
  if (flare === "zero-flare" && climate === "aggressive") return "supportive";
  if (flare === "tolerance" && climate === "minimal") return "opposed";
  return "cautious";
}

/* ─── Youth & Employment stakeholder functions ──────────────── */

/** NYSC Alumni — favor reformed NYSC, oppose scrapped */
function computeNyscAlumni(levers: PolicyLeverState): Sentiment {
  const nysc = pos(levers, "nyscReform");
  if (nysc === "reformed") return "supportive";
  if (nysc === "scrapped") return "opposed";
  return "cautious";
}

/** Tech Startup Ecosystem — favor startup-ecosystem youth enterprise, aggressive digital investment */
function computeTechStartup(levers: PolicyLeverState): Sentiment {
  const enterprise = pos(levers, "youthEnterprise");
  const digital = pos(levers, "digitalInvestment");
  if (enterprise === "startup-ecosystem" && digital === "aggressive") return "supportive";
  if (enterprise === "public-works" && digital === "minimal") return "opposed";
  return "cautious";
}

/** Trade Unions (Youth) — favor public-works youth enterprise */
function computeTradeUnionsYouth(levers: PolicyLeverState): Sentiment {
  const enterprise = pos(levers, "youthEnterprise");
  if (enterprise === "public-works") return "supportive";
  if (enterprise === "startup-ecosystem") return "cautious";
  return "cautious";
}

/** Youth Civic Groups — favor reformed NYSC, moderate enterprise */
function computeYouthCivic(levers: PolicyLeverState): Sentiment {
  const nysc = pos(levers, "nyscReform");
  const enterprise = pos(levers, "youthEnterprise");
  if (nysc === "reformed" && enterprise !== "minimal") return "supportive";
  if (nysc === "scrapped" && enterprise === "minimal") return "opposed";
  return "cautious";
}

/* ─── Registry ─────────────────────────────────────────────── */

const SENTIMENT_FNS: Record<string, (levers: PolicyLeverState, eco: Partial<EconomicState>) => Sentiment> = {
  international: computeInternational,
  business: computeBusiness,
  labour: computeLabour,
  analysts: computeAnalysts,
  "oil-industry": computeOilIndustry,
  "bond-market": computeBondMarket,
  manufacturers: computeManufacturers,
  // Infrastructure
  "power-unions": (levers) => computePowerUnions(levers),
  "telecom-industry": (levers) => computeTelecomIndustry(levers),
  "construction-lobby": (levers) => computeConstructionLobby(levers),
  "international-development-partners": (levers) => computeInternationalDevPartners(levers),
  // Health
  nma: (levers) => computeNma(levers),
  "pharma-industry": (levers) => computePharmaIndustry(levers),
  "who-global-fund": (levers) => computeWhoGlobalFund(levers),
  "patient-advocacy": (levers) => computePatientAdvocacy(levers),
  // Education
  asuu: (levers) => computeAsuu(levers),
  nut: (levers) => computeNut(levers),
  "private-education": (levers) => computePrivateEducation(levers),
  "student-unions": (levers) => computeStudentUnions(levers),
  // Agriculture
  "farmers-associations": (levers) => computeFarmersAssociations(levers),
  "herder-cooperatives": (levers) => computeHerderCooperatives(levers),
  "agribusiness-exporters": (levers) => computeAgribusinessExporters(levers),
  "food-importers": (levers) => computeFoodImporters(levers),
  // Interior
  "police-commission": (levers) => computePoliceCommission(levers),
  "human-rights-orgs": (levers) => computeHumanRightsOrgs(levers),
  "immigration-lawyers": (levers) => computeImmigrationLawyers(levers),
  "traditional-rulers": (levers) => computeTraditionalRulers(levers),
  // Environment
  "oil-communities": (levers) => computeOilCommunities(levers),
  "environmental-ngos": (levers) => computeEnvironmentalNgos(levers),
  "industrial-polluters": (levers) => computeIndustrialPolluters(levers),
  "climate-finance": (levers) => computeClimateFinance(levers),
  // Youth & Employment
  "nysc-alumni": (levers) => computeNyscAlumni(levers),
  "tech-startup": (levers) => computeTechStartup(levers),
  "trade-unions-youth": (levers) => computeTradeUnionsYouth(levers),
  "youth-civic": (levers) => computeYouthCivic(levers),
};

/* ─── Public API ───────────────────────────────────────────── */

export function computeStakeholderSentiment(
  stakeholderId: string,
  levers: PolicyLeverState,
  economy: Partial<EconomicState>,
  config?: StakeholderConfig,
): StakeholderSentiment {
  const cfg = config ?? ECONOMY_CONFIG.overview.stakeholders.find(s => s.id === stakeholderId);
  if (!cfg) throw new Error(`Unknown stakeholder: ${stakeholderId}`);
  const fn = SENTIMENT_FNS[stakeholderId];
  if (!fn) throw new Error(`No sentiment function for: ${stakeholderId}`);
  const sentiment = fn(levers, economy);
  const quote = cfg.quoteTemplates[sentiment];
  return { id: stakeholderId, name: cfg.name, sentiment, quote };
}

export function computeAllStakeholderSentiments(
  levers: PolicyLeverState,
  economy: Partial<EconomicState>,
  stakeholders?: StakeholderConfig[],
): StakeholderSentiment[] {
  const configs = stakeholders ?? ECONOMY_CONFIG.overview.stakeholders;
  return configs.map(s => computeStakeholderSentiment(s.id, levers, economy, s));
}
