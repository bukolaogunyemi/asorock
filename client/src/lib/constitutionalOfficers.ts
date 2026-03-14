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
// Organized as: POOLS[positionIndex][zoneIndex] = ConstitutionalCandidate[]
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
