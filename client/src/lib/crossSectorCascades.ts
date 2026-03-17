// crossSectorCascades.ts
// Cross-sector cascade system — links sector engines together.
// When one sector deteriorates, cascading effects can spread to other sectors.

import type {
  GovernanceSectorState,
  CascadeTrigger,
  CrossSectorCascade,
} from "./sectorTypes";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SectorStatesMap {
  infrastructure: GovernanceSectorState;
  agriculture: GovernanceSectorState;
  healthSector: GovernanceSectorState;
  education: GovernanceSectorState;
  youthEmployment: GovernanceSectorState;
  environment: GovernanceSectorState;
  interior: GovernanceSectorState;
}

// Internal extension used for tracking consecutive safe turns per cascade
interface CascadeWithMeta extends CrossSectorCascade {
  _consecutiveSafeTurns?: number;
  _turnsActiveSinceLastResolved?: number; // tracks recency for amplification
}

// ── Helper: get indicator value ────────────────────────────────────────────

function getIndicatorValue(
  sectorStates: SectorStatesMap,
  sector: string,
  indicator: string
): number {
  const state = sectorStates[sector as keyof SectorStatesMap];
  if (!state) return 0;
  return state.indicators[indicator] ?? 0;
}

// ── Helper: count sectors in red ──────────────────────────────────────────

function countSectorsInRed(sectorStates: SectorStatesMap): number {
  return Object.values(sectorStates).filter((s) => s.crisisZone === "red").length;
}

// ── evaluateCascadeTrigger ─────────────────────────────────────────────────

/**
 * Check if a trigger condition is currently met.
 * For compound triggers with minTurnsActive, turnsConditionMet must be provided.
 */
export function evaluateCascadeTrigger(
  trigger: CascadeTrigger,
  sectorStates: SectorStatesMap,
  turnsConditionMet: number = 0
): boolean {
  if (trigger.kind === "single") {
    const value = getIndicatorValue(sectorStates, trigger.sector, trigger.indicator);
    if (trigger.condition === "lt") return value < trigger.threshold;
    if (trigger.condition === "gt") return value > trigger.threshold;
    return false;
  }

  // compound
  if (trigger.kind === "compound") {
    // Check all explicit conditions
    const allConditionsMet = trigger.conditions.every((cond) => {
      const value = getIndicatorValue(sectorStates, cond.sector, cond.indicator);
      if (cond.condition === "lt") return value < cond.threshold;
      if (cond.condition === "gt") return value > cond.threshold;
      return false;
    });

    if (!allConditionsMet) return false;

    // Check minSectorsInRed
    if (trigger.minSectorsInRed !== undefined) {
      if (countSectorsInRed(sectorStates) < trigger.minSectorsInRed) return false;
    }

    // Check minTurnsActive
    if (trigger.minTurnsActive !== undefined) {
      if (turnsConditionMet < trigger.minTurnsActive) return false;
    }

    return true;
  }

  return false;
}

// ── CASCADE_DEFINITIONS ────────────────────────────────────────────────────

// Template type: cascade definitions before severity/resolved/turnsActive runtime state
interface CascadeDefinitionTemplate {
  id: string;
  trigger: CascadeTrigger;
  effects: Array<{ sector: string; indicator: string; delta: number; delay: number }>;
  secondOrder?: { triggerAfterTurns: number; cascadeId: string };
  severity: number; // base severity
}

