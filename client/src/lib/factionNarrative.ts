import type { GameInboxMessage } from "./gameTypes";

// ── Tooltip Phrases ─────────────────────────────────────
export function getTooltipPhrase(grievance: number): string | null {
  if (grievance >= 100) return "Breaking Point";
  if (grievance >= 90) return "Critical";
  if (grievance >= 70) return "Volatile";
  if (grievance >= 40) return "Restless";
  if (grievance >= 20) return "Simmering";
  return null;
}

// ── Advisor Lines ───────────────────────────────────────
const ADVISOR_TEMPLATES = [
  "Your Chief of Staff mentions that the {faction} delegation left a meeting early.",
  "Whispers from the {faction} suggest growing frustration with your direction.",
  "Sources close to the {faction} say patience is wearing thin.",
  "An aide reports that {faction} leaders have been holding private meetings.",
  "The {faction} whip was overheard criticising recent policy shifts.",
];

export function generateAdvisorLine(factionName: string, grievance: number): string | null {
  if (grievance < 20) return null;
  const index = Math.abs(hashCode(factionName + grievance)) % ADVISOR_TEMPLATES.length;
  return ADVISOR_TEMPLATES[index].replace(/\{faction\}/g, factionName);
}

// ── Headlines ───────────────────────────────────────────
const HEADLINE_TEMPLATES_40 = [
  "Trending: #{faction}Betrayed — social media erupts over policy direction",
  "Online chatter: {faction} supporters express growing discontent",
  "{faction}-aligned accounts flood social media with criticism",
];

const HEADLINE_TEMPLATES_70 = [
  "BREAKING: {faction} issues formal demands to the presidency",
  "{faction} leadership threatens legislative boycott",
  "Political crisis deepens as {faction} confronts the president",
];

const HEADLINE_TEMPLATES_90 = [
  "URGENT: {faction} crisis escalates — national stability at risk",
  "Front page: {faction} declares open opposition to the government",
  "International media picks up {faction} crisis story",
];

export function generateHeadline(factionName: string, grievance: number): string | null {
  if (grievance < 40) return null;
  const templates = grievance >= 90 ? HEADLINE_TEMPLATES_90 : grievance >= 70 ? HEADLINE_TEMPLATES_70 : HEADLINE_TEMPLATES_40;
  const index = Math.abs(hashCode(factionName + grievance)) % templates.length;
  return templates[index].replace(/\{faction\}/g, factionName);
}

// ── Inbox Messages ──────────────────────────────────────
export function generateInboxMessage(
  factionName: string,
  grievance: number,
  day: number,
  date?: string,
): GameInboxMessage | null {
  if (grievance < 70) return null;
  const isCrisis = grievance >= 90;
  const initials = factionName.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return {
    id: `faction-inbox-${factionName}-${isCrisis ? "crisis" : "demand"}`,
    sender: `${factionName} Leadership`,
    role: "Faction Leader",
    initials,
    subject: isCrisis
      ? `URGENT: ${factionName} — Immediate Action Required`
      : `${factionName} — Formal Grievance`,
    preview: isCrisis
      ? `The ${factionName} has escalated their demands. This cannot wait.`
      : `The ${factionName} has submitted a formal list of demands for your consideration.`,
    fullText: isCrisis
      ? `Mr. President,\n\nThe ${factionName} has reached a critical point. Our patience is exhausted. Without immediate, concrete action to address our concerns, we will be forced to take unilateral steps that neither of us wants.\n\nThis is not a negotiating tactic. This is a final warning.\n\nThe ${factionName} Leadership`
      : `Mr. President,\n\nThe ${factionName} respectfully but firmly requests your attention to matters of grave concern to our constituency. We have attempted to work through normal channels, but our concerns have gone unaddressed for too long.\n\nWe request a formal meeting at your earliest convenience.\n\nThe ${factionName} Leadership`,
    day,
    date,
    priority: isCrisis ? "Critical" : "Urgent",
    read: false,
    source: "faction-demand",
    responseOptions: isCrisis
      ? [
          { label: "Convene Emergency Meeting", actionId: "engage" },
          { label: "Make Concessions", actionId: "approve" },
          { label: "Buy Time", actionId: "defer" },
        ]
      : [
          { label: "Schedule Dialogue", actionId: "engage" },
          { label: "Send Emissary", actionId: "acknowledge" },
          { label: "Dismiss Demands", actionId: "reject" },
        ],
    contextData: {
      senderLoyalty: Math.max(0, Math.round(100 - grievance)),
      factionName,
      relevantMetrics: [
        { label: "Grievance", value: `${Math.round(grievance)}%`, color: grievance >= 90 ? "red" : "yellow" },
      ],
    },
  };
}

// ── Breaking Point Event Text ───────────────────────────
const BREAKING_POINT_MAP: Record<string, { title: string; description: string }> = {
  "Military Circle": {
    title: "Coup Attempt — Military Circle Acts",
    description: "The Military Circle has moved against your government. Armored vehicles have been spotted near key government installations. Your security detail is asking you to consider evacuation.",
  },
  "Northern Caucus": {
    title: "Mass Defection — Northern Caucus Walks",
    description: "The Northern Caucus has formally withdrawn from the ruling coalition. Dozens of legislators have crossed the aisle. The opposition is energised and calling for a vote of no confidence.",
  },
  "Youth Movement": {
    title: "National Uprising — Youth Take the Streets",
    description: "The Youth Movement has mobilized nationwide protests that have paralysed major cities. International media is covering the crisis live. Your government's legitimacy is being questioned.",
  },
  "Presidential Guard": {
    title: "Palace Crisis — Inner Circle Collapses",
    description: "The Presidential Guard has turned. Key palace officials have resigned simultaneously. Critical state functions are disrupted. The presidency is paralysed from within.",
  },
  "South-West Alliance": {
    title: "Opposition Pact — South-West Breaks Away",
    description: "The South-West Alliance has publicly allied with the opposition. The economic heartland of the country has turned against your government. Markets are in freefall.",
  },
  "South-East Bloc": {
    title: "Regional Shutdown — South-East Bloc Revolts",
    description: "The South-East Bloc has declared a regional shutdown. Commerce, schools, and government offices in the south-east are closed. Secession rhetoric is reaching a fever pitch.",
  },
  "Technocrats": {
    title: "Mass Resignation — Technocrats Walk Out",
    description: "The Technocrats have resigned en masse. Your finance ministry is gutted, the central bank is in disarray, and international credit agencies have downgraded your outlook.",
  },
};

export function generateBreakingPointEvent(factionName: string): { title: string; description: string } {
  return BREAKING_POINT_MAP[factionName] ?? {
    title: `${factionName} — Breaking Point`,
    description: `The ${factionName} has taken irreversible action against your government.`,
  };
}

// ── Utility ─────────────────────────────────────────────
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}
