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

const INDICATOR_ICONS: Record<string, string> = {
  approval: "\u{1F4CA}",  // 📊
  security: "\u{1F6E1}",  // 🛡
  treasury: "\u{1F3E6}",  // 🏦
  gdpGrowth: "\u{1F4C8}", // 📈
  inflation: "\u{1F525}",  // 🔥
  oilOutput: "\u{1F6E2}",  // 🛢
  fxRate: "\u{1F4B1}",    // 💱
  stability: "\u2696",    // ⚖
};

/** Generate a brief context line for each indicator */
function getContextLine(key: string, value: number, delta: number): string {
  switch (key) {
    case "approval":
      if (delta < -3) return "Sharp decline; bloc pressure mounting.";
      if (delta < 0) return "Softening; watch regional sentiment.";
      if (delta > 3) return "Strong momentum; capitalize now.";
      if (delta > 0) return "Trending positive; hold course.";
      return "Holding steady this cycle.";
    case "security":
      if (value > 70) return "No active flashpoints reported.";
      if (value >= 40) return "Elevated threat level in some zones.";
      return "Multiple crises require attention.";
    case "treasury":
      if (value > 2.0) return "Healthy reserves. Debt service manageable.";
      if (value >= 1.0) return "Debt service pressure building.";
      return "Reserves critically low.";
    case "gdpGrowth":
      if (value > 0.05) return "Expansion across key sectors.";
      if (value >= 0) return "Growth stalling; stimulus needed.";
      return "Contraction detected; urgent action.";
    case "inflation":
      if (value < 10) return "Prices stable; consumer relief.";
      if (value <= 20) return "CBN watching closely.";
      return "Runaway prices; CBN intervention likely.";
    case "oilOutput":
      if (value > 2.0) return "Output above OPEC quota target.";
      if (value >= 1.5) return "Moderate; terminal disruptions.";
      return "Below target; revenue shortfall.";
    case "fxRate":
      if (value < 800) return "Naira holding; FX market calm.";
      if (value <= 1200) return "Depreciation pressure mounting.";
      return "Parallel market diverging sharply.";
    case "stability":
      if (value > 70) return "National cohesion holding firm.";
      if (value >= 40) return "Regional tensions simmering.";
      return "Fragility across multiple axes.";
    default:
      return "";
  }
}

function getPreviousValue(
  state: Record<string, unknown>,
  ind: (typeof INDICATORS)[number],
): number | undefined {
  const approvalHistory = state.approvalHistory as Array<{ approval: number }> | undefined;
  const macroHistory = state.macroHistory as Array<Record<string, unknown>> | undefined;

  if (ind.key === "approval") {
    if (approvalHistory && approvalHistory.length >= 2) {
      return approvalHistory[approvalHistory.length - 2].approval;
    }
    return undefined;
  }

  if (macroHistory && macroHistory.length >= 2) {
    const prev = macroHistory[macroHistory.length - 2];
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
    <div className="grid grid-cols-4 grid-rows-2 gap-1.5">
      {INDICATORS.map((ind) => {
        const value = getIndicatorValue(stateRecord, ind.sourceField);
        const color = getIndicatorColor(ind.key, value);
        const prevValue = getPreviousValue(stateRecord, ind);
        const trend = getIndicatorTrend(value, prevValue);
        const isPulsing = pulsingIndicators?.includes(ind.key);
        const icon = INDICATOR_ICONS[ind.key] ?? "";
        const context = getContextLine(ind.key, value, trend.delta);

        // Format trend delta like "(↓2)"
        const trendText = trend.direction !== "none"
          ? `(${trend.direction === "up" ? "\u2191" : "\u2193"}${Math.abs(trend.delta) >= 1 ? Math.round(Math.abs(trend.delta)) : Math.abs(trend.delta).toFixed(1)})`
          : "";

        return (
          <button
            key={ind.key}
            onClick={() => onNavigate(ind.navigateTo.tab, ind.navigateTo.subTab)}
            className={`relative bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-left transition-colors hover:border-[#d4af37]/40 shadow-sm group
              ${isPulsing ? "animate-pulse" : ""}`}
          >
            {/* Info icon on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail(ind.key);
              }}
              className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#d4af37] hover:text-white"
              title={`Details: ${ind.label}`}
            >
              i
            </button>

            {/* Icon + Label */}
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              <span className="mr-0.5">{icon}</span> {ind.label}
            </p>

            {/* Value + trend delta */}
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className="text-sm font-bold"
                style={{ color: COLOR_MAP[color] }}
              >
                {ind.format(value)}
              </span>
              {trendText && (
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: trend.direction === "up" ? "#22c55e" : "#ef4444" }}
                >
                  {trendText}
                </span>
              )}
            </div>

            {/* Context line */}
            <p className="text-[10px] text-gray-400 leading-snug mt-0.5 line-clamp-1">
              {context}
            </p>
          </button>
        );
      })}
    </div>
  );
}
