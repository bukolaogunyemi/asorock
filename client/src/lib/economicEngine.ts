import type { SectorState, EconomicState, SectorId, PolicyModifier } from "./economicTypes";
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
