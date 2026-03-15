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

const severityColor: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

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

  // Build unified queue: cabal meeting first (if any), then filtered events
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

  const showAllTabs = activeTab === "villa" || activeTab === "cabinet";

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 w-full max-w-2xl">
        <h2 className="text-lg font-bold text-[#d4af37]">Decision Desk</h2>
        {totalCount > 0 && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 font-semibold">
            {totalCount} pending
          </span>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#e8dcc8]/40 text-sm italic">
            No pending matters, Mr. President
          </p>
        </div>
      ) : (
        <>
          {/* Dot indicators */}
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: totalCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === safeIndex ? "bg-[#d4af37]" : "bg-[#d4af37]/30"
                }`}
              />
            ))}
          </div>

          {/* Decision card */}
          <div className="relative w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCabal ? "cabal" : event?.id ?? safeIndex}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.25 }}
                className="bg-[#0f2b1a] border border-[#d4af37]/20 rounded-lg p-5"
              >
                {/* Severity + category badges */}
                <div className="flex gap-2 mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isCabal
                        ? "bg-purple-500/20 text-purple-300"
                        : `${severityColor[event?.severity ?? "info"]}/20 text-white`
                    }`}
                    style={
                      !isCabal && event
                        ? { backgroundColor: `var(--tw-${event.severity})` }
                        : undefined
                    }
                  >
                    {isCabal ? "CABAL" : event?.severity?.toUpperCase()}
                  </span>
                  {!isCabal && event && showAllTabs && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37]">
                      {event.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#e8dcc8] mb-2">
                  {isCabal ? cabal!.title : event?.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#e8dcc8]/70 mb-4 leading-relaxed">
                  {isCabal ? cabal!.brief : event?.description}
                </p>

                {/* Choices */}
                <div className="space-y-2">
                  {(isCabal ? cabal!.choices : event?.choices ?? []).map(
                    (choice, ci) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice(ci)}
                        className="w-full text-left px-3 py-2 rounded border border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-[#e8dcc8]">
                          {choice.label}
                        </span>
                        {"context" in choice && (
                          <span className="block text-xs text-[#e8dcc8]/50 mt-0.5">
                            {(choice as { context?: string }).context}
                          </span>
                        )}
                        {"summary" in choice && (
                          <span className="block text-xs text-[#e8dcc8]/50 mt-0.5">
                            {(choice as { summary?: string }).summary}
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>

                {/* Delegate link (events only) */}
                {!isCabal && event && (
                  <button
                    onClick={() => delegateToVP(event.id)}
                    className="mt-3 text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors"
                  >
                    Delegate to Vice President &#8599;
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
                      <span className="text-5xl font-black text-green-500/40 uppercase tracking-widest border-4 border-green-500/40 px-6 py-2 rounded-lg rotate-[-5deg]">
                        APPROVED
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {totalCount > 1 && (
              <div className="flex items-center justify-center gap-4 mt-3 text-sm">
                <button
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  disabled={safeIndex === 0}
                  className="text-[#d4af37] disabled:text-[#d4af37]/20"
                >
                  &larr; prev
                </button>
                <span className="text-[#e8dcc8]/50 text-xs">
                  {safeIndex + 1}/{totalCount}
                </span>
                <button
                  onClick={() => setCurrentIndex((p) => Math.min(totalCount - 1, p + 1))}
                  disabled={safeIndex === totalCount - 1}
                  className="text-[#d4af37] disabled:text-[#d4af37]/20"
                >
                  next &rarr;
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Proceed button */}
      <div className="mt-auto pt-4 w-full max-w-2xl">
        <button
          onClick={onProceed}
          disabled={!canProceed}
          title={!canProceed ? proceedDisabledReason : undefined}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-[#d4af37] to-[#b8960c] text-[#0a1f14] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
        >
          End Day &amp; Proceed
        </button>
      </div>
    </div>
  );
}
