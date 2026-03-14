# Constitutional Officers — Zonal Balancing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dynamically select Senate President, Deputy Senate President, Speaker, Deputy Speaker, and CJN at game start based on the player's and VP's geopolitical zones, enforcing federal character (no two positions from the same zone).

**Architecture:** Extract `GEOPOLITICAL_ZONES` into a shared `zones.ts`. Build candidate pools (5 per zone × 6 zones × 5 positions = 150 characters) in `constitutionalOfficers.ts` with a pure selection function. Wire selection into `initializeGameState()` via a new `constitutionalOfficers` field on `GameState`. Update `LegislatureTab` and `JudiciaryTab` to read from state instead of static imports.

**Tech Stack:** React 18, TypeScript, Vitest

---

## Chunk 1: Shared Zones + Selection Logic

### Task 1: Extract GEOPOLITICAL_ZONES into shared zones.ts

**Files:**
- Create: `client/src/lib/zones.ts`
- Modify: `client/src/components/OnboardingFlow.tsx`
- Test: `client/src/lib/zones.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// client/src/lib/zones.test.ts
import { describe, expect, it } from "vitest";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";

describe("zones", () => {
  it("defines exactly 6 geopolitical zones", () => {
    expect(GEOPOLITICAL_ZONES).toHaveLength(6);
  });

  it("every zone has a name, abbrev, states array, and registered count", () => {
    for (const zone of GEOPOLITICAL_ZONES) {
      expect(zone.name).toBeTruthy();
      expect(zone.abbrev).toHaveLength(2);
      expect(zone.states.length).toBeGreaterThanOrEqual(5);
      expect(zone.registered).toBeGreaterThan(0);
    }
  });

  it("getZoneForState returns the correct zone", () => {
    expect(getZoneForState("Lagos")?.abbrev).toBe("SW");
    expect(getZoneForState("Kano")?.abbrev).toBe("NW");
    expect(getZoneForState("Borno")?.abbrev).toBe("NE");
    expect(getZoneForState("Enugu")?.abbrev).toBe("SE");
    expect(getZoneForState("Rivers")?.abbrev).toBe("SS");
    expect(getZoneForState("Plateau")?.abbrev).toBe("NC");
  });

  it("getZoneForState returns undefined for unknown state", () => {
    expect(getZoneForState("Atlantis")).toBeUndefined();
  });

  it("FCT maps to North-Central", () => {
    expect(getZoneForState("FCT")?.abbrev).toBe("NC");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd aso-rock && npx vitest run client/src/lib/zones.test.ts`
Expected: FAIL — module `./zones` not found.

- [ ] **Step 3: Write the zones module**

```typescript
// client/src/lib/zones.ts

export interface GeopoliticalZone {
  name: string;
  abbrev: string;
  states: string[];
  registered: number;
}

export const GEOPOLITICAL_ZONES: GeopoliticalZone[] = [
  { name: "North-Central", abbrev: "NC", states: ["Benue","Kogi","Kwara","Nasarawa","Niger","Plateau","FCT"], registered: 14_500_000 },
  { name: "North-West", abbrev: "NW", states: ["Jigawa","Kaduna","Kano","Katsina","Kebbi","Sokoto","Zamfara"], registered: 20_100_000 },
  { name: "North-East", abbrev: "NE", states: ["Adamawa","Bauchi","Borno","Gombe","Taraba","Yobe"], registered: 11_800_000 },
  { name: "South-West", abbrev: "SW", states: ["Ekiti","Lagos","Ogun","Ondo","Osun","Oyo"], registered: 16_700_000 },
  { name: "South-East", abbrev: "SE", states: ["Abia","Anambra","Ebonyi","Enugu","Imo"], registered: 9_800_000 },
  { name: "South-South", abbrev: "SS", states: ["Akwa Ibom","Bayelsa","Cross River","Delta","Edo","Rivers"], registered: 12_100_000 },
];

/** Look up the geopolitical zone for a Nigerian state */
export function getZoneForState(state: string): GeopoliticalZone | undefined {
  return GEOPOLITICAL_ZONES.find((z) => z.states.includes(state));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd aso-rock && npx vitest run client/src/lib/zones.test.ts`
Expected: PASS — all 5 tests pass.

- [ ] **Step 5: Update OnboardingFlow.tsx to import from zones.ts**

In `client/src/components/OnboardingFlow.tsx`:

1. Add import at top: `import { GEOPOLITICAL_ZONES } from "@/lib/zones";`
2. Delete the inline `GEOPOLITICAL_ZONES` constant (around lines 152-159).

- [ ] **Step 6: Run all tests to verify nothing breaks**

Run: `cd aso-rock && npx vitest run`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add client/src/lib/zones.ts client/src/lib/zones.test.ts client/src/components/OnboardingFlow.tsx
git commit -m "refactor: extract GEOPOLITICAL_ZONES into shared zones module"
```

---

### Task 2: Create selection function with tests (empty pools)

**Files:**
- Create: `client/src/lib/constitutionalOfficers.ts`
- Test: `client/src/lib/constitutionalOfficers.test.ts`

This task builds the selection algorithm and type definitions with minimal placeholder pools (1 candidate per zone per position — enough to test the algorithm). Task 3 fills in the full 150-candidate pool.

- [ ] **Step 1: Write the test file**

```typescript
// client/src/lib/constitutionalOfficers.test.ts
import { describe, expect, it } from "vitest";
import {
  selectConstitutionalOfficers,
  POSITION_NAMES,
  type ConstitutionalCandidate,
} from "./constitutionalOfficers";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";

