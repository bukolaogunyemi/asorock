# Character Enrichment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the character data model with new fields, updated competencies (7→9 professional, 7→8 personal), richer bios (100-word minimum), populated career histories, and avatar infrastructure.

**Architecture:** Three chunks executed sequentially. Chunk 1 modifies types and constants (everything depends on this). Chunk 2 adds the career builder utility and bio enforcement. Chunk 3 enriches HC pool data across ~20 files with new field values and expanded bios. Each chunk produces independently testable, committable code.

**Tech Stack:** React 18, TypeScript 5.6, Vite 7.3, Vitest

**Spec:** `docs/superpowers/specs/2026-03-17-character-enrichment-design.md`

**Test command:** `npx vitest run`

---

## File Structure

### New files
| File | Responsibility |
|---|---|
| `client/src/lib/characterCareerBuilder.ts` | `buildCareerHistory(candidate)` utility — generates CareerEntry[] from previousOffices + professionalBackground + age |
| `client/src/lib/characterCareerBuilder.test.ts` | Tests for career history builder |

### Modified files — Type system (Chunk 1)
| File | Changes |
|---|---|
| `client/src/lib/competencyTypes.ts` | Add `politics`, `management` to ProfessionalCompetencies; add `discretion` to PersonalCompetencies; rename `media` → `communications`; update PROFESSIONAL_KEYS (9) and PERSONAL_KEYS (8) |
| `client/src/lib/competencyUtils.ts` | Rename `media` → `communications` in keyword mapping (values only, keep `media` as lookup key); update `averageProfessionalCompetence()` divisor from 7 → 9 |
| `client/src/lib/gameTypes.ts` | Add 7 new optional fields to `CharacterState`: honorific, traditionalTitle, professionalBackground, previousOffices, healthStatus, foreignConnections, avatarId |
| `client/src/lib/gameData.ts` | Add same 7 optional fields to `Character` interface |
| `client/src/lib/diplomatTypes.ts` | Add new fields to `DiplomatCandidate` |
| `client/src/lib/militaryTypes.ts` | Add new fields to `MilitaryCandidate` |
| `client/src/lib/traditionalRulerTypes.ts` | Add new fields to `TraditionalRulerCandidate` |
| `client/src/lib/religiousLeaderTypes.ts` | Add new fields to `ReligiousLeaderCandidate` |
| `client/src/lib/governorTypes.ts` | Add new fields to `GovernorCandidate` |
| `client/src/lib/unionTypes.ts` | Add new fields to union leader candidate type |
| `client/src/lib/constitutionalOfficers.ts` | Add new fields to `ConstitutionalCandidate` |

### Modified files — Code changes (Chunk 1 continued)
| File | Changes |
|---|---|
| `client/src/lib/advisoryWhispers.ts` | Rename `media` → `communications` in portfolio-to-competency mapping |
| `client/src/lib/characterGeneration.ts` | Update competency references; expand `generateBiography()` for 100+ words |
| `client/src/lib/characterPoolGenerator.ts` | Add new competency generation (politics, management, discretion); add honorific derivation; update `GeneratedCharacter` interface |
| `client/src/lib/cabinetSystem.ts` | Update `media` → `communications` references |

### Modified files — Pool data enrichment (Chunk 3)
| File | Changes |
|---|---|
| `client/src/lib/handcraftedCharacters.ts` | Add honorific, professionalBackground, previousOffices; add politics/management/discretion; rename media→communications |
| `client/src/lib/diplomatPoolBatch1.ts` | Rename media→communications; add politics, management, discretion values |
| `client/src/lib/diplomatPoolBatch2.ts` | Same |
| `client/src/lib/diplomatPoolBatch3.ts` | Same |
| `client/src/lib/diplomatPoolBatch4.ts` | Same |
| `client/src/lib/diplomatInstitutionPool.ts` | Same |
| `client/src/lib/militaryPool.ts` | Same + add rank-appropriate honorific |
| `client/src/lib/traditionalRulerPool.ts` | Same + add traditionalTitle |
| `client/src/lib/religiousLeaderPool.ts` | Same |
| `client/src/lib/directorPool.ts` | Same |
| `client/src/lib/directorPoolBatch2.ts` | Same |
| `client/src/lib/directorPoolBatch3.ts` | Same |
| `client/src/lib/governorPool.ts` | Same |
| `client/src/lib/unionLeaderPool.ts` | Same |
| `client/src/lib/constitutionalPools.ts` | Same |
| `client/src/lib/senatorPool.ts` | Same |
| `client/src/lib/houseRepPool.ts` | Same |
| `client/src/lib/godfatherProfiles.ts` | Same |

