import React from "react";
import {
  Building, Users, Landmark, Building2,
  Scale, Gavel, Globe, Newspaper, Trophy,
  Mail, Shield, Calendar,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGame } from "@/lib/GameContext";

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onProceed: () => void;
  canProceed: boolean;
  proceedDisabledReason: string;
  onOpenInbox: () => void;
  unreadCount: number;
}

const NAV_ITEMS = [
  { id: "villa", label: "The Villa", icon: Building },
  { id: "cabinet", label: "Cabinet", icon: Users },
  { id: "politics", label: "Politics", icon: Landmark },
  { id: "divider-1", divider: true },
  { id: "governance", label: "Governance", icon: Building2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "legislature", label: "Legislature", icon: Scale },
  { id: "judiciary", label: "Judiciary", icon: Gavel },
  { id: "divider-2", divider: true },
  { id: "diplomacy", label: "Diplomacy", icon: Globe },
  { id: "media", label: "Media", icon: Newspaper },
  { id: "divider-3", divider: true },
  { id: "legacy", label: "Legacy", icon: Trophy },
  { id: "inbox", label: "Inbox", icon: Mail },
] as const;

function getIndicatorColor(value: number, thresholds: { green: number; gold: number }) {
  if (value >= thresholds.green) return { text: "#4ade80", fill: "from-[#4ade80] to-[#22c55e]" };
  if (value >= thresholds.gold) return { text: "#d4af37", fill: "from-[#d4af37] to-[#f5d060]" };
  return { text: "#f87171", fill: "from-[#f87171] to-[#ef4444]" };
}

export default function Sidebar({ activeTab, onNavigate, onProceed, canProceed, proceedDisabledReason, onOpenInbox, unreadCount }: SidebarProps) {
  const { state } = useGame();

  const isPlaying = state.phase === "playing" || state.phase === "victory" || state.phase === "defeat";
  const approval = state.approval ?? 50;
  const stability = state.stability ?? 50;
  const daysInOffice = state.term?.daysInOffice ?? 0;
  const daysUntilElection = state.term?.daysUntilElection ?? 1460;
  const totalDays = daysInOffice + daysUntilElection;

  const approvalColor = getIndicatorColor(approval, { green: 50, gold: 35 });
  const stabilityColor = getIndicatorColor(stability, { green: 60, gold: 40 });

  const indicators = [
    { label: "Approval", value: `${Math.round(approval)}%`, pct: approval, color: approvalColor },
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

  const handleNavClick = (id: string) => {
    if (id === "inbox") {
      onOpenInbox();
    } else {
      onNavigate(id);
    }
  };

  const presidentName = state.presidentName || "Mr. President";
  const presidentParty = state.presidentParty || "—";
  const presidentAge = state.presidentAge || 0;
  const presidentState = state.presidentState || "—";

  return (
    <aside
      className="w-[56px] md:w-[240px] flex flex-col border-l border-[rgba(212,175,55,0.25)] shadow-[-4px_0_20px_rgba(0,0,0,0.3)]"
      style={{ background: "linear-gradient(180deg, #14352a 0%, #0f2b1e 30%, #0b2216 100%)" }}
    >

      {/* Date */}
      <div className="px-3 pt-3 pb-2 border-b border-[rgba(212,175,55,0.15)]">
        <div className="flex items-center gap-2 md:gap-2.5">
          <Calendar className="w-[16px] h-[16px] md:w-[14px] md:h-[14px] shrink-0" style={{ color: "#d4af37" }} />
          <span
            className="hidden md:block text-[13px] font-bold tracking-wide"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f5d060)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {isPlaying ? state.date : "—"}
          </span>
        </div>
      </div>

      {/* President Info */}
      {isPlaying && (
        <div className="px-3 py-2.5 border-b border-[rgba(212,175,55,0.15)]" style={{ background: "rgba(212,175,55,0.04)" }}>
          <div className="hidden md:block">
            <p
              className="text-[13px] font-bold tracking-wide leading-tight"
              style={{ color: "#e8dcc8" }}
            >
              {presidentName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.7)" }}>
                {presidentParty}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(212,175,55,0.3)" }}>•</span>
              <span className="text-[10px]" style={{ color: "rgba(212,175,55,0.5)" }}>
                Age {presidentAge}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(212,175,55,0.3)" }}>•</span>
              <span className="text-[10px]" style={{ color: "rgba(212,175,55,0.5)" }}>
                {presidentState}
              </span>
            </div>
          </div>
          {/* Collapsed: just initials */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold mx-auto"
                style={{ background: "rgba(212,175,55,0.15)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                {presidentName.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
            </TooltipTrigger>
            <TooltipContent>{presidentName} · {presidentParty}</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Indicators */}
      <div className="px-2 lg:px-3 py-2 border-b border-[rgba(212,175,55,0.15)]" aria-label="Game status indicators">
        {indicators.map((ind) => (
          <div key={ind.label} className="px-2.5 py-1.5 rounded-md mb-1" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="hidden md:flex justify-between items-center mb-0.5">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.6)" }}>{ind.label}</span>
              <span className="text-[13px] font-bold" style={{ color: ind.color.text }}>{ind.value}</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-[2px] rounded-full md:cursor-default" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className={`h-[2px] rounded-full bg-gradient-to-r ${ind.color.fill}`} style={{ width: `${Math.max(ind.pct, 1)}%` }} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="md:hidden">{ind.label}: {ind.value}</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1.5 min-h-0" role="navigation" aria-label="Main navigation" onKeyDown={handleKeyDown}>
        {NAV_ITEMS.map((item) => {
          if ("divider" in item && item.divider) {
            return <div key={item.id} className="h-px mx-4 my-1.5" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }} />;
          }
          const navItem = item as { id: string; label: string; icon: React.ElementType };
          const Icon = navItem.icon;
          const isActive = activeTab === navItem.id;
          const isInbox = navItem.id === "inbox";
          return (
            <Tooltip key={navItem.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavClick(navItem.id)}
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
                  <span className="relative">
                    <Icon className="w-[18px] h-[18px]" style={{ opacity: isActive ? 1 : 0.7 }} />
                    {isInbox && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 h-3.5 min-w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden md:inline">{navItem.label}</span>
                  {isInbox && unreadCount > 0 && (
                    <span className="hidden md:inline ml-auto text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-red-500/20 text-red-400">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{navItem.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Proceed */}
      <div className="p-3 border-t border-[rgba(212,175,55,0.15)] shrink-0">
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
      </div>
    </aside>
  );
}
