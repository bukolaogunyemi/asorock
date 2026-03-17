import { useGame } from "@/lib/GameContext";
import { ECONOMY_CONFIG } from "@/lib/governanceSections";
import type { ReformProgress } from "@/lib/gameTypes";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-green-600", bg: "bg-green-50" },
  stalled: { label: "Stalled", color: "text-amber-600", bg: "bg-amber-50" },
  "not-started": { label: "Not Started", color: "text-gray-500", bg: "bg-gray-50" },
  complete: { label: "Complete", color: "text-blue-600", bg: "bg-blue-50" },
};

const REFORM_DETAILS: Record<string, { icon: string }> = {
  "subsidy-reform": { icon: "⛽" },
  "tax-modernisation": { icon: "💰" },
  "trade-liberalisation": { icon: "🌍" },
};

export function CabinetRecords() {
  const { state } = useGame();
  const reforms: ReformProgress[] = state.reforms ?? [];
  const reformConfigs = ECONOMY_CONFIG.overview.reforms;

  // Past FEC meeting days (from lastFECDay history — we show the most recent info)
  const lastFEC = state.cabinetRetreats.lastFECDay;
  const lastRetreat = state.cabinetRetreats.lastRetreatDay;
  const priorities = state.cabinetRetreats.priorities;

  return (
    <div className="space-y-5">
      {/* Meeting History */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
          Meeting Records
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0a1f14]">Last FEC Meeting</p>
              <p className="text-[11px] text-gray-500">
                {lastFEC > 0 ? `Day ${lastFEC}` : "No FEC meetings held yet"}
              </p>
            </div>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {lastFEC > 0 ? `${state.day - lastFEC} days ago` : "—"}
            </span>
          </div>
          <div className="border-t border-gray-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0a1f14]">Last Cabinet Retreat</p>
              <p className="text-[11px] text-gray-500">
                {lastRetreat > 0 ? `Day ${lastRetreat}` : "No retreats held yet"}
              </p>
            </div>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {lastRetreat > 0 ? `${state.day - lastRetreat} days ago` : "—"}
            </span>
          </div>
          {priorities.length > 0 && (
            <>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Current Priorities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {priorities.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Policy Reform Tracker */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
          Policy Reform Tracker
        </h3>
        <div className="space-y-2">
          {reformConfigs.map((config) => {
            const progress = reforms.find((r) => r.id === config.id);
            const pct = progress?.progress ?? 0;
            const statusKey = progress?.status ?? "not-started";
            const style = STATUS_STYLES[statusKey] ?? STATUS_STYLES["not-started"];
            const detail = REFORM_DETAILS[config.id];

            return (
              <div
                key={config.id}
                className="rounded-lg border border-gray-200 bg-white p-3.5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {detail && <span className="text-base">{detail.icon}</span>}
                    <div>
                      <p className="text-xs font-semibold text-[#0a1f14]">{config.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{config.payoffDescription}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.bg} ${style.color}`}
                  >
                    {style.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        statusKey === "complete"
                          ? "bg-blue-500"
                          : statusKey === "active"
                            ? "bg-green-500"
                            : statusKey === "stalled"
                              ? "bg-amber-400"
                              : "bg-gray-300"
                      }`}
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 tabular-nums w-8 text-right">
                    {Math.round(pct)}%
                  </span>
                </div>

                {progress && progress.turnsActive > 0 && (
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Active for {progress.turnsActive} turns
                  </p>
                )}
              </div>
            );
          })}

          {reformConfigs.length === 0 && (
            <p className="text-xs text-gray-400 italic p-4 text-center">
              No policy reforms tracked yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
