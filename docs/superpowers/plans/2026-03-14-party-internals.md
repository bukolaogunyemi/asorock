# Party Internals Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full party ecosystem: 8-member NWCs for all 8 parties, 2 main opposition parties with distinct strategies, aggregate bloc defection mechanics, and a Year 3 party convention where the player fights for control of the ruling party machinery.

**Architecture:** A `partyEngine.ts` manages NWC dynamics, opposition strategy, defection risk assessment, and convention resolution. A `partyProfiles.ts` holds ~64 handcrafted NWC characters (8 per party × 8 parties). Defection operates on aggregate bloc segments (not per-legislator). The convention is a multi-round crisis event in Year 3. `PartyState.legislativeSeats` is the source of truth for seat counts.

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-14-party-internals-design.md`

**Depends on:** Sub-Project A (Legislative Engine) — for legislative seat tracking. Sub-Project B (Godfather System) — for godfather-backed NWC members and defection triggers.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `client/src/lib/partyTypes.ts` | Interfaces: `PartyState`, `NWCMember`, `NWCPosition`, `OppositionStrategy`, `DefectionState`, `AtRiskEntry`, `Defection`, `ConventionState`, `ConventionRace`, `PartyInternalsState` |
| `client/src/lib/partyProfiles.ts` | ~64 handcrafted NWC characters for 8 parties + party metadata |
| `client/src/lib/partyEngine.ts` | NWC dynamics, opposition strategy, defection processing, convention resolution |
| `client/src/lib/partyEngine.test.ts` | Unit tests |
| `client/src/lib/gameTypes.ts` | Modified: add `PartyInternalsState` to `GameState`, extend `GovernorState.party` to string |
| `client/src/lib/GameContext.tsx` | Modified: initialize party state |
| `client/src/lib/gameEngine.ts` | Modified: process party turn |
| `client/src/components/PoliticsTab.tsx` | Modified: add party internals panel |

---

## Chunk 1: Types, Profiles & Core Engine

### Task 1: Create Party Types

**Files:**
- Create: `client/src/lib/partyTypes.ts`

- [ ] **Step 1: Create the types file**

```typescript
// client/src/lib/partyTypes.ts
export type NWCPosition =
  | "national-chairman"
  | "vice-chairman"
  | "national-secretary"
  | "national-treasurer"
  | "publicity-secretary"
  | "organising-secretary"
  | "legal-adviser"
  | "youth-women-leader";

export type OppositionStrategy = "obstruct" | "negotiate" | "attack";

export interface NWCMember {
  characterId: string;
  name: string;
  position: NWCPosition;
  zone: string;
  state: string;
  competence: number;
  loyalty: number;
  disposition: "supportive" | "neutral" | "hostile";
  factionAlignment?: string;
  godfatherId?: string;
}

export interface PartyState {
  id: string;
  name: string;
  abbreviation: string;
  nwc: NWCMember[];
  legislativeSeats: { house: number; senate: number };
  isRulingParty: boolean;
  isMainOpposition: boolean;
  partyControlScore?: number;
  oppositionStrategy?: OppositionStrategy;
  strategyReassessmentDay?: number;
}

export interface AtRiskEntry {
  id: string;
  currentParty: string;
  zone: string;
  seatCount: number;
  seatType: "house" | "senate";
  partyLoyalty: number;
  defectionProbability: number;
}

export interface Defection {
  id: string;
  fromParty: string;
  toParty: string;
  day: number;
  trigger: "player-poaching" | "godfather-pull" | "party-crisis" | "election-cycle" | "opposition-poaching";
  zone: string;
  seatType: "house" | "senate" | "governor";
  seatCount: number;
  governorId?: string;
  description: string;
}

export interface DefectionState {
  atRiskLegislators: AtRiskEntry[];
  recentDefections: Defection[];
  poachingCooldown: Record<string, number>;
}

export interface ConventionRace {
  position: NWCPosition;
  candidates: { characterId: string; name: string; supportScore: number }[];
  playerBacked?: string;
  winner?: string;
}

export interface ConventionState {
  phase: "inactive" | "pre-convention" | "voting" | "post-convention";
  conventionDay: number;
  races: ConventionRace[];
  playerPCSpent: number;
}

