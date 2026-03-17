// client/src/lib/senatorPool.ts
// Nigerian Senate — 109 senators (50 hand-crafted + 59 generated)
// Seat distribution: ADU 56, PFC 22, NDM 12, NSF 8, TLA 5, HDP 3, PAP 2, UPA 1

import { generateCharacterPool } from "./characterPoolGenerator";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";
import { seededRandom, randRange, pick } from "./seededRandom";

export interface Senator {
  name: string;
  state: string;
  zone: string;
  party: string;
  senateDistrict: string; // e.g., "Kano Central", "Lagos West"
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  competence: number; // 40–90
  influence: number;  // 30–85
  loyalty: number;    // to party, 30–80
  isHandCrafted: boolean;
}

export const SENATOR_TRAITS = [
  "Committee Chair", "Floor Leader", "Veteran Lawmaker", "First-Term Senator",
  "Former Governor", "Business Mogul", "Legal Expert", "Party Loyalist",
  "Independent Voice", "Cross-Party Builder", "Media Savvy", "Constituency Champion",
  "Budget Hawk", "Security Expert", "Education Advocate", "Health Crusader",
  "Infrastructure Focused", "Anti-Corruption Champion", "Youth Senator", "Women's Advocate",
];

// ── Party seat distribution for assignment ─────────────────────────────────
// Total: 109 seats
// ADU: 56, PFC: 22, NDM: 12, NSF: 8, TLA: 5, HDP: 3, PAP: 2, UPA: 1
const SENATE_PARTY_SEATS: Record<string, number> = {
  ADU: 56, PFC: 22, NDM: 12, NSF: 8, TLA: 5, HDP: 3, PAP: 2, UPA: 1,
};

// Zone-weighted party pools (descending probability)
const PARTY_ZONE_WEIGHTS: Record<string, string[]> = {
  NW: ["ADU","ADU","ADU","PFC","ADU","NDM","NSF","ADU","PFC","TLA"],
  NE: ["ADU","ADU","PFC","ADU","NDM","NSF","PFC","ADU","TLA","HDP"],
  NC: ["ADU","PFC","ADU","NDM","NSF","PFC","ADU","HDP","TLA","PAP"],
  SW: ["PFC","ADU","NDM","PFC","NSF","TLA","ADU","HDP","PAP","NDM"],
  SE: ["NDM","PFC","NSF","ADU","TLA","NDM","HDP","PAP","PFC","NSF"],
  SS: ["PFC","NDM","ADU","NSF","PFC","TLA","NDM","HDP","PAP","UPA"],
};

// ── 50 Hand-crafted Senators ───────────────────────────────────────────────
// NW: 10, NE: 8, NC: 9, SW: 8, SE: 7, SS: 8

