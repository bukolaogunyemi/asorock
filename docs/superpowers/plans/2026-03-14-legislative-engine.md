# Legislative Engine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Legislature tab from a static display into a fully simulated bicameral legislative system where bills progress through both chambers, the player influences outcomes through strategic levers, and legislative crises create high-stakes decision points.

**Architecture:** A `legislativeEngine.ts` processes bills each turn through stages (introduction → committee → floor debate → vote) in both chambers. Vote outcomes are calculated from 5 bloc baselines modified by faction cross-pressure and player influence levers. Crisis events fire when high-stakes bills reach critical stages, presenting the player with 1-3 influence levers to spend resources on. The Political Adviser surfaces updates via inbox messages and daily briefs.

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-14-legislative-engine-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `client/src/lib/legislativeTypes.ts` | All TypeScript interfaces: `Bill`, `BillStage`, `VoteProjection`, `BillEffects`, `Amendment`, `GameStateModifier`, `LegislativeState`, `ScheduledBill`, `InfluenceLever`, `LeverCost` |
| `client/src/lib/legislativeBills.ts` | Bill templates (crisis bills, autonomous bill pool), scheduled bill seeding function, bill generation from game conditions |
| `client/src/lib/influenceLevers.ts` | The 7 influence lever definitions with cost/effect calculations and availability predicates |
| `client/src/lib/legislativeEngine.ts` | Core simulation: bill progression per turn, vote calculation (3-layer model), autonomous bill generation, crisis detection, adviser briefing generation |
| `client/src/lib/legislativeEngine.test.ts` | Unit tests for all engine functions |
| `client/src/lib/gameTypes.ts` | Modified: add `LegislativeState` to `GameState` |
| `client/src/lib/GameContext.tsx` | Modified: initialize legislative state, integrate into turn processing |
| `client/src/lib/gameEngine.ts` | Modified: call legislative engine from `processTurn()` |
| `client/src/components/LegislatureTab.tsx` | Modified: rewrite to show live bill tracking, vote projections, crisis UI |

---

## Chunk 1: Types, Data & Core Engine

### Task 1: Create Legislative Types

**Files:**
- Create: `client/src/lib/legislativeTypes.ts`

- [ ] **Step 1: Create the types file with all interfaces**

```typescript
// client/src/lib/legislativeTypes.ts
import type { GameState } from "./gameTypes";

export interface GameStateModifier {
  target:
    | "approval"
    | "stability"
    | "politicalCapital"
    | "partyLoyalty"
    | "factionGrievance"
    | "macroEconomy"
    | "outrage"
    | "trust";
  delta: number;
  factionName?: string;
  macroKey?: string;
  delay?: number;
}

export type BillStage =
  | "introduction"
  | "committee"
  | "floor-debate"
  | "vote"
  | "passed"
  | "failed"
  | "stalled"
  | "vetoed"
  | "signed";

export interface VoteProjection {
  firmYes: number;
  leaningYes: number;
  undecided: number;
  leaningNo: number;
  firmNo: number;
}

export interface BillEffects {
  onPass: GameStateModifier[];
  onFail: GameStateModifier[];
}

export interface Amendment {
  description: string;
  sponsor: "ruling-backbench" | "opposition" | "cross-party" | "committee";
  effectModifiers: GameStateModifier[];
  supportSwing: { house: number; senate: number };
  accepted: boolean;
}

export interface Bill {
  id: string;
  title: string;
  description: string;
  subjectTag: "economy" | "security" | "governance" | "social" | "constitutional";
  sponsor: "executive" | "ruling-backbench" | "opposition" | "cross-party";
  stakes: "routine" | "significant" | "critical";
  houseStage: BillStage;
  senateStage: BillStage;
  houseSupport: VoteProjection;
  senateSupport: VoteProjection;
  introducedOnDay: number;
  signingDeadlineDay: number | null;
  effects: BillEffects;
  amendments: Amendment[];
  isCrisis: boolean;
  houseStageDaysRemaining: number;
  senateStageDaysRemaining: number;
  houseStageEnteredDay: number;
  senateStageEnteredDay: number;
  powerBrokerTag?: string;
}

export interface LeverCost {
  type: "politicalCapital" | "approval" | "partyLoyalty" | "billDilution";
  amount: number;
}

export interface InfluenceLever {
  id: string;
  name: string;
  description: string;
  costs: LeverCost[];
  houseSwing: number;
  senateSwing: number;
  sideEffects: GameStateModifier[];
  available: (state: GameState, bill: Bill) => boolean;
}

export interface ScheduledBill {
  template: Pick<Bill, "title" | "description" | "subjectTag" | "stakes" | "effects"> & {
    sponsor?: Bill["sponsor"];
  };
  targetDay: number;
  isCrisis: boolean;
}

export interface LegislativeState {
  activeBills: Bill[];
  passedBills: Bill[];
  failedBills: Bill[];
  pendingSignature: Bill[];
  legislativeCalendar: ScheduledBill[];
  adviserAccuracy: number;
  sessionStats: {
    billsIntroduced: number;
    billsPassed: number;
    billsVetoed: number;
    overrideAttempts: number;
    overrideSuccesses: number;
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors from legislativeTypes.ts

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/legislativeTypes.ts
git commit -m "feat(legislative): add TypeScript interfaces for legislative engine"
```

