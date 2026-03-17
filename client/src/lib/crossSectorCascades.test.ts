import { describe, it, expect } from "vitest";
import {
  CASCADE_DEFINITIONS,
  evaluateCascadeTrigger,
  advanceCascades,
  applyCascadeEffects,
  type SectorStatesMap,
} from "./crossSectorCascades";
import type { CrossSectorCascade, CascadeTrigger } from "./sectorTypes";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSectorState(id: string, indicators: Record<string, number> = {}) {
  return {
    id,
    health: 50,
    momentum: 0,
    turnsSinceAttention: 0,
    crisisZone: "yellow" as const,
    activeCascades: [] as string[],
    indicators,
  };
}

function makeDefaultStates(): SectorStatesMap {
  return {
    infrastructure: makeSectorState("infrastructure", {
      powerGenerationGW: 6,
      transmissionLossRate: 30,
      oilRefiningCapacity: 20,
    }),
    agriculture: makeSectorState("agriculture", {
      foodPriceIndex: 50,
      herderFarmerTension: 40,
      postHarvestLossPct: 20,
    }),
    healthSector: makeSectorState("healthSector", {
      epidemicRisk: 30,
      healthWorkerDensity: 1.5,
    }),
    education: makeSectorState("education", {
      asuuStrikeRisk: 40,
      outOfSchoolChildren: 10,
    }),
    youthEmployment: makeSectorState("youthEmployment", {
      youthUnemploymentRate: 30,
      socialUnrestRisk: 40,
    }),
    environment: makeSectorState("environment", {
      floodDisplacementRisk: 50,
      desertificationIndex: 40,
      gasFlareIndex: 50,
    }),
    interior: makeSectorState("interior", {
      borderSecurityScore: 60,
      prisonOccupancyRate: 200,
    }),
  };
}

function makeCascade(overrides: Partial<CrossSectorCascade> = {}): CrossSectorCascade {
  const def = CASCADE_DEFINITIONS[0];
  return {
    id: def.id,
    trigger: def.trigger,
    effects: def.effects,
    secondOrder: def.secondOrder,
    severity: 1,
    resolved: false,
    turnsActive: 0,
    ...overrides,
  };
}

// ── CASCADE_DEFINITIONS ───────────────────────────────────────────────────

