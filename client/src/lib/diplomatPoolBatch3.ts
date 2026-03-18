// client/src/lib/diplomatPoolBatch3.ts
// Diplomat candidate pool — Batch 3: Regional Neighbour Ambassador Posts (21-30)
// 50 hand-crafted candidates (5 per post) across 10 African neighbour postings
// Posts: Ghana, Cameroon, Niger, Chad, Benin, Togo, Senegal, Côte d'Ivoire, Kenya, Ethiopia

import type { DiplomatCandidate } from "./diplomatTypes";

export const DIPLOMAT_CANDIDATES_BATCH3: DiplomatCandidate[] = [
  // ═══════════════════════════════════════════════════
  // POST 1: amb-ghana — Ghana (No language requirement)
  // ═══════════════════════════════════════════════════

  {
    name: "Adebowale Fashola",
    state: "Lagos", zone: "SW", age: 56, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "AF",
    traits: ["ECOWAS Expert", "Trade Negotiator", "Career Diplomat"],
    bio: "A seasoned ECOWAS affairs specialist who served as Deputy Director of West African Affairs at the Ministry of Foreign Affairs. His deep familiarity with the Nigeria-Ghana bilateral corridor and his personal friendships across Accra's political establishment make him an ideal bridge-builder between Africa's two largest Anglophone economies.",
    education: "University of Lagos (Political Science), University of Ghana Legon (MA African Studies)",
    competence: 79, languageSkills: ["None"],
    qualifiedFor: ["amb-ghana", "amb-kenya", "amb-ethiopia", "amb-benin"],
    competencies: {
      professional: { economics: 68, diplomacy: 82, security: 45, communications: 55, legal: 50, administration: 62, technology: 38, management: 71, politics: 79 },
      personal: { loyalty: 70, charisma: 72, leadership: 65, ambition: 55, integrity: 74, resilience: 68, intrigue: 35, discretion: 78 },
    },
  },
  {
    name: "Ngozi Ezeilo",
    state: "Enugu", zone: "SE", age: 48, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "NE",
    traits: ["Trade Negotiator", "Business Executive", "Diaspora Champion"],
    bio: "Former Managing Director of the Nigeria-Ghana Chamber of Commerce, she brokered several major bilateral trade agreements protecting Nigerian traders in Ghana. Her intimate knowledge of the contentious Ghana Investment Promotion Centre Act and its impact on Nigerian businesses gives her unmatched credibility in Accra.",
    education: "University of Nigeria Nsukka (Economics), Ashesi University Ghana (Executive MBA)",
    competence: 74, languageSkills: ["None"],
    qualifiedFor: ["amb-ghana", "amb-kenya", "amb-benin"],
    competencies: {
      professional: { economics: 80, diplomacy: 70, security: 30, communications: 55, legal: 60, administration: 58, technology: 45, management: 61, politics: 66 },
      personal: { loyalty: 62, charisma: 75, leadership: 60, ambition: 72, integrity: 65, resilience: 70, intrigue: 40, discretion: 70 },
    },
  },
  {
    name: "Musa Danladi Garba",
    state: "Plateau", zone: "NC", age: 61, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "MG",
    traits: ["Career Diplomat", "AU Veteran", "Protocol Expert"],
    bio: "A veteran of the African Union Commission in Addis Ababa where he served for twelve years before returning to Nigeria's Foreign Service. His pan-African vision and meticulous attention to diplomatic protocol have earned him respect across the continent. He views the Ghana posting as a chance to deepen ECOWAS solidarity.",
    education: "University of Jos (History), Addis Ababa University (MA International Relations)",
    competence: 76, languageSkills: ["French"],
    qualifiedFor: ["amb-ghana", "amb-ethiopia", "amb-cameroon", "amb-niger"],
    competencies: {
      professional: { economics: 50, diplomacy: 80, security: 48, communications: 42, legal: 55, administration: 70, technology: 30, management: 74, politics: 80 },
      personal: { loyalty: 78, charisma: 55, leadership: 68, ambition: 40, integrity: 82, resilience: 75, intrigue: 25, discretion: 84 },
    },
  },
  {
    name: "Ifeoma Achebe",
    state: "Anambra", zone: "SE", age: 50, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "IA",
    traits: ["Human Rights Advocate", "Academic Diplomat", "Multilingual"],
    bio: "A respected professor of international law at Nnamdi Azikiwe University who has consulted extensively for the ECOWAS Court of Justice in Abuja. Her scholarly work on free movement of persons within ECOWAS gives her a deep theoretical and practical grasp of the issues dominating the Nigeria-Ghana relationship.",
    education: "Nnamdi Azikiwe University (LLB, LLM), Oxford University (DPhil International Law)",
    competence: 72, languageSkills: ["French"],
    qualifiedFor: ["amb-ghana", "amb-benin", "amb-togo", "amb-kenya"],
    competencies: {
      professional: { economics: 45, diplomacy: 75, security: 35, communications: 50, legal: 85, administration: 48, technology: 40, management: 60, politics: 69 },
      personal: { loyalty: 65, charisma: 68, leadership: 58, ambition: 55, integrity: 88, resilience: 60, intrigue: 20, discretion: 81 },
    },
  },
  {
    name: "Olumide Akinwande",
    state: "Oyo", zone: "SW", age: 53, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "OA",
    traits: ["Political Appointee", "Media Savvy", "Cultural Ambassador"],
    bio: "A former Commissioner for Culture and Tourism in Oyo State who transformed the state's cultural diplomacy profile. His extensive personal network among Ghanaian cultural leaders and his experience organising major bilateral cultural exchanges make him a strong contender for the Accra posting.",
    education: "University of Ibadan (Theatre Arts), SOAS London (MA Cultural Policy)",
    competence: 67, languageSkills: ["None"],
    qualifiedFor: ["amb-ghana", "amb-kenya", "amb-ethiopia"],
    competencies: {
      professional: { economics: 40, diplomacy: 70, security: 30, communications: 78, legal: 35, administration: 55, technology: 42, management: 54, politics: 59 },
      personal: { loyalty: 68, charisma: 82, leadership: 60, ambition: 65, integrity: 60, resilience: 55, intrigue: 48, discretion: 54 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 2: amb-cameroon — Cameroon (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Abubakar Suleiman Tukur",
    state: "Adamawa", zone: "NE", age: 59, gender: "Male", religion: "Islam", ethnicity: "Fulani", avatar: "AT",
    traits: ["Career Diplomat", "Multilingual", "Security Specialist"],
    bio: "Born in Yola to a family with deep cross-border ties to northern Cameroon, he spent twenty years in the Foreign Service including a stint as Deputy Head of Mission in Yaoundé. His fluent French and Fulfulde make him a natural interlocutor with the Cameroonian political class, and his understanding of the Bakassi aftermath is unmatched.",
    education: "University of Maiduguri (French), Université de Yaoundé II (DEA Relations Internationales)",
    competence: 85, languageSkills: ["French"],
    qualifiedFor: ["amb-cameroon", "amb-chad", "amb-niger", "amb-benin"],
    competencies: {
      professional: { economics: 50, diplomacy: 88, security: 72, communications: 40, legal: 55, administration: 60, technology: 30, management: 56, politics: 64 },
      personal: { loyalty: 75, charisma: 65, leadership: 72, ambition: 50, integrity: 70, resilience: 80, intrigue: 45, discretion: 65 },
    },
  },
  {
    name: "Amina Yakubu Bello",
    state: "Taraba", zone: "NE", age: 47, gender: "Female", religion: "Islam", ethnicity: "Jukun", avatar: "AB",
    traits: ["ECOWAS Expert", "Trade Negotiator", "Multilingual"],
    bio: "A rising star in Nigeria's diplomatic corps who served as Trade Attaché in Paris before being posted to Douala. Growing up in Taraba State near the Cameroonian border gave her an innate understanding of cross-border dynamics. She is passionate about formalising the enormous informal trade between both countries.",
    education: "Federal University Wukari (Economics), Sciences Po Paris (MA International Affairs)",
    competence: 78, languageSkills: ["French"],
    qualifiedFor: ["amb-cameroon", "amb-togo", "amb-senegal", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 75, diplomacy: 80, security: 38, communications: 48, legal: 50, administration: 55, technology: 42, management: 60, politics: 68 },
      personal: { loyalty: 60, charisma: 72, leadership: 65, ambition: 70, integrity: 68, resilience: 65, intrigue: 38, discretion: 67 },
    },
  },
  {
    name: "Emmanuel Okon Bassey",
    state: "Cross River", zone: "SS", age: 55, gender: "Male", religion: "Christianity", ethnicity: "Efik", avatar: "EB",
    traits: ["Career Diplomat", "Protocol Expert", "Cultural Ambassador"],
    bio: "A career diplomat from Calabar whose family has centuries of trade contact with Cameroonian coastal communities. He served as Consul General in Douala and has intricate knowledge of the maritime boundary issues, fishing rights disputes, and cultural ties that define the Cross River-Cameroon corridor.",
    education: "University of Calabar (International Studies), Institut International d'Administration Publique Paris (Diploma)",
    competence: 80, languageSkills: ["French"],
    qualifiedFor: ["amb-cameroon", "amb-benin", "amb-ghana", "amb-togo"],
    competencies: {
      professional: { economics: 55, diplomacy: 85, security: 50, communications: 45, legal: 60, administration: 68, technology: 32, management: 73, politics: 83 },
      personal: { loyalty: 72, charisma: 60, leadership: 65, ambition: 48, integrity: 76, resilience: 70, intrigue: 30, discretion: 79 },
    },
  },
  {
    name: "Hajara Usman Modibbo",
    state: "Borno", zone: "NE", age: 51, gender: "Female", religion: "Islam", ethnicity: "Kanuri", avatar: "HM",
    traits: ["Security Specialist", "Multilingual", "Intelligence Background"],
    bio: "Formerly of the National Intelligence Agency, she specialised in Lake Chad Basin security cooperation before transitioning to the diplomatic service. Her fluency in French, Arabic, and Kanuri, combined with her deep understanding of the Boko Haram cross-border dynamics, makes her invaluable for the sensitive Cameroon posting.",
    education: "University of Maiduguri (Political Science), Université Cheikh Anta Diop Dakar (MA Security Studies)",
    competence: 82, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-cameroon", "amb-chad", "amb-niger"],
    competencies: {
      professional: { economics: 40, diplomacy: 78, security: 88, communications: 35, legal: 50, administration: 55, technology: 38, management: 68, politics: 72 },
      personal: { loyalty: 80, charisma: 55, leadership: 70, ambition: 58, integrity: 72, resilience: 85, intrigue: 65, discretion: 84 },
    },
  },
  {
    name: "Chidi Okafor-Udah",
    state: "Ebonyi", zone: "SE", age: 60, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "CO",
    traits: ["AU Veteran", "Career Diplomat", "Multilingual"],
    bio: "Served for eight years at the African Union headquarters before a posting as Nigeria's Ambassador to the Republic of Congo. His exceptional French and broad continental network make him well-suited for Francophone Africa postings. He brings a calm, methodical approach to the complex Nigeria-Cameroon bilateral relationship.",
    education: "Ebonyi State University (Public Administration), Université de Montréal (MA Political Science)",
    competence: 77, languageSkills: ["French"],
    qualifiedFor: ["amb-cameroon", "amb-ivory-coast", "amb-senegal", "amb-ethiopia"],
    competencies: {
      professional: { economics: 48, diplomacy: 82, security: 42, communications: 38, legal: 52, administration: 72, technology: 28, management: 60, politics: 67 },
      personal: { loyalty: 70, charisma: 58, leadership: 68, ambition: 42, integrity: 80, resilience: 72, intrigue: 28, discretion: 66 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 3: amb-niger — Niger (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Ibrahim Musa Kontagora",
    state: "Niger", zone: "NC", age: 62, gender: "Male", religion: "Islam", ethnicity: "Nupe", avatar: "IK",
    traits: ["Career Diplomat", "Security Specialist", "ECOWAS Expert"],
    bio: "A veteran diplomat from Niger State who has spent his career focused on Sahel security issues. He served as Nigeria's Special Envoy to the Multinational Joint Task Force and maintains strong personal ties with Nigerien military and political leaders. His border state background gives him authentic understanding of the cross-border Hausa-Fulani communities.",
    education: "Federal University of Technology Minna (Political Science), Université Abdou Moumouni Niamey (DEA Science Politique)",
    competence: 81, languageSkills: ["French"],
    qualifiedFor: ["amb-niger", "amb-chad", "amb-cameroon", "amb-benin"],
    competencies: {
      professional: { economics: 45, diplomacy: 83, security: 78, communications: 38, legal: 48, administration: 62, technology: 30, management: 61, politics: 67 },
      personal: { loyalty: 76, charisma: 58, leadership: 72, ambition: 45, integrity: 75, resilience: 80, intrigue: 40, discretion: 72 },
    },
  },
  {
    name: "Fatima Binta Abdullahi",
    state: "Sokoto", zone: "NW", age: 46, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "FA",
    traits: ["Multilingual", "Human Rights Advocate", "Academic Diplomat"],
    bio: "A lecturer in Franco-African Relations at Usman Dan Fodiyo University who has published extensively on the Sokoto-Niamey cultural corridor. Her fluent French and Fulfulde, combined with her deep scholarly understanding of the historical Sokoto Caliphate connections that span the Nigeria-Niger border, make her a thoughtful choice for Niamey.",
    education: "Usman Dan Fodiyo University Sokoto (French), Université de Bordeaux (Doctorat Sciences Politiques)",
    competence: 70, languageSkills: ["French"],
    qualifiedFor: ["amb-niger", "amb-senegal", "amb-chad", "amb-togo"],
    competencies: {
      professional: { economics: 42, diplomacy: 75, security: 35, communications: 55, legal: 60, administration: 48, technology: 38, management: 59, politics: 69 },
      personal: { loyalty: 65, charisma: 70, leadership: 55, ambition: 60, integrity: 85, resilience: 58, intrigue: 22, discretion: 79 },
    },
  },
  {
    name: "Sani Abubakar Daura",
    state: "Katsina", zone: "NW", age: 57, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "SD",
    traits: ["Intelligence Background", "Security Specialist", "Multilingual"],
    bio: "A former senior officer of the Defence Intelligence Agency who specialised in trans-Saharan security threats. His network of contacts across the Sahel intelligence community and his fluent French make him a formidable candidate for the strategically critical Niamey posting, where security cooperation dominates the bilateral agenda.",
    education: "Nigerian Defence Academy Kaduna, École Militaire Paris (Programme International)",
    competence: 83, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-niger", "amb-chad", "amb-cameroon"],
    competencies: {
      professional: { economics: 35, diplomacy: 72, security: 90, communications: 30, legal: 45, administration: 60, technology: 40, management: 60, politics: 58 },
      personal: { loyalty: 82, charisma: 50, leadership: 75, ambition: 55, integrity: 68, resilience: 88, intrigue: 60, discretion: 70 },
    },
  },
  {
    name: "Zainab Shehu Kangiwa",
    state: "Kebbi", zone: "NW", age: 49, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "ZK",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Career Diplomat"],
    bio: "She rose through the ranks of the Federal Ministry of Industry, Trade and Investment before transferring to the Foreign Service. Her expertise in the trans-Saharan trade routes and her understanding of the economic lifeline that connects Kebbi State to Niger Republic make her well-positioned to strengthen economic ties from the Niamey embassy.",
    education: "Kebbi State University (Business Administration), HEC Paris (MBA)",
    competence: 73, languageSkills: ["French"],
    qualifiedFor: ["amb-niger", "amb-benin", "amb-togo", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 78, diplomacy: 72, security: 32, communications: 45, legal: 50, administration: 60, technology: 42, management: 56, politics: 63 },
      personal: { loyalty: 62, charisma: 68, leadership: 58, ambition: 72, integrity: 70, resilience: 62, intrigue: 35, discretion: 63 },
    },
  },
  {
    name: "Abdulrazaq Jimoh Pategi",
    state: "Kwara", zone: "NC", age: 64, gender: "Male", religion: "Islam", ethnicity: "Nupe", avatar: "AJ",
    traits: ["Former Senator", "Political Appointee", "Multilingual"],
    bio: "A former two-term Senator representing Kwara North who chaired the Senate Committee on Foreign Affairs. His legislative experience and extensive Francophone Africa contacts, built during years of inter-parliamentary exchanges, give him the political weight and regional knowledge to manage the Niger posting effectively.",
    education: "University of Ilorin (Law), Université de Paris-Sorbonne (Certificat de Langue Française)",
    competence: 71, languageSkills: ["French"],
    qualifiedFor: ["amb-niger", "amb-benin", "amb-ghana", "amb-chad"],
    competencies: {
      professional: { economics: 55, diplomacy: 74, security: 40, communications: 65, legal: 72, administration: 58, technology: 28, management: 74, politics: 72 },
      personal: { loyalty: 58, charisma: 75, leadership: 78, ambition: 68, integrity: 55, resilience: 60, intrigue: 52, discretion: 64 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 4: amb-chad — Chad (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Mohammed Kyari Bukar",
    state: "Borno", zone: "NE", age: 58, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "MK",
    traits: ["Security Specialist", "Career Diplomat", "Multilingual"],
    bio: "A Kanuri diplomat from Maiduguri who has dedicated his career to Lake Chad Basin diplomacy. He served as Nigeria's representative to the Lake Chad Basin Commission for six years and has unparalleled knowledge of the security, water-sharing, and migration issues that define the Nigeria-Chad relationship.",
    education: "University of Maiduguri (Political Science), Université de N'Djamena (DEA), National Defence College Abuja",
    competence: 84, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-chad", "amb-cameroon", "amb-niger"],
    competencies: {
      professional: { economics: 42, diplomacy: 85, security: 82, communications: 35, legal: 48, administration: 65, technology: 28, management: 76, politics: 81 },
      personal: { loyalty: 78, charisma: 58, leadership: 75, ambition: 45, integrity: 74, resilience: 85, intrigue: 42, discretion: 86 },
    },
  },
  {
    name: "Aishatu Garba Ringim",
    state: "Jigawa", zone: "NW", age: 45, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "AG",
    traits: ["Multilingual", "Human Rights Advocate", "UN Experience"],
    bio: "A former UNICEF programme officer in N'Djamena who transitioned into the diplomatic service driven by her passion for the displaced communities of the Lake Chad region. Her fluent French, Arabic, and Hausa, combined with her humanitarian expertise, bring a compassionate yet pragmatic dimension to the Chad posting.",
    education: "Bayero University Kano (Sociology), Graduate Institute Geneva (MA Development Studies)",
    competence: 69, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-chad", "amb-niger", "amb-cameroon", "amb-ethiopia"],
    competencies: {
      professional: { economics: 48, diplomacy: 72, security: 40, communications: 52, legal: 55, administration: 58, technology: 35, management: 52, politics: 60 },
      personal: { loyalty: 68, charisma: 72, leadership: 55, ambition: 58, integrity: 85, resilience: 70, intrigue: 20, discretion: 73 },
    },
  },
  {
    name: "Babagana Mustapha Zannah",
    state: "Yobe", zone: "NE", age: 63, gender: "Male", religion: "Islam", ethnicity: "Kanuri", avatar: "BZ",
    traits: ["Intelligence Background", "AU Veteran", "Security Specialist"],
    bio: "A retired Brigadier General who served as Nigeria's Military Attaché in N'Djamena before transitioning to civilian diplomacy. His deep relationships with Chad's military establishment and his understanding of the joint counter-terrorism operations make him invaluable for a posting where security cooperation is the top bilateral priority.",
    education: "Nigerian Defence Academy Kaduna (BSc), Royal Military Academy Sandhurst, Université de Strasbourg (Certificat Études Stratégiques)",
    competence: 80, languageSkills: ["French", "Arabic"],
    qualifiedFor: ["amb-chad", "amb-niger", "amb-cameroon"],
    competencies: {
      professional: { economics: 35, diplomacy: 70, security: 92, communications: 30, legal: 40, administration: 68, technology: 32, management: 69, politics: 63 },
      personal: { loyalty: 85, charisma: 52, leadership: 82, ambition: 48, integrity: 70, resilience: 90, intrigue: 50, discretion: 74 },
    },
  },
  {
    name: "Safiya Aliyu Gusau",
    state: "Zamfara", zone: "NW", age: 52, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "SA",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Multilingual"],
    bio: "Formerly head of the Sahel Desk at the Ministry of Foreign Affairs, she coordinated Nigeria's economic diplomacy across the Chad Basin. Her background in agricultural trade policy is particularly relevant given the livestock and grain trade that flows between Nigeria and Chad. She is known for her tenacity in negotiations.",
    education: "Ahmadu Bello University Zaria (Agricultural Economics), ESSEC Paris (MBA International Business)",
    competence: 74, languageSkills: ["French"],
    qualifiedFor: ["amb-chad", "amb-niger", "amb-senegal", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 78, diplomacy: 75, security: 38, communications: 42, legal: 48, administration: 55, technology: 40, management: 50, politics: 56 },
      personal: { loyalty: 60, charisma: 65, leadership: 62, ambition: 70, integrity: 72, resilience: 68, intrigue: 32, discretion: 61 },
    },
  },
  {
    name: "Haruna Adamu Gombe",
    state: "Gombe", zone: "NE", age: 55, gender: "Male", religion: "Islam", ethnicity: "Fulani", avatar: "HA",
    traits: ["Career Diplomat", "Protocol Expert", "Multilingual"],
    bio: "A meticulous career diplomat who served in several Francophone African capitals including Yaoundé, Libreville, and Kinshasa. His deep understanding of francophone diplomatic culture and protocol, combined with his Sahel regional expertise, make him a reliable choice for the strategically important N'Djamena posting.",
    education: "Gombe State University (International Relations), École Nationale d'Administration Paris (ENA)",
    competence: 78, languageSkills: ["French"],
    qualifiedFor: ["amb-chad", "amb-cameroon", "amb-niger", "amb-togo", "amb-benin"],
    competencies: {
      professional: { economics: 45, diplomacy: 82, security: 50, communications: 38, legal: 52, administration: 75, technology: 28, management: 71, politics: 80 },
      personal: { loyalty: 74, charisma: 55, leadership: 65, ambition: 42, integrity: 78, resilience: 72, intrigue: 30, discretion: 76 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 5: amb-benin — Benin (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Adeniyi Kolawole Saki",
    state: "Oyo", zone: "SW", age: 54, gender: "Male", religion: "Islam", ethnicity: "Yoruba", avatar: "AK",
    traits: ["Trade Negotiator", "ECOWAS Expert", "Multilingual"],
    bio: "A customs and trade expert who spent years managing the Seme-Kraké border post before joining the diplomatic service. His unmatched knowledge of the Nigeria-Benin smuggling corridors, legitimate trade flows, and cultural Yoruba connections across the border make him the definitive expert on this bilateral relationship.",
    education: "Lead City University Ibadan (Economics), Université d'Abomey-Calavi (Maîtrise Commerce International)",
    competence: 76, languageSkills: ["French"],
    qualifiedFor: ["amb-benin", "amb-togo", "amb-ghana", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 82, diplomacy: 75, security: 48, communications: 40, legal: 55, administration: 60, technology: 35, management: 69, politics: 77 },
      personal: { loyalty: 65, charisma: 62, leadership: 60, ambition: 58, integrity: 68, resilience: 72, intrigue: 45, discretion: 79 },
    },
  },
  {
    name: "Bukola Adetoun Osinubi",
    state: "Ogun", zone: "SW", age: 49, gender: "Female", religion: "Christianity", ethnicity: "Yoruba", avatar: "BO",
    traits: ["Career Diplomat", "Multilingual", "Cultural Ambassador"],
    bio: "Born in Abeokuta to a family with ancestral links to Porto-Novo, she is fluent in French and deeply immersed in the shared Yoruba-Gun cultural heritage that unites southwest Nigeria and southern Benin. Her decade in the Foreign Service, including postings in Cotonou and Lomé, gives her deep Francophone West Africa expertise.",
    education: "Olabisi Onabanjo University (French), Université de Strasbourg (MA Relations Internationales)",
    competence: 75, languageSkills: ["French"],
    qualifiedFor: ["amb-benin", "amb-togo", "amb-senegal", "amb-ghana"],
    competencies: {
      professional: { economics: 50, diplomacy: 80, security: 32, communications: 55, legal: 48, administration: 62, technology: 38, management: 69, politics: 80 },
      personal: { loyalty: 70, charisma: 74, leadership: 58, ambition: 55, integrity: 78, resilience: 65, intrigue: 28, discretion: 81 },
    },
  },
  {
    name: "Idris Lawal Ilorin",
    state: "Kwara", zone: "NC", age: 58, gender: "Male", religion: "Islam", ethnicity: "Yoruba", avatar: "IL",
    traits: ["Former Governor", "Political Appointee", "Multilingual"],
    bio: "A former Deputy Governor of Kwara State who pivoted to diplomatic service after leaving office. His political stature and fluent French, learned during his formative years at a Francophone university, give him the gravitas and linguistic ability needed to navigate the complexities of the Nigeria-Benin relationship.",
    education: "University of Ilorin (Political Science), Université Laval Québec (Maîtrise Administration Publique)",
    competence: 68, languageSkills: ["French"],
    qualifiedFor: ["amb-benin", "amb-niger", "amb-togo"],
    competencies: {
      professional: { economics: 55, diplomacy: 70, security: 38, communications: 62, legal: 50, administration: 72, technology: 30, management: 75, politics: 70 },
      personal: { loyalty: 55, charisma: 78, leadership: 80, ambition: 72, integrity: 55, resilience: 58, intrigue: 50, discretion: 56 },
    },
  },
  {
    name: "Grace Omoregie",
    state: "Edo", zone: "SS", age: 47, gender: "Female", religion: "Christianity", ethnicity: "Bini", avatar: "GO",
    traits: ["Trade Negotiator", "Business Executive", "Multilingual"],
    bio: "A former executive at the Nigerian Export Promotion Council who led the agency's West Africa desk. Her work on formalising the massive informal trade between Benin and Nigeria, particularly through the Seme corridor, and her commercial acumen make her a strong candidate focused on economic diplomacy in Cotonou.",
    education: "University of Benin (Business Administration), INSEAD Fontainebleau (MBA)",
    competence: 72, languageSkills: ["French"],
    qualifiedFor: ["amb-benin", "amb-ivory-coast", "amb-togo", "amb-ghana"],
    competencies: {
      professional: { economics: 85, diplomacy: 68, security: 28, communications: 48, legal: 52, administration: 58, technology: 45, management: 61, politics: 67 },
      personal: { loyalty: 60, charisma: 70, leadership: 55, ambition: 75, integrity: 65, resilience: 62, intrigue: 35, discretion: 68 },
    },
  },
  {
    name: "Rasheed Muritala Badagry",
    state: "Lagos", zone: "SW", age: 61, gender: "Male", religion: "Islam", ethnicity: "Awori", avatar: "RM",
    traits: ["Career Diplomat", "Protocol Expert", "ECOWAS Expert"],
    bio: "A career diplomat from Badagry whose family has traded across the Nigeria-Benin border for generations. He served as First Secretary in Cotonou and later as Consul in Lomé. His intimate knowledge of the border communities and his impeccable French make him a natural fit for the Benin Republic posting.",
    education: "Lagos State University (French), Université Paris-Dauphine (DESS Diplomatie)",
    competence: 74, languageSkills: ["French"],
    qualifiedFor: ["amb-benin", "amb-togo", "amb-ghana", "amb-senegal"],
    competencies: {
      professional: { economics: 52, diplomacy: 80, security: 42, communications: 40, legal: 55, administration: 68, technology: 30, management: 59, politics: 68 },
      personal: { loyalty: 72, charisma: 58, leadership: 62, ambition: 45, integrity: 75, resilience: 70, intrigue: 32, discretion: 67 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 6: amb-togo — Togo (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Kola Adeyemo Ife",
    state: "Osun", zone: "SW", age: 52, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "KA",
    traits: ["ECOWAS Expert", "Career Diplomat", "Multilingual"],
    bio: "A career diplomat who has served in three Francophone West African capitals. His posting as Second Secretary in Lomé early in his career gave him lasting ties to the Togolese political establishment. He is well-versed in the cultural connections between the Yoruba of southwest Nigeria and the Ewe and Mina communities of Togo.",
    education: "Obafemi Awolowo University (International Relations), Institut des Relations Internationales du Cameroun (IRIC)",
    competence: 77, languageSkills: ["French"],
    qualifiedFor: ["amb-togo", "amb-benin", "amb-ghana", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 52, diplomacy: 82, security: 40, communications: 48, legal: 50, administration: 65, technology: 35, management: 65, politics: 75 },
      personal: { loyalty: 68, charisma: 65, leadership: 62, ambition: 55, integrity: 72, resilience: 68, intrigue: 30, discretion: 71 },
    },
  },
  {
    name: "Hadiza Umar Birnin-Kebbi",
    state: "Kebbi", zone: "NW", age: 48, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "HU",
    traits: ["Multilingual", "Trade Negotiator", "UN Experience"],
    bio: "A former UN Development Programme officer who served in Lomé for four years before joining Nigeria's Foreign Service. Her fluent French, background in development economics, and her understanding of Togo's transit-trade economy make her a compelling choice for a posting where economic diplomacy is central.",
    education: "Bayero University Kano (Economics), Université de Genève (MA International Economics)",
    competence: 71, languageSkills: ["French"],
    qualifiedFor: ["amb-togo", "amb-senegal", "amb-niger", "amb-benin"],
    competencies: {
      professional: { economics: 72, diplomacy: 74, security: 30, communications: 45, legal: 48, administration: 58, technology: 40, management: 57, politics: 66 },
      personal: { loyalty: 64, charisma: 68, leadership: 55, ambition: 62, integrity: 75, resilience: 60, intrigue: 25, discretion: 68 },
    },
  },
  {
    name: "Tunde Babajide Oshogbo",
    state: "Osun", zone: "SW", age: 60, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "TB",
    traits: ["Political Appointee", "Media Savvy", "Cultural Ambassador"],
    bio: "A former Special Adviser on Diaspora Affairs to the Osun State Government who built extensive networks among the Nigerian community in Togo. His media background and cultural diplomacy skills, combined with functional French, position him as a bridge between the Nigerian diaspora in Lomé and official diplomatic channels.",
    education: "University of Ibadan (Mass Communication), Université de Lomé (Certificat de Français)",
    competence: 65, languageSkills: ["French"],
    qualifiedFor: ["amb-togo", "amb-benin", "amb-ghana"],
    competencies: {
      professional: { economics: 40, diplomacy: 68, security: 28, communications: 80, legal: 35, administration: 52, technology: 42, management: 53, politics: 59 },
      personal: { loyalty: 60, charisma: 78, leadership: 55, ambition: 62, integrity: 58, resilience: 55, intrigue: 42, discretion: 56 },
    },
  },
  {
    name: "Chidinma Nwachukwu",
    state: "Imo", zone: "SE", age: 46, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "CN",
    traits: ["Academic Diplomat", "Human Rights Advocate", "Multilingual"],
    bio: "A professor of Francophone African Studies at Imo State University who has published extensively on West African regional integration. Her academic expertise, combined with her passionate advocacy for women's rights across the ECOWAS region and her excellent French, make her a thoughtful choice for the Lomé posting.",
    education: "Imo State University (French), Université de Nantes (Doctorat Lettres Modernes)",
    competence: 68, languageSkills: ["French"],
    qualifiedFor: ["amb-togo", "amb-benin", "amb-senegal", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 42, diplomacy: 72, security: 28, communications: 58, legal: 55, administration: 45, technology: 38, management: 40, politics: 50 },
      personal: { loyalty: 62, charisma: 70, leadership: 52, ambition: 58, integrity: 88, resilience: 55, intrigue: 18, discretion: 63 },
    },
  },
  {
    name: "Dauda Abdulsalam Lafia",
    state: "Nasarawa", zone: "NC", age: 55, gender: "Male", religion: "Islam", ethnicity: "Eggon", avatar: "DA",
    traits: ["Career Diplomat", "Protocol Expert", "Multilingual"],
    bio: "A disciplined career diplomat who served as Nigeria's Deputy Head of Mission in Lomé and later as Consul in Abidjan. His meticulous approach to diplomatic protocol and his fluent French have earned him a reputation as one of the Foreign Service's most reliable Francophone Africa hands.",
    education: "Nasarawa State University (Public Administration), École Nationale d'Administration Lomé (Certificat)",
    competence: 73, languageSkills: ["French"],
    qualifiedFor: ["amb-togo", "amb-ivory-coast", "amb-benin", "amb-cameroon"],
    competencies: {
      professional: { economics: 45, diplomacy: 78, security: 38, communications: 35, legal: 50, administration: 72, technology: 28, management: 74, politics: 83 },
      personal: { loyalty: 75, charisma: 52, leadership: 60, ambition: 40, integrity: 78, resilience: 70, intrigue: 22, discretion: 82 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 7: amb-senegal — Senegal (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Balarabe Musa Kano",
    state: "Kano", zone: "NW", age: 57, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "BM",
    traits: ["Career Diplomat", "Multilingual", "AU Veteran"],
    bio: "A senior career diplomat who served as Nigeria's Chargé d'Affaires in Dakar and later at the African Union. His deep connections within the Senegalese political class, his fluent French and Wolof, and his understanding of the West African Sufi Islamic networks that connect northern Nigeria to Senegal make him an outstanding candidate.",
    education: "Bayero University Kano (Political Science), Sciences Po Bordeaux (MA Politique Africaine)",
    competence: 82, languageSkills: ["French"],
    qualifiedFor: ["amb-senegal", "amb-ivory-coast", "amb-togo", "amb-niger"],
    competencies: {
      professional: { economics: 48, diplomacy: 86, security: 45, communications: 42, legal: 52, administration: 68, technology: 30, management: 61, politics: 70 },
      personal: { loyalty: 72, charisma: 70, leadership: 68, ambition: 50, integrity: 76, resilience: 72, intrigue: 35, discretion: 67 },
    },
  },
  {
    name: "Amara Obi Nnewi",
    state: "Anambra", zone: "SE", age: 50, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "AO",
    traits: ["Trade Negotiator", "Business Executive", "Multilingual"],
    bio: "A former executive director of a major Nigerian conglomerate's West Africa division, she oversaw operations in Dakar, Abidjan, and Lomé. Her commercial networks across Francophone West Africa and her fluent French, combined with her sharp negotiating instincts, make her a strong choice for the economically important Dakar posting.",
    education: "Nnamdi Azikiwe University (Accounting), ESSEC Dakar (MBA Afrique)",
    competence: 75, languageSkills: ["French"],
    qualifiedFor: ["amb-senegal", "amb-ivory-coast", "amb-togo"],
    competencies: {
      professional: { economics: 82, diplomacy: 72, security: 28, communications: 50, legal: 55, administration: 60, technology: 48, management: 71, politics: 74 },
      personal: { loyalty: 58, charisma: 72, leadership: 65, ambition: 78, integrity: 62, resilience: 65, intrigue: 40, discretion: 72 },
    },
  },
  {
    name: "Aliyu Baba Zaria",
    state: "Kaduna", zone: "NW", age: 62, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "AZ",
    traits: ["Former Senator", "Political Appointee", "Multilingual"],
    bio: "A former Senator who chaired the Senate Committee on ECOWAS and Regional Integration. His political stature, Francophone connections built through years of parliamentary diplomacy, and his personal relationship with several Senegalese political leaders give him the gravitas needed for the prestigious Dakar posting.",
    education: "Ahmadu Bello University Zaria (Law), Georgetown University (LLM International Law)",
    competence: 73, languageSkills: ["French"],
    qualifiedFor: ["amb-senegal", "amb-niger", "amb-ghana", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 55, diplomacy: 76, security: 42, communications: 68, legal: 72, administration: 55, technology: 30, management: 68, politics: 69 },
      personal: { loyalty: 55, charisma: 78, leadership: 75, ambition: 72, integrity: 58, resilience: 60, intrigue: 52, discretion: 62 },
    },
  },
  {
    name: "Folashade Ajayi-Williams",
    state: "Ekiti", zone: "SW", age: 48, gender: "Female", religion: "Christianity", ethnicity: "Yoruba", avatar: "FW",
    traits: ["Academic Diplomat", "Multilingual", "Cultural Ambassador"],
    bio: "A distinguished professor of Francophone Literature at Ekiti State University who has been a visiting scholar at Université Cheikh Anta Diop in Dakar multiple times. Her deep immersion in Senegalese intellectual life and her fluent French make her an unconventional but culturally astute choice for the Dakar posting.",
    education: "Ekiti State University (French), Université Cheikh Anta Diop Dakar (Doctorat Lettres)",
    competence: 66, languageSkills: ["French"],
    qualifiedFor: ["amb-senegal", "amb-togo", "amb-ivory-coast", "amb-benin"],
    competencies: {
      professional: { economics: 38, diplomacy: 70, security: 25, communications: 62, legal: 45, administration: 42, technology: 35, management: 55, politics: 65 },
      personal: { loyalty: 65, charisma: 75, leadership: 50, ambition: 52, integrity: 82, resilience: 55, intrigue: 20, discretion: 78 },
    },
  },
  {
    name: "Gambo Abdullahi Dutse",
    state: "Jigawa", zone: "NW", age: 53, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "GD",
    traits: ["Career Diplomat", "ECOWAS Expert", "Multilingual"],
    bio: "A career diplomat who served as Nigeria's representative to the ECOWAS Commission in Abuja, where he worked closely with Senegalese counterparts on regional integration issues. His fluent French and deep understanding of West African multilateral dynamics make him well-prepared for the Dakar embassy.",
    education: "Sule Lamido University Kafin Hausa (Political Science), Université Gaston Berger Saint-Louis (MA Gouvernance)",
    competence: 72, languageSkills: ["French"],
    qualifiedFor: ["amb-senegal", "amb-niger", "amb-togo", "amb-benin"],
    competencies: {
      professional: { economics: 50, diplomacy: 78, security: 42, communications: 38, legal: 48, administration: 65, technology: 32, management: 68, politics: 78 },
      personal: { loyalty: 70, charisma: 60, leadership: 58, ambition: 50, integrity: 72, resilience: 68, intrigue: 28, discretion: 76 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 8: amb-ivory-coast — Côte d'Ivoire (French required)
  // ═══════════════════════════════════════════════════

  {
    name: "Emeka Okadigbo",
    state: "Anambra", zone: "SE", age: 56, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "EO",
    traits: ["Trade Negotiator", "Business Executive", "Multilingual"],
    bio: "A former Managing Director of the Nigerian-Ivorian Business Council who brokered several landmark cocoa and petroleum trade agreements. His commercial acumen, extensive Abidjan network, and fluent French make him the ideal candidate to deepen Nigeria's economic partnership with West Africa's other economic powerhouse.",
    education: "University of Nigeria Nsukka (Economics), HEC Abidjan (MBA)",
    competence: 79, languageSkills: ["French"],
    qualifiedFor: ["amb-ivory-coast", "amb-senegal", "amb-ghana", "amb-togo"],
    competencies: {
      professional: { economics: 85, diplomacy: 76, security: 30, communications: 50, legal: 55, administration: 58, technology: 45, management: 65, politics: 70 },
      personal: { loyalty: 58, charisma: 70, leadership: 65, ambition: 75, integrity: 62, resilience: 68, intrigue: 42, discretion: 68 },
    },
  },
  {
    name: "Aisha Mohammed Gwarzo",
    state: "Kano", zone: "NW", age: 50, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "AM",
    traits: ["Career Diplomat", "Multilingual", "ECOWAS Expert"],
    bio: "A career diplomat who served in Abidjan during the Ivorian civil crisis and helped coordinate the evacuation of Nigerian nationals. Her crisis management experience, fluent French, and deep understanding of Côte d'Ivoire's post-conflict political landscape give her unique qualifications for this posting.",
    education: "Bayero University Kano (French), Institut des Relations Internationales du Cameroun (IRIC), Sciences Po Lyon (MA)",
    competence: 81, languageSkills: ["French"],
    qualifiedFor: ["amb-ivory-coast", "amb-cameroon", "amb-senegal", "amb-togo"],
    competencies: {
      professional: { economics: 50, diplomacy: 84, security: 55, communications: 48, legal: 50, administration: 62, technology: 35, management: 74, politics: 81 },
      personal: { loyalty: 72, charisma: 65, leadership: 70, ambition: 58, integrity: 74, resilience: 78, intrigue: 35, discretion: 84 },
    },
  },
  {
    name: "Olawale Dosunmu",
    state: "Lagos", zone: "SW", age: 59, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "OD",
    traits: ["Oil Diplomacy Specialist", "Trade Negotiator", "Multilingual"],
    bio: "A petroleum industry veteran who spent fifteen years with Shell's West Africa division before joining the diplomatic service. His expertise in energy diplomacy and his knowledge of the Nigerian-Ivorian petroleum trade corridor, combined with excellent French, make him a strong candidate for Abidjan.",
    education: "University of Lagos (Petroleum Engineering), IFP School Paris (MSc Energy Economics)",
    competence: 76, languageSkills: ["French"],
    qualifiedFor: ["amb-ivory-coast", "amb-senegal", "amb-cameroon", "amb-ghana"],
    competencies: {
      professional: { economics: 78, diplomacy: 72, security: 35, communications: 42, legal: 50, administration: 55, technology: 60, management: 65, politics: 72 },
      personal: { loyalty: 62, charisma: 60, leadership: 58, ambition: 68, integrity: 65, resilience: 62, intrigue: 38, discretion: 72 },
    },
  },
  {
    name: "Hauwa Ibrahim Gashua",
    state: "Yobe", zone: "NE", age: 47, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "HI",
    traits: ["Multilingual", "UN Experience", "Human Rights Advocate"],
    bio: "A former UNHCR officer who worked in Abidjan during the Ivorian refugee crisis before joining Nigeria's diplomatic corps. Her humanitarian credentials, fluent French, and deep empathy for the Nigerian diaspora community in Côte d'Ivoire give her a distinctive perspective on this important West African posting.",
    education: "University of Maiduguri (Law), Université Félix Houphouët-Boigny Abidjan (DEA Droits de l'Homme)",
    competence: 70, languageSkills: ["French"],
    qualifiedFor: ["amb-ivory-coast", "amb-togo", "amb-benin", "amb-senegal"],
    competencies: {
      professional: { economics: 42, diplomacy: 74, security: 35, communications: 52, legal: 68, administration: 50, technology: 32, management: 62, politics: 71 },
      personal: { loyalty: 65, charisma: 72, leadership: 55, ambition: 55, integrity: 85, resilience: 70, intrigue: 18, discretion: 87 },
    },
  },
  {
    name: "Uchenna Maduka Owerri",
    state: "Imo", zone: "SE", age: 63, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "UM",
    traits: ["Diaspora Champion", "Career Diplomat", "Multilingual"],
    bio: "A career diplomat who has spent the bulk of his service in Francophone West Africa, including postings in Abidjan, Dakar, and Ouagadougou. His tireless advocacy for the large Nigerian trading community in Côte d'Ivoire has earned him the nickname 'Ambassador of the People' among Nigerian diaspora groups in Abidjan.",
    education: "Federal University of Technology Owerri (Public Administration), Université de Cocody Abidjan (Maîtrise Science Politique)",
    competence: 74, languageSkills: ["French"],
    qualifiedFor: ["amb-ivory-coast", "amb-senegal", "amb-benin", "amb-togo"],
    competencies: {
      professional: { economics: 48, diplomacy: 78, security: 35, communications: 55, legal: 45, administration: 62, technology: 28, management: 53, politics: 62 },
      personal: { loyalty: 70, charisma: 72, leadership: 60, ambition: 42, integrity: 75, resilience: 68, intrigue: 25, discretion: 64 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 9: amb-kenya — Kenya (No language requirement)
  // ═══════════════════════════════════════════════════

  {
    name: "Olufemi Adegbite",
    state: "Ondo", zone: "SW", age: 55, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "OG",
    traits: ["Career Diplomat", "AU Veteran", "Trade Negotiator"],
    bio: "A career diplomat who served as Nigeria's Deputy Permanent Representative to the United Nations Environment Programme in Nairobi. His years in Kenya gave him extensive contacts in the Kenyan government, business community, and the international organisations headquartered there. He is passionate about deepening the Nigeria-Kenya trade axis.",
    education: "Federal University of Technology Akure (Economics), University of Nairobi (MA International Studies)",
    competence: 78, languageSkills: ["None"],
    qualifiedFor: ["amb-kenya", "amb-ethiopia", "amb-ghana"],
    competencies: {
      professional: { economics: 70, diplomacy: 82, security: 40, communications: 48, legal: 50, administration: 65, technology: 42, management: 63, politics: 73 },
      personal: { loyalty: 68, charisma: 65, leadership: 62, ambition: 58, integrity: 72, resilience: 70, intrigue: 30, discretion: 70 },
    },
  },
  {
    name: "Aisha Bello Tafawa-Balewa",
    state: "Bauchi", zone: "NE", age: 46, gender: "Female", religion: "Islam", ethnicity: "Hausa", avatar: "AT",
    traits: ["Tech Industry Ties", "Trade Negotiator", "Multilingual"],
    bio: "A former fintech executive who built partnerships between Nigerian and Kenyan technology companies before entering public service. Her understanding of the competitive yet complementary tech ecosystems of Lagos and Nairobi, and her vision for a Nigeria-Kenya digital economy partnership, bring a modern dimension to this East African posting.",
    education: "Abubakar Tafawa Balewa University (Computer Science), Strathmore University Nairobi (MBA)",
    competence: 72, languageSkills: ["None"],
    qualifiedFor: ["amb-kenya", "amb-ethiopia", "amb-ghana"],
    competencies: {
      professional: { economics: 72, diplomacy: 68, security: 28, communications: 60, legal: 42, administration: 55, technology: 85, management: 53, politics: 57 },
      personal: { loyalty: 58, charisma: 75, leadership: 60, ambition: 78, integrity: 65, resilience: 62, intrigue: 35, discretion: 59 },
    },
  },
  {
    name: "Chibueze Anyanwu",
    state: "Abia", zone: "SE", age: 60, gender: "Male", religion: "Christianity", ethnicity: "Igbo", avatar: "CA",
    traits: ["Business Executive", "Diaspora Champion", "Trade Negotiator"],
    bio: "A prominent Aba-based industrialist who built a manufacturing empire with operations across East Africa including Kenya, Tanzania, and Uganda. His deep commercial ties to the East African Community and his advocacy for Nigerian business interests in the region make him a heavyweight candidate for the Nairobi posting.",
    education: "Abia State University (Business Management), Kenyatta University (MBA), London Business School (Executive Programme)",
    competence: 75, languageSkills: ["None"],
    qualifiedFor: ["amb-kenya", "amb-ethiopia", "amb-ghana"],
    competencies: {
      professional: { economics: 82, diplomacy: 65, security: 30, communications: 52, legal: 48, administration: 60, technology: 50, management: 66, politics: 64 },
      personal: { loyalty: 55, charisma: 72, leadership: 70, ambition: 80, integrity: 58, resilience: 68, intrigue: 42, discretion: 64 },
    },
  },
  {
    name: "Maryam Suleiman Bauchi",
    state: "Bauchi", zone: "NE", age: 51, gender: "Female", religion: "Islam", ethnicity: "Fulani", avatar: "MS",
    traits: ["UN Experience", "Human Rights Advocate", "Career Diplomat"],
    bio: "A career diplomat who served at the UN-Habitat headquarters in Nairobi for five years, gaining intimate knowledge of Kenya's political landscape and East African regional dynamics. Her humanitarian expertise and her experience navigating the complex international organisation ecosystem in Nairobi make her a well-rounded candidate.",
    education: "Abubakar Tafawa Balewa University (Sociology), University of Nairobi (MA International Relations)",
    competence: 74, languageSkills: ["None"],
    qualifiedFor: ["amb-kenya", "amb-ethiopia", "amb-ghana", "amb-cameroon"],
    competencies: {
      professional: { economics: 45, diplomacy: 78, security: 38, communications: 52, legal: 55, administration: 62, technology: 35, management: 68, politics: 78 },
      personal: { loyalty: 70, charisma: 68, leadership: 58, ambition: 52, integrity: 82, resilience: 68, intrigue: 22, discretion: 83 },
    },
  },
  {
    name: "Femi Coker",
    state: "Lagos", zone: "SW", age: 58, gender: "Male", religion: "Christianity", ethnicity: "Yoruba", avatar: "FC",
    traits: ["Media Savvy", "Cultural Ambassador", "Career Diplomat"],
    bio: "A former Director of Public Diplomacy at the Ministry of Foreign Affairs who transformed Nigeria's cultural outreach in East Africa. His media background and his experience organising major Nigerian cultural festivals in Nairobi and Addis Ababa make him a charismatic ambassador who can strengthen Nigeria's soft power across the region.",
    education: "University of Lagos (Mass Communication), University of Westminster London (MA Diplomacy)",
    competence: 70, languageSkills: ["None"],
    qualifiedFor: ["amb-kenya", "amb-ghana", "amb-ethiopia"],
    competencies: {
      professional: { economics: 38, diplomacy: 74, security: 30, communications: 85, legal: 35, administration: 55, technology: 45, management: 61, politics: 69 },
      personal: { loyalty: 62, charisma: 82, leadership: 58, ambition: 60, integrity: 65, resilience: 58, intrigue: 35, discretion: 66 },
    },
  },

  // ═══════════════════════════════════════════════════
  // POST 10: amb-ethiopia — Ethiopia (No language requirement)
  // ═══════════════════════════════════════════════════

  {
    name: "Garba Mohammed Dutsinma",
    state: "Katsina", zone: "NW", age: 60, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "GM",
    traits: ["AU Veteran", "Career Diplomat", "Multilingual"],
    bio: "A veteran diplomat who served two terms at Nigeria's Permanent Mission to the African Union in Addis Ababa, rising to Deputy Permanent Representative. His encyclopaedic knowledge of AU institutional politics and his extensive personal network across the Addis diplomatic corps make him the consummate insider for this crucial posting.",
    education: "Umaru Musa Yar'Adua University Katsina (Political Science), Addis Ababa University (MA International Relations)",
    competence: 85, languageSkills: ["French"],
    qualifiedFor: ["amb-ethiopia", "amb-kenya", "amb-niger", "amb-chad"],
    competencies: {
      professional: { economics: 48, diplomacy: 90, security: 50, communications: 42, legal: 55, administration: 72, technology: 30, management: 64, politics: 73 },
      personal: { loyalty: 75, charisma: 62, leadership: 72, ambition: 48, integrity: 78, resilience: 75, intrigue: 38, discretion: 69 },
    },
  },
  {
    name: "Obiageli Nwosu-Iheme",
    state: "Abia", zone: "SE", age: 49, gender: "Female", religion: "Christianity", ethnicity: "Igbo", avatar: "ON",
    traits: ["UN Experience", "Academic Diplomat", "Human Rights Advocate"],
    bio: "A former senior adviser at the UN Economic Commission for Africa in Addis Ababa who brings deep expertise in African development policy. Her scholarly credentials, combined with her practical experience navigating the ECA and AU bureaucracies, make her a powerful advocate for Nigeria's continental agenda from the heart of African diplomacy.",
    education: "University of Nigeria Nsukka (Economics), Addis Ababa University (PhD Development Studies)",
    competence: 78, languageSkills: ["French"],
    qualifiedFor: ["amb-ethiopia", "amb-kenya", "amb-senegal"],
    competencies: {
      professional: { economics: 75, diplomacy: 80, security: 32, communications: 50, legal: 55, administration: 60, technology: 40, management: 62, politics: 71 },
      personal: { loyalty: 65, charisma: 68, leadership: 62, ambition: 58, integrity: 85, resilience: 65, intrigue: 22, discretion: 76 },
    },
  },
  {
    name: "Nuhu Tanko Yakasai",
    state: "Kano", zone: "NW", age: 65, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "NY",
    traits: ["Former Governor", "Political Appointee", "AU Veteran"],
    bio: "A former Governor of Kano State who transitioned to continental diplomacy, serving on several AU High-Level Panels. His political stature, familiarity with heads of state across the continent, and his experience chairing AU election observer missions give him the gravitas and network to represent Nigeria effectively in Addis Ababa.",
    education: "Bayero University Kano (Public Administration), Harvard Kennedy School (MPA)",
    competence: 80, languageSkills: ["None"],
    qualifiedFor: ["amb-ethiopia", "amb-kenya", "amb-ghana"],
    competencies: {
      professional: { economics: 60, diplomacy: 78, security: 48, communications: 65, legal: 55, administration: 75, technology: 32, management: 86, politics: 83 },
      personal: { loyalty: 55, charisma: 80, leadership: 85, ambition: 70, integrity: 60, resilience: 65, intrigue: 55, discretion: 69 },
    },
  },
  {
    name: "Blessing Okonkwo Agbani",
    state: "Delta", zone: "SS", age: 47, gender: "Female", religion: "Christianity", ethnicity: "Urhobo", avatar: "BA",
    traits: ["Trade Negotiator", "Tech Industry Ties", "Career Diplomat"],
    bio: "A career diplomat who served as Economic Counsellor at Nigeria's Mission to the AU, focusing on the African Continental Free Trade Area negotiations. Her expertise in continental trade architecture and her growing network in Addis Ababa's tech-savvy diplomatic community make her a forward-looking choice for this pivotal posting.",
    education: "Delta State University (Economics), Ethiopian Civil Service University (MA Trade Policy), LSE (MSc International Political Economy)",
    competence: 76, languageSkills: ["None"],
    qualifiedFor: ["amb-ethiopia", "amb-kenya", "amb-ghana", "amb-ivory-coast"],
    competencies: {
      professional: { economics: 80, diplomacy: 76, security: 30, communications: 48, legal: 55, administration: 58, technology: 62, management: 52, politics: 61 },
      personal: { loyalty: 62, charisma: 68, leadership: 58, ambition: 72, integrity: 70, resilience: 65, intrigue: 30, discretion: 62 },
    },
  },
  {
    name: "Adamu Bello Wase",
    state: "Plateau", zone: "NC", age: 54, gender: "Male", religion: "Islam", ethnicity: "Hausa", avatar: "AW",
    traits: ["Security Specialist", "Career Diplomat", "AU Veteran"],
    bio: "A former Defence Attaché at Nigeria's Mission to the AU who later transitioned to civilian diplomatic service. His expertise in the African Peace and Security Architecture, including the AU Peace and Security Council and the African Standby Force, makes him essential for a posting where Nigeria's security leadership on the continent is paramount.",
    education: "Nigerian Defence Academy Kaduna, National Defence College Abuja, Institute for Peace and Security Studies Addis Ababa (MA)",
    competence: 79, languageSkills: ["French"],
    qualifiedFor: ["amb-ethiopia", "amb-chad", "amb-kenya", "amb-cameroon"],
    competencies: {
      professional: { economics: 40, diplomacy: 78, security: 82, communications: 35, legal: 48, administration: 65, technology: 35, management: 77, politics: 80 },
      personal: { loyalty: 80, charisma: 55, leadership: 72, ambition: 52, integrity: 74, resilience: 80, intrigue: 40, discretion: 85 },
    },
  },
];