export interface PartyInternalsState {
  parties: PartyState[];
  rulingPartyId: string;
  mainOppositionIds: string[];
  defections: DefectionState;
  convention: ConventionState;
  partyLoyaltyDrift: number;
}
```

- [ ] **Step 2: Extend GovernorState.party in gameTypes.ts**

Change `GovernorState.party` from a union type to `string` (party ID). Add helper:
```typescript
export function getPartyCategory(partyId: string): "ruling" | "opposition" | "minor" {
  // Implementation based on current game state
}
```

- [ ] **Step 3: Add PartyInternalsState to GameState**

```typescript
import type { PartyInternalsState } from "./partyTypes";
// In GameState: partyInternals: PartyInternalsState;
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/partyTypes.ts client/src/lib/gameTypes.ts
git commit -m "feat(party): add party types and extend GovernorState.party"
```

---

### Task 2: Create Party Profiles & NWC Characters

**Files:**
- Create: `client/src/lib/partyProfiles.ts`

- [ ] **Step 1: Write tests for party profiles**

```typescript
// client/src/lib/partyProfiles.test.ts
import { describe, expect, it } from "vitest";
import { PARTY_PROFILES, NWC_CHARACTERS } from "./partyProfiles";

describe("partyProfiles", () => {
  it("should define all 8 parties", () => {
    expect(PARTY_PROFILES.length).toBe(8);
  });

  it("each party should have 8 NWC members", () => {
    for (const party of PARTY_PROFILES) {
      const members = NWC_CHARACTERS.filter((c) => c.partyId === party.id);
      expect(members.length).toBe(8);
    }
  });

  it("each party NWC should cover all 6 zones", () => {
    for (const party of PARTY_PROFILES) {
      const members = NWC_CHARACTERS.filter((c) => c.partyId === party.id);
      const zones = new Set(members.map((m) => m.zone));
      expect(zones.size).toBe(6);
    }
  });

  it("each party NWC should have all 8 positions filled", () => {
    for (const party of PARTY_PROFILES) {
      const members = NWC_CHARACTERS.filter((c) => c.partyId === party.id);
      const positions = new Set(members.map((m) => m.position));
      expect(positions.size).toBe(8);
    }
  });

  it("should have unique character IDs", () => {
    const ids = NWC_CHARACTERS.map((c) => c.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("party abbreviations should match existing parties.ts", () => {
    const expected = ["ADU", "PFC", "NDM", "NSF", "TLA", "HDP", "PAP", "UPA"];
    const actual = PARTY_PROFILES.map((p) => p.abbreviation);
    expect(actual.sort()).toEqual(expected.sort());
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/partyProfiles.test.ts`
Expected: FAIL

- [ ] **Step 3: Create ~64 NWC characters across 8 parties**

Create `client/src/lib/partyProfiles.ts`:
- `PARTY_PROFILES` — 8 party definitions with id, name, abbreviation, initial seat counts
- `NWC_CHARACTERS` — 64 characters (8 per party), each with: characterId, partyId, name, position (NWCPosition), zone, state, competence (30-90), loyalty (30-90), disposition, optional factionAlignment and godfatherId
- Ensure zonal diversity: each party's 8 NWC members cover all 6 zones (some zones share a member for the 2 remaining positions)
- Match the 8 existing fictional parties from `parties.ts`: ADU, PFC, NDM, NSF, TLA, HDP, PAP, UPA

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/partyProfiles.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/partyProfiles.ts client/src/lib/partyProfiles.test.ts
git commit -m "feat(party): add 64 NWC character profiles across 8 parties"
```

---

### Task 3: Opposition Strategy Engine

**Files:**
- Create: `client/src/lib/partyEngine.ts`
- Create: `client/src/lib/partyEngine.test.ts`

- [ ] **Step 1: Write tests for opposition strategy**

```typescript
// client/src/lib/partyEngine.test.ts
import { describe, expect, it } from "vitest";
import { determineOppositionStrategy, reassessStrategy } from "./partyEngine";

describe("opposition strategy", () => {
  it("should choose 'attack' when player approval is low", () => {
    const strategy = determineOppositionStrategy({ approval: 25, stability: 50, economicHealth: 40 });
    expect(strategy).toBe("attack");
  });

  it("should choose 'negotiate' when player is strong", () => {
    const strategy = determineOppositionStrategy({ approval: 70, stability: 70, economicHealth: 60 });
    expect(strategy).toBe("negotiate");
  });

  it("should choose 'obstruct' when economic conditions are bad", () => {
    const strategy = determineOppositionStrategy({ approval: 45, stability: 40, economicHealth: 20 });
    expect(strategy).toBe("obstruct");
  });

  it("should reassess every 30 days", () => {
    const shouldReassess = reassessStrategy(100, 70); // current day, last reassessment day
    expect(shouldReassess).toBe(true);
  });

  it("should reassess immediately after major events", () => {
    const shouldReassess = reassessStrategy(75, 70, true); // major event flag
    expect(shouldReassess).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Create `client/src/lib/partyEngine.ts`:
- `determineOppositionStrategy(context)` — evaluates player approval, stability, economic health to pick obstruct/negotiate/attack
- `reassessStrategy(currentDay, lastReassessmentDay, majorEvent?)` — returns true if 30 days elapsed or major event occurred
- `applyOppositionEffects(state, strategy)` — applies strategy effects: "obstruct" delays bills, "attack" generates negative events, "negotiate" enables cross-party bills

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/partyEngine.ts client/src/lib/partyEngine.test.ts
git commit -m "feat(party): implement opposition strategy determination and reassessment"
```

---

### Task 4: Defection Mechanics

**Files:**
- Modify: `client/src/lib/partyEngine.ts`
- Modify: `client/src/lib/partyEngine.test.ts`

- [ ] **Step 1: Write tests for defection**

```typescript
describe("defection mechanics", () => {
  it("should identify at-risk blocs when party loyalty drops", () => {
    const atRisk = assessDefectionRisk("ADU", 30, "NC", 15, "house");
    expect(atRisk.defectionProbability).toBeGreaterThan(0);
  });

  it("should execute defection and update seat counts", () => {
    const parties = [
      { id: "ADU", legislativeSeats: { house: 145, senate: 56 } },
      { id: "PFC", legislativeSeats: { house: 120, senate: 22 } },
    ];
    const defection = { fromParty: "ADU", toParty: "PFC", seatType: "house" as const, seatCount: 5 };
    const result = executeDefection(parties as any[], defection as any);
    expect(result.find((p) => p.id === "ADU")!.legislativeSeats.house).toBe(140);
    expect(result.find((p) => p.id === "PFC")!.legislativeSeats.house).toBe(125);
  });

  it("poaching should cost political capital and have cooldown", () => {
    const result = initiatePoaching("ADU", "PFC", "NW", "house", 5, 100);
    expect(result.pcCost).toBeGreaterThan(0);
    expect(result.cooldownUntilDay).toBeGreaterThan(100);
  });

  it("should respect poaching cooldown", () => {
    const canPoach = checkPoachingCooldown({ "PFC-NW": 150 }, "PFC", "NW", 100);
    expect(canPoach).toBe(false); // cooldown not expired
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add to `partyEngine.ts`:
- `assessDefectionRisk(partyId, partyLoyalty, zone, seatCount, seatType)` — returns `AtRiskEntry` with defection probability based on loyalty level
- `processDefections(state, currentDay)` — checks all at-risk blocs, rolls for defections, updates seat counts
- `executeDefection(parties, defection)` — transfers seats between parties
- `initiatePoaching(fromParty, toParty, zone, seatType, seatCount, currentDay)` — player-initiated defection attempt, costs PC, has cooldown
- `checkPoachingCooldown(cooldowns, targetParty, zone, currentDay)` — checks if poaching is allowed

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/partyEngine.ts client/src/lib/partyEngine.test.ts
git commit -m "feat(party): implement aggregate bloc defection mechanics"
```

---

### Task 5: Convention System

**Files:**
- Modify: `client/src/lib/partyEngine.ts`
- Modify: `client/src/lib/partyEngine.test.ts`

- [ ] **Step 1: Write tests for convention**

```typescript
describe("convention", () => {
  it("should trigger pre-convention phase around day 730 (year 3)", () => {
    const phase = checkConventionTrigger(730);
    expect(phase).toBe("pre-convention");
  });

  it("should generate races for all 8 NWC positions", () => {
    const races = generateConventionRaces("ADU", nwcMembers);
    expect(races.length).toBe(8);
  });

  it("should resolve votes with weighted factors", () => {
    const result = resolveConventionVote({
      playerInfluence: 30, factionSupport: 25, godfatherBacking: 20,
      incumbentAdvantage: 15, candidateCompetence: 10,
    }, candidates);
    expect(result.winner).toBeDefined();
  });

  it("player-backed candidate should have advantage with high PC spent", () => {
    const withPC = resolveConventionVote({
      playerInfluence: 80, factionSupport: 40, godfatherBacking: 30,
      incumbentAdvantage: 0, candidateCompetence: 50,
    }, candidates);
    const withoutPC = resolveConventionVote({
      playerInfluence: 10, factionSupport: 40, godfatherBacking: 30,
      incumbentAdvantage: 0, candidateCompetence: 50,
    }, candidates);
    // Player influence should tilt toward backed candidate
    expect(withPC.winner).not.toEqual(withoutPC.winner);
  });
});
```

- [ ] **Step 2: Run tests, implement, verify pass**

Add to `partyEngine.ts`:
- `checkConventionTrigger(currentDay)` — returns convention phase based on day (pre-convention ~60 days before, voting on convention day, post-convention after)
- `generateConventionRaces(partyId, currentNWC)` — creates ConventionRace for each NWC position with 2-3 candidates each (incumbent + challengers)
- `resolveConventionVote(weights, candidates)` — weighted vote: player influence 30%, faction support 25%, godfather backing 20%, incumbent advantage 15%, candidate competence 10%
- `processConvention(state, currentDay)` — orchestrates convention phases, returns updated PartyInternalsState

Opposition party conventions are auto-resolved (no player interaction).

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/partyEngine.ts client/src/lib/partyEngine.test.ts
git commit -m "feat(party): implement convention system with weighted vote resolution"
```

---

## Chunk 2: Integration & UI

### Task 6: GameState Integration

**Files:**
- Modify: `client/src/lib/GameContext.tsx`
- Modify: `client/src/lib/gameEngine.ts`

- [ ] **Step 1: Initialize party state**

```typescript
import { defaultPartyInternalsState } from "./partyEngine";
// In initializeGameState: partyInternals: defaultPartyInternalsState(config.party),
```

- [ ] **Step 2: Process party turn**

In `processTurn()`: call `processPartyTurn(state)` to handle opposition strategy, defection checks, convention phases, party loyalty drift.

- [ ] **Step 3: Run all tests**

Run: `cd client && npx vitest run`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/GameContext.tsx client/src/lib/gameEngine.ts
git commit -m "feat(party): integrate party internals into game state and turn processing"
```

---

### Task 7: Party Internals UI in PoliticsTab

**Files:**
- Modify: `client/src/components/PoliticsTab.tsx`

- [ ] **Step 1: Add party internals panel**

Add to PoliticsTab:
1. **Ruling Party Panel** — NWC members grid (8 cards), party control score meter, defection warnings
2. **Opposition Panel** — 2 main opposition parties with strategy indicator (obstruct/negotiate/attack), seat counts, NWC leadership
3. **Defection Panel** — at-risk blocs list, poaching button with PC cost, recent defection history
4. **Convention Panel** (active in Year 3) — race list with candidates, player endorsement buttons, PC investment slider, vote results

- [ ] **Step 2: Add GameContext actions**

Actions: `POACH_LEGISLATORS`, `ENDORSE_CONVENTION_CANDIDATE`, `SPEND_PC_ON_CONVENTION`

- [ ] **Step 3: Run build and tests**

Run: `cd client && npx vite build && npx vitest run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add client/src/components/PoliticsTab.tsx client/src/lib/GameContext.tsx
git commit -m "feat(party): add party internals panel to PoliticsTab"
```

---

### Task 8: Final Cleanup

- [ ] **Step 1: Run full test suite, type check, and build**

Run: `cd client && npx vitest run && npx tsc --noEmit && npx vite build`
Expected: All pass

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(party): complete party internals system"
```
