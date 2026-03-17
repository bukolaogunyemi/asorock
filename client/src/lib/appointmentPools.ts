// client/src/lib/appointmentPools.ts
import type { AppointmentCandidate } from "./federalCharacterTypes";

export interface PositionDefinition {
  id: string;
  name: string;
  category: "constitutional-officer" | "cabinet" | "agency" | "ambassador";
  prestigeTier: "strategic" | "standard" | "routine";
}

export const POSITION_DEFINITIONS: PositionDefinition[] = [
  // === Cabinet (7) — all strategic ===
  { id: "cab-finance", name: "Minister of Finance", category: "cabinet", prestigeTier: "strategic" },
  { id: "cab-petroleum", name: "Minister of Petroleum Resources", category: "cabinet", prestigeTier: "strategic" },
  { id: "cab-justice", name: "Attorney-General & Minister of Justice", category: "cabinet", prestigeTier: "strategic" },
  { id: "cab-defence", name: "Minister of Defence", category: "cabinet", prestigeTier: "strategic" },
  { id: "cab-health", name: "Minister of Health", category: "cabinet", prestigeTier: "strategic" },
  { id: "cab-works", name: "Minister of Works & Housing", category: "cabinet", prestigeTier: "strategic" },
  { id: "cab-education", name: "Minister of Education", category: "cabinet", prestigeTier: "strategic" },

  // === Agency positions removed — now handled by director system (directorPool.ts) ===

  // === Ambassador (10) ===
  // Strategic (3)
  { id: "amb-usa", name: "Ambassador to the United States", category: "ambassador", prestigeTier: "strategic" },
  { id: "amb-uk", name: "Ambassador to the United Kingdom", category: "ambassador", prestigeTier: "strategic" },
  { id: "amb-china", name: "Ambassador to China", category: "ambassador", prestigeTier: "strategic" },
  // Standard (4)
  { id: "amb-south-africa", name: "Ambassador to South Africa", category: "ambassador", prestigeTier: "standard" },
  { id: "amb-germany", name: "Ambassador to Germany", category: "ambassador", prestigeTier: "standard" },
  { id: "amb-uae", name: "Ambassador to the UAE", category: "ambassador", prestigeTier: "standard" },
  { id: "amb-france", name: "Ambassador to France", category: "ambassador", prestigeTier: "standard" },
  // Routine (3)
  { id: "amb-ghana", name: "Ambassador to Ghana", category: "ambassador", prestigeTier: "routine" },
  { id: "amb-india", name: "Ambassador to India", category: "ambassador", prestigeTier: "routine" },
  { id: "amb-brazil", name: "Ambassador to Brazil", category: "ambassador", prestigeTier: "routine" },
];

// ──────────────────────────────────────────────
// AGENCY_CANDIDATES removed — now handled by director system (directorPool.ts)
// ──────────────────────────────────────────────

/** @deprecated Replaced by director system — kept as empty stub for compatibility */
export const AGENCY_CANDIDATES: AppointmentCandidate[] = [];

// ──────────────────────────────────────────────
// AMBASSADOR CANDIDATES (~36 candidates)
// ──────────────────────────────────────────────
// 6 per zone, qualified across the 10 postings

