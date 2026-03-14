import React from "react";
import {
  LayoutDashboard, Building, Users, Landmark, Building2,
  Scale, Gavel, Globe, Newspaper, Trophy,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGame } from "@/lib/GameContext";

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onProceed: () => void;
  canProceed: boolean;
  proceedDisabledReason: string;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "divider-1", divider: true },
  { id: "villa", label: "The Villa", icon: Building },
  { id: "cabinet", label: "Cabinet", icon: Users },
  { id: "politics", label: "Politics", icon: Landmark },
  { id: "divider-2", divider: true },
  { id: "governance", label: "Governance", icon: Building2 },
  { id: "legislature", label: "Legislature", icon: Scale },
  { id: "judiciary", label: "Judiciary", icon: Gavel },
  { id: "divider-3", divider: true },
  { id: "diplomacy", label: "Diplomacy", icon: Globe },
  { id: "media", label: "Media", icon: Newspaper },
  { id: "divider-4", divider: true },
  { id: "legacy", label: "Legacy", icon: Trophy },
] as const;

function getIndicatorColor(value: number, thresholds: { green: number; gold: number }) {
  if (value >= thresholds.green) return { text: "#4ade80", fill: "from-[#4ade80] to-[#22c55e]" };
  if (value >= thresholds.gold) return { text: "#d4af37", fill: "from-[#d4af37] to-[#f5d060]" };
  return { text: "#f87171", fill: "from-[#f87171] to-[#ef4444]" };
}

function formatTreasury(value: number): string {
  if (value >= 1) return `₦${value.toFixed(1)}T`;
  return `₦${(value * 1000).toFixed(0)}B`;
}

export default function Sidebar({ activeTab, onNavigate, onProceed, canProceed, proceedDisabledReason }: SidebarProps) {
  const { state } = useGame();

  const approval = state.approval ?? 50;
  const treasury = state.treasury ?? 5;
  const stability = state.stability ?? 50;
  const daysInOffice = state.term?.daysInOffice ?? 0;
  const daysUntilElection = state.term?.daysUntilElection ?? 1460;
  const totalDays = daysInOffice + daysUntilElection;

  const approvalColor = getIndicatorColor(approval, { green: 50, gold: 35 });
  const treasuryColor = treasury >= 1 ? { text: "#d4af37", fill: "from-[#d4af37] to-[#f5d060]" } : { text: "#f87171", fill: "from-[#f87171] to-[#ef4444]" };
  const stabilityColor = getIndicatorColor(stability, { green: 60, gold: 40 });

  const indicators = [
    { label: "Approval", value: `${Math.round(approval)}%`, pct: approval, color: approvalColor },
    { label: "Treasury", value: formatTreasury(treasury), pct: Math.min((treasury / 10) * 100, 100), color: treasuryColor },
    { label: "Stability", value: String(Math.round(stability)), pct: stability, color: stabilityColor },
    { label: "Term", value: `${daysInOffice} / ${totalDays}`, pct: totalDays > 0 ? (daysInOffice / totalDays) * 100 : 0, color: { text: "#94a3b8", fill: "from-[#94a3b8] to-[#64748b]" } },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(e.currentTarget.querySelectorAll('button'));
    const currentIndex = buttons.indexOf(e.target as HTMLButtonElement);
    if (currentIndex === -1) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = buttons[currentIndex + 1];
      if (next) next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = buttons[currentIndex - 1];
      if (prev) prev.focus();
    }
  };

  return (
    <aside className="w-[56px] md:w-[220px] flex flex-col border-l border-[rgba(212,175,55,0.25)] shadow-[-4px_0_20px_rgba(0,0,0,0.3)]"
      style={{ background: "linear-gradient(180deg, #0d2818 0%, #0a1f12 30%, #081a0e 100%)" }}>

      {/* Indicators */}
      <div className="p-2 lg:p-3 border-b border-[rgba(212,175,55,0.15)]" aria-label="Game status indicators">
        {indicators.map((ind) => (
          <div key={ind.label} className="px-2.5 py-1.5 rounded-md mb-1" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="hidden md:flex justify-between items-center mb-0.5">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.6)" }}>{ind.label}</span>
              <span className="text-[13px] font-bold" style={{ color: ind.color.text }}>{ind.value}</span>
            </div>
            <div className="h-[2px] rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className={`h-[2px] rounded-full bg-gradient-to-r ${ind.color.fill}`} style={{ width: `${Math.max(ind.pct, 1)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1.5" role="navigation" aria-label="Main navigation" onKeyDown={handleKeyDown}>
        {NAV_ITEMS.map((item) => {
          if ("divider" in item && item.divider) {
            return <div key={item.id} className="h-px mx-4 my-1.5" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }} />;
          }
          const navItem = item as { id: string; label: string; icon: React.ElementType };
          const Icon = navItem.icon;
          const isActive = activeTab === navItem.id;
          return (
            <Tooltip key={navItem.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavigate(navItem.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-[10px] lg:text-[12px] font-medium transition-all border-l-[3px] focus-visible:outline-2 focus-visible:outline-[#d4af37] ${
                    isActive
                      ? "border-l-[#d4af37] text-[#d4af37] font-semibold"
                      : "border-l-transparent text-[#8a9a7a] hover:text-[#c5d4b0]"
                  }`}
                  style={isActive ? { background: "rgba(212,175,55,0.1)" } : undefined}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget.style.background = "rgba(212,175,55,0.06)"); }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget.style.background = ""); }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ opacity: isActive ? 1 : 0.7 }} />
                  <span className="hidden md:inline">{navItem.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{navItem.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Proceed */}
      <div className="p-3">
        {canProceed ? (
          <button
            onClick={onProceed}
            className="w-full py-3 rounded-lg text-[13px] font-bold uppercase tracking-wide border cursor-pointer transition-all hover:shadow-[0_2px_12px_rgba(212,175,55,0.2)]"
            style={{
              background: "linear-gradient(135deg, #1a5c2a, #22753a)",
              borderColor: "rgba(212,175,55,0.4)",
              color: "#d4af37",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <span className="hidden md:inline">▶ PROCEED</span>
            <span className="md:hidden">▶</span>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block">
                <button
                  disabled
                  className="w-full py-3 rounded-lg text-[13px] font-bold uppercase tracking-wide border opacity-40 cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #1a5c2a, #22753a)",
                    borderColor: "rgba(212,175,55,0.2)",
                    color: "#d4af37",
                  }}
                >
                  <span className="hidden md:inline">▶ PROCEED</span>
                  <span className="md:hidden">▶</span>
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{proceedDisabledReason}</TooltipContent>
          </Tooltip>
        )}
        <p className="hidden md:block text-center text-[9px] mt-1.5" style={{ color: "#556" }}>Advance to next day</p>
      </div>
    </aside>
  );
}