---

## Chunk 1: Type System + Competency Changes

### Task 1: Update Competency Types and Constants

**Files:**
- Modify: `client/src/lib/competencyTypes.ts`

- [ ] **Step 1: Update ProfessionalCompetencies interface**

Add `politics` and `management` fields. Rename `media` to `communications`:
```typescript
export interface ProfessionalCompetencies {
  economics: number;
  diplomacy: number;
  security: number;
  communications: number;  // renamed from 'media'
  legal: number;
  administration: number;
  management: number;       // NEW
  technology: number;
  politics: number;         // NEW
}
```

- [ ] **Step 2: Update PersonalCompetencies interface**

Add `discretion` field:
```typescript
export interface PersonalCompetencies {
  loyalty: number;
  charisma: number;
  leadership: number;
  ambition: number;
  integrity: number;
  resilience: number;
  intrigue: number;
  discretion: number;  // NEW
}
```

- [ ] **Step 3: Update PROFESSIONAL_KEYS and PERSONAL_KEYS constants**

```typescript
export const PROFESSIONAL_KEYS = [
  "economics", "diplomacy", "security", "communications", "legal", "administration", "management", "technology", "politics",
] as const;

export const PERSONAL_KEYS = [
  "loyalty", "charisma", "leadership", "ambition", "integrity", "resilience", "intrigue", "discretion",
] as const;
```

- [ ] **Step 4: Run tests to check what breaks**

Run: `npx vitest run`
Expected: Multiple failures — any test referencing `media` on competencies will fail. Note the count.

- [ ] **Step 5: Commit type changes**

```bash
git add client/src/lib/competencyTypes.ts
git commit -m "feat: expand competencies — 9 professional (add politics, management; rename media→communications) + 8 personal (add discretion)"
```

### Task 2: Update Competency Utils

**Files:**
- Modify: `client/src/lib/competencyUtils.ts`
- Modify: `client/src/lib/competencyUtils.test.ts` (if exists)

- [ ] **Step 1: Update keyword-to-competency mapping**

In the keyword mapping, change VALUES from `"media"` to `"communications"` but keep `"media"` as a lookup KEY:
```typescript
// Before: media: "media", press: "media", broadcast: "media"
// After:
media: "communications", press: "communications", broadcast: "communications",
communication: "communications", information: "communications",
// Add new competency mappings:
politics: "politics", political: "politics", party: "politics", coalition: "politics",
management: "management", operations: "management", execution: "management", delivery: "management",
```

- [ ] **Step 2: Update averageProfessionalCompetence()**

Find the function that sums professional competency values and divides by 7. Change the divisor to 9 and add the two new fields to the sum. If it uses `Object.values()` or iterates `PROFESSIONAL_KEYS`, it may self-adjust — verify.

- [ ] **Step 3: Run tests**

