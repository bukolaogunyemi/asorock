// sectorTypes.ts
import type { SectorId } from "./economicTypes";

// ── Base Types ──────────────────────────────────────────────
export type CrisisZone = "green" | "yellow" | "red";

export interface GovernanceSectorState {
  id: string;
  health: number;
  momentum: number;
  turnsSinceAttention: number;
  crisisZone: CrisisZone;
  activeCascades: string[];
  indicators: Record<string, number>;
}

// ── Cross-Sector Effects ────────────────────────────────────
export interface CrossSectorEffects {
  gdp: number;
  inflation: number;
  fxRate: number;
  sectorGdpValues: Record<SectorId, number>;
  treasuryLiquidity: number;
  unemploymentRate: number;
  stability: number;
  powerSupplyFactor: number;
  transportScore: number;
  digitalIndex: number;
  foodPriceIndex: number;
  foodSecurityScore: number;
  workforceProductivity: number;
  epidemicActive: boolean;
  humanCapitalIndex: number;
  asuuStrikeActive: boolean;
  youthUnrestRisk: number;
  laborForceQuality: number;
  disasterRisk: number;
  agriculturalResilience: number;
  borderIntegrity: number;
  civilRegistryScore: number;
}

// ── Budget Allocation ───────────────────────────────────────
export interface BudgetAllocation {
  economy: number;
  infrastructure: number;
  health: number;
  education: number;
  agriculture: number;
  interior: number;
  environment: number;
  youthEmployment: number;
}

export function defaultBudgetAllocation(): BudgetAllocation {
  return {
    economy: 22,
    infrastructure: 27,
    health: 10,
    education: 13,
    agriculture: 6,
    interior: 12,
    environment: 4,
    youthEmployment: 6,
  };
}

// ── Cascade Types ───────────────────────────────────────────
export interface CascadeTriggerSingle {
  kind: "single";
  sector: string;
  indicator: string;
  condition: "gt" | "lt";
  threshold: number;
}

export interface CascadeTriggerCompound {
  kind: "compound";
  conditions: Array<{ sector: string; indicator: string; condition: "gt" | "lt"; threshold: number }>;
  minSectorsInRed?: number;
  minTurnsActive?: number;
}

export type CascadeTrigger = CascadeTriggerSingle | CascadeTriggerCompound;

export interface CrossSectorCascade {
  id: string;
  trigger: CascadeTrigger;
  effects: Array<{ sector: string; indicator: string; delta: number; delay: number }>;
  secondOrder?: { triggerAfterTurns: number; cascadeId: string };
  severity: number;
  resolved: boolean;
  turnsActive: number;
}

// ── Sector Health Computation ───────────────────────────────
const INVERT_INDICATORS = new Set([
  "transmissionLossRate",
  "epidemicRisk",
  "outOfPocketSpendPct",
  "asuuStrikeRisk",
  "foodPriceIndex",
  "foodImportDependency",
  "postHarvestLossPct",
  "herderFarmerTension",
  "prisonOccupancyRate",
  "deforestationRate",
  "desertificationIndex",
  "floodDisplacementRisk",
  "gasFlareIndex",
  "carbonIntensity",
  "youthUnemploymentRate",
  "socialUnrestRisk",
]);

const INDICATOR_MAX: Record<string, number> = {
  powerGenerationGW: 15,
  railCoverageKm: 10000,
  hospitalBedRatio: 3.0,
  healthWorkerDensity: 4.45,
  outOfSchoolChildren: 25,
  prisonOccupancyRate: 400,
};

function normalizeIndicator(key: string, value: number): number {
  const max = INDICATOR_MAX[key];
  if (max !== undefined) {
    const normalized = Math.min(100, (value / max) * 100);
    return INVERT_INDICATORS.has(key) ? 100 - normalized : normalized;
  }
  return INVERT_INDICATORS.has(key) ? 100 - value : value;
}

export function computeSectorHealth(indicators: Record<string, number>): number {
  const keys = Object.keys(indicators);
  if (keys.length === 0) return 50;
  const sum = keys.reduce((acc, k) => acc + normalizeIndicator(k, indicators[k]), 0);
  return Math.round(sum / keys.length);
}

export function evaluateCrisisZone(sectorId: string, health: number): CrisisZone {
  const thresholds: Record<string, { green: number; yellow: number }> = {
    infrastructure: { green: 60, yellow: 35 },
    health: { green: 55, yellow: 30 },
    education: { green: 50, yellow: 30 },
    agriculture: { green: 55, yellow: 35 },
    interior: { green: 50, yellow: 30 },
    environment: { green: 45, yellow: 25 },
    youthEmployment: { green: 50, yellow: 30 },
  };
  const t = thresholds[sectorId] ?? { green: 50, yellow: 30 };
  if (health > t.green) return "green";
  if (health >= t.yellow) return "yellow";
  return "red";
}

// ── Default State Factories ─────────────────────────────────

function makeSectorState(id: string, indicators: Record<string, number>): GovernanceSectorState {
  const health = computeSectorHealth(indicators);
  return {
    id,
    health,
    momentum: 0,
    turnsSinceAttention: 0,
    crisisZone: evaluateCrisisZone(id, health),
    activeCascades: [],
    indicators,
  };
}

