// client/src/lib/legislativeBills.ts
import type { Bill, BillEffects, ScheduledBill } from "./legislativeTypes";
import type { GameStateModifier } from "./legislativeTypes";

type BillTemplate = Pick<Bill, "title" | "description" | "subjectTag" | "stakes" | "effects">;

// ─── Budget bill effects ────────────────────────────────────────────────────

const budgetPassEffects: GameStateModifier[] = [
  { target: "approval", delta: 5 },
  { target: "stability", delta: 3 },
];

const budgetFailEffects: GameStateModifier[] = [
  { target: "approval", delta: -10 },
  { target: "stability", delta: -5 },
  { target: "macroEconomy", delta: 2, macroKey: "inflation" },
];

function makeBudgetEffects(): BillEffects {
  return { onPass: budgetPassEffects, onFail: budgetFailEffects };
}

// ─── Bill template factory helpers ─────────────────────────────────────────

function budgetBill(year: number): BillTemplate {
  return {
    title: `Federal Budget Appropriations Bill (Year ${year})`,
    description: `The annual appropriations bill setting government expenditure for year ${year} of the administration. Failure to pass triggers a constitutional funding crisis and government shutdown.`,
    subjectTag: "economy",
    stakes: "critical",
    effects: makeBudgetEffects(),
  };
}

// ─── Autonomous bill pool ────────────────────────────────────────────────────

const AUTONOMOUS_BILL_POOL: BillTemplate[] = [
  // Economy
  {
    title: "Tax Reform Act",
    description:
      "Restructures the personal income tax bands and introduces a digital-services levy targeting multinational tech firms operating in Nigeria.",
    subjectTag: "economy",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "approval", delta: 3 },
        { target: "macroEconomy", delta: -1, macroKey: "inflation" },
      ],
      onFail: [
        { target: "approval", delta: -4 },
        { target: "politicalCapital", delta: -5 },
      ],
    },
  },
  {
    title: "Trade Liberalization Bill",
    description:
      "Reduces import tariffs on industrial inputs and raw materials while strengthening the Customs & Excise Service's anti-smuggling mandate.",
    subjectTag: "economy",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "macroEconomy", delta: 3, macroKey: "gdpGrowth" },
        { target: "approval", delta: 2 },
      ],
      onFail: [
        { target: "approval", delta: -3 },
        { target: "factionGrievance", delta: 5, factionName: "Labour & Trade Unions" },
      ],
    },
  },
  {
    title: "Public Enterprises Privatization Act",
    description:
      "Authorises the Bureau of Public Enterprises to divest majority shares in four underperforming state-owned companies, including the national carrier.",
    subjectTag: "economy",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "macroEconomy", delta: 4, macroKey: "gdpGrowth" },
        { target: "politicalCapital", delta: 5 },
        { target: "factionGrievance", delta: 8, factionName: "Labour & Trade Unions" },
      ],
      onFail: [
        { target: "approval", delta: -2 },
        { target: "stability", delta: -2 },
      ],
    },
  },

  // Security
  {
    title: "Police Reform Bill",
    description:
      "Restructures the Nigeria Police Force, establishes an independent Police Service Commission with civilian oversight, and increases officer welfare packages.",
    subjectTag: "security",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "approval", delta: 6 },
        { target: "stability", delta: 4 },
        { target: "trust", delta: 5 },
      ],
      onFail: [
        { target: "approval", delta: -5 },
        { target: "outrage", delta: 8 },
      ],
    },
  },
  {
    title: "Anti-Terrorism Amendment",
    description:
      "Expands the definition of terrorism to include cyber-attacks on critical infrastructure, grants wider detention powers to the DSS, and increases prosecution timelines.",
    subjectTag: "security",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "stability", delta: 3 },
        { target: "approval", delta: 1 },
        { target: "outrage", delta: 4 },
      ],
      onFail: [
        { target: "stability", delta: -4 },
        { target: "approval", delta: -3 },
      ],
    },
  },
  {
    title: "Border Security Enhancement Act",
    description:
      "Funds a 2,000-strong Border Security Corps and deploys surveillance technology along the North-East and North-West borders to curb arms and narcotics trafficking.",
    subjectTag: "security",
    stakes: "routine",
    effects: {
      onPass: [
        { target: "stability", delta: 2 },
        { target: "macroEconomy", delta: -1, macroKey: "deficit" },
      ],
      onFail: [{ target: "stability", delta: -1 }],
    },
  },

  // Social
  {
    title: "Anti-Open Grazing Bill",
    description:
      "Criminalises unregulated open-range cattle grazing across all states, mandates establishment of cattle ranches, and creates a Federal Pastoralism Agency. Deeply contested between farming communities and Fulani herder groups.",
    subjectTag: "social",
    stakes: "critical",
    effects: {
      onPass: [
        { target: "approval", delta: 7 },
        { target: "factionGrievance", delta: 12, factionName: "Northern Elders" },
        { target: "stability", delta: -3 },
      ],
      onFail: [
        { target: "outrage", delta: 10 },
        { target: "approval", delta: -6 },
      ],
    },
  },
  {
    title: "Social Media Regulation Act",
    description:
      "Requires social media platforms to register with the Nigerian Communications Commission, mandates local data storage, and establishes a Digital Rights Ombudsman.",
    subjectTag: "social",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "trust", delta: -4 },
        { target: "outrage", delta: 6 },
        { target: "stability", delta: 2 },
      ],
      onFail: [
        { target: "approval", delta: -2 },
        { target: "politicalCapital", delta: -3 },
      ],
    },
  },
  {
    title: "Religious Harmony Bill",
    description:
      "Establishes an Inter-Faith Commission with statutory powers to mediate sectarian disputes, bans incitement speech in religious institutions, and funds community reconciliation programmes.",
    subjectTag: "social",
    stakes: "critical",
    effects: {
      onPass: [
        { target: "stability", delta: 5 },
        { target: "approval", delta: 4 },
        { target: "trust", delta: 3 },
      ],
      onFail: [
        { target: "outrage", delta: 9 },
        { target: "stability", delta: -5 },
        { target: "factionGrievance", delta: 8, factionName: "Religious Leaders" },
      ],
    },
  },

  // Governance
  {
    title: "Local Government Reform Bill",
    description:
      "Grants financial autonomy to the 774 local government areas by abolishing state joint-account deductions and mandating direct federal allocation disbursement.",
    subjectTag: "governance",
    stakes: "significant",
    effects: {
      onPass: [
        { target: "approval", delta: 5 },
        { target: "trust", delta: 4 },
        { target: "partyLoyalty", delta: -3 },
      ],
      onFail: [
        { target: "approval", delta: -4 },
        { target: "factionGrievance", delta: 6, factionName: "Governors Forum" },
      ],
    },
  },
  {
    title: "Whistleblower Protection Act",
    description:
      "Strengthens legal protections for public-sector whistleblowers, establishes an anonymous reporting portal, and entitles informants to a percentage of recovered assets.",
    subjectTag: "governance",
    stakes: "routine",
    effects: {
      onPass: [
        { target: "trust", delta: 5 },
        { target: "approval", delta: 3 },
      ],
      onFail: [
        { target: "trust", delta: -3 },
        { target: "outrage", delta: 4 },
      ],
    },
  },
  {
    title: "Public Procurement Amendment",
    description:
      "Lowers the open-competitive bidding threshold to ₦5 million, mandates e-procurement for all MDAs, and imposes criminal liability on procurement officers found guilty of bid-rigging.",
    subjectTag: "governance",
    stakes: "routine",
    effects: {
      onPass: [
        { target: "trust", delta: 4 },
        { target: "macroEconomy", delta: -1, macroKey: "deficit" },
        { target: "politicalCapital", delta: 3 },
      ],
      onFail: [
        { target: "trust", delta: -2 },
        { target: "approval", delta: -2 },
      ],
    },
  },
];

