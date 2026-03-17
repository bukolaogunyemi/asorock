// client/src/lib/businessOligarchEngine.ts
// Selects 20 business oligarchs from a pool of 100 candidates
// and converts them to full Godfather objects for the patronage system.

import type { Godfather, GodfatherConnection } from "./godfatherTypes";
import type { BusinessOligarchCandidate } from "./businessOligarchTypes";
import { BUSINESS_OLIGARCH_CANDIDATES } from "./businessOligarchPool";

/**
 * Select 20 business oligarchs from the pool using seeded RNG.
 * Ensures zone balance (at least 2 per zone, max 5 per zone)
 * and sector diversity (at least 1 per major sector).
 */
export function selectBusinessOligarchs(
  seed: number,
  count = 20,
): Godfather[] {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const pool = [...BUSINESS_OLIGARCH_CANDIDATES];
  const selected: BusinessOligarchCandidate[] = [];
  const zoneCount: Record<string, number> = {};
  const sectorUsed = new Set<string>();

  // Phase 1: ensure at least 1 from each zone (6 picks)
  const zones = ["NW", "NE", "NC", "SW", "SE", "SS"];
  for (const zone of zones) {
    const zonePool = pool.filter(c => c.zone === zone && !selected.includes(c));
    if (zonePool.length === 0) continue;
    const sorted = [...zonePool].sort((a, b) =>
      (b.influenceScore + rng() * 15) - (a.influenceScore + rng() * 15),
    );
    const pick = sorted[0];
    selected.push(pick);
    zoneCount[zone] = (zoneCount[zone] ?? 0) + 1;
    sectorUsed.add(pick.sector);
  }

  // Phase 2: fill remaining slots with zone-balanced, sector-diverse picks
  while (selected.length < count) {
    const remaining = pool.filter(c => !selected.includes(c));
    if (remaining.length === 0) break;

    // Prefer underrepresented zones (max 5 per zone)
    const scored = remaining.map(c => {
      const zoneUse = zoneCount[c.zone] ?? 0;
      if (zoneUse >= 5) return { c, score: -1 }; // zone maxed out
      const zonePenalty = zoneUse * 10;
      const sectorBonus = sectorUsed.has(c.sector) ? 0 : 15;
      const score = c.influenceScore + sectorBonus - zonePenalty + rng() * 20;
      return { c, score };
    }).filter(x => x.score >= 0);

    if (scored.length === 0) break;
    scored.sort((a, b) => b.score - a.score);

    const pick = scored[0].c;
    selected.push(pick);
    zoneCount[pick.zone] = (zoneCount[pick.zone] ?? 0) + 1;
    sectorUsed.add(pick.sector);
  }

  return selected.map((candidate, idx) => candidateToGodfather(candidate, idx));
}

/**
 * Convert a BusinessOligarchCandidate to a full Godfather object.
 */
function candidateToGodfather(
  candidate: BusinessOligarchCandidate,
  index: number,
): Godfather {
  const id = `gf-biz-${candidate.zone.toLowerCase()}-${index}`;

  const connections: GodfatherConnection[] = candidate.connectionDescriptions.map(
    (desc, i) => ({
      entityType: (["business", "legislator-bloc", "cabinet", "governor"] as const)[
        i % 4
      ],
      description: desc,
      effect: generateConnectionEffects(candidate, i),
      revealed: i === 0, // Only first connection revealed initially
    }),
  );

  // Derive cross-system interests based on sector and zone
  const derived = deriveCrossSystemInterests(candidate);

  return {
    id,
    name: candidate.name,
    archetype: "business-oligarch",
    zone: candidate.zone,
    description: candidate.description,
    traits: { ...candidate.traits },
    disposition: candidate.disposition,
    dealStyle: candidate.dealStyle,
    interests: [...candidate.interests],
    stable: {
      governors: [...candidate.stableTemplate.governorStates],
      legislativeBloc: {
        house: candidate.stableTemplate.houseLegislators,
        senate: candidate.stableTemplate.senateLegislators,
      },
      cabinetCandidates: [...candidate.stableTemplate.cabinetInterests],
      connections,
      ...(derived.militaryInterests && { militaryInterests: derived.militaryInterests }),
      ...(derived.diplomaticInterests && { diplomaticInterests: derived.diplomaticInterests }),
      ...(derived.directorInterests && { directorInterests: derived.directorInterests }),
      ...(derived.traditionalRulerAllies && { traditionalRulerAllies: derived.traditionalRulerAllies }),
      ...(derived.religiousLeaderAllies && { religiousLeaderAllies: derived.religiousLeaderAllies }),
      // Also merge in any template-level overrides
      ...(candidate.stableTemplate.militaryInterests && { militaryInterests: candidate.stableTemplate.militaryInterests }),
      ...(candidate.stableTemplate.diplomaticInterests && { diplomaticInterests: candidate.stableTemplate.diplomaticInterests }),
      ...(candidate.stableTemplate.directorInterests && { directorInterests: candidate.stableTemplate.directorInterests }),
      ...(candidate.stableTemplate.traditionalRulerAllies && { traditionalRulerAllies: candidate.stableTemplate.traditionalRulerAllies }),
      ...(candidate.stableTemplate.religiousLeaderAllies && { religiousLeaderAllies: candidate.stableTemplate.religiousLeaderAllies }),
    },
    escalationStage: 0,
    favourDebt: 0,
    activeContracts: [],
    neutralized: false,
    influenceScore: candidate.influenceScore,
  };
}

