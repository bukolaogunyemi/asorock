import { useEffect } from "react";
import { useGame } from "../lib/GameContext";
import type { BriefItem } from "../lib/gameTypes";

interface IntelligenceBriefProps {
  onDismiss: () => void;
}

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  intel: "bg-blue-500",
  memo: "bg-gray-500",
};

function SectionBlock({ title, items }: { title: string; items: BriefItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#d4af37] mb-2 uppercase tracking-wide">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-[#e8dcc8]/30 italic">Nothing to report</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${severityDot[item.severity] ?? "bg-gray-500"}`}
              />
              <span className="text-xs text-[#e8dcc8]/80 leading-snug">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MetricDelta({ label, from, to }: { label: string; from: number; to: number }) {
  const diff = to - from;
  const isPositiveMetric = !["outrage", "stress"].some((k) =>
    label.toLowerCase().includes(k),
  );
  const improved = isPositiveMetric ? diff > 0 : diff < 0;
  const color = improved ? "#22c55e" : diff === 0 ? "#e8dcc8" : "#ef4444";

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#0a1f14] border border-[#d4af37]/10"
      style={{ color }}
    >
      <span className="font-medium text-[#e8dcc8]/60">{label}:</span>
      {from} &rarr; {to}
    </span>
  );
}

export default function IntelligenceBrief({ onDismiss }: IntelligenceBriefProps) {
  const { state } = useGame();
  const brief = state.lastBriefData;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  if (!brief) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#0a1f14] border border-[#d4af37]/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#d4af37]/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#d4af37]">
              PRESIDENTIAL INTELLIGENCE BRIEF &mdash; Day {brief.day}
            </h2>
          </div>
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-red-500/20 text-red-400 rounded tracking-wider">
            EYES ONLY
          </span>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Executive Summary */}
          <div className="bg-[#1a3a2a] border border-[#d4af37]/30 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wide mb-2">
              Executive Summary
            </h3>
            <p className="text-sm text-[#e8dcc8]/90 leading-relaxed">
              {brief.executiveSummary}
            </p>
          </div>

          {/* 4-section grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionBlock title="Political" items={brief.sections.political} />
            <SectionBlock title="Economic" items={brief.sections.economic} />
            <SectionBlock title="Security" items={brief.sections.security} />
            <SectionBlock title="Diplomatic" items={brief.sections.diplomatic} />
          </div>

          {/* Metric Changes */}
          {brief.metricChanges.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wide mb-2">
                Metric Changes
              </h3>
              <div className="flex flex-wrap gap-2">
                {brief.metricChanges.map((mc, i) => (
                  <MetricDelta key={i} label={mc.label} from={mc.from} to={mc.to} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-[#0a1f14] hover:brightness-110 transition-all"
          >
            Dismiss &amp; Proceed &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