Run: `npx vitest run client/src/lib/competencyUtils.test.ts`
Expected: PASS (or fix any failures from the rename)

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/competencyUtils.ts client/src/lib/competencyUtils.test.ts
git commit -m "feat: update competencyUtils — media→communications mapping, averageProfessionalCompetence /9"
```

### Task 3: Update Other Engine Files for media→communications

**Files:**
- Modify: `client/src/lib/advisoryWhispers.ts`
- Modify: `client/src/lib/characterGeneration.ts`
- Modify: `client/src/lib/cabinetSystem.ts`
- Modify: `client/src/lib/characterPoolGenerator.ts`

- [ ] **Step 1: Fix advisoryWhispers.ts**

Find the portfolio-to-competency mapping and rename `media` key to `communications` (in competency context only).

- [ ] **Step 2: Fix characterGeneration.ts**

Find any references to `competencies.professional.media` and rename to `.communications`. Add generation logic for `politics`, `management`, `discretion` if this file generates competency values.

- [ ] **Step 3: Fix cabinetSystem.ts**

Find any `media` references in competency contexts and rename to `communications`.

- [ ] **Step 4: Fix characterPoolGenerator.ts**

Add generation of `politics`, `management` (professional) and `discretion` (personal) values. Rename `media` → `communications` in generation logic. Add `honorific` to `GeneratedCharacter` interface.

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass. If any still reference `.media` in competency contexts, fix them.

- [ ] **Step 6: Fix any remaining test files referencing `.media` competency**

Search across all test files: `grep -r "\.media" client/src/lib/*.test.ts` — update each to `.communications`.

IMPORTANT: Do NOT rename `ActiveEvent.category: "media"`, `BusinessSector: "media-entertainment"`, `MediaTab.tsx`, or any prose/UI uses of the word "media".

- [ ] **Step 7: Run full test suite again**

Run: `npx vitest run`
Expected: All 1480+ tests pass

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: complete media→communications rename across engine files and tests"
```

### Task 4: Add New Fields to Type Interfaces

**Files:**
- Modify: `client/src/lib/gameTypes.ts`
- Modify: `client/src/lib/gameData.ts`
- Modify: All candidate type files (~10 files)

- [ ] **Step 1: Add fields to CharacterState in gameTypes.ts**

```typescript
// Add to CharacterState interface:
honorific?: string;
traditionalTitle?: string;
professionalBackground?: string;
previousOffices?: string[];
healthStatus?: "healthy" | "declining" | "critical";
foreignConnections?: string[];
avatarId?: string;
```

- [ ] **Step 2: Add fields to Character in gameData.ts**

Same 7 optional fields.

- [ ] **Step 3: Add fields to all candidate type interfaces**

Add the same 7 optional fields to each candidate type across:
- `diplomatTypes.ts` (DiplomatCandidate)
- `militaryTypes.ts` (MilitaryCandidate)
- `traditionalRulerTypes.ts` (TraditionalRulerCandidate)
- `religiousLeaderTypes.ts` (ReligiousLeaderCandidate)
- `governorTypes.ts` (GovernorCandidate)
- `unionTypes.ts` (union leader candidate type)
- `constitutionalOfficers.ts` (ConstitutionalCandidate)
- `directorTypes.ts` (if separate from directorPool)

All fields are optional — this is backward compatible and should not break any tests.

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All pass (optional fields don't break anything)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add honorific, traditionalTitle, professionalBackground, previousOffices, healthStatus, foreignConnections, avatarId to all character types"
```

---

## Chunk 2: Career Builder + Bio Enforcement

### Task 5: Create Career History Builder

**Files:**
- Create: `client/src/lib/characterCareerBuilder.ts`
- Create: `client/src/lib/characterCareerBuilder.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { buildCareerHistory } from "./characterCareerBuilder";

describe("buildCareerHistory", () => {
  it("creates entries from previousOffices", () => {
    const result = buildCareerHistory({
      previousOffices: ["Governor of Lagos (2015-2023)", "Senator, Lagos West (2007-2015)"],
      currentPosition: "Minister of Finance",
    });
    expect(result).toHaveLength(3);
    expect(result[0].position).toBe("Governor of Lagos");
    expect(result[0].current).toBe(false);
    expect(result[2].current).toBe(true);
  });

  it("generates plausible history from professionalBackground when no previousOffices", () => {
    const result = buildCareerHistory({
      professionalBackground: "Lawyer",
      age: 55,
      currentPosition: "Chief of Staff",
    });
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[result.length - 1].current).toBe(true);
  });

  it("generates different histories for different age brackets", () => {
    const young = buildCareerHistory({ professionalBackground: "Banker", age: 38 });
    const senior = buildCareerHistory({ professionalBackground: "Banker", age: 62 });
    expect(senior.length).toBeGreaterThan(young.length);
  });

  it("always returns at least one entry", () => {
    const result = buildCareerHistory({});
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("handles military background with appropriate ranks", () => {
    const result = buildCareerHistory({ professionalBackground: "Military Officer", age: 58 });
    expect(result.some(e => /General|Colonel|Brigadier/.test(e.position))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/characterCareerBuilder.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement buildCareerHistory()**

```typescript
import type { CareerEntry } from "./competencyTypes";

interface CareerBuilderInput {
  previousOffices?: string[];
  currentPosition?: string;
  professionalBackground?: string;
  age?: number;
}

const CAREER_TEMPLATES: Record<string, { young: string[]; mid: string[]; senior: string[] }> = {
  Lawyer: {
    young: ["Associate, Legal Chambers"],
    mid: ["Senior Advocate of Nigeria", "Managing Partner, Legal Associates"],
    senior: ["Chairman, Nigerian Bar Association Chapter", "Senior Counsel"],
  },
  Banker: {
    young: ["Branch Manager, Commercial Bank"],
    mid: ["Executive Director, Merchant Bank"],
    senior: ["Board Member, Central Bank Advisory"],
  },
  "Military Officer": {
    young: ["Captain, Nigerian Army"],
    mid: ["Brigadier General, Nigerian Army"],
    senior: ["Major General (Rtd.)"],
  },
  Academic: {
    young: ["Lecturer, Federal University"],
    mid: ["Professor, Federal University"],
    senior: ["Vice Chancellor, State University"],
  },
  "Civil Servant": {
    young: ["Administrative Officer, Federal Ministry"],
    mid: ["Permanent Secretary, State Government"],
    senior: ["Head of Civil Service"],
  },
  Politician: {
    young: ["LGA Councillor"],
    mid: ["Member, State House of Assembly"],
    senior: ["Commissioner, State Government"],
  },
  // ... other backgrounds with similar templates
};

export function buildCareerHistory(input: CareerBuilderInput): CareerEntry[] {
  const entries: CareerEntry[] = [];
  const age = input.age ?? 50;
  const ageGroup = age < 46 ? "young" : age < 61 ? "mid" : "senior";

  // From previousOffices
  if (input.previousOffices?.length) {
    for (const office of input.previousOffices) {
      const match = office.match(/^(.+?)(?:\s*\((\d{4}[-–]\d{4})\))?$/);
      entries.push({
        position: match?.[1]?.trim() ?? office,
        period: match?.[2] ?? "",
        current: false,
      });
    }
  }
  // From professional background templates
  else if (input.professionalBackground) {
    const template = CAREER_TEMPLATES[input.professionalBackground] ?? CAREER_TEMPLATES["Politician"];
    if (template) {
      entries.push(...template.young.map(p => ({ position: p, period: "", current: false })));
      if (ageGroup !== "young") {
        entries.push(...template.mid.map(p => ({ position: p, period: "", current: false })));
      }
      if (ageGroup === "senior") {
        entries.push(...template.senior.map(p => ({ position: p, period: "", current: false })));
      }
    }
  }

  // Current position
  if (input.currentPosition) {
    entries.push({ position: input.currentPosition, period: "Present", current: true });
  }

  // Fallback
  if (entries.length === 0) {
    entries.push({ position: "Public Service", period: "", current: false });
  }

  return entries;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/lib/characterCareerBuilder.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/characterCareerBuilder.ts client/src/lib/characterCareerBuilder.test.ts
git commit -m "feat: career history builder — generates CareerEntry[] from background and previous offices"
```

### Task 6: Bio Enforcement — Expand generateBiography()

**Files:**
- Modify: `client/src/lib/characterGeneration.ts`
- Modify: `client/src/lib/characterPoolGenerator.ts`

- [ ] **Step 1: Update generateBiography() to produce 100+ words**

Read the existing `generateBiography()` function. Expand it to combine multiple template sentences:
- Professional background sentence (15-20 words)
- Career trajectory sentence (15-20 words)
- Zone/state connections (15-20 words)
- Education and expertise (15-20 words)
- Reputation/personality (15-20 words)
- Political connections (15-20 words)

Use the character's demographics (zone, ethnicity, religion, education, professionalBackground) to select appropriate templates.

- [ ] **Step 2: Update characterPoolGenerator.ts**

Ensure the procedural generator calls the expanded `generateBiography()` and passes all available demographics. Add `honorific` derivation logic:
```typescript
function deriveHonorific(gender: string, religion: string, age: number, education?: string, background?: string): string | undefined {
  if (background?.includes("Military")) return age > 55 ? "Gen. (Rtd.)" : "Col. (Rtd.)";
  if (education?.includes("PhD") || education?.includes("Professor")) return "Prof.";
  if (education?.includes("Law") || background === "Lawyer") return "Barr.";
  if (background === "Engineer") return "Engr.";
  if (religion === "Islam" && age >= 50) return gender === "Female" ? "Hajiya" : "Alhaji";
  return undefined;
}
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/characterGeneration.ts client/src/lib/characterPoolGenerator.ts
git commit -m "feat: bio enforcement (100+ words) and honorific derivation for procedural characters"
```

### Task 7: Bio Validation Test

**Files:**
- Create or modify: `client/src/lib/characterPoolGenerator.test.ts`

- [ ] **Step 1: Write bio length validation test**

```typescript
describe("bio enforcement", () => {
  it("generateBiography produces at least 100 words", () => {
    // Generate 20 characters with different demographics
    // Assert each bio has >= 100 words
    for (let seed = 1; seed <= 20; seed++) {
      const char = generateCharacterFromSeed(seed, { /* various demographics */ });
      const wordCount = char.bio.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(100);
    }
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run client/src/lib/characterPoolGenerator.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/characterPoolGenerator.test.ts
git commit -m "test: bio validation — assert procedural bios meet 100-word minimum"
```

---

## Chunk 3: HC Pool Data Enrichment

This is the largest chunk — updating ~20 pool files with new competency fields and data. Each pool file needs:
1. `media:` → `communications:` in competency objects
2. `politics:` and `management:` values added to professional competencies
3. `discretion:` value added to personal competencies
4. `honorific`, `professionalBackground`, `previousOffices` added where appropriate

### Task 8: Enrich handcraftedCharacters.ts

**Files:**
- Modify: `client/src/lib/handcraftedCharacters.ts`

- [ ] **Step 1: Rename media→communications in all competency objects**

Find-and-replace within competency contexts only: `media:` → `communications:` in `{ professional: { ... } }` blocks.

- [ ] **Step 2: Add politics, management, discretion to all candidates**

For each candidate with competencies, derive:
- `politics` = Math.round((administration + diplomacy) / 2 + (Math.random() * 20 - 10))
- `management` = Math.round((administration + leadership) / 2 + (Math.random() * 20 - 10))
- `discretion` = Math.round((integrity + resilience) / 2 + (Math.random() * 20 - 10))

Clamp all to 0-100. Use deterministic variance (not Math.random) — base on name hash.

- [ ] **Step 3: Add honorific and professionalBackground to inner circle candidates**

For each of the 7 inner circle position groups + 5 PA candidates + 16 cabinet candidates, add:
- `honorific`: derived from name prefix already in the name string (e.g., "Alh." → "Alhaji")
- `professionalBackground`: derived from their bio/description

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/handcraftedCharacters.ts
git commit -m "feat: enrich handcraftedCharacters — new competencies, honorifics, professional backgrounds"
```

