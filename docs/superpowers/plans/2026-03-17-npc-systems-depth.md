# NPC Systems Depth Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen NPC systems with dismissals, godfather cross-system pressure, traditional/religious activation, cabinet competency effects, and inter-NPC relationships.

**Architecture:** Five layered enhancements built in dependency order. Each produces a new pure-function engine or extends an existing one, following the `process*(state, rng) → { updatedState, events, consequences }` pattern. All integrate into the `processTurn()` pipeline in `gameEngine.ts`.

**Tech Stack:** React 18, TypeScript 5.6, Vite 7.3, Vitest

**Spec:** `docs/superpowers/specs/2026-03-17-npc-systems-depth-design.md`

**Test command:** `npx vitest run`

---

## File Structure

### New files
| File | Responsibility |
|---|---|
| `client/src/lib/dismissalEngine.ts` | Unified dismissal logic for all 5 appointable system types |
| `client/src/lib/dismissalEngine.test.ts` | Tests for dismissal engine |
| `client/src/lib/affinityRegistry.ts` | NPCLink type, computeAffinity(), processAppointmentRipple(), link seeding |
| `client/src/lib/affinityRegistry.test.ts` | Tests for affinity system |

### Modified files
| File | Changes |
|---|---|
| `client/src/lib/godfatherTypes.ts` | Add 5 optional fields to `GodfatherStable` |
| `client/src/lib/businessOligarchTypes.ts` | Add 5 optional fields to `stableTemplate` |
| `client/src/lib/godfatherEngine.ts` | Appointment watch, dismissal reaction, interim ally amplification |
| `client/src/lib/godfatherEngine.test.ts` | ~15 new tests for bridge mechanics |
| `client/src/lib/godfatherProfiles.ts` | Interest data for 19 hardcoded godfathers |
| `client/src/lib/businessOligarchEngine.ts` | Interest derivation during seeding |
| `client/src/lib/traditionalRulerEngine.ts` | Audience system, state visits, public statements |
| `client/src/lib/traditionalRulerEngine.test.ts` | ~20 new tests |
| `client/src/lib/traditionalRulerTypes.ts` | lastStateVisitDay field if needed |
| `client/src/lib/religiousLeaderEngine.ts` | Festival events, interfaith summit, policy reactions |
| `client/src/lib/religiousLeaderEngine.test.ts` | ~15 new tests |
| `client/src/lib/religiousLeaderTypes.ts` | Add lastSummitDay field, festival event constants if needed |
| `client/src/lib/lifecycleEngine.ts` | NPC link cleanup on character exit |
| `client/src/lib/cabinetSystem.ts` | computeMinisterialEffectiveness(), 3 event generators |
| `client/src/lib/cabinetSystem.test.ts` | ~15 new tests |
| `client/src/lib/sectorTurnProcessor.ts` | Apply ministerial multiplier |
| `client/src/lib/gameTypes.ts` | Add `npcLinks: NPCLink[]` to GameState |
| `client/src/lib/gameEngine.ts` | Wire all 5 items into processTurn pipeline |
| `client/src/lib/GameContext.tsx` | DISMISS_OFFICIAL reducer, INITIATE_STATE_VISIT reducer, npcLinks seeding |

---

## Chunk 1: Unified Dismissal Engine

### Task 1: Dismissal Engine — Types and Core Function

**Files:**
- Create: `client/src/lib/dismissalEngine.ts`
- Create: `client/src/lib/dismissalEngine.test.ts`

- [ ] **Step 1: Write failing tests for minister dismissal**

```typescript
// dismissalEngine.test.ts
import { describe, it, expect } from "vitest";
import { processDismissal, type DismissableSystem } from "./dismissalEngine";
// Import helpers to build mock GameState from existing test patterns
// Reference: gameEngine.test.ts, diplomatEngine.test.ts for mock state shape

describe("processDismissal", () => {
  describe("minister dismissal", () => {
    it("sets cabinetAppointments[portfolio] to null", () => {
      const state = makeMockState({ cabinetAppointments: { finance: "Alh. Aminu Kazeem" } });
      const result = processDismissal(state, "minister", "finance");
      expect(result.updatedState.cabinetAppointments!.finance).toBeNull();
    });

    it("generates -3 approval and -2 stability consequences", () => {
      const state = makeMockState({ cabinetAppointments: { finance: "Alh. Aminu Kazeem" } });
      const result = processDismissal(state, "minister", "finance");
      const approvalConseq = result.consequences.find(c => c.effects?.approval);
      const stabilityConseq = result.consequences.find(c => c.effects?.stability);
      expect(approvalConseq!.effects!.approval).toBe(-3);
      expect(stabilityConseq!.effects!.stability).toBe(-2);
    });

    it("creates an inbox message announcing the dismissal", () => {
      const state = makeMockState({ cabinetAppointments: { finance: "Alh. Aminu Kazeem" } });
      const result = processDismissal(state, "minister", "finance");
      expect(result.inboxMessages.length).toBeGreaterThan(0);
      expect(result.inboxMessages[0].body).toContain("relieved of duties");
    });

    it("removes dismissed minister from state.characters", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Alh. Aminu Kazeem" },
        characters: { "Alh. Aminu Kazeem": { faction: "Northern Caucus", loyalty: 78 } },
      });
      const result = processDismissal(state, "minister", "finance");
      expect(result.updatedState.characters!["Alh. Aminu Kazeem"]).toBeUndefined();
    });

    it("removes minister from ministerStatuses", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Alh. Aminu Kazeem" },
        ministerStatuses: { "Alh. Aminu Kazeem": { onProbation: false, appointmentDay: 1, lastSummonedDay: 0, lastDirectiveDay: 0, probationStartDay: 0, pendingMemos: [] } },
      });
      const result = processDismissal(state, "minister", "finance");
      expect(result.updatedState.ministerStatuses!["Alh. Aminu Kazeem"]).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/dismissalEngine.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal dismissalEngine.ts with minister path**

Create `dismissalEngine.ts` with:
- `DismissableSystem` type
- `DismissalResult` interface
- `processDismissal()` function with `switch(systemType)` handling `"minister"` case
- Minister path: nulls `cabinetAppointments[positionId]`, deletes `ministerStatuses[name]`, generates consequences and inbox message
- Helper: `makeDismissalConsequence(id, effects)` following existing `Consequence` pattern
- Helper: `makeDismissalInbox(name, title)` following existing `GameInboxMessage` pattern

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/lib/dismissalEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/dismissalEngine.ts client/src/lib/dismissalEngine.test.ts
git commit -m "feat: dismissal engine with minister path"
```

