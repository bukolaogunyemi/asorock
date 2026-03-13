import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBarSmall } from "@/components/CompetencyBar";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Newspaper,
  Shield,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Star,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const EDUCATION_OPTIONS = [
  "Secondary School Certificate",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Law Degree (LLB/BL)",
  "Military Academy Graduate",
];

const PARTIES = [
  { id: "APC", name: "All Progressives Congress", color: "hsl(153, 60%, 32%)", description: "Centre-right ruling party. Strong in the North and South-West." },
  { id: "PDP", name: "People's Democratic Party", color: "hsl(0, 60%, 50%)", description: "Centre-left opposition. Dominated politics 1999–2015." },
  { id: "LP", name: "Labour Party", color: "hsl(200, 60%, 45%)", description: "Third force. Youth-driven movement with urban base." },
  { id: "NNPP", name: "New Nigeria People's Party", color: "hsl(42, 70%, 50%)", description: "Regional party with Kano stronghold. Populist platform." },
  { id: "APGA", name: "All Progressives Grand Alliance", color: "hsl(280, 50%, 50%)", description: "South-East regional party. Igbo identity politics." },
];

const ERAS = [
  { id: "1999", label: "Fourth Republic Dawn (1999)", date: "29 May 1999", description: "Transition from military rule. Everything to build, nothing to lose." },
  { id: "2007", label: "Oil Boom Twilight (2007)", date: "29 May 2007", description: "Peak oil revenues but rising militancy in the Niger Delta." },
  { id: "2015", label: "Change Era (2015)", date: "29 May 2015", description: "First democratic transfer of power. Boko Haram crisis and oil crash." },
  { id: "2023", label: "Renewed Hope (2023)", date: "29 May 2023", description: "Post-pandemic recovery. Fuel subsidy removal. FX crisis." },
];

const VP_CANDIDATES = [
  {
    name: "Sen. Abubakar Atiku Jr.", age: 52, state: "Adamawa", faction: "Northern Establishment",
    gender: "Male" as const,
    traits: ["Dealmaker", "Wealthy", "Cunning", "Charismatic"], avatar: "AA",
    bio: "Seasoned political operator with deep connections across the North. Son of a former Vice President, he inherited vast political networks spanning Adamawa, Taraba, and Gombe. Former Chairman of the Senate Committee on Finance. Known for brokering impossible deals between warring factions.",
    education: "ABU Zaria (LLB), Georgetown (MBA)",
    family: "Married, 6 children. Wife chairs the Northern Women's Trust.",
    competencies: { charisma: 4, diplomacy: 5, economics: 3, military: 2, leadership: 4 },
  },
  {
    name: "Prof. Yemi Adeyemi", age: 61, state: "Ogun", faction: "Yoruba Intelligentsia",
    gender: "Male" as const,
    traits: ["Academic", "Technocrat", "Meticulous", "Reserved"], avatar: "YA",
    bio: "Former university vice-chancellor and World Bank consultant. Led Nigeria's first comprehensive education reform white paper. Speaks 4 languages. Lacks grassroots clout but carries immense credibility in international policy circles.",
    education: "UI Ibadan (PhD Economics), Harvard (Post-doc)",
    family: "Married, 3 children. Spouse is a retired High Court judge.",
    competencies: { charisma: 2, diplomacy: 4, economics: 5, military: 1, leadership: 3 },
  },
  {
    name: "Chief Ada Okafor", age: 48, state: "Anambra", faction: "South-East Business",
    gender: "Female" as const,
    traits: ["Entrepreneur", "Pragmatist", "Resilient", "Visionary"], avatar: "AO",
    bio: "Industrialist who built a manufacturing empire spanning cement, textiles, and agro-processing. Would be the first female VP. Strong private sector appeal. Former President of the Manufacturers Association of Nigeria. Philanthropist with schools in 12 states.",
    education: "UNEC Nsukka (Eng), LSE (MSc Finance)",
    family: "Married, 4 children. Husband is a retired diplomat.",
    competencies: { charisma: 4, diplomacy: 3, economics: 5, military: 1, leadership: 4 },
  },
  {
    name: "Alh. Sani Danladi", age: 57, state: "Kano", faction: "Northern Populist",
    gender: "Male" as const,
    traits: ["Populist", "Islamic Scholar", "Fiery Orator", "Loyal"], avatar: "SD",
    bio: "Popular cleric-turned-politician who commands massive grassroots following in the North-West. Established 200+ free schools and clinics across Kano. Former Special Adviser on Religious Affairs. His endorsement alone can swing 3 million votes.",
    education: "Islamic University of Medina, Bayero University Kano (MA)",
    family: "Married, 8 children. Prominent Tijjaniya brotherhood family.",
    competencies: { charisma: 5, diplomacy: 3, economics: 2, military: 1, leadership: 4 },
  },
  {
    name: "Dr. Emeka Nwosu", age: 45, state: "Rivers", faction: "Niger Delta",
    gender: "Male" as const,
    traits: ["Oil Expert", "Reformist", "Ambitious", "Polarising"], avatar: "EN",
    bio: "Former NNPC director who exposed the $2.1B crude oil swap scandal. Youngest ever Group Executive Director. Young, ambitious, and polarising — loved by reformists, feared by the old guard. Has international oil company connections.",
    education: "UNIPORT (Petroleum Eng), MIT (PhD Energy Policy)",
    family: "Married, 2 children. Wife is a consultant surgeon.",
    competencies: { charisma: 3, diplomacy: 2, economics: 5, military: 1, leadership: 3 },
  },
  {
    name: "Gen. Hassan Abdullahi (Rtd.)", age: 64, state: "Borno", faction: "Military-Security",
    gender: "Male" as const,
    traits: ["Disciplined", "Hawkish", "Stoic", "Commanding"], avatar: "HA",
    bio: "Retired army general and hero of the North-East counter-insurgency campaign. Commanded Operation Lafiya Dole during its most successful phase. Carries military establishment support. Known for iron discipline and zero tolerance for corruption within his ranks.",
    education: "NDA Kaduna, NDC Abuja, Royal Military Academy Sandhurst",
    family: "Married, 5 children. Son serves in the Nigerian Air Force.",
    competencies: { charisma: 2, diplomacy: 2, economics: 1, military: 5, leadership: 5 },
  },
  {
    name: "Barr. Funke Akindele", age: 50, state: "Lagos", faction: "Lagos Elite",
    gender: "Female" as const,
    traits: ["Legal Mind", "Networker", "Shrewd", "Articulate"], avatar: "FA",
    bio: "Senior Advocate of Nigeria with 25 years of corporate law practice. Well-connected in Lagos business circles and the judiciary. Former Chair of the NBA Section on Business Law. Her firm handled the largest M&A deal in West African history.",
    education: "UNILAG (LLB/BL), Oxford (BCL)",
    family: "Married, 3 children. Husband is CEO of a major bank.",
    competencies: { charisma: 3, diplomacy: 4, economics: 4, military: 1, leadership: 3 },
  },
];

