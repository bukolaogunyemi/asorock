// client/src/lib/handcraftedCharacters.ts

// ── VP Candidates (8 — one per party) ──────────────────

export const VP_CANDIDATES = [
  {
    name: "Sen. Balarabe Dikko", age: 52, state: "Adamawa", faction: "Northern Establishment",
    gender: "Male" as const, party: "ADU",
    traits: ["Dealmaker", "Wealthy", "Cunning", "Charismatic"], avatar: "BD",
    bio: "Seasoned political operator with deep connections across the North. Former Chairman of the Senate Committee on Finance. Known for brokering impossible deals between warring factions. His political networks span Adamawa, Taraba, and Gombe.",
    education: "ABU Zaria (LLB), Georgetown (MBA)",
    family: "Married, 6 children. Wife chairs the Northern Women's Trust.",
    competencies: { charisma: 4, diplomacy: 5, economics: 3, military: 2, leadership: 4 },
  },
  {
    name: "Prof. Adeniyi Ogundare", age: 61, state: "Ogun", faction: "Yoruba Intelligentsia",
    gender: "Male" as const, party: "NDM",
    traits: ["Academic", "Technocrat", "Meticulous", "Reserved"], avatar: "AO",
    bio: "Former university vice-chancellor and World Bank consultant. Led Nigeria's first comprehensive education reform white paper. Speaks 4 languages. Lacks grassroots clout but carries immense credibility in international policy circles.",
    education: "UI Ibadan (PhD Economics), Harvard (Post-doc)",
    family: "Married, 3 children. Spouse is a retired High Court judge.",
    competencies: { charisma: 2, diplomacy: 4, economics: 5, military: 1, leadership: 3 },
  },
  {
    name: "Chief Adaeze Mbah", age: 48, state: "Anambra", faction: "South-East Business",
    gender: "Female" as const, party: "TLA",
    traits: ["Entrepreneur", "Pragmatist", "Resilient", "Visionary"], avatar: "AM",
    bio: "Industrialist who built a manufacturing empire spanning cement, textiles, and agro-processing. Would be the first female VP. Former President of the Manufacturers Association. Philanthropist with schools in 12 states.",
    education: "UNN Nsukka (Eng), LSE (MSc Finance)",
    family: "Married, 4 children. Husband is a retired diplomat.",
    competencies: { charisma: 4, diplomacy: 3, economics: 5, military: 1, leadership: 4 },
  },
  {
    name: "Alh. Garba Ringim", age: 57, state: "Kano", faction: "Northern Populist",
    gender: "Male" as const, party: "NSF",
    traits: ["Populist", "Islamic Scholar", "Fiery Orator", "Loyal"], avatar: "GR",
    bio: "Popular cleric-turned-politician who commands massive grassroots following in the North-West. Established 200+ free schools and clinics across Kano. His endorsement alone can swing 3 million votes.",
    education: "Islamic University of Medina, Bayero University Kano (MA)",
    family: "Married, 8 children. Prominent Tijjaniya brotherhood family.",
    competencies: { charisma: 5, diplomacy: 3, economics: 2, military: 1, leadership: 4 },
  },
  {
    name: "Dr. Dakoru Sekibo", age: 45, state: "Rivers", faction: "Niger Delta",
    gender: "Male" as const, party: "PAP",
    traits: ["Oil Expert", "Reformist", "Ambitious", "Polarising"], avatar: "DS",
    bio: "Former NNPC director who exposed a major crude oil swap scandal. Youngest ever Group Executive Director. Young, ambitious, and polarising — loved by reformists, feared by the old guard.",
    education: "UNIPORT (Petroleum Eng), MIT (PhD Energy Policy)",
    family: "Married, 2 children. Wife is a consultant surgeon.",
    competencies: { charisma: 3, diplomacy: 2, economics: 5, military: 1, leadership: 3 },
  },
  {
    name: "Gen. Bukar Monguno (Rtd.)", age: 64, state: "Borno", faction: "Military-Security",
    gender: "Male" as const, party: "HDP",
    traits: ["Disciplined", "Hawkish", "Stoic", "Commanding"], avatar: "BM",
    bio: "Retired army general and hero of the North-East counter-insurgency campaign. Carries military establishment support. Known for iron discipline and zero tolerance for corruption within his ranks.",
    education: "NDA Kaduna, NDC Abuja, Royal Military Academy Sandhurst",
    family: "Married, 5 children. Son serves in the Nigerian Air Force.",
    competencies: { charisma: 2, diplomacy: 2, economics: 1, military: 5, leadership: 5 },
  },
  {
    name: "Barr. Folake Bakare", age: 50, state: "Lagos", faction: "Lagos Elite",
    gender: "Female" as const, party: "UPA",
    traits: ["Legal Mind", "Networker", "Shrewd", "Articulate"], avatar: "FB",
    bio: "Senior Advocate of Nigeria with 25 years of corporate law practice. Well-connected in Lagos business circles and the judiciary. Her firm handled the largest M&A deal in West African history.",
    education: "UNILAG (LLB/BL), Oxford (BCL)",
    family: "Married, 3 children. Husband is CEO of a major bank.",
    competencies: { charisma: 3, diplomacy: 4, economics: 4, military: 1, leadership: 3 },
  },
  {
    name: "Hajiya Salamatu Tafawa", age: 46, state: "Sokoto", faction: "Northern Caucus",
    gender: "Female" as const, party: "PFC",
    traits: ["Bridge-Builder", "Grassroots", "Pragmatic", "Resilient"], avatar: "ST",
    bio: "Former Commissioner for Women's Affairs who built a network of women's political groups across 19 northern states. Bridges gender and regional gaps. First woman to chair a northern state's party congress.",
    education: "UDUS Sokoto (Public Admin), Ahmadu Bello University (MSc)",
    family: "Married, 5 children. From a prominent Sokoto scholarly family.",
    competencies: { charisma: 4, diplomacy: 4, economics: 2, military: 1, leadership: 4 },
  },
];

