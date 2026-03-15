// Aso Rock — Advisory Whisper System
// Contextual one-line tips displayed between Zone A and the tab bar.
// Format: "Mr. President, [observation]." — [Adviser], [Title]

import type { CharacterState } from "./gameTypes";

// ── Tab-to-portfolio mapping ─────────────────────────────

const TAB_TO_PORTFOLIO: Record<string, string[]> = {
  villa: ["Chief of Staff"],
  cabinet: ["Chief of Staff"],
  governance: ["Finance", "Economy"],
  economy: ["Finance", "Economy"],
  security: ["Defence", "National Security", "Security"],
  politics: ["Party", "Political"],
  diplomacy: ["Foreign Affairs", "Foreign"],
  legislature: ["Justice", "Attorney", "Senate"],
  judiciary: ["Justice", "Attorney"],
  media: ["Information", "Media", "Communication"],
};

// ── findAdviserForTab ────────────────────────────────────

export function findAdviserForTab(
  tab: string,
  characters: Record<string, CharacterState>
): CharacterState | null {
  const portfolios = TAB_TO_PORTFOLIO[tab];
  if (!portfolios || portfolios.length === 0) return null;

  for (const character of Object.values(characters)) {
    const portfolio = (character.portfolio || "").toLowerCase();
    for (const p of portfolios) {
      if (portfolio.includes(p.toLowerCase())) {
        return character;
      }
    }
  }
  return null;
}

// ── WhisperRule interface ────────────────────────────────

interface WhisperRule {
  id: string;
  priority: "critical" | "warning" | "contextual" | "default";
  tabs: string[] | "*";
  check: (state: any) => boolean;
  template: (state: any) => string;
}

// ── Helper: find faction with highest grievance ──────────

function getHighGrievanceFaction(factions: Record<string, any>, threshold: number): { name: string; grievance: number } | null {
  let worst: { name: string; grievance: number } | null = null;
  for (const faction of Object.values(factions)) {
    if (faction.grievance > threshold) {
      if (!worst || faction.grievance > worst.grievance) {
        worst = { name: faction.name, grievance: faction.grievance };
      }
    }
  }
  return worst;
}

// ── WHISPER_RULES ────────────────────────────────────────