const PA_CANDIDATES = [
  {
    name: "Amara Obi", age: 29, state: "Enugu", gender: "Female" as const,
    traits: ["Digital Native", "Energetic", "Creative", "Impatient"], avatar: "AO2",
    bio: "Gen-Z political strategist. Masters in Public Policy from LSE. Managed social media campaigns that reached 40M Nigerians. Former digital director at a top political consultancy. Fluent in Igbo, English, and French.",
    competencies: { communication: 5, discretion: 3, organisation: 4, networks: 3, crisis: 3 },
  },
  {
    name: "Musa Abdulkadir", age: 42, state: "Kaduna", gender: "Male" as const,
    traits: ["Protocol Expert", "Meticulous", "Discreet", "Old Guard"], avatar: "MA",
    bio: "Former State House protocol officer under three presidents. Knows every corridor, every back channel, and every contact worth knowing in Aso Rock. 18 years of service across multiple administrations. The institutional memory of the Villa.",
    competencies: { communication: 3, discretion: 5, organisation: 5, networks: 5, crisis: 3 },
  },
  {
    name: "Chidinma Eze", age: 35, state: "Lagos", gender: "Female" as const,
    traits: ["Crisis Manager", "Cool-Headed", "Resourceful", "Private"], avatar: "CE",
    bio: "Ex-corporate communications head at a Big Four firm. Managed crises for Fortune 500 companies operating in Nigeria. MBA from Lagos Business School. Calm under pressure, gets things done quietly. Known for making problems disappear.",
    competencies: { communication: 4, discretion: 4, organisation: 4, networks: 3, crisis: 5 },
  },
  {
    name: "Ibrahim Yusuf", age: 38, state: "Kano", gender: "Male" as const,
    traits: ["Intelligence Background", "Watchful", "Loyal", "Calculating"], avatar: "IY",
    bio: "Former DSS operative with 12 years in counterintelligence. Understands the security apparatus from inside. Discreet, loyal, and reads people like open books. Speaks Arabic and Hausa. Left the service voluntarily with a clean record.",
    competencies: { communication: 2, discretion: 5, organisation: 4, networks: 4, crisis: 4 },
  },
  {
    name: "Ngozi Okonjo", age: 33, state: "Delta", gender: "Female" as const,
    traits: ["Policy Wonk", "Analytical", "Detail-Oriented", "Idealistic"], avatar: "NO",
    bio: "Former aide to the Finance Minister. Fluent in economic policy and government budgeting. PhD candidate at Oxford. Built the ministry's first real-time budget tracking dashboard. Can translate complex policy into plain language.",
    competencies: { communication: 4, discretion: 3, organisation: 5, networks: 2, crisis: 3 },
  },
];

const APPOINTMENT_POSITIONS = [
  {
    position: "Chief of Staff",
    abbrev: "CoS",
    candidates: [
      {
        name: "Alh. Bashir Tofa", avatar: "BT", loyalty: 80, competence: 65,
        gender: "Male" as const,
        traits: ["Loyalist", "Gatekeeper", "Old Guard"],
        note: "Loyalist. Will guard your gate fiercely. 30 years in party politics. Former state chairman.",
        bio: "Old-school political operator from Kano. Ran the party machinery during 3 election cycles. His loyalty is absolute but he tends to block access to the President — even from allies.",
        competencies: { loyalty: 5, administration: 3, political: 4, discretion: 4, networks: 3 },
      },
      {
        name: "Dr. Ngozi Anya", avatar: "NA", loyalty: 55, competence: 85,
        gender: "Female" as const,
        traits: ["Technocrat", "Independent", "Efficient", "Reformist"],
        note: "Technocrat. Efficient but independent-minded. Former McKinsey partner.",
        bio: "Returned from a stellar career at McKinsey to serve. Restructured 3 federal agencies. Independent thinker who will push back on bad policy — which may create friction but protects the presidency.",
        competencies: { loyalty: 3, administration: 5, political: 2, discretion: 4, networks: 4 },
      },
    ],
  },
  {
    position: "Secretary to the Government",
    abbrev: "SGF",
    candidates: [
      {
        name: "Sen. Bukola Adewale", avatar: "BA", loyalty: 70, competence: 72,
        gender: "Male" as const,
        traits: ["Veteran", "Bureaucrat", "Connected", "Patient"],
        note: "Political veteran. Knows the bureaucracy inside out. 4 terms in the Senate.",
        bio: "Served 4 terms in the Senate and chaired the Appropriations Committee. Understands federal machinery intimately. Can navigate inter-agency rivalries and get memos moving through the system.",
        competencies: { loyalty: 4, administration: 4, political: 5, discretion: 3, networks: 4 },
      },
      {
        name: "Barr. Chioma Nnamdi", avatar: "CN", loyalty: 60, competence: 78,
        gender: "Female" as const,
        traits: ["Legal Scholar", "Moderniser", "Anti-Corruption", "Stubborn"],
        note: "Legal scholar. Will modernise governance processes. Anti-corruption crusader.",
        bio: "Constitutional law expert who redesigned the Anambra State governance framework. Published author on public administration reform. Will digitise government processes but may clash with old-guard civil servants.",
        competencies: { loyalty: 3, administration: 5, political: 2, discretion: 4, networks: 3 },
      },
    ],
  },
  {
    position: "National Security Adviser",
    abbrev: "NSA",
    candidates: [
      {
        name: "Gen. Tukur Yusuf (Rtd.)", avatar: "TY", loyalty: 65, competence: 80,
        gender: "Male" as const,
        traits: ["Counter-Terrorism", "Hawkish", "Connected", "Methodical"],
        note: "Counter-terrorism specialist. Respected by the military brass.",
        bio: "Led Operation Lafiya Dole Phase II. Trained at Sandhurst and the US War College. Deep relationships with Western intelligence agencies. Will advocate for expanded military budgets and emergency powers.",
        competencies: { loyalty: 3, administration: 4, political: 2, discretion: 5, networks: 4 },
      },
      {
        name: "AIG Patricia Etteh (Rtd.)", avatar: "PE", loyalty: 58, competence: 76,
        gender: "Female" as const,
        traits: ["Intelligence Expert", "Community-Focused", "Diplomatic", "Tenacious"],
        note: "Former police intelligence chief. Focus on internal security and community policing.",
        bio: "Rose through the police ranks to lead the Force Intelligence Bureau. Pioneered community-police liaison programmes that reduced crime 30% in pilot states. Focus on intelligence-led policing over military force.",
        competencies: { loyalty: 3, administration: 4, political: 3, discretion: 4, networks: 4 },
      },
    ],
  },
  {
    position: "Chief Economic Adviser",
    abbrev: "CEA",
    candidates: [
      {
        name: "Prof. Kingsley Moghalu", avatar: "KM", loyalty: 45, competence: 90,
        gender: "Male" as const,
        traits: ["Brilliant", "Ambitious", "Globally Connected", "Outspoken"],
        note: "Former CBN Deputy Gov. IMF will love this pick. May overshadow you.",
        bio: "Former Deputy Governor of the Central Bank. UN veteran. Author of 4 books on Nigerian economic policy. The IMF and World Bank trust him implicitly. Brilliant but his ambition and public profile may overshadow the presidency.",
        competencies: { loyalty: 2, administration: 4, political: 2, discretion: 3, networks: 5 },
      },
      {
        name: "Dr. Zainab Ahmed", avatar: "ZA", loyalty: 70, competence: 74,
        gender: "Female" as const,
        traits: ["Steady Hand", "Fiscal Conservative", "Loyal", "Cautious"],
        note: "Continuity pick. Knows where the money is buried. Former Finance Minister.",
        bio: "Served as Finance Minister under the previous administration. Intimate knowledge of Nigeria's fiscal structure, debt obligations, and revenue pipelines. Steady hand but critics say she lacks bold vision.",
        competencies: { loyalty: 4, administration: 4, political: 3, discretion: 4, networks: 3 },
      },
    ],
  },
  {
    position: "Political Adviser",
    abbrev: "PA",
    candidates: [
      {
        name: "Chief Bode George", avatar: "BG", loyalty: 75, competence: 60,
        gender: "Male" as const,
        traits: ["Old Guard", "Grassroots", "Controversial", "Shrewd"],
        note: "Old guard. Controls South-West political machinery. Controversial past.",
        bio: "Party chieftain who has controlled South-West political machinery for 20 years. His grassroots network is unmatched. However, his controversial corruption conviction (later overturned) remains a liability with the press.",
        competencies: { loyalty: 4, administration: 2, political: 5, discretion: 2, networks: 5 },
      },
      {
        name: "Hajiya Sadiya Farouq", avatar: "SF", loyalty: 68, competence: 67,
        gender: "Female" as const,
        traits: ["Mobiliser", "Bridge-Builder", "Pragmatic", "Well-Connected"],
        note: "Northern women's mobiliser. Bridges gender and regional gaps.",
        bio: "Former Minister of Humanitarian Affairs. Built a network of women's political groups across 19 northern states. Her appointment signals commitment to gender inclusion and northern engagement. Pragmatic and well-connected.",
        competencies: { loyalty: 3, administration: 3, political: 4, discretion: 3, networks: 4 },
      },
    ],
  },
  {
    position: "Media Adviser",
    abbrev: "MA",
    candidates: [
      {
        name: "Femi Adesina", avatar: "FA2", loyalty: 82, competence: 58,
        gender: "Male" as const,
        traits: ["Attack Dog", "Combative", "Loyal", "Aggressive"],
        note: "Attack dog. Will defend you no matter what. Journalists despise him.",
        bio: "Former managing director of The Sun newspaper turned presidential spokesman. Known for combative press relations. Will defend the administration aggressively on every front — but his credibility with the press corps is near zero.",
        competencies: { loyalty: 5, administration: 2, political: 3, discretion: 2, networks: 3 },
      },
      {
        name: "Kadaria Ahmed", avatar: "KA", loyalty: 50, competence: 85,
        gender: "Female" as const,
        traits: ["Credible", "Principled", "Respected", "Transparent"],
        note: "Respected journalist. Brings credibility but may push back on spin.",
        bio: "Award-winning journalist and moderator of the 2019 presidential debate. Immense credibility with Nigerian and international media. Will insist on transparency, which protects the presidency long-term but limits spin control.",
        competencies: { loyalty: 2, administration: 4, political: 3, discretion: 4, networks: 5 },
      },
    ],
  },
];

