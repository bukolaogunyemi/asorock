import type { IdeologyProfile } from "./parties";

export interface BiasProfile {
  government: number;                         // -2 (opposition) to +2 (pro-govt)
  regionalLean: string;                       // Geopolitical zone or "national"
  ideologicalLean: Partial<IdeologyProfile>;  // Which ideology dimensions this outlet cares about
}

export interface MediaOutlet {
  id: string;
  name: string;
  type: "tv" | "radio" | "newspaper" | "digital" | "magazine";
  ownership: "private" | "state-owned";
  region: string;
  tone: string;
  reach: number;       // 0-100
  credibility: number; // 0-100
  bias: BiasProfile;
}

export const MEDIA_OUTLETS: MediaOutlet[] = [
  // ── National Broadcast ──────────────────────────────────────────────────────
  {
    id: "beacon-tv",
    name: "Beacon Television",
    type: "tv",
    ownership: "private",
    region: "national",
    tone: "balanced",
    reach: 85,
    credibility: 80,
    bias: { government: 0, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "horizon-news",
    name: "Horizon News",
    type: "tv",
    ownership: "private",
    region: "national",
    tone: "business-focused",
    reach: 70,
    credibility: 75,
    bias: { government: 0, regionalLean: "national", ideologicalLean: { economic: 2 } },
  },
  {
    id: "eagle-broadcasting",
    name: "Eagle Broadcasting",
    type: "tv",
    ownership: "state-owned",
    region: "national",
    tone: "government mouthpiece",
    reach: 80,
    credibility: 25,
    bias: { government: 2, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "federal-radio-corporation",
    name: "Federal Radio Corporation",
    type: "radio",
    ownership: "state-owned",
    region: "national",
    tone: "government mouthpiece",
    reach: 90,
    credibility: 30,
    bias: { government: 2, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "capital-fm",
    name: "Capital FM",
    type: "radio",
    ownership: "private",
    region: "national",
    tone: "talk radio",
    reach: 65,
    credibility: 60,
    bias: { government: -1, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "freewave-radio",
    name: "FreeWave Radio",
    type: "radio",
    ownership: "private",
    region: "national",
    tone: "youth-oriented",
    reach: 55,
    credibility: 55,
    bias: { government: -1, regionalLean: "national", ideologicalLean: {} },
  },

  // ── National Print & Digital ─────────────────────────────────────────────
  {
    id: "daily-sentinel",
    name: "The Daily Sentinel",
    type: "newspaper",
    ownership: "private",
    region: "national",
    tone: "anti-establishment",
    reach: 75,
    credibility: 65,
    bias: { government: -1, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "the-republic",
    name: "The Republic",
    type: "digital",
    ownership: "private",
    region: "national",
    tone: "investigative",
    reach: 50,
    credibility: 90,
    bias: { government: -2, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "the-spectator",
    name: "The Spectator",
    type: "magazine",
    ownership: "private",
    region: "national",
    tone: "society",
    reach: 45,
    credibility: 50,
    bias: { government: 0, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "national-mirror",
    name: "National Mirror",
    type: "newspaper",
    ownership: "private",
    region: "national",
    tone: "establishment",
    reach: 60,
    credibility: 70,
    bias: { government: 1, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "civic-press",
    name: "The Civic Press",
    type: "digital",
    ownership: "private",
    region: "national",
    tone: "policy-focused",
    reach: 35,
    credibility: 80,
    bias: { government: 0, regionalLean: "national", ideologicalLean: {} },
  },
  {
    id: "federal-gazette",
    name: "Federal Gazette",
    type: "newspaper",
    ownership: "state-owned",
    region: "national",
    tone: "official record",
    reach: 40,
    credibility: 35,
    bias: { government: 2, regionalLean: "national", ideologicalLean: {} },
  },

  // ── South-West ───────────────────────────────────────────────────────────
  {
    id: "oodua-times",
    name: "Oodua Times",
    type: "digital",
    ownership: "private",
    region: "south-west",
    tone: "pro-Yoruba",
    reach: 50,
    credibility: 60,
    bias: { government: 0, regionalLean: "south-west", ideologicalLean: { federalism: 2, cultural: -1 } },
  },
  {
    id: "lagos-metropolitan",
    name: "Lagos Metropolitan",
    type: "newspaper",
    ownership: "private",
    region: "south-west",
    tone: "business and commerce",
    reach: 55,
    credibility: 65,
    bias: { government: 0, regionalLean: "south-west", ideologicalLean: { economic: 1 } },
  },
  {
    id: "sunrise-fm-ibadan",
    name: "Sunrise FM Ibadan",
    type: "radio",
    ownership: "private",
    region: "south-west",
    tone: "Yoruba-language community radio",
    reach: 40,
    credibility: 55,
    bias: { government: 0, regionalLean: "south-west", ideologicalLean: { cultural: -1 } },
  },

  // ── South-East ───────────────────────────────────────────────────────────
  {
    id: "eastern-tribune",
    name: "Eastern Tribune",
    type: "digital",
    ownership: "private",
    region: "south-east",
    tone: "pro-Igbo",
    reach: 45,
    credibility: 60,
    bias: { government: -1, regionalLean: "south-east", ideologicalLean: { federalism: 2 } },
  },
  {
    id: "biafra-sun",
    name: "Biafra Sun",
    type: "digital",
    ownership: "private",
    region: "south-east",
    tone: "hardline separatist-leaning",
    reach: 30,
    credibility: 40,
    bias: { government: -2, regionalLean: "south-east", ideologicalLean: { federalism: 2, security: -2 } },
  },
  {
    id: "nnamdi-fm-enugu",
    name: "Nnamdi FM Enugu",
    type: "radio",
    ownership: "private",
    region: "south-east",
    tone: "community Igbo-language",
    reach: 35,
    credibility: 55,
    bias: { government: 0, regionalLean: "south-east", ideologicalLean: {} },
  },

  // ── South-South ──────────────────────────────────────────────────────────
  {
    id: "niger-delta-voice",
    name: "Niger Delta Voice",
    type: "digital",
    ownership: "private",
    region: "south-south",
    tone: "minority rights and oil justice",
    reach: 40,
    credibility: 65,
    bias: { government: -1, regionalLean: "south-south", ideologicalLean: { welfare: 1, federalism: 2 } },
  },
  {
    id: "creekside-monitor",
    name: "Creekside Monitor",
    type: "newspaper",
    ownership: "private",
    region: "south-south",
    tone: "oil industry watchdog",
    reach: 35,
    credibility: 60,
    bias: { government: 0, regionalLean: "south-south", ideologicalLean: { economic: 1 } },
  },

  // ── North-West ───────────────────────────────────────────────────────────
  {
    id: "northern-star",
    name: "Northern Star",
    type: "newspaper",
    ownership: "private",
    region: "north-west",
    tone: "moderate northern establishment",
    reach: 50,
    credibility: 65,
    bias: { government: 1, regionalLean: "north-west", ideologicalLean: {} },
  },
  {
    id: "arewa-gazette",
    name: "Arewa Gazette",
    type: "digital",
    ownership: "private",
    region: "north-west",
    tone: "conservative Arewa",
    reach: 40,
    credibility: 55,
    bias: { government: 0, regionalLean: "north-west", ideologicalLean: { social: -2, cultural: -1 } },
  },
  {
    id: "hausa-service-radio",
    name: "Hausa Service Radio",
    type: "radio",
    ownership: "private",
    region: "north-west",
    tone: "Hausa-language community broadcast",
    reach: 55,
    credibility: 60,
    bias: { government: 0, regionalLean: "north-west", ideologicalLean: {} },
  },

  // ── North-East ───────────────────────────────────────────────────────────
  {
    id: "sahel-report",
    name: "Sahel Report",
    type: "digital",
    ownership: "private",
    region: "north-east",
    tone: "security and conflict-focused",
    reach: 30,
    credibility: 70,
    bias: { government: 0, regionalLean: "north-east", ideologicalLean: { security: 1 } },
  },
  {
    id: "lake-chad-herald",
    name: "Lake Chad Herald",
    type: "newspaper",
    ownership: "private",
    region: "north-east",
    tone: "humanitarian and development",
    reach: 25,
    credibility: 60,
    bias: { government: 0, regionalLean: "north-east", ideologicalLean: { welfare: 1 } },
  },

  // ── North-Central ────────────────────────────────────────────────────────
  {
    id: "plateau-guardian",
    name: "Plateau Guardian",
    type: "newspaper",
    ownership: "private",
    region: "north-central",
    tone: "minority rights and pluralism",
    reach: 30,
    credibility: 60,
    bias: { government: 0, regionalLean: "north-central", ideologicalLean: { social: 1, federalism: 1 } },
  },
  {
    id: "middle-belt-tribune",
    name: "Middle Belt Tribune",
    type: "digital",
    ownership: "private",
    region: "north-central",
    tone: "Middle Belt advocacy",
    reach: 30,
    credibility: 55,
    bias: { government: -1, regionalLean: "north-central", ideologicalLean: { federalism: 2 } },
  },

  // ── International ─────────────────────────────────────────────────────────
  {
    id: "bbc",
    name: "BBC",
    type: "tv",
    ownership: "private",
    region: "international",
    tone: "balanced international",
    reach: 60,
    credibility: 85,
    bias: { government: 0, regionalLean: "international", ideologicalLean: {} },
  },
  {
    id: "cnn",
    name: "CNN",
    type: "tv",
    ownership: "private",
    region: "international",
    tone: "American-lens international",
    reach: 45,
    credibility: 75,
    bias: { government: 0, regionalLean: "international", ideologicalLean: { foreignPolicy: 1 } },
  },
  {
    id: "al-jazeera",
    name: "Al Jazeera",
    type: "tv",
    ownership: "private",
    region: "international",
    tone: "Global South-sympathetic",
    reach: 40,
    credibility: 70,
    bias: { government: 0, regionalLean: "international", ideologicalLean: { welfare: 1 } },
  },
];

export function getOutletsByRegion(region: string): MediaOutlet[] {
  return MEDIA_OUTLETS.filter((o) => o.region === region);
}

export function getStateOwnedOutlets(): MediaOutlet[] {
  return MEDIA_OUTLETS.filter((o) => o.ownership === "state-owned");
}
