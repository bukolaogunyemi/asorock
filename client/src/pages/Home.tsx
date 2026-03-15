import { Suspense, lazy, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { ProfileBreadcrumbNav } from "@/components/ProfileBreadcrumbNav";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import InboxPanel from "@/components/InboxPanel";
import { useGame } from "@/lib/GameContext";
import DailyBrief from "@/components/DailyBrief";
import { ProfileNavigationProvider, useProfileNavigation } from "@/lib/ProfileNavigationContext";

const CharacterProfile = lazy(() => import("@/components/CharacterProfile"));
const LegacyTab = lazy(() => import("@/components/LegacyTab"));
const CabinetTab = lazy(() => import("@/components/CabinetTab"));
const PoliticsTab = lazy(() => import("@/components/PoliticsTab"));
const EconomyTab = lazy(() => import("@/components/EconomyTab"));
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

function TabFallback() {
  return (
    <Card className="border border-border bg-muted/20">
      <CardContent className="p-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading</p>
        <p className="text-sm font-medium">Preparing the next section of the presidency...</p>
      </CardContent>
    </Card>
  );
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
  const { state, endDay, resolveCabalChoice } = useGame();
  const { isProfileOpen, currentProfile, pushProfile, clearStack } = useProfileNavigation();

  const isPlaying = state.phase === "playing";
  const [lastBriefedDay, setLastBriefedDay] = useState(state.day);
  const showDailyBrief = isPlaying && state.day > 1 && state.day > lastBriefedDay;
  const hasPendingCritical = state.activeEvents.some((event) => event.severity === "critical");
  const activeCabalMeeting = state.cabalMeeting && state.cabalMeeting.day === state.day ? state.cabalMeeting : null;
  const hasPendingCabal = isPlaying && !!activeCabalMeeting && !activeCabalMeeting.resolved;
  const proceedDisabled = hasPendingCritical || hasPendingCabal;
  const proceedReason = hasPendingCritical
    ? "Resolve all critical files in the Office tab before proceeding."
    : hasPendingCabal
      ? "Hear the morning cabal and set the line for the day before proceeding."
      : null;
  const headlines = state.headlines.length > 0 ? state.headlines : ["The day begins quietly in Aso Rock."];
  const unreadCount = state.inboxMessages.filter((message) => !message.read).length;

  const handleNavigate = (tab: string) => {
    // Clear profile stack when switching tabs
    clearStack();

    // Hub tabs go directly to their first sub-tab
    const hub = HUB_TABS[tab];
    if (hub) {
      setActiveTab(tab);
      setActiveSubTab(hub.defaultSub);
      return;
    }
    setActiveTab(tab);
    setActiveSubTab(null);
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

  const canProceed = !proceedDisabled;
  const proceedDisabledReason = proceedReason ?? "Cannot proceed right now";
  const handleProceed = endDay;

  const charClick = useCallback((sourceTab: string, sourceLabel: string) =>
    (characterKey: string) => handleCharacterClick(characterKey, sourceTab, sourceLabel),
    [handleCharacterClick]);

  function renderTabContent() {
    switch (activeTab) {
      case "villa": return <DecisionsTab />;
      case "cabinet": return <CabinetTab onCharacterClick={charClick("cabinet", "Cabinet")} />;
      case "politics":
        return <PoliticsTab onCharacterClick={charClick("politics", "Politics")} />;
      case "governance":
        if (activeSubTab === "economy") return <EconomyTab onCharacterClick={charClick("governance", "Economy")} />;
        if (activeSubTab === "infrastructure") return <InfrastructureTab />;
        if (activeSubTab === "health") return <HealthTab />;
        if (activeSubTab === "education") return <EducationTab />;
        return <EconomyTab onCharacterClick={charClick("governance", "Economy")} />;
      case "security":
        return <SecurityTab view={(activeSubTab as "intel" | "military" | "police") ?? "intel"} onCharacterClick={charClick("security", "Security")} />;
      case "legislature": return <LegislatureTab onCharacterClick={charClick("legislature", "Legislature")} />;
      case "judiciary": return <JudiciaryTab onCharacterClick={charClick("judiciary", "Judiciary")} />;
      case "diplomacy": return <DiplomacyTab onCharacterClick={charClick("diplomacy", "Diplomacy")} />;
      case "media":
        if (activeSubTab === "news") return <MediaTab onCharacterClick={charClick("media", "Media")} />;
        if (activeSubTab === "public-affairs") return <PublicAffairsTab onCharacterClick={charClick("media", "Public Affairs")} />;
        if (activeSubTab === "social-media") return <SocialMediaTab />;
        return <MediaTab onCharacterClick={charClick("media", "Media")} />;
      case "legacy": return <LegacyTab />;
      default: return <DecisionsTab />;
    }
  }

  // Current hub config (if active tab is a hub)
  const currentHub = HUB_TABS[activeTab];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar — full width */}
      <TopBar
        dark={dark}
        toggleDark={toggleDark}
      />

      {/* Below top bar: main area + sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Main content area — this scrolls */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Ticker */}
          <div className="bg-card border-b border-border overflow-hidden group/ticker">
            <div className="animate-scroll group-hover/ticker:[animation-play-state:paused] flex whitespace-nowrap py-1.5 px-4">
              {[...headlines, ...headlines].map((headline, index) => (
                <span key={`${headline}-${index}`} className="text-xs text-muted-foreground mx-3">
                  {headline} <span className="text-muted-foreground/40 mx-1">|</span>
                </span>
              ))}
            </div>
          </div>

          {/* Daily Summary card */}
          {state.dailySummary && (
            <div className="px-4 pt-4">
              <Card className="border border-border bg-muted/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily Brief</p>
                      <h2 className="text-sm font-semibold">{state.dailySummary.headline}</h2>
                    </div>
                    <p className="text-xs text-muted-foreground">Pending critical files: {state.dailySummary.pendingCritical}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">Term {state.term.current}</Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">{state.term.governingPhase.replace(/-/g, " ")}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">Election in {state.term.daysUntilElection}d</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">VP {state.vicePresident.mood}</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">Inflation {state.macroEconomy.inflation}%</Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">FX {state.macroEconomy.fxRate.toLocaleString()}</Badge>
                  </div>
                  <div className="grid gap-1 md:grid-cols-2">
                    {state.dailySummary.items.map((item) => (
                      <p key={item} className="text-xs text-muted-foreground">{item}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cabal Meeting card */}
          {activeCabalMeeting && (
            <div className="px-4 pt-4">
              <Card data-testid="cabal-meeting-card" className="border border-border bg-card/70 backdrop-blur-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 max-w-3xl">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Morning Cabal</p>
                      <h2 className="text-sm font-semibold">{activeCabalMeeting.title}</h2>
                      <p className="text-xs text-muted-foreground">{activeCabalMeeting.adviser} · {activeCabalMeeting.role}</p>
                      <p className="text-xs text-muted-foreground">{activeCabalMeeting.brief}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">{activeCabalMeeting.focus}</Badge>
                      <Badge variant={activeCabalMeeting.resolved ? "secondary" : "outline"} className="text-[10px] uppercase tracking-[0.18em]">
                        {activeCabalMeeting.resolved ? "Resolved" : "Awaiting line"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {activeCabalMeeting.choices.map((choice, index) => {
                      const recommended = activeCabalMeeting.recommendedChoiceId === choice.id;
                      return (
                        <Card key={choice.id} className="border border-border bg-muted/20">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">{choice.label}</p>
                              {recommended && <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.18em]">Recommended</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{choice.summary}</p>
                            <Button
                              data-testid={`cabal-choice-${index}`}
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              disabled={activeCabalMeeting.resolved}
                              onClick={() => resolveCabalChoice(index)}
                            >
                              Set This Line
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Breadcrumb navigation: profile breadcrumbs OR hub sub-tab breadcrumbs */}
          {isProfileOpen ? (
            <div className="px-4 pt-4">
              <ProfileBreadcrumbNav />
            </div>
          ) : (
            currentHub && activeSubTab && (
              <BreadcrumbNav
                hubName={currentHub.label}
                activeSubTab={activeSubTab}
                subTabs={currentHub.subTabs}
                onSelectSubTab={setActiveSubTab}
                onBackToHub={() => setActiveSubTab(currentHub.defaultSub)}
              />
            )
          )}

          {/* Tab content or Character Profile */}
          <div className="flex-1 p-4">
            <Suspense fallback={<TabFallback />}>
              {isProfileOpen && currentProfile ? (
                <CharacterProfile
                  characterKey={currentProfile.key}
                  sourceTab={currentProfile.sourceTab}
                  onCharacterClick={handleCharacterClick}
                />
              ) : (
                renderTabContent()
              )}
            </Suspense>
          </div>
        </div>

        {/* Right Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onProceed={handleProceed}
          canProceed={canProceed}
          proceedDisabledReason={proceedDisabledReason}
          onOpenInbox={() => setInboxOpen(true)}
          unreadCount={unreadCount}
        />
      </div>

      {/* Overlays */}
      <PerplexityAttribution />
      {showDailyBrief && (
        <DailyBrief onDismiss={() => setLastBriefedDay(state.day)} />
      )}
      <InboxPanel open={inboxOpen} onOpenChange={setInboxOpen} messages={state.inboxMessages} />
    </div>
  );
}
