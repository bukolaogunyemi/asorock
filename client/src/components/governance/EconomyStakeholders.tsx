import { useMemo } from "react";
import { useGame } from "@/lib/GameContext";
import { computeAllStakeholderSentiments } from "@/lib/stakeholderSentiment";

/** Icon + color config per stakeholder */
const STAKEHOLDER_ICONS: Record<string, string> = {
  imf: "🏛",
  "world-bank": "🏛",
  business: "🏢",
  labour: "✊",
  analysts: "📊",
};

const SENTIMENT_STYLES: Record<string, {
  dot: string;
  bg: string;
  border: string;
  textColor: string;
  label: string;
}> = {
  supportive: {
    dot: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-700",
    label: "Supportive",
  },
  cautious: {
    dot: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-700",
    label: "Cautious",
  },
  opposed: {
    dot: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-700",
    label: "Opposed",
  },
};

export function EconomyStakeholders() {
  const { state } = useGame();

  const sentiments = useMemo(() => {
    return computeAllStakeholderSentiments(state.policyLevers, state.economy);
  }, [state.policyLevers, state.economy]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2">
        Stakeholder Pulse
      </h3>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {sentiments.map(s => {
          const style = SENTIMENT_STYLES[s.sentiment] ?? SENTIMENT_STYLES.cautious;
          const icon = STAKEHOLDER_ICONS[s.id] ?? "🏛";

          return (
            <div
              key={s.id}
              className={`rounded-lg ${style.bg} border ${style.border} px-3 py-2`}
            >
              {/* Name row with icon */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-base leading-none">{icon}</span>
                <span className="text-xs font-bold text-[#0a1f14]">{s.name}</span>
              </div>

              {/* Sentiment + quote */}
              <div className="flex items-start gap-1.5">
                <span className={`text-sm leading-none shrink-0 mt-px ${style.dot}`}>●</span>
                <p className={`text-[11px] font-medium italic ${style.textColor}`}>
                  {s.quote}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