### Task 9: Enrich Diplomat Pool Files (4 batches + institution)

**Files:**
- Modify: `client/src/lib/diplomatPoolBatch1.ts`
- Modify: `client/src/lib/diplomatPoolBatch2.ts`
- Modify: `client/src/lib/diplomatPoolBatch3.ts`
- Modify: `client/src/lib/diplomatPoolBatch4.ts`
- Modify: `client/src/lib/diplomatInstitutionPool.ts`

- [ ] **Step 1: For each file, rename media→communications in competency objects**

- [ ] **Step 2: Add politics, management, discretion values**

Derive from existing competencies using the same formula as Task 8.

- [ ] **Step 3: Add honorific where appropriate**

Diplomats with "Dr." or "Amb." in their names get corresponding honorific field.

- [ ] **Step 4: Run full test suite**

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/diplomatPoolBatch*.ts client/src/lib/diplomatInstitutionPool.ts
git commit -m "feat: enrich diplomat pools — new competencies and honorifics"
```

### Task 10: Enrich Military, Traditional Ruler, Religious Leader Pools

**Files:**
- Modify: `client/src/lib/militaryPool.ts`
- Modify: `client/src/lib/traditionalRulerPool.ts`
- Modify: `client/src/lib/religiousLeaderPool.ts`

- [ ] **Step 1: Rename media→communications, add new competencies**

Same pattern as Tasks 8-9.

- [ ] **Step 2: Add system-specific fields**

- Military: `honorific` from rank (e.g., "Gen. (Rtd.)" for generals)
- Traditional rulers: `traditionalTitle` from their position name
- Religious leaders: `honorific` (e.g., "Rev. Dr.", "Sheikh", "Alhaji")

- [ ] **Step 3: Run full test suite**

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/militaryPool.ts client/src/lib/traditionalRulerPool.ts client/src/lib/religiousLeaderPool.ts
git commit -m "feat: enrich military, traditional ruler, religious leader pools"
```

