import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { PARTIES, BASE_VOTE_SHARES } from "@/lib/parties";
import {
  VP_CANDIDATES,
  PA_CANDIDATES,
  APPOINTMENT_POSITIONS,
  JOURNALISTS,
  INTEL_ITEMS,
} from "@/lib/handcraftedCharacters";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { TypewriterText } from "@/components/TypewriterText";
import { CompetencyBarSmall } from "@/components/CompetencyBar";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Users,
  Briefcase,
  FileText,
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

const TITLE_OPTIONS = [
  "None", "Chief", "Dr.", "Prof.", "Alhaji", "Hajiya", "Engr.", "Barr.", "Gen. (Rtd.)", "Sen.",
];

const ETHNICITIES = [
  "Hausa", "Yoruba", "Igbo", "Fulani", "Ijaw", "Kanuri", "Tiv", "Ibibio", "Edo", "Nupe",
  "Urhobo", "Efik", "Isoko", "Itsekiri", "Jukun", "Igala", "Idoma", "Ebira", "Berom", "Gwari",
  "Angas", "Bachama", "Mumuye", "Ogoni", "Kalabari", "Ikwerre", "Esan", "Owan", "Afemai", "Etsako",
  "Bini", "Gbagyi", "Birom", "Tarok", "Mwaghavul", "Sayawa", "Kataf", "Bajju", "Margi", "Bura",
  "Kilba", "Shuwa Arab", "Bade", "Ngizim", "Bolewa", "Chamba", "Kuteb", "Eleme", "Okrika", "Nembe",
];

const RELIGIONS = ["Islam", "Christianity", "Traditional", "Agnostic"];

const OCCUPATIONS = [
  "Politician", "Business Executive", "Military Officer", "Lawyer", "Academic", "Clergy", "Civil Servant", "Activist",
];


