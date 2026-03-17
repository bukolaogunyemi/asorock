import type { CharacterCompetencies } from "./competencyTypes";
import { averageProfessionalCompetence } from "./competencyUtils";
import type { ActiveEvent, Consequence, GameInboxMessage, GameState } from "./gameTypes";

// ── Cluster → Sector mapping for ministerial effectiveness ─────────────────

/** Maps each cluster ID to the governance sectors it affects */
export const CLUSTER_SECTOR_MAP: Record<string, string[]> = {
  economic: ["economy", "treasury"],
  social: ["healthSector", "education", "youthEmployment"],
  infrastructure: ["infrastructure"],
  security: ["interior", "stability"],
  resources: ["agriculture", "environment"],
};

export const PORTFOLIO_SECTOR_MAP: Record<string, string | null> = {
  Finance: "economy",
  Petroleum: "economy",
  "Trade & Investment": "economy",
  Health: "healthSector",
  Education: "education",
  "Youth Development": "youthEmployment",
  "Labour & Employment": "youthEmployment",
  "Works & Housing": "infrastructure",
  Power: "infrastructure",
  "Communications & Digital Economy": "infrastructure",
  Transport: "infrastructure",
  Defence: null,
  Justice: null,
  Interior: "interior",
  "Foreign Affairs": null,
  "Agriculture & Rural Development": "agriculture",
  Environment: "environment",
};

export interface CabinetCluster {
  id: string;
  label: string;
  portfolios: string[];
}

export const CABINET_CLUSTERS: CabinetCluster[] = [
  { id: "economic", label: "Economic", portfolios: ["Finance", "Petroleum", "Trade & Investment"] },
  { id: "social", label: "Social", portfolios: ["Health", "Education", "Youth Development", "Labour & Employment"] },
  { id: "infrastructure", label: "Infrastructure", portfolios: ["Works & Housing", "Power", "Communications & Digital Economy", "Transport"] },
  { id: "security", label: "Security & Justice", portfolios: ["Defence", "Justice", "Interior", "Foreign Affairs"] },
  { id: "resources", label: "Resources & Environment", portfolios: ["Agriculture & Rural Development", "Environment"] },
];

export function computeMinisterPerformance(
  sectorHealth: number | null,
  competenceAvg: number,
  relationshipScore: number,
): number {
  let raw: number;
  if (sectorHealth !== null) {
    raw = sectorHealth * 0.6 + competenceAvg * 0.25 + relationshipScore * 0.15;
  } else {
    raw = competenceAvg * 0.5 + relationshipScore * 0.5;
  }
  return Math.max(0, Math.min(100, raw));
}

export type MinisterStatusLabel = "Delivering" | "Under Pressure" | "Failing" | "New" | "On Probation";

export function computeMinisterStatus(
  sectorHealth: number,
  relationshipScore: number,
  onProbation: boolean,
  appointmentDay: number,
  currentDay: number,
): MinisterStatusLabel {
  if (currentDay - appointmentDay < 30) return "New";
  if (onProbation) return "On Probation";
  if (sectorHealth < 30 || relationshipScore < 25) return "Failing";
  if (sectorHealth < 60 || relationshipScore < 50) return "Under Pressure";
  return "Delivering";
}

export function relationshipToScore(rel: string): number {
  const map: Record<string, number> = {
    Loyal: 95, Friendly: 75, Neutral: 50, Wary: 35, Distrustful: 20, Hostile: 5,
  };
  return map[rel] ?? 50;
}

export const STATUS_CONFIG: Record<MinisterStatusLabel, { color: string; borderColor: string; bgColor: string }> = {
  Delivering: { color: "text-green-500", borderColor: "border-green-400", bgColor: "bg-green-50" },
  "Under Pressure": { color: "text-amber-500", borderColor: "border-amber-400", bgColor: "bg-amber-50" },
  Failing: { color: "text-red-500", borderColor: "border-red-400", bgColor: "bg-red-50" },
  New: { color: "text-blue-500", borderColor: "border-blue-400", bgColor: "bg-blue-50" },
  "On Probation": { color: "text-orange-500", borderColor: "border-orange-400", bgColor: "bg-orange-50" },
};

// ── Ministerial Effectiveness ──────────────────────────────────────────────

/** Convert average competence to an effectiveness multiplier band */
export function competenceToBand(avgCompetence: number): number {
  if (avgCompetence >= 80) return 1.15;
  if (avgCompetence >= 60) return 1.0;
  if (avgCompetence >= 40) return 0.85;
  return 0.70;
}

/**
 * Compute ministerial effectiveness multipliers per governance sector.
 *
 * For each cabinet cluster, averages competence of filled ministers.
 * Vacant portfolios count as 0 competence (treated as lowest band).
 * Returns a map of sector name → multiplier.
 */
