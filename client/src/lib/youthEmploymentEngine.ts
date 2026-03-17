// youthEmploymentEngine.ts
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

export function processYouthEmploymentTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 6);

  const nyscReform = pos(levers, "nyscReform");
  const youthEnterprise = pos(levers, "youthEnterprise");

  // Youth unemployment rate — baseline drift from economy
  const unemploymentDrift = (effects.unemploymentRate - 25) * 0.1;
  let youthUnemploymentDelta = unemploymentDrift;
  if (youthEnterprise === "public-works") {
    youthUnemploymentDelta -= 1.5;
  } else if (youthEnterprise === "startup-ecosystem") {
    youthUnemploymentDelta -= 0.5; // delayed effect
  }
  // minimal: no additional delta
  ind.youthUnemploymentRate = clamp(
    ind.youthUnemploymentRate + youthUnemploymentDelta,
    0,
    100,
  );

  // Startup formation rate — increases with startup-ecosystem × digitalIndex/100
  const startupActive = youthEnterprise === "startup-ecosystem";
  const startupDelta =
    (startupActive ? 1.5 : 0.2) * (effects.digitalIndex / 38) * budgetMultiplier;
  ind.startupFormationRate = clamp(ind.startupFormationRate + startupDelta, 0, 100);

  // NYSC deployment rate
  let nyscDelta: number;
  if (nyscReform === "reformed") {
    nyscDelta = 1.0;
  } else if (nyscReform === "scrapped") {
    ind.nyscDeploymentRate = 0;
    nyscDelta = 0;
  } else {
    // status-quo
    nyscDelta = 0.2;
  }
  if (nyscReform !== "scrapped") {
    ind.nyscDeploymentRate = clamp(ind.nyscDeploymentRate + nyscDelta, 0, 100);
  }

  // Skills program enrollment — rises with budget attention
  ind.skillsProgramEnrollment = clamp(
    ind.skillsProgramEnrollment + 0.3 * budgetMultiplier,
    0,
    100,
  );

  // Social unrest risk — function of youth unemployment, ASUU strike, stability
  const unrestBaseDrift = 0.0;
  const unrestDelta =
    unrestBaseDrift +
    (ind.youthUnemploymentRate - 42) * 0.2 +
    (effects.asuuStrikeActive ? 3 : 0) +
    (60 - effects.stability) * 0.1;
  ind.socialUnrestRisk = clamp(ind.socialUnrestRisk + unrestDelta, 0, 100);

  // Neglect decay
  const turnsSinceAttention = state.turnsSinceAttention + 1;
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD) * 0.3;
    ind.nyscDeploymentRate = clamp(ind.nyscDeploymentRate - decayAmount, 0, 100);
    ind.skillsProgramEnrollment = clamp(ind.skillsProgramEnrollment - decayAmount, 0, 100);
    ind.startupFormationRate = clamp(ind.startupFormationRate - decayAmount * 0.5, 0, 100);
    ind.youthUnemploymentRate = clamp(ind.youthUnemploymentRate + decayAmount * 0.5, 0, 100);
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
    ind.startupFormationRate = clamp(
      ind.startupFormationRate * (1 + (boost - 1) * 0.01),
      0,
      100,
    );
    ind.skillsProgramEnrollment = clamp(
      ind.skillsProgramEnrollment * (1 + (boost - 1) * 0.01),
      0,
      100,
    );
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("youthEmployment", health);

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