describe("selectConstitutionalOfficers", () => {
  it("returns exactly 5 officers", () => {
    const officers = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    expect(officers).toHaveLength(5);
  });

  it("assigns correct portfolio names in order", () => {
    const officers = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    expect(officers[0].portfolio).toBe("Senate President");
    expect(officers[1].portfolio).toBe("Deputy Senate President");
    expect(officers[2].portfolio).toBe("Speaker of the House");
    expect(officers[3].portfolio).toBe("Deputy Speaker");
    expect(officers[4].portfolio).toBe("Chief Justice of Nigeria");
  });

  it("no officer comes from the president's zone", () => {
    const officers = selectConstitutionalOfficers("Kano", "Enugu", 99);
    const presidentZone = getZoneForState("Kano")!.name;
    for (const o of officers) {
      const officerZone = getZoneForState(o.state)!.name;
      expect(officerZone).not.toBe(presidentZone);
    }
  });

  it("no officer comes from the VP's zone", () => {
    const officers = selectConstitutionalOfficers("Kano", "Enugu", 99);
    const vpZone = getZoneForState("Enugu")!.name;
    for (const o of officers) {
      const officerZone = getZoneForState(o.state)!.name;
      expect(officerZone).not.toBe(vpZone);
    }
  });

  it("no two officers share the same zone (when president ≠ VP zone)", () => {
    // Kano=NW, Enugu=SE → 4 available zones for 5 positions
    // First 4 must be unique, 5th reuses one
    const officers = selectConstitutionalOfficers("Kano", "Enugu", 42);
    const zones = officers.map((o) => getZoneForState(o.state)!.name);
    // At most one duplicate (since 5 positions, 4 zones)
    const unique = new Set(zones);
    expect(unique.size).toBeGreaterThanOrEqual(4);
  });

  it("all 5 zones unique when president and VP share a zone", () => {
    // Lagos=SW, Ogun=SW → 5 available zones for 5 positions
    const officers = selectConstitutionalOfficers("Lagos", "Ogun", 42);
    const zones = officers.map((o) => getZoneForState(o.state)!.name);
    expect(new Set(zones).size).toBe(5);
  });

  it("is deterministic with the same inputs", () => {
    const a = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    const b = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    expect(a.map((o) => o.name)).toEqual(b.map((o) => o.name));
  });

  it("produces different zone assignments with different seeds", () => {
    const a = selectConstitutionalOfficers("Lagos", "Adamawa", 1);
    const b = selectConstitutionalOfficers("Lagos", "Adamawa", 9999);
    // Compare zone assignments (not names — placeholder pools have 1 candidate per zone)
    const aZones = a.map((o) => getZoneForState(o.state)!.name).join(",");
    const bZones = b.map((o) => getZoneForState(o.state)!.name).join(",");
    expect(aZones).not.toBe(bZones);
  });

  it("every officer has required fields", () => {
    const officers = selectConstitutionalOfficers("Rivers", "Sokoto", 77);
    for (const o of officers) {
      expect(o.name).toBeTruthy();
      expect(o.state).toBeTruthy();
      expect(o.age).toBeGreaterThanOrEqual(40);
      expect(o.gender).toMatch(/^(Male|Female)$/);
      expect(o.religion).toMatch(/^(Muslim|Christian)$/);
      expect(o.loyalty).toBeGreaterThanOrEqual(0);
      expect(o.competence).toBeGreaterThanOrEqual(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd aso-rock && npx vitest run client/src/lib/constitutionalOfficers.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the module with selection logic and placeholder pools**

```typescript
// client/src/lib/constitutionalOfficers.ts
import type { Character } from "./gameData";
import type { Relationship } from "./gameTypes";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";

export interface ConstitutionalCandidate extends Character {
  age: number;
  state: string;
  gender: "Male" | "Female";
  religion: "Muslim" | "Christian";
  relationship: Relationship;
}

export const POSITION_NAMES = [
  "Senate President",
  "Deputy Senate President",
  "Speaker of the House",
  "Deputy Speaker",
  "Chief Justice of Nigeria",
] as const;

export type PositionName = typeof POSITION_NAMES[number];

type ZoneName = string;

/** Seeded RNG (Park-Miller) */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Fisher-Yates shuffle using seeded RNG */
function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── Candidate Pools ─────────────────────────────────────
// Organized as: POOLS[positionIndex][zoneName] = ConstitutionalCandidate[]
// Full pools are defined below. Each zone has 5 candidates per position.

// PLACEHOLDER: Task 3 fills in all 150 candidates.
// For now, 1 candidate per zone per position to validate the algorithm.

const PLACEHOLDER_POOLS: ConstitutionalCandidate[][][] = POSITION_NAMES.map(
  (position) =>
    GEOPOLITICAL_ZONES.map((zone) => [
      {
        name: `Placeholder ${position} (${zone.abbrev})`,
        portfolio: position,
        agenda: "Placeholder agenda",
        opinion: "Placeholder opinion",
        loyalty: 60,
        competence: 70,
        ambition: 65,
        faction: "Independent",
        relationship: "Neutral" as Relationship,
        avatar: zone.abbrev,
        age: 55,
        state: zone.states[0],
        gender: "Male" as const,
        religion: "Muslim" as const,
      },
    ])
);

// CONSTITUTIONAL_POOLS[positionIndex][zoneIndex] = ConstitutionalCandidate[]
export let CONSTITUTIONAL_POOLS: ConstitutionalCandidate[][][] = PLACEHOLDER_POOLS;

/** Replace placeholder pools with real data (called from pool data file) */
export function setConstitutionalPools(pools: ConstitutionalCandidate[][][]) {
  CONSTITUTIONAL_POOLS = pools;
}

/**
 * Select 5 constitutional officers based on player and VP zones.
 * Enforces zonal exclusion: no officer from president's or VP's zone,
 * and no two officers from the same zone (except when only 4 zones available).
 */
export function selectConstitutionalOfficers(
  playerState: string,
  vpState: string,
  seed: number,
): ConstitutionalCandidate[] {
  const rng = seededRandom(seed);
  const playerZone = getZoneForState(playerState);
  const vpZone = getZoneForState(vpState);

  // Collect available zone indices
  const excludedZoneNames = new Set<string>();
  if (playerZone) excludedZoneNames.add(playerZone.name);
  if (vpZone) excludedZoneNames.add(vpZone.name);

  const availableZoneIndices = GEOPOLITICAL_ZONES
    .map((z, i) => ({ zone: z, index: i }))
    .filter(({ zone }) => !excludedZoneNames.has(zone.name))
    .map(({ index }) => index);

  // Shuffle available zones
  const shuffled = shuffleArray(availableZoneIndices, rng);

  const officers: ConstitutionalCandidate[] = [];

  for (let posIdx = 0; posIdx < POSITION_NAMES.length; posIdx++) {
    // Pick zone: cycle through shuffled zones
    const zoneIdx = shuffled[posIdx % shuffled.length];
    const pool = CONSTITUTIONAL_POOLS[posIdx][zoneIdx];

    if (!pool || pool.length === 0) {
      throw new Error(
        `No candidates for position "${POSITION_NAMES[posIdx]}" in zone "${GEOPOLITICAL_ZONES[zoneIdx].name}"`
      );
    }

    // Pick a random candidate from the zone's pool
    const candidateIdx = Math.floor(rng() * pool.length);
    const candidate = { ...pool[candidateIdx], portfolio: POSITION_NAMES[posIdx] };
    officers.push(candidate);
  }

  return officers;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd aso-rock && npx vitest run client/src/lib/constitutionalOfficers.test.ts`
Expected: PASS — all 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/constitutionalOfficers.ts client/src/lib/constitutionalOfficers.test.ts
git commit -m "feat: add constitutional officers selection algorithm with zonal balancing"
```

---

## Chunk 2: Candidate Pool Data (150 characters)

### Task 3: Author full candidate pools

**Files:**
- Create: `client/src/lib/constitutionalPools.ts`
- Modify: `client/src/lib/constitutionalOfficers.ts` (import and register pools)

This is a large data-authoring task. The file defines 150 fictional characters (5 positions × 6 zones × 5 candidates per zone). Each zone's 5 candidates include at least 2 women and at least 2 Muslim + 2 Christian (5th is author's discretion based on zone demographics).

All names must be ethnically authentic Nigerian names matching the zone's dominant ethnic groups:
- North-Central: Tiv, Nupe, Idoma, Igala names
- North-West: Hausa, Fulani names
- North-East: Kanuri, Fulani, Hausa names
- South-West: Yoruba names
- South-East: Igbo names
- South-South: Ijaw, Edo, Efik, Urhobo names

No real Nigerian politician names. Reference `client/src/lib/nameDatabase.ts` for name pools.

- [ ] **Step 1: Create the pools data file**

Create `client/src/lib/constitutionalPools.ts` with the following structure. The file exports a single function `registerConstitutionalPools()` that calls `setConstitutionalPools()` from `constitutionalOfficers.ts`.

```typescript
// client/src/lib/constitutionalPools.ts
import type { ConstitutionalCandidate } from "./constitutionalOfficers";
import { setConstitutionalPools } from "./constitutionalOfficers";
import type { Relationship } from "./gameTypes";

// Helper to reduce boilerplate — age is explicit (no Math.random)
function candidate(
  name: string,
  age: number,
  state: string,
  gender: "Male" | "Female",
  religion: "Muslim" | "Christian",
  loyalty: number,
  competence: number,
  ambition: number,
  faction: string,
  relationship: Relationship,
  agenda: string,
  opinion: string,
): ConstitutionalCandidate {
  const parts = name.replace(/^(Sen\.|Rt\. Hon\.|Hon\.|Justice|Barr\.|Prof\.|Dr\.|Alh\.|Hajiya|Chief|Engr\.) /, "").split(" ");
  const avatar = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
  return {
    name, portfolio: "", agenda, opinion, loyalty, competence, ambition,
    faction, relationship, avatar, age, state, gender, religion,
  };
}

// ── Pool structure: [positionIndex][zoneIndex][candidateIndex] ──
// Zone order matches GEOPOLITICAL_ZONES: NC=0, NW=1, NE=2, SW=3, SE=4, SS=5
// Position order: Senate President=0, Deputy Senate President=1, Speaker=2, Deputy Speaker=3, CJN=4

const pools: ConstitutionalCandidate[][][] = [
  // ── Position 0: Senate President ──
  [
    // NC (North-Central) — 5 candidates, at least 2 women, at least 2 Muslim + 2 Christian
    [
      candidate("Sen. Terhemba Gbilimba", "Benue", "Male", "Christian", 58, 72, 85, "Middle Belt Caucus", "Wary", "Push for Middle Belt autonomy and farmer-herder resolution framework.", "Cautiously supportive — expects agricultural policy concessions."),
      candidate("Sen. Hajiya Asabe Ndagi", "Niger", "Female", "Muslim", 65, 68, 70, "Northern Caucus", "Neutral", "Strengthen federal allocations to North-Central states.", "Pragmatic — will cooperate if her state benefits."),
      candidate("Sen. Comfort Adikpo", "Benue", "Female", "Christian", 52, 76, 78, "Middle Belt Caucus", "Wary", "Constitutional reform to address land use act.", "Distrustful of executive overreach but open to dialogue."),
      candidate("Sen. Suleiman Lemu", "Niger", "Male", "Muslim", 72, 65, 60, "Northern Caucus", "Friendly", "Maintain party discipline and push through executive agenda.", "Old-guard loyalist — expects patronage."),
      candidate("Sen. Danjuma Jiya", "Nasarawa", "Male", "Christian", 60, 74, 82, "Independent", "Neutral", "Bridge northern and southern legislative blocs.", "Calculating — support depends on committee assignments."),
    ],
    // NW (North-West)
    [
      candidate("Sen. Alh. Garba Kangiwa", "Sokoto", "Male", "Muslim", 70, 68, 75, "Northern Caucus", "Friendly", "Consolidate northern legislative bloc under party umbrella.", "Loyal to party — expects reciprocity on northern appointments."),
      candidate("Sen. Hajiya Safiya Ringim", "Jigawa", "Female", "Muslim", 62, 74, 68, "Northern Caucus", "Neutral", "Women's empowerment legislation and education reform.", "Pragmatic — will trade votes for women's affairs budget."),
      candidate("Sen. Abdulkadir Tsafe", "Zamfara", "Male", "Muslim", 55, 70, 88, "Northern Populist", "Wary", "Security reform for banditry-affected North-West states.", "Publicly supportive but privately ambitious."),
      candidate("Sen. Hauwa Bichi", "Kano", "Female", "Christian", 68, 72, 62, "Northern Caucus", "Friendly", "Healthcare infrastructure expansion in the North.", "Reliable ally — modest ambition."),
      candidate("Sen. Musa Gwandu", "Kebbi", "Male", "Christian", 48, 66, 72, "Independent", "Neutral", "Minority rights within northern states.", "Transactional — needs assurance of protection."),
    ],
    // NE (North-East)
    [
      candidate("Sen. Kashim Askira", "Borno", "Male", "Muslim", 65, 78, 70, "Northern Caucus", "Friendly", "Post-insurgency reconstruction and IDP resettlement.", "Loyal — expects defence spending prioritisation."),
      candidate("Sen. Falmata Gubio", "Borno", "Female", "Muslim", 58, 72, 65, "Northern Caucus", "Neutral", "Humanitarian corridor legislation for North-East.", "Pragmatic — focused on constituency needs above politics."),
      candidate("Sen. Adamu Bogoro", "Bauchi", "Male", "Christian", 52, 74, 80, "Middle Belt Caucus", "Wary", "Bridge North-East and Middle Belt interests.", "Cautious — burned by previous administration's promises."),
      candidate("Sen. Hannatu Kaigama", "Taraba", "Female", "Christian", 60, 70, 68, "Middle Belt Caucus", "Neutral", "Agricultural reform and anti-grazing legislation.", "Open to cooperation on specific policy issues."),
      candidate("Sen. Bukar Damboa", "Yobe", "Male", "Muslim", 70, 66, 60, "Northern Caucus", "Friendly", "Traditional institution preservation and Islamic education.", "Old-guard — loyal to party hierarchy."),
    ],
    // SW (South-West)
    [
      candidate("Sen. Babatunde Ipaye", "Lagos", "Male", "Christian", 62, 76, 88, "South-West Alliance", "Wary", "Push constitutional reform to strengthen Senate powers over budget.", "Cautiously supportive — expects patronage and influence over appointments."),
      candidate("Sen. Folake Adesanya", "Ogun", "Female", "Christian", 55, 80, 72, "South-West Alliance", "Neutral", "Judicial reform and anti-corruption legislation.", "Independent-minded — votes conviction over party line."),
      candidate("Sen. Alhaji Kolawole Alabi", "Ogun", "Male", "Muslim", 68, 70, 65, "South-West Alliance", "Friendly", "Bridge Yoruba Muslim-Christian legislative cooperation.", "Pragmatic — leverage for cross-regional deals."),
      candidate("Sen. Modupe Ogundare", "Oyo", "Female", "Muslim", 50, 72, 78, "South-West Alliance", "Neutral", "Education reform and youth employment legislation.", "Progressive — expects policy alignment."),
      candidate("Sen. Adeniyi Akande", "Osun", "Male", "Christian", 72, 68, 55, "South-West Alliance", "Friendly", "Federalism and resource control for South-West.", "Elder statesman — reliable but demands respect."),
    ],
    // SE (South-East)
    [
      candidate("Sen. Chukwuemeka Nnadi", "Enugu", "Male", "Christian", 48, 74, 90, "South-East Bloc", "Wary", "Restructuring and South-East development fund.", "Publicly loyal but privately calculating — eyes presidency."),
      candidate("Sen. Obiageli Ugwu", "Ebonyi", "Female", "Christian", 55, 78, 72, "South-East Bloc", "Neutral", "Infrastructure development for South-East.", "Pragmatic technocrat — trades votes for project funding."),
      candidate("Sen. Ikechukwu Arinze", "Anambra", "Male", "Christian", 62, 70, 80, "South-East Bloc", "Wary", "Constitutional amendment for state police.", "Ambitious — building cross-regional alliances."),
      candidate("Sen. Amaka Okafor", "Imo", "Female", "Muslim", 58, 72, 68, "South-East Bloc", "Neutral", "Women's rights and social welfare legislation.", "Cooperative on gender issues regardless of party."),
      candidate("Sen. Alhaji Usman Okoro", "Abia", "Male", "Muslim", 65, 66, 62, "Independent", "Friendly", "Inter-faith dialogue and minority rights.", "Unique voice — Muslim Igbo perspective."),
    ],
    // SS (South-South)
    [
      candidate("Sen. Dakoru Alagoa", "Bayelsa", "Male", "Christian", 55, 72, 82, "Niger Delta Caucus", "Wary", "Resource control and Niger Delta development.", "Support contingent on oil revenue reform."),
      candidate("Sen. Isoken Ehanire", "Edo", "Female", "Christian", 60, 78, 68, "South-South Alliance", "Neutral", "Environmental legislation and oil spill remediation.", "Policy-focused — less interested in patronage."),
      candidate("Sen. Ebikabowei Igali", "Bayelsa", "Male", "Christian", 68, 70, 75, "Niger Delta Caucus", "Friendly", "Amnesty programme continuation and maritime security.", "Old-guard — transactional loyalty."),
      candidate("Sen. Arit Effiong", "Cross River", "Female", "Muslim", 52, 76, 70, "South-South Alliance", "Neutral", "Tourism development and Cross River infrastructure.", "Moderate — open to executive agenda."),
      candidate("Sen. Ovie Uvwie", "Delta", "Male", "Muslim", 58, 68, 78, "Niger Delta Caucus", "Wary", "Oil-producing community compensation framework.", "Ambitious — uses Delta oil leverage."),
    ],
  ],

  // ── Position 1: Deputy Senate President ──
  [
    // NC
    [
      candidate("Sen. Aondoakaa Tyoor", "Benue", "Male", "Christian", 55, 70, 78, "Middle Belt Caucus", "Neutral", "Push for grazing reserve reform and farmer protection.", "Supportive if agriculture gets priority."),
      candidate("Sen. Hajiya Rakiya Mokwa", "Niger", "Female", "Muslim", 62, 72, 65, "Northern Caucus", "Friendly", "Women's political participation in the North.", "Reliable — focuses on constituent service."),
      candidate("Sen. Joseph Agaie", "Niger", "Male", "Christian", 58, 68, 72, "Middle Belt Caucus", "Wary", "Minority Christian rights in northern states.", "Cautious — needs assurance of inclusion."),
      candidate("Sen. Fatima Chatta", "Kwara", "Female", "Muslim", 50, 76, 70, "Northern Caucus", "Neutral", "Education reform and girl-child enrollment.", "Technocratic — votes on merit."),
      candidate("Sen. Idris Lapai", "Niger", "Male", "Muslim", 70, 64, 55, "Northern Caucus", "Friendly", "Traditional institution preservation.", "Loyal party man — modest ambition."),
    ],
    // NW
    [
      candidate("Sen. Bashir Fagge", "Kano", "Male", "Muslim", 68, 70, 72, "Northern Caucus", "Friendly", "Industrial policy for Kano's manufacturing sector.", "Loyal — expects economic ministry access."),
      candidate("Sen. Hadiza Zurmi", "Zamfara", "Female", "Muslim", 55, 74, 68, "Northern Caucus", "Neutral", "Security legislation for banditry-affected communities.", "Pragmatic — trades votes for security deployment."),
      candidate("Sen. Aminu Bunza", "Kebbi", "Male", "Muslim", 62, 66, 75, "Northern Populist", "Wary", "Agricultural subsidies and rice self-sufficiency.", "Populist — plays to gallery but negotiable."),
      candidate("Sen. Maryam Gusau", "Zamfara", "Female", "Christian", 48, 72, 65, "Northern Caucus", "Neutral", "Healthcare and maternal mortality reduction.", "Policy-focused — less interested in patronage."),
      candidate("Sen. Yakubu Gwandu", "Kebbi", "Male", "Christian", 58, 68, 70, "Independent", "Neutral", "Minority rights and inter-faith harmony.", "Bridge-builder — valued for cross-party appeal."),
    ],
    // NE
    [
      candidate("Sen. Goni Marte", "Borno", "Male", "Muslim", 62, 74, 68, "Northern Caucus", "Friendly", "Counter-terrorism and North-East reconstruction.", "Experienced — deep knowledge of security apparatus."),
      candidate("Sen. Yagana Dikwa", "Borno", "Female", "Muslim", 55, 70, 65, "Northern Caucus", "Neutral", "IDP resettlement and women's rehabilitation.", "Humanitarian focus — cooperative on social bills."),
      candidate("Sen. Sunday Liman", "Adamawa", "Male", "Christian", 58, 72, 78, "Middle Belt Caucus", "Wary", "Southern Adamawa autonomy and development.", "Cautious — expects visible development projects."),
      candidate("Sen. Hauwa Joda", "Gombe", "Female", "Muslim", 50, 76, 62, "Northern Caucus", "Neutral", "Education infrastructure in North-East.", "Technocratic — respects competence over loyalty."),
      candidate("Sen. Adamu Askira", "Borno", "Male", "Christian", 65, 68, 60, "Independent", "Friendly", "Christian minority protection in North-East.", "Grateful for inclusion — reliably loyal."),
    ],
    // SW
    [
      candidate("Sen. Kayode Oduya", "Lagos", "Male", "Christian", 58, 78, 82, "South-West Alliance", "Wary", "Lagos infrastructure and smart city legislation.", "Ambitious — building gubernatorial platform."),
      candidate("Sen. Titilayo Adeleke", "Osun", "Female", "Christian", 62, 74, 68, "South-West Alliance", "Neutral", "Cultural heritage preservation and creative economy.", "Moderate — votes party line mostly."),
      candidate("Sen. Alhaji Rasheed Alabi", "Oyo", "Male", "Muslim", 70, 66, 55, "South-West Alliance", "Friendly", "Agricultural modernisation in South-West.", "Old-guard — reliable but uninspired."),
      candidate("Sen. Bukola Fawehinmi", "Ondo", "Female", "Christian", 52, 80, 75, "South-West Alliance", "Neutral", "Anti-corruption and transparency legislation.", "Principled — may challenge executive on accountability."),
      candidate("Sen. Olumide Makinde", "Oyo", "Male", "Muslim", 55, 72, 78, "South-West Alliance", "Wary", "Revenue sharing reform for South-West states.", "Calculating — support tied to fiscal concessions."),
    ],
    // SE
    [
      candidate("Sen. Obinna Mbah", "Anambra", "Male", "Christian", 52, 76, 85, "South-East Bloc", "Wary", "South-East infrastructure deficit and federal appointments.", "Ambitious — positioning for higher office."),
      candidate("Sen. Chiamaka Igwe", "Enugu", "Female", "Christian", 58, 72, 68, "South-East Bloc", "Neutral", "ICT development and tech hub legislation.", "Pragmatic — trades votes for project approvals."),
      candidate("Sen. Nnamdi Eze", "Ebonyi", "Male", "Christian", 65, 68, 72, "South-East Bloc", "Friendly", "Mining sector regulation and solid minerals.", "Loyal — Ebonyi's interests above party."),
      candidate("Sen. Adaeze Soludo", "Anambra", "Female", "Muslim", 48, 78, 70, "South-East Bloc", "Neutral", "Education quality and university autonomy.", "Academic background — evidence-based approach."),
      candidate("Sen. Alhaji Chidi Okonkwo", "Imo", "Male", "Muslim", 60, 66, 62, "Independent", "Friendly", "Inter-faith commerce and trade legislation.", "Cooperative — valued for minority perspective."),
    ],
    // SS
    [
      candidate("Sen. Timipre Ekine", "Bayelsa", "Male", "Christian", 58, 72, 78, "Niger Delta Caucus", "Wary", "Petroleum Industry Act amendments for host communities.", "Support tied to oil community benefits."),
      candidate("Sen. Ebiere Koroye", "Bayelsa", "Female", "Christian", 55, 76, 65, "Niger Delta Caucus", "Neutral", "Environmental remediation and clean-up legislation.", "Policy-focused — bipartisan on environment."),
      candidate("Sen. Osaro Aigbokhan", "Edo", "Male", "Christian", 62, 70, 72, "South-South Alliance", "Friendly", "Edo cultural preservation and tourism.", "Loyal — old establishment family."),
      candidate("Sen. Idara Bassey", "Cross River", "Female", "Muslim", 50, 74, 68, "South-South Alliance", "Neutral", "Maritime economy and coastal development.", "Moderate — open to compromise."),
      candidate("Sen. Ovie Orhorhoro", "Delta", "Male", "Muslim", 65, 68, 75, "Niger Delta Caucus", "Wary", "Delta state fiscal federalism.", "Leverages oil revenue arguments."),
    ],
  ],

  // ── Position 2: Speaker of the House ──
  [
    // NC
    [
      candidate("Rt. Hon. Msugh Anhange", "Benue", "Male", "Christian", 60, 74, 78, "Middle Belt Caucus", "Neutral", "House reform and procedural modernisation.", "Efficient — respects institutional norms."),
      candidate("Rt. Hon. Hajiya Laraba Tsado", "Niger", "Female", "Muslim", 65, 70, 65, "Northern Caucus", "Friendly", "Rural infrastructure and women's political representation.", "Reliable — party disciplinarian."),
      candidate("Rt. Hon. Emmanuel Ugba", "Benue", "Male", "Christian", 55, 72, 82, "Middle Belt Caucus", "Wary", "Anti-grazing legislation and farmer protection.", "Ambitious — may use Speaker platform for governorship."),
      candidate("Rt. Hon. Bilkisu Batati", "Niger", "Female", "Muslim", 52, 76, 68, "Northern Caucus", "Neutral", "Education and healthcare committee reform.", "Technocratic — competent chair."),
      candidate("Rt. Hon. Idris Kutigi", "Niger", "Male", "Muslim", 68, 66, 58, "Northern Caucus", "Friendly", "Party cohesion and legislative-executive harmony.", "Old-guard — steady hand."),
    ],
    // NW
    [
      candidate("Rt. Hon. Abdullahi Kagara", "Zamfara", "Male", "Muslim", 62, 70, 75, "Northern Caucus", "Friendly", "Security committee reform for North-West.", "Loyal — expects committee chairmanship allocation."),
      candidate("Rt. Hon. Zainab Shinkafi", "Zamfara", "Female", "Muslim", 55, 74, 68, "Northern Caucus", "Neutral", "Girl-child education and anti-child-marriage legislation.", "Progressive for the region — principled."),
      candidate("Rt. Hon. Sani Argungu", "Kebbi", "Male", "Muslim", 70, 66, 55, "Northern Caucus", "Friendly", "Agricultural subsidies and irrigation projects.", "Reliable — no surprises."),
      candidate("Rt. Hon. Fatima Dankwambo", "Jigawa", "Female", "Christian", 48, 78, 72, "Northern Caucus", "Neutral", "Primary healthcare and maternal mortality.", "Young — energetic and reform-minded."),
      candidate("Rt. Hon. Matthew Bichi", "Kano", "Male", "Christian", 58, 68, 70, "Independent", "Neutral", "Minority rights and interfaith dialogue.", "Bridge-builder in Kano politics."),
    ],
    // NE
    [
      candidate("Rt. Hon. Zulum Gwoza", "Borno", "Male", "Muslim", 60, 76, 72, "Northern Caucus", "Friendly", "Emergency management and North-East reconstruction.", "Competent — field experience in crisis zones."),
      candidate("Rt. Hon. Asma'u Monguno", "Borno", "Female", "Muslim", 55, 72, 65, "Northern Caucus", "Neutral", "Women's rehabilitation and vocational training.", "Compassionate — humanitarian focus."),
      candidate("Rt. Hon. Barnabas Bogoro", "Bauchi", "Male", "Christian", 58, 70, 78, "Middle Belt Caucus", "Wary", "Christian minority representation.", "Cautious but competent."),
      candidate("Rt. Hon. Maimuna Kaigama", "Taraba", "Female", "Christian", 52, 74, 68, "Middle Belt Caucus", "Neutral", "Agricultural reform and rural development.", "Cross-party appeal — moderate."),
      candidate("Rt. Hon. Ibrahim Bama", "Borno", "Male", "Muslim", 65, 68, 60, "Northern Caucus", "Friendly", "Traditional institution support and Islamic education.", "Steady — loyal to party."),
    ],
    // SW
    [
      candidate("Rt. Hon. Femi Afolabi", "Lagos", "Male", "Christian", 58, 78, 82, "South-West Alliance", "Wary", "Maintain house discipline and push through executive priority bills.", "Reliable ally — expects his bills fast-tracked in return."),
      candidate("Rt. Hon. Jumoke Adegoke", "Ogun", "Female", "Christian", 55, 76, 70, "South-West Alliance", "Neutral", "Youth employment and digital economy legislation.", "Progressive — tech-savvy legislator."),
      candidate("Rt. Hon. Alhaji Rasheed Oladele", "Oyo", "Male", "Muslim", 65, 70, 68, "South-West Alliance", "Friendly", "Federal road network and South-West infrastructure.", "Party stalwart — dependable."),
      candidate("Rt. Hon. Omolara Ajayi", "Ekiti", "Female", "Christian", 50, 74, 75, "South-West Alliance", "Neutral", "Education reform and ASUU engagement.", "Academic connections — credible on education."),
      candidate("Rt. Hon. Wale Ipaye", "Lagos", "Male", "Muslim", 62, 72, 78, "South-West Alliance", "Wary", "Financial regulation and fintech legislation.", "Lagos business connections — ambitious."),
    ],
    // SE
    [
      candidate("Rt. Hon. Chinedu Okwuosa", "Anambra", "Male", "Christian", 55, 76, 80, "South-East Bloc", "Wary", "Industrial policy and SME support legislation.", "Ambitious — using House platform for visibility."),
      candidate("Rt. Hon. Ngozi Eze", "Enugu", "Female", "Christian", 60, 74, 68, "South-East Bloc", "Neutral", "Women's economic empowerment and trade.", "Cooperative — focused on legislative output."),
      candidate("Rt. Hon. Azubuike Nwankwo", "Abia", "Male", "Christian", 52, 70, 75, "South-East Bloc", "Wary", "Commerce and industry deregulation.", "Aba business community connections."),
      candidate("Rt. Hon. Chidinma Mbah", "Ebonyi", "Female", "Muslim", 48, 78, 65, "South-East Bloc", "Neutral", "Mining regulation and solid minerals.", "Young technocrat — competent."),
      candidate("Rt. Hon. Alhaji Emeka Igwe", "Imo", "Male", "Muslim", 62, 66, 60, "Independent", "Friendly", "Inter-faith harmony legislation.", "Valued minority voice."),
    ],
    // SS
    [
      candidate("Rt. Hon. Preye Alagoa", "Bayelsa", "Male", "Christian", 58, 72, 78, "Niger Delta Caucus", "Wary", "PIB amendments and host community funds.", "Oil politics — transactional."),
      candidate("Rt. Hon. Esohe Osaghae", "Edo", "Female", "Christian", 55, 78, 68, "South-South Alliance", "Neutral", "Creative economy and culture legislation.", "Progressive — policy-driven."),
      candidate("Rt. Hon. Bassey Henshaw", "Cross River", "Male", "Christian", 62, 70, 72, "South-South Alliance", "Friendly", "Tourism and hospitality industry legislation.", "Moderate — easy to work with."),
      candidate("Rt. Hon. Ufuoma Edewor", "Delta", "Female", "Muslim", 50, 74, 70, "Niger Delta Caucus", "Neutral", "Environmental protection and gas flaring ban.", "Principled on environment."),
      candidate("Rt. Hon. Ovie Erhie", "Delta", "Male", "Muslim", 65, 68, 65, "Niger Delta Caucus", "Friendly", "Maritime legislation and waterways development.", "Loyal — community-focused."),
    ],
  ],

  // ── Position 3: Deputy Speaker ──
  [
    // NC
    [
      candidate("Hon. Sewuese Malu", "Benue", "Female", "Christian", 55, 72, 68, "Middle Belt Caucus", "Neutral", "Youth development and sports legislation.", "Moderate — cooperative across party lines."),
      candidate("Hon. Abdullahi Zhitsu", "Niger", "Male", "Muslim", 62, 68, 72, "Northern Caucus", "Friendly", "Rural electrification and infrastructure.", "Loyal — party discipline enforcer."),
      candidate("Hon. Grace Adikpo", "Benue", "Female", "Christian", 50, 76, 65, "Middle Belt Caucus", "Neutral", "Agricultural processing and value chains.", "Technocratic — evidence-based."),
      candidate("Hon. Suleiman Doko", "Niger", "Male", "Muslim", 58, 70, 78, "Northern Caucus", "Wary", "Mining reform and solid minerals development.", "Ambitious but competent."),
      candidate("Hon. James Agber", "Benue", "Male", "Christian", 65, 66, 55, "Middle Belt Caucus", "Friendly", "Veteran affairs and peacekeeping.", "Experienced — no drama."),
    ],
    // NW
    [
      candidate("Hon. Suleiman Kankarofi", "Kano", "Male", "Muslim", 60, 70, 72, "Northern Caucus", "Friendly", "Industrial zones and Kano economic corridor.", "Party loyalist — expects patronage."),
      candidate("Hon. Rahma Gwamna", "Kaduna", "Female", "Muslim", 55, 74, 65, "Northern Caucus", "Neutral", "Maternal healthcare and family planning.", "Progressive voice in conservative zone."),
      candidate("Hon. Aminu Danmusa", "Katsina", "Male", "Muslim", 68, 66, 58, "Northern Caucus", "Friendly", "Agricultural modernisation and livestock reform.", "Old-guard — reliable party vote."),
      candidate("Hon. Bilkisu Inuwa", "Kaduna", "Female", "Christian", 48, 78, 70, "Northern Caucus", "Neutral", "Education technology and digital literacy.", "Young and energetic — reform-minded."),
      candidate("Hon. Daniel Makarfi", "Kaduna", "Male", "Christian", 55, 72, 68, "Independent", "Neutral", "Southern Kaduna development and minority rights.", "Builds bridges across religious lines."),
    ],
    // NE
    [
      candidate("Hon. Bukar Ngala", "Borno", "Male", "Muslim", 58, 74, 70, "Northern Caucus", "Friendly", "Security sector reform and civilian protection.", "Competent — field experience."),
      candidate("Hon. Safiya Damboa", "Yobe", "Female", "Muslim", 52, 72, 65, "Northern Caucus", "Neutral", "Orphan welfare and IDP children's education.", "Compassionate — humanitarian legislator."),
      candidate("Hon. Timothy Liman", "Adamawa", "Male", "Christian", 55, 70, 75, "Middle Belt Caucus", "Wary", "Christian minority advocacy and development.", "Cautious — needs visible wins."),
      candidate("Hon. Aisha Bama", "Borno", "Female", "Muslim", 50, 76, 68, "Northern Caucus", "Neutral", "Healthcare infrastructure in conflict zones.", "Evidence-based — technocratic approach."),
      candidate("Hon. Haruna Bogoro", "Bauchi", "Male", "Muslim", 65, 66, 60, "Northern Caucus", "Friendly", "Traditional medicine regulation and healthcare.", "Steady — loyal to party hierarchy."),
    ],
    // SW
    [
      candidate("Hon. Adebayo Ogunleye", "Lagos", "Male", "Christian", 58, 74, 78, "South-West Alliance", "Wary", "Lagos-Ogun economic corridor and housing.", "Ambitious — gubernatorial aspirations."),
      candidate("Hon. Ronke Adeyanju", "Oyo", "Female", "Christian", 55, 76, 68, "South-West Alliance", "Neutral", "Women in business and trade legislation.", "Cooperative — values legislative output."),
      candidate("Hon. Alhaji Waheed Olawale", "Lagos", "Male", "Muslim", 62, 70, 72, "South-West Alliance", "Friendly", "Maritime sector and blue economy.", "Lagos Muslim community leader — influential."),
      candidate("Hon. Kikelomo Aregbe", "Osun", "Female", "Christian", 50, 72, 65, "South-West Alliance", "Neutral", "Arts, culture, and creative economy.", "Moderate — easy to work with."),
      candidate("Hon. Tunde Lawal", "Ogun", "Male", "Muslim", 65, 68, 60, "South-West Alliance", "Friendly", "Manufacturing and industrialisation.", "Party elder — dependable."),
    ],
    // SE
    [
      candidate("Hon. Tobenna Okafor", "Anambra", "Male", "Christian", 52, 76, 80, "South-East Bloc", "Wary", "Trade and commerce deregulation.", "Ambitious — Onitsha business community."),
      candidate("Hon. Ifeoma Nwosu", "Enugu", "Female", "Christian", 58, 74, 68, "South-East Bloc", "Neutral", "Technology and innovation legislation.", "Pragmatic — focused on output."),
      candidate("Hon. Kelechi Anyanwu", "Imo", "Male", "Christian", 55, 70, 75, "South-East Bloc", "Wary", "South-East development commission.", "Vocal — pushes hard for constituency."),
      candidate("Hon. Adanna Eze", "Ebonyi", "Female", "Muslim", 48, 78, 65, "South-East Bloc", "Neutral", "Rural development and agro-processing.", "Young technocrat — competent."),
      candidate("Hon. Alhaji Uzoma Igwe", "Abia", "Male", "Muslim", 62, 66, 60, "Independent", "Friendly", "Inter-religious commerce and trade.", "Unique minority perspective."),
    ],
    // SS
    [
      candidate("Hon. Diepreye Timitimi", "Bayelsa", "Male", "Christian", 55, 72, 75, "Niger Delta Caucus", "Wary", "Riverine infrastructure and waterways.", "Oil community advocate."),
      candidate("Hon. Ivie Osaghae", "Edo", "Female", "Christian", 52, 76, 68, "South-South Alliance", "Neutral", "Women's health and reproductive rights.", "Progressive — principled legislator."),
      candidate("Hon. Edem Archibong", "Cross River", "Male", "Christian", 58, 70, 72, "South-South Alliance", "Friendly", "Cross River border trade and customs.", "Connected — good federal relationships."),
      candidate("Hon. Oghenefejiro Edewor", "Delta", "Female", "Muslim", 50, 74, 70, "Niger Delta Caucus", "Neutral", "Gas utilisation and petrochemical legislation.", "Technical background — credible."),
      candidate("Hon. Miebaka Sekibo", "Rivers", "Male", "Muslim", 60, 68, 65, "Niger Delta Caucus", "Friendly", "Port development and maritime economy.", "Moderate — cooperative."),
    ],
  ],

  // ── Position 4: Chief Justice of Nigeria ──
  [
    // NC
    [
      candidate("Justice Terhemba Aba", "Benue", "Male", "Christian", 45, 82, 40, "Judiciary", "Neutral", "Judicial independence and rule of law.", "Protective of judicial turf — resists executive pressure."),
      candidate("Justice Hajiya Asabe Jiya", "Niger", "Female", "Muslim", 50, 78, 35, "Judiciary", "Neutral", "Sharia-common law harmonisation.", "Scholarly — respected across legal traditions."),
      candidate("Justice Comfort Malu", "Benue", "Female", "Christian", 48, 80, 42, "Judiciary", "Wary", "Human rights jurisprudence and constitutional interpretation.", "Reform-minded — has ruled against government."),
      candidate("Justice Ibrahim Agaie", "Niger", "Male", "Muslim", 55, 76, 38, "Judiciary", "Friendly", "Court administration reform and case backlog.", "Traditionalist — predictable but fair."),
      candidate("Justice Samuel Adikpo", "Benue", "Male", "Christian", 52, 74, 45, "Judiciary", "Neutral", "Anti-corruption judicial framework.", "Independent — follows precedent strictly."),
    ],
    // NW
    [
      candidate("Justice Abdulkadir Fagge", "Kano", "Male", "Muslim", 55, 78, 40, "Judiciary", "Neutral", "Islamic jurisprudence and constitutional law.", "Scholarly — deep knowledge of both legal systems."),
      candidate("Justice Hadiza Ringim", "Jigawa", "Female", "Muslim", 48, 82, 35, "Judiciary", "Neutral", "Women's rights within Islamic legal framework.", "Pioneering — first female CJN candidate from NW."),
      candidate("Justice Garba Tsafe", "Zamfara", "Male", "Muslim", 58, 74, 42, "Judiciary", "Friendly", "Criminal justice reform and banditry prosecution.", "Pragmatic — understands security-justice balance."),
      candidate("Justice Maryam Gwarzo", "Kano", "Female", "Christian", 52, 80, 38, "Judiciary", "Neutral", "Family law and children's rights.", "Compassionate — respected for fairness."),
      candidate("Justice Stephen Bichi", "Kano", "Male", "Christian", 55, 76, 40, "Judiciary", "Neutral", "Constitutional interpretation and minority rights.", "Rare voice — Christian jurist from NW."),
    ],
    // NE
    [
      candidate("Justice Kashim Konduga", "Borno", "Male", "Muslim", 55, 80, 38, "Judiciary", "Neutral", "Post-conflict justice and transitional law.", "Deep understanding of NE crisis — fair-minded."),
      candidate("Justice Falmata Marte", "Borno", "Female", "Muslim", 50, 78, 40, "Judiciary", "Neutral", "Humanitarian law and IDP rights.", "Compassionate — internationally connected."),
      candidate("Justice Barnabas Joda", "Adamawa", "Male", "Christian", 58, 76, 42, "Judiciary", "Wary", "Land tenure reform and grazing rights.", "Independent — follows law strictly."),
      candidate("Justice Hannatu Bogoro", "Bauchi", "Female", "Christian", 52, 82, 35, "Judiciary", "Neutral", "Women's rights and gender-based violence.", "Reform champion — may challenge executive."),
      candidate("Justice Bukar Lawan", "Yobe", "Male", "Muslim", 62, 74, 36, "Judiciary", "Friendly", "Traditional justice and customary law.", "Elder jurist — predictable rulings."),
    ],
    // SW
    [
      candidate("Justice Adewale Onifade", "Ogun", "Male", "Christian", 55, 80, 42, "Judiciary", "Neutral", "Constitutional reform and judicial review.", "Traditionalist — protective of judicial turf."),
      candidate("Justice Folake Adesanya", "Lagos", "Female", "Christian", 52, 84, 38, "Judiciary", "Neutral", "Corporate law and commercial dispute resolution.", "Sharp legal mind — respected by the bar."),
      candidate("Justice Alhaji Kolawole Ipaye", "Oyo", "Male", "Muslim", 58, 76, 40, "Judiciary", "Friendly", "ADR and court decongestion.", "Efficient — focused on court administration."),
      candidate("Justice Modupe Ogundare", "Oyo", "Female", "Muslim", 48, 82, 36, "Judiciary", "Neutral", "Human rights and social justice.", "Progressive — may rule against executive."),
      candidate("Justice Adeniyi Bakare", "Lagos", "Male", "Christian", 62, 78, 35, "Judiciary", "Friendly", "Election petition tribunals and electoral law.", "Deep electoral law expertise."),
    ],
    // SE
    [
      candidate("Justice Chukwuemeka Arinze", "Anambra", "Male", "Christian", 55, 82, 40, "Judiciary", "Neutral", "Federalism and state rights jurisprudence.", "Independent — strict constructionist."),
      candidate("Justice Obiageli Nwosu", "Enugu", "Female", "Christian", 50, 80, 38, "Judiciary", "Neutral", "Environmental law and oil spill adjudication.", "Principled — has fined government agencies."),
      candidate("Justice Ikechukwu Mbah", "Ebonyi", "Male", "Christian", 58, 76, 42, "Judiciary", "Wary", "Land use reform and mining rights.", "Cautious — suspects executive overreach."),
      candidate("Justice Amaka Okoro", "Imo", "Female", "Muslim", 52, 84, 35, "Judiciary", "Neutral", "Criminal justice reform and prison decongestion.", "Compassionate — balanced sentencing."),
      candidate("Justice Alhaji Nonso Igwe", "Abia", "Male", "Muslim", 60, 74, 36, "Judiciary", "Friendly", "Inter-faith legal framework.", "Unique perspective — valued."),
    ],
    // SS
    [
      candidate("Justice Dakoru Ayah", "Bayelsa", "Male", "Christian", 55, 78, 40, "Judiciary", "Neutral", "Maritime law and oil industry disputes.", "Deep knowledge of petroleum law."),
      candidate("Justice Isoken Ehanire", "Edo", "Female", "Christian", 50, 82, 38, "Judiciary", "Neutral", "Human rights and constitutional freedoms.", "Has ruled against security agencies."),
      candidate("Justice Bassey Effiong", "Cross River", "Male", "Christian", 58, 76, 42, "Judiciary", "Wary", "ECOWAS law and international treaties.", "Internationally connected — independent."),
      candidate("Justice Ebiere Lokpobiri", "Bayelsa", "Female", "Muslim", 52, 80, 36, "Judiciary", "Neutral", "Environmental justice and community rights.", "Principled — deep environmental expertise."),
      candidate("Justice Ovie Edewor", "Delta", "Male", "Muslim", 60, 74, 40, "Judiciary", "Friendly", "Commercial arbitration and trade disputes.", "Business-savvy — efficient court management."),
    ],
  ],
];

/** Register the full candidate pools with the selection system */
export function registerConstitutionalPools() {
  setConstitutionalPools(pools);
}
```

**IMPORTANT**: The `candidate()` helper accepts `age` as the second parameter. The implementer must supply a specific age (45-72 range) for each of the 150 candidate calls. The ages shown in the inline data above are examples — the implementer should vary them realistically across candidates.

- [ ] **Step 2: Import and register pools in constitutionalOfficers.ts**

**Do NOT import `constitutionalPools.ts` from `constitutionalOfficers.ts`** — this would create a circular dependency. Instead, pool registration happens in `GameContext.tsx` (Task 4, Step 4).

- [ ] **Step 3: Run tests to verify pools work with selection**

Run: `cd aso-rock && npx vitest run client/src/lib/constitutionalOfficers.test.ts`
Expected: All 9 tests still pass (now with real candidate data instead of placeholders).

- [ ] **Step 4: Run TypeScript compiler**

Run: `cd aso-rock && npx tsc --noEmit`
Expected: Clean compile.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/constitutionalPools.ts client/src/lib/constitutionalOfficers.ts
git commit -m "feat: add 150 constitutional officer candidates across 6 zones"
```

---

## Chunk 3: Wire Into GameState + UI

### Task 4: Add constitutionalOfficers to GameState and initialization

**Design note:** The spec mentions a `ConstitutionalCandidate → CharacterState` conversion (with defaults for `traits: []`, `betrayalThreshold: 100 - loyalty`, `hooks: []`). However, the constitutional officers are rendered in `LegislatureTab` and `JudiciaryTab` which read fields directly (loyalty, competence, relationship, etc.) — they don't use `CharacterState`. We store `ConstitutionalCandidate[]` on GameState, matching the spec's type declaration. If future game mechanics require `CharacterState` fields (traits, hooks, betrayalThreshold), the conversion can be added then. YAGNI.

**Files:**
- Modify: `client/src/lib/gameTypes.ts`
- Modify: `client/src/lib/GameContext.tsx`
- Modify: `client/src/components/OnboardingFlow.tsx`

- [ ] **Step 1: Add VP state to CampaignConfig**

In `client/src/lib/GameContext.tsx`, add to the `CampaignConfig` interface (after `vpName: string`):

```typescript
vpState: string; // VP's state of origin — used for zonal balancing
```

- [ ] **Step 2: Add constitutionalOfficers to GameState**

In `client/src/lib/gameTypes.ts`, add import at top:

```typescript
import type { ConstitutionalCandidate } from "./constitutionalOfficers";
```

In the `GameState` interface (after `vicePresident: VicePresidentState;`), add:

```typescript
constitutionalOfficers: ConstitutionalCandidate[];
```

- [ ] **Step 3: Add default value in defaultGameState**

In `client/src/lib/GameContext.tsx`, in the `defaultGameState` object, add:

```typescript
constitutionalOfficers: [],
```

- [ ] **Step 4: Call selectConstitutionalOfficers in initializeGameState**

In `client/src/lib/GameContext.tsx`, add imports:

```typescript
import { selectConstitutionalOfficers } from "./constitutionalOfficers";
import { registerConstitutionalPools } from "./constitutionalPools";

// Register pools at module load time (before any selection can occur)
registerConstitutionalPools();
```

In the `initializeGameState` function, after `const vicePresident = createVicePresidentState(config.vpName);`, add:

```typescript
// Compute seed for constitutional officer selection
let officerSeed = 0;
for (const ch of config.party + config.stateOfOrigin + (config.vpState || "Lagos")) {
  officerSeed = ((officerSeed << 5) - officerSeed + ch.charCodeAt(0)) | 0;
}
const constitutionalOfficers = selectConstitutionalOfficers(
  config.stateOfOrigin,
  config.vpState || "Lagos",
  Math.abs(officerSeed) || 1,
);
```

Then include `constitutionalOfficers` in the returned state object.

- [ ] **Step 5: Pass vpState from OnboardingFlow**

In `client/src/components/OnboardingFlow.tsx`, find where `startCampaign()` is called with the config object. Add `vpState` to the config:

```typescript
vpState: vpCandidate?.state || "Lagos",
```

(The `vpCandidate` variable is already looked up in OnboardingFlow: `const vpCandidate = VP_CANDIDATES.find((v) => v.name === vpName);` — each VP candidate in `handcraftedCharacters.ts` already has a `state` field, so `vpCandidate.state` is available.)

- [ ] **Step 6: Run TypeScript compiler**

Run: `cd aso-rock && npx tsc --noEmit`
Expected: Clean compile.

- [ ] **Step 7: Run all tests**

Run: `cd aso-rock && npx vitest run`
Expected: All tests pass. Some tests that create GameState fixtures may need `constitutionalOfficers: []` added.

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/gameTypes.ts client/src/lib/GameContext.tsx client/src/components/OnboardingFlow.tsx
git commit -m "feat: wire constitutional officer selection into game initialization"
```

---

### Task 5: Update LegislatureTab to read from GameState

**Files:**
- Modify: `client/src/components/LegislatureTab.tsx`
- Modify: `client/src/lib/gameData.ts`

- [ ] **Step 1: Update LegislatureTab imports**

In `client/src/components/LegislatureTab.tsx`:

1. Add import: `import { useGame } from "@/lib/GameContext";`
2. Remove `senateLeadership` and `houseLeadership` from the `gameData` import (keep `senateSeats`, `houseSeats`, `whipTracker`, `activeBills`).

- [ ] **Step 2: Read constitutional officers from GameState with fallback**

Inside the `LegislatureTab` component function, add:

```typescript
const { state } = useGame();

// Split constitutional officers into Senate and House leadership
const senateLeadership = state.constitutionalOfficers.filter(
  (o) => o.portfolio === "Senate President" || o.portfolio === "Deputy Senate President"
);
const houseLeadership = state.constitutionalOfficers.filter(
  (o) => o.portfolio === "Speaker of the House" || o.portfolio === "Deputy Speaker"
);
const allLeaders = [...senateLeadership, ...houseLeadership];
```

If the component currently uses `senateLeadership` and `houseLeadership` separately in the JSX (e.g., rendering Senate and House sections), the filter logic above preserves that separation. If it only uses `allLeaders`, the individual arrays are still needed to maintain the rendering order.

**Fallback**: When `state.constitutionalOfficers` is empty (pre-game), both arrays will be empty and the tab should gracefully show no leadership data. Check the existing rendering — if it maps over `allLeaders`, an empty array will just render nothing. No explicit fallback needed beyond what the UI already handles for empty state.

Remove the old `const allLeaders = [...senateLeadership, ...houseLeadership];` line that uses static imports.

- [ ] **Step 3: Remove senateLeadership and houseLeadership from gameData.ts**

In `client/src/lib/gameData.ts`, remove the `senateLeadership` and `houseLeadership` exports (around lines 774-782). These are now dynamically generated. If any other file imports them, update those imports to read from GameState instead (check with `npx tsc --noEmit` after removal).

- [ ] **Step 4: Run TypeScript compiler**

Run: `cd aso-rock && npx tsc --noEmit`
Expected: Clean compile.

- [ ] **Step 5: Run all tests**

Run: `cd aso-rock && npx vitest run`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/LegislatureTab.tsx client/src/lib/gameData.ts
git commit -m "refactor: LegislatureTab reads constitutional officers from GameState"
```

---

### Task 6: Update JudiciaryTab to read CJN from GameState

**Files:**
- Modify: `client/src/components/JudiciaryTab.tsx`

- [ ] **Step 1: Add GameContext import**

Add: `import { useGame } from "@/lib/GameContext";`

- [ ] **Step 2: Move judiciaryPersonnel inside the component and replace hardcoded CJN**

The `judiciaryPersonnel` array is currently defined at **module level** (outside the component). It must move **inside** the `JudiciaryTab` component function body, because it now depends on `useGame()` state. Read CJN from state and build the adapter mapping with all required fields (name, title, shortTitle, avatar, gender, loyalty, competence, relationship, note←opinion):

```typescript
const { state } = useGame();
const cjnOfficer = state.constitutionalOfficers.find(
  (o) => o.portfolio === "Chief Justice of Nigeria"
);
```

Replace the first entry of `judiciaryPersonnel` (the CJN) with a mapped version:

```typescript
const judiciaryPersonnel = [
  // CJN — dynamically selected based on zonal balancing
  cjnOfficer
    ? {
        name: cjnOfficer.name,
        title: "Chief Justice of Nigeria" as const,
        shortTitle: "CJN" as const,
        avatar: cjnOfficer.avatar,
        gender: cjnOfficer.gender,
        loyalty: cjnOfficer.loyalty,
        competence: cjnOfficer.competence,
        relationship: cjnOfficer.relationship,
        note: cjnOfficer.opinion,
      }
    : {
        // Fallback if game not started
        name: "Chief Justice",
        title: "Chief Justice of Nigeria" as const,
        shortTitle: "CJN" as const,
        avatar: "CJ",
        gender: "Male" as const,
        loyalty: 55,
        competence: 70,
        relationship: "Neutral" as const,
        note: "Awaiting appointment.",
      },
  // Rest remain hardcoded (PCA, ECOWAS, AG)
  {
    name: "Justice Hauwa Daramola",
    title: "President, Court of Appeal",
    shortTitle: "PCA",
    avatar: "HD",
    gender: "Female",
    loyalty: 45,
    competence: 80,
    relationship: "Wary" as const,
    note: "Reform-minded. Has ruled against government before.",
  },
  {
    name: "Justice Kwame Mensah",
    title: "President, ECOWAS Court",
    shortTitle: "ECOWAS",
    avatar: "EA",
    gender: "Male",
    loyalty: 40,
    competence: 75,
    relationship: "Neutral" as const,
    note: "International jurist. Concerned about regional human rights record.",
  },
  {
    name: "Barr. Lanre Adekunle",
    title: "Attorney General & Minister of Justice",
    shortTitle: "AG",
    avatar: "LA",
    gender: "Male",
    loyalty: 72,
    competence: 68,
    relationship: "Friendly" as const,
    note: "Loyalist. Will pursue government legal strategy but has limits.",
  },
];
```

Note: the `judiciaryPersonnel` array must now be defined **inside** the component function (after the `useGame()` call), not at module level.

- [ ] **Step 3: Run TypeScript compiler**

Run: `cd aso-rock && npx tsc --noEmit`
Expected: Clean compile.

- [ ] **Step 4: Run all tests**

Run: `cd aso-rock && npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/JudiciaryTab.tsx
git commit -m "refactor: JudiciaryTab reads CJN from GameState with fallback"
```

---

### Task 7: Final verification

**Files:**
- Test: `client/src/lib/constitutionalOfficers.test.ts`

- [ ] **Step 1: Add end-to-end test with real pools**

Add to `client/src/lib/constitutionalOfficers.test.ts`:

```typescript
it("end-to-end: officers come from diverse zones with real pools", () => {
  const officers = selectConstitutionalOfficers("Lagos", "Kano", 42);
  expect(officers).toHaveLength(5);
  const zones = officers.map((o) => getZoneForState(o.state)!.name);
  // Should not include SW (Lagos) or NW (Kano)
  for (const z of zones) {
    expect(z).not.toBe("South-West");
    expect(z).not.toBe("North-West");
  }
  // Should have real names, not placeholders
  for (const o of officers) {
    expect(o.name).not.toContain("Placeholder");
    expect(o.religion).toMatch(/^(Muslim|Christian)$/);
    expect(o.gender).toMatch(/^(Male|Female)$/);
    expect(o.age).toBeGreaterThanOrEqual(45);
    expect(o.age).toBeLessThanOrEqual(72);
  }
});
```

- [ ] **Step 2: Run full test suite**

Run: `cd aso-rock && npx vitest run`
Expected: All tests pass (including the new e2e test).

- [ ] **Step 3: Run TypeScript compiler**

Run: `cd aso-rock && npx tsc --noEmit`
Expected: Clean compile — no type errors across the entire project.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/constitutionalOfficers.test.ts
git commit -m "test: add end-to-end verification for constitutional officer selection"
```
