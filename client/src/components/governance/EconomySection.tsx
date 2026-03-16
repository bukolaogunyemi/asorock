import { useState, useCallback } from "react";
import { ECONOMY_CONFIG } from "@/lib/governanceSections";
import { EconomyTeamPanel } from "./EconomyTeamPanel";
import { EconomyIndicators } from "./EconomyIndicators";
import { EconomyPolicyCorner } from "./EconomyPolicyCorner";
import { EconomyStakeholders } from "./EconomyStakeholders";

type Subsection = "budget" | "revenue" | "debt" | "trade" | null;

interface EconomySectionProps {
  onCharacterClick?: (name: string) => void;
}

export function EconomySection({ onCharacterClick }: EconomySectionProps) {
  const [activeSubsection, setActiveSubsection] = useState<Subsection>(null);

  const config = ECONOMY_CONFIG;
  const currentView = activeSubsection
    ? config.subsections.find(s => s.id === activeSubsection) ?? null
    : null;

  const team = currentView?.team ?? config.overview.team;
  const charts = currentView?.charts ?? config.overview.charts;
  const levers = currentView?.levers ?? config.overview.levers;
  const briefingCooldownKey = currentView?.briefingCooldownKey ?? config.overview.briefingCooldownKey;

  const handleSubClick = useCallback((subId: string) => {
    setActiveSubsection(prev => prev === subId ? null : subId as Subsection);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Subsection tabs — clean inline bar */}
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
        <span className="text-gray-300 mx-1">|</span>
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

      {/* Four-quadrant grid */}
      <div className="grid grid-cols-[260px_1fr] grid-rows-[minmax(220px,1fr)_minmax(220px,1fr)] gap-3 px-4 pb-4 flex-1 min-h-0">
        {/* Q1: Team */}
        <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
          <EconomyTeamPanel
            teamConfig={team}
            briefingCooldownKey={briefingCooldownKey}
            subsection={activeSubsection}
            onCharacterClick={onCharacterClick}
          />
        </div>

        {/* Q2: Indicators */}
        <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
          <EconomyIndicators charts={charts} />
        </div>

        {/* Q3: Stakeholder Pulse (compact, left column) */}
        <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
          <EconomyStakeholders />
        </div>

        {/* Q4: Policy Levers (wide, right column — critical decisions) */}
        <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm">
          <EconomyPolicyCorner levers={levers} />
        </div>
      </div>
    </div>
  );
}
