// unionLeaderPool.ts — Union leader candidate pool (30+ characters)

import type { UnionPositionId } from "./unionTypes";

export interface UnionLeaderCandidate {
  name: string;
  age: number;
  state: string;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  tradeOff: string;
  competencies: {
    professional: {
      economics: number;
      diplomacy: number;
      security: number;
      communications: number;
      legal: number;
      administration: number;
      technology: number;
      management: number;
      politics: number;
    };
    personal: {
      loyalty: number;
      charisma: number;
      leadership: number;
      ambition: number;
      integrity: number;
      resilience: number;
      intrigue: number;
      discretion: number;
    };
  };
  qualifiedFor: UnionPositionId[];
  strikeReadiness: number; // 0–100: how likely to call strikes
  influence: number;       // 0–100: how much political weight they carry
  honorific?: string;
  traditionalTitle?: string;
  professionalBackground?: string;
  previousOffices?: string[];
  healthStatus?: "healthy" | "declining" | "critical";
  foreignConnections?: string[];
  avatarId?: string;
}

export const UNION_LEADER_CANDIDATES: UnionLeaderCandidate[] = [

  // ── Teachers Union (NUT / ASUU) ───────────────────────────────────────────

  {
    // Veteran union boss
    name: "Comr. Ikenna Okafor",
    age: 58,
    state: "Anambra",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "IO",
    traits: ["Veteran Boss", "Confrontational", "Passionate", "Stubborn"],
    bio: "Spent 32 years inside NUT and ASUU, rising through branch secretary, zonal coordinator, and national executive. Led the landmark 2017 ASUU strike that secured ₦1.3 trillion for university revitalisation. His name alone causes Finance Ministry officials to shudder.",
    education: "UNIZIK (BA Education), Lagos (MEd)",
    tradeOff: "Near-guaranteed wage compliance from lecturers, but he will call industrial action at the first sign of breach. Impossible to appease with soft gestures.",
    competencies: {
      professional: { economics: 52, diplomacy: 38, security: 20, communications: 65, legal: 44, administration: 55, technology: 22, management: 76, politics: 55 },
      personal: { loyalty: 55, charisma: 70, leadership: 80, ambition: 60, integrity: 72, resilience: 85, intrigue: 40, discretion: 87 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-teachers-union"],
    strikeReadiness: 82,
    influence: 78,
  },

  {
    // Moderate pragmatist
    name: "Dr. Hauwa Abdullahi-Musa",
    age: 51,
    state: "Kaduna",
    gender: "Female",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "HA",
    traits: ["Pragmatist", "Moderate", "Policy-Driven", "Consensus-Builder"],
    bio: "Former Education Commissioner in Kaduna who restructured primary teacher pay scales without a single strike. Now NUT North-West Zonal Chair. Known for negotiating off-cycle salary reviews through quiet back-channel talks with state governors. Published two papers on teacher welfare in federal universities.",
    education: "ABU Zaria (BEd, MEd, PhD Curriculum Studies)",
    tradeOff: "Cooperative partner for reform — but her moderate stance alienates ASUU hardliners who may splinter from negotiations if she leads.",
    competencies: {
      professional: { economics: 65, diplomacy: 75, security: 18, communications: 48, legal: 55, administration: 72, technology: 40, management: 66, politics: 69 },
      personal: { loyalty: 68, charisma: 55, leadership: 70, ambition: 45, integrity: 80, resilience: 62, intrigue: 30, discretion: 66 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-teachers-union"],
    strikeReadiness: 25,
    influence: 62,
  },

  {
    // Youth firebrand
    name: "Comr. Seun Adegbite",
    age: 34,
    state: "Ogun",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "SA",
    traits: ["Firebrand", "Digital Organiser", "Impulsive", "Magnetic"],
    bio: "Youngest ever ASUU branch chairman, at the University of Agriculture, Abeokuta. Built a Twitter following of 280,000 and livestreamed strike picket lines to national audience. His #PayOurLecturers campaign trended for 11 days straight. Called three strikes in four years — each shorter than expected but maximum disruption.",
    education: "UNAAB (BSc Agric Economics), partial MSc (suspended over ASUU dispute)",
    tradeOff: "Enormous social media leverage and ability to mobilise young teachers overnight. Will escalate every dispute to a strike before diplomacy is exhausted.",
    competencies: {
      professional: { economics: 35, diplomacy: 28, security: 15, communications: 88, legal: 30, administration: 38, technology: 72, management: 52, politics: 33 },
      personal: { loyalty: 42, charisma: 85, leadership: 65, ambition: 88, integrity: 58, resilience: 70, intrigue: 55, discretion: 64 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-teachers-union"],
    strikeReadiness: 90,
    influence: 52,
  },

  {
    // Technocrat
    name: "Prof. Ngozi Amaechi-Obi",
    age: 55,
    state: "Rivers",
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Ikwere",
    avatar: "NA",
    traits: ["Technocrat", "Data-Driven", "Measured", "Academic"],
    bio: "Professor of Education Policy at University of Port Harcourt. Twice seconded to UNESCO education reform panels. Her 'Minimum Wage Adequacy Framework' is now referenced in every NUT wage negotiation brief. Prefers policy memos over megaphones but will not back down on evidence-based positions.",
    education: "UNIPORT (BEd, PhD Education Policy), Columbia (Visiting Scholar)",
    tradeOff: "Brings international credibility and durable negotiation frameworks. Slow to act — bureaucratic approach can frustrate rank-and-file who expect quick wins.",
    competencies: {
      professional: { economics: 72, diplomacy: 65, security: 15, communications: 42, legal: 60, administration: 78, technology: 55, management: 69, politics: 68 },
      personal: { loyalty: 62, charisma: 45, leadership: 68, ambition: 50, integrity: 85, resilience: 60, intrigue: 25, discretion: 69 },
    },
    honorific: "Prof.",
    qualifiedFor: ["chairman-teachers-union"],
    strikeReadiness: 38,
    influence: 65,
  },

  {
    // Political insider
    name: "Alh. Suleiman Ringim",
    age: 60,
    state: "Jigawa",
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "SR",
    traits: ["Political Insider", "Calculating", "Networked", "Discreet"],
    bio: "NUT Deputy President-General who has outlasted four federal governments by staying quietly useful to all of them. Former adviser to two education ministers. Knows how to hold strikes as leverage without actually calling them. His phone calls reach SSG and presidential aides directly.",
    education: "Bayero University Kano (BEd), NIPSS Kuru (Senior Executive Course)",
    tradeOff: "Can suppress industrial action and deliver teacher compliance in exchange for appointments and funding. His loyalty tracks government favour — not principle.",
    competencies: {
      professional: { economics: 58, diplomacy: 80, security: 25, communications: 45, legal: 62, administration: 70, technology: 30, management: 62, politics: 69 },
      personal: { loyalty: 40, charisma: 60, leadership: 65, ambition: 75, integrity: 38, resilience: 68, intrigue: 82, discretion: 47 },
    },
    honorific: "Alh.",
    qualifiedFor: ["chairman-teachers-union"],
    strikeReadiness: 20,
    influence: 80,
  },

  // ── Labour Union (NLC) ────────────────────────────────────────────────────

  {
    // Veteran union boss
    name: "Comr. Abdulwaheed Osagie",
    age: 63,
    state: "Edo",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Edo",
    avatar: "AO2",
    traits: ["Veteran Boss", "Feared", "Uncompromising", "Charismatic"],
    bio: "National Labour Congress lion. Led the 2012 fuel subsidy removal protests that paralysed Nigeria for 10 days and forced a partial reversal. Three decades inside NLC, from shop steward to Deputy President. His face is on protest banners in every geo-political zone. Cannot be bought — only outmanoeuvred.",
    education: "UNIBEN (BSc Political Science), ILO Turin Centre (Labour Administration)",
    tradeOff: "Maximum credibility with workers and ability to mobilise mass action in 24 hours. Any negotiation with him is public, adversarial, and will become headline news.",
    competencies: {
      professional: { economics: 58, diplomacy: 40, security: 28, communications: 78, legal: 52, administration: 60, technology: 20, management: 79, politics: 56 },
      personal: { loyalty: 60, charisma: 80, leadership: 85, ambition: 55, integrity: 78, resilience: 90, intrigue: 42, discretion: 90 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-labour-union"],
    strikeReadiness: 80,
    influence: 88,
  },

  {
    // Moderate pragmatist
    name: "Mrs. Yetunde Adesanya",
    age: 49,
    state: "Osun",
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "YA",
    traits: ["Moderate", "Strategic", "Diplomatic", "Persistent"],
    bio: "NLC National Women's Commission Chair for eight years. Negotiated the 2020 pandemic hardship allowance for 1.4 million civil servants without a strike day — only woman to have done so. Championed the integration of gig economy workers into NLC membership. Respected across party lines.",
    education: "OAU Ile-Ife (LLB/BL), ILO Turin (Labour Law)",
    tradeOff: "Pragmatic ally who will work within government frameworks. Lower strike leverage — radical NLC factions may declare her leadership illegitimate if she makes concessions.",
    competencies: {
      professional: { economics: 60, diplomacy: 80, security: 22, communications: 55, legal: 70, administration: 68, technology: 35, management: 63, politics: 67 },
      personal: { loyalty: 65, charisma: 62, leadership: 72, ambition: 50, integrity: 82, resilience: 68, intrigue: 38, discretion: 68 },
    },
    qualifiedFor: ["chairman-labour-union"],
    strikeReadiness: 28,
    influence: 62,
  },

  {
    // Youth firebrand
    name: "Comr. Emeka Obi-Nwosu",
    age: 36,
    state: "Imo",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "EO",
    traits: ["Firebrand", "Socialist", "Disruptive", "Electrifying"],
    bio: "Factory floor organiser who radicalised NLC's manufacturing wing in under three years. Gained national attention after livestreaming illegal factory conditions in Nnewi that went viral with 4M views. Quoted Lenin in the National Assembly gallery during a public hearing. Seen as either NLC's future or its nightmare.",
    education: "FUTO Owerri (BSc Industrial Chem), self-educated in labour economics",
    tradeOff: "Electric mobilisation capacity and deep worker trust. Near-zero appetite for compromise — deals made with him require immediate full delivery or face immediate reversal.",
    competencies: {
      professional: { economics: 42, diplomacy: 22, security: 18, communications: 85, legal: 35, administration: 40, technology: 60, management: 58, politics: 34 },
      personal: { loyalty: 48, charisma: 88, leadership: 70, ambition: 85, integrity: 65, resilience: 75, intrigue: 50, discretion: 73 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-labour-union"],
    strikeReadiness: 92,
    influence: 55,
  },

  {
    // Technocrat
    name: "Dr. Patience Nwachukwu",
    age: 54,
    state: "Cross River",
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Efik",
    avatar: "PN",
    traits: ["Technocrat", "Analytical", "Calm", "Evidence-Based"],
    bio: "NLC Research Director for 12 years before rising to Deputy Secretary-General. Co-authored the NLC's National Living Wage Brief submitted to the National Assembly in 2021. Former ILO consultant on collective bargaining. Prefers structured tripartite negotiations over strikes.",
    education: "UNICAL Calabar (BSc Economics), ILO Geneva (Labour Policy MSc), LSE (PhD Industrial Relations)",
    tradeOff: "Credible technocratic voice that international lenders respect. Viewed by radical wings as a government apologist — internal dissent could fragment NLC under her leadership.",
    competencies: {
      professional: { economics: 80, diplomacy: 68, security: 20, communications: 45, legal: 65, administration: 75, technology: 50, management: 60, politics: 62 },
      personal: { loyalty: 60, charisma: 50, leadership: 65, ambition: 45, integrity: 88, resilience: 62, intrigue: 28, discretion: 65 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-labour-union"],
    strikeReadiness: 35,
    influence: 60,
  },

  {
    // Political insider
    name: "Sen. Bello Maikudi (Rtd.)",
    age: 62,
    state: "Katsina",
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "BM2",
    traits: ["Political Insider", "Connected", "Opportunistic", "Smooth"],
    bio: "Retired senator who pivoted to NLC advisory board after losing a gubernatorial race. Retains direct lines to 14 federal ministers and both National Assembly presiding officers. Does not believe in strikes as a first resort — prefers envelope diplomacy. Has delivered wage agreements three previous governments couldn't negotiate.",
    education: "ABU Zaria (BSc Public Admin), Harvard Kennedy School (MPA)",
    tradeOff: "Exceptional back-channel access that can deliver salary agreements quietly. Workers view him as a career politician in a union suit — legitimacy could collapse under media scrutiny.",
    competencies: {
      professional: { economics: 60, diplomacy: 85, security: 35, communications: 52, legal: 58, administration: 65, technology: 28, management: 58, politics: 70 },
      personal: { loyalty: 38, charisma: 65, leadership: 60, ambition: 80, integrity: 32, resilience: 65, intrigue: 88, discretion: 44 },
    },
    honorific: "Sen.",
    qualifiedFor: ["chairman-labour-union"],
    strikeReadiness: 18,
    influence: 82,
  },

  // ── Trade Congress (TUC) ──────────────────────────────────────────────────

  {
    // Veteran union boss
    name: "Comr. Festus Osifo-Agbor",
    age: 57,
    state: "Delta",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Urhobo",
    avatar: "FO",
    traits: ["Veteran Boss", "Resilient", "Combative", "Principled"],
    bio: "TUC President-General and veteran of 14 major industrial disputes. Built TUC's Niger Delta affiliate network from 3 unions to 22. His tenure survived two attempts by the presidency to de-register him. Known for the phrase: 'We do not beg for rights, we take them.'",
    education: "Delta State University (BSc Economics), ILO Turin (Trade Union Management)",
    tradeOff: "Deep worker loyalty and proven strike machinery. Difficult to co-opt — any attempt to offer him personal sweeteners will end up in a press conference.",
    competencies: {
      professional: { economics: 55, diplomacy: 42, security: 25, communications: 72, legal: 48, administration: 58, technology: 22, management: 69, politics: 49 },
      personal: { loyalty: 62, charisma: 72, leadership: 82, ambition: 58, integrity: 80, resilience: 88, intrigue: 38, discretion: 83 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-trade-congress"],
    strikeReadiness: 78,
    influence: 82,
  },

  {
    // Moderate pragmatist
    name: "Mrs. Amara Nweze-Ikenna",
    age: 47,
    state: "Anambra",
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "AN",
    traits: ["Pragmatist", "Structured", "Strategic", "Diplomatic"],
    bio: "TUC Deputy Secretary-General and architect of the sector-by-sector collective bargaining framework adopted in 2019. Former corporate HR director who crossed to the union side after a mass retrenchment she refused to implement. Fluent in both boardroom and shop-floor language.",
    education: "UNIZIK (BSc Human Resource Mgt), Birmingham (MSc Industrial Relations)",
    tradeOff: "Can negotiate complex multi-sector agreements and maintain TUC internal cohesion. Low street credibility — perceived as too comfortable with management by industrial unions.",
    competencies: {
      professional: { economics: 68, diplomacy: 78, security: 18, communications: 50, legal: 65, administration: 75, technology: 45, management: 66, politics: 71 },
      personal: { loyalty: 65, charisma: 55, leadership: 68, ambition: 52, integrity: 78, resilience: 60, intrigue: 35, discretion: 63 },
    },
    qualifiedFor: ["chairman-trade-congress"],
    strikeReadiness: 30,
    influence: 58,
  },

  {
    // Youth firebrand
    name: "Comr. Zainab Dankwambo",
    age: 31,
    state: "Gombe",
    gender: "Female",
    religion: "Islam",
    ethnicity: "Fulani",
    avatar: "ZD",
    traits: ["Firebrand", "Fearless", "Tech-Savvy", "Idealistic"],
    bio: "Youngest person elected to TUC national executive. Paralegal background — used freedom of information requests to expose unpaid worker pensions at 14 state parastatals. Her 'Rights Not Rations' campaign signed up 60,000 new TUC members in eight months. Seen as a generational threat by the old guard.",
    education: "UNIJOS (LLB), bar exams pending",
    tradeOff: "Massive youth mobilisation and legal acumen for worker rights cases. Volatile — escalates disputes to litigation or street action before exhausting dialogue. Makes enemies quickly.",
    competencies: {
      professional: { economics: 38, diplomacy: 30, security: 18, communications: 82, legal: 68, administration: 42, technology: 70, management: 52, politics: 34 },
      personal: { loyalty: 45, charisma: 82, leadership: 65, ambition: 90, integrity: 72, resilience: 72, intrigue: 55, discretion: 70 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-trade-congress"],
    strikeReadiness: 88,
    influence: 48,
  },

  {
    // Technocrat
    name: "Mr. Dike Arinze-Udo",
    age: 52,
    state: "Abia",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "DA",
    traits: ["Technocrat", "Systematic", "Detail-Oriented", "Quiet Operator"],
    bio: "TUC Research and Policy Director for 10 years. Built the TUC's national wage database — the most referenced labour statistics source in Nigeria outside the NBS. Previously headed research at the NLC before switching to TUC. Quietly killed three exploitative labour regulations through parliamentary committee submissions.",
    education: "UNILAG (BSc Statistics), Ibadan (MSc Economics), SOAS London (PhD Labour Economics)",
    tradeOff: "Strong policy muscle and credibility with government technocrats. Lacks the charisma and grassroots network to deliver worker buy-in on hard compromises.",
    competencies: {
      professional: { economics: 85, diplomacy: 60, security: 18, communications: 40, legal: 62, administration: 78, technology: 58, management: 61, politics: 61 },
      personal: { loyalty: 62, charisma: 40, leadership: 60, ambition: 45, integrity: 85, resilience: 58, intrigue: 28, discretion: 64 },
    },
    qualifiedFor: ["chairman-trade-congress"],
    strikeReadiness: 42,
    influence: 58,
  },

  {
    // Political insider
    name: "Chief Idowu Fadahunsi",
    age: 64,
    state: "Ekiti",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "IF",
    traits: ["Political Insider", "Veteran", "Clever", "Well-Connected"],
    bio: "Spent three years as Special Adviser on Labour to a former president before returning to TUC leadership. Can get a bilateral meeting with the Labour Minister within 24 hours. Knows the ministry's budget line by line. Once averted a general strike by revealing a classified wage escrow the ministry had hidden from union negotiators.",
    education: "UI Ibadan (BA History), NIPSS Kuru (Senior Executive Programme)",
    tradeOff: "Exceptional ministerial access and ability to surface hidden government commitments. Will leverage TUC presidency as a springboard — governorship ambitions could distract him.",
    competencies: {
      professional: { economics: 58, diplomacy: 82, security: 30, communications: 55, legal: 52, administration: 68, technology: 25, management: 61, politics: 69 },
      personal: { loyalty: 40, charisma: 68, leadership: 65, ambition: 82, integrity: 38, resilience: 62, intrigue: 85, discretion: 44 },
    },
    honorific: "Chief",
    qualifiedFor: ["chairman-trade-congress"],
    strikeReadiness: 22,
    influence: 78,
  },

  // ── Youth Forum ───────────────────────────────────────────────────────────

  {
    // Veteran union boss
    name: "Comr. Abdullahi Maikano",
    age: 42,
    state: "Borno",
    gender: "Male",
    religion: "Islam",
    ethnicity: "Kanuri",
    avatar: "AM2",
    traits: ["Battle-Hardened", "Commanding", "Survivor", "Purposeful"],
    bio: "North-East youth forum leader who organised reconstruction youth brigades after the Boko Haram crisis displaced 2.4 million. Led five NYSC alumni associations into the Nigerian Youth Forum. Two assassination attempts have only made him more visible. Scar tissue earns him moral authority no slogan can match.",
    education: "UNIMAID (BA Political Science), NDU (Post-grad Conflict Resolution)",
    tradeOff: "Enormous credibility with North-East and post-conflict youth. His presence in any appointment signals serious government commitment to youth — but also attracts violent opposition from groups who see him as a threat.",
    competencies: {
      professional: { economics: 48, diplomacy: 52, security: 65, communications: 68, legal: 35, administration: 55, technology: 38, management: 76, politics: 61 },
      personal: { loyalty: 62, charisma: 75, leadership: 82, ambition: 60, integrity: 72, resilience: 92, intrigue: 45, discretion: 89 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-youth-forum"],
    strikeReadiness: 72,
    influence: 75,
  },

  {
    // Moderate pragmatist
    name: "Miss Chinwe Okonkwo",
    age: 33,
    state: "Enugu",
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "CO",
    traits: ["Moderate", "Organised", "Diplomatic", "Policy-Focused"],
    bio: "NYSC alumni network coordinator who built a digital jobs matching platform connecting 18,000 corps members to employers. Represented Nigerian youth at the AU Youth Summit twice. Managed a ₦500M federal youth enterprise grant programme with zero audit queries — a bureaucratic miracle.",
    education: "UNN Nsukka (BSc Econ), Warwick (MSc Development Economics)",
    tradeOff: "Competent, credible, and unlikely to embarrass the government. Lacks the street credibility to mobilise youth in genuine crisis; seen by radicals as establishment-adjacent.",
    competencies: {
      professional: { economics: 70, diplomacy: 72, security: 18, communications: 52, legal: 45, administration: 78, technology: 62, management: 83, politics: 85 },
      personal: { loyalty: 68, charisma: 55, leadership: 68, ambition: 52, integrity: 80, resilience: 58, intrigue: 30, discretion: 79 },
    },
    qualifiedFor: ["chairman-youth-forum"],
    strikeReadiness: 22,
    influence: 55,
  },

  {
    // Youth firebrand
    name: "Comr. Tunde Adebisi",
    age: 27,
    state: "Lagos",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "TA",
    traits: ["Firebrand", "Social Media Star", "Reckless Energy", "Fearless"],
    bio: "#EndSARS frontline organiser at Lekki Toll Gate. His Instagram Reels documenting police brutality drew 11M views in 72 hours. Arrested twice, released both times after international pressure. Deeply mistrustful of institutions but willing to work within them if it achieves concrete reform.",
    education: "LASU (BSc Mass Comm — incomplete, left during #EndSARS)",
    tradeOff: "Unmatched social media reach and youth mobilisation. Will publicly shame any government backsliding in real time. Impossible to contain once galvanised — may become a liability faster than an asset.",
    competencies: {
      professional: { economics: 28, diplomacy: 18, security: 22, communications: 92, legal: 30, administration: 25, technology: 80, management: 44, politics: 23 },
      personal: { loyalty: 35, charisma: 90, leadership: 60, ambition: 88, integrity: 60, resilience: 78, intrigue: 48, discretion: 70 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-youth-forum"],
    strikeReadiness: 92,
    influence: 58,
  },

  {
    // Technocrat
    name: "Dr. Aisha Musa-Suleiman",
    age: 38,
    state: "Kwara",
    gender: "Female",
    religion: "Islam",
    ethnicity: "Nupe",
    avatar: "AMS",
    traits: ["Technocrat", "Systematic", "Entrepreneurial", "Methodical"],
    bio: "Founder of the Nigerian Youth Innovation Lab — a Kwara-based accelerator that graduated 400 tech startups. Her 'Youth Employment Roadmap' policy paper was adopted (partially) by three state governments. Served on the Presidential Council on Youth Unemployment. Bridges the tech ecosystem and policy world credibly.",
    education: "UNILORIN (BSc Computer Science), MIT (PhD Technology Policy)",
    tradeOff: "Attracts tech-sector youth and international development funding. Limited grassroots organising network outside South-West and FCT urban corridors.",
    competencies: {
      professional: { economics: 72, diplomacy: 60, security: 15, communications: 55, legal: 40, administration: 72, technology: 88, management: 61, politics: 57 },
      personal: { loyalty: 60, charisma: 52, leadership: 68, ambition: 62, integrity: 82, resilience: 60, intrigue: 28, discretion: 62 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-youth-forum"],
    strikeReadiness: 30,
    influence: 60,
  },

  {
    // Political insider
    name: "Mr. Rotimi Akinsanya",
    age: 40,
    state: "Oyo",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "RA",
    traits: ["Political Insider", "Urbane", "Calculating", "Opportunistic"],
    bio: "Two-term NYCN chairman who leveraged youth forum positions into Senate aide appointments for 23 proteges. Master of the post-meeting WhatsApp group — nothing is decided in the meeting, everything is decided in his group. Ran a successful gubernatorial campaign for a patron, managing youth mobilisation across 15 LGAs.",
    education: "UI Ibadan (BA History), Henley Business School (MPA)",
    tradeOff: "Unparalleled youth network management and ability to deliver votes and rally turnout. His loyalty to the President is real but transactional — will renegotiate at perceived advantage.",
    competencies: {
      professional: { economics: 50, diplomacy: 78, security: 28, communications: 62, legal: 45, administration: 65, technology: 45, management: 62, politics: 70 },
      personal: { loyalty: 40, charisma: 70, leadership: 62, ambition: 85, integrity: 30, resilience: 58, intrigue: 88, discretion: 42 },
    },
    qualifiedFor: ["chairman-youth-forum"],
    strikeReadiness: 18,
    influence: 72,
  },

  // ── Petroleum Workers (PENGASSAN / NUPENG) ────────────────────────────────

  {
    // Veteran union boss
    name: "Comr. Tunde Folawiyo-Martins",
    age: 60,
    state: "Lagos",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "TF",
    traits: ["Veteran Boss", "Feared", "Strategic", "Oil Industry Icon"],
    bio: "PENGASSAN President who has led or been complicit in every major petroleum sector industrial action since 2005. The phrase 'NNPC shutdown' only leaves his mouth when he means it. Has survived three federal government de-registration attempts. Consulted by every incoming Petroleum Minister since 2011 — not because they want to, but because they must.",
    education: "UNILAG (BSc Chemical Engineering), ILO (Labour Administration)",
    tradeOff: "Indispensable to petroleum sector stability. Any government trying to bypass him faces guaranteed oil flow disruptions. Will demand significant policy concessions before lending formal support.",
    competencies: {
      professional: { economics: 62, diplomacy: 45, security: 35, communications: 72, legal: 50, administration: 65, technology: 48, management: 86, politics: 64 },
      personal: { loyalty: 55, charisma: 75, leadership: 88, ambition: 60, integrity: 70, resilience: 88, intrigue: 52, discretion: 88 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-petroleum-workers"],
    strikeReadiness: 78,
    influence: 90,
  },

  {
    // Moderate pragmatist
    name: "Engr. Fatima Bagudu",
    age: 48,
    state: "Kebbi",
    gender: "Female",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "FB2",
    traits: ["Pragmatist", "Technical", "Measured", "Respected"],
    bio: "NUPENG North-West Zonal Coordinator and Petroleum Engineer with 22 years at downstream refineries. Led the first female-chaired wage negotiation in NUPENG's 40-year history, achieving a 38% wage uplift without a single work stoppage. Bridges the technical workforce and the political union class with rare authority.",
    education: "ABU Zaria (BEng Petroleum), University of Aberdeen (MSc Oil and Gas Management)",
    tradeOff: "Rare ability to deliver petroleum sector stability — operators, engineers, and NNPC management all respect her technical grounding. Struggles to hold PENGASSAN militant Lagos locals who see her as soft.",
    competencies: {
      professional: { economics: 65, diplomacy: 72, security: 28, communications: 48, legal: 55, administration: 70, technology: 72, management: 80, politics: 81 },
      personal: { loyalty: 68, charisma: 55, leadership: 70, ambition: 48, integrity: 82, resilience: 65, intrigue: 32, discretion: 84 },
    },
    honorific: "Engr.",
    qualifiedFor: ["chairman-petroleum-workers"],
    strikeReadiness: 28,
    influence: 62,
  },

  {
    // Youth firebrand
    name: "Comr. Ifeanyi Okafor-Duke",
    age: 35,
    state: "Rivers",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Ogoni",
    avatar: "ID",
    traits: ["Firebrand", "Environmental Justice", "Passionate", "Polarising"],
    bio: "NUPENG Port Harcourt local chairman who fused environmental justice with labour rights — something no petroleum union leader had done before. Coordinates with youth pipeline-watch groups. His rallies in the creeks draw crowds in dugout canoes. Seen as Ken Saro-Wiwa's spiritual successor by his base.",
    education: "UNIPORT (BSc Environmental Science), self-taught labour law",
    tradeOff: "Deep roots in Niger Delta communities and ability to link labour action with environmental grievances for double impact. Galvanises international NGO attention — which complicates bilateral oil negotiations.",
    competencies: {
      professional: { economics: 35, diplomacy: 25, security: 20, communications: 85, legal: 42, administration: 38, technology: 55, management: 43, politics: 22 },
      personal: { loyalty: 45, charisma: 88, leadership: 68, ambition: 82, integrity: 68, resilience: 78, intrigue: 52, discretion: 63 },
    },
    honorific: "Comr.",
    qualifiedFor: ["chairman-petroleum-workers"],
    strikeReadiness: 88,
    influence: 55,
  },

  {
    // Technocrat
    name: "Dr. Babatunde Adeleke",
    age: 53,
    state: "Ondo",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "BA",
    traits: ["Technocrat", "Industry Expert", "Methodical", "Low Profile"],
    bio: "Former NNPC Group General Manager who joined PENGASSAN advisory board after an early retirement. Authored the 'Workers' Stake in Energy Transition' report — the only credible Nigerian framework for protecting petroleum workers during the shift to renewables. Speaks fluently at Davos and at Warri market.",
    education: "OAU (BEng Chemical Engineering), Imperial College London (PhD Energy Systems)",
    tradeOff: "Policy sophistication that gives petroleum worker negotiations international legitimacy. Former NNPC background means militant NUPENG locals view him with deep suspicion.",
    competencies: {
      professional: { economics: 80, diplomacy: 65, security: 30, communications: 45, legal: 58, administration: 78, technology: 82, management: 70, politics: 70 },
      personal: { loyalty: 58, charisma: 48, leadership: 65, ambition: 50, integrity: 85, resilience: 62, intrigue: 30, discretion: 72 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-petroleum-workers"],
    strikeReadiness: 38,
    influence: 65,
  },

  {
    // Political insider
    name: "Alh. Buba Ringim-Waziri",
    age: 59,
    state: "Sokoto",
    gender: "Male",
    religion: "Islam",
    ethnicity: "Fulani",
    avatar: "BR",
    traits: ["Political Insider", "Smooth", "Patient", "Strategic"],
    bio: "PENGASSAN National Treasurer for 12 years before being eased out in a factional dispute. Maintains personal relationships with every Petroleum Minister since 1999 and with three IOC country managers. Orchestrated a quiet ₦12 billion pension liability resolution that never made the papers. Does not strike — he negotiates before it becomes necessary.",
    education: "UDUS Sokoto (BSc Accounting), ICAN Fellow",
    tradeOff: "Exceptional back-channel petroleum sector influence and financial management credibility. Seen as a former insider who may be managing union assets for personal benefit — audit trail is murky.",
    competencies: {
      professional: { economics: 68, diplomacy: 85, security: 32, communications: 42, legal: 55, administration: 72, technology: 35, management: 73, politics: 86 },
      personal: { loyalty: 38, charisma: 60, leadership: 60, ambition: 80, integrity: 30, resilience: 65, intrigue: 88, discretion: 55 },
    },
    honorific: "Alh.",
    qualifiedFor: ["chairman-petroleum-workers"],
    strikeReadiness: 15,
    influence: 80,
  },

  // ── Medical Association (NMA) ─────────────────────────────────────────────

  {
    // Veteran union boss
    name: "Dr. Kingsley Uwaifo",
    age: 59,
    state: "Edo",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Edo",
    avatar: "KU",
    traits: ["Veteran Boss", "Principled", "Feared", "Blunt"],
    bio: "NMA President twice over — the only person in the association's history to win re-election after calling a strike. Led the 2021 resident doctors' strike that brought teaching hospitals to a standstill for 62 days. Describes brain drain as 'a government-made famine' in interviews that regularly go viral. Federal health officials lose sleep when he speaks.",
    education: "UNIBEN (MBBS), WACP Fellow (Internal Medicine), Harvard (Health Leadership)",
    tradeOff: "Near-total credibility with Nigeria's medical workforce. Calling a national doctors' strike is constitutionally sensitive — associating the presidency with him signals seriousness on health sector reform.",
    competencies: {
      professional: { economics: 58, diplomacy: 42, security: 18, communications: 78, legal: 52, administration: 62, technology: 40, management: 70, politics: 48 },
      personal: { loyalty: 55, charisma: 75, leadership: 85, ambition: 58, integrity: 80, resilience: 88, intrigue: 40, discretion: 80 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-medical-association"],
    strikeReadiness: 75,
    influence: 85,
  },

  {
    // Moderate pragmatist
    name: "Dr. Amina Garba-Tukur",
    age: 46,
    state: "Bauchi",
    gender: "Female",
    religion: "Islam",
    ethnicity: "Fulani",
    avatar: "AG2",
    traits: ["Pragmatist", "Collaborative", "Respected", "Patient"],
    bio: "NMA North-East Zonal Chair who kept Bauchi teaching hospital running at 70% capacity during the 2021 strike through voluntary services — earning both NMA respect and Ministry gratitude. Her 'Medical Workforce Retention Strategy' briefing paper is cited in every federal health budget. Works the system from inside without betraying her colleagues.",
    education: "Bayero University Kano (MBBS), Liverpool (MPH), London School of Hygiene (PhD)",
    tradeOff: "Can hold the line on essential health services while negotiating — avoids the political damage of a full hospital shutdown. Radical house officers' factions see her as a compromiser and may organise parallel action.",
    competencies: {
      professional: { economics: 65, diplomacy: 80, security: 18, communications: 50, legal: 52, administration: 72, technology: 55, management: 74, politics: 78 },
      personal: { loyalty: 70, charisma: 58, leadership: 72, ambition: 45, integrity: 85, resilience: 65, intrigue: 30, discretion: 77 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-medical-association"],
    strikeReadiness: 22,
    influence: 60,
  },

  {
    // Youth firebrand
    name: "Dr. Oluwaseun Adeyemi",
    age: 32,
    state: "Ogun",
    gender: "Male",
    religion: "Christianity",
    ethnicity: "Yoruba",
    avatar: "OA",
    traits: ["Firebrand", "Diaspora Voice", "Angry", "Brilliant"],
    bio: "Resident doctor and NARD (National Association of Resident Doctors) Welfare Secretary. Tweets real-time from emergency wards — posts of broken equipment and 36-hour shifts with no meals have been retweeted by international medical bodies. Has personally counselled 200 junior doctors through emigration processes, knowing it embarrasses the system but refuses to pretend otherwise.",
    education: "UI Ibadan (MBBS), Membership of WACP (in progress)",
    tradeOff: "Voice of the junior doctor crisis that is hollowing out Nigerian hospitals. Will not pretend a half-measure is a solution. Mobilises house officers and residents effectively but has limited engagement with senior consultants.",
    competencies: {
      professional: { economics: 38, diplomacy: 25, security: 15, communications: 88, legal: 38, administration: 35, technology: 78, management: 43, politics: 24 },
      personal: { loyalty: 42, charisma: 85, leadership: 62, ambition: 85, integrity: 72, resilience: 75, intrigue: 48, discretion: 68 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-medical-association"],
    strikeReadiness: 90,
    influence: 50,
  },

  {
    // Technocrat
    name: "Prof. Nneka Obiechina",
    age: 57,
    state: "Enugu",
    gender: "Female",
    religion: "Christianity",
    ethnicity: "Igbo",
    avatar: "NO",
    traits: ["Technocrat", "Systematic", "International", "Credible"],
    bio: "Professor of Public Health and former WHO Nigeria Country Representative. Has served on the NMA's Health Systems Reform Committee for 11 years. Her 'Staffing Norms for Nigerian Tertiary Hospitals' document is the reference standard for federal budget allocations. Approaches every dispute as a systems failure to be corrected, not a war to be won.",
    education: "UNN (MBBS), Johns Hopkins (MPH), UCL (PhD Global Health)",
    tradeOff: "Brings the highest international credibility of any NMA figure. Slow to engage in worker grievances at the operational level — junior doctors see her as living in a WHO parallel reality.",
    competencies: {
      professional: { economics: 72, diplomacy: 70, security: 18, communications: 48, legal: 58, administration: 80, technology: 62, management: 83, politics: 83 },
      personal: { loyalty: 60, charisma: 48, leadership: 70, ambition: 48, integrity: 88, resilience: 60, intrigue: 22, discretion: 82 },
    },
    honorific: "Prof.",
    qualifiedFor: ["chairman-medical-association"],
    strikeReadiness: 30,
    influence: 68,
  },

  {
    // Political insider
    name: "Dr. Garba Shehu-Inuwa",
    age: 61,
    state: "Kano",
    gender: "Male",
    religion: "Islam",
    ethnicity: "Hausa",
    avatar: "GS",
    traits: ["Political Insider", "Veteran", "Connected", "Pragmatic"],
    bio: "NMA President-General emeritus. After his tenure, was appointed to the Presidential Advisory Committee on Health. His personal Rolodex includes the Coordinating Minister for Health, two Senate committee chairs, and the Director-General of the NHIA. Used his position to quietly negotiate the rollout of the Residency Training Fund without a public dispute.",
    education: "ABU Zaria (MBBS), Harvard Medical School (Health Policy Fellowship), NIPSS Kuru",
    tradeOff: "Extraordinary access to health policy machinery. Will use the NMA chairmanship as a base for further political ambitions. His back-channel resolutions are real but trade transparency for speed.",
    competencies: {
      professional: { economics: 62, diplomacy: 85, security: 28, communications: 52, legal: 55, administration: 72, technology: 38, management: 71, politics: 81 },
      personal: { loyalty: 38, charisma: 65, leadership: 65, ambition: 80, integrity: 35, resilience: 62, intrigue: 85, discretion: 51 },
    },
    honorific: "Dr.",
    qualifiedFor: ["chairman-medical-association"],
    strikeReadiness: 18,
    influence: 82,
  },

];
