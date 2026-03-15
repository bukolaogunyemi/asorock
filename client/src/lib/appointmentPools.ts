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

  // === Agency (12) ===
  // Strategic (4)
  { id: "ag-nnpc", name: "NNPC (Nigerian National Petroleum Corp)", category: "agency", prestigeTier: "strategic" },
  { id: "ag-cbn", name: "CBN (Central Bank of Nigeria)", category: "agency", prestigeTier: "strategic" },
  { id: "ag-efcc", name: "EFCC (Economic & Financial Crimes Commission)", category: "agency", prestigeTier: "strategic" },
  { id: "ag-nia", name: "NIA (National Intelligence Agency)", category: "agency", prestigeTier: "strategic" },
  // Standard (4)
  { id: "ag-inec", name: "INEC (Independent National Electoral Commission)", category: "agency", prestigeTier: "standard" },
  { id: "ag-ncc", name: "NCC (Nigerian Communications Commission)", category: "agency", prestigeTier: "standard" },
  { id: "ag-nimasa", name: "NIMASA (Nigerian Maritime Administration)", category: "agency", prestigeTier: "standard" },
  { id: "ag-nddc", name: "NDDC (Niger Delta Development Commission)", category: "agency", prestigeTier: "standard" },
  // Routine (4)
  { id: "ag-nafdac", name: "NAFDAC (National Agency for Food & Drug)", category: "agency", prestigeTier: "routine" },
  { id: "ag-nimc", name: "NIMC (National Identity Management Commission)", category: "agency", prestigeTier: "routine" },
  { id: "ag-nbs", name: "NBS (National Bureau of Statistics)", category: "agency", prestigeTier: "routine" },
  { id: "ag-nesrea", name: "NESREA (National Environmental Standards)", category: "agency", prestigeTier: "routine" },

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

// Shorthand for strategic agency IDs
const STRATEGIC = ["ag-nnpc", "ag-cbn", "ag-efcc", "ag-nia"];
const STANDARD = ["ag-inec", "ag-ncc", "ag-nimasa", "ag-nddc"];
const ROUTINE = ["ag-nafdac", "ag-nimc", "ag-nbs", "ag-nesrea"];
const ALL_AGENCIES = [...STRATEGIC, ...STANDARD, ...ROUTINE];

// ──────────────────────────────────────────────
// AGENCY CANDIDATES (~68 candidates)
// ──────────────────────────────────────────────
// Constraint: each of 12 agencies needs candidates from all 6 zones.
// Strategic agencies need ≥2 women per zone.
// Strategy: per zone, create several candidates qualified for multiple agencies.
// Per zone we need: ≥2 women qualified for EACH of 4 strategic agencies = 8 woman-slots min.
// We'll have ~3 women per zone (each qualified for all 4 strategic + some others) and ~8-9 men per zone.

