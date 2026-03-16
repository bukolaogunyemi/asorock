import type { ActiveEvent, EventChoice, Consequence, Effect, GameState } from "./gameTypes";
import type { EconomicState } from "./economicTypes";

interface BriefingContext {
  economy: EconomicState;
  subsection?: string;
  avgCompetence: number;
}

// ── Issue detection ─────────────────────────────────────────
type IssueType = "crisis" | "inflation" | "unemployment" | "reserves" | "cascade" | "strategic";

interface DetectedIssue {
  type: IssueType;
  metric?: string;
  value?: number;
  severity: "critical" | "warning" | "info";
}

function detectIssue(ctx: BriefingContext): DetectedIssue {
  const eco = ctx.economy;
  const ci = eco.crisisIndicators;

  // Red crisis indicators
  const zoneEntries: Array<[string, string]> = [
    ["inflation", ci.inflationZone],
    ["unemployment", ci.unemploymentZone],
    ["fx", ci.fxZone],
    ["debt", ci.debtZone],
    ["treasury", ci.treasuryZone],
    ["oilOutput", ci.oilOutputZone],
  ];
  for (const [key, zone] of zoneEntries) {
    if (zone === "red") return { type: "crisis", metric: key, severity: "critical" };
  }

  // Active cascades
  if (eco.activeCascades?.length > 0) return { type: "cascade", severity: "critical" };

  // Threshold checks
  if (eco.inflation > 20) return { type: "inflation", value: eco.inflation, severity: "warning" };
  if (eco.unemploymentRate > 30) return { type: "unemployment", value: eco.unemploymentRate, severity: "warning" };
  if (eco.reserves < 20) return { type: "reserves", value: eco.reserves, severity: "warning" };

  return { type: "strategic", severity: "info" };
}

// ── Subsection-specific titles ──────────────────────────────
const SUBSECTION_LABELS: Record<string, string> = {
  budget: "Budget Review",
  revenue: "Revenue Assessment",
  debt: "Debt Management",
  trade: "Trade Strategy",
};

// ── Helper to build Consequence objects ─────────────────────
function makeConsequence(
  id: string,
  sourceEvent: string,
  desc: string,
  effects: Array<{ target: Effect["target"]; delta: number; description: string }>,
): Consequence {
  return {
    id,
    sourceEvent,
    delayDays: 0,
    description: desc,
    effects: effects.map(e => ({ target: e.target, delta: e.delta, description: e.description })),
  };
}

// ── Choice generation ───────────────────────────────────────
interface ChoiceTemplate {
  label: string;
  context: string;
  hiddenDownside?: string;
  effects: Array<{ target: Effect["target"]; delta: number; description: string }>;
}

function generateChoices(issue: DetectedIssue, ctx: BriefingContext, eventId: string): EventChoice[] {
  const templates = getChoiceTemplates(issue);
  const competence = ctx.avgCompetence;

  return templates.map((t, i) => {
    let context = t.context;

    // Low competence: hide downside of trap option (last choice)
    if (competence < 50 && i === templates.length - 1 && t.hiddenDownside) {
      context = t.context.replace(/ — .*$/, ""); // strip consequence hint
    }

    // Medium competence: make descriptions vaguer
    if (competence >= 50 && competence <= 80) {
      context = context.replace(/\+\d+/g, "some improvement").replace(/-\d+/g, "some cost");
    }

    return {
      id: `briefing-choice-${i}`,
      label: t.label,
      context,
      consequences: t.effects.length > 0
        ? [makeConsequence(`briefing-csq-${i}`, eventId, t.label, t.effects)]
        : [],
    };
  });
}

