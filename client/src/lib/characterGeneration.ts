// client/src/lib/characterGeneration.ts
import { seededRandom, pick } from "./seededRandom";

interface PositionPool {
  federal: string[];
  state: string[];
}

export const POSITION_POOLS: Record<string, PositionPool> = {
  economics: {
    federal: [
      "Director-General, Budget Office of the Federation",
      "Executive Director, Nigerian Investment Promotion Commission",
      "Director, Federal Ministry of Finance",
      "Managing Director, Bank of Industry",
      "Commissioner, Federal Inland Revenue Service",
      "Director-General, Debt Management Office",
    ],
    state: [
      "Commissioner for Finance, {state} State",
      "Commissioner for Commerce, {state} State",
      "Director of Revenue, {state} State",
      "Special Adviser on Economic Planning, {state} State",
      "Chairman, {state} State Internal Revenue Service",
    ],
  },
  diplomacy: {
    federal: [
      "Ambassador to the United Kingdom",
      "Ambassador to the United States",
      "Director, Ministry of Foreign Affairs",
      "Permanent Representative to the United Nations",
      "Special Envoy to ECOWAS",
      "Trade Commissioner, West Africa",
    ],
    state: [
      "Director of Inter-Governmental Relations, {state} State",
      "Special Adviser on Federal Matters, {state} State",
      "Commissioner for Inter-State Affairs, {state} State",
    ],
  },
  security: {
    federal: [
      "Director, Department of State Services",
      "Assistant Inspector-General of Police",
      "Commander, Joint Task Force",
      "Director of Military Intelligence",
      "Commandant, National Defence Academy",
      "Deputy National Security Adviser",
    ],
    state: [
      "Commissioner of Police, {state} State",
      "State Director, DSS {state}",
      "Commander, {state} State Security Task Force",
      "Defence Attaché, Nigerian Embassy",
    ],
  },
  media: {
    federal: [
      "Director-General, Nigerian Television Authority",
      "Director-General, Federal Radio Corporation",
      "Director, National Orientation Agency",
      "Special Adviser on Media, Presidency",
      "Managing Director, News Agency of Nigeria",
    ],
    state: [
      "Commissioner for Information, {state} State",
      "Press Secretary, {state} State Government",
      "Director of Communications, {state} State",
      "Managing Director, {state} Broadcasting Corporation",
    ],
  },
  legal: {
    federal: [
      "Director of Public Prosecutions",
      "Zonal Head, EFCC",
      "Secretary, National Judicial Council",
      "Director, Federal Ministry of Justice",
      "Chairman, Administrative Panel of Inquiry",
      "Legal Adviser, National Assembly",
    ],
    state: [
      "Attorney-General, {state} State",
      "Solicitor-General, {state} State",
      "Chief Magistrate, {state} State",
      "Commissioner for Justice, {state} State",
    ],
  },
  administration: {
    federal: [
      "Permanent Secretary, Federal Ministry",
      "Director-General, Bureau of Public Service Reforms",
      "Secretary, Federal Civil Service Commission",
      "Director, Office of the Head of Civil Service",
      "Chairman, Federal Character Commission",
    ],
    state: [
      "Head of Civil Service, {state} State",
      "Permanent Secretary, {state} State",
      "Chairman, {state} Local Government Service Commission",
      "Secretary to the {state} State Government",
      "Commissioner for Establishments, {state} State",
    ],
  },
  technology: {
    federal: [
      "Director-General, NITDA",
      "Director, National Centre for AI and Robotics",
      "Special Adviser on Digital Economy, Presidency",
      "Director-General, Galaxy Backbone",
      "CEO, National Information Technology Development Fund",
    ],
    state: [
      "Commissioner for Science and Technology, {state} State",
      "Director of ICT, {state} State",
      "Special Adviser on Digital Innovation, {state} State",
      "Head of e-Government, {state} State",
    ],
  },
};

