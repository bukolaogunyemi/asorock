import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { loadGameStateFromFile, downloadGameState } from "@/lib/gamePersistence";
import { useGame } from "@/lib/GameContext";
import { turnInfo } from "@/lib/gameData";
import {
  Sun,
  Moon,
  TrendingDown,
  Landmark,
  ShieldAlert,
  ChevronRight,
  Mail,
  Upload,
  Download,
  Clock3,
} from "lucide-react";

interface TopBarProps {
  dark: boolean;
  toggleDark: () => void;
  onNavigate: (tab: string) => void;
  onOpenInbox?: () => void;
  unreadCount?: number;
}

export default function TopBar({ dark, toggleDark, onNavigate, onOpenInbox, unreadCount = 0 }: TopBarProps) {
  const { toast } = useToast();
  const { state, loadGameState } = useGame();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPlaying = state.phase === "playing" || state.phase === "victory" || state.phase === "defeat";

  const currentDate = isPlaying ? state.date : turnInfo.currentDate;
  const approval = isPlaying ? state.approval : 43;
  const treasury = isPlaying ? state.treasury : 1.1;
  const approvalHistory = isPlaying ? state.approvalHistory : [];
  const approvalDelta = approvalHistory.length >= 2 ? approvalHistory[approvalHistory.length - 1].approval - approvalHistory[approvalHistory.length - 2].approval : 0;
  const criticalEvents = isPlaying ? state.activeEvents.filter((event) => event.severity === "critical").length : 1;
  const securityLabel = !isPlaying
    ? "Elevated"
    : state.stability >= 65
    ? "Stable"
    : state.stability >= 45
    ? "Elevated"
    : "Fragile";
  const securityTone = securityLabel === "Stable"
    ? "text-green-600 dark:text-green-400"
    : securityLabel === "Elevated"
    ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";
  const promiseDelivered = isPlaying ? state.campaignPromises.filter((promise) => promise.status === "fulfilled").length : 0;
  const promiseBroken = isPlaying ? state.campaignPromises.filter((promise) => promise.status === "broken").length : 0;

  const handleExport = () => {
    if (!isPlaying) {
      toast({ title: "No active presidency", description: "Start a campaign before exporting a save." });
      return;
    }
    downloadGameState(state);
    toast({ title: "Save exported", description: `Downloaded a save for Day ${state.day}.` });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const loadedState = await loadGameStateFromFile(file);
      loadGameState(loadedState);
      toast({ title: "Save loaded", description: `Restored the presidency at Day ${loadedState.day}.` });
    } catch {
      toast({ title: "Import failed", description: "That file is not a valid Aso Rock save." });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3 space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Aso Rock</h1>
          {isPlaying ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Day {state.day} of your presidency</p>
              <p className="text-xs text-muted-foreground">
                Term {state.term.current} · {state.term.governingPhase.replace(/-/g, " ")} phase · election in {state.term.daysUntilElection} day{state.term.daysUntilElection === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-xs text-muted-foreground tabular-nums">{currentDate}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" /> Export Save
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Import Save
          </Button>
          <Button
            data-testid="inbox-btn"
            variant="ghost"
            size="icon"
            onClick={onOpenInbox}
            aria-label="Open inbox"
            className="relative"
          >
            <Mail className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button data-testid="dark-mode-toggle" variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-stretch">
        <Card className="group flex-1 min-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onNavigate("legacy")}>
          <CardContent className="relative p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5" /> Approval
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {approval}% <span className={approvalDelta < 0 ? "text-destructive text-sm" : "text-green-600 dark:text-green-400 text-sm"}>{approvalDelta >= 0 ? `(+${approvalDelta})` : `(${approvalDelta})`}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalEvents > 0 ? `${criticalEvents} critical file${criticalEvents > 1 ? "s" : ""} still unresolved.` : "No critical blockers in the current inbox."}
            </p>
            <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
          </CardContent>
        </Card>

        <Card className="group flex-1 min-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onNavigate("economy")}>
          <CardContent className="relative p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" /> Treasury
            </div>
            <div className="text-lg font-semibold tabular-nums">₦{treasury.toFixed(2)}T liquid</div>
            <p className="text-xs text-muted-foreground">
              {isPlaying ? `Trust ${state.trust}% and outrage ${state.outrage}% are shaping market confidence.` : "Debt service this month: ₦540B."}
            </p>
            <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
          </CardContent>
        </Card>

        <Card className="group flex-1 min-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onNavigate("security")}>
          <CardContent className="relative p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" /> Security
            </div>
            <div className={`text-lg font-semibold ${securityTone}`}>{securityLabel}</div>
            <p className="text-xs text-muted-foreground">
              {isPlaying ? `National stability is ${state.stability} with ${criticalEvents} live pressure point${criticalEvents === 1 ? "" : "s"}.` : "Banditry spike in the North-West; piracy stable."}
            </p>
            <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
          </CardContent>
        </Card>

        <Card className="group flex-1 min-w-[220px] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onNavigate("legacy")}>
          <CardContent className="relative p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" /> Strategic Horizon
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {isPlaying ? `${state.term.daysUntilElection}d` : "1,460d"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPlaying
                ? `VP ${state.vicePresident.name} is ${state.vicePresident.mood.toLowerCase()}. Promises: ${promiseDelivered} delivered, ${promiseBroken} broken.`
                : "Term pressure, succession risk, and campaign promises will accumulate here."}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {isPlaying ? <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">Term {state.term.current}</Badge> : null}
              {isPlaying ? <Badge variant="secondary" className="text-[10px] capitalize">{state.term.governingPhase.replace(/-/g, " ")}</Badge> : null}
            </div>
            <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
          </CardContent>
        </Card>
      </div>
    </header>
  );
}
