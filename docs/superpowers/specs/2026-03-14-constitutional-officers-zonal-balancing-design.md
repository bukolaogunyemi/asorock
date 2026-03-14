# Constitutional Officers — Zonal Balancing Design

## Goal

Replace the hardcoded Senate President, Deputy Senate President, Speaker of the House, Deputy Speaker, and Chief Justice of Nigeria with dynamically selected characters based on the player's state of origin and VP selection, enforcing Nigeria's federal character principle: no two of these positions should come from the same geopolitical zone, and neither should overlap with the president's or VP's zone.

## Scope

This spec covers only the 5 constitutional positions auto-populated at game start. The broader federal character pressure system for player-controlled appointments (cabinet, advisers) is a separate future feature.

## Positions

| # | Position | Current Location |
|---|----------|-----------------|
| 1 | Senate President | `gameData.ts` → `senateLeadership[0]` |
| 2 | Deputy Senate President | `gameData.ts` → `senateLeadership[1]` |
| 3 | Speaker of the House | `gameData.ts` → `houseLeadership[0]` |
| 4 | Deputy Speaker | `gameData.ts` → `houseLeadership[1]` |
| 5 | Chief Justice of Nigeria | `JudiciaryTab.tsx` → `judiciaryPersonnel[0]` |

## Candidate Pools

Each position has 30 candidates: 5 per geopolitical zone (North-Central, North-West, North-East, South-West, South-East, South-South).

### Pool Design Rules

Each zone's 5 candidates per position must include:
- **Gender**: At least 2 women (so ~40% across the full pool)
- **Religion**: At least 2 Muslim and 2 Christian per zone, reflecting the zone's actual religious makeup (northern zones skew Muslim, southern zones skew Christian, but minorities exist everywhere)

Diversity is enforced at pool authoring time, not at selection time. This ensures random selection from any zone's pool naturally produces balanced results without algorithmic filtering.

### Candidate Shape

`ConstitutionalCandidate` extends the existing `Character` interface from `gameData.ts`, adding required fields that are optional on `Character` and a new `religion` field:

```typescript
import type { Character } from "./gameData";

interface ConstitutionalCandidate extends Character {
  age: number;             // Required (optional on Character)
  state: string;           // Required — determines zone
  gender: "Male" | "Female"; // Required (optional on Character)
  religion: "Muslim" | "Christian"; // New field for pool design
  // relationship uses the full Relationship union from gameTypes.ts:
  // "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile"
}
```

The `religion` field is new — not present on the existing `Character` type. It is added here for pool design purposes. Other character types may adopt it later.

### Conversion to CharacterState

When selected officers are stored in `GameState`, each `ConstitutionalCandidate` is converted to a `CharacterState` object with these defaults for fields not present on the candidate:

