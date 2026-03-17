// client/src/lib/judiciaryPool.ts
// Procedurally generated candidate pools for Supreme Court and Court of Appeal justices

import { generateCharacterPool } from "./characterPoolGenerator";
import { seededRandom, pick } from "./seededRandom";
import { getZoneForState } from "./zones";
import type { JudicialPhilosophy } from "./judiciaryTypes";

export interface JusticeCandidate {
  name: string;
  state: string;
  zone: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  competence: number;        // 50-95
  integrity: number;         // 40-95
  philosophy: JudicialPhilosophy;
  retirementAge: number;     // 65-72
  court: "supreme" | "appeal" | "both";
}

const JUDICIAL_TRAITS = [
  "Strict Constructionist", "Rights Advocate", "Precedent Follower",
  "Reform Minded", "Cautious Jurist", "Legal Scholar",
  "Former Attorney General", "International Law Expert", "Labor Law Specialist",
  "Anti-Corruption Champion", "Constitutional Expert", "Corporate Law Expert",
  "Criminal Justice Reformer", "Environmental Law Pioneer", "Human Rights Defender",
  "Pro-Government Jurist", "Media Law Specialist", "Electoral Law Expert",
];

export function generateJudiciaryPool(seed: number = 6001): {
  supremeCourtPool: JusticeCandidate[];
  appealCourtPool: JusticeCandidate[];
} {
  // Generate 25 SC candidates
  const scGenerated = generateCharacterPool({
    count: 25,
    seed: seed,
    role: "justice",
    traitPool: JUDICIAL_TRAITS,
    ageRange: { min: 52, max: 68 },
    genderBalance: { minFemalePercent: 30, minMalePercent: 40 },
    competencyBias: "legal",
  });

  // Generate 50 CA candidates
  const caGenerated = generateCharacterPool({
    count: 50,
    seed: seed + 3000,
    role: "justice",
    traitPool: JUDICIAL_TRAITS,
    ageRange: { min: 48, max: 65 },
    genderBalance: { minFemalePercent: 30, minMalePercent: 40 },
    competencyBias: "legal",
  });

  const rng = seededRandom(seed + 9999);
  const philosophies: JudicialPhilosophy[] = ["originalist", "activist", "deferential", "independent"];

  const toCandidate = (char: ReturnType<typeof generateCharacterPool>[number], court: "supreme" | "appeal" | "both"): JusticeCandidate => ({
    name: char.name,
    state: char.state,
    zone: getZoneForState(char.state)?.abbrev ?? "SW",
    age: char.age,
    gender: char.gender,
    religion: char.religion,
    ethnicity: char.ethnicity,
    avatar: char.avatar,
    traits: char.traits,
    bio: char.biography,
    education: char.education,
    competence: Math.round((char.competencies.professional.legal + char.competencies.professional.administration) / 2),
    integrity: char.competencies.personal.integrity,
    philosophy: pick(rng, philosophies),
    retirementAge: 65 + Math.floor(rng() * 8), // 65-72
    court,
  });

  return {
    supremeCourtPool: scGenerated.map(c => toCandidate(c, "supreme")),
    appealCourtPool: caGenerated.map(c => toCandidate(c, "appeal")),
  };
}

let _cached: ReturnType<typeof generateJudiciaryPool> | null = null;
export function getJudiciaryPool() {
  if (!_cached) _cached = generateJudiciaryPool();
  return _cached;
}