export const CASCADE_DEFINITIONS: CascadeDefinitionTemplate[] = [
  // ── ENERGY CASCADES ──────────────────────────────────────────────────────

  // 1. Power generation < 4GW → Manufacturing GDP -3%, Services GDP -2% → Unemployment spike (2t) → Youth unrest (4t)
  {
    id: "energy-power-crisis",
    trigger: {
      kind: "single",
      sector: "infrastructure",
      indicator: "powerGenerationGW",
      condition: "lt",
      threshold: 4,
    },
    effects: [
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -3, delay: 0 },
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 3, delay: 2 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 10, delay: 4 },
    ],
    secondOrder: { triggerAfterTurns: 4, cascadeId: "youth-unemployment-crisis" },
    severity: 1,
  },

  // 2. Oil refining collapse → Fuel scarcity, transport costs +30% → Food prices spike (1t) → Inflation (2t)
  {
    id: "energy-oil-refining-collapse",
    trigger: {
      kind: "single",
      sector: "infrastructure",
      indicator: "oilRefiningCapacity",
      condition: "lt",
      threshold: 10,
    },
    effects: [
      { sector: "agriculture", indicator: "foodPriceIndex", delta: 15, delay: 1 },
      { sector: "agriculture", indicator: "foodImportDependency", delta: 10, delay: 2 },
    ],
    severity: 1,
  },

  // 3. Transmission loss > 50% → Effective power halved → Industrial exodus (3t) → FDI drop
  {
    id: "energy-transmission-loss",
    trigger: {
      kind: "single",
      sector: "infrastructure",
      indicator: "transmissionLossRate",
      condition: "gt",
      threshold: 50,
    },
    effects: [
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -5, delay: 0 },
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 5, delay: 3 },
    ],
    severity: 1,
  },

  // ── FOOD & AGRICULTURE CASCADES ──────────────────────────────────────────

  // 4. Food price index > 80 → Approval -8, outrage +15 → Protests (2t) → Stability drop (3t)
  {
    id: "agriculture-food-price-crisis",
    trigger: {
      kind: "single",
      sector: "agriculture",
      indicator: "foodPriceIndex",
      condition: "gt",
      threshold: 80,
    },
    effects: [
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 15, delay: 0 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 10, delay: 2 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -5, delay: 3 },
    ],
    severity: 1,
  },

  // 5. Herder-farmer tension > 70 → Security incidents, agriculture GDP -2% → Displacement (2t) → Humanitarian spend (3t)
  {
    id: "agriculture-herder-farmer-conflict",
    trigger: {
      kind: "single",
      sector: "agriculture",
      indicator: "herderFarmerTension",
      condition: "gt",
      threshold: 70,
    },
    effects: [
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -8, delay: 0 },
      { sector: "healthSector", indicator: "epidemicRisk", delta: 5, delay: 2 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -8, delay: 3 },
    ],
    severity: 1,
  },

  // 6. Post-harvest loss > 40% → Food import dependency up, treasury drain → FX pressure (2t) → Inflation (3t)
  {
    id: "agriculture-post-harvest-loss",
    trigger: {
      kind: "single",
      sector: "agriculture",
      indicator: "postHarvestLossPct",
      condition: "gt",
      threshold: 40,
    },
    effects: [
      { sector: "agriculture", indicator: "foodImportDependency", delta: 10, delay: 0 },
      { sector: "agriculture", indicator: "foodPriceIndex", delta: 8, delay: 2 },
      { sector: "agriculture", indicator: "foodPriceIndex", delta: 5, delay: 3 },
    ],
    severity: 1,
  },

  // ── HEALTH CASCADES ───────────────────────────────────────────────────────

  // 7. Epidemic outbreak (epidemicRisk > 80) → Workforce productivity -20%, health spend surge → GDP hit (1t) → Treasury crisis (3t)
  {
    id: "health-epidemic-outbreak",
    trigger: {
      kind: "single",
      sector: "healthSector",
      indicator: "epidemicRisk",
      condition: "gt",
      threshold: 80,
    },
    effects: [
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 8, delay: 0 },
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -10, delay: 1 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -5, delay: 3 },
    ],
    severity: 2,
  },

  // 8. Health worker density < 0.5 → PHC coverage collapses, child mortality up → International pressure (2t) → Approval crater (3t)
  {
    id: "health-worker-shortage",
    trigger: {
      kind: "single",
      sector: "healthSector",
      indicator: "healthWorkerDensity",
      condition: "lt",
      threshold: 0.5,
    },
    effects: [
      { sector: "healthSector", indicator: "epidemicRisk", delta: 15, delay: 0 },
      { sector: "education", indicator: "enrollmentRate", delta: -5, delay: 2 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 12, delay: 3 },
    ],
    severity: 2,
  },

  // ── EDUCATION CASCADES ────────────────────────────────────────────────────

  // 9. ASUU strike (risk > 80) → Tertiary education halts, youth idle → Youth unrest +20 (2t) → Brain drain (4t)
  {
    id: "education-asuu-strike",
    trigger: {
      kind: "single",
      sector: "education",
      indicator: "asuuStrikeRisk",
      condition: "gt",
      threshold: 80,
    },
    effects: [
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 10, delay: 0 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 20, delay: 2 },
      { sector: "education", indicator: "tertiaryGraduationRate", delta: -15, delay: 4 },
    ],
    secondOrder: { triggerAfterTurns: 4, cascadeId: "youth-unemployment-crisis" },
    severity: 1,
  },

  // 10. Out-of-school > 15M → Human capital degradation → Youth unemployment (3t) → Militancy recruitment (5t)
  {
    id: "education-out-of-school-crisis",
    trigger: {
      kind: "single",
      sector: "education",
      indicator: "outOfSchoolChildren",
      condition: "gt",
      threshold: 15,
    },
    effects: [
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 5, delay: 0 },
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 8, delay: 3 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -10, delay: 5 },
    ],
    severity: 1,
  },

  // ── YOUTH & SECURITY CASCADES ─────────────────────────────────────────────

  // 11. Youth unemployment > 45% → Crime surge, social unrest +25 → Stability -10 (2t) → Capital flight (4t)
  {
    id: "youth-unemployment-crisis",
    trigger: {
      kind: "single",
      sector: "youthEmployment",
      indicator: "youthUnemploymentRate",
      condition: "gt",
      threshold: 45,
    },
    effects: [
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 25, delay: 0 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -8, delay: 2 },
      { sector: "interior", indicator: "prisonOccupancyRate", delta: 30, delay: 4 },
    ],
    severity: 2,
  },

  // 12. Social unrest risk > 75 → Protests, curfews, business disruption → Approval -12 (1t) → International reputation down (2t)
  {
    id: "youth-social-unrest",
    trigger: {
      kind: "single",
      sector: "youthEmployment",
      indicator: "socialUnrestRisk",
      condition: "gt",
      threshold: 75,
    },
    effects: [
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -5, delay: 0 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -5, delay: 1 },
      { sector: "education", indicator: "enrollmentRate", delta: -8, delay: 2 },
    ],
    severity: 2,
  },

  // ── ENVIRONMENT CASCADES ──────────────────────────────────────────────────

  // 13. Flood displacement > 80 → Humanitarian emergency, agriculture -10% → Food crisis (1t) → Health crisis (2t)
  {
    id: "environment-flood-displacement",
    trigger: {
      kind: "single",
      sector: "environment",
      indicator: "floodDisplacementRisk",
      condition: "gt",
      threshold: 80,
    },
    effects: [
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -10, delay: 0 },
      { sector: "agriculture", indicator: "foodPriceIndex", delta: 12, delay: 1 },
      { sector: "healthSector", indicator: "epidemicRisk", delta: 15, delay: 2 },
    ],
    secondOrder: { triggerAfterTurns: 2, cascadeId: "health-epidemic-outbreak" },
    severity: 2,
  },

  // 14. Desertification > 70 → Agriculture in north collapses → Herder-farmer conflict (2t) → Migration south (3t)
  {
    id: "environment-desertification",
    trigger: {
      kind: "single",
      sector: "environment",
      indicator: "desertificationIndex",
      condition: "gt",
      threshold: 70,
    },
    effects: [
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -8, delay: 0 },
      { sector: "agriculture", indicator: "herderFarmerTension", delta: 15, delay: 2 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -5, delay: 3 },
    ],
    secondOrder: { triggerAfterTurns: 2, cascadeId: "agriculture-herder-farmer-conflict" },
    severity: 1,
  },

  // 15. Gas flare index > 70 + international pressure → FDI restrictions → Oil revenue drop (2t) → Treasury pressure (3t)
  {
    id: "environment-gas-flare-pressure",
    trigger: {
      kind: "compound",
      conditions: [
        { sector: "environment", indicator: "gasFlareIndex", condition: "gt", threshold: 70 },
        { sector: "interior", indicator: "borderSecurityScore", condition: "lt", threshold: 50 },
      ],
    },
    effects: [
      { sector: "infrastructure", indicator: "oilRefiningCapacity", delta: -5, delay: 0 },
      { sector: "infrastructure", indicator: "oilRefiningCapacity", delta: -5, delay: 2 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -5, delay: 3 },
    ],
    severity: 1,
  },

  // ── INTERIOR CASCADES ─────────────────────────────────────────────────────

  // 16. Border security < 30 → Arms inflow, smuggling → Customs revenue loss (1t) → Security crisis (3t)
  {
    id: "interior-border-breakdown",
    trigger: {
      kind: "single",
      sector: "interior",
      indicator: "borderSecurityScore",
      condition: "lt",
      threshold: 30,
    },
    effects: [
      { sector: "agriculture", indicator: "foodPriceIndex", delta: 8, delay: 1 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 15, delay: 3 },
    ],
    severity: 2,
  },

  // 17. Prison overcrowding > 300% → Jailbreak risk, human rights condemnation → International reputation down (1t) → Aid conditions (3t)
  {
    id: "interior-prison-overcrowding",
    trigger: {
      kind: "single",
      sector: "interior",
      indicator: "prisonOccupancyRate",
      condition: "gt",
      threshold: 300,
    },
    effects: [
      { sector: "interior", indicator: "borderSecurityScore", delta: -5, delay: 1 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 10, delay: 3 },
    ],
    severity: 1,
  },

  // ── COMPOUND CASCADES ─────────────────────────────────────────────────────

  // 18. Power crisis + Food crisis simultaneously → "Failed state" narrative, approval -20, international intervention talk
  {
    id: "compound-power-food-crisis",
    trigger: {
      kind: "compound",
      conditions: [
        { sector: "infrastructure", indicator: "powerGenerationGW", condition: "lt", threshold: 4 },
        { sector: "agriculture", indicator: "foodPriceIndex", condition: "gt", threshold: 80 },
      ],
    },
    effects: [
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 25, delay: 0 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -15, delay: 0 },
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 10, delay: 2 },
    ],
    severity: 3,
  },

  // 19. Youth unemployment > 40% + ASUU strike + epidemic → "Perfect storm" — stability -15/turn, FDI frozen
  {
    id: "compound-perfect-storm",
    trigger: {
      kind: "compound",
      conditions: [
        { sector: "youthEmployment", indicator: "youthUnemploymentRate", condition: "gt", threshold: 40 },
        { sector: "education", indicator: "asuuStrikeRisk", condition: "gt", threshold: 80 },
        { sector: "healthSector", indicator: "epidemicRisk", condition: "gt", threshold: 80 },
      ],
    },
    effects: [
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 30, delay: 0 },
      { sector: "interior", indicator: "borderSecurityScore", delta: -20, delay: 0 },
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -15, delay: 1 },
      { sector: "education", indicator: "enrollmentRate", delta: -20, delay: 2 },
    ],
    severity: 4,
  },

  // 20. 3+ sectors in red for 4+ turns → Governance crisis — military loyalty tested, coup whispers
  {
    id: "compound-governance-crisis",
    trigger: {
      kind: "compound",
      conditions: [],
      minSectorsInRed: 3,
      minTurnsActive: 4,
    },
    effects: [
      { sector: "interior", indicator: "borderSecurityScore", delta: -20, delay: 0 },
      { sector: "youthEmployment", indicator: "socialUnrestRisk", delta: 35, delay: 0 },
      { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 10, delay: 2 },
      { sector: "agriculture", indicator: "cropOutputIndex", delta: -20, delay: 3 },
    ],
    severity: 5,
  },
];