- `traits`: `[]` (empty — constitutional officers don't have trait-driven mechanics yet)
- `betrayalThreshold`: derived from `loyalty` (e.g., `100 - loyalty`)
- `hooks`: `[]` (empty)

This conversion happens inside `selectConstitutionalOfficers()` or at the call site in `GameContext.tsx`.

### Judiciary Adapter

The CJN candidate uses the `ConstitutionalCandidate` shape but `JudiciaryTab.tsx` renders `judiciaryPersonnel` entries with `title`, `shortTitle`, and `note` fields. The CJN entry is mapped at render time:

- `title` ← `"Chief Justice of Nigeria"` (constant)
- `shortTitle` ← `"CJN"` (constant)
- `note` ← `opinion` (from the candidate)
- `name`, `avatar`, `gender`, `loyalty`, `competence`, `relationship` ← direct from candidate

## Selection Algorithm

Runs once at game start, after the player selects their state and VP.

**Inputs**: player state of origin, VP state of origin, deterministic seed.

**Seed derivation**: Use the same hash approach as `generateElectionResults` in `OnboardingFlow.tsx` — iterate over the characters of `playerParty + playerState + vpState`, applying `((seed << 5) - seed + charCode) | 0`. Pass the absolute value to the seeded RNG. The selection function receives the seed as a parameter; the caller (GameContext or OnboardingFlow) computes it.

**Steps**:

1. Map player state → player zone via `GEOPOLITICAL_ZONES`
2. Map VP state → VP zone
3. Collect available zones: all 6 zones minus the player's zone, minus the VP's zone (if different from the player's)
4. Shuffle the available zones using seeded RNG
5. Assign positions in order: Senate President, Deputy Senate President, Speaker, Deputy Speaker, CJN
6. For each position: take the next zone from the shuffled list, pick one candidate at random (seeded) from that zone's pool for this position
7. **Edge case — president and VP from the same zone**: Only 1 zone excluded, leaving 5 available zones for 5 positions. Each position gets a unique zone. Perfect fit.
8. **Edge case — president and VP from different zones**: 2 zones excluded, leaving 4 available zones for 5 positions. The first 4 positions each get a unique zone. The 5th position picks from any of the 4 zones (the first zone in the shuffled list is reused).

**Output**: An array of 5 `ConstitutionalCandidate` objects, one per position.

The function is pure (deterministic given the same inputs) and has no side effects.

## File Structure

### New Files

- **`client/src/lib/zones.ts`** — Extract `GEOPOLITICAL_ZONES` constant from `OnboardingFlow.tsx` into a shared module. Both `OnboardingFlow.tsx` and the selection logic import from here.

- **`client/src/lib/constitutionalOfficers.ts`** — Contains:
  - `CONSTITUTIONAL_POOLS`: The 150 candidate definitions, organized as `Record<Position, Record<ZoneName, ConstitutionalCandidate[]>>`
  - `selectConstitutionalOfficers(playerState: string, vpState: string, seed: number): ConstitutionalCandidate[]`: The selection function
  - `ConstitutionalCandidate` type export

### Modified Files

- **`client/src/components/OnboardingFlow.tsx`** — Replace inline `GEOPOLITICAL_ZONES` with import from `zones.ts`

- **`client/src/lib/gameData.ts`** — Remove the hardcoded `senateLeadership` and `houseLeadership` exports (or make them fallbacks). These are replaced by the dynamically selected officers stored in GameState.

- **`client/src/components/LegislatureTab.tsx`** — Currently imports `senateLeadership` and `houseLeadership` from `gameData.ts` (lines 24-25). Change to read from GameState via `useGame()` hook instead. The `allLeaders` array (line 95) becomes `state.constitutionalOfficers.filter(o => o.portfolio !== "Chief Justice of Nigeria")`.

- **`client/src/components/JudiciaryTab.tsx`** — Replace the hardcoded CJN entry in `judiciaryPersonnel` with the selected CJN from GameState, mapped to the judiciary render shape (see "Judiciary Adapter" above). The other 3 judiciary personnel (PCA, ECOWAS Court, AG) remain hardcoded — they are not part of the 5 constitutional positions.

- **`client/src/lib/GameContext.tsx`** — Call `selectConstitutionalOfficers()` during game initialization and store results in GameState.

- **`client/src/lib/gameTypes.ts`** — Add `constitutionalOfficers: ConstitutionalCandidate[]` field to `GameState`. This is an array of exactly 5 entries, ordered: Senate President, Deputy Senate President, Speaker, Deputy Speaker, CJN.

## Integration with Existing Systems

- The selected officers replace the current static characters in the Legislature and Judiciary tabs
- Their `loyalty`, `competence`, `ambition`, and `relationship` values drive the same game mechanics as the current hardcoded characters
- The `agenda` and `opinion` fields feed into narrative and decision-making the same way
- LegislatureTab and JudiciaryTab switch from static imports to reading from GameState, with a mapping adapter for the CJN entry

## What This Does NOT Cover

- Federal character pressure on player-controlled appointments (future feature)
- Zonal balance scoring or UI indicators
- Religion/gender filtering at selection time (diversity is baked into pool design)
- Any changes to the election simulation
- VP candidate pool changes (VP candidates are already defined in `handcraftedCharacters.ts`)
