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

  const handleBreadcrumbClick = useCallback((target: "governance" | "economy") => {
    if (target === "economy") setActiveSubsection(null);
    // "governance" navigation handled by parent tab system
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 text-sm">
        <button
          onClick={() => handleBreadcrumbClick("governance")}
          className="text-amber-400/70 hover:text-amber-400 transition-colors"
        >
          Governance
        </button>
        <span className="text-amber-400/40">&rsaquo;</span>
        <button
          onClick={() => handleBreadcrumbClick("economy")}
          className={`transition-colors ${activeSubsection ? "text-amber-400/70 hover:text-amber-400" : "text-amber-200 font-medium"}`}
        >
          Economy
        </button>
        {activeSubsection && (
          <>
            <span className="text-amber-400/40">&rsaquo;</span>
            <span className="text-amber-200 font-medium">
              {config.subsections.find(s => s.id === activeSubsection)?.label}
            </span>
          </>
        )}
      </div>

      {/* Subsection pills */}
      <div className="flex gap-2 px-4 pb-3">
        {config.subsections.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubsection(activeSubsection === sub.id ? null : sub.id as Subsection)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeSubsection === sub.id
                ? "bg-amber-500 text-black"
                : "bg-amber-500/10 text-amber-400/80 hover:bg-amber-500/20 border border-amber-500/20"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Four-quadrant grid */}
      <div className="grid grid-cols-[280px_1fr] grid-rows-[minmax(200px,1fr)_minmax(200px,1fr)] gap-3 px-4 pb-4 flex-1 min-h-0">
        {/* Q1: Team */}
        <div className="overflow-y-auto rounded-lg border border-amber-500/10 bg-black/20 p-3">
          <EconomyTeamPanel
            teamConfig={team}
            briefingCooldownKey={briefingCooldownKey}
            subsection={activeSubsection}
            onCharacterClick={onCharacterClick}
          />
        </div>

        {/* Q2: Indicators */}
        <div className="overflow-y-auto rounded-lg border border-amber-500/10 bg-black/20 p-3">
          <EconomyIndicators charts={charts} />
        </div>

        {/* Q3: Policy */}
        <div className="overflow-y-auto rounded-lg border border-amber-500/10 bg-black/20 p-3">
          <EconomyPolicyCorner levers={levers} />
        </div>

        {/* Q4: Stakeholders + Reforms */}
        <div className="overflow-y-auto rounded-lg border border-amber-500/10 bg-black/20 p-3">
          <EconomyStakeholders />
        </div>
      </div>
    </div>
  );
}
