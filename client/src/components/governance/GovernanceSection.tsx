import { useState, useCallback } from "react";
import { EconomyTeamPanel } from "./EconomyTeamPanel";
import { EconomyIndicators } from "./EconomyIndicators";
import { EconomyPolicyCorner } from "./EconomyPolicyCorner";
import { EconomyStakeholders } from "./EconomyStakeholders";
import { useGame } from "@/lib/GameContext";
import type { GovernanceSectionConfig } from "@/lib/governanceSections";
import type { ActiveEvent } from "@/lib/gameTypes";

interface GovernanceSectionProps {
  config: GovernanceSectionConfig;
  sectorStateKey: string;
  onCharacterClick?: (name: string) => void;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; dot: string }> = {
  green: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  red: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
};

function crisisZoneToStatus(crisisZone: string): "green" | "amber" | "red" {
  if (crisisZone === "green") return "green";
  if (crisisZone === "red") return "red";
  return "amber";
}

function buildSummary(sectorLabel: string, health: number, crisisZone: string): string {
  if (crisisZone === "green") {
    return `${sectorLabel} sector is performing well. Health score: ${health}/100. Indicators are within acceptable ranges.`;
  }
  if (crisisZone === "red") {
    return `${sectorLabel} sector is in crisis. Health score: ${health}/100. Immediate attention and intervention required.`;
  }
  return `${sectorLabel} sector requires monitoring. Health score: ${health}/100. Some indicators are below target thresholds.`;
}

export function GovernanceSection({ config, sectorStateKey, onCharacterClick }: GovernanceSectionProps) {
  const { state, setBriefingCooldown, processBriefingChoice } = useGame();
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const [briefingEvent, setBriefingEvent] = useState<ActiveEvent | null>(null);

  const currentView = activeSubsection
    ? config.subsections.find(s => s.id === activeSubsection) ?? null
    : null;

  const team = currentView?.team ?? config.overview.team;
  const charts = currentView?.charts ?? config.overview.charts;
  const levers = currentView?.levers ?? config.overview.levers;
  const stakeholders = currentView?.stakeholders ?? config.overview.stakeholders;
  const briefingCooldownKey = currentView?.briefingCooldownKey ?? config.overview.briefingCooldownKey;

  const handleSubClick = useCallback((subId: string) => {
    setActiveSubsection(prev => prev === subId ? null : subId);
    setBriefingEvent(null);
  }, []);

  const handleSummonBriefing = useCallback((event: ActiveEvent) => {
    setBriefingEvent(event);
    setBriefingCooldown(briefingCooldownKey);
  }, [briefingCooldownKey, setBriefingCooldown]);

  const handleBriefingChoice = useCallback((choiceIndex: number) => {
    if (!briefingEvent) return;
    processBriefingChoice(briefingEvent, choiceIndex);
    setBriefingEvent(null);
  }, [briefingEvent, processBriefingChoice]);

  const handleDismissBriefing = useCallback(() => {
    setBriefingEvent(null);
  }, []);

  // Read sector state from game state using the provided key
  const sectorState = (state as any)[sectorStateKey];
  const health: number = sectorState?.health ?? 50;
  const crisisZone: string = sectorState?.crisisZone ?? "yellow";
  const status = crisisZoneToStatus(crisisZone);
  const statusStyle = STATUS_STYLES[status];
  const summary = buildSummary(config.label, health, crisisZone);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Subsection tabs */}
      <div className="flex items-center gap-1 px-4 py-2">
        <button
          onClick={() => setActiveSubsection(null)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            !activeSubsection
              ? "bg-[#0a1f14] text-[#d4af37]"
              : "text-gray-500 hover:text-[#0a1f14] hover:bg-gray-100"
          }`}
        >
          Overview
        </button>
        {config.subsections.length > 0 && (
          <span className="text-gray-300 mx-1">|</span>
        )}
        {config.subsections.map(sub => (
          <button
            key={sub.id}
            onClick={() => handleSubClick(sub.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeSubsection === sub.id
                ? "bg-[#d4af37] text-white"
                : "text-gray-500 hover:text-[#0a1f14] hover:bg-gray-100"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Two-column layout: Left team + Right content */}
      <div className="flex gap-3 px-4 pb-4 flex-1 min-h-0">
        {/* Left column: Team Panel */}
        <div className="w-[280px] shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
          <EconomyTeamPanel
            teamConfig={team}
            briefingCooldownKey={briefingCooldownKey}
            subsection={activeSubsection}
            onCharacterClick={onCharacterClick}
            onSummonBriefing={handleSummonBriefing}
          />
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Health banner + Indicators — always visible */}
          <div className={`rounded-lg border ${statusStyle.border} ${statusStyle.bg} px-4 py-3 flex items-start gap-3`}>
            <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} shrink-0 mt-0.5`} />
            <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
            <EconomyIndicators charts={charts} />
          </div>

          {/* Bottom area — briefing OR (policy + pulse) */}
          {briefingEvent ? (
            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Briefing Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100" style={{ backgroundColor: "#0a1f14" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Team Briefing</p>
                  <h3 className="text-sm font-bold text-[#d4af37]">{briefingEvent.title}</h3>
                </div>
                <button
                  onClick={handleDismissBriefing}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Briefing Body */}
              <div className="px-5 py-4">
                <p className="text-[13px] leading-[1.7] text-[#2a3a2e] whitespace-pre-line mb-5">
                  {briefingEvent.description}
                </p>

                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                    Presidential Response
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {briefingEvent.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleBriefingChoice(i)}
                        className="text-left rounded-lg border border-gray-200 bg-[#faf8f5] p-3.5 hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.04)] transition-colors"
                      >
                        <span className="text-xs font-bold text-[#0a1f14] block mb-1">{choice.label}</span>
                        {choice.context && (
                          <span className="text-[10px] text-gray-500 block">{choice.context}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Policy Levers + Stakeholder Pulse side-by-side */}
              <div className="flex gap-3 flex-1 min-h-0">
                {/* Policy Levers — 60% */}
                <div className="flex-[3] min-w-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
                  <EconomyPolicyCorner levers={levers} />
                </div>

                {/* Stakeholder Pulse — 40% */}
                <div className="flex-[2] min-w-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2">
                    Stakeholder Pulse
                  </h3>
                  <EconomyStakeholders stakeholders={stakeholders ?? []} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