// ── Personal Assistant Candidates (5) ──────────────────

export const PA_CANDIDATES = [
  {
    name: "Somto Igwe", age: 29, state: "Enugu", gender: "Female" as const,
    traits: ["Digital Native", "Energetic", "Creative", "Impatient"], avatar: "SI",
    bio: "Gen-Z political strategist. Masters in Public Policy from LSE. Managed social media campaigns that reached 40M Nigerians. Fluent in Igbo, English, and French.",
    competencies: { communication: 5, discretion: 3, organisation: 4, networks: 3, crisis: 3 },
  },
  {
    name: "Tanko Haruna", age: 42, state: "Kaduna", gender: "Male" as const,
    traits: ["Protocol Expert", "Meticulous", "Discreet", "Old Guard"], avatar: "TH",
    bio: "Former State House protocol officer under three presidents. Knows every corridor, every back channel, and every contact worth knowing in Aso Rock. 18 years of service.",
    competencies: { communication: 3, discretion: 5, organisation: 5, networks: 5, crisis: 3 },
  },
  {
    name: "Kelechi Nnadi", age: 35, state: "Lagos", gender: "Female" as const,
    traits: ["Crisis Manager", "Cool-Headed", "Resourceful", "Private"], avatar: "KN",
    bio: "Ex-corporate communications head at a Big Four firm. Managed crises for Fortune 500 companies operating in Nigeria. Calm under pressure, gets things done quietly.",
    competencies: { communication: 4, discretion: 4, organisation: 4, networks: 3, crisis: 5 },
  },
  {
    name: "Kabiru Fagge", age: 38, state: "Kano", gender: "Male" as const,
    traits: ["Intelligence Background", "Watchful", "Loyal", "Calculating"], avatar: "KF",
    bio: "Former DSS operative with 12 years in counterintelligence. Understands the security apparatus from inside. Discreet, loyal, and reads people like open books.",
    competencies: { communication: 2, discretion: 5, organisation: 4, networks: 4, crisis: 4 },
  },
  {
    name: "Tejiri Okumagba", age: 33, state: "Delta", gender: "Female" as const,
    traits: ["Policy Wonk", "Analytical", "Detail-Oriented", "Idealistic"], avatar: "TO",
    bio: "Former aide to the Finance Minister. Fluent in economic policy and government budgeting. PhD candidate at Oxford. Built the ministry's first real-time budget tracking dashboard.",
    competencies: { communication: 4, discretion: 3, organisation: 5, networks: 2, crisis: 3 },
  },
];

// ── Appointment Positions (CoS, SGF, NSA, CEA, PA, MA — 2 candidates each) ──

