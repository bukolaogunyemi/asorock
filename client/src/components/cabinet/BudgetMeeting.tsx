import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import type { BudgetAllocation } from "@/lib/sectorTypes";

interface BudgetMeetingProps {
  onComplete: (allocation: BudgetAllocation) => void;
}

const SECTOR_LABELS: Record<keyof BudgetAllocation, string> = {
  economy: "Economy & Finance",
  infrastructure: "Infrastructure",
  health: "Health",
  education: "Education",
  agriculture: "Agriculture",
  interior: "Interior & Security",
  environment: "Environment",
  youthEmployment: "Youth & Employment",
};

const MINISTER_QUOTES: Record<
  keyof BudgetAllocation,
  { increase: string; decrease: string; neutral: string }
> = {
  economy: {
    increase:
      "The markets will respond positively to this investment signal.",
    decrease:
      "Mr. President, cutting our allocation risks fiscal instability.",
    neutral: "We can maintain current programmes with this level of funding.",
  },
  infrastructure: {
    increase:
      "Excellent. We can finally accelerate the road and rail projects.",
    decrease:
      "Sir, our infrastructure deficit will only widen with less funding.",
    neutral: "We will continue with the current project pipeline.",
  },
  health: {
    increase:
      "This will help us expand primary healthcare centres nationwide.",
    decrease: "Our hospitals are already underfunded, sir.",
    neutral: "We will sustain current healthcare delivery levels.",
  },
  education: {
    increase:
      "More classrooms, more teachers — this is an investment in our future.",
    decrease:
      "Reducing education funding sends the wrong signal to our youth.",
    neutral: "Current programmes will continue as planned.",
  },
  agriculture: {
    increase:
      "This boost will strengthen food security and support our farmers.",
    decrease:
      "Mr. President, food prices will rise if we cut agricultural support.",
    neutral: "We will maintain current subsidy and extension programmes.",
  },
  interior: {
    increase:
      "Additional resources will strengthen our security apparatus significantly.",
    decrease:
      "Security challenges require more resources, not less, Mr. President.",
    neutral: "Current security operations will be maintained.",
  },
  environment: {
    increase:
      "We can now tackle erosion and deforestation more aggressively.",
    decrease:
      "Climate adaptation cannot wait — this cut concerns me deeply.",
    neutral: "Ongoing environmental programmes will continue.",
  },
  youthEmployment: {
    increase:
      "This will create thousands of new opportunities for our young people.",
    decrease:
      "Youth unemployment is a ticking time bomb, sir. We need more, not less.",
    neutral: "Current youth empowerment schemes will be sustained.",
  },
};

function getQuote(
  sector: keyof BudgetAllocation,
  current: number,
  initial: number,
): string {
  if (current > initial) return MINISTER_QUOTES[sector].increase;
  if (current < initial) return MINISTER_QUOTES[sector].decrease;
  return MINISTER_QUOTES[sector].neutral;
}