const PROMISES = [
  { id: "p1", text: "Reduce fuel prices within 90 days", category: "Economy" },
  { id: "p2", text: "Create 2 million jobs in Year 1", category: "Economy" },
  { id: "p3", text: "Stabilise the Naira exchange rate", category: "Economy" },
  { id: "p4", text: "Reform the tax system", category: "Economy" },
  { id: "p5", text: "Crush Boko Haram within 6 months", category: "Security" },
  { id: "p6", text: "End banditry in the North-West", category: "Security" },
  { id: "p7", text: "Overhaul the police force", category: "Security" },
  { id: "p8", text: "Free universal healthcare for under-5s", category: "Social" },
  { id: "p9", text: "30% women in cabinet positions", category: "Social" },
  { id: "p10", text: "National school feeding programme", category: "Social" },
  { id: "p11", text: "Anti-corruption war — no sacred cows", category: "Governance" },
  { id: "p12", text: "Restructure the federation", category: "Governance" },
  { id: "p13", text: "Electoral reform and e-voting", category: "Governance" },
  { id: "p14", text: "Judicial independence protection", category: "Governance" },
  { id: "p15", text: "Build national rail network", category: "Infrastructure" },
  { id: "p16", text: "24/7 electricity within 4 years", category: "Infrastructure" },
  { id: "p17", text: "National broadband coverage", category: "Infrastructure" },
  { id: "p18", text: "New national carrier airline", category: "Infrastructure" },
];

const INTEL_ITEMS = [
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
    body: "Three PDP governors are in secret talks to defect to your party. Price: two ministerial slots and immunity from EFCC probes. Senate President is the broker.",
    actions: ["Acknowledge", "Assign to Political Adviser", "Reject Deal"],
  },
  {
    id: "i4", title: "CLASSIFIED: IMF Conditionality Memo",
    body: "IMF will demand full fuel subsidy removal + naira float as preconditions for the $3.4B facility. Failure to comply means credit downgrade within 90 days.",
    actions: ["Acknowledge", "Assign to CEA", "Refer to Cabinet"],
  },
  {
    id: "i5", title: "CLASSIFIED: Military Loyalty Assessment",
    body: "Army COAS is loyal but the GOCs in 1 Div (Kaduna) and 7 Div (Maiduguri) have been cultivated by a retired general with political ambitions. Watch list: Gen. Danjuma faction.",
    actions: ["Acknowledge", "Assign to NSA", "Order Surveillance"],
  },
  {
    id: "i6", title: "CLASSIFIED: CBN Dollar Reserve Crisis",
    body: "True foreign reserves are $24.1B — not $33.2B as published. $9.1B in forward contracts maturing in 60 days. Default risk is real.",
    actions: ["Acknowledge", "Assign to CBN Governor", "Refer to Emergency Council"],
  },
];