// ── advanceCascades ────────────────────────────────────────────────────────

/**
 * Advance cascade state for one game turn:
 * - Escalate active cascades (increase severity, increment turnsActive)
 * - Track consecutive safe turns for resolution
 * - Detect newly triggered cascades from definitions
 * - Amplify cascades re-triggered within 10 turns of resolution
 */
export function advanceCascades(
  cascades: CrossSectorCascade[],
  sectorStates: SectorStatesMap
): CrossSectorCascade[] {
  const result: CascadeWithMeta[] = [];

  // Keep track of cascade ids already in result
  const processedIds = new Set<string>();

  // Step 1: Advance existing cascades
  for (const cascade of cascades as CascadeWithMeta[]) {
    const triggerMet = evaluateCascadeTrigger(
      cascade.trigger,
      sectorStates,
      cascade.turnsActive
    );

    if (cascade.resolved) {
      // Resolved cascades: keep them only to support amplification tracking,
      // but only if they are recent (within 10 turns).
      // Do NOT add to processedIds — Step 2 should be able to re-trigger them.
      const turnsSinceResolved = cascade._turnsActiveSinceLastResolved ?? cascade.turnsActive;
      if (turnsSinceResolved <= 10) {
        result.push({ ...cascade });
        // Note: intentionally NOT adding to processedIds here,
        // so Step 2 can detect a re-trigger and replace with active cascade.
      }
      // else: drop them — too old to matter for amplification
      continue;
    }

    if (!triggerMet) {
      // Condition no longer met — track consecutive safe turns
      const safeTurns = (cascade._consecutiveSafeTurns ?? 0) + 1;

      if (safeTurns >= 2) {
        // Resolved!
        result.push({
          ...cascade,
          resolved: true,
          _consecutiveSafeTurns: safeTurns,
          _turnsActiveSinceLastResolved: 0, // reset amplification clock
        });
      } else {
        // Still pending resolution — not yet resolved
        result.push({
          ...cascade,
          _consecutiveSafeTurns: safeTurns,
        });
      }
      processedIds.add(cascade.id);
      continue;
    }

    // Trigger still met — escalate severity
    const newSeverity = cascade.severity + 1;
    const newTurnsActive = cascade.turnsActive + 1;

    result.push({
      ...cascade,
      severity: newSeverity,
      turnsActive: newTurnsActive,
      _consecutiveSafeTurns: 0, // reset safe counter
    });
    processedIds.add(cascade.id);
  }

  // Step 2: Detect newly triggered cascades from definitions
  for (const def of CASCADE_DEFINITIONS) {
    if (processedIds.has(def.id)) continue; // already being tracked

    const triggerMet = evaluateCascadeTrigger(def.trigger, sectorStates, 0);
    if (!triggerMet) continue;

    // Check if there's a recently resolved version for amplification
    const recentlyResolved = (cascades as CascadeWithMeta[]).find(
      (c) => c.id === def.id && c.resolved
    );

    let startingSeverity = def.severity;
    if (recentlyResolved) {
      const turnsSinceResolved = recentlyResolved._turnsActiveSinceLastResolved ?? recentlyResolved.turnsActive;
      if (turnsSinceResolved <= 10) {
        startingSeverity = def.severity + 2; // amplification
      }
    }

    result.push({
      id: def.id,
      trigger: def.trigger,
      effects: def.effects,
      secondOrder: def.secondOrder,
      severity: startingSeverity,
      resolved: false,
      turnsActive: 0,
      _consecutiveSafeTurns: 0,
    });

    // Remove any resolved entry for the same id (being replaced by new active one)
    const existingResolvedIdx = result.findIndex(
      (c) => c.id === def.id && c.resolved
    );
    if (existingResolvedIdx !== -1) {
      result.splice(existingResolvedIdx, 1);
    }
  }

  // Step 3: Increment turnsActiveSinceLastResolved for resolved cascades
  // (used to determine amplification window)
  for (const c of result) {
    if (c.resolved) {
      c._turnsActiveSinceLastResolved = (c._turnsActiveSinceLastResolved ?? 0) + 1;
    }
  }

  return result;
}

// ── applyCascadeEffects ────────────────────────────────────────────────────

/**
 * Return indicator deltas to apply this turn, accounting for:
 * - Delay: only apply effects whose delay <= turnsActive
 * - Severity: scale delta by severity
 * - Only active (not resolved) cascades
 * - Multiple active cascades multiply severity effects (compound escalation)
 */
export function applyCascadeEffects(
  cascades: CrossSectorCascade[]
): Array<{ sector: string; indicator: string; delta: number }> {
  const activeCascades = cascades.filter((c) => !c.resolved);

  if (activeCascades.length === 0) return [];

  // Compound escalation multiplier: multiple active cascades multiply severity
  const multiplier = activeCascades.length > 1 ? 1 + (activeCascades.length - 1) * 0.25 : 1;

  const deltas: Array<{ sector: string; indicator: string; delta: number }> = [];

  for (const cascade of activeCascades) {
    for (const effect of cascade.effects) {
      if (effect.delay > cascade.turnsActive) continue; // not yet triggered

      const scaledDelta = effect.delta * cascade.severity * multiplier;
      deltas.push({
        sector: effect.sector,
        indicator: effect.indicator,
        delta: scaledDelta,
      });
    }
  }

  return deltas;
}
