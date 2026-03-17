// client/src/lib/directorPositions.ts
// Defines all 49 director (agency head) positions across 17 ministries

import type { DirectorPosition } from "./directorTypes";
import type { MinistryKey } from "./directorTypes";

export const DIRECTOR_POSITIONS: DirectorPosition[] = [
  // ── Finance (5) ────────────────────────────────────────────────────────────
  {
    id: "governor-central-bank",
    title: "Governor, Central Bank",
    ministry: "Finance",
    prestigeTier: "strategic",
    sectorInfluence: ["economy", "treasury"],
    weight: 1.0,
    primaryCompetency: "economics",
  },
  {
    id: "director-budget-office",
    title: "Director, Budget Office",
    ministry: "Finance",
    prestigeTier: "standard",
    sectorInfluence: ["economy", "treasury"],
    weight: 0.7,
    primaryCompetency: "economics",
  },
  {
    id: "director-revenue-service",
    title: "Director, Revenue Service",
    ministry: "Finance",
    prestigeTier: "strategic",
    sectorInfluence: ["economy", "treasury"],
    weight: 0.9,
    primaryCompetency: "economics",
  },
  {
    id: "director-bureau-statistics",
    title: "Director, Bureau of Statistics",
    ministry: "Finance",
    prestigeTier: "standard",
    sectorInfluence: ["economy"],
    weight: 0.5,
    primaryCompetency: "economics",
  },
  {
    id: "director-investment-council",
    title: "Director, Investment Council",
    ministry: "Finance",
    prestigeTier: "standard",
    sectorInfluence: ["economy", "internationalReputation"],
    weight: 0.6,
    primaryCompetency: "economics",
  },

  // ── Health (4) ─────────────────────────────────────────────────────────────
  {
    id: "director-primary-healthcare",
    title: "Director, Primary Healthcare",
    ministry: "Health",
    prestigeTier: "standard",
    sectorInfluence: ["healthSector"],
    weight: 0.7,
    primaryCompetency: "administration",
  },
  {
    id: "director-health-insurance",
    title: "Director, Health Insurance",
    ministry: "Health",
    prestigeTier: "standard",
    sectorInfluence: ["healthSector"],
    weight: 0.5,
    primaryCompetency: "administration",
  },
  {
    id: "director-disease-control",
    title: "Director, Disease Control",
    ministry: "Health",
    prestigeTier: "strategic",
    sectorInfluence: ["healthSector", "stability"],
    weight: 0.8,
    primaryCompetency: "administration",
  },
  {
    id: "director-food-drug-safety",
    title: "Director, Food and Drug Safety",
    ministry: "Health",
    prestigeTier: "standard",
    sectorInfluence: ["healthSector"],
    weight: 0.6,
    primaryCompetency: "administration",
  },

  // ── Education (4) ──────────────────────────────────────────────────────────
  {
    id: "director-basic-education",
    title: "Director, Basic Education",
    ministry: "Education",
    prestigeTier: "standard",
    sectorInfluence: ["education"],
    weight: 0.7,
    primaryCompetency: "administration",
  },
  {
    id: "director-higher-education",
    title: "Director, Higher Education",
    ministry: "Education",
    prestigeTier: "standard",
    sectorInfluence: ["education"],
    weight: 0.6,
    primaryCompetency: "administration",
  },
  {
    id: "director-technical-education",
    title: "Director, Technical Education",
    ministry: "Education",
    prestigeTier: "routine",
    sectorInfluence: ["education"],
    weight: 0.4,
    primaryCompetency: "technology",
  },
  {
    id: "director-education-fund",
    title: "Director, Education Fund",
    ministry: "Education",
    prestigeTier: "standard",
    sectorInfluence: ["education"],
    weight: 0.5,
    primaryCompetency: "economics",
  },

  // ── Agriculture & Rural Development (3) ────────────────────────────────────
  {
    id: "director-crop-research",
    title: "Director, Crop Research",
    ministry: "Agriculture & Rural Development",
    prestigeTier: "routine",
    sectorInfluence: ["agriculture"],
    weight: 0.4,
    primaryCompetency: "technology",
  },
  {
    id: "director-food-storage",
    title: "Director, Food Storage",
    ministry: "Agriculture & Rural Development",
    prestigeTier: "standard",
    sectorInfluence: ["agriculture"],
    weight: 0.6,
    primaryCompetency: "administration",
  },
  {
    id: "director-land-development",
    title: "Director, Land Development",
    ministry: "Agriculture & Rural Development",
    prestigeTier: "routine",
    sectorInfluence: ["agriculture"],
    weight: 0.4,
    primaryCompetency: "administration",
  },

  // ── Works & Housing (2) ────────────────────────────────────────────────────
  {
    id: "director-public-works",
    title: "Director, Public Works",
    ministry: "Works & Housing",
    prestigeTier: "standard",
    sectorInfluence: ["infrastructure"],
    weight: 0.6,
    primaryCompetency: "administration",
  },
  {
    id: "director-housing-authority",
    title: "Director, Housing Authority",
    ministry: "Works & Housing",
    prestigeTier: "routine",
    sectorInfluence: ["infrastructure"],
    weight: 0.4,
    primaryCompetency: "administration",
  },

  // ── Petroleum (1) ──────────────────────────────────────────────────────────
  {
    id: "director-petroleum-corporation",
    title: "Director, Petroleum Corporation",
    ministry: "Petroleum",
    prestigeTier: "strategic",
    sectorInfluence: ["economy", "treasury", "internationalReputation"],
    weight: 1.0,
    primaryCompetency: "economics",
  },

  // ── Power (2) ──────────────────────────────────────────────────────────────
  {
    id: "director-electricity-regulation",
    title: "Director, Electricity Regulation",
    ministry: "Power",
    prestigeTier: "strategic",
    sectorInfluence: ["infrastructure", "economy"],
    weight: 0.9,
    primaryCompetency: "technology",
  },
  {
    id: "director-rural-electrification",
    title: "Director, Rural Electrification",
    ministry: "Power",
    prestigeTier: "standard",
    sectorInfluence: ["infrastructure"],
    weight: 0.5,
    primaryCompetency: "administration",
  },

  // ── Labour & Employment (4) ────────────────────────────────────────────────
  {
    id: "director-pensions",
    title: "Director, Pensions",
    ministry: "Labour & Employment",
    prestigeTier: "standard",
    sectorInfluence: ["economy"],
    weight: 0.5,
    primaryCompetency: "economics",
  },
  {
    id: "director-industrial-relations",
    title: "Director, Industrial Relations",
    ministry: "Labour & Employment",
    prestigeTier: "standard",
    sectorInfluence: ["stability"],
    weight: 0.6,
    primaryCompetency: "legal",
  },
  {
    id: "director-youth-employment",
    title: "Director, Youth Employment",
    ministry: "Labour & Employment",
    prestigeTier: "standard",
    sectorInfluence: ["youthEmployment", "stability"],
    weight: 0.6,
    primaryCompetency: "administration",
  },
  {
    id: "director-social-insurance",
    title: "Director, Social Insurance",
    ministry: "Labour & Employment",
    prestigeTier: "routine",
    sectorInfluence: ["stability"],
    weight: 0.4,
    primaryCompetency: "administration",
  },

  // ── Interior (5) ───────────────────────────────────────────────────────────
  {
    id: "director-police-commission",
    title: "Director, Police Commission",
    ministry: "Interior",
    prestigeTier: "strategic",
    sectorInfluence: ["interior", "stability"],
    weight: 0.8,
    primaryCompetency: "security",
  },
  {
    id: "director-customs-services",
    title: "Director, Customs Services",
    ministry: "Interior",
    prestigeTier: "strategic",
    sectorInfluence: ["economy", "treasury"],
    weight: 0.8,
    primaryCompetency: "economics",
  },
  {
    id: "director-immigration-services",
    title: "Director, Immigration Services",
    ministry: "Interior",
    prestigeTier: "standard",
    sectorInfluence: ["interior"],
    weight: 0.5,
    primaryCompetency: "security",
  },
  {
    id: "director-state-security",
    title: "Director, State Security",
    ministry: "Interior",
    prestigeTier: "strategic",
    sectorInfluence: ["interior", "stability"],
    weight: 0.9,
    primaryCompetency: "security",
  },
  {
    id: "director-electoral-commission",
    title: "Director, Electoral Commission",
    ministry: "Interior",
    prestigeTier: "strategic",
    sectorInfluence: ["stability", "internationalReputation"],
    weight: 0.7,
    primaryCompetency: "legal",
  },

  // ── Trade & Investment (4) ─────────────────────────────────────────────────
  {
    id: "director-standards-organisation",
    title: "Director, Standards Organisation",
    ministry: "Trade & Investment",
    prestigeTier: "routine",
    sectorInfluence: ["economy"],
    weight: 0.4,
    primaryCompetency: "administration",
  },
  {
    id: "director-export-promotion",
    title: "Director, Export Promotion",
    ministry: "Trade & Investment",
    prestigeTier: "standard",
    sectorInfluence: ["economy", "internationalReputation"],
    weight: 0.5,
    primaryCompetency: "economics",
  },
  {
    id: "director-tourism-board",
    title: "Director, Tourism Board",
    ministry: "Trade & Investment",
    prestigeTier: "routine",
    sectorInfluence: ["economy"],
    weight: 0.3,
    primaryCompetency: "administration",
  },
  {
    id: "director-mining-development",
    title: "Director, Mining Development",
    ministry: "Trade & Investment",
    prestigeTier: "standard",
    sectorInfluence: ["economy"],
    weight: 0.6,
    primaryCompetency: "economics",
  },

  // ── Communications & Digital Economy (3) ───────────────────────────────────
  {
    id: "director-communications-commission",
    title: "Director, Communications Commission",
    ministry: "Communications & Digital Economy",
    prestigeTier: "strategic",
    sectorInfluence: ["economy"],
    weight: 0.8,
    primaryCompetency: "technology",
  },
  {
    id: "director-it-development",
    title: "Director, IT Development",
    ministry: "Communications & Digital Economy",
    prestigeTier: "standard",
    sectorInfluence: ["economy", "infrastructure"],
    weight: 0.6,
    primaryCompetency: "technology",
  },
  {
    id: "director-broadcasting-commission",
    title: "Director, Broadcasting Commission",
    ministry: "Communications & Digital Economy",
    prestigeTier: "standard",
    sectorInfluence: ["approval"],
    weight: 0.5,
    primaryCompetency: "media",
  },

  // ── Environment (2) ────────────────────────────────────────────────────────
  {
    id: "director-environmental-standards",
    title: "Director, Environmental Standards",
    ministry: "Environment",
    prestigeTier: "standard",
    sectorInfluence: ["environment"],
    weight: 0.5,
    primaryCompetency: "administration",
  },
  {
    id: "director-water-resources",
    title: "Director, Water Resources",
    ministry: "Environment",
    prestigeTier: "standard",
    sectorInfluence: ["environment", "healthSector"],
    weight: 0.6,
    primaryCompetency: "administration",
  },

  // ── Justice (3) ────────────────────────────────────────────────────────────
  {
    id: "director-anti-financial-crimes",
    title: "Director, Anti-Financial Crimes",
    ministry: "Justice",
    prestigeTier: "strategic",
    sectorInfluence: ["stability", "internationalReputation"],
    weight: 0.9,
    primaryCompetency: "legal",
  },
  {
    id: "director-anti-corruption-commission",
    title: "Director, Anti-Corruption Commission",
    ministry: "Justice",
    prestigeTier: "strategic",
    sectorInfluence: ["stability", "internationalReputation"],
    weight: 0.8,
    primaryCompetency: "legal",
  },
  {
    id: "director-judicial-commission",
    title: "Director, Judicial Commission",
    ministry: "Justice",
    prestigeTier: "standard",
    sectorInfluence: ["stability"],
    weight: 0.5,
    primaryCompetency: "legal",
  },

  // ── Transport (3) ──────────────────────────────────────────────────────────
  {
    id: "director-ports-authority",
    title: "Director, Ports Authority",
    ministry: "Transport",
    prestigeTier: "strategic",
    sectorInfluence: ["economy", "treasury"],
    weight: 0.8,
    primaryCompetency: "economics",
  },
  {
    id: "director-maritime-administration",
    title: "Director, Maritime Administration",
    ministry: "Transport",
    prestigeTier: "standard",
    sectorInfluence: ["economy"],
    weight: 0.5,
    primaryCompetency: "security",
  },
  {
    id: "director-civil-aviation",
    title: "Director, Civil Aviation",
    ministry: "Transport",
    prestigeTier: "standard",
    sectorInfluence: ["infrastructure"],
    weight: 0.6,
    primaryCompetency: "administration",
  },

  // ── Youth Development (2) ──────────────────────────────────────────────────
  {
    id: "director-youth-service-corps",
    title: "Director, Youth Service Corps",
    ministry: "Youth Development",
    prestigeTier: "standard",
    sectorInfluence: ["youthEmployment", "stability"],
    weight: 0.6,
    primaryCompetency: "administration",
  },
  {
    id: "director-social-investment",
    title: "Director, Social Investment",
    ministry: "Youth Development",
    prestigeTier: "standard",
    sectorInfluence: ["approval", "stability"],
    weight: 0.6,
    primaryCompetency: "economics",
  },

  // ── Foreign Affairs (1) ────────────────────────────────────────────────────
  {
    id: "director-diaspora-commission",
    title: "Director, Diaspora Commission",
    ministry: "Foreign Affairs",
    prestigeTier: "standard",
    sectorInfluence: ["economy", "internationalReputation"],
    weight: 0.5,
    primaryCompetency: "diplomacy",
  },

  // ── Defence (1) ────────────────────────────────────────────────────────────
  {
    id: "director-defence-industries",
    title: "Director, Defence Industries",
    ministry: "Defence",
    prestigeTier: "standard",
    sectorInfluence: ["interior"],
    weight: 0.5,
    primaryCompetency: "security",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getPositionsByMinistry(ministry: MinistryKey): DirectorPosition[] {
  return DIRECTOR_POSITIONS.filter((p) => p.ministry === ministry);
}

export function getPositionById(id: string): DirectorPosition | undefined {
  return DIRECTOR_POSITIONS.find((p) => p.id === id);
}
