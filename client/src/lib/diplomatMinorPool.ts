// client/src/lib/diplomatMinorPool.ts
// Procedural generation of minor embassy ambassador candidates
// Similar to LGA chairpersons — generated once, cached at module level

import { generateCharacterPool, type GeneratedCharacter } from "./characterPoolGenerator";
import { MINOR_EMBASSY_POSTS, DIPLOMAT_TRAITS } from "./diplomatPosts";
import type { DiplomatCandidate, LanguageRequirement } from "./diplomatTypes";
import { seededRandom } from "./seededRandom";

const DIPLOMAT_SEED = 770_001; // Unique seed for minor diplomat generation

// Language pools for procedural candidates
const LANGUAGE_POOLS: Record<LanguageRequirement, string[]> = {
  French: ["French"],
  Arabic: ["Arabic"],
  Mandarin: ["Mandarin"],
  Portuguese: ["Portuguese"],
  Spanish: ["Spanish"],
  Russian: ["Russian"],
  None: [],
};

// Additional random languages some candidates might speak
const EXTRA_LANGUAGES: LanguageRequirement[] = ["French", "Arabic", "Spanish", "Portuguese"];

let _cachedMinorCandidates: DiplomatCandidate[] | null = null;

/**
 * Generate 3 procedural candidates per minor embassy post (90 total).
 * Cached at module level — generated on first access.
 */
export function getMinorEmbassyCandidates(): DiplomatCandidate[] {
  if (_cachedMinorCandidates) return _cachedMinorCandidates;

  const candidates: DiplomatCandidate[] = [];
  const usedNames = new Set<string>();

  for (let postIdx = 0; postIdx < MINOR_EMBASSY_POSTS.length; postIdx++) {
    const post = MINOR_EMBASSY_POSTS[postIdx];
    const postSeed = DIPLOMAT_SEED + postIdx * 1000;

    // Generate 3 candidates per minor post
    const pool = generateCharacterPool({
      count: 3,
      seed: postSeed,
      competencyBias: "diplomacy",
      role: "diplomat",
      ageRange: { min: 45, max: 65 },
      genderBalance: { minFemalePercent: 30, minMalePercent: 40 },
      traitPool: [...DIPLOMAT_TRAITS],
    });

    const rng = seededRandom(postSeed + 500);

    for (const gen of pool) {
      // Handle name dedup
      let name = gen.name;
      let suffix = 2;
      while (usedNames.has(name)) {
        name = `${gen.name} ${toRoman(suffix)}`;
        suffix++;
      }
      usedNames.add(name);

      // Ensure language qualification
      const requiredLang = post.languageRequired;
      const langSkills: LanguageRequirement[] = [];
      if (requiredLang !== "None") {
        langSkills.push(requiredLang);
      }
      // 40% chance of an extra language
      if (rng() < 0.4) {
        const extra = EXTRA_LANGUAGES[Math.floor(rng() * EXTRA_LANGUAGES.length)];
        if (!langSkills.includes(extra)) langSkills.push(extra);
      }

      // Cross-qualify for 1-2 other minor posts (preferring same language requirement)
      const otherPosts = MINOR_EMBASSY_POSTS.filter(
        p => p.id !== post.id &&
          (p.languageRequired === "None" || langSkills.includes(p.languageRequired as LanguageRequirement))
      );
      const shuffledOthers = otherPosts.sort(() => rng() - 0.5);
      const crossQual = shuffledOthers.slice(0, 1 + Math.floor(rng() * 2)).map(p => p.id);

      // Normalize competence to 50-80 range for minor posts
      const rawDiplomacy = gen.competencies.professional.diplomacy;
      const competence = Math.max(50, Math.min(80, rawDiplomacy + Math.floor(rng() * 10 - 5)));

      const candidate: DiplomatCandidate = {
        name,
        state: gen.state,
        zone: gen.competencies.professional.economics > 0 ? getZoneAbbrev(gen.state) : "NC",
        age: gen.age,
        gender: gen.gender,
        religion: gen.religion,
        ethnicity: gen.ethnicity,
        avatar: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        traits: gen.traits.slice(0, 2),
        bio: gen.biography,
        education: gen.education,
        competence,
        languageSkills: langSkills.length > 0 ? langSkills : [],
        qualifiedFor: [post.id, ...crossQual],
        competencies: {
          professional: gen.competencies.professional,
          personal: gen.competencies.personal,
        },
      };
      candidates.push(candidate);
    }
  }

  _cachedMinorCandidates = candidates;
  return candidates;
}

// ── Helpers ──

function toRoman(n: number): string {
  const pairs: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let remaining = n;
  for (const [val, sym] of pairs) {
    while (remaining >= val) { result += sym; remaining -= val; }
  }
  return result;
}

// Zone lookup by state
import { GEOPOLITICAL_ZONES } from "./zones";
function getZoneAbbrev(state: string): string {
  for (const z of GEOPOLITICAL_ZONES) {
    if (z.states.includes(state)) return z.abbrev;
  }
  return "NC";
}