export const APPOINTMENT_POSITIONS = [
  {
    position: "Chief of Staff", abbrev: "CoS",
    candidates: [
      {
        name: "Alh. Aminu Gwarzo", avatar: "AG", loyalty: 80, competence: 65,
        age: 62, state: "Kano", gender: "Male" as const,
        traits: ["Loyalist", "Gatekeeper", "Old Guard"],
        note: "Loyalist. Will guard your gate fiercely. 30 years in party politics.",
        bio: "Old-school political operator from Kano. Ran the party machinery during 3 election cycles. His loyalty is absolute but he tends to block access to the President.",
        competencies: { loyalty: 5, administration: 3, political: 4, discretion: 4, networks: 3 },
      },
      {
        name: "Dr. Chiamaka Ezekwesili", avatar: "CE", loyalty: 55, competence: 85,
        age: 47, state: "Enugu", gender: "Female" as const,
        traits: ["Technocrat", "Independent", "Efficient", "Reformist"],
        note: "Technocrat. Efficient but independent-minded. Former McKinsey partner.",
        bio: "Returned from a stellar career at McKinsey to serve. Restructured 3 federal agencies. Independent thinker who will push back on bad policy.",
        competencies: { loyalty: 3, administration: 5, political: 2, discretion: 4, networks: 4 },
      },
    ],
  },
  {
    position: "Secretary to the Government", abbrev: "SGF",
    candidates: [
      {
        name: "Sen. Kolawole Afolabi", avatar: "KA", loyalty: 70, competence: 72,
        age: 58, state: "Kwara", gender: "Male" as const,
        traits: ["Veteran", "Bureaucrat", "Connected", "Patient"],
        note: "Political veteran. Knows the bureaucracy inside out. 4 terms in the Senate.",
        bio: "Served 4 terms in the Senate and chaired the Appropriations Committee. Understands federal machinery intimately.",
        competencies: { loyalty: 4, administration: 4, political: 5, discretion: 3, networks: 4 },
      },
      {
        name: "Barr. Obiageli Arinze", avatar: "OA", loyalty: 60, competence: 78,
        age: 44, state: "Anambra", gender: "Female" as const,
        traits: ["Legal Scholar", "Moderniser", "Anti-Corruption", "Stubborn"],
        note: "Legal scholar. Will modernise governance processes. Anti-corruption crusader.",
        bio: "Constitutional law expert who redesigned the Anambra State governance framework. Will digitise government processes but may clash with old-guard civil servants.",
        competencies: { loyalty: 3, administration: 5, political: 2, discretion: 4, networks: 3 },
      },
    ],
  },
  {
    position: "National Security Adviser", abbrev: "NSA",
    candidates: [
      {
        name: "Gen. Kashim Damboa (Rtd.)", avatar: "KD", loyalty: 65, competence: 80,
        age: 59, state: "Borno", gender: "Male" as const,
        traits: ["Counter-Terrorism", "Hawkish", "Connected", "Methodical"],
        note: "Counter-terrorism specialist. Respected by the military brass.",
        bio: "Led counter-insurgency operations in the North-East. Trained at Sandhurst and the US War College. Deep relationships with Western intelligence agencies.",
        competencies: { loyalty: 3, administration: 4, political: 2, discretion: 5, networks: 4 },
      },
      {
        name: "AIG Isoken Aigbokhan (Rtd.)", avatar: "IA", loyalty: 58, competence: 76,
        age: 53, state: "Edo", gender: "Female" as const,
        traits: ["Intelligence Expert", "Community-Focused", "Diplomatic", "Tenacious"],
        note: "Former police intelligence chief. Focus on internal security and community policing.",
        bio: "Rose through the police ranks to lead the Force Intelligence Bureau. Pioneered community-police liaison programmes that reduced crime 30% in pilot states.",
        competencies: { loyalty: 3, administration: 4, political: 3, discretion: 4, networks: 4 },
      },
    ],
  },
  {
    position: "Chief Economic Adviser", abbrev: "CEA",
    candidates: [
      {
        name: "Prof. Nduka Soludo", avatar: "NS", loyalty: 45, competence: 90,
        age: 55, state: "Anambra", gender: "Male" as const,
        traits: ["Brilliant", "Ambitious", "Globally Connected", "Outspoken"],
        note: "Former CBN Deputy Gov. IMF will love this pick. May overshadow you.",
        bio: "Former Deputy Governor of the Central Bank. UN veteran. Author of 4 books on economic policy. The IMF and World Bank trust him implicitly.",
        competencies: { loyalty: 2, administration: 4, political: 2, discretion: 3, networks: 5 },
      },
      {
        name: "Dr. Hadiza Balarabe", avatar: "HB", loyalty: 70, competence: 74,
        age: 51, state: "Kaduna", gender: "Female" as const,
        traits: ["Steady Hand", "Fiscal Conservative", "Loyal", "Cautious"],
        note: "Continuity pick. Knows where the money is buried. Former Finance Minister.",
        bio: "Served as Finance Minister under the previous administration. Intimate knowledge of Nigeria's fiscal structure, debt obligations, and revenue pipelines.",
        competencies: { loyalty: 4, administration: 4, political: 3, discretion: 4, networks: 3 },
      },
    ],
  },
  {
    position: "Political Adviser", abbrev: "PA",
    candidates: [
      {
        name: "Chief Rotimi Balogun", avatar: "RB", loyalty: 75, competence: 60,
        age: 67, state: "Lagos", gender: "Male" as const,
        traits: ["Old Guard", "Grassroots", "Controversial", "Shrewd"],
        note: "Old guard. Controls South-West political machinery. Controversial past.",
        bio: "Party chieftain who has controlled South-West political machinery for 20 years. His grassroots network is unmatched. Controversial corruption case (later overturned) remains a liability.",
        competencies: { loyalty: 4, administration: 2, political: 5, discretion: 2, networks: 5 },
      },
      {
        name: "Hajiya Rahma Tsafe", avatar: "RT", loyalty: 68, competence: 67,
        age: 45, state: "Zamfara", gender: "Female" as const,
        traits: ["Mobiliser", "Bridge-Builder", "Pragmatic", "Well-Connected"],
        note: "Northern women's mobiliser. Bridges gender and regional gaps.",
        bio: "Former Minister of Humanitarian Affairs. Built a network of women's political groups across 19 northern states. Pragmatic and well-connected.",
        competencies: { loyalty: 3, administration: 3, political: 4, discretion: 3, networks: 4 },
      },
    ],
  },
  {
    position: "Media Adviser", abbrev: "MA",
    candidates: [
      {
        name: "Segun Ogundare", avatar: "SO", loyalty: 82, competence: 58,
        age: 56, state: "Ondo", gender: "Male" as const,
        traits: ["Attack Dog", "Combative", "Loyal", "Aggressive"],
        note: "Attack dog. Will defend you no matter what. Journalists despise him.",
        bio: "Former managing director of a major newspaper turned presidential spokesman. Known for combative press relations. Will defend the administration aggressively — but credibility with the press corps is near zero.",
        competencies: { loyalty: 5, administration: 2, political: 3, discretion: 2, networks: 3 },
      },
      {
        name: "Elohor Okumagba", avatar: "EO", loyalty: 50, competence: 85,
        age: 49, state: "Delta", gender: "Female" as const,
        traits: ["Credible", "Principled", "Respected", "Transparent"],
        note: "Respected journalist. Brings credibility but may push back on spin.",
        bio: "Award-winning journalist and moderator of the presidential debate. Immense credibility with Nigerian and international media. Will insist on transparency.",
        competencies: { loyalty: 2, administration: 4, political: 3, discretion: 4, networks: 5 },
      },
    ],
  },
];

