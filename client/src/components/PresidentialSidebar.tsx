import { useRef, useEffect } from "react";
import { useGame } from "@/lib/GameContext";
import { computeLegacyScore } from "@/lib/legacyScore";
import { CharacterAvatar } from "./CharacterAvatar";
import {
  INDICATORS,
  getIndicatorColor,
  getIndicatorValue,
  getIndicatorTrend,
} from "@/lib/indicatorConfig";

const COLOR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const DOT_COLOR_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const TREND_ARROW: Record<string, string> = {
  up: "\u25B2",
  down: "\u25BC",
  none: "",
};

function getHealthLabel(health: number): { text: string; color: string } {
  if (health > 80) return { text: "Excellent", color: "#22c55e" };
  if (health > 60) return { text: "Good", color: "#22c55e" };
  if (health > 40) return { text: "Fair", color: "#eab308" };
  if (health > 20) return { text: "Poor", color: "#ef4444" };
  return { text: "Critical", color: "#ef4444" };
}

interface PresidentialSidebarProps {
  onNavigate: (tab: string, subTab?: string) => void;
  pulsingIndicators?: string[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function PresidentialSidebar({
  onNavigate,
  pulsingIndicators,
  collapsed,
  onToggleCollapse,
}: PresidentialSidebarProps) {
  const { state } = useGame();
  const stateRecord = state as unknown as Record<string, unknown>;
  const legacyScore = computeLegacyScore(state.legacyMilestones);

  // Track previous indicator values for trend arrows
  const prevValuesRef = useRef<Record<string, number>>({});
  const prevDayRef = useRef(state.day);

  // Snapshot current values when day changes
  useEffect(() => {
    if (state.day !== prevDayRef.current) {
      const snapshot: Record<string, number> = {};
      for (const ind of INDICATORS) {
        snapshot[ind.key] = getIndicatorValue(stateRecord, ind.sourceField);
      }
      prevValuesRef.current = snapshot;
      prevDayRef.current = state.day;
    }
  });

  const healthInfo = getHealthLabel(state.health);

  return (
    <aside
      className={`shrink-0 flex flex-col border-r border-[#1a3f2a] overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
      style={{ background: "linear-gradient(180deg, #0f2b1e 0%, #163822 50%, #0f2b1e 100%)" }}
    >
      {/* Player Profile Box — clickable */}
      <div className="px-2 mt-2 mb-2">
        <button
          onClick={() => onNavigate("villa")}
          className={`w-full rounded-lg border border-[#2a5a3a] hover:border-[#d4af37] transition-colors ${
            collapsed ? "p-1.5" : "p-3"
          }`}
          style={{ backgroundColor: "rgba(26, 63, 42, 0.5)" }}
          title="View Presidential Villa"
        >
          {/* Avatar */}
          <div className="flex justify-center">
            <div
              className={`rounded-full flex items-center justify-center border-2 border-[#d4af37] ${
                collapsed ? "w-8 h-8" : "w-12 h-12"
              }`}
              style={{ backgroundColor: "#1a3f2a" }}
            >
              <CharacterAvatar
                name={state.presidentName}
                initials={state.presidentName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
                size={collapsed ? "sm" : "md"}
                gender={state.presidentGender ?? "Male"}
                role="President"
              />
            </div>
          </div>

          {/* Name + details (hidden when collapsed) */}
          {!collapsed && (
            <>
              <div className="text-xs font-bold mt-2" style={{ color: "#d4af37" }}>
                {state.presidentName}
              </div>
              <div className="text-[10px]" style={{ color: "#a8c4b0" }}>
                {state.presidentAge} yrs &middot; {state.presidentState} &middot;{" "}
                {state.presidentParty}
              </div>

              {/* Stats row */}
              <div className="flex justify-between mt-2">
                <div className="text-center flex-1">
                  <div className="text-xs font-bold" style={{ color: "#d4af37" }}>
                    {state.politicalCapital}
                  </div>
                  <div className="text-[8px]" style={{ color: "#a8c4b0" }}>
                    PC
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold" style={{ color: "#d4af37" }}>
                    {legacyScore}
                  </div>
                  <div className="text-[8px]" style={{ color: "#a8c4b0" }}>
                    Legacy
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold" style={{ color: "#d4af37" }}>
                    {state.term.current}
                  </div>
                  <div className="text-[8px]" style={{ color: "#a8c4b0" }}>
                    Term
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold" style={{ color: healthInfo.color }}>
                    {Math.round(state.health)}%
                  </div>
                  <div className="text-[8px]" style={{ color: "#a8c4b0" }}>
                    Health
                  </div>
                </div>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Inbox Button */}
      <div className="px-2 mb-2">
        <button
          onClick={() => onNavigate("inbox")}
          className={`w-full rounded-lg border border-[#2a5a3a] hover:border-[#d4af37] transition-colors flex items-center justify-center gap-2 ${
            collapsed ? "p-1.5" : "px-3 py-2"
          }`}
          style={{ backgroundColor: "rgba(26, 63, 42, 0.5)" }}
          title="Presidential Inbox"
        >
          <span className={collapsed ? "text-sm" : "text-base"}>📨</span>
          {!collapsed && (
            <span className="text-xs font-medium" style={{ color: "#c0d8c8" }}>
              Inbox
            </span>
          )}
          {(() => {
            const unread = (state.inboxMessages ?? []).filter((m: { read: boolean }) => !m.read).length;
            return unread > 0 ? (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#d4af37] text-white leading-none">
                {unread}
              </span>
            ) : null;
          })()}
        </button>
      </div>

      {/* KPI Indicators */}
      <div className={`flex flex-col gap-3 px-2 py-1 ${collapsed ? "items-center" : ""}`}>
        {INDICATORS.map((ind) => {
          const value = getIndicatorValue(stateRecord, ind.sourceField);
          const color = getIndicatorColor(ind.key, value);
          const isPulsing = pulsingIndicators?.includes(ind.key);
          const prevValue = prevValuesRef.current[ind.key];
          const trend = getIndicatorTrend(value, prevValue);
          const context = ind.contextText?.(value);

          if (collapsed) {
            return (
              <button
                key={ind.key}
                onClick={() =>
                  onNavigate(ind.navigateTo.tab, ind.navigateTo.subTab)
                }
                className={`w-2.5 h-2.5 rounded-full transition-colors ${isPulsing ? "animate-pulse" : ""}`}
                style={{ backgroundColor: DOT_COLOR_MAP[color] }}
                title={`${ind.label}: ${ind.format(value)}${context ? ` — ${context}` : ""}`}
              />
            );
          }

          return (
            <button
              key={ind.key}
              onClick={() =>
                onNavigate(ind.navigateTo.tab, ind.navigateTo.subTab)
              }
              className={`rounded-lg px-2.5 py-1.5 transition-colors hover:border-[#d4af37] border border-transparent text-left ${
                isPulsing ? "animate-pulse" : ""
              }`}
              style={{ backgroundColor: "rgba(26, 63, 42, 0.5)" }}
            >
              {/* Top row: label + value */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium" style={{ color: "#c0d8c8" }}>
                  {ind.label}
                </span>
                <div className="flex items-center gap-1">
                  {trend.direction !== "none" && (
                    <span
                      className="text-[9px]"
                      style={{
                        color: trend.direction === "up"
                          ? (ind.key === "inflation" || ind.key === "fxRate" ? "#ef4444" : "#22c55e")
                          : (ind.key === "inflation" || ind.key === "fxRate" ? "#22c55e" : "#ef4444"),
                      }}
                    >
                      {TREND_ARROW[trend.direction]}
                    </span>
                  )}
                  <span
                    className="text-sm font-bold"
                    style={{ color: COLOR_MAP[color] }}
                  >
                    {ind.format(value)}
                  </span>
                </div>
              </div>
              {/* Bottom row: context narrative */}
              {context && (
                <div
                  className="text-[9px] mt-0.5 font-medium"
                  style={{ color: COLOR_MAP[color] }}
                >
                  {context}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Collapse toggle at bottom */}
      <button
        onClick={onToggleCollapse}
        className="self-center p-2 mb-2 text-[#7a9a85] hover:text-[#d4af37] transition-colors text-xs"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "\u25B6" : "\u25C0"}
      </button>
    </aside>
  );
}
