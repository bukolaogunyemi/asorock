// client/src/lib/partyProfiles.ts
// Static party definitions and 64 NWC character profiles (8 per party)

import type { NWCPosition, NWCMember } from "./partyTypes";

export interface PartyProfile {
  id: string;
  name: string;
  abbreviation: string;
  initialSeats: { house: number; senate: number };
}

export interface NWCCharacter extends NWCMember {
  partyId: string;
}

// ── 8 Party Profiles ──────────────────────────────────────────────────

export const PARTY_PROFILES: PartyProfile[] = [
  { id: "adu", name: "African Democratic Union", abbreviation: "ADU", initialSeats: { house: 145, senate: 56 } },
  { id: "pfc", name: "People's Freedom Congress", abbreviation: "PFC", initialSeats: { house: 80, senate: 22 } },
  { id: "ndm", name: "New Direction Movement", abbreviation: "NDM", initialSeats: { house: 45, senate: 12 } },
  { id: "nsf", name: "National Solidarity Front", abbreviation: "NSF", initialSeats: { house: 35, senate: 8 } },
  { id: "tla", name: "The Liberty Alliance", abbreviation: "TLA", initialSeats: { house: 20, senate: 5 } },
  { id: "hdp", name: "Heritage Democratic Party", abbreviation: "HDP", initialSeats: { house: 15, senate: 3 } },
  { id: "pap", name: "Progressive Action Party", abbreviation: "PAP", initialSeats: { house: 12, senate: 2 } },
  { id: "upa", name: "United People's Alliance", abbreviation: "UPA", initialSeats: { house: 8, senate: 1 } },
];

// ── Helpers ───────────────────────────────────────────────────────────

const POSITIONS: NWCPosition[] = [
  "national-chairman",
  "vice-chairman",
  "national-secretary",
  "national-treasurer",
  "publicity-secretary",
  "organising-secretary",
  "legal-adviser",
  "youth-women-leader",
];

// ── 64 NWC Characters ────────────────────────────────────────────────
// Each party has 8 members covering all 6 zones (2 zones get 2 members, 4 zones get 1).
// Names match ethnic/zone conventions:
//   NW/NE → Hausa/Fulani   NC → Tiv/Nupe/Idoma   SW → Yoruba   SE → Igbo   SS → Ijaw/Efik/Urhobo

