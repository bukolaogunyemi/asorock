# Federal Character Expansion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand federal character from constitutional officers into a comprehensive scoring system that tracks zonal balance across all federal appointments (cabinet, agencies, ambassadors) and budget allocation, creating real gameplay tension between regional equity, competence, and political expediency.

**Architecture:** A `federalCharacter.ts` calculates a compliance score (0-100) from prestige-weighted appointment distribution across 6 zones plus budget allocation balance. Consequences escalate from adviser warnings to crisis events. An `appointmentPools.ts` provides ~80-100 new handcrafted candidates for agencies and ambassadors. The system integrates with CabinetTab to show compliance impact during appointment selection.

**Tech Stack:** React 18, TypeScript, Vitest, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-14-federal-character-expansion-design.md`

**Depends on:** Sub-Project A (Legislative Engine) — for `GameStateModifier` type and budget bill integration.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `client/src/lib/federalCharacterTypes.ts` | Interfaces: `FederalCharacterState`, `FederalAppointment`, `ZoneBalance`, `AppointmentCandidate` |
| `client/src/lib/appointmentPools.ts` | ~80-100 handcrafted candidates for agencies and ambassadors |
| `client/src/lib/federalCharacter.ts` | Compliance score calculation, balance checking, consequence triggers, `getComplianceImpact()` |
| `client/src/lib/federalCharacter.test.ts` | Unit tests |
| `client/src/lib/gameTypes.ts` | Modified: add `FederalCharacterState` to `GameState` |
| `client/src/lib/GameContext.tsx` | Modified: initialize federal character state |
| `client/src/lib/gameEngine.ts` | Modified: run federal character check each turn |
| `client/src/components/CabinetTab.tsx` | Modified: add compliance panel and zone badges on candidates |

---

## Chunk 1: Types, Pools & Score Engine

### Task 1: Create Federal Character Types

**Files:**
- Create: `client/src/lib/federalCharacterTypes.ts`

- [ ] **Step 1: Create the types file**

```typescript
// client/src/lib/federalCharacterTypes.ts
export interface FederalAppointment {
  positionId: string;
  positionName: string;
  category: "constitutional-officer" | "cabinet" | "agency" | "ambassador";
  prestigeTier: "strategic" | "standard" | "routine";
  appointeeId: string | null;
  appointeeZone: string | null;
  godfatherLinked?: string;
}

export interface ZoneBalance {
  zone: string;
  weightedAppointments: number;
  expectedShare: number;
  actualShare: number;
  deviation: number;
  grievanceContribution: number;
}

export interface FederalCharacterState {
  appointments: FederalAppointment[];
  complianceScore: number;
  zoneScores: Record<string, ZoneBalance>;
  budgetAllocation: Record<string, number>;
}

