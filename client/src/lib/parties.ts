export interface IdeologyProfile {
  economic: number;      // -2 (statist) to +2 (free market)
  federalism: number;    // -2 (centralist) to +2 (federalist)
  social: number;        // -2 (conservative) to +2 (progressive)
  security: number;      // -2 (dovish) to +2 (hawkish)
  welfare: number;       // -2 (minimal state) to +2 (expansive welfare)
  foreignPolicy: number; // -2 (isolationist) to +2 (interventionist)
  cultural: number;      // -2 (traditionalist) to +2 (cosmopolitan)
}

export interface PartyProfile {
  id: string;
  name: string;
  color: string;
  description: string;
  ideology: IdeologyProfile;
  regionalBase: string[];
}

export const PARTIES: PartyProfile[] = [
  {
    id: "ADU",
    name: "African Democratic Union",
    color: "hsl(153,60%,32%)",
    description: "A centre-right party emphasising economic liberalism and strong national integration, with deep roots in the North-West and South-West.",
    ideology: {
      economic: 2,
      federalism: 1,
      social: 0,
      security: 1,
      welfare: -1,
      foreignPolicy: 2,
      cultural: 1,
    },
    regionalBase: ["North-West", "South-West"],
  },
  {
    id: "PFC",
    name: "People's Freedom Congress",
    color: "hsl(0,60%,50%)",
    description: "A centre-left party championing civil liberties and regional representation, with a strong base in the North-Central and South-South.",
    ideology: {
      economic: -1,
      federalism: -1,
      social: 0,
      security: 0,
      welfare: 2,
      foreignPolicy: 0,
      cultural: 1,
    },
    regionalBase: ["North-Central", "South-South"],
  },
  {
    id: "NDM",
    name: "New Direction Movement",
    color: "hsl(200,60%,45%)",
    description: "A progressive party pushing for social reform, devolution of power, and a forward-looking foreign policy, dominant in the South-West and South-East.",
    ideology: {
      economic: 1,
      federalism: 1,
      social: 2,
      security: -1,
      welfare: 0,
      foreignPolicy: 1,
      cultural: 2,
    },
    regionalBase: ["South-West", "South-East"],
  },
  {
    id: "NSF",
    name: "National Solidarity Front",
    color: "hsl(42,70%,50%)",
    description: "A populist movement demanding economic redistribution and greater local control, rooted in the North-West and North-East.",
    ideology: {
      economic: -1,
      federalism: -2,
      social: -1,
      security: 0,
      welfare: 2,
      foreignPolicy: -1,
      cultural: 0,
    },
    regionalBase: ["North-West", "North-East"],
  },
  {
    id: "TLA",
    name: "The Liberty Alliance",
    color: "hsl(280,50%,50%)",
    description: "A regionalist party advocating strong federalism, individual freedoms, and cultural autonomy for the South-East and South-South.",
    ideology: {
      economic: 1,
      federalism: 2,
      social: 1,
      security: 1,
      welfare: 0,
      foreignPolicy: 1,
      cultural: -2,
    },
    regionalBase: ["South-East", "South-South"],
  },
  {
    id: "HDP",
    name: "Heritage Democratic Party",
    color: "hsl(25,50%,40%)",
    description: "A traditionalist party defending cultural heritage and strong security institutions, anchored in the North-East and North-Central.",
    ideology: {
      economic: -1,
      federalism: 0,
      social: -2,
      security: 1,
      welfare: 1,
      foreignPolicy: -1,
      cultural: -1,
    },
    regionalBase: ["North-East", "North-Central"],
  },
  {
    id: "PAP",
    name: "Progressive Action Party",
    color: "hsl(25,80%,55%)",
    description: "A social democratic party focused on workers' rights, welfare expansion, and progressive social values, strongest in the South-South.",
    ideology: {
      economic: -2,
      federalism: 0,
      social: 1,
      security: -1,
      welfare: 2,
      foreignPolicy: -1,
      cultural: 0,
    },
    regionalBase: ["South-South"],
  },
  {
    id: "UPA",
    name: "United People's Alliance",
    color: "hsl(174,50%,42%)",
    description: "An ethnic federalist coalition pushing for constitutional restructuring and communal autonomy, with support in the South-West and North-Central.",
    ideology: {
      economic: 0,
      federalism: 2,
      social: 0,
      security: 0,
      welfare: 1,
      foreignPolicy: 0,
      cultural: -2,
    },
    regionalBase: ["South-West", "North-Central"],
  },
];

// Vote shares per region: [NC, NW, NE, SW, SE, SS]
// NC = North-Central, NW = North-West, NE = North-East
// SW = South-West, SE = South-East, SS = South-South
export const BASE_VOTE_SHARES: Record<string, number[]> = {
  ADU:    [20, 35, 25, 25,  5,  8],
  PFC:    [25, 18, 22, 12, 15, 30],
  NDM:    [10,  3,  5, 22, 25, 12],
  NSF:    [ 8, 25, 22,  3,  2,  3],
  TLA:    [ 3,  1,  2,  3, 30, 15],
  HDP:    [12,  8, 15,  3,  2,  3],
  PAP:    [ 5,  2,  2,  8,  8, 20],
  UPA:    [14,  5,  4, 21, 10,  6],
  Others: [ 3,  3,  3,  3,  3,  3],
};

export function getPartyById(id: string): PartyProfile | undefined {
  return PARTIES.find((party) => party.id === id);
}
