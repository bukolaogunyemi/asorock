import type { BillStage } from "@/lib/legislativeTypes";

const STAGES: BillStage[] = ["introduction", "committee", "floor-debate", "vote"];
const TERMINAL_STAGES: BillStage[] = ["passed", "failed", "stalled", "vetoed", "signed"];

function stageIndex(stage: BillStage): number {
  const idx = STAGES.indexOf(stage);
  if (idx >= 0) return idx;
  if (TERMINAL_STAGES.includes(stage)) return 4;
  return 0;
}

function getDotState(dotIndex: number, currentStageIdx: number): "done" | "current" | "pending" {
  if (dotIndex < currentStageIdx) return "done";
  if (dotIndex === currentStageIdx) return "current";
  return "pending";
}

const DOT_STYLES = {
  done: "bg-green-500",
  current: "bg-[#d4af37] shadow-[0_0_0_2px_rgba(212,175,55,0.4)]",
  pending: "bg-gray-200",
};

const LINE_STYLES = {
  done: "bg-green-500",
  pending: "bg-gray-200",
};

interface BillProgressDotsProps {
  houseStage: BillStage;
  senateStage: BillStage;
}

export function BillProgressDots({ houseStage, senateStage }: BillProgressDotsProps) {
  const houseIdx = stageIndex(houseStage);
  const senateIdx = stageIndex(senateStage);

  const renderTrack = (label: string, currentIdx: number) => (
    <div className="flex items-center gap-0.5 mt-1">
      <span className="text-[9px] text-gray-400 w-7 shrink-0">{label}</span>
      {STAGES.map((_, i) => {
        const state = getDotState(i, currentIdx);
        const lineState = i < currentIdx ? "done" : "pending";
        return (
          <span key={i} className="contents">
            <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${DOT_STYLES[state]}`} />
            {i < STAGES.length - 1 && (
              <span className={`flex-1 h-[1.5px] ${LINE_STYLES[lineState]}`} />
            )}
          </span>
        );
      })}
    </div>
  );

  return (
    <div>
      {renderTrack("House", houseIdx)}
      {renderTrack("Senate", senateIdx)}
    </div>
  );
}
