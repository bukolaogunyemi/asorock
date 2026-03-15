import { useGame } from "../lib/GameContext";
import { filterHeadlines } from "../lib/decisionFiltering";

interface HeadlinesColumnProps {
  activeTab: string;
}

/** Classify headline sentiment by keywords */
function getSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const negativeWords = ["threaten", "crisis", "strike", "collapse", "demand", "pressure", "slip", "drop", "split", "tension", "fear", "warn", "reject", "anger", "protest", "attack", "deficit", "debt"];
  const positiveWords = ["reform", "growth", "improve", "boost", "invest", "approve", "support", "agree", "peace", "progress", "hope", "deal", "rise", "gain", "secure"];

  if (negativeWords.some(w => lower.includes(w))) return "negative";
  if (positiveWords.some(w => lower.includes(w))) return "positive";
  return "neutral";
}

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
};

export default function HeadlinesColumn({ activeTab }: HeadlinesColumnProps) {
  const { state } = useGame();
  const headlines = filterHeadlines(state.headlines ?? [], activeTab);

  return (
    <div className="w-[220px] shrink-0 bg-[#0a1f14] border-l border-[#d4af37]/20 flex flex-col h-full">
      <div className="px-3 py-2 text-sm font-semibold text-[#d4af37]">
        Headlines
      </div>

      <div className="flex-1 overflow-hidden px-2 pb-2 space-y-1">
        {headlines.length === 0 ? (
          <p className="text-xs text-[#e8dcc8]/40 italic px-1">
            No headlines available
          </p>
        ) : (
          headlines.slice(0, 10).map((headline, i) => {
            const sentiment = getSentiment(headline);
            return (
              <div
                key={i}
                className="border-l-2 pl-2 py-0.5"
                style={{ borderColor: SENTIMENT_COLOR[sentiment] }}
              >
                <span className="text-[11px] text-[#e8dcc8]/80 leading-tight line-clamp-2">
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
