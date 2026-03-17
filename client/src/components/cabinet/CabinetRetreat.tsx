import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import { RETREAT_SECTOR_OPTIONS } from "@/lib/cabinetRetreats";

interface CabinetRetreatProps {
  onComplete: (priorities: string[]) => void;
}

const MAX_SELECTIONS = 3;
const MIN_SELECTIONS = 2;

export function CabinetRetreat({ onComplete }: CabinetRetreatProps) {
  const { state } = useGame();
  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase] = useState<"selecting" | "complete">("selecting");

  function toggleSector(key: string) {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, key];
    });
  }

  function handleConfirm() {
    setPhase("complete");
  }

  function handleReturn() {
    onComplete(selected);
  }

  if (phase === "complete") {
    const priorityLabels = selected.map(
      (key) =>
        RETREAT_SECTOR_OPTIONS.find((o) => o.key === key)?.label ?? key,
    );

    return (
      <div className="mx-auto max-w-2xl py-8 px-4">
        {/* Header */}
        <div className="rounded-t-xl bg-[#0a1f14] px-6 py-5">
          <h2 className="text-xl font-bold text-[#d4af37]">
            Retreat Complete
          </h2>
          <p className="mt-1 text-sm text-white/80">
            Strategic priorities have been set for the next quarter
          </p>
        </div>

        {/* Body */}
        <div className="rounded-b-xl border border-t-0 border-[#0a1f14]/20 bg-[#faf8f5] px-6 py-6 space-y-6">
          {/* Selected Priorities */}
          <div>
            <h3 className="text-sm font-semibold text-[#0a1f14]/70 uppercase tracking-wide mb-3">
              Priority Sectors
            </h3>
            <ul className="space-y-2">
              {priorityLabels.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-[#0a1f14] font-medium"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-white text-xs font-bold">
                    ✓
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Effects Summary */}
          <div>
            <h3 className="text-sm font-semibold text-[#0a1f14]/70 uppercase tracking-wide mb-3">
              Effects Applied
            </h3>
            <ul className="space-y-2 text-sm text-[#0a1f14]/80">
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] font-bold mt-0.5">▸</span>
                <span>
                  +2 momentum to{" "}
                  <span className="font-semibold text-[#0a1f14]">
                    {priorityLabels.join(", ")}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] font-bold mt-0.5">▸</span>
                <span>+3 loyalty to all ministers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4af37] font-bold mt-0.5">▸</span>
                <span>+5 bonus loyalty to ministers in priority sectors</span>
              </li>
            </ul>
          </div>

          {/* Return Button */}
          <button
            onClick={handleReturn}
            className="w-full rounded-lg bg-[#d4af37] px-6 py-3 text-sm font-bold text-[#0a1f14] shadow hover:bg-[#c5a030] transition-colors"
          >
            Return to Cabinet
          </button>
        </div>
      </div>
    );
  }

  // Phase 1: Selection
  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      {/* Header */}
      <div className="rounded-t-xl bg-[#0a1f14] px-6 py-5">
        <h2 className="text-xl font-bold text-[#d4af37]">
          Quarterly Cabinet Retreat
        </h2>
        <p className="mt-1 text-sm text-white/80">
          Select 2–3 strategic priorities for the next quarter
        </p>
      </div>

      {/* Body */}
      <div className="rounded-b-xl border border-t-0 border-[#0a1f14]/20 bg-[#faf8f5] px-6 py-6">
        {/* Selection counter */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-[#0a1f14]/70">
            {selected.length} of {MAX_SELECTIONS} selected
          </p>
          {selected.length < MIN_SELECTIONS && (
            <p className="text-xs text-amber-600">
              Select at least {MIN_SELECTIONS} to proceed
            </p>
          )}
        </div>

        {/* Sector Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RETREAT_SECTOR_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.key);
            const atMax =
              selected.length >= MAX_SELECTIONS && !isSelected;

            const sectorState = (state as any)[option.key];
            const health: number | null = sectorState?.health ?? null;

            return (
              <button
                key={option.key}
                onClick={() => toggleSector(option.key)}
                disabled={atMax}
                className={`relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                  isSelected
                    ? "border-[#d4af37] bg-[#d4af37]/10 shadow-sm"
                    : atMax
                      ? "border-gray-200 bg-white/60 opacity-50 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:border-[#d4af37]/50 hover:shadow-sm"
                }`}
              >
                {/* Checkbox */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition-colors ${
                    isSelected
                      ? "border-[#d4af37] bg-[#d4af37] text-white"
                      : "border-gray-300 bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>

                {/* Label and health */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#0a1f14]">
                    {option.label}
                  </span>
                  {health !== null ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            health >= 60
                              ? "bg-green-500"
                              : health >= 35
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-[#0a1f14]/50 font-medium">
                        {health}%
                      </span>
                    </div>
                  ) : (
                    <span className="mt-1 block text-[10px] text-[#0a1f14]/40">
                      N/A
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={selected.length < MIN_SELECTIONS}
          className={`mt-6 w-full rounded-lg px-6 py-3 text-sm font-bold shadow transition-colors ${
            selected.length >= MIN_SELECTIONS
              ? "bg-[#d4af37] text-[#0a1f14] hover:bg-[#c5a030]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Set Priorities
        </button>
      </div>
    </div>
  );
}
