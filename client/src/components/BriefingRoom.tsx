import { lazy, Suspense, useMemo } from "react";
import { useGame } from "../lib/GameContext";
import type { BriefItem } from "../lib/gameTypes";

const InboxTab = lazy(() => import("./InboxTab"));

interface BriefingRoomProps {
  onOpenFullBrief: () => void;
}

const severityColor: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  intel: "#3b82f6",
  memo: "#9ca3af",
};

const PLACEHOLDER_INTEL: BriefItem[] = [
  { severity: "critical", text: "Inflation surged to 28.1% — CBN under pressure to raise rates" },
  { severity: "warning", text: "NNPC reports 12% drop in crude output from Forcados terminal" },
  { severity: "intel", text: "Labour unions signal coordinated strike over fuel subsidy removal" },
  { severity: "warning", text: "Northern governors demand emergency security summit at Aso Rock" },
  { severity: "intel", text: "IMF delegation arriving Thursday to discuss standby facility terms" },
  { severity: "memo", text: "Senate committee schedules Petroleum Industry Bill markup session" },
  { severity: "critical", text: "FX reserves slip below five months of import cover" },
  { severity: "intel", text: "ECOWAS capitals divided over Nigeria's preferred Niger strategy" },
];

function getSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const neg = ["threaten", "crisis", "strike", "collapse", "demand", "pressure", "slip", "drop", "split", "tension", "fear", "warn", "reject", "anger", "protest", "attack", "deficit", "debt"];
  const pos = ["reform", "growth", "improve", "boost", "invest", "approve", "support", "agree", "peace", "progress", "hope", "deal", "rise", "gain", "secure"];
  if (neg.some(w => lower.includes(w))) return "negative";
  if (pos.some(w => lower.includes(w))) return "positive";
  return "neutral";
}

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
};

export default function BriefingRoom({ onOpenFullBrief }: BriefingRoomProps) {
  const { state } = useGame();

  const brief = state.lastBriefData;
  const allBriefItems: BriefItem[] = brief
    ? [...brief.sections.political, ...brief.sections.economic, ...brief.sections.security, ...brief.sections.diplomatic]
    : [];

  // Generate dynamic situation items from game state
  const dynamicItems = useMemo((): BriefItem[] => {
    const items: BriefItem[] = [];

    // Cabinet vacancies
    const cabinetAppts = state.cabinetAppointments ?? {};
    const vacantPortfolios = Object.entries(cabinetAppts).filter(([, name]) => !name);
    if (vacantPortfolios.length > 0) {
      items.push({
        severity: vacantPortfolios.length > 10 ? "critical" : "warning",
        text: `${vacantPortfolios.length} cabinet positions remain unfilled — governance capacity is severely limited`,
      });
    }

    // Unread inbox messages
    const unread = (state.inboxMessages ?? []).filter(m => !m.read).length;
    if (unread > 0) {
      items.push({ severity: "memo", text: `${unread} unread message${unread > 1 ? "s" : ""} in your Presidential Inbox` });
    }

    // Pending decisions
    if (state.activeEvents.length > 0) {
      items.push({ severity: "warning", text: `${state.activeEvents.length} pending decision${state.activeEvents.length > 1 ? "s" : ""} awaiting presidential attention` });
    }

    return items;
  }, [state.cabinetAppointments, state.inboxMessages, state.activeEvents]);

  // Combine: dynamic items first, then brief items, pad with placeholder if needed
  const combinedItems = [...dynamicItems, ...allBriefItems];
  const briefItems = combinedItems.length >= 4
    ? combinedItems
    : [...combinedItems, ...PLACEHOLDER_INTEL.slice(0, 4 - combinedItems.length)];

  const headlines = state.headlines ?? [];

  return (
    <div className="space-y-4">
      {/* Daily Brief summary banner */}
      <button
        onClick={onOpenFullBrief}
        className="w-full text-left bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:border-[#d4af37]/40 transition-colors group"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
            Daily Brief — {state.date}
          </h2>
          <span className="text-[10px] text-gray-400 group-hover:text-[#d4af37] transition-colors">
            View full brief &#8599;
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {briefItems.filter(i => i.severity === "critical").length} critical items,{" "}
          {briefItems.filter(i => i.severity === "warning").length} warnings,{" "}
          {briefItems.filter(i => i.severity === "intel" || i.severity === "memo").length} memos
        </p>
      </button>

      {/* Two-column layout: Brief items + Headlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Brief Items */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wider">Situation Report</h3>
          </div>
          <div className="p-3 space-y-2">
            {briefItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="w-1 shrink-0 self-stretch rounded-full mt-0.5"
                  style={{ backgroundColor: severityColor[item.severity] ?? "#9ca3af" }}
                />
                <span className="text-xs text-gray-700 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Headlines */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wider">Headlines</h3>
          </div>
          <div className="p-3 space-y-2">
            {headlines.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No headlines available</p>
            ) : (
              headlines.slice(0, 8).map((headline, i) => {
                const sentiment = getSentiment(headline);
                return (
                  <div
                    key={i}
                    className="border-l-2 pl-2.5 py-1"
                    style={{ borderColor: SENTIMENT_COLOR[sentiment] }}
                  >
                    <span className="text-xs text-gray-700 leading-snug block">
                      {headline}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Presidential Inbox — full split-pane */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" style={{ height: 360 }}>
        <Suspense fallback={<div className="p-4 text-xs text-gray-400">Loading inbox...</div>}>
          <InboxTab />
        </Suspense>
      </div>

    </div>
  );
}
