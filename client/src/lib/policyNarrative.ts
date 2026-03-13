import type { AnyPolicyPosition, PolicyLeverState } from "./gameTypes";

export const POPULIST_POSITIONS = new Set<AnyPolicyPosition>([
  "full", "subsidised", "peg", "accommodative", "low", "generous", "moderate", "restrictive", "union-demand", "populist", "expansion",
]);
export const REFORMIST_POSITIONS = new Set<AnyPolicyPosition>([
  "removed", "market-rate", "free-float", "hawkish", "high", "none", "open", "frozen", "freeze",
]);

export type StanceCategory = "populist" | "reformist" | "neutral";

export function classifyStance(position: AnyPolicyPosition): StanceCategory {
  if (POPULIST_POSITIONS.has(position)) return "populist";
  if (REFORMIST_POSITIONS.has(position)) return "reformist";
  return "neutral";
}

export const STANCE_TEMPLATES: Record<string, string> = {
  "heavy-reformist": "Your administration is pursuing aggressive structural reform — markets may reward discipline, but the streets are watching.",
  "leaning-reformist": "You're tilting toward reform. The IMF approves, but consumer prices are climbing and unions are restless.",
  "balanced": "A pragmatic middle path — you're hedging bets. Stability is steady, but no faction feels truly rewarded.",
  "leaning-populist": "Populist instincts are showing. The masses cheer, but fiscal hawks and foreign investors grow uneasy.",
  "heavy-populist": "Full populism — subsidies flowing, wages rising, tariffs high. The treasury is under strain, but your approval is soaring... for now.",
};

export const COMBINATION_WARNINGS: Array<{ test: (levers: PolicyLeverState) => boolean; message: string }> = [
  {
    test: (l) => l.interestRate.position === "hawkish" && l.publicSectorHiring.position === "freeze",
    message: "Hawkish interest rates combined with a hiring freeze may trigger recession signals.",
  },
  {
    test: (l) => l.fuelSubsidy.position === "removed" && l.cashTransfers.position === "none",
    message: "Removing fuel subsidies without cash transfers will hit the poorest households hardest — expect protests.",
  },
  {
    test: (l) => l.fxPolicy.position === "free-float" && l.importTariffs.position === "open",
    message: "Free-floating the naira with open tariffs risks a flood of cheap imports crushing local industry.",
  },
  {
    test: (l) => l.taxRate.position === "high" && l.minimumWage.position === "populist",
    message: "High taxes with populist wages squeeze businesses from both sides — expect layoffs and capital flight.",
  },
  {
    test: (l) => l.electricityTariff.position === "market-rate" && l.minimumWage.position === "frozen",
    message: "Market-rate electricity with frozen wages means workers can't afford power — social unrest likely.",
  },
  {
    test: (l) => l.fuelSubsidy.position === "full" && l.taxRate.position === "low" && l.cashTransfers.position === "generous",
    message: "Full subsidies, low taxes, and generous transfers — the treasury is hemorrhaging. Debt crisis looms.",
  },
];

export function getStanceKey(levers: PolicyLeverState): string {
  const leverKeys = Object.keys(levers) as (keyof PolicyLeverState)[];
  const counts = { populist: 0, reformist: 0, neutral: 0 };
  for (const key of leverKeys) {
    counts[classifyStance(levers[key].position)]++;
  }
  if (counts.reformist >= 5) return "heavy-reformist";
  if (counts.reformist > counts.populist) return "leaning-reformist";
  if (counts.populist >= 5) return "heavy-populist";
  if (counts.populist > counts.reformist) return "leaning-populist";
  return "balanced";
}