/**
 * Map each zone to its paramount traditional ruler ID.
 */
const ZONE_PARAMOUNT_RULER: Record<string, string> = {
  NW: "sultan-sokoto",
  NE: "shehu-borno",
  NC: "etsu-nupe",
  SW: "ooni-ife",
  SE: "obi-onitsha",
  SS: "oba-benin",
};

/**
 * Derive cross-system interest fields for a business oligarch
 * based on their sector and zone.
 */
function deriveCrossSystemInterests(candidate: BusinessOligarchCandidate): {
  militaryInterests?: string[];
  diplomaticInterests?: string[];
  directorInterests?: string[];
  traditionalRulerAllies?: string[];
  religiousLeaderAllies?: string[];
} {
  const result: {
    militaryInterests?: string[];
    diplomaticInterests?: string[];
    directorInterests?: string[];
    traditionalRulerAllies?: string[];
    religiousLeaderAllies?: string[];
  } = {};

  const { sector, zone } = candidate;

  // Sector-based director interests
  switch (sector) {
    case "oil-gas":
      result.directorInterests = ["director-petroleum-corporation", "director-ports-authority"];
      // Oil-gas from NW/NE → diplomatic interests for Saudi/UAE
      if (zone === "NW" || zone === "NE") {
        result.diplomaticInterests = ["amb-saudi", "amb-uae"];
      } else {
        result.diplomaticInterests = ["amb-usa", "amb-uk"];
      }
      break;
    case "banking-finance":
      result.directorInterests = ["governor-central-bank", "director-revenue-service"];
      result.diplomaticInterests = ["amb-usa", "amb-uk"];
      break;
    case "telecoms-tech":
      result.directorInterests = ["director-communications-commission", "director-it-development"];
      result.diplomaticInterests = ["amb-usa"];
      break;
    case "manufacturing":
      result.directorInterests = ["director-standards-organisation", "director-customs-services"];
      result.diplomaticInterests = ["amb-china", "amb-india"];
      break;
    case "real-estate-construction":
      result.directorInterests = ["director-public-works", "director-housing-authority"];
      break;
    case "agriculture-commodities":
      result.directorInterests = ["director-food-storage", "director-export-promotion"];
      break;
    case "media-entertainment":
      result.directorInterests = ["director-broadcasting-commission", "director-communications-commission"];
      break;
    case "import-export":
      result.directorInterests = ["director-customs-services", "director-ports-authority"];
      result.diplomaticInterests = ["amb-china"];
      break;
    case "mining":
      result.directorInterests = ["director-mining-development"];
      break;
    case "conglomerate":
      result.directorInterests = ["director-investment-council", "director-customs-services"];
      result.diplomaticInterests = ["amb-usa", "amb-uk"];
      break;
  }

  // Zone-based traditional ruler allies (paramount ruler for their zone)
  const paramountRuler = ZONE_PARAMOUNT_RULER[zone];
  if (paramountRuler) {
    result.traditionalRulerAllies = [paramountRuler];
  }

  // Northern business oligarchs with religious ties
  if (zone === "NW" || zone === "NE") {
    result.religiousLeaderAllies = ["pres-muslim-society"];
  }

  return result;
}

function generateConnectionEffects(
  candidate: BusinessOligarchCandidate,
  connectionIndex: number,
): { target: string; delta: number }[] {
  const sector = candidate.sector;
  const influence = candidate.influenceScore;

  // Scale effect based on influence and connection type
  const baseDelta = Math.round(influence / 30);

  switch (connectionIndex % 4) {
    case 0: // Business connection
      return sector === "oil-gas" || sector === "banking-finance"
        ? [{ target: "macroEconomy", delta: baseDelta }]
        : [{ target: "politicalCapital", delta: baseDelta - 1 }];
    case 1: // Legislative connection
      return [{ target: "politicalCapital", delta: baseDelta }];
    case 2: // Cabinet connection
      return [{ target: "approval", delta: -(baseDelta - 1) }];
    case 3: // Governor connection
      return [{ target: "stability", delta: baseDelta - 1 }];
    default:
      return [];
  }
}