export function computeMinisterialEffectiveness(
  state: Pick<GameState, "cabinetAppointments" | "characters">,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const cluster of CABINET_CLUSTERS) {
    // Gather competence values for each portfolio in the cluster
    const competenceValues: number[] = [];
    for (const portfolio of cluster.portfolios) {
      const ministerName = state.cabinetAppointments[portfolio];
      if (ministerName && state.characters[ministerName]) {
        const character = state.characters[ministerName];
        competenceValues.push(averageProfessionalCompetence(character.competencies));
      } else {
        // Vacant portfolio treated as 0 competence
        competenceValues.push(0);
      }
    }

    // Average across all portfolios (including vacant = 0)
    const avgCompetence = competenceValues.reduce((sum, v) => sum + v, 0) / competenceValues.length;
    const multiplier = competenceToBand(avgCompetence);

    // Map cluster to its governed sectors
    const sectors = CLUSTER_SECTOR_MAP[cluster.id] ?? [];
    for (const sector of sectors) {
      result[sector] = multiplier;
    }
  }

  return result;
}

// ── Minister Event Generation ──────────────────────────────────────────────

export interface MinisterEventResult {
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
}

/** Initiative event proposals keyed by cluster */
const INITIATIVE_PROPOSALS: Record<string, { title: string; sector: string }[]> = {
  economic: [
    { title: "proposes a new revenue diversification framework", sector: "economy" },
    { title: "proposes a strategic petroleum reserve expansion", sector: "economy" },
  ],
  social: [
    { title: "proposes a national primary healthcare expansion", sector: "healthSector" },
    { title: "proposes universal basic education reforms", sector: "education" },
  ],
  infrastructure: [
    { title: "proposes a national broadband rollout plan", sector: "infrastructure" },
    { title: "proposes a major road rehabilitation programme", sector: "infrastructure" },
  ],
  security: [
    { title: "proposes a community policing initiative", sector: "interior" },
    { title: "proposes a judicial reform package", sector: "interior" },
  ],
  resources: [
    { title: "proposes an agricultural mechanisation programme", sector: "agriculture" },
    { title: "proposes a national reforestation initiative", sector: "environment" },
  ],
};

/** Sabotage descriptions */
const SABOTAGE_DESCRIPTIONS = [
  "is leaking cabinet discussions to opposition senators",
  "is diverting ministry funds to political allies",
  "is undermining presidential policy directives in their ministry",
  "is briefing journalists against the administration",
];

/** Clash descriptions per cluster */
const CLASH_DESCRIPTIONS: Record<string, string[]> = {
  economic: ["publicly contradicting each other on tariff policy", "clashing over fiscal priorities"],
  social: ["issuing contradictory health directives", "feuding over education budget allocation"],
  infrastructure: ["blocking each other's procurement approvals", "fighting over power sector priorities"],
  security: ["disputing security operational control", "undermining each other at NSC meetings"],
  resources: ["issuing conflicting land-use directives", "feuding over environmental enforcement"],
};

/**
 * Generate minister initiative, sabotage, and clash events.
 *
 * Called once per turn with a seeded RNG for deterministic testing.
 */
