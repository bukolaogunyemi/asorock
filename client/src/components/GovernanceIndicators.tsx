import { useGame } from "../lib/GameContext";
import {
  INDICATORS,
  getIndicatorColor,
  getIndicatorTrend,
  getIndicatorValue,
} from "../lib/indicatorConfig";

interface GovernanceIndicatorsProps {
  onNavigate: (tab: string, subTab?: string) => void;
  onShowDetail: (indicatorKey: string) => void;
  pulsingIndicators?: string[];
}

const COLOR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

function getTrendArrow(direction: "up" | "down" | "none"): string {
  if (direction === "up") return "\u2191";
  if (direction === "down") return "\u2193";
  return "";
}

function getPreviousValue(
  state: Record<string, unknown>,
  ind: (typeof INDICATORS)[number],
): number | undefined {
  const approvalHistory = state.approvalHistory as
    | Array<{ approval: number }>
    | undefined;
  const macroHistory = state.macroHistory as
    | Array<Record<string, unknown>>
    | undefined;

  if (ind.key === "approval") {
    if (approvalHistory && approvalHistory.length >= 2) {
      return approvalHistory[approvalHistory.length - 2].approval;
    }
    return undefined;
  }

  // For economic indicators, use macroHistory
  if (macroHistory && macroHistory.length >= 2) {
    const prev = macroHistory[macroHistory.length - 2];
    // sourceField might be "economy.inflation" or "stability" etc.
    const parts = ind.sourceField.split(".");
    let val: unknown = prev;
    for (const p of parts) {
      val = (val as Record<string, unknown>)?.[p];
    }
    return typeof val === "number" ? val : undefined;
  }

  return undefined;
}

export function GovernanceIndicators({
  onNavigate,
  onShowDetail,
  pulsingIndicators,
}: GovernanceIndicatorsProps) {
  const { state } = useGame();
  const stateRecord = state as unknown as Record<string, unknown>;

  return (
    <div className="grid grid-cols-4 gap-3">
      {INDICATORS.map((ind) => {
        const value = getIndicatorValue(stateRecord, ind.sourceField);
        const color = getIndicatorColor(ind.key, value);
        const prevValue = getPreviousValue(stateRecord, ind);
        const trend = getIndicatorTrend(value, prevValue);
        const isPulsing = pulsingIndicators?.includes(ind.key);

        return (
          <button
            key={ind.key}
            onClick={() =>
              onNavigate(ind.navigateTo.tab, ind.navigateTo.subTab)
            }
            className={`relative bg-[#0d2818] border border-[#1a3a2a] rounded-lg p-3 text-left transition-colors hover:border-[#d4af37]/40 group
              ${isPulsing ? "animate-pulse" : ""}`}
          >
            {/* Info icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail(ind.key);
              }}
              className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1a3a2a] text-[#8ba89a] text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#d4af37] hover:text-[#0a1f14]"
              title={`Details: ${ind.label}`}
            >
              i
            </button>

            {/* Label */}
            <p className="text-[10px] uppercase tracking-wider text-[#8ba89a] mb-1">
              {ind.label}
            </p>

            {/* Value + Trend */}
            <div className="flex items-baseline gap-1">
              <span
                className="text-xl font-bold"
                style={{ color: COLOR_MAP[color] }}
              >
                {ind.format(value)}
              </span>
              {trend.direction !== "none" && (
                <span
                  className="text-xs"
                  style={{
                    color:
                      trend.direction === "up" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {getTrendArrow(trend.direction)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