const WHISPER_RULES: WhisperRule[] = [
  // ── Critical rules ──────────────────────────────────────
  {
    id: "low-approval",
    priority: "critical",
    tabs: "*",
    check: (state) => state.approval < 30,
    template: (state) =>
      `Mr. President, your approval rating has dropped to ${state.approval}%. Public confidence is eroding rapidly.`,
  },
  {
    id: "low-stability",
    priority: "critical",
    tabs: "*",
    check: (state) => state.stability < 30,
    template: (state) =>
      `Mr. President, national stability is dangerously low at ${state.stability}. We must act decisively.`,
  },
  {
    id: "low-treasury",
    priority: "critical",
    tabs: "*",
    check: (state) => state.treasury < 0.5,
    template: (state) =>
      `Mr. President, the treasury is nearly depleted at ₦${state.treasury.toFixed(1)}T. Fiscal emergency looms.`,
  },
  {
    id: "low-vp-loyalty",
    priority: "critical",
    tabs: "*",
    check: (state) => state.vicePresident && state.vicePresident.loyalty < 30,
    template: () =>
      `Mr. President, the Vice President's loyalty is concerning. Watch your back.`,
  },
  {
    id: "faction-crisis",
    priority: "critical",
    tabs: "*",
    check: (state) => !!getHighGrievanceFaction(state.factions || {}, 70),
    template: (state) => {
      const f = getHighGrievanceFaction(state.factions || {}, 70)!;
      return `Mr. President, ${f.name} grievance has reached ${f.grievance} — their demands are growing louder.`;
    },
  },

  // ── Warning rules ────────────────────────────────────────
  {
    id: "faction-warning",
    priority: "warning",
    tabs: "*",
    check: (state) => !!getHighGrievanceFaction(state.factions || {}, 50),
    template: (state) => {
      const f = getHighGrievanceFaction(state.factions || {}, 50)!;
      return `Mr. President, tensions within ${f.name} are rising — their grievance is at ${f.grievance}.`;
    },
  },
  {
    id: "critical-decisions",
    priority: "warning",
    tabs: "*",
    check: (state) =>
      Array.isArray(state.activeEvents) &&
      state.activeEvents.some((e: any) => e.severity === "critical"),
    template: () =>
      `Mr. President, there are critical matters awaiting your decision. Delay carries its own consequences.`,
  },
  {
    id: "inflation-high",
    priority: "warning",
    tabs: ["economy", "governance", "villa", "cabinet"],
    check: (state) => state.economy?.inflation > 18,
    template: (state) =>
      `Mr. President, inflation has surged to ${state.economy.inflation.toFixed(1)}% — the markets are restless.`,
  },
  {
    id: "fx-high",
    priority: "warning",
    tabs: ["economy", "governance", "villa", "cabinet"],
    check: (state) => state.economy?.fxRate > 1100,
    template: (state) =>
      `Mr. President, the exchange rate stands at ₦${Math.round(state.economy.fxRate)}/$ — forex pressure is mounting.`,
  },
  {
    id: "oil-low",
    priority: "warning",
    tabs: ["economy", "governance", "villa", "cabinet"],
    check: (state) => state.economy?.oilOutput < 1.6,
    template: (state) =>
      `Mr. President, oil output has fallen to ${state.economy.oilOutput.toFixed(2)}mbpd — our revenue base is shrinking.`,
  },
  {
    id: "low-pc",
    priority: "warning",
    tabs: "*",
    check: (state) => state.politicalCapital < 20,
    template: (state) =>
      `Mr. President, your political capital is down to ${state.politicalCapital}. Your ability to manoeuvre is constrained.`,
  },

  // ── Contextual rules (tab-specific) ─────────────────────
  {
    id: "economy-inflation-context",
    priority: "contextual",
    tabs: ["economy"],
    check: (state) => state.economy?.inflation > 12,
    template: (state) =>
      `Mr. President, inflation at ${state.economy.inflation.toFixed(1)}% is squeezing household budgets across the federation.`,
  },
  {
    id: "economy-fx-context",
    priority: "contextual",
    tabs: ["economy"],
    check: (state) => state.economy?.fxRate > 900,
    template: (state) =>
      `Mr. President, the naira trades at ₦${Math.round(state.economy.fxRate)}/$. Import costs are feeding through to prices.`,
  },
  {
    id: "economy-oil-context",
    priority: "contextual",
    tabs: ["economy"],
    check: (state) => state.economy?.oilOutput < 2.0,
    template: (state) =>
      `Mr. President, oil production at ${state.economy.oilOutput.toFixed(2)}mbpd is below our OPEC quota. Revenue projections are under pressure.`,
  },
  {
    id: "security-stability-context",
    priority: "contextual",
    tabs: ["security"],
    check: (state) => state.stability < 55,
    template: (state) =>
      `Mr. President, national stability at ${state.stability} is a concern. Security deployments may need review.`,
  },
  {
    id: "security-stable-context",
    priority: "contextual",
    tabs: ["security"],
    check: (state) => state.stability >= 70,
    template: (state) =>
      `Mr. President, stability is holding at ${state.stability}. Our security posture is effective for now.`,
  },
  {
    id: "politics-hostile-faction",
    priority: "contextual",
    tabs: ["politics"],
    check: (state) =>
      Object.values(state.factions || {}).some((f: any) => f.stance === "Hostile" || f.stance === "Opposed"),
    template: () =>
      `Mr. President, there are opposition factions testing our political resolve. Strategic concessions may be required.`,
  },
  {
    id: "politics-allied-factions",
    priority: "contextual",
    tabs: ["politics"],
    check: (state) =>
      Object.values(state.factions || {}).filter((f: any) => f.stance === "Allied").length >= 2,
    template: () =>
      `Mr. President, our allied factions remain firmly in camp. This coalition must be maintained with care.`,
  },
  {
    id: "politics-party-loyalty",
    priority: "contextual",
    tabs: ["politics"],
    check: (state) => state.political?.partyLoyalty != null && state.political.partyLoyalty < 50,
    template: (state) =>
      `Mr. President, party loyalty has dipped to ${state.political.partyLoyalty}. Dissent within our own ranks grows.`,
  },
  {
    id: "legislature-context",
    priority: "contextual",
    tabs: ["legislature"],
    check: (state) => state.legislative?.pendingBills?.length > 0,
    template: (state) =>
      `Mr. President, there are ${state.legislative.pendingBills.length} pending bill(s) in the legislature awaiting executive engagement.`,
  },
  {
    id: "diplomacy-context",
    priority: "contextual",
    tabs: ["diplomacy"],
    check: (state) => state.approval >= 50,
    template: (state) =>
      `Mr. President, with approval at ${state.approval}%, our diplomatic standing carries weight on the continent.`,
  },
  {
    id: "judiciary-context",
    priority: "contextual",
    tabs: ["judiciary"],
    check: (state) => state.judicialIndependence != null && state.judicialIndependence < 50,
    template: (state) =>
      `Mr. President, judicial independence is under strain at ${state.judicialIndependence}. Rule of law perceptions matter.`,
  },
  {
    id: "media-approval-context",
    priority: "contextual",
    tabs: ["media"],
    check: (state) => state.approval < 50,
    template: (state) =>
      `Mr. President, the press narrative is working against us. Your approval at ${state.approval}% reflects the coverage.`,
  },
  {
    id: "cabinet-ministers-context",
    priority: "contextual",
    tabs: ["cabinet"],
    check: (state) => {
      const chars = Object.values(state.characters || {}) as CharacterState[];
      return chars.some((c) => c.relationship === "Hostile" || c.relationship === "Distrustful");
    },
    template: () =>
      `Mr. President, not all members of cabinet are aligned with your agenda. Discreet monitoring is advised.`,
  },
  {
    id: "villa-positive-context",
    priority: "contextual",
    tabs: ["villa"],
    check: (state) => state.approval >= 55 && state.stability >= 55,
    template: (state) =>
      `Mr. President, with approval at ${state.approval}% and stability at ${state.stability}, the presidency is on solid footing.`,
  },

  // ── Default rules (generic, fallback) ───────────────────
  {
    id: "default-steady",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, the nation watches your leadership with cautious hope. Each decision shapes the legacy ahead.`,
  },
  {
    id: "default-confident",
    priority: "default",
    tabs: "*",
    check: (state) => state.approval >= 50,
    template: () =>
      `Mr. President, the nation watches your leadership with growing confidence. Stay the course.`,
  },
  {
    id: "default-vigilant",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, the corridors of power are never quiet. Vigilance is the price of authority.`,
  },
  {
    id: "default-legacy",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, history is written by those who act, not those who deliberate indefinitely.`,
  },
  {
    id: "default-unity",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, a united cabinet is the foundation of effective governance. Invest in these relationships.`,
  },
  {
    id: "default-discretion",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, in these times, discretion in counsel is as important as boldness in action.`,
  },
  {
    id: "default-patience",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, the Nigerian project demands patience. Reform is a long game.`,
  },
  {
    id: "default-rivals",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, even your allies have ambitions of their own. Keep your inner circle close.`,
  },
  {
    id: "default-press",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, the press will narrate this era. Ensure they narrate it on your terms.`,
  },
  {
    id: "default-consensus",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, consensus is slow but durable. Force alone produces compliance, not loyalty.`,
  },
];

// ── Priority ordering ────────────────────────────────────

const PRIORITY_ORDER: Record<WhisperRule["priority"], number> = {
  critical: 0,
  warning: 1,
  contextual: 2,
  default: 3,
};

// ── getWhisper ───────────────────────────────────────────

export interface WhisperResult {
  text: string;
  adviserName: string;
  adviserTitle: string;
  ruleId: string;
}

export function getWhisper(
  state: any,
  activeTab: string,
  recentRuleIds: string[]
): WhisperResult {
  // Filter rules applicable to this tab
  const applicableRules = WHISPER_RULES.filter((rule) => {
    if (rule.tabs === "*") return true;
    return (rule.tabs as string[]).includes(activeTab);
  });

  // Find matching rules, skipping recently used ones
  const matchingRules = applicableRules.filter(
    (rule) => !recentRuleIds.includes(rule.id) && rule.check(state)
  );

  // If all matched rules are in recentRuleIds, allow them (fallback)
  const candidateRules = matchingRules.length > 0
    ? matchingRules
    : applicableRules.filter((rule) => rule.check(state));

  // Pick highest priority (first in sorted order)
  candidateRules.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const chosen = candidateRules[0];

  // Default fallback rule
  const fallback: WhisperRule = {
    id: "default-steady",
    priority: "default",
    tabs: "*",
    check: () => true,
    template: () =>
      `Mr. President, the nation watches your leadership with cautious hope. Each decision shapes the legacy ahead.`,
  };

  const rule = chosen ?? fallback;
  const text = rule.template(state);

  // Look up adviser
  const adviser = findAdviserForTab(activeTab, state.characters || {});

  const adviserName = adviser?.name ?? state.vicePresident?.name ?? "Chief of Staff";
  const adviserTitle = adviser?.portfolio ?? adviser?.title ?? "Senior Adviser";

  return {
    text,
    adviserName,
    adviserTitle,
    ruleId: rule.id,
  };
}
