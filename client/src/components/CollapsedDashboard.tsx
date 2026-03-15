import { useGame } from "../lib/GameContext";
import { getIndicatorColor, getIndicatorTrend } from "../lib/indicatorConfig";
import { computePoliticalWeather } from "../lib/politicalWeather";

const COLOR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const TREND_ARROW: Record<string, string> = {
  up: "\u2191",
  down: "\u2193",
  none: "",
};

interface CollapsedDashboardProps {
  onExpand: () => void;
}

export function CollapsedDashboard({ onExpand }: CollapsedDashboardProps) {
  const { state } = useGame();

  const approvalPrev = state.approvalHistory.length > 1
    ? state.approvalHistory[state.approvalHistory.length - 2]?.approval
    : undefined;
  const approvalTrend = getIndicatorTrend(state.approval, approvalPrev);

  const weather = computePoliticalWeather(
    state.factions,
    state.vicePresident,
    state.activeEvents,
  );

  const items: { label: string; value: string; colorKey: string; trend?: string }[] = [
    { label: "Approval", value: `${Math.round(state.approval)}%`, colorKey: getIndicatorColor("approval", state.approval), trend: TREND_ARROW[approvalTrend.direction] },
    { label: "Treasury", value: `\u20A6${state.treasury.toFixed(1)}T`, colorKey: getIndicatorColor("treasury", state.treasury) },
    { label: "Stability", value: String(Math.round(state.stability)), colorKey: getIndicatorColor("stability", state.stability) },
    { label: "Pol. Capital", value: String(state.politicalCapital), colorKey: "yellow" },
    { label: "Day", value: String(state.day), colorKey: "green" },
  ];

  return (
    <div
      className="flex h-10 cursor-pointer items-center gap-4 border-b px-4 text-xs font-medium"
      style={{ backgroundColor: "#0a1f14", borderColor: "rgba(212,175,55,0.3)" }}
      onClick={onExpand}
    >
      {items.map((item, i) => (
        <span key={i} style={{ color: COLOR_MAP[item.colorKey] ?? "#eab308" }}>
          {item.label} {item.value}{item.trend ? ` ${item.trend}` : ""}
        </span>
      ))}

      <span style={{ color: weather.color }}>
        {weather.level}
      </span>

      <button
        className="ml-auto text-sm opacity-60 hover:opacity-100"
        style={{ color: "#d4af37" }}
        onClick={(e) => { e.stopPropagation(); onExpand(); }}
        aria-label="Expand dashboard"
      >
        &#9650;
      </button>
    </div>
  );
}
