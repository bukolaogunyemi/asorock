# Character Enrichment — Design Spec

**Date:** 2026-03-17
**Status:** Draft
**Scope:** Expand character data model with new fields, updated competencies, richer bios, populated career histories, and avatar infrastructure

## Overview

This spec enriches the character data model across all NPC systems. Every character in the game — from cabinet ministers to traditional rulers to procedurally generated minor diplomats — gains new structured fields, expanded competencies, and guaranteed biographical depth.

## 1. New Character Fields

### Universal fields (added to all character interfaces)

```typescript
honorific?: string;
// Values: "Chief", "Alhaji", "Hajiya", "Dr.", "Prof.", "Sen.", "Gen. (Rtd.)",
//         "Engr.", "Arc.", "Barr.", "Hon.", "HRH", "Otunba", "Igwe"
// Displayed as prefix before name in all UI contexts

traditionalTitle?: string;
// Values: freeform, e.g. "Otunba of Ijebuland", "Waziri of Sokoto", "Ochiagha of Nnewi"
// Displayed on character profile, not in compact UI

professionalBackground?: string;
// Values: "Banker", "Lawyer", "Military Officer", "Academic", "Civil Servant",
//         "Businessman", "Journalist", "Engineer", "Doctor", "Politician",
//         "Diplomat", "Religious Scholar", "Traditional Ruler", "Farmer"
// Used for career history generation and narrative context

previousOffices?: string[];
// Values: freeform strings, e.g. ["Governor of Lagos (2015-2023)", "Senator, Lagos West (2007-2015)"]
// Used to populate careerHistory at seed time

healthStatus?: "healthy" | "declining" | "critical";
// Default: "healthy". Updated by lifecycle engine health events.
// Displayed on character profile. Affects event generation for aging characters.

foreignConnections?: string[];
// Values: freeform, e.g. ["UK business interests", "Saudi diplomatic ties", "US-educated"]
// Displayed on character profile and used as context in diplomatic events

avatarId?: string;
// Reference to portrait asset. Deferred — field added now, avatar images produced separately.
// Format: "m-hausa-elder-traditional-04" or similar demographic key
```

### Where fields are added

Each NPC candidate type gets the new fields as optional properties:
- `CharacterState` in `gameTypes.ts`
- `Character` in `gameData.ts`
- `DiplomatCandidate` in `diplomatTypes.ts`
- `MilitaryCandidate` in `militaryTypes.ts`
- `TraditionalRulerCandidate` in `traditionalRulerTypes.ts`
- `ReligiousLeaderCandidate` in `religiousLeaderTypes.ts`
- `DirectorCandidate` (inferred from `directorPool.ts`)
- `GovernorCandidate` in `governorTypes.ts`
- `UnionLeaderCandidate` (inferred from `unionLeaderPool.ts`)
- `ConstitutionalCandidate` in `constitutionalOfficers.ts`
- `Senator` and `HouseRep` in `senatorPool.ts` / `houseRepPool.ts`

All new fields are optional to maintain backward compatibility with existing data.

### Honorific derivation for procedural characters

`characterPoolGenerator.ts` derives honorific from character demographics:
- Muslim male 50+ → "Alhaji"
- Muslim female 50+ → "Hajiya"
- Christian male with education containing "PhD" or "Professor" → "Prof."
- Christian male with education containing "Law" → "Barr."
- Military background → "Gen. (Rtd.)" / "Col. (Rtd.)" based on age
- Engineering background → "Engr."
- Default: no honorific

HC characters already have honorifics embedded in their names (e.g. "Alh. Aminu Kazeem"). These should be extracted into the `honorific` field and the name shortened, OR the honorific can be left embedded and the field set to match.

## 2. Competency Changes

### Professional competencies: 7 → 9

**Current:** `economics`, `diplomacy`, `security`, `media`, `legal`, `administration`, `technology`

