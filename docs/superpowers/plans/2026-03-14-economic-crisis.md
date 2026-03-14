# Economic Crisis Events Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `MacroEconomicState` with a full sectoral GDP model (5 sectors), itemized revenue/expenditure fiscal pipeline, derived unemployment, and tipping-point cascade system where economic crises propagate across metrics.

**Architecture:** An `economicEngine.ts` processes the economy each turn: advancing 5 sectors (oil, agriculture, manufacturing, services, tourism) based on policy lever effects and external shocks, calculating revenue from 5 streams, processing expenditure against treasury, deriving unemployment from sectoral employment weights, checking 6 crisis thresholds, and propagating cascade events. `MacroEconomicState` is fully replaced by `EconomicState`. Existing macro field references are migrated.

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-14-economic-crisis-design.md`

**Depends on:** Sub-Project A (Legislative Engine) — for budget process integration. All other sub-projects interact with economic state.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `client/src/lib/economicTypes.ts` | Interfaces: `EconomicState`, `SectorState`, `SectorId`, `RevenueState`, `ExpenditureState`, `PolicyModifier`, `CrisisIndicators`, `CascadeEvent`, `CascadeType`, `EconomicSnapshot` |
| `client/src/lib/economicEngine.ts` | Sectoral GDP, revenue/expenditure, treasury, unemployment, crisis thresholds, cascades, policy lever mapping |
| `client/src/lib/economicEngine.test.ts` | Unit tests |
| `client/src/lib/gameTypes.ts` | Modified: remove `MacroEconomicState`, add `EconomicState` to `GameState` |
| `client/src/lib/gameEngine.ts` | Modified: replace macro processing with economic engine calls, migrate all `macroEconomy` references |
| `client/src/lib/GameContext.tsx` | Modified: initialize economic state |
| `client/src/components/EconomyTab.tsx` | Modified: expand to show sectoral GDP, fiscal pipeline, crisis dashboard |

---

## Chunk 1: Types & Sectoral GDP

### Task 1: Create Economic Types

**Files:**
- Create: `client/src/lib/economicTypes.ts`

- [ ] **Step 1: Create the types file**

```typescript
// client/src/lib/economicTypes.ts
export type SectorId = "oil" | "agriculture" | "manufacturing" | "services" | "tourism";

export type CascadeType =
  | "inflation-fx-spiral"
  | "unemployment-security-tourism"
  | "debt-austerity-recession"
  | "oil-fiscal-arrears"
  | "currency-manufacturing-unemployment";

export interface PolicyModifier {
  source: string;
  effect: number;
  duration: number;
}

export interface SectorState {
  id: SectorId;
  name: string;
  gdpShare: number;
  gdpValue: number;
  growthRate: number;
  employmentWeight: number;
  momentum: number;
  policyModifiers: PolicyModifier[];
}

export interface RevenueState {
  total: number;
  oil: number;
  tax: number;
  igr: number;
  trade: number;
  borrowing: number;
}

export interface ExpenditureState {
  total: number;
  recurrent: number;
  capital: number;
  debtServicing: number;
  transfers: number;
}

export interface CrisisIndicators {
  inflationZone: "green" | "yellow" | "red";
  unemploymentZone: "green" | "yellow" | "red";
  fxZone: "green" | "yellow" | "red";
  debtZone: "green" | "yellow" | "red";
  treasuryZone: "green" | "yellow" | "red";
  oilOutputZone: "green" | "yellow" | "red";
}

export interface CascadeEvent {
  id: string;
  type: CascadeType;
  triggerMetric: string;
  affectedMetrics: string[];
  turnsActive: number;
  severity: number;
  resolved: boolean;
}

export interface EconomicSnapshot {
  day: number;
  gdp: number;
  sectorGdpValues: Record<SectorId, number>;
  unemploymentRate: number;
  inflation: number;
  fxRate: number;
  treasuryLiquidity: number;
  debtToGdp: number;
  oilOutput: number;
}

