import type { PolicyLeverState, ReformProgress } from "./gameTypes";
import { ECONOMY_CONFIG } from "./governanceSections";

type LeverPos = string;
function pos(levers: PolicyLeverState, key: string): LeverPos {
  return (levers as unknown as Record<string, { position: string }>)[key]?.position ?? "";
}

// ── Enabling condition checks ─────────────────────────────
const REFORM_CONDITIONS: Record<string, (levers: PolicyLeverState) => boolean> = {
  "subsidy-reform": (levers) => {
    const v = pos(levers, "fuelSubsidy");
    return v === "targeted" || v === "removed";
  },
  "tax-modernisation": (levers) => {
    const v = pos(levers, "taxRate");
    return v === "elevated" || v === "high";
  },
  "trade-liberalisation": (levers) => {
    const tariffs = pos(levers, "importTariffs");
    const fx = pos(levers, "fxPolicy");
    return (tariffs === "open" || tariffs === "moderate") &&
           (fx === "managed-float" || fx === "free-float");
  },
};

export function isReformEnabled(reformId: string, levers: PolicyLeverState): boolean {
  const check = REFORM_CONDITIONS[reformId];
  return check ? check(levers) : false;
}

export function computeReformDelta(reformId: string, levers: PolicyLeverState): number {
  const config = ECONOMY_CONFIG.overview.reforms.find(r => r.id === reformId);
  if (!config) return 0;
  return isReformEnabled(reformId, levers) ? config.advanceRate : config.revertRate;
}

export function tickReforms(
  existing: ReformProgress[],
  levers: PolicyLeverState,
): ReformProgress[] {
  const allReformIds = ECONOMY_CONFIG.overview.reforms.map(r => r.id);

  return allReformIds.map(id => {
    const current = existing.find(r => r.id === id);
    const prev: ReformProgress = current ?? { id, progress: 0, turnsActive: 0, status: "not-started" };

    // Don't modify completed reforms
    if (prev.status === "complete") return { ...prev };

    const enabled = isReformEnabled(id, levers);
    const delta = computeReformDelta(id, levers);
    const newProgress = Math.min(100, Math.max(0, prev.progress + delta));

    let status: ReformProgress["status"];
    if (newProgress >= 100) {
      status = "complete";
    } else if (enabled) {
      status = "active";
    } else if (prev.progress > 0 || prev.turnsActive > 0) {
      status = "stalled";
    } else {
      status = "not-started";
    }

    return {
      id,
      progress: newProgress,
      turnsActive: enabled ? prev.turnsActive + 1 : prev.turnsActive,
      status,
    };
  });
}