// Journalists with contextual response options per question
const JOURNALISTS: {
  name: string;
  outlet: string;
  question: string;
  responses: { label: string; quality: "excellent" | "good" | "poor" | "terrible" }[];
}[] = [
  {
    name: "Amaka Obi-Egbuna", outlet: "Channels TV",
    question: "Nigerians are paying triple for petrol since the subsidy removal. When will prices come down?",
    responses: [
      { label: "We have a phased plan to bring prices down within 90 days through the Dangote refinery pipeline.", quality: "excellent" },
      { label: "The pain is temporary — structural reforms will yield results soon.", quality: "good" },
      { label: "Prices are determined by market forces, not the presidency.", quality: "poor" },
      { label: "The previous government created this mess, not us.", quality: "terrible" },
    ],
  },
  {
    name: "Musa Ibrahim", outlet: "Daily Trust",
    question: "Your Excellency, bandits killed 47 people in Zamfara last week. Is your security strategy working?",
    responses: [
      { label: "I have ordered an immediate surge of air assets and ground troops to Zamfara. We mourn every life lost.", quality: "excellent" },
      { label: "Our strategy is showing results in other zones — Zamfara will receive additional attention.", quality: "good" },
      { label: "Security challenges take time to resolve. We inherited a broken system.", quality: "poor" },
      { label: "The governors must take responsibility for their states' security.", quality: "terrible" },
    ],
  },
  {
    name: "Funke Olaode", outlet: "The Punch",
    question: "How do you respond to allegations that your Chief of Staff is blocking access to you?",
    responses: [
      { label: "My door is always open. I've instructed the CoS to ensure no legitimate concern is filtered out.", quality: "excellent" },
      { label: "The Chief of Staff manages a complex schedule — but I'm always accessible to my cabinet.", quality: "good" },
      { label: "I trust my Chief of Staff's judgment on who needs direct access.", quality: "poor" },
      { label: "That's an unfounded rumour spread by those denied appointments they didn't deserve.", quality: "terrible" },
    ],
  },
  {
    name: "Chidi Nwankwo", outlet: "Arise TV",
    question: "The Naira has fallen 40% since your inauguration. What is your plan to stabilise the currency?",
    responses: [
      { label: "We've engaged the CBN on a comprehensive FX reform package — expect clarity within 2 weeks.", quality: "excellent" },
      { label: "Currency adjustments are painful but necessary for long-term stability.", quality: "good" },
      { label: "The parallel market will stabilise as confidence returns.", quality: "poor" },
      { label: "Speculators are sabotaging the economy. We will find and prosecute them.", quality: "terrible" },
    ],
  },
  {
    name: "Hajiya Zainab Haruna", outlet: "BBC Hausa",
    question: "Northern farmers say they cannot afford fertiliser anymore. What relief is coming?",
    responses: [
      { label: "I'm launching a ₦50B fertiliser subsidy targeted at smallholder farmers in the North, effective next month.", quality: "excellent" },
      { label: "We're working with the Agriculture Ministry on a support package for northern farmers.", quality: "good" },
      { label: "Agriculture is primarily a state responsibility — governors should step up.", quality: "poor" },
      { label: "Nigerian farmers need to modernise and stop relying on government handouts.", quality: "terrible" },
    ],
  },
  {
    name: "Dele Momodu", outlet: "Ovation Magazine",
    question: "Your Excellency, you promised 30% women in cabinet. Your appointments so far suggest otherwise.",
    responses: [
      { label: "You're right to hold me accountable. The next round of appointments will correct this — I'm committed to 35%.", quality: "excellent" },
      { label: "We're at 22% currently and working to meet the target with upcoming vacancies.", quality: "good" },
      { label: "Appointments are based on merit, not quotas.", quality: "poor" },
      { label: "I don't make promises I can't keep — I said I'd try.", quality: "terrible" },
    ],
  },
  {
    name: "Kadaria Ahmed", outlet: "The Interview",
    question: "Will you publish your assets declaration publicly, as you promised during the campaign?",
    responses: [
      { label: "Absolutely. I will publish my full declaration within 30 days and urge my cabinet to do the same.", quality: "excellent" },
      { label: "I've submitted my declaration to the Code of Conduct Bureau as required by law.", quality: "good" },
      { label: "The law only requires submission, not publication. But we'll consider it.", quality: "poor" },
      { label: "Campaign rhetoric and governance are different realities.", quality: "terrible" },
    ],
  },
  {
    name: "Rufai Oseni", outlet: "TVC",
    question: "The ASUU strike has kept students home for 4 months. What is your message to Nigerian students?",
    responses: [
      { label: "I've invited ASUU leadership to the Villa tomorrow. This strike ends this week — I guarantee it personally.", quality: "excellent" },
      { label: "We're in active negotiations with ASUU and expect resolution within 2 weeks.", quality: "good" },
      { label: "Both sides need to show flexibility. The government has made significant concessions.", quality: "poor" },
      { label: "ASUU strikes every year — it's become a bargaining tool, not a genuine grievance.", quality: "terrible" },
    ],
  },
  {
    name: "Babajide Kolade-Otitoju", outlet: "TVC",
    question: "Sir, there are rumours of a cabinet reshuffle within 90 days. Can you confirm?",
    responses: [
      { label: "Performance reviews are ongoing. Those who deliver will stay; those who don't will be replaced. Simple.", quality: "excellent" },
      { label: "I don't respond to rumours, but I expect the highest performance from every minister.", quality: "good" },
      { label: "My cabinet was carefully chosen. There are no immediate plans for changes.", quality: "poor" },
      { label: "Where did you hear this? Someone is leaking from within and I intend to find out who.", quality: "terrible" },
    ],
  },
  {
    name: "Chamberlain Usoh", outlet: "Channels TV",
    question: "Your Excellency, the opposition claims you rigged the election. How do you respond?",
    responses: [
      { label: "The courts have spoken, the people have spoken. I extend an olive branch — let's build Nigeria together.", quality: "excellent" },
      { label: "I respect their right to challenge results through legal channels. The judiciary will decide.", quality: "good" },
      { label: "We won fair and square. The opposition should accept the will of the people.", quality: "poor" },
      { label: "Sore losers will always cry foul. The INEC results are clear.", quality: "terrible" },
    ],
  },
  {
    name: "Sani Tukur", outlet: "Premium Times",
    question: "Transparency International says corruption has worsened since your inauguration. Your reaction?",
    responses: [
      { label: "We take this seriously. I've ordered the EFCC to publish quarterly prosecution reports for public accountability.", quality: "excellent" },
      { label: "Fighting corruption is a marathon, not a sprint. We've made progress on several fronts.", quality: "good" },
      { label: "International rankings don't capture the full picture of our anti-corruption efforts.", quality: "poor" },
      { label: "Transparency International has its own agenda. We don't answer to foreign organisations.", quality: "terrible" },
    ],
  },
  {
    name: "Eniola Akinkuotu", outlet: "FIJ",
    question: "Your Special Adviser was caught on tape soliciting bribes. Will you sack him?",
    responses: [
      { label: "He has been suspended immediately pending investigation. No one in my government is above the law.", quality: "excellent" },
      { label: "I've seen the reports and ordered an investigation. Due process will be followed.", quality: "good" },
      { label: "I need to verify the authenticity of the tape before taking action.", quality: "poor" },
      { label: "Tapes can be fabricated. This looks like a political hit job.", quality: "terrible" },
    ],
  },
  {
    name: "Jackson Ude", outlet: "PointBlank News",
    question: "There are credible reports of human rights abuses by security forces in the South-East. Will you order an investigation?",
    responses: [
      { label: "I'm establishing an independent judicial panel to investigate all allegations. Human rights are non-negotiable.", quality: "excellent" },
      { label: "I've asked the NSA to compile a comprehensive report on the situation.", quality: "good" },
      { label: "Our security forces operate within rules of engagement. Isolated incidents don't reflect policy.", quality: "poor" },
      { label: "The South-East has elements that are threatening national unity. Security forces are doing their job.", quality: "terrible" },
    ],
  },
  {
    name: "Victoria Ibanga", outlet: "The Guardian",
    question: "Your infrastructure budget is ₦2.4T but revenue projections are ₦1.8T. How do you close the gap?",
    responses: [
      { label: "Through a blend of sovereign bonds, PPP arrangements, and the new digital economy tax — all detailed in our fiscal framework.", quality: "excellent" },
      { label: "We're exploring multiple financing options including concessionary loans from development partners.", quality: "good" },
      { label: "Revenue will improve as our economic reforms take effect.", quality: "poor" },
      { label: "Nigeria has never let budget deficits stop infrastructure development. We'll find the money.", quality: "terrible" },
    ],
  },
  {
    name: "Ahmed Shekarau Jr.", outlet: "NTA",
    question: "Your Excellency, as a final question — what legacy do you want to leave after your tenure?",
    responses: [
      { label: "A Nigeria where every child can dream without limits — food security, quality education, and a stable economy. That is my covenant with you.", quality: "excellent" },
      { label: "I want to be remembered as the president who laid the foundation for Nigeria's industrial transformation.", quality: "good" },
      { label: "I'll let history judge. For now, I'm focused on the work ahead.", quality: "poor" },
      { label: "Legacy talk is premature. We just started.", quality: "terrible" },
    ],
  },
];

