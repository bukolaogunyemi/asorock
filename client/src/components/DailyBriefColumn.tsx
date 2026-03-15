import { useGame } from "../lib/GameContext";
import { filterBriefItems } from "../lib/decisionFiltering";
import type { BriefItem } from "../lib/gameTypes";

interface DailyBriefColumnProps {
  activeTab: string;
  onOpenFullBrief: () => void;
}

const severityBorder: Record<string, string> = {
  critical: "border-red-500",
  warning: "border-amber-500",
  intel: "border-blue-500",
  memo: "border-gray-500",
};

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  intel: "bg-blue-500",
  memo: "bg-gray-500",
};

/** Placeholder intel items shown when no real brief data exists yet */
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

export default function DailyBriefColumn({ activeTab, onOpenFullBrief }: DailyBriefColumnProps) {
  const { state } = useGame();
  const brief = state.lastBriefData;

  const allItems: BriefItem[] = brief
    ? [
        ...brief.sections.political,
        ...brief.sections.economic,
        ...brief.sections.security,
        ...brief.sections.diplomatic,
      ]
    : [];

  const filtered = filterBriefItems(allItems, activeTab);
  const items = filtered.length > 0 ? filtered : PLACEHOLDER_INTEL;

  return (
    <div className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      <button
        onClick={onOpenFullBrief}
        className="w-full px-3 py-2 text-left text-sm font-semibold text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
      >
        Intel Brief &middot; View Full &#8599;
      </button>

      <div className="flex-1 overflow-hidden px-2 pb-2 space-y-1">
        {items.slice(0, 8).map((item, i) => (
          <div
            key={i}
            className={`border-l-2 ${severityBorder[item.severity] ?? "border-gray-500"} pl-2 py-0.5`}
          >
            <span className="text-[11px] text-[#1a1a1a]/80 leading-tight line-clamp-2">
              {item.text}
            </span>
          </div>
        ))}
        {items.length > 8 && (
          <p className="text-[10px] text-gray-400 px-1 pt-1">
            +{items.length - 8} more — click above to view all
          </p>
        )}
      </div>
    </div>
  );
}