export function generateMinisterEvents(
  state: Pick<GameState, "cabinetAppointments" | "characters" | "day" | "date">,
  rng: () => number,
): MinisterEventResult {
  const newEvents: ActiveEvent[] = [];
  const consequences: Consequence[] = [];
  const inboxMessages: GameInboxMessage[] = [];

  // Build cluster membership for clash detection
  for (const cluster of CABINET_CLUSTERS) {
    const filledMinisters: { name: string; portfolio: string; competence: number; loyalty: number; integrity: number }[] = [];

    for (const portfolio of cluster.portfolios) {
      const ministerName = state.cabinetAppointments[portfolio];
      if (!ministerName || !state.characters[ministerName]) continue;
      const char = state.characters[ministerName];
      filledMinisters.push({
        name: ministerName,
        portfolio,
        competence: averageProfessionalCompetence(char.competencies),
        loyalty: char.competencies.personal.loyalty,
        integrity: char.competencies.personal.integrity,
      });
    }

    // 1. Initiative events — competence > 80, 3% chance
    for (const minister of filledMinisters) {
      if (minister.competence > 80 && rng() < 0.03) {
        const proposals = INITIATIVE_PROPOSALS[cluster.id] ?? [];
        const proposal = proposals[Math.floor(rng() * proposals.length)];
        if (!proposal) continue;

        const eventId = `minister-initiative-${minister.name}-${state.day}`;
        newEvents.push({
          id: eventId,
          title: `Minister Initiative: ${minister.portfolio}`,
          severity: "moderate",
          description: `${minister.name} (${minister.portfolio}) ${proposal.title}`,
          category: "governance",
          source: "minister-summons",
          createdDay: state.day,
          choices: [
            {
              id: `${eventId}-approve`,
              label: "Approve",
              context: `Approve the proposal. The sector will benefit (+5 health over 30 days) but it costs treasury (−3). ${minister.name} appreciates your support.`,
              consequences: [
                {
                  id: `${eventId}-approve-con`,
                  sourceEvent: eventId,
                  delayDays: 0,
                  description: `${minister.name}'s initiative approved`,
                  effects: [
                    { target: "treasury" as const, delta: -3, description: "Initiative implementation cost" },
                  ],
                },
                {
                  id: `${eventId}-approve-sector`,
                  sourceEvent: eventId,
                  delayDays: 30,
                  description: `${minister.name}'s initiative bears fruit`,
                  effects: [
                    { target: proposal.sector as any, delta: 5, description: `${minister.portfolio} initiative improves sector` },
                  ],
                },
              ],
            },
            {
              id: `${eventId}-defer`,
              label: "Defer",
              context: `Defer for further study. No immediate cost but ${minister.name} is disappointed.`,
              consequences: [],
            },
            {
              id: `${eventId}-reject`,
              label: "Reject",
              context: `Reject the proposal outright. ${minister.name} will be displeased${minister.loyalty < 40 ? " and may consider resigning" : ""}.`,
              consequences: [],
            },
          ],
        });
      }
    }

    // 2. Sabotage events — loyalty < 40, 2% chance
    for (const minister of filledMinisters) {
      if (minister.loyalty < 40 && rng() < 0.02) {
        const sabotageDesc = SABOTAGE_DESCRIPTIONS[Math.floor(rng() * SABOTAGE_DESCRIPTIONS.length)];
        const eventId = `minister-sabotage-${minister.name}-${state.day}`;
        newEvents.push({
          id: eventId,
          title: `Minister Sabotage: ${minister.portfolio}`,
          severity: "major",
          description: `Intelligence reports suggest the ${minister.portfolio} Minister ${sabotageDesc}`,
          category: "governance",
          source: "minister-summons",
          createdDay: state.day,
          choices: [
            {
              id: `${eventId}-confront`,
              label: "Confront privately",
              context: `Confront ${minister.name} directly. Outcome depends on their integrity (50/50 chance of loyalty improving or worsening).`,
              consequences: [],
            },
            {
              id: `${eventId}-probation`,
              label: "Place on probation",
              context: `Place ${minister.name} on formal probation. Their performance will be closely monitored.`,
              consequences: [],
            },
            {
              id: `${eventId}-dismiss`,
              label: "Dismiss immediately",
              context: `Relieve ${minister.name} of duties as ${minister.portfolio} Minister effective immediately.`,
              consequences: [
                {
                  id: `${eventId}-dismiss-con`,
                  sourceEvent: eventId,
                  delayDays: 0,
                  description: `${minister.name} dismissed as ${minister.portfolio} Minister`,
                  effects: [
                    { target: "approval" as const, delta: -3, description: "Cabinet reshuffle causes uncertainty" },
                    { target: "stability" as const, delta: -2, description: "Government stability shaken" },
                  ],
                },
              ],
            },
            {
              id: `${eventId}-monitor`,
              label: "Monitor quietly",
              context: `Direct the DNI to place ${minister.name} under discreet surveillance. Follow-up intelligence expected in 14 days.`,
              consequences: [],
            },
          ],
        });
      }
    }

    // 3. Clash events — two ministers in same cluster with loyalty difference > 30, 2% chance
    if (filledMinisters.length >= 2) {
      for (let i = 0; i < filledMinisters.length; i++) {
        for (let j = i + 1; j < filledMinisters.length; j++) {
          const a = filledMinisters[i];
          const b = filledMinisters[j];
          if (Math.abs(a.loyalty - b.loyalty) > 30 && rng() < 0.02) {
            const clashDescs = CLASH_DESCRIPTIONS[cluster.id] ?? ["feuding publicly"];
            const clashDesc = clashDescs[Math.floor(rng() * clashDescs.length)];
            const eventId = `minister-clash-${a.name}-${b.name}-${state.day}`;
            newEvents.push({
              id: eventId,
              title: `Minister Clash: ${cluster.label}`,
              severity: "moderate",
              description: `The ${a.portfolio} Minister and ${b.portfolio} Minister are ${clashDesc}`,
              category: "governance",
              source: "minister-summons",
              createdDay: state.day,
              choices: [
                {
                  id: `${eventId}-mediate`,
                  label: "Mediate",
                  context: `Summon both ministers and resolve the dispute. Costs political capital but both ministers appreciate the attention.`,
                  consequences: [
                    {
                      id: `${eventId}-mediate-con`,
                      sourceEvent: eventId,
                      delayDays: 0,
                      description: `Presidential mediation between ${a.name} and ${b.name}`,
                      effects: [
                        { target: "politicalCapital" as const, delta: -1, description: "Mediation costs political capital" },
                      ],
                    },
                  ],
                },
                {
                  id: `${eventId}-back-a`,
                  label: `Back ${a.name}`,
                  context: `Side with the ${a.portfolio} Minister. ${a.name} gains confidence while ${b.name} feels undermined.`,
                  consequences: [],
                },
                {
                  id: `${eventId}-ignore`,
                  label: "Ignore",
                  context: `Let the ministers sort it out themselves. Cluster effectiveness may suffer for 30 days.`,
                  consequences: [],
                },
              ],
            });
            // Only one clash event per cluster per turn
            break;
          }
        }
        // Break the outer loop too if we already generated one
        if (newEvents.some((e) => e.id.startsWith(`minister-clash-`) && e.id.endsWith(`-${state.day}`))) break;
      }
    }
  }

  return { newEvents, consequences, inboxMessages };
}