### Task 2: Dismissal Engine — Director, Diplomat, Military, Aide Paths

**Files:**
- Modify: `client/src/lib/dismissalEngine.ts`
- Modify: `client/src/lib/dismissalEngine.test.ts`

- [ ] **Step 1: Write failing tests for each system type**

Add test groups for:
- `"director"`: nulls `state.directors.appointments[positionId].characterName`, sets `vacantSinceDay`, generates −1 approval
- `"diplomat"`: nulls `state.diplomats.appointments[postId].characterName`, sets `vacantSinceDay`, generates −2 approval (bilateral) or −1 (minor — check post category from `ALL_DIPLOMAT_POSTS`)
- `"military"`: nulls `state.military.appointments[positionId].characterName`, sets `vacantSinceDay`, generates −4 approval and −3 stability
- `"aide"`: removes from `state.appointments[]` array, removes from `state.characters`, clears `state.personalAssistant` if PA, generates −2 approval

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run client/src/lib/dismissalEngine.test.ts`
Expected: FAIL — unimplemented switch cases

- [ ] **Step 3: Implement all 4 remaining paths in processDismissal**

Add switch cases for `"director"`, `"diplomat"`, `"military"`, `"aide"`. Each follows the same pattern: read current holder → null the position → set vacantSinceDay → generate scaled consequences → create inbox message.

For `"aide"`: find in `state.appointments` by matching `office === positionId`, remove that entry. If `positionId === "Personal Assistant"`, also set `state.personalAssistant = ""`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/lib/dismissalEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing tests for vacancy escalation and lifecycle integration**

```typescript
describe("vacancy escalation", () => {
  it("triggers diplomat vacancy escalation (sets vacantSinceDay for existing system to process)", () => { /* ... */ });
  it("triggers minister replacement appointment event generation", () => {
    const state = makeMockState({ cabinetAppointments: { finance: "Test" } });
    const result = processDismissal(state, "minister", "finance");
    const replacementEvent = result.events.find(e => e.source === "cabinet-appointment");
    expect(replacementEvent).toBeDefined();
    expect(replacementEvent!.cabinetPortfolio).toBe("finance");
  });
});

describe("lifecycle integration", () => {
  it("marks dismissed character with exit reason 'fired' for career mobility", () => {
    const state = makeMockState({ cabinetAppointments: { finance: "Test" }, characters: { "Test": { age: 50 } } });
    const result = processDismissal(state, "minister", "finance");
    expect(result.lifecycleExit).toEqual({ characterName: "Test", exitReason: "fired" });
  });
});
```

- [ ] **Step 6: Implement vacancy escalation and lifecycle exit marking**

In `processDismissal`:
- For ministers: generate a replacement `ActiveEvent` with `source: "cabinet-appointment"` and `cabinetPortfolio: positionId`, populated with remaining candidates from the pool. If pool exhausted, use `characterPoolGenerator` to produce a lower-competence fallback candidate.
- For diplomats/directors/military: setting `vacantSinceDay` is sufficient — existing per-system vacancy processing in each engine's `process*` function will pick it up next turn.
- Add `lifecycleExit: { characterName, exitReason: "fired" }` to `DismissalResult` so the caller can feed it into the lifecycle career mobility pipeline.

- [ ] **Step 7: Run tests to verify they pass**

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/dismissalEngine.ts client/src/lib/dismissalEngine.test.ts
git commit -m "feat: dismissal engine — all 5 system paths with vacancy escalation"
```

### Task 3: Dismissal Engine — Faction and Godfather Reactions

**Files:**
- Modify: `client/src/lib/dismissalEngine.ts`
- Modify: `client/src/lib/dismissalEngine.test.ts`

- [ ] **Step 1: Write failing tests for faction penalty and godfather escalation**

```typescript
describe("faction reaction", () => {
  it("reduces faction relationship by 5 when dismissed character has a faction", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Test Minister" },
      characters: { "Test Minister": { faction: "Northern Caucus", loyalty: 60 } },
      factions: { "Northern Caucus": { relationship: 50 } },
    });
    const result = processDismissal(state, "minister", "finance");
    expect(result.updatedState.factions!["Northern Caucus"].relationship).toBe(45);
  });
});

describe("godfather escalation", () => {
  it("increases godfather escalation by 1 when they have interest in the dismissed position", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Test Minister" },
      patronage: {
        godfathers: [{
          id: "gf-1", name: "Test Godfather", escalationStage: 1,
          stable: { cabinetCandidates: ["Finance"], governors: [], legislativeBloc: { house: 0, senate: 0 }, connections: [] },
        }],
      },
    });
    const result = processDismissal(state, "minister", "finance");
    const gf = result.updatedState.patronage!.godfathers.find(g => g.id === "gf-1");
    expect(gf!.escalationStage).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement faction penalty and godfather check**

In `processDismissal`, after generating base consequences:
1. Look up dismissed character in `state.characters` → get `faction`
2. If faction exists, reduce `factions[faction].relationship` by 5
3. **Mechanical escalation only:** Iterate `state.patronage.godfathers` → check if any godfather's `stable.cabinetCandidates` (or `militaryInterests`/`diplomaticInterests`/`directorInterests` once those exist) contains the position. If match found and godfather `escalationStage > 0`, increment `escalationStage` by 1 (cap at 4). This is purely mechanical state change — no events generated here.

**Note:** The narrative event generation (the "demands consultation" pressure event) is handled separately by `checkGodfatherDismissal()` in Chunk 2 Task 8, which is called FROM `processDismissal` after this step. Task 3 does the silent escalation; Chunk 2 Task 8 adds the player-facing event. They don't duplicate — they complement. Task 3 changes numbers, Task 8 generates narrative.

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (existing + new)

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/dismissalEngine.ts client/src/lib/dismissalEngine.test.ts
git commit -m "feat: dismissal engine — faction and godfather reactions"
```