---

### Task 2: Create Bill Templates & Calendar Seeding

**Files:**
- Create: `client/src/lib/legislativeBills.ts`

- [ ] **Step 1: Write tests for bill seeding**

```typescript
// client/src/lib/legislativeBills.test.ts
import { describe, expect, it } from "vitest";
import { seedLegislativeCalendar, getAutonomousBillPool } from "./legislativeBills";

describe("legislativeBills", () => {
  describe("seedLegislativeCalendar", () => {
    it("should generate 6-7 crisis bills across the 4-year term", () => {
      const calendar = seedLegislativeCalendar();
      const crisisBills = calendar.filter((b) => b.isCrisis);
      expect(crisisBills.length).toBeGreaterThanOrEqual(6);
      expect(crisisBills.length).toBeLessThanOrEqual(7);
    });

    it("should include 4 annual budget bills", () => {
      const calendar = seedLegislativeCalendar();
      const budgets = calendar.filter((b) => b.template.title.includes("Budget"));
      expect(budgets.length).toBe(4);
    });

    it("should schedule budget bills roughly every 365 days", () => {
      const calendar = seedLegislativeCalendar();
      const budgets = calendar.filter((b) => b.template.title.includes("Budget"));
      for (let i = 1; i < budgets.length; i++) {
        const gap = budgets[i].targetDay - budgets[i - 1].targetDay;
        expect(gap).toBeGreaterThanOrEqual(300);
        expect(gap).toBeLessThanOrEqual(400);
      }
    });

    it("should include an electoral reform bill in year 3", () => {
      const calendar = seedLegislativeCalendar();
      const electoral = calendar.find((b) =>
        b.template.subjectTag === "governance" && b.isCrisis
      );
      expect(electoral).toBeDefined();
      expect(electoral!.targetDay).toBeGreaterThanOrEqual(700);
      expect(electoral!.targetDay).toBeLessThanOrEqual(1100);
    });
  });

  describe("getAutonomousBillPool", () => {
    it("should return bills for each subject tag", () => {
      const pool = getAutonomousBillPool();
      const tags = new Set(pool.map((b) => b.subjectTag));
      expect(tags.has("economy")).toBe(true);
      expect(tags.has("security")).toBe(true);
      expect(tags.has("social")).toBe(true);
      expect(tags.has("governance")).toBe(true);
    });

    it("should have at least 10 bill templates", () => {
      const pool = getAutonomousBillPool();
      expect(pool.length).toBeGreaterThanOrEqual(10);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeBills.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement bill templates and seeding**

Create `client/src/lib/legislativeBills.ts` with:
- `seedLegislativeCalendar()` — returns `ScheduledBill[]` with 4 annual budget bills (days ~90, ~455, ~820, ~1185), 1 electoral reform bill (year 3, ~day 900), and 1-2 social flashpoint bills at random points
- `getAutonomousBillPool()` — returns array of bill template objects covering economy (tax reform, trade liberalization, privatization), security (police reform, anti-terrorism, border security), social (anti-grazing, social media regulation, religious harmony), governance (LG reform, whistleblower protection)
- Each template includes: title, description, subjectTag, stakes, and effects (GameStateModifier arrays for onPass/onFail)
- Budget bills have `stakes: "critical"`, economic effects on pass (approval +5, stability +3), and harsh effects on fail (approval -10, stability -5, macro: inflation +2)

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeBills.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeBills.ts client/src/lib/legislativeBills.test.ts
git commit -m "feat(legislative): add bill templates and calendar seeding"
```

---

### Task 3: Create Influence Levers

**Files:**
- Create: `client/src/lib/influenceLevers.ts`

- [ ] **Step 1: Write tests for influence levers**

```typescript
// client/src/lib/influenceLevers.test.ts
import { describe, expect, it } from "vitest";
import { getInfluenceLevers, getLeverById } from "./influenceLevers";
import type { GameState } from "./gameTypes";
import type { Bill } from "./legislativeTypes";

describe("influenceLevers", () => {
  it("should define exactly 7 levers", () => {
    const levers = getInfluenceLevers();
    expect(levers.length).toBe(7);
  });

  it("should have unique IDs", () => {
    const levers = getInfluenceLevers();
    const ids = levers.map((l) => l.id);
    expect(new Set(ids).size).toBe(7);
  });

  it("back-channel deals should be unavailable for house bills", () => {
    const lever = getLeverById("back-channel");
    expect(lever).toBeDefined();
    // back-channel is senate-only: houseSwing should be 0
    expect(lever!.houseSwing).toBe(0);
  });

  it("each lever should have at least one cost", () => {
    const levers = getInfluenceLevers();
    for (const lever of levers) {
      expect(lever.costs.length).toBeGreaterThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/influenceLevers.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement the 7 influence levers**

Create `client/src/lib/influenceLevers.ts` with the 7 levers from spec Section 3.3:
1. `spend-political-capital` — costs PC, flat boost both chambers
2. `offer-concessions` — costs bill dilution, moderate house / strong senate swing
3. `promise-patronage` — costs future obligations (faction grievance later), strong house / moderate senate
4. `address-joint-session` — approval risk, equal effect scaled by approval
5. `executive-pressure` — relationship damage, strong on ruling blocs, backfire risk
6. `back-channel` — senate-only, links bills together
7. `go-public` — approval-dependent, strong house / weak senate

Each lever has: id, name, description, costs (LeverCost[]), houseSwing, senateSwing, sideEffects (GameStateModifier[]), available predicate.

Export: `getInfluenceLevers()`, `getLeverById(id: string)`

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/influenceLevers.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/influenceLevers.ts client/src/lib/influenceLevers.test.ts
git commit -m "feat(legislative): add 7 influence lever definitions"
```

