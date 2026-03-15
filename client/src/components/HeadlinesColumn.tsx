import { useGame } from "../lib/GameContext";
import { filterHeadlines } from "../lib/decisionFiltering";

interface HeadlinesColumnProps {
  activeTab: string;
}

const SOURCES = [
  { name: "Punch", color: "#ef4444" },
  { name: "ThisDay", color: "#3b82f6" },
  { name: "Vanguard", color: "#22c55e" },
  { name: "Guardian", color: "#f59e0b" },
  { name: "Daily Trust", color: "#8b5cf6" },
  { name: "Channels TV", color: "#06b6d4" },
];

export default function HeadlinesColumn({ activeTab }: HeadlinesColumnProps) {
  const { state } = useGame();
  const headlines = filterHeadlines(state.headlines ?? [], activeTab);

  return (
    <div className="w-[220px] shrink-0 bg-[#0a1f14] border-l border-[#d4af37]/20 flex flex-col h-full">
      <div className="px-3 py-2 text-sm font-semibold text-[#d4af37]">
        Headlines
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {headlines.length === 0 ? (
          <p className="text-xs text-[#e8dcc8]/40 italic px-1">
            No headlines available
          </p>
        ) : (
          headlines.map((headline, i) => {
            const source = SOURCES[i % SOURCES.length];
            return (
              <div key={i} className="px-1">
                <span
                  className="text-xs font-bold mr-1"
                  style={{ color: source.color }}
                >
                  {source.name}
                </span>
                <span className="text-xs text-[#e8dcc8]/70 italic leading-tight">
                  {headline}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
