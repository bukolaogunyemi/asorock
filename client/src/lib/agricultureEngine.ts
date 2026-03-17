// agricultureEngine.ts
import type { PolicyLeverState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects } from "./sectorTypes";
import { computeSectorHealth, evaluateCrisisZone } from "./sectorTypes";

const NEGLECT_THRESHOLD = 3;
const DECAY_RATE = 1.2;

function pos(levers: PolicyLeverState, key: string): string {
  return (levers as any)[key]?.position ?? "";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function processAgricultureTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 6); // 6% baseline

  const landReform = pos(levers, "landReform");
  const subsidies = pos(levers, "agricSubsidies");

  // Determine whether the player is actively attending to this sector
  const isAttending =
    subsidies !== "none" ||
    landReform !== "communal";

  // Neglect decay
  const turnsSinceAttention = isAttending ? 0 : state.turnsSinceAttention + 1;

  // Mechanization
  const mechDelta = (subsidies === "full-mechanization" ? 1.5 : subsidies === "input-subsidies" ? 0.5 : 0)
    + (landReform === "titling-program" ? 0.5 : landReform === "mixed" ? 0.2 : 0);
  ind.mechanizationRate = clamp(ind.mechanizationRate + mechDelta * budgetMultiplier, 0, 100);

  // Crop output
  const transportBonus = (effects.transportScore - 35) * 0.02;
  const resilienceBonus = (effects.agriculturalResilience - 20) * 0.03;
  const cropDelta = (ind.mechanizationRate - 15) * 0.02 + transportBonus + resilienceBonus;
  ind.cropOutputIndex = clamp(ind.cropOutputIndex + cropDelta * budgetMultiplier, 0, 100);

  // Post-harvest loss
  const postHarvestImprovement = (effects.transportScore - 25) * 0.03;
  ind.postHarvestLossPct = clamp(ind.postHarvestLossPct - postHarvestImprovement * budgetMultiplier, 5, 60);

  // Food price index
  const outputEffect = (55 - ind.cropOutputIndex) * 0.1;
  const inflationEffect = (effects.inflation - 15) * 0.15;
  const importEffect = ind.foodImportDependency * 0.02;
  ind.foodPriceIndex = clamp(ind.foodPriceIndex + outputEffect + inflationEffect + importEffect, 0, 100);

  // Food import dependency
  const importDelta = ind.cropOutputIndex > 60 ? -0.3 : ind.cropOutputIndex < 40 ? 0.3 : 0;
  ind.foodImportDependency = clamp(ind.foodImportDependency + importDelta, 0, 100);

  // Herder-farmer tension
  const landTension = landReform === "titling-program" ? 3 : landReform === "mixed" ? 1 : 0;
  const stabilityEffect = (60 - effects.stability) * 0.05;
  const desertPressure = effects.disasterRisk > 60 ? 1.5 : 0;
  ind.herderFarmerTension = clamp(ind.herderFarmerTension + landTension + stabilityEffect + desertPressure - 0.5, 0, 100);

  // Apply neglect decay
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD) * 0.3;
    ind.cropOutputIndex = clamp(ind.cropOutputIndex - decayAmount, 0, 100);
    ind.mechanizationRate = clamp(ind.mechanizationRate - decayAmount * 0.3, 0, 100);
    ind.postHarvestLossPct = clamp(ind.postHarvestLossPct + decayAmount * 0.5, 5, 60);
  }

  // Momentum
  let momentum = state.momentum;
  if (turnsSinceAttention <= 1) {
    momentum = Math.min(momentum + 1, 5);
  } else if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    momentum = 0;
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("agriculture", health);

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
