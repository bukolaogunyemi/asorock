// interiorEngine.ts
import type { PolicyLeverState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects } from "./sectorTypes";
import { computeSectorHealth, evaluateCrisisZone } from "./sectorTypes";

const NEGLECT_THRESHOLD = 5;
const DECAY_RATE = 0.5;

function pos(levers: PolicyLeverState, key: string): string {
  return (levers as any)[key]?.position ?? "";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function processInteriorTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 12);

  const borderPolicy = pos(levers, "borderPolicy");
  const nationalIdPush = pos(levers, "nationalIdPush");

  // Border security score
  const borderDelta =
    borderPolicy === "fortress" ? 1.5 : borderPolicy === "standard" ? 0.5 : -0.5;
  ind.borderSecurityScore = clamp(
    ind.borderSecurityScore + borderDelta * budgetMultiplier,
    0,
    100,
  );

  // National ID penetration
  const idDelta =
    nationalIdPush === "mandatory" ? 1.5 : nationalIdPush === "incentivized" ? 0.8 : 0.2;
  ind.nationalIdPenetration = clamp(
    ind.nationalIdPenetration + idDelta * budgetMultiplier,
    0,
    100,
  );

  // Prison occupancy rate — decreases with rehabilitation investment
  ind.prisonOccupancyRate = clamp(
    ind.prisonOccupancyRate - 2.0 * budgetMultiplier,
    50,
    400,
  );

  // Immigration processing score — improves with national ID and budget
  const immigrationDelta =
    (ind.nationalIdPenetration - 45) * 0.02 + 0.3 * budgetMultiplier;
  ind.immigrationProcessingScore = clamp(
    ind.immigrationProcessingScore + immigrationDelta,
    0,
    100,
  );

  // Correctional rehabilitation rate
  ind.correctionalRehabRate = clamp(
    ind.correctionalRehabRate + 0.2 * budgetMultiplier,
    0,
    100,
  );

  // Cross-sector effects
  if (effects.stability < 40) {
    ind.borderSecurityScore = clamp(ind.borderSecurityScore - 1.0, 0, 100);
  }
  if (effects.youthUnrestRisk > 70) {
    ind.prisonOccupancyRate = clamp(ind.prisonOccupancyRate + 3, 50, 400);
  }

  // Neglect decay
  const turnsSinceAttention = state.turnsSinceAttention + 1;
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD);
    ind.borderSecurityScore = clamp(ind.borderSecurityScore - decayAmount, 0, 100);
    ind.nationalIdPenetration = clamp(ind.nationalIdPenetration - decayAmount * 0.5, 0, 100);
    ind.correctionalRehabRate = clamp(ind.correctionalRehabRate - decayAmount * 0.3, 0, 100);
    ind.immigrationProcessingScore = clamp(
      ind.immigrationProcessingScore - decayAmount * 0.5,
      0,
      100,
    );
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
    ind.borderSecurityScore = clamp(
      ind.borderSecurityScore * (1 + (boost - 1) * 0.01),
      0,
      100,
    );
    ind.nationalIdPenetration = clamp(
      ind.nationalIdPenetration * (1 + (boost - 1) * 0.01),
      0,
      100,
    );
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("interior", health);

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
