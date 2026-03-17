import type { GameState, FECMemo, EventChoice, Consequence, Effect } from "./gameTypes";
import { PORTFOLIO_SECTOR_MAP } from "./cabinetSystem";

/** FEC meetings happen every 30 days, starting after cabinet formation (day 20+) */
export function isFECMeetingDay(day: number): boolean {
  if (day < 20) return false;
  return day % 30 === 0;
}

/** Check if manual FEC can be convened (14-day cooldown) */
export function canConveneFEC(
  lastFECDay: number,
  cooldownUntil: number,
  currentDay: number,
): boolean {
  return currentDay > cooldownUntil;
}

// Sector keys that have GovernanceSectorState with .health
const GOVERNANCE_SECTORS = [
  "healthSector",
  "infrastructure",
  "education",
  "agriculture",
  "interior",
  "environment",
  "youthEmployment",
] as const;

const SECTOR_LABELS: Record<string, string> = {
  economy: "Economy",
  healthSector: "Health",
  infrastructure: "Infrastructure",
  education: "Education",
  agriculture: "Agriculture",
  interior: "Interior",
  environment: "Environment",
  youthEmployment: "Labour & Youth",
};

/** Find which minister is responsible for a sector */
function findMinisterForSector(
  state: GameState,
  sectorKey: string,
): { name: string; portfolio: string } | null {
  for (const [portfolio, sector] of Object.entries(PORTFOLIO_SECTOR_MAP)) {
    if (sector === sectorKey) {
      const ministerName = state.cabinetAppointments[portfolio];
      if (ministerName && state.characters[ministerName]) {
        return { name: ministerName, portfolio };
      }
    }
  }
  return null;
}

type HealthRange = "crisis" | "struggling" | "stable" | "thriving";

interface MemoTemplate {
  healthRange: HealthRange;
  titleTemplate: string;
  descriptionTemplate: string;
  choices: Array<{
    label: string;
    context: string;
    effects: Array<{ target: Effect["target"]; delta: number; description: string }>;
  }>;
}

const MEMO_TEMPLATES: MemoTemplate[] = [
  {
    healthRange: "crisis",
    titleTemplate: "Emergency Intervention: {sector} Crisis",
    descriptionTemplate:
      "Mr. President, the {sector} sector is in critical condition. {minister} is requesting emergency funding and executive intervention. Without immediate action, we risk cascading failures across related sectors. The minister proposes an emergency stabilization package.",
    choices: [
      {
        label: "Approve emergency package",
        context: "Allocate \u20A650B emergency fund",
        effects: [
          { target: "stability", delta: 4, description: "+4 stability from crisis response" },
          { target: "treasury", delta: -50, description: "-\u20A650B treasury" },
        ],
      },
      {
        label: "Partial intervention",
        context: "Targeted support only",
        effects: [
          { target: "stability", delta: 2, description: "+2 stability" },
          { target: "treasury", delta: -20, description: "-\u20A620B treasury" },
        ],
      },
      {
        label: "Defer to next meeting",
        context: "Minister must manage within budget",
        effects: [
          { target: "trust", delta: -5, description: "Minister frustrated" },
        ],
      },
    ],
  },
  {
    healthRange: "struggling",
    titleTemplate: "Reform Proposal: {sector} Recovery Plan",
    descriptionTemplate:
      "{minister} presents a recovery roadmap for the {sector} sector. Current indicators show concerning trends that need policy attention. The minister is proposing structural reforms that would require political capital but could stabilize the sector within two quarters.",
    choices: [
      {
        label: "Approve full reform package",
        context: "Spend 10 political capital",
        effects: [
          { target: "stability", delta: 3, description: "+3 stability from reforms" },
          { target: "politicalCapital", delta: -10, description: "-10 political capital" },
        ],
      },
      {
        label: "Approve scaled-down version",
        context: "Spend 5 political capital",
        effects: [
          { target: "stability", delta: 1, description: "+1 stability" },
          { target: "politicalCapital", delta: -5, description: "-5 political capital" },
        ],
      },
      {
        label: "Request more data first",
        context: "Delay decision to next FEC",
        effects: [
          { target: "trust", delta: -3, description: "Minister disappointed" },
        ],
      },
    ],
  },
  {
    healthRange: "stable",
    titleTemplate: "Policy Update: {sector} Progress Report",
    descriptionTemplate:
      "{minister} presents a progress update on the {sector} sector. Performance is adequate but there are opportunities for improvement. The minister proposes a modest expansion of current programmes to maintain positive momentum.",
    choices: [
      {
        label: "Approve expansion",
        context: "Modest budget increase",
        effects: [
          { target: "stability", delta: 2, description: "+2 stability" },
          { target: "treasury", delta: -15, description: "-\u20A615B treasury" },
        ],
      },
      {
        label: "Maintain current course",
        context: "No changes needed",
        effects: [
          { target: "stability", delta: 0, description: "Status quo maintained" },
        ],
      },
    ],
  },
  {
    healthRange: "thriving",
    titleTemplate: "Expansion Proposal: {sector} Growth Initiative",
    descriptionTemplate:
      "{minister} reports strong performance in the {sector} sector and proposes an ambitious expansion programme. This could cement the administration's legacy in this area, but requires significant investment and carries political risk if results don't materialise.",
    choices: [
      {
        label: "Approve ambitious expansion",
        context: "High investment, high reward",
        effects: [
          { target: "approval", delta: 2, description: "+2 approval" },
          { target: "treasury", delta: -40, description: "-\u20A640B treasury" },
        ],
      },
      {
        label: "Modest consolidation",
        context: "Protect gains without overextending",
        effects: [
          { target: "stability", delta: 1, description: "+1 stability" },
          { target: "treasury", delta: -10, description: "-\u20A610B" },
        ],
      },
      {
        label: "Redirect resources elsewhere",
        context: "Successful sectors should self-sustain",
        effects: [
          { target: "trust", delta: -5, description: "Minister unhappy" },
          { target: "treasury", delta: 10, description: "+\u20A610B reallocation" },
        ],
      },
    ],
  },
];

