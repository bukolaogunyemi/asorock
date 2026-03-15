import { useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGame } from "../lib/GameContext";
import {
  INDICATORS,
  getIndicatorColor,
  getIndicatorValue,
} from "../lib/indicatorConfig";

interface IndicatorDetailPopupProps {
  indicatorKey: string;
  onClose: () => void;
  onNavigate: (tab: string, subTab?: string) => void;
}

export function IndicatorDetailPopup({
  indicatorKey,
  onClose,
  onNavigate,
}: IndicatorDetailPopupProps) {
  const { state } = useGame();
  const ind = INDICATORS.find((i) => i.key === indicatorKey);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const chartData = useMemo(() => {
    if (!ind) return [];

    if (ind.key === "approval") {
      return (state.approvalHistory ?? []).slice(-30).map((h) => ({
        day: h.day,
        value: h.approval,
      }));
    }

    // For macro-sourced fields, use macroHistory
    const field = ind.sourceField.split(".").pop() ?? ind.sourceField;
    return (state.macroHistory ?? []).slice(-30).map((h) => ({
      day: h.day,
      value: (h as unknown as Record<string, number>)[field] ?? 0,
    }));
  }, [state.approvalHistory, state.macroHistory, ind]);

  if (!ind) return null;

  const stateRecord = state as unknown as Record<string, unknown>;
  const currentValue = getIndicatorValue(stateRecord, ind.sourceField);
  const color = getIndicatorColor(ind.key, currentValue);
  const colorHex =
    color === "green" ? "#22c55e" : color === "yellow" ? "#eab308" : "#ef4444";

  // Related pending decisions
  const relatedEvents = state.activeEvents.filter((ev) => {
    const cat = (ev.category ?? "").toLowerCase();
    const tab = ind.navigateTo.tab.toLowerCase();
    const sub = (ind.navigateTo.subTab ?? "").toLowerCase();
    return cat.includes(tab) || (sub && cat.includes(sub));
  });

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[#0d2818] border border-[#1a3a2a] rounded-xl w-full max-w-md p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#d4af37] font-bold text-lg">{ind.label}</h3>
          <button
            onClick={onClose}
            className="text-[#8ba89a] hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Current value */}
        <p className="text-2xl font-bold mb-3" style={{ color: colorHex }}>
          {ind.format(currentValue)}
        </p>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8ba89a", fontSize: 10 }}
                  stroke="#1a3a2a"
                />
                <YAxis
                  tick={{ fill: "#8ba89a", fontSize: 10 }}
                  stroke="#1a3a2a"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a1f14",
                    border: "1px solid #1a3a2a",
                    borderRadius: 8,
                    color: "#c5d4cb",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colorHex}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Related decisions */}
        {relatedEvents.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8ba89a] mb-1">
              Related Decisions
            </p>
            <ul className="space-y-1">
              {relatedEvents.slice(0, 3).map((ev) => (
                <li
                  key={ev.id}
                  className="text-xs text-[#c5d4cb] truncate"
                >
                  {ev.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigate button */}
        <button
          onClick={() =>
            onNavigate(ind.navigateTo.tab, ind.navigateTo.subTab)
          }
          className="w-full py-2 text-sm font-medium rounded-lg bg-[#1a3a2a] text-[#d4af37] hover:bg-[#234a34] transition-colors"
        >
          Go to {ind.navigateTo.subTab ? `${ind.navigateTo.subTab}` : ind.navigateTo.tab}
        </button>
      </div>
    </div>
  );
}