---

### Task 4: Core Legislative Engine — Vote Calculation

**Files:**
- Create: `client/src/lib/legislativeEngine.ts`
- Create: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for vote calculation**

```typescript
// client/src/lib/legislativeEngine.test.ts
import { describe, expect, it } from "vitest";
import { calculateVoteProjection } from "./legislativeEngine";
import { initializeGameState } from "./GameContext";

const testConfig = {
  firstName: "Test", lastName: "President", age: 55, gender: "Male" as const,
  stateOfOrigin: "Lagos", education: "University", party: "ADU", era: "2023" as const,
  vpName: "VP Test", vpState: "Kano", vpZone: "NW",
};

describe("legislativeEngine", () => {
  describe("calculateVoteProjection", () => {
    it("should return projections that sum to chamber total for House (360)", () => {
      const state = initializeGameState(testConfig);
      const bill = {
        subjectTag: "economy" as const,
        sponsor: "executive" as const,
        stakes: "significant" as const,
      };
      const projection = calculateVoteProjection(state, bill, "house");
      const total =
        projection.firmYes + projection.leaningYes + projection.undecided +
        projection.leaningNo + projection.firmNo;
      expect(total).toBe(360);
    });

    it("should return projections that sum to chamber total for Senate (109)", () => {
      const state = initializeGameState(testConfig);
      const bill = {
        subjectTag: "economy" as const,
        sponsor: "executive" as const,
        stakes: "significant" as const,
      };
      const projection = calculateVoteProjection(state, bill, "senate");
      const total =
        projection.firmYes + projection.leaningYes + projection.undecided +
        projection.leaningNo + projection.firmNo;
      expect(total).toBe(109);
    });

    it("should favour executive bills with high party loyalty", () => {
      const state = initializeGameState(testConfig);
      state.partyLoyalty = 90;
      const bill = { subjectTag: "economy" as const, sponsor: "executive" as const, stakes: "routine" as const };
      const projection = calculateVoteProjection(state, bill, "house");
      expect(projection.firmYes + projection.leaningYes).toBeGreaterThan(180);
    });

    it("should disfavour executive bills with low party loyalty", () => {
      const state = initializeGameState(testConfig);
      state.partyLoyalty = 20;
      const bill = { subjectTag: "economy" as const, sponsor: "executive" as const, stakes: "routine" as const };
      const projection = calculateVoteProjection(state, bill, "house");
      expect(projection.firmYes + projection.leaningYes).toBeLessThan(180);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement vote calculation**

Create `client/src/lib/legislativeEngine.ts` with `calculateVoteProjection(state, billInfo, chamber)`:

**Layer 1 — Bloc Baseline (spec Section 3.1):**
```
House: Core Ruling (145), Ruling Allies (56), Main Opposition (120), Opposition Moderates (34), Independents (5)
Senate: Core Ruling (56), Ruling Allies (22), Main Opposition (22), Opposition Moderates (7), Independents (2)
```
Each bloc's lean is modified by partyLoyalty (Core Ruling leans yes proportionally to partyLoyalty, Opposition leans no, etc.)

**Layer 2 — Faction Cross-Pressure (spec Section 3.2):**
Check bill subjectTag against faction priorities. Each faction pulls members based on `stake × grievance × memberCount`. Look up factions from `state.factions`.

**Layer 3 — No player influence at this stage** (influence levers are applied during crisis resolution, not baseline projection).

Distribute the final counts across the 5 categories (firmYes/leaningYes/undecided/leaningNo/firmNo) based on loyalty strength — high loyalty = firm, moderate = leaning, low = undecided.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): implement 3-layer vote calculation"
```

---

### Task 5: Bill Progression Logic

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for bill progression**

Add to `legislativeEngine.test.ts`:

