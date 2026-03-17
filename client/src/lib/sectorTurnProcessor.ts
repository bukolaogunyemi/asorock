// sectorTurnProcessor.ts
// Master orchestrator that sequences all 7 sector engines per turn,
// runs the cascade pass, and computes composite scores.

import type { GameState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects, CrossSectorCascade } from "./sectorTypes";
import { buildCrossSectorEffects } from "./sectorTypes";
import type { SectorStatesMap } from "./crossSectorCascades";
import { advanceCascades, applyCascadeEffects } from "./crossSectorCascades";
import { processInfrastructureTurn } from "./infrastructureEngine";
import { processAgricultureTurn } from "./agricultureEngine";
import { processHealthTurn } from "./healthEngine";
import { processEducationTurn } from "./educationEngine";
import { processYouthEmploymentTurn } from "./youthEmploymentEngine";
import { processEnvironmentTurn } from "./environmentEngine";
import { processInteriorTurn } from "./interiorEngine";
import { computeMinisterialEffectiveness } from "./cabinetSystem";

// ── Public result type ───────────────────────────────────────────────────────

export interface SectorTurnResult {
  infrastructure: GovernanceSectorState;
  healthSector: GovernanceSectorState;
  education: GovernanceSectorState;
  agriculture: GovernanceSectorState;
  interior: GovernanceSectorState;
  environment: GovernanceSectorState;
  youthEmployment: GovernanceSectorState;
  crossSectorEffects: CrossSectorEffects;
  crossSectorCascades: CrossSectorCascade[];
  approvalModifier: number;
  internationalReputation: number;
}

// ── Main processor ───────────────────────────────────────────────────────────

export function processSectorTurns(state: GameState): SectorTurnResult {
  // 1. Use existing crossSectorEffects from state (built from previous turn)
  const effects = state.crossSectorEffects;
  const budget = state.budgetAllocation;
  const levers = state.policyLevers;

  // 2. Run all 7 engines
  const infrastructure = processInfrastructureTurn(
    state.infrastructure,
    levers,
    effects,
    budget.infrastructure,
  );
  const agriculture = processAgricultureTurn(
    state.agriculture,
    levers,
    effects,
    budget.agriculture,
  );
  const healthSector = processHealthTurn(
    state.healthSector,
    levers,
    effects,
    budget.health,
  );
  const education = processEducationTurn(
    state.education,
    levers,
    effects,
    budget.education,
  );
  const youthEmployment = processYouthEmploymentTurn(
    state.youthEmployment,
    levers,
    effects,
    budget.youthEmployment,
  );
  const environment = processEnvironmentTurn(
    state.environment,
    levers,
    effects,
    budget.environment,
  );
  const interior = processInteriorTurn(
    state.interior,
    levers,
    effects,
    budget.interior,
  );

  // 2b. Apply ministerial effectiveness multiplier to health deltas
  const effectiveness = computeMinisterialEffectiveness(state);
  const sectorKeys: { key: keyof SectorStatesMap; stateKey: string; prev: GovernanceSectorState }[] = [
    { key: "infrastructure", stateKey: "infrastructure", prev: state.infrastructure },
    { key: "agriculture", stateKey: "agriculture", prev: state.agriculture },
    { key: "healthSector", stateKey: "healthSector", prev: state.healthSector },
    { key: "education", stateKey: "education", prev: state.education },
    { key: "youthEmployment", stateKey: "youthEmployment", prev: state.youthEmployment },
    { key: "environment", stateKey: "environment", prev: state.environment },
    { key: "interior", stateKey: "interior", prev: state.interior },
  ];

  const sectorResults: Record<string, GovernanceSectorState> = {
    infrastructure,
    agriculture,
    healthSector,
    education,
    youthEmployment,
    environment,
    interior,
  };

  for (const { key, stateKey, prev } of sectorKeys) {
    const multiplier = effectiveness[stateKey];
    if (multiplier !== undefined && multiplier !== 1.0) {
      const newResult = sectorResults[key];
      const oldHealth = prev.health;
      const healthDelta = newResult.health - oldHealth;
      const adjustedDelta = healthDelta * multiplier;
      newResult.health = Math.max(0, Math.min(100, oldHealth + adjustedDelta));
    }
  }

  // 3. Cascade pass
  const sectorStates: SectorStatesMap = {
    infrastructure: sectorResults.infrastructure,
    agriculture: sectorResults.agriculture,
    healthSector: sectorResults.healthSector,
    education: sectorResults.education,
    youthEmployment: sectorResults.youthEmployment,
    environment: sectorResults.environment,
    interior: sectorResults.interior,
  };

  const cascades = advanceCascades(state.crossSectorCascades, sectorStates);
  const cascadeDeltas = applyCascadeEffects(cascades);

  // Apply cascade deltas to sector indicators
  for (const d of cascadeDeltas) {
    const sectorKey = d.sector === "health" ? "healthSector" : d.sector;
    const target = (sectorStates as any)[sectorKey] as GovernanceSectorState | undefined;
    if (target) {
      target.indicators[d.indicator] = (target.indicators[d.indicator] ?? 0) + d.delta;
    }
  }

  // 4. Composite scores
  const approvalModifier = computeApprovalModifier(sectorStates);
  const internationalReputation = computeInternationalReputation(sectorStates, state.economy);

  // 5. Build updated cross-sector effects for next turn
  const newEffects = buildCrossSectorEffects({
    economy: state.economy,
    stability: state.stability,
    infrastructure,
    agriculture,
    health: healthSector, // parameter name is "health"
    education,
    youthEmployment,
    environment,
    interior,
  });

  return {
    infrastructure,
    healthSector,
    education,
    agriculture,
    interior,
    environment,
    youthEmployment,
    crossSectorEffects: newEffects,
    crossSectorCascades: cascades,
    approvalModifier,
    internationalReputation,
  };
}