// ── Journalists (15) ──────────────────────────────────

export const JOURNALISTS: {
  name: string;
  outlet: string;
  question: string;
  responses: { label: string; quality: "excellent" | "good" | "poor" | "terrible" }[];
}[] = [
  {
    name: "Adaeze Nwankwo", outlet: "Beacon Television",
    question: "Nigerians are paying triple for petrol since the subsidy removal. When will prices come down?",
    responses: [
      { label: "We have a phased plan to bring prices down within 90 days through the refinery pipeline.", quality: "excellent" },
      { label: "The pain is temporary — structural reforms will yield results soon.", quality: "good" },
      { label: "Prices are determined by market forces, not the presidency.", quality: "poor" },
      { label: "The previous government created this mess, not us.", quality: "terrible" },
    ],
  },
  {
    name: "Salisu Tsafe", outlet: "Northern Star",
    question: "Your Excellency, bandits killed 47 people in Zamfara last week. Is your security strategy working?",
    responses: [
      { label: "I have ordered an immediate surge of air assets and ground troops to Zamfara. We mourn every life lost.", quality: "excellent" },
      { label: "Our strategy is showing results in other zones — Zamfara will receive additional attention.", quality: "good" },
      { label: "Security challenges take time to resolve. We inherited a broken system.", quality: "poor" },
      { label: "The governors must take responsibility for their states' security.", quality: "terrible" },
    ],
  },
  {
    name: "Yetunde Oladipo", outlet: "The Daily Sentinel",
    question: "How do you respond to allegations that your Chief of Staff is blocking access to you?",
    responses: [
      { label: "My door is always open. I've instructed the CoS to ensure no legitimate concern is filtered out.", quality: "excellent" },
      { label: "The Chief of Staff manages a complex schedule — but I'm always accessible to my cabinet.", quality: "good" },
      { label: "I trust my Chief of Staff's judgment on who needs direct access.", quality: "poor" },
      { label: "That's an unfounded rumour spread by those denied appointments they didn't deserve.", quality: "terrible" },
    ],
  },
  {
    name: "Obinna Okoro", outlet: "Horizon News",
    question: "The Naira has fallen 40% since your inauguration. What is your plan to stabilise the currency?",
    responses: [
      { label: "We've engaged the CBN on a comprehensive FX reform package — expect clarity within 2 weeks.", quality: "excellent" },
      { label: "Currency adjustments are painful but necessary for long-term stability.", quality: "good" },
      { label: "The parallel market will stabilise as confidence returns.", quality: "poor" },
      { label: "Speculators are sabotaging the economy. We will find and prosecute them.", quality: "terrible" },
    ],
  },
  {
    name: "Hadiza Bichi", outlet: "Hausa Service Radio",
    question: "Northern farmers say they cannot afford fertiliser anymore. What relief is coming?",
    responses: [
      { label: "I'm launching a ₦50B fertiliser subsidy targeted at smallholder farmers in the North, effective next month.", quality: "excellent" },
      { label: "We're working with the Agriculture Ministry on a support package for northern farmers.", quality: "good" },
      { label: "Agriculture is primarily a state responsibility — governors should step up.", quality: "poor" },
      { label: "Nigerian farmers need to modernise and stop relying on government handouts.", quality: "terrible" },
    ],
  },
  {
    name: "Bamidele Taiwo", outlet: "The Spectator",
    question: "Your Excellency, you promised 30% women in cabinet. Your appointments so far suggest otherwise.",
    responses: [
      { label: "You're right to hold me accountable. The next round of appointments will correct this — I'm committed to 35%.", quality: "excellent" },
      { label: "We're at 22% currently and working to meet the target with upcoming vacancies.", quality: "good" },
      { label: "Appointments are based on merit, not quotas.", quality: "poor" },
      { label: "I don't make promises I can't keep — I said I'd try.", quality: "terrible" },
    ],
  },
  {
    name: "Nneka Anyanwu", outlet: "The Republic",
    question: "Will you publish your assets declaration publicly, as you promised during the campaign?",
    responses: [
      { label: "Absolutely. I will publish my full declaration within 30 days and urge my cabinet to do the same.", quality: "excellent" },
      { label: "I've submitted my declaration to the Code of Conduct Bureau as required by law.", quality: "good" },
      { label: "The law only requires submission, not publication. But we'll consider it.", quality: "poor" },
      { label: "Campaign rhetoric and governance are different realities.", quality: "terrible" },
    ],
  },
  {
    name: "Terhemba Aku", outlet: "Middle Belt Tribune",
    question: "The ASUU strike has kept students home for 4 months. What is your message to Nigerian students?",
    responses: [
      { label: "I've invited ASUU leadership to the Villa tomorrow. This strike ends this week — I guarantee it personally.", quality: "excellent" },
      { label: "We're in active negotiations with ASUU and expect resolution within 2 weeks.", quality: "good" },
      { label: "Both sides need to show flexibility. The government has made significant concessions.", quality: "poor" },
      { label: "ASUU strikes every year — it's become a bargaining tool, not a genuine grievance.", quality: "terrible" },
    ],
  },
  {
    name: "Ovie Erhie", outlet: "Niger Delta Voice",
    question: "Sir, there are rumours of a cabinet reshuffle within 90 days. Can you confirm?",
    responses: [
      { label: "Performance reviews are ongoing. Those who deliver will stay; those who don't will be replaced. Simple.", quality: "excellent" },
      { label: "I don't respond to rumours, but I expect the highest performance from every minister.", quality: "good" },
      { label: "My cabinet was carefully chosen. There are no immediate plans for changes.", quality: "poor" },
      { label: "Where did you hear this? Someone is leaking from within and I intend to find out who.", quality: "terrible" },
    ],
  },
  {
    name: "Falmata Mandara", outlet: "Sahel Report",
    question: "Your Excellency, the opposition claims you rigged the election. How do you respond?",
    responses: [
      { label: "The courts have spoken, the people have spoken. I extend an olive branch — let's build Nigeria together.", quality: "excellent" },
      { label: "I respect their right to challenge results through legal channels. The judiciary will decide.", quality: "good" },
      { label: "We won fair and square. The opposition should accept the will of the people.", quality: "poor" },
      { label: "Sore losers will always cry foul. The results are clear.", quality: "terrible" },
    ],
  },
  {
    name: "Idara Essien", outlet: "Eastern Tribune",
    question: "Transparency International says corruption has worsened since your inauguration. Your reaction?",
    responses: [
      { label: "We take this seriously. I've ordered the EFCC to publish quarterly prosecution reports for public accountability.", quality: "excellent" },
      { label: "Fighting corruption is a marathon, not a sprint. We've made progress on several fronts.", quality: "good" },
      { label: "International rankings don't capture the full picture of our anti-corruption efforts.", quality: "poor" },
      { label: "Transparency International has its own agenda. We don't answer to foreign organisations.", quality: "terrible" },
    ],
  },
  {
    name: "Damilola Ajala", outlet: "FreeWave Radio",
    question: "Your Special Adviser was caught on tape soliciting bribes. Will you sack him?",
    responses: [
      { label: "He has been suspended immediately pending investigation. No one in my government is above the law.", quality: "excellent" },
      { label: "I've seen the reports and ordered an investigation. Due process will be followed.", quality: "good" },
      { label: "I need to verify the authenticity of the tape before taking action.", quality: "poor" },
      { label: "Tapes can be fabricated. This looks like a political hit job.", quality: "terrible" },
    ],
  },
  {
    name: "Ebikabowei Koroye", outlet: "Creekside Monitor",
    question: "There are credible reports of human rights abuses by security forces in the South-East. Will you order an investigation?",
    responses: [
      { label: "I'm establishing an independent judicial panel to investigate all allegations. Human rights are non-negotiable.", quality: "excellent" },
      { label: "I've asked the NSA to compile a comprehensive report on the situation.", quality: "good" },
      { label: "Our security forces operate within rules of engagement. Isolated incidents don't reflect policy.", quality: "poor" },
      { label: "The South-East has elements that are threatening national unity. Security forces are doing their job.", quality: "terrible" },
    ],
  },
  {
    name: "Jumoke Fawehinmi", outlet: "Lagos Metropolitan",
    question: "Your infrastructure budget is ₦2.4T but revenue projections are ₦1.8T. How do you close the gap?",
    responses: [
      { label: "Through a blend of sovereign bonds, PPP arrangements, and the new digital economy tax — all detailed in our fiscal framework.", quality: "excellent" },
      { label: "We're exploring multiple financing options including concessionary loans from development partners.", quality: "good" },
      { label: "Revenue will improve as our economic reforms take effect.", quality: "poor" },
      { label: "Nigeria has never let budget deficits stop infrastructure development. We'll find the money.", quality: "terrible" },
    ],
  },
  {
    name: "Bashir Kangiwa", outlet: "Eagle Broadcasting",
    question: "Your Excellency, as a final question — what legacy do you want to leave after your tenure?",
    responses: [
      { label: "A Nigeria where every child can dream without limits — food security, quality education, and a stable economy. That is my covenant with you.", quality: "excellent" },
      { label: "I want to be remembered as the president who laid the foundation for Nigeria's industrial transformation.", quality: "good" },
      { label: "I'll let history judge. For now, I'm focused on the work ahead.", quality: "poor" },
      { label: "Legacy talk is premature. We just started.", quality: "terrible" },
    ],
  },
];

