import { useGame } from "@/lib/GameContext";
import {
  PORTFOLIO_SECTOR_MAP,
  STATUS_CONFIG,
  computeMinisterPerformance,
  computeMinisterStatus,
  relationshipToScore,
} from "@/lib/cabinetSystem";

interface MinisterDetailPanelProps {
  ministerName: string;
  portfolio: string;
  onClose: () => void;
  onSummon: () => void;
  onDirective: () => void;
  onReview: () => void;
  onReassign: () => void;
  onDismiss: () => void;
  onViewProfile: () => void;
}

function getSectorHealth(state: any, portfolio: string): number | null {
  const sectorKey = PORTFOLIO_SECTOR_MAP[portfolio];
  if (!sectorKey) return null;
  const sector = state[sectorKey];
  return sector?.health ?? 50;
}

function getCompetenceAvg(state: any, characterName: string): number {
  const char = state.characters[characterName];
  if (!char?.competencies?.professional) return 50;
  const profs = Object.values(char.competencies.professional) as number[];
  if (profs.length === 0) return 50;
  return profs.reduce((a, b) => a + b, 0) / profs.length;
}

export default function MinisterDetailPanel({
  ministerName,
  portfolio,
  onClose,
  onSummon,
  onDirective,
  onReview,
  onReassign,
  onDismiss,
  onViewProfile,
}: MinisterDetailPanelProps) {
  const { state } = useGame();
  const char = state.characters[ministerName];
  if (!char) return null;

  const ms = state.ministerStatuses?.[ministerName];
  const sectorHealth = getSectorHealth(state, portfolio);
  const competenceAvg = getCompetenceAvg(state, ministerName);
  const relScore = relationshipToScore(char.relationship);
  const performance = computeMinisterPerformance(sectorHealth, competenceAvg, relScore);
  const status = computeMinisterStatus(
    sectorHealth ?? 50,
    relScore,
    ms?.onProbation ?? false,
    ms?.appointmentDay ?? 0,
    state.day,
  );
  const statusConfig = STATUS_CONFIG[status];
  const appointmentDay = ms?.appointmentDay ?? 0;
  const daysInOffice = Math.max(0, state.day - appointmentDay);

  const sectorKey = PORTFOLIO_SECTOR_MAP[portfolio];

  const perfBarColor =
    performance >= 60 ? "bg-green-400" : performance >= 35 ? "bg-amber-400" : "bg-red-400";
  const healthBarColor =
    sectorHealth !== null
      ? sectorHealth >= 60
        ? "bg-green-400"
        : sectorHealth >= 35
          ? "bg-amber-400"
          : "bg-red-400"
      : "bg-gray-300";

  return (
    <div className="w-[320px] shrink-0 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      {/* Close button */}
      <div className="flex justify-end p-2">
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0a1f14] hover:bg-gray-100 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Header: Avatar, Name, Portfolio */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#d4af37] bg-[#0a1f14] flex items-center justify-center text-3xl mb-2">
            {char.avatar}
          </div>
          <h2 className="text-base font-bold text-[#0a1f14]">{ministerName}</h2>
          <p className="text-xs text-gray-500">{portfolio}</p>
        </div>

        {/* Demographics */}
        <div className="flex justify-center gap-3 text-[10px] text-gray-500">
          {char.age && <span>Age {char.age}</span>}
          {char.state && <span>{char.state}</span>}
          {char.gender && <span>{char.gender}</span>}
        </div>

        {/* Faction & Traits */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-white text-[10px] font-semibold">
            {char.faction}
          </span>
          {char.traits.map((trait) => (
            <span
              key={trait}
              className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#0a1f14] text-[10px] font-medium"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Tenure */}
        <div className="bg-[#faf8f5] rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
            Tenure
          </p>
          <p className="text-xs text-[#0a1f14]">
            Appointed Day {appointmentDay} &middot; {daysInOffice} days in office
          </p>
        </div>

        {/* Performance */}
        <div className="bg-[#faf8f5] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Performance
            </p>
            <span className={`text-[10px] font-semibold ${statusConfig.color}`}>{status}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${perfBarColor} rounded-full transition-all`}
              style={{ width: `${performance}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right">{Math.round(performance)}%</p>
        </div>

        {/* Sector Health */}
        {sectorKey && sectorHealth !== null && (
          <div className="bg-[#faf8f5] rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
              Sector Health &mdash; {sectorKey}
            </p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${healthBarColor} rounded-full transition-all`}
                style={{ width: `${sectorHealth}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right">{Math.round(sectorHealth)}%</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onSummon}
            className="w-full py-2 rounded-lg bg-[#d4af37] text-white text-xs font-bold hover:bg-[#b8962e] transition-colors"
          >
            Summon for Briefing
          </button>
          <button
            onClick={onDirective}
            className="w-full py-2 rounded-lg bg-[#0a1f14] text-[#d4af37] text-xs font-bold hover:bg-[#1a3a24] transition-colors"
          >
            Issue Directive
          </button>
          <button
            onClick={onReview}
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:border-[#d4af37] hover:text-[#0a1f14] transition-colors"
          >
            Performance Review
          </button>
          <button
            onClick={onReassign}
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:border-[#d4af37] hover:text-[#0a1f14] transition-colors"
          >
            Reassign Portfolio
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2 rounded-lg border border-red-300 text-red-500 text-xs font-medium hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            Demand Resignation
          </button>
          <button
            onClick={onViewProfile}
            className="w-full py-1 text-[#d4af37] text-xs font-medium hover:underline transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
