// Country Database — Nigeria's key diplomatic partners and ECOWAS

export interface CountryData {
  name: string;
  capital: string;
  population: string;
  gdp: string;
  headOfState: string;
  region: string;
  keyExports: string[];
  nigeriaRelation: string;
  description: string;
}

export interface InternationalOrgData {
  name: string;
  headquarters: string;
  memberStates: string[];
  secretaryGeneral: string;
  description: string;
}

export const COUNTRY_DATABASE: Record<string, CountryData> = {
  "united-states": {
    name: "United States",
    capital: "Washington D.C.",
    population: "335 million",
    gdp: "$27.4 trillion",
    headOfState: "President",
    region: "North America",
    keyExports: ["Technology", "Aircraft", "Machinery", "Soybeans", "Petroleum products"],
    nigeriaRelation:
      "Nigeria's largest trading partner in the Americas. The US is a major destination for Nigerian crude oil and provides security cooperation. A significant Nigerian diaspora resides in the United States.",
    description:
      "The world's largest economy and dominant military superpower. A permanent member of the UN Security Council with a global network of alliances. Maintains a significant diplomatic and security presence in West Africa.",
  },
  china: {
    name: "China",
    capital: "Beijing",
    population: "1.41 billion",
    gdp: "$17.8 trillion",
    headOfState: "President",
    region: "East Asia",
    keyExports: ["Electronics", "Machinery", "Textiles", "Steel", "Vehicles"],
    nigeriaRelation:
      "China is Nigeria's largest single import-source country and a major infrastructure financier. Chinese firms have built railways, roads, and power infrastructure. Nigeria-China trade exceeds $20 billion annually.",
    description:
      "The world's most populous country and second-largest economy. A permanent UN Security Council member with rapidly expanding global influence, especially through its Belt and Road Initiative across Africa.",
  },
  "united-kingdom": {
    name: "United Kingdom",
    capital: "London",
    population: "67 million",
    gdp: "$3.1 trillion",
    headOfState: "Prime Minister",
    region: "Western Europe",
    keyExports: ["Pharmaceuticals", "Machinery", "Financial services", "Vehicles", "Aerospace"],
    nigeriaRelation:
      "Nigeria's former colonial power with deep historical, cultural, and institutional ties. A major destination for Nigerian students and professionals. Significant bilateral trade, investment, and development cooperation.",
    description:
      "A permanent UN Security Council member and G7 nation. Nigeria's primary source of legal and institutional frameworks, including its common-law system and parliamentary conventions.",
  },
  "saudi-arabia": {
    name: "Saudi Arabia",
    capital: "Riyadh",
    population: "36 million",
    gdp: "$1.1 trillion",
    headOfState: "King",
    region: "Middle East",
    keyExports: ["Crude oil", "Refined petroleum", "Petrochemicals", "Plastics"],
    nigeriaRelation:
      "Fellow OPEC member with shared interests in global oil pricing strategy. A destination for Nigerian Muslim pilgrims (Hajj), with over 70,000 Nigerians making the pilgrimage annually. Growing bilateral investment ties.",
    description:
      "The world's leading oil exporter and custodian of Islam's two holiest sites. A dominant player in OPEC and the G20. Saudi Vision 2030 is transforming the kingdom's economic base beyond oil.",
  },
  france: {
    name: "France",
    capital: "Paris",
    population: "68 million",
    gdp: "$3.0 trillion",
    headOfState: "President",
    region: "Western Europe",
    keyExports: ["Machinery", "Aircraft", "Pharmaceuticals", "Vehicles", "Luxury goods"],
    nigeriaRelation:
      "A significant trade and security partner. France's historical role in Francophone West Africa creates a complex but important relationship. Total (TotalEnergies), a French oil major, has substantial operations in Nigeria.",
    description:
      "A permanent UN Security Council member and founding EU member. France maintains extensive influence in West and Central Africa through Francophone partnerships, though this relationship is evolving amid shifting regional dynamics.",
  },
  germany: {
    name: "Germany",
    capital: "Berlin",
    population: "84 million",
    gdp: "$4.5 trillion",
    headOfState: "Chancellor",
    region: "Western Europe",
    keyExports: ["Vehicles", "Machinery", "Chemicals", "Electronics", "Pharmaceuticals"],
    nigeriaRelation:
      "An important trade partner and development finance source. Germany is a major market for Nigerian exports and provides substantial technical cooperation through GIZ. Growing investment in Nigeria's manufacturing sector.",
    description:
      "Europe's largest economy and an industrial powerhouse. Germany is a G7 member and EU leader, known for its export-led growth model and strong engineering and automotive sectors.",
  },
  uae: {
    name: "United Arab Emirates",
    capital: "Abu Dhabi",
    population: "10 million",
    gdp: "$0.5 trillion",
    headOfState: "President",
    region: "Middle East",
    keyExports: ["Crude oil", "Refined petroleum", "Gold", "Aluminium", "Electronics"],
    nigeriaRelation:
      "A growing economic partner and destination for Nigerian investment and diaspora. Dubai is a major transit and business hub for Nigerian entrepreneurs. The UAE has invested significantly in Nigeria's agriculture and infrastructure.",
    description:
      "A federation of seven emirates that has rapidly transformed into a global financial, logistics, and tourism hub. Dubai and Abu Dhabi are among the world's leading business centres with significant sovereign wealth funds.",
  },
  "south-africa": {
    name: "South Africa",
    capital: "Pretoria",
    population: "60 million",
    gdp: "$0.4 trillion",
    headOfState: "President",
    region: "Southern Africa",
    keyExports: ["Gold", "Diamonds", "Platinum", "Vehicles", "Coal"],
    nigeriaRelation:
      "Africa's two largest economies with a complex relationship spanning trade, competition, and cooperation. MTN, Shoprite, and other South African firms are major investors in Nigeria. Both nations co-lead continental diplomacy in the African Union.",
    description:
      "Sub-Saharan Africa's most industrialised economy and a leader in regional and continental affairs. A G20 member and Africa's most advanced economy with significant mineral wealth and manufacturing capacity.",
  },
  ghana: {
    name: "Ghana",
    capital: "Accra",
    population: "33 million",
    gdp: "$76 billion",
    headOfState: "President",
    region: "West Africa",
    keyExports: ["Gold", "Cocoa", "Oil", "Timber", "Aluminium"],
    nigeriaRelation:
      "Close neighbour, ECOWAS partner, and frequent destination for Nigerian business and trade. Historical tensions over treatment of Ghanaian traders in Nigeria and vice versa. The two nations are the twin engines of West African integration.",
    description:
      "West Africa's most stable democracy and a significant regional anchor. Ghana's relative political stability and improving economic management have made it a model for the sub-region.",
  },
  india: {
    name: "India",
    capital: "New Delhi",
    population: "1.44 billion",
    gdp: "$3.7 trillion",
    headOfState: "Prime Minister",
    region: "South Asia",
    keyExports: ["Pharmaceuticals", "Refined petroleum", "Machinery", "Diamonds", "Garments"],
    nigeriaRelation:
      "India is a major supplier of pharmaceuticals to Nigeria, with a significant Indian business community in the country. Bilateral trade is growing rapidly with India emerging as an important investment partner.",
    description:
      "The world's most populous country and fifth-largest economy, India is a rising global power with extensive ties across Africa through its South-South cooperation frameworks and private sector investments.",
  },
  brazil: {
    name: "Brazil",
    capital: "Brasília",
    population: "215 million",
    gdp: "$2.1 trillion",
    headOfState: "President",
    region: "South America",
    keyExports: ["Soybeans", "Iron ore", "Crude oil", "Sugar", "Beef"],
    nigeriaRelation:
      "South-South partner with growing ties in agriculture, oil technology, and cultural exchange. Brazil and Nigeria share significant historical connections through the African diaspora, particularly in Bahia state. Petrobras has explored cooperation with NNPC.",
    description:
      "South America's largest country and economy, Brazil is a major emerging market and agricultural superpower. It leads the BRICS grouping alongside China, Russia, India, and South Africa.",
  },
};

/** ECOWAS — the primary regional intergovernmental organisation */
export const ECOWAS_DATA: InternationalOrgData = {
  name: "Economic Community of West African States (ECOWAS)",
  headquarters: "Abuja, Nigeria",
  memberStates: [
    "Benin",
    "Burkina Faso",
    "Cape Verde",
    "Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Ivory Coast",
    "Liberia",
    "Mali",
    "Mauritania",
    "Niger",
    "Nigeria",
    "Senegal",
    "Sierra Leone",
    "Togo",
  ],
  secretaryGeneral: "Omar Alieu Touray",
  description:
    "ECOWAS is the primary regional economic and political bloc for West Africa, established in 1975. Nigeria is its largest economy and dominant political actor. The bloc promotes trade integration, free movement of persons, and regional peacekeeping through its ECOMOG force. Nigeria hosts ECOWAS headquarters in Abuja and contributes the lion's share of its budget.",
};

/** Case-insensitive lookup by country name or slug */
export function getCountryData(name: string): CountryData | undefined {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  if (COUNTRY_DATABASE[slug]) return COUNTRY_DATABASE[slug];
  // Also try direct lowercase match
  const direct = Object.values(COUNTRY_DATABASE).find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return direct;
}
