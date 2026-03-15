interface TabNavBarProps {
  activeTab: string;
  activeSubTab: string | null;
  onNavigate: (tab: string) => void;
  onSubNavigate: (subTab: string) => void;
  pendingCounts?: Record<string, number>;
}

interface TabDef {
  id: string;
  icon: string;
  label: string;
}

const MAIN_TABS: TabDef[] = [
  { id: "villa", icon: "\u{1F3DB}\uFE0F", label: "Villa" },
  { id: "cabinet", icon: "\u{1F465}", label: "Cabinet" },
  { id: "politics", icon: "\u{1F5F3}\uFE0F", label: "Politics" },
  { id: "governance", icon: "\u2699\uFE0F", label: "Governance" },
  { id: "security", icon: "\u{1F6E1}\uFE0F", label: "Security" },
  { id: "legislature", icon: "\u{1F4DC}", label: "Legislature" },
  { id: "judiciary", icon: "\u2696\uFE0F", label: "Judiciary" },
  { id: "diplomacy", icon: "\u{1F30D}", label: "Diplomacy" },
  { id: "media", icon: "\u{1F4FA}", label: "Media" },
  { id: "legacy", icon: "\u{1F3C6}", label: "Legacy" },
];

const HUB_SUB_TABS: Record<string, string[]> = {
  governance: ["economy", "infrastructure", "health", "education"],
  media: ["news", "public-affairs", "social-media"],
  politics: ["cabal", "party", "elections", "campaign"],
  security: ["intel", "military", "police"],
};

function capitalize(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function TabNavBar({
  activeTab,
  activeSubTab,
  onNavigate,
  onSubNavigate,
  pendingCounts,
}: TabNavBarProps) {
  const subTabs = HUB_SUB_TABS[activeTab] ?? null;

  return (
    <nav className="w-full bg-[#0a1f14] border-b border-[#1a3a2a]">
      {/* Main tab row */}
      <div className="flex items-center overflow-x-auto scrollbar-thin">
        {MAIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = pendingCounts?.[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap transition-colors
                ${isActive ? "text-[#d4af37] border-b-2 border-[#d4af37]" : "text-[#8ba89a] hover:text-[#c5d4cb] border-b-2 border-transparent"}`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
              {count != null && count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#d4af37] text-[#0a1f14] leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-tab pill row */}
      {subTabs && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0d2818] border-t border-[#1a3a2a]">
          {subTabs.map((sub) => {
            const isActive = activeSubTab === sub;
            return (
              <button
                key={sub}
                onClick={() => onSubNavigate(sub)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors
                  ${isActive
                    ? "bg-[#d4af37] text-[#0a1f14]"
                    : "text-[#8ba89a] hover:text-[#c5d4cb] bg-[#1a3a2a] hover:bg-[#234a34]"
                  }`}
              >
                {capitalize(sub)}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