export const HANDCRAFTED_SENATORS: Senator[] = [

  // ── NORTH-WEST (10) ───────────────────────────────────────────────────────

  {
    name: "Sen. Musa Inuwa Labaran",
    state: "Kano",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Kano Central",
    age: 63,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "ML",
    traits: ["Committee Chair", "Veteran Lawmaker", "Party Loyalist"],
    bio: "A three-term senator who chairs the Senate Committee on Finance, Labaran has shepherded four consecutive appropriations bills through the upper chamber. His mastery of parliamentary procedure makes him one of the most effective floor managers in the Red Chamber.",
    education: "Bayero University Kano (Economics), University of London (MSc Finance)",
    competence: 82,
    influence: 78,
    loyalty: 75,
    isHandCrafted: true,
  },
  {
    name: "Sen. Hajia Ramatu Garba",
    state: "Kano",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Kano North",
    age: 54,
    gender: "Female",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "RG",
    traits: ["Women's Advocate", "Education Advocate", "First-Term Senator"],
    bio: "Former Commissioner for Education in Kano who ran a landmark girl-child enrolment campaign that added 220,000 pupils to school rolls. Won her Senate seat by a landslide on a platform of tertiary education reform and maternal health.",
    education: "Bayero University (Education), UDUS Sokoto (MEd), Leeds (MA Gender Studies)",
    competence: 72,
    influence: 64,
    loyalty: 68,
    isHandCrafted: true,
  },
  {
    name: "Sen. Alhaji Sani Danfulani",
    state: "Kaduna",
    zone: "NW",
    party: "PFC",
    senateDistrict: "Kaduna North",
    age: 58,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "SD",
    traits: ["Independent Voice", "Anti-Corruption Champion", "Legal Expert"],
    bio: "A former judge of the Federal High Court who left the bench to enter politics after decades watching legislators rubber-stamp executive excess. Chairs the Ethics and Privileges Committee and is feared in Abuja for his forensic questioning of budget padding.",
    education: "ABU Zaria (LLB), Nigerian Law School, University of Edinburgh (LLM)",
    competence: 85,
    influence: 70,
    loyalty: 45,
    isHandCrafted: true,
  },
  {
    name: "Sen. Ibrahim Maikudi",
    state: "Katsina",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Katsina Central",
    age: 67,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "IM",
    traits: ["Former Governor", "Veteran Lawmaker", "Security Expert"],
    bio: "Served two terms as Katsina governor before his elevation to the Senate, where he now sits as Deputy Senate President pro tempore. His relationships with Northern governors give him unmatched leverage in any inter-governmental negotiation.",
    education: "Usmanu Danfodiyo University (Political Science), Harvard Kennedy School (MPA)",
    competence: 80,
    influence: 85,
    loyalty: 70,
    isHandCrafted: true,
  },
  {
    name: "Sen. Alhaji Abubakar Waziri",
    state: "Sokoto",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Sokoto North",
    age: 60,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Fulani",
    avatar: "AW",
    traits: ["Floor Leader", "Party Loyalist", "Infrastructure Focused"],
    bio: "ADU's Senate Majority Whip whose relationship with the Sultanate gives him religious legitimacy that few northern politicians can match. Spearheaded the Rural Electrification Amendment that wired 3,400 communities in north-west Nigeria.",
    education: "Usmanu Danfodiyo University (Public Administration), NIPSS Kuru",
    competence: 73,
    influence: 75,
    loyalty: 78,
    isHandCrafted: true,
  },
  {
    name: "Sen. Fatima Aliyu-Kebbi",
    state: "Kebbi",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Kebbi South",
    age: 48,
    gender: "Female",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "FA",
    traits: ["Youth Senator", "Agriculture Advocate", "Media Savvy"],
    bio: "The youngest senator from Kebbi, she chairs the Sub-committee on Agriculture Value Chain and has been instrumental in the Anchors Borrowers Programme review. A prolific Twitter communicator who explains legislative business in Hausa to millions of followers.",
    education: "BUK Kano (Agricultural Economics), Cranfield University (MSc Agri-Business)",
    competence: 68,
    influence: 60,
    loyalty: 72,
    isHandCrafted: true,
  },
  {
    name: "Sen. Barr. Isa Zandam",
    state: "Zamfara",
    zone: "NW",
    party: "NDM",
    senateDistrict: "Zamfara West",
    age: 55,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "IZ",
    traits: ["Security Expert", "Independent Voice", "Legal Expert"],
    bio: "An opposition senator who has become the Senate's most vocal critic of the military's handling of Zamfara banditry. A trained barrister who uses his platform to demand accountability for security sector spending, making him inconvenient for every administration.",
    education: "ABU Zaria (LLB), Nigerian Law School, University of Warwick (LLM)",
    competence: 76,
    influence: 68,
    loyalty: 38,
    isHandCrafted: true,
  },
  {
    name: "Sen. Malam Yahaya Tukur",
    state: "Jigawa",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Jigawa North-West",
    age: 61,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "YT",
    traits: ["Committee Chair", "Budget Hawk", "Constituency Champion"],
    bio: "Chair of the Senate Appropriations Committee who insists on a line-by-line analysis of every ministry's annual budget. Described by colleagues as 'the most pedantic man in Abuja' — a badge he wears with pride after recovering ₦47 billion in questionable allocations.",
    education: "Bayero University (Accountancy), ICAN Fellow, ACA London",
    competence: 84,
    influence: 72,
    loyalty: 65,
    isHandCrafted: true,
  },
  {
    name: "Sen. Abdullahi Musa-Gwandu",
    state: "Kebbi",
    zone: "NW",
    party: "PFC",
    senateDistrict: "Kebbi Central",
    age: 52,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "AM",
    traits: ["Cross-Party Builder", "Business Mogul", "Media Savvy"],
    bio: "A wealthy transport and logistics businessman who crossed from ADU to PFC following a governance dispute with the state executive. Now one of the opposition's most effective fundraisers and his business acumen shapes the PFC's economic policy critique.",
    education: "Usmanu Danfodiyo University (Business Admin), Lagos Business School (MBA)",
    competence: 69,
    influence: 66,
    loyalty: 52,
    isHandCrafted: true,
  },
  {
    name: "Sen. Salisu Auta-Kano",
    state: "Kano",
    zone: "NW",
    party: "ADU",
    senateDistrict: "Kano South",
    age: 57,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "SA",
    traits: ["Infrastructure Focused", "Constituency Champion", "Floor Leader"],
    bio: "Three-term senator whose tenacity secured the Kano-Kaduna dual-carriageway highway project after a decade of unfulfilled promises. As ADU's Senate Liaison Officer he manages the chamber's legislative calendar and is rarely out-manoeuvred on procedural votes.",
    education: "ABU Zaria (Civil Engineering), Imperial College London (MSc)",
    competence: 77,
    influence: 73,
    loyalty: 74,
    isHandCrafted: true,
  },

  // ── NORTH-EAST (8) ────────────────────────────────────────────────────────

  {
    name: "Sen. Mohammed Ali Gubio",
    state: "Borno",
    zone: "NE",
    party: "ADU",
    senateDistrict: "Borno Central",
    age: 62,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Kanuri",
    avatar: "MG",
    traits: ["Security Expert", "Veteran Lawmaker", "Committee Chair"],
    bio: "A four-term senator who has served on every security-related committee in the Red Chamber, Gubio lost his ancestral home to Boko Haram in 2014 and has since made counter-insurgency legislation his life's work. Chairs the Senate Committee on Defence.",
    education: "University of Maiduguri (Political Science), National Defence College Abuja",
    competence: 80,
    influence: 76,
    loyalty: 70,
    isHandCrafted: true,
  },
  {
    name: "Sen. Aisha Bukar-Shehu",
    state: "Borno",
    zone: "NE",
    party: "ADU",
    senateDistrict: "Borno North",
    age: 49,
    gender: "Female",
    religion: "Islam",
    ethnicity: "Kanuri",
    avatar: "AB",
    traits: ["Health Crusader", "Women's Advocate", "First-Term Senator"],
    bio: "An OBGYN who turned to politics after leading Médecins Sans Frontières operations in IDP camps across the Lake Chad Basin. Her first legislative act was co-sponsoring the Humanitarian Emergency Health Fund Bill which secured ₦18 billion for crisis health services.",
    education: "UNIMAID (MBBS), Johns Hopkins Bloomberg School of Public Health (MPH)",
    competence: 74,
    influence: 61,
    loyalty: 65,
    isHandCrafted: true,
  },
  {
    name: "Sen. Bello Hammanyero",
    state: "Adamawa",
    zone: "NE",
    party: "PFC",
    senateDistrict: "Adamawa South",
    age: 56,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Fulani",
    avatar: "BH",
    traits: ["Independent Voice", "Anti-Corruption Champion", "Cross-Party Builder"],
    bio: "A former EFCC director who left the agency over political interference and successfully contested the senate seat under PFC. His reputation for incorruptibility has made him a darling of civil society and a thorn in the side of successive administrations.",
    education: "University of Jos (Law), London School of Economics (LLM)",
    competence: 81,
    influence: 67,
    loyalty: 44,
    isHandCrafted: true,
  },
  {
    name: "Sen. Bitrus Gambo",
    state: "Taraba",
    zone: "NE",
    party: "NDM",
    senateDistrict: "Taraba North",
    age: 51,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Tiv",
    avatar: "BG",
    traits: ["Education Advocate", "Constituency Champion", "Floor Leader"],
    bio: "A secondary school principal turned senator who has steered the Universal Basic Education (UBE) Amendment through the Senate after three previously failed attempts. Taraba's most locally popular politician with a 78% approval rating in the last constituency poll.",
    education: "ATBU Bauchi (Education), University of Reading (MEd)",
    competence: 70,
    influence: 63,
    loyalty: 56,
    isHandCrafted: true,
  },
  {
    name: "Sen. Garba Liman-Gombe",
    state: "Gombe",
    zone: "NE",
    party: "ADU",
    senateDistrict: "Gombe Central",
    age: 59,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "GL",
    traits: ["Party Loyalist", "Budget Hawk", "Infrastructure Focused"],
    bio: "Majority Caucus Vice-Chairman who reliably delivers his vote bloc for the ruling party on any contentious appropriations measure. A former state budget director whose detailed understanding of federal transfers makes him invaluable to the ADU leadership.",
    education: "University of Maiduguri (Accounting), ICAN, University of Leeds (MSc)",
    competence: 73,
    influence: 68,
    loyalty: 80,
    isHandCrafted: true,
  },
  {
    name: "Sen. Hajiya Zainab Abubakar-Bauchi",
    state: "Bauchi",
    zone: "NE",
    party: "ADU",
    senateDistrict: "Bauchi North",
    age: 53,
    gender: "Female",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "ZA",
    traits: ["Education Advocate", "Women's Advocate", "Media Savvy"],
    bio: "One of the Senate's leading advocates for the Girl-Child Education Bill, she has tirelessly toured 12 northern states to build cross-partisan support. A former journalist who co-founded the first all-women's radio station in north-east Nigeria.",
    education: "Abubakar Tafawa Balewa University (Mass Communication), Cardiff University (MA Journalism)",
    competence: 68,
    influence: 62,
    loyalty: 67,
    isHandCrafted: true,
  },
  {
    name: "Sen. Dauda Musa-Yobe",
    state: "Yobe",
    zone: "NE",
    party: "ADU",
    senateDistrict: "Yobe East",
    age: 64,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Kanuri",
    avatar: "DY",
    traits: ["Veteran Lawmaker", "Security Expert", "Party Loyalist"],
    bio: "A veteran of four senate terms who served as Senate President pro tempore during the 9th Assembly. His institutional memory is encyclopaedic — he can recite the standing orders from memory — and his support is indispensable for any constitutional amendment.",
    education: "University of Maiduguri (Political Science), NIPSS Kuru",
    competence: 78,
    influence: 80,
    loyalty: 76,
    isHandCrafted: true,
  },
  {
    name: "Sen. Emmanuel Jakada",
    state: "Adamawa",
    zone: "NE",
    party: "PFC",
    senateDistrict: "Adamawa North",
    age: 47,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Fulani",
    avatar: "EJ",
    traits: ["Youth Senator", "Anti-Corruption Champion", "Media Savvy"],
    bio: "The youngest senator from the north-east who ran his campaign entirely on social media and won in a constituency the opposition had never taken. A chartered accountant who made his name auditing local government councils and publicly releasing the results.",
    education: "Modibbo Adama University (Accountancy), ACCA, University of Birmingham (MSc Finance)",
    competence: 72,
    influence: 58,
    loyalty: 50,
    isHandCrafted: true,
  },

  // ── NORTH-CENTRAL (9) ─────────────────────────────────────────────────────

  {
    name: "Sen. Terfa Ape",
    state: "Benue",
    zone: "NC",
    party: "PFC",
    senateDistrict: "Benue North-West",
    age: 55,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Tiv",
    avatar: "TA",
    traits: ["Security Expert", "Constituency Champion", "Independent Voice"],
    bio: "A senator who has staked his career on resolving the herders-farmers conflict in the Middle Belt, Ape has organised six all-party peace summits in Makurdi. Despite pressure from both sides, he refuses to align with ethnic champions and insists on dialogue.",
    education: "University of Jos (Political Science), Cambridge University (MPhil Conflict Studies)",
    competence: 77,
    influence: 68,
    loyalty: 46,
    isHandCrafted: true,
  },
  {
    name: "Sen. Mrs. Grace Obi-Kogi",
    state: "Kogi",
    zone: "NC",
    party: "ADU",
    senateDistrict: "Kogi Central",
    age: 50,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "GO",
    traits: ["Women's Advocate", "Health Crusader", "First-Term Senator"],
    bio: "A former state commissioner for health who implemented Kogi's successful primary healthcare revitalisation. Her senate debut has focused on the National Health Insurance Authority reform bill, for which she organised 14 stakeholder consultations across six states.",
    education: "University of Benin (Medicine), London School of Hygiene and Tropical Medicine (MPH)",
    competence: 75,
    influence: 62,
    loyalty: 66,
    isHandCrafted: true,
  },
  {
    name: "Sen. Razaq Oyelaran",
    state: "Kwara",
    zone: "NC",
    party: "ADU",
    senateDistrict: "Kwara North",
    age: 58,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Yoruba",
    avatar: "RO",
    traits: ["Legal Expert", "Floor Leader", "Cross-Party Builder"],
    bio: "A senior advocate who serves as the Minority Whip's parliamentary liaison and is known for brokering unlikely cross-partisan deals on thorny constitutional bills. His legal mind means he is always the last to speak on any amendment and usually the most persuasive.",
    education: "University of Ilorin (LLB), Nigerian Law School (BL), Cambridge (LLM)",
    competence: 83,
    influence: 70,
    loyalty: 60,
    isHandCrafted: true,
  },
  {
    name: "Sen. Aliyu Makama",
    state: "Nasarawa",
    zone: "NC",
    party: "ADU",
    senateDistrict: "Nasarawa East",
    age: 53,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Tiv",
    avatar: "AM",
    traits: ["Committee Chair", "Infrastructure Focused", "Party Loyalist"],
    bio: "Chair of the Senate Committee on Solid Minerals who has overseen the drafting of two landmark mining acts in the current assembly. His constituents in the Nasarawa mining belt credit him with bringing the first paved road into their local government area.",
    education: "FUT Minna (Geology), University of Leeds (MSc Mining Engineering)",
    competence: 71,
    influence: 65,
    loyalty: 72,
    isHandCrafted: true,
  },
  {
    name: "Sen. Babatunde Idris",
    state: "Niger",
    zone: "NC",
    party: "NSF",
    senateDistrict: "Niger East",
    age: 61,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "BI",
    traits: ["Anti-Corruption Champion", "Budget Hawk", "Independent Voice"],
    bio: "A whistle-blower turned senator who leaked the controversial NDDC audit report while serving as a ministry director — then successfully ran for senate on the scandal. His committee work on Finance and Appropriations is widely described as the most rigorous in the chamber.",
    education: "Ahmadu Bello University (Public Administration), University of Warwick (MSc Governance)",
    competence: 80,
    influence: 65,
    loyalty: 40,
    isHandCrafted: true,
  },
  {
    name: "Sen. Sen. Yakubu Danladi",
    state: "Plateau",
    zone: "NC",
    party: "PFC",
    senateDistrict: "Plateau South",
    age: 56,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Berom",
    avatar: "YD",
    traits: ["Security Expert", "Education Advocate", "Constituency Champion"],
    bio: "A former security adviser to the Plateau state government who ran for senate to give rural communities a direct voice in the national security discourse. His testimony before the Senate Defence Committee on the Plateau crisis is regarded as a watershed moment in Nigerian security hearings.",
    education: "University of Jos (Law), National Defence College (Strategic Studies)",
    competence: 74,
    influence: 64,
    loyalty: 50,
    isHandCrafted: true,
  },
  {
    name: "Sen. Dr. Tunde Fashola-Kwara",
    state: "Kwara",
    zone: "NC",
    party: "NDM",
    senateDistrict: "Kwara South",
    age: 49,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "TF",
    traits: ["Legal Expert", "Anti-Corruption Champion", "Media Savvy"],
    bio: "A constitutional law academic who left the University of Ilorin to challenge a three-term incumbent and won by 12,000 votes. His scholarly interventions on constitutional amendments are carried live by NTA and frequently referenced by the Supreme Court.",
    education: "University of Ilorin (LLB), LSE (LLM), Oxford (DPhil Constitutional Law)",
    competence: 86,
    influence: 67,
    loyalty: 48,
    isHandCrafted: true,
  },
  {
    name: "Sen. Mrs. Ngozi Chidozie",
    state: "Kogi",
    zone: "NC",
    party: "ADU",
    senateDistrict: "Kogi West",
    age: 52,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "NC",
    traits: ["Business Mogul", "Infrastructure Focused", "Cross-Party Builder"],
    bio: "A former CEO of a major petrochemical firm who pivoted to politics to advance Nigeria's downstream energy reforms. She has used her private sector network to attract foreign investment commitments to three constituencies in her senatorial zone.",
    education: "University of Nigeria Nsukka (Chemical Engineering), Wharton (MBA), INSEAD",
    competence: 78,
    influence: 71,
    loyalty: 62,
    isHandCrafted: true,
  },
  {
    name: "Sen. Abubakar Maccido",
    state: "FCT",
    zone: "NC",
    party: "ADU",
    senateDistrict: "FCT Abuja",
    age: 57,
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "AM",
    traits: ["Veteran Lawmaker", "Floor Leader", "Party Loyalist"],
    bio: "The lone FCT senator who represents the politically complex Abuja electorate — civil servants, diplomats, and over two dozen ethnic groups. His political survival across three terms is a masterclass in coalition management, balancing the interests of indigenous Gbagyi people against the city's migrant majority.",
    education: "University of Abuja (Public Administration), Harvard Kennedy School (MPA)",
    competence: 76,
    influence: 72,
    loyalty: 73,
    isHandCrafted: true,
  },

  // ── SOUTH-WEST (8) ────────────────────────────────────────────────────────

  {
    name: "Sen. Chief Akinwale Badejo",
    state: "Lagos",
    zone: "SW",
    party: "PFC",
    senateDistrict: "Lagos West",
    age: 65,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "AB",
    traits: ["Veteran Lawmaker", "Business Mogul", "Floor Leader"],
    bio: "A commercial law titan and three-term Lagos senator who chairs the Senate Rules and Business Committee. Instrumental in the Companies and Allied Matters Act (CAMA) 2020 revision, his name is synonymous with business-friendly legislative reform. Controls a party faction of 14 senators.",
    education: "University of Lagos (LLB), Harvard Law School (LLM), Inner Temple (Called to Bar)",
    competence: 85,
    influence: 85,
    loyalty: 55,
    isHandCrafted: true,
  },
  {
    name: "Sen. Dr. Funke Adewale",
    state: "Ogun",
    zone: "SW",
    party: "PFC",
    senateDistrict: "Ogun Central",
    age: 51,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "FA",
    traits: ["Health Crusader", "Women's Advocate", "Committee Chair"],
    bio: "A public health physician and founder of Nigeria's largest NGO for maternal mortality reduction. Elected to the Senate after her NGO's work earned her a global reputation, she chairs the Committee on Health and now steers the National Insurance Authority Amendment through committee hearings.",
    education: "University of Ibadan (MBBS, MPH), Johns Hopkins Bloomberg (DrPH)",
    competence: 80,
    influence: 68,
    loyalty: 58,
    isHandCrafted: true,
  },
  {
    name: "Sen. Prof. Oladele Ogundimu",
    state: "Oyo",
    zone: "SW",
    party: "ADU",
    senateDistrict: "Oyo North",
    age: 60,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "OO",
    traits: ["Education Advocate", "Legal Expert", "Independent Voice"],
    bio: "A former vice-chancellor of the University of Ibadan who brought academic rigour to the Red Chamber. Known for writing the most exhaustive dissenting opinion in the history of the Senate Ethics Committee, a document now cited in three constitutional law textbooks.",
    education: "University of Ibadan (LLB, LLM, PhD Constitutional Law), Oxford (DPhil)",
    competence: 88,
    influence: 70,
    loyalty: 52,
    isHandCrafted: true,
  },
  {
    name: "Sen. Lanre Adefolarin",
    state: "Osun",
    zone: "SW",
    party: "NDM",
    senateDistrict: "Osun West",
    age: 47,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "LA",
    traits: ["Youth Senator", "Anti-Corruption Champion", "Media Savvy"],
    bio: "A former investigative journalist who founded NigeriaLeaks and published 14 major corruption exposés before running for senate under the NDM ticket. His parliamentary questions are dreaded by ministers for their forensic detail and his social media following exceeds all other serving senators.",
    education: "Obafemi Awolowo University (Mass Communication), Columbia University (MS Journalism)",
    competence: 73,
    influence: 65,
    loyalty: 45,
    isHandCrafted: true,
  },
  {
    name: "Sen. Yetunde Adeola",
    state: "Lagos",
    zone: "SW",
    party: "PFC",
    senateDistrict: "Lagos East",
    age: 55,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "YA",
    traits: ["Business Mogul", "Infrastructure Focused", "Committee Chair"],
    bio: "CEO of a major real estate conglomerate who entered politics to fix Nigeria's broken land and mortgage market. Her landmark Mortgage Institutions Amendment Bill passed third reading after she spent ₦300 million of her own money on nationwide stakeholder engagements.",
    education: "University of Lagos (Estate Management), LSE (MSc Finance), Harvard (AMP)",
    competence: 79,
    influence: 74,
    loyalty: 56,
    isHandCrafted: true,
  },
  {
    name: "Sen. Adebisi Adeyemi",
    state: "Ondo",
    zone: "SW",
    party: "TLA",
    senateDistrict: "Ondo North",
    age: 53,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "AA",
    traits: ["Cross-Party Builder", "Independent Voice", "Constituency Champion"],
    bio: "One of TLA's most effective senators who refuses to toe any party line slavishly. He has voted with the ruling party on economic bills while opposing it on security legislation, making him a swing vote that both sides actively court.",
    education: "Obafemi Awolowo University (Economics), University College London (MSc Development Economics)",
    competence: 75,
    influence: 67,
    loyalty: 36,
    isHandCrafted: true,
  },
  {
    name: "Sen. Mrs. Bisi Okafor-Ekiti",
    state: "Ekiti",
    zone: "SW",
    party: "ADU",
    senateDistrict: "Ekiti North",
    age: 58,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "BO",
    traits: ["Education Advocate", "Party Loyalist", "Health Crusader"],
    bio: "A former professor of pharmacology who advised two national drug regulatory bodies before entering politics. Ekiti's longest-serving senator who leveraged her scientific credentials to ensure Nigeria's Food and Drug Bill met WHO standards.",
    education: "University of Ibadan (BSc, MSc Pharmacology, PhD), University of Edinburgh (Postdoc)",
    competence: 82,
    influence: 66,
    loyalty: 71,
    isHandCrafted: true,
  },
  {
    name: "Sen. Oluwafemi Adegboyega",
    state: "Ogun",
    zone: "SW",
    party: "PFC",
    senateDistrict: "Ogun East",
    age: 59,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "OA",
    traits: ["Legal Expert", "Budget Hawk", "Veterans Lawmaker"],
    bio: "A former Director-General of the Bureau of Public Procurement who now chairs the Senate Committee on Finance. Has saved the federal government an estimated ₦380 billion in wasteful contracts since assuming committee chairmanship through his mastery of procurement law.",
    education: "Obafemi Awolowo University (LLB), University of London (LLM Public Procurement)",
    competence: 83,
    influence: 72,
    loyalty: 58,
    isHandCrafted: true,
  },

  // ── SOUTH-EAST (7) ────────────────────────────────────────────────────────

  {
    name: "Sen. Chief Emeka Ezeaku",
    state: "Anambra",
    zone: "SE",
    party: "NDM",
    senateDistrict: "Anambra Central",
    age: 62,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "EE",
    traits: ["Veteran Lawmaker", "Business Mogul", "Committee Chair"],
    bio: "A four-term senator and industrialist who is widely regarded as the 'father' of the South-East caucus in the upper chamber. His Igbo Apprenticeship System Bill — the first legislation to formalise the ọcha trade tradition — passed with 89 votes in favour.",
    education: "University of Nigeria Nsukka (Business Administration), Wharton School (MBA)",
    competence: 82,
    influence: 83,
    loyalty: 55,
    isHandCrafted: true,
  },
  {
    name: "Sen. Dr. Ngozi Ihejirika",
    state: "Imo",
    zone: "SE",
    party: "NDM",
    senateDistrict: "Imo West",
    age: 50,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "NI",
    traits: ["Health Crusader", "Women's Advocate", "Anti-Corruption Champion"],
    bio: "A former Chief Medical Director of a federal teaching hospital who exposed a ₦22 billion drug procurement fraud before her senate run. Now chairs the Joint Committee on Health and is midwifing a landmark National Health Emergency Fund.",
    education: "University of Nigeria Enugu Campus (MBBS), London School of Hygiene & Tropical Medicine (MSc), Oxford (MPH)",
    competence: 81,
    influence: 66,
    loyalty: 54,
    isHandCrafted: true,
  },
  {
    name: "Sen. Barr. Chukwuemeka Nnadi",
    state: "Enugu",
    zone: "SE",
    party: "PFC",
    senateDistrict: "Enugu West",
    age: 57,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "CN",
    traits: ["Legal Expert", "Independent Voice", "Floor Leader"],
    bio: "A human rights lawyer who built his reputation litigating land rights cases in the South-East before entering politics as a first-time senator. He has sponsored three bills to resolve the longstanding land tenure crisis in Igbo-majority states.",
    education: "University of Nigeria (LLB), Nigerian Law School (BL), Georgetown Law (LLM)",
    competence: 79,
    influence: 63,
    loyalty: 42,
    isHandCrafted: true,
  },
  {
    name: "Sen. Uchenna Ogbu",
    state: "Ebonyi",
    zone: "SE",
    party: "ADU",
    senateDistrict: "Ebonyi North",
    age: 54,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "UO",
    traits: ["Agriculture Advocate", "Constituency Champion", "Party Loyalist"],
    bio: "A former agricultural extension officer who rose to become the most productive senator from Ebonyi in the chamber's history by number of motions passed. His practical approach to rice farming development has earned him the unofficial title 'Rice Senator.'",
    education: "University of Nigeria (Agriculture), Wageningen University Netherlands (MSc Agronomy)",
    competence: 69,
    influence: 60,
    loyalty: 74,
    isHandCrafted: true,
  },
  {
    name: "Sen. Mrs. Adaeze Okonkwo",
    state: "Abia",
    zone: "SE",
    party: "NDM",
    senateDistrict: "Abia North",
    age: 48,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "AO",
    traits: ["Youth Senator", "Media Savvy", "Education Advocate"],
    bio: "A tech entrepreneur who sold her Lagos-based fintech startup for $45 million before pivoting to politics at 43. Her NDM youth policy platform attracted 200,000 registered volunteers and she remains Nigeria's most-followed sitting senator on social media.",
    education: "University of Nigeria (Computer Science), MIT Sloan (MBA)",
    competence: 74,
    influence: 68,
    loyalty: 51,
    isHandCrafted: true,
  },
  {
    name: "Sen. Osita Mbah",
    state: "Enugu",
    zone: "SE",
    party: "PFC",
    senateDistrict: "Enugu North",
    age: 56,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "OM",
    traits: ["Budget Hawk", "Anti-Corruption Champion", "Cross-Party Builder"],
    bio: "Chair of the Public Accounts Committee who has published three damning audits of federal government spending in the current assembly. Regarded as a bipartisan resource — ADU senators quietly share information with him knowing he will act without fear.",
    education: "University of Nigeria Nsukka (Accountancy), ICAN Fellow, University of Edinburgh (MSc Audit)",
    competence: 83,
    influence: 69,
    loyalty: 47,
    isHandCrafted: true,
  },
  {
    name: "Sen. Chidi Nwosu",
    state: "Imo",
    zone: "SE",
    party: "NDM",
    senateDistrict: "Imo East",
    age: 61,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "CN",
    traits: ["Veteran Lawmaker", "Security Expert", "Committee Chair"],
    bio: "A former intelligence officer who ran NDM's successful security-sector reform campaign and won the Senate seat on his third attempt. His unmatched contacts in the intelligence community make him the go-to senator for classified security briefings.",
    education: "University of Ife (Criminology), Cranfield University (MSc Defence Management), NDC Abuja",
    competence: 78,
    influence: 72,
    loyalty: 60,
    isHandCrafted: true,
  },

  // ── SOUTH-SOUTH (8) ───────────────────────────────────────────────────────

  {
    name: "Sen. Rt. Hon. Timi Alaibe",
    state: "Bayelsa",
    zone: "SS",
    party: "PFC",
    senateDistrict: "Bayelsa West",
    age: 58,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Ijaw",
    avatar: "TA",
    traits: ["Veteran Lawmaker", "Business Mogul", "Committee Chair"],
    bio: "Former Managing Director of NDDC who transitioned to the Senate as the leading voice for oil-producing community host rights. His Petroleum Host Community Fund Amendment has been hailed as the most significant Niger Delta legislation in two decades.",
    education: "University of Port Harcourt (Engineering), Stanford (MSc Energy Policy)",
    competence: 82,
    influence: 82,
    loyalty: 52,
    isHandCrafted: true,
  },
  {
    name: "Sen. Dr. Blessing Effiong",
    state: "Akwa Ibom",
    zone: "SS",
    party: "ADU",
    senateDistrict: "Akwa Ibom North-West",
    age: 52,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Ibibio",
    avatar: "BE",
    traits: ["Health Crusader", "Women's Advocate", "Education Advocate"],
    bio: "A paediatrician-turned-senator who led the federal campaign for universal childhood vaccination and managed to secure bipartisan support for a ₦40 billion malaria eradication programme. One of only four senators with a standing ovation from the entire chamber in this assembly.",
    education: "University of Calabar (MBBS), London School of Hygiene and Tropical Medicine (MSc), Harvard (MPH)",
    competence: 77,
    influence: 65,
    loyalty: 67,
    isHandCrafted: true,
  },
  {
    name: "Sen. Chike Obi-Rivers",
    state: "Rivers",
    zone: "SS",
    party: "PFC",
    senateDistrict: "Rivers South-East",
    age: 55,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Ogoni",
    avatar: "CO",
    traits: ["Anti-Corruption Champion", "Security Expert", "Independent Voice"],
    bio: "A former Shell Petroleum human rights liaison who became Ogoni's most prominent political voice after the Ken Saro-Wiwa era. His devastating Senate inquiry into illegal oil bunkering — presented with satellite evidence — forced the first major naval prosecution in 15 years.",
    education: "University of Port Harcourt (Law), University of Amsterdam (LLM Human Rights)",
    competence: 80,
    influence: 70,
    loyalty: 42,
    isHandCrafted: true,
  },
  {
    name: "Sen. Barr. Ovie Omo-Agege Jr",
    state: "Delta",
    zone: "SS",
    party: "ADU",
    senateDistrict: "Delta Central",
    age: 53,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Urhobo",
    avatar: "OO",
    traits: ["Floor Leader", "Legal Expert", "Party Loyalist"],
    bio: "ADU's Senate Minority Liaison who manages cross-party coalitions in the upper chamber with rare finesse. His legal background — he argued before the Supreme Court 27 times — makes him the primary drafter of the party's most contentious constitutional amendments.",
    education: "University of Benin (LLB), Nigerian Law School, Kings College London (LLM)",
    competence: 80,
    influence: 74,
    loyalty: 76,
    isHandCrafted: true,
  },
  {
    name: "Sen. Princess Ifeoma Edeh",
    state: "Cross River",
    zone: "SS",
    party: "NDM",
    senateDistrict: "Cross River North",
    age: 49,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Efik",
    avatar: "IE",
    traits: ["Tourism Advocate", "Media Savvy", "Constituency Champion"],
    bio: "Tourism commissioner turned senator who has tirelessly lobbied for Cross River's $2 billion tourism infrastructure proposal in the national budget. Her documentary film on Calabar Festival culture aired on the BBC and put the state on the global tourism map.",
    education: "University of Calabar (Tourism Management), SOAS London (MA African Cultural Studies)",
    competence: 71,
    influence: 63,
    loyalty: 50,
    isHandCrafted: true,
  },
  {
    name: "Sen. Gbenga Obaseki-Edo",
    state: "Edo",
    zone: "SS",
    party: "NDM",
    senateDistrict: "Edo North",
    age: 57,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Bini",
    avatar: "GO",
    traits: ["Business Mogul", "Infrastructure Focused", "Cross-Party Builder"],
    bio: "A former investment banking executive who architected Edo's Special Economic Zone before his senate run. His committee hearings on industrial development are attended by both domestic investors and international development partners drawn by his analytical precision.",
    education: "University of Benin (Economics), Oxford (MBA Said Business School), Harvard (AMP)",
    competence: 82,
    influence: 73,
    loyalty: 53,
    isHandCrafted: true,
  },
  {
    name: "Sen. Lucky Ayogbokor",
    state: "Bayelsa",
    zone: "SS",
    party: "ADU",
    senateDistrict: "Bayelsa East",
    age: 60,
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Ijaw",
    avatar: "LA",
    traits: ["Security Expert", "Budget Hawk", "Party Loyalist"],
    bio: "A former Inspector-General of the Joint Task Force on Militancy who contested and won his senate seat on an oil peace and development platform. His forensic knowledge of Niger Delta security architecture makes him the government's most valuable interlocutor with militant groups.",
    education: "University of Benin (Law), National Defence College (Strategic Studies)",
    competence: 75,
    influence: 71,
    loyalty: 72,
    isHandCrafted: true,
  },
  {
    name: "Sen. Mrs. Roseline Nwosu-Akwa",
    state: "Akwa Ibom",
    zone: "SS",
    party: "PFC",
    senateDistrict: "Akwa Ibom South",
    age: 46,
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Ibibio",
    avatar: "RN",
    traits: ["Youth Senator", "Anti-Corruption Champion", "Women's Advocate"],
    bio: "The youngest female senator from the South-South who launched a digital transparency initiative forcing all Senate committee deliberations to be broadcast live. Her constituency offices in three local governments remain the only ones to publicly report their activity budgets monthly.",
    education: "University of Uyo (Law), London School of Economics (LLM Public Law)",
    competence: 72,
    influence: 61,
    loyalty: 48,
    isHandCrafted: true,
  },
];

