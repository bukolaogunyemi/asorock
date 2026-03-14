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

Each candidate uses the existing `Character` interface from `gameData.ts`:

```typescript
interface ConstitutionalCandidate {
  name: string;
  portfolio: string;       // e.g., "Senate President"
  agenda: string;          // Political agenda for this character
  opinion: string;         // Initial disposition towards the player
  loyalty: number;         // 0–100
  competence: number;      // 0–100
  ambition: number;        // 0–100
  faction: string;
  relationship: "Friendly" | "Neutral" | "Wary" | "Hostile";
  avatar: string;          // 2-letter initials
  age: number;
  state: string;           // Nigerian state (determines zone)
  gender: "Male" | "Female";
  religion: "Muslim" | "Christian";
}
```

The `religion` field is new — not present on the existing `Character` type. It is added here for pool design purposes. Other character types may adopt it later.

## Selection Algorithm

Runs once at game start, after the player selects their state and VP.

**Inputs**: player state of origin, VP state of origin, deterministic seed (derived from player+VP combo, same seed used by election simulation).

**Steps**:

1. Map player state → player zone via `GEOPOLITICAL_ZONES`
2. Map VP state → VP zone
3. Collect available zones: all 6 zones minus the player's zone, minus the VP's zone (if different from the player's)
4. Shuffle the available zones using seeded RNG
5. Assign positions in order: Senate President, Deputy Senate President, Speaker, Deputy Speaker, CJN
6. For each position: take the next zone from the shuffled list, pick one candidate at random (seeded) from that zone's pool for this position
7. **Edge case — same zone for president and VP**: 5 available zones for 5 positions. Each position gets a unique zone. Perfect fit.
8. **Edge case — different zones**: 4 available zones for 5 positions. The first 4 positions each get a unique zone. The 5th position picks from any of the 4 zones (the first zone in the shuffled list is reused).

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

- **`client/src/lib/gameData.ts`** — Replace hardcoded `senateLeadership` and `houseLeadership` with a function or lazy initializer that calls `selectConstitutionalOfficers()`. Since gameData is currently static exports, this may require the selection to happen at game initialization time (in `GameContext.tsx` or during onboarding) and the results stored in GameState.

- **`client/src/components/JudiciaryTab.tsx`** — Replace the hardcoded CJN entry in `judiciaryPersonnel` with the selected CJN from GameState. The other 3 judiciary personnel (PCA, ECOWAS Court, AG) remain hardcoded — they are not part of the 5 constitutional positions.

- **`client/src/lib/GameContext.tsx`** — Call `selectConstitutionalOfficers()` during game initialization and store results in GameState.

- **`client/src/lib/gameTypes.ts`** — Add `constitutionalOfficers` field to `GameState`.

## Integration with Existing Systems

- The selected officers replace the current static characters in the Legislature and Judiciary tabs
- Their `loyalty`, `competence`, `ambition`, and `relationship` values drive the same game mechanics as the current hardcoded characters
- The `agenda` and `opinion` fields feed into narrative and decision-making the same way
- No changes to how these characters are rendered — only where the data comes from

## What This Does NOT Cover

- Federal character pressure on player-controlled appointments (future feature)
- Zonal balance scoring or UI indicators
- Religion/gender filtering at selection time (diversity is baked into pool design)
- Any changes to the election simulation
- VP candidate pool changes (VP candidates are already defined in `handcraftedCharacters.ts`)
