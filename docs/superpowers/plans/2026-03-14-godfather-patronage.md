# Godfather & Patronage System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static power broker display into a fully simulated godfather ecosystem where 20-25 godfathers operate autonomously, the player engages them through deals, and patronage debt creates escalating puppet-vs-independence tension.

**Architecture:** A `godfatherEngine.ts` runs each turn: ticking approach cooldowns, advancing escalation ladders, checking trigger windows, and processing active contracts/favours. Godfathers interact with the Legislative Engine (vote bloc modifiers), appointments (protégé candidates), and media (coverage modifiers). A `godfatherProfiles.ts` holds 20-25 handcrafted godfather definitions. Deal negotiation happens through inbox messages and event choices.

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-14-godfather-patronage-design.md`

**Depends on:** Sub-Project A (Legislative Engine) — for `GameStateModifier`, `LeverCost` types, and vote modifier integration.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `client/src/lib/godfatherTypes.ts` | All interfaces: `Godfather`, `GodfatherTraits`, `GodfatherStable`, `GodfatherConnection`, `GodfatherContract`, `GodfatherDeal`, `PatronageState` |
| `client/src/lib/godfatherProfiles.ts` | 20-25 handcrafted godfather definitions with traits, stables, backstories |
| `client/src/lib/godfatherDeals.ts` | Deal generation, contract tracking, favour-bank accounting, deal proposal logic |
| `client/src/lib/godfatherEngine.ts` | Core simulation: background tick, approach logic, escalation ladder, neutralization, trigger windows |
| `client/src/lib/godfatherEngine.test.ts` | Unit tests |
| `client/src/lib/gameTypes.ts` | Modified: add `PatronageState` to `GameState` |
| `client/src/lib/GameContext.tsx` | Modified: initialize patronage state, add actions |
| `client/src/lib/gameEngine.ts` | Modified: call godfather engine from `processTurn()` |
| `client/src/components/PoliticsTab.tsx` | Modified: rewrite power broker section with godfather UI |

---

## Chunk 1: Types, Profiles & Core Engine

### Task 1: Create Godfather Types

**Files:**
- Create: `client/src/lib/godfatherTypes.ts`

- [ ] **Step 1: Create the types file**

```typescript
// client/src/lib/godfatherTypes.ts
import type { GameStateModifier, LeverCost } from "./legislativeTypes";

export type GodfatherArchetype =
  | "business-oligarch"
  | "military-elder"
  | "party-boss"
  | "labour-civil"
  | "religious-leader"
  | "regional-strongman"
  | "media-mogul";

export interface GodfatherTraits {
  aggression: number;
  loyalty: number;
  greed: number;
  visibility: number;
}

export interface GodfatherConnection {
  entityType: "governor" | "legislator-bloc" | "cabinet" | "media" | "business" | "street";
  entityId?: string;
  description: string;
  effect: GameStateModifier[];
  revealed: boolean;
}

export interface GodfatherStable {
  governors: string[];
  legislativeBloc: { house: number; senate: number };
  cabinetCandidates: string[];
  connections: GodfatherConnection[];
}

export interface GodfatherContract {
  id: string;
  description: string;
  deliveredByGodfather: boolean;
  deadlineDay: number;
  playerDelivered: boolean;
  consequence: GameStateModifier[];
}

export interface Godfather {
  id: string;
  name: string;
  archetype: GodfatherArchetype;
  zone: string;
  description: string;
  traits: GodfatherTraits;
  disposition: "friendly" | "neutral" | "cold" | "hostile";
  dealStyle: "contract" | "favour-bank";
  interests: string[];
  stable: GodfatherStable;
  escalationStage: 0 | 1 | 2 | 3 | 4;
  favourDebt: number;
  activeContracts: GodfatherContract[];
  neutralized: boolean;
  influenceScore: number;
}

export interface GodfatherDeal {
  godfatherId: string;
  type: "contract" | "favour";
  godfatherOffers: string;
  playerOwes: string;
  estimatedCost: LeverCost[];
  estimatedBenefit: string;
}