// ── Cabinet Roster (7 ministers) ───────────────────────

export const cabinetRoster = [
  { name: "Alh. Aminu Kazeem", portfolio: "Finance", loyalty: 78, competence: 85, ambition: 62, faction: "Northern Caucus", scandalRisk: "Low" as const, relationship: "Friendly" as const, avatar: "AK", age: 61, state: "Kano", gender: "Male" },
  { name: "Chief Adaeze Okonkwo", portfolio: "Petroleum", loyalty: 65, competence: 72, ambition: 88, faction: "South-East Bloc", scandalRisk: "High" as const, relationship: "Wary" as const, avatar: "AO", age: 54, state: "Anambra", gender: "Female" },
  { name: "Barr. Yetunde Akinwale", portfolio: "Justice", loyalty: 91, competence: 80, ambition: 45, faction: "Presidential Guard", scandalRisk: "Low" as const, relationship: "Friendly" as const, avatar: "YA", age: 49, state: "Lagos", gender: "Female" },
  { name: "Gen. Garba Tsafe (Rtd)", portfolio: "Defence", loyalty: 82, competence: 78, ambition: 55, faction: "Military Circle", scandalRisk: "Medium" as const, relationship: "Friendly" as const, avatar: "GT", age: 64, state: "Kaduna", gender: "Male" },
  { name: "Dr. Mwuese Agber", portfolio: "Health", loyalty: 70, competence: 90, ambition: 50, faction: "Technocrats", scandalRisk: "Low" as const, relationship: "Neutral" as const, avatar: "MA", age: 47, state: "Benue", gender: "Female" },
  { name: "Engr. Chinedu Nnadi", portfolio: "Works & Housing", loyalty: 60, competence: 68, ambition: 75, faction: "South-East Bloc", scandalRisk: "Medium" as const, relationship: "Wary" as const, avatar: "CN", age: 56, state: "Imo", gender: "Male" },
  { name: "Hon. Haruna Zurmi", portfolio: "Education", loyalty: 85, competence: 62, ambition: 70, faction: "Northern Caucus", scandalRisk: "Medium" as const, relationship: "Friendly" as const, avatar: "HZ", age: 52, state: "Zamfara", gender: "Male" },
];