const ERAS = [
  { id: "1999", label: "Fourth Republic Dawn (1999)", date: "29 May 1999", description: "Transition from military rule. Everything to build, nothing to lose." },
  { id: "2007", label: "Oil Boom Twilight (2007)", date: "29 May 2007", description: "Peak oil revenues but rising militancy in the Niger Delta." },
  { id: "2015", label: "Change Era (2015)", date: "29 May 2015", description: "First democratic transfer of power. Boko Haram crisis and oil crash." },
  { id: "2023", label: "Renewed Hope (2023)", date: "29 May 2023", description: "Post-pandemic recovery. Fuel subsidy removal. FX crisis." },
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

// ── Step Narratives ──────────────────────────────────────

const STEP_NARRATIVES: Record<number, { title: string; subtitle?: string }> = {
  1: { title: "The nation is about to learn your name.", subtitle: "Before the cameras, before the crowds — who stands before them?" },
  2: { title: "Your advisers know what kind of leader you are.", subtitle: "What do they whisper in the corridors?" },
  3: { title: "The machinery of power runs on allegiance.", subtitle: "Which banner do you carry — and what do you believe?" },
  4: { title: "No one wins alone.", subtitle: "Your running mate will stand beside you on the ticket. Choose wisely — this alliance will define your presidency." },
  5: { title: "176,846 polling units. 93 million registered voters.", subtitle: "The nation holds its breath." },
  6: { title: "Every front page carries your name.", subtitle: "The morning after. Nigeria wakes to a new era." },
  7: { title: "The Chief Justice of Nigeria awaits." },
  8: { title: "Eagle Square. 100 million viewers.", subtitle: "The world is listening. What do you promise them?" },
  9: { title: "The gatekeeper.", subtitle: "This person controls who reaches you, what you see first, and how your days are structured." },
  10: { title: "The inner circle.", subtitle: "These are the people who will run the country in your name. Choose wrong, and they'll run it for themselves." },
  11: { title: "CLASSIFIED — EYES ONLY", subtitle: "The Director General of the DSS has prepared your first briefing." },
};

const OATH_LINES = [
  "do solemnly swear that I will be faithful and bear true allegiance to the Federal Republic of Nigeria;",
  "that as President of the Federal Republic of Nigeria, I will discharge my duties to the best of my ability, faithfully and in accordance with the Constitution of the Federal Republic of Nigeria and the law;",
  "that I will strive to preserve the Fundamental Objectives and Directive Principles of State Policy contained in the Constitution of the Federal Republic of Nigeria;",
  "that I will not allow my personal interest to influence my official conduct or my official decisions;",
  "that I will to the best of my ability preserve, protect and defend the Constitution of the Federal Republic of Nigeria.",
  "So help me God.",
];

// ── Election Simulation ─────────────────────────────────

const GEOPOLITICAL_ZONES = [
  { name: "North-Central", abbrev: "NC", states: ["Benue","Kogi","Kwara","Nasarawa","Niger","Plateau","FCT"], registered: 14_500_000 },
  { name: "North-West", abbrev: "NW", states: ["Jigawa","Kaduna","Kano","Katsina","Kebbi","Sokoto","Zamfara"], registered: 20_100_000 },
  { name: "North-East", abbrev: "NE", states: ["Adamawa","Bauchi","Borno","Gombe","Taraba","Yobe"], registered: 11_800_000 },
  { name: "South-West", abbrev: "SW", states: ["Ekiti","Lagos","Ogun","Ondo","Osun","Oyo"], registered: 16_700_000 },
  { name: "South-East", abbrev: "SE", states: ["Abia","Anambra","Ebonyi","Enugu","Imo"], registered: 9_800_000 },
  { name: "South-South", abbrev: "SS", states: ["Akwa Ibom","Bayelsa","Cross River","Delta","Edo","Rivers"], registered: 12_100_000 },
];


interface ZoneResult {
  zone: typeof GEOPOLITICAL_ZONES[number];
  votes: Record<string, number>;
  winner: string;
  statesWon: Record<string, number>;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateElectionResults(
  playerParty: string,
  playerState: string,
  vpState: string,
): { zones: ZoneResult[]; totals: Record<string, number>; totalStatesWon: Record<string, number>; playerPct: number } {
  // Deterministic seed from inputs
  let seedVal = 0;
  for (const ch of playerParty + playerState + vpState) seedVal = ((seedVal << 5) - seedVal + ch.charCodeAt(0)) | 0;
  const rand = seededRandom(Math.abs(seedVal) || 1);

  const playerZone = GEOPOLITICAL_ZONES.find((z) => z.states.includes(playerState));
  const vpZone = GEOPOLITICAL_ZONES.find((z) => z.states.includes(vpState));

  const parties = Object.keys(BASE_VOTE_SHARES);
  const zones: ZoneResult[] = [];
  const totals: Record<string, number> = {};
  const totalStatesWon: Record<string, number> = {};
  parties.forEach((p) => { totals[p] = 0; totalStatesWon[p] = 0; });

  GEOPOLITICAL_ZONES.forEach((zone, zi) => {
    const shares = parties.map((p) => BASE_VOTE_SHARES[p][zi]);
    const adjusted = [...shares];

    // Find player party index
    const pi = parties.indexOf(playerParty);
    if (pi === -1) return;

    // Home zone bonus (+8%)
    if (playerZone && playerZone.abbrev === zone.abbrev) {
      const bonus = 8;
      adjusted[pi] += bonus;
      const othersTotal = shares.reduce((s, v, i) => i !== pi ? s + v : s, 0);
      parties.forEach((_, i) => {
        if (i !== pi && othersTotal > 0) adjusted[i] -= bonus * (shares[i] / othersTotal);
      });
    }

    // VP zone bonus (+5%)
    if (vpZone && vpZone.abbrev === zone.abbrev && vpZone.abbrev !== playerZone?.abbrev) {
      const bonus = 5;
      adjusted[pi] += bonus;
      const othersTotal = shares.reduce((s, v, i) => i !== pi ? s + v : s, 0);
      parties.forEach((_, i) => {
        if (i !== pi && othersTotal > 0) adjusted[i] -= bonus * (shares[i] / othersTotal);
      });
    }

    // Normalize to 100%
    const total = adjusted.reduce((s, v) => s + Math.max(0, v), 0);
    const normalized = adjusted.map((v) => Math.max(0, v) / total * 100);

    // Turnout: 25-40% of registered
    const turnout = zone.registered * (0.25 + rand() * 0.15);
    const votes: Record<string, number> = {};
    parties.forEach((p, i) => { votes[p] = Math.round(turnout * normalized[i] / 100); });

    // Determine states won (proportional to vote share, at least 1 for winner)
    const zoneStates = zone.states.length;
    const statesWon: Record<string, number> = {};
    const maxParty = parties.reduce((a, b) => (votes[a] >= votes[b] ? a : b));
    parties.forEach((p) => {
      statesWon[p] = p === maxParty ? Math.max(1, Math.round(zoneStates * normalized[parties.indexOf(p)] / 100)) : 0;
    });
    // Ensure total states = zone states
    const assignedStates = Object.values(statesWon).reduce((s, v) => s + v, 0);
    if (assignedStates !== zoneStates) statesWon[maxParty] += (zoneStates - assignedStates);

    zones.push({ zone, votes, winner: maxParty, statesWon });
    parties.forEach((p) => {
      totals[p] += votes[p];
      totalStatesWon[p] += statesWon[p];
    });
  });

  // Ensure player wins (minimum 52% share) — boost if needed
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  let playerPct = Math.round(totals[playerParty] / grandTotal * 100);
  if (playerPct < 52) {
    const needed = Math.ceil(grandTotal * 0.52) - totals[playerParty];
    const otherParties = parties.filter((p) => p !== playerParty);
    otherParties.forEach((p) => {
      const take = Math.min(totals[p], Math.round(needed * (totals[p] / (grandTotal - totals[playerParty]))));
      totals[p] -= take;
      totals[playerParty] += take;
    });
    playerPct = Math.round(totals[playerParty] / grandTotal * 100);
  }

  // Ensure player has most states won
  const maxStates = Math.max(...Object.values(totalStatesWon));
  if (totalStatesWon[playerParty] < maxStates) {
    totalStatesWon[playerParty] = maxStates + 1;
  }

  return { zones, totals, totalStatesWon, playerPct };
}

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

// ── Narrative Header ─────────────────────────────────────

function NarrativeHeader({ step }: { step: number }) {
  const narrative = STEP_NARRATIVES[step];
  if (!narrative) return null;

  const [subtitleVisible, setSubtitleVisible] = useState(false);

  return (
    <div className="mb-4 space-y-2">
      <TypewriterText
        key={step}
        text={narrative.title}
        speed={30}
        onComplete={() => setSubtitleVisible(true)}
        className="text-lg font-semibold text-[hsl(42,70%,50%)]"
      />
      {narrative.subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: subtitleVisible ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm text-muted-foreground italic"
        >
          {narrative.subtitle}
        </motion.p>
      )}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(42,70%,50%)]/50 to-transparent" />
    </div>
  );
}

