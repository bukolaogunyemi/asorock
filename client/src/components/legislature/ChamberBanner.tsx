import { useGame } from "@/lib/GameContext";
import { DotSemicircle, HOUSE_BLOCS, SENATE_BLOCS } from "./DotSemicircle";
import { VoteThresholdBar, PartyCompositionBar } from "./VoteThresholdBar";
import { CharacterAvatar } from "../CharacterAvatar";
import { CompetencyBar } from "../CompetencyBar";
import type { Bill } from "@/lib/legislativeTypes";

interface ChamberBannerProps {
  selectedBill: Bill | null;
  onCharacterClick?: (characterKey: string) => void;
}

export function ChamberBanner({ selectedBill, onCharacterClick }: ChamberBannerProps) {
  const { state } = useGame();
  const legislature = state.legislature;

  const speaker = state.constitutionalOfficers.find((o) => o.portfolio === "Speaker of the House");
  const deputySpeaker = state.constitutionalOfficers.find((o) => o.portfolio === "Deputy Speaker");
  const senatePresident = state.constitutionalOfficers.find((o) => o.portfolio === "Senate President");
  const deputySenatePresident = state.constitutionalOfficers.find(
    (o) => o.portfolio === "Deputy Senate President",
  );

  const stats = legislature?.sessionStats;

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Chambers side-by-side */}
      <div className="flex gap-4 px-4 pt-3">
        {/* House */}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold text-center mb-1">
            House of Representatives &mdash; 360
          </div>
          <DotSemicircle
            totalSeats={360}
            blocs={HOUSE_BLOCS}
            voteProjection={selectedBill ? selectedBill.houseSupport : undefined}
          />
          {selectedBill ? (
            <VoteThresholdBar chamber="house" voteProjection={selectedBill.houseSupport} />
          ) : (
            <PartyCompositionBar chamber="house" />
          )}
          {/* Leader cards */}
          <div className="flex gap-2 mt-2 px-1">
            {speaker && (
              <LeaderCard
                officer={speaker}
                title="Speaker"
                onClick={() => onCharacterClick?.(speaker.name)}
              />
            )}
            {deputySpeaker && (
              <LeaderCard
                officer={deputySpeaker}
                title="Deputy Speaker"
                onClick={() => onCharacterClick?.(deputySpeaker.name)}
              />
            )}
          </div>
        </div>

        {/* Senate */}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold text-center mb-1">
            Senate &mdash; 109
          </div>
          <DotSemicircle
            totalSeats={109}
            blocs={SENATE_BLOCS}
            voteProjection={selectedBill ? selectedBill.senateSupport : undefined}
          />
          {selectedBill ? (
            <VoteThresholdBar chamber="senate" voteProjection={selectedBill.senateSupport} />
          ) : (
            <PartyCompositionBar chamber="senate" />
          )}
          {/* Leader cards */}
          <div className="flex gap-2 mt-2 px-1">
            {senatePresident && (
              <LeaderCard
                officer={senatePresident}
                title="President"
                onClick={() => onCharacterClick?.(senatePresident.name)}
              />
            )}
            {deputySenatePresident && (
              <LeaderCard
                officer={deputySenatePresident}
                title="Deputy President"
                onClick={() => onCharacterClick?.(deputySenatePresident.name)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats ribbon */}
      <div className="flex items-center gap-4 px-4 py-2 mt-2 border-t border-gray-100">
        {/* Party legend */}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {HOUSE_BLOCS.map((bloc) => (
            <span key={bloc.name} className="flex items-center gap-1 text-[9px] text-gray-500">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: bloc.color }}
              />
              {bloc.name}
            </span>
          ))}
        </div>

        {/* Party loyalty */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[9px] text-gray-500">Loyalty</span>
          <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${state.partyLoyalty ?? 70}%`, backgroundColor: "#d4af37" }}
            />
          </div>
          <span className="text-[9px] font-bold" style={{ color: "#d4af37" }}>
            {state.partyLoyalty ?? 70}%
          </span>
        </div>

        {/* Session stats */}
        {stats && (
          <div className="flex gap-2 ml-4">
            <MiniStat value={stats.billsIntroduced} label="Intro" />
            <MiniStat value={stats.billsPassed} label="Pass" color="#22c55e" />
            <MiniStat value={stats.billsVetoed} label="Veto" color="#ef4444" />
            <MiniStat value={legislature?.activeBills.length ?? 0} label="Active" color="#d4af37" />
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderCard({
  officer,
  title,
  onClick,
}: {
  officer: { name: string; avatar: string; gender: string; loyalty: number; competence: number };
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center gap-1.5 p-1.5 rounded-lg border border-gray-200 hover:border-[#d4af37]/50 hover:shadow-md transition-all text-left"
    >
      <div className="w-7 h-7 shrink-0">
        <CharacterAvatar
          name={officer.name}
          initials={officer.avatar}
          size="sm"
          gender={officer.gender}
          role={title}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-[#0a1f14] truncate hover:underline">
          {officer.name}
        </div>
        <div className="text-[9px] text-[#d4af37]">{title}</div>
        <div className="flex gap-1.5 mt-0.5">
          <MiniBar label="Loy" value={officer.loyalty} color="#d4af37" />
          <MiniBar label="Comp" value={officer.competence} color="#22c55e" />
        </div>
      </div>
    </button>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="text-[7px] text-gray-400">{label}</div>
      <div className="h-[3px] bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MiniStat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs font-bold" style={{ color: color ?? "#0a1f14" }}>
        {value}
      </div>
      <div className="text-[7px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}
