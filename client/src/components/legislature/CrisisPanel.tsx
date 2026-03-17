import type { Bill, CrisisState, VoteProjection } from "@/lib/legislativeTypes";
import { getInfluenceLevers } from "@/lib/influenceLevers";
import { useGame } from "@/lib/GameContext";

const CRISIS_TYPE_LABELS: Record<string, string> = {
  budget: "Budget Crisis",
  social: "Social Crisis",
  constitutional: "Constitutional Crisis",
  override: "Veto Override",
  "surprise-motion": "Surprise Motion",
};

const VOTE_ROWS: { label: string; key: keyof VoteProjection; color: string }[] = [
  { label: "Firm Yes", key: "firmYes", color: "text-green-600" },
  { label: "Leaning Yes", key: "leaningYes", color: "text-lime-600" },
  { label: "Undecided", key: "undecided", color: "text-gray-500" },
  { label: "Leaning No", key: "leaningNo", color: "text-orange-500" },
  { label: "Firm No", key: "firmNo", color: "text-red-500" },
];

interface CrisisPanelProps {
  bill: Bill;
  crisis?: CrisisState;
  selectedLeverIds: string[];
  onToggleLever: (id: string) => void;
  onResolve: () => void;
}

export function CrisisPanel({
  bill,
  crisis,
  selectedLeverIds,
  onToggleLever,
  onResolve,
}: CrisisPanelProps) {
  const { state } = useGame();
  const allLevers = getInfluenceLevers();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Red alert banner */}
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-500 text-lg">{"\u26A0"}</span>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              {crisis
                ? CRISIS_TYPE_LABELS[crisis.crisisType] ?? "Legislative Crisis"
                : "Legislative Crisis"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-red-800">{bill.title}</h2>
          <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
            {bill.description}
          </p>
          {crisis && (
            <div className="mt-2 text-xs font-semibold text-red-700">
              Round {crisis.currentRound} of {crisis.totalRounds}
            </div>
          )}
        </div>

        {/* Vote breakdown table */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Vote Breakdown
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#faf8f5]">
                  <th className="text-left px-3 py-1.5 text-gray-500 font-medium">
                    Bucket
                  </th>
                  <th className="text-right px-3 py-1.5 text-gray-500 font-medium">
                    House
                  </th>
                  <th className="text-right px-3 py-1.5 text-gray-500 font-medium">
                    Senate
                  </th>
                </tr>
              </thead>
              <tbody>
                {VOTE_ROWS.map(({ label, key, color }) => (
                  <tr
                    key={key}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className={`px-3 py-1.5 font-medium ${color}`}>
                      {label}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right tabular-nums ${color}`}
                    >
                      {bill.houseSupport[key]}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right tabular-nums ${color}`}
                    >
                      {bill.senateSupport[key]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Influence levers grid */}
        <div className="p-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Influence Levers
          </div>
          <div className="grid grid-cols-2 gap-2">
            {allLevers.map((lever) => {
              const isSelected = selectedLeverIds.includes(lever.id);
              const isAvailable = lever.available(state, bill);
              return (
                <button
                  key={lever.id}
                  disabled={!isAvailable}
                  onClick={() => onToggleLever(lever.id)}
                  className={`text-left rounded-lg border p-2.5 text-xs transition-all ${
                    !isAvailable
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "border-[#d4af37] bg-[#d4af37]/10 shadow-sm"
                        : "border-gray-200 bg-white hover:border-[#d4af37] cursor-pointer"
                  }`}
                >
                  <div className="font-semibold text-[#0a1f14] mb-0.5">
                    {lever.name}
                  </div>
                  <div className="text-gray-500 mb-1.5 leading-relaxed">
                    {lever.description}
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {lever.costs.map((cost, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium"
                      >
                        -{cost.amount} {cost.type}
                      </span>
                    ))}
                    {lever.houseSwing > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">
                        House +{lever.houseSwing}
                      </span>
                    )}
                    {lever.senateSwing > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">
                        Senate +{lever.senateSwing}
                      </span>
                    )}
                  </div>
                  {!isAvailable && (
                    <div className="text-[10px] text-gray-400 mt-1 italic">
                      Requirements not met
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resolve crisis button */}
      <div className="p-3 bg-white border-t border-gray-200">
        <button
          disabled={selectedLeverIds.length === 0}
          onClick={onResolve}
          className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              selectedLeverIds.length > 0 ? "#d4af37" : "#e5e7eb",
            color: selectedLeverIds.length > 0 ? "#0a1f14" : "#9ca3af",
          }}
        >
          Resolve Crisis ({selectedLeverIds.length} lever
          {selectedLeverIds.length !== 1 ? "s" : ""} selected)
        </button>
      </div>
    </div>
  );
}