// ── Cabinet Candidates (2 per portfolio) ─────────────

export const cabinetCandidates = {
  Finance: [
    { ...cabinetRoster[0], tradeOff: "Trusted by northern elites but will demand patronage spending." },
    { name: "Dr. Chiamaka Iweala", portfolio: "Finance", loyalty: 55, competence: 92, ambition: 70, faction: "Technocrats", scandalRisk: "Low" as const, relationship: "Neutral" as const, avatar: "CI", age: 48, state: "Enugu", gender: "Female", tradeOff: "IMF-credible reformer but lacks party loyalty." },
  ],
  Petroleum: [
    { ...cabinetRoster[1], tradeOff: "Strong industry contacts but high ambition and scandal exposure." },
    { name: "Alh. Salisu Argungu", portfolio: "Petroleum", loyalty: 80, competence: 65, ambition: 50, faction: "Northern Caucus", scandalRisk: "Low" as const, relationship: "Friendly" as const, avatar: "SA", age: 58, state: "Kebbi", gender: "Male", tradeOff: "Loyal party man but lacks technical depth." },
  ],
  Justice: [
    { ...cabinetRoster[2], tradeOff: "Deeply loyal and competent but will resist executive overreach." },
    { name: "Prof. Olumide Oyelaran", portfolio: "Justice", loyalty: 60, competence: 88, ambition: 72, faction: "South-West Alliance", scandalRisk: "Low" as const, relationship: "Neutral" as const, avatar: "OO", age: 55, state: "Ogun", gender: "Male", tradeOff: "Legal heavyweight but ambitious — may use the post as a platform." },
  ],
  Defence: [
    { ...cabinetRoster[3], tradeOff: "Military credibility and loyalty but comes with old-guard baggage." },
    { name: "Brig. Falmata Ngala (Rtd)", portfolio: "Defence", loyalty: 72, competence: 82, ambition: 60, faction: "Military Circle", scandalRisk: "Low" as const, relationship: "Neutral" as const, avatar: "FN", age: 52, state: "Borno", gender: "Female", tradeOff: "Counter-insurgency specialist. Reform-minded but untested in politics." },
  ],
  Health: [
    { ...cabinetRoster[4], tradeOff: "Top-tier competence but politically detached — won't fight for you." },
    { name: "Dr. Babatunde Ogundare", portfolio: "Health", loyalty: 82, competence: 72, ambition: 55, faction: "Presidential Guard", scandalRisk: "Medium" as const, relationship: "Friendly" as const, avatar: "BO", age: 50, state: "Osun", gender: "Male", tradeOff: "Loyal and experienced but lacks the technocratic edge." },
  ],
  "Works & Housing": [
    { ...cabinetRoster[5], tradeOff: "Engineering credentials but ambitious and ethically flexible." },
    { name: "Arc. Sadiya Ndayako", portfolio: "Works & Housing", loyalty: 75, competence: 78, ambition: 45, faction: "Northern Caucus", scandalRisk: "Low" as const, relationship: "Friendly" as const, avatar: "SN", age: 44, state: "Niger", gender: "Female", tradeOff: "Competent and loyal but appointing her may anger South-East bloc." },
  ],
  Education: [
    { ...cabinetRoster[6], tradeOff: "Party loyalist but mediocre track record on implementation." },
    { name: "Prof. Tolani Adeleke", portfolio: "Education", loyalty: 58, competence: 85, ambition: 60, faction: "South-West Alliance", scandalRisk: "Low" as const, relationship: "Neutral" as const, avatar: "TA", age: 51, state: "Ekiti", gender: "Female", tradeOff: "Academic heavyweight but weak party ties — faction balance shifts." },
  ],
};

