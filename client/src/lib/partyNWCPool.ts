// client/src/lib/partyNWCPool.ts
// Procedurally generated NWC candidate pool for party convention elections.
// ~200 challengers across 8 parties who can contest NWC positions.

import { generateCharacterPool, type GeneratedCharacter } from "./characterPoolGenerator";
import { seededRandom } from "./seededRandom";
import { getZoneForState } from "./zones";
import type { NWCPosition } from "./partyTypes";
import type { PersonalCompetencies } from "./competencyTypes";

export interface NWCCandidate {
  name: string;
  partyId: string;
  qualifiedPositions: NWCPosition[];
  zone: string;
  state: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  competence: number;
  loyalty: number;
  ambition: number;
  disposition: "supportive" | "neutral" | "hostile";
}

const PARTY_IDS = ["adu", "pfc", "ndm", "nsf", "tla", "hdp", "pap", "upa"];

const NWC_POSITIONS: NWCPosition[] = [
  "national-chairman",
  "vice-chairman",
  "national-secretary",
  "national-treasurer",
  "publicity-secretary",
  "organising-secretary",
  "legal-adviser",
  "youth-women-leader",
];

// Political traits suited to NWC aspirants
const POLITICAL_TRAITS = [
  "Grassroots Organizer",
  "Party Loyalist",
  "Reformist",
  "Populist",
  "Strategic Thinker",
  "Media Savvy",
  "Coalition Builder",
  "Power Broker",
  "Youth Champion",
  "Women's Advocate",
  "Ideologue",
  "Pragmatist",
  "Fundraiser",
  "Networker",
  "Orator",
  "Institutional Guardian",
  "Party Rebel",
  "Conciliator",
  "Disciplinarian",
  "Technocrat",
];

export function generateNWCPool(seed: number = 42): NWCCandidate[] {
  const candidates: NWCCandidate[] = [];

  for (let partyIdx = 0; partyIdx < PARTY_IDS.length; partyIdx++) {
    const partyId = PARTY_IDS[partyIdx];
    const partySeed = seed + partyIdx * 1000;

    // ~25 candidates per party = ~200 total
    const generated = generateCharacterPool({
      count: 25,
      seed: partySeed,
      role: "party-official",
      partyId,
      traitPool: POLITICAL_TRAITS,
      genderBalance: { minFemalePercent: 35, minMalePercent: 40 },
      ageRange: { min: 35, max: 68 },
    });

    for (const char of generated) {
      const qualifiedPositions = assignQualifiedPositions(
        char,
        partySeed + candidates.length,
      );

      candidates.push({
        name: char.name,
        partyId,
        qualifiedPositions,
        zone: getZoneForState(char.state)?.abbrev ?? "NC",
        state: char.state,
        age: char.age,
        gender: char.gender,
        religion: char.religion,
        ethnicity: char.ethnicity,
        avatar: char.avatar,
        traits: char.traits,
        bio: char.biography,
        education: char.education,
        competence: Math.round(
          (char.competencies.professional.administration +
            char.competencies.professional.diplomacy) /
            2,
        ),
        loyalty: char.competencies.personal.loyalty,
        ambition: char.competencies.personal.ambition,
        disposition: deriveDisposition(char.competencies.personal),
      });
    }
  }

  return candidates;
}

function assignQualifiedPositions(
  char: GeneratedCharacter,
  seed: number,
): NWCPosition[] {
  const rng = seededRandom(seed);
  const positions: NWCPosition[] = [];
  const prof = char.competencies.professional;
  const pers = char.competencies.personal;

  // Map competencies to positions
  if (prof.administration > 65 || pers.leadership > 70)
    positions.push("national-chairman");
  if (prof.diplomacy > 60) positions.push("vice-chairman");
  if (prof.administration > 60) positions.push("national-secretary");
  if (prof.economics > 65) positions.push("national-treasurer");
  if (prof.communications > 60) positions.push("publicity-secretary");
  if (pers.charisma > 65) positions.push("organising-secretary");
  if (prof.legal > 65) positions.push("legal-adviser");
  if (char.age < 50 || char.gender === "Female")
    positions.push("youth-women-leader");

  // Ensure at least 2 positions
  while (positions.length < 2) {
    const random = NWC_POSITIONS[Math.floor(rng() * NWC_POSITIONS.length)];
    if (!positions.includes(random)) positions.push(random);
  }

  // Cap at 3
  return positions.slice(0, 3);
}

function deriveDisposition(
  personal: PersonalCompetencies,
): "supportive" | "neutral" | "hostile" {
  if (personal.loyalty > 65) return "supportive";
  if (personal.loyalty < 40) return "hostile";
  return "neutral";
}

// Pre-generated pool (cached)
let _cachedPool: NWCCandidate[] | null = null;

export function getNWCCandidatePool(): NWCCandidate[] {
  if (!_cachedPool) {
    _cachedPool = generateNWCPool();
  }
  return _cachedPool;
}

/** Get candidates for a specific party and position */
export function getCandidatesForPosition(
  partyId: string,
  position: NWCPosition,
): NWCCandidate[] {
  return getNWCCandidatePool().filter(
    (c) => c.partyId === partyId && c.qualifiedPositions.includes(position),
  );
}
