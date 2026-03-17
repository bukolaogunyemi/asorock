import { useState, useMemo } from "react";
import { useGame } from "@/lib/GameContext";
import { getInfluenceLevers } from "@/lib/influenceLevers";
import { getOppositionActivity } from "@/lib/legislativeAdviser";
import { VoteThresholdBar } from "./VoteThresholdBar";
import type { Bill } from "@/lib/legislativeTypes";

interface FloorTabProps {
  onCharacterClick?: (characterKey: string) => void;
}

export function FloorTab({ onCharacterClick }: FloorTabProps) {
  const { state, whipVotes, lobbyCommittee } = useGame();
  const legislature = state.legislature;
  const [chamber, setChamber] = useState<"house" | "senate">("house");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedLeverIds, setSelectedLeverIds] = useState<string[]>([]);

  const levers = getInfluenceLevers();

  // Bills at floor-debate or vote stage in selected chamber
  const floorBills = useMemo(() => {
    if (!legislature) return [];
    return legislature.activeBills.filter((b) => {
      const stage = chamber === "house" ? b.houseStage : b.senateStage;
      return stage === "floor-debate" || stage === "vote";
    });
  }, [legislature, chamber]);

  // Bills in committee stage in selected chamber
  const committeeBills = useMemo(() => {
    if (!legislature) return [];
    return legislature.activeBills.filter((b) => {
      const stage = chamber === "house" ? b.houseStage : b.senateStage;
      return stage === "committee";
    });
  }, [legislature, chamber]);

  const selectedBill = floorBills.find((b) => b.id === selectedBillId) ?? null;
  const oppositionEvents = getOppositionActivity(state);

  const toggleLever = (id: string) => {
    setSelectedLeverIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const handleApplyLevers = () => {
    if (selectedBill && selectedLeverIds.length > 0) {
      whipVotes(selectedBill.id, selectedLeverIds, chamber);
      setSelectedLeverIds([]);
    }
  };

  const handleLobby = (billId: string) => {
    lobbyCommittee(billId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chamber toggle */}
      <div className="flex gap-1 px-4 py-2 border-b border-gray-200">
        {(["house", "senate"] as const).map((c) => (
          <button
            key={c}
            onClick={() => { setChamber(c); setSelectedBillId(null); setSelectedLeverIds([]); }}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
              chamber === c
                ? "bg-[#0a1f14] text-[#d4af37]"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {c === "house" ? "House" : "Senate"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Vote Whipping Panel */}
        <section>
          <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-2">
            Vote Whipping
          </div>

          {floorBills.length === 0 ? (
            <div className="text-xs text-gray-400 italic py-2">
              No bills at floor stage in the {chamber === "house" ? "House" : "Senate"}.
            </div>
          ) : (
            <>
              {/* Bill selector */}
              <div className="space-y-1 mb-3">
                {floorBills.map((bill) => (
                  <button
                    key={bill.id}
                    onClick={() => { setSelectedBillId(bill.id); setSelectedLeverIds([]); }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                      selectedBillId === bill.id
                        ? "bg-[#fdf9ef] border border-[#d4af37]"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {bill.title}
                  </button>
                ))}
              </div>

              {/* Vote projection + levers for selected bill */}
              {selectedBill && (
                <>
                  <VoteThresholdBar
                    chamber={chamber}
                    voteProjection={
                      chamber === "house" ? selectedBill.houseSupport : selectedBill.senateSupport
                    }
                  />

                  {/* Influence levers grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {levers.map((lever) => {
                      const isAvailable = lever.available(state, selectedBill);
                      const isSelected = selectedLeverIds.includes(lever.id);
                      const swing = chamber === "house" ? lever.houseSwing : lever.senateSwing;

                      return (
                        <button
                          key={lever.id}
                          onClick={() => isAvailable && toggleLever(lever.id)}
                          disabled={!isAvailable}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            !isAvailable
                              ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
                              : isSelected
                                ? "border-[#d4af37] bg-[#fdf9ef] shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-[11px] font-semibold text-[#0a1f14]">{lever.name}</div>
                          <div className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">
                            {lever.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {lever.costs.map((cost, i) => (
                              <span key={i} className="text-[8px] px-1 py-0.5 rounded bg-red-50 text-red-600 font-medium">
                                -{cost.amount} {cost.type === "politicalCapital" ? "PC" : cost.type === "approval" ? "Appr" : cost.type === "partyLoyalty" ? "Loyalty" : "Dilution"}
                              </span>
                            ))}
                            <span className="text-[8px] px-1 py-0.5 rounded bg-green-50 text-green-700 font-bold">
                              +{swing} {chamber === "house" ? "House" : "Senate"}
                            </span>
                          </div>
                          {lever.sideEffects.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {lever.sideEffects.map((se, i) => (
                                <span key={i} className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-700">
                                  {se.target} {se.delta > 0 ? "+" : ""}{se.delta}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Apply button */}
                  {selectedLeverIds.length > 0 && (
                    <button
                      onClick={handleApplyLevers}
                      className="w-full mt-3 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#d4af37" }}
                    >
                      Apply {selectedLeverIds.length} Lever{selectedLeverIds.length > 1 ? "s" : ""}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/* Committee Lobbying */}
        {committeeBills.length > 0 && (
          <section>
            <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-2">
              Committee Lobbying
            </div>
            {committeeBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2 rounded-md border border-gray-200 mb-1.5"
              >
                <div>
                  <div className="text-xs font-semibold text-[#0a1f14]">{bill.title}</div>
                  <div className="text-[9px] text-gray-500">In committee</div>
                </div>
                <button
                  onClick={() => handleLobby(bill.id)}
                  disabled={state.politicalCapital < 3}
                  className="px-3 py-1 rounded text-[10px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: "#0a1f14" }}
                >
                  Lobby (3 PC)
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Opposition Activity Feed */}
        {oppositionEvents.length > 0 && (
          <section>
            <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-2">
              Opposition Activity
            </div>
            <div className="space-y-1.5">
              {oppositionEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="text-[10px] text-gray-600 py-1 border-b border-gray-100">
                  <span className="text-gray-400 mr-1">Day {event.day}</span>
                  {event.text}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
