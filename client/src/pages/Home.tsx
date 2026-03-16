import { Suspense, lazy, useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { ProfileBreadcrumbNav } from "@/components/ProfileBreadcrumbNav";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import InboxPanel from "@/components/InboxPanel";
import { useGame } from "@/lib/GameContext";
import { ProfileNavigationProvider, useProfileNavigation } from "@/lib/ProfileNavigationContext";
import { resolveEntityProfile } from "@/lib/entityAdapters";
import { PresidentialDashboard } from "@/components/PresidentialDashboard";
import { TabNavBar } from "@/components/TabNavBar";
import { AdvisoryWhisper } from "@/components/AdvisoryWhisper";
import { EconomySection } from "@/components/governance/EconomySection";

const DailyBriefColumn = lazy(() => import("@/components/DailyBriefColumn"));
const DecisionDesk = lazy(() => import("@/components/DecisionDesk"));
const HeadlinesColumn = lazy(() => import("@/components/HeadlinesColumn"));
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
const InfrastructureTab = lazy(() => import("@/components/InfrastructureTab"));
const HealthTab = lazy(() => import("@/components/HealthTab"));
const EducationTab = lazy(() => import("@/components/EducationTab"));
const SocialMediaTab = lazy(() => import("@/components/SocialMediaTab"));

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

// Tabs that use the fixed three-column layout (Intel Brief | Decision Desk | Headlines)
const THREE_COLUMN_TABS = ["villa", "governance", "politics", "security", "diplomacy"];

// Tabs that use hub-style breadcrumb navigation
const HUB_TABS: Record<string, { label: string; defaultSub: string; subTabs: { id: string; label: string }[] }> = {
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
      case "villa": return <DecisionsTab />;
      case "cabinet": return <CabinetTab onCharacterClick={charClick("cabinet", "Cabinet")} onEntityClick={entityClick("cabinet", "Cabinet")} />;
      case "politics":
        return <PoliticsTab onCharacterClick={charClick("politics", "Politics")} onEntityClick={entityClick("politics", "Politics")} />;
      case "governance":
        if (activeSubTab === "economy") return <EconomySection onCharacterClick={charClick("governance", "Economy")} />;
        if (activeSubTab === "infrastructure") return <InfrastructureTab />;
        if (activeSubTab === "health") return <HealthTab />;
        if (activeSubTab === "education") return <EducationTab />;
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
      default: return <DecisionsTab />;
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a1f14]">
      {/* Top Bar */}
      <TopBar
        dark={dark}
        toggleDark={toggleDark}
        onProceed={handleProceed}
        canProceed={canProceed}
        proceedDisabledReason={proceedDisabledReason}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Zone A — Persistent Dashboard */}
        <div className="shrink-0">
          <PresidentialDashboard onNavigate={handleNavigate} pulsingIndicators={pulsingIndicators} />
        </div>

        {/* Zone B — light background area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#faf8f5]">
        {/* Advisory Whisper */}
        <div className="shrink-0">
          <AdvisoryWhisper activeTab={activeTab} />
        </div>

        {/* Tab Navigation Bar */}
        <div className="shrink-0">
          <TabNavBar
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            onNavigate={handleTabChange}
            onSubNavigate={handleSubTabChange}
          />
        </div>

        {/* Profile breadcrumbs (hub sub-tab breadcrumbs removed — TabNavBar handles sub-tabs) */}
        {isProfileOpen && (
          <div className="px-4 pt-2 shrink-0">
            <ProfileBreadcrumbNav />
          </div>
        )}

        {/* Scrollable content area: Zone B + Zone C */}
        {isProfileOpen && currentProfile ? (
          /* Profile view — full width, scrollable */
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
        ) : THREE_COLUMN_TABS.includes(activeTab) ? (
          /* Scrollable area containing Zone B (fixed-height) + Zone C (tab content) */
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Zone B — Three-column fixed-height layout */}
            <div className="h-[280px] flex m-2 rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{ backgroundColor: "#f5f3ef" }}>
              {/* Left: Intel Brief Column */}
              <Suspense fallback={<div className="w-[260px] shrink-0" />}>
                <DailyBriefColumn activeTab={activeTab} onOpenFullBrief={handleReopenBrief} />
              </Suspense>

              {/* Center: Decision Desk — constrained to avoid dominating */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-x border-gray-200 max-w-[480px]">
                <Suspense fallback={<div className="p-4 text-gray-400">Loading...</div>}>
                  <DecisionDesk
                    activeTab={activeTab}
                    onNavigateToTab={handleTabChange}
                  />
                </Suspense>
              </div>

              {/* Right: Headlines Column */}
              <Suspense fallback={<div className="w-[260px] shrink-0" />}>
                <HeadlinesColumn activeTab={activeTab} />
              </Suspense>
            </div>

            {/* Zone C — Tab-specific content below Zone B */}
            <div className="px-4 py-3">
              <Suspense fallback={<div className="p-4 text-gray-400">Loading...</div>}>
                {renderTabContent()}
              </Suspense>
            </div>
          </div>
        ) : (
          /* Full-page tab content (Cabinet, Legislature, Judiciary, Media, Legacy) */
          <div className="flex-1 overflow-y-auto p-4">
            <Suspense fallback={<div className="p-4 text-gray-400">Loading...</div>}>
              {renderTabContent()}
            </Suspense>
          </div>
        )}
        </div>{/* end light background area */}
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
