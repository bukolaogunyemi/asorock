import type { SectorState, EconomicState, SectorId, PolicyModifier, RevenueState, ExpenditureState, CrisisIndicators, CascadeEvent, CascadeType } from "./economicTypes";
import type { PolicyLeverKey, AnyPolicyPosition } from "./gameTypes";

/** External shocks applied per-turn to sectors */
export interface ExternalShock {
  sectorId: SectorId;
  effect: number;
}

/** Result of applying a policy lever to sectors */
export interface SectorPolicyEffect {
  sectorId: SectorId;
  effect: number;
  duration: number;
}

function createSector(id: SectorId, name: string, gdpShare: number, gdpValue: number, employmentWeight: number, growthRate: number): SectorState {
  return {
    id,
    name,
    gdpShare,
    gdpValue,
    growthRate,
    employmentWeight,
    momentum: 0,
    policyModifiers: [],
  };
}

/** Returns the default initial EconomicState with 5 sectors */
export function defaultEconomicState(): EconomicState {
  return {
    gdp: 500,
    sectors: [
      createSector("oil", "Oil & Gas", 38, 190, 0.05, 1.0),
      createSector("agriculture", "Agriculture", 24, 120, 0.35, 1.5),
      createSector("manufacturing", "Manufacturing", 15, 75, 0.25, 0.8),
      createSector("services", "Services", 16, 80, 0.25, 2.0),
      createSector("tourism", "Tourism", 7, 35, 0.10, 1.0),
    ],
    gdpGrowthRate: 0,
    unemploymentRate: 25,
    revenue: { total: 25, oil: 10, tax: 8, igr: 2, trade: 3, borrowing: 2 },
    expenditure: { total: 23, recurrent: 12, capital: 5, debtServicing: 4, transfers: 2 },
    treasuryLiquidity: 150,
    treasuryMonthsOfCover: 4,
    inflation: 15,
    fxRate: 1200,
    fxRateBaseline: 1000,
    reserves: 32,
    debtToGdp: 35,
    oilOutput: 2.0,
    subsidyPressure: 30,
    crisisIndicators: {
      inflationZone: "green",
      unemploymentZone: "green",
      fxZone: "green",
      debtZone: "green",
      treasuryZone: "green",
      oilOutputZone: "green",
    },
    activeCascades: [],
    history: [],
  };
}

/**
 * Advance all sectors by one turn.
 * Each sector's growth is recalculated based on base rate, momentum, policy modifiers,
 * external shocks, and randomness.
 */
export function advanceSectors(
  sectors: SectorState[],
  externalShocks: ExternalShock[] = [],
  randomFn: () => number = Math.random,
): SectorState[] {
  const updated = sectors.map((sector) => {
    // Sum policy modifier effects
    const modifierEffect = sector.policyModifiers.reduce((sum, m) => sum + m.effect, 0);

    // Sum external shocks for this sector
    const shockEffect = externalShocks
      .filter((s) => s.sectorId === sector.id)
      .reduce((sum, s) => sum + s.effect, 0);

    // Calculate new growth rate
    const randomComponent = (randomFn() - 0.5); // range -0.5 to 0.5
    const newGrowthRate = 0.5 + sector.momentum * 0.1 + modifierEffect + shockEffect + randomComponent;

    // Calculate new GDP value
    const newGdpValue = sector.gdpValue * (1 + newGrowthRate / 100);

    // Update momentum
    const newMomentum = newGrowthRate > 0
      ? Math.min(sector.momentum + 1, 5)
      : 0;

    // Decrement policy modifier durations, remove expired ones
    const newModifiers = sector.policyModifiers
      .map((m) => ({ ...m, duration: m.duration - 1 }))
      .filter((m) => m.duration > 0);

    return {
      ...sector,
      growthRate: newGrowthRate,
      gdpValue: newGdpValue,
      momentum: newMomentum,
      policyModifiers: newModifiers,
    };
  });

  // Recalculate GDP shares
  const totalGdp = updated.reduce((sum, s) => sum + s.gdpValue, 0);
  return updated.map((s) => ({
    ...s,
    gdpShare: totalGdp > 0 ? (s.gdpValue / totalGdp) * 100 : 0,
  }));
}

/**
 * Calculate unemployment rate from sectoral performance.
 * Higher growth in employment-heavy sectors reduces unemployment more.
 */
export function calculateUnemployment(sectors: SectorState[], baseRate: number): number {
  const reduction = sectors.reduce(
    (sum, s) => sum + s.growthRate * s.employmentWeight * 2,
    0,
  );
  return Math.max(5, Math.min(50, baseRate - reduction));
}

/**
 * Maps a policy lever change to sector modifiers.
 * Returns an array of effects to be applied as PolicyModifiers on the relevant sectors.
 */