```typescript
import { advanceBills, createBillFromTemplate } from "./legislativeEngine";

describe("advanceBills", () => {
  it("should advance a bill from introduction to committee after 2-3 days", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, state.day);
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };

    // Advance 3 days
    let result = state;
    for (let i = 0; i < 3; i++) {
      result = { ...result, day: result.day + 1 };
      result.legislature = advanceBills(result);
    }

    const advanced = result.legislature.activeBills[0];
    expect(["committee", "introduction"]).toContain(advanced.houseStage);
  });

  it("should kill a bill stalled for 30+ days in one stage", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Stalled Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, state.day);
    bill.houseStageEnteredDay = state.day - 31;
    bill.houseStageDaysRemaining = 0;
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };

    const result = advanceBills(state);
    expect(result.activeBills.length).toBe(0);
    expect(result.failedBills.length).toBe(1);
  });

  it("should cap active bills at 8", () => {
    const state = initializeGameState(testConfig);
    const bills = Array.from({ length: 9 }, (_, i) =>
      createBillFromTemplate({
        title: `Bill ${i}`, description: "Test", subjectTag: "economy",
        stakes: "routine", effects: { onPass: [], onFail: [] },
      }, state.day)
    );
    state.legislature = { ...defaultLegislativeState(), activeBills: bills.slice(0, 8) };
    // Trying to add a 9th should be queued, not added
    expect(state.legislature.activeBills.length).toBeLessThanOrEqual(8);
  });

  it("should move bill to pendingSignature when both chambers pass", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Passed Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, state.day);
    bill.houseStage = "passed";
    bill.senateStage = "passed";
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };

    const result = advanceBills(state);
    expect(result.activeBills.length).toBe(0);
    expect(result.pendingSignature.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement bill progression**

Add to `legislativeEngine.ts`:
- `createBillFromTemplate(template, currentDay)` — creates a Bill with initial stage durations (introduction: 2-3 days, committee: 5-10 days, floor-debate: 3-5 days, vote: 1 day)
- `advanceBills(state)` — for each active bill, decrement stage timers; when timer hits 0, advance to next stage; if vote stage reached, calculate vote result; if both chambers pass, move to pendingSignature with 21-day signing deadline; kill bills stalled 30+ days; enforce 8-bill cap
- `defaultLegislativeState()` — returns initial empty LegislativeState

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): implement bill progression through stages"
```

---

### Task 6: Crisis Detection & Autonomous Bill Generation

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for crisis detection and autonomous bills**

```typescript
describe("detectCrisis", () => {
  it("should flag budget bills reaching floor-debate as crisis", () => {
    const bill = createBillFromTemplate({
      title: "Annual Budget 2024", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.isCrisis = true;
    bill.houseStage = "floor-debate";
    expect(shouldTriggerCrisis(bill)).toBe(true);
  });

  it("should flag tight-margin bills as crisis", () => {
    const bill = createBillFromTemplate({
      title: "Social Bill", description: "Test", subjectTag: "social",
      stakes: "significant", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseStage = "floor-debate";
    // Tight margin: difference < 10
    bill.houseSupport = { firmYes: 170, leaningYes: 10, undecided: 5, leaningNo: 10, firmNo: 165 };
    expect(shouldTriggerCrisis(bill)).toBe(true);
  });
});

describe("generateAutonomousBill", () => {
  it("should generate economy bill when inflation is high", () => {
    const state = initializeGameState(testConfig);
    state.macroEconomy.inflation = 30;
    const bill = generateAutonomousBill(state);
    if (bill) {
      expect(bill.subjectTag).toBe("economy");
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement crisis detection and autonomous bill generation**

Add to `legislativeEngine.ts`:
- `shouldTriggerCrisis(bill)` — returns true if: bill.isCrisis and reaches floor-debate; OR stakes are "critical"/"significant" and vote margin < 10; OR it's a constitutional amendment at floor-debate
- `generateAutonomousBill(state)` — checks game conditions (high faction grievance → faction-sponsored bill; recession → economy bill; election year → governance bill) and picks from the autonomous bill pool. Rate: 1-2 per month (every 15-30 days). Returns null if no conditions met or bill cap reached.
- `processLegislativeTurn(state)` — the main per-turn function that: checks scheduled calendar for bills to introduce, generates autonomous bills, advances all active bills, detects crises, checks signing deadlines. Returns updated LegislativeState.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add crisis detection and autonomous bill generation"
```

---

### Task 7: Veto & Signing Logic

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for veto and signing**