// ─── Electoral reform bill (year-3 crisis) ──────────────────────────────────

const ELECTORAL_REFORM_BILL: BillTemplate = {
  title: "Electoral Reform and Independent Candidacy Act",
  description:
    "Mandates electronic transmission of results from all polling units, introduces independent candidacy provisions, and reforms INEC funding to ensure independence from executive control. Directly threatens incumbents ahead of the next election.",
  subjectTag: "governance",
  stakes: "critical",
  effects: {
    onPass: [
      { target: "approval", delta: 8 },
      { target: "trust", delta: 7 },
      { target: "partyLoyalty", delta: -6 },
    ],
    onFail: [
      { target: "outrage", delta: 12 },
      { target: "trust", delta: -8 },
      { target: "approval", delta: -7 },
    ],
  },
};

// ─── Social flashpoint bills ─────────────────────────────────────────────────

const ANTI_GRAZING_CRISIS_BILL: BillTemplate = {
  ...AUTONOMOUS_BILL_POOL.find((b) => b.title === "Anti-Open Grazing Bill")!,
};

const RELIGIOUS_HARMONY_CRISIS_BILL: BillTemplate = {
  ...AUTONOMOUS_BILL_POOL.find((b) => b.title === "Religious Harmony Bill")!,
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns the pool of autonomous bill templates that the legislature can
 * introduce independently of the executive's legislative calendar.
 */
export function getAutonomousBillPool(): BillTemplate[] {
  return AUTONOMOUS_BILL_POOL;
}

/**
 * Seeds the full 4-year legislative calendar with scheduled bills.
 *
 * Guarantees:
 * - 4 annual budget bills spaced ~365 days apart (days ~90, ~455, ~820, ~1185)
 * - 1 electoral reform crisis in year 3 (~day 900)
 * - 2 social flashpoint crises (anti-grazing ~day 300, religious harmony ~day 600)
 * - Total crisis count: 7 (4 budgets + 1 electoral + 2 social)
 */
export function seedLegislativeCalendar(): ScheduledBill[] {
  const calendar: ScheduledBill[] = [];

  // 4 annual budget bills — days 90, 455, 820, 1185 (each ~365 days apart)
  const BUDGET_DAYS = [90, 455, 820, 1185];
  BUDGET_DAYS.forEach((day, idx) => {
    calendar.push({
      template: budgetBill(idx + 1),
      targetDay: day,
      isCrisis: true,
    });
  });

  // Anti-open grazing flashpoint — year 1 (day 300)
  calendar.push({
    template: ANTI_GRAZING_CRISIS_BILL,
    targetDay: 300,
    isCrisis: true,
  });

  // Religious harmony flashpoint — year 2 (day 600)
  calendar.push({
    template: RELIGIOUS_HARMONY_CRISIS_BILL,
    targetDay: 600,
    isCrisis: true,
  });

  // Electoral reform — year 3 (~day 900)
  calendar.push({
    template: ELECTORAL_REFORM_BILL,
    targetDay: 900,
    isCrisis: true,
  });

  // Sort by targetDay ascending
  calendar.sort((a, b) => a.targetDay - b.targetDay);

  return calendar;
}
