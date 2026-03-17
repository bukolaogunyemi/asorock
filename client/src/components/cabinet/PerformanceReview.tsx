import { useGame } from "@/lib/GameContext";
import { averageProfessionalCompetence } from "@/lib/competencyUtils";

interface PerformanceReviewProps {
  ministerName: string;
  portfolio: string;
  onClose: () => void;
}

export function PerformanceReview({ ministerName, portfolio, onClose }: PerformanceReviewProps) {
  const { state, reviewMinister } = useGame();
  const character = state.characters[ministerName];
  const status = state.ministerStatuses[ministerName];

  if (!character) return null;

  const tenure = status ? state.day - status.appointmentDay : 0;
  const performance = averageProfessionalCompetence(character.competencies);
  const onProbation = status?.onProbation ?? false;

  const perfColor =
    performance >= 60 ? "bg-green-500" : performance >= 35 ? "bg-amber-500" : "bg-red-500";

  function handleAction(action: "commend" | "warn" | "probation") {
    reviewMinister(ministerName, action);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a1f14] px-6 py-4">
          <h2 className="text-lg font-bold text-[#d4af37]">
            Performance Review
          </h2>
          <p className="text-sm text-white/80 mt-0.5">{ministerName}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Info row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Portfolio</span>
            <span className="font-medium text-gray-800">{portfolio}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Tenure</span>
            <span className="font-medium text-gray-800">{tenure} days in office</span>
          </div>

          {/* Performance bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Performance</span>
              <span className="font-semibold text-gray-800">{performance}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${perfColor}`}
                style={{ width: `${performance}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                onProbation
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {onProbation ? "On Probation" : "Active"}
            </span>
          </div>

          {/* Loyalty / Relationship */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Loyalty</span>
            <span className="font-medium text-gray-800">{character.loyalty} ({character.relationship})</span>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleAction("commend")}
              className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Commend
              <span className="block text-xs font-normal text-green-200 mt-0.5">
                Boost morale and strengthen relationship
              </span>
            </button>

            <button
              onClick={() => handleAction("warn")}
              className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              Warn
              <span className="block text-xs font-normal text-amber-100 mt-0.5">
                Express dissatisfaction with performance
              </span>
            </button>

            <button
              onClick={() => handleAction("probation")}
              className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Put on Probation
              <span className="block text-xs font-normal text-red-200 mt-0.5">
                Formal warning — must improve or face dismissal
              </span>
            </button>
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
