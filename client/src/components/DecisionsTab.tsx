import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/GameContext";
import { getChainById } from "@/lib/eventChains";
import { AppointmentModal, type AppointmentModalCandidate } from "./AppointmentModal";
import { cabinetCandidates, type MinistryPosition } from "@/lib/gameData";
import type { ActiveEvent } from "@/lib/gameTypes";

// ── Category & severity styling ──

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  economy: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-l-emerald-500" },
  security: { bg: "bg-red-50", text: "text-red-700", border: "border-l-red-500" },
  politics: { bg: "bg-purple-50", text: "text-purple-700", border: "border-l-purple-500" },
  governance: { bg: "bg-blue-50", text: "text-blue-700", border: "border-l-blue-500" },
  diplomacy: { bg: "bg-amber-50", text: "text-amber-700", border: "border-l-amber-500" },
  media: { bg: "bg-pink-50", text: "text-pink-700", border: "border-l-pink-500" },
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

const CHAIN_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  crisis: { bg: "bg-red-50", text: "text-red-700" },
  opportunity: { bg: "bg-emerald-50", text: "text-emerald-700" },
  intrigue: { bg: "bg-purple-50", text: "text-purple-700" },
};

const HISTORY_CATEGORY_ICON: Record<string, string> = {
  decision: "\u{1F4CB}",   // 📋
  event: "\u26A1",          // ⚡
  cabal: "\u{1F91D}",      // 🤝
  chain: "\u{1F517}",      // 🔗
  "quick-action": "\u{1F4DC}", // 📜
  system: "\u2699",         // ⚙
  inbox: "\u{1F4E8}",      // 📨
  court: "\u2696",          // ⚖
  hook: "\u{1F50C}",       // 🔌
};

/** Return 1-2 contextual metric strings for a decision's category */
function getCategoryMetrics(category: string, state: Record<string, unknown>): string[] {
  const eco = state.economy as { inflation?: number; fxRate?: number } | undefined;
  switch (category) {
    case "economy":
      return [
        eco?.inflation != null ? `Inflation: ${eco.inflation.toFixed(1)}%` : "",
        eco?.fxRate != null ? `FX: \u20A6${Math.round(eco.fxRate)}` : "",
      ].filter(Boolean);
    case "security":
      return [
        state.stability != null ? `Stability: ${Math.round(state.stability as number)}` : "",
      ].filter(Boolean);
    case "politics":
      return [
        state.approval != null ? `Approval: ${Math.round(state.approval as number)}%` : "",
        state.partyLoyalty != null ? `Party: ${Math.round(state.partyLoyalty as number)}` : "",
      ].filter(Boolean);
    case "diplomacy":
      return [
        state.internationalStanding != null ? `Standing: ${Math.round(state.internationalStanding as number)}` : "",
      ].filter(Boolean);
    case "governance":
      return [
        state.trust != null ? `Trust: ${Math.round(state.trust as number)}` : "",
      ].filter(Boolean);
    default:
      return [];
  }
}

const formatRequirements = (requirements?: { metric: string; min?: number; max?: number }[]) => {
  if (!requirements?.length) return null;
  return requirements.map((r) => {
    if (r.min !== undefined) return `${r.metric} \u2265 ${r.min}`;
    if (r.max !== undefined) return `${r.metric} \u2264 ${r.max}`;
    return r.metric;
  }).join(" \u2022 ");
};

// Unified item type for the carousel — either a cabal meeting or an active event
type DeskItem =
  | { kind: "cabal" }
  | { kind: "event"; event: ActiveEvent };