export function defaultInfrastructureState(): GovernanceSectorState {
  return makeSectorState("infrastructure", {
    powerGenerationGW: 4.5,
    transmissionLossRate: 40,
    roadNetworkScore: 35,
    railCoverageKm: 3500,
    broadbandPenetration: 38,
    oilRefiningCapacity: 15,
  });
}

export function defaultHealthState(): GovernanceSectorState {
  return makeSectorState("health", {
    phcCoverage: 40,
    hospitalBedRatio: 0.5,
    healthWorkerDensity: 1.5,
    immunizationRate: 57,
    epidemicRisk: 35,
    outOfPocketSpendPct: 75,
  });
}

export function defaultEducationState(): GovernanceSectorState {
  return makeSectorState("education", {
    enrollmentRate: 62,
    literacyRate: 62,
    outOfSchoolChildren: 18.5,
    asuuStrikeRisk: 45,
    educationBudgetUtilization: 55,
    tertiaryGraduationRate: 12,
  });
}

export function defaultAgricultureState(): GovernanceSectorState {
  return makeSectorState("agriculture", {
    foodPriceIndex: 65,
    foodImportDependency: 35,
    mechanizationRate: 15,
    cropOutputIndex: 55,
    herderFarmerTension: 50,
    postHarvestLossPct: 35,
  });
}

export function defaultInteriorState(): GovernanceSectorState {
  return makeSectorState("interior", {
    borderSecurityScore: 40,
    nationalIdPenetration: 45,
    prisonOccupancyRate: 270,
    immigrationProcessingScore: 35,
    correctionalRehabRate: 8,
  });
}

export function defaultEnvironmentState(): GovernanceSectorState {
  return makeSectorState("environment", {
    deforestationRate: 65,
    desertificationIndex: 55,
    floodDisplacementRisk: 55,
    gasFlareIndex: 70,
    carbonIntensity: 60,
    climateAdaptationScore: 20,
  });
}

export function defaultYouthEmploymentState(): GovernanceSectorState {
  return makeSectorState("youthEmployment", {
    youthUnemploymentRate: 42,
    nyscDeploymentRate: 65,
    skillsProgramEnrollment: 12,
    startupFormationRate: 25,
    socialUnrestRisk: 55,
  });
}

// ── Build CrossSectorEffects from game state ────────────────

export function buildCrossSectorEffects(state: {
  economy: any;
  stability: number;
  infrastructure: GovernanceSectorState;
  agriculture: GovernanceSectorState;
  health: GovernanceSectorState;
  education: GovernanceSectorState;
  youthEmployment: GovernanceSectorState;
  environment: GovernanceSectorState;
  interior: GovernanceSectorState;
}): CrossSectorEffects {
  const eco = state.economy;
  const gdpValues: Record<SectorId, number> = {
    oil: 0,
    agriculture: 0,
    manufacturing: 0,
    services: 0,
    tourism: 0,
  };
  for (const s of eco.sectors ?? []) gdpValues[s.id as SectorId] = s.gdpValue;

  const infra = state.infrastructure.indicators;
  const agri = state.agriculture.indicators;
  const health = state.health.indicators;
  const edu = state.education.indicators;
  const youth = state.youthEmployment.indicators;
  const env = state.environment.indicators;
  const interior = state.interior.indicators;

  return {
    gdp: eco.gdp ?? 500,
    inflation: eco.inflation ?? 15,
    fxRate: eco.fxRate ?? 1200,
    sectorGdpValues: gdpValues,
    treasuryLiquidity: eco.treasuryLiquidity ?? 150,
    unemploymentRate: eco.unemploymentRate ?? 25,
    stability: state.stability,
    powerSupplyFactor: Math.max(
      0,
      Math.min(
        1,
        ((infra.powerGenerationGW ?? 4.5) * (1 - (infra.transmissionLossRate ?? 40) / 100)) / 10,
      ),
    ),
    transportScore: infra.roadNetworkScore ?? 35,
    digitalIndex: infra.broadbandPenetration ?? 38,
    foodPriceIndex: agri.foodPriceIndex ?? 65,
    foodSecurityScore: Math.max(
      0,
      100 - (agri.foodPriceIndex ?? 65) - (agri.foodImportDependency ?? 35) * 0.3,
    ),
    workforceProductivity: Math.max(
      0.5,
      Math.min(
        1.0,
        1.0 -
          ((health.epidemicRisk ?? 35) > 80 ? 0.2 : 0) -
          (1 - (health.healthWorkerDensity ?? 1.5) / 4.45) * 0.1,
      ),
    ),
    epidemicActive: (health.epidemicRisk ?? 35) > 80,
    humanCapitalIndex:
      ((edu.enrollmentRate ?? 62) + (edu.literacyRate ?? 62) + (edu.tertiaryGraduationRate ?? 12)) / 3,
    asuuStrikeActive: (edu.asuuStrikeRisk ?? 45) > 80,
    youthUnrestRisk: youth.socialUnrestRisk ?? 55,
    laborForceQuality: Math.max(
      0,
      100 - (youth.youthUnemploymentRate ?? 42) - (100 - (youth.skillsProgramEnrollment ?? 12)) * 0.2,
    ),
    disasterRisk: ((env.floodDisplacementRisk ?? 55) + (env.desertificationIndex ?? 55)) / 2,
    agriculturalResilience: env.climateAdaptationScore ?? 20,
    borderIntegrity: interior.borderSecurityScore ?? 40,
    civilRegistryScore: interior.nationalIdPenetration ?? 45,
  };
}
