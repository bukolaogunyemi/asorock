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

  const items = filterBriefItems(allItems, activeTab);

  return (
    <div className="w-[220px] shrink-0 bg-[#0a1f14] border-r border-[#d4af37]/20 flex flex-col h-full">
      <button
        onClick={onOpenFullBrief}
        className="w-full px-3 py-2 text-left text-sm font-semibold text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
      >
        Daily Brief &middot; View Full &#8599;
      </button>

      <div className="flex-1 overflow-hidden px-2 pb-2 space-y-1">
        {items.length === 0 ? (
          <p className="text-xs text-[#e8dcc8]/40 italic px-1 pt-2">
            No briefing available
          </p>
        ) : (
          items.slice(0, 8).map((item, i) => (
            <div
              key={i}
              className={`border-l-2 ${severityBorder[item.severity] ?? "border-gray-500"} pl-2 py-1`}
            >
              <div className="flex items-start gap-1.5">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${severityDot[item.severity] ?? "bg-gray-500"}`}
                />
                <span className="text-xs text-[#e8dcc8]/80 leading-tight line-clamp-2">
                  {item.text}
                </span>
              </div>
            </div>
          ))
        )}
        {items.length > 8 && (
          <p className="text-[10px] text-[#d4af37]/50 px-1 pt-1">
            +{items.length - 8} more — click above to view all
          </p>
        )}
      </div>
    </div>
  );
}
