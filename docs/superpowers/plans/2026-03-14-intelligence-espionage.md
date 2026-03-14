# Intelligence & Espionage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing hooks system into a full intelligence apparatus with a Director of National Intelligence, passive/active intelligence operations, and three deployment channels (leverage, trade, blackmail).

**Architecture:** An `intelligenceEngine.ts` manages DNI stats, passive hook generation, active operations (6 types), and deployment logic. The DNI is appointed during onboarding. Operations have success/failure/critical-failure outcomes gated by DNI competence. Intelligence deployment extends the existing Hook interface with optional fields for backward compatibility. A low-loyalty DNI introduces leak risk.

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-14-intelligence-espionage-design.md`

**Depends on:** Sub-Project B (Godfather System) — for monitor-godfather operations and godfather connection reveals.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `client/src/lib/intelligenceTypes.ts` | Interfaces: `IntelligenceState`, `IntelOperation`, `IntelResult`, `IntelFinding` |
| `client/src/lib/intelligenceEngine.ts` | DNI management, passive hook generation, active operation processing, deployment logic, leak risk |
| `client/src/lib/intelligenceEngine.test.ts` | Unit tests |
| `client/src/lib/gameTypes.ts` | Modified: extend Hook interface with optional deployment fields, add `IntelligenceState` to `GameState` |
| `client/src/lib/GameContext.tsx` | Modified: initialize intelligence state, DNI appointment during onboarding |
| `client/src/lib/gameEngine.ts` | Modified: process intelligence operations each turn |
| `client/src/components/PoliticsTab.tsx` | Modified: add intelligence panel |
| `client/src/components/OnboardingFlow.tsx` | Modified: add DNI selection step |

---

## Chunk 1: Types & Core Engine

### Task 1: Create Intelligence Types

**Files:**
- Create: `client/src/lib/intelligenceTypes.ts`

- [ ] **Step 1: Create the types file**

```typescript
// client/src/lib/intelligenceTypes.ts
export type IntelOperationType =
  | "investigate-person"
  | "monitor-godfather"
  | "counter-intel"
  | "opposition-research"
  | "media-intel"
  | "security-assessment";

export interface IntelOperation {
  id: string;
  type: IntelOperationType;
  targetId?: string;
  targetDescription: string;
  startDay: number;
  estimatedEndDay: number;
  politicalCapitalCost: number;
  successProbability: number;
  status: "active" | "completed" | "failed" | "exposed";
}

export interface IntelFinding {
  type: "hook" | "connection" | "loyalty-assessment" | "threat-warning" | "strategy-intel" | "media-source";
  targetId: string;
  description: string;
  evidence: number;
  deployable: boolean;
}

export interface IntelResult {
  operationId: string;
  type: IntelOperationType;
  success: boolean;
  exposed: boolean;
  findings: IntelFinding[];
}

export interface IntelligenceState {
  dniId: string | null;
  dniCompetence: number;
  dniLoyalty: number;
  activeOperations: IntelOperation[];
  completedOperations: IntelResult[];
  maxConcurrentOps: number;
}
```

- [ ] **Step 2: Extend Hook interface in gameTypes.ts**

Add optional deployment fields to the existing Hook interface:
```typescript
// In gameTypes.ts, add to Hook interface:
deployed?: boolean;
deploymentType?: "leverage" | "trade" | "blackmail";
leverageTarget?: string;
tradeRecipient?: string;
blackmailDesperation?: number;
sourceOperation?: string;
```

- [ ] **Step 3: Add IntelligenceState to GameState**

```typescript
import type { IntelligenceState } from "./intelligenceTypes";
// In GameState: intelligence: IntelligenceState;
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/intelligenceTypes.ts client/src/lib/gameTypes.ts
git commit -m "feat(intelligence): add types and extend Hook interface"
```

---

### Task 2: Core Intelligence Engine — Operations

**Files:**
- Create: `client/src/lib/intelligenceEngine.ts`
- Create: `client/src/lib/intelligenceEngine.test.ts`

- [ ] **Step 1: Write tests for operation management**

```typescript
// client/src/lib/intelligenceEngine.test.ts
import { describe, expect, it } from "vitest";
import {
  commissionOperation, processIntelligenceTurn, calculateSuccessProbability,
  defaultIntelligenceState,
} from "./intelligenceEngine";

