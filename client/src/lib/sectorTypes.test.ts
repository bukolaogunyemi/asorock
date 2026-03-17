// sectorTypes.test.ts
import { describe, it, expect } from "vitest";
import {
  defaultInfrastructureState,
  defaultHealthState,
  defaultEducationState,
  defaultAgricultureState,
  defaultInteriorState,
  defaultEnvironmentState,
  defaultYouthEmploymentState,
  defaultBudgetAllocation,
  buildCrossSectorEffects,
} from "./sectorTypes";

describe("defaultInfrastructureState", () => {
  it("returns valid initial state", () => {
    const s = defaultInfrastructureState();
    expect(s.id).toBe("infrastructure");
    expect(s.health).toBeGreaterThan(0);
    expect(s.momentum).toBe(0);
    expect(s.turnsSinceAttention).toBe(0);
    expect(s.crisisZone).toBe("yellow");
    expect(s.indicators.powerGenerationGW).toBe(4.5);
    expect(s.indicators.transmissionLossRate).toBe(40);
    expect(s.indicators.roadNetworkScore).toBe(35);
    expect(s.indicators.railCoverageKm).toBe(3500);
    expect(s.indicators.broadbandPenetration).toBe(38);
    expect(s.indicators.oilRefiningCapacity).toBe(15);
  });
});

describe("defaultAgricultureState", () => {
  it("returns valid initial state", () => {
    const s = defaultAgricultureState();
    expect(s.id).toBe("agriculture");
    expect(s.indicators.foodPriceIndex).toBe(65);
    expect(s.indicators.foodImportDependency).toBe(35);
    expect(s.indicators.mechanizationRate).toBe(15);
    expect(s.indicators.cropOutputIndex).toBe(55);
    expect(s.indicators.herderFarmerTension).toBe(50);
    expect(s.indicators.postHarvestLossPct).toBe(35);
  });
});

describe("defaultHealthState", () => {
  it("returns valid initial state", () => {
    const s = defaultHealthState();
    expect(s.id).toBe("health");
    expect(s.indicators.phcCoverage).toBe(40);
    expect(s.indicators.hospitalBedRatio).toBe(0.5);
    expect(s.indicators.healthWorkerDensity).toBe(1.5);
    expect(s.indicators.immunizationRate).toBe(57);
    expect(s.indicators.epidemicRisk).toBe(35);
    expect(s.indicators.outOfPocketSpendPct).toBe(75);
  });
});

describe("defaultEducationState", () => {
  it("returns valid initial state", () => {
    const s = defaultEducationState();
    expect(s.id).toBe("education");
    expect(s.indicators.enrollmentRate).toBe(62);
    expect(s.indicators.outOfSchoolChildren).toBe(18.5);
    expect(s.indicators.asuuStrikeRisk).toBe(45);
  });
});

describe("defaultEnvironmentState", () => {
  it("returns valid initial state", () => {
    const s = defaultEnvironmentState();
    expect(s.id).toBe("environment");
    expect(s.indicators.desertificationIndex).toBe(55);
    expect(s.indicators.gasFlareIndex).toBe(70);
    expect(s.indicators.climateAdaptationScore).toBe(20);
  });
});

describe("defaultInteriorState", () => {
  it("returns valid initial state", () => {
    const s = defaultInteriorState();
    expect(s.id).toBe("interior");
    expect(s.indicators.borderSecurityScore).toBe(40);
    expect(s.indicators.prisonOccupancyRate).toBe(270);
  });
});

describe("defaultYouthEmploymentState", () => {
  it("returns valid initial state", () => {
    const s = defaultYouthEmploymentState();
    expect(s.id).toBe("youthEmployment");
    expect(s.indicators.youthUnemploymentRate).toBe(42);
    expect(s.indicators.socialUnrestRisk).toBe(55);
  });
});

describe("defaultBudgetAllocation", () => {
  it("sums to 100", () => {
    const b = defaultBudgetAllocation();
    const total = Object.values(b).reduce((a, c) => a + c, 0);
    expect(total).toBe(100);
  });
});

describe("buildCrossSectorEffects", () => {
  it("returns a valid effects object from game state fields", () => {
    const effects = buildCrossSectorEffects({
      economy: { gdp: 500, inflation: 15, fxRate: 1200, unemploymentRate: 25,
        sectors: [{ id: "oil", gdpValue: 190 }, { id: "agriculture", gdpValue: 120 },
          { id: "manufacturing", gdpValue: 75 }, { id: "services", gdpValue: 80 },
          { id: "tourism", gdpValue: 35 }],
        treasuryLiquidity: 150 } as any,
      stability: 60,
      infrastructure: defaultInfrastructureState(),
      agriculture: defaultAgricultureState(),
      health: defaultHealthState(),
      education: defaultEducationState(),
      youthEmployment: defaultYouthEmploymentState(),
      environment: defaultEnvironmentState(),
      interior: defaultInteriorState(),
    });
    expect(effects.gdp).toBe(500);
    expect(effects.stability).toBe(60);
    expect(effects.inflation).toBe(15);
  });
});