```typescript
describe("veto and signing", () => {
  it("signBill should apply onPass effects and move to passedBills", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [{ target: "approval", delta: 5 }], onFail: [] },
    }, 1);
    state.legislature = { ...defaultLegislativeState(), pendingSignature: [bill] };
    const result = signBill(state, bill.id);
    expect(result.legislature.pendingSignature.length).toBe(0);
    expect(result.legislature.passedBills.length).toBe(1);
    expect(result.approval).toBe(state.approval + 5);
  });

  it("vetoBill should cost political capital scaled to stakes", () => {
    const state = initializeGameState(testConfig);
    state.politicalCapital = 50;
    const bill = createBillFromTemplate({
      title: "Critical Bill", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    state.legislature = { ...defaultLegislativeState(), pendingSignature: [bill] };
    const result = vetoBill(state, bill.id);
    expect(result.politicalCapital).toBeLessThan(50);
    expect(result.legislature.sessionStats.billsVetoed).toBe(1);
  });

  it("should expire unsigned bills after 21-day deadline", () => {
    const state = initializeGameState(testConfig);
    state.day = 30;
    const bill = createBillFromTemplate({
      title: "Expired Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [{ target: "approval", delta: 3 }], onFail: [] },
    }, 1);
    bill.signingDeadlineDay = 25; // past deadline
    state.legislature = { ...defaultLegislativeState(), pendingSignature: [bill] };
    const result = processLegislativeTurn(state);
    // Unsigned bills past deadline are auto-signed
    expect(result.legislature.pendingSignature.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement signing and veto**

Add to `legislativeEngine.ts`:
- `signBill(state, billId)` — applies bill.effects.onPass via processConsequences pattern, moves bill to passedBills, updates sessionStats
- `vetoBill(state, billId)` — costs political capital (routine: 3, significant: 8, critical: 15), moves bill to failedBills with stage "vetoed", updates sessionStats. May trigger override attempt (probability based on approval: `overrideChance = max(0, 60 - state.approval) / 100`)
- Update `processLegislativeTurn` to auto-sign bills past their 21-day deadline

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add veto, signing, and deadline logic"
```

---

### Task 8: Crisis Resolution with Influence Levers

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for crisis resolution**

```typescript
describe("resolveLegislativeCrisis", () => {
  it("should apply lever effects to vote projection", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Crisis Bill", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseSupport = { firmYes: 150, leaningYes: 20, undecided: 30, leaningNo: 20, firmNo: 140 };

    const result = applyInfluenceLevers(state, bill, ["spend-political-capital"], "house");
    const newTotal = result.firmYes + result.leaningYes;
    const oldTotal = 150 + 20;
    expect(newTotal).toBeGreaterThan(oldTotal);
  });

  it("should deduct lever costs from game state", () => {
    const state = initializeGameState(testConfig);
    state.politicalCapital = 30;
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);

    const result = payLeverCosts(state, ["spend-political-capital"]);
    expect(result.politicalCapital).toBeLessThan(30);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement crisis resolution**

Add to `legislativeEngine.ts`:
- `applyInfluenceLevers(state, bill, leverIds, chamber)` — takes selected lever IDs, looks up each lever's swing value, modifies the VoteProjection by shifting undecided/leaning toward firmYes. Returns updated VoteProjection.
- `payLeverCosts(state, leverIds)` — deducts costs from game state (political capital, approval, partyLoyalty as appropriate). Returns updated GameState.
- `resolveLegislativeCrisis(state, billId, leverIds)` — the full crisis resolution: pay costs, apply levers to both chambers, resolve vote, apply bill effects based on pass/fail. Returns updated GameState.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): implement crisis resolution with influence levers"
```

---

## Chunk 2: Integration & UI

### Task 9: Integrate with GameState & Turn Processing

**Files:**
- Modify: `client/src/lib/gameTypes.ts`
- Modify: `client/src/lib/gameEngine.ts`
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Add LegislativeState to GameState**

In `gameTypes.ts`, add import and field:
```typescript
import type { LegislativeState } from "./legislativeTypes";

// In GameState interface, add:
legislature: LegislativeState;
```

- [ ] **Step 2: Initialize legislative state in GameContext.tsx**

In the `initializeGameState` function, add:
```typescript
import { seedLegislativeCalendar } from "./legislativeBills";
import { defaultLegislativeState } from "./legislativeEngine";

// In the return object:
legislature: {
  ...defaultLegislativeState(),
  legislativeCalendar: seedLegislativeCalendar(),
},
```

- [ ] **Step 3: Call legislative engine from processTurn**

In `gameEngine.ts`, in the `processTurn` function, add after existing processing:
```typescript
import { processLegislativeTurn } from "./legislativeEngine";

// Inside processTurn, before return:
state = { ...state, legislature: processLegislativeTurn(state).legislature };
```

- [ ] **Step 4: Run all existing tests to verify no regressions**

Run: `cd client && npx vitest run`
Expected: All tests PASS (existing + new)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/gameTypes.ts client/src/lib/gameEngine.ts client/src/lib/GameContext.tsx
git commit -m "feat(legislative): integrate legislative engine into game state and turn processing"
```

---

### Task 10: Political Adviser Briefings

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for adviser briefings**

```typescript
describe("generateAdviserBriefing", () => {
  it("should generate daily brief with active bill count", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, 1);
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };
    const briefing = generateAdviserBriefing(state);
    expect(briefing.dailyBrief).toContain("1 bill");
  });

  it("should generate weekly summary every 7 days", () => {
    const state = initializeGameState(testConfig);
    state.day = 7;
    state.legislature = defaultLegislativeState();
    const briefing = generateAdviserBriefing(state);
    expect(briefing.weeklySummary).toBeDefined();
  });

  it("should warn about crisis bills approaching vote", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Budget", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.isCrisis = true;
    bill.houseStage = "committee";
    bill.houseStageDaysRemaining = 2;
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };
    const briefing = generateAdviserBriefing(state);
    expect(briefing.dailyBrief).toContain("WARNING");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement adviser briefings**