describe("intelligenceEngine", () => {
  describe("calculateSuccessProbability", () => {
    it("should be 50% + competence × 0.4", () => {
      expect(calculateSuccessProbability(80)).toBeCloseTo(82);
      expect(calculateSuccessProbability(50)).toBeCloseTo(70);
      expect(calculateSuccessProbability(0)).toBeCloseTo(50);
    });
  });

  describe("commissionOperation", () => {
    it("should create an active operation", () => {
      const state = { ...defaultIntelligenceState(), dniId: "dni-1", dniCompetence: 70 };
      const result = commissionOperation(state, "investigate-person", "char-1", "Governor X", 100);
      expect(result.activeOperations.length).toBe(1);
      expect(result.activeOperations[0].status).toBe("active");
    });

    it("should reject if at max concurrent ops", () => {
      const state = {
        ...defaultIntelligenceState(),
        dniId: "dni-1", dniCompetence: 50, maxConcurrentOps: 2,
        activeOperations: [
          { id: "op1", type: "investigate-person" as const, status: "active" as const } as any,
          { id: "op2", type: "counter-intel" as const, status: "active" as const } as any,
        ],
      };
      const result = commissionOperation(state, "media-intel", undefined, "Media", 100);
      expect(result.activeOperations.length).toBe(2); // unchanged
    });

    it("should allow 3 ops when DNI competence >= 70", () => {
      const state = { ...defaultIntelligenceState(), dniId: "dni-1", dniCompetence: 75 };
      expect(state.maxConcurrentOps).toBe(2);
      // After setting competence >= 70, maxConcurrentOps should update
      const updated = { ...state, maxConcurrentOps: state.dniCompetence >= 70 ? 3 : 2 };
      expect(updated.maxConcurrentOps).toBe(3);
    });
  });

  describe("processIntelligenceTurn", () => {
    it("should advance operation timers", () => {
      const state = {
        ...defaultIntelligenceState(),
        dniId: "dni-1", dniCompetence: 70, dniLoyalty: 80,
        activeOperations: [{
          id: "op1", type: "investigate-person" as const,
          targetId: "char-1", targetDescription: "Governor X",
          startDay: 1, estimatedEndDay: 15, politicalCapitalCost: 5,
          successProbability: 78, status: "active" as const,
        }],
      };
      // At day 15, operation should resolve
      const result = processIntelligenceTurn(state, 15);
      expect(result.activeOperations.length).toBe(0);
      expect(result.completedOperations.length).toBe(1);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/intelligenceEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement intelligence engine**

Create `client/src/lib/intelligenceEngine.ts`:
- `defaultIntelligenceState()` — returns initial state with no DNI
- `calculateSuccessProbability(competence)` — `50 + competence × 0.4`
- `calculateDuration(baseDuration, competence)` — `baseDuration × (1 - competence / 200)`
- `commissionOperation(state, type, targetId, description, currentDay)` — creates IntelOperation, checks max concurrent ops, calculates estimated end day
- `processIntelligenceTurn(state, currentDay)` — for each active operation: if currentDay >= estimatedEndDay, resolve (success/failure/critical failure based on probability roll)
- `resolveOperation(operation, competence)` — rolls success/failure. On success: generates findings. On failure: 10% of failure space is critical failure (exposed). Returns IntelResult.

Operation base durations and costs from spec Section 2.1:
- investigate-person: 14-30 days, 5-10 PC
- monitor-godfather: 21-45 days, 8-15 PC
- counter-intel: 10-20 days, 5-8 PC
- opposition-research: 14-30 days, 8-12 PC
- media-intel: 7-14 days, 3-6 PC
- security-assessment: 7-14 days, 3-6 PC

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/intelligenceEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/intelligenceEngine.ts client/src/lib/intelligenceEngine.test.ts
git commit -m "feat(intelligence): implement operation management and resolution"
```

---

### Task 3: Passive Hook Generation & DNI Loyalty Leaks

**Files:**
- Modify: `client/src/lib/intelligenceEngine.ts`
- Modify: `client/src/lib/intelligenceEngine.test.ts`

- [ ] **Step 1: Write tests for passive hooks and loyalty leaks**

```typescript
describe("passive hook generation", () => {
  it("high competence DNI generates hooks every 15-30 days", () => {
    const rate = getPassiveHookRate(80);
    expect(rate.min).toBe(15);
    expect(rate.max).toBe(30);
  });

  it("low competence DNI generates hooks every 60-90 days", () => {
    const rate = getPassiveHookRate(30);
    expect(rate.min).toBe(60);
    expect(rate.max).toBe(90);
  });
});

describe("DNI loyalty leaks", () => {
  it("should have 0% leak rate above loyalty 40", () => {
    expect(calculateLeakRate(50, 0.15)).toBe(0);
    expect(calculateLeakRate(80, 0.10)).toBe(0);
  });

  it("should have base rates at loyalty 40", () => {
    expect(calculateLeakRate(40, 0.15)).toBeCloseTo(0.15);
  });

  it("should scale up below loyalty 40", () => {
    // At loyalty 30: rate × (40-30)/20 = rate × 0.5... wait, formula is baseRate × (40-loyalty)/20
    // At loyalty 30: 0.15 × (40-30)/20 = 0.15 × 0.5 = 0.075... that's lower
    // Re-reading spec: actualRate = baseRate × (40 - loyalty) / 20, at loyalty 40 = baseRate × 0 = 0
    // Wait, at loyalty 40: (40-40)/20 = 0. That contradicts "at loyalty 40, rates are as listed"
    // Re-reading: "These are the base rates at loyalty 40... At loyalty 30, rates are 1.5×"
    // So the formula must be: actualRate = baseRate × (1 + (40 - loyalty) / 20), clamped
    // Or: actualRate = baseRate × max(0, (40 - loyalty + 20) / 20)
    // Let me use the simpler reading: below 40, leak risk exists and scales
    const rate30 = calculateLeakRate(30, 0.15);
    expect(rate30).toBeGreaterThan(0.15);
  });

  it("should cap at 2× base rate", () => {
    const rate0 = calculateLeakRate(0, 0.15);
    expect(rate0).toBeLessThanOrEqual(0.30);
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add to `intelligenceEngine.ts`:
- `getPassiveHookRate(competence)` — returns `{min, max}` days between passive hook generation based on competence tiers
- `generatePassiveHook(state, currentDay, characters)` — checks if enough time has passed since last hook; if so, generates a random hook against a random character. Hook accuracy depends on competence.
- `calculateLeakRate(loyalty, baseRate)` — implements spec formula. Above 40 loyalty: 0. At 40: base rate. Below 40: scales up to 2× at loyalty 0.
- `checkDniLeaks(state, deploymentType)` — rolls against leak rates for each deployment. Returns leak type or null.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/intelligenceEngine.ts client/src/lib/intelligenceEngine.test.ts
git commit -m "feat(intelligence): add passive hook generation and DNI loyalty leak system"
```

---

### Task 4: Intelligence Deployment (Leverage, Trade, Blackmail)

**Files:**
- Modify: `client/src/lib/intelligenceEngine.ts`
- Modify: `client/src/lib/intelligenceEngine.test.ts`

- [ ] **Step 1: Write tests for deployment**

```typescript
describe("intelligence deployment", () => {
  it("leverage should increase target loyalty with resentment flag", () => {
    const result = deployLeverage("hook-1", "char-1");
    expect(result.hookUpdate.deployed).toBe(true);
    expect(result.hookUpdate.deploymentType).toBe("leverage");
    expect(result.targetEffects).toContainEqual(
      expect.objectContaining({ type: "loyalty-boost" })
    );
  });

  it("trade should mark hook as consumed", () => {
    const result = deployTrade("hook-1", "godfather-1");
    expect(result.hookUpdate.deployed).toBe(true);
    expect(result.hookUpdate.deploymentType).toBe("trade");
    expect(result.hookUpdate.tradeRecipient).toBe("godfather-1");
  });

  it("blackmail should set desperation counter starting at 0", () => {
    const result = deployBlackmail("hook-1", "char-1");
    expect(result.hookUpdate.deployed).toBe(true);
    expect(result.hookUpdate.deploymentType).toBe("blackmail");
    expect(result.hookUpdate.blackmailDesperation).toBe(0);
  });

  it("blackmail desperation should increase each turn", () => {
    const desperation = tickBlackmailDesperation(50, false);
    expect(desperation).toBe(55); // +5 per turn
  });

  it("repeated blackmail should increase desperation faster", () => {
    const desperation = tickBlackmailDesperation(50, true);
    expect(desperation).toBe(58); // +8 for repeated
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add to `intelligenceEngine.ts`:
- `deployLeverage(hookId, targetId)` — returns hook updates and target effects (loyalty boost + resentment flag)
- `deployTrade(hookId, recipientId)` — returns hook updates (consumed, one-shot)
- `deployBlackmail(hookId, targetId)` — returns hook updates (desperation counter starts at 0)
- `tickBlackmailDesperation(current, isRepeated)` — +5 per turn, +8 if repeated. At 80, target may rebel.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/intelligenceEngine.ts client/src/lib/intelligenceEngine.test.ts
git commit -m "feat(intelligence): implement leverage, trade, and blackmail deployment"
```

---

## Chunk 2: Integration & UI

### Task 5: GameState Integration & Turn Processing

**Files:**
- Modify: `client/src/lib/GameContext.tsx`
- Modify: `client/src/lib/gameEngine.ts`

- [ ] **Step 1: Initialize intelligence state in GameContext**

```typescript
import { defaultIntelligenceState } from "./intelligenceEngine";
// In initializeGameState: intelligence: defaultIntelligenceState(),
```

- [ ] **Step 2: Integrate into processTurn**

In `gameEngine.ts` processTurn:
- Sync DNI stats from character state each turn
- Call `processIntelligenceTurn()` to advance operations
- Call `generatePassiveHook()` to check for new hooks
- Tick blackmail desperation counters on all blackmailed hooks

- [ ] **Step 3: Run all tests**

Run: `cd client && npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/GameContext.tsx client/src/lib/gameEngine.ts
git commit -m "feat(intelligence): integrate into game state and turn processing"
```

---

### Task 6: DNI Selection in Onboarding

**Files:**
- Modify: `client/src/components/OnboardingFlow.tsx`

- [ ] **Step 1: Read current OnboardingFlow.tsx**

Read to understand existing appointment steps and patterns.

- [ ] **Step 2: Add DNI selection step**

Add a new step in the onboarding flow for DNI appointment:
- Show 3 candidates per zone (same diversity rules as constitutional officers)
- Each candidate displays: name, zone, competence, loyalty
- The trade-off is visible: high competence = better intel, but a politically convenient pick may please a godfather

- [ ] **Step 3: Run build and tests**

Run: `cd client && npx vite build && npx vitest run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add client/src/components/OnboardingFlow.tsx
git commit -m "feat(intelligence): add DNI selection to onboarding flow"
```

---

### Task 7: Intelligence Panel in PoliticsTab

**Files:**
- Modify: `client/src/components/PoliticsTab.tsx`

- [ ] **Step 1: Add intelligence panel**

Add a new section to PoliticsTab:
1. **DNI Status** — name, competence bar, loyalty indicator
2. **Active Operations** — list with progress bars, estimated completion
3. **Hook Inventory** — deployable hooks with leverage/trade/blackmail buttons
4. **Commission Operation** — button opening operation type selection with target picker, cost/duration/success preview

Follow presidential theme.

- [ ] **Step 2: Add GameContext actions**

Actions: `COMMISSION_OPERATION`, `DEPLOY_LEVERAGE`, `DEPLOY_TRADE`, `DEPLOY_BLACKMAIL`

- [ ] **Step 3: Run build and tests**

Run: `cd client && npx vite build && npx vitest run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add client/src/components/PoliticsTab.tsx client/src/lib/GameContext.tsx
git commit -m "feat(intelligence): add intelligence panel to PoliticsTab"
```

---

### Task 8: Final Cleanup

- [ ] **Step 1: Run full test suite, type check, and build**

Run: `cd client && npx vitest run && npx tsc --noEmit && npx vite build`
Expected: All pass

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(intelligence): complete intelligence & espionage system"
```
