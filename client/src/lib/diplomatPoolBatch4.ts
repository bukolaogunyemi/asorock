// client/src/lib/diplomatPoolBatch4.ts
// Diplomat candidate pool — Batch 4: Extended global ambassador posts 31-40
// 50 hand-crafted candidates (5 per post) covering Indonesia, Malaysia, Singapore,
// Australia, Belgium, Switzerland, Sweden, Norway, Morocco, Algeria

import type { DiplomatCandidate } from "./diplomatTypes";

export const DIPLOMAT_CANDIDATES_BATCH4: DiplomatCandidate[] = [
  // ═══════════════════════════════════════════════════════════
  // POST 31: amb-indonesia — Indonesia (No language requirement)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Obinna Ezekwesili",
    state: "Anambra", zone: "SE", age: 56, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "OE",
    traits: ["Career Diplomat", "Trade Negotiator", "Multilingual"],
    bio: "A seasoned diplomat with fifteen years of experience across Southeast Asian postings, Ezekwesili was instrumental in negotiating the Nigeria-Indonesia palm oil trade framework. His deep understanding of ASEAN dynamics makes him a natural fit for Jakarta.",
    education: "University of Nigeria Nsukka (Political Science), National University of Singapore (MA Asian Studies)",
    competence: 78, languageSkills: ["None"],
    qualifiedFor: ["amb-indonesia", "amb-malaysia", "amb-singapore", "amb-australia"],
    competencies: {
      professional: { economics: 68, diplomacy: 82, security: 42, communications: 50, legal: 55, administration: 60, technology: 45, management: 57, politics: 64 },
      personal: { loyalty: 65, charisma: 62, leadership: 68, ambition: 55, integrity: 72, resilience: 70, intrigue: 35, discretion: 64 },
    },
  },
  {
    name: "Fatimah Garba-Danladi",
    state: "Kaduna", zone: "NW", age: 49, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "FG",
    traits: ["Trade Negotiator", "Business Executive", "Media Savvy"],
    bio: "Former Managing Director of a major Nigerian commodities trading firm with extensive business ties across Indonesia and Malaysia. Garba-Danladi brings private-sector pragmatism and a network of commercial contacts that few career diplomats can match.",
    education: "Ahmadu Bello University (Economics), London School of Economics (MSc International Political Economy)",
    competence: 74, languageSkills: ["None"],
    qualifiedFor: ["amb-indonesia", "amb-malaysia", "amb-australia"],
    competencies: {
      professional: { economics: 78, diplomacy: 70, security: 35, communications: 65, legal: 48, administration: 58, technology: 52, management: 57, politics: 59 },
      personal: { loyalty: 55, charisma: 72, leadership: 65, ambition: 70, integrity: 60, resilience: 62, intrigue: 45, discretion: 56 },
    },
  },
  {
    name: "Adewale Omotosho",
    state: "Oyo", zone: "SW", age: 61, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "AO",
    traits: ["Career Diplomat", "UN Experience", "Cultural Ambassador"],
    bio: "A career Foreign Service officer who served as Deputy Permanent Representative to the UN in New York before heading the West Africa desk. Omotosho is known for his cultural sensitivity and ability to build lasting personal relationships with host-country officials.",
    education: "University of Ibadan (History), Columbia University (MIA International Affairs)",
    competence: 80, languageSkills: ["French"],
    qualifiedFor: ["amb-indonesia", "amb-singapore", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 52, diplomacy: 85, security: 45, communications: 58, legal: 50, administration: 68, technology: 38, management: 64, politics: 71 },
      personal: { loyalty: 70, charisma: 75, leadership: 72, ambition: 50, integrity: 78, resilience: 68, intrigue: 28, discretion: 67 },
    },
  },
  {
    name: "Maryam Abubakar-Suleiman",
    state: "Gombe", zone: "NE", age: 47, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "MA",
    traits: ["Academic Diplomat", "Multilingual", "Human Rights Advocate"],
    bio: "A professor of International Relations at the University of Maiduguri who transitioned into diplomacy through advisory roles on counter-terrorism cooperation. Her research on Muslim-majority democracies gives her unique insights into Nigeria-Indonesia relations.",
    education: "University of Maiduguri (Political Science), Universitas Indonesia (MA Southeast Asian Studies), Oxford University (DPhil)",
    competence: 72, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-indonesia", "amb-malaysia", "amb-morocco", "amb-algeria"],
    competencies: {
      professional: { economics: 45, diplomacy: 76, security: 58, communications: 52, legal: 60, administration: 48, technology: 40, management: 49, politics: 57 },
      personal: { loyalty: 62, charisma: 58, leadership: 60, ambition: 55, integrity: 82, resilience: 65, intrigue: 25, discretion: 69 },
    },
  },
  {
    name: "Chukwuemeka Nwachukwu",
    state: "Imo", zone: "SE", age: 53, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "CN",
    traits: ["Oil Diplomacy Specialist", "Trade Negotiator", "Tech Industry Ties"],
    bio: "Former Special Adviser on Oil and Gas at the Ministry of Foreign Affairs who coordinated Nigeria's energy diplomacy with OPEC-aligned nations including Indonesia. His technical knowledge of hydrocarbon markets is unmatched in the diplomatic corps.",
    education: "Federal University of Technology Owerri (Petroleum Engineering), Rice University (MBA Energy Management)",
    competence: 76, languageSkills: ["None"],
    qualifiedFor: ["amb-indonesia", "amb-norway", "amb-australia"],
    competencies: {
      professional: { economics: 80, diplomacy: 72, security: 38, communications: 42, legal: 55, administration: 58, technology: 65, management: 64, politics: 69 },
      personal: { loyalty: 58, charisma: 55, leadership: 62, ambition: 68, integrity: 65, resilience: 60, intrigue: 42, discretion: 67 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 32: amb-malaysia — Malaysia (No language requirement)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Aliyu Bello Makarfi",
    state: "Katsina", zone: "NW", age: 57, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "AB",
    traits: ["Career Diplomat", "ECOWAS Expert", "Protocol Expert"],
    bio: "A veteran of the Nigerian Foreign Service who served in Kuala Lumpur as First Secretary in the early 2000s. Makarfi's deep familiarity with Malaysian political culture and his extensive protocol knowledge make him an ideal choice for revitalizing bilateral ties.",
    education: "Bayero University Kano (International Studies), University of Malaya (MA Strategic Studies)",
    competence: 77, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-malaysia", "amb-indonesia", "amb-singapore", "amb-morocco"],
    competencies: {
      professional: { economics: 55, diplomacy: 80, security: 52, communications: 45, legal: 58, administration: 72, technology: 38, management: 68, politics: 75 },
      personal: { loyalty: 75, charisma: 60, leadership: 65, ambition: 48, integrity: 74, resilience: 70, intrigue: 32, discretion: 71 },
    },
  },
  {
    name: "Ngozi Okonkwo-Ibe",
    state: "Abia", zone: "SE", age: 50, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "NO",
    traits: ["Trade Negotiator", "Business Executive", "Diaspora Champion"],
    bio: "Founded a successful import-export firm linking Nigerian and Malaysian markets in textiles and palm oil derivatives. Okonkwo-Ibe brings first-hand commercial intelligence and a pragmatic approach to economic diplomacy that has earned bipartisan respect.",
    education: "Abia State University (Business Administration), University of Nottingham Malaysia (MBA)",
    competence: 71, languageSkills: ["None"],
    qualifiedFor: ["amb-malaysia", "amb-singapore", "amb-indonesia"],
    competencies: {
      professional: { economics: 82, diplomacy: 68, security: 30, communications: 55, legal: 50, administration: 62, technology: 58, management: 67, politics: 71 },
      personal: { loyalty: 52, charisma: 70, leadership: 60, ambition: 75, integrity: 58, resilience: 65, intrigue: 40, discretion: 68 },
    },
  },
  {
    name: "Yakubu Damina",
    state: "Taraba", zone: "NE", age: 60, gender: "Male", religion: "Christianity", ethnicity: "Mumuye", avatar: "YD",
    traits: ["Career Diplomat", "AU Veteran", "Security Specialist"],
    bio: "Served as Nigeria's Deputy High Commissioner to Malaysia before heading the Africa desk at the Ministry of Foreign Affairs. Damina brings a security-oriented lens to diplomacy shaped by years coordinating AU peacekeeping mandates.",
    education: "University of Jos (Sociology), Malaysian National Defence University (MA Defence Studies)",
    competence: 75, languageSkills: ["None"],
    qualifiedFor: ["amb-malaysia", "amb-indonesia", "amb-australia", "amb-singapore"],
    competencies: {
      professional: { economics: 42, diplomacy: 78, security: 72, communications: 38, legal: 48, administration: 65, technology: 35, management: 62, politics: 66 },
      personal: { loyalty: 72, charisma: 55, leadership: 70, ambition: 42, integrity: 76, resilience: 75, intrigue: 38, discretion: 70 },
    },
  },
  {
    name: "Hauwa Sani-Ahmed",
    state: "Sokoto", zone: "NW", age: 46, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "HS",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Multilingual"],
    bio: "A scholar of Islamic governance and interfaith dialogue who has published extensively on Nigeria-Malaysia comparisons in managing religious diversity. Her academic credentials and advocacy experience give her a unique profile for engaging Kuala Lumpur.",
    education: "Usmanu Danfodiyo University (Islamic Studies), International Islamic University Malaysia (PhD Comparative Law)",
    competence: 68, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-malaysia", "amb-morocco", "amb-algeria", "amb-belgium"],
    competencies: {
      professional: { economics: 40, diplomacy: 74, security: 35, communications: 62, legal: 70, administration: 48, technology: 32, management: 46, politics: 55 },
      personal: { loyalty: 60, charisma: 65, leadership: 55, ambition: 52, integrity: 85, resilience: 58, intrigue: 22, discretion: 66 },
    },
  },
  {
    name: "Emeka Udogu",
    state: "Delta", zone: "SS", age: 54, gender: "Male", religion: "Christianity", ethnicity: "Urhobo", avatar: "EU",
    traits: ["Oil Diplomacy Specialist", "Trade Negotiator", "Tech Industry Ties"],
    bio: "A petroleum engineer turned diplomat, Udogu spent a decade managing NNPC's downstream partnerships in Southeast Asia. His technical expertise in energy policy and hands-on commercial experience make him a compelling candidate for Kuala Lumpur.",
    education: "University of Benin (Chemical Engineering), Universiti Teknologi Petronas (MSc Petroleum Engineering)",
    competence: 73, languageSkills: ["None"],
    qualifiedFor: ["amb-malaysia", "amb-indonesia", "amb-norway"],
    competencies: {
      professional: { economics: 75, diplomacy: 70, security: 38, communications: 40, legal: 45, administration: 55, technology: 72, management: 50, politics: 55 },
      personal: { loyalty: 58, charisma: 52, leadership: 60, ambition: 65, integrity: 62, resilience: 68, intrigue: 35, discretion: 57 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 33: amb-singapore — Singapore (No language requirement)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Olumide Akintola",
    state: "Lagos", zone: "SW", age: 48, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "OA",
    traits: ["Business Executive", "Tech Industry Ties", "Trade Negotiator"],
    bio: "A former fintech CEO who built one of Nigeria's leading digital payment platforms with significant Singaporean investment. Akintola understands the language of venture capital and technology transfer that defines Singapore's diplomatic priorities.",
    education: "University of Lagos (Computer Science), Nanyang Technological University (MBA)",
    competence: 79, languageSkills: ["None"],
    qualifiedFor: ["amb-singapore", "amb-australia", "amb-malaysia", "amb-indonesia"],
    competencies: {
      professional: { economics: 78, diplomacy: 72, security: 30, communications: 65, legal: 48, administration: 55, technology: 88, management: 70, politics: 70 },
      personal: { loyalty: 50, charisma: 78, leadership: 72, ambition: 80, integrity: 58, resilience: 65, intrigue: 42, discretion: 68 },
    },
  },
  {
    name: "Aisha Dikko",
    state: "Niger", zone: "NC", age: 52, gender: "Female", religion: "Islam", ethnicity: "Nupe", avatar: "AD",
    traits: ["Career Diplomat", "Protocol Expert", "Multilingual"],
    bio: "Served as Nigeria's Consul General in Singapore before returning to lead the Asia-Pacific division at the Ministry of Foreign Affairs. Dikko's meticulous attention to protocol and her established relationships with Singaporean officials are invaluable assets.",
    education: "University of Ilorin (French), National University of Singapore (MSc Public Policy)",
    competence: 82, languageSkills: ["French"],
    qualifiedFor: ["amb-singapore", "amb-malaysia", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 58, diplomacy: 86, security: 42, communications: 50, legal: 55, administration: 75, technology: 45, management: 70, politics: 79 },
      personal: { loyalty: 72, charisma: 64, leadership: 68, ambition: 48, integrity: 80, resilience: 72, intrigue: 28, discretion: 74 },
    },
  },
  {
    name: "Ikechukwu Obi",
    state: "Enugu", zone: "SE", age: 45, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "IO",
    traits: ["Trade Negotiator", "Tech Industry Ties", "Diaspora Champion"],
    bio: "An investment banker who spent eight years at a leading Singaporean sovereign wealth fund before returning to Nigeria to lead the National Investment Promotion Commission. His financial acumen and regional contacts are perfectly suited to Singapore's priorities.",
    education: "University of Nigeria Nsukka (Accountancy), Singapore Management University (MSc Applied Finance)",
    competence: 81, languageSkills: ["Mandarin"],
    qualifiedFor: ["amb-singapore", "amb-indonesia", "amb-malaysia"],
    competencies: {
      professional: { economics: 85, diplomacy: 74, security: 28, communications: 52, legal: 60, administration: 58, technology: 72, management: 71, politics: 75 },
      personal: { loyalty: 55, charisma: 68, leadership: 65, ambition: 78, integrity: 62, resilience: 60, intrigue: 48, discretion: 70 },
    },
  },
  {
    name: "Grace Idoko-Agba",
    state: "Benue", zone: "NC", age: 55, gender: "Female", religion: "Christianity", ethnicity: "Idoma", avatar: "GI",
    traits: ["Career Diplomat", "UN Experience", "Human Rights Advocate"],
    bio: "A twenty-year veteran of the Foreign Service who served at Nigerian missions in Geneva and New York before specializing in Asia-Pacific affairs. Her multilateral experience and human rights background bring depth to any bilateral engagement.",
    education: "Benue State University (Law), University of Melbourne (LLM International Law)",
    competence: 76, languageSkills: ["None"],
    qualifiedFor: ["amb-singapore", "amb-australia", "amb-sweden"],
    competencies: {
      professional: { economics: 48, diplomacy: 80, security: 40, communications: 55, legal: 72, administration: 62, technology: 35, management: 71, politics: 78 },
      personal: { loyalty: 68, charisma: 62, leadership: 65, ambition: 45, integrity: 82, resilience: 70, intrigue: 25, discretion: 83 },
    },
  },
  {
    name: "Ibrahim Jibrin",
    state: "Kano", zone: "NW", age: 59, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "IJ",
    traits: ["Former Senator", "Political Appointee", "Trade Negotiator"],
    bio: "A two-term senator who chaired the Senate Committee on Foreign Affairs and led multiple parliamentary delegations to Southeast Asia. Jibrin's political clout and personal wealth give him the gravitas and independence expected in Singapore's diplomatic circle.",
    education: "Bayero University Kano (Economics), Harvard Kennedy School (MPA)",
    competence: 70, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-singapore", "amb-indonesia", "amb-morocco"],
    competencies: {
      professional: { economics: 65, diplomacy: 72, security: 45, communications: 68, legal: 52, administration: 60, technology: 38, management: 74, politics: 71 },
      personal: { loyalty: 48, charisma: 75, leadership: 78, ambition: 72, integrity: 52, resilience: 58, intrigue: 55, discretion: 60 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 34: amb-australia — Australia (No language requirement)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Funke Adebayo-Williams",
    state: "Ekiti", zone: "SW", age: 51, gender: "Female", religion: "Christianity", ethnicity: "Yoruba", avatar: "FA",
    traits: ["Diaspora Champion", "Academic Diplomat", "Media Savvy"],
    bio: "A former Vice-Chancellor of a Nigerian federal university who spent sabbatical years at the University of Sydney and built lasting ties with Australia's Nigerian diaspora community. Her academic credibility and diaspora connections give her strong standing in Canberra.",
    education: "University of Ado-Ekiti (English), University of Sydney (PhD Postcolonial Studies)",
    competence: 73, languageSkills: ["None"],
    qualifiedFor: ["amb-australia", "amb-singapore", "amb-sweden", "amb-norway"],
    competencies: {
      professional: { economics: 42, diplomacy: 75, security: 32, communications: 72, legal: 48, administration: 68, technology: 45, management: 68, politics: 71 },
      personal: { loyalty: 65, charisma: 72, leadership: 70, ambition: 55, integrity: 78, resilience: 62, intrigue: 28, discretion: 69 },
    },
  },
  {
    name: "Nnamdi Okafor",
    state: "Ebonyi", zone: "SE", age: 58, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "NO",
    traits: ["Career Diplomat", "Trade Negotiator", "AU Veteran"],
    bio: "A career diplomat who led Nigeria's trade mission in Australia for four years and negotiated the bilateral mining cooperation framework. His hands-on knowledge of Australian resources diplomacy and administrative efficiency is a proven asset.",
    education: "Ebonyi State University (Political Science), Australian National University (MA International Relations)",
    competence: 79, languageSkills: ["None"],
    qualifiedFor: ["amb-australia", "amb-singapore", "amb-indonesia"],
    competencies: {
      professional: { economics: 70, diplomacy: 82, security: 45, communications: 48, legal: 55, administration: 65, technology: 40, management: 59, politics: 66 },
      personal: { loyalty: 70, charisma: 58, leadership: 68, ambition: 52, integrity: 75, resilience: 72, intrigue: 30, discretion: 66 },
    },
  },
  {
    name: "Sadiq Mohammed Lawal",
    state: "Jigawa", zone: "NW", age: 62, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "SM",
    traits: ["Former Governor", "Political Appointee", "Oil Diplomacy Specialist"],
    bio: "A former governor of Jigawa State who pivoted to diplomacy after leaving office. His executive experience managing a state government and his interest in Australian mining best practices bring a unique perspective to the Canberra posting.",
    education: "Bayero University Kano (Public Administration), Monash University (Graduate Diploma in Mining Policy)",
    competence: 67, languageSkills: ["None"],
    qualifiedFor: ["amb-australia", "amb-norway", "amb-sweden"],
    competencies: {
      professional: { economics: 62, diplomacy: 65, security: 48, communications: 60, legal: 52, administration: 78, technology: 35, management: 88, politics: 81 },
      personal: { loyalty: 50, charisma: 68, leadership: 80, ambition: 72, integrity: 48, resilience: 65, intrigue: 55, discretion: 66 },
    },
  },
  {
    name: "Blessing Odiase",
    state: "Edo", zone: "SS", age: 46, gender: "Female", religion: "Christianity", ethnicity: "Bini", avatar: "BO",
    traits: ["Tech Industry Ties", "Trade Negotiator", "Diaspora Champion"],
    bio: "A tech entrepreneur who co-founded a successful edutech company with Australian venture capital backing. Odiase understands the innovation economy and has nurtured relationships across the Australian startup ecosystem and its growing Nigerian diaspora.",
    education: "University of Benin (Computer Science), University of New South Wales (MSc Information Technology)",
    competence: 72, languageSkills: ["None"],
    qualifiedFor: ["amb-australia", "amb-singapore", "amb-malaysia"],
    competencies: {
      professional: { economics: 68, diplomacy: 65, security: 28, communications: 58, legal: 40, administration: 52, technology: 85, management: 50, politics: 52 },
      personal: { loyalty: 55, charisma: 70, leadership: 62, ambition: 75, integrity: 60, resilience: 58, intrigue: 38, discretion: 52 },
    },
  },
  {
    name: "Emmanuel Ochigbo",
    state: "Cross River", zone: "SS", age: 55, gender: "Male", religion: "Christianity", ethnicity: "Bekwarra", avatar: "EO",
    traits: ["Career Diplomat", "Security Specialist", "Intelligence Background"],
    bio: "A former intelligence officer who transitioned to the Foreign Service and specialized in Five Eyes-adjacent nations. Ochigbo's security clearance, analytical rigor, and understanding of Australia's strategic posture make him a trusted choice for sensitive bilateral engagement.",
    education: "University of Calabar (Criminology), University of Queensland (MA Security Studies)",
    competence: 77, languageSkills: ["None"],
    qualifiedFor: ["amb-australia", "amb-sweden", "amb-norway", "amb-singapore"],
    competencies: {
      professional: { economics: 40, diplomacy: 75, security: 82, communications: 35, legal: 58, administration: 62, technology: 48, management: 72, politics: 77 },
      personal: { loyalty: 78, charisma: 48, leadership: 65, ambition: 50, integrity: 72, resilience: 78, intrigue: 60, discretion: 83 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 35: amb-belgium — Belgium (French required)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Adaobi Nnaji",
    state: "Anambra", zone: "SE", age: 50, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "AN",
    traits: ["Career Diplomat", "Multilingual", "UN Experience"],
    bio: "A Francophone career diplomat who served at Nigeria's permanent mission to the European Union in Brussels for six years. Nnaji's fluent French, knowledge of EU institutions, and established network in Brussels make her an exceptional candidate.",
    education: "Nnamdi Azikiwe University (French), Université Libre de Bruxelles (MA European Studies)",
    competence: 85, languageSkills: ["French"],
    qualifiedFor: ["amb-belgium", "amb-switzerland", "amb-singapore", "amb-sweden"],
    competencies: {
      professional: { economics: 58, diplomacy: 88, security: 40, communications: 52, legal: 62, administration: 68, technology: 42, management: 72, politics: 80 },
      personal: { loyalty: 68, charisma: 70, leadership: 72, ambition: 55, integrity: 78, resilience: 70, intrigue: 30, discretion: 76 },
    },
  },
  {
    name: "Abdulrazaq Yusuf",
    state: "Kwara", zone: "NC", age: 54, gender: "Male", religion: "Islam", ethnicity: "Yoruba", avatar: "AY",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Multilingual"],
    bio: "Former Director of Trade at the Nigerian mission to the EU who negotiated key aspects of the ACP-EU Partnership Agreement. Yusuf's bilingual fluency in French and English and his deep understanding of European trade architecture are strategic assets in Brussels.",
    education: "University of Ilorin (Economics), Sciences Po Paris (MA International Affairs)",
    competence: 83, languageSkills: ["French"],
    qualifiedFor: ["amb-belgium", "amb-switzerland", "amb-morocco"],
    competencies: {
      professional: { economics: 78, diplomacy: 85, security: 35, communications: 55, legal: 60, administration: 62, technology: 40, management: 61, politics: 71 },
      personal: { loyalty: 62, charisma: 68, leadership: 65, ambition: 60, integrity: 72, resilience: 68, intrigue: 35, discretion: 67 },
    },
  },
  {
    name: "Comfort Achi-Okoh",
    state: "Kogi", zone: "NC", age: 48, gender: "Female", religion: "Christianity", ethnicity: "Igala", avatar: "CA",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Multilingual"],
    bio: "A legal scholar specializing in EU-Africa human rights frameworks who has argued cases before the International Court of Justice in The Hague. Her Francophone background and legal expertise in European institutions make her highly suited for Brussels.",
    education: "Kogi State University (Law), Katholieke Universiteit Leuven (LLM International Human Rights Law)",
    competence: 78, languageSkills: ["French"],
    qualifiedFor: ["amb-belgium", "amb-switzerland", "amb-sweden", "amb-norway"],
    competencies: {
      professional: { economics: 42, diplomacy: 80, security: 35, communications: 58, legal: 85, administration: 52, technology: 38, management: 51, politics: 62 },
      personal: { loyalty: 65, charisma: 62, leadership: 58, ambition: 52, integrity: 88, resilience: 65, intrigue: 22, discretion: 73 },
    },
  },
  {
    name: "Suleiman Baba-Gana",
    state: "Borno", zone: "NE", age: 58, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "SB",
    traits: ["Career Diplomat", "Security Specialist", "AU Veteran"],
    bio: "A career diplomat who served in several Francophone African capitals before leading Nigeria's counter-terrorism cooperation desk at the AU. His fluent French and security expertise are critical for engaging Belgium, home to NATO headquarters.",
    education: "University of Maiduguri (French), Royal Military Academy Brussels (MSc Security and Defence Studies)",
    competence: 80, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-belgium", "amb-morocco", "amb-algeria", "amb-switzerland"],
    competencies: {
      professional: { economics: 40, diplomacy: 82, security: 78, communications: 42, legal: 55, administration: 65, technology: 35, management: 61, politics: 66 },
      personal: { loyalty: 75, charisma: 55, leadership: 72, ambition: 48, integrity: 74, resilience: 80, intrigue: 42, discretion: 69 },
    },
  },
  {
    name: "Tunde Fashola",
    state: "Ogun", zone: "SW", age: 63, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "TF",
    traits: ["Former Senator", "Political Appointee", "Multilingual"],
    bio: "A distinguished former senator who chaired the Senate Committee on EU Affairs and made French-language competence his signature legislative priority. His political stature and personal relationships with Belgian parliamentarians give him considerable clout.",
    education: "University of Lagos (Political Science), Université Catholique de Louvain (MA Political Communication)",
    competence: 71, languageSkills: ["French"],
    qualifiedFor: ["amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 55, diplomacy: 74, security: 42, communications: 72, legal: 58, administration: 60, technology: 35, management: 65, politics: 64 },
      personal: { loyalty: 48, charisma: 78, leadership: 75, ambition: 68, integrity: 55, resilience: 60, intrigue: 52, discretion: 55 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 36: amb-switzerland — Switzerland (French required)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Chidinma Ekeh",
    state: "Abia", zone: "SE", age: 47, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "CE",
    traits: ["Trade Negotiator", "Multilingual", "Business Executive"],
    bio: "A former banker at a major Swiss financial institution in Zurich who returned to Nigeria to advise the Central Bank on international financial flows. Ekeh's insider knowledge of Swiss banking and her Francophone fluency make her an outstanding candidate for Bern.",
    education: "University of Port Harcourt (Banking and Finance), Université de Genève (MSc Finance)",
    competence: 82, languageSkills: ["French"],
    qualifiedFor: ["amb-switzerland", "amb-belgium", "amb-sweden"],
    competencies: {
      professional: { economics: 85, diplomacy: 76, security: 32, communications: 48, legal: 58, administration: 62, technology: 55, management: 65, politics: 72 },
      personal: { loyalty: 55, charisma: 65, leadership: 62, ambition: 72, integrity: 68, resilience: 60, intrigue: 40, discretion: 67 },
    },
  },
  {
    name: "Mohammed Yahaya-Bello",
    state: "Nasarawa", zone: "NC", age: 56, gender: "Male", religion: "Islam", ethnicity: "Eggon", avatar: "MY",
    traits: ["Career Diplomat", "UN Experience", "Protocol Expert"],
    bio: "Spent twelve years at Nigeria's Permanent Mission to the United Nations in Geneva, rising to Minister-Counsellor. Yahaya-Bello's intimate knowledge of the Geneva diplomatic ecosystem and multilateral institutions makes him exceptionally well-placed for Switzerland.",
    education: "University of Jos (Political Science), Graduate Institute of International and Development Studies Geneva (MA)",
    competence: 88, languageSkills: ["French"],
    qualifiedFor: ["amb-switzerland", "amb-belgium", "amb-norway", "amb-sweden"],
    competencies: {
      professional: { economics: 55, diplomacy: 92, security: 42, communications: 50, legal: 60, administration: 72, technology: 38, management: 71, politics: 82 },
      personal: { loyalty: 72, charisma: 62, leadership: 70, ambition: 45, integrity: 82, resilience: 75, intrigue: 25, discretion: 79 },
    },
  },
  {
    name: "Hadiza Lawal-Abdullahi",
    state: "Zamfara", zone: "NW", age: 49, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "HL",
    traits: ["Human Rights Advocate", "Academic Diplomat", "Multilingual"],
    bio: "A human rights lawyer who served on the UN Human Rights Council advisory committee in Geneva. Her Francophone education and deep connections within the Swiss humanitarian sector give her credibility in both diplomatic and civil society spheres.",
    education: "Ahmadu Bello University (Law), Université de Fribourg (LLM International Humanitarian Law)",
    competence: 76, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-switzerland", "amb-belgium", "amb-morocco", "amb-algeria"],
    competencies: {
      professional: { economics: 38, diplomacy: 78, security: 40, communications: 55, legal: 82, administration: 48, technology: 32, management: 54, politics: 64 },
      personal: { loyalty: 60, charisma: 68, leadership: 58, ambition: 55, integrity: 86, resilience: 62, intrigue: 22, discretion: 75 },
    },
  },
  {
    name: "Osaze Igbinedion",
    state: "Edo", zone: "SS", age: 53, gender: "Male", religion: "Christianity", ethnicity: "Bini", avatar: "OI",
    traits: ["Oil Diplomacy Specialist", "Trade Negotiator", "Multilingual"],
    bio: "A former senior executive at a Swiss-based commodity trading firm who managed crude oil transactions across West Africa for over a decade. His blend of commercial acumen and cultural fluency in both Swiss and Nigerian business environments is rare.",
    education: "University of Benin (Economics), HEC Lausanne (MBA International Management)",
    competence: 75, languageSkills: ["French"],
    qualifiedFor: ["amb-switzerland", "amb-belgium", "amb-norway"],
    competencies: {
      professional: { economics: 82, diplomacy: 72, security: 30, communications: 42, legal: 50, administration: 58, technology: 48, management: 56, politics: 63 },
      personal: { loyalty: 50, charisma: 62, leadership: 58, ambition: 70, integrity: 55, resilience: 65, intrigue: 48, discretion: 58 },
    },
  },
  {
    name: "Binta Adamu-Waziri",
    state: "Adamawa", zone: "NE", age: 51, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "BA",
    traits: ["Career Diplomat", "Multilingual", "Cultural Ambassador"],
    bio: "A career diplomat who served in Francophone West African capitals before heading the International Organizations desk at the Ministry of Foreign Affairs. Her French fluency, cultural sensitivity, and experience with multilateral diplomacy are well matched to Bern.",
    education: "Modibbo Adama University (French), Université de Lausanne (MA International Relations)",
    competence: 74, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-switzerland", "amb-belgium", "amb-algeria", "amb-morocco"],
    competencies: {
      professional: { economics: 45, diplomacy: 80, security: 38, communications: 55, legal: 52, administration: 65, technology: 35, management: 62, politics: 72 },
      personal: { loyalty: 68, charisma: 65, leadership: 60, ambition: 48, integrity: 75, resilience: 70, intrigue: 28, discretion: 72 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 37: amb-sweden — Sweden (No language requirement)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Toyin Adeniyi-Coker",
    state: "Ondo", zone: "SW", age: 50, gender: "Female", religion: "Christianity", ethnicity: "Yoruba", avatar: "TA",
    traits: ["Human Rights Advocate", "Academic Diplomat", "UN Experience"],
    bio: "A human rights scholar who spent five years at the Raoul Wallenberg Institute in Lund, Sweden, and has advised the Nigerian Human Rights Commission. Her deep immersion in Swedish society and her advocacy credentials make her a natural choice for Stockholm.",
    education: "University of Ado-Ekiti (Law), Lund University (LLM Human Rights Studies)",
    competence: 77, languageSkills: ["None"],
    qualifiedFor: ["amb-sweden", "amb-norway", "amb-australia", "amb-belgium"],
    competencies: {
      professional: { economics: 40, diplomacy: 80, security: 32, communications: 62, legal: 78, administration: 52, technology: 38, management: 56, politics: 65 },
      personal: { loyalty: 65, charisma: 70, leadership: 62, ambition: 50, integrity: 85, resilience: 65, intrigue: 22, discretion: 74 },
    },
  },
  {
    name: "Abdullahi Nuhu Ribadu",
    state: "Yobe", zone: "NE", age: 57, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "AN",
    traits: ["Career Diplomat", "Security Specialist", "ECOWAS Expert"],
    bio: "A veteran diplomat who served as Nigeria's Military Attaché in several European capitals before transitioning to the civilian diplomatic corps. His understanding of Nordic security cooperation and the EU's Common Security and Defence Policy is highly relevant to Stockholm.",
    education: "Nigerian Defence Academy (Strategic Studies), Swedish Defence University (MSc Military Studies)",
    competence: 75, languageSkills: ["French"],
    qualifiedFor: ["amb-sweden", "amb-norway", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 38, diplomacy: 78, security: 80, communications: 40, legal: 48, administration: 65, technology: 42, management: 66, politics: 69 },
      personal: { loyalty: 78, charisma: 52, leadership: 72, ambition: 45, integrity: 72, resilience: 78, intrigue: 40, discretion: 72 },
    },
  },
  {
    name: "Ifeoma Chukwuma",
    state: "Imo", zone: "SE", age: 46, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "IC",
    traits: ["Trade Negotiator", "Tech Industry Ties", "Diaspora Champion"],
    bio: "A tech industry executive who managed an African market expansion from Stockholm for a major Swedish telecoms firm. Chukwuma's commercial contacts, understanding of Swedish corporate culture, and diaspora engagement experience are significant assets.",
    education: "Federal University of Technology Owerri (Electrical Engineering), KTH Royal Institute of Technology Stockholm (MSc ICT Innovation)",
    competence: 72, languageSkills: ["None"],
    qualifiedFor: ["amb-sweden", "amb-norway", "amb-australia"],
    competencies: {
      professional: { economics: 72, diplomacy: 68, security: 28, communications: 55, legal: 42, administration: 52, technology: 82, management: 59, politics: 63 },
      personal: { loyalty: 55, charisma: 72, leadership: 60, ambition: 75, integrity: 62, resilience: 58, intrigue: 35, discretion: 63 },
    },
  },
  {
    name: "Usman Bature",
    state: "Bauchi", zone: "NE", age: 60, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "UB",
    traits: ["Career Diplomat", "AU Veteran", "Protocol Expert"],
    bio: "A career diplomat who served in multiple European capitals including Copenhagen, Oslo, and Helsinki, giving him rare familiarity with the Nordic diplomatic landscape. His steady temperament and institutional memory are valued in the Foreign Service.",
    education: "Abubakar Tafawa Balewa University (Political Science), Uppsala University (MA Peace and Conflict Studies)",
    competence: 74, languageSkills: ["None"],
    qualifiedFor: ["amb-sweden", "amb-norway", "amb-australia", "amb-singapore"],
    competencies: {
      professional: { economics: 45, diplomacy: 78, security: 52, communications: 42, legal: 55, administration: 70, technology: 35, management: 62, politics: 68 },
      personal: { loyalty: 75, charisma: 55, leadership: 65, ambition: 40, integrity: 78, resilience: 72, intrigue: 28, discretion: 69 },
    },
  },
  {
    name: "Amaka Okonkwo",
    state: "Enugu", zone: "SE", age: 48, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "AO",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Media Savvy"],
    bio: "A gender studies professor who received the Swedish Institute fellowship and built strong ties with Swedish development agencies. Her academic profile and media skill give her the ability to project Nigeria's image effectively in Stockholm.",
    education: "University of Nigeria Nsukka (Sociology), Stockholm University (PhD Gender Studies)",
    competence: 69, languageSkills: ["None"],
    qualifiedFor: ["amb-sweden", "amb-norway"],
    competencies: {
      professional: { economics: 38, diplomacy: 72, security: 28, communications: 75, legal: 55, administration: 48, technology: 42, management: 54, politics: 62 },
      personal: { loyalty: 60, charisma: 68, leadership: 55, ambition: 58, integrity: 80, resilience: 55, intrigue: 22, discretion: 70 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 38: amb-norway — Norway (No language requirement)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Edet Bassey Okon",
    state: "Akwa Ibom", zone: "SS", age: 56, gender: "Male", religion: "Christianity", ethnicity: "Ibibio", avatar: "EB",
    traits: ["Oil Diplomacy Specialist", "Trade Negotiator", "Career Diplomat"],
    bio: "A petroleum engineer turned diplomat who managed the Nigeria-Norway oil sector partnership programme for eight years. His intimate knowledge of Norwegian energy companies and the Petroleum Fund model makes him uniquely qualified for Oslo.",
    education: "University of Uyo (Petroleum Engineering), Norwegian University of Science and Technology (MSc Petroleum Engineering)",
    competence: 81, languageSkills: ["None"],
    qualifiedFor: ["amb-norway", "amb-sweden", "amb-australia", "amb-indonesia"],
    competencies: {
      professional: { economics: 78, diplomacy: 78, security: 35, communications: 42, legal: 50, administration: 62, technology: 68, management: 57, politics: 62 },
      personal: { loyalty: 65, charisma: 58, leadership: 68, ambition: 55, integrity: 72, resilience: 70, intrigue: 32, discretion: 63 },
    },
  },
  {
    name: "Bala Danjuma",
    state: "Plateau", zone: "NC", age: 52, gender: "Male", religion: "Christianity", ethnicity: "Berom", avatar: "BD",
    traits: ["Career Diplomat", "UN Experience", "Security Specialist"],
    bio: "A career diplomat who served at Norway's International Centre for the Study of Radicalisation on secondment from the Nigerian Foreign Service. His expertise on peacebuilding aligns perfectly with Norway's foreign policy priorities.",
    education: "University of Jos (Political Science), University of Oslo (MA Peace and Conflict Studies)",
    competence: 78, languageSkills: ["None"],
    qualifiedFor: ["amb-norway", "amb-sweden", "amb-australia"],
    competencies: {
      professional: { economics: 42, diplomacy: 82, security: 72, communications: 45, legal: 55, administration: 60, technology: 38, management: 66, politics: 73 },
      personal: { loyalty: 70, charisma: 60, leadership: 68, ambition: 48, integrity: 78, resilience: 75, intrigue: 30, discretion: 79 },
    },
  },
  {
    name: "Rukayat Ogunbiyi",
    state: "Osun", zone: "SW", age: 45, gender: "Female", religion: "Islam", ethnicity: "Yoruba", avatar: "RO",
    traits: ["Trade Negotiator", "Tech Industry Ties", "Multilingual"],
    bio: "A marine logistics specialist who coordinated Nigerian port modernization projects with Norwegian shipping firms. Her commercial contacts in the Norwegian maritime industry and her analytical approach to bilateral trade make her a compelling candidate.",
    education: "Obafemi Awolowo University (Marine Science), Norwegian School of Economics (MSc International Business)",
    competence: 74, languageSkills: ["French"],
    qualifiedFor: ["amb-norway", "amb-sweden", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 75, diplomacy: 72, security: 30, communications: 50, legal: 48, administration: 58, technology: 65, management: 60, politics: 66 },
      personal: { loyalty: 58, charisma: 65, leadership: 60, ambition: 68, integrity: 65, resilience: 62, intrigue: 35, discretion: 65 },
    },
  },
  {
    name: "Garba Shehu Adamu",
    state: "Kebbi", zone: "NW", age: 61, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "GS",
    traits: ["Former Governor", "Political Appointee", "Oil Diplomacy Specialist"],
    bio: "A former governor and petroleum ministry permanent secretary who oversaw the adoption of Norwegian-style petroleum governance reforms. His executive experience and energy sector knowledge give him unique standing for the Oslo posting.",
    education: "Usmanu Danfodiyo University (Public Administration), BI Norwegian Business School (Executive MBA)",
    competence: 70, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-norway", "amb-indonesia", "amb-algeria"],
    competencies: {
      professional: { economics: 68, diplomacy: 68, security: 42, communications: 55, legal: 50, administration: 75, technology: 40, management: 72, politics: 67 },
      personal: { loyalty: 52, charisma: 65, leadership: 78, ambition: 70, integrity: 50, resilience: 62, intrigue: 50, discretion: 51 },
    },
  },
  {
    name: "Patience Okoro-Ebri",
    state: "Rivers", zone: "SS", age: 49, gender: "Female", religion: "Christianity", ethnicity: "Ikwerre", avatar: "PO",
    traits: ["Human Rights Advocate", "Academic Diplomat", "Diaspora Champion"],
    bio: "An environmental activist and scholar who collaborated with Norwegian environmental agencies on Niger Delta remediation. Her advocacy work and academic ties to Norwegian research institutions give her credibility on development and human rights issues central to Oslo's agenda.",
    education: "University of Port Harcourt (Environmental Science), University of Bergen (PhD Environmental Governance)",
    competence: 71, languageSkills: ["None"],
    qualifiedFor: ["amb-norway", "amb-sweden", "amb-australia"],
    competencies: {
      professional: { economics: 48, diplomacy: 72, security: 30, communications: 65, legal: 58, administration: 50, technology: 52, management: 52, politics: 60 },
      personal: { loyalty: 62, charisma: 68, leadership: 55, ambition: 52, integrity: 85, resilience: 60, intrigue: 20, discretion: 72 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 39: amb-morocco — Morocco (Arabic required)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Ahmed Tijjani Yusuf",
    state: "Kano", zone: "NW", age: 55, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "AT",
    traits: ["Career Diplomat", "Multilingual", "AU Veteran"],
    bio: "A senior career diplomat who served at Nigeria's embassy in Rabat for five years and later headed the North Africa division at the Ministry of Foreign Affairs. His fluent Arabic, deep Moroccan contacts, and AU experience make him the most prepared candidate for this posting.",
    education: "Bayero University Kano (Arabic Studies), Mohammed V University Rabat (MA Maghreb Studies)",
    competence: 86, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-morocco", "amb-algeria", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 52, diplomacy: 90, security: 55, communications: 48, legal: 55, administration: 68, technology: 35, management: 70, politics: 80 },
      personal: { loyalty: 72, charisma: 65, leadership: 70, ambition: 52, integrity: 78, resilience: 72, intrigue: 35, discretion: 76 },
    },
  },
  {
    name: "Zainab Idris-Wali",
    state: "Kaduna", zone: "NW", age: 48, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "ZI",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Multilingual"],
    bio: "A trade policy expert who led Nigeria's negotiating team on the Nigeria-Morocco gas pipeline project. Her fluent Arabic, commercial acumen, and familiarity with Moroccan business culture are exactly what this strategically important posting demands.",
    education: "Ahmadu Bello University (Economics), Al Akhawayn University Morocco (MBA International Business)",
    competence: 80, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-morocco", "amb-algeria", "amb-indonesia"],
    competencies: {
      professional: { economics: 80, diplomacy: 78, security: 35, communications: 52, legal: 55, administration: 60, technology: 45, management: 54, politics: 62 },
      personal: { loyalty: 60, charisma: 70, leadership: 62, ambition: 65, integrity: 68, resilience: 65, intrigue: 38, discretion: 60 },
    },
  },
  {
    name: "Balarabe Musa Gusau",
    state: "Zamfara", zone: "NW", age: 62, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "BM",
    traits: ["Former Senator", "Political Appointee", "Cultural Ambassador"],
    bio: "A former senator who chaired the Senate Committee on Diaspora Affairs and championed the Nigeria-Morocco bilateral framework. His Arabic fluency, political gravitas, and personal relationships with Moroccan officials give him exceptional access in Rabat.",
    education: "Usmanu Danfodiyo University (Islamic Studies), University of Fez (MA Arab-African Relations)",
    competence: 72, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-morocco", "amb-algeria"],
    competencies: {
      professional: { economics: 50, diplomacy: 75, security: 42, communications: 65, legal: 52, administration: 60, technology: 30, management: 57, politics: 59 },
      personal: { loyalty: 48, charisma: 75, leadership: 72, ambition: 68, integrity: 52, resilience: 58, intrigue: 55, discretion: 46 },
    },
  },
  {
    name: "Abubakar Shehu Malami",
    state: "Sokoto", zone: "NW", age: 53, gender: "Male", religion: "Islam", ethnicity: "Fulani", avatar: "AS",
    traits: ["Academic Diplomat", "Multilingual", "Security Specialist"],
    bio: "An Islamic studies professor and security analyst who has published extensively on Sahel security cooperation between Nigeria and Morocco. His Arabic scholarship, regional expertise, and understanding of Morocco's geopolitical ambitions are highly relevant.",
    education: "Usmanu Danfodiyo University (Arabic), University of Rabat (PhD Islamic Civilization), King's College London (MA War Studies)",
    competence: 78, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-morocco", "amb-algeria", "amb-belgium", "amb-malaysia"],
    competencies: {
      professional: { economics: 40, diplomacy: 80, security: 72, communications: 55, legal: 58, administration: 50, technology: 35, management: 52, politics: 61 },
      personal: { loyalty: 65, charisma: 60, leadership: 62, ambition: 55, integrity: 78, resilience: 70, intrigue: 38, discretion: 70 },
    },
  },
  {
    name: "Hauwa Abubakar-Yola",
    state: "Adamawa", zone: "NE", age: 46, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "HA",
    traits: ["Career Diplomat", "Multilingual", "Human Rights Advocate"],
    bio: "A young career diplomat who served in Cairo and Riyadh before being posted to Rabat as First Secretary. Her Arabic fluency, understanding of North African politics, and advocacy for women's rights in the Maghreb make her a dynamic candidate for ambassador.",
    education: "Modibbo Adama University (International Relations), Cairo University (MA Arab Studies)",
    competence: 73, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-morocco", "amb-algeria", "amb-indonesia", "amb-malaysia"],
    competencies: {
      professional: { economics: 42, diplomacy: 78, security: 48, communications: 58, legal: 55, administration: 52, technology: 38, management: 58, politics: 68 },
      personal: { loyalty: 62, charisma: 68, leadership: 58, ambition: 60, integrity: 80, resilience: 65, intrigue: 30, discretion: 76 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // POST 40: amb-algeria — Algeria (Arabic required)
  // ═══════════════════════════════════════════════════════════

  {
    name: "Mustapha Lawan Katagum",
    state: "Bauchi", zone: "NE", age: 58, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "ML",
    traits: ["Career Diplomat", "AU Veteran", "Multilingual"],
    bio: "A thirty-year career diplomat who served as Nigeria's ambassador to Libya before heading the North Africa desk. His fluent Arabic, experience in volatile North African environments, and deep AU institutional knowledge make him ideal for Algiers.",
    education: "Abubakar Tafawa Balewa University (Political Science), University of Algiers (MA Political Science), SOAS London (PhD)",
    competence: 84, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-algeria", "amb-morocco", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 50, diplomacy: 88, security: 65, communications: 45, legal: 55, administration: 70, technology: 35, management: 73, politics: 81 },
      personal: { loyalty: 72, charisma: 58, leadership: 72, ambition: 48, integrity: 78, resilience: 80, intrigue: 35, discretion: 81 },
    },
  },
  {
    name: "Fatima Bello-Yero",
    state: "FCT", zone: "NC", age: 50, gender: "Female", religion: "Islam", ethnicity: "Gwari", avatar: "FB",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Multilingual"],
    bio: "A trade economist who managed Nigeria's natural gas export negotiations with Algeria through the Trans-Saharan Gas Pipeline discussions. Her Arabic language skills and gas sector expertise make her an invaluable asset for the Algiers posting.",
    education: "University of Abuja (Economics), Université d'Alger (MA Energy Economics)",
    competence: 79, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-algeria", "amb-morocco", "amb-switzerland"],
    competencies: {
      professional: { economics: 82, diplomacy: 76, security: 38, communications: 50, legal: 52, administration: 58, technology: 48, management: 54, politics: 62 },
      personal: { loyalty: 62, charisma: 65, leadership: 60, ambition: 62, integrity: 72, resilience: 68, intrigue: 32, discretion: 65 },
    },
  },
  {
    name: "Shehu Bukar Abba",
    state: "Borno", zone: "NE", age: 63, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "SA",
    traits: ["Security Specialist", "Intelligence Background", "Multilingual"],
    bio: "A former Director of Intelligence who specialized in Sahel security and counter-terrorism cooperation with Algeria. His Arabic fluency, security clearances, and working relationships with Algerian intelligence services are unmatched in the diplomatic pool.",
    education: "University of Maiduguri (Political Science), Algerian Military Academy (Strategic Studies), NDC Abuja",
    competence: 80, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-algeria", "amb-morocco"],
    competencies: {
      professional: { economics: 35, diplomacy: 75, security: 90, communications: 32, legal: 50, administration: 65, technology: 40, management: 63, politics: 64 },
      personal: { loyalty: 80, charisma: 45, leadership: 72, ambition: 42, integrity: 70, resilience: 85, intrigue: 65, discretion: 72 },
    },
  },
  {
    name: "Bilkisu Haruna-Ringim",
    state: "Jigawa", zone: "NW", age: 47, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "BH",
    traits: ["Academic Diplomat", "Multilingual", "Cultural Ambassador"],
    bio: "A scholar of Maghreb-West African relations at Bayero University who has been a visiting professor at the University of Algiers. Her Arabic scholarship, cultural fluency, and academic network across North Africa make her well-suited for Algiers.",
    education: "Bayero University Kano (Arabic), Université d'Oran (PhD Maghreb History)",
    competence: 70, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-algeria", "amb-morocco", "amb-indonesia"],
    competencies: {
      professional: { economics: 38, diplomacy: 74, security: 40, communications: 60, legal: 52, administration: 48, technology: 35, management: 47, politics: 56 },
      personal: { loyalty: 65, charisma: 62, leadership: 55, ambition: 52, integrity: 82, resilience: 58, intrigue: 25, discretion: 65 },
    },
  },
  {
    name: "Danladi Yerima Nguru",
    state: "Yobe", zone: "NE", age: 55, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "DY",
    traits: ["Career Diplomat", "Security Specialist", "AU Veteran"],
    bio: "A career diplomat with extensive experience in North and West African postings who served on the AU Panel on Sahel Security. His Arabic fluency, security expertise, and familiarity with Algeria's role in Sahel stability give him a decisive edge.",
    education: "University of Maiduguri (History), Université d'Alger (MA International Relations), National Defence College Abuja",
    competence: 76, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-algeria", "amb-morocco", "amb-norway"],
    competencies: {
      professional: { economics: 42, diplomacy: 80, security: 75, communications: 40, legal: 55, administration: 62, technology: 35, management: 58, politics: 64 },
      personal: { loyalty: 74, charisma: 52, leadership: 68, ambition: 45, integrity: 75, resilience: 78, intrigue: 42, discretion: 70 },
    },
  },
];
