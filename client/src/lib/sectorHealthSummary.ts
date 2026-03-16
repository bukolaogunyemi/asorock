import type { EconomicState } from "./economicTypes";

type Zone = "green" | "yellow" | "red";
type HealthStatus = "green" | "amber" | "red";

interface HealthSummary {
  status: HealthStatus;
  summary: string;
}

const ZONE_KEYS = [
  "inflationZone", "unemploymentZone", "fxZone",
  "debtZone", "treasuryZone", "oilOutputZone",
] as const;

function countZones(ci: EconomicState["crisisIndicators"]): { red: number; yellow: number } {
  let red = 0;
  let yellow = 0;
  for (const key of ZONE_KEYS) {
    const zone: Zone = ci[key];
    if (zone === "red") red++;
    else if (zone === "yellow") yellow++;
  }
  return { red, yellow };
}

function deriveStatus(red: number, yellow: number): HealthStatus {
  if (red >= 2) return "red";
  if (red >= 1 || yellow >= 1) return "amber";
  return "green";
}

function buildSummary(eco: EconomicState, status: HealthStatus): string {
  const ci = eco.crisisIndicators;
  const concerns: string[] = [];

  if (ci.inflationZone === "red") concerns.push(`Inflation is spiraling at ${eco.inflation.toFixed(1)}%`);
  else if (ci.inflationZone === "yellow") concerns.push(`Inflation at ${eco.inflation.toFixed(1)}% is above target`);

  if (ci.fxZone === "red") concerns.push(`the naira has weakened to ₦${Math.round(eco.fxRate)}/$`);
  else if (ci.fxZone === "yellow") concerns.push(`FX rate at ₦${Math.round(eco.fxRate)}/$ is under pressure`);

  if (ci.unemploymentZone === "red") concerns.push(`unemployment has reached ${eco.unemploymentRate.toFixed(1)}%`);
  else if (ci.unemploymentZone === "yellow") concerns.push(`unemployment at ${eco.unemploymentRate.toFixed(1)}% is concerning`);

  if (ci.debtZone === "red") concerns.push(`debt-to-GDP at ${eco.debtToGdp.toFixed(1)}% is unsustainable`);
  else if (ci.debtZone === "yellow") concerns.push(`debt-to-GDP at ${eco.debtToGdp.toFixed(1)}% needs monitoring`);

  if (ci.treasuryZone === "red") concerns.push("treasury reserves are critically low");
  else if (ci.treasuryZone === "yellow") concerns.push("treasury liquidity is tightening");

  if (ci.oilOutputZone === "red") concerns.push("oil output has fallen sharply");
  else if (ci.oilOutputZone === "yellow") concerns.push("oil output is below target");

  if (status === "red") {
    const detail = concerns.slice(0, 3).join(" while ");
    return `The economy is in crisis. ${detail}. Urgent intervention required.`;
  }

  if (status === "amber") {
    const detail = concerns.slice(0, 2).join(" but ");
    const tail = concerns.length <= 1
      ? "Your team is monitoring closely."
      : "Further deterioration may trigger a crisis.";
    return `Economic conditions are mixed. ${detail}. ${tail}`;
  }

  if (eco.gdpGrowthRate > 3) {
    return `The economy is performing well. GDP growth at ${eco.gdpGrowthRate.toFixed(1)}% is strong. Continue current policy trajectory.`;
  }
  return "The economy is stable. Key indicators are within acceptable ranges. Continue current policy trajectory.";
}

export function computeEconomySummary(economy: EconomicState): HealthSummary {
  const { red, yellow } = countZones(economy.crisisIndicators);
  const status = deriveStatus(red, yellow);
  const summary = buildSummary(economy, status);
  return { status, summary };
}
