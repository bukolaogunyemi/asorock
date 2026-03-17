// lgaChairpersons.ts — Lazy-loaded procedural generation of 774 LGA chairpersons
// Characters are NOT stored in game state — generated on demand and cached here.

import { generateCharacterPool } from "./characterPoolGenerator";
import { LGA_BY_STATE } from "./lgaData";
import { getZoneForState } from "./zones";
import { seededRandom } from "./seededRandom";
import type { GeopoliticalZone } from "./zones";

export interface LGAChairperson {
  name: string;
  lga: string;
  state: string;
  zone: string;
  party: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  competence: number;   // 30–80
  popularity: number;  // 25–75
}

// ── Party assignment weights per zone ──────────────────────────────────
// Reflects realistic regional party dominance patterns
const ZONE_PARTY_WEIGHTS: Record<string, Array<{ party: string; weight: number }>> = {
  NW: [
    { party: "ADU", weight: 35 }, { party: "NSF", weight: 25 }, { party: "PFC", weight: 15 },
    { party: "HDP", weight: 10 }, { party: "NDM", weight: 5 }, { party: "TLA", weight: 4 },
    { party: "PAP", weight: 3 }, { party: "UPA", weight: 3 },
  ],
  NE: [
    { party: "ADU", weight: 25 }, { party: "NSF", weight: 22 }, { party: "HDP", weight: 20 },
    { party: "PFC", weight: 15 }, { party: "NDM", weight: 8 }, { party: "TLA", weight: 5 },
    { party: "PAP", weight: 3 }, { party: "UPA", weight: 2 },
  ],
  NC: [
    { party: "PFC", weight: 25 }, { party: "ADU", weight: 20 }, { party: "HDP", weight: 15 },
    { party: "UPA", weight: 15 }, { party: "NDM", weight: 10 }, { party: "NSF", weight: 8 },
    { party: "PAP", weight: 4 }, { party: "TLA", weight: 3 },
  ],
  SW: [
    { party: "ADU", weight: 25 }, { party: "NDM", weight: 22 }, { party: "UPA", weight: 20 },
    { party: "PFC", weight: 12 }, { party: "NSF", weight: 5 }, { party: "TLA", weight: 7 },
    { party: "HDP", weight: 5 }, { party: "PAP", weight: 4 },
  ],
  SE: [
    { party: "TLA", weight: 30 }, { party: "NDM", weight: 25 }, { party: "PFC", weight: 15 },
    { party: "ADU", weight: 10 }, { party: "PAP", weight: 10 }, { party: "UPA", weight: 5 },
    { party: "NSF", weight: 3 }, { party: "HDP", weight: 2 },
  ],
  SS: [
    { party: "PFC", weight: 30 }, { party: "PAP", weight: 20 }, { party: "TLA", weight: 15 },
    { party: "ADU", weight: 12 }, { party: "NDM", weight: 12 }, { party: "UPA", weight: 6 },
    { party: "HDP", weight: 3 }, { party: "NSF", weight: 2 },
  ],
};

function weightedPickParty(rng: () => number, zoneAbbrev: string): string {
  const weights = ZONE_PARTY_WEIGHTS[zoneAbbrev] ?? ZONE_PARTY_WEIGHTS.NC;
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let roll = rng() * total;
  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) return w.party;
  }
  return weights[0].party;
}

/** Simple integer hash for a state name — used to offset seed per state */
function hashState(state: string): number {
  let h = 0;
  for (let i = 0; i < state.length; i++) {
    h = (h * 31 + state.charCodeAt(i)) & 0x7fffffff;
  }
  return h % 100_000;
}

// Clamp helper
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Generate all 774 LGA chairpersons procedurally */
export function generateLGAChairpersons(seed: number = 7001): LGAChairperson[] {
  const chairpersons: LGAChairperson[] = [];

  for (const [state, lgas] of Object.entries(LGA_BY_STATE)) {
    const stateSeed = seed + hashState(state);
    const partyRng = seededRandom(stateSeed + 9999);
    const zone: GeopoliticalZone | undefined = getZoneForState(state);
    const zoneAbbrev = zone?.abbrev ?? "NC";

    // Generate characters for this state's LGAs using the pool generator
    const generated = generateCharacterPool({
      count: lgas.length,
      seed: stateSeed,
      role: "lga-chair",
      ageRange: { min: 35, max: 60 },
      genderBalance: { minFemalePercent: 20, minMalePercent: 50 },
    });

    for (let i = 0; i < lgas.length; i++) {
      const char = generated[i];
      const party = weightedPickParty(partyRng, zoneAbbrev);

      // Derive competence from administration (primary skill for LGA chairs)
      const rawCompetence = char.competencies.professional.administration;
      const competence = clamp(Math.round(rawCompetence * 0.75 + 5), 30, 80);

      // Derive popularity from charisma
      const rawCharisma = char.competencies.personal.charisma;
      const popularity = clamp(Math.round(rawCharisma * 0.7 + 5), 25, 75);

      chairpersons.push({
        name: char.name,
        lga: lgas[i],
        state,
        zone: zoneAbbrev,
        party,
        age: char.age,
        gender: char.gender,
        religion: char.religion,
        ethnicity: char.ethnicity,
        competence,
        popularity,
      });
    }
  }

  return deduplicateNames(chairpersons);
}

// ── Name deduplication ─────────────────────────────────────────────────
// The finite name pools can produce duplicates across 774 characters.
// We append a single-character Roman-style suffix (II, III, etc.) to make
// each name unique while keeping it naturalistic.
function deduplicateNames(chairs: LGAChairperson[]): LGAChairperson[] {
  const seen = new Map<string, number>();
  return chairs.map((c) => {
    const base = c.name;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (count === 0) return c;
    // Append ordinal suffix for duplicates (II, III, IV …)
    const suffixes = ["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    const suffix = suffixes[Math.min(count - 1, suffixes.length - 1)];
    return { ...c, name: `${base} ${suffix}` };
  });
}

// ── Lazy cache ─────────────────────────────────────────────────────────
let _cached: LGAChairperson[] | null = null;

export function getLGAChairpersons(): LGAChairperson[] {
  if (!_cached) _cached = generateLGAChairpersons();
  return _cached;
}

export function getChairpersonsForState(state: string): LGAChairperson[] {
  return getLGAChairpersons().filter((c) => c.state === state);
}

export function getChairpersonForLGA(state: string, lga: string): LGAChairperson | undefined {
  return getLGAChairpersons().find((c) => c.state === state && c.lga === lga);
}

/** Invalidate cache — useful when a new game starts with a different seed */
export function resetLGAChairpersonCache(): void {
  _cached = null;
}
