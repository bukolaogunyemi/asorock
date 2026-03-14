// client/src/lib/ideologyPressure.ts
import type { IdeologyProfile } from "./parties";
import type { IdeologyImpact } from "./gameTypes";

export type AlignmentSeverity = "on-brand" | "mild-friction" | "off-brand" | "extreme-violation";

export interface AlignmentResult {
  loyaltyChange: number;
  severity: AlignmentSeverity;
  details: { dimension: string; distance: number; change: number }[];
}

/**
 * Calculate party loyalty change for a decision.
 * Each impact tag is scored independently and summed.
 */
export function calculateAlignmentChange(
  partyProfile: IdeologyProfile,
  impacts: IdeologyImpact[],
): AlignmentResult {
  let totalChange = 0;
  let worstSeverity: AlignmentSeverity = "on-brand";
  const details: AlignmentResult["details"] = [];

  const severityOrder: AlignmentSeverity[] = ["on-brand", "mild-friction", "off-brand", "extreme-violation"];

  for (const impact of impacts) {
    const partyValue = partyProfile[impact.dimension];
    const distance = Math.abs(impact.value - partyValue);

    let change: number;
    let severity: AlignmentSeverity;

    if (distance <= 1) {
      change = 2;
      severity = "on-brand";
    } else if (distance === 2) {
      change = -3;
      severity = "mild-friction";
    } else if (distance === 3) {
      change = -6;
      severity = "off-brand";
    } else {
      change = -12;
      severity = "extreme-violation";
    }

    totalChange += change;
    details.push({ dimension: impact.dimension, distance, change });

    if (severityOrder.indexOf(severity) > severityOrder.indexOf(worstSeverity)) {
      worstSeverity = severity;
    }
  }

  return { loyaltyChange: totalChange, severity: worstSeverity, details };
}

/** Clamp party loyalty to 0–100 range */
export function clampLoyalty(loyalty: number): number {
  return Math.max(0, Math.min(100, loyalty));
}

/** Party loyalty thresholds and their gameplay meanings */
export const PARTY_LOYALTY_THRESHOLDS = {
  enthusiastic: 80,  // 80+: full party support
  normal: 50,        // 50-79: some horse-trading needed
  dissent: 30,       // 30-49: caucus revolts, defection threats
  crisis: 0,         // 0-29: existential crisis, primary challenger
} as const;

/** Monthly passive recovery rate */
export const LOYALTY_PASSIVE_RECOVERY = 1;