export interface PatronageState {
  godfathers: Godfather[];
  patronageIndex: number;
  activeDeals: number;
  neutralizedGodfathers: string[];
  approachCooldowns: Record<string, number>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/godfatherTypes.ts
git commit -m "feat(godfather): add TypeScript interfaces for godfather system"
```

---

### Task 2: Create Godfather Profiles

**Files:**
- Create: `client/src/lib/godfatherProfiles.ts`

- [ ] **Step 1: Write tests for profiles**

```typescript
// client/src/lib/godfatherProfiles.test.ts
import { describe, expect, it } from "vitest";
import { GODFATHER_PROFILES } from "./godfatherProfiles";

describe("godfatherProfiles", () => {
  it("should have 20-25 godfathers", () => {
    expect(GODFATHER_PROFILES.length).toBeGreaterThanOrEqual(20);
    expect(GODFATHER_PROFILES.length).toBeLessThanOrEqual(25);
  });

  it("should cover all 6 geopolitical zones", () => {
    const zones = new Set(GODFATHER_PROFILES.map((g) => g.zone));
    expect(zones.size).toBe(6);
    for (const z of ["NC", "NW", "NE", "SW", "SE", "SS"]) {
      expect(zones.has(z)).toBe(true);
    }
  });

  it("should have 3-4 godfathers per zone", () => {
    const zoneCounts: Record<string, number> = {};
    for (const g of GODFATHER_PROFILES) {
      zoneCounts[g.zone] = (zoneCounts[g.zone] || 0) + 1;
    }
    for (const count of Object.values(zoneCounts)) {
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it("should cover all 7 archetypes", () => {
    const archetypes = new Set(GODFATHER_PROFILES.map((g) => g.archetype));
    expect(archetypes.size).toBe(7);
  });

  it("should have unique IDs", () => {
    const ids = GODFATHER_PROFILES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all traits should be 0-100", () => {
    for (const g of GODFATHER_PROFILES) {
      for (const [, value] of Object.entries(g.traits)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("should have ~60% revealed connections", () => {
    for (const g of GODFATHER_PROFILES) {
      const total = g.stable.connections.length;
      if (total > 0) {
        const revealed = g.stable.connections.filter((c) => c.revealed).length;
        const ratio = revealed / total;
        expect(ratio).toBeGreaterThanOrEqual(0.4);
        expect(ratio).toBeLessThanOrEqual(0.8);
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/godfatherProfiles.test.ts`
Expected: FAIL

- [ ] **Step 3: Create 20-25 handcrafted godfather profiles**

Create `client/src/lib/godfatherProfiles.ts` with `GODFATHER_PROFILES: Godfather[]`. Each godfather needs:
- Unique Nigerian name, zone, archetype, backstory
- 4 personality traits (aggression, loyalty, greed, visibility) — varied across archetypes
- Stable with governor IDs (reference existing governor names from `gameData.ts`), legislative bloc sizes, cabinet candidate IDs, and connections (mix of revealed/hidden)
- Deal style matching archetype (oligarchs → contract, military elders → favour-bank, etc.)
- Influence score (50-95 range)
- Starting disposition (mostly "neutral", a few "friendly" or "cold" based on zone alignment)

Archetype distribution: 4-5 business oligarchs, 2-3 military elders, 3-4 party bosses, 2 labour/civil, 3-4 religious leaders, 3-4 regional strongmen, 2-3 media moguls.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/godfatherProfiles.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/godfatherProfiles.ts client/src/lib/godfatherProfiles.test.ts
git commit -m "feat(godfather): add 20-25 handcrafted godfather profiles"
```

---

### Task 3: Deal Generation & Tracking

**Files:**
- Create: `client/src/lib/godfatherDeals.ts`

- [ ] **Step 1: Write tests for deal system**

```typescript
// client/src/lib/godfatherDeals.test.ts
import { describe, expect, it } from "vitest";
import { generateDealProposal, acceptDeal, checkContractDeadlines, cashInFavour } from "./godfatherDeals";
import { GODFATHER_PROFILES } from "./godfatherProfiles";

describe("godfatherDeals", () => {
  const oligarch = GODFATHER_PROFILES.find((g) => g.archetype === "business-oligarch")!;
  const elder = GODFATHER_PROFILES.find((g) => g.archetype === "military-elder")!;

  describe("generateDealProposal", () => {
    it("should generate contract-style deal for business oligarch", () => {
      const deal = generateDealProposal(oligarch, "legislative-support");
      expect(deal.type).toBe("contract");
      expect(deal.godfatherOffers).toBeTruthy();
      expect(deal.playerOwes).toBeTruthy();
    });

    it("should generate favour-style deal for military elder", () => {
      const deal = generateDealProposal(elder, "security-crisis");
      expect(deal.type).toBe("favour");
    });
  });

  describe("acceptDeal", () => {
    it("should increase patronage index", () => {
      const state = { patronageIndex: 10, activeDeals: 1, godfathers: [{ ...oligarch }] };
      const result = acceptDeal(state, oligarch.id, generateDealProposal(oligarch, "legislative-support"));
      expect(result.patronageIndex).toBeGreaterThan(10);
      expect(result.activeDeals).toBe(2);
    });

    it("should cap active deals at 6", () => {
      const state = { patronageIndex: 30, activeDeals: 6, godfathers: [{ ...oligarch }] };
      const result = acceptDeal(state, oligarch.id, generateDealProposal(oligarch, "legislative-support"));
      expect(result.activeDeals).toBe(6); // no change — cap reached
    });
  });

  describe("checkContractDeadlines", () => {
    it("should trigger escalation when deadline missed", () => {
      const gf = { ...oligarch, activeContracts: [{
        id: "c1", description: "test", deliveredByGodfather: true,
        deadlineDay: 10, playerDelivered: false, consequence: [],
      }] };
      const result = checkContractDeadlines({ godfathers: [gf] }, 15);
      expect(result.godfathers[0].escalationStage).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/godfatherDeals.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement deal system**

Create `client/src/lib/godfatherDeals.ts`:
- `generateDealProposal(godfather, context)` — generates a deal matching the godfather's dealStyle and the gameplay context (legislative-support, security-crisis, appointment, campaign-funding, etc.). Contract deals have explicit terms and deadline. Favour deals have vague terms.
- `acceptDeal(patronageState, godfatherId, deal)` — increases patronage index (+5 per deal), increments activeDeals, adds contract to godfather's activeContracts or increases favourDebt. Respects 6-deal cap.
- `rejectDeal(patronageState, godfatherId)` — may worsen disposition based on godfather traits
- `checkContractDeadlines(patronageState, currentDay)` — checks all active contracts; missed deadlines trigger escalation stage advance
- `cashInFavour(patronageState, godfatherId, demand)` — godfather cashes in a favour; deducts from favourDebt; generates a demand the player must respond to

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/godfatherDeals.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/godfatherDeals.ts client/src/lib/godfatherDeals.test.ts
git commit -m "feat(godfather): implement deal generation, acceptance, and deadline tracking"
```

---

### Task 4: Core Godfather Engine — Background Simulation

**Files:**
- Create: `client/src/lib/godfatherEngine.ts`
- Create: `client/src/lib/godfatherEngine.test.ts`

- [ ] **Step 1: Write tests for escalation ladder**

```typescript
// client/src/lib/godfatherEngine.test.ts
import { describe, expect, it } from "vitest";
import { advanceEscalation, processGodfatherTurn, checkTriggerWindows } from "./godfatherEngine";
import { GODFATHER_PROFILES } from "./godfatherProfiles";
import { initializeGameState } from "./GameContext";

const testConfig = {
  firstName: "Test", lastName: "President", age: 55, gender: "Male" as const,
  stateOfOrigin: "Lagos", education: "University", party: "ADU", era: "2023" as const,
  vpName: "VP Test", vpState: "Kano", vpZone: "NW",
};

describe("godfatherEngine", () => {
  describe("advanceEscalation", () => {
    it("should advance from stage 0 to stage 1 when provoked", () => {
      const gf = { ...GODFATHER_PROFILES[0], escalationStage: 0 as const };
      const result = advanceEscalation(gf);
      expect(result.escalationStage).toBe(1);
    });

    it("should not advance past stage 4", () => {
      const gf = { ...GODFATHER_PROFILES[0], escalationStage: 4 as const };
      const result = advanceEscalation(gf);
      expect(result.escalationStage).toBe(4);
    });

    it("high aggression godfathers should escalate faster", () => {
      const aggressive = { ...GODFATHER_PROFILES[0], traits: { ...GODFATHER_PROFILES[0].traits, aggression: 90 }, escalationStage: 1 as const };
      const patient = { ...GODFATHER_PROFILES[0], traits: { ...GODFATHER_PROFILES[0].traits, aggression: 20 }, escalationStage: 1 as const };
      // Aggressive should have shorter cooldown to next escalation
      expect(aggressive.traits.aggression).toBeGreaterThan(patient.traits.aggression);
    });
  });

  describe("checkTriggerWindows", () => {
    it("should detect budget season as trigger window", () => {
      const state = initializeGameState(testConfig);
      // Budget season: when a budget bill is active
      state.legislature = {
        ...state.legislature,
        activeBills: [{
          id: "b1", title: "Budget", subjectTag: "economy", stakes: "critical",
          isCrisis: true, sponsor: "executive",
          // ... minimal bill fields
        } as any],
      };
      const windows = checkTriggerWindows(state);
      expect(windows).toContain("budget-season");
    });

    it("should detect low approval as trigger window", () => {
      const state = initializeGameState(testConfig);
      state.approval = 30;
      const windows = checkTriggerWindows(state);
      expect(windows).toContain("low-approval");
    });
  });

  describe("processGodfatherTurn", () => {
    it("should generate approach messages when cooldown expires", () => {
      const state = initializeGameState(testConfig);
      const gf = { ...GODFATHER_PROFILES[0], disposition: "neutral" as const };
      state.patronage = {
        godfathers: [gf],
        patronageIndex: 0,
        activeDeals: 0,
        neutralizedGodfathers: [],
        approachCooldowns: { [gf.id]: state.day - 1 }, // cooldown expired
      };
      const result = processGodfatherTurn(state);
      // Should generate an approach (inbox message or event)
      expect(result.approaches.length).toBeGreaterThanOrEqual(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/godfatherEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement godfather engine**

Create `client/src/lib/godfatherEngine.ts`:
- `advanceEscalation(godfather)` — moves escalation stage up by 1 (max 4). Stage 4 triggers nuclear event.
- `checkTriggerWindows(state)` — returns active trigger windows: "budget-season" (budget bill active), "election-approach" (day > 900), "low-approval" (approval < 35), "low-stability" (stability < 30), "impeachment-threat" (if active)
- `processGodfatherTurn(state)` — the main per-turn function:
  1. For each non-neutralized godfather: check contract deadlines, advance escalation if provoked, check approach cooldown
  2. During trigger windows, multiply approach frequency
  3. Generate approach messages for godfathers whose cooldown has expired and conditions are met
  4. Apply stable effects: hostile godfathers withdraw/oppose, friendly ones provide benefits
  5. Update patronage index based on active deals
  6. Returns `{ patronageState: PatronageState, approaches: GodfatherDeal[], events: any[] }`
- `neutralizeGodfather(state, godfatherId, method)` — handles the 3 neutralization routes (intelligence, political power, godfather-vs-godfather). Returns updated state.
- `defaultPatronageState()` — returns initial state with all godfathers from profiles

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/godfatherEngine.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/godfatherEngine.ts client/src/lib/godfatherEngine.test.ts
git commit -m "feat(godfather): implement core engine with escalation and trigger windows"
```

---

## Chunk 2: Integration & UI

### Task 5: Patronage Index & Consequences

**Files:**
- Modify: `client/src/lib/godfatherEngine.ts`
- Modify: `client/src/lib/godfatherEngine.test.ts`

- [ ] **Step 1: Write tests for patronage index effects**

```typescript
describe("patronageIndex", () => {
  it("should have no penalty in Clean tier (0-20)", () => {
    const effects = getPatronageEffects(15);
    expect(effects.approvalCeiling).toBeUndefined();
    expect(effects.scandalRisk).toBe(0);
  });

  it("should cap approval at ~60% in Compromised tier (46-70)", () => {
    const effects = getPatronageEffects(55);
    expect(effects.approvalCeiling).toBe(60);
  });

  it("should cap approval at ~50% in Captured tier (71-100)", () => {
    const effects = getPatronageEffects(80);
    expect(effects.approvalCeiling).toBe(50);
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add `getPatronageEffects(index)` to return effects based on the 4-tier system: Clean (0-20), Pragmatic (21-45), Compromised (46-70), Captured (71-100).

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/godfatherEngine.ts client/src/lib/godfatherEngine.test.ts
git commit -m "feat(godfather): implement patronage index tiers and consequences"
```

---

### Task 6: Integrate with GameState & Turn Processing

**Files:**
- Modify: `client/src/lib/gameTypes.ts`
- Modify: `client/src/lib/gameEngine.ts`
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Add PatronageState to GameState**

In `gameTypes.ts`:
```typescript
import type { PatronageState } from "./godfatherTypes";
// In GameState: patronage: PatronageState;
```

- [ ] **Step 2: Initialize patronage state in GameContext.tsx**

```typescript
import { defaultPatronageState } from "./godfatherEngine";
// In initializeGameState return: patronage: defaultPatronageState(),
```

- [ ] **Step 3: Call godfather engine from processTurn**

In `gameEngine.ts`:
```typescript
import { processGodfatherTurn } from "./godfatherEngine";
// Inside processTurn: const gfResult = processGodfatherTurn(state);
// Apply patronage state updates and generate events/inbox messages
```

- [ ] **Step 4: Add GameContext actions**

Add reducer actions: `ACCEPT_DEAL`, `REJECT_DEAL`, `RESPOND_TO_FAVOUR`, `NEUTRALIZE_GODFATHER`

- [ ] **Step 5: Run all tests**

Run: `cd client && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/gameTypes.ts client/src/lib/gameEngine.ts client/src/lib/GameContext.tsx
git commit -m "feat(godfather): integrate patronage system into game state and turn processing"
```

---

### Task 7: Rewrite PoliticsTab Power Broker Section

**Files:**
- Modify: `client/src/components/PoliticsTab.tsx`

- [ ] **Step 1: Read current PoliticsTab.tsx**

Read to understand current layout and power broker display.

- [ ] **Step 2: Rewrite power broker section**

Replace static power broker display with:
1. **Godfather Overview** — grid of godfather cards: name, archetype icon, zone badge, disposition indicator (color-coded), influence bar, escalation stage indicator
2. **Godfather Detail Panel** — click a godfather to see: full profile, visible stable connections, active contracts/favour debt, deal history
3. **Active Deals Panel** — list of current obligations with deadline countdowns, patronage index meter with tier label
4. **Deal Negotiation** — when an approach arrives, show deal terms with Accept/Reject buttons

Follow presidential UI theme (deep green, gold, bold).

- [ ] **Step 3: Run build and tests**

Run: `cd client && npx vite build && npx vitest run`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Commit**

```bash
git add client/src/components/PoliticsTab.tsx
git commit -m "feat(godfather): rewrite PoliticsTab with godfather profiles and deal UI"
```

---

### Task 8: Legislative Integration & Nuclear Events

**Files:**
- Modify: `client/src/lib/godfatherEngine.ts`
- Modify: `client/src/lib/godfatherEngine.test.ts`

- [ ] **Step 1: Write tests for legislative bloc integration and nuclear events**

```typescript
describe("legislative integration", () => {
  it("should provide vote modifier from godfather legislative blocs", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "friendly" as const };
    const modifier = getGodfatherVoteModifier(gf, "economy");
    expect(modifier.house).toBeGreaterThan(0); // friendly godfather adds votes
  });

  it("hostile godfather should subtract votes", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "hostile" as const };
    const modifier = getGodfatherVoteModifier(gf, "economy");
    expect(modifier.house).toBeLessThan(0);
  });
});

describe("nuclear events", () => {
  it("should generate archetype-specific crisis at stage 4", () => {
    const oligarch = { ...GODFATHER_PROFILES.find((g) => g.archetype === "business-oligarch")!, escalationStage: 4 as const };
    const event = generateNuclearEvent(oligarch);
    expect(event).toBeDefined();
    expect(event.type).toBe("capital-flight");
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add:
- `getGodfatherVoteModifier(godfather, billSubjectTag)` — returns `{ house: number, senate: number }` based on disposition and whether the bill topic matches their interests
- `generateNuclearEvent(godfather)` — generates archetype-specific crisis event (capital flight, coup signals, general strike, etc.)

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/godfatherEngine.ts client/src/lib/godfatherEngine.test.ts
git commit -m "feat(godfather): add legislative bloc modifiers and nuclear event generation"
```

---

### Task 9: Final Cleanup & Static Data Removal

**Files:**
- Modify: `client/src/lib/gameData.ts`
- Modify: `client/src/lib/gameContent.ts`

- [ ] **Step 1: Remove static power broker data**

Remove any static `powerBrokers` array from `gameData.ts`.

- [ ] **Step 2: Add godfather inbox message templates**

Add approach message templates, deal proposal templates, escalation warning templates, and nuclear event descriptions to `gameContent.ts`.

- [ ] **Step 3: Run full test suite, type check, and build**

Run: `cd client && npx vitest run && npx tsc --noEmit && npx vite build`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(godfather): complete patronage system integration and cleanup"
```
