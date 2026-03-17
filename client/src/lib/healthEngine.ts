// healthEngine.ts
import type { PolicyLeverState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects } from "./sectorTypes";
import { computeSectorHealth, evaluateCrisisZone } from "./sectorTypes";

const NEGLECT_THRESHOLD = 4;
const DECAY_RATE = 1.0;

function pos(levers: PolicyLeverState, key: string): string {
  return (levers as any)[key]?.position ?? "";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function processHealthTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 10);

  const healthcareLever = pos(levers, "healthcareFunding");
  const drugLever = pos(levers, "drugProcurement");

  // Power supply factor — low power reduces PHC coverage improvement
  const powerFactor = effects.powerSupplyFactor < 0.3 ? 0.5 : 1.0;

  // PHC Coverage
  const phcLeverMult =
    healthcareLever === "universal-push" ? 1.0 : healthcareLever === "basic" ? 0.3 : -0.5;
  const phcDelta = phcLeverMult * budgetMultiplier * powerFactor;
  ind.phcCoverage = clamp(ind.phcCoverage + phcDelta, 0, 100);

  // Health Worker Density
  const hwdDelta =
    healthcareLever === "universal-push" ? 0.05 : healthcareLever === "basic" ? 0.02 : -0.02;
  ind.healthWorkerDensity = clamp(ind.healthWorkerDensity + hwdDelta, 0, 4.45);

  // Hospital Bed Ratio (increases slowly with budget)
  const bedDelta = 0.01 * budgetMultiplier;
  ind.hospitalBedRatio = clamp(ind.hospitalBedRatio + bedDelta, 0, 3.0);

  // Immunization Rate (tied to PHC coverage improvement)
  const immunDelta = (ind.phcCoverage - 40) * 0.03;
  ind.immunizationRate = clamp(ind.immunizationRate + immunDelta, 0, 100);

  // Epidemic Risk
  let epidemicDelta = 0;
  if (ind.healthWorkerDensity < 1.0) epidemicDelta += 2;
  if (ind.phcCoverage < 30) epidemicDelta += 1.5;
  if (ind.phcCoverage >= 30) epidemicDelta -= 0.5;
  // Cross-sector: low stability increases epidemic risk
  if (effects.stability < 40) epidemicDelta += 1.0;
  ind.epidemicRisk = clamp(ind.epidemicRisk + epidemicDelta, 0, 100);

  // Out-of-pocket spend
  const oopDelta =
    healthcareLever === "universal-push"
      ? -1.0
      : healthcareLever === "underfunded"
        ? 0.5
        : 0;
  // drugProcurement also affects out-of-pocket
  const drugOopDelta = drugLever === "international-partnership" ? -0.5 : 0;
  ind.outOfPocketSpendPct = clamp(ind.outOfPocketSpendPct + oopDelta + drugOopDelta, 0, 100);

  // Neglect decay
  const turnsSinceAttention = state.turnsSinceAttention + 1;
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD) * 0.3;
    ind.phcCoverage = clamp(ind.phcCoverage - decayAmount, 0, 100);
    ind.immunizationRate = clamp(ind.immunizationRate - decayAmount * 0.5, 0, 100);
    ind.healthWorkerDensity = clamp(ind.healthWorkerDensity - decayAmount * 0.02, 0, 4.45);
    ind.epidemicRisk = clamp(ind.epidemicRisk + decayAmount * 0.5, 0, 100);
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
    ind.phcCoverage = clamp(ind.phcCoverage * (1 + (boost - 1) * 0.01), 0, 100);
    ind.immunizationRate = clamp(ind.immunizationRate * (1 + (boost - 1) * 0.01), 0, 100);
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("health", health);

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