// ── Dossier Panel ────────────────────────────────────────

function DossierPanel({
  step, firstName, lastName, age, gender, stateOfOrigin, education,
  title, ethnicity, religion, occupation,
  playerTraits, playerIdeologies, party, era, vpName,
  personalAssistant, appointments, selectedPromises, electionDone,
  electionPct,
}: {
  step: number;
  firstName: string;
  lastName: string;
  age: string;
  gender: "Male" | "Female";
  stateOfOrigin: string;
  education: string;
  title: string;
  ethnicity: string;
  religion: string;
  occupation: string;
  playerTraits: string[];
  playerIdeologies: string[];
  party: string;
  era: string;
  vpName: string;
  personalAssistant: string;
  appointments: Record<string, string>;
  selectedPromises: string[];
  electionDone: boolean;
  electionPct: number;
}) {
  const titlePrefix = title && title !== "None" ? `${title} ` : "";
  const fullName = `${titlePrefix}${firstName} ${lastName}`.trim();

  return (
    <div className="hidden lg:block w-64 shrink-0 relative">
      <div className="rounded-lg border border-[hsl(42,70%,50%)]/30 bg-[#1a1a1a]/80 backdrop-blur-sm p-4 space-y-3 relative overflow-hidden">
        {/* Classified watermark */}
        <div className="stamp-classified-watermark">CLASSIFIED</div>

        {/* Header */}
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-[0.25em] text-[hsl(42,70%,50%)] uppercase">
            Candidate Dossier
          </p>
          <div className="h-px bg-gradient-to-r from-[hsl(42,70%,50%)] to-transparent mt-1" />
        </div>

        {/* Progressive items */}
        <div className="space-y-2.5 relative z-10">
          {step > 1 && fullName && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">{fullName}</p>
              <p className="text-[10px] text-muted-foreground">
                {age} yrs · {stateOfOrigin} · {gender}
              </p>
              {education && <p className="text-[10px] text-muted-foreground">{education}</p>}
              {ethnicity && <p className="text-[10px] text-gray-300">{ethnicity} · {religion}</p>}
              {occupation && <p className="text-[10px] text-gray-300">{occupation}</p>}
            </motion.div>
          )}

          {step > 2 && playerTraits.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
              <div className="flex flex-wrap gap-0.5">
                {playerTraits.map((t) => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(42,70%,50%)]/10 text-[hsl(42,70%,50%)] border border-[hsl(42,70%,50%)]/20">
                    {PLAYER_TRAITS.find((pt) => pt.id === t)?.label ?? t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {step > 3 && party && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PARTIES.find((p) => p.id === party)?.color }} />
                <span className="text-[10px] font-medium text-foreground">{party}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {ERAS.find((e) => e.id === era)?.label}
              </p>
              {playerIdeologies.length > 0 && (
                <p className="text-[10px] text-gray-300">
                  {playerIdeologies.map((id) => IDEOLOGIES.find((i) => i.id === id)?.label).filter(Boolean).join(", ")}
                </p>
              )}
            </motion.div>
          )}

          {step > 4 && vpName && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-[10px] text-muted-foreground">VP: <span className="text-foreground font-medium">{vpName}</span></p>
            </motion.div>
          )}

          {step > 5 && electionDone && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(153,60%,32%)]/20 text-[hsl(153,60%,32%)] border border-[hsl(153,60%,32%)]/30 font-bold tracking-wider">
                ELECTED — {electionPct}%
              </span>
            </motion.div>
          )}

          {step > 7 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(42,70%,50%)]/20 text-[hsl(42,70%,50%)] border border-[hsl(42,70%,50%)]/30 font-bold tracking-wider">
                SWORN IN
              </span>
            </motion.div>
          )}

          {step > 8 && selectedPromises.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-[10px] text-muted-foreground">{selectedPromises.length} Promises</p>
            </motion.div>
          )}

          {step > 9 && personalAssistant && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-[10px] text-muted-foreground">PA: <span className="text-foreground font-medium">{personalAssistant}</span></p>
            </motion.div>
          )}

          {step > 10 && Object.keys(appointments).length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground font-medium">Cabinet:</p>
              {Object.entries(appointments).map(([pos, name]) => (
                <p key={pos} className="text-[9px] text-muted-foreground truncate">
                  {pos}: <span className="text-foreground">{name.split(" ").slice(-1)[0]}</span>
                </p>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [title, setTitle] = useState("None");
  const [ethnicity, setEthnicity] = useState("");
  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");

  // Page 2: Traits, Ideologies
  const [playerTraits, setPlayerTraits] = useState<string[]>([]);
  const [playerIdeologies, setPlayerIdeologies] = useState<string[]>([]);

  // Page 3: Party + Era
  const [party, setParty] = useState("");
  const [era, setEra] = useState("");

  // Page 3: VP
  const [vpName, setVpName] = useState("");
  const [vpIndex, setVpIndex] = useState(0);

  // Page 4: Election animation
  const [electionPhase, setElectionPhase] = useState(0);
  const [electionResults, setElectionResults] = useState<ReturnType<typeof generateElectionResults> | null>(null);
  const electionDone = electionPhase >= 8;

  // Page 6: Promises
  const [selectedPromises, setSelectedPromises] = useState<string[]>([]);

  // Page 7: PA
  const [personalAssistant, setPersonalAssistant] = useState("");
  const [paIndex, setPaIndex] = useState(0);

  // Page 8: Appointments (carousel per position)
  const [appointments, setAppointments] = useState<Record<string, string>>({});
  const [appointmentStep, setAppointmentStep] = useState(0);
  const [appointmentCandidateIndex, setAppointmentCandidateIndex] = useState(0);

  // Page 6: Oath of Office
  const [oathPhase, setOathPhase] = useState(0);
  const [oathLineIndex, setOathLineIndex] = useState(0);

  // Page 11: Intel
  const [intelIndex, setIntelIndex] = useState(0);
  const [intelActions, setIntelActions] = useState<Record<string, string>>({});

  const next = useCallback(() => setStep((s) => s + 1), []);
  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // Election simulation — generate results and animate zone reveals
  useEffect(() => {
    if (step !== 5) return;
    if (!party || !stateOfOrigin) return;

    const vpCandidate = VP_CANDIDATES.find((v) => v.name === vpName);
    const vpSt = vpCandidate?.state || "Lagos";
    const results = generateElectionResults(party, stateOfOrigin, vpSt);
    setElectionResults(results);
    setElectionPhase(0);

    // Phase 0 → 1..6 → 7 → 8
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 6; i++) {
      timers.push(setTimeout(() => setElectionPhase(i), i * 1500));
    }
    timers.push(setTimeout(() => setElectionPhase(7), 6 * 1500 + 1500));
    timers.push(setTimeout(() => setElectionPhase(8), 6 * 1500 + 3000));

    return () => timers.forEach(clearTimeout);
  }, [step, party, stateOfOrigin, vpName]);

  // Oath of Office auto-play
  useEffect(() => {
    if (step === 7) {
      setOathPhase(0);
      setOathLineIndex(0);
      const t1 = setTimeout(() => setOathPhase(1), 2500);
      return () => clearTimeout(t1);
    }
  }, [step]);

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
      presidentName: fullName,
      origin: stateOfOrigin,
      traits: playerTraits,
      ideologies: playerIdeologies,
      title: title !== "None" ? title : undefined,
      ethnicity,
      religion,
      occupation,
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
  const titlePrefix = title && title !== "None" ? `${title} ` : "";
  const fullName = `${titlePrefix}${firstName} ${lastName}`.trim();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1f14 0%, #0d0d0d 100%)" }}
    >
      {/* Nigeria map outline watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
        <img
          src="/nigeria-map.svg"
          alt=""
          className="w-[600px] h-[600px] opacity-[0.04]"
          draggable={false}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-full max-w-5xl relative z-10"
        >
          <div className="flex gap-6">
          <div className="flex-1 min-w-0">
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
            <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <NarrativeHeader step={1} />
                <div className="space-y-3">
                  {/* Row 1: Title · First Name · Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Title / Prefix</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)}>
                        {TITLE_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">First Name</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Femi" className="text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Last Name</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Adeyemi" className="text-sm" />
                    </div>
                  </div>
                  {/* Row 2: Age · Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  </div>
                  {/* Row 3: State · Ethnicity · Religion */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">State of Origin</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)}>
                        <option value="">State…</option>
                        {NIGERIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ethnicity</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={ethnicity} onChange={(e) => setEthnicity(e.target.value)}>
                        <option value="">Ethnicity…</option>
                        {ETHNICITIES.map((e) => (<option key={e} value={e}>{e}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Religion</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={religion} onChange={(e) => setReligion(e.target.value)}>
                        <option value="">Religion…</option>
                        {RELIGIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                      </select>
                    </div>
                  </div>
                  {/* Row 4: Occupation · Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Occupation</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                        <option value="">Occupation…</option>
                        {OCCUPATIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Education</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={education} onChange={(e) => setEducation(e.target.value)}>
                        <option value="">Education…</option>
                        {EDUCATION_OPTIONS.map((e) => (<option key={e} value={e}>{e}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button
                    size="sm"
                    onClick={next}
                    disabled={!firstName || !lastName || !stateOfOrigin || !education || !ethnicity || !religion || !occupation || Number(age) < 35 || Number(age) > 80}
                  >
                    Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 2: Leadership Profile (Era + Traits) ────── */}
          {step === 2 && (
            <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-5">
                <NarrativeHeader step={2} />
                {/* Governing Era */}
                <div>
                  <p className="text-xs text-gray-300 mb-2">Governing Era</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ERAS.map((e) => (
                      <Card
                        key={e.id}
                        className={`cursor-pointer border transition-all ${era === e.id ? "ring-2 ring-[hsl(42,70%,50%)] border-[hsl(42,70%,50%)]" : "border-border hover:bg-muted/50"}`}
                        onClick={() => setEra(e.id)}
                      >
                        <CardContent className="p-3 space-y-1">
                          <span className="text-sm font-semibold">{e.label}</span>
                          <p className="text-xs text-gray-300">{e.description}</p>
                          <Badge variant="outline" className="text-xs">{e.date}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                {/* Personality Traits */}
                <div>
                  <p className="text-xs text-gray-300 mb-1">Personality Traits <span className="text-muted-foreground">(pick 2–3)</span></p>
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
                          <p className="text-xs text-gray-300 mt-0.5">{t.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button size="sm" onClick={next} disabled={!era || playerTraits.length < 2}>
                    Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Page 3: Political Platform (Party + Ideology) ────── */}
          {step === 3 && (
            <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <NarrativeHeader step={3} />
                {/* Political Party */}
                <div>
                  <p className="text-xs text-gray-300 mb-2">Political Party</p>
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
                            <span className="text-xs text-gray-300">— {p.name}</span>
                          </div>
                          <p className="text-xs text-gray-300">{p.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                {/* Political Ideology */}
                <div>
                  <p className="text-xs text-gray-300 mb-1">Political Ideology <span className="text-muted-foreground">(pick 1–2)</span></p>
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
                          <p className="text-xs text-gray-300 mt-0.5">{ideo.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back</Button>
                  <Button size="sm" onClick={next} disabled={!party || playerIdeologies.length < 1}>
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
              <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <NarrativeHeader step={4} />
                    <span className="text-xs text-muted-foreground shrink-0">{vpIndex + 1} / {VP_CANDIDATES.length}</span>
                  </div>

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
                                <CharacterAvatar name={vp.name} initials={vp.avatar} size="lg" gender={vp.gender} role="Vice President" />
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
                            <p className="text-xs text-gray-300">{vp.bio}</p>
                            <p className="text-xs text-gray-300 italic">{vp.family}</p>

                            {/* 5-star competencies */}
                            <div className="border-t border-border pt-2 space-y-1">

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
          {step === 5 && electionResults && (
            <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <NarrativeHeader step={5} />

                {/* LIVE header */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                  </span>
                  <span className="text-xs font-bold tracking-wider text-red-400 uppercase">INEC Election Results — Live</span>
                </div>

                {/* Zone results */}
                <div className="space-y-3">
                  {electionResults.zones.map((zr, zi) => {
                    if (zi + 1 > electionPhase) return null;
                    const topParties = Object.entries(zr.votes).sort((a, b) => b[1] - a[1]).slice(0, 3);
                    const maxVotes = topParties[0]?.[1] || 1;
                    return (
                      <motion.div
                        key={zr.zone.abbrev}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-border p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{zr.zone.name}</span>
                          <span className="text-[10px] text-muted-foreground">{zr.zone.states.length} states</span>
                        </div>
                        {topParties.map(([p, votes]) => (
                          <div key={p} className="flex items-center gap-2">
                            <span className="text-[10px] w-10 text-right font-medium">{p}</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: PARTIES.find((pp) => pp.id === p)?.color ?? "hsl(var(--muted-foreground))" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(votes / maxVotes) * 100}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <span className="text-[10px] tabular-nums w-16 text-right text-gray-300">{votes.toLocaleString()}</span>
                          </div>
                        ))}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Running totals table */}
                {electionPhase >= 1 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-2 font-medium text-gray-300">Candidate</th>
                          <th className="text-right p-2 font-medium text-gray-300">Votes</th>
                          <th className="text-right p-2 font-medium text-gray-300">States</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(electionResults.totals)
                          .filter(([p]) => p !== "Others")
                          .sort((a, b) => b[1] - a[1])
                          .map(([p]) => {
                            const revealedVotes = electionResults.zones
                              .slice(0, Math.min(electionPhase, 6))
                              .reduce((s, zr) => s + (zr.votes[p] || 0), 0);
                            const revealedStates = electionResults.zones
                              .slice(0, Math.min(electionPhase, 6))
                              .reduce((s, zr) => s + (zr.statesWon[p] || 0), 0);
                            const isPlayer = p === party;
                            return (
                              <tr key={p} className={`border-b border-border last:border-0 ${isPlayer ? "border-l-2 border-l-[hsl(42,70%,50%)]" : ""}`}>
                                <td className="p-2 flex items-center gap-1.5">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PARTIES.find((pp) => pp.id === p)?.color }} />
                                  <span className={isPlayer ? "font-semibold" : ""}>{p}{isPlayer ? ` — ${fullName}` : ""}</span>
                                </td>
                                <td className="p-2 text-right tabular-nums">{revealedVotes.toLocaleString()}</td>
                                <td className="p-2 text-right tabular-nums">{revealedStates}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* INEC Declaration */}
                {electionPhase >= 7 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <div className="rounded-lg border border-[hsl(153,60%,32%)] bg-[hsl(153,60%,32%)]/10 p-3 text-center space-y-1">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">INEC Declaration</p>
                      <p className="text-sm font-semibold">
                        {honorific} President {fullName} is hereby declared the winner of the Presidential Election.
                      </p>
                      <p className="text-xs text-gray-300">{electionResults.playerPct}% of valid votes cast · {electionResults.totalStatesWon[party]} of 37 states won</p>
                    </div>
                  </motion.div>
                )}

                {/* Continue button */}
                {electionPhase >= 8 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                    <Button size="sm" onClick={next}>
                      Continue to Headlines <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Step 6: Morning Headlines ────────────────── */}
          {step === 6 && (
            <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-3">
                <NarrativeHeader step={6} />
                {[
                  { source: "The Tribune", headline: `HISTORY MADE: ${gender === "Female" ? "First Female" : ""} ${stateOfOrigin} ${gender === "Female" ? "Woman" : "Native"} Wins Presidency on ${party} Ticket` },
                  { source: "Northern Vanguard", headline: `${lastName} Sweeps ${electionResults?.totalStatesWon[party] ?? 25} States — Opposition Cries Foul` },
                  { source: "Vanguard", headline: `"I Will Not Let You Down" — President-Elect ${lastName} Addresses the Nation` },
                  { source: "BusinessDay", headline: `Markets Rally on ${lastName} Victory — Naira Firms, NSE Gains 3.2%` },
                  { source: "West African Tribune", headline: `Era of ${ERAS.find((e) => e.id === era)?.label}: What ${lastName}'s ${party} Presidency Means for Nigeria` },
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
                    Continue to Oath of Office <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 7: Oath of Office ──────────────────── */}
          {step === 7 && (
            <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
              <NarrativeHeader step={7} />

              {/* Scene description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-sm text-muted-foreground italic leading-relaxed"
              >
                Eagle Square, Abuja. The Chief Justice of the Federation, robed in black and gold,
                holds the Constitution open before you. Millions watch across the nation.
              </motion.p>

              {/* Oath text */}
              {oathPhase >= 1 && (
                <div className="text-left space-y-3 max-w-xl mx-auto">
                  <p className="text-sm font-medium text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                    "I, {firstName} {lastName},
                  </p>
                  {OATH_LINES.map((line, i) => {
                    if (i > oathLineIndex && oathPhase === 1) return null;
                    const isLastLine = i === OATH_LINES.length - 1;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {i <= oathLineIndex ? (
                          <TypewriterText
                            key={`oath-${i}`}
                            text={line}
                            speed={isLastLine ? 50 : 25}
                            delay={i === oathLineIndex && i > 0 ? 300 : 0}
                            onComplete={() => {
                              if (i < OATH_LINES.length - 1) {
                                setOathLineIndex((prev) => prev + 1);
                              } else {
                                setTimeout(() => setOathPhase(2), 1000);
                              }
                            }}
                            className={`text-sm leading-relaxed ${
                              isLastLine
                                ? "font-bold text-[hsl(42,70%,50%)] text-lg"
                                : "text-foreground/90"
                            }`}
                            style={{ fontFamily: "Georgia, serif" }}
                          />
                        ) : null}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Declaration */}
              {oathPhase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="border-2 border-[hsl(42,70%,50%)] bg-[hsl(42,70%,50%)]/5 rounded-lg p-6 text-center space-y-2"
                  onAnimationComplete={() => setOathPhase(3)}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[hsl(42,70%,50%)]">
                    By the authority vested in me
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    I hereby declare {gender === "Female" ? "Her Excellency" : "His Excellency"}{" "}
                    {firstName} {lastName} the duly sworn President of the Federal Republic of Nigeria.
                  </p>
                </motion.div>
              )}

              {/* Continue button */}
              {oathPhase >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Button size="sm" onClick={next}>
                    Continue <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {/* ── Step 8: Inauguration Promises ──────────── */}
          {step === 8 && (
            <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <NarrativeHeader step={8} />
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

          {/* ── Step 9: Personal Assistant (Swipeable Carousel) ── */}
          {step === 9 && (() => {
            const pa = PA_CANDIDATES[paIndex];
            return (
              <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <NarrativeHeader step={9} />
                    <span className="text-xs text-muted-foreground shrink-0">{paIndex + 1} / {PA_CANDIDATES.length}</span>
                  </div>

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
                              <CharacterAvatar name={pa.name} initials={pa.avatar} size="lg" gender={pa.gender} role="Personal Assistant" />
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
                            <p className="text-xs text-gray-300">{pa.bio}</p>

                            <div className="border-t border-border pt-2 space-y-1">

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

          {/* ── Step 10: First Appointments (Swipeable per position) ── */}
          {step === 10 && (() => {
            if (appointmentStep >= APPOINTMENT_POSITIONS.length) {
              return (
                <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> First Appointments — Complete
                    </p>
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
              <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  <p className="text-[10px] font-bold tracking-[0.25em] text-[hsl(42,70%,50%)] uppercase text-center">
                    Federal Republic of Nigeria — Official Appointments
                  </p>
                  <NarrativeHeader step={10} />
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Appoint: {pos.position} ({pos.abbrev})
                  </p>
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
                        <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <CharacterAvatar name={candidate.name} initials={candidate.avatar} size="lg" gender={candidate.gender} role={pos.position} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{candidate.name}</p>
                                <p className="text-xs text-muted-foreground">Age {candidate.age} · {candidate.state}</p>
                                <p className="text-xs text-muted-foreground font-medium">{pos.position}</p>
                              </div>
                            </div>
                            {candidate.traits && candidate.traits.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {candidate.traits.slice(0, 3).map((t: string) => (
                                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-300">{candidate.bio}</p>
                            <p className="text-xs text-gray-300 italic">{candidate.note}</p>

                            <div className="border-t border-border pt-2 space-y-1">

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

          {/* ── Step 11: Intelligence Briefing (Swipeable) ── */}
          {step === 11 && (() => {
            const allDone = Object.keys(intelActions).length === INTEL_ITEMS.length;
            const currentIntel = INTEL_ITEMS[intelIndex];
            const currentAction = intelActions[currentIntel.id];

            return (
              <Card className="border border-border border-l-[3px] border-l-[hsl(42,70%,50%)] bg-[#1a1a1a]/90 backdrop-blur-sm relative overflow-hidden">
                <div className="stamp-top-secret">TOP SECRET</div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <NarrativeHeader step={11} />
                    <span className="text-xs text-muted-foreground shrink-0">{Object.keys(intelActions).length}/{INTEL_ITEMS.length} actioned</span>
                  </div>

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
                          <p className="text-xs text-gray-300 leading-relaxed">{currentIntel.body}</p>
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
                    <Button
                      size="sm"
                      onClick={() => {
                        toast({
                          title: `Welcome, ${honorific} President`,
                          description: "Your first day begins now. Aso Rock awaits.",
                        });
                        finishOnboarding();
                      }}
                      disabled={!allDone}
                    >
                      Enter Aso Rock <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          </div>

          {/* Dossier panel - desktop only */}
          {step > 0 && (
            <DossierPanel
              step={step}
              firstName={firstName}
              lastName={lastName}
              age={age}
              gender={gender}
              stateOfOrigin={stateOfOrigin}
              education={education}
              title={title}
              ethnicity={ethnicity}
              religion={religion}
              occupation={occupation}
              playerTraits={playerTraits}
              playerIdeologies={playerIdeologies}
              party={party}
              era={era}
              vpName={vpName}
              personalAssistant={personalAssistant}
              appointments={appointments}
              selectedPromises={selectedPromises}
              electionDone={electionDone}
              electionPct={electionResults?.playerPct ?? 55}
            />
          )}
          </div>

          {/* Step indicator dots */}
          {step > 0 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-4 bg-[hsl(42,70%,50%)]"
                      : i < step
                      ? "w-1.5 bg-[hsl(153,60%,32%)]"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
