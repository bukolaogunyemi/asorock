// Faction Database — 7 political factions (names match gameData.ts exactly)

export interface FactionData {
  name: string;
  description: string;
  primaryZone: string;
  ideology: string;
  keyInterests: string[];
}

/** Slugify a faction name for use as a database key */
function slugify(name: string): string {
  return name.toLowerCase().replace(/['\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export const FACTION_DATABASE: Record<string, FactionData> = {
  "northern-caucus": {
    name: "Northern Caucus",
    description:
      "A broad coalition of Northern political elites, emirs, traditional rulers, and business interests spanning the North-West, North-East, and North-Central zones. The Northern Caucus is the most powerful bloc in Nigerian politics, leveraging its numerical electoral advantage to shape government policy and appointments.",
    primaryZone: "North-West",
    ideology: "Northern regionalism, conservative Islamic values, agrarian interests",
    keyInterests: [
      "Equitable federal character in appointments",
      "Agricultural sector investment",
      "Security in the North against banditry and insurgency",
      "Sharia law compatibility in Northern states",
      "Control of key security and economic agencies",
    ],
  },
  "south-west-alliance": {
    name: "South-West Alliance",
    description:
      "A coalition of Yoruba political leaders, business elites, and civil society actors from Lagos, Ogun, Oyo, Osun, Ondo, and Ekiti states. The South-West Alliance is Nigeria's second most influential political bloc, anchored by Lagos's economic dominance and its tradition of producing liberal, reformist politicians.",
    primaryZone: "South-West",
    ideology: "Federalism, economic liberalism, Yoruba cultural pride, restructuring advocacy",
    keyInterests: [
      "Revenue allocation reform favouring derivation",
      "Lagos as Nigeria's economic capital",
      "Infrastructure investment in South-West",
      "Anti-corruption institutional reforms",
      "Decentralisation and state police",
    ],
  },
  "south-east-bloc": {
    name: "South-East Bloc",
    description:
      "Representing Igbo political interests across Abia, Anambra, Ebonyi, Enugu, and Imo states. The South-East Bloc has long advocated for a Presidential turn in the South-East, arguing that marginalisation since the Civil War must be corrected. It has a strong base among Nigeria's entrepreneurial Igbo business community.",
    primaryZone: "South-East",
    ideology: "Igbo nationalism, economic entrepreneurship, civil war reconciliation",
    keyInterests: [
      "Igbo presidency or senior federal appointments",
      "South-East infrastructure development",
      "Southeast Development Commission",
      "Civil war victims' recognition",
      "Security in the South-East (IPOB crisis)",
    ],
  },
  "presidential-guard": {
    name: "Presidential Guard",
    description:
      "The core loyalists and inner circle of the current presidency. This faction comprises close political associates, campaign financiers, key aides, and officials whose political fortunes are directly tied to the President's success. They prioritise regime stability and the President's agenda above all else.",
    primaryZone: "North-Central",
    ideology: "Presidential loyalty, pragmatic centrists, status quo preservation",
    keyInterests: [
      "Protecting the President's political agenda",
      "Managing succession and legacy",
      "Control of key patronage positions",
      "Neutralising opposition coalitions",
      "Second-term preparation",
    ],
  },
  "military-circle": {
    name: "Military Circle",
    description:
      "Retired senior military officers, serving defence establishment figures, and security sector interests. The Military Circle wields informal influence over security appointments, defence contracts, and national security policy. It maintains the institutional memory of previous military governments.",
    primaryZone: "North-Central",
    ideology: "Security-first nationalism, institutional conservatism, anti-secessionism",
    keyInterests: [
      "Increased defence and security spending",
      "Military appointments and promotions",
      "Defence procurement contracts",
      "Counter-insurgency and internal security operations",
      "Territorial integrity — opposition to any restructuring",
    ],
  },
  technocrats: {
    name: "Technocrats",
    description:
      "Western-educated economists, development specialists, and reform-minded professionals in government and adjacent institutions like the CBN, World Bank, and private sector. Technocrats prioritise evidence-based policy and market-oriented reforms over political patronage.",
    primaryZone: "South-West",
    ideology: "Economic liberalism, institutional reform, technocratic governance",
    keyInterests: [
      "Central bank independence",
      "Subsidy removal and market pricing",
      "Tax system modernisation",
      "Investment climate improvement",
      "Merit-based appointments to economic agencies",
    ],
  },
  "youth-movement": {
    name: "Youth Movement",
    description:
      "A loose but increasingly organised coalition of young Nigerians, online activists, civil society organisations, and diaspora voices. Energised by the #EndSARS protest movement, the Youth Movement demands accountability, electoral reform, and a break from the old guard of Nigerian politics.",
    primaryZone: "South-West",
    ideology: "Democratic reform, anti-corruption, generational change, digital governance",
    keyInterests: [
      "Electoral reform and PVC voter mobilisation",
      "Police and security sector reform",
      "Youth employment and StartUp Nigeria",
      "Anti-corruption and transparency",
      "Digital economy and fintech development",
    ],
  },
};

/** Case-insensitive lookup by faction name */
export function getFactionData(name: string): FactionData | undefined {
  const slug = slugify(name);
  return FACTION_DATABASE[slug];
}
