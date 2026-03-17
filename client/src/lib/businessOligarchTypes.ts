// client/src/lib/businessOligarchTypes.ts
// Candidate type for business oligarch pool — lighter than full Godfather.
// Selected candidates are converted to Godfather objects at game seed time.

export type BusinessSector =
  | "oil-gas"
  | "banking-finance"
  | "telecoms-tech"
  | "manufacturing"
  | "real-estate-construction"
  | "agriculture-commodities"
  | "media-entertainment"
  | "import-export"
  | "mining"
  | "conglomerate";

export interface BusinessOligarchCandidate {
  name: string;
  zone: string;          // NW, NE, NC, SW, SE, SS
  state: string;
  sector: BusinessSector;
  religion: string;
  ethnicity: string;
  description: string;   // 2-3 sentence bio
  traits: {
    aggression: number;  // 20-90
    loyalty: number;     // 20-80
    greed: number;       // 40-95
    visibility: number;  // 10-80
  };
  disposition: "friendly" | "neutral" | "cold" | "hostile";
  dealStyle: "contract" | "favour-bank";
  interests: string[];   // 3-5 policy interests
  influenceScore: number; // 40-95
  stableTemplate: {
    governorStates: string[];    // 1-3 states where they have influence
    houseLegislators: number;    // 2-20
    senateLegislators: number;   // 0-6
    cabinetInterests: string[];  // 1-2 portfolios they want filled by allies
    militaryInterests?: string[];
    diplomaticInterests?: string[];
    directorInterests?: string[];
    traditionalRulerAllies?: string[];
    religiousLeaderAllies?: string[];
  };
  connectionDescriptions: string[]; // 2-4 descriptions for GodfatherConnection
}

export const BUSINESS_SECTORS: BusinessSector[] = [
  "oil-gas", "banking-finance", "telecoms-tech", "manufacturing",
  "real-estate-construction", "agriculture-commodities", "media-entertainment",
  "import-export", "mining", "conglomerate",
];
