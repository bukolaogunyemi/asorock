// client/src/lib/diplomatPoolBatch2.ts
// Diplomat candidate pool — Batch 2: bilateral posts 11-20
// 50 hand-crafted candidates (5 per post) for:
// amb-japan, amb-canada, amb-netherlands, amb-spain, amb-italy,
// amb-russia, amb-turkey, amb-south-korea, amb-israel, amb-egypt

import type { DiplomatCandidate } from "./diplomatTypes";

export const DIPLOMAT_CANDIDATES_BATCH2: DiplomatCandidate[] = [
  // ═══════════════════════════════════════════
  // amb-japan — Ambassador to Japan (5)
  // ═══════════════════════════════════════════
  {
    name: "Emeka Obidigwe",
    state: "Anambra", zone: "SE", age: 56, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "EO",
    traits: ["Career Diplomat", "Trade Negotiator", "Tech Industry Ties"],
    bio: "A seasoned diplomat who spent eight years at the Nigerian embassy in Tokyo before returning to lead the Asia desk at the Ministry of Foreign Affairs. His deep understanding of Japanese business culture and technology policy has made him the leading voice on Nigeria-Japan economic cooperation.",
    education: "University of Nigeria Nsukka (Political Science), Waseda University Tokyo (MA International Relations)",
    competence: 85, languageSkills: ["None"],
    qualifiedFor: ["amb-japan", "amb-south-korea", "amb-china", "amb-india"],
    competencies: {
      professional: { economics: 72, diplomacy: 86, security: 40, communications: 50, legal: 48, administration: 65, technology: 78, management: 60, politics: 68 },
      personal: { loyalty: 65, charisma: 58, leadership: 70, ambition: 55, integrity: 80, resilience: 68, intrigue: 30, discretion: 66 },
    },
  },
  {
    name: "Obiora Nwachukwu",
    state: "Imo", zone: "SE", age: 49, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "ON",
    traits: ["Trade Negotiator", "Business Executive", "Multilingual"],
    bio: "Former managing director of a Lagos-based technology import firm with deep ties to Japanese manufacturers. He successfully negotiated several major technology transfer agreements and has cultivated relationships with JICA officials over fifteen years of business diplomacy.",
    education: "Imo State University (Economics), London School of Economics (MSc Development Economics)",
    competence: 78, languageSkills: ["French"],
    qualifiedFor: ["amb-japan", "amb-south-korea", "amb-singapore", "amb-italy"],
    competencies: {
      professional: { economics: 80, diplomacy: 72, security: 30, communications: 55, legal: 45, administration: 60, technology: 70, management: 71, politics: 74 },
      personal: { loyalty: 55, charisma: 68, leadership: 65, ambition: 72, integrity: 70, resilience: 60, intrigue: 35, discretion: 73 },
    },
  },
  {
    name: "Bala Dikko",
    state: "Kaduna", zone: "NW", age: 61, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "BD",
    traits: ["Career Diplomat", "UN Experience", "Protocol Expert"],
    bio: "A veteran of the Nigerian Foreign Service with postings across three continents, including a stint as Consul-General in Osaka. His mastery of diplomatic protocol and meticulous approach to bilateral relations earned him commendations from both Japanese and Nigerian governments.",
    education: "Ahmadu Bello University (International Studies), Fletcher School of Law and Diplomacy (MA)",
    competence: 80, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-japan", "amb-turkey", "amb-india", "amb-germany", "amb-egypt"],
    competencies: {
      professional: { economics: 50, diplomacy: 85, security: 45, communications: 40, legal: 55, administration: 72, technology: 35, management: 76, politics: 85 },
      personal: { loyalty: 75, charisma: 55, leadership: 68, ambition: 40, integrity: 82, resilience: 75, intrigue: 25, discretion: 85 },
    },
  },
  {
    name: "Oluwaseyi Adeniyi",
    state: "Oyo", zone: "SW", age: 47, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "OA",
    traits: ["Tech Industry Ties", "Academic Diplomat", "Media Savvy"],
    bio: "A former lecturer in international relations at the University of Ibadan who transitioned into diplomatic service after co-authoring Nigeria's Asia engagement strategy. His extensive academic network in Japanese universities gives him unique convening power in Tokyo.",
    education: "University of Ibadan (Political Science), University of Tokyo (PhD Comparative Politics)",
    competence: 72, languageSkills: ["None"],
    qualifiedFor: ["amb-japan", "amb-south-korea", "amb-australia"],
    competencies: {
      professional: { economics: 55, diplomacy: 75, security: 30, communications: 70, legal: 50, administration: 55, technology: 65, management: 47, politics: 55 },
      personal: { loyalty: 60, charisma: 72, leadership: 58, ambition: 65, integrity: 75, resilience: 55, intrigue: 28, discretion: 55 },
    },
  },
  {
    name: "Fatima Abubakar-Ringim",
    state: "Jigawa", zone: "NW", age: 53, gender: "Female", religion: "Islam", ethnicity: "Hausa-Fulani", avatar: "FA",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Diaspora Champion"],
    bio: "Led Nigeria's trade delegation to the Tokyo International Conference on African Development twice and negotiated critical agricultural technology partnerships with Japanese firms. Her track record on diaspora engagement has strengthened links between Nigerian professionals in Japan and the homeland.",
    education: "Bayero University Kano (Public Administration), Keio University Tokyo (MBA)",
    competence: 76, languageSkills: ["French"],
    qualifiedFor: ["amb-japan", "amb-canada", "amb-netherlands"],
    competencies: {
      professional: { economics: 70, diplomacy: 78, security: 28, communications: 45, legal: 40, administration: 68, technology: 50, management: 74, politics: 83 },
      personal: { loyalty: 70, charisma: 62, leadership: 60, ambition: 58, integrity: 72, resilience: 65, intrigue: 32, discretion: 79 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-canada — Ambassador to Canada (5)
  // ═══════════════════════════════════════════
  {
    name: "Chukwuemeka Okafor",
    state: "Enugu", zone: "SE", age: 54, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "CO",
    traits: ["Diaspora Champion", "Human Rights Advocate", "Career Diplomat"],
    bio: "Served as Nigeria's Deputy High Commissioner to Ottawa for four years and developed strong ties with Canada's large Nigerian diaspora community. His advocacy work on human rights within African multilateral frameworks has won him recognition from international civil society organizations.",
    education: "University of Nigeria Nsukka (Law), Dalhousie University (LLM International Law)",
    competence: 81, languageSkills: ["French"],
    qualifiedFor: ["amb-canada", "amb-uk", "amb-netherlands", "amb-australia"],
    competencies: {
      professional: { economics: 50, diplomacy: 82, security: 35, communications: 55, legal: 75, administration: 60, technology: 40, management: 59, politics: 64 },
      personal: { loyalty: 62, charisma: 68, leadership: 72, ambition: 50, integrity: 85, resilience: 70, intrigue: 22, discretion: 71 },
    },
  },
  {
    name: "Amina Bello-Kankia",
    state: "Katsina", zone: "NW", age: 48, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "AB",
    traits: ["Academic Diplomat", "Multilingual", "Human Rights Advocate"],
    bio: "A political scientist with dual expertise in migration studies and development policy. She spent five years at the International Organization for Migration in Geneva before joining the Foreign Service, giving her unmatched insight into diaspora dynamics critical to the Canada posting.",
    education: "Umaru Musa Yar'Adua University (Political Science), McGill University (PhD Migration Studies)",
    competence: 74, languageSkills: ["French"],
    qualifiedFor: ["amb-canada", "amb-france", "amb-belgium", "amb-switzerland"],
    competencies: {
      professional: { economics: 48, diplomacy: 76, security: 30, communications: 60, legal: 58, administration: 55, technology: 42, management: 59, politics: 66 },
      personal: { loyalty: 58, charisma: 70, leadership: 62, ambition: 60, integrity: 80, resilience: 65, intrigue: 25, discretion: 73 },
    },
  },
  {
    name: "Obinna Eze",
    state: "Ebonyi", zone: "SE", age: 59, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "OE",
    traits: ["Political Appointee", "Former Senator", "Oil Diplomacy Specialist"],
    bio: "A two-term senator who chaired the Senate Committee on Foreign Affairs and built extensive cross-party relationships. His political clout and understanding of energy diplomacy make him a heavyweight appointment, though his diplomatic finesse is sometimes questioned by career officers.",
    education: "Ebonyi State University (Economics), University of Toronto (MA Public Policy)",
    competence: 68, languageSkills: ["None"],
    qualifiedFor: ["amb-canada", "amb-usa", "amb-uk"],
    competencies: {
      professional: { economics: 65, diplomacy: 62, security: 40, communications: 70, legal: 55, administration: 50, technology: 30, management: 73, politics: 66 },
      personal: { loyalty: 55, charisma: 78, leadership: 75, ambition: 80, integrity: 50, resilience: 60, intrigue: 65, discretion: 65 },
    },
  },
  {
    name: "Nneka Udom",
    state: "Akwa Ibom", zone: "SS", age: 46, gender: "Female", religion: "Christianity", ethnicity: "Ibibio", avatar: "NU",
    traits: ["Trade Negotiator", "Diaspora Champion", "Tech Industry Ties"],
    bio: "Built her career in oil and gas trade facilitation before pivoting to diplomacy. She founded a diaspora investment network linking Nigerian professionals in Canada to opportunities in the Niger Delta, demonstrating an entrepreneurial approach to diplomatic engagement.",
    education: "University of Uyo (Petroleum Engineering), University of Alberta (MBA Energy Management)",
    competence: 73, languageSkills: ["French"],
    qualifiedFor: ["amb-canada", "amb-usa", "amb-norway", "amb-netherlands"],
    competencies: {
      professional: { economics: 75, diplomacy: 70, security: 25, communications: 50, legal: 40, administration: 58, technology: 65, management: 58, politics: 60 },
      personal: { loyalty: 60, charisma: 72, leadership: 65, ambition: 70, integrity: 68, resilience: 58, intrigue: 38, discretion: 59 },
    },
  },
  {
    name: "Garba Maidoki",
    state: "Plateau", zone: "NC", age: 57, gender: "Male", religion: "Christianity", ethnicity: "Berom", avatar: "GM",
    traits: ["Career Diplomat", "Security Specialist", "AU Veteran"],
    bio: "Rose through the ranks of the Ministry of Foreign Affairs with a specialty in peacekeeping diplomacy. His experience coordinating Nigeria's contributions to UN peacekeeping missions in Haiti and his strong connections with Canadian military officials make him a natural fit for Ottawa.",
    education: "University of Jos (History), Carleton University Ottawa (MA International Affairs)",
    competence: 77, languageSkills: ["French"],
    qualifiedFor: ["amb-canada", "amb-south-africa", "amb-ghana", "amb-kenya"],
    competencies: {
      professional: { economics: 40, diplomacy: 80, security: 72, communications: 35, legal: 50, administration: 68, technology: 30, management: 73, politics: 78 },
      personal: { loyalty: 78, charisma: 52, leadership: 70, ambition: 42, integrity: 76, resilience: 80, intrigue: 28, discretion: 82 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-netherlands — Ambassador to the Netherlands (5)
  // ═══════════════════════════════════════════
  {
    name: "Babatunde Fashola-Cole",
    state: "Lagos", zone: "SW", age: 55, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "BF",
    traits: ["Career Diplomat", "UN Experience", "Human Rights Advocate"],
    bio: "A distinguished career diplomat who served at the Nigerian embassy in The Hague and later represented Nigeria at the International Criminal Court proceedings. His deep familiarity with Dutch legal institutions and international justice mechanisms makes him exceptionally qualified for this posting.",
    education: "University of Lagos (Law), Leiden University (LLM International Criminal Law)",
    competence: 84, languageSkills: ["French"],
    qualifiedFor: ["amb-netherlands", "amb-germany", "amb-belgium", "amb-sweden"],
    competencies: {
      professional: { economics: 45, diplomacy: 85, security: 38, communications: 55, legal: 82, administration: 60, technology: 35, management: 66, politics: 73 },
      personal: { loyalty: 68, charisma: 60, leadership: 72, ambition: 52, integrity: 88, resilience: 70, intrigue: 20, discretion: 79 },
    },
  },
  {
    name: "Hauwa Suleiman",
    state: "Niger", zone: "NC", age: 50, gender: "Female", religion: "Islam", ethnicity: "Nupe", avatar: "HS",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Multilingual"],
    bio: "Spent a decade at the Nigerian Export Promotion Council before joining the Foreign Service, where she specialized in EU-Africa trade corridors. Her command of agricultural trade policy is particularly relevant for the Netherlands, Nigeria's largest European trading partner.",
    education: "Federal University of Technology Minna (Agricultural Economics), Wageningen University (MSc Agricultural Trade)",
    competence: 79, languageSkills: ["French"],
    qualifiedFor: ["amb-netherlands", "amb-germany", "amb-belgium", "amb-france"],
    competencies: {
      professional: { economics: 82, diplomacy: 76, security: 25, communications: 42, legal: 45, administration: 65, technology: 48, management: 74, politics: 81 },
      personal: { loyalty: 65, charisma: 55, leadership: 62, ambition: 58, integrity: 74, resilience: 68, intrigue: 30, discretion: 81 },
    },
  },
  {
    name: "Ike Nwosu",
    state: "Abia", zone: "SE", age: 63, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "IN",
    traits: ["Business Executive", "Oil Diplomacy Specialist", "Political Appointee"],
    bio: "A retired Shell Nigeria executive who oversaw Dutch-Nigerian joint ventures for over two decades. His intimate knowledge of Royal Dutch Shell's operations and relationships with Dutch business elites provide unmatched leverage for energy diplomacy at The Hague.",
    education: "Abia State University (Chemical Engineering), Erasmus University Rotterdam (MBA)",
    competence: 75, languageSkills: ["None"],
    qualifiedFor: ["amb-netherlands", "amb-uk", "amb-norway"],
    competencies: {
      professional: { economics: 78, diplomacy: 65, security: 28, communications: 50, legal: 42, administration: 70, technology: 55, management: 74, politics: 71 },
      personal: { loyalty: 50, charisma: 68, leadership: 72, ambition: 75, integrity: 58, resilience: 62, intrigue: 48, discretion: 63 },
    },
  },
  {
    name: "Zainab Mohammed-Lawal",
    state: "Kwara", zone: "NC", age: 45, gender: "Female", religion: "Islam", ethnicity: "Yoruba", avatar: "ZM",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Media Savvy"],
    bio: "A former lecturer in international law at the University of Ilorin who was seconded to the International Court of Justice as a research fellow. Her published scholarship on the intersection of African customary law and international legal norms has given her a formidable reputation in The Hague.",
    education: "University of Ilorin (Law), University of Amsterdam (PhD International Law)",
    competence: 71, languageSkills: ["French"],
    qualifiedFor: ["amb-netherlands", "amb-italy", "amb-spain"],
    competencies: {
      professional: { economics: 40, diplomacy: 74, security: 25, communications: 65, legal: 80, administration: 50, technology: 38, management: 49, politics: 57 },
      personal: { loyalty: 55, charisma: 70, leadership: 58, ambition: 68, integrity: 82, resilience: 55, intrigue: 22, discretion: 64 },
    },
  },
  {
    name: "Etim Bassey",
    state: "Cross River", zone: "SS", age: 52, gender: "Male", religion: "Christianity", ethnicity: "Efik", avatar: "EB",
    traits: ["Career Diplomat", "Protocol Expert", "Cultural Ambassador"],
    bio: "A polished career diplomat whose cultural programming at Nigerian missions across Europe won multiple awards from the Foreign Service. His talent for building bridges through cultural exchange and his smooth handling of diplomatic protocol make him an excellent fit for the ceremonial demands of The Hague.",
    education: "University of Calabar (Theatre Arts & International Relations), Sciences Po Paris (MA European Affairs)",
    competence: 70, languageSkills: ["French"],
    qualifiedFor: ["amb-netherlands", "amb-italy", "amb-canada", "amb-sweden"],
    competencies: {
      professional: { economics: 38, diplomacy: 78, security: 22, communications: 68, legal: 40, administration: 62, technology: 30, management: 66, politics: 77 },
      personal: { loyalty: 72, charisma: 75, leadership: 55, ambition: 45, integrity: 70, resilience: 58, intrigue: 35, discretion: 71 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-spain — Ambassador to Spain (5) — Spanish required
  // ═══════════════════════════════════════════
  {
    name: "Olumide Akinyemi",
    state: "Osun", zone: "SW", age: 58, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "OK",
    traits: ["Career Diplomat", "Multilingual", "Trade Negotiator"],
    bio: "Served as Nigeria's Consul-General in Madrid for three years and is fluent in both Spanish and Portuguese. His extensive network in the Spanish business community and deep understanding of EU agricultural subsidies impacting Nigerian exports make him the leading candidate for the Madrid posting.",
    education: "Obafemi Awolowo University (Economics), Universidad Complutense de Madrid (MA European Studies)",
    competence: 83, languageSkills: ["Spanish", "Portuguese", "French"],
    qualifiedFor: ["amb-spain", "amb-italy", "amb-brazil", "amb-netherlands"],
    competencies: {
      professional: { economics: 70, diplomacy: 84, security: 30, communications: 48, legal: 50, administration: 65, technology: 35, management: 78, politics: 85 },
      personal: { loyalty: 68, charisma: 65, leadership: 70, ambition: 50, integrity: 78, resilience: 72, intrigue: 28, discretion: 85 },
    },
  },
  {
    name: "Chioma Igwe",
    state: "Delta", zone: "SS", age: 47, gender: "Female", religion: "Christianity", ethnicity: "Urhobo", avatar: "CI",
    traits: ["Multilingual", "Cultural Ambassador", "Diaspora Champion"],
    bio: "Grew up in a diplomatic household — her father served as ambassador to two Latin American countries. She studied in Barcelona and is fluent in Spanish. Her work connecting Nigerian diaspora communities across Spain and her cultural exchange initiatives have earned her praise from both governments.",
    education: "Delta State University (Mass Communication), Universitat de Barcelona (MA Cultural Studies)",
    competence: 74, languageSkills: ["Spanish", "French"],
    qualifiedFor: ["amb-spain", "amb-italy", "amb-brazil"],
    competencies: {
      professional: { economics: 45, diplomacy: 76, security: 20, communications: 72, legal: 35, administration: 55, technology: 40, management: 60, politics: 69 },
      personal: { loyalty: 60, charisma: 80, leadership: 58, ambition: 62, integrity: 72, resilience: 55, intrigue: 30, discretion: 67 },
    },
  },
  {
    name: "Mustapha Abubakar",
    state: "Adamawa", zone: "NE", age: 55, gender: "Male", religion: "Islam", ethnicity: "Fulani", avatar: "MA",
    traits: ["Career Diplomat", "Multilingual", "Security Specialist"],
    bio: "A career diplomat who learned Spanish during a five-year posting to the Nigerian embassy in Mexico City. He later served on the UN Security Council support team in New York. His combination of Spanish fluency and security expertise is rare in the Nigerian diplomatic corps.",
    education: "University of Maiduguri (Political Science), UNAM Mexico City (MA Latin American Studies)",
    competence: 77, languageSkills: ["Spanish", "French", "Arabic"],
    qualifiedFor: ["amb-spain", "amb-brazil", "amb-turkey", "amb-egypt"],
    competencies: {
      professional: { economics: 42, diplomacy: 80, security: 68, communications: 35, legal: 45, administration: 60, technology: 28, management: 54, politics: 61 },
      personal: { loyalty: 72, charisma: 55, leadership: 65, ambition: 48, integrity: 75, resilience: 78, intrigue: 35, discretion: 68 },
    },
  },
  {
    name: "Nonso Okonkwo",
    state: "Anambra", zone: "SE", age: 51, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "NK",
    traits: ["Trade Negotiator", "Multilingual", "Business Executive"],
    bio: "Built a successful import-export business connecting West African commodities with Spanish and Portuguese markets before entering public service. His Spanish fluency and commercial networks across the Iberian Peninsula provide a strong foundation for trade-focused diplomatic work.",
    education: "Nnamdi Azikiwe University (Business Administration), IE Business School Madrid (MBA)",
    competence: 72, languageSkills: ["Spanish", "Portuguese"],
    qualifiedFor: ["amb-spain", "amb-italy", "amb-netherlands", "amb-brazil"],
    competencies: {
      professional: { economics: 80, diplomacy: 68, security: 22, communications: 50, legal: 40, administration: 62, technology: 48, management: 74, politics: 75 },
      personal: { loyalty: 52, charisma: 70, leadership: 65, ambition: 75, integrity: 65, resilience: 58, intrigue: 40, discretion: 72 },
    },
  },
  {
    name: "Ibrahim Musa Giade",
    state: "Bauchi", zone: "NE", age: 60, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "IM",
    traits: ["Political Appointee", "Multilingual", "AU Veteran"],
    bio: "A former state commissioner for information who learned Spanish while pursuing graduate studies in international relations. His AU experience on cultural exchange programs between Africa and Europe, combined with his political connections, make him a viable if unconventional choice for Madrid.",
    education: "Abubakar Tafawa Balewa University (Public Administration), Universidad de Salamanca (MA International Relations)",
    competence: 66, languageSkills: ["Spanish", "Arabic"],
    qualifiedFor: ["amb-spain", "amb-turkey", "amb-egypt"],
    competencies: {
      professional: { economics: 45, diplomacy: 70, security: 35, communications: 65, legal: 38, administration: 58, technology: 25, management: 55, politics: 60 },
      personal: { loyalty: 70, charisma: 68, leadership: 60, ambition: 62, integrity: 60, resilience: 65, intrigue: 45, discretion: 59 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-italy — Ambassador to Italy (5)
  // ═══════════════════════════════════════════
  {
    name: "Ngozi Onyemelukwe",
    state: "Enugu", zone: "SE", age: 52, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "NO",
    traits: ["Career Diplomat", "Multilingual", "UN Experience"],
    bio: "Spent six years at Nigeria's Permanent Mission to the UN Food and Agriculture Organization in Rome, where she became the go-to diplomat for food security negotiations. Her fluency in Italian and French and her deep relationships with FAO leadership make her an outstanding candidate for the Rome embassy.",
    education: "University of Nigeria Nsukka (Agricultural Economics), LUISS University Rome (MA International Relations)",
    competence: 86, languageSkills: ["French"],
    qualifiedFor: ["amb-italy", "amb-netherlands", "amb-spain", "amb-germany"],
    competencies: {
      professional: { economics: 68, diplomacy: 88, security: 30, communications: 50, legal: 52, administration: 65, technology: 38, management: 61, politics: 69 },
      personal: { loyalty: 65, charisma: 62, leadership: 72, ambition: 55, integrity: 80, resilience: 70, intrigue: 25, discretion: 67 },
    },
  },
  {
    name: "Aliyu Gwarzo",
    state: "Kano", zone: "NW", age: 62, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "AG",
    traits: ["Political Appointee", "Former Governor", "Trade Negotiator"],
    bio: "A former deputy governor of Kano State who pivoted to international engagement after his political career. His extensive business connections with Italian textile and leather goods importers in Kano provide a unique commercial angle to the Rome appointment.",
    education: "Bayero University Kano (Economics), Bocconi University Milan (Executive MBA)",
    competence: 69, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-italy", "amb-turkey", "amb-spain"],
    competencies: {
      professional: { economics: 72, diplomacy: 65, security: 32, communications: 60, legal: 40, administration: 70, technology: 30, management: 70, politics: 64 },
      personal: { loyalty: 58, charisma: 75, leadership: 78, ambition: 80, integrity: 52, resilience: 62, intrigue: 55, discretion: 53 },
    },
  },
  {
    name: "Adekunle Badmus",
    state: "Ogun", zone: "SW", age: 48, gender: "Male", religion: "Islam", ethnicity: "Yoruba", avatar: "AB",
    traits: ["Cultural Ambassador", "Media Savvy", "Diaspora Champion"],
    bio: "A former Nollywood producer turned diplomat who recognized the power of cultural soft power in international relations. His work promoting Nigerian cinema and music festivals across Italy has built significant goodwill and media connections that could enhance Nigeria's brand in Southern Europe.",
    education: "Federal University of Agriculture Abeokuta (Mass Communication), University of Bologna (MA Media Studies)",
    competence: 65, languageSkills: ["French"],
    qualifiedFor: ["amb-italy", "amb-spain", "amb-canada"],
    competencies: {
      professional: { economics: 38, diplomacy: 68, security: 18, communications: 85, legal: 30, administration: 48, technology: 52, management: 59, politics: 65 },
      personal: { loyalty: 50, charisma: 82, leadership: 55, ambition: 72, integrity: 58, resilience: 50, intrigue: 45, discretion: 61 },
    },
  },
  {
    name: "Uduak Etuk",
    state: "Akwa Ibom", zone: "SS", age: 55, gender: "Female", religion: "Christianity", ethnicity: "Ibibio", avatar: "UE",
    traits: ["Career Diplomat", "Protocol Expert", "Oil Diplomacy Specialist"],
    bio: "A career diplomat with fifteen years of European postings, including stints in Brussels and Vienna. Her expertise in energy diplomacy is especially relevant given ENI's significant operations in Nigeria. She is regarded as one of the most meticulous protocol officers in the Foreign Service.",
    education: "University of Uyo (International Relations), Sapienza University of Rome (MA European Governance)",
    competence: 78, languageSkills: ["French"],
    qualifiedFor: ["amb-italy", "amb-netherlands", "amb-belgium", "amb-germany"],
    competencies: {
      professional: { economics: 60, diplomacy: 82, security: 35, communications: 42, legal: 48, administration: 75, technology: 32, management: 62, politics: 71 },
      personal: { loyalty: 75, charisma: 55, leadership: 65, ambition: 45, integrity: 78, resilience: 72, intrigue: 22, discretion: 67 },
    },
  },
  {
    name: "Yakubu Ladan",
    state: "Nasarawa", zone: "NC", age: 50, gender: "Male", religion: "Islam", ethnicity: "Eggon", avatar: "YL",
    traits: ["Trade Negotiator", "Academic Diplomat", "Multilingual"],
    bio: "An economist who spent years at the Nigerian Institute of International Affairs researching EU trade policy before joining the diplomatic service. His academic publications on Italy-Africa trade corridors have been cited by EU policymakers, giving him credibility in Rome.",
    education: "Nasarawa State University (Economics), University of Florence (PhD International Economics)",
    competence: 73, languageSkills: ["French"],
    qualifiedFor: ["amb-italy", "amb-japan", "amb-netherlands"],
    competencies: {
      professional: { economics: 78, diplomacy: 74, security: 25, communications: 48, legal: 42, administration: 55, technology: 40, management: 48, politics: 58 },
      personal: { loyalty: 62, charisma: 58, leadership: 55, ambition: 60, integrity: 74, resilience: 60, intrigue: 28, discretion: 60 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-russia — Ambassador to Russia (5) — Russian required
  // ═══════════════════════════════════════════
  {
    name: "Victor Ndoma-Egba",
    state: "Cross River", zone: "SS", age: 60, gender: "Male", religion: "Christianity", ethnicity: "Ejagham", avatar: "VN",
    traits: ["Career Diplomat", "Multilingual", "Security Specialist"],
    bio: "One of the few Nigerian diplomats fluent in Russian, having studied at the Moscow State Institute of International Relations during the Cold War era. He served two tours at the Nigerian embassy in Moscow and understands the nuances of Russian diplomatic culture like no other candidate in the pool.",
    education: "University of Calabar (Political Science), Moscow State Institute of International Relations (MA International Relations)",
    competence: 88, languageSkills: ["Russian", "French"],
    qualifiedFor: ["amb-russia", "amb-turkey", "amb-germany", "amb-israel"],
    competencies: {
      professional: { economics: 48, diplomacy: 90, security: 72, communications: 40, legal: 55, administration: 68, technology: 35, management: 78, politics: 85 },
      personal: { loyalty: 70, charisma: 58, leadership: 75, ambition: 52, integrity: 75, resilience: 85, intrigue: 45, discretion: 86 },
    },
  },
  {
    name: "Aisha Danjuma",
    state: "Taraba", zone: "NE", age: 49, gender: "Female", religion: "Islam", ethnicity: "Mumuye", avatar: "AD",
    traits: ["Multilingual", "Academic Diplomat", "Intelligence Background"],
    bio: "A rare talent who studied Russian at the University of Maiduguri before earning a scholarship to Saint Petersburg State University. Her intelligence background and deep understanding of Russian geopolitics make her a strategic asset, though her relatively junior diplomatic experience is a consideration.",
    education: "University of Maiduguri (Russian Studies), Saint Petersburg State University (MA Eurasian Politics)",
    competence: 76, languageSkills: ["Russian", "French", "Arabic"],
    qualifiedFor: ["amb-russia", "amb-turkey", "amb-egypt"],
    competencies: {
      professional: { economics: 40, diplomacy: 78, security: 65, communications: 38, legal: 42, administration: 50, technology: 35, management: 48, politics: 58 },
      personal: { loyalty: 68, charisma: 52, leadership: 58, ambition: 65, integrity: 70, resilience: 72, intrigue: 55, discretion: 65 },
    },
  },
  {
    name: "Ifeanyi Okoro",
    state: "Delta", zone: "SS", age: 56, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "IO",
    traits: ["Multilingual", "Oil Diplomacy Specialist", "Trade Negotiator"],
    bio: "An oil industry veteran who spent years negotiating joint ventures between Nigerian and Russian petroleum companies. He learned Russian on the job and has cultivated relationships across Russia's energy sector. His commercial instincts and language skills make him a strong contender for Moscow.",
    education: "Federal University of Petroleum Technology Effurun (Petroleum Engineering), Gubkin Russian State University of Oil and Gas (MSc Energy Economics)",
    competence: 74, languageSkills: ["Russian"],
    qualifiedFor: ["amb-russia", "amb-norway", "amb-canada"],
    competencies: {
      professional: { economics: 75, diplomacy: 70, security: 38, communications: 35, legal: 40, administration: 60, technology: 55, management: 56, politics: 58 },
      personal: { loyalty: 55, charisma: 60, leadership: 65, ambition: 72, integrity: 62, resilience: 68, intrigue: 42, discretion: 58 },
    },
  },
  {
    name: "Sadiq Abdulrahman",
    state: "Sokoto", zone: "NW", age: 64, gender: "Male", religion: "Islam", ethnicity: "Fulani", avatar: "SA",
    traits: ["Career Diplomat", "Multilingual", "AU Veteran"],
    bio: "A veteran diplomat who served in Moscow during the 1990s transition period and witnessed the fall of the Soviet Union firsthand. His Russian fluency and deep understanding of post-Soviet politics are complemented by years of AU experience working on Africa-Russia cooperation frameworks.",
    education: "Usman Dan Fodio University Sokoto (History), Peoples' Friendship University Moscow (MA Political Science)",
    competence: 80, languageSkills: ["Russian", "Arabic", "French"],
    qualifiedFor: ["amb-russia", "amb-turkey", "amb-egypt", "amb-saudi"],
    competencies: {
      professional: { economics: 42, diplomacy: 84, security: 58, communications: 38, legal: 48, administration: 65, technology: 25, management: 69, politics: 76 },
      personal: { loyalty: 78, charisma: 50, leadership: 70, ambition: 40, integrity: 80, resilience: 82, intrigue: 38, discretion: 82 },
    },
  },
  {
    name: "Funmilayo Adebisi",
    state: "Ekiti", zone: "SW", age: 46, gender: "Female", religion: "Christianity", ethnicity: "Yoruba", avatar: "FD",
    traits: ["Multilingual", "Tech Industry Ties", "Media Savvy"],
    bio: "A journalist-turned-diplomat who covered Russia and Eastern Europe for a major Nigerian media house before joining the Foreign Service. She learned Russian as a correspondent in Moscow and later helped negotiate technology transfer agreements. Her media savvy is an asset in managing Nigeria's image in a challenging diplomatic environment.",
    education: "Ekiti State University (Mass Communication), Lomonosov Moscow State University (MA Journalism & International Relations)",
    competence: 70, languageSkills: ["Russian", "French"],
    qualifiedFor: ["amb-russia", "amb-israel", "amb-turkey"],
    competencies: {
      professional: { economics: 45, diplomacy: 72, security: 42, communications: 80, legal: 35, administration: 50, technology: 58, management: 53, politics: 61 },
      personal: { loyalty: 55, charisma: 75, leadership: 55, ambition: 68, integrity: 65, resilience: 62, intrigue: 48, discretion: 64 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-turkey — Ambassador to Turkey (5)
  // ═══════════════════════════════════════════
  {
    name: "Mohammed Sani Baba",
    state: "Borno", zone: "NE", age: 57, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "MS",
    traits: ["Career Diplomat", "Security Specialist", "Multilingual"],
    bio: "A career diplomat with deep expertise in Turkey-Nigeria security cooperation, particularly on counter-terrorism intelligence sharing. His years of experience navigating Ankara's complex political landscape and his cultural affinity with Turkish diplomatic traditions make him exceptionally well-suited for this posting.",
    education: "University of Maiduguri (Political Science), Ankara University (MA Security Studies)",
    competence: 82, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-turkey", "amb-egypt", "amb-saudi", "amb-israel"],
    competencies: {
      professional: { economics: 40, diplomacy: 84, security: 78, communications: 35, legal: 45, administration: 62, technology: 30, management: 65, politics: 71 },
      personal: { loyalty: 75, charisma: 55, leadership: 72, ambition: 48, integrity: 78, resilience: 80, intrigue: 40, discretion: 77 },
    },
  },
  {
    name: "Folake Ogunbiyi",
    state: "Lagos", zone: "SW", age: 48, gender: "Female", religion: "Christianity", ethnicity: "Yoruba", avatar: "FO",
    traits: ["Trade Negotiator", "Business Executive", "Media Savvy"],
    bio: "A former senior executive at Turkish Airlines' West Africa operations who pivoted to trade diplomacy. Her commercial instincts and extensive network of Turkish business contacts position her to unlock the growing economic relationship between Nigeria and Turkey, especially in construction and consumer goods.",
    education: "University of Lagos (Business Administration), Istanbul Technical University (MBA)",
    competence: 75, languageSkills: ["French"],
    qualifiedFor: ["amb-turkey", "amb-italy", "amb-south-korea", "amb-spain"],
    competencies: {
      professional: { economics: 78, diplomacy: 72, security: 25, communications: 68, legal: 38, administration: 60, technology: 45, management: 68, politics: 71 },
      personal: { loyalty: 52, charisma: 78, leadership: 65, ambition: 75, integrity: 62, resilience: 58, intrigue: 38, discretion: 65 },
    },
  },
  {
    name: "Abdullahi Bichi",
    state: "Kano", zone: "NW", age: 53, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "AH",
    traits: ["Intelligence Background", "Career Diplomat", "Security Specialist"],
    bio: "Served in the National Intelligence Agency's foreign operations directorate with a focus on Middle Eastern and Central Asian affairs. His deep understanding of Turkey's strategic calculations in the Muslim world and his intelligence contacts provide a unique dimension to diplomatic engagement in Ankara.",
    education: "Bayero University Kano (Political Science), Middle East Technical University Ankara (MA International Relations)",
    competence: 79, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-turkey", "amb-egypt", "amb-israel", "amb-saudi"],
    competencies: {
      professional: { economics: 35, diplomacy: 78, security: 82, communications: 30, legal: 42, administration: 58, technology: 35, management: 59, politics: 64 },
      personal: { loyalty: 80, charisma: 48, leadership: 68, ambition: 55, integrity: 65, resilience: 78, intrigue: 70, discretion: 68 },
    },
  },
  {
    name: "Grace Tyoden",
    state: "Plateau", zone: "NC", age: 51, gender: "Female", religion: "Christianity", ethnicity: "Berom", avatar: "GT",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Cultural Ambassador"],
    bio: "An academic who specializes in Christian-Muslim dialogue and intercultural diplomacy. Her research on Turkey's role as a bridge between East and West has been widely cited. She brings a thoughtful, culturally sensitive approach to a posting that requires navigating complex religious and geopolitical dynamics.",
    education: "University of Jos (Religious Studies), Bogazici University Istanbul (PhD Political Science)",
    competence: 68, languageSkills: ["French"],
    qualifiedFor: ["amb-turkey", "amb-israel", "amb-south-korea"],
    competencies: {
      professional: { economics: 35, diplomacy: 74, security: 30, communications: 60, legal: 45, administration: 50, technology: 28, management: 51, politics: 59 },
      personal: { loyalty: 65, charisma: 72, leadership: 58, ambition: 42, integrity: 85, resilience: 62, intrigue: 18, discretion: 71 },
    },
  },
  {
    name: "Tijjani Musa Ashiru",
    state: "Zamfara", zone: "NW", age: 59, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "TM",
    traits: ["Political Appointee", "Former Senator", "Trade Negotiator"],
    bio: "A former member of the House of Representatives who chaired the Committee on Foreign Affairs and developed strong personal relationships with Turkish parliamentarians through the Turkey-Nigeria Parliamentary Friendship Group. His political weight and trade connections make him a high-profile if political appointment.",
    education: "Federal University Gusau (Public Administration), Bilkent University Ankara (MA Political Economy)",
    competence: 67, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-turkey", "amb-egypt", "amb-japan"],
    competencies: {
      professional: { economics: 60, diplomacy: 68, security: 38, communications: 62, legal: 48, administration: 55, technology: 25, management: 71, politics: 70 },
      personal: { loyalty: 60, charisma: 72, leadership: 70, ambition: 78, integrity: 55, resilience: 58, intrigue: 52, discretion: 65 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-south-korea — Ambassador to South Korea (5)
  // ═══════════════════════════════════════════
  {
    name: "Chidi Amaechi",
    state: "Rivers", zone: "SS", age: 50, gender: "Male", religion: "Christianity", ethnicity: "Ikwerre", avatar: "CA",
    traits: ["Trade Negotiator", "Tech Industry Ties", "Career Diplomat"],
    bio: "Spearheaded Nigeria's participation in the Korea-Africa Economic Cooperation initiative and negotiated major technology partnership agreements with Samsung and Hyundai on behalf of the Nigerian government. His firsthand experience with Korean corporate culture and trade practices is unmatched in the diplomatic service.",
    education: "University of Port Harcourt (Economics), Seoul National University (MA International Commerce)",
    competence: 82, languageSkills: ["None"],
    qualifiedFor: ["amb-south-korea", "amb-japan", "amb-china", "amb-singapore"],
    competencies: {
      professional: { economics: 78, diplomacy: 80, security: 30, communications: 45, legal: 42, administration: 65, technology: 75, management: 74, politics: 80 },
      personal: { loyalty: 62, charisma: 60, leadership: 68, ambition: 65, integrity: 72, resilience: 70, intrigue: 30, discretion: 78 },
    },
  },
  {
    name: "Amara Kalu",
    state: "Abia", zone: "SE", age: 46, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "AK",
    traits: ["Tech Industry Ties", "Business Executive", "Diaspora Champion"],
    bio: "Founded a successful tech startup incubator in Lagos with Korean investment backing and has facilitated dozens of Korean-Nigerian business partnerships. Her entrepreneurial energy and tech sector connections position her to deepen the rapidly growing technology corridor between Nigeria and South Korea.",
    education: "Abia State University (Computer Science), KAIST Korea (MSc Technology Management)",
    competence: 73, languageSkills: ["None"],
    qualifiedFor: ["amb-south-korea", "amb-japan", "amb-singapore"],
    competencies: {
      professional: { economics: 70, diplomacy: 65, security: 20, communications: 60, legal: 35, administration: 55, technology: 85, management: 57, politics: 58 },
      personal: { loyalty: 50, charisma: 72, leadership: 62, ambition: 80, integrity: 65, resilience: 55, intrigue: 35, discretion: 58 },
    },
  },
  {
    name: "Haruna Danbatta",
    state: "Bauchi", zone: "NE", age: 58, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "HD",
    traits: ["Career Diplomat", "UN Experience", "Protocol Expert"],
    bio: "A senior career diplomat who served as Nigeria's representative to the UN Economic and Social Commission for Asia and the Pacific in Bangkok. His deep knowledge of Asian multilateral frameworks and his reputation for flawless diplomatic protocol make him a strong candidate for Seoul.",
    education: "Abubakar Tafawa Balewa University (International Relations), Korea University Seoul (MA Asian Studies)",
    competence: 78, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-south-korea", "amb-japan", "amb-india", "amb-indonesia"],
    competencies: {
      professional: { economics: 52, diplomacy: 82, security: 38, communications: 40, legal: 50, administration: 72, technology: 40, management: 69, politics: 77 },
      personal: { loyalty: 75, charisma: 52, leadership: 65, ambition: 40, integrity: 80, resilience: 72, intrigue: 22, discretion: 76 },
    },
  },
  {
    name: "Chinedu Ezekwesili",
    state: "Anambra", zone: "SE", age: 44, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "CE",
    traits: ["Academic Diplomat", "Multilingual", "Human Rights Advocate"],
    bio: "A young scholar-diplomat whose doctoral research on Korean development models applicable to Nigeria caught the attention of the presidential advisory team. His fresh perspective and academic rigor offer a different approach to the South Korea posting, though he lacks extensive field experience.",
    education: "Nnamdi Azikiwe University (Political Science), Yonsei University Seoul (PhD Development Studies)",
    competence: 67, languageSkills: ["French"],
    qualifiedFor: ["amb-south-korea", "amb-japan", "amb-australia"],
    competencies: {
      professional: { economics: 65, diplomacy: 70, security: 22, communications: 55, legal: 45, administration: 48, technology: 58, management: 42, politics: 52 },
      personal: { loyalty: 58, charisma: 65, leadership: 50, ambition: 72, integrity: 78, resilience: 52, intrigue: 20, discretion: 58 },
    },
  },
  {
    name: "Kabiru Mashi",
    state: "Katsina", zone: "NW", age: 53, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "KM",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Career Diplomat"],
    bio: "Led Nigeria's trade mission to Seoul three times and was instrumental in securing Korean investment in Nigeria's Lekki Free Trade Zone. His combination of ECOWAS trade negotiation experience and Korean business relationships makes him effective at translating regional trade expertise into bilateral gains.",
    education: "Umaru Musa Yar'Adua University (Economics), Sungkyunkwan University Seoul (MBA International Business)",
    competence: 76, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-south-korea", "amb-japan", "amb-turkey", "amb-malaysia"],
    competencies: {
      professional: { economics: 75, diplomacy: 76, security: 28, communications: 42, legal: 40, administration: 62, technology: 50, management: 54, politics: 61 },
      personal: { loyalty: 65, charisma: 58, leadership: 62, ambition: 60, integrity: 70, resilience: 65, intrigue: 32, discretion: 60 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-israel — Ambassador to Israel (5)
  // ═══════════════════════════════════════════
  {
    name: "Tunde Olashore",
    state: "Osun", zone: "SW", age: 61, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "TO",
    traits: ["Career Diplomat", "Security Specialist", "Intelligence Background"],
    bio: "A senior diplomat with extensive Middle East experience who served as Deputy Ambassador to Egypt and later as special envoy to Israel during a period of diplomatic normalization. His intelligence background and security expertise are critical for navigating the complexities of the Israel posting.",
    education: "Obafemi Awolowo University (International Relations), Hebrew University of Jerusalem (MA Middle Eastern Studies)",
    competence: 85, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-israel", "amb-egypt", "amb-turkey", "amb-saudi"],
    competencies: {
      professional: { economics: 42, diplomacy: 86, security: 75, communications: 45, legal: 55, administration: 62, technology: 40, management: 65, politics: 72 },
      personal: { loyalty: 70, charisma: 58, leadership: 72, ambition: 50, integrity: 75, resilience: 80, intrigue: 48, discretion: 76 },
    },
  },
  {
    name: "Asabe Audu",
    state: "Kogi", zone: "NC", age: 47, gender: "Female", religion: "Christianity", ethnicity: "Igala", avatar: "AA",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Media Savvy"],
    bio: "A conflict resolution specialist who earned her doctorate researching the Israeli-Palestinian peace process. Her nuanced understanding of Middle Eastern politics and her reputation as an honest broker in difficult negotiations make her an intellectually strong choice, though she has limited embassy experience.",
    education: "Kogi State University (Political Science), Tel Aviv University (PhD Conflict Resolution)",
    competence: 72, languageSkills: ["French"],
    qualifiedFor: ["amb-israel", "amb-turkey", "amb-south-africa"],
    competencies: {
      professional: { economics: 38, diplomacy: 76, security: 45, communications: 68, legal: 55, administration: 48, technology: 32, management: 47, politics: 56 },
      personal: { loyalty: 60, charisma: 70, leadership: 58, ambition: 55, integrity: 85, resilience: 62, intrigue: 22, discretion: 68 },
    },
  },
  {
    name: "Emmanuel Ogbechie",
    state: "Edo", zone: "SS", age: 54, gender: "Male", religion: "Christianity", ethnicity: "Bini", avatar: "EG",
    traits: ["Trade Negotiator", "Tech Industry Ties", "Business Executive"],
    bio: "An agricultural technology executive who built extensive business relationships with Israeli agritech companies and facilitated their entry into Nigerian markets. His commercial focus and understanding of Israel's technology ecosystem could strengthen the trade dimension of this diplomatically sensitive posting.",
    education: "University of Benin (Agricultural Science), Technion Israel Institute of Technology (MSc Agricultural Engineering)",
    competence: 71, languageSkills: ["None"],
    qualifiedFor: ["amb-israel", "amb-south-korea", "amb-india"],
    competencies: {
      professional: { economics: 72, diplomacy: 66, security: 30, communications: 48, legal: 35, administration: 58, technology: 78, management: 53, politics: 56 },
      personal: { loyalty: 55, charisma: 62, leadership: 60, ambition: 70, integrity: 65, resilience: 55, intrigue: 35, discretion: 54 },
    },
  },
  {
    name: "Hajiya Safiya Ibrahim",
    state: "Gombe", zone: "NE", age: 52, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "HI",
    traits: ["Career Diplomat", "Multilingual", "Protocol Expert"],
    bio: "A career diplomat who served across multiple Middle Eastern postings including Riyadh and Cairo. Her ability to navigate the delicate balance between Nigeria's large Muslim population and diplomatic relations with Israel has been tested and proven in previous sensitive assignments.",
    education: "University of Maiduguri (Arabic Studies), Ben-Gurion University (MA Middle East Politics)",
    competence: 77, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-israel", "amb-egypt", "amb-turkey", "amb-saudi"],
    competencies: {
      professional: { economics: 40, diplomacy: 82, security: 48, communications: 38, legal: 50, administration: 68, technology: 28, management: 69, politics: 79 },
      personal: { loyalty: 72, charisma: 55, leadership: 62, ambition: 45, integrity: 78, resilience: 75, intrigue: 35, discretion: 81 },
    },
  },
  {
    name: "Samuel Oguche",
    state: "Benue", zone: "NC", age: 57, gender: "Male", religion: "Christianity", ethnicity: "Idoma", avatar: "SO",
    traits: ["Security Specialist", "Career Diplomat", "UN Experience"],
    bio: "A veteran peacekeeping diplomat who coordinated Nigeria's contributions to UNIFIL in Lebanon and later served as a security affairs officer at the Nigerian embassy in Amman. His regional security experience and understanding of the complex dynamics around Israel make him a safe, experienced choice.",
    education: "Benue State University (History), University of Haifa (MA National Security Studies)",
    competence: 79, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-israel", "amb-egypt", "amb-turkey"],
    competencies: {
      professional: { economics: 35, diplomacy: 80, security: 78, communications: 32, legal: 48, administration: 65, technology: 25, management: 69, politics: 74 },
      personal: { loyalty: 78, charisma: 48, leadership: 70, ambition: 42, integrity: 76, resilience: 82, intrigue: 38, discretion: 80 },
    },
  },

  // ═══════════════════════════════════════════
  // amb-egypt — Ambassador to Egypt (5) — Arabic required
  // ═══════════════════════════════════════════
  {
    name: "Abubakar Shehu Tambuwal",
    state: "Sokoto", zone: "NW", age: 55, gender: "Male", religion: "Islam", ethnicity: "Fulani", avatar: "AT",
    traits: ["Career Diplomat", "Multilingual", "AU Veteran"],
    bio: "A distinguished diplomat who served for six years at the Nigerian embassy in Cairo and is fluent in Arabic and French. His intimate knowledge of Egyptian politics, deep ties with the Arab League, and African Union experience make him the most qualified candidate for this strategically important North African posting.",
    education: "Usman Dan Fodio University Sokoto (Arabic & Islamic Studies), Cairo University (MA Political Science)",
    competence: 87, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-egypt", "amb-saudi", "amb-morocco", "amb-turkey", "amb-algeria"],
    competencies: {
      professional: { economics: 48, diplomacy: 90, security: 55, communications: 42, legal: 52, administration: 68, technology: 28, management: 73, politics: 80 },
      personal: { loyalty: 72, charisma: 62, leadership: 75, ambition: 50, integrity: 82, resilience: 78, intrigue: 30, discretion: 81 },
    },
  },
  {
    name: "Maryam Idris",
    state: "Kebbi", zone: "NW", age: 48, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "MI",
    traits: ["Academic Diplomat", "Multilingual", "Human Rights Advocate"],
    bio: "An Arabic scholar who taught at Usman Dan Fodio University before joining the Foreign Service. Her fluency in Arabic and research on Egyptian-Nigerian educational exchanges have positioned her as a bridge between the two countries' academic communities. She advocates strongly for women's rights within diplomatic frameworks.",
    education: "Usman Dan Fodio University Sokoto (Arabic), American University in Cairo (MA Middle East Studies)",
    competence: 73, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-egypt", "amb-morocco", "amb-saudi"],
    competencies: {
      professional: { economics: 40, diplomacy: 76, security: 28, communications: 55, legal: 48, administration: 52, technology: 30, management: 64, politics: 74 },
      personal: { loyalty: 60, charisma: 68, leadership: 55, ambition: 58, integrity: 82, resilience: 60, intrigue: 20, discretion: 81 },
    },
  },
  {
    name: "Dauda Lawal",
    state: "Yobe", zone: "NE", age: 62, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "DL",
    traits: ["Political Appointee", "Multilingual", "Oil Diplomacy Specialist"],
    bio: "A former minister of state for petroleum who cultivated strong relationships with Egyptian energy officials during OPEC negotiations. His Arabic fluency and understanding of Nile Basin politics add depth to his energy-focused diplomatic profile, though his partisan reputation may complicate some multilateral engagements.",
    education: "University of Maiduguri (Geology), Alexandria University (MSc Petroleum Geoscience)",
    competence: 70, languageSkills: ["Arabic"],
    qualifiedFor: ["amb-egypt", "amb-saudi", "amb-algeria", "amb-uae"],
    competencies: {
      professional: { economics: 72, diplomacy: 68, security: 35, communications: 55, legal: 40, administration: 58, technology: 35, management: 53, politics: 53 },
      personal: { loyalty: 65, charisma: 70, leadership: 68, ambition: 78, integrity: 52, resilience: 60, intrigue: 55, discretion: 46 },
    },
  },
  {
    name: "Fatima Bello Kirfi",
    state: "Adamawa", zone: "NE", age: 50, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "FB",
    traits: ["Career Diplomat", "Multilingual", "ECOWAS Expert"],
    bio: "A career diplomat who learned Arabic growing up in a scholarly household in Yola and honed her skills during postings in Khartoum and Riyadh. Her experience in African multilateral institutions and her Arabic fluency make her well-equipped for the Cairo posting, where AU-Arab League coordination is a priority.",
    education: "Modibbo Adama University (International Relations), University of Khartoum (MA Arab-African Relations)",
    competence: 78, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-egypt", "amb-morocco", "amb-turkey", "amb-ethiopia"],
    competencies: {
      professional: { economics: 45, diplomacy: 82, security: 40, communications: 42, legal: 48, administration: 65, technology: 30, management: 70, politics: 79 },
      personal: { loyalty: 70, charisma: 58, leadership: 65, ambition: 52, integrity: 76, resilience: 72, intrigue: 28, discretion: 79 },
    },
  },
  {
    name: "Nuhu Wya",
    state: "Benue", zone: "NC", age: 58, gender: "Male", religion: "Islam", ethnicity: "Jukun", avatar: "NW",
    traits: ["Multilingual", "Security Specialist", "Career Diplomat"],
    bio: "A rare Muslim diplomat from the Middle Belt who learned Arabic at Al-Azhar University in Cairo. His security expertise, honed during attachments with the Defence Intelligence Agency, combined with his deep understanding of Nile Basin geopolitics make him a well-rounded candidate for the strategically significant Cairo embassy.",
    education: "Benue State University (History), Al-Azhar University Cairo (MA Islamic Civilization), National Defence College Abuja",
    competence: 75, languageSkills: ["Arabic", "French"],
    qualifiedFor: ["amb-egypt", "amb-israel", "amb-turkey", "amb-ethiopia"],
    competencies: {
      professional: { economics: 38, diplomacy: 78, security: 72, communications: 30, legal: 42, administration: 60, technology: 25, management: 72, politics: 77 },
      personal: { loyalty: 75, charisma: 50, leadership: 68, ambition: 45, integrity: 72, resilience: 78, intrigue: 40, discretion: 83 },
    },
  },
];