export function applyPolicyToSectors(
  leverKey: PolicyLeverKey,
  position: AnyPolicyPosition,
): SectorPolicyEffect[] {
  const effects: SectorPolicyEffect[] = [];

  if (leverKey === "fuelSubsidy") {
    if (position === "removed") {
      effects.push(
        { sectorId: "oil", effect: 1.5, duration: 5 },
        { sectorId: "manufacturing", effect: -1.0, duration: 5 },
        { sectorId: "services", effect: -0.5, duration: 5 },
      );
    } else if (position === "full") {
      effects.push(
        { sectorId: "oil", effect: -1.0, duration: 5 },
        { sectorId: "manufacturing", effect: 0.5, duration: 5 },
      );
    }
  }

  if (leverKey === "fxPolicy") {
    if (position === "free-float") {
      effects.push(
        { sectorId: "manufacturing", effect: 1.0, duration: 4 },
        { sectorId: "services", effect: 0.5, duration: 4 },
        { sectorId: "oil", effect: -0.5, duration: 4 },
      );
    }
  }

  if (leverKey === "importTariffs") {
    if (position === "restrictive") {
      effects.push(
        { sectorId: "manufacturing", effect: 1.5, duration: 4 },
        { sectorId: "services", effect: -0.5, duration: 4 },
        { sectorId: "tourism", effect: -1.0, duration: 4 },
      );
    }
  }

  if (leverKey === "taxRate") {
    if (position === "high") {
      effects.push(
        { sectorId: "oil", effect: -0.5, duration: 4 },
        { sectorId: "agriculture", effect: -0.5, duration: 4 },
        { sectorId: "manufacturing", effect: -0.5, duration: 4 },
        { sectorId: "services", effect: -0.5, duration: 4 },
        { sectorId: "tourism", effect: -0.5, duration: 4 },
      );
    }
  }

  if (leverKey === "publicSectorHiring") {
    if (position === "expansion") {
      effects.push(
        { sectorId: "services", effect: 1.0, duration: 3 },
      );
    }
  }

  return effects;
}

// ── Task 4: Revenue & Expenditure Processing ──

export function calculateRevenue(state: EconomicState): RevenueState {
  const oilSector = state.sectors.find((s) => s.id === "oil")!;
  const oil = Math.max(0, oilSector.gdpValue * 0.15 - state.subsidyPressure * 0.1);

  const nonOilGDP = state.sectors
    .filter((s) => s.id !== "oil")
    .reduce((sum, s) => sum + s.gdpValue, 0);
  const tax = nonOilGDP * 0.06 * 0.6;

  const igr = 2.0 * (1 + state.gdpGrowthRate / 100);

  const mfg = state.sectors.find((s) => s.id === "manufacturing")!;
  const svc = state.sectors.find((s) => s.id === "services")!;
  const trade = (mfg.gdpValue + svc.gdpValue) * 0.08;

  const borrowing = 0;
  const total = oil + tax + igr + trade + borrowing;

  return { total, oil, tax, igr, trade, borrowing };
}

export function calculateExpenditure(state: EconomicState): ExpenditureState {
  const debtServicing = state.debtToGdp * 0.12;
  const transfers = 2 + state.subsidyPressure * 0.03;
  const recurrent = 12;
  const capital = Math.max(2, 5 - state.debtToGdp * 0.04);

  const total = debtServicing + transfers + recurrent + capital;
  return { total, recurrent, capital, debtServicing, transfers };
}

export function updateTreasury(state: EconomicState): EconomicState {
  let newLiquidity = state.treasuryLiquidity + state.revenue.total - state.expenditure.total;
  const updatedRevenue = { ...state.revenue };
  let debtToGdp = state.debtToGdp;

  if (newLiquidity < 0) {
    const borrowed = Math.abs(newLiquidity) * 1.1;
    updatedRevenue.borrowing = borrowed;
    updatedRevenue.total = updatedRevenue.total + borrowed;
    debtToGdp = debtToGdp + borrowed * 0.02;
    newLiquidity = 0;
  }

  return {
    ...state,
    treasuryLiquidity: newLiquidity,
    revenue: updatedRevenue,
    debtToGdp,
  };
}

export function calculateMonthsOfCover(liquidity: number, totalExpenditure: number): number {
  if (totalExpenditure === 0) return 0;
  return liquidity / (totalExpenditure / 12);
}

export function updateReserves(state: EconomicState): number {
  const delta =
    state.oilOutput * 0.3 -
    (state.fxRate - state.fxRateBaseline) * 0.001 -
    state.subsidyPressure * 0.01;
  return Math.max(0, state.reserves + delta);
}

export function updateSubsidyPressure(fuelSubsidyLevel: string, oilOutput: number): number {
  switch (fuelSubsidyLevel) {
    case "full":
      return 60 + oilOutput * 10;
    case "partial":
      return 40 + oilOutput * 5;
    case "targeted":
      return 20;
    case "removed":
      return 5;
    default:
      return 30;
  }
}

// ── Task 5: Crisis Thresholds & Cascade Engine ──