export const NWC_CHARACTERS: NWCCharacter[] = [
  // ── ADU (African Democratic Union) — centre-right, NW/SW base ──────
  { characterId: "nwc-adu-001", partyId: "adu", name: "Alhaji Garba Danlami", position: "national-chairman", zone: "NW", state: "Kano", competence: 82, loyalty: 75, disposition: "supportive" },
  { characterId: "nwc-adu-002", partyId: "adu", name: "Chief Babatunde Adesanya", position: "vice-chairman", zone: "SW", state: "Lagos", competence: 78, loyalty: 68, disposition: "supportive" },
  { characterId: "nwc-adu-003", partyId: "adu", name: "Hajiya Fatima Bello", position: "national-secretary", zone: "NE", state: "Borno", competence: 70, loyalty: 60, disposition: "neutral" },
  { characterId: "nwc-adu-004", partyId: "adu", name: "Chief Emeka Okonkwo", position: "national-treasurer", zone: "SE", state: "Anambra", competence: 85, loyalty: 55, disposition: "neutral" },
  { characterId: "nwc-adu-005", partyId: "adu", name: "Alhaji Sani Abubakar", position: "publicity-secretary", zone: "NW", state: "Kaduna", competence: 65, loyalty: 80, disposition: "supportive" },
  { characterId: "nwc-adu-006", partyId: "adu", name: "Hon. Terhemba Agbese", position: "organising-secretary", zone: "NC", state: "Benue", competence: 72, loyalty: 58, disposition: "neutral" },
  { characterId: "nwc-adu-007", partyId: "adu", name: "Barrister Adebayo Ogundimu", position: "legal-adviser", zone: "SW", state: "Ogun", competence: 88, loyalty: 62, disposition: "supportive" },
  { characterId: "nwc-adu-008", partyId: "adu", name: "Engr. Ebitimi Amadi", position: "youth-women-leader", zone: "SS", state: "Rivers", competence: 60, loyalty: 45, disposition: "hostile" },

  // ── PFC (People's Freedom Congress) — centre-left, NC/SS base ──────
  { characterId: "nwc-pfc-001", partyId: "pfc", name: "Chief Solomon Lar", position: "national-chairman", zone: "NC", state: "Plateau", competence: 80, loyalty: 72, disposition: "supportive" },
  { characterId: "nwc-pfc-002", partyId: "pfc", name: "Chief Broderick Ebidougha", position: "vice-chairman", zone: "SS", state: "Bayelsa", competence: 74, loyalty: 65, disposition: "supportive" },
  { characterId: "nwc-pfc-003", partyId: "pfc", name: "Alhaji Shehu Musa", position: "national-secretary", zone: "NW", state: "Sokoto", competence: 68, loyalty: 58, disposition: "neutral" },
  { characterId: "nwc-pfc-004", partyId: "pfc", name: "Dr. Chinyere Obi", position: "national-treasurer", zone: "SE", state: "Imo", competence: 83, loyalty: 50, disposition: "hostile" },
  { characterId: "nwc-pfc-005", partyId: "pfc", name: "Hon. Ishaya Danjuma", position: "publicity-secretary", zone: "NC", state: "Nasarawa", competence: 66, loyalty: 78, disposition: "supportive" },
  { characterId: "nwc-pfc-006", partyId: "pfc", name: "Chief Yetunde Adeyemo", position: "organising-secretary", zone: "SW", state: "Oyo", competence: 71, loyalty: 63, disposition: "neutral" },
  { characterId: "nwc-pfc-007", partyId: "pfc", name: "Barrister Aisha Mohammed", position: "legal-adviser", zone: "NE", state: "Adamawa", competence: 77, loyalty: 55, disposition: "neutral" },
  { characterId: "nwc-pfc-008", partyId: "pfc", name: "Engr. Tombra Ogboju", position: "youth-women-leader", zone: "SS", state: "Delta", competence: 62, loyalty: 70, disposition: "supportive" },

  // ── NDM (New Direction Movement) — progressive, SW/SE base ─────────
  { characterId: "nwc-ndm-001", partyId: "ndm", name: "Prof. Olufemi Adebanjo", position: "national-chairman", zone: "SW", state: "Ekiti", competence: 86, loyalty: 70, disposition: "supportive" },
  { characterId: "nwc-ndm-002", partyId: "ndm", name: "Dr. Nkechi Azikiwe", position: "vice-chairman", zone: "SE", state: "Enugu", competence: 79, loyalty: 66, disposition: "supportive" },
  { characterId: "nwc-ndm-003", partyId: "ndm", name: "Alhaji Bala Usman", position: "national-secretary", zone: "NW", state: "Zamfara", competence: 64, loyalty: 48, disposition: "neutral" },
  { characterId: "nwc-ndm-004", partyId: "ndm", name: "Hon. Terngu Ikyaator", position: "national-treasurer", zone: "NC", state: "Benue", competence: 73, loyalty: 55, disposition: "neutral" },
  { characterId: "nwc-ndm-005", partyId: "ndm", name: "Chief Kayode Fayemi", position: "publicity-secretary", zone: "SW", state: "Ondo", competence: 81, loyalty: 72, disposition: "supportive" },
  { characterId: "nwc-ndm-006", partyId: "ndm", name: "Alhaji Adamu Garba", position: "organising-secretary", zone: "NE", state: "Yobe", competence: 58, loyalty: 42, disposition: "hostile" },
  { characterId: "nwc-ndm-007", partyId: "ndm", name: "Barrister Obiageli Eze", position: "legal-adviser", zone: "SE", state: "Abia", competence: 84, loyalty: 60, disposition: "neutral" },
  { characterId: "nwc-ndm-008", partyId: "ndm", name: "Comrade Ibinabo Hart", position: "youth-women-leader", zone: "SS", state: "Rivers", competence: 67, loyalty: 52, disposition: "neutral" },

  // ── NSF (National Solidarity Front) — populist, NW/NE base ─────────
  { characterId: "nwc-nsf-001", partyId: "nsf", name: "Alhaji Abdullahi Ganduje", position: "national-chairman", zone: "NW", state: "Katsina", competence: 75, loyalty: 82, disposition: "supportive" },
  { characterId: "nwc-nsf-002", partyId: "nsf", name: "Alhaji Kashim Ibrahim", position: "vice-chairman", zone: "NE", state: "Borno", competence: 70, loyalty: 76, disposition: "supportive" },
  { characterId: "nwc-nsf-003", partyId: "nsf", name: "Chief Folarin Ogundipe", position: "national-secretary", zone: "SW", state: "Lagos", competence: 63, loyalty: 50, disposition: "neutral" },
  { characterId: "nwc-nsf-004", partyId: "nsf", name: "Dr. Okechukwu Nwankpa", position: "national-treasurer", zone: "SE", state: "Ebonyi", competence: 72, loyalty: 45, disposition: "hostile" },
  { characterId: "nwc-nsf-005", partyId: "nsf", name: "Alhaji Musa Rabiu", position: "publicity-secretary", zone: "NW", state: "Jigawa", competence: 68, loyalty: 85, disposition: "supportive" },
  { characterId: "nwc-nsf-006", partyId: "nsf", name: "Mallam Ibrahim Shettima", position: "organising-secretary", zone: "NE", state: "Gombe", competence: 60, loyalty: 70, disposition: "supportive" },
  { characterId: "nwc-nsf-007", partyId: "nsf", name: "Barrister Nuhu Idris", position: "legal-adviser", zone: "NC", state: "Niger", competence: 78, loyalty: 58, disposition: "neutral" },
  { characterId: "nwc-nsf-008", partyId: "nsf", name: "Comrade Preye Aganaba", position: "youth-women-leader", zone: "SS", state: "Bayelsa", competence: 55, loyalty: 40, disposition: "hostile" },

  // ── TLA (The Liberty Alliance) — regionalist, SE/SS base ───────────
  { characterId: "nwc-tla-001", partyId: "tla", name: "Chief Ikenna Nnamdi", position: "national-chairman", zone: "SE", state: "Anambra", competence: 80, loyalty: 78, disposition: "supportive" },
  { characterId: "nwc-tla-002", partyId: "tla", name: "Chief Effiong Bassey", position: "vice-chairman", zone: "SS", state: "Cross River", competence: 73, loyalty: 72, disposition: "supportive" },
  { characterId: "nwc-tla-003", partyId: "tla", name: "Alhaji Lawal Dankadai", position: "national-secretary", zone: "NW", state: "Kebbi", competence: 58, loyalty: 40, disposition: "hostile" },
  { characterId: "nwc-tla-004", partyId: "tla", name: "Chief Adewale Tinubu", position: "national-treasurer", zone: "SW", state: "Osun", competence: 76, loyalty: 55, disposition: "neutral" },
  { characterId: "nwc-tla-005", partyId: "tla", name: "Dr. Chukwuma Soludo", position: "publicity-secretary", zone: "SE", state: "Enugu", competence: 85, loyalty: 68, disposition: "supportive" },
  { characterId: "nwc-tla-006", partyId: "tla", name: "Hon. Monday Okpebholo", position: "organising-secretary", zone: "SS", state: "Edo", competence: 65, loyalty: 62, disposition: "neutral" },
  { characterId: "nwc-tla-007", partyId: "tla", name: "Barrister Yakubu Dogara", position: "legal-adviser", zone: "NE", state: "Bauchi", competence: 70, loyalty: 45, disposition: "neutral" },
  { characterId: "nwc-tla-008", partyId: "tla", name: "Comrade Joseph Ityav", position: "youth-women-leader", zone: "NC", state: "Benue", competence: 56, loyalty: 50, disposition: "hostile" },

  // ── HDP (Heritage Democratic Party) — traditionalist, NE/NC base ───
  { characterId: "nwc-hdp-001", partyId: "hdp", name: "Alhaji Muhammadu Jibril", position: "national-chairman", zone: "NE", state: "Bauchi", competence: 74, loyalty: 80, disposition: "supportive" },
  { characterId: "nwc-hdp-002", partyId: "hdp", name: "Alhaji Tanko Yakassai", position: "vice-chairman", zone: "NC", state: "Kogi", competence: 69, loyalty: 73, disposition: "supportive" },
  { characterId: "nwc-hdp-003", partyId: "hdp", name: "Chief Adeniyi Akintola", position: "national-secretary", zone: "SW", state: "Oyo", competence: 66, loyalty: 52, disposition: "neutral" },
  { characterId: "nwc-hdp-004", partyId: "hdp", name: "Chief Okezie Ikpeazu", position: "national-treasurer", zone: "SE", state: "Abia", competence: 71, loyalty: 48, disposition: "neutral" },
  { characterId: "nwc-hdp-005", partyId: "hdp", name: "Mallam Abubakar Atiku", position: "publicity-secretary", zone: "NE", state: "Adamawa", competence: 77, loyalty: 85, disposition: "supportive" },
  { characterId: "nwc-hdp-006", partyId: "hdp", name: "Hon. Zakari Abubakar", position: "organising-secretary", zone: "NC", state: "Nasarawa", competence: 62, loyalty: 65, disposition: "neutral" },
  { characterId: "nwc-hdp-007", partyId: "hdp", name: "Barrister Aminu Waziri", position: "legal-adviser", zone: "NW", state: "Sokoto", competence: 80, loyalty: 58, disposition: "neutral" },
  { characterId: "nwc-hdp-008", partyId: "hdp", name: "Comrade Douye Diri", position: "youth-women-leader", zone: "SS", state: "Bayelsa", competence: 55, loyalty: 38, disposition: "hostile" },

  // ── PAP (Progressive Action Party) — social democratic, SS base ────
  { characterId: "nwc-pap-001", partyId: "pap", name: "Chief Timi Alaibe", position: "national-chairman", zone: "SS", state: "Bayelsa", competence: 78, loyalty: 75, disposition: "supportive" },
  { characterId: "nwc-pap-002", partyId: "pap", name: "Engr. Godwin Emefiele", position: "vice-chairman", zone: "SS", state: "Delta", competence: 72, loyalty: 70, disposition: "supportive" },
  { characterId: "nwc-pap-003", partyId: "pap", name: "Chief Oladipo Abiodun", position: "national-secretary", zone: "SW", state: "Ogun", competence: 65, loyalty: 55, disposition: "neutral" },
  { characterId: "nwc-pap-004", partyId: "pap", name: "Dr. Ugochukwu Nnaji", position: "national-treasurer", zone: "SE", state: "Enugu", competence: 80, loyalty: 50, disposition: "neutral" },
  { characterId: "nwc-pap-005", partyId: "pap", name: "Alhaji Saminu Turaki", position: "publicity-secretary", zone: "NW", state: "Jigawa", competence: 60, loyalty: 42, disposition: "hostile" },
  { characterId: "nwc-pap-006", partyId: "pap", name: "Mallam Buba Galadima", position: "organising-secretary", zone: "NE", state: "Yobe", competence: 58, loyalty: 45, disposition: "hostile" },
  { characterId: "nwc-pap-007", partyId: "pap", name: "Barrister Sylvanus Nenshi", position: "legal-adviser", zone: "NC", state: "Plateau", competence: 75, loyalty: 60, disposition: "neutral" },
  { characterId: "nwc-pap-008", partyId: "pap", name: "Comrade Fehintola Balogun", position: "youth-women-leader", zone: "SW", state: "Lagos", competence: 68, loyalty: 65, disposition: "supportive" },

  // ── UPA (United People's Alliance) — ethnic federalist, SW/NC base ─
  { characterId: "nwc-upa-001", partyId: "upa", name: "Chief Olusegun Awolowo", position: "national-chairman", zone: "SW", state: "Ondo", competence: 82, loyalty: 77, disposition: "supportive" },
  { characterId: "nwc-upa-002", partyId: "upa", name: "Hon. Danladi Abubakar", position: "vice-chairman", zone: "NC", state: "Niger", competence: 70, loyalty: 72, disposition: "supportive" },
  { characterId: "nwc-upa-003", partyId: "upa", name: "Chief Rotimi Amaechi", position: "national-secretary", zone: "SS", state: "Rivers", competence: 75, loyalty: 55, disposition: "neutral" },
  { characterId: "nwc-upa-004", partyId: "upa", name: "Dr. Obinna Uzoh", position: "national-treasurer", zone: "SE", state: "Imo", competence: 78, loyalty: 50, disposition: "neutral" },
  { characterId: "nwc-upa-005", partyId: "upa", name: "Chief Modupe Adeleke", position: "publicity-secretary", zone: "SW", state: "Osun", competence: 73, loyalty: 80, disposition: "supportive" },
  { characterId: "nwc-upa-006", partyId: "upa", name: "Hon. Simon Achuba", position: "organising-secretary", zone: "NC", state: "Kogi", competence: 64, loyalty: 68, disposition: "neutral" },
  { characterId: "nwc-upa-007", partyId: "upa", name: "Barrister Maryam Aliyu", position: "legal-adviser", zone: "NW", state: "Kaduna", competence: 76, loyalty: 44, disposition: "hostile" },
  { characterId: "nwc-upa-008", partyId: "upa", name: "Comrade Adamu Ciroma", position: "youth-women-leader", zone: "NE", state: "Taraba", competence: 57, loyalty: 48, disposition: "hostile" },
];
