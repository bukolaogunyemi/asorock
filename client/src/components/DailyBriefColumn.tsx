import { useGame } from "../lib/GameContext";
import { filterBriefItems } from "../lib/decisionFiltering";
import type { BriefItem } from "../lib/gameTypes";

interface DailyBriefColumnProps {
  activeTab: string;
  onOpenFullBrief: () => void;
}

const severityColor: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  intel: "#3b82f6",
  memo: "#9ca3af",
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
    <div
      className="w-[260px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full cursor-pointer group"
      onClick={onOpenFullBrief}
      title="Click to open full Intel Brief"
    >
      <div className="px-3 py-2 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider">
          Daily Briefing
        </span>
        <span className="text-[10px] text-gray-400 group-hover:text-[#d4af37] transition-colors">
          &#9654;
        </span>
      </div>

      <div className="flex-1 overflow-hidden px-2 pb-2 flex flex-col justify-between">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="flex gap-2 items-start"
          >
            <div
              className="w-0.5 shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: severityColor[item.severity] ?? "#9ca3af" }}
            />
            <span className="text-[11px] text-[#1a1a1a]/80 leading-snug py-0.5">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
