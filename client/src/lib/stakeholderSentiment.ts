import type { PolicyLeverState } from "./gameTypes";
import type { EconomicState } from "./economicTypes";
import { ECONOMY_CONFIG } from "./governanceSections";

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

function lte(val: string, threshold: string, order: string[]): boolean {
  return order.indexOf(val) <= order.indexOf(threshold);
}
function gte(val: string, threshold: string, order: string[]): boolean {
  return order.indexOf(val) >= order.indexOf(threshold);
}

function computeIMF(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const fx = pos(levers, "fxPolicy");
  const subsidy = pos(levers, "fuelSubsidy");
  const tax = pos(levers, "taxRate");
  if (fx === "peg" || subsidy === "full") return "opposed";
  if (fx === "free-float" && (subsidy === "removed" || subsidy === "targeted") && gte(tax, "standard", TAX_ORDER)) return "supportive";
  return "cautious";
}

function computeWorldBank(levers: PolicyLeverState, eco: Partial<EconomicState>): Sentiment {
  const transfers = pos(levers, "cashTransfers");
  const inflation = eco.inflation ?? 15;
  const unemployment = eco.unemploymentRate ?? 20;
  const debtToGdp = eco.debtToGdp ?? 30;
  if (transfers === "none" && unemployment > 30) return "opposed";
  if (gte(transfers, "moderate", TRANSFERS_ORDER) && inflation < 15) return "supportive";
  if (unemployment > 25 || debtToGdp > 40) return "cautious";
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

const SENTIMENT_FNS: Record<string, (levers: PolicyLeverState, eco: Partial<EconomicState>) => Sentiment> = {
  imf: computeIMF,
  "world-bank": computeWorldBank,
  business: computeBusiness,
  labour: computeLabour,
  analysts: computeAnalysts,
};

export function computeStakeholderSentiment(
  stakeholderId: string,
  levers: PolicyLeverState,
  economy: Partial<EconomicState>,
): StakeholderSentiment {
  const config = ECONOMY_CONFIG.overview.stakeholders.find(s => s.id === stakeholderId);
  if (!config) throw new Error(`Unknown stakeholder: ${stakeholderId}`);
  const fn = SENTIMENT_FNS[stakeholderId];
  if (!fn) throw new Error(`No sentiment function for: ${stakeholderId}`);
  const sentiment = fn(levers, economy);
  const quote = config.quoteTemplates[sentiment];
  return { id: stakeholderId, name: config.name, sentiment, quote };
}

export function computeAllStakeholderSentiments(
  levers: PolicyLeverState,
  economy: Partial<EconomicState>,
): StakeholderSentiment[] {
  return ECONOMY_CONFIG.overview.stakeholders.map(s => computeStakeholderSentiment(s.id, levers, economy));
}