// ── Key Characters (NPCs) ─────────────────────────────

export const keyCharacters = [
  { name: "Sen. Rotimi Balogun", portfolio: "Senate President", agenda: "Push constitutional reform to strengthen Senate powers over budget.", opinion: "Cautiously supportive — expects patronage.", loyalty: 62, competence: 74, ambition: 90, faction: "South-West Alliance", relationship: "Wary" as const, avatar: "RB", age: 67, state: "Ogun", gender: "Male" },
  { name: "Gov. Sani Lapai", portfolio: "Governors Forum Chair", agenda: "Leverage state allocations to build independent power base.", opinion: "Transactional — will cooperate for fiscal concessions.", loyalty: 50, competence: 70, ambition: 82, faction: "Northern Caucus", relationship: "Neutral" as const, avatar: "SL", age: 58, state: "Niger", gender: "Male" },
  { name: "Brig. Kashim Konduga (Rtd)", portfolio: "NSA", agenda: "Expand security apparatus under presidential mandate.", opinion: "Loyal but hawkish — pushing for emergency powers.", loyalty: 88, competence: 76, ambition: 60, faction: "Military Circle", relationship: "Friendly" as const, avatar: "KK", age: 62, state: "Borno", gender: "Male" },
  { name: "Hajia Hadiza Bichi", portfolio: "CBN Governor", agenda: "Maintain tight monetary policy despite political pressure.", opinion: "Technocratic independence — resists intervention.", loyalty: 55, competence: 92, ambition: 40, faction: "Technocrats", relationship: "Neutral" as const, avatar: "HB", age: 51, state: "Kano", gender: "Female" },
  { name: "Chief Ugochukwu Mbah", portfolio: "Party Chairman", agenda: "Control candidate selection for next election cycle.", opinion: "Publicly loyal; privately building alternative.", loyalty: 42, competence: 65, ambition: 95, faction: "South-East Bloc", relationship: "Hostile" as const, avatar: "UM", age: 63, state: "Enugu", gender: "Male" },
  { name: "Comrade Mwuese Tarka", portfolio: "Labour Leader", agenda: "Block fuel subsidy removal; mobilize street protests.", opinion: "Adversarial — will escalate without concessions.", loyalty: 20, competence: 80, ambition: 72, faction: "Youth Movement", relationship: "Hostile" as const, avatar: "MT", age: 38, state: "Benue", gender: "Female" },
];