### Task 4: Dismissal Preview Function

**Files:**
- Modify: `client/src/lib/dismissalEngine.ts`
- Modify: `client/src/lib/dismissalEngine.test.ts`

- [ ] **Step 1: Write failing tests for computeDismissalPreview**

```typescript
describe("computeDismissalPreview", () => {
  it("returns approval and stability costs for minister dismissal", () => {
    const state = makeMockState({ cabinetAppointments: { finance: "Test" } });
    const preview = computeDismissalPreview(state, "minister", "finance");
    expect(preview.approvalCost).toBe(-3);
    expect(preview.stabilityCost).toBe(-2);
  });

  it("lists affected factions", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Test" },
      characters: { "Test": { faction: "Northern Caucus" } },
    });
    const preview = computeDismissalPreview(state, "minister", "finance");
    expect(preview.affectedFactions).toContain("Northern Caucus");
  });

  it("lists interested godfathers", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Test" },
      patronage: { godfathers: [{ id: "gf-1", name: "Big Man", stable: { cabinetCandidates: ["Finance"] } }] },
    });
    const preview = computeDismissalPreview(state, "minister", "finance");
    expect(preview.interestedGodfathers).toContain("Big Man");
  });

  it("reports whether replacement pool has candidates", () => {
    const preview = computeDismissalPreview(makeMockState({ cabinetAppointments: { finance: "Test" } }), "minister", "finance");
    expect(typeof preview.replacementPoolAvailable).toBe("boolean");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement computeDismissalPreview()**

Pure read-only function (no state mutations). Returns:
```typescript
interface DismissalPreview {
  characterName: string;
  positionTitle: string;
  approvalCost: number;
  stabilityCost: number;
  affectedFactions: string[];
  interestedGodfathers: string[];
  replacementPoolAvailable: boolean;
}
```

This is what the confirmation UI will consume. It reads the same data `processDismissal` uses but produces a preview instead of executing.

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/dismissalEngine.ts client/src/lib/dismissalEngine.test.ts
git commit -m "feat: dismissal preview for confirmation UI"
```

### Task 5: Wire Dismissal into GameContext Reducer

**Files:**
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Add DISMISS_OFFICIAL reducer action**

In the `GameAction` type union (around line 1270), add:
```typescript
| { type: "DISMISS_OFFICIAL"; systemType: DismissableSystem; positionId: string; reason?: string }
```

In the reducer switch, add a case that calls `processDismissal(state, action.systemType, action.positionId, action.reason)` and applies the result using `withDerivedState`.

- [ ] **Step 2: Deprecate DISMISS_MINISTER**

Change the existing `DISMISS_MINISTER` case to internally delegate to the new engine:
```typescript
case "DISMISS_MINISTER": {
  // Deprecated — delegates to unified dismissal engine
  const portfolio = Object.entries(state.cabinetAppointments).find(([, n]) => n === action.name)?.[0];
  if (!portfolio) return state;
  return reducer(state, { type: "DISMISS_OFFICIAL", systemType: "minister", positionId: portfolio });
}
```

- [ ] **Step 3: Add dismissMinister context function update**

Update the context `dismissMinister` function to use `DISMISS_OFFICIAL`:
```typescript
dismissMinister: (name) => {
  const portfolio = Object.entries(state.cabinetAppointments).find(([, n]) => n === name)?.[0];
  if (portfolio) dispatch({ type: "DISMISS_OFFICIAL", systemType: "minister", positionId: portfolio });
},
```

Also add a new generic `dismissOfficial` context function:
```typescript
dismissOfficial: (systemType, positionId, reason?) => dispatch({ type: "DISMISS_OFFICIAL", systemType, positionId, reason }),
```

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/GameContext.tsx
git commit -m "feat: wire DISMISS_OFFICIAL into reducer, deprecate DISMISS_MINISTER"
```

---

## Chunk 2: Godfather ↔ New Systems Bridge

### Task 6: Extend GodfatherStable and BusinessOligarch Types

**Files:**
- Modify: `client/src/lib/godfatherTypes.ts`
- Modify: `client/src/lib/businessOligarchTypes.ts`

- [ ] **Step 1: Add 5 optional fields to GodfatherStable**

In `godfatherTypes.ts`, add to the `GodfatherStable` interface:
```typescript
militaryInterests?: string[];
diplomaticInterests?: string[];
directorInterests?: string[];
traditionalRulerAllies?: string[];
religiousLeaderAllies?: string[];
```

- [ ] **Step 2: Add matching fields to BusinessOligarchCandidate.stableTemplate**

In `businessOligarchTypes.ts`, add the same 5 optional fields to the `stableTemplate` type inside `BusinessOligarchCandidate`.

- [ ] **Step 3: Run full test suite to ensure no regressions**

Run: `npx vitest run`
Expected: All pass (optional fields don't break anything)

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/godfatherTypes.ts client/src/lib/businessOligarchTypes.ts
git commit -m "feat: extend GodfatherStable with military/diplomat/director/ruler/religious interests"
```

