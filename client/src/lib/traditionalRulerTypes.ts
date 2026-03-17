// traditionalRulerTypes.ts — Traditional ruler types, positions, and constants

import type { CharacterCompetencies } from "./competencyTypes";

export type TraditionalRulerTier = "paramount" | "first-class" | "second-class";

export interface TraditionalRulerPosition {
  id: string;
  title: string;          // "Sultan of Sokoto", "Ooni of Ife", "Obi of Onitsha"
  state: string;
  zone: string;
  tier: TraditionalRulerTier;
  influenceWeight: number; // 0.3-1.0 — how much this ruler affects their zone
  description: string;
}

export interface TraditionalRulerAppointment {
  positionId: string;
  characterName: string;  // Always filled — auto-appointed
  appointedDay: number;
  lastStateVisitDay?: number; // Day of last presidential state visit (14-day cooldown)
}

export interface TraditionalRulerCandidate {
  name: string;
  state: string;
  zone: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  disposition: "supportive" | "neutral" | "critical";
  influence: number;       // 40-95
  qualifiedFor: string[];  // position IDs
  competencies: {
    professional: CharacterCompetencies["professional"];
    personal: CharacterCompetencies["personal"];
  };
}

export interface TraditionalRulerSystemState {
  positions: TraditionalRulerPosition[];
  appointments: TraditionalRulerAppointment[];
  royalCouncilSupport: number; // 0-100 aggregate
}

// ── Traits available for traditional rulers ─────────────────────────────────

export const TRADITIONAL_RULER_TRAITS = [
  "Royal Lineage",
  "Reformist",
  "Conservative",
  "Mediator",
  "Community Builder",
  "Political Operator",
  "Religious Authority",
  "Cultural Guardian",
  "Modernizer",
  "Bridge Builder",
  "Isolationist",
  "Pan-Nigerian",
  "Youth Advocate",
  "Land Rights Champion",
  "Business Acumen",
  "Scholarly",
  "Military Background",
  "Legal Mind",
] as const;

// ── Positions ───────────────────────────────────────────────────────────────