export function generateCareerHistory(opts: {
  age: number;
  state: string;
  topCompetencies: string[];
  currentPosition: string;
  gameYear: number;
  seed: number;
}): import("./competencyTypes").CareerEntry[] {
  const rng = seededRandom(opts.seed);
  const pastCount = Math.max(1, Math.min(4, Math.floor((opts.age - 30) / 6)));

  const entries: import("./competencyTypes").CareerEntry[] = [
    { position: opts.currentPosition, period: `${opts.gameYear}–Present`, current: true },
  ];

  let year = opts.gameYear;
  const usedPositions = new Set<string>();

  for (let i = 0; i < pastCount; i++) {
    const tenure = Math.floor(2 + rng() * 4);
    const endYear = year - 1;
    const startYear = endYear - tenure;
    year = startYear;

    const domain = opts.topCompetencies[i % opts.topCompetencies.length];
    const pool = POSITION_POOLS[domain];
    if (!pool) continue;

    const usesFederal = i === 0 || rng() > 0.5;
    const positionList = usesFederal ? pool.federal : pool.state;
    let position = pick(rng, positionList).replace("{state}", opts.state);

    let attempts = 0;
    while (usedPositions.has(position) && attempts < 10) {
      position = pick(rng, positionList).replace("{state}", opts.state);
      attempts++;
    }
    usedPositions.add(position);

    entries.push({
      position,
      period: `${startYear}–${endYear}`,
      current: false,
    });
  }

  return entries;
}

const ORIGIN_TEMPLATES = [
  "A native of {state} State, {name} is a prominent figure in {faction} circles.",
  "Hailing from {state} State, {name} has built a reputation within the {faction}.",
  "Born and raised in {state} State, {name} emerged as a key voice in the {faction}.",
  "{name} is a distinguished {ethnicity} leader from {state} State with deep roots in the {faction}.",
];

const EDUCATION_TEMPLATES = [
  "A graduate of {education_paraphrase}, {pronoun} brings strong academic credentials to public service.",
  "{pronoun_cap} academic journey through {education_paraphrase} shaped a rigorous analytical approach.",
  "Educated at {education_paraphrase}, {pronoun} combines intellectual depth with practical experience.",
];

const CAREER_TEMPLATES = [
  "{pronoun_cap} career includes a notable stint as {career_highlight}, where {pronoun} gained recognition for effective governance.",
  "Having previously served as {career_highlight}, {pronoun} developed a track record of institutional competence.",
  "A former {career_highlight}, {pronoun} is well-versed in the machinery of government.",
];

const TRAIT_TEMPLATES = [
  "Known for being {trait1} and {trait2}, {pronoun} commands respect in political circles.",
  "Colleagues describe {pronoun_obj} as {trait1} and {trait2}, qualities that define {pronoun_pos} political style.",
  "With a reputation for being {trait1} and {trait2}, {pronoun} has carved a distinct niche in public life.",
];

const CLOSING_TEMPLATES = [
  "{pronoun_cap} alignment with the {party} reflects a commitment to the party's vision for Nigeria's future.",
  "As a {party} loyalist, {pronoun} continues to shape policy within the party's ideological framework.",
  "{pronoun_cap} influence within the {party} makes {pronoun_obj} a figure to watch in national politics.",
  "Within the {party}, {pronoun} is regarded as both an asset and a potential power broker.",
];

function paraphraseEducation(education: string): string {
  if (!education) return "several leading institutions";
  const parts = education.split(",").map(p => p.trim());
  const names = parts.map(p => p.replace(/\s*\([^)]*\)\s*/g, "").trim()).filter(Boolean);
  if (names.length === 0) return "several leading institutions";
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

export function generateBiography(opts: {
  name: string;
  state: string;
  ethnicity: string;
  education: string;
  traits: string[];
  faction: string;
  careerHighlight: string;
  party: string;
  seed: number;
}): string {
  const rng = seededRandom(opts.seed);
  const pronoun = "they";
  const pronoun_cap = "Their";
  const pronoun_obj = "them";
  const pronoun_pos = "their";

  const vars: Record<string, string> = {
    name: opts.name,
    state: opts.state,
    ethnicity: opts.ethnicity || "Nigerian",
    faction: opts.faction || "political",
    education_paraphrase: paraphraseEducation(opts.education),
    career_highlight: opts.careerHighlight || "a senior government position",
    trait1: (opts.traits[0] || "pragmatic").toLowerCase(),
    trait2: (opts.traits[1] || "experienced").toLowerCase(),
    party: opts.party || "the ruling party",
    pronoun, pronoun_cap, pronoun_obj, pronoun_pos,
  };

  function fill(template: string): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || key);
  }

  const sentences = [
    fill(pick(rng, ORIGIN_TEMPLATES)),
    fill(pick(rng, EDUCATION_TEMPLATES)),
    fill(pick(rng, CAREER_TEMPLATES)),
    fill(pick(rng, TRAIT_TEMPLATES)),
    fill(pick(rng, CLOSING_TEMPLATES)),
  ];

  return sentences.join(" ");
}
