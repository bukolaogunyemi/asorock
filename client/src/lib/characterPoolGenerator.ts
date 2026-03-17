// client/src/lib/characterPoolGenerator.ts
// Procedural character pool generator for bulk NPC generation
// Wraps existing nameGenerator + characterGeneration infrastructure

import { createNameGenerator } from "./nameGenerator";
import { generateCareerHistory, generateBiography } from "./characterGeneration";
import { seededRandom, randRange, pick } from "./seededRandom";
import { GEOPOLITICAL_ZONES } from "./zones";
import { ETHNIC_STATE_MAP } from "./nameDatabase";
import type { CharacterCompetencies, CareerEntry } from "./competencyTypes";
import type { Relationship } from "./gameTypes";

export interface PoolGenerationConfig {
  count: number;
  seed: number;
  zoneDistribution?: Record<string, number>; // zone abbrev → target count
  genderBalance?: { minFemalePercent: number; minMalePercent: number };
  ageRange?: { min: number; max: number };
  competencyBias?: string;  // professional competency to bias toward
  role?: string;            // for title generation (e.g., "senator", "governor")
  partyId?: string;         // for party-affiliated characters
  factionPool?: string[];   // factions to randomly assign from
  traitPool?: string[];     // traits to randomly pick from
}

export interface GeneratedCharacter {
  name: string;
  age: number;
  state: string;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  biography: string;
  education: string;
  faction: string;
  relationship: Relationship;
  competencies: CharacterCompetencies;
  careerHistory: CareerEntry[];
  party?: string;
}

// Education templates by region
const EDUCATION_POOLS: Record<string, string[]> = {
  NW: [
    "BUK Kano (Economics), ABU Zaria (MSc)",
    "Usmanu Danfodiyo University (Law), NIPSS",
    "ABU Zaria (Political Science), Leeds (MA)",
    "Bayero University (Public Admin), Manchester (MBA)",
    "UDUS Sokoto (Accounting), ICAN, Warwick (MSc)",
  ],
  NE: [
    "University of Maiduguri (Engineering), Cranfield (MSc)",
    "ATBU Bauchi (Business Admin), Harvard Kennedy (MPP)",
    "Modibbo Adama University (Agriculture), Reading (PhD)",
    "University of Jos (Medicine), Johns Hopkins (MPH)",
    "Abubakar Tafawa Balewa University (Science), Imperial (PhD)",
  ],
  NC: [
    "University of Jos (Law), Cambridge (LLM)",
    "University of Ilorin (Economics), Oxford (MSc)",
    "Benue State University (Political Science), SOAS (MA)",
    "FUT Minna (Engineering), MIT (MSc)",
    "Nasarawa State University (Business), LSE (MSc Finance)",
  ],
  SW: [
    "UNILAG (Law), Harvard (LLM)",
    "UI Ibadan (Economics), Cambridge (PhD)",
    "OAU Ile-Ife (Political Science), Oxford (DPhil)",
    "LASU (Business Admin), Wharton (MBA)",
    "UNAAB Abeokuta (Agriculture), Wageningen (PhD)",
  ],
  SE: [
    "UNN Nsukka (Engineering), MIT (MSc)",
    "UNEC Enugu (Law), Georgetown (LLM)",
    "FUTO Owerri (Science), Imperial College (PhD)",
    "ABSU Uturu (Economics), LSE (MSc)",
    "Nnamdi Azikiwe University (Medicine), Edinburgh (MD)",
  ],
  SS: [
    "UNIPORT (Petroleum Engineering), Stanford (PhD)",
    "UNIBEN (Law), Kings College London (LLM)",
    "DELSU (Business), INSEAD (MBA)",
    "University of Calabar (Medicine), UCL (PhD)",
    "Niger Delta University (Environmental Science), Oxford (MSc)",
  ],
};

const DEFAULT_TRAITS = [
  "Pragmatic", "Ambitious", "Cautious", "Bold", "Networked",
  "Disciplined", "Shrewd", "Loyal", "Independent", "Populist",
  "Technocratic", "Zealous", "Diplomatic", "Confrontational",
  "Reformist", "Conservative", "Charismatic", "Reserved",
  "Resilient", "Calculating",
];