function getChoiceTemplates(issue: DetectedIssue): ChoiceTemplate[] {
  switch (issue.type) {
    case "inflation":
    case "crisis":
      return [
        {
          label: "Tighten monetary policy",
          context: "Raise interest rates to cool inflation — growth -1%, inflation -2%",
          effects: [
            { target: "stability", delta: 5, description: "Monetary tightening stabilises prices" },
            { target: "approval", delta: -2, description: "Austerity measures unpopular" },
          ],
        },
        {
          label: "Price controls on essentials",
          context: "Cap prices on basic goods — approval +3, but inflation rebounds next turn",
          effects: [
            { target: "approval", delta: 3, description: "Price relief welcomed" },
          ],
        },
        {
          label: "Negotiate with suppliers",
          context: "Broker deals with key importers and producers to voluntarily cap margins",
          effects: [
            { target: "stability", delta: 2, description: "Cooperative approach eases supply bottlenecks" },
            { target: "politicalCapital", delta: -2, description: "Business favours cost political capital" },
          ],
        },
        {
          label: "Ride it out",
          context: "No intervention — stress +5, no policy lock-in",
          hiddenDownside: "Market confidence drops sharply",
          effects: [
            { target: "stress", delta: 5, description: "Inaction under pressure" },
          ],
        },
      ];

    case "unemployment":
      return [
        {
          label: "Public works programme",
          context: "Launch infrastructure jobs — employment boost, treasury cost",
          effects: [
            { target: "treasury", delta: -0.5, description: "Public works spending" },
            { target: "approval", delta: 3, description: "Jobs programme popular" },
          ],
        },
        {
          label: "Tax incentives for businesses",
          context: "Reduce corporate tax temporarily — growth stimulus",
          effects: [
            { target: "treasury", delta: -0.2, description: "Tax revenue reduction" },
          ],
        },
        {
          label: "Skills training initiative",
          context: "Partner with private sector on vocational training — slower impact but sustainable",
          effects: [
            { target: "trust", delta: 3, description: "Long-term human capital investment" },
            { target: "treasury", delta: -0.15, description: "Training programme costs" },
          ],
        },
        {
          label: "Expand social safety net",
          context: "Increase cash transfers — approval +5, treasury cost",
          hiddenDownside: "Creates dependency, unemployment stays flat",
          effects: [
            { target: "approval", delta: 5, description: "Safety net expansion welcomed" },
            { target: "treasury", delta: -0.3, description: "Transfer programme costs" },
          ],
        },
      ];

    case "reserves":
      return [
        {
          label: "Restrict capital outflows",
          context: "Impose forex controls — reserves protected, business confidence drops",
          effects: [
            { target: "stability", delta: 3, description: "Capital controls stabilise reserves" },
            { target: "approval", delta: -2, description: "Business community unhappy" },
          ],
        },
        {
          label: "IMF standby facility",
          context: "Negotiate credit line — reserves boosted, sovereignty concerns",
          effects: [
            { target: "stability", delta: 5, description: "IMF backstop reassures markets" },
            { target: "approval", delta: -3, description: "Sovereignty concerns" },
          ],
        },
        {
          label: "Boost oil export receipts",
          context: "Fast-track new crude contracts and crack down on oil theft to rebuild buffers",
          effects: [
            { target: "stability", delta: 2, description: "Revenue pipeline strengthened" },
            { target: "treasury", delta: 0.15, description: "Oil receipts improve" },
          ],
        },
        {
          label: "Swap currency lines with allies",
          context: "Negotiate bilateral swap agreements with China and India for trade cover",
          effects: [
            { target: "stability", delta: 3, description: "Alternative FX cover provides breathing room" },
            { target: "trust", delta: -1, description: "Western partners view the pivot warily" },
          ],
        },
      ];

    case "cascade":
      return [
        {
          label: "Emergency fiscal measures",
          context: "Activate crisis protocols — stability +10, treasury cost",
          effects: [
            { target: "stability", delta: 10, description: "Crisis protocols activated" },
            { target: "treasury", delta: -1, description: "Emergency spending" },
          ],
        },
        {
          label: "Targeted intervention",
          context: "Address root cause — slower but sustainable recovery",
          effects: [
            { target: "stability", delta: 5, description: "Targeted recovery measures" },
          ],
        },
        {
          label: "National address and reassurance",
          context: "Go on television to calm the nation while emergency teams work behind scenes",
          effects: [
            { target: "approval", delta: 3, description: "Presidential visibility reassures the public" },
            { target: "stability", delta: 2, description: "Panic eases slightly" },
          ],
        },
        {
          label: "Convene emergency economic council",
          context: "Bring together top economists, bankers, and business leaders for crisis summit",
          effects: [
            { target: "trust", delta: 4, description: "Collaborative response impresses observers" },
            { target: "stability", delta: 3, description: "Coordinated action limits damage" },
            { target: "politicalCapital", delta: -2, description: "The summit consumes political bandwidth" },
          ],
        },
      ];

    default: // strategic
      return [
        {
          label: "Push economic diversification",
          context: "Invest in non-oil sectors — growth boost, treasury cost",
          effects: [
            { target: "treasury", delta: -0.3, description: "Diversification investment" },
            { target: "approval", delta: 2, description: "Growth agenda popular" },
          ],
        },
        {
          label: "Consolidate fiscal position",
          context: "Reduce spending, build reserves — approval cost",
          effects: [
            { target: "approval", delta: -2, description: "Spending cuts unpopular" },
            { target: "stability", delta: 3, description: "Fiscal consolidation" },
          ],
        },
        {
          label: "Launch trade promotion offensive",
          context: "Open new export markets and attract foreign direct investment",
          effects: [
            { target: "trust", delta: 2, description: "International engagement boosts credibility" },
            { target: "treasury", delta: -0.1, description: "Trade promotion costs" },
            { target: "approval", delta: 1, description: "The outward-looking stance looks ambitious" },
          ],
        },
        {
          label: "Maintain current course",
          context: "No major changes — stability maintained",
          effects: [],
        },
      ];
  }
}

// ── Main export ─────────────────────────────────────────────
export function generateEconomyBriefing(
  state: Partial<GameState>,
  subsection?: string,
  avgCompetence: number = 70,
): ActiveEvent {
  const economy = state.economy!;
  const ctx: BriefingContext = { economy, subsection, avgCompetence };
  const issue = detectIssue(ctx);

  const subsectionLabel = subsection ? SUBSECTION_LABELS[subsection] ?? subsection : null;
  const topicLabel = issue.type === "strategic"
    ? "Strategic Review"
    : issue.type === "inflation" ? "Inflation Alert"
    : issue.type === "unemployment" ? "Unemployment Crisis"
    : issue.type === "reserves" ? "Reserve Depletion Warning"
    : issue.type === "cascade" ? "Economic Crisis Response"
    : "Crisis Briefing";

  const title = subsectionLabel
    ? `Economic Team Briefing: ${subsectionLabel}`
    : `Economic Team Briefing: ${topicLabel}`;

  const description = `Your economic team convenes to address ${
    issue.metric ? `the ${issue.metric} situation` : "the current economic outlook"
  }. ${issue.value ? `Current reading: ${issue.value}%.` : ""} Your advisers present their recommendations.`;

  const eventId = `economy-briefing-${Date.now()}`;
  const choices = generateChoices(issue, ctx, eventId);

  return {
    id: eventId,
    title,
    severity: issue.severity,
    description,
    category: "economy",
    source: "team-briefing",
    choices,
    createdDay: state.day ?? 0,
  };
}
