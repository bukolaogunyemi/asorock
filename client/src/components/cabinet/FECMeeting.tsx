import { useState, useCallback } from "react";
import { useGame } from "@/lib/GameContext";
import type { FECMemo } from "@/lib/gameTypes";

type MeetingPhase = "agenda" | "reviewing" | "summary";

interface FECMeetingProps {
  memos: FECMemo[];
  onComplete: () => void;
}

const urgencyBadge = (urgency: FECMemo["urgency"]) => {
  switch (urgency) {
    case "urgent":
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">Urgent</span>;
    case "important":
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Important</span>;
    default:
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">Routine</span>;
  }
};

export function FECMeeting({ memos, onComplete }: FECMeetingProps) {
  const { resolveFECMemo, state } = useGame();
  const [phase, setPhase] = useState<MeetingPhase>("agenda");
  const [currentMemoIndex, setCurrentMemoIndex] = useState(0);
  const [decisions, setDecisions] = useState<Array<{ memo: FECMemo; choiceLabel: string }>>([]);

  const currentMemo = memos[currentMemoIndex] ?? null;

  const handleBeginMeeting = useCallback(() => {
    setPhase("reviewing");
    setCurrentMemoIndex(0);
  }, []);

  const handleChoiceClick = useCallback(
    (choiceIndex: number) => {
      if (!currentMemo) return;
      const choice = currentMemo.choices[choiceIndex];
      if (!choice) return;

      // Record decision for summary
      setDecisions((prev) => [...prev, { memo: currentMemo, choiceLabel: choice.label }]);

      // Dispatch to reducer to apply consequences
      resolveFECMemo(currentMemo.id, choiceIndex);

      // Advance to next memo or summary
      if (currentMemoIndex < memos.length - 1) {
        setCurrentMemoIndex((prev) => prev + 1);
      } else {
        setPhase("summary");
      }
    },
    [currentMemo, currentMemoIndex, memos.length, resolveFECMemo],
  );

  // Find minister name from state
  const getMinisterName = (ministerKey: string): string => {
    const char = state.characters[ministerKey];
    return char?.name ?? ministerKey;
  };

  // --- Agenda Phase ---
  if (phase === "agenda") {
    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="bg-[#0a1f14] px-6 py-5 rounded-t-xl">
          <h2 className="text-[#d4af37] text-lg font-bold tracking-wide">
            Federal Executive Council Meeting
          </h2>
          <p className="text-[#d4af37]/60 text-xs mt-1">
            {memos.length} memo{memos.length !== 1 ? "s" : ""} on the agenda
          </p>
        </div>

        {/* Memo list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {memos.map((memo, idx) => (
            <div
              key={memo.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-[#faf8f5]"
            >
              <span className="text-xs font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0a1f14] truncate">{memo.title}</p>
                <p className="text-xs text-gray-500 truncate">
                  {getMinisterName(memo.ministerKey)} &mdash; {memo.portfolio}
                </p>
              </div>
              {urgencyBadge(memo.urgency)}
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleBeginMeeting}
            className="w-full py-3 rounded-lg bg-[#d4af37] text-white text-sm font-bold hover:bg-[#b8962e] transition-colors"
          >
            Begin Meeting
          </button>
        </div>
      </div>
    );
  }

  // --- Reviewing Phase ---
  if (phase === "reviewing" && currentMemo) {
    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="bg-[#0a1f14] px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-[#d4af37] text-lg font-bold tracking-wide truncate">
              {currentMemo.title}
            </h2>
            <span className="text-[#d4af37]/60 text-xs font-medium shrink-0 ml-3">
              Memo {currentMemoIndex + 1} of {memos.length}
            </span>
          </div>
          <p className="text-[#d4af37]/70 text-xs mt-1">
            Presented by {getMinisterName(currentMemo.ministerKey)} &mdash; {currentMemo.portfolio}
          </p>
        </div>

        {/* Memo body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-2">
            {urgencyBadge(currentMemo.urgency)}
            <span className="text-xs text-gray-400">Sector: {currentMemo.sectorAffected}</span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {currentMemo.description}
          </p>

          {/* Presidential Response */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0a1f14] mb-3">
              Presidential Response
            </h3>
            <div className="space-y-2">
              {currentMemo.choices.map((choice, idx) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(idx)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-[#faf8f5] hover:border-[#d4af37] hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-semibold text-[#0a1f14] group-hover:text-[#b8962e]">
                    {choice.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{choice.context}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-[#d4af37] transition-all duration-300"
              style={{ width: `${((currentMemoIndex + 1) / memos.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Summary Phase ---
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="bg-[#0a1f14] px-6 py-5 rounded-t-xl">
        <h2 className="text-[#d4af37] text-lg font-bold tracking-wide">Meeting Concluded</h2>
        <p className="text-[#d4af37]/60 text-xs mt-1">
          {decisions.length} decision{decisions.length !== 1 ? "s" : ""} made
        </p>
      </div>

      {/* Decisions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {decisions.map((d, idx) => (
          <div
            key={idx}
            className="px-4 py-3 rounded-lg border border-gray-200 bg-[#faf8f5]"
          >
            <p className="text-sm font-semibold text-[#0a1f14]">{d.memo.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Decision: <span className="text-[#0a1f14] font-medium">{d.choiceLabel}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onComplete}
          className="w-full py-3 rounded-lg bg-[#0a1f14] text-[#d4af37] text-sm font-bold hover:bg-[#1a3a24] transition-colors"
        >
          Return to Cabinet
        </button>
      </div>
    </div>
  );
}
