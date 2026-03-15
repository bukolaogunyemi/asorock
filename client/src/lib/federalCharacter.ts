// client/src/lib/federalCharacter.ts
import type { GameStateModifier } from "./legislativeTypes";
import type {
  FederalAppointment,
  FederalCharacterState,
  ZoneBalance,
} from "./federalCharacterTypes";
import { POSITION_DEFINITIONS } from "./appointmentPools";

const ZONES = ["NC", "NW", "NE", "SW", "SE", "SS"] as const;
const EXPECTED_SHARE = 1 / 6;

const PRESTIGE_WEIGHT: Record<string, number> = {
  strategic: 3,
  standard: 2,
  routine: 1,
};

// ---------------------------------------------------------------------------
// 1. calculateZoneBalances
// ---------------------------------------------------------------------------
export function calculateZoneBalances(
  appointments: FederalAppointment[],
): Record<string, ZoneBalance> {
  const zoneWeights: Record<string, number> = {};
  for (const z of ZONES) zoneWeights[z] = 0;

  let totalWeighted = 0;

  for (const a of appointments) {
    if (a.appointeeZone == null) continue;
    const w = PRESTIGE_WEIGHT[a.prestigeTier] ?? 1;
    zoneWeights[a.appointeeZone] = (zoneWeights[a.appointeeZone] ?? 0) + w;
    totalWeighted += w;
  }

  const result: Record<string, ZoneBalance> = {};

  for (const zone of ZONES) {
    const weighted = zoneWeights[zone];
    const actualShare = totalWeighted > 0 ? weighted / totalWeighted : 0;
    const deviation = actualShare - EXPECTED_SHARE;
    const grievanceContribution = Math.max(0, -deviation) * 100;

    result[zone] = {
      zone,
      weightedAppointments: weighted,
      expectedShare: EXPECTED_SHARE,
      actualShare,
      deviation,
      grievanceContribution,
    };
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. calculateComplianceScore
// ---------------------------------------------------------------------------
export function calculateComplianceScore(
  appointments: FederalAppointment[],
  budgetAllocation: Record<string, number>,
): number {
  // --- Appointment balance (70% weight) ---
  const balances = calculateZoneBalances(appointments);
  let sumAbsDev = 0;
  for (const zone of ZONES) {
    sumAbsDev += Math.abs(balances[zone].deviation);
  }
  const appointmentScore = Math.max(0, 100 - sumAbsDev * 300);

  // --- Budget balance (30% weight) ---
  const budgetKeys = Object.keys(budgetAllocation);
  let budgetScore: number;

  if (budgetKeys.length === 0) {
    // Default even split — perfect balance
    budgetScore = 100;
  } else {
    let totalBudget = 0;
    for (const z of ZONES) totalBudget += budgetAllocation[z] ?? 0;

    let sumBudgetDev = 0;
    for (const z of ZONES) {
      const share = totalBudget > 0 ? (budgetAllocation[z] ?? 0) / totalBudget : 0;
      sumBudgetDev += Math.abs(share - EXPECTED_SHARE);
    }
    budgetScore = Math.max(0, 100 - sumBudgetDev * 300);
  }

  const score = appointmentScore * 0.7 + budgetScore * 0.3;
  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// 3. getComplianceImpact
// ---------------------------------------------------------------------------
export function getComplianceImpact(
  appointments: FederalAppointment[],
  budget: Record<string, number>,
  zone: string,
  prestigeTier: "strategic" | "standard" | "routine",
): number {
  const currentScore = calculateComplianceScore(appointments, budget);

  // Simulate adding a new appointment to the given zone
  const simulated: FederalAppointment[] = [
    ...appointments,
    {
      positionId: "__preview__",
      positionName: "Preview",
      category: "cabinet",
      prestigeTier,
      appointeeId: "__preview__",
      appointeeZone: zone,
    },
  ];

  const newScore = calculateComplianceScore(simulated, budget);
  return newScore - currentScore;
}

// ---------------------------------------------------------------------------
// 4. getConsequences
// ---------------------------------------------------------------------------
export function getConsequences(score: number): {
  level: "balanced" | "mild" | "moderate" | "severe";
  description: string;
  effects: GameStateModifier[];
} {
  if (score >= 85) {
    return {
      level: "balanced",
      description:
        "Federal character is well-maintained. All zones feel adequately represented.",
      effects: [],
    };
  }

  if (score >= 70) {
    return {
      level: "mild",
      description:
        "Some zones are raising concerns about representation imbalance. Advisers urge corrective appointments.",
      effects: [
        { target: "factionGrievance", delta: 2 },
      ],
    };
  }

  if (score >= 45) {
    return {
      level: "moderate",
      description:
        "Opposition parties are citing federal character violations. Underrepresented zones are organizing protests.",
      effects: [
        { target: "stability", delta: -2 },
        { target: "factionGrievance", delta: 5 },
      ],
    };
  }

  return {
    level: "severe",
    description:
      "Constitutional crisis looms as marginalized zones threaten legal action. National unity is at risk.",
    effects: [
      { target: "stability", delta: -5 },
      { target: "approval", delta: -3 },
      { target: "factionGrievance", delta: 10 },
    ],
  };
}

// ---------------------------------------------------------------------------
// 5. defaultFederalCharacterState
// ---------------------------------------------------------------------------
export function defaultFederalCharacterState(): FederalCharacterState {
  const appointments: FederalAppointment[] = POSITION_DEFINITIONS.map((p) => ({
    positionId: p.id,
    positionName: p.name,
    category: p.category,
    prestigeTier: p.prestigeTier,
    appointeeId: null,
    appointeeZone: null,
  }));

  const zoneScores: Record<string, ZoneBalance> = {};
  for (const zone of ZONES) {
    zoneScores[zone] = {
      zone,
      weightedAppointments: 0,
      expectedShare: EXPECTED_SHARE,
      actualShare: 0,
      deviation: -EXPECTED_SHARE,
      grievanceContribution: EXPECTED_SHARE * 100,
    };
  }

  const budgetAllocation: Record<string, number> = {};
  for (const zone of ZONES) {
    budgetAllocation[zone] = 1 / 6;
  }

  return {
    appointments,
    complianceScore: 100,
    zoneScores,
    budgetAllocation,
  };
}