export const TRADITIONAL_RULER_POSITIONS: TraditionalRulerPosition[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  //  PARAMOUNT TIER (8 positions) — influenceWeight 0.8–1.0
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "sultan-sokoto",
    title: "Sultan of Sokoto",
    state: "Sokoto",
    zone: "NW",
    tier: "paramount",
    influenceWeight: 1.0,
    description: "Spiritual leader of Nigerian Muslims and head of the Sokoto Caliphate. The most influential traditional ruler in the country, wielding immense religious and political authority across the North.",
  },
  {
    id: "ooni-ife",
    title: "Ooni of Ife",
    state: "Osun",
    zone: "SW",
    tier: "paramount",
    influenceWeight: 0.95,
    description: "Spiritual head of the Yoruba people, custodian of Ile-Ife — the ancestral home of the Yoruba race. Commands deep cultural reverence and diplomatic influence throughout the South-West.",
  },
  {
    id: "oba-benin",
    title: "Oba of Benin",
    state: "Edo",
    zone: "SS",
    tier: "paramount",
    influenceWeight: 0.9,
    description: "Ruler of the ancient Benin Kingdom with a dynasty stretching back centuries. Revered across the South-South and internationally for the kingdom's rich cultural heritage.",
  },
  {
    id: "obi-onitsha",
    title: "Obi of Onitsha",
    state: "Anambra",
    zone: "SE",
    tier: "paramount",
    influenceWeight: 0.85,
    description: "The most prominent Igbo traditional ruler, the Obi of Onitsha presides over one of the oldest monarchies east of the Niger. A symbol of Igbo commerce, culture, and political identity.",
  },
  {
    id: "shehu-borno",
    title: "Shehu of Borno",
    state: "Borno",
    zone: "NE",
    tier: "paramount",
    influenceWeight: 0.9,
    description: "Traditional leader of the Kanuri people and head of the Borno Emirate. A critical voice in the fight against insurgency and the custodian of centuries-old Kanem-Bornu heritage.",
  },
  {
    id: "etsu-nupe",
    title: "Etsu Nupe",
    state: "Niger",
    zone: "NC",
    tier: "paramount",
    influenceWeight: 0.85,
    description: "Ruler of the Nupe Kingdom in Niger State. The Nupe people's paramount leader, wielding significant political influence in the North-Central zone and the Middle Belt.",
  },
  {
    id: "oba-lagos",
    title: "Oba of Lagos",
    state: "Lagos",
    zone: "SW",
    tier: "paramount",
    influenceWeight: 0.85,
    description: "Traditional ruler of Lagos, Nigeria's commercial capital. Despite Lagos's cosmopolitan nature, the Oba commands cultural authority among the Awori and broader Yoruba populace.",
  },
  {
    id: "obong-calabar",
    title: "Obong of Calabar",
    state: "Cross River",
    zone: "SS",
    tier: "paramount",
    influenceWeight: 0.8,
    description: "Traditional leader of the Efik people and paramount ruler of Calabar. Custodian of one of Nigeria's earliest contact points with European traders and missionaries.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  FIRST-CLASS TIER (20 positions) — influenceWeight 0.5–0.7
  // ═══════════════════════════════════════════════════════════════════════════

  // — NW Zone —
  {
    id: "emir-kano",
    title: "Emir of Kano",
    state: "Kano",
    zone: "NW",
    tier: "first-class",
    influenceWeight: 0.7,
    description: "Head of the Kano Emirate, one of the most powerful traditional institutions in the North. The Emir presides over Nigeria's second-largest city and its vast commercial networks.",
  },
  {
    id: "emir-zazzau",
    title: "Emir of Zazzau",
    state: "Kaduna",
    zone: "NW",
    tier: "first-class",
    influenceWeight: 0.65,
    description: "Ruler of the ancient Zazzau (Zaria) Emirate in Kaduna State. A key figure in northern political dynamics and custodian of one of the original Hausa city-states.",
  },
  {
    id: "emir-katsina",
    title: "Emir of Katsina",
    state: "Katsina",
    zone: "NW",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of the Katsina Emirate, one of the seven original Hausa states. Highly respected across the North-West for scholarly tradition and community leadership.",
  },

  // — NE Zone —
  {
    id: "emir-adamawa",
    title: "Lamido of Adamawa",
    state: "Adamawa",
    zone: "NE",
    tier: "first-class",
    influenceWeight: 0.65,
    description: "Traditional ruler of the Adamawa Emirate, the largest emirate in Nigeria by landmass. The Lamido commands loyalty across diverse ethnic communities in the North-East.",
  },
  {
    id: "emir-bauchi",
    title: "Emir of Bauchi",
    state: "Bauchi",
    zone: "NE",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Head of the Bauchi Emirate, overseeing a diverse state with multiple ethnic groups. A key mediator in inter-communal disputes in the North-East.",
  },
  {
    id: "mai-borno",
    title: "Mai of Dikwa",
    state: "Borno",
    zone: "NE",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Traditional ruler of the Dikwa Emirate, a subsidiary of the old Borno Empire. Plays a critical role in displaced community leadership amid the insurgency crisis.",
  },

  // — NC Zone —
  {
    id: "tor-tiv",
    title: "Tor Tiv",
    state: "Benue",
    zone: "NC",
    tier: "first-class",
    influenceWeight: 0.65,
    description: "Paramount ruler of the Tiv people, the largest ethnic group in the Middle Belt. The Tor Tiv is central to Benue politics and the herder-farmer conflict discourse.",
  },
  {
    id: "atta-igala",
    title: "Atta Igala",
    state: "Kogi",
    zone: "NC",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of the Igala Kingdom in Kogi State. The Atta commands reverence across the confluence region where the Niger and Benue rivers meet.",
  },
  {
    id: "och-idoma",
    title: "Och'Idoma",
    state: "Benue",
    zone: "NC",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Paramount ruler of the Idoma people in southern Benue. A respected voice on Middle Belt security and cultural preservation.",
  },
  {
    id: "gbong-gwom-jos",
    title: "Gbong Gwom Jos",
    state: "Plateau",
    zone: "NC",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of the Berom people and custodian of Jos, Plateau State's capital. A key figure in the volatile religious and ethnic dynamics of the Plateau.",
  },

  // — SW Zone —
  {
    id: "alaafin-oyo",
    title: "Alaafin of Oyo",
    state: "Oyo",
    zone: "SW",
    tier: "first-class",
    influenceWeight: 0.7,
    description: "Head of the old Oyo Empire, one of the most powerful pre-colonial African states. The Alaafin is a towering figure in Yoruba politics and cultural identity.",
  },
  {
    id: "awujale-ijebu",
    title: "Awujale of Ijebuland",
    state: "Ogun",
    zone: "SW",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of the Ijebu Kingdom in Ogun State. The Awujale presides over a historically wealthy and commercially astute Yoruba sub-group.",
  },
  {
    id: "ewi-ado-ekiti",
    title: "Ewi of Ado-Ekiti",
    state: "Ekiti",
    zone: "SW",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Paramount ruler of Ado-Ekiti, the capital of Ekiti State. The Ewi leads the Ekiti traditional council and is a voice for Ekiti unity and development.",
  },

  // — SE Zone —
  {
    id: "igwe-nnewi",
    title: "Igwe of Nnewi",
    state: "Anambra",
    zone: "SE",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of Nnewi, Nigeria's automobile and manufacturing hub. The Igwe presides over one of the wealthiest communities in South-East Nigeria.",
  },
  {
    id: "eze-aro",
    title: "Eze Aro of Arochukwu",
    state: "Abia",
    zone: "SE",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Traditional ruler of the Aro people, historically one of the most politically and commercially powerful Igbo groups. Custodian of the Long Juju shrine's heritage.",
  },
  {
    id: "igwe-enugu",
    title: "Igwe of Enugu",
    state: "Enugu",
    zone: "SE",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Traditional ruler of Enugu, the former capital of the Eastern Region. The Igwe oversees a city of deep political significance to the Igbo nation.",
  },

  // — SS Zone —
  {
    id: "pere-gbaramatu",
    title: "Pere of Gbaramatu",
    state: "Delta",
    zone: "SS",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of the Gbaramatu Kingdom in the oil-rich Niger Delta creeks. Wields enormous influence over the security and economy of Nigeria's oil heartland.",
  },
  {
    id: "amanyanabo-bonny",
    title: "Amanyanabo of Bonny",
    state: "Rivers",
    zone: "SS",
    tier: "first-class",
    influenceWeight: 0.6,
    description: "Traditional ruler of Bonny Island, home to Nigeria's largest LNG plant. The Amanyanabo sits at the intersection of traditional authority and the oil industry.",
  },
  {
    id: "amanyanabo-opobo",
    title: "Amanyanabo of Opobo",
    state: "Rivers",
    zone: "SS",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Traditional ruler of Opobo, the kingdom founded by King Jaja. A revered monarch with significant influence in Rivers State politics and the palm oil trade legacy.",
  },
  {
    id: "dein-agbor",
    title: "Dein of Agbor",
    state: "Delta",
    zone: "SS",
    tier: "first-class",
    influenceWeight: 0.55,
    description: "Traditional ruler of the Ika people in Delta State. The Dein presides over one of the oldest kingdoms in the western Niger Delta, bridging Edo and Delta cultures.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  SECOND-CLASS TIER (22 positions) — influenceWeight 0.3–0.5
  // ═══════════════════════════════════════════════════════════════════════════

  // — NW Zone —
  {
    id: "emir-gwandu",
    title: "Emir of Gwandu",
    state: "Kebbi",
    zone: "NW",
    tier: "second-class",
    influenceWeight: 0.45,
    description: "Ruler of the Gwandu Emirate in Kebbi State, historically one of the twin seats of the Sokoto Caliphate. Maintains influence in Kebbi and parts of Niger State.",
  },
  {
    id: "emir-kazaure",
    title: "Emir of Kazaure",
    state: "Jigawa",
    zone: "NW",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of the Kazaure Emirate in Jigawa State. A quiet but respected voice in North-West traditional politics.",
  },
  {
    id: "emir-zamfara",
    title: "Emir of Anka",
    state: "Zamfara",
    zone: "NW",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of the Anka Emirate in Zamfara State. Plays a mediating role in the banditry crisis affecting the North-West.",
  },

  // — NE Zone —
  {
    id: "emir-gombe",
    title: "Emir of Gombe",
    state: "Gombe",
    zone: "NE",
    tier: "second-class",
    influenceWeight: 0.45,
    description: "Traditional ruler of Gombe Emirate. A respected first-generation emirate leader in the North-East's transitional zone between the Hausa and Kanuri peoples.",
  },
  {
    id: "emir-muri",
    title: "Emir of Muri",
    state: "Taraba",
    zone: "NE",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of the Muri Emirate in Taraba State. Oversees a diverse community of Jukun, Mumuye, and other ethnic groups.",
  },
  {
    id: "mai-fika",
    title: "Mai of Fika",
    state: "Yobe",
    zone: "NE",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of the Fika Emirate in Yobe State. A small but influential emirate in the North-East, known for its scholastic tradition.",
  },
  {
    id: "emir-potiskum",
    title: "Emir of Potiskum",
    state: "Yobe",
    zone: "NE",
    tier: "second-class",
    influenceWeight: 0.35,
    description: "Traditional ruler of Potiskum, the commercial capital of Yobe State. Plays a key role in trade and inter-ethnic harmony.",
  },

  // — NC Zone —
  {
    id: "ohinoyi-ebira",
    title: "Ohinoyi of Ebiraland",
    state: "Kogi",
    zone: "NC",
    tier: "second-class",
    influenceWeight: 0.45,
    description: "Traditional ruler of the Ebira people in central Kogi State. The Ohinoyi is a key stakeholder in the multi-ethnic politics of the confluence state.",
  },
  {
    id: "emir-lafia",
    title: "Emir of Lafia",
    state: "Nasarawa",
    zone: "NC",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of Lafia Emirate, the Nasarawa State capital. Balances influence among Hausa, Alago, and other local ethnic groups.",
  },
  {
    id: "emir-ilorin",
    title: "Emir of Ilorin",
    state: "Kwara",
    zone: "NC",
    tier: "second-class",
    influenceWeight: 0.5,
    description: "Ruler of Ilorin Emirate, a unique emirate in the Yoruba-speaking North-Central. The Emir bridges northern Islamic tradition with Yoruba cultural identity.",
  },
  {
    id: "agwam-angas",
    title: "Long Jan of Angas",
    state: "Plateau",
    zone: "NC",
    tier: "second-class",
    influenceWeight: 0.35,
    description: "Traditional ruler of the Angas people in Plateau State. An important voice in the complex ethnic mosaic of the Jos Plateau.",
  },

  // — SW Zone —
  {
    id: "oba-akure",
    title: "Deji of Akure",
    state: "Ondo",
    zone: "SW",
    tier: "second-class",
    influenceWeight: 0.45,
    description: "Traditional ruler of Akure, capital of Ondo State. The Deji is a prominent Yoruba monarch presiding over a rapidly urbanising kingdom.",
  },
  {
    id: "alake-abeokuta",
    title: "Alake of Egbaland",
    state: "Ogun",
    zone: "SW",
    tier: "second-class",
    influenceWeight: 0.5,
    description: "Traditional ruler of the Egba people in Abeokuta. Historically one of the most powerful Yoruba monarchs, with roots in anti-colonial resistance.",
  },
  {
    id: "olubadan-ibadan",
    title: "Olubadan of Ibadan",
    state: "Oyo",
    zone: "SW",
    tier: "second-class",
    influenceWeight: 0.5,
    description: "Traditional ruler of Ibadan, the largest indigenous city in sub-Saharan Africa. The Olubadan presides over a unique chieftaincy system based on seniority.",
  },
  {
    id: "orangun-ila",
    title: "Orangun of Ila",
    state: "Osun",
    zone: "SW",
    tier: "second-class",
    influenceWeight: 0.35,
    description: "Traditional ruler of Ila-Orangun in Osun State. One of the seven original Yoruba princes from the Ile-Ife dispersion legend.",
  },

  // — SE Zone —
  {
    id: "igwe-orlu",
    title: "Igwe of Orlu",
    state: "Imo",
    zone: "SE",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of Orlu in Imo State. An important figure in Igbo traditional governance and community development.",
  },
  {
    id: "eze-afikpo",
    title: "Eze of Afikpo",
    state: "Ebonyi",
    zone: "SE",
    tier: "second-class",
    influenceWeight: 0.35,
    description: "Traditional ruler of the Afikpo community in Ebonyi State. A guardian of rich masquerade traditions and cross-border Igbo cultural heritage.",
  },
  {
    id: "igwe-ogidi",
    title: "Igwe of Ogidi",
    state: "Anambra",
    zone: "SE",
    tier: "second-class",
    influenceWeight: 0.35,
    description: "Traditional ruler of Ogidi, hometown of Chinua Achebe. The Igwe oversees a community central to Nigeria's literary and cultural heritage.",
  },

  // — SS Zone —
  {
    id: "olu-warri",
    title: "Olu of Warri",
    state: "Delta",
    zone: "SS",
    tier: "second-class",
    influenceWeight: 0.5,
    description: "Traditional ruler of the Itsekiri Kingdom in Delta State. The Olu presides over a kingdom with deep historical ties to European maritime trade.",
  },
  {
    id: "amanyanabo-nembe",
    title: "Amanyanabo of Nembe",
    state: "Bayelsa",
    zone: "SS",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of the Nembe Kingdom in Bayelsa State. Custodian of rich Ijaw heritage in the heart of the Niger Delta.",
  },
  {
    id: "obong-uyo",
    title: "Clan Head of Uyo",
    state: "Akwa Ibom",
    zone: "SS",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of Uyo, capital of Akwa Ibom State. A respected Ibibio leader who mediates between modern governance and traditional authority.",
  },
  {
    id: "amanyanabo-kalabari",
    title: "Amanyanabo of Kalabari",
    state: "Rivers",
    zone: "SS",
    tier: "second-class",
    influenceWeight: 0.4,
    description: "Traditional ruler of the Kalabari Kingdom in Rivers State. The Kalabari are one of the most historically significant Ijaw groups in the Niger Delta.",
  },
];