// ── computeApprovalModifier ──────────────────────────────────────────────────

/**
 * Sector health weighted by public salience, mapped to a -8 to +5 modifier.
 *
 * Salience weights:
 *   Economy/Agriculture 20%, Infrastructure 15%, Youth 12%, Health 12%,
 *   Education 8%, Interior 5%, Environment 3%
 *
 * Note: "Economy" proxy is Agriculture (most publicly visible food sector).
 *   weights sum to: 25(agri)+15(infra)+12(youth)+12(health)+8(edu)+5(interior)+3(env) = 80
 *   We normalize to sum to 100 by using them as-is with proportional mapping.
 */
export function computeApprovalModifier(sectorStates: SectorStatesMap): number {
  // Salience weights (sum = 80; note: task spec lists "Economy 25%, Agriculture 20%"
  // but there is no separate economy sector state — we treat agriculture as the
  // highest-salience food/economic proxy at combined 25%)
  const weights: Record<keyof SectorStatesMap, number> = {
    agriculture: 25,       // food prices most visible
    infrastructure: 15,    // power/roads
    youthEmployment: 12,   // youth jobs/unrest
    healthSector: 12,      // healthcare
    education: 8,          // schools
    interior: 5,           // security
    environment: 3,        // climate
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0); // 80

  let weightedHealthSum = 0;
  for (const [key, weight] of Object.entries(weights) as [keyof SectorStatesMap, number][]) {
    const health = sectorStates[key].health;
    weightedHealthSum += health * weight;
  }

  // Weighted average health (0-100)
  const avgHealth = weightedHealthSum / totalWeight;

  // Map to -8..+5:
  //   health >= 70 → positive modifier up to +5
  //   health 40-70 → linear interpolation near zero
  //   health < 40 → negative modifier down to -8
  let modifier: number;
  if (avgHealth >= 70) {
    // Map 70..100 → 0..+5
    modifier = ((avgHealth - 70) / 30) * 5;
  } else if (avgHealth >= 40) {
    // Map 40..70 → -0..0 (linear, crossing zero around 55)
    // Use simple linear scale: 40 → -2.67, 70 → 0
    modifier = ((avgHealth - 70) / 30) * 2.67;
  } else {
    // Map 0..40 → -8..-2.67 (linear)
    modifier = -8 + (avgHealth / 40) * (8 - 2.67);
  }

  // Clamp to [-8, +5]
  return Math.max(-8, Math.min(5, modifier));
}

// ── computeInternationalReputation ───────────────────────────────────────────

/**
 * Composite of select indicators mapped to 0-100.
 *
 * Weights:
 *   Environment: climateAdaptationScore 20%, gasFlareIndex (inverted) 10%
 *   Health:      healthWorkerDensity 15%, epidemicRisk (inverted) 10%
 *   Economy:     GDP as proxy 15%
 *   Education:   literacyRate 15%, outOfSchoolChildren (inverted) 5%
 *   Interior:    prisonOccupancyRate (inverted) 10%
 *   Total: 100%
 */
export function computeInternationalReputation(
  sectorStates: SectorStatesMap,
  economy: { gdp?: number },
): number {
  const env = sectorStates.environment.indicators;
  const health = sectorStates.healthSector.indicators;
  const edu = sectorStates.education.indicators;
  const interior = sectorStates.interior.indicators;

  // Environment
  const climateAdaptation = env.climateAdaptationScore ?? 20;       // 0-100
  const gasFlare = env.gasFlareIndex ?? 70;                         // 0-100, invert
  const gasFlareScore = Math.max(0, 100 - gasFlare);

  // Health
  // healthWorkerDensity: 0-4.45 normalized to 0-100
  const hwd = health.healthWorkerDensity ?? 1.5;
  const hwdScore = Math.min(100, (hwd / 4.45) * 100);
  const epidemicRisk = health.epidemicRisk ?? 35;                   // 0-100, invert
  const epidemicScore = Math.max(0, 100 - epidemicRisk);

  // Economy: GDP as proxy — baseline 500 maps to ~50; cap at 1000 for 100
  const gdp = economy.gdp ?? 500;
  const gdpScore = Math.min(100, Math.max(0, (gdp / 1000) * 100));

  // Education
  const literacyRate = edu.literacyRate ?? 62;                      // 0-100
  const outOfSchool = edu.outOfSchoolChildren ?? 18.5;              // 0-25, invert
  const outOfSchoolScore = Math.max(0, 100 - (outOfSchool / 25) * 100);

  // Interior: prisonOccupancyRate — 100% = fine, 400% = terrible
  const prisonOccupancy = interior.prisonOccupancyRate ?? 270;
  // Normalize: 100 → score 100, 400 → score 0
  const prisonScore = Math.max(0, Math.min(100, ((400 - prisonOccupancy) / 300) * 100));

  // Weighted sum
  const reputation =
    climateAdaptation * 0.20 +
    gasFlareScore    * 0.10 +
    hwdScore         * 0.15 +
    epidemicScore    * 0.10 +
    gdpScore         * 0.15 +
    literacyRate     * 0.15 +
    outOfSchoolScore * 0.05 +
    prisonScore      * 0.10;

  return Math.max(0, Math.min(100, Math.round(reputation)));
}