### Task 7: Populate Godfather Interest Data

**Files:**
- Modify: `client/src/lib/godfatherProfiles.ts`
- Modify: `client/src/lib/businessOligarchEngine.ts`

- [ ] **Step 1: Add interests to 19 hardcoded godfathers**

In `godfatherProfiles.ts`, populate the new fields on each godfather's `stable` based on their archetype (see spec Section 2 interest seeding table). Example:

Military elder godfathers → `militaryInterests: ["chief-defence-force", "chief-army-force"]`
Northern business → `diplomaticInterests: ["amb-saudi", "amb-uae"]`, `traditionalRulerAllies: ["sultan-sokoto"]`

Only assign interests that make narrative sense for each character — not every godfather needs every field.

- [ ] **Step 2: Add interest derivation to business oligarch seeding**

In `businessOligarchEngine.ts`, in the function that converts `BusinessOligarchCandidate` into a `Godfather`, derive interests from `sector` and `zone`:

```typescript
// Example derivation rules:
if (candidate.sector === "oil-gas" && ["NW", "NE"].includes(candidate.zone)) {
  stable.diplomaticInterests = ["amb-saudi", "amb-uae"];
  stable.directorInterests = ["nnpc-gmd"];
}
if (candidate.sector === "banking-finance") {
  stable.directorInterests = ["cbn-governor"];
}
// Map zone to paramount ruler for traditionalRulerAllies
const zoneParamountMap: Record<string, string> = {
  NW: "sultan-sokoto", SW: "ooni-ife", SE: "obi-onitsha", SS: "oba-benin",
  // etc. — use actual IDs from traditionalRulerTypes.ts
};
if (zoneParamountMap[candidate.zone]) {
  stable.traditionalRulerAllies = [zoneParamountMap[candidate.zone]];
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/godfatherProfiles.ts client/src/lib/businessOligarchEngine.ts
git commit -m "feat: populate godfather interest data for all 39 godfathers"
```

### Task 8: Godfather Appointment Watch and Dismissal Reaction

**Files:**
- Modify: `client/src/lib/godfatherEngine.ts`
- Modify: `client/src/lib/godfatherEngine.test.ts`

- [ ] **Step 1: Write failing tests for appointment watch**

```typescript
describe("godfather appointment watch", () => {
  it("reduces favour debt when appointee matches godfather zone preference", () => { /* ... */ });
  it("increases escalation when appointee conflicts with godfather interest", () => { /* ... */ });
  it("does nothing for positions no godfather cares about", () => { /* ... */ });
});
```

- [ ] **Step 2: Write failing tests for dismissal reaction**

```typescript
describe("godfather dismissal reaction", () => {
  it("generates pressure event when dismissed position matches godfather interest", () => { /* ... */ });
  it("does not react when godfather relationship is Supportive", () => { /* ... */ });
  it("offers Consult and Ignore choices", () => { /* ... */ });
});
```

- [ ] **Step 3: Run tests to verify they fail**

- [ ] **Step 4: Implement checkGodfatherAppointment() and checkGodfatherDismissal()**

Two new exported functions in `godfatherEngine.ts`:

`checkGodfatherAppointment(state, positionId, appointeeZone)` — iterates godfathers, checks if any has interest in `positionId`. If match: compare appointee zone to godfather zone. Match → reduce favourDebt by 1. Mismatch + active escalation → escalation +1.

`checkGodfatherDismissal(state, positionId)` — iterates godfathers, checks interest. If match + relationship ≤ Neutral → returns an ActiveEvent with Consult/Ignore choices. **Note:** This function is deterministic (no RNG needed) — it always fires when conditions are met, unlike probability-based event generators.

Both return partial state updates + events.

- [ ] **Step 5: Run tests to verify they pass**

- [ ] **Step 6: Wire dismissal reaction into dismissalEngine.ts**

In `processDismissal`, after generating base consequences and mechanical escalation (Task 3), call `checkGodfatherDismissal(state, positionId)` and merge the returned events into the result.

- [ ] **Step 7: Wire appointment watch into GameContext.tsx reducer**

In the existing reducer cases that handle appointments (`APPOINT_MINISTER`, `SELECT_CANDIDATE`, `CONFIRM_APPOINTMENT`, or equivalent), call `checkGodfatherAppointment(state, positionId, appointeeZone)` and apply the returned state changes (favour debt reduction or escalation increase). This ensures godfather interest is checked on every appointment, not just dismissals.