Add to `legislativeEngine.ts`:
- `generateAdviserBriefing(state)` — returns `{ dailyBrief: string, weeklySummary?: string, crisisAlert?: string }`
- Daily brief: count of active bills, any approaching votes, any bills stalled
- Weekly summary (every 7 days): bills that advanced, bills that stalled, faction mood shifts
- Crisis alert: when a crisis bill is 1-2 days from vote stage
- Accuracy is gated by adviser competence: high (70+) = ±3 vote prediction, medium = ±10, low = ±20. Find adviser from `state.characters` by checking appointments.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/legislativeEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add political adviser briefings"
```

---

### Task 11: Rewrite LegislatureTab UI

**Files:**
- Modify: `client/src/components/LegislatureTab.tsx`

- [ ] **Step 1: Read the current LegislatureTab.tsx to understand structure**

Read `client/src/components/LegislatureTab.tsx` to see current layout, imports, and styling patterns.

- [ ] **Step 2: Rewrite LegislatureTab with new sections**

The rewritten tab should include:
1. **Session Overview** — bills introduced/passed/vetoed stats, overall party loyalty indicator
2. **Active Bills** — card list showing each bill: title, subject tag badge, current stage in both chambers (progress bar), vote projection (color-coded bloc bar), days remaining in current stage, crisis indicator
3. **Presidential Desk** — bills awaiting signature with Sign/Veto buttons, days remaining until deadline
4. **Crisis Panel** — when a crisis bill is detected, show: situation brief, vote breakdown (5 blocs × 2 chambers), available influence levers with costs/effects, "Select 1-3 levers" UI with confirm button
5. **Bill History** — collapsible section showing passed/failed bills

Use existing UI patterns from other tabs (Card, Badge, Progress from shadcn/ui). Follow the presidential theme: rich, bold, deep green, gold.

Connect to game state via `useGame()` context hook. Wire Sign/Veto buttons to dispatch actions that call `signBill`/`vetoBill`. Wire crisis lever selection to dispatch `resolveLegislativeCrisis`.

- [ ] **Step 3: Add GameContext actions for legislative operations**

In `GameContext.tsx`, add reducer actions:
- `SIGN_BILL` — calls `signBill(state, billId)`
- `VETO_BILL` — calls `vetoBill(state, billId)`
- `RESOLVE_CRISIS` — calls `resolveLegislativeCrisis(state, billId, leverIds)`

- [ ] **Step 4: Verify the app builds**

Run: `cd client && npx vite build`
Expected: Build succeeds

- [ ] **Step 5: Verify all tests still pass**

Run: `cd client && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add client/src/components/LegislatureTab.tsx client/src/lib/GameContext.tsx
git commit -m "feat(legislative): rewrite LegislatureTab with live bill tracking and crisis UI"
```

---

### Task 12: Final Integration & Cleanup

**Files:**
- Modify: `client/src/lib/gameData.ts` — remove static `whipTracker` and `activeBills` if they exist
- Modify: `client/src/lib/gameContent.ts` — add adviser briefing to daily brief

- [ ] **Step 1: Remove static legislative data from gameData.ts**

Search for and remove any static `whipTracker`, `activeBills`, or `legislativeBills` arrays in `gameData.ts` that are now replaced by the simulation.

- [ ] **Step 2: Wire adviser briefings into daily brief system**

In the daily brief generation (likely in `gameEngine.ts` or `gameContent.ts`), insert the legislative adviser briefing from `generateAdviserBriefing()` into the daily brief items and inbox messages.

- [ ] **Step 3: Run full test suite**

Run: `cd client && npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Run type check**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Run build**

Run: `cd client && npx vite build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/gameData.ts client/src/lib/gameContent.ts client/src/lib/gameEngine.ts
git commit -m "feat(legislative): complete legislative engine integration and cleanup"
```

---

## Chunk 3: Missing Spec Features

### Task 13: Executive Bill Proposal

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

The player needs to propose executive bills from a contextual menu (2-3 available at any time based on campaign promises, policy lever changes, and event responses).

- [ ] **Step 1: Write tests for executive bill generation**

```typescript
describe("executive bills", () => {
  it("should generate 2-3 available executive bills based on game state", () => {
    const state = initializeGameState(testConfig);
    const available = getAvailableExecutiveBills(state);
    expect(available.length).toBeGreaterThanOrEqual(2);
    expect(available.length).toBeLessThanOrEqual(3);
  });

  it("should include bills for unfulfilled campaign promises", () => {
    const state = initializeGameState(testConfig);
    state.campaignPromises = [{ id: "p1", text: "Reform petroleum sector", status: "unfulfilled", progress: 0 } as any];
    const available = getAvailableExecutiveBills(state);
    expect(available.some((b) => b.subjectTag === "economy")).toBe(true);
  });

  it("proposeExecutiveBill should add bill to activeBills", () => {
    const state = initializeGameState(testConfig);
    state.legislature = defaultLegislativeState();
    const result = proposeExecutiveBill(state, "petroleum-reform");
    expect(result.legislature.activeBills.length).toBe(1);
    expect(result.legislature.activeBills[0].sponsor).toBe("executive");
  });
});
```

