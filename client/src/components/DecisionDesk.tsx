import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../lib/GameContext";
import { filterDecisions } from "../lib/decisionFiltering";
import { AppointmentModal, type AppointmentModalCandidate } from "./AppointmentModal";
import { cabinetCandidates, type MinistryPosition } from "../lib/gameData";
import type { ActiveEvent } from "../lib/gameTypes";

interface DecisionDeskProps {
  activeTab: string;
  onNavigateToTab: (tab: string) => void;
}

export default function DecisionDesk({
  activeTab,
  onNavigateToTab: _onNavigateToTab,
}: DecisionDeskProps) {
  const { state, resolveEventChoice, resolveCabalChoice, delegateToVP, delegateToCOS } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStamp, setShowStamp] = useState(false);
  const [reviewingAppointment, setReviewingAppointment] = useState<ActiveEvent | null>(null);

  const filteredEvents = filterDecisions(state.activeEvents, activeTab);
  const cabal = state.cabalMeeting && !state.cabalMeeting.resolved ? state.cabalMeeting : null;

  const totalCount = filteredEvents.length + (cabal ? 1 : 0);
  const safeIndex = totalCount > 0 ? Math.min(currentIndex, totalCount - 1) : 0;
  const isCabal = cabal && safeIndex === 0;
  const event = isCabal ? null : filteredEvents[cabal ? safeIndex - 1 : safeIndex];

  const isAppointment = !isCabal && event?.source === "cabinet-appointment";

  // Adapt CabinetCandidate[] → AppointmentModalCandidate[]
  const modalCandidates = useMemo((): AppointmentModalCandidate[] => {
    if (!reviewingAppointment?.cabinetPortfolio) return [];
    const portfolio = reviewingAppointment.cabinetPortfolio as MinistryPosition;
    const raw = cabinetCandidates[portfolio] ?? [];
    return raw.map((c, i) => ({
      name: c.name,
      avatar: c.avatar,
      age: c.age,
      state: c.state,
      gender: c.gender,
      faction: c.faction,
      scandalRisk: c.scandalRisk,
      note: c.tradeOff,
      stats: [
        { label: "Loyalty", value: c.loyalty },
        { label: "Competence", value: c.competence },
        { label: "Ambition", value: c.ambition },
      ],
      impacts: reviewingAppointment.choices[i]?.consequences?.map(con => con.description) ?? [],
    }));
  }, [reviewingAppointment]);

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

  const handleAppointmentSelect = useCallback(
    (choiceIndex: number) => {
      if (reviewingAppointment) {
        resolveEventChoice(reviewingAppointment.id, choiceIndex);
        setReviewingAppointment(null);
        setShowStamp(true);
        setTimeout(() => {
          setShowStamp(false);
          setCurrentIndex((prev) => Math.max(0, Math.min(prev, totalCount - 2)));
        }, 2000);
      }
    },
    [reviewingAppointment, resolveEventChoice, totalCount],
  );

  const title = isCabal ? cabal!.title : event?.title;
  const description = isCabal ? cabal!.brief : event?.description;
  const choices = isCabal ? cabal!.choices : event?.choices ?? [];

  return (
    <div className="flex-1 flex flex-col px-3 py-2 overflow-hidden">
      {/* Header row — title + count + nav arrows all inline */}
      <div className="flex items-center gap-2 w-full mb-1 shrink-0">
        <h2 className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider">Decision Desk</h2>
        {totalCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/10 text-red-500 font-semibold">
            {totalCount}
          </span>
        )}
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
        <div className="relative w-full flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={isCabal ? "cabal" : event?.id ?? safeIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-1 flex flex-col shadow-sm min-h-0"
            >
              {/* Title */}
              <h3 className="text-base font-bold text-[#0a1f14] mb-1 leading-snug line-clamp-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-5">
                {description}
              </p>

              {/* Appointment events — special UI */}
              {isAppointment && event ? (
                <div className="grid gap-1.5 content-start grid-cols-2">
                  <button
                    onClick={() => setReviewingAppointment(event)}
                    className="text-left px-2.5 py-2 rounded-md border-2 border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 transition-colors col-span-2"
                  >
                    <span className="text-xs font-semibold text-[#0a1f14] leading-snug">
                      Review Candidates
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {choices.length} candidates available
                    </span>
                  </button>
                  <button
                    onClick={() => delegateToVP(event.id)}
                    className="text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0a1f14] leading-snug">
                      Delegate to VP
                    </span>
                  </button>
                  <button
                    onClick={() => delegateToCOS(event.id)}
                    className="text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0a1f14] leading-snug">
                      Delegate to CoS
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Regular choices */}
                  <div className={`grid gap-1.5 content-start ${choices.length >= 4 ? "grid-cols-2" : "grid-cols-2"}`}>
                    {choices.map((choice, ci) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice(ci)}
                        className={`text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors ${choices.length === 3 && ci === 2 ? "col-span-2" : ""}`}
                      >
                        <span className="text-xs font-medium text-[#0a1f14] leading-snug line-clamp-2">
                          {choice.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Delegate row */}
                  {!isCabal && event && (
                    <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-gray-100 shrink-0">
                      <span className="text-[10px] text-gray-400">Delegate:</span>
                      <button
                        onClick={() => delegateToVP(event.id)}
                        className="text-[10px] font-medium text-[#d4af37]/80 hover:text-[#d4af37] transition-colors"
                      >
                        Vice President &#8599;
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => delegateToCOS(event.id)}
                        className="text-[10px] font-medium text-[#d4af37]/80 hover:text-[#d4af37] transition-colors"
                      >
                        Chief of Staff &#8599;
                      </button>
                    </div>
                  )}
                </>
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

      {/* Shared appointment modal */}
      {reviewingAppointment && modalCandidates.length > 0 && (
        <AppointmentModal
          title={reviewingAppointment.title}
          headerLabel="Review Candidates"
          candidates={modalCandidates}
          onSelect={handleAppointmentSelect}
          onCancel={() => setReviewingAppointment(null)}
        />
      )}
    </div>
  );
}