**New:** `economics`, `diplomacy`, `security`, `communications`, `legal`, `administration`, `management`, `technology`, `politics`

Changes:
- `media` renamed to `communications` — all references updated
- `politics` added — ability to navigate political institutions, build coalitions, manage party relationships
- `management` added — operational execution ability, project delivery, team management

### Personal competencies: 7 → 8

**Current:** `loyalty`, `charisma`, `leadership`, `ambition`, `integrity`, `resilience`, `intrigue`

**New:** `loyalty`, `charisma`, `leadership`, `ambition`, `integrity`, `resilience`, `intrigue`, `discretion`

Changes:
- `discretion` added — ability to handle sensitive information, maintain confidentiality, avoid leaks

### Migration strategy

1. Update `ProfessionalCompetencies` and `PersonalCompetencies` interfaces in `competencyTypes.ts`
2. Update `PROFESSIONAL_KEYS` and `PERSONAL_KEYS` constants
3. For existing HC characters: add `politics`, `management`, `discretion` values derived from existing competencies:
   - `politics` = average of (`administration` + `diplomacy`) / 2 ± 10 random variance
   - `management` = average of (`administration` + `leadership`) / 2 ± 10 random variance
   - `discretion` = average of (`integrity` + `resilience`) / 2 ± 10 random variance
4. Rename `media` → `communications` in all pool files (find-and-replace)
5. For procedurally generated characters: `characterPoolGenerator.ts` already generates all professional/personal fields — add the 3 new ones to its generation logic
6. Update all tests that reference `media` to use `communications`
7. Update all engine functions that read `media` competency (e.g. `computeMinisterialEffectiveness`) to read `communications`

### Impact on existing systems

- `computeMinisterialEffectiveness()` in `cabinetSystem.ts` — averages professional competencies. Adding 2 more dilutes slightly but the band thresholds (80/60/40) remain the same. No functional change needed.
- `computeAffinity()` in `affinityRegistry.ts` — doesn't read competencies. No change.
- `sectorTurnProcessor.ts` — reads professional competency averages via director positions. Adding 2 more fields is handled automatically.
- Character profile UI — competency radar charts will show 9+8=17 axes instead of 7+7=14. May need minor layout adjustment.

## 3. Bio Enforcement

### Minimum 100 words for all bios

**HC pool files:** All existing bio/description strings are checked. Any under 100 words are expanded in-place with additional context about the character's career, connections, and reputation.

**Procedural generator:** `characterPoolGenerator.ts` bio generation logic is updated to produce at minimum 100 words by combining:
- Professional background sentence (15-20 words)
- Career trajectory sentence (15-20 words)
- Zone/state origin and connections (15-20 words)
- Education and expertise (15-20 words)
- Reputation/personality description (15-20 words)
- Political connections or notable achievements (15-20 words)

**Validation:** A test asserts that every character in every pool file has a bio of at least 100 words. This catches regressions when new characters are added.

## 4. Career History Population

### Never-empty careerHistory

At character creation/seeding time, `careerHistory: CareerEntry[]` is built from:

1. **`previousOffices` array** (if provided on the candidate) — each entry becomes a `CareerEntry` with `current: false`
2. **Current position** — appended as the final entry with `current: true`
3. **Fallback generation** — if no `previousOffices` and no current position yet, derive 1-3 plausible entries from `professionalBackground` + `age`:

| Background | Age 30-45 | Age 46-60 | Age 61+ |
|---|---|---|---|
| Lawyer | "Associate, [Firm]" | "Senior Advocate of Nigeria" | + "Chairman, [State] Bar Association" |
| Banker | "Branch Manager, [Bank]" | "Executive Director, [Bank]" | + "Board Member, CBN Advisory" |
| Military | "Captain, Nigerian Army" | "Brigadier General" | + "Commandant, NDA" |
| Academic | "Lecturer, [University]" | "Professor, [University]" | + "Vice Chancellor, [University]" |
| Civil Servant | "Admin Officer, [Ministry]" | "Permanent Secretary" | + "Head of Service" |
| Politician | "LGA Councillor" | "State House of Assembly Member" | + "Commissioner, [State]" |