export function evaluateCrisisIndicators(metrics: {
  inflation: number;
  unemploymentRate: number;
  fxRate: number;
  fxRateBaseline: number;
  debtToGdp: number;
  treasuryMonthsOfCover: number;
  oilOutput: number;
}): CrisisIndicators {
  const fxDepreciation =
    ((metrics.fxRate - metrics.fxRateBaseline) / metrics.fxRateBaseline) * 100;

  const zone = (value: number, greenMax: number, yellowMax: number): "green" | "yellow" | "red" =>
    value < greenMax ? "green" : value <= yellowMax ? "yellow" : "red";

  const zoneInverse = (value: number, greenMin: number, yellowMin: number): "green" | "yellow" | "red" =>
    value > greenMin ? "green" : value >= yellowMin ? "yellow" : "red";

  return {
    inflationZone: zone(metrics.inflation, 20, 30),
    unemploymentZone: zone(metrics.unemploymentRate, 25, 35),
    fxZone: zone(fxDepreciation, 30, 50),
    debtZone: zone(metrics.debtToGdp, 40, 55),
    treasuryZone: zoneInverse(metrics.treasuryMonthsOfCover, 3, 1),
    oilOutputZone: zoneInverse(metrics.oilOutput, 2.0, 1.5),
  };
}

const cascadeDefinitions: Array<{
  zoneKey: keyof CrisisIndicators;
  type: CascadeType;
  triggerMetric: string;
  affectedMetrics: string[];
}> = [
  { zoneKey: "inflationZone", type: "inflation-fx-spiral", triggerMetric: "inflation", affectedMetrics: ["fxRate"] },
  { zoneKey: "unemploymentZone", type: "unemployment-security-tourism", triggerMetric: "unemployment", affectedMetrics: ["stability", "tourism"] },
  { zoneKey: "debtZone", type: "debt-austerity-recession", triggerMetric: "debt", affectedMetrics: ["expenditure", "growth"] },
  { zoneKey: "oilOutputZone", type: "oil-fiscal-arrears", triggerMetric: "oilOutput", affectedMetrics: ["revenue"] },
  { zoneKey: "fxZone", type: "currency-manufacturing-unemployment", triggerMetric: "fxRate", affectedMetrics: ["manufacturing", "unemployment"] },
];

export function detectNewCascades(
  indicators: CrisisIndicators,
  existingCascades: CascadeEvent[],
): CascadeEvent[] {
  const newCascades: CascadeEvent[] = [];

  for (const def of cascadeDefinitions) {
    if (
      indicators[def.zoneKey] === "red" &&
      !existingCascades.some((c) => c.type === def.type && !c.resolved)
    ) {
      newCascades.push({
        id: `cascade-${def.type}-${Date.now()}`,
        type: def.type,
        triggerMetric: def.triggerMetric,
        affectedMetrics: def.affectedMetrics,
        turnsActive: 0,
        severity: 1,
        resolved: false,
      });
    }
  }

  return newCascades;
}

export function advanceCascade(cascade: CascadeEvent): CascadeEvent {
  return {
    ...cascade,
    turnsActive: cascade.turnsActive + 1,
    severity: Math.min(cascade.severity + 1, 10),
  };
}

export function checkCascadeResolution(
  cascade: CascadeEvent,
  indicators: CrisisIndicators,
): CascadeEvent {
  const def = cascadeDefinitions.find((d) => d.type === cascade.type);
  if (def && indicators[def.zoneKey] !== "red") {
    return { ...cascade, resolved: true };
  }
  return cascade;
}

export function processCascades(state: EconomicState): {
  cascades: CascadeEvent[];
  cascadeEffects: { inflation?: number; fxRate?: number; unemployment?: number };
} {
  // 1. Advance all active cascades
  let cascades = state.activeCascades.map((c) =>
    c.resolved ? c : advanceCascade(c),
  );

  // 2. Check resolution
  cascades = cascades.map((c) =>
    c.resolved ? c : checkCascadeResolution(c, state.crisisIndicators),
  );

  // 3. Detect new cascades
  const newCascades = detectNewCascades(state.crisisIndicators, cascades);
  cascades = [...cascades, ...newCascades];

  // 4. Calculate cumulative cascade effects
  const effects: { inflation?: number; fxRate?: number; unemployment?: number } = {};

  for (const c of cascades) {
    if (c.resolved) continue;
    const contribution = c.severity * 0.5;

    if (c.type === "inflation-fx-spiral") {
      effects.fxRate = (effects.fxRate ?? 0) + contribution;
    } else if (c.type === "unemployment-security-tourism") {
      // stability/tourism - map to unemployment as proxy
      effects.unemployment = (effects.unemployment ?? 0) + contribution;
    } else if (c.type === "debt-austerity-recession") {
      effects.inflation = (effects.inflation ?? 0) + contribution;
    } else if (c.type === "oil-fiscal-arrears") {
      effects.inflation = (effects.inflation ?? 0) + contribution;
    } else if (c.type === "currency-manufacturing-unemployment") {
      effects.unemployment = (effects.unemployment ?? 0) + contribution;
    }
  }

  return { cascades, cascadeEffects: effects };
}
