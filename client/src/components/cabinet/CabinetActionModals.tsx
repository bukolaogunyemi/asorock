import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import { ministryPositions } from "@/lib/gameData";

/* ─── Reassign Modal ─── */

interface ReassignModalProps {
  ministerName: string;
  currentPortfolio: string;
  onClose: () => void;
}

export function ReassignModal({ ministerName, currentPortfolio, onClose }: ReassignModalProps) {
  const { state, reassignMinister } = useGame();
  const [selected, setSelected] = useState("");

  const availablePortfolios = ministryPositions.filter((p) => p !== currentPortfolio);

  function occupantOf(portfolio: string): string | null {
    return state.cabinetAppointments[portfolio] ?? null;
  }

  function handleReassign() {
    if (!selected) return;
    reassignMinister(ministerName, selected);
    onClose();
  }

  const occupant = selected ? occupantOf(selected) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a1f14] px-6 py-4">
          <h2 className="text-lg font-bold text-[#d4af37]">Reassign Minister</h2>
          <p className="text-sm text-white/80 mt-0.5">{ministerName}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="text-sm text-gray-500">
            Currently serving as <span className="font-semibold text-gray-800">{currentPortfolio}</span>
          </div>

          {/* Portfolio selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Portfolio
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none"
            >
              <option value="">Select a portfolio...</option>
              {availablePortfolios.map((p) => {
                const occ = occupantOf(p);
                return (
                  <option key={p} value={p}>
                    {p}{occ ? ` (${occ})` : " (Vacant)"}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Swap warning */}
          {occupant && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <span className="font-semibold">{occupant}</span> currently holds{" "}
              <span className="font-semibold">{selected}</span> and will be swapped to{" "}
              <span className="font-semibold">{currentPortfolio}</span>.
            </div>
          )}

          {/* Cost notice */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
            Cost: <span className="font-semibold text-gray-800">8 Political Capital</span>
            <span className="ml-2 text-gray-400">
              (Current: {state.politicalCapital})
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={!selected || state.politicalCapital < 8}
              className="flex-1 rounded-lg bg-[#0a1f14] px-4 py-2.5 text-sm font-semibold text-[#d4af37] hover:bg-[#0d2a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reassign (8 PC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dismiss Modal ─── */

interface DismissModalProps {
  ministerName: string;
  portfolio: string;
  onClose: () => void;
}

export function DismissModal({ ministerName, portfolio, onClose }: DismissModalProps) {
  const { state, dismissMinister } = useGame();
  const character = state.characters[ministerName];
  const factionName = character?.faction ?? "Unknown";

  function handleDismiss() {
    dismissMinister(ministerName);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Demand Resignation</h2>
          <p className="text-sm text-red-100 mt-0.5">{ministerName} — {portfolio}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Warning */}
          <p className="text-sm text-gray-600">
            This action will remove <span className="font-semibold text-gray-800">{ministerName}</span> from
            the cabinet. The following consequences will take effect immediately:
          </p>

          {/* Consequences */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm">
              <span className="text-red-500 font-bold">-2</span>
              <span className="text-red-800">Approval rating impact</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm">
              <span className="text-red-500 font-bold">-5</span>
              <span className="text-red-800">Loyalty of {factionName} faction members</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm">
              <span className="text-amber-600 font-semibold">!</span>
              <span className="text-amber-800">{portfolio} will be vacant</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Confirm Dismissal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
