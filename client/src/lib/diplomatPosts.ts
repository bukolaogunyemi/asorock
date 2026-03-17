// client/src/lib/diplomatPosts.ts
// All 80 ambassador/representative posts organized by category
// 40 key bilateral + 10 international institutions + 30 minor embassies

import type { AmbassadorPost } from "./diplomatTypes";

// ══════════════════════════════════════════════════════════════
// TIER 1 — KEY BILATERAL POSTS (40)
// Player must appoint. Vacancy has escalating consequences.
// ══════════════════════════════════════════════════════════════

export const KEY_BILATERAL_POSTS: AmbassadorPost[] = [
  // ── Strategic (8) — highest weight, most consequential ──
  { id: "amb-usa", title: "Ambassador to the United States", country: "United States", region: "North America", category: "bilateral", prestige: "strategic", internationalWeight: 1.0, tradeWeight: 0.8, militaryWeight: 0.6, languageRequired: "None" },
  { id: "amb-uk", title: "Ambassador to the United Kingdom", country: "United Kingdom", region: "Europe", category: "bilateral", prestige: "strategic", internationalWeight: 0.9, tradeWeight: 0.7, militaryWeight: 0.4, languageRequired: "None" },
  { id: "amb-china", title: "Ambassador to China", country: "China", region: "Asia", category: "bilateral", prestige: "strategic", internationalWeight: 0.9, tradeWeight: 0.8, militaryWeight: 0.3, languageRequired: "Mandarin" },
  { id: "amb-france", title: "Ambassador to France", country: "France", region: "Europe", category: "bilateral", prestige: "strategic", internationalWeight: 0.8, tradeWeight: 0.6, militaryWeight: 0.3, languageRequired: "French" },
  { id: "amb-germany", title: "Ambassador to Germany", country: "Germany", region: "Europe", category: "bilateral", prestige: "strategic", internationalWeight: 0.8, tradeWeight: 0.7, militaryWeight: 0.2, languageRequired: "None" },
  { id: "amb-saudi", title: "Ambassador to Saudi Arabia", country: "Saudi Arabia", region: "Middle East", category: "bilateral", prestige: "strategic", internationalWeight: 0.8, tradeWeight: 0.7, militaryWeight: 0.3, languageRequired: "Arabic" },
  { id: "amb-india", title: "Ambassador to India", country: "India", region: "Asia", category: "bilateral", prestige: "strategic", internationalWeight: 0.7, tradeWeight: 0.6, militaryWeight: 0.2, languageRequired: "None" },
  { id: "amb-south-africa", title: "Ambassador to South Africa", country: "South Africa", region: "Africa", category: "bilateral", prestige: "strategic", internationalWeight: 0.7, tradeWeight: 0.5, militaryWeight: 0.3, languageRequired: "None" },

  // ── Standard — Global Partners (12) ──
  { id: "amb-uae", title: "Ambassador to the UAE", country: "United Arab Emirates", region: "Middle East", category: "bilateral", prestige: "standard", internationalWeight: 0.6, tradeWeight: 0.7, militaryWeight: 0.2, languageRequired: "Arabic" },
  { id: "amb-brazil", title: "Ambassador to Brazil", country: "Brazil", region: "South America", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.5, militaryWeight: 0.1, languageRequired: "Portuguese" },
  { id: "amb-japan", title: "Ambassador to Japan", country: "Japan", region: "Asia", category: "bilateral", prestige: "standard", internationalWeight: 0.6, tradeWeight: 0.6, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-canada", title: "Ambassador to Canada", country: "Canada", region: "North America", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.4, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-netherlands", title: "Ambassador to the Netherlands", country: "Netherlands", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.6, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-spain", title: "Ambassador to Spain", country: "Spain", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.4, militaryWeight: 0.1, languageRequired: "Spanish" },
  { id: "amb-italy", title: "Ambassador to Italy", country: "Italy", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.5, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-russia", title: "Ambassador to Russia", country: "Russia", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.6, tradeWeight: 0.3, militaryWeight: 0.4, languageRequired: "Russian" },
  { id: "amb-turkey", title: "Ambassador to Turkey", country: "Turkey", region: "Middle East", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.5, militaryWeight: 0.3, languageRequired: "None" },
  { id: "amb-south-korea", title: "Ambassador to South Korea", country: "South Korea", region: "Asia", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.5, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-israel", title: "Ambassador to Israel", country: "Israel", region: "Middle East", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.3, militaryWeight: 0.3, languageRequired: "None" },
  { id: "amb-egypt", title: "Ambassador to Egypt", country: "Egypt", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.4, militaryWeight: 0.3, languageRequired: "Arabic" },

  // ── Standard — Regional Neighbours (10) ──
  { id: "amb-ghana", title: "Ambassador to Ghana", country: "Ghana", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.4, militaryWeight: 0.2, languageRequired: "None" },
  { id: "amb-cameroon", title: "Ambassador to Cameroon", country: "Cameroon", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.3, militaryWeight: 0.3, languageRequired: "French" },
  { id: "amb-niger", title: "Ambassador to Niger", country: "Niger", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.2, militaryWeight: 0.4, languageRequired: "French" },
  { id: "amb-chad", title: "Ambassador to Chad", country: "Chad", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.3, tradeWeight: 0.2, militaryWeight: 0.4, languageRequired: "French" },
  { id: "amb-benin", title: "Ambassador to Benin", country: "Benin", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.3, tradeWeight: 0.3, militaryWeight: 0.2, languageRequired: "French" },
  { id: "amb-togo", title: "Ambassador to Togo", country: "Togo", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.3, tradeWeight: 0.2, militaryWeight: 0.2, languageRequired: "French" },
  { id: "amb-senegal", title: "Ambassador to Senegal", country: "Senegal", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.3, militaryWeight: 0.2, languageRequired: "French" },
  { id: "amb-ivory-coast", title: "Ambassador to Côte d'Ivoire", country: "Côte d'Ivoire", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.4, militaryWeight: 0.2, languageRequired: "French" },
  { id: "amb-kenya", title: "Ambassador to Kenya", country: "Kenya", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.4, militaryWeight: 0.2, languageRequired: "None" },
  { id: "amb-ethiopia", title: "Ambassador to Ethiopia", country: "Ethiopia", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.3, militaryWeight: 0.2, languageRequired: "None" },

  // ── Standard — Extended Global (10) ──
  { id: "amb-indonesia", title: "Ambassador to Indonesia", country: "Indonesia", region: "Asia", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.4, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-malaysia", title: "Ambassador to Malaysia", country: "Malaysia", region: "Asia", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.4, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-singapore", title: "Ambassador to Singapore", country: "Singapore", region: "Asia", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.5, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-australia", title: "Ambassador to Australia", country: "Australia", region: "Oceania", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.3, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-belgium", title: "Ambassador to Belgium", country: "Belgium", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.4, militaryWeight: 0.1, languageRequired: "French" },
  { id: "amb-switzerland", title: "Ambassador to Switzerland", country: "Switzerland", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.5, militaryWeight: 0.1, languageRequired: "French" },
  { id: "amb-sweden", title: "Ambassador to Sweden", country: "Sweden", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.3, tradeWeight: 0.3, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-norway", title: "Ambassador to Norway", country: "Norway", region: "Europe", category: "bilateral", prestige: "standard", internationalWeight: 0.3, tradeWeight: 0.3, militaryWeight: 0.1, languageRequired: "None" },
  { id: "amb-morocco", title: "Ambassador to Morocco", country: "Morocco", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.3, militaryWeight: 0.2, languageRequired: "Arabic" },
  { id: "amb-algeria", title: "Ambassador to Algeria", country: "Algeria", region: "Africa", category: "bilateral", prestige: "standard", internationalWeight: 0.4, tradeWeight: 0.3, militaryWeight: 0.2, languageRequired: "Arabic" },
];

// ══════════════════════════════════════════════════════════════
// TIER 2 — INTERNATIONAL INSTITUTION REPRESENTATIVES (10)
// Player must appoint. Highly consequential for multilateral affairs.
// ══════════════════════════════════════════════════════════════

export const INSTITUTION_POSTS: AmbassadorPost[] = [
  { id: "inst-un-ny", title: "Permanent Representative to the United Nations (New York)", country: "United Nations", region: "North America", category: "institution", prestige: "strategic", internationalWeight: 1.0, tradeWeight: 0.3, militaryWeight: 0.3, languageRequired: "None" },
  { id: "inst-un-geneva", title: "Permanent Representative to the UN Office (Geneva)", country: "United Nations Geneva", region: "Europe", category: "institution", prestige: "strategic", internationalWeight: 0.8, tradeWeight: 0.4, militaryWeight: 0.2, languageRequired: "French" },
  { id: "inst-au", title: "Permanent Representative to the African Union", country: "African Union", region: "Africa", category: "institution", prestige: "strategic", internationalWeight: 0.9, tradeWeight: 0.3, militaryWeight: 0.4, languageRequired: "French" },
  { id: "inst-ecowas", title: "Permanent Representative to ECOWAS", country: "ECOWAS", region: "Africa", category: "institution", prestige: "strategic", internationalWeight: 0.8, tradeWeight: 0.4, militaryWeight: 0.5, languageRequired: "French" },
  { id: "inst-wto", title: "Ambassador to the World Trade Organization", country: "WTO", region: "Europe", category: "institution", prestige: "standard", internationalWeight: 0.6, tradeWeight: 0.8, militaryWeight: 0.0, languageRequired: "French" },
  { id: "inst-icc", title: "Representative to the International Criminal Court", country: "ICC", region: "Europe", category: "institution", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "None" },
  { id: "inst-commonwealth", title: "High Commissioner to the Commonwealth", country: "Commonwealth", region: "Europe", category: "institution", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.3, militaryWeight: 0.1, languageRequired: "None" },
  { id: "inst-opec", title: "Governor for OPEC", country: "OPEC", region: "Europe", category: "institution", prestige: "standard", internationalWeight: 0.6, tradeWeight: 0.7, militaryWeight: 0.0, languageRequired: "None" },
  { id: "inst-afdb", title: "Executive Director, African Development Bank", country: "AfDB", region: "Africa", category: "institution", prestige: "standard", internationalWeight: 0.5, tradeWeight: 0.6, militaryWeight: 0.0, languageRequired: "French" },
  { id: "inst-wb-imf", title: "Executive Director, World Bank/IMF", country: "World Bank", region: "North America", category: "institution", prestige: "strategic", internationalWeight: 0.7, tradeWeight: 0.7, militaryWeight: 0.0, languageRequired: "None" },
];

// ══════════════════════════════════════════════════════════════
// TIER 3 — MINOR EMBASSIES (30)
// Procedurally generated at game start. Player appoints but from
// auto-generated candidate pools. Lower consequence than Tier 1/2.
// ══════════════════════════════════════════════════════════════

export const MINOR_EMBASSY_POSTS: AmbassadorPost[] = [
  { id: "minor-cuba", title: "Ambassador to Cuba", country: "Cuba", region: "South America", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "Spanish" },
  { id: "minor-argentina", title: "Ambassador to Argentina", country: "Argentina", region: "South America", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.0, languageRequired: "Spanish" },
  { id: "minor-mexico", title: "Ambassador to Mexico", country: "Mexico", region: "North America", category: "minor", prestige: "routine", internationalWeight: 0.3, tradeWeight: 0.2, militaryWeight: 0.0, languageRequired: "Spanish" },
  { id: "minor-poland", title: "Ambassador to Poland", country: "Poland", region: "Europe", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.1, languageRequired: "None" },
  { id: "minor-portugal", title: "Ambassador to Portugal", country: "Portugal", region: "Europe", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.0, languageRequired: "Portuguese" },
  { id: "minor-austria", title: "Ambassador to Austria", country: "Austria", region: "Europe", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.0, languageRequired: "None" },
  { id: "minor-pakistan", title: "Ambassador to Pakistan", country: "Pakistan", region: "Asia", category: "minor", prestige: "routine", internationalWeight: 0.3, tradeWeight: 0.2, militaryWeight: 0.2, languageRequired: "None" },
  { id: "minor-bangladesh", title: "Ambassador to Bangladesh", country: "Bangladesh", region: "Asia", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.0, languageRequired: "None" },
  { id: "minor-thailand", title: "Ambassador to Thailand", country: "Thailand", region: "Asia", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.0, languageRequired: "None" },
  { id: "minor-vietnam", title: "Ambassador to Vietnam", country: "Vietnam", region: "Asia", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.0, languageRequired: "None" },
  { id: "minor-tanzania", title: "Ambassador to Tanzania", country: "Tanzania", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.1, languageRequired: "None" },
  { id: "minor-uganda", title: "Ambassador to Uganda", country: "Uganda", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "None" },
  { id: "minor-angola", title: "Ambassador to Angola", country: "Angola", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.1, languageRequired: "Portuguese" },
  { id: "minor-mozambique", title: "Ambassador to Mozambique", country: "Mozambique", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "Portuguese" },
  { id: "minor-drc", title: "Ambassador to the DR Congo", country: "DR Congo", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.2, languageRequired: "French" },
  { id: "minor-rwanda", title: "Ambassador to Rwanda", country: "Rwanda", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "French" },
  { id: "minor-sudan", title: "Ambassador to Sudan", country: "Sudan", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.2, languageRequired: "Arabic" },
  { id: "minor-libya", title: "Ambassador to Libya", country: "Libya", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.3, tradeWeight: 0.2, militaryWeight: 0.3, languageRequired: "Arabic" },
  { id: "minor-tunisia", title: "Ambassador to Tunisia", country: "Tunisia", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.0, languageRequired: "Arabic" },
  { id: "minor-mali", title: "Ambassador to Mali", country: "Mali", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.3, languageRequired: "French" },
  { id: "minor-guinea", title: "Ambassador to Guinea", country: "Guinea", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "French" },
  { id: "minor-sierra-leone", title: "Ambassador to Sierra Leone", country: "Sierra Leone", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "None" },
  { id: "minor-liberia", title: "Ambassador to Liberia", country: "Liberia", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "None" },
  { id: "minor-gambia", title: "Ambassador to The Gambia", country: "The Gambia", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.1, tradeWeight: 0.1, militaryWeight: 0.1, languageRequired: "None" },
  { id: "minor-burkina-faso", title: "Ambassador to Burkina Faso", country: "Burkina Faso", region: "Africa", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.2, languageRequired: "French" },
  { id: "minor-qatar", title: "Ambassador to Qatar", country: "Qatar", region: "Middle East", category: "minor", prestige: "routine", internationalWeight: 0.3, tradeWeight: 0.3, militaryWeight: 0.1, languageRequired: "Arabic" },
  { id: "minor-kuwait", title: "Ambassador to Kuwait", country: "Kuwait", region: "Middle East", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.1, languageRequired: "Arabic" },
  { id: "minor-iran", title: "Ambassador to Iran", country: "Iran", region: "Middle East", category: "minor", prestige: "routine", internationalWeight: 0.3, tradeWeight: 0.2, militaryWeight: 0.2, languageRequired: "None" },
  { id: "minor-new-zealand", title: "Ambassador to New Zealand", country: "New Zealand", region: "Oceania", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.1, militaryWeight: 0.0, languageRequired: "None" },
  { id: "minor-denmark", title: "Ambassador to Denmark", country: "Denmark", region: "Europe", category: "minor", prestige: "routine", internationalWeight: 0.2, tradeWeight: 0.2, militaryWeight: 0.0, languageRequired: "None" },
];

// ── Combined exports ──

export const ALL_DIPLOMAT_POSTS: AmbassadorPost[] = [
  ...KEY_BILATERAL_POSTS,
  ...INSTITUTION_POSTS,
  ...MINOR_EMBASSY_POSTS,
];

/** Get only posts the player must actively appoint (Tier 1 + Tier 2) */
export const PLAYER_APPOINTED_POSTS: AmbassadorPost[] = [
  ...KEY_BILATERAL_POSTS,
  ...INSTITUTION_POSTS,
];

export const DIPLOMAT_TRAITS = [
  "Career Diplomat", "Political Appointee", "Trade Negotiator",
  "Multilingual", "UN Experience", "AU Veteran", "ECOWAS Expert",
  "Oil Diplomacy Specialist", "Diaspora Champion", "Protocol Expert",
  "Intelligence Background", "Academic Diplomat", "Business Executive",
  "Former Governor", "Former Senator", "Media Savvy",
  "Security Specialist", "Cultural Ambassador", "Tech Industry Ties",
  "Human Rights Advocate",
] as const;