export interface AppointmentCandidate {
  characterId: string;
  name: string;
  zone: string;
  state: string;
  competence: number;
  loyalty: number;
  gender: string;
  religion: string;
  godfatherId?: string;
  qualifiedFor: string[];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/federalCharacterTypes.ts
git commit -m "feat(federal-char): add TypeScript interfaces"
```

---

### Task 2: Create Appointment Pools

**Files:**
- Create: `client/src/lib/appointmentPools.ts`

- [ ] **Step 1: Write tests for appointment pools**

```typescript
// client/src/lib/appointmentPools.test.ts
import { describe, expect, it } from "vitest";
import { AGENCY_CANDIDATES, AMBASSADOR_CANDIDATES, POSITION_DEFINITIONS } from "./appointmentPools";

describe("appointmentPools", () => {
  it("should define 12 agency positions", () => {
    const agencies = POSITION_DEFINITIONS.filter((p) => p.category === "agency");
    expect(agencies.length).toBe(12);
  });

  it("should define 10 ambassador postings", () => {
    const ambassadors = POSITION_DEFINITIONS.filter((p) => p.category === "ambassador");
    expect(ambassadors.length).toBe(10);
  });

  it("should have candidates from all 6 zones for each agency", () => {
    for (const position of POSITION_DEFINITIONS.filter((p) => p.category === "agency")) {
      const candidates = AGENCY_CANDIDATES.filter((c) => c.qualifiedFor.includes(position.id));
      const zones = new Set(candidates.map((c) => c.zone));
      expect(zones.size).toBe(6);
    }
  });

  it("should have at least 2 women per zone per strategic agency", () => {
    for (const position of POSITION_DEFINITIONS.filter((p) => p.category === "agency" && p.prestigeTier === "strategic")) {
      for (const zone of ["NC", "NW", "NE", "SW", "SE", "SS"]) {
        const women = AGENCY_CANDIDATES.filter(
          (c) => c.qualifiedFor.includes(position.id) && c.zone === zone && c.gender === "Female"
        );
        expect(women.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("candidate competence should be 30-95", () => {
    for (const c of [...AGENCY_CANDIDATES, ...AMBASSADOR_CANDIDATES]) {
      expect(c.competence).toBeGreaterThanOrEqual(30);
      expect(c.competence).toBeLessThanOrEqual(95);
    }
  });

  it("should have unique character IDs", () => {
    const all = [...AGENCY_CANDIDATES, ...AMBASSADOR_CANDIDATES];
    const ids = all.map((c) => c.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/appointmentPools.test.ts`
Expected: FAIL

- [ ] **Step 3: Create appointment pools and position definitions**

Create `client/src/lib/appointmentPools.ts` with:
- `POSITION_DEFINITIONS` — array of `{ id, name, category, prestigeTier }` for all 20 cabinet + 12 agency + 10 ambassador positions
- `AGENCY_CANDIDATES: AppointmentCandidate[]` — ~60-70 handcrafted candidates for the 12 agencies. 2-3 per zone per strategic position, 1-2 per zone per standard position. Each has Nigerian name, zone, state, competence (30-95), loyalty (30-90), gender, religion. Diversity rules: ≥2 women per zone per position, ≥2 per religion per zone.
- `AMBASSADOR_CANDIDATES: AppointmentCandidate[]` — ~30-40 candidates for the 10 postings. 1-2 per zone per posting.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/appointmentPools.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/appointmentPools.ts client/src/lib/appointmentPools.test.ts
git commit -m "feat(federal-char): add position definitions and ~100 candidate profiles"
```

---

### Task 3: Compliance Score Calculation

**Files:**
- Create: `client/src/lib/federalCharacter.ts`
- Create: `client/src/lib/federalCharacter.test.ts`

- [ ] **Step 1: Write tests for compliance score**

```typescript
// client/src/lib/federalCharacter.test.ts
import { describe, expect, it } from "vitest";
import { calculateComplianceScore, calculateZoneBalances, getComplianceImpact } from "./federalCharacter";
import type { FederalAppointment } from "./federalCharacterTypes";

describe("federalCharacter", () => {
  describe("calculateZoneBalances", () => {
    it("should return perfect balance when appointments evenly distributed", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE", "SS"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const balances = calculateZoneBalances(appointments);
      for (const zone of Object.values(balances)) {
        expect(Math.abs(zone.deviation)).toBeLessThan(0.01);
      }
    });

    it("should show deviation when one zone dominates", () => {
      const appointments: FederalAppointment[] = Array.from({ length: 6 }, (_, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: "NW", // all NW
      }));
      const balances = calculateZoneBalances(appointments);
      expect(balances["NW"].deviation).toBeGreaterThan(0);
      expect(balances["SE"].deviation).toBeLessThan(0);
    });
  });

  describe("calculateComplianceScore", () => {
    it("should return 100 for perfectly balanced appointments", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE", "SS"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const score = calculateComplianceScore(appointments, {});
      expect(score).toBeGreaterThanOrEqual(95);
    });

    it("should return low score when one zone has no appointments", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      // SS has nothing
      const score = calculateComplianceScore(appointments, {});
      expect(score).toBeLessThan(70);
    });

    it("prestige weighting: strategic appointments matter more", () => {
      // Zone A has 3 routine, Zone B has 1 strategic
      const appointments: FederalAppointment[] = [
        ...Array.from({ length: 3 }, (_, i) => ({
          positionId: `r-${i}`, positionName: `Routine ${i}`,
          category: "ambassador" as const, prestigeTier: "routine" as const,
          appointeeId: `a-${i}`, appointeeZone: "NC",
        })),
        {
          positionId: "s-0", positionName: "Strategic",
          category: "cabinet" as const, prestigeTier: "strategic" as const,
          appointeeId: "b-0", appointeeZone: "NW",
        },
      ];
      const balances = calculateZoneBalances(appointments);
      // NW with 1 strategic (×3=3) should weigh more than NC with 3 routine (×1=3)
      expect(balances["NW"].weightedAppointments).toBe(3);
      expect(balances["NC"].weightedAppointments).toBe(3);
    });
  });

  describe("getComplianceImpact", () => {
    it("should show impact of adding an appointment to a zone", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE", "SS"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "standard" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const impact = getComplianceImpact(appointments, {}, "NW", "strategic");
      // Adding another NW strategic should worsen score
      expect(impact).toBeLessThan(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/federalCharacter.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement compliance score calculation**

Create `client/src/lib/federalCharacter.ts`:
- `calculateZoneBalances(appointments)` — for each zone: sum prestige-weighted appointments (strategic ×3, standard ×2, routine ×1), calculate actual share vs expected ~16.7%, compute deviation
- `calculateComplianceScore(appointments, budgetAllocation)` — weighted average: 70% appointment balance + 30% budget balance. Appointment balance = 100 - (sum of absolute deviations × 100). Budget defaults to neutral 16.7% per zone when empty.
- `getComplianceImpact(appointments, budget, zone, prestigeTier)` — previews score change if a new appointment is added to the given zone
- `getConsequences(score)` — returns consequence level and effects based on spec Section 3.2 thresholds: Balanced (85-100), Mild (70-84), Moderate (45-69), Severe (<45)
- `defaultFederalCharacterState()` — returns initial state with all positions from POSITION_DEFINITIONS, no appointees

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/federalCharacter.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/federalCharacter.ts client/src/lib/federalCharacter.test.ts
git commit -m "feat(federal-char): implement compliance score calculation with prestige weighting"
```

---

## Chunk 2: Integration & UI

### Task 4: Integrate with GameState & Turn Processing

**Files:**
- Modify: `client/src/lib/gameTypes.ts`
- Modify: `client/src/lib/gameEngine.ts`
- Modify: `client/src/lib/GameContext.tsx`

- [ ] **Step 1: Add FederalCharacterState to GameState**

```typescript
import type { FederalCharacterState } from "./federalCharacterTypes";
// In GameState: federalCharacter: FederalCharacterState;
```

- [ ] **Step 2: Initialize in GameContext.tsx**

```typescript
import { defaultFederalCharacterState } from "./federalCharacter";
// In initializeGameState: federalCharacter: defaultFederalCharacterState(),
```

Populate initial constitutional officer appointments from `state.constitutionalOfficers`.

- [ ] **Step 3: Run federal character check each turn in gameEngine.ts**

Add to `processTurn()`: recalculate compliance score, check consequence thresholds, apply faction grievance effects for underrepresented zones.

- [ ] **Step 4: Run all tests**

Run: `cd client && npx vitest run`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/gameTypes.ts client/src/lib/gameEngine.ts client/src/lib/GameContext.tsx
git commit -m "feat(federal-char): integrate compliance system into game state and turn processing"
```

---

### Task 5: Update CabinetTab with Compliance Panel

**Files:**
- Modify: `client/src/components/CabinetTab.tsx`

- [ ] **Step 1: Read current CabinetTab.tsx**

Read to understand current appointment UI and patterns.

- [ ] **Step 2: Add compliance panel and zone indicators**

Add to CabinetTab:
1. **Compliance Score Panel** — overall score (0-100) with color indicator (green/yellow/orange/red), tier label
2. **Per-Zone Balance Table** — 6 zones with: weighted count, expected vs actual share, deviation bar, status icon
3. **Zone Badge on Candidates** — during appointment selection, each candidate shows their zone. A preview tooltip shows: "Appointing [name] from [zone] would change compliance from X → Y"
4. **Godfather Warning** — if a candidate has `godfatherId`, show a subtle indicator

Follow presidential theme (deep green, gold).

- [ ] **Step 3: Wire compliance impact preview**

When hovering/selecting a candidate, call `getComplianceImpact()` to preview the score change.

- [ ] **Step 4: Run build and tests**

Run: `cd client && npx vite build && npx vitest run`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add client/src/components/CabinetTab.tsx
git commit -m "feat(federal-char): add compliance panel and zone indicators to CabinetTab"
```

---

### Task 6: Final Cleanup

- [ ] **Step 1: Expand cabinet candidate pools in handcraftedCharacters.ts**

Add ~40-60 additional characters to existing cabinet candidate pools to ensure better zonal diversity. Each zone should have at least 2 candidates per strategic ministry.

- [ ] **Step 2: Run full test suite, type check, and build**

Run: `cd client && npx vitest run && npx tsc --noEmit && npx vite build`
Expected: All pass

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(federal-char): expand candidate pools and complete integration"
```