export function BudgetMeeting({ onComplete }: BudgetMeetingProps) {
  const { state } = useGame();
  const initial = state.budgetAllocation;
  const [allocation, setAllocation] = useState<BudgetAllocation>({
    ...initial,
  });
  const [phase, setPhase] = useState<"allocating" | "submitted">("allocating");

  const total = Object.values(allocation).reduce(
    (sum, v) => sum + v,
    0,
  );
  const isValid = total === 100;

  const sectors = Object.keys(allocation) as (keyof BudgetAllocation)[];

  function handleSliderChange(key: keyof BudgetAllocation, value: number) {
    setAllocation((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!isValid) return;
    setPhase("submitted");
  }

  // ── Phase 2: Summary ─────────────────────────────────────────
  if (phase === "submitted") {
    return (
      <div className="mx-auto max-w-2xl py-8 px-4">
        {/* Header */}
        <div className="rounded-t-xl bg-[#0a1f14] px-6 py-5">
          <h2 className="text-xl font-bold text-[#d4af37]">
            Budget Proposal Submitted
          </h2>
          <p className="mt-1 text-sm text-white/80">
            The annual budget has been approved by the Federal Executive Council
          </p>
        </div>

        {/* Body */}
        <div className="rounded-b-xl border border-t-0 border-[#0a1f14]/20 bg-[#faf8f5] px-6 py-6 space-y-6">
          {/* Comparison Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#0a1f14]/10">
                <th className="pb-2 text-left font-semibold text-[#0a1f14]/70 uppercase tracking-wide text-xs">
                  Sector
                </th>
                <th className="pb-2 text-right font-semibold text-[#0a1f14]/70 uppercase tracking-wide text-xs">
                  Previous
                </th>
                <th className="pb-2 text-right font-semibold text-[#0a1f14]/70 uppercase tracking-wide text-xs">
                  New
                </th>
                <th className="pb-2 text-right font-semibold text-[#0a1f14]/70 uppercase tracking-wide text-xs">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((key) => {
                const diff = allocation[key] - initial[key];
                return (
                  <tr
                    key={key}
                    className="border-b border-[#0a1f14]/5 last:border-0"
                  >
                    <td className="py-2 font-medium text-[#0a1f14]">
                      {SECTOR_LABELS[key]}
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#0a1f14]/60">
                      {initial[key]}%
                    </td>
                    <td className="py-2 text-right tabular-nums font-semibold text-[#0a1f14]">
                      {allocation[key]}%
                    </td>
                    <td
                      className={`py-2 text-right tabular-nums font-semibold ${
                        diff > 0
                          ? "text-green-600"
                          : diff < 0
                            ? "text-red-600"
                            : "text-[#0a1f14]/40"
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff === 0 ? "—" : diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Return Button */}
          <button
            onClick={() => onComplete(allocation)}
            className="w-full rounded-lg bg-[#d4af37] px-6 py-3 text-sm font-bold text-[#0a1f14] shadow hover:bg-[#c5a030] transition-colors"
          >
            Return to Cabinet
          </button>
        </div>
      </div>
    );
  }

  // ── Phase 1: Allocation ───────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      {/* Header */}
      <div className="rounded-t-xl bg-[#0a1f14] px-6 py-5">
        <h2 className="text-xl font-bold text-[#d4af37]">
          Annual Budget Meeting — October
        </h2>
        <p className="mt-1 text-sm text-white/80">
          Allocate next year's budget across governance sectors. Total must
          equal 100%.
        </p>
      </div>

      {/* Body */}
      <div className="rounded-b-xl border border-t-0 border-[#0a1f14]/20 bg-[#faf8f5] px-6 py-6 space-y-5">
        {/* Total Indicator */}
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold ${
            isValid
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          <span>
            {total}% allocated {isValid ? "" : "(must be 100%)"}
          </span>
          <span
            className={`text-xs font-bold ${isValid ? "text-green-500" : "text-red-500"}`}
          >
            {isValid ? "Ready" : `${total > 100 ? "Over" : "Under"} by ${Math.abs(100 - total)}%`}
          </span>
        </div>

        {/* Sector Sliders */}
        <div className="space-y-4">
          {sectors.map((key) => {
            const value = allocation[key];
            const quote = getQuote(key, value, initial[key]);
            return (
              <div
                key={key}
                className="rounded-lg border border-[#0a1f14]/10 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-[#0a1f14]">
                    {SECTOR_LABELS[key]}
                  </label>
                  <span className="text-sm font-bold tabular-nums text-[#0a1f14]">
                    {value}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={value}
                  onChange={(e) =>
                    handleSliderChange(key, Number(e.target.value))
                  }
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#d4af37] bg-[#0a1f14]/10"
                />
                <p className="mt-1.5 text-xs italic text-[#0a1f14]/50">
                  "{quote}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full rounded-lg px-6 py-3 text-sm font-bold shadow transition-colors ${
            isValid
              ? "bg-[#d4af37] text-[#0a1f14] hover:bg-[#c5a030]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Budget Proposal
        </button>
      </div>
    </div>
  );
}
