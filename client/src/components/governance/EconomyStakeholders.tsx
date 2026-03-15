import { useMemo } from "react";
import { useGame } from "@/lib/GameContext";
import { computeAllStakeholderSentiments } from "@/lib/stakeholderSentiment";
import { ECONOMY_CONFIG } from "@/lib/governanceSections";
import type { ReformProgress } from "@/lib/gameTypes";

const SENTIMENT_ICONS: Record<string, string> = {
  supportive: "G",
  cautious: "Y",
  opposed: "R",
};

const SENTIMENT_COLORS: Record<string, string> = {
  supportive: "text-emerald-400",
  cautious: "text-amber-400",
  opposed: "text-red-400",
};

function reformStatusColor(status: ReformProgress["status"]): string {
  switch (status) {
    case "active": return "text-emerald-400";
    case "stalled": return "text-amber-400";
    case "complete": return "text-emerald-300";
    default: return "text-gray-500";
  }
}

function reformBarColor(status: ReformProgress["status"]): string {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "stalled": return "bg-amber-500";
    case "complete": return "bg-emerald-400";
    default: return "bg-gray-600";
  }
}

export function EconomyStakeholders() {
  const { state } = useGame();

  // Compute stakeholder sentiments
  const sentiments = useMemo(() => {
    return computeAllStakeholderSentiments(state.policyLevers, state.economy);
  }, [state.policyLevers, state.economy]);

  // Get reform progress
  const reforms = useMemo(() => {
    return ECONOMY_CONFIG.overview.reforms.map(def => {
      const progress = state.reforms?.find(r => r.id === def.id);
      return {
        ...def,
        progress: progress?.progress ?? 0,
        turnsActive: progress?.turnsActive ?? 0,
        status: (progress?.status ?? "not-started") as ReformProgress["status"],
      };
    });
  }, [state.reforms]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stakeholder Pulse */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2">
          Stakeholder Pulse
        </h3>
        <div className="space-y-1.5">
          {sentiments.map(s => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg bg-[#faf8f5] border border-gray-100 px-2 py-1.5">
              <span className={`text-sm font-bold ${SENTIMENT_COLORS[s.sentiment] ?? "text-gray-400"}`}>
                {SENTIMENT_ICONS[s.sentiment] ?? "?"}
              </span>
              <span className="text-xs font-semibold text-[#0a1f14] w-28 shrink-0">{s.name}</span>
              <span className="text-[10px] text-gray-500 truncate">{s.quote}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Reform Tracker */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2">
          Reform Tracker
        </h3>
        <div className="space-y-3">
          {reforms.map(reform => {
            const turnsLeft = reform.status === "active" && reform.advanceRate > 0
              ? Math.ceil((100 - reform.progress) / reform.advanceRate)
              : null;

            return (
              <div key={reform.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0a1f14]">{reform.title}</span>
                  <span className={`text-[10px] font-medium ${reformStatusColor(reform.status)}`}>
                    {reform.status === "active" ? "Active" :
                     reform.status === "stalled" ? "Stalled" :
                     reform.status === "complete" ? "Complete" : "Not Started"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${reformBarColor(reform.status)}`}
                    style={{ width: `${reform.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {reform.progress.toFixed(0)}%
                    {turnsLeft != null && ` ~ ${turnsLeft} turns left`}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate ml-2">
                    {reform.payoffDescription}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