export const AGENCY_CANDIDATES: AppointmentCandidate[] = [
  // ═══════════════════════════════════════
  // NORTH-CENTRAL (NC) — Tiv, Nupe, Gbagyi names — states: Benue, Kogi, Kwara, Nasarawa, Niger, Plateau, FCT
  // ═══════════════════════════════════════
  // Women (3) — each qualifies for all 4 strategic agencies + extras
  { characterId: "ag-nc-f01", name: "Nguavese Torkula", zone: "NC", state: "Benue", competence: 82, loyalty: 65, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-inec", "ag-nafdac"] },
  { characterId: "ag-nc-f02", name: "Hassana Abdullahi", zone: "NC", state: "Niger", competence: 74, loyalty: 72, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-ncc", "ag-nimc"] },
  { characterId: "ag-nc-f03", name: "Ladi Bako", zone: "NC", state: "Plateau", competence: 88, loyalty: 58, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-nimasa", "ag-nddc", "ag-nbs", "ag-nesrea"] },
  // Men (8)
  { characterId: "ag-nc-m01", name: "Tyodoo Iorliam", zone: "NC", state: "Benue", competence: 78, loyalty: 70, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-inec"] },
  { characterId: "ag-nc-m02", name: "Suleiman Etsu-Nupe", zone: "NC", state: "Niger", competence: 65, loyalty: 80, gender: "Male", religion: "Islam", qualifiedFor: ["ag-efcc", "ag-nia", "ag-ncc", "ag-nimc"] },
  { characterId: "ag-nc-m03", name: "Danladi Salihu", zone: "NC", state: "Kwara", competence: 71, loyalty: 68, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-nc-m04", name: "Godwin Mvendaga", zone: "NC", state: "Benue", competence: 55, loyalty: 85, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-cbn", "ag-nbs", "ag-nesrea"] },
  { characterId: "ag-nc-m05", name: "Peter Chogo", zone: "NC", state: "Nasarawa", competence: 90, loyalty: 45, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nia", "ag-nafdac"] },
  { characterId: "ag-nc-m06", name: "Ibrahim Jibrin", zone: "NC", state: "Kogi", competence: 62, loyalty: 77, gender: "Male", religion: "Islam", qualifiedFor: ["ag-inec", "ag-ncc", "ag-nimc"] },
  { characterId: "ag-nc-m07", name: "Samuel Dawang", zone: "NC", state: "Plateau", competence: 84, loyalty: 60, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nimasa", "ag-nddc", "ag-nbs"] },
  { characterId: "ag-nc-m08", name: "Moses Adingi", zone: "NC", state: "Kogi", competence: 47, loyalty: 88, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nafdac", "ag-nesrea"] },

  // ═══════════════════════════════════════
  // NORTH-WEST (NW) — Hausa/Fulani names — states: Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara
  // ═══════════════════════════════════════
  // Women (3)
  { characterId: "ag-nw-f01", name: "Fatima Bello-Kano", zone: "NW", state: "Kano", competence: 80, loyalty: 60, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-inec", "ag-nafdac"] },
  { characterId: "ag-nw-f02", name: "Hauwa Garba", zone: "NW", state: "Kaduna", competence: 76, loyalty: 70, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-ncc", "ag-nimc"] },
  { characterId: "ag-nw-f03", name: "Zainab Usman-Sokoto", zone: "NW", state: "Sokoto", competence: 85, loyalty: 55, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-nimasa", "ag-nddc", "ag-nbs", "ag-nesrea"] },
  // Men (8)
  { characterId: "ag-nw-m01", name: "Aliyu Danbatta", zone: "NW", state: "Kano", competence: 91, loyalty: 42, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-ncc"] },
  { characterId: "ag-nw-m02", name: "Musa Abubakar", zone: "NW", state: "Sokoto", competence: 68, loyalty: 78, gender: "Male", religion: "Islam", qualifiedFor: ["ag-efcc", "ag-nia", "ag-inec"] },
  { characterId: "ag-nw-m03", name: "Abdulrazaq Shehu", zone: "NW", state: "Zamfara", competence: 58, loyalty: 82, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-nw-m04", name: "Hamza Ringim", zone: "NW", state: "Jigawa", competence: 73, loyalty: 65, gender: "Male", religion: "Islam", qualifiedFor: ["ag-cbn", "ag-nbs", "ag-nesrea"] },
  { characterId: "ag-nw-m05", name: "Bello Masari", zone: "NW", state: "Katsina", competence: 87, loyalty: 50, gender: "Male", religion: "Islam", qualifiedFor: ["ag-efcc", "ag-nafdac", "ag-nimc"] },
  { characterId: "ag-nw-m06", name: "Sanusi Lamido", zone: "NW", state: "Kano", competence: 95, loyalty: 35, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-nia"] },
  { characterId: "ag-nw-m07", name: "Kabiru Tambuwal", zone: "NW", state: "Sokoto", competence: 60, loyalty: 75, gender: "Male", religion: "Islam", qualifiedFor: ["ag-inec", "ag-ncc", "ag-nimasa"] },
  { characterId: "ag-nw-m08", name: "Lawal Kebbi", zone: "NW", state: "Kebbi", competence: 52, loyalty: 86, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nddc", "ag-nafdac", "ag-nesrea"] },

  // ═══════════════════════════════════════
  // NORTH-EAST (NE) — Hausa/Kanuri/Fulani names — states: Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe
  // ═══════════════════════════════════════
  // Women (3)
  { characterId: "ag-ne-f01", name: "Amina Bukar", zone: "NE", state: "Borno", competence: 79, loyalty: 63, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-inec", "ag-nafdac"] },
  { characterId: "ag-ne-f02", name: "Falmata Kyari", zone: "NE", state: "Borno", competence: 72, loyalty: 74, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-ncc", "ag-nimc"] },
  { characterId: "ag-ne-f03", name: "Salamatu Ibrahim", zone: "NE", state: "Adamawa", competence: 86, loyalty: 52, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-nimasa", "ag-nddc", "ag-nbs", "ag-nesrea"] },
  // Men (8)
  { characterId: "ag-ne-m01", name: "Mohammed Goni", zone: "NE", state: "Borno", competence: 75, loyalty: 70, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-inec"] },
  { characterId: "ag-ne-m02", name: "Adamu Gombe", zone: "NE", state: "Gombe", competence: 66, loyalty: 76, gender: "Male", religion: "Islam", qualifiedFor: ["ag-efcc", "ag-nia", "ag-ncc"] },
  { characterId: "ag-ne-m03", name: "Abubakar Atiku", zone: "NE", state: "Adamawa", competence: 83, loyalty: 48, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-ne-m04", name: "Yusuf Maitama", zone: "NE", state: "Bauchi", competence: 59, loyalty: 81, gender: "Male", religion: "Islam", qualifiedFor: ["ag-cbn", "ag-nbs", "ag-nesrea"] },
  { characterId: "ag-ne-m05", name: "Bashir Yuguda", zone: "NE", state: "Bauchi", competence: 70, loyalty: 67, gender: "Male", religion: "Islam", qualifiedFor: ["ag-efcc", "ag-nafdac", "ag-nimc"] },
  { characterId: "ag-ne-m06", name: "Dauda Taraba", zone: "NE", state: "Taraba", competence: 54, loyalty: 84, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nia", "ag-inec", "ag-ncc"] },
  { characterId: "ag-ne-m07", name: "Bukar Zulum", zone: "NE", state: "Borno", competence: 92, loyalty: 40, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-ne-m08", name: "Garba Potiskum", zone: "NE", state: "Yobe", competence: 48, loyalty: 87, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nafdac", "ag-nbs", "ag-nesrea"] },

  // ═══════════════════════════════════════
  // SOUTH-WEST (SW) — Yoruba names — states: Ekiti, Lagos, Ogun, Ondo, Osun, Oyo
  // ═══════════════════════════════════════
  // Women (3)
  { characterId: "ag-sw-f01", name: "Folashade Ogundimu", zone: "SW", state: "Lagos", competence: 89, loyalty: 55, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-inec", "ag-nafdac"] },
  { characterId: "ag-sw-f02", name: "Titilayo Adeyemi", zone: "SW", state: "Oyo", competence: 77, loyalty: 68, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-ncc", "ag-nimc"] },
  { characterId: "ag-sw-f03", name: "Morenike Ajayi", zone: "SW", state: "Ogun", competence: 81, loyalty: 62, gender: "Female", religion: "Islam", qualifiedFor: [...STRATEGIC, "ag-nimasa", "ag-nddc", "ag-nbs", "ag-nesrea"] },
  // Men (8)
  { characterId: "ag-sw-m01", name: "Adebayo Oladipo", zone: "SW", state: "Osun", competence: 85, loyalty: 58, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-inec"] },
  { characterId: "ag-sw-m02", name: "Oluwaseun Falade", zone: "SW", state: "Ondo", competence: 69, loyalty: 73, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nia", "ag-ncc"] },
  { characterId: "ag-sw-m03", name: "Akinwunmi Ambode", zone: "SW", state: "Lagos", competence: 93, loyalty: 38, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-sw-m04", name: "Babajide Akinsola", zone: "SW", state: "Ekiti", competence: 63, loyalty: 79, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-cbn", "ag-nbs", "ag-nesrea"] },
  { characterId: "ag-sw-m05", name: "Kayode Fayemi", zone: "SW", state: "Ekiti", competence: 88, loyalty: 47, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nafdac", "ag-nimc"] },
  { characterId: "ag-sw-m06", name: "Rauf Olaniyan", zone: "SW", state: "Oyo", competence: 56, loyalty: 83, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nia", "ag-inec", "ag-ncc"] },
  { characterId: "ag-sw-m07", name: "Dapo Abiodun", zone: "SW", state: "Ogun", competence: 74, loyalty: 66, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nimasa", "ag-nddc", "ag-nbs"] },
  { characterId: "ag-sw-m08", name: "Jide Omokore", zone: "SW", state: "Lagos", competence: 45, loyalty: 90, gender: "Male", religion: "Islam", qualifiedFor: ["ag-nafdac", "ag-nesrea"] },

  // ═══════════════════════════════════════
  // SOUTH-EAST (SE) — Igbo names — states: Abia, Anambra, Ebonyi, Enugu, Imo
  // ═══════════════════════════════════════
  // Women (3)
  { characterId: "ag-se-f01", name: "Ngozi Okafor", zone: "SE", state: "Anambra", competence: 90, loyalty: 50, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-inec", "ag-nafdac"] },
  { characterId: "ag-se-f02", name: "Adaeze Nwosu", zone: "SE", state: "Imo", competence: 75, loyalty: 69, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-ncc", "ag-nimc"] },
  { characterId: "ag-se-f03", name: "Chinelo Eze", zone: "SE", state: "Enugu", competence: 83, loyalty: 61, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-nimasa", "ag-nddc", "ag-nbs", "ag-nesrea"] },
  // Men (8)
  { characterId: "ag-se-m01", name: "Emeka Offor", zone: "SE", state: "Anambra", competence: 86, loyalty: 54, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-inec"] },
  { characterId: "ag-se-m02", name: "Chukwudi Nnadi", zone: "SE", state: "Ebonyi", competence: 67, loyalty: 75, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nia", "ag-ncc"] },
  { characterId: "ag-se-m03", name: "Obinna Uzor", zone: "SE", state: "Abia", competence: 79, loyalty: 64, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-se-m04", name: "Ikenna Nwankwo", zone: "SE", state: "Enugu", competence: 60, loyalty: 80, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-cbn", "ag-nbs", "ag-nesrea"] },
  { characterId: "ag-se-m05", name: "Chibuike Amaechi", zone: "SE", state: "Imo", competence: 94, loyalty: 36, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nafdac", "ag-nimc"] },
  { characterId: "ag-se-m06", name: "Uche Ogbonna", zone: "SE", state: "Abia", competence: 53, loyalty: 85, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nia", "ag-inec", "ag-ncc"] },
  { characterId: "ag-se-m07", name: "Nnamdi Azikiwe-Eze", zone: "SE", state: "Anambra", competence: 72, loyalty: 71, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nimasa", "ag-nddc", "ag-nbs"] },
  { characterId: "ag-se-m08", name: "Kelechi Iheanacho", zone: "SE", state: "Imo", competence: 44, loyalty: 89, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nafdac", "ag-nesrea"] },

  // ═══════════════════════════════════════
  // SOUTH-SOUTH (SS) — Ijaw/Efik/Urhobo/Edo names — states: Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Rivers
  // ═══════════════════════════════════════
  // Women (3)
  { characterId: "ag-ss-f01", name: "Ibinabo Kalabari", zone: "SS", state: "Rivers", competence: 81, loyalty: 64, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-inec", "ag-nafdac"] },
  { characterId: "ag-ss-f02", name: "Ekaette Essien", zone: "SS", state: "Akwa Ibom", competence: 73, loyalty: 71, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-ncc", "ag-nimc"] },
  { characterId: "ag-ss-f03", name: "Edirin Oghene", zone: "SS", state: "Delta", competence: 87, loyalty: 53, gender: "Female", religion: "Christianity", qualifiedFor: [...STRATEGIC, "ag-nimasa", "ag-nddc", "ag-nbs", "ag-nesrea"] },
  // Men (8)
  { characterId: "ag-ss-m01", name: "Timi Alaibe", zone: "SS", state: "Bayelsa", competence: 80, loyalty: 62, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nnpc", "ag-cbn", "ag-inec"] },
  { characterId: "ag-ss-m02", name: "Godswill Akpabio", zone: "SS", state: "Akwa Ibom", competence: 64, loyalty: 78, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nia", "ag-ncc"] },
  { characterId: "ag-ss-m03", name: "Broderick Bozimo", zone: "SS", state: "Bayelsa", competence: 76, loyalty: 67, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nnpc", "ag-nimasa", "ag-nddc"] },
  { characterId: "ag-ss-m04", name: "Adams Oshiomhole", zone: "SS", state: "Edo", competence: 57, loyalty: 82, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-cbn", "ag-nbs", "ag-nesrea"] },
  { characterId: "ag-ss-m05", name: "Tonye Cole", zone: "SS", state: "Rivers", competence: 91, loyalty: 41, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-efcc", "ag-nafdac", "ag-nimc"] },
  { characterId: "ag-ss-m06", name: "Bassey Edet", zone: "SS", state: "Cross River", competence: 50, loyalty: 86, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nia", "ag-inec", "ag-ncc"] },
  { characterId: "ag-ss-m07", name: "Oritsejolomi Edore", zone: "SS", state: "Delta", competence: 70, loyalty: 69, gender: "Male", religion: "Traditional", qualifiedFor: ["ag-nimasa", "ag-nddc", "ag-nbs"] },
  { characterId: "ag-ss-m08", name: "Osagie Ehanire", zone: "SS", state: "Edo", competence: 42, loyalty: 88, gender: "Male", religion: "Christianity", qualifiedFor: ["ag-nafdac", "ag-nesrea"] },
];

// ──────────────────────────────────────────────
// AMBASSADOR CANDIDATES (~36 candidates)
// ──────────────────────────────────────────────
// 6 per zone, qualified across the 10 postings

const AMB_STRATEGIC = ["amb-usa", "amb-uk", "amb-china"];
const AMB_STANDARD = ["amb-south-africa", "amb-germany", "amb-uae", "amb-france"];
const AMB_ROUTINE = ["amb-ghana", "amb-india", "amb-brazil"];

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