export interface EconomicState {
  gdp: number;
  sectors: SectorState[];
  gdpGrowthRate: number;
  unemploymentRate: number;
  revenue: RevenueState;
  expenditure: ExpenditureState;
  treasuryLiquidity: number;
  treasuryMonthsOfCover: number;
  inflation: number;
  fxRate: number;
  fxRateBaseline: number;
  reserves: number;
  debtToGdp: number;
  oilOutput: number;
  subsidyPressure: number;
  crisisIndicators: CrisisIndicators;
  activeCascades: CascadeEvent[];
  history: EconomicSnapshot[];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/economicTypes.ts
git commit -m "feat(economic): add TypeScript interfaces for economic system"
```

---

### Task 2: Replace MacroEconomicState in GameState

**Files:**
- Modify: `client/src/lib/gameTypes.ts`

- [ ] **Step 1: Remove MacroEconomicState and add EconomicState**

In `gameTypes.ts`:
- Remove `MacroEconomicState` interface and `MacroHistoryPoint` interface
- Remove `MacroKey` type (replaced by accessing `EconomicState` fields directly)
- Remove `macroEconomy: MacroEconomicState` and `macroHistory: MacroHistoryPoint[]` from `GameState`
- Add: `economy: EconomicState`

```typescript
import type { EconomicState } from "./economicTypes";
// Replace in GameState:
// macroEconomy: MacroEconomicState;  // REMOVE
// macroHistory: MacroHistoryPoint[];  // REMOVE
economy: EconomicState;               // ADD
```

- [ ] **Step 2: Find and update all macroEconomy references**

Search the codebase for all `macroEconomy` and `MacroEconomicState` references. Key files to update:
- `gameEngine.ts` — `state.macroEconomy.inflation` → `state.economy.inflation`, etc.
- `GameContext.tsx` — initialization
- `factionDrift.ts` — macro references
- `EconomyTab.tsx` — display
- `gameEngine.test.ts` — test references
- `victorySystem.ts` — macro references in victory/defeat calculations
- `policyNarrative.ts` — macro references

Each `state.macroEconomy.X` becomes `state.economy.X` — the field names are identical.

Also update `MacroKey` references to use the economic state fields directly.

- [ ] **Step 3: Run type check to find remaining issues**

Run: `cd client && npx tsc --noEmit`
Fix any remaining type errors from the migration.

- [ ] **Step 4: Run all existing tests**

Run: `cd client && npx vitest run`
Expected: All PASS (existing functionality preserved)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(economic): replace MacroEconomicState with EconomicState on GameState"
```

---

### Task 3: Sectoral GDP Engine

**Files:**
- Create: `client/src/lib/economicEngine.ts`
- Create: `client/src/lib/economicEngine.test.ts`

- [ ] **Step 1: Write tests for sectoral GDP calculation**

```typescript
// client/src/lib/economicEngine.test.ts
import { describe, expect, it } from "vitest";
import {
  advanceSectors, calculateUnemployment, defaultEconomicState,
  applyPolicyToSectors,
} from "./economicEngine";

describe("economicEngine", () => {
  describe("advanceSectors", () => {
    it("should update GDP values for all 5 sectors", () => {
      const state = defaultEconomicState();
      const result = advanceSectors(state.sectors, []);
      expect(result.length).toBe(5);
      for (const sector of result) {
        expect(sector.gdpValue).toBeGreaterThan(0);
      }
    });

    it("should increase momentum on positive growth", () => {
      const state = defaultEconomicState();
      const oil = state.sectors.find((s) => s.id === "oil")!;
      oil.momentum = 3;
      oil.policyModifiers = [{ source: "test", effect: 2, duration: 5 }];
      const result = advanceSectors(state.sectors, []);
      const updatedOil = result.find((s) => s.id === "oil")!;
      expect(updatedOil.momentum).toBeGreaterThanOrEqual(3);
    });

    it("should reset momentum on negative growth", () => {
      const state = defaultEconomicState();
      const mfg = state.sectors.find((s) => s.id === "manufacturing")!;
      mfg.momentum = 5;
      mfg.policyModifiers = [{ source: "test", effect: -5, duration: 5 }];
      const result = advanceSectors(state.sectors, []);
      const updatedMfg = result.find((s) => s.id === "manufacturing")!;
      // With -5% policy effect, growth should be negative → momentum reset
      expect(updatedMfg.momentum).toBe(0);
    });

    it("total GDP should equal sum of sector values", () => {
      const state = defaultEconomicState();
      const result = advanceSectors(state.sectors, []);
      const totalGdp = result.reduce((sum, s) => sum + s.gdpValue, 0);
      expect(totalGdp).toBeGreaterThan(0);
    });

    it("sector shares should sum to approximately 100%", () => {
      const state = defaultEconomicState();
      const result = advanceSectors(state.sectors, []);
      const totalShare = result.reduce((sum, s) => sum + s.gdpShare, 0);
      expect(totalShare).toBeCloseTo(100, 0);
    });
  });

  describe("calculateUnemployment", () => {
    it("should derive unemployment from sectoral performance", () => {
      const sectors = defaultEconomicState().sectors;
      const rate = calculateUnemployment(sectors, 25);
      expect(rate).toBeGreaterThanOrEqual(5);
      expect(rate).toBeLessThanOrEqual(50);
    });

    it("agriculture growth should have biggest impact on unemployment", () => {
      const sectors = defaultEconomicState().sectors;
      // Boost agriculture growth
      const agSector = sectors.find((s) => s.id === "agriculture")!;
      agSector.growthRate = 5;
      const rateWithAgGrowth = calculateUnemployment(sectors, 25);

      // Boost oil growth instead
      const sectors2 = defaultEconomicState().sectors;
      const oilSector = sectors2.find((s) => s.id === "oil")!;
      oilSector.growthRate = 5;
      const rateWithOilGrowth = calculateUnemployment(sectors2, 25);

      // Agriculture should reduce unemployment more
      expect(rateWithAgGrowth).toBeLessThan(rateWithOilGrowth);
    });
  });

  describe("applyPolicyToSectors", () => {
    it("should create policy modifiers matching spec table", () => {
      const modifiers = applyPolicyToSectors("fuelSubsidy", "removed");
      const oilMod = modifiers.find((m) => m.sectorId === "oil");
      expect(oilMod).toBeDefined();
      expect(oilMod!.effect).toBeGreaterThan(0); // oil benefits from subsidy removal
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/economicEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement sectoral GDP engine**

Create `client/src/lib/economicEngine.ts`:
- `defaultEconomicState()` — returns initial state with 5 sectors at base shares (oil 38%, agriculture 24%, manufacturing 15%, services 16%, tourism 7%), starting GDP values, employment weights, etc.
- `advanceSectors(sectors, externalShocks)` — per-turn sector calculation:
  ```
  growthRate = 0.5% (base) + momentum × 0.1% + Σ(policyModifier effects) + shockEffect + random(−1%, +1%)
  gdpValue = previousGdpValue × (1 + growthRate/100)
  ```
  Updates momentum: positive growth → +1, negative → reset to 0. Recalculates gdpShare.
- `calculateUnemployment(sectors, baseRate)` — `baseRate - Σ(growthRate × employmentWeight)`, clamped 5-50%
- `applyPolicyToSectors(leverKey, position)` — maps policy lever changes to PolicyModifier objects per the spec Section 2.3 table. Duration 4-6 turns, onset delay 2-3 turns.
- Tourism special mechanics: security-gated (worst zone security < 30 → cap -2%, 30-60 → cap 0%)

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/economicEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/economicEngine.ts client/src/lib/economicEngine.test.ts
git commit -m "feat(economic): implement sectoral GDP engine with 5 sectors and unemployment"
```

---

## Chunk 2: Fiscal Pipeline & Crisis System

### Task 4: Revenue & Expenditure Processing

**Files:**
- Modify: `client/src/lib/economicEngine.ts`
- Modify: `client/src/lib/economicEngine.test.ts`

- [ ] **Step 1: Write tests for fiscal pipeline**

```typescript
describe("fiscal pipeline", () => {
  describe("calculateRevenue", () => {
    it("should calculate oil revenue from oil sector GDP", () => {
      const state = defaultEconomicState();
      const revenue = calculateRevenue(state);
      expect(revenue.oil).toBeGreaterThan(0);
      // Oil revenue = oil GDP × 0.15 - subsidy cost
      const oilGdp = state.sectors.find((s) => s.id === "oil")!.gdpValue;
      expect(revenue.oil).toBeLessThanOrEqual(oilGdp * 0.15);
    });

    it("should calculate tax revenue from non-oil GDP", () => {
      const state = defaultEconomicState();
      const revenue = calculateRevenue(state);
      expect(revenue.tax).toBeGreaterThan(0);
    });

    it("total revenue should be sum of all streams", () => {
      const state = defaultEconomicState();
      const revenue = calculateRevenue(state);
      expect(revenue.total).toBeCloseTo(
        revenue.oil + revenue.tax + revenue.igr + revenue.trade + revenue.borrowing
      );
    });
  });

  describe("updateTreasury", () => {
    it("should decrease treasury when expenditure exceeds revenue", () => {
      const state = defaultEconomicState();
      state.treasuryLiquidity = 100;
      state.expenditure.total = 200;
      state.revenue.total = 150;
      const result = updateTreasury(state);
      expect(result.treasuryLiquidity).toBeLessThan(100);
    });

    it("should trigger auto-borrowing when treasury hits zero", () => {
      const state = defaultEconomicState();
      state.treasuryLiquidity = 5;
      state.expenditure.total = 100;
      state.revenue.total = 10;
      const result = updateTreasury(state);
      // Auto-borrowing prevents negative treasury
      expect(result.treasuryLiquidity).toBeGreaterThanOrEqual(0);
      expect(result.revenue.borrowing).toBeGreaterThan(0);
    });
  });

  describe("treasuryMonthsOfCover", () => {
    it("should calculate months of spending coverage", () => {
      const months = calculateMonthsOfCover(300, 100);
      expect(months).toBe(3);
    });
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add to `economicEngine.ts`:
- `calculateRevenue(state)` — calculates all 5 revenue streams per spec Section 3.1:
  - Oil: oilGDP × 0.15 - subsidyCost
  - Tax: nonOilGDP × taxRate × 0.6 (collection efficiency)
  - IGR: 2.0 × (1 + gdpGrowthRate)
  - Trade: (mfgGDP + servicesGDP) × 0.08 × tariffMultiplier
  - Borrowing: 0 unless deficit or player-initiated
- `calculateExpenditure(state, budgetAllocation)` — splits spending across recurrent, capital, debt servicing, transfers
- `updateTreasury(state)` — `liquidity += revenue - expenditure`. Auto-borrow at punitive rates if zero.
- `calculateMonthsOfCover(liquidity, monthlyObligations)` — `liquidity / (expenditure.total / 12)`
- `updateReserves(state)` — `reserves += oilExportInflow - importOutflow - cbnIntervention`
- `updateSubsidyPressure(fuelSubsidyLevel, oilPrice)` — derives 0-100 pressure value

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/economicEngine.ts client/src/lib/economicEngine.test.ts
git commit -m "feat(economic): implement revenue, expenditure, treasury, and reserves"
```

---

### Task 5: Crisis Thresholds & Cascade Engine

**Files:**
- Modify: `client/src/lib/economicEngine.ts`
- Modify: `client/src/lib/economicEngine.test.ts`

- [ ] **Step 1: Write tests for crisis system**

```typescript
describe("crisis system", () => {
  describe("evaluateCrisisIndicators", () => {
    it("should return green for healthy metrics", () => {
      const indicators = evaluateCrisisIndicators({
        inflation: 10, unemploymentRate: 20, fxRate: 1200,
        fxRateBaseline: 1000, debtToGdp: 30,
        treasuryMonthsOfCover: 5, oilOutput: 2.5,
      });
      expect(indicators.inflationZone).toBe("green");
      expect(indicators.unemploymentZone).toBe("green");
    });

    it("should return yellow for moderate stress", () => {
      const indicators = evaluateCrisisIndicators({
        inflation: 25, unemploymentRate: 30, fxRate: 1400,
        fxRateBaseline: 1000, debtToGdp: 50,
        treasuryMonthsOfCover: 2, oilOutput: 1.5,
      });
      expect(indicators.inflationZone).toBe("yellow");
      expect(indicators.debtZone).toBe("yellow");
    });

    it("should return red for crisis conditions", () => {
      const indicators = evaluateCrisisIndicators({
        inflation: 35, unemploymentRate: 40, fxRate: 1600,
        fxRateBaseline: 1000, debtToGdp: 65,
        treasuryMonthsOfCover: 0.5, oilOutput: 1.0,
      });
      expect(indicators.inflationZone).toBe("red");
      expect(indicators.unemploymentZone).toBe("red");
    });
  });

  describe("cascade propagation", () => {
    it("should create cascade when metric enters red", () => {
      const cascades = detectNewCascades({
        inflationZone: "red", unemploymentZone: "green",
        fxZone: "green", debtZone: "green",
        treasuryZone: "green", oilOutputZone: "green",
      }, []);
      expect(cascades.length).toBe(1);
      expect(cascades[0].type).toBe("inflation-fx-spiral");
    });

    it("should escalate severity each turn", () => {
      const cascade = {
        id: "c1", type: "inflation-fx-spiral" as const,
        triggerMetric: "inflation", affectedMetrics: ["fxRate"],
        turnsActive: 3, severity: 3, resolved: false,
      };
      const advanced = advanceCascade(cascade);
      expect(advanced.turnsActive).toBe(4);
      expect(advanced.severity).toBe(4);
    });

    it("should resolve cascade when trigger returns to yellow", () => {
      const cascade = {
        id: "c1", type: "inflation-fx-spiral" as const,
        triggerMetric: "inflation", affectedMetrics: ["fxRate"],
        turnsActive: 5, severity: 5, resolved: false,
      };
      const resolved = checkCascadeResolution(cascade, { inflationZone: "yellow" } as any);
      expect(resolved.resolved).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add to `economicEngine.ts`:
- `evaluateCrisisIndicators(metrics)` — checks 6 metrics against thresholds from spec Section 4.1. FX depreciation = `(current - baseline) / baseline × 100`.
- `detectNewCascades(indicators, existingCascades)` — when a metric enters red, creates the matching cascade from the 5 types in spec Section 4.2
- `advanceCascade(cascade)` — increments turnsActive and severity
- `propagateCascade(state, cascade)` — applies cascade effects to affected metrics (e.g., inflation-fx-spiral worsens both inflation and fxRate)
- `checkCascadeResolution(cascade, indicators)` — resolves if trigger metric returns to yellow
- `processCascades(state)` — advances all active cascades, detects new ones, resolves completed ones

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/economicEngine.ts client/src/lib/economicEngine.test.ts
git commit -m "feat(economic): implement crisis thresholds and cascade propagation"
```

---

### Task 6: Main Economic Turn Processing

**Files:**
- Modify: `client/src/lib/economicEngine.ts`
- Modify: `client/src/lib/economicEngine.test.ts`

- [ ] **Step 1: Write tests for full turn processing**

```typescript
describe("processEconomicTurn", () => {
  it("should update all economic state components", () => {
    const state = defaultEconomicState();
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 10 } as any);
    expect(result.gdp).toBeGreaterThan(0);
    expect(result.unemploymentRate).toBeGreaterThanOrEqual(5);
    expect(result.revenue.total).toBeGreaterThan(0);
    expect(result.history.length).toBe(1);
  });

  it("should cap history at 12 snapshots", () => {
    let state = defaultEconomicState();
    state.history = Array.from({ length: 12 }, (_, i) => ({
      day: i, gdp: 100, sectorGdpValues: {} as any,
      unemploymentRate: 25, inflation: 15, fxRate: 1200,
      treasuryLiquidity: 100, debtToGdp: 30, oilOutput: 2,
    }));
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 13 } as any);
    expect(result.history.length).toBe(12);
  });

  it("should decrement policy modifier durations", () => {
    const state = defaultEconomicState();
    state.sectors[0].policyModifiers = [
      { source: "test", effect: 1, duration: 2 },
      { source: "expiring", effect: 1, duration: 1 },
    ];
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 10 } as any);
    // Duration-1 modifier should be removed
    expect(result.sectors[0].policyModifiers.length).toBe(1);
    expect(result.sectors[0].policyModifiers[0].duration).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add `processEconomicTurn(economicState, context)` — the master per-turn function:
1. Apply policy lever effects → PolicyModifiers on sectors
2. Advance sectors (growth calculation)
3. Calculate total GDP and growth rate
4. Calculate unemployment
5. Calculate revenue streams
6. Process expenditure against treasury
7. Update reserves, subsidy pressure
8. Evaluate crisis indicators
9. Process cascades (detect, advance, resolve)
10. Record history snapshot (cap at 12)
11. Return updated EconomicState

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/economicEngine.ts client/src/lib/economicEngine.test.ts
git commit -m "feat(economic): implement full economic turn processing"
```

---

## Chunk 3: Integration & UI

### Task 7: Integrate into Game Turn Processing

**Files:**
- Modify: `client/src/lib/gameEngine.ts`
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Initialize economic state in GameContext**

```typescript
import { defaultEconomicState } from "./economicEngine";
// In initializeGameState: economy: defaultEconomicState(),
```

- [ ] **Step 2: Replace macro processing in gameEngine.ts**

In `processTurn()`: remove existing macro-economic update logic (search for `macroEconomy` mutations). Replace with:
```typescript
import { processEconomicTurn } from "./economicEngine";
state = { ...state, economy: processEconomicTurn(state.economy, { policyLevers: state.policyLevers, currentDay: state.day }) };
```

- [ ] **Step 3: Update all remaining macroEconomy references**

Ensure `computeElectionScore`, `economyPromiseProgress`, `economyPressureScore`, `driftMetrics`, and any other functions referencing `state.macroEconomy` now reference `state.economy`.

- [ ] **Step 4: Run all tests**

Run: `cd client && npx vitest run`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/gameEngine.ts client/src/lib/GameContext.tsx
git commit -m "feat(economic): integrate economic engine into turn processing, replace macro system"
```

---

### Task 8: Rewrite EconomyTab

**Files:**
- Modify: `client/src/components/EconomyTab.tsx`

- [ ] **Step 1: Read current EconomyTab.tsx**

Read to understand current 6-metric display and styling.

- [ ] **Step 2: Expand EconomyTab**

Rewrite to show:
1. **GDP Overview** — total GDP number, growth rate indicator, sectoral breakdown chart (5 sectors as stacked bar or pie)
2. **Fiscal Balance** — revenue vs expenditure comparison: 5 revenue streams on left, 4 expenditure categories on right, treasury liquidity meter with months-of-cover
3. **Employment** — unemployment rate with trend, sector employment contribution chart
4. **Crisis Dashboard** — 6 indicators (inflation, unemployment, FX, debt, treasury, oil output) each with green/yellow/red indicator, current value, and threshold markers
5. **Active Cascades** — if any, show cascade type, turns active, severity, affected metrics
6. **Trend Charts** — sparklines for key metrics from history array (last 12 turns)

Follow presidential theme (deep green, gold). Use Recharts for visualizations.

- [ ] **Step 3: Run build and tests**

Run: `cd client && npx vite build && npx vitest run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add client/src/components/EconomyTab.tsx
git commit -m "feat(economic): rewrite EconomyTab with sectoral GDP, fiscal pipeline, and crisis dashboard"
```

---

### Task 9: Final Migration Cleanup

**Files:**
- Various files with stale macro references

- [ ] **Step 1: Search for any remaining MacroEconomicState or macroEconomy references**

Run grep across the codebase for: `MacroEconomicState`, `macroEconomy`, `macroHistory`, `MacroHistoryPoint`, `MacroKey`

- [ ] **Step 2: Fix any remaining references**

Update to use `EconomicState` / `state.economy` / `state.economy.history`.

- [ ] **Step 3: Run full test suite, type check, and build**

Run: `cd client && npx vitest run && npx tsc --noEmit && npx vite build`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(economic): complete economic crisis system and migration cleanup"
```