export const AMBASSADOR_CANDIDATES: AppointmentCandidate[] = [
  // ═══ NC ═══
  { characterId: "amb-nc-01", name: "Terhemba Shija", zone: "NC", state: "Benue", competence: 80, loyalty: 63, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-uk", "amb-south-africa"] },
  { characterId: "amb-nc-02", name: "Halima Tafida", zone: "NC", state: "Kwara", competence: 74, loyalty: 70, gender: "Female", religion: "Islam", qualifiedFor: ["amb-china", "amb-germany", "amb-france"] },
  { characterId: "amb-nc-03", name: "Yakubu Gowon-Jnr", zone: "NC", state: "Plateau", competence: 68, loyalty: 77, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-uae", "amb-ghana", "amb-india"] },
  { characterId: "amb-nc-04", name: "Deborah Sanda", zone: "NC", state: "Nasarawa", competence: 85, loyalty: 55, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-uk", "amb-brazil"] },
  { characterId: "amb-nc-05", name: "Nuhu Kwarra", zone: "NC", state: "Niger", competence: 62, loyalty: 80, gender: "Male", religion: "Islam", qualifiedFor: ["amb-china", "amb-south-africa", "amb-uae"] },
  { characterId: "amb-nc-06", name: "Patience Audu", zone: "NC", state: "Kogi", competence: 71, loyalty: 66, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-germany", "amb-france", "amb-ghana", "amb-india", "amb-brazil"] },

  // ═══ NW ═══
  { characterId: "amb-nw-01", name: "Aminu Tambuwal", zone: "NW", state: "Sokoto", competence: 83, loyalty: 58, gender: "Male", religion: "Islam", qualifiedFor: ["amb-usa", "amb-uk", "amb-uae"] },
  { characterId: "amb-nw-02", name: "Aisha Buhari-Dikko", zone: "NW", state: "Katsina", competence: 76, loyalty: 67, gender: "Female", religion: "Islam", qualifiedFor: ["amb-china", "amb-germany", "amb-france"] },
  { characterId: "amb-nw-03", name: "Nasir El-Rufai Jnr", zone: "NW", state: "Kaduna", competence: 90, loyalty: 42, gender: "Male", religion: "Islam", qualifiedFor: ["amb-south-africa", "amb-ghana", "amb-india"] },
  { characterId: "amb-nw-04", name: "Maryam Diso", zone: "NW", state: "Kano", competence: 70, loyalty: 73, gender: "Female", religion: "Islam", qualifiedFor: ["amb-usa", "amb-china", "amb-brazil"] },
  { characterId: "amb-nw-05", name: "Sani Dangote", zone: "NW", state: "Kano", competence: 65, loyalty: 79, gender: "Male", religion: "Islam", qualifiedFor: ["amb-uk", "amb-south-africa", "amb-uae"] },
  { characterId: "amb-nw-06", name: "Hadiza Bala", zone: "NW", state: "Jigawa", competence: 78, loyalty: 60, gender: "Female", religion: "Islam", qualifiedFor: ["amb-germany", "amb-france", "amb-ghana", "amb-india", "amb-brazil"] },

  // ═══ NE ═══
  { characterId: "amb-ne-01", name: "Kashim Ibrahim", zone: "NE", state: "Borno", competence: 82, loyalty: 57, gender: "Male", religion: "Islam", qualifiedFor: ["amb-usa", "amb-uk", "amb-south-africa"] },
  { characterId: "amb-ne-02", name: "Aisha Wakil", zone: "NE", state: "Borno", competence: 75, loyalty: 66, gender: "Female", religion: "Islam", qualifiedFor: ["amb-china", "amb-germany", "amb-uae"] },
  { characterId: "amb-ne-03", name: "Buba Galadima", zone: "NE", state: "Adamawa", competence: 67, loyalty: 78, gender: "Male", religion: "Islam", qualifiedFor: ["amb-france", "amb-ghana", "amb-india"] },
  { characterId: "amb-ne-04", name: "Hauwa Gadzama", zone: "NE", state: "Gombe", competence: 88, loyalty: 49, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-china", "amb-brazil"] },
  { characterId: "amb-ne-05", name: "Aliyu Modibbo", zone: "NE", state: "Yobe", competence: 60, loyalty: 82, gender: "Male", religion: "Islam", qualifiedFor: ["amb-uk", "amb-south-africa", "amb-uae"] },
  { characterId: "amb-ne-06", name: "Maimuna Taraba", zone: "NE", state: "Taraba", competence: 73, loyalty: 64, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-germany", "amb-france", "amb-ghana", "amb-india", "amb-brazil"] },

  // ═══ SW ═══
  { characterId: "amb-sw-01", name: "Oladele Osinbajo", zone: "SW", state: "Lagos", competence: 91, loyalty: 44, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-uk", "amb-france"] },
  { characterId: "amb-sw-02", name: "Funmilayo Adebisi", zone: "SW", state: "Oyo", competence: 78, loyalty: 65, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-china", "amb-germany", "amb-south-africa"] },
  { characterId: "amb-sw-03", name: "Bode Agoro", zone: "SW", state: "Ogun", competence: 64, loyalty: 80, gender: "Male", religion: "Islam", qualifiedFor: ["amb-uae", "amb-ghana", "amb-india"] },
  { characterId: "amb-sw-04", name: "Yewande Oyediran", zone: "SW", state: "Osun", competence: 86, loyalty: 52, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-china", "amb-brazil"] },
  { characterId: "amb-sw-05", name: "Rotimi Fashakin", zone: "SW", state: "Ondo", competence: 58, loyalty: 83, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-uk", "amb-south-africa", "amb-uae"] },
  { characterId: "amb-sw-06", name: "Adeola Fayehun", zone: "SW", state: "Ekiti", competence: 72, loyalty: 68, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-germany", "amb-france", "amb-ghana", "amb-india", "amb-brazil"] },

  // ═══ SE ═══
  { characterId: "amb-se-01", name: "Obiageli Ezekwesili", zone: "SE", state: "Anambra", competence: 93, loyalty: 40, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-uk", "amb-south-africa"] },
  { characterId: "amb-se-02", name: "Chinedu Obi", zone: "SE", state: "Imo", competence: 77, loyalty: 64, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-china", "amb-germany", "amb-uae"] },
  { characterId: "amb-se-03", name: "Nkechi Ikpeazu", zone: "SE", state: "Abia", competence: 70, loyalty: 72, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-france", "amb-ghana", "amb-india"] },
  { characterId: "amb-se-04", name: "Okey Ezenwa", zone: "SE", state: "Enugu", competence: 84, loyalty: 56, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-china", "amb-brazil"] },
  { characterId: "amb-se-05", name: "Ifeanyi Ubah", zone: "SE", state: "Anambra", competence: 61, loyalty: 81, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-uk", "amb-south-africa", "amb-uae"] },
  { characterId: "amb-se-06", name: "Amaka Okadigbo", zone: "SE", state: "Ebonyi", competence: 69, loyalty: 70, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-germany", "amb-france", "amb-ghana", "amb-india", "amb-brazil"] },

  // ═══ SS ═══
  { characterId: "amb-ss-01", name: "Dakuku Peterside", zone: "SS", state: "Rivers", competence: 82, loyalty: 59, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-uk", "amb-south-africa"] },
  { characterId: "amb-ss-02", name: "Eme Ufot-Ekaette", zone: "SS", state: "Akwa Ibom", competence: 76, loyalty: 66, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-china", "amb-germany", "amb-uae"] },
  { characterId: "amb-ss-03", name: "Felix Obuah", zone: "SS", state: "Rivers", competence: 63, loyalty: 79, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-france", "amb-ghana", "amb-india"] },
  { characterId: "amb-ss-04", name: "Ivie Omoregie", zone: "SS", state: "Edo", competence: 87, loyalty: 50, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-usa", "amb-china", "amb-brazil"] },
  { characterId: "amb-ss-05", name: "Obong Effiong", zone: "SS", state: "Cross River", competence: 55, loyalty: 84, gender: "Male", religion: "Christianity", qualifiedFor: ["amb-uk", "amb-south-africa", "amb-uae"] },
  { characterId: "amb-ss-06", name: "Seinye Lulu-Briggs", zone: "SS", state: "Bayelsa", competence: 71, loyalty: 68, gender: "Female", religion: "Christianity", qualifiedFor: ["amb-germany", "amb-france", "amb-ghana", "amb-india", "amb-brazil"] },
];