// ── Party seat allocator for generated senators ────────────────────────────

function buildPartyDistribution(totalSeats: number): string[] {
  const dist: string[] = [];
  for (const [party, seats] of Object.entries(SENATE_PARTY_SEATS)) {
    for (let i = 0; i < seats; i++) dist.push(party);
  }
  // Trim/pad to exact count
  while (dist.length < totalSeats) dist.push("ADU");
  return dist.slice(0, totalSeats);
}

function assignPartyFromZone(zone: string, rng: () => number): string {
  const pool = PARTY_ZONE_WEIGHTS[zone] ?? PARTY_ZONE_WEIGHTS.NC;
  return pick(rng, pool);
}

function deriveCompetence(professional: Record<string, number>): number {
  const vals = Object.values(professional);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(Math.max(40, Math.min(90, avg)));
}

function deriveInfluence(personal: Record<string, number>): number {
  const c = personal.charisma ?? 60;
  const l = personal.leadership ?? 60;
  return Math.round(Math.max(30, Math.min(85, (c + l) / 2)));
}

function deriveLoyalty(personal: Record<string, number>): number {
  return Math.round(Math.max(30, Math.min(80, personal.loyalty ?? 55)));
}

// District suffixes for generated senators
const DISTRICT_SUFFIXES = ["North", "South", "East", "West", "Central"];