export default function DecisionsTab() {
  const {
    state,
    canResolveChoice,
    resolveChainChoice,
    resolveEventChoice,
    resolveCabalChoice,
    delegateToVP,
    delegateToCOS,
  } = useGame();

  const [showStamp, setShowStamp] = useState(false);
  const [reviewingAppointment, setReviewingAppointment] = useState<ActiveEvent | null>(null);

  const stateRecord = state as unknown as Record<string, unknown>;

  // ── Active event chains ──
  const activeChains = useMemo(() => state.activeChains
    .filter((instance) => !instance.resolved)
    .map((instance) => {
      const chain = getChainById(instance.chainId);
      if (!chain) return null;
      const currentStep = chain.steps[instance.currentStepIndex] ?? chain.steps[0];
      return { instance, chain, currentStep, totalSteps: chain.steps.length };
    })
    .filter(Boolean), [state.activeChains]) as {
      instance: { chainId: string; currentStepIndex: number; startedDay: number; resolved: boolean };
      chain: NonNullable<ReturnType<typeof getChainById>>;
      currentStep: NonNullable<ReturnType<typeof getChainById>>["steps"][number];
      totalSteps: number;
    }[];

  // ── Cabal meeting ──
  const cabal = state.cabalMeeting && !state.cabalMeeting.resolved ? state.cabalMeeting : null;

  // ── Unified desk items: cabal first, then active events ──
  const deskItems = useMemo((): DeskItem[] => {
    const items: DeskItem[] = [];
    if (cabal) items.push({ kind: "cabal" });
    for (const event of state.activeEvents) {
      items.push({ kind: "event", event });
    }
    return items;
  }, [cabal, state.activeEvents]);

  // ── Decision history from turnLog ──
  const recentHistory = useMemo(() => {
    const relevant = state.turnLog.filter(
      (e) => e.category === "decision" || e.category === "event" || e.category === "cabal" || e.category === "chain"
    );
    return relevant.slice(-5).reverse();
  }, [state.turnLog]);

  // ── Appointment modal candidates ──
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

  const animateStamp = useCallback(() => {
    setShowStamp(true);
    setTimeout(() => setShowStamp(false), 1800);
  }, []);

  const handleEventChoice = useCallback((eventId: string, choiceIndex: number) => {
    resolveEventChoice(eventId, choiceIndex);
    animateStamp();
  }, [resolveEventChoice, animateStamp]);

  const handleCabalChoice = useCallback((choiceIndex: number) => {
    resolveCabalChoice(choiceIndex);
    animateStamp();
  }, [resolveCabalChoice, animateStamp]);

  const handleAppointmentSelect = useCallback((choiceIndex: number) => {
    if (reviewingAppointment) {
      resolveEventChoice(reviewingAppointment.id, choiceIndex);
      setReviewingAppointment(null);
      animateStamp();
    }
  }, [reviewingAppointment, resolveEventChoice, animateStamp]);

  return (
    <div className="space-y-4">
      {/* ── Event Chains ── */}
      {activeChains.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wider flex items-center gap-2">
              Active Event Chains
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#d4af37] text-white font-bold leading-none">
                {activeChains.length}
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {activeChains.map((current) => {
              const catColors = CHAIN_CATEGORY_COLORS[current.chain.category];
              return (
                <div key={current.instance.chainId} className="border border-gray-200 rounded-lg border-l-[3px] border-l-amber-500 p-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded ${catColors?.bg ?? "bg-gray-100"} ${catColors?.text ?? "text-gray-600"}`}>
                      {current.chain.category}
                    </span>
                    <span className="text-sm font-bold text-[#0a1f14]">{current.chain.title}</span>
                  </div>
                  {/* Step progress */}
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: current.totalSteps }, (_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i < current.instance.currentStepIndex ? "bg-green-500" : i === current.instance.currentStepIndex ? "bg-amber-500" : "bg-gray-200"}`} />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1 tabular-nums">{current.instance.currentStepIndex + 1}/{current.totalSteps}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{current.currentStep.narrative}</p>
                  <div className="flex flex-col gap-1.5">
                    {current.currentStep.choices.map((choice, ci) => {
                      const enabled = canResolveChoice(choice.requirements);
                      return (
                        <div key={`${current.instance.chainId}-${ci}`}>
                          <button
                            data-testid={`chain-${current.instance.chainId}-choice-${ci}`}
                            disabled={!enabled}
                            onClick={() => {
                              resolveChainChoice(current.instance.chainId, ci);
                              animateStamp();
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-xs font-medium text-[#0a1f14] leading-snug">{choice.label}</span>
                          </button>
                          {!enabled && choice.requirements && (
                            <p className="text-[10px] text-gray-400 mt-0.5 ml-1">Requires {formatRequirements(choice.requirements)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── The President's Desk — unified cabal + active events ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" data-testid="decisions-active-events">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wider flex items-center gap-2">
            The President&apos;s Desk
            {deskItems.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/10 text-red-500 font-bold leading-none">
                {deskItems.length}
              </span>
            )}
          </h3>
        </div>

        {deskItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400 text-xs italic">The desk is clear for now, Mr. President.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3 relative">
            {deskItems.map((item) => {
              // ── Cabal meeting item ──
              if (item.kind === "cabal" && cabal) {
                return (
                  <div
                    key="cabal"
                    className="border border-gray-200 rounded-lg border-l-[3px] border-l-[#d4af37]"
                  >
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded bg-[#d4af37]/15 text-[#d4af37]">
                            Cabal Meeting
                          </span>
                          <span className="text-[9px] font-semibold text-red-500 uppercase">Urgent</span>
                        </div>
                        <h3 className="text-base font-bold text-[#0a1f14] mb-1">{cabal.title}</h3>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{cabal.brief}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {cabal.choices.map((choice, ci) => (
                            <button
                              key={choice.id}
                              onClick={() => handleCabalChoice(ci)}
                              className={`text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors ${cabal.choices.length === 3 && ci === 2 ? "col-span-2" : ""}`}
                            >
                              <span className="text-xs font-medium text-[#0a1f14] leading-snug">{choice.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                  </div>
                );
              }

              // ── Regular event item ──
              if (item.kind === "event") {
                const event = item.event;
                const catColor = CATEGORY_COLORS[event.category];
                const metrics = getCategoryMetrics(event.category, stateRecord);
                const isAppointment = event.source === "cabinet-appointment";

                return (
                  <div
                    key={event.id}
                    className={`border border-gray-200 rounded-lg border-l-[3px] ${catColor?.border ?? "border-l-gray-300"}`}
                    data-testid={`decision-event-${event.id}`}
                  >
                      <div className="p-4">
                        {/* Category + Severity row */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded ${catColor?.bg ?? "bg-gray-100"} ${catColor?.text ?? "text-gray-600"}`}>
                            {event.category}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[event.severity] ?? "bg-gray-400"}`} title={event.severity} />
                          {event.severity === "critical" && (
                            <span className="text-[9px] font-semibold text-red-500 uppercase">Urgent</span>
                          )}
                        </div>

                        {/* Context metrics */}
                        {metrics.length > 0 && (
                          <div className="flex items-center gap-2 mb-1.5">
                            {metrics.map((m, i) => (
                              <span key={i} className="text-[10px] text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded">{m}</span>
                            ))}
                          </div>
                        )}

                        {/* Title + Description */}
                        <h3 className="text-base font-bold text-[#0a1f14] mb-1 leading-snug">{event.title}</h3>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{event.description}</p>

                        {/* Choices */}
                        {isAppointment ? (
                          <div className="grid gap-1.5 grid-cols-2">
                            <button
                              onClick={() => setReviewingAppointment(event)}
                              className="text-left px-2.5 py-2 rounded-md border-2 border-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 transition-colors col-span-2"
                            >
                              <span className="text-xs font-semibold text-[#0a1f14]">Review Candidates</span>
                              <span className="text-[10px] text-gray-500 block mt-0.5">{event.choices.length} candidates available</span>
                            </button>
                            <button
                              onClick={() => { delegateToVP(event.id); animateStamp(); }}
                              className="text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                            >
                              <span className="text-xs font-medium text-[#0a1f14]">Delegate to VP</span>
                            </button>
                            <button
                              onClick={() => { delegateToCOS(event.id); animateStamp(); }}
                              className="text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                            >
                              <span className="text-xs font-medium text-[#0a1f14]">Delegate to CoS</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-1.5 grid-cols-2">
                              {event.choices.map((choice, ci) => {
                                const enabled = canResolveChoice(choice.requirements);
                                return (
                                  <div key={`${event.id}-${ci}`} className={`${event.choices.length === 3 && ci === 2 ? "col-span-2" : ""}`}>
                                    <button
                                      data-testid={`decision-event-${event.id}-choice-${ci}`}
                                      disabled={!enabled}
                                      onClick={() => handleEventChoice(event.id, ci)}
                                      className="w-full text-left px-2.5 py-2 rounded-md border border-gray-300 bg-[#faf8f5] hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <span className="text-xs font-medium text-[#0a1f14] leading-snug line-clamp-2">{choice.label}</span>
                                      {choice.context && (
                                        <span className="text-[10px] text-gray-500 block mt-0.5 line-clamp-1">{choice.context}</span>
                                      )}
                                    </button>
                                    {!enabled && choice.requirements && (
                                      <p className="text-[10px] text-gray-400 mt-0.5 ml-1">Requires {formatRequirements(choice.requirements)}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Delegation row */}
                            <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-gray-100">
                              <span className="text-[10px] text-gray-400">Delegate:</span>
                              <button
                                onClick={() => { delegateToVP(event.id); animateStamp(); }}
                                className="text-[10px] font-medium text-[#d4af37]/80 hover:text-[#d4af37] transition-colors"
                              >
                                Vice President &#8599;
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => { delegateToCOS(event.id); animateStamp(); }}
                                className="text-[10px] font-medium text-[#d4af37]/80 hover:text-[#d4af37] transition-colors"
                              >
                                Chief of Staff &#8599;
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                  </div>
                );
              }

              return null;
            })}

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
                  <span className="text-3xl font-black text-green-500/40 uppercase tracking-widest border-4 border-green-500/40 px-4 py-1 rounded-lg rotate-[-5deg]">
                    APPROVED
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Decision History ── */}
      {recentHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-[#0a1f14] uppercase tracking-wider">Recent Presidential Actions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentHistory.map((entry, i) => {
              const icon = HISTORY_CATEGORY_ICON[entry.category] ?? "\u{1F4CB}";
              return (
                <div key={`${entry.day}-${i}`} className="px-4 py-2.5 flex gap-3">
                  <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[#0a1f14] leading-snug">{entry.event}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{entry.date}</span>
                    </div>
                    {entry.effects.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {entry.effects.map((effect, ei) => (
                          <span key={ei} className="text-[10px] text-gray-500 leading-snug">{effect}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Appointment Modal ── */}
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