// ── Intel Items (updated to remove real party references) ──

export const INTEL_ITEMS = [
  {
    id: "i1", title: "CLASSIFIED: Northern Arms Corridor",
    body: "DSS intercepts confirm a new weapons pipeline from Libya through Niger into Zamfara. Estimated 2,000 AK-47s crossed in the last month. The governor may be complicit.",
    actions: ["Acknowledge", "Assign to NSA", "Refer to Defence Council"],
  },
  {
    id: "i2", title: "CLASSIFIED: NNPC Revenue Shortfall",
    body: "Actual crude oil output is 1.21 mbpd — not the 1.42 mbpd officially reported. ₦340B monthly revenue gap. Previous administration buried the audit.",
    actions: ["Acknowledge", "Assign to EFCC", "Refer to Finance Minister"],
  },
  {
    id: "i3", title: "CLASSIFIED: Opposition Defection Plot",
    body: "Three opposition governors are in secret talks to defect to your party. Price: two ministerial slots and immunity from EFCC probes. Senate President is the broker.",
    actions: ["Acknowledge", "Assign to Political Adviser", "Reject Deal"],
  },
  {
    id: "i4", title: "CLASSIFIED: IMF Conditionality Memo",
    body: "IMF will demand full fuel subsidy removal + naira float as preconditions for the $3.4B facility. Failure to comply means credit downgrade within 90 days.",
    actions: ["Acknowledge", "Assign to CEA", "Refer to Cabinet"],
  },
  {
    id: "i5", title: "CLASSIFIED: Military Loyalty Assessment",
    body: "Army COAS is loyal but the GOCs in 1 Div (Kaduna) and 7 Div (Maiduguri) have been cultivated by a retired general with political ambitions.",
    actions: ["Acknowledge", "Assign to NSA", "Order Review"],
  },
  {
    id: "i6", title: "CLASSIFIED: CBN Dollar Reserve Crisis",
    body: "True foreign reserves are $24.1B — not $33.2B as published. $9.1B in forward contracts maturing in 60 days. Default risk is real.",
    actions: ["Acknowledge", "Assign to CBN Governor", "Refer to Emergency Council"],
  },
];
