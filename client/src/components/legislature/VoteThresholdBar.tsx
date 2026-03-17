import type { VoteProjection } from "@/lib/legislativeTypes";

interface VoteThresholdBarProps {
  chamber: "house" | "senate";
  voteProjection: VoteProjection;
  /** "pass" for simple majority, "override" for 2/3 */
  mode?: "pass" | "override";
}

const THRESHOLDS = {
  house: { pass: 181, override: 240, total: 360 },
  senate: { pass: 55, override: 73, total: 109 },
};

const SEGMENT_COLORS = [
  { key: "firmYes" as const, color: "#22c55e", label: "Firm Yes" },
  { key: "leaningYes" as const, color: "#86efac", label: "Lean Yes" },
  { key: "undecided" as const, color: "#d1d5db", label: "Undecided" },
  { key: "leaningNo" as const, color: "#fb923c", label: "Lean No" },
  { key: "firmNo" as const, color: "#ef4444", label: "Firm No" },
];

export function VoteThresholdBar({
  chamber,
  voteProjection,
  mode = "pass",
}: VoteThresholdBarProps) {
  const { total } = THRESHOLDS[chamber];
  const threshold = THRESHOLDS[chamber][mode];
  const thresholdPct = (threshold / total) * 100;

  const yesTotal = voteProjection.firmYes + voteProjection.leaningYes;
  const noTotal = voteProjection.firmNo + voteProjection.leaningNo;

  return (
    <div className="px-2">
      {/* Yes/No summary */}
      <div className="flex justify-between text-[10px] mb-1">
        <span className="font-bold" style={{ color: "#22c55e" }}>
          {yesTotal} Yes
        </span>
        <span className="font-bold" style={{ color: "#ef4444" }}>
          {noTotal} No
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-4 rounded-sm overflow-hidden flex">
        {SEGMENT_COLORS.map(({ key, color }) => {
          const count = voteProjection[key];
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={key}
              className="h-full flex items-center justify-center text-[8px] font-bold text-white/90"
              style={{ width: `${pct}%`, backgroundColor: color, minWidth: count > 0 ? 12 : 0 }}
              title={`${key}: ${count}`}
            >
              {count > 10 ? count : ""}
            </div>
          );
        })}

        {/* Threshold line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
          style={{ left: `${thresholdPct}%` }}
        />
      </div>

      {/* Threshold label */}
      <div className="text-[9px] text-gray-500 mt-0.5" style={{ paddingLeft: `${thresholdPct - 5}%` }}>
        {threshold} to {mode === "override" ? "override" : "pass"}
      </div>
    </div>
  );
}

/** Party-composition bar (no threshold) shown when no bill is selected */
export function PartyCompositionBar({ chamber }: { chamber: "house" | "senate" }) {
  const blocs =
    chamber === "house"
      ? [
          { seats: 145, color: "#166534" },
          { seats: 56, color: "#4ade80" },
          { seats: 5, color: "#94a3b8" },
          { seats: 34, color: "#f97316" },
          { seats: 120, color: "#dc2626" },
        ]
      : [
          { seats: 56, color: "#166534" },
          { seats: 22, color: "#4ade80" },
          { seats: 2, color: "#94a3b8" },
          { seats: 7, color: "#f97316" },
          { seats: 22, color: "#dc2626" },
        ];
  const total = chamber === "house" ? 360 : 109;

  return (
    <div className="px-2">
      <div className="h-2 rounded-sm overflow-hidden flex opacity-60">
        {blocs.map((b, i) => (
          <div
            key={i}
            className="h-full"
            style={{ width: `${(b.seats / total) * 100}%`, backgroundColor: b.color }}
          />
        ))}
      </div>
    </div>
  );
}
