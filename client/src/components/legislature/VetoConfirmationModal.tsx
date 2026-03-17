import { createPortal } from "react-dom";
import { useGame } from "@/lib/GameContext";
import { calculateOverrideRisk } from "@/lib/legislativeAdviser";
import type { Bill } from "@/lib/legislativeTypes";

interface VetoConfirmationModalProps {
  bill: Bill;
  onVeto: () => void;
  onClose: () => void;
}

const VETO_COSTS: Record<string, number> = {
  routine: 3,
  significant: 8,
  critical: 15,
};

export function VetoConfirmationModal({ bill, onVeto, onClose }: VetoConfirmationModalProps) {
  const { state } = useGame();
  const vetoCost = VETO_COSTS[bill.stakes] ?? 3;
  const risk = calculateOverrideRisk(state, bill);

  const handleVeto = () => {
    onVeto();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-[480px] max-w-[85vw] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "#faf8f5" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3" style={{ backgroundColor: "#0a1f14" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Presidential Action</p>
          <h3 className="text-sm font-bold text-red-400">Presidential Veto</h3>
          <div className="h-0.5 w-16 mt-1 rounded bg-red-500" />
        </div>

        <div className="p-5 space-y-4">
          <h4 className="text-base font-bold text-[#0a1f14] text-center">{bill.title}</h4>

          {/* Cost */}
          <div className="text-center">
            <span className="text-sm font-bold text-red-600">
              This will cost {vetoCost} Political Capital
            </span>
          </div>

          {/* Override risk */}
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-1">
              Override Risk
            </div>
            <div className="text-xs text-gray-700">
              Override probability: <b className={risk.probability > 50 ? "text-red-600" : "text-green-600"}>
                {risk.probability}%
              </b>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Opposition needs {risk.houseVotesShort} more House votes and {risk.senateVotesShort} more Senate votes for 2/3 majority.
            </div>
          </div>

          {/* Adviser warning */}
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-0.5">
              Legislative Adviser
            </p>
            <p className="text-xs text-gray-700 italic">
              {risk.probability > 50
                ? "Mr. President, I strongly advise against this veto. The opposition has the votes to override."
                : "Mr. President, vetoing this bill will cost political capital but the override risk is manageable."}
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-3.5 border-t border-gray-200">
          <button
            onClick={handleVeto}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-600 transition-all hover:bg-red-700 active:scale-[0.98]"
          >
            Veto Bill
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
