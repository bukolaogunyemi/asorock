// Agency Database — 12 Federal Agencies

export interface AgencyData {
  id: string;
  fullName: string;
  acronym: string;
  established: number;
  mandate: string;
  parentMinistry?: string;
  prestigeTier: "strategic" | "standard" | "routine";
}

export const AGENCY_DATABASE: Record<string, AgencyData> = {
  // ── Strategic ──────────────────────────────────────────
  nnpc: {
    id: "nnpc",
    fullName: "Nigerian National Petroleum Company Limited",
    acronym: "NNPC",
    established: 1977,
    mandate:
      "To explore, produce, transport, refine, and market petroleum and petroleum products on behalf of the Nigerian state, maximising value from Nigeria's hydrocarbon resources.",
    parentMinistry: "Petroleum",
    prestigeTier: "strategic",
  },
  cbn: {
    id: "cbn",
    fullName: "Central Bank of Nigeria",
    acronym: "CBN",
    established: 1958,
    mandate:
      "To maintain monetary and price stability, issue legal tender, manage Nigeria's external reserves, promote a sound financial system, and act as banker to the federal government.",
    parentMinistry: "Finance",
    prestigeTier: "strategic",
  },
  efcc: {
    id: "efcc",
    fullName: "Economic and Financial Crimes Commission",
    acronym: "EFCC",
    established: 2003,
    mandate:
      "To investigate, prevent, and prosecute economic and financial crimes including advance fee fraud, money laundering, and corruption involving public officials.",
    parentMinistry: "Justice",
    prestigeTier: "strategic",
  },
  nia: {
    id: "nia",
    fullName: "National Intelligence Agency",
    acronym: "NIA",
    established: 1986,
    mandate:
      "To collect, process, and disseminate foreign intelligence to protect Nigeria's national security interests, and to conduct counter-intelligence operations abroad.",
    parentMinistry: "Defence",
    prestigeTier: "strategic",
  },

  // ── Standard ───────────────────────────────────────────
  inec: {
    id: "inec",
    fullName: "Independent National Electoral Commission",
    acronym: "INEC",
    established: 1998,
    mandate:
      "To organise, conduct, and supervise elections and referenda, register voters and political parties, and ensure the credibility and transparency of Nigeria's democratic process.",
    prestigeTier: "standard",
  },
  ncc: {
    id: "ncc",
    fullName: "Nigerian Communications Commission",
    acronym: "NCC",
    established: 2003,
    mandate:
      "To regulate the telecommunications industry, licence operators, protect consumer rights, and promote competition and investment in Nigeria's communications sector.",
    prestigeTier: "standard",
  },
  nimasa: {
    id: "nimasa",
    fullName: "Nigerian Maritime Administration and Safety Agency",
    acronym: "NIMASA",
    established: 2006,
    mandate:
      "To regulate Nigerian shipping and seafarers, promote maritime safety, and develop indigenous shipping capacity through the implementation of cabotage laws.",
    parentMinistry: "Works & Housing",
    prestigeTier: "standard",
  },
  nddc: {
    id: "nddc",
    fullName: "Niger Delta Development Commission",
    acronym: "NDDC",
    established: 2000,
    mandate:
      "To facilitate the rapid, even, and sustainable development of the Niger Delta region, address environmental degradation from oil operations, and improve living conditions of the oil-producing communities.",
    parentMinistry: "Petroleum",
    prestigeTier: "standard",
  },

  // ── Routine ────────────────────────────────────────────
  nafdac: {
    id: "nafdac",
    fullName: "National Agency for Food and Drug Administration and Control",
    acronym: "NAFDAC",
    established: 1993,
    mandate:
      "To regulate and control the manufacture, importation, exportation, advertisement, distribution, sale, and use of food, drugs, cosmetics, medical devices, and chemicals in Nigeria.",
    parentMinistry: "Health",
    prestigeTier: "routine",
  },
  nimc: {
    id: "nimc",
    fullName: "National Identity Management Commission",
    acronym: "NIMC",
    established: 2007,
    mandate:
      "To create and manage a national identity database, issue National Identification Numbers (NIN), and harmonise all identity management systems in Nigeria.",
    prestigeTier: "routine",
  },
  nbs: {
    id: "nbs",
    fullName: "National Bureau of Statistics",
    acronym: "NBS",
    established: 2007,
    mandate:
      "To collect, compile, analyse, and publish statistical information relating to Nigeria's economy, society, and demographics, providing the evidence base for policy formulation.",
    parentMinistry: "Finance",
    prestigeTier: "routine",
  },
  nesrea: {
    id: "nesrea",
    fullName: "National Environmental Standards and Regulations Enforcement Agency",
    acronym: "NESREA",
    established: 2007,
    mandate:
      "To protect and develop Nigeria's environment, biodiversity, and natural resources, and to enforce Nigeria's environmental laws, regulations, and international conventions.",
    prestigeTier: "routine",
  },
};

/** Lookup an agency by its bare slug ID (e.g. 'nnpc', 'cbn') */
export function getAgencyData(id: string): AgencyData | undefined {
  return AGENCY_DATABASE[id.toLowerCase()];
}