// States ordered for deterministic district assignment
const ALL_SENATE_STATES: string[] = GEOPOLITICAL_ZONES.flatMap(z => z.states);

// ── Main generator ─────────────────────────────────────────────────────────

export function generateSenatorPool(seed = 5001): Senator[] {
  const handCrafted = HANDCRAFTED_SENATORS;
  const generatedCount = 109 - handCrafted.length; // 59

  const generated = generateCharacterPool({
    count: generatedCount,
    seed,
    role: "senator",
    traitPool: SENATOR_TRAITS,
    ageRange: { min: 40, max: 70 },
    genderBalance: { minFemalePercent: 25, minMalePercent: 50 },
  });

  const rng = seededRandom(seed + 1000);

  // Track which states have been used for generated senators
  // We want to spread across ALL_SENATE_STATES, cycling
  const stateQueue = [...ALL_SENATE_STATES];

  // Collect hand-crafted states to avoid duplication where possible
  const handCraftedStateCount: Record<string, number> = {};
  for (const s of handCrafted) {
    handCraftedStateCount[s.state] = (handCraftedStateCount[s.state] ?? 0) + 1;
  }

  // Build party pool for generated senators
  // Hand-crafted senators account for their own parties; generated fills remaining seats
  const handCraftedPartyCount: Record<string, number> = {};
  for (const s of handCrafted) {
    handCraftedPartyCount[s.party] = (handCraftedPartyCount[s.party] ?? 0) + 1;
  }

  const remainingSeats: Record<string, number> = {};
  for (const [p, seats] of Object.entries(SENATE_PARTY_SEATS)) {
    const used = handCraftedPartyCount[p] ?? 0;
    remainingSeats[p] = Math.max(0, seats - used);
  }

  // Build a flat party list for generated chars
  const partyQueue: string[] = [];
  for (const [party, seats] of Object.entries(remainingSeats)) {
    for (let i = 0; i < seats; i++) partyQueue.push(party);
  }
  // Shuffle party queue
  for (let i = partyQueue.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [partyQueue[i], partyQueue[j]] = [partyQueue[j], partyQueue[i]];
  }
  // Pad if short
  while (partyQueue.length < generatedCount) partyQueue.push("ADU");

  const senators: Senator[] = [...handCrafted];

  for (let i = 0; i < generated.length; i++) {
    const char = generated[i];
    const stateIdx = i % ALL_SENATE_STATES.length;
    const state = char.state ?? ALL_SENATE_STATES[stateIdx];
    const zone = getZoneForState(state)?.abbrev ?? "NC";
    const party = partyQueue[i] ?? assignPartyFromZone(zone, rng);
    const suffix = DISTRICT_SUFFIXES[i % DISTRICT_SUFFIXES.length];
    const senateDistrict = `${state} ${suffix}`;

    const professional = char.competencies.professional as unknown as Record<string, number>;
    const personal = char.competencies.personal as unknown as Record<string, number>;

    senators.push({
      name: char.name,
      state,
      zone,
      party,
      senateDistrict,
      age: char.age,
      gender: char.gender,
      religion: char.religion,
      ethnicity: char.ethnicity,
      avatar: char.avatar,
      traits: char.traits,
      bio: char.biography,
      education: char.education,
      competence: deriveCompetence(professional),
      influence: deriveInfluence(personal),
      loyalty: deriveLoyalty(personal),
      isHandCrafted: false,
    });
  }

  return senators;
}

// ── Cached access ──────────────────────────────────────────────────────────

let _cached: Senator[] | null = null;

export function getSenatorPool(): Senator[] {
  if (!_cached) _cached = generateSenatorPool();
  return _cached;
}

export function getSenatorsForState(state: string): Senator[] {
  return getSenatorPool().filter(s => s.state === state);
}