### Task 11: Enrich Director, Governor, Union, Constitutional, Legislature Pools

**Files:**
- Modify: `client/src/lib/directorPool.ts`, `directorPoolBatch2.ts`, `directorPoolBatch3.ts`
- Modify: `client/src/lib/governorPool.ts`
- Modify: `client/src/lib/unionLeaderPool.ts`
- Modify: `client/src/lib/constitutionalPools.ts`
- Modify: `client/src/lib/senatorPool.ts`, `houseRepPool.ts`
- Modify: `client/src/lib/godfatherProfiles.ts`

- [ ] **Step 1: Rename media→communications, add new competencies in all files**

- [ ] **Step 2: Add honorific where names have obvious prefixes**

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All 1480+ tests pass

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/directorPool*.ts client/src/lib/governorPool.ts client/src/lib/unionLeaderPool.ts client/src/lib/constitutionalPools.ts client/src/lib/senatorPool.ts client/src/lib/houseRepPool.ts client/src/lib/godfatherProfiles.ts
git commit -m "feat: enrich all remaining pool files — competencies, honorifics"
```

### Task 12: Final Validation

**Files:**
- No new files

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Verify no remaining `media:` in competency contexts**

Run: `grep -rn "professional.*media\|media.*[0-9]" client/src/lib/*.ts | grep -v "media-entertainment\|MediaTab\|category.*media"`
Expected: 0 results

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: character enrichment complete — 17 competencies, new fields, career builder, bio enforcement

- Professional competencies: 7→9 (add politics, management; rename media→communications)
- Personal competencies: 7→8 (add discretion)
- New fields: honorific, traditionalTitle, professionalBackground, previousOffices, healthStatus, foreignConnections, avatarId
- Career history builder: generates CareerEntry[] from background + previous offices
- Bio enforcement: 100-word minimum for procedural bios
- All ~20 HC pool files enriched with new competency values

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```