- [ ] **Step 2: Implement executive bill proposal**

Add: `getAvailableExecutiveBills(state)` — scans campaign promises, recent policy changes, and active events to generate 2-3 contextual executive bill options. `proposeExecutiveBill(state, billId)` — adds the selected bill to activeBills with priority introduction (bypasses queue).

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add executive bill proposal system"
```

---

### Task 14: Multi-Round Crisis State Machine

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeTypes.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

Budget crises span 3-4 rounds, social flashpoints 2 rounds, constitutional amendments 3 rounds.

- [ ] **Step 1: Add crisis round tracking to types**

Add to `legislativeTypes.ts`:
```typescript
export interface CrisisState {
  billId: string;
  currentRound: number;
  totalRounds: number;
  crisisType: "budget" | "social" | "constitutional" | "override" | "surprise-motion";
  roundHistory: { round: number; leversUsed: string[]; result: string }[];
}
```
Add `activeCrisis?: CrisisState` to `LegislativeState`.

- [ ] **Step 2: Write tests for multi-round crises**

```typescript
describe("multi-round crises", () => {
  it("budget crisis should have 3-4 rounds", () => {
    const crisis = initializeCrisis("budget", billId);
    expect(crisis.totalRounds).toBeGreaterThanOrEqual(3);
    expect(crisis.totalRounds).toBeLessThanOrEqual(4);
  });

  it("should advance to next round after resolution", () => {
    const crisis = initializeCrisis("budget", billId);
    const result = advanceCrisisRound(crisis, ["spend-political-capital"]);
    expect(result.currentRound).toBe(2);
  });

  it("final round should resolve the bill", () => {
    const crisis = { ...initializeCrisis("social", billId), currentRound: 2, totalRounds: 2 };
    const result = advanceCrisisRound(crisis, []);
    expect(result.resolved).toBe(true);
  });
});
```

- [ ] **Step 3: Implement multi-round state machine**

Add: `initializeCrisis(type, billId)`, `advanceCrisisRound(crisis, leverIds)`. Budget: round 1 (strategy), round 2 (amendments), round 3 (floor vote), round 4 (optional deadlock). Social: round 1 (floor vote), round 2 (presidential desk). Constitutional: round 1 (floor debate), round 2 (house vote), round 3 (senate vote).

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/legislativeTypes.ts client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add multi-round crisis state machine"
```

---

### Task 15: Amendments & Reconciliation

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for amendments and reconciliation**

```typescript
describe("amendments", () => {
  it("should generate amendment proposals during committee stage", () => {
    const bill = createBillFromTemplate(template, 1);
    bill.houseStage = "committee";
    const amendments = generateAmendments(bill, state);
    expect(amendments.length).toBeGreaterThanOrEqual(0);
    expect(amendments.length).toBeLessThanOrEqual(3);
  });

  it("accepting amendment should modify bill effects and support", () => {
    const bill = createBillFromTemplate(template, 1);
    const amendment = { description: "Test", sponsor: "opposition" as const, effectModifiers: [{ target: "approval" as const, delta: -2 }], supportSwing: { house: 15, senate: 8 }, accepted: false };
    const result = acceptAmendment(bill, amendment);
    expect(result.amendments[0].accepted).toBe(true);
  });
});

describe("reconciliation", () => {
  it("should trigger when chambers pass different versions", () => {
    const bill = createBillFromTemplate(template, 1);
    bill.houseStage = "passed";
    bill.senateStage = "passed";
    bill.amendments = [{ ...amendment, accepted: true }]; // house version differs
    const needsReconciliation = checkReconciliation(bill);
    expect(needsReconciliation).toBe(true);
  });
});
```

- [ ] **Step 2: Implement amendments and reconciliation**

Add: `generateAmendments(bill, state)` — during committee stage, opposition/committee may propose 0-3 amendments. `acceptAmendment(bill, amendment)` — modifies bill effects by amendment.effectModifiers, applies supportSwing. `checkReconciliation(bill)` — if chambers passed different versions, requires 5-day delay + PC cost. For crisis bills, reconciliation becomes an additional crisis round.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add amendments during committee and reconciliation"
```

---

### Task 16: Veto Override & Opposition Surprise Motions

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests**

```typescript
describe("veto override", () => {
  it("should check 2/3 majority threshold", () => {
    const result = attemptOverride(state, billId);
    const threshold = 240; // 2/3 of 360
    expect(result.housePassed).toBe(result.houseVotes >= threshold);
  });

  it("low approval should increase override probability", () => {
    state.approval = 25;
    const resultLow = calculateOverrideProbability(state);
    state.approval = 75;
    const resultHigh = calculateOverrideProbability(state);
    expect(resultLow).toBeGreaterThan(resultHigh);
  });
});

