import type { GameState, ActiveEvent, EventChoice, Consequence, Effect } from "./gameTypes";
import { PORTFOLIO_SECTOR_MAP, relationshipToScore } from "./cabinetSystem";

const SUMMON_COOLDOWN_DAYS = 7;

type HealthRange = "crisis" | "struggling" | "stable" | "thriving";
type RelationshipTone = "guarded" | "professional" | "trusting";

interface EncounterTemplate {
  healthRange: HealthRange;
  titleTemplate: string;
  descriptionTemplate: string;
  choices: Array<{
    label: string;
    context: string;
    effects: Array<{ target: Effect["target"]; delta: number; description: string; characterName?: string }>;
  }>;
}

function getHealthRange(health: number): HealthRange {
  if (health < 30) return "crisis";
  if (health < 50) return "struggling";
  if (health <= 70) return "stable";
  return "thriving";
}

function getRelationshipTone(relationship: string): RelationshipTone {
  if (["Hostile", "Distrustful", "Wary"].includes(relationship)) return "guarded";
  if (relationship === "Neutral") return "professional";
  return "trusting";
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

const TONE_PREFIX: Record<RelationshipTone, string> = {
  guarded:
    "{minister} enters your office with visible tension, choosing words carefully and avoiding eye contact. The air between you is thick with unspoken grievances.",
  professional:
    "{minister} arrives punctually with a prepared brief, maintaining a businesslike demeanour throughout the meeting.",
  trusting:
    "{minister} greets you warmly and speaks with candour, clearly comfortable sharing frank assessments and unfiltered counsel.",
};

const SECTOR_TEMPLATES: EncounterTemplate[] = [
  // ── Crisis (health < 30) ──
  {
    healthRange: "crisis",
    titleTemplate: "Emergency Summons: {sector} Collapse",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, the {sector} sector is on the brink of collapse. We are haemorrhaging capacity daily and the public is losing patience. I need your direct intervention or this situation will spiral beyond recovery.\"",
    choices: [
      { label: "Deploy emergency task force", context: "Presidential intervention with full resources", effects: [
        { target: "stability", delta: 5, description: "+5 stability from crisis intervention" },
        { target: "treasury", delta: -40, description: "-\u20A640B emergency allocation" },
        { target: "character", delta: 10, description: "Minister grateful for support", characterName: "{minister}" },
      ]},
      { label: "Issue a public statement only", context: "Signal concern without committing resources", effects: [
        { target: "approval", delta: -2, description: "-2 approval, public sees empty words" },
        { target: "character", delta: -5, description: "Minister feels abandoned", characterName: "{minister}" },
      ]},
      { label: "Place minister on probation", context: "Hold the minister accountable for the failure", effects: [
        { target: "character", delta: -15, description: "Minister humiliated and resentful", characterName: "{minister}" },
        { target: "stability", delta: 1, description: "+1 stability from accountability signal" },
      ]},
    ],
  },
  {
    healthRange: "crisis",
    titleTemplate: "Urgent Briefing: {sector} Emergency",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, I must be blunt. The {sector} sector is failing. Our indicators are the worst in a decade. I have a recovery plan but it requires your personal backing at FEC and significant treasury allocation. Without it, I cannot turn this around.\"",
    choices: [
      { label: "Back the recovery plan fully", context: "Commit political capital and funding", effects: [
        { target: "politicalCapital", delta: -8, description: "-8 political capital" },
        { target: "stability", delta: 4, description: "+4 stability from recovery effort" },
        { target: "character", delta: 8, description: "Minister's confidence boosted", characterName: "{minister}" },
      ]},
      { label: "Approve a scaled-down version", context: "Partial support with conditions", effects: [
        { target: "stability", delta: 2, description: "+2 stability" },
        { target: "politicalCapital", delta: -3, description: "-3 political capital" },
      ]},
      { label: "Demand a new plan first", context: "Reject current proposal", effects: [
        { target: "character", delta: -8, description: "Minister frustrated by rejection", characterName: "{minister}" },
      ]},
    ],
  },
  {
    healthRange: "crisis",
    titleTemplate: "Crisis Meeting: {sector} Breakdown",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, I won't sugarcoat it. The {sector} situation has deteriorated beyond what normal policy can address. Civil society groups are organising protests. I need either a complete policy reset or reinforcements from other ministries.\"",
    choices: [
      { label: "Authorise cross-ministry support", context: "Redirect resources from other sectors", effects: [
        { target: "stability", delta: 3, description: "+3 stability from coordinated response" },
        { target: "character", delta: 5, description: "Minister appreciates collaboration", characterName: "{minister}" },
        { target: "treasury", delta: -20, description: "-\u20A620B reallocation costs" },
      ]},
      { label: "Order a policy reset", context: "Start fresh with new approach", effects: [
        { target: "politicalCapital", delta: -5, description: "-5 political capital for policy reversal" },
        { target: "stability", delta: 1, description: "+1 stability from fresh direction" },
      ]},
    ],
  },
  {
    healthRange: "crisis",
    titleTemplate: "SOS from {portfolio}: {sector} in Freefall",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, the numbers are dire. {sector} indicators have breached every red line we set. My permanent secretary is threatening to resign. The opposition is drafting a motion of no confidence. I need a lifeline, sir.\"",
    choices: [
      { label: "Grant emergency powers to the minister", context: "Bypass normal procurement channels", effects: [
        { target: "stability", delta: 4, description: "+4 stability from rapid action" },
        { target: "trust", delta: -3, description: "-3 trust, transparency concerns" },
        { target: "character", delta: 10, description: "Minister empowered and loyal", characterName: "{minister}" },
      ]},
      { label: "Summon permanent secretary yourself", context: "Bypass the minister to get facts", effects: [
        { target: "character", delta: -12, description: "Minister feels undermined", characterName: "{minister}" },
        { target: "stability", delta: 2, description: "+2 stability from direct oversight" },
      ]},
    ],
  },

  // ── Struggling (30-50) ──
  {
    healthRange: "struggling",
    titleTemplate: "Status Review: {sector} Challenges",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, the {sector} sector is underperforming. We are not yet in crisis, but the trajectory is concerning. I have identified three bottlenecks and I'm requesting your support to address them before things get worse.\"",
    choices: [
      { label: "Approve the bottleneck plan", context: "Targeted intervention on key issues", effects: [
        { target: "stability", delta: 3, description: "+3 stability from targeted fixes" },
        { target: "treasury", delta: -15, description: "-\u20A615B for interventions" },
        { target: "character", delta: 5, description: "Minister's morale improved", characterName: "{minister}" },
      ]},
      { label: "Ask for monthly progress reports", context: "Monitor without intervening yet", effects: [
        { target: "character", delta: -3, description: "Minister wanted more support", characterName: "{minister}" },
      ]},
      { label: "Reassign part of the portfolio", context: "Split responsibilities with another minister", effects: [
        { target: "character", delta: -10, description: "Minister sees it as a demotion", characterName: "{minister}" },
        { target: "stability", delta: 2, description: "+2 stability from fresh management" },
      ]},
    ],
  },
  {
    healthRange: "struggling",
    titleTemplate: "Consultation: {sector} Stagnation",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, I requested this meeting because {sector} progress has stalled. My team is stretched thin, and some of the policy levers we need are controlled by other ministries. I need your help to break the logjam.\"",
    choices: [
      { label: "Convene an inter-ministerial committee", context: "Coordinate across portfolios", effects: [
        { target: "stability", delta: 2, description: "+2 stability from coordination" },
        { target: "politicalCapital", delta: -4, description: "-4 political capital" },
        { target: "character", delta: 5, description: "Minister feels supported", characterName: "{minister}" },
      ]},
      { label: "Tell the minister to manage internally", context: "No additional support", effects: [
        { target: "character", delta: -5, description: "Minister disappointed", characterName: "{minister}" },
      ]},
    ],
  },
  {
    healthRange: "struggling",
    titleTemplate: "Briefing Request: {sector} Shortfalls",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, I won't pretend things are going well in {sector}. We have revenue shortfalls, staffing gaps, and procurement delays. But I have a lean recovery plan that could stabilise us within a quarter if you approve the funding.\"",
    choices: [
      { label: "Approve the lean recovery plan", context: "Modest funding for quick wins", effects: [
        { target: "treasury", delta: -10, description: "-\u20A610B targeted spending" },
        { target: "stability", delta: 2, description: "+2 stability" },
        { target: "character", delta: 5, description: "Minister grateful", characterName: "{minister}" },
      ]},
      { label: "Demand cost-neutral solutions", context: "No new spending allowed", effects: [
        { target: "character", delta: -4, description: "Minister constrained", characterName: "{minister}" },
        { target: "stability", delta: 1, description: "+1 from efficiency pressure" },
      ]},
    ],
  },
  {
    healthRange: "struggling",
    titleTemplate: "Private Meeting: {sector} Concerns",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, there are rumblings in the press about {sector} performance. Before this becomes a full media storm, I want to brief you directly and propose corrective measures. We still have a window to act.\"",
    choices: [
      { label: "Approve corrective measures", context: "Act before media pressure builds", effects: [
        { target: "stability", delta: 3, description: "+3 stability from proactive response" },
        { target: "treasury", delta: -12, description: "-\u20A612B for corrections" },
        { target: "character", delta: 4, description: "Minister's initiative rewarded", characterName: "{minister}" },
      ]},
      { label: "Prepare a media response instead", context: "Manage optics rather than substance", effects: [
        { target: "approval", delta: 1, description: "+1 approval from spin" },
        { target: "character", delta: -3, description: "Minister wanted substance", characterName: "{minister}" },
      ]},
      { label: "Do nothing and monitor", context: "Wait and see approach", effects: [
        { target: "character", delta: -5, description: "Minister feels ignored", characterName: "{minister}" },
      ]},
    ],
  },

  // ── Stable (50-70) ──
  {
    healthRange: "stable",
    titleTemplate: "Routine Update: {sector} Progress",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, {sector} is performing within acceptable bounds. We are on track with most KPIs. I have a proposal for a modest initiative that could push us into the next tier of performance, if you are willing to invest.\"",
    choices: [
      { label: "Approve the initiative", context: "Invest in growth", effects: [
        { target: "stability", delta: 2, description: "+2 stability" },
        { target: "treasury", delta: -15, description: "-\u20A615B investment" },
        { target: "character", delta: 3, description: "Minister encouraged", characterName: "{minister}" },
      ]},
      { label: "Maintain current trajectory", context: "If it's not broken, don't fix it", effects: [
        { target: "stability", delta: 0, description: "Status quo maintained" },
      ]},
    ],
  },
  {
    healthRange: "stable",
    titleTemplate: "Policy Discussion: {sector} Opportunities",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, the {sector} sector is stable and I want to discuss opportunities we could seize. There are federal programmes we could leverage, and I've identified partnerships with state governments that could amplify our impact.\"",
    choices: [
      { label: "Pursue the partnerships", context: "Build state-level alliances", effects: [
        { target: "stability", delta: 2, description: "+2 stability from partnerships" },
        { target: "politicalCapital", delta: -3, description: "-3 political capital" },
        { target: "character", delta: 4, description: "Minister's vision supported", characterName: "{minister}" },
      ]},
      { label: "Focus on consolidating gains", context: "Protect what we have first", effects: [
        { target: "stability", delta: 1, description: "+1 stability" },
      ]},
      { label: "Redirect the minister's energy elsewhere", context: "Assign a side project", effects: [
        { target: "character", delta: -5, description: "Minister feels sidelined", characterName: "{minister}" },
      ]},
    ],
  },
  {
    healthRange: "stable",
    titleTemplate: "Quarterly Review: {sector} Performance",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, here is my quarterly review for {sector}. Numbers are solid across the board. I am requesting a small top-up to our operational budget to maintain momentum and address minor service delivery gaps.\"",
    choices: [
      { label: "Approve the budget top-up", context: "Keep the sector well-funded", effects: [
        { target: "treasury", delta: -8, description: "-\u20A68B budget top-up" },
        { target: "stability", delta: 1, description: "+1 stability" },
        { target: "character", delta: 3, description: "Minister satisfied", characterName: "{minister}" },
      ]},
      { label: "Defer to next quarter", context: "Tighten fiscal discipline", effects: [
        { target: "character", delta: -2, description: "Minister slightly disappointed", characterName: "{minister}" },
      ]},
    ],
  },
  {
    healthRange: "stable",
    titleTemplate: "Working Session: {sector} Fine-tuning",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, I wanted to walk you through some adjustments we are making in {sector}. Nothing dramatic—just operational refinements. But one item needs your sign-off: a personnel reshuffle within the ministry.\"",
    choices: [
      { label: "Approve the reshuffle", context: "Trust the minister's judgement", effects: [
        { target: "stability", delta: 1, description: "+1 from better staffing" },
        { target: "character", delta: 5, description: "Minister empowered", characterName: "{minister}" },
      ]},
      { label: "Review the names first", context: "Exercise oversight before approving", effects: [
        { target: "character", delta: -2, description: "Minister feels micromanaged", characterName: "{minister}" },
        { target: "stability", delta: 1, description: "+1 from due diligence" },
      ]},
    ],
  },

  // ── Thriving (> 70) ──
  {
    healthRange: "thriving",
    titleTemplate: "Expansion Pitch: {sector} Ambitions",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, {sector} is performing excellently. I believe now is the time to be ambitious. I am proposing a flagship programme that could become a legacy achievement for this administration. The sector is ready for it.\"",
    choices: [
      { label: "Approve the flagship programme", context: "Go big on a legacy initiative", effects: [
        { target: "approval", delta: 3, description: "+3 approval from ambition" },
        { target: "treasury", delta: -35, description: "-\u20A635B flagship investment" },
        { target: "character", delta: 8, description: "Minister thrilled", characterName: "{minister}" },
      ]},
      { label: "Scale it down to a pilot", context: "Test before committing fully", effects: [
        { target: "stability", delta: 1, description: "+1 from prudent approach" },
        { target: "treasury", delta: -10, description: "-\u20A610B pilot cost" },
        { target: "character", delta: 2, description: "Minister accepts caution", characterName: "{minister}" },
      ]},
      { label: "Redirect success to weaker sectors", context: "Redistribute resources", effects: [
        { target: "character", delta: -8, description: "Minister feels penalised for success", characterName: "{minister}" },
        { target: "treasury", delta: 10, description: "+\u20A610B reallocation" },
      ]},
    ],
  },
  {
    healthRange: "thriving",
    titleTemplate: "Success Report: {sector} Milestones",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, I am pleased to report that {sector} has exceeded all targets this quarter. International organisations have taken notice. I recommend we leverage this success for diplomatic goodwill and attract foreign investment.\"",
    choices: [
      { label: "Launch international outreach", context: "Capitalise on the success globally", effects: [
        { target: "approval", delta: 2, description: "+2 approval from good news" },
        { target: "politicalCapital", delta: 3, description: "+3 political capital from momentum" },
        { target: "character", delta: 5, description: "Minister proud", characterName: "{minister}" },
      ]},
      { label: "Keep focused domestically", context: "Don't overextend", effects: [
        { target: "stability", delta: 1, description: "+1 stability" },
      ]},
    ],
  },
  {
    healthRange: "thriving",
    titleTemplate: "Vision Meeting: {sector} Next Phase",
    descriptionTemplate:
      "{tone}\n\n\"Mr. President, with {sector} in excellent health, I want to present a five-year vision. We can either consolidate our gains or push for transformational change. Both paths have merit, but the transformational path requires your full backing.\"",
    choices: [
      { label: "Back the transformational agenda", context: "High risk, high reward", effects: [
        { target: "politicalCapital", delta: -6, description: "-6 political capital" },
        { target: "approval", delta: 2, description: "+2 approval from bold vision" },
        { target: "character", delta: 8, description: "Minister energised", characterName: "{minister}" },
      ]},
      { label: "Choose the consolidation path", context: "Protect existing gains", effects: [
        { target: "stability", delta: 2, description: "+2 stability from consolidation" },
        { target: "character", delta: 0, description: "Minister accepts pragmatism" , characterName: "{minister}" },
      ]},
    ],
  },
  {
    healthRange: "thriving",
    titleTemplate: "Commendation Meeting: {sector} Excellence",
    descriptionTemplate:
      "{tone}\n\n\"Your Excellency, {sector} is the pride of this administration. I wanted to personally brief you on our achievements and discuss how we can replicate this success model across government.\"",
    choices: [
      { label: "Publicly commend the minister", context: "Boost morale across cabinet", effects: [
        { target: "character", delta: 10, description: "Minister deeply honoured", characterName: "{minister}" },
        { target: "approval", delta: 1, description: "+1 approval from positive optics" },
      ]},
      { label: "Ask minister to mentor struggling colleagues", context: "Spread best practices", effects: [
        { target: "character", delta: 3, description: "Minister flattered but stretched", characterName: "{minister}" },
        { target: "stability", delta: 2, description: "+2 stability from knowledge sharing" },
      ]},
      { label: "Acknowledge and move on", context: "Keep expectations grounded", effects: [
        { target: "character", delta: -2, description: "Minister expected more recognition", characterName: "{minister}" },
      ]},
    ],
  },
];

// ── Non-sector minister templates ──
interface GenericTemplate {
  titleTemplate: string;
  descriptionTemplate: string;
  choices: EncounterTemplate["choices"];
}

const GENERIC_TEMPLATES: GenericTemplate[] = [
  {
    titleTemplate: "Diplomatic Briefing from {portfolio}",
    descriptionTemplate:
      "{tone}\n\n\"{minister} provides a confidential update on sensitive matters within the {portfolio} portfolio. Several issues require presidential attention, and there are political implications regardless of which direction you choose.\"",
    choices: [
      { label: "Engage directly with the issue", context: "Personal presidential involvement", effects: [
        { target: "politicalCapital", delta: -4, description: "-4 political capital" },
        { target: "stability", delta: 2, description: "+2 stability from engagement" },
        { target: "character", delta: 5, description: "Minister appreciates involvement", characterName: "{minister}" },
      ]},
      { label: "Delegate back to the minister", context: "Trust their judgement", effects: [
        { target: "character", delta: 3, description: "Minister empowered", characterName: "{minister}" },
      ]},
      { label: "Refer to the National Security Council", context: "Escalate through proper channels", effects: [
        { target: "stability", delta: 1, description: "+1 from institutional process" },
        { target: "character", delta: -3, description: "Minister feels bureaucratically sidelined", characterName: "{minister}" },
      ]},
    ],
  },
  {
    titleTemplate: "Strategic Review: {portfolio} Priorities",
    descriptionTemplate:
      "{tone}\n\n\"{minister} requests your guidance on shifting priorities within {portfolio}. International developments and domestic pressures are creating competing demands, and the minister needs a clear presidential directive.\"",
    choices: [
      { label: "Issue a clear directive", context: "Set firm priorities", effects: [
        { target: "character", delta: 5, description: "Minister has clarity", characterName: "{minister}" },
        { target: "politicalCapital", delta: -2, description: "-2 political capital" },
      ]},
      { label: "Ask for options paper first", context: "More analysis before deciding", effects: [
        { target: "character", delta: -2, description: "Minister wanted decisiveness", characterName: "{minister}" },
      ]},
    ],
  },
  {
    titleTemplate: "Confidential Report: {portfolio} Intelligence",
    descriptionTemplate:
      "{tone}\n\n\"{minister} brings a sensitive intelligence report related to the {portfolio} mandate. The information could reshape current policy if acted upon, but verification is still incomplete.\"",
    choices: [
      { label: "Act on the intelligence immediately", context: "Decisive but risky", effects: [
        { target: "stability", delta: 3, description: "+3 stability if intelligence is correct" },
        { target: "trust", delta: -2, description: "-2 trust from acting on unverified intel" },
        { target: "character", delta: 5, description: "Minister's initiative rewarded", characterName: "{minister}" },
      ]},
      { label: "Verify through independent channels", context: "Patient and thorough", effects: [
        { target: "stability", delta: 1, description: "+1 from due process" },
        { target: "character", delta: -2, description: "Minister wanted faster action", characterName: "{minister}" },
      ]},
      { label: "Suppress the report for now", context: "Too politically sensitive", effects: [
        { target: "character", delta: -8, description: "Minister disturbed by suppression", characterName: "{minister}" },
        { target: "trust", delta: -3, description: "-3 trust from concealment" },
      ]},
    ],
  },
  {
    titleTemplate: "Private Audience: {portfolio} Matters",
    descriptionTemplate:
      "{tone}\n\n\"{minister} sought a private audience to discuss a delicate matter within {portfolio}. Internal disagreements and external pressure have created a situation that only presidential authority can resolve.\"",
    choices: [
      { label: "Mediate the internal dispute", context: "Presidential arbitration", effects: [
        { target: "politicalCapital", delta: -3, description: "-3 political capital from getting involved" },
        { target: "character", delta: 5, description: "Minister grateful for mediation", characterName: "{minister}" },
        { target: "stability", delta: 2, description: "+2 stability from resolution" },
      ]},
      { label: "Tell the minister to handle it", context: "Stay above the fray", effects: [
        { target: "character", delta: -4, description: "Minister feels unsupported", characterName: "{minister}" },
      ]},
    ],
  },
];

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

function buildEventChoice(
  eventId: string,
  index: number,
  choiceDef: EncounterTemplate["choices"][number],
  ministerName: string,
): EventChoice {
  const choiceId = `${eventId}-choice-${index}`;
  const consequence: Consequence = {
    id: `${choiceId}-consequence`,
    sourceEvent: eventId,
    delayDays: 0,
    effects: choiceDef.effects.map((e) => ({
      target: e.target,
      delta: e.delta,
      description: e.description,
      ...(e.characterName ? { characterName: e.characterName === "{minister}" ? ministerName : e.characterName } : {}),
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

/** Pick a deterministic-ish template based on day and name for variety */
function pickTemplate<T>(templates: T[], day: number, name: string): T {
  let hash = day;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return templates[hash % templates.length];
}

/**
 * Generate a narrative encounter when the president summons a minister.
 * Returns null if the minister was summoned within the last 7 days,
 * is not in the cabinet, or is not a known character.
 */
export function generateMinisterEncounter(
  state: GameState,
  ministerName: string,
): ActiveEvent | null {
  // Guard: minister must exist as a character
  const character = state.characters[ministerName];
  if (!character) return null;

  // Guard: minister must be in cabinet
  const portfolio = Object.entries(state.cabinetAppointments).find(
    ([, name]) => name === ministerName,
  )?.[0];
  if (!portfolio) return null;

  // Guard: cooldown check
  const status = state.ministerStatuses[ministerName];
  if (status && state.day - status.lastSummonedDay < SUMMON_COOLDOWN_DAYS) {
    return null;
  }

  const sectorKey = PORTFOLIO_SECTOR_MAP[portfolio] ?? null;
  const tone = getRelationshipTone(character.relationship);
  const eventId = `minister-summons-${state.day}-${ministerName.replace(/\s+/g, "-")}`;

  // Sector-mapped minister
  if (sectorKey) {
    const sector = (state as any)[sectorKey];
    const health = sector?.health ?? 50;
    const healthRange = getHealthRange(health);

    const matchingTemplates = SECTOR_TEMPLATES.filter((t) => t.healthRange === healthRange);
    const template = pickTemplate(matchingTemplates, state.day, ministerName);

    const vars = {
      minister: ministerName,
      portfolio,
      sector: SECTOR_LABELS[sectorKey] ?? sectorKey,
      tone: fillTemplate(TONE_PREFIX[tone], { minister: ministerName }),
    };

    const severity = healthRange === "crisis" ? "critical" as const
      : healthRange === "struggling" ? "warning" as const
      : "info" as const;

    const category = sectorKey === "economy" ? "economy" as const : "governance" as const;

    const choices = template.choices.map((c, i) =>
      buildEventChoice(eventId, i, c, ministerName),
    );

    return {
      id: eventId,
      title: fillTemplate(template.titleTemplate, vars),
      severity,
      description: fillTemplate(template.descriptionTemplate, vars),
      category,
      source: "minister-summons",
      choices,
      createdDay: state.day,
    };
  }

  // Non-sector minister (Defence, Justice, Foreign Affairs)
  const genericTemplate = pickTemplate(GENERIC_TEMPLATES, state.day, ministerName);

  const vars = {
    minister: ministerName,
    portfolio,
    tone: fillTemplate(TONE_PREFIX[tone], { minister: ministerName }),
  };

  const choices = genericTemplate.choices.map((c, i) =>
    buildEventChoice(eventId, i, c, ministerName),
  );

  return {
    id: eventId,
    title: fillTemplate(genericTemplate.titleTemplate, vars),
    severity: "info",
    description: fillTemplate(genericTemplate.descriptionTemplate, vars),
    category: portfolio === "Defence" ? "security" : "diplomacy",
    source: "minister-summons",
    choices,
    createdDay: state.day,
  };
}