describe("CASCADE_DEFINITIONS", () => {
  it("contains exactly 20 cascade definitions", () => {
    expect(CASCADE_DEFINITIONS).toHaveLength(20);
  });

  it("each definition has required fields", () => {
    for (const def of CASCADE_DEFINITIONS) {
      expect(def.id).toBeTruthy();
      expect(def.trigger).toBeDefined();
      expect(Array.isArray(def.effects)).toBe(true);
      expect(def.effects.length).toBeGreaterThan(0);
      expect(typeof def.severity).toBe("number");
    }
  });

  it("all cascade ids are unique", () => {
    const ids = CASCADE_DEFINITIONS.map((d) => d.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });

  it("each effect has sector, indicator, delta, delay", () => {
    for (const def of CASCADE_DEFINITIONS) {
      for (const eff of def.effects) {
        expect(eff.sector).toBeTruthy();
        expect(eff.indicator).toBeTruthy();
        expect(typeof eff.delta).toBe("number");
        expect(typeof eff.delay).toBe("number");
        expect(eff.delay).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ── evaluateCascadeTrigger ────────────────────────────────────────────────

describe("evaluateCascadeTrigger — single triggers", () => {
  it("fires when powerGenerationGW < 4 threshold (lt condition met)", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3.5;

    const trigger: CascadeTrigger = {
      kind: "single",
      sector: "infrastructure",
      indicator: "powerGenerationGW",
      condition: "lt",
      threshold: 4,
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(true);
  });

  it("does NOT fire when powerGenerationGW >= 4", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 4.5;

    const trigger: CascadeTrigger = {
      kind: "single",
      sector: "infrastructure",
      indicator: "powerGenerationGW",
      condition: "lt",
      threshold: 4,
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(false);
  });

  it("fires when value exactly equals threshold for lt (not fired — boundary exclusive)", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 4;

    const trigger: CascadeTrigger = {
      kind: "single",
      sector: "infrastructure",
      indicator: "powerGenerationGW",
      condition: "lt",
      threshold: 4,
    };
    // strictly less than, so exactly 4 should NOT fire
    expect(evaluateCascadeTrigger(trigger, states)).toBe(false);
  });

  it("fires when epidemicRisk > 80 (gt condition met)", () => {
    const states = makeDefaultStates();
    states.healthSector.indicators.epidemicRisk = 85;

    const trigger: CascadeTrigger = {
      kind: "single",
      sector: "healthSector",
      indicator: "epidemicRisk",
      condition: "gt",
      threshold: 80,
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(true);
  });

  it("does NOT fire when epidemicRisk <= 80", () => {
    const states = makeDefaultStates();
    states.healthSector.indicators.epidemicRisk = 80;

    const trigger: CascadeTrigger = {
      kind: "single",
      sector: "healthSector",
      indicator: "epidemicRisk",
      condition: "gt",
      threshold: 80,
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(false);
  });

  it("returns false when indicator is missing from sector (treats as 0)", () => {
    const states = makeDefaultStates();
    // Remove an indicator
    delete (states.infrastructure.indicators as Record<string, number>)["powerGenerationGW"];

    const trigger: CascadeTrigger = {
      kind: "single",
      sector: "infrastructure",
      indicator: "powerGenerationGW",
      condition: "gt",
      threshold: 4,
    };
    // 0 is not > 4
    expect(evaluateCascadeTrigger(trigger, states)).toBe(false);
  });
});

describe("evaluateCascadeTrigger — compound triggers", () => {
  it("fires when ALL conditions are met", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3;
    states.agriculture.indicators.foodPriceIndex = 85;

    const trigger: CascadeTrigger = {
      kind: "compound",
      conditions: [
        { sector: "infrastructure", indicator: "powerGenerationGW", condition: "lt", threshold: 4 },
        { sector: "agriculture", indicator: "foodPriceIndex", condition: "gt", threshold: 80 },
      ],
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(true);
  });

  it("does NOT fire when only some conditions are met", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3; // met
    states.agriculture.indicators.foodPriceIndex = 50; // NOT met

    const trigger: CascadeTrigger = {
      kind: "compound",
      conditions: [
        { sector: "infrastructure", indicator: "powerGenerationGW", condition: "lt", threshold: 4 },
        { sector: "agriculture", indicator: "foodPriceIndex", condition: "gt", threshold: 80 },
      ],
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(false);
  });

  it("fires when minSectorsInRed threshold is met", () => {
    const states = makeDefaultStates();
    states.infrastructure.crisisZone = "red";
    states.agriculture.crisisZone = "red";
    states.healthSector.crisisZone = "red";

    const trigger: CascadeTrigger = {
      kind: "compound",
      conditions: [],
      minSectorsInRed: 3,
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(true);
  });

  it("does NOT fire when minSectorsInRed threshold not reached", () => {
    const states = makeDefaultStates();
    states.infrastructure.crisisZone = "red";
    states.agriculture.crisisZone = "red";
    // only 2 in red, need 3

    const trigger: CascadeTrigger = {
      kind: "compound",
      conditions: [],
      minSectorsInRed: 3,
    };
    expect(evaluateCascadeTrigger(trigger, states)).toBe(false);
  });

  it("respects minTurnsActive: does NOT fire before turns elapsed", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3;

    const trigger: CascadeTrigger = {
      kind: "compound",
      conditions: [
        { sector: "infrastructure", indicator: "powerGenerationGW", condition: "lt", threshold: 4 },
      ],
      minTurnsActive: 3,
    };
    // turnsConditionMet = 2, need 3
    expect(evaluateCascadeTrigger(trigger, states, 2)).toBe(false);
  });

  it("respects minTurnsActive: fires when turns elapsed", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3;

    const trigger: CascadeTrigger = {
      kind: "compound",
      conditions: [
        { sector: "infrastructure", indicator: "powerGenerationGW", condition: "lt", threshold: 4 },
      ],
      minTurnsActive: 3,
    };
    expect(evaluateCascadeTrigger(trigger, states, 3)).toBe(true);
  });
});

// ── advanceCascades ───────────────────────────────────────────────────────

describe("advanceCascades", () => {
  it("detects a newly triggered cascade and activates it", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3; // below 4 — triggers cascade 1

    const result = advanceCascades([], states);
    const energyCascade = result.find((c) => c.id === "energy-power-crisis");
    expect(energyCascade).toBeDefined();
    expect(energyCascade!.resolved).toBe(false);
    expect(energyCascade!.turnsActive).toBeGreaterThanOrEqual(0);
  });

  it("does not activate cascade when trigger condition not met", () => {
    const states = makeDefaultStates();
    // power is fine at 6 GW

    const result = advanceCascades([], states);
    const energyCascade = result.find((c) => c.id === "energy-power-crisis");
    expect(energyCascade).toBeUndefined();
  });

  it("escalates severity each turn cascade is active", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3;

    const cascade = makeCascade({
      id: "energy-power-crisis",
      trigger: {
        kind: "single",
        sector: "infrastructure",
        indicator: "powerGenerationGW",
        condition: "lt",
        threshold: 4,
      },
      severity: 1,
      turnsActive: 2,
      resolved: false,
    });

    const result = advanceCascades([cascade], states);
    const updated = result.find((c) => c.id === "energy-power-crisis");
    expect(updated).toBeDefined();
    expect(updated!.severity).toBeGreaterThan(1);
    expect(updated!.turnsActive).toBe(3);
  });

  it("resolves cascade when trigger condition returns to safe for 2 turns", () => {
    const states = makeDefaultStates();
    // power is back to safe (6 GW, above threshold 4)

    // cascade was active with turnsConditionNotMet = 2 (tracked externally via turnsActive meta)
    // We simulate by passing a cascade that is about to resolve
    const cascade = makeCascade({
      id: "energy-power-crisis",
      trigger: {
        kind: "single",
        sector: "infrastructure",
        indicator: "powerGenerationGW",
        condition: "lt",
        threshold: 4,
      },
      severity: 2,
      turnsActive: 5,
      resolved: false,
    });

    // First tick with safe condition — not yet resolved
    const after1 = advanceCascades([cascade], states);
    const c1 = after1.find((c) => c.id === "energy-power-crisis");
    expect(c1).toBeDefined();

    // Second tick with safe condition — should be resolved now
    const after2 = advanceCascades(after1, states);
    const c2 = after2.find((c) => c.id === "energy-power-crisis");
    // After 2 consecutive safe turns, cascade should be removed or marked resolved
    if (c2) {
      expect(c2.resolved).toBe(true);
    }
    // Either removed from list OR marked resolved
    const activeUnresolved = after2.filter((c) => c.id === "energy-power-crisis" && !c.resolved);
    expect(activeUnresolved).toHaveLength(0);
  });

  it("amplifies severity when cascade re-triggered within 10 turns", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3;

    // Simulate a recently resolved cascade (within 10 turns)
    const resolvedCascade = makeCascade({
      id: "energy-power-crisis",
      trigger: {
        kind: "single",
        sector: "infrastructure",
        indicator: "powerGenerationGW",
        condition: "lt",
        threshold: 4,
      },
      severity: 1,
      turnsActive: 3,
      resolved: true,
    });

    // Pass the resolved cascade — it should re-trigger with amplification
    const result = advanceCascades([resolvedCascade], states);
    const retriggered = result.find((c) => c.id === "energy-power-crisis" && !c.resolved);
    expect(retriggered).toBeDefined();
    // Should start at severity +2 (base 1 + amplification 2 = 3, or severity >= 3)
    expect(retriggered!.severity).toBeGreaterThanOrEqual(3);
  });

  it("does NOT amplify when re-triggered after 10 turns", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3;

    const resolvedCascade = makeCascade({
      id: "energy-power-crisis",
      trigger: {
        kind: "single",
        sector: "infrastructure",
        indicator: "powerGenerationGW",
        condition: "lt",
        threshold: 4,
      },
      severity: 1,
      turnsActive: 15, // more than 10 turns — no amplification
      resolved: true,
    });

    const result = advanceCascades([resolvedCascade], states);
    const retriggered = result.find((c) => c.id === "energy-power-crisis" && !c.resolved);
    expect(retriggered).toBeDefined();
    // Normal start severity (1), not amplified
    expect(retriggered!.severity).toBeLessThan(3);
  });

  it("compound cascade fires only when ALL conditions met", () => {
    const states = makeDefaultStates();
    // Only one condition met, not both
    states.infrastructure.indicators.powerGenerationGW = 3;
    states.agriculture.indicators.foodPriceIndex = 50; // NOT in crisis

    const result = advanceCascades([], states);
    const compoundCascade = result.find((c) => c.id === "compound-power-food-crisis");
    expect(compoundCascade).toBeUndefined();
  });

  it("compound cascade fires when ALL conditions met", () => {
    const states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3; // crisis
    states.agriculture.indicators.foodPriceIndex = 85; // crisis

    const result = advanceCascades([], states);
    const compoundCascade = result.find((c) => c.id === "compound-power-food-crisis");
    expect(compoundCascade).toBeDefined();
  });
});

// ── applyCascadeEffects ───────────────────────────────────────────────────

describe("applyCascadeEffects", () => {
  it("returns indicator deltas for active cascades past their delay", () => {
    const cascade = makeCascade({
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
        { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 2, delay: 2 },
      ],
      severity: 1,
      turnsActive: 3,
      resolved: false,
    });

    const deltas = applyCascadeEffects([cascade]);
    // Only effects with delay <= turnsActive should be applied
    expect(deltas.some((d) => d.sector === "agriculture" && d.indicator === "cropOutputIndex")).toBe(true);
    // delay 2, turnsActive 3 — should be included
    expect(deltas.some((d) => d.sector === "youthEmployment" && d.indicator === "youthUnemploymentRate")).toBe(true);
  });

  it("does NOT apply effects before delay turns elapsed", () => {
    const cascade = makeCascade({
      id: "energy-power-crisis",
      effects: [
        { sector: "agriculture", indicator: "cropOutputIndex", delta: -3, delay: 0 },
        { sector: "youthEmployment", indicator: "youthUnemploymentRate", delta: 2, delay: 5 },
      ],
      severity: 1,
      turnsActive: 2, // only 2 turns active, delay 5 not yet reached
      resolved: false,
    });

    const deltas = applyCascadeEffects([cascade]);
    expect(deltas.some((d) => d.sector === "agriculture" && d.indicator === "cropOutputIndex")).toBe(true);
    // delay 5 > turnsActive 2 — NOT applied yet
    expect(deltas.some((d) => d.sector === "youthEmployment" && d.indicator === "youthUnemploymentRate")).toBe(false);
  });

  it("does NOT apply effects from resolved cascades", () => {
    const cascade = makeCascade({
      id: "energy-power-crisis",
      effects: [
        { sector: "agriculture", indicator: "cropOutputIndex", delta: -3, delay: 0 },
      ],
      severity: 1,
      turnsActive: 5,
      resolved: true, // already resolved
    });

    const deltas = applyCascadeEffects([cascade]);
    expect(deltas).toHaveLength(0);
  });

  it("scales delta by severity", () => {
    const cascadeSev1 = makeCascade({
      effects: [{ sector: "agriculture", indicator: "cropOutputIndex", delta: -3, delay: 0 }],
      severity: 1,
      turnsActive: 1,
      resolved: false,
    });

    const cascadeSev2 = makeCascade({
      effects: [{ sector: "agriculture", indicator: "cropOutputIndex", delta: -3, delay: 0 }],
      severity: 2,
      turnsActive: 1,
      resolved: false,
    });

    const deltasSev1 = applyCascadeEffects([cascadeSev1]);
    const deltasSev2 = applyCascadeEffects([cascadeSev2]);

    const agriDeltaSev1 = deltasSev1.find((d) => d.indicator === "cropOutputIndex")!;
    const agriDeltaSev2 = deltasSev2.find((d) => d.indicator === "cropOutputIndex")!;

    expect(agriDeltaSev2.delta).toBeLessThan(agriDeltaSev1.delta); // more negative at higher severity
  });

  it("returns empty array when no cascades", () => {
    expect(applyCascadeEffects([])).toHaveLength(0);
  });

  it("combines deltas from multiple simultaneous cascades", () => {
    const cascade1 = makeCascade({
      id: "c1",
      effects: [{ sector: "agriculture", indicator: "foodPriceIndex", delta: -2, delay: 0 }],
      severity: 1,
      turnsActive: 1,
      resolved: false,
    });
    const cascade2 = makeCascade({
      id: "c2",
      effects: [{ sector: "agriculture", indicator: "foodPriceIndex", delta: -3, delay: 0 }],
      severity: 1,
      turnsActive: 1,
      resolved: false,
    });

    const deltas = applyCascadeEffects([cascade1, cascade2]);
    // Both deltas present (they can be separate entries or summed — either is valid)
    const agriDeltas = deltas.filter((d) => d.sector === "agriculture" && d.indicator === "foodPriceIndex");
    expect(agriDeltas.length).toBeGreaterThanOrEqual(1);
    const totalDelta = agriDeltas.reduce((sum, d) => sum + d.delta, 0);
    expect(totalDelta).toBeLessThanOrEqual(-5);
  });
});

// ── Integration ───────────────────────────────────────────────────────────

describe("integration: full cascade lifecycle", () => {
  it("cascade activates, escalates, and resolves over turns", () => {
    let states = makeDefaultStates();
    states.infrastructure.indicators.powerGenerationGW = 3; // trigger crisis

    let cascades: CrossSectorCascade[] = [];

    // Turn 1: cascade activates
    cascades = advanceCascades(cascades, states);
    const active = cascades.find((c) => c.id === "energy-power-crisis");
    expect(active).toBeDefined();
    const initialSeverity = active!.severity;

    // Turn 2: still in crisis — severity escalates
    cascades = advanceCascades(cascades, states);
    const escalated = cascades.find((c) => c.id === "energy-power-crisis");
    expect(escalated!.severity).toBeGreaterThanOrEqual(initialSeverity);

    // Now fix the crisis
    states.infrastructure.indicators.powerGenerationGW = 6;

    // Turn 3: safe, but not yet resolved (need 2 consecutive safe turns)
    cascades = advanceCascades(cascades, states);

    // Turn 4: second safe turn — cascade should resolve
    cascades = advanceCascades(cascades, states);
    const activeAfterFix = cascades.filter((c) => c.id === "energy-power-crisis" && !c.resolved);
    expect(activeAfterFix).toHaveLength(0);
  });
});
