import { useState, useMemo } from "react";
import { useGame } from "@/lib/GameContext";
import type { Bill } from "@/lib/legislativeTypes";

const SUBJECT_TAG: Record<string, { bg: string; text: string }> = {
  economy: { bg: "bg-emerald-50", text: "text-emerald-700" },
  security: { bg: "bg-red-50", text: "text-red-700" },
  social: { bg: "bg-blue-50", text: "text-blue-700" },
  governance: { bg: "bg-amber-50", text: "text-amber-700" },
  constitutional: { bg: "bg-purple-50", text: "text-purple-700" },
};

function getAssemblyLabel(term: number): string {
  const assemblyNum = 9 + term; // term 1 = 10th assembly
  const startYear = 2019 + term * 4; // term 1 starts 2023
  return `${assemblyNum}th Assembly (${startYear}-${startYear + 4})`;
}

function getLegacyLabel(passed: Bill[]): string {
  if (passed.length === 0) return "No Legislative Record";
  const counts: Record<string, number> = {};
  for (const b of passed) {
    counts[b.subjectTag] = (counts[b.subjectTag] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const labels: Record<string, string> = {
    economy: "Economic Transformer",
    security: "Security Hardliner",
    social: "Social Reformer",
    governance: "Reform President",
    constitutional: "Constitutional Pioneer",
  };
  return labels[top[0]] ?? "Legislative Leader";
}

export function HistoryTab() {
  const { state } = useGame();
  const legislature = state.legislature;
  const currentTerm = state.term?.current ?? 1;

  const [selectedTerm, setSelectedTerm] = useState<number | "all">(currentTerm);

  const allPassed = legislature?.passedBills ?? [];
  const allFailed = legislature?.failedBills ?? [];

  // Group by term
  const terms = useMemo(() => {
    const termSet = new Set<number>();
    for (const b of allPassed) termSet.add(b.term ?? 1);
    for (const b of allFailed) termSet.add(b.term ?? 1);
    termSet.add(currentTerm);
    return Array.from(termSet).sort();
  }, [allPassed, allFailed, currentTerm]);

  const filteredPassed =
    selectedTerm === "all" ? allPassed : allPassed.filter((b) => (b.term ?? 1) === selectedTerm);
  const filteredFailed =
    selectedTerm === "all" ? allFailed : allFailed.filter((b) => (b.term ?? 1) === selectedTerm);

  const stats = legislature?.sessionStats;
  const passRate =
    stats && stats.billsIntroduced > 0
      ? Math.round((stats.billsPassed / stats.billsIntroduced) * 100)
      : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Session selector */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-200 overflow-x-auto">
        {terms.map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              selectedTerm === term
                ? "bg-[#0a1f14] text-[#d4af37]"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {getAssemblyLabel(term)}
          </button>
        ))}
        {terms.length > 1 && (
          <button
            onClick={() => setSelectedTerm("all")}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              selectedTerm === "all"
                ? "bg-[#0a1f14] text-[#d4af37]"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            All Sessions
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Passed bills */}
        {filteredPassed.length > 0 && (
          <section className="mb-4">
            <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-2">
              Passed Bills ({filteredPassed.length})
            </div>
            {filteredPassed.map((bill) => (
              <BillHistoryRow key={bill.id} bill={bill} status="passed" day={state.day} />
            ))}
          </section>
        )}

        {/* Failed/Vetoed bills */}
        {filteredFailed.length > 0 && (
          <section className="mb-4">
            <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-2">
              Failed / Vetoed Bills ({filteredFailed.length})
            </div>
            {filteredFailed.map((bill) => {
              const status =
                bill.houseStage === "vetoed" || bill.senateStage === "vetoed"
                  ? "vetoed"
                  : bill.houseStage === "stalled" || bill.senateStage === "stalled"
                    ? "stalled"
                    : "failed";
              return <BillHistoryRow key={bill.id} bill={bill} status={status} day={state.day} />;
            })}
          </section>
        )}

        {filteredPassed.length === 0 && filteredFailed.length === 0 && (
          <div className="text-xs text-gray-400 italic text-center py-8">
            No legislative history for this session yet.
          </div>
        )}
      </div>

      {/* Cumulative stats */}
      {stats && (
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider">
              Legislative Legacy
            </span>
            <span className="text-[10px] font-medium text-[#d4af37]">
              {getLegacyLabel(allPassed)}
            </span>
          </div>
          <div className="flex gap-4 text-[10px] text-gray-500">
            <span>Introduced: <b className="text-[#0a1f14]">{stats.billsIntroduced}</b></span>
            <span>Passed: <b className="text-green-600">{stats.billsPassed}</b></span>
            <span>Vetoed: <b className="text-red-500">{stats.billsVetoed}</b></span>
            <span>Pass Rate: <b className="text-[#d4af37]">{passRate}%</b></span>
          </div>
        </div>
      )}
    </div>
  );
}

function BillHistoryRow({
  bill,
  status,
  day,
}: {
  bill: Bill;
  status: "passed" | "failed" | "vetoed" | "stalled";
  day: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const tag = SUBJECT_TAG[bill.subjectTag] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const icon = status === "passed" ? "\u2713" : "\u2717";
  const iconColor = status === "passed" ? "text-green-600" : "text-red-500";
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const effects = status === "passed" ? bill.effects.onPass : bill.effects.onFail;

  return (
    <div className="border-b border-gray-100 py-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 text-left hover:bg-gray-50 rounded px-1 py-0.5"
      >
        <span className={`text-sm font-bold ${iconColor}`}>{icon}</span>
        <span className="text-xs text-[#0a1f14] flex-1 truncate">{bill.title}</span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${tag.bg} ${tag.text} font-medium`}>
          {bill.subjectTag.charAt(0).toUpperCase() + bill.subjectTag.slice(1)}
        </span>
        <span className="text-[9px] text-gray-400">{statusLabel}</span>
      </button>
      {expanded && effects.length > 0 && (
        <div className="pl-7 pb-1 flex flex-wrap gap-1">
          {effects.map((e, i) => (
            <span
              key={i}
              className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                e.delta > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}
            >
              {e.target} {e.delta > 0 ? "+" : ""}{e.delta}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
