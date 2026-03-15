import type { GameState, LegacyMilestoneRecord } from "./gameTypes";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MilestoneDef {
  id: string;
  title: string;
  category: string;
  points: number;
  description: string;
  check: (prev: GameState, next: GameState) => boolean;
}

export interface PrestigeTier {
  tier: "Low" | "Moderate" | "High" | "Legendary";
  color: string;
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Sums the impact values of all legacy milestone records.
 */
export function computeLegacyScore(milestones: LegacyMilestoneRecord[]): number {
  return milestones.reduce((sum, m) => sum + m.impact, 0);
}

/**
 * Computes prestige tier from approval + legacy score combined.
 * Thresholds: Low (<60), Moderate (60-100), High (101-150), Legendary (151+)
 */
export function computePrestigeTier(
  approval: number,
  milestones: LegacyMilestoneRecord[]
): PrestigeTier {
  const legacyScore = computeLegacyScore(milestones);
  const combined = approval + legacyScore;

  if (combined > 150) {
    return { tier: "Legendary", color: "#a855f7" };
  } else if (combined > 100) {
    return { tier: "High", color: "#d4af37" };
  } else if (combined >= 60) {
    return { tier: "Moderate", color: "#3b82f6" };
  } else {
    return { tier: "Low", color: "#6b7280" };
  }
}

// ─── Milestone Definitions ────────────────────────────────────────────────────

export const MILESTONE_DEFS: MilestoneDef[] = [
  {
    id: "landmark_bill",
    title: "Landmark Legislation",
    category: "Legislation",
    points: 5,
    description: "Pass a critical or high-stakes bill through the legislature.",
    check: (_prev, next) =>
      Boolean(next.legislature.passedBills?.some(b => b.stakes === "critical" || b.stakes === "high")),
  },
  {
    id: "ten_bills",
    title: "Prolific Legislator",
    category: "Legislation",
    points: 10,
    description: "Pass a total of 10 bills through the legislature.",
    check: (_prev, next) => (next.legislature.passedBills?.length ?? 0) >= 10,
  },
  {
    id: "inflation_control",
    title: "Tamed Inflation",
    category: "Economic",
    points: 10,
    description: "Reduce inflation below 10% from a higher rate.",
    check: (prev, next) => prev.economy.inflation >= 10 && next.economy.inflation < 10,
  },
  {
    id: "forex_reserves",
    title: "Forex Fortress",
    category: "Economic",
    points: 10,
    description: "Build foreign exchange reserves above $25 billion.",
    check: (prev, next) => prev.economy.reserves < 25 && next.economy.reserves >= 25,
  },
  {
    id: "stability_streak",
    title: "Pillar of Stability",
    category: "Governance",
    points: 10,
    description: "Maintain national stability above 80 for 30 days.",
    check: (_prev, next) => next.day >= 30 && next.stability > 80,
  },
  {
    id: "gdp_growth",
    title: "Economic Architect",
    category: "Economic",
    points: 15,
    description: "Sustain GDP growth above 5% for 30 days.",
    check: (_prev, next) => next.day >= 30 && next.economy.gdpGrowthRate > 0.05,
  },
  {
    id: "reelection",
    title: "People's Choice",
    category: "Political",
    points: 25,
    description: "Win re-election and begin a second term.",
    check: (prev, next) => prev.term.current === 1 && next.term.current === 2,
  },
  {
    id: "security_crisis",
    title: "Crisis Commander",
    category: "Security",
    points: 8,
    description: "Resolve a major security crisis that threatened national stability.",
    check: (prev, next) => {
      const prevCritical = prev.activeEvents.filter(
        e => e.category === "security" && e.severity === "critical"
      ).map(e => e.id);
      const nextIds = new Set(next.activeEvents.map(e => e.id));
      return prevCritical.some(id => !nextIds.has(id));
    },
  },
  {
    id: "trade_deal",
    title: "Trade Pioneer",
    category: "Diplomacy",
    points: 5,
    description: "Sign a major international trade deal.",
    check: (_prev, next) =>
      next.turnLog.some(entry =>
        entry.event.toLowerCase().includes("trade deal") ||
        entry.effects.some(e => e.toLowerCase().includes("trade deal"))
      ),
  },
  {
    id: "international_summit",
    title: "Global Statesman",
    category: "Diplomacy",
    points: 10,
    description: "Host a major international summit on Nigerian soil.",
    check: (_prev, next) =>
      next.turnLog.some(entry =>
        entry.event.toLowerCase().includes("summit") ||
        entry.effects.some(e => e.toLowerCase().includes("summit"))
      ),
  },
  {
    id: "sustained_approval",
    title: "Beloved Leader",
    category: "Political",
    points: 15,
    description: "Maintain approval rating above 60% for 60 consecutive days.",
    check: (_prev, next) => {
      const history = next.approvalHistory;
      if (history.length < 60) return false;
      return history.slice(-60).every(p => p.approval > 60);
    },
  },
  {
    id: "full_cabinet",
    title: "Cabinet Complete",
    category: "Governance",
    points: 3,
    description: "Fill all cabinet positions with qualified appointees.",
    check: (_prev, next) => {
      const appointments = Object.values(next.cabinetAppointments);
      return appointments.length > 0 && appointments.every(a => a !== null);
    },
  },
  {
    id: "corruption_prosecution",
    title: "Corruption Crusader",
    category: "Governance",
    points: 8,
    description: "Successfully prosecute a high-profile corruption case.",
    check: (_prev, next) =>
      next.activeCases.some(
        c =>
          c.status === "Decided" &&
          c.description.toLowerCase().includes("corruption")
      ),
  },
];

// ─── checkMilestones ──────────────────────────────────────────────────────────

/**
 * Checks all milestone definitions against the previous and next game states.
 * Skips milestones already earned. Returns newly earned milestone records.
 */
export function checkMilestones(
  prev: GameState,
  next: GameState
): LegacyMilestoneRecord[] {
  const earnedIds = new Set(next.legacyMilestones.map(m => m.title));
  const newMilestones: LegacyMilestoneRecord[] = [];

  for (const def of MILESTONE_DEFS) {
    if (earnedIds.has(def.title)) continue;

    let triggered = false;
    try {
      triggered = def.check(prev, next);
    } catch {
      // State data may be missing or malformed; skip silently
      triggered = false;
    }

    if (triggered) {
      newMilestones.push({
        title: def.title,
        date: next.date,
        pillar: def.category,
        impact: def.points,
        description: def.description,
        day: next.day,
      });
    }
  }

  return newMilestones;
}