function getHealthRange(health: number): HealthRange {
  if (health < 30) return "crisis";
  if (health < 50) return "struggling";
  if (health <= 70) return "stable";
  return "thriving";
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

/** Build an EventChoice from a template choice definition */
function buildEventChoice(
  memoId: string,
  index: number,
  choiceDef: MemoTemplate["choices"][number],
): EventChoice {
  const choiceId = `${memoId}-choice-${index}`;
  const consequence: Consequence = {
    id: `${choiceId}-consequence`,
    sourceEvent: memoId,
    delayDays: 0,
    effects: choiceDef.effects.map((e) => ({
      target: e.target,
      delta: e.delta,
      description: e.description,
    })),
    description: choiceDef.context,
  };

  return {
    id: choiceId,
    label: choiceDef.label,
    context: choiceDef.context,
    consequences: [consequence],
  };
}

/** Generate 2-4 FEC memos based on current game state */
export function generateFECMemos(state: GameState): FECMemo[] {
  const memos: FECMemo[] = [];

  for (const sectorKey of GOVERNANCE_SECTORS) {
    const sector = (state as any)[sectorKey];
    if (!sector || typeof sector.health !== "number") continue;

    const minister = findMinisterForSector(state, sectorKey);
    if (!minister) continue;

    const healthRange = getHealthRange(sector.health);
    const template = MEMO_TEMPLATES.find((t) => t.healthRange === healthRange);
    if (!template) continue;

    const vars = {
      sector: SECTOR_LABELS[sectorKey] ?? sectorKey,
      minister: minister.name,
    };

    const urgency: FECMemo["urgency"] =
      healthRange === "crisis"
        ? "urgent"
        : healthRange === "struggling"
          ? "important"
          : "routine";

    const memoId = `fec-memo-${state.day}-${sectorKey}`;

    const choices: EventChoice[] = template.choices.map((c, i) =>
      buildEventChoice(memoId, i, c),
    );

    memos.push({
      id: memoId,
      ministerKey: minister.name,
      portfolio: minister.portfolio,
      title: fillTemplate(template.titleTemplate, vars),
      description: fillTemplate(template.descriptionTemplate, vars),
      urgency,
      choices,
      sectorAffected: sectorKey,
    });
  }

  // Sort: urgent first, then important, then routine
  const urgencyOrder = { urgent: 0, important: 1, routine: 2 };
  memos.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  // Cap at 4 memos, minimum 2 (pad with routine if needed)
  return memos.slice(0, 4);
}