const DEFAULT_FACTIONS = [
  "Northern Caucus", "South-West Alliance", "South-East Bloc",
  "Niger Delta Caucus", "Middle Belt Caucus", "Technocrats",
  "Presidential Guard", "Independent", "Labour Alliance",
  "Military Circle", "Youth Movement",
];

/** Derive a plausible ethnic group from a Nigerian state */
function ethnicGroupForState(state: string, rng: () => number): string {
  // Build reverse map: state → candidate ethnic groups
  const candidates: string[] = [];
  for (const [ethnic, states] of Object.entries(ETHNIC_STATE_MAP)) {
    if (states.includes(state)) {
      candidates.push(ethnic);
    }
  }
  if (candidates.length > 0) {
    return candidates[Math.floor(rng() * candidates.length)];
  }
  // Fallback for states with no direct mapping (e.g. Plateau, Taraba, Gombe)
  const fallbacks: Record<string, string> = {
    Plateau: "Tiv",
    Taraba: "Fulani",
    Gombe: "Hausa",
    Adamawa: "Fulani",
    Nassarawa: "Tiv",
    Nasarawa: "Tiv",
    Kogi: "Igbo",
    FCT: "Hausa",
    Ondo: "Yoruba",
    Kwara: "Yoruba",
    "Akwa Ibom": "Efik",
  };
  return fallbacks[state] ?? "Hausa";
}

function religionForState(state: string, rng: () => number): string {
  // Predominantly Muslim states
  const muslimStates = ["Kano", "Katsina", "Sokoto", "Zamfara", "Kebbi", "Jigawa",
    "Borno", "Yobe", "Bauchi", "Gombe", "Adamawa", "Niger"];
  // Predominantly Christian states
  const christianStates = ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo",
    "Rivers", "Bayelsa", "Delta", "Cross River", "Akwa Ibom", "Edo",
    "Lagos", "Ogun", "Ondo", "Ekiti", "Benue"];
  if (muslimStates.includes(state)) return rng() < 0.85 ? "Islam" : "Christianity";
  if (christianStates.includes(state)) return rng() < 0.85 ? "Christianity" : "Islam";
  return rng() < 0.5 ? "Islam" : "Christianity";
}

function relationshipFromLoyalty(loyalty: number): Relationship {
  if (loyalty >= 80) return "Loyal";
  if (loyalty >= 65) return "Friendly";
  if (loyalty >= 45) return "Neutral";
  if (loyalty >= 30) return "Wary";
  if (loyalty >= 15) return "Distrustful";
  return "Hostile";
}