const PLAYER_TRAITS = [
  { id: "charismatic", label: "Charismatic", description: "Natural ability to inspire and persuade" },
  { id: "ruthless", label: "Ruthless", description: "Willing to do whatever it takes to win" },
  { id: "intellectual", label: "Intellectual", description: "Policy-driven, values expertise over populism" },
  { id: "populist", label: "Populist", description: "Man/woman of the people, grassroots instincts" },
  { id: "pragmatic", label: "Pragmatic", description: "Flexible, willing to compromise for results" },
  { id: "idealist", label: "Idealist", description: "Principled to a fault, anti-corruption crusader" },
  { id: "calculating", label: "Calculating", description: "Strategic thinker, always three moves ahead" },
  { id: "generous", label: "Generous", description: "Builds loyalty through patronage and favours" },
  { id: "paranoid", label: "Paranoid", description: "Trusts no one completely, always watching" },
  { id: "decisive", label: "Decisive", description: "Makes quick decisions, hates dithering" },
];

const IDEOLOGIES = [
  { id: "free_market", label: "Free Market", description: "Privatise, deregulate, let markets decide" },
  { id: "statist", label: "Statist", description: "Strong government intervention in the economy" },
  { id: "nationalist", label: "Nationalist", description: "Nigeria first — protect local industry and sovereignty" },
  { id: "reformist", label: "Reformist", description: "Institutional reform, anti-corruption, modernisation" },
  { id: "federalist", label: "Federalist", description: "Restructure — more power to states and regions" },
  { id: "centralist", label: "Centralist", description: "Strong federal government, national unity above all" },
  { id: "pan_african", label: "Pan-Africanist", description: "Regional integration, ECOWAS leadership, African solidarity" },
  { id: "technocratic", label: "Technocratic", description: "Data-driven governance, merit over patronage" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Civilian Rule", description: "Forgiving economy, loyal allies, manageable crises. For learning the ropes." },
  { id: "standard", label: "Standard", description: "Balanced difficulty. Realistic challenges, some room for error." },
  { id: "hard", label: "Wartime President", description: "Hostile legislature, economic crisis, security emergencies from Day 1." },
  { id: "nightmare", label: "Nightmare", description: "Everything is on fire. Betrayal everywhere. Good luck." },
];

// ── Animation variants ───────────────────────────────────

const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ── Component ────────────────────────────────────────────

export default function OnboardingFlow() {
  const { toast } = useToast();
  const { startCampaign } = useGame();
  const [step, setStep] = useState(0);

  // Page 1: Player info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState<string>("55");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [education, setEducation] = useState("");

  // Page 2: Traits, Ideologies, Difficulty
  const [playerTraits, setPlayerTraits] = useState<string[]>([]);
  const [playerIdeologies, setPlayerIdeologies] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("standard");

  // Page 3: Party + Era
  const [party, setParty] = useState("");
  const [era, setEra] = useState("");

  // Page 3: VP
  const [vpName, setVpName] = useState("");
  const [vpIndex, setVpIndex] = useState(0);

  // Page 4: Election animation
  const [electionDone, setElectionDone] = useState(false);
  const [electionPercent, setElectionPercent] = useState(0);

  // Page 6: Promises
  const [selectedPromises, setSelectedPromises] = useState<string[]>([]);

  // Page 7: PA
  const [personalAssistant, setPersonalAssistant] = useState("");
  const [paIndex, setPaIndex] = useState(0);

  // Page 8: Appointments (carousel per position)
  const [appointments, setAppointments] = useState<Record<string, string>>({});
  const [appointmentStep, setAppointmentStep] = useState(0);
  const [appointmentCandidateIndex, setAppointmentCandidateIndex] = useState(0);

  // Page 9: Intel
  const [intelIndex, setIntelIndex] = useState(0);
  const [intelActions, setIntelActions] = useState<Record<string, string>>({});

  // Page 10: Media chat (one-at-a-time)
  const [mediaIndex, setMediaIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, string>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<string[]>([]);

  const next = useCallback(() => setStep((s) => s + 1), []);
  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // Election animation
  useEffect(() => {
    if (step === 5 && !electionDone) {
      let pct = 0;
      const interval = setInterval(() => {
        pct += 1;
        setElectionPercent(pct);
        if (pct >= 55) {
          clearInterval(interval);
          setTimeout(() => setElectionDone(true), 600);
        }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [step, electionDone]);

  // Finish onboarding
  const finishOnboarding = () => {
    const config = {
      firstName,
      lastName,
      age: Number(age),
      gender,
      stateOfOrigin,
      education,
      party,
      era: era as "1999" | "2007" | "2015" | "2023",
      vpName,
      personalAssistant,
      promises: selectedPromises,
      appointments,
      presidentName: `${firstName} ${lastName}`,
      origin: stateOfOrigin,
      traits: playerTraits,
      ideologies: playerIdeologies,
      difficulty: difficulty as "easy" | "standard" | "hard" | "nightmare",
    };
    startCampaign(config);
    toast({ title: `Welcome, ${gender === "Female" ? "Madam" : "Mr."} President`, description: "Your administration begins now." });
  };

  const togglePromise = (id: string) => {
    setSelectedPromises((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 10 ? [...prev, id] : prev
    );
  };

  const honorific = gender === "Female" ? "Madam" : "Mr.";
  const fullName = `${firstName} ${lastName}`.trim();

  const totalHandled = Object.keys(answeredQuestions).length + skippedQuestions.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-full max-w-3xl"
        >
          {/* ── Page 0: Animated Intro ─────────────────── */}
          {step === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center">
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.3 }}
                className="space-y-4"
              >
                <motion.p variants={staggerChild} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  The Nation Awaits Your Leadership
                </motion.p>
                <motion.h1
                  variants={staggerChild}
                  className="text-xl font-bold tracking-tight"
                  style={{ textShadow: "0 0 40px hsla(42, 70%, 50%, 0.3)" }}
                >
                  Aso Rock
                </motion.h1>
                <motion.p variants={staggerChild} className="text-sm text-muted-foreground max-w-md mx-auto">
                  A Presidential Governance Simulation
                </motion.p>
                <motion.p variants={staggerChild} className="text-xs text-muted-foreground/70 max-w-sm mx-auto italic leading-relaxed">
                  History will record the name of Nigeria's next president. Choose carefully — the nation is watching. Your name will be spoken in corridors of power.
                </motion.p>
                <motion.div variants={staggerChild} className="pt-4">
                  <div
                    className="h-0.5 w-32 mx-auto rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, hsl(42, 70%, 50%), transparent)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                <Button size="sm" onClick={next} className="gap-2">
                  Enter Game <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </div>
          )}

          {/* ── Page 1: Player Info ────────────────────── */}
          {step === 1 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Who Are You?</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Bola" className="text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tinubu" className="text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Age (35–80)</Label>
                    <Input type="number" min={35} max={80} value={age} onChange={(e) => setAge(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <div className="flex gap-2">
                      {(["Male", "Female"] as const).map((g) => (
                        <Button key={g} variant={gender === g ? "default" : "outline"} size="sm" className="flex-1 text-xs" onClick={() => setGender(g)}>
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">State of Origin</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={stateOfOrigin}
                      onChange={(e) => setStateOfOrigin(e.target.value)}
                    >
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Education</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    >
                      <option value="">Select education…</option>
                      {EDUCATION_OPTIONS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button
                    size="sm"
                    onClick={next}
                    disabled={!firstName || !lastName || !stateOfOrigin || !education || Number(age) < 35 || Number(age) > 80}
                  >
                    Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 2: Traits, Ideologies & Difficulty ────── */}
          {step === 2 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Define Your Character</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-5">
                {/* Traits */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Personality Traits <span className="text-muted-foreground/60">(pick 2–3)</span></p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PLAYER_TRAITS.map((t) => {
                      const selected = playerTraits.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          data-testid={`trait-${t.id}`}
                          className={`rounded-md border px-3 py-2 text-left transition-colors ${
                            selected
                              ? "border-[hsl(42,70%,50%)] bg-[hsl(42,70%,50%)]/10 text-foreground"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => {
                            setPlayerTraits((prev) =>
                              prev.includes(t.id)
                                ? prev.filter((x) => x !== t.id)
                                : prev.length < 3 ? [...prev, t.id] : prev
                            );
                          }}
                        >
                          <span className="text-xs font-medium">{t.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ideologies */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Political Ideology <span className="text-muted-foreground/60">(pick 1–2)</span></p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {IDEOLOGIES.map((ideo) => {
                      const selected = playerIdeologies.includes(ideo.id);
                      return (
                        <button
                          key={ideo.id}
                          data-testid={`ideology-${ideo.id}`}
                          className={`rounded-md border px-3 py-2 text-left transition-colors ${
                            selected
                              ? "border-[hsl(153,60%,32%)] bg-[hsl(153,60%,32%)]/10 text-foreground"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => {
                            setPlayerIdeologies((prev) =>
                              prev.includes(ideo.id)
                                ? prev.filter((x) => x !== ideo.id)
                                : prev.length < 2 ? [...prev, ideo.id] : prev
                            );
                          }}
                        >
                          <span className="text-xs font-medium">{ideo.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{ideo.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Difficulty Level</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.id}
                        data-testid={`difficulty-${d.id}`}
                        className={`rounded-md border px-3 py-2 text-left transition-colors ${
                          difficulty === d.id
                            ? "border-[hsl(42,70%,50%)] bg-[hsl(42,70%,50%)]/10 text-foreground ring-1 ring-[hsl(42,70%,50%)]"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                        }`}
                        onClick={() => setDifficulty(d.id)}
                      >
                        <span className="text-xs font-medium">{d.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button
                    size="sm"
                    onClick={next}
                    disabled={playerTraits.length < 2 || playerIdeologies.length < 1}
                  >
                    Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 3: Party + Era ────────────────────── */}
          {step === 3 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Choose Your Party & Era</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Political Party</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PARTIES.map((p) => (
                      <Card
                        key={p.id}
                        className={`cursor-pointer border transition-all ${party === p.id ? "ring-2" : "border-border hover:bg-muted/50"}`}
                        style={party === p.id ? { borderColor: p.color, boxShadow: `0 0 8px ${p.color}40` } : {}}
                        onClick={() => setParty(p.id)}
                      >
                        <CardContent className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-sm font-semibold">{p.id}</span>
                            <span className="text-xs text-muted-foreground">— {p.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Historical Era</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ERAS.map((e) => (
                      <Card
                        key={e.id}
                        className={`cursor-pointer border transition-all ${era === e.id ? "ring-2 ring-[hsl(42,70%,50%)] border-[hsl(42,70%,50%)]" : "border-border hover:bg-muted/50"}`}
                        onClick={() => setEra(e.id)}
                      >
                        <CardContent className="p-3 space-y-1">
                          <span className="text-sm font-semibold">{e.label}</span>
                          <p className="text-xs text-muted-foreground">{e.description}</p>
                          <Badge variant="outline" className="text-xs">{e.date}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button size="sm" onClick={next} disabled={!party || !era}>
                    Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 3: VP Selection (Swipeable Carousel) ── */}
          {step === 4 && (() => {
            const vp = VP_CANDIDATES[vpIndex];
            return (
              <Card className="border border-border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Choose Your Running Mate</CardTitle>
                    <span className="text-xs text-muted-foreground">{vpIndex + 1} / {VP_CANDIDATES.length}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">Your Vice President will shape governance and coalition dynamics. Swipe through candidates.</p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setVpIndex((i) => (i - 1 + VP_CANDIDATES.length) % VP_CANDIDATES.length)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={vpIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <Card className={`border transition-all ${vpName === vp.name ? "ring-2 ring-[hsl(42,70%,50%)] border-[hsl(42,70%,50%)]" : "border-border"}`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className={`rounded-full flex-shrink-0 ${vpName === vp.name ? "ring-2 ring-[hsl(42,70%,50%)]" : ""}`}>
                                <CharacterAvatar name={vp.name} initials={vp.avatar} size="lg" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{vp.name}</p>
                                <p className="text-xs text-muted-foreground">Age {vp.age} · {vp.state}</p>
                                <p className="text-xs text-muted-foreground">{vp.education}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">{vp.faction}</Badge>
                              {vp.traits.map((t) => (
                                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{vp.bio}</p>
                            <p className="text-xs text-muted-foreground italic">{vp.family}</p>

                            {/* 5-star competencies */}
                            <div className="border-t border-border pt-2 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Competencies</p>
                              {Object.entries(vp.competencies).map(([key, val]) => (
                                <CompetencyBarSmall key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>

                    <Button
                      variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setVpIndex((i) => (i + 1) % VP_CANDIDATES.length)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex justify-center gap-1.5">
                    {VP_CANDIDATES.map((_, i) => (
                      <button
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === vpIndex ? "w-4 bg-[hsl(42,70%,50%)]" : "w-1.5 bg-muted-foreground/30"}`}
                        onClick={() => setVpIndex(i)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                    <div className="flex gap-2">
                      <Button
                        variant={vpName === vp.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setVpName(vp.name);
                          toast({ title: "Running Mate Selected", description: `${vp.name} will be your Vice President.` });
                        }}
                      >
                        {vpName === vp.name ? <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Selected</> : "Select This Candidate"}
                      </Button>
                      <Button size="sm" onClick={next} disabled={!vpName}>
                        Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── Page 4: Election ───────────────────────── */}
          {step === 5 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Election Night</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <p className="text-xs text-muted-foreground">INEC is collating results from 176,846 polling units across 36 states and the FCT.</p>
                <div className="space-y-3">
                  {[
                    { label: `${party} — ${fullName}`, pct: electionPercent, color: PARTIES.find((p) => p.id === party)?.color ?? "hsl(153, 60%, 32%)", final: 55 },
                    { label: `${party === "PDP" ? "APC" : "PDP"} — Opp. Candidate`, pct: Math.min(28, Math.round(electionPercent * 0.51)), color: party === "PDP" ? "hsl(153, 60%, 32%)" : "hsl(0, 60%, 50%)", final: 28 },
                    { label: `${party === "LP" ? "PDP" : "LP"} — Third Force`, pct: Math.min(12, Math.round(electionPercent * 0.22)), color: party === "LP" ? "hsl(0, 60%, 50%)" : "hsl(200, 60%, 45%)", final: 12 },
                    { label: "Others", pct: Math.min(5, Math.round(electionPercent * 0.09)), color: "hsl(var(--muted-foreground))", final: 5 },
                  ].map((r) => (
                    <div key={r.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{r.label}</span>
                        <span className="text-sm font-bold tabular-nums">{electionDone ? r.final : r.pct}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: r.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${electionDone ? r.final : r.pct}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {electionDone && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <div className="rounded-lg border border-[hsl(153,60%,32%)] bg-[hsl(153,60%,32%)]/10 p-3 text-center space-y-1">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">INEC Declaration</p>
                      <p className="text-sm font-semibold">
                        {honorific} President {fullName} is hereby declared the winner of the Presidential Election.
                      </p>
                      <p className="text-xs text-muted-foreground">55% of valid votes cast · 25 of 36 states won</p>
                    </div>
                    <div className="flex justify-center">
                      <Button size="sm" onClick={next}>
                        Continue to Headlines <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Page 5: Media Blitz ────────────────────── */}
          {step === 6 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Newspaper className="h-4 w-4" /> Morning Headlines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-xs text-muted-foreground">The morning after. Every front page in Nigeria carries your name.</p>
                {[
                  { source: "The Punch", headline: `HISTORY MADE: ${gender === "Female" ? "First Female" : ""} ${stateOfOrigin} ${gender === "Female" ? "Woman" : "Native"} Wins Presidency on ${party} Ticket` },
                  { source: "Daily Trust", headline: `${lastName} Sweeps 25 States — Opposition Cries Foul` },
                  { source: "Vanguard", headline: `"I Will Not Let You Down" — President-Elect ${lastName} Addresses the Nation` },
                  { source: "BusinessDay", headline: `Markets Rally on ${lastName} Victory — Naira Firms, NSE Gains 3.2%` },
                  { source: "The Guardian", headline: `Era of ${ERAS.find((e) => e.id === era)?.label}: What ${lastName}'s ${party} Presidency Means for Nigeria` },
                ].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="rounded-lg border border-border p-3 space-y-1"
                  >
                    <Badge variant="outline" className="text-xs">{h.source}</Badge>
                    <p className="text-sm font-semibold">{h.headline}</p>
                  </motion.div>
                ))}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button size="sm" onClick={next}>
                    Proceed to Inauguration <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 6: Inauguration Promises ──────────── */}
          {step === 7 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Inauguration Day — Presidential Promises</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Standing at Eagle Square, you address 100 million viewers. Select exactly <strong>10</strong> promises for your inaugural address. ({selectedPromises.length}/10)
                </p>
                {["Economy", "Security", "Social", "Governance", "Infrastructure"].map((cat) => (
                  <div key={cat} className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{cat}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {PROMISES.filter((p) => p.category === cat).map((p) => {
                        const selected = selectedPromises.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            className={`text-left text-xs rounded-md border p-2 transition-all ${
                              selected
                                ? "border-[hsl(42,70%,50%)] bg-[hsl(42,70%,50%)]/10 text-foreground font-medium"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                            }`}
                            onClick={() => togglePromise(p.id)}
                          >
                            {selected && <CheckCircle className="h-3 w-3 inline mr-1 text-[hsl(42,70%,50%)]" />}
                            {p.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button size="sm" onClick={next} disabled={selectedPromises.length !== 10}>
                    Deliver Address <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 7: Personal Assistant (Swipeable Carousel) ── */}
          {step === 8 && (() => {
            const pa = PA_CANDIDATES[paIndex];
            return (
              <Card className="border border-border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Choose Your Personal Assistant</CardTitle>
                    <span className="text-xs text-muted-foreground">{paIndex + 1} / {PA_CANDIDATES.length}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">Your PA is the gatekeeper — the last voice you hear before every decision.</p>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setPaIndex((i) => (i - 1 + PA_CANDIDATES.length) % PA_CANDIDATES.length)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={paIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <Card className={`border transition-all ${personalAssistant === pa.name ? "ring-2 ring-[hsl(42,70%,50%)] border-[hsl(42,70%,50%)]" : "border-border"}`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <CharacterAvatar name={pa.name} initials={pa.avatar} size="lg" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{pa.name}</p>
                                <p className="text-xs text-muted-foreground">Age {pa.age} · {pa.state}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {pa.traits.map((t: string) => (
                                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{pa.bio}</p>

                            <div className="border-t border-border pt-2 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Competencies</p>
                              {Object.entries(pa.competencies).map(([key, val]) => (
                                <CompetencyBarSmall key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>

                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setPaIndex((i) => (i + 1) % PA_CANDIDATES.length)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex justify-center gap-1.5">
                    {PA_CANDIDATES.map((_, i) => (
                      <button key={i} className={`h-1.5 rounded-full transition-all ${i === paIndex ? "w-4 bg-[hsl(42,70%,50%)]" : "w-1.5 bg-muted-foreground/30"}`} onClick={() => setPaIndex(i)} />
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                    <div className="flex gap-2">
                      <Button
                        variant={personalAssistant === pa.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setPersonalAssistant(pa.name);
                          toast({ title: "PA Selected", description: `${pa.name} is now your Personal Assistant.` });
                        }}
                      >
                        {personalAssistant === pa.name ? <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Selected</> : "Select This PA"}
                      </Button>
                      <Button size="sm" onClick={next} disabled={!personalAssistant}>
                        Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── Page 8: First Appointments (Swipeable per position) ── */}
          {step === 9 && (() => {
            if (appointmentStep >= APPOINTMENT_POSITIONS.length) {
              return (
                <Card className="border border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> First Appointments — Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="rounded-lg border border-[hsl(153,60%,32%)] bg-[hsl(153,60%,32%)]/10 p-3 text-center">
                      <p className="text-sm font-semibold">All positions filled.</p>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(appointments).map(([pos, name]) => (
                        <div key={pos} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                          <span className="text-muted-foreground">{pos}</span>
                          <span className="font-medium">{name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center pt-2">
                      <Button size="sm" onClick={next}>
                        Continue to Intelligence Briefing <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            const pos = APPOINTMENT_POSITIONS[appointmentStep];
            const candidate = pos.candidates[appointmentCandidateIndex];

            return (
              <Card className="border border-border">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Appoint: {pos.position} ({pos.abbrev})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {/* Progress bar */}
                  <div className="flex gap-1 mb-2">
                    {APPOINTMENT_POSITIONS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i < appointmentStep ? "bg-[hsl(153,60%,32%)]" : i === appointmentStep ? "bg-[hsl(42,70%,50%)]" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Position {appointmentStep + 1} of {APPOINTMENT_POSITIONS.length} — Candidate {appointmentCandidateIndex + 1} of {pos.candidates.length}
                  </p>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setAppointmentCandidateIndex((i) => (i - 1 + pos.candidates.length) % pos.candidates.length)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${appointmentStep}-${appointmentCandidateIndex}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <Card className="border border-border">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <CharacterAvatar name={candidate.name} initials={candidate.avatar} size="lg" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{candidate.name}</p>
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                  <span>Loyalty: {candidate.loyalty}</span>
                                  <span>Competence: {candidate.competence}</span>
                                </div>
                              </div>
                            </div>
                            {candidate.traits && candidate.traits.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {candidate.traits.map((t: string) => (
                                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">{candidate.bio}</p>
                            <p className="text-xs text-muted-foreground italic">{candidate.note}</p>

                            <div className="border-t border-border pt-2 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Competencies</p>
                              {Object.entries(candidate.competencies).map(([key, val]) => (
                                <CompetencyBarSmall key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>

                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setAppointmentCandidateIndex((i) => (i + 1) % pos.candidates.length)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex justify-center gap-1.5">
                    {pos.candidates.map((_, i) => (
                      <button key={i} className={`h-1.5 rounded-full transition-all ${i === appointmentCandidateIndex ? "w-4 bg-[hsl(42,70%,50%)]" : "w-1.5 bg-muted-foreground/30"}`} onClick={() => setAppointmentCandidateIndex(i)} />
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        setAppointments((prev) => ({ ...prev, [pos.position]: candidate.name }));
                        toast({ title: `${pos.abbrev} Appointed`, description: `${candidate.name} is your new ${pos.position}.` });
                        setAppointmentCandidateIndex(0);
                        setAppointmentStep((s) => s + 1);
                      }}
                    >
                      Appoint {candidate.name.split(" ").pop()} <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── Page 9: Intelligence Briefing (Swipeable) ── */}
          {step === 10 && (() => {
            const allDone = Object.keys(intelActions).length === INTEL_ITEMS.length;
            const currentIntel = INTEL_ITEMS[intelIndex];
            const currentAction = intelActions[currentIntel.id];

            return (
              <Card className="border border-border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Presidential Intelligence Briefing
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{Object.keys(intelActions).length}/{INTEL_ITEMS.length} actioned</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {honorific} President, the Director General of the DSS has prepared your first classified briefing. Review and action each item.
                  </p>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setIntelIndex((i) => (i - 1 + INTEL_ITEMS.length) % INTEL_ITEMS.length)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={intelIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                      >
                        <div className={`rounded-lg border p-4 space-y-3 transition-all ${currentAction ? "border-[hsl(153,60%,32%)] bg-[hsl(153,60%,32%)]/5" : "border-border"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <span className="text-xs font-semibold">{currentIntel.title}</span>
                            </div>
                            {currentAction && <CheckCircle className="h-4 w-4 text-[hsl(153,60%,32%)] flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{currentIntel.body}</p>
                          {currentAction ? (
                            <p className="text-xs text-[hsl(153,60%,32%)]">Action: {currentAction}</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {currentIntel.actions.map((actionLabel) => (
                                <Button
                                  key={actionLabel}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    setIntelActions((prev) => ({ ...prev, [currentIntel.id]: actionLabel }));
                                    toast({ title: actionLabel, description: `Intel item actioned: ${currentIntel.title.replace("CLASSIFIED: ", "")}` });
                                    // Auto-advance to next unactioned item
                                    const nextUnactioned = INTEL_ITEMS.findIndex((item, idx) => idx > intelIndex && !intelActions[item.id]);
                                    if (nextUnactioned !== -1) {
                                      setTimeout(() => setIntelIndex(nextUnactioned), 300);
                                    }
                                  }}
                                >
                                  {actionLabel}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 flex-shrink-0"
                      onClick={() => setIntelIndex((i) => (i + 1) % INTEL_ITEMS.length)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex justify-center gap-1.5">
                    {INTEL_ITEMS.map((item, i) => (
                      <button
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === intelIndex ? "w-4 bg-[hsl(42,70%,50%)]" : intelActions[item.id] ? "w-1.5 bg-[hsl(153,60%,32%)]" : "w-1.5 bg-muted-foreground/30"}`}
                        onClick={() => setIntelIndex(i)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                    <Button size="sm" onClick={next} disabled={!allDone}>
                      Proceed to Media Chat <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── Page 10: Presidential Media Chat (One-at-a-time, Football Manager style) ── */}
          {step === 11 && (() => {
            const currentJ = JOURNALISTS[mediaIndex];
            const isAnswered = currentJ.name in answeredQuestions;
            const isSkipped = skippedQuestions.includes(currentJ.name);
            const isHandled = isAnswered || isSkipped;

            return (
              <Card className="border border-border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Presidential Media Chat
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{totalHandled}/{JOURNALISTS.length} handled</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Your first press conference. Address at least 10 of {JOURNALISTS.length} questions. ({Object.keys(answeredQuestions).length} answered, {skippedQuestions.length} skipped)
                  </p>

                  {/* Progress bar */}
                  <div className="flex gap-0.5">
                    {JOURNALISTS.map((j, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          j.name in answeredQuestions ? "bg-[hsl(153,60%,32%)]" :
                          skippedQuestions.includes(j.name) ? "bg-muted-foreground/30" :
                          i === mediaIndex ? "bg-[hsl(42,70%,50%)]" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mediaIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={`rounded-lg border p-4 space-y-3 ${
                        isAnswered ? "border-[hsl(153,60%,32%)] bg-[hsl(153,60%,32%)]/5" :
                        isSkipped ? "border-muted opacity-60" : "border-border"
                      }`}>
                        <div className="flex items-start gap-3">
                          <CharacterAvatar
                            name={currentJ.name}
                            initials={currentJ.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{currentJ.name}</span>
                              <Badge variant="outline" className="text-xs">{currentJ.outlet}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">"{currentJ.question}"</p>
                          </div>
                        </div>

                        {!isHandled && (
                          <div className="space-y-1.5 pt-1">
                            {(() => {
                              // Randomize response order per question using a seeded shuffle
                              const seed = currentJ.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + mediaIndex;
                              const shuffled = [...currentJ.responses].sort((a, b) => {
                                const ha = (seed * 31 + a.label.length) % 97;
                                const hb = (seed * 31 + b.label.length) % 97;
                                return ha - hb;
                              });
                              return shuffled.map((resp) => (
                                <Button
                                  key={resp.label}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left text-xs h-auto py-2 px-3 whitespace-normal"
                                  onClick={() => {
                                    setAnsweredQuestions((prev) => ({ ...prev, [currentJ.name]: resp.label }));
                                    toast({
                                      title: "Response Noted",
                                      description: `You addressed ${currentJ.name}'s question.`,
                                    });
                                    // Auto-advance
                                    if (mediaIndex < JOURNALISTS.length - 1) {
                                      setTimeout(() => setMediaIndex((i) => i + 1), 400);
                                    }
                                  }}
                                >
                                  {resp.label}
                                </Button>
                              ));
                            })()}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs w-full"
                              onClick={() => {
                                setSkippedQuestions((prev) => [...prev, currentJ.name]);
                                if (mediaIndex < JOURNALISTS.length - 1) {
                                  setTimeout(() => setMediaIndex((i) => i + 1), 300);
                                }
                              }}
                            >
                              Skip this question
                            </Button>
                          </div>
                        )}

                        {isAnswered && (
                          <p className="text-xs text-[hsl(153,60%,32%)]">Your response: {answeredQuestions[currentJ.name]}</p>
                        )}
                        {isSkipped && (
                          <p className="text-xs text-muted-foreground">Skipped</p>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                      disabled={mediaIndex === 0}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums">Question {mediaIndex + 1} of {JOURNALISTS.length}</span>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setMediaIndex((i) => Math.min(JOURNALISTS.length - 1, i + 1))}
                      disabled={mediaIndex === JOURNALISTS.length - 1}
                    >
                      Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast({ title: "Press Conference Concluded", description: `${honorific} President ${lastName}, your administration begins now.` });
                        finishOnboarding();
                      }}
                      disabled={totalHandled < 10}
                    >
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Begin Presidency
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