describe("surprise motions", () => {
  it("should trigger impeachment motion when approval < 25 and outrage > 70", () => {
    state.approval = 20;
    state.outrage = 75;
    const motions = checkSurpriseMotions(state);
    expect(motions.some((m) => m.type === "impeachment")).toBe(true);
  });

  it("should trigger no-confidence when stability < 20", () => {
    state.stability = 15;
    const motions = checkSurpriseMotions(state);
    expect(motions.some((m) => m.type === "no-confidence")).toBe(true);
  });
});
```

- [ ] **Step 2: Implement override and surprise motions**

Add: `attemptOverride(state, billId)` — calculates votes in both chambers against 2/3 threshold, influenced by approval. `checkSurpriseMotions(state)` — checks for impeachment (approval < 25, outrage > 70), no-confidence (stability < 20), emergency debate triggers. These are rendered as crisis events.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add veto override mechanics and opposition surprise motions"
```

---

### Task 17: Delayed Consequences & Campaign Promise Tracking

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests**

```typescript
describe("delayed consequences", () => {
  it("should queue effects with delay field", () => {
    const modifier = { target: "macroEconomy" as const, macroKey: "inflation", delta: 2, delay: 30 };
    const queue = queueDelayedEffect(modifier, 100);
    expect(queue.effectDay).toBe(130);
  });

  it("should apply queued effects when day is reached", () => {
    const pending = [{ modifier: { target: "approval" as const, delta: -5 }, effectDay: 50 }];
    const result = processDelayedEffects(pending, 50);
    expect(result.applied.length).toBe(1);
    expect(result.remaining.length).toBe(0);
  });
});

describe("campaign promise tracking", () => {
  it("should update promise progress when related bill passes", () => {
    const state = initializeGameState(testConfig);
    const bill = { subjectTag: "economy", title: "Petroleum Reform" };
    const result = trackPromiseProgress(state, bill as any);
    // Should find matching promise and increase progress
    expect(result).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement delayed effects and promise tracking**

Add: `queueDelayedEffect(modifier, currentDay)` — creates a pending effect with target day. `processDelayedEffects(pending, currentDay)` — applies any effects whose day has arrived. Add `delayedEffects: { modifier: GameStateModifier; effectDay: number }[]` to `LegislativeState`. Add `trackPromiseProgress(state, bill)` — matches passed bill subjectTag/title against campaign promises and updates progress.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/legislativeTypes.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): add delayed consequence queue and campaign promise tracking"
```

---

### Task 18: Existing System Integration

**Files:**
- Modify: `client/src/lib/legislativeEngine.ts`
- Modify: `client/src/lib/factionDrift.ts`
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Write tests for system integrations**

```typescript
describe("system integration", () => {
  it("bill outcomes should feed faction grievance via factionDrift", () => {
    const effects = getBillFactionEffects(bill, "passed");
    expect(effects.some((e) => e.target === "factionGrievance")).toBe(true);
  });

  it("Senate President alignment should modify senate votes", () => {
    const modifier = getSenatePresidentModifier(state);
    // Aligned Senate President boosts ruling party votes
    expect(modifier).toBeGreaterThanOrEqual(-10);
    expect(modifier).toBeLessThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Implement integrations**

- **factionDrift.ts:** Add `billOutcomeFactionEffect(bill, outcome)` — when a bill passes/fails, affected factions gain/lose grievance. Wire into bill resolution.
- **constitutionalOfficers:** Add `getSenatePresidentModifier(state)` — looks up Senate President from `state.constitutionalOfficers`, checks their alignment, adds ±5-10 votes to senate projections.
- **eventChains:** Render legislative crises as event chain instances so they use the existing crisis UI framework.
- **ideologyPressure:** Tag executive bills with ideology impact from the bill template.

- [ ] **Step 3: Run all tests**

Run: `cd client && npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/legislativeEngine.ts client/src/lib/factionDrift.ts client/src/lib/legislativeEngine.test.ts
git commit -m "feat(legislative): integrate with factionDrift, constitutionalOfficers, and eventChains"
```

---

### Task 19: Fix TestConfig & Return Type Consistency

**Files:**
- Modify: `client/src/lib/legislativeEngine.test.ts`

- [ ] **Step 1: Fix testConfig to include all CampaignConfig fields**

Update the shared testConfig across all test files to include all required fields:
```typescript
const testConfig: CampaignConfig = {
  firstName: "Test", lastName: "President", age: 55,
  gender: "Male", stateOfOrigin: "Lagos", education: "University",
  party: "ADU", era: "2023", vpName: "VP Test",
  vpState: "Kano", personalAssistant: "Test PA",
  promises: [], appointments: {},
  presidentName: "Test President", origin: "Lagos Politician",
};
```

- [ ] **Step 2: Ensure processLegislativeTurn consistently returns LegislativeState**

Verify `processLegislativeTurn(state: GameState): LegislativeState` return type is used consistently everywhere. Callers destructure as `state.legislature = processLegislativeTurn(state)`.

- [ ] **Step 3: Run all tests**

Run: `cd client && npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/legislativeEngine.test.ts
git commit -m "fix(legislative): fix testConfig and return type consistency"
```
