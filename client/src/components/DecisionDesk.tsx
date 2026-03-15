import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../lib/GameContext";
import { filterDecisions } from "../lib/decisionFiltering";

interface DecisionDeskProps {
  activeTab: string;
  onProceed: () => void;
  canProceed: boolean;
  proceedDisabledReason: string;
  onNavigateToTab: (tab: string) => void;
}

export default function DecisionDesk({
  activeTab,
  onProceed,
  canProceed,
  proceedDisabledReason,
  onNavigateToTab: _onNavigateToTab,
}: DecisionDeskProps) {
  const { state, resolveEventChoice, resolveCabalChoice, delegateToVP } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStamp, setShowStamp] = useState(false);

  const filteredEvents = filterDecisions(state.activeEvents, activeTab);
  const cabal = state.cabalMeeting && !state.cabalMeeting.resolved ? state.cabalMeeting : null;

  const totalCount = filteredEvents.length + (cabal ? 1 : 0);
  const safeIndex = totalCount > 0 ? Math.min(currentIndex, totalCount - 1) : 0;
  const isCabal = cabal && safeIndex === 0;
  const event = isCabal ? null : filteredEvents[cabal ? safeIndex - 1 : safeIndex];

  const handleChoice = useCallback(
    (choiceIndex: number) => {
      if (isCabal) {
        resolveCabalChoice(choiceIndex);
      } else if (event) {
        resolveEventChoice(event.id, choiceIndex);
      }
      setShowStamp(true);
      setTimeout(() => {
        setShowStamp(false);
        setCurrentIndex((prev) => Math.max(0, Math.min(prev, totalCount - 2)));
      }, 2000);
    },
    [isCabal, event, resolveCabalChoice, resolveEventChoice, totalCount],
  );

  const title = isCabal ? cabal!.title : event?.title;
  const description = isCabal ? cabal!.brief : event?.description;
  const choices = isCabal ? cabal!.choices : event?.choices ?? [];

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-2 overflow-hidden">
      {/* Header row — title + count + nav arrows all inline */}
      <div className="flex items-center gap-2 w-full max-w-2xl mb-1">
        <h2 className="text-sm font-bold text-[#d4af37]">Decision Desk</h2>
        {totalCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/10 text-red-500 font-semibold">
            {totalCount}
          </span>
        )}
        {/* Navigation arrows inline in header */}
        {totalCount > 1 && (
          <div className="flex items-center gap-2 ml-auto text-xs">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={safeIndex === 0}
              className="text-[#d4af37] disabled:text-gray-300 px-1"
            >
              &#8592;
            </button>
            <span className="text-gray-400 text-[10px]">
              {safeIndex + 1}/{totalCount}
            </span>
            <button
              onClick={() => setCurrentIndex((p) => Math.min(totalCount - 1, p + 1))}
              disabled={safeIndex === totalCount - 1}
              className="text-[#d4af37] disabled:text-gray-300 px-1"
            >
              &#8594;
            </button>
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xs italic">
            No pending matters, Mr. President
          </p>
        </div>
      ) : (
        /* Decision card — compact */
        <div className="relative w-full max-w-2xl flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={isCabal ? "cabal" : event?.id ?? safeIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 h-full flex flex-col shadow-sm"
            >
              {/* Title */}
              <h3 className="text-sm font-bold text-[#0a1f14] mb-1 leading-snug">
                {title}
              </h3>

              {/* Description — compact */}
              <p className="text-xs text-gray-600 mb-2 leading-snug line-clamp-3">
                {description}
              </p>

              {/* Choices — tight spacing */}
              <div className="space-y-1 flex-1 min-h-0">
                {choices.map((choice, ci) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(ci)}
                    className="w-full text-left px-2.5 py-1.5 rounded border border-gray-200 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0a1f14] leading-snug">
                      {choice.label}
                    </span>
                    {"context" in choice && (choice as { context?: string }).context && (
                      <span className="block text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                        {(choice as { context?: string }).context}
                      </span>
                    )}
                    {"summary" in choice && (choice as { summary?: string }).summary && (
                      <span className="block text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                        {(choice as { summary?: string }).summary}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Delegate link (events only) */}
              {!isCabal && event && (
                <button
                  onClick={() => delegateToVP(event.id)}
                  className="mt-1.5 text-[10px] text-[#d4af37]/70 hover:text-[#d4af37] transition-colors text-left"
                >
                  Delegate to VP &#8599;
                </button>
              )}

              {/* Stamp overlay */}
              <AnimatePresence>
                {showStamp && (
                  <motion.div
                    initial={{ scale: 3, rotate: -15, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span className="text-4xl font-black text-green-500/40 uppercase tracking-widest border-4 border-green-500/40 px-4 py-1 rounded-lg rotate-[-5deg]">
                      APPROVED
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Proceed button — compact */}
      <div className="pt-2 w-full max-w-2xl shrink-0">
        <button
          onClick={onProceed}
          disabled={!canProceed}
          title={!canProceed ? proceedDisabledReason : undefined}
          className="w-full py-2 rounded-lg font-semibold text-xs transition-all bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-[#0a1f14] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
        >
          End Day &amp; Proceed
        </button>
      </div>
    </div>
  );
}