- [ ] **Step 8: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/godfatherEngine.ts client/src/lib/godfatherEngine.test.ts client/src/lib/dismissalEngine.ts
git commit -m "feat: godfather appointment watch and dismissal reaction"
```

### Task 9: Interim Ally Amplification

**Files:**
- Modify: `client/src/lib/godfatherEngine.ts`
- Modify: `client/src/lib/godfatherEngine.test.ts`

- [ ] **Step 1: Write failing tests for ally amplification**

```typescript
describe("ally amplification (interim)", () => {
  it("generates sympathy event from traditionalRulerAlly when godfather at stage 3+", () => { /* ... */ });
  it("does not trigger below stage 3", () => { /* ... */ });
  it("fires at 40% probability per ally", () => {
    // Run 500 seeds, count how many fire. Expect roughly 150-250 (40% ± variance)
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement processAllyAmplification()**

In `godfatherEngine.ts`, add `processAllyAmplification(state, rng)`:
- Iterate godfathers with `escalationStage >= 3`
- For each, iterate `stable.traditionalRulerAllies` and `stable.religiousLeaderAllies`
- 40% chance per ally: generate sympathy event (headline + inbox message from the ally)
- Mark this function with a comment: `// INTERIM: replaced by affinityRegistry coalition pressure in Item 5`

- [ ] **Step 4: Wire into processGodfatherTurn**

Call `processAllyAmplification` at the end of `processGodfatherTurn` and merge results.

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/godfatherEngine.ts client/src/lib/godfatherEngine.test.ts
git commit -m "feat: interim godfather ally amplification via stable arrays"
```

---

## Chunk 3: Traditional Ruler / Religious Leader Activation

### Task 10: Traditional Ruler — Royal Audience System

**Files:**
- Modify: `client/src/lib/traditionalRulerEngine.ts`
- Modify: `client/src/lib/traditionalRulerEngine.test.ts`

- [ ] **Step 1: Write failing tests for audience requests**

```typescript
describe("royal audience system", () => {
  it("generates audience events for paramount rulers at ~5% per turn", () => {
    // Run 1000 seeds, expect paramount audience events in ~40-60 of them
  });
  it("generates audience events for first-class rulers at ~2% per turn", () => { /* ... */ });
  it("does not generate audience events for second-class rulers", () => { /* ... */ });
  it("audience event has Grant/Proxy/Decline choices", () => { /* ... */ });
  it("audience context reflects zone crisis when zone stability < 40", () => { /* ... */ });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement generateAudienceEvents()**

New function in `traditionalRulerEngine.ts`:
- Iterate filled traditional ruler positions
- Check tier: paramount (influenceWeight >= 0.9) at 5%, first-class (>= 0.6) at 2%, skip second-class
- Generate event with 3 choices using existing `ActiveEvent` pattern
- Context generation: check `state.stability`, zone sector health to determine topic (security, agriculture, development, cultural)

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/traditionalRulerEngine.ts client/src/lib/traditionalRulerEngine.test.ts
git commit -m "feat: traditional ruler royal audience system"
```

### Task 11: Traditional Ruler — State Visits and Public Statements

**Files:**
- Modify: `client/src/lib/traditionalRulerEngine.ts`
- Modify: `client/src/lib/traditionalRulerEngine.test.ts`
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Write failing tests for state visit effects**

```typescript
describe("state visits", () => {
  it("returns +12 relationship, +3 approval, -2 political capital", () => { /* ... */ });
  it("adds +2 stability when zone stability is below 50", () => { /* ... */ });
  it("generates endorsement when ruler relationship > 70", () => { /* ... */ });
  it("respects 14-day cooldown per ruler", () => { /* ... */ });
});
```

- [ ] **Step 2: Write failing tests for public statement cycle**

```typescript
describe("public statement cycle", () => {
  it("generates endorsement for rulers with relationship > 75 at ~3%", () => { /* ... */ });
  it("generates criticism for rulers with relationship < 25 at ~5%", () => { /* ... */ });
  it("endorsement boosts approval in ruler's zone", () => { /* ... */ });
  it("criticism reduces approval and stability", () => { /* ... */ });
});
```

- [ ] **Step 3: Run tests to verify they fail**

- [ ] **Step 4: Implement processStateVisit() and generatePublicStatements()**

`processStateVisit(state, rulerId)`: Pure function returning consequences + events. Checks cooldown via `lastStateVisitDay` on the ruler's appointment record. Returns relationship, approval, stability, and political capital effects.

`generatePublicStatements(state, rng)`: Iterate paramount + first-class rulers. Check relationship thresholds. Generate endorsement or criticism events with headlines.

- [ ] **Step 5: Add INITIATE_STATE_VISIT reducer action to GameContext.tsx**

```typescript
case "INITIATE_STATE_VISIT": {
  const result = processStateVisit(state, action.rulerId);
  // Apply result...
}
```

- [ ] **Step 6: Wire generatePublicStatements into processTraditionalRulers**

Call it alongside existing `processTraditionalRulerEvents` and merge results.

- [ ] **Step 7: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/traditionalRulerEngine.ts client/src/lib/traditionalRulerEngine.test.ts client/src/lib/GameContext.tsx
git commit -m "feat: traditional ruler state visits and public statement cycle"
```

### Task 12: Religious Leader — Festival Events and Interfaith Summit

**Files:**
- Modify: `client/src/lib/religiousLeaderEngine.ts`
- Modify: `client/src/lib/religiousLeaderEngine.test.ts`
- Modify: `client/src/lib/religiousLeaderTypes.ts`
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Write failing tests for festival events**

```typescript
describe("festival events", () => {
  it("generates a religious observance event every 90 days", () => { /* ... */ });
  it("alternates between Christian and Muslim observances", () => { /* ... */ });
  it("attend choice gives +10 relationship, +3 approval, -1 PC", () => { /* ... */ });
  it("send message choice gives +4 relationship, +1 approval", () => { /* ... */ });
  it("no acknowledgment gives -8 relationship, -2 approval", () => { /* ... */ });
});
```

- [ ] **Step 2: Write failing tests for interfaith summit**

```typescript
describe("interfaith summit", () => {
  it("raises harmony by 10 when both leaders have relationship > 50", () => { /* ... */ });
  it("drops harmony by 5 when one leader has relationship < 30", () => { /* ... */ });
  it("is a disaster when both leaders have relationship < 30", () => { /* ... */ });
  it("respects 60-day cooldown", () => { /* ... */ });
});
```

- [ ] **Step 3: Run tests to verify they fail**

- [ ] **Step 4: Implement generateFestivalEvents() and processInterfaithSummit()**

`generateFestivalEvents(state)`: Check `state.day % 90 === 0`. Alternate Christian/Muslim based on `(state.day / 90) % 2`. Generate event with 3 choices.

`processInterfaithSummit(state)`: Check cooldown via `lastSummitDay` on `ReligiousLeaderSystemState`. Read both leaders' relationship scores. Return consequences based on the 3 outcome tiers.

Add `lastSummitDay` field to `ReligiousLeaderSystemState` in `religiousLeaderTypes.ts`.

- [ ] **Step 5: Add INITIATE_INTERFAITH_SUMMIT reducer action to GameContext.tsx**

- [ ] **Step 6: Wire festival events into processReligiousLeaders**

- [ ] **Step 7: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/religiousLeaderEngine.ts client/src/lib/religiousLeaderEngine.test.ts client/src/lib/religiousLeaderTypes.ts client/src/lib/GameContext.tsx
git commit -m "feat: religious leader festivals and interfaith summit"
```

### Task 13: Religious Leader — Policy Reaction System

**Files:**
- Modify: `client/src/lib/religiousLeaderEngine.ts`
- Modify: `client/src/lib/religiousLeaderEngine.test.ts`

- [ ] **Step 1: Write failing tests for policy reactions**

```typescript
describe("policy reactions", () => {
  it("religious leader reacts to education policy changes", () => { /* ... */ });
  it("generates +5 relationship shift for aligned policy", () => { /* ... */ });
  it("generates -5 relationship shift for opposed policy", () => { /* ... */ });
  it("generates headline when reaction is strongly negative", () => { /* ... */ });
  it("both leaders react to cross-faith policies like education curriculum", () => { /* ... */ });
  it("only affected leader reacts to faith-specific policies", () => { /* ... */ });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement generatePolicyReactions()**

`generatePolicyReactions(state, policyChange)`: Check if policy touches religious sensitivity categories (education, land use, social welfare, security in religious zones). Generate inbox message from affected leader with relationship shift. If relationship shift is ≤ −5, also generate a headline.

Define `RELIGIOUS_SENSITIVITY_MAP` mapping policy categories to which leaders care and their likely sentiment.

- [ ] **Step 4: Wire into processReligiousLeaders**

Call `generatePolicyReactions` when policy lever changes are detected (compare current vs. previous policy state).

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/religiousLeaderEngine.ts client/src/lib/religiousLeaderEngine.test.ts
git commit -m "feat: religious leader policy reaction system"
```

---

## Chunk 4: Cabinet Appointment Engine Depth

### Task 14: Ministerial Effectiveness Multiplier

**Files:**
- Modify: `client/src/lib/cabinetSystem.ts`
- Modify: `client/src/lib/cabinetSystem.test.ts`
- Modify: `client/src/lib/sectorTurnProcessor.ts`

- [ ] **Step 1: Write failing tests for computeMinisterialEffectiveness**

```typescript
describe("computeMinisterialEffectiveness", () => {
  it("returns 1.15 for cluster with average competence > 80", () => { /* ... */ });
  it("returns 1.0 for cluster with average competence 60-79", () => { /* ... */ });
  it("returns 0.85 for cluster with average competence 40-59", () => { /* ... */ });
  it("returns 0.70 for cluster with average competence < 40", () => { /* ... */ });
  it("returns 0.70 for cluster with vacant portfolio", () => { /* ... */ });
  it("returns multiplier per cluster keyed by sector name", () => { /* ... */ });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement computeMinisterialEffectiveness()**

In `cabinetSystem.ts`:
- Define `CLUSTER_SECTOR_MAP` linking each cluster to its governance sectors
- For each cluster, gather filled ministers, compute average competence from `state.characters[ministerName].competencies`
- Apply band thresholds → return `Record<string, number>` mapping sector names to multipliers
- For Security & Justice cluster: return a special `"stability"` key (not a governance sector)

- [ ] **Step 4: Wire multiplier into sectorTurnProcessor.ts**

In `processSectorTurns()`, after computing the base health delta for each sector, multiply by the ministerial effectiveness for that sector. Import `computeMinisterialEffectiveness` from `cabinetSystem.ts`.

For the `"stability"` key from Security & Justice cluster: apply in `gameEngine.ts` during the drift calculation step as a ±0.5 modifier.

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All pass (sector tests may need adjustment for the new multiplier)

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/cabinetSystem.ts client/src/lib/cabinetSystem.test.ts client/src/lib/sectorTurnProcessor.ts
git commit -m "feat: minister competence affects sector health via effectiveness multiplier"
```

### Task 15: Minister Initiative, Sabotage, and Clash Events

**Files:**
- Modify: `client/src/lib/cabinetSystem.ts`
- Modify: `client/src/lib/cabinetSystem.test.ts`
- Modify: `client/src/lib/gameEngine.ts`

- [ ] **Step 1: Write failing tests for initiative events**

```typescript
describe("minister initiative events", () => {
  it("generates initiative when minister competence > 80 at ~3% rate", () => { /* ... */ });
  it("event has Approve/Defer/Reject choices", () => { /* ... */ });
  it("does not generate for ministers with competence <= 80", () => { /* ... */ });
});
```

- [ ] **Step 2: Write failing tests for sabotage events (all 4 choices)**

```typescript
describe("minister sabotage events", () => {
  it("generates sabotage warning when minister loyalty < 40 at ~2% rate", () => { /* ... */ });
  it("does not generate for ministers with loyalty >= 40", () => { /* ... */ });
  it("event has exactly 4 choices: Confront, Probation, Dismiss, Monitor", () => {
    // Verify event.choices has 4 entries with correct labels
  });
  it("Confront choice has 50/50 loyalty +10/-10 outcome based on integrity", () => { /* ... */ });
  it("Probation choice uses existing probation mechanic", () => { /* ... */ });
  it("Dismiss choice triggers dismissal engine with systemType 'minister'", () => { /* ... */ });
  it("Monitor choice generates DNI follow-up event scheduled 14 days later", () => { /* ... */ });
});
```

- [ ] **Step 3: Write failing tests for clash events**

```typescript
describe("minister clash events", () => {
  it("generates clash when two ministers in same cluster have loyalty diff > 30", () => { /* ... */ });
  it("event has Mediate/Back/Ignore choices", () => { /* ... */ });
});
```

- [ ] **Step 4: Run tests to verify they fail**

- [ ] **Step 5: Implement generateMinisterEvents(state, rng)**

Single function that checks all 3 event types:
1. Iterate ministers → competence > 80 → 3% chance → initiative event
2. Iterate ministers → loyalty < 40 → 2% chance → sabotage event
3. Iterate cluster pairs → loyalty diff > 30 → 2% chance → clash event

Returns `{ events: ActiveEvent[], inboxMessages: GameInboxMessage[] }`.

- [ ] **Step 6: Wire into gameEngine.ts processTurn pipeline**

Call `generateMinisterEvents(state, rng)` in the turn pipeline after director processing, before union leader pressure. Merge events and inbox messages into the turn result.

- [ ] **Step 7: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/cabinetSystem.ts client/src/lib/cabinetSystem.test.ts client/src/lib/gameEngine.ts
git commit -m "feat: minister initiative, sabotage, and clash events"
```

---

## Chunk 5: Inter-NPC Relationships (Affinity Registry)

### Task 16: Affinity Registry — Types and Implicit Affinities

**Files:**
- Create: `client/src/lib/affinityRegistry.ts`
- Create: `client/src/lib/affinityRegistry.test.ts`
- Modify: `client/src/lib/gameTypes.ts`

- [ ] **Step 1: Write failing tests for computeAffinity**

```typescript
describe("computeAffinity", () => {
  it("returns +5 for same zone", () => { /* ... */ });
  it("returns +7 for same faction", () => { /* ... */ });
  it("returns +3 for same religion", () => { /* ... */ });
  it("returns +6 for same ethnicity", () => { /* ... */ });
  it("returns +3 for same gender", () => { /* ... */ });
  it("stacks bonuses for multiple shared attributes", () => { /* ... */ });
  it("returns 0 for characters with nothing in common", () => { /* ... */ });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement NPCLink type, computeAffinity()**

In `affinityRegistry.ts`:
- Export `NPCLink` interface
- Export `computeAffinity(charA, charB)` — reads zone, faction, religion, ethnicity, gender attributes and sums matching bonuses

In `gameTypes.ts`:
- Add `npcLinks: NPCLink[]` to the `GameState` interface

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/affinityRegistry.ts client/src/lib/affinityRegistry.test.ts client/src/lib/gameTypes.ts
git commit -m "feat: affinity registry with NPCLink type and implicit affinity computation"
```

### Task 17: Appointment Ripple

**Files:**
- Modify: `client/src/lib/affinityRegistry.ts`
- Modify: `client/src/lib/affinityRegistry.test.ts`

- [ ] **Step 1: Write failing tests for appointment ripple**

```typescript
describe("processAppointmentRipple", () => {
  it("mentor of appointee gets +5 relationship", () => { /* ... */ });
  it("mentor of dismissed gets -8 relationship", () => { /* ... */ });
  it("rival of appointee gets -3 relationship", () => { /* ... */ });
  it("rival of dismissed gets +3 relationship", () => { /* ... */ });
  it("ally follows softer +3/-5 pattern", () => { /* ... */ });
  it("kinship follows +2/-3 pattern", () => { /* ... */ });
  it("female high-prestige appointment generates +1 approval consequence", () => { /* ... */ });
  it("does nothing when no links exist for the character", () => { /* ... */ });
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement processAppointmentRipple()**

```typescript
export function processAppointmentRipple(
  state: GameState,
  characterName: string,
  action: "appointed" | "dismissed",
  isHighPrestige: boolean,
  characterGender?: string,
): AppointmentRippleResult
```

Scan `state.npcLinks` for entries referencing `characterName`. Apply relationship shifts based on link type and action. If female + high prestige + appointed → add batched approval +1 consequence.

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Wire into dismissalEngine.ts**

In `processDismissal`, call `processAppointmentRipple(state, characterName, "dismissed", isHighPrestige, gender)` and merge results.

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/affinityRegistry.ts client/src/lib/affinityRegistry.test.ts client/src/lib/dismissalEngine.ts
git commit -m "feat: appointment ripple — NPC relationship cascades on hire/fire"
```

### Task 18: Coalition Pressure and Rivalry Eruptions

**Files:**
- Modify: `client/src/lib/affinityRegistry.ts`
- Modify: `client/src/lib/affinityRegistry.test.ts`
- Modify: `client/src/lib/godfatherEngine.ts`
- Modify: `client/src/lib/gameEngine.ts`

- [ ] **Step 1: Write failing tests for coalition pressure**

```typescript
describe("coalition pressure", () => {
  it("generates sympathy event from linked ally when godfather at stage 3+", () => { /* ... */ });
  it("probability scales with link strength: 40%/25%/10%", () => { /* ... */ });
  it("does not fire below godfather stage 3", () => { /* ... */ });
});
```

- [ ] **Step 2: Write failing tests for rivalry eruptions**

```typescript
describe("rivalry eruptions", () => {
  it("generates conflict event from rival links at ~2% per turn", () => { /* ... */ });
  it("event has Support-A/Support-B/Neutral choices", () => { /* ... */ });
  it("does not generate for non-rival link types", () => { /* ... */ });
});
```

- [ ] **Step 3: Write failing test for gender-traditionalist friction**

```typescript
describe("gender-traditionalist friction", () => {
  it("generates negative reaction when woman holds high-prestige position and ruler has low integrity", () => { /* ... */ });
  it("event has Rebuke/Engage/Ignore choices", () => { /* ... */ });
});
```

- [ ] **Step 4: Run tests to verify they fail**

- [ ] **Step 5: Implement processCoalitionPressure(), processRivalryEruptions(), processGenderFriction()**

Three functions in `affinityRegistry.ts`:

`processCoalitionPressure(state, rng)` — Iterate godfathers at stage 3+, find their links in `state.npcLinks`, fire sympathy events at strength-weighted probability.

`processRivalryEruptions(state, rng)` — Iterate `state.npcLinks` where `type === "rival"`, 2% chance per link, generate cross-system conflict events.

`processGenderFriction(state, rng)` — Find women in high-prestige positions (military, key bilateral diplomats, top directors). For each, check traditional rulers / religious leaders with integrity < 50. 4% chance → generate reaction event with Rebuke/Engage/Ignore choices.

- [ ] **Step 6: Replace interim ally amplification in godfatherEngine.ts**

Remove `processAllyAmplification()` from `godfatherEngine.ts`. In its place, add a comment: `// Ally amplification now handled by affinityRegistry.processCoalitionPressure()`.

- [ ] **Step 7: Wire into gameEngine.ts processTurn pipeline**

After the existing traditional ruler and religious leader processing, call:
```typescript
const coalitionResult = processCoalitionPressure(next, rng);
const rivalryResult = processRivalryEruptions(next, rng);
const genderResult = processGenderFriction(next, rng);
```
Merge all events, consequences, inbox messages into the turn result.

- [ ] **Step 8: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 9: Commit**

```bash
git add client/src/lib/affinityRegistry.ts client/src/lib/affinityRegistry.test.ts client/src/lib/godfatherEngine.ts client/src/lib/gameEngine.ts
git commit -m "feat: coalition pressure, rivalry eruptions, and gender friction"
```

### Task 19: NPC Link Seeding and Lifecycle Cleanup

**Files:**
- Modify: `client/src/lib/affinityRegistry.ts`
- Modify: `client/src/lib/affinityRegistry.test.ts`
- Modify: `client/src/lib/GameContext.tsx`
- Modify: `client/src/lib/lifecycleEngine.ts`

- [ ] **Step 1: Write failing tests for link seeding**

```typescript
describe("seedNPCLinks", () => {
  it("generates 60-80 links from godfathers, traditional rulers, oligarchs", () => { /* ... */ });
  it("creates mentor links from godfather-to-candidate relationships", () => { /* ... */ });
  it("creates rival links between same-sector oligarchs", () => { /* ... */ });
  it("creates links from godfather traditionalRulerAllies", () => { /* ... */ });
});
```

- [ ] **Step 2: Write failing tests for link cleanup**

```typescript
describe("cleanupNPCLinks", () => {
  it("removes links referencing a dead character", () => { /* ... */ });
  it("retains links for characters who transition careers", () => { /* ... */ });
  it("updates systemA/systemB when character changes system", () => { /* ... */ });
});
```

- [ ] **Step 3: Run tests to verify they fail**

- [ ] **Step 4: Implement seedNPCLinks(state) and cleanupNPCLinks(state, exitingCharacter, exitReason)**

`seedNPCLinks(state)`:
- Iterate godfathers → for each `traditionalRulerAllies`/`religiousLeaderAllies` entry, create a `patron-client` link
- Iterate godfathers → for each `militaryInterests`/`directorInterests` entry, check if current holder is from same zone → create `ally` link
- Iterate business oligarchs → find pairs in same `sector` with different zones → create `rival` links (cap at 15)
- Add hardcoded kinship links derived from character pool descriptions. Scan `handcraftedCharacters.ts` candidates and `godfatherProfiles.ts` for family/kinship references (e.g. "brother-in-law to", "daughter of", "married into"). Generate `kinship` links from these narrative connections. If fewer than 5 are found, supplement with zone-matched cross-system pairs (e.g. a minister and traditional ruler from the same state).

`cleanupNPCLinks(state, charName, exitReason)`:
- If exitReason is `"death"` or `"retirement-age"` with no career transition: filter out all links referencing `charName`
- If career transition: update `systemA`/`systemB` on matching links

- [ ] **Step 5: Wire seedNPCLinks into GameContext.tsx game start**

In the game initialization section (where `seedMilitarySystem`, `seedTraditionalRulers`, etc. are called), add:
```typescript
const npcLinks = seedNPCLinks(initialState);
// Add to initial state: npcLinks
```

- [ ] **Step 6: Wire cleanupNPCLinks into lifecycleEngine.ts**

In the lifecycle exit processing, after generating departure events, call `cleanupNPCLinks` and merge the filtered links into the returned state.

- [ ] **Step 7: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/affinityRegistry.ts client/src/lib/affinityRegistry.test.ts client/src/lib/GameContext.tsx client/src/lib/lifecycleEngine.ts
git commit -m "feat: NPC link seeding at game start and lifecycle cleanup"
```

### Task 20: Final Integration Test

**Files:**
- No new files — validation pass

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All 1335+ existing tests pass + ~110 new tests pass

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Spot-check cross-system interactions**

Manually verify in tests:
- Dismissing a minister → godfather reacts → ally amplification fires
- Appointing a female military chief → gender friction event + approval boost
- Traditional ruler audience + state visit → endorsement cycle

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: NPC systems depth — all 5 items complete

- Unified dismissal engine across 5 system types
- Godfather bridge to military/diplomat/director/ruler/religious systems
- Traditional ruler audiences, state visits, public statements
- Religious leader festivals, interfaith summits, policy reactions
- Cabinet minister competence → sector effectiveness multiplier
- Minister initiative, sabotage, and clash events
- Inter-NPC affinity tags, appointment ripple, coalition pressure
- Rivalry eruptions and gender-traditionalist friction
- NPC link seeding and lifecycle cleanup

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```