export function generateCharacterPool(config: PoolGenerationConfig): GeneratedCharacter[] {
  const rng = seededRandom(config.seed);
  const nameGen = createNameGenerator(config.seed);
  const characters: GeneratedCharacter[] = [];

  const ageMin = config.ageRange?.min ?? 40;
  const ageMax = config.ageRange?.max ?? 68;
  const minFemale = config.genderBalance?.minFemalePercent ?? 35;
  const minMale = config.genderBalance?.minMalePercent ?? 35;
  const traits = config.traitPool ?? DEFAULT_TRAITS;
  const factions = config.factionPool ?? DEFAULT_FACTIONS;
  const gameYear = 2023;

  // Build zone assignment list
  let zoneAssignments: string[] = [];
  if (config.zoneDistribution) {
    for (const [zone, count] of Object.entries(config.zoneDistribution)) {
      for (let i = 0; i < count; i++) zoneAssignments.push(zone);
    }
    // Fill remaining with random zones
    while (zoneAssignments.length < config.count) {
      zoneAssignments.push(pick(rng, GEOPOLITICAL_ZONES).abbrev);
    }
  } else {
    // Even distribution across zones
    for (let i = 0; i < config.count; i++) {
      zoneAssignments.push(GEOPOLITICAL_ZONES[i % 6].abbrev);
    }
  }
  // Shuffle zone assignments
  for (let i = zoneAssignments.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [zoneAssignments[i], zoneAssignments[j]] = [zoneAssignments[j], zoneAssignments[i]];
  }

  // Enforce gender balance
  let femaleCount = 0;
  let maleCount = 0;
  const targetFemale = Math.ceil(config.count * minFemale / 100);
  const targetMale = Math.ceil(config.count * minMale / 100);

  for (let i = 0; i < config.count; i++) {
    const zoneAbbrev = zoneAssignments[i];
    const zone = GEOPOLITICAL_ZONES.find(z => z.abbrev === zoneAbbrev) ?? GEOPOLITICAL_ZONES[0];
    const state = pick(rng, zone.states);

    // Gender enforcement
    let gender: "Male" | "Female";
    const remainingSlots = config.count - i;
    const femaleNeeded = targetFemale - femaleCount;
    const maleNeeded = targetMale - maleCount;
    if (femaleNeeded >= remainingSlots - maleNeeded) {
      gender = "Female";
    } else if (maleNeeded >= remainingSlots - femaleNeeded) {
      gender = "Male";
    } else {
      gender = rng() < 0.5 ? "Male" : "Female";
    }
    if (gender === "Female") femaleCount++;
    else maleCount++;

    const age = randRange(rng, ageMin, ageMax);
    const religion = religionForState(state, rng);

    // Determine ethnic group from state
    const ethnicGroup = ethnicGroupForState(state, rng);

    // Generate name using the stateful name generator
    const nameResult = nameGen.next({
      ethnicGroup,
      gender: gender === "Female" ? "female" : "male",
      role: config.role,
    });
    const name = nameResult.fullName;
    const ethnicity = nameResult.ethnicGroup;
    const avatar = name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();

    // Generate competencies
    const biasField = config.competencyBias;
    const professional = {
      economics: randRange(rng, 30, 90),
      diplomacy: randRange(rng, 30, 90),
      security: randRange(rng, 30, 90),
      communications: randRange(rng, 30, 85),
      legal: randRange(rng, 30, 85),
      administration: randRange(rng, 40, 90),
      management: randRange(rng, 30, 85),
      technology: randRange(rng, 25, 80),
      politics: randRange(rng, 25, 80),
    };
    // Bias one field higher
    if (biasField && biasField in professional) {
      (professional as Record<string, number>)[biasField] = randRange(rng, 60, 95);
    }

    const personal = {
      loyalty: randRange(rng, 20, 85),
      charisma: randRange(rng, 30, 90),
      leadership: randRange(rng, 35, 90),
      ambition: randRange(rng, 20, 90),
      integrity: randRange(rng, 25, 90),
      resilience: randRange(rng, 30, 85),
      intrigue: randRange(rng, 15, 80),
      discretion: randRange(rng, 20, 80),
    };

    const competencies: CharacterCompetencies = { professional, personal };

    // Pick 2-3 traits (without replacement)
    const traitCount = randRange(rng, 2, 3);
    const charTraits: string[] = [];
    const traitsCopy = [...traits];
    for (let t = 0; t < traitCount && traitsCopy.length > 0; t++) {
      const idx = Math.floor(rng() * traitsCopy.length);
      charTraits.push(traitsCopy[idx]);
      traitsCopy.splice(idx, 1);
    }

    // Generate education from zone pool
    const education = pick(rng, EDUCATION_POOLS[zoneAbbrev] ?? EDUCATION_POOLS.SW);

    // Generate faction
    const faction = pick(rng, factions);

    // Generate career history using top competency domains
    const topCompetencies = Object.entries(professional)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => k);
    const careerHistory = generateCareerHistory({
      age,
      state,
      topCompetencies,
      currentPosition: config.role ?? "Government Official",
      gameYear,
      seed: config.seed + i,
    });

    // Generate biography
    const biography = generateBiography({
      name,
      state,
      ethnicity,
      education,
      traits: charTraits,
      faction,
      careerHighlight: careerHistory[1]?.position ?? "a senior government position",
      party: config.partyId ?? "the ruling party",
      seed: config.seed + i + 1000,
    });

    const relationship = relationshipFromLoyalty(personal.loyalty);

    characters.push({
      name,
      age,
      state,
      gender,
      religion,
      ethnicity,
      avatar,
      traits: charTraits,
      biography,
      education,
      faction,
      relationship,
      competencies,
      careerHistory,
      party: config.partyId,
    });
  }

  return characters;
}
