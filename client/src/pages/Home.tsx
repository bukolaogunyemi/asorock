import { Suspense, lazy, useState, useCallback, useMemo } from "react";
import TopBar from "@/components/TopBar";
import { ProfileBreadcrumbNav } from "@/components/ProfileBreadcrumbNav";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import InboxPanel from "@/components/InboxPanel";
import { useGame } from "@/lib/GameContext";
import { ProfileNavigationProvider, useProfileNavigation } from "@/lib/ProfileNavigationContext";
import { resolveEntityProfile } from "@/lib/entityAdapters";
import { PresidentialSidebar } from "@/components/PresidentialSidebar";
import { TabNavBar } from "@/components/TabNavBar";
import { EconomySection } from "@/components/governance/EconomySection";
import { GovernanceSection } from "@/components/governance/GovernanceSection";
import {
  INFRASTRUCTURE_CONFIG,
  HEALTH_CONFIG,
  EDUCATION_CONFIG,
  AGRICULTURE_CONFIG,
  INTERIOR_CONFIG,
  ENVIRONMENT_CONFIG,
  YOUTH_EMPLOYMENT_CONFIG,
} from "@/lib/governanceSections";

const BriefingRoom = lazy(() => import("@/components/BriefingRoom"));
const IntelligenceBrief = lazy(() => import("@/components/IntelligenceBrief"));

const CharacterProfile = lazy(() => import("@/components/CharacterProfile"));
const EntityProfile = lazy(() => import("@/components/EntityProfile"));
const LegacyTab = lazy(() => import("@/components/LegacyTab"));
const CabinetTab = lazy(() => import("@/components/CabinetTab"));
const PoliticsTab = lazy(() => import("@/components/PoliticsTab"));
const SecurityTab = lazy(() => import("@/components/SecurityTab"));
const LegislatureTab = lazy(() => import("@/components/LegislatureTab"));
const JudiciaryTab = lazy(() => import("@/components/JudiciaryTab"));
const DiplomacyTab = lazy(() => import("@/components/DiplomacyTab"));
const MediaTab = lazy(() => import("@/components/MediaTab"));
const PublicAffairsTab = lazy(() => import("@/components/PublicAffairsTab"));
const DecisionsTab = lazy(() => import("@/components/DecisionsTab"));
const SocialMediaTab = lazy(() => import("@/components/SocialMediaTab"));
const InboxTab = lazy(() => import("@/components/InboxTab"));

interface HomeProps {
  dark: boolean;
  toggleDark: () => void;
}

// Hub sub-tab definitions
const governanceSubTabs = [
  { id: "economy", label: "Economy" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "health", label: "Health" },
  { id: "education", label: "Education" },
  { id: "agriculture", label: "Agriculture" },
  { id: "interior", label: "Interior" },
  { id: "environment", label: "Environment" },
  { id: "youthEmployment", label: "Labour" },
];

const mediaSubTabs = [
  { id: "news", label: "News" },
  { id: "public-affairs", label: "Public Affairs" },
  { id: "social-media", label: "Social Media" },
];

const politicsSubTabs = [
  { id: "cabal", label: "Cabal" },
  { id: "party", label: "Party" },
  { id: "elections", label: "Elections" },
  { id: "campaign", label: "Campaign" },
];

const securitySubTabs = [
  { id: "intel", label: "Intel" },
  { id: "military", label: "Military" },
  { id: "police", label: "Police" },
];

const villaSubTabs = [
  { id: "briefing-room", label: "Briefing Room" },
  { id: "decision-desk", label: "Decision Desk" },
];

// Tabs that use hub-style breadcrumb navigation
const HUB_TABS: Record<string, { label: string; defaultSub: string; subTabs: { id: string; label: string }[] }> = {
  villa: { label: "Villa", defaultSub: "briefing-room", subTabs: villaSubTabs },
  governance: { label: "Governance", defaultSub: "economy", subTabs: governanceSubTabs },
  media: { label: "Media", defaultSub: "news", subTabs: mediaSubTabs },
  politics: { label: "Politics", defaultSub: "cabal", subTabs: politicsSubTabs },
  security: { label: "Security", defaultSub: "intel", subTabs: securitySubTabs },
};

export default function Home({ dark, toggleDark }: HomeProps) {
  return (
    <ProfileNavigationProvider>
      <HomeInner dark={dark} toggleDark={toggleDark} />
    </ProfileNavigationProvider>
  );
}

