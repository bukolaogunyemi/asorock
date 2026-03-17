// educationEngine.ts
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

export function processEducationTurn(
  state: GovernanceSectorState,
  levers: PolicyLeverState,
  effects: CrossSectorEffects,
  budgetPct: number,
): GovernanceSectorState {
  const ind = { ...state.indicators };
  const budgetMultiplier = Math.max(0.5, budgetPct / 13);

  const autonomy = pos(levers, "universityAutonomy");
  const budgetSplit = pos(levers, "educationBudgetSplit");

  // Enrollment rate — rises based on basic-heavy vs balanced vs tertiary-heavy split
  const enrollmentDelta =
    budgetSplit === "basic-heavy" ? 0.5 :
    budgetSplit === "balanced" ? 0.3 :
    0.1; // tertiary-heavy

  // Cross-sector: low power supply reduces enrollment improvement by 30%
  const powerPenalty = effects.powerSupplyFactor < 0.3 ? 0.7 : 1.0;
  ind.enrollmentRate = clamp(
    ind.enrollmentRate + enrollmentDelta * budgetMultiplier * powerPenalty,
    0,
    100,
  );

  // Out-of-school children — decreases as enrollment rises
  const outOfSchoolDelta = -(ind.enrollmentRate - 62) * 0.02;
  ind.outOfSchoolChildren = clamp(ind.outOfSchoolChildren + outOfSchoolDelta, 0, 25);

  // Literacy rate — rises very slowly
  ind.literacyRate = clamp(ind.literacyRate + 0.1 * budgetMultiplier, 0, 100);

  // ASUU strike risk
  const asuuDelta =
    autonomy === "full-autonomy" ? -2 :
    autonomy === "partial-autonomy" ? -0.5 :
    1; // centralized

  // Cross-sector: low stability increases ASUU strike risk
  const stabilityBonus = effects.stability < 40 ? 1.5 : 0;
  ind.asuuStrikeRisk = clamp(ind.asuuStrikeRisk + asuuDelta + stabilityBonus, 0, 100);

  // Education budget utilization — improves with attention
  ind.educationBudgetUtilization = clamp(
    ind.educationBudgetUtilization + 0.5 * budgetMultiplier,
    0,
    100,
  );

  // Tertiary graduation rate — rises with tertiary-heavy, drops with basic-heavy
  const tertiaryDelta =
    budgetSplit === "tertiary-heavy" ? 0.3 :
    budgetSplit === "balanced" ? 0.1 :
    -0.1; // basic-heavy
  ind.tertiaryGraduationRate = clamp(ind.tertiaryGraduationRate + tertiaryDelta * budgetMultiplier, 0, 100);

  // Neglect decay
  const turnsSinceAttention = state.turnsSinceAttention + 1;
  if (turnsSinceAttention > NEGLECT_THRESHOLD) {
    const decayAmount = DECAY_RATE * (turnsSinceAttention - NEGLECT_THRESHOLD);
    ind.enrollmentRate = clamp(ind.enrollmentRate - decayAmount * 0.3, 0, 100);
    ind.literacyRate = clamp(ind.literacyRate - decayAmount * 0.1, 0, 100);
    ind.educationBudgetUtilization = clamp(ind.educationBudgetUtilization - decayAmount * 0.5, 0, 100);
    ind.asuuStrikeRisk = clamp(ind.asuuStrikeRisk + decayAmount * 0.5, 0, 100);
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
    ind.enrollmentRate = clamp(ind.enrollmentRate * (1 + (boost - 1) * 0.01), 0, 100);
    ind.literacyRate = clamp(ind.literacyRate * (1 + (boost - 1) * 0.01), 0, 100);
  }

  const health = computeSectorHealth(ind);
  const crisisZone = evaluateCrisisZone("education", health);

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