The function `buildCareerHistory(candidate)` in a new `characterCareerBuilder.ts` utility handles this logic.

### Integration

- Called during game initialization in `GameContext.tsx` for cabinet characters
- Called during pool seeding for all other systems
- `CharacterProfile.tsx` component reads `careerHistory` — guaranteed non-empty

## 5. Avatar Infrastructure (Deferred)

The `avatarId` field is added to all character types. The `CharacterAvatar.tsx` component continues using the current emoji/initials fallback. When portrait assets are produced separately, the component will be updated to load images from `public/avatars/[avatarId].webp` with the emoji as fallback.

The `assignAvatarId(gender, ethnicity, ageGroup, roleCategory)` function is created but returns `undefined` until assets exist.

## Implementation Scope

### Files to modify (type changes)

| File | Changes |
|---|---|
| `competencyTypes.ts` | Add `politics`, `management` to professional; add `discretion` to personal; rename `media` → `communications`; update key constants |
| `gameTypes.ts` | Add 7 new optional fields to `CharacterState` |
| `gameData.ts` | Add new optional fields to `Character` interface |
| All candidate type files (~10) | Add 7 new optional fields |

### Files to modify (data changes — HC pool enrichment)

| File | Changes |
|---|---|
| `handcraftedCharacters.ts` | Add honorific, professionalBackground, previousOffices; expand short bios; add politics/management/discretion competencies |
| `diplomatPoolBatch1-4.ts` | Rename `media` → `communications`; add new competency fields; add honorific, professionalBackground |
| `diplomatInstitutionPool.ts` | Same |
| `militaryPool.ts` | Same + add rank-appropriate honorific |
| `traditionalRulerPool.ts` | Same + add traditionalTitle |
| `religiousLeaderPool.ts` | Same |
| `directorPool.ts`, `directorPoolBatch2.ts`, `directorPoolBatch3.ts` | Same |
| `businessOligarchPool.ts` | Rename `media` → `communications` in sector names if applicable |
| `governorPool.ts` | Same |
| `unionLeaderPool.ts` | Same |
| `constitutionalPools.ts` | Same |
| `senatorPool.ts`, `houseRepPool.ts` | Same |
| `godfatherProfiles.ts` | Same |

### New files

| File | Purpose |
|---|---|
| `characterCareerBuilder.ts` | `buildCareerHistory(candidate)` utility |
| `characterCareerBuilder.test.ts` | Tests for career history generation |

### Files to modify (code changes)

| File | Changes |
|---|---|
| `characterPoolGenerator.ts` | Add new competency generation, honorific derivation, bio expansion, career history building |
| `characterPoolGenerator.test.ts` | Update tests for new fields |
| `cabinetSystem.ts` | Update `media` → `communications` references |
| `sectorTurnProcessor.ts` | Update if any `media` references exist |
| `gameEngine.ts` | Update if any `media` references exist |
| `CharacterProfile.tsx` | Display new fields (honorific prefix, traditionalTitle, professionalBackground, foreignConnections, healthStatus) |
| `CharacterAvatar.tsx` | Add `avatarId` prop support (fallback to current emoji) |

## Testing Strategy

- `characterCareerBuilder.test.ts`: ~10 tests for career history generation from different backgrounds/ages
- `competencyTypes.test.ts` or update existing: verify PROFESSIONAL_KEYS has 9 entries, PERSONAL_KEYS has 8
- Bio validation test: iterate all pool files, assert every bio >= 100 words
- Rename validation: grep for `media:` in competency contexts — should find 0 (all renamed to `communications`)
- Existing test updates: all tests referencing `competencies.professional.media` updated to `.communications`
