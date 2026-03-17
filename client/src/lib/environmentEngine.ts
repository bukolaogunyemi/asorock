// environmentEngine.ts
import type { PolicyLeverState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects } from "./sectorTypes";
import { computeSectorHealth, evaluateCrisisZone } from "./sectorTypes";

const NEGLECT_THRESHOLD = 6;
const DECAY_RATE = 0.3;

function pos(levers: PolicyLeverState, key: string): string {
  return (levers as any)[key]?.position ?? "";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function processEnvironmentTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 4);

  const gasFlarePolicy = pos(levers, "gasFlarePolicy");
  const climateAdaptation = pos(levers, "climateAdaptation");

  // Gas flare index — lower is better (inverted)
  const gasFlareBaseDelta =
    gasFlarePolicy === "zero-flare" ? -3.0 :
    gasFlarePolicy === "penalties" ? -1.5 :
    0; // tolerance = no change
  ind.gasFlareIndex = clamp(ind.gasFlareIndex + gasFlareBaseDelta * budgetMultiplier, 0, 100);

  // Climate adaptation score — higher is better
  const adaptDelta =
    climateAdaptation === "aggressive" ? 1.0 :
    climateAdaptation === "moderate" ? 0.4 :
    0.1; // minimal
  ind.climateAdaptationScore = clamp(ind.climateAdaptationScore + adaptDelta * budgetMultiplier, 0, 100);

  // Flood displacement risk decreases as climate adaptation rises
  const floodDelta = -(ind.climateAdaptationScore - 20) * 0.03;
  ind.floodDisplacementRisk = clamp(ind.floodDisplacementRisk + floodDelta, 0, 100);

  // Desertification drifts up slowly; adaptation slows it
  const desertDelta = 0.3 - ind.climateAdaptationScore * 0.01;
  ind.desertificationIndex = clamp(ind.desertificationIndex + desertDelta, 0, 100);

  // Carbon intensity decreases as gas flare index falls
  const carbonDelta = (ind.gasFlareIndex - 70) * 0.02;
  ind.carbonIntensity = clamp(ind.carbonIntensity + carbonDelta, 0, 100);

  // Deforestation rate decreases slowly with budget attention
  ind.deforestationRate = clamp(ind.deforestationRate - 0.2 * budgetMultiplier, 0, 100);

  // Neglect decay
  const turnsSinceAttention = state.turnsSinceAttention + 1;
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD);
    ind.climateAdaptationScore = clamp(ind.climateAdaptationScore - decayAmount, 0, 100);
    ind.gasFlareIndex = clamp(ind.gasFlareIndex + decayAmount * 0.5, 0, 100);
    ind.deforestationRate = clamp(ind.deforestationRate + decayAmount * 0.5, 0, 100);
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
    ind.climateAdaptationScore = clamp(ind.climateAdaptationScore * (1 + (boost - 1) * 0.01), 0, 100);
    ind.gasFlareIndex = clamp(ind.gasFlareIndex * (1 - (boost - 1) * 0.01), 0, 100);
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("environment", health);

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
