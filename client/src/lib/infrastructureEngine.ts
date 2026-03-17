// infrastructureEngine.ts
import type { PolicyLeverState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects } from "./sectorTypes";
import { computeSectorHealth, evaluateCrisisZone } from "./sectorTypes";

const NEGLECT_THRESHOLD = 3;
const DECAY_RATE = 1.5;

function pos(levers: PolicyLeverState, key: string): string {
  return (levers as any)[key]?.position ?? "";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function processInfrastructureTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 27);

  const privatization = pos(levers, "powerPrivatization");
  const oilReform = pos(levers, "oilSectorReform");
  const transport = pos(levers, "transportPriority");
  const digital = pos(levers, "digitalInvestment");

  // Power generation
  const powerDelta = privatization === "full-private" ? 0.15 : privatization === "partial-private" ? 0.08 : 0.02;
  ind.powerGenerationGW = clamp(ind.powerGenerationGW + powerDelta * budgetMultiplier, 0, 15);

  // Transmission loss
  ind.transmissionLossRate = clamp(ind.transmissionLossRate - 0.3 * budgetMultiplier, 5, 60);

  // Oil refining
  const refiningDelta = oilReform === "full-deregulation" ? 1.0 : oilReform === "pib-enforcement" ? 0.5 : 0.1;
  ind.oilRefiningCapacity = clamp(ind.oilRefiningCapacity + refiningDelta * budgetMultiplier, 0, 100);

  // Road network
  const roadDelta = transport === "roads" ? 1.0 : transport === "multimodal" ? 0.5 : 0.2;
  ind.roadNetworkScore = clamp(ind.roadNetworkScore + roadDelta * budgetMultiplier, 0, 100);

  // Rail coverage
  const railDelta = transport === "rail" ? 150 : transport === "multimodal" ? 100 : 20;
  ind.railCoverageKm = clamp(ind.railCoverageKm + railDelta * budgetMultiplier, 0, 10000);

  // Broadband penetration
  const broadbandDelta = digital === "aggressive" ? 1.5 : digital === "moderate" ? 0.8 : 0.2;
  ind.broadbandPenetration = clamp(ind.broadbandPenetration + broadbandDelta * budgetMultiplier, 0, 100);

  // Neglect decay
  const turnsSinceAttention = state.turnsSinceAttention + 1;
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD) * 0.3;
    ind.powerGenerationGW = clamp(ind.powerGenerationGW - decayAmount * 0.1, 0, 15);
    ind.roadNetworkScore = clamp(ind.roadNetworkScore - decayAmount, 0, 100);
    ind.broadbandPenetration = clamp(ind.broadbandPenetration - decayAmount * 0.5, 0, 100);
    ind.transmissionLossRate = clamp(ind.transmissionLossRate + decayAmount * 0.5, 5, 60);
  }

  // Momentum
  let momentum = state.momentum;
  if (turnsSinceAttention <= 1) {
    momentum = Math.min(momentum + 1, 5);
  } else if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    momentum = 0;
  }

  if (momentum > 0) {
    const boost = 1 + momentum * 0.05;
    ind.powerGenerationGW = clamp(ind.powerGenerationGW * (1 + (boost - 1) * 0.01), 0, 15);
    ind.broadbandPenetration = clamp(ind.broadbandPenetration * (1 + (boost - 1) * 0.01), 0, 100);
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("infrastructure", health);

  return {
    ...state,
    indicators: ind,
    health,
    crisisZone,
    momentum,
    turnsSinceAttention,
    activeCascades: state.activeCascades,
  };
}
