import { Suspense, lazy, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/TopBar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import InboxPanel from "@/components/InboxPanel";
import { useGame } from "@/lib/GameContext";
import DailyBrief from "@/components/DailyBrief";
import NPCDetailDrawer from "@/components/NPCDetailDrawer";
import type { CharacterState } from "@/lib/GameContext";
import {
  Home as HomeIcon,
  Briefcase,
  Users,
  Landmark,
  Shield,
  Building2,
  Scale,
  Globe,
  Newspaper,
  Megaphone,
  Trophy,
  ArrowRight,
} from "lucide-react";

const DashboardTab = lazy(() => import("@/components/DashboardTab"));
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

interface HomeProps {
  dark: boolean;
  toggleDark: () => void;
}

const tabItems: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "decisions", label: "Office", icon: Briefcase },
  { value: "cabinet", label: "Cabinet", icon: Users },
  { value: "politics", label: "Politics", icon: Landmark },
  { value: "economy", label: "Economy", icon: Building2 },
  { value: "security", label: "Security", icon: Shield },
  { value: "legislature", label: "Legislature", icon: Scale },
  { value: "judiciary", label: "Judiciary", icon: Scale },
  { value: "diplomacy", label: "Diplomacy", icon: Globe },
  { value: "media", label: "Media", icon: Newspaper },
  { value: "public", label: "Public Affairs", icon: Megaphone },
  { value: "legacy", label: "Legacy", icon: Trophy },
];

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

export default function Home({ dark, toggleDark }: HomeProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inboxOpen, setInboxOpen] = useState(false);
  const { state, endDay, resolveCabalChoice } = useGame();

  const isPlaying = state.phase === "playing";
  const [lastBriefedDay, setLastBriefedDay] = useState(state.day);
  const showDailyBrief = isPlaying && state.day > 1 && state.day > lastBriefedDay;
  const [npcDrawerChar, setNpcDrawerChar] = useState<CharacterState | null>(null);
  const openNPCDetail = (name: string) => {
    const char = state.characters[name];
    if (char) setNpcDrawerChar(char);
  };
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

  return (
    <div className="min-h-screen bg-background">
      <TopBar dark={dark} toggleDark={toggleDark} onNavigate={setActiveTab} onOpenInbox={() => setInboxOpen(true)} unreadCount={unreadCount} />

      <div className="bg-card border-b border-border overflow-hidden group/ticker">
        <div className="animate-scroll group-hover/ticker:[animation-play-state:paused] flex whitespace-nowrap py-1.5 px-4">
          {[...headlines, ...headlines].map((headline, index) => (
            <span key={`${headline}-${index}`} className="text-xs text-muted-foreground mx-3">
              {headline} <span className="text-muted-foreground/40 mx-1">|</span>
            </span>
          ))}
        </div>
      </div>

      {state.dailySummary && (
        <div className="px-4 pt-4 max-w-[1600px] mx-auto">
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

      {activeCabalMeeting && (
        <div className="px-4 pt-4 max-w-[1600px] mx-auto">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="px-4 py-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
            <div className="inline-flex items-center gap-1">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                size="sm"
                className="text-xs h-9 px-3 gap-1.5"
                data-testid="tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
              >
                <HomeIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <TabsList className="inline-flex h-9 w-auto">
                {tabItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} data-testid={`tab-${tab.value}`} className="text-xs px-3 gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <div className="w-px h-5 bg-border mx-1" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button data-testid="proceed-btn" size="sm" className="text-xs h-9 px-3 gap-1.5" disabled={proceedDisabled} onClick={endDay}>
                        Proceed <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {proceedReason && (
                    <TooltipContent>
                      <p className="text-xs">{proceedReason}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <main className="px-4 py-4 max-w-[1600px] mx-auto">
          <Suspense fallback={<TabFallback />}>
            {activeTab === "dashboard" && <DashboardTab />}
            <TabsContent value="legacy"><LegacyTab /></TabsContent>
            <TabsContent value="cabinet"><CabinetTab /></TabsContent>
            <TabsContent value="politics"><PoliticsTab /></TabsContent>
            <TabsContent value="economy"><EconomyTab /></TabsContent>
            <TabsContent value="security"><SecurityTab /></TabsContent>
            <TabsContent value="legislature"><LegislatureTab /></TabsContent>
            <TabsContent value="judiciary"><JudiciaryTab /></TabsContent>
            <TabsContent value="diplomacy"><DiplomacyTab /></TabsContent>
            <TabsContent value="media"><MediaTab /></TabsContent>
            <TabsContent value="public"><PublicAffairsTab /></TabsContent>
            <TabsContent value="decisions"><DecisionsTab /></TabsContent>
          </Suspense>
        </main>
      </Tabs>

      <PerplexityAttribution />
      {showDailyBrief && (
        <DailyBrief onDismiss={() => setLastBriefedDay(state.day)} />
      )}
      <NPCDetailDrawer
        open={!!npcDrawerChar}
        onOpenChange={(open) => { if (!open) setNpcDrawerChar(null); }}
        character={npcDrawerChar}
      />
      <InboxPanel open={inboxOpen} onOpenChange={setInboxOpen} messages={state.inboxMessages} />
    </div>
  );
}