function HomeInner({ dark, toggleDark }: HomeProps) {
  const [activeTab, setActiveTab] = useState("villa");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [pulsingIndicators, setPulsingIndicators] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { state, endDay, dismissBrief, reopenBrief } = useGame();
  const { isProfileOpen, currentProfile, pushProfile, clearStack } = useProfileNavigation();

  const isPlaying = state.phase === "playing";

  const hasPendingCritical = state.activeEvents.some((event) => event.severity === "critical");
  const activeCabalMeeting = state.cabalMeeting && state.cabalMeeting.day === state.day ? state.cabalMeeting : null;
  const hasPendingCabal = isPlaying && !!activeCabalMeeting && !activeCabalMeeting.resolved;

  const canProceed = state.activeEvents.length === 0 && (!state.cabalMeeting || state.cabalMeeting.resolved);
  const proceedDisabledReason = state.activeEvents.length > 0
    ? "Resolve pending decisions first"
    : "Attend the cabal meeting first";

  const showBrief = state.lastBriefData && !state.lastBriefData.dismissed;
  const handleDismissBrief = () => dismissBrief();
  const handleReopenBrief = () => reopenBrief();

  const unreadCount = state.inboxMessages.filter((message) => !message.read).length;

  // Compute pending decision counts per tab for badge display
  const pendingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const catToTab: Record<string, string> = {
      economy: "governance",
      governance: "governance",
      security: "security",
      politics: "politics",
      diplomacy: "diplomacy",
      media: "media",
    };
    for (const ev of state.activeEvents) {
      const tab = catToTab[ev.category];
      if (tab) counts[tab] = (counts[tab] ?? 0) + 1;
    }
    // Villa shows total
    const total = state.activeEvents.length + (state.cabalMeeting && !state.cabalMeeting.resolved ? 1 : 0);
    if (total > 0) counts.villa = total;
    // Inbox shows unread count
    const unread = state.inboxMessages.filter((m) => !m.read).length;
    if (unread > 0) counts.inbox = unread;
    return counts;
  }, [state.activeEvents, state.cabalMeeting, state.inboxMessages]);

  const handleNavigate = (tab: string, subTab?: string) => {
    clearStack();
    const hub = HUB_TABS[tab];
    if (hub) {
      setActiveTab(tab);
      setActiveSubTab(subTab ?? hub.defaultSub);
      return;
    }
    setActiveTab(tab);
    setActiveSubTab(subTab ?? null);
  };

  const handleTabChange = (tab: string) => {
    handleNavigate(tab);
  };

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  const handleCharacterClick = useCallback((characterKey: string, sourceTab: string, sourceLabel: string) => {
    const char = state.characters[characterKey];
    if (char) {
      pushProfile({ key: characterKey, type: "character", label: char.name, sourceTab, sourceLabel });
      return;
    }
    const gov = state.governors.find(g => g.name === characterKey);
    if (gov) {
      pushProfile({ key: characterKey, type: "character", label: gov.name, sourceTab, sourceLabel });
      return;
    }
    const officer = state.constitutionalOfficers.find(o => o.name === characterKey);
    if (officer) {
      pushProfile({ key: characterKey, type: "character", label: officer.name, sourceTab, sourceLabel });
    }
  }, [state.characters, state.governors, state.constitutionalOfficers, pushProfile]);

  const handleEntityClick = useCallback((entityId: string, sourceTab: string, sourceLabel: string) => {
    const profile = resolveEntityProfile(entityId, state);
    if (profile) {
      pushProfile({ key: entityId, type: "entity", label: profile.name, sourceTab, sourceLabel });
    }
  }, [state, pushProfile]);

  const handleProceed = endDay;

  const charClick = useCallback((sourceTab: string, sourceLabel: string) =>
    (characterKey: string) => handleCharacterClick(characterKey, sourceTab, sourceLabel),
    [handleCharacterClick]);

  const entityClick = useCallback((sourceTab: string, sourceLabel: string) =>
    (entityId: string) => handleEntityClick(entityId, sourceTab, sourceLabel),
    [handleEntityClick]);

  // Current hub config (if active tab is a hub)
  const currentHub = HUB_TABS[activeTab];

  function renderTabContent() {
    switch (activeTab) {
      case "villa":
        if (activeSubTab === "decision-desk") return <DecisionsTab />;
        return <BriefingRoom onOpenFullBrief={handleReopenBrief} />;
      case "cabinet": return <CabinetTab onCharacterClick={charClick("cabinet", "Cabinet")} onEntityClick={entityClick("cabinet", "Cabinet")} />;
      case "politics":
        return <PoliticsTab onCharacterClick={charClick("politics", "Politics")} onEntityClick={entityClick("politics", "Politics")} />;
      case "governance":
        if (activeSubTab === "economy") return <EconomySection onCharacterClick={charClick("governance", "Economy")} />;
        if (activeSubTab === "infrastructure") return <GovernanceSection config={INFRASTRUCTURE_CONFIG} sectorStateKey="infrastructure" onCharacterClick={charClick("governance", "Infrastructure")} />;
        if (activeSubTab === "health") return <GovernanceSection config={HEALTH_CONFIG} sectorStateKey="healthSector" onCharacterClick={charClick("governance", "Health")} />;
        if (activeSubTab === "education") return <GovernanceSection config={EDUCATION_CONFIG} sectorStateKey="education" onCharacterClick={charClick("governance", "Education")} />;
        if (activeSubTab === "agriculture") return <GovernanceSection config={AGRICULTURE_CONFIG} sectorStateKey="agriculture" onCharacterClick={charClick("governance", "Agriculture")} />;
        if (activeSubTab === "interior") return <GovernanceSection config={INTERIOR_CONFIG} sectorStateKey="interior" onCharacterClick={charClick("governance", "Interior")} />;
        if (activeSubTab === "environment") return <GovernanceSection config={ENVIRONMENT_CONFIG} sectorStateKey="environment" onCharacterClick={charClick("governance", "Environment")} />;
        if (activeSubTab === "youthEmployment") return <GovernanceSection config={YOUTH_EMPLOYMENT_CONFIG} sectorStateKey="youthEmployment" onCharacterClick={charClick("governance", "Labour")} />;
        return <EconomySection onCharacterClick={charClick("governance", "Economy")} />;
      case "security":
        return <SecurityTab view={(activeSubTab as "intel" | "military" | "police") ?? "intel"} onCharacterClick={charClick("security", "Security")} onEntityClick={entityClick("security", "Security")} />;
      case "legislature": return <LegislatureTab onCharacterClick={charClick("legislature", "Legislature")} onEntityClick={entityClick("legislature", "Legislature")} />;
      case "judiciary": return <JudiciaryTab onCharacterClick={charClick("judiciary", "Judiciary")} onEntityClick={entityClick("judiciary", "Judiciary")} />;
      case "diplomacy": return <DiplomacyTab onCharacterClick={charClick("diplomacy", "Diplomacy")} onEntityClick={entityClick("diplomacy", "Diplomacy")} />;
      case "media":
        if (activeSubTab === "news") return <MediaTab onCharacterClick={charClick("media", "Media")} onEntityClick={entityClick("media", "Media")} />;
        if (activeSubTab === "public-affairs") return <PublicAffairsTab onCharacterClick={charClick("media", "Public Affairs")} onEntityClick={entityClick("media", "Public Affairs")} />;
        if (activeSubTab === "social-media") return <SocialMediaTab />;
        return <MediaTab onCharacterClick={charClick("media", "Media")} onEntityClick={entityClick("media", "Media")} />;
      case "legacy": return <LegacyTab />;
      case "inbox": return <div className="h-full -m-4"><InboxTab /></div>;
      default: return <DecisionsTab />;
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f2b1e]">
      {/* Top Bar */}
      <TopBar
        dark={dark}
        toggleDark={toggleDark}
        onProceed={handleProceed}
        canProceed={canProceed}
        proceedDisabledReason={proceedDisabledReason}
      />

      {/* Main content area — sidebar left + content right */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel */}
        <PresidentialSidebar onNavigate={handleNavigate} pulsingIndicators={pulsingIndicators} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#faf8f5]">
          {/* Tab Navigation Bar */}
          <div className="shrink-0">
            <TabNavBar
              activeTab={activeTab}
              activeSubTab={activeSubTab}
              onNavigate={handleTabChange}
              onSubNavigate={handleSubTabChange}
              pendingCounts={pendingCounts}
            />
          </div>

          {/* Profile breadcrumbs */}
          {isProfileOpen && (
            <div className="px-4 pt-2 shrink-0">
              <ProfileBreadcrumbNav />
            </div>
          )}

          {/* Scrollable content area */}
          {isProfileOpen && currentProfile ? (
            <div className="flex-1 overflow-y-auto p-4">
              <Suspense fallback={<div className="p-4 text-gray-400">Loading...</div>}>
                {currentProfile.type === "entity" ? (
                  <EntityProfile
                    entityId={currentProfile.key}
                    onCharacterClick={handleCharacterClick}
                    onEntityClick={handleEntityClick}
                  />
                ) : (
                  <CharacterProfile
                    characterKey={currentProfile.key}
                    sourceTab={currentProfile.sourceTab}
                    onCharacterClick={handleCharacterClick}
                    onEntityClick={handleEntityClick}
                  />
                )}
              </Suspense>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <Suspense fallback={<div className="p-4 text-gray-400">Loading...</div>}>
                {renderTabContent()}
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      <PerplexityAttribution />

      {/* Intelligence Brief Overlay */}
      {showBrief && (
        <Suspense fallback={null}>
          <IntelligenceBrief onDismiss={handleDismissBrief} />
        </Suspense>
      )}

      {/* Inbox Panel */}
      <InboxPanel open={inboxOpen} onOpenChange={setInboxOpen} messages={state.inboxMessages} />
    </div>
  );
}
