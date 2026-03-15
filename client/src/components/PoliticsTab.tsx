import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { RelationshipIndicator } from "@/components/RelationshipIndicator";
import { useGame } from "@/lib/GameContext";
import { getChainById } from "@/lib/eventChains";
import { checkBetrayalRisk } from "@/lib/traits";
import type { Godfather } from "@/lib/godfatherTypes";
import { getPatronageEffects } from "@/lib/godfatherEngine";
import { AlertTriangle, Briefcase, Eye, Key, Search, Shield, Users, Crown, Megaphone } from "lucide-react";
import type { IntelOperationType } from "@/lib/intelligenceTypes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActiveEvent, Hook } from "@/lib/gameTypes";

const POL_SUBTABS = [
  { id: "overview", label: "Overview" },
  { id: "factions", label: "Factions" },
  { id: "intrigue", label: "Intrigue" },
  { id: "brokers", label: "Brokers" },
  { id: "intel", label: "Intelligence" },
] as const;

const OP_TYPE_META: Record<IntelOperationType, { label: string; blurb: string }> = {
  "investigate-person": { label: "Investigate Person", blurb: "Deep background check on a cabinet member or political figure." },
  "monitor-godfather": { label: "Monitor Godfather", blurb: "Sustained surveillance of a godfather network." },
  "counter-intel": { label: "Counter-Intelligence", blurb: "Detect and neutralise leaks inside the system." },
  "opposition-research": { label: "Opposition Research", blurb: "Gather strategic intelligence on opposition figures." },
  "media-intel": { label: "Media Intelligence", blurb: "Identify media sources and narrative strategies." },
  "security-assessment": { label: "Security Assessment", blurb: "Evaluate threat posture in a region or institution." },
};

const OP_COSTS: Record<IntelOperationType, number> = {
  "investigate-person": 8,
  "monitor-godfather": 12,
  "counter-intel": 6,
  "opposition-research": 10,
  "media-intel": 4,
  "security-assessment": 4,
};

const OP_DURATIONS: Record<IntelOperationType, number> = {
  "investigate-person": 21,
  "monitor-godfather": 30,
  "counter-intel": 14,
  "opposition-research": 21,
  "media-intel": 10,
  "security-assessment": 10,
};

const ACTIONS = [
  { id: "reshuffle-cabinet", label: "Reshuffle Power Centres", blurb: "Move pieces before rivals decide you are too weak to act." },
  { id: "probe-commission", label: "Open A Political Probe", blurb: "Use scrutiny to flush out sabotage and break momentum." },
  { id: "state-visit", label: "Work The Governors", blurb: "Spend political time in the federation and buy breathing room." },
  { id: "national-address", label: "Frame The Narrative", blurb: "Use public legitimacy to box in elite dissent." },
] as const;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const severityBadge = (severity: ActiveEvent["severity"]) => {
  if (severity === "critical") return "destructive" as const;
  if (severity === "warning") return "outline" as const;
  return "secondary" as const;
};

const factionBadge = (loyalty: number) => {
  if (loyalty >= 70) return "default" as const;
  if (loyalty >= 45) return "outline" as const;
  return "destructive" as const;
};

const hookBadge = (hook: Hook) => {
  if (hook.used) return "secondary" as const;
  if (hook.usable) return "default" as const;
  if (hook.underInvestigation) return "outline" as const;
  return "secondary" as const;
};

const hookStatus = (hook: Hook) => {
  if (hook.used) return "burned";
  if (hook.usable) return "usable";
  if (hook.underInvestigation) return "investigating";
  return "latent";
};

const formatRequirements = (requirements?: { metric: string; min?: number; max?: number }[]) => {
  if (!requirements?.length) return null;
  return requirements
    .map((requirement) => {
      if (requirement.min !== undefined) return `${requirement.metric} >= ${requirement.min}`;
      if (requirement.max !== undefined) return `${requirement.metric} <= ${requirement.max}`;
      return requirement.metric;
    })
    .join(" | ");
};

export default function PoliticsTab() {
  const { toast } = useToast();
  const {
    state,
    canResolveChoice,
    commissionOperation,
    executeQuickAction,
    resolveChainChoice,
    resolveEventChoice,
    startHookInvestigation,
    useHook,
  } = useGame();
  const [subTab, setSubTab] = useState<(typeof POL_SUBTABS)[number]["id"]>("overview");
  const [selectedGodfatherId, setSelectedGodfatherId] = useState<string | null>(null);

  const factionRows = useMemo(() => Object.values(state.factions)
    .map((faction) => ({
      ...faction,
      tension: clamp(Math.round((100 - faction.loyalty) * 0.75 + faction.influence * 0.4), 6, 96),
    }))
    .sort((a, b) => b.influence - a.influence), [state.factions]);

  const coalitionHealth = factionRows.length > 0
    ? Math.round(factionRows.reduce((sum, faction) => sum + faction.loyalty, 0) / factionRows.length)
    : 50;

  const politicsEvents = state.activeEvents.filter((event) => event.category === "politics" || event.category === "governance");
  const intrigueChains = useMemo(() => state.activeChains
    .filter((instance) => !instance.resolved)
    .map((instance) => {
      const chain = getChainById(instance.chainId);
      if (!chain || chain.category !== "intrigue") return null;
      return {
        chainId: instance.chainId,
        title: chain.title,
        narrative: chain.steps[instance.currentStepIndex]?.narrative ?? chain.steps[0]?.narrative ?? "",
        choices: chain.steps[instance.currentStepIndex]?.choices ?? [],
      };
    })
    .filter(Boolean), [state.activeChains]) as {
      chainId: string;
      title: string;
      narrative: string;
      choices: NonNullable<ReturnType<typeof getChainById>>["steps"][number]["choices"];
    }[];

  const betrayalRisks = checkBetrayalRisk(state).filter((risk) => risk.isAtRisk).slice(0, 4);

  const allHooks = useMemo(() => {
    const hooks: (Hook & { ownerName: string })[] = [];
    for (const [name, character] of Object.entries(state.characters)) {
      for (const hook of character.hooks) {
        hooks.push({ ...hook, ownerName: name });
      }
    }
    return hooks.sort((a, b) => b.evidence - a.evidence || (a.usable === b.usable ? 0 : a.usable ? -1 : 1));
  }, [state.characters]);

  const actionableHooks = allHooks.filter((hook) => hook.usable && !hook.used).length;
  const activeInvestigations = allHooks.filter((hook) => hook.underInvestigation).length;

  const suspiciousFeed = [...state.turnLog]
    .filter((entry) => entry.category === "chain" || entry.category === "decision" || entry.category === "hook" || /betrayal|rebellion|plot|governor|party/i.test(entry.event))
    .slice(-6)
    .reverse();

  const governorTable = [...state.governors]
    .map((governor) => ({
      ...governor,
      leverage: Math.round(clamp(governor.loyalty * 0.45 + governor.approval * 0.35 + (governor.party === "Opposition" ? 18 : 5), 8, 96)),
    }))
    .sort((a, b) => b.leverage - a.leverage);

  const runAction = (actionId: (typeof ACTIONS)[number]["id"], label: string) => {
    executeQuickAction(actionId);
    toast({ title: label, description: "Political directive issued. Coalition effects will surface across the next few turns." });
  };

  const coolingDown = (actionId: string) => {
    const lastUsed = state.lastActionAtDay[actionId];
    return lastUsed !== undefined && state.day - lastUsed < 2;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1" data-testid="politics-subtabs">
        {POL_SUBTABS.map((tab) => (
          <button
            key={tab.id}
            data-testid={`pol-subtab-${tab.id}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              subTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="politics-kpis">
            {[
              { label: "Coalition Health", value: `${coalitionHealth}%`, note: "Average faction loyalty across the ruling ecosystem." },
              { label: "Political Capital", value: `${state.politicalCapital}%`, note: "Your spendable leverage with elites and institutions." },
              { label: "Actionable Hooks", value: `${actionableHooks}`, note: "Dossiers that can be used immediately for leverage." },
              { label: "Live Investigations", value: `${activeInvestigations}`, note: "Quiet probes running inside the system right now." },
            ].map((metric) => (
              <Card key={metric.label} className="border border-border">
                <CardContent className="p-4 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
            <Card className="border border-border" data-testid="politics-live-files-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-semibold">Political Files</CardTitle>
                  <Badge variant="outline" className="text-xs">{politicsEvents.length} live</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {politicsEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">There is no fresh political file right now, but that usually means the next faction or governor flare-up is still gestating.</p>
                ) : (
                  politicsEvents.map((event) => (
                    <Card key={event.id} className="border border-border bg-muted/20">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={severityBadge(event.severity)} className="text-xs">{event.severity}</Badge>
                          <p className="text-sm font-semibold">{event.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <div className="grid gap-2">
                          {event.choices.map((choice, index) => {
                            const enabled = canResolveChoice(choice.requirements);
                            return (
                              <div key={`${event.id}-${choice.id}`} className="space-y-1">
                                <Button
                                  data-testid={`politics-event-${event.id}-choice-${index}`}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-xs"
                                  disabled={!enabled}
                                  onClick={() => {
                                    resolveEventChoice(event.id, index);
                                    toast({ title: choice.label, description: `${event.title} has been updated.` });
                                  }}
                                >
                                  {choice.label}
                                </Button>
                                <p className="text-[11px] text-muted-foreground">{choice.context}</p>
                                {!enabled && choice.requirements && (
                                  <p className="text-[11px] text-muted-foreground">Requires {formatRequirements(choice.requirements)}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {intrigueChains.length > 0 && (
                  <Card className="border border-border bg-muted/20" data-testid="politics-intrigue-chain-card">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">intrigue</Badge>
                        <p className="text-sm font-semibold">{intrigueChains[0].title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{intrigueChains[0].narrative}</p>
                      <div className="grid gap-2">
                        {intrigueChains[0].choices.map((choice, index) => {
                          const enabled = canResolveChoice(choice.requirements);
                          return (
                            <Button
                              key={`${intrigueChains[0].chainId}-${index}`}
                              data-testid={`politics-chain-${intrigueChains[0].chainId}-choice-${index}`}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs"
                              disabled={!enabled}
                              onClick={() => {
                                resolveChainChoice(intrigueChains[0].chainId, index);
                                toast({ title: intrigueChains[0].title, description: "Chain decision recorded." });
                              }}
                            >
                              {choice.label}
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border" data-testid="politics-directives-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Political Directives</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {ACTIONS.map((action) => {
                  const disabled = coolingDown(action.id);
                  return (
                    <Card key={action.id} className="border border-border bg-muted/20">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{action.label}</p>
                          {disabled && <Badge variant="secondary" className="text-[11px]">Cooling down</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{action.blurb}</p>
                        <Button
                          data-testid={`politics-action-${action.id}`}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          disabled={disabled}
                          onClick={() => runAction(action.id, action.label)}
                        >
                          Issue Directive
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {betrayalRisks.length > 0 && (
            <Alert variant="destructive" className="py-3 px-4" data-testid="politics-betrayal-warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-medium">Betrayal Pressure</AlertTitle>
              <AlertDescription className="text-xs">
                {betrayalRisks[0].characterName} is below their comfort threshold and has enough ambition to become a live threat. Quiet dossiers can now mature into usable leverage before that risk becomes an active crisis.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {subTab === "factions" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.95fr] gap-4">
          <Card className="border border-border" data-testid="politics-factions-chart-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Faction Map</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factionRows} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="loyalty" name="Loyalty" fill="hsl(210, 70%, 50%)" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                  <Bar dataKey="influence" name="Influence" fill="hsl(42, 70%, 50%)" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="politics-governors-table-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Governor Leverage</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Governor</TableHead>
                    <TableHead className="text-xs">Zone</TableHead>
                    <TableHead className="text-xs text-center">Leverage</TableHead>
                    <TableHead className="text-xs">Alignment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {governorTable.map((governor) => (
                    <TableRow key={governor.name}>
                      <TableCell className="text-sm font-medium">{governor.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{governor.zone}</TableCell>
                      <TableCell className="text-sm text-center tabular-nums">{governor.leverage}</TableCell>
                      <TableCell>
                        <Badge variant={factionBadge(governor.loyalty)} className="text-xs">{governor.relationship}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {subTab === "intrigue" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <Card className="border border-border" data-testid="politics-hooks-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Key className="h-4 w-4" /> Active Hooks & Secrets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {allHooks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No hook dossiers exist in this run yet.</p>
              ) : (
                allHooks.map((hook) => (
                  <div key={hook.id} className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{hook.target}</p>
                        <Badge variant={hookBadge(hook)} className="text-[11px]">{hookStatus(hook)}</Badge>
                        <Badge variant={hook.evidence >= 70 ? "default" : hook.evidence >= 40 ? "outline" : "secondary"} className="text-[11px]">evidence {hook.evidence}%</Badge>
                        <Badge variant="outline" className="text-[11px]">{hook.severity}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {!hook.used && !hook.underInvestigation && !hook.usable && (
                          <Button
                            data-testid={`politics-hook-${hook.id}-investigate`}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              startHookInvestigation(hook.ownerName, hook.id);
                              toast({ title: `Probe opened on ${hook.target}`, description: "Evidence will accumulate in the background over the next few turns." });
                            }}
                          >
                            Open Probe
                          </Button>
                        )}
                        {hook.usable && !hook.used && (
                          <Button
                            data-testid={`politics-hook-${hook.id}-use`}
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              useHook(hook.ownerName, hook.id);
                              toast({ title: `Pressure applied to ${hook.target}`, description: "The political system has been updated." });
                            }}
                          >
                            Apply Pressure
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{hook.description}</p>
                    <p className="text-[11px] text-muted-foreground">Subject: {hook.ownerName}. Type: {hook.type}. {hook.underInvestigation ? "The file is actively being worked." : hook.used ? "This hook has already been spent." : hook.usable ? "The dossier is ripe for use." : "The file exists but still needs evidence."}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="politics-suspicious-feed-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search className="h-4 w-4" /> Suspicious Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {suspiciousFeed.length === 0 ? (
                <p className="text-xs text-muted-foreground">No suspicious movement has been logged yet. The quiet itself is suspicious.</p>
              ) : (
                suspiciousFeed.map((entry) => (
                  <div key={`${entry.day}-${entry.event}`} className="rounded-md border border-border bg-muted/20 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{entry.event}</p>
                      <Badge variant="outline" className="text-[11px]">Day {entry.day}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.effects[0] ?? "No extra note was recorded."}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {subTab === "brokers" && (() => {
        const patronage = state.patronage;
        const effects = getPatronageEffects(patronage.patronageIndex);
        const godfathers = patronage.godfathers;
        const selectedGodfather = godfathers.find((g) => g.id === selectedGodfatherId) ?? null;

        const tierColor: Record<string, string> = {
          clean: "#22c55e",
          pragmatic: "#eab308",
          compromised: "#f97316",
          captured: "#ef4444",
        };
        const tierBarColor = tierColor[effects.tier] ?? "#22c55e";

        const dispositionColor: Record<string, string> = {
          friendly: "#22c55e",
          neutral: "#9ca3af",
          cold: "#f97316",
          hostile: "#ef4444",
        };

        const archetypeIcon = (archetype: Godfather["archetype"]) => {
          switch (archetype) {
            case "business-oligarch": return "💰";
            case "military-elder": return "🎖️";
            case "party-boss": return "🏛️";
            case "labour-civil": return "✊";
            case "religious-leader": return "🕌";
            case "regional-strongman": return "👑";
            case "media-mogul": return "📡";
            default: return "👤";
          }
        };

        const archetypeLabel = (archetype: Godfather["archetype"]) =>
          archetype.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

        return (
          <div className="space-y-4">
            {/* Patronage Index Meter */}
            <Card className="border border-[#0A4D2C]/20" data-testid="politics-patronage-meter">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#C5A55A]" />
                    <p className="text-sm font-semibold">Patronage Index</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-xs capitalize"
                      style={{ backgroundColor: tierBarColor, color: effects.tier === "clean" || effects.tier === "pragmatic" ? "#000" : "#fff" }}
                    >
                      {effects.tier}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums text-[#C5A55A]">{patronage.patronageIndex}</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${patronage.patronageIndex}%`, backgroundColor: tierBarColor }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{effects.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Active Deals: <strong className="text-foreground">{patronage.activeDeals}</strong></span>
                  <span>Scandal Risk: <strong className="text-foreground">{Math.round(effects.scandalRisk * 100)}%</strong></span>
                  {effects.approvalCeiling !== undefined && (
                    <span>Approval Ceiling: <strong className="text-foreground">{effects.approvalCeiling}%</strong></span>
                  )}
                  {effects.stabilityPenalty !== 0 && (
                    <span>Stability Penalty: <strong className="text-red-500">{effects.stabilityPenalty}/turn</strong></span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
              {/* Godfather Grid */}
              <Card className="border border-[#0A4D2C]/20" data-testid="politics-godfathers-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4 text-[#C5A55A]" /> Godfathers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {godfathers.length === 0 ? (
                    <p className="text-xs text-muted-foreground col-span-full">No godfather networks have been identified yet.</p>
                  ) : (
                    godfathers.map((gf) => {
                      const isSelected = selectedGodfatherId === gf.id;
                      return (
                        <button
                          key={gf.id}
                          data-testid={`godfather-card-${gf.id}`}
                          className={`text-left rounded-lg border p-3 space-y-2 transition-colors cursor-pointer ${
                            gf.neutralized
                              ? "opacity-60 bg-muted/30 border-border"
                              : isSelected
                                ? "border-[#C5A55A] bg-[#0A4D2C]/5 ring-1 ring-[#C5A55A]/40"
                                : "border-border bg-muted/20 hover:border-[#0A4D2C]/40"
                          }`}
                          onClick={() => setSelectedGodfatherId(isSelected ? null : gf.id)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg">{archetypeIcon(gf.archetype)}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{gf.name}</p>
                                <p className="text-[11px] text-muted-foreground">{archetypeLabel(gf.archetype)}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <Badge variant="outline" className="text-[11px] font-mono">{gf.zone}</Badge>
                              {gf.neutralized && (
                                <Badge variant="secondary" className="text-[11px]">Neutralized</Badge>
                              )}
                            </div>
                          </div>

                          {/* Disposition indicator */}
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: dispositionColor[gf.disposition] }}
                            />
                            <span className="text-[11px] text-muted-foreground capitalize">{gf.disposition}</span>
                          </div>

                          {/* Influence score bar */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Influence</span>
                              <span className="text-[11px] tabular-nums text-muted-foreground">{gf.influenceScore}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#C5A55A]"
                                style={{ width: `${clamp(gf.influenceScore, 0, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Escalation stage dots */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground mr-1">Escalation</span>
                            {[0, 1, 2, 3, 4].map((stage) => (
                              <span
                                key={stage}
                                className={`h-2 w-2 rounded-full ${
                                  stage <= gf.escalationStage
                                    ? stage >= 3
                                      ? "bg-red-500"
                                      : stage >= 2
                                        ? "bg-orange-400"
                                        : "bg-[#0A4D2C]"
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Selected Godfather Detail Panel */}
              <Card className="border border-[#0A4D2C]/20" data-testid="politics-godfather-detail-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#C5A55A]" /> Godfather Dossier
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {!selectedGodfather ? (
                    <p className="text-xs text-muted-foreground">Select a godfather to view their full dossier, connections, and active contracts.</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{archetypeIcon(selectedGodfather.archetype)}</span>
                        <div>
                          <p className="text-sm font-semibold">{selectedGodfather.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {archetypeLabel(selectedGodfather.archetype)} &middot; {selectedGodfather.zone} &middot;{" "}
                            <span style={{ color: dispositionColor[selectedGodfather.disposition] }} className="capitalize font-medium">
                              {selectedGodfather.disposition}
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">{selectedGodfather.description}</p>

                      {/* Traits */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Traits</p>
                        {(["aggression", "loyalty", "greed", "visibility"] as const).map((trait) => (
                          <div key={trait} className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground w-16 capitalize">{trait}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${clamp(selectedGodfather.traits[trait], 0, 100)}%`,
                                  backgroundColor:
                                    trait === "aggression" || trait === "greed"
                                      ? selectedGodfather.traits[trait] > 70
                                        ? "#ef4444"
                                        : "#f97316"
                                      : "#0A4D2C",
                                }}
                              />
                            </div>
                            <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">{selectedGodfather.traits[trait]}</span>
                          </div>
                        ))}
                      </div>

                      {/* Deal style and favour debt */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[11px]">
                          {selectedGodfather.dealStyle === "contract" ? "Contract Dealer" : "Favour Banker"}
                        </Badge>
                        {selectedGodfather.favourDebt > 0 && (
                          <Badge variant="destructive" className="text-[11px]">
                            Favour Debt: {selectedGodfather.favourDebt}
                          </Badge>
                        )}
                      </div>

                      {/* Connections (revealed only) */}
                      {selectedGodfather.stable.connections.filter((c) => c.revealed).length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Known Connections</p>
                          {selectedGodfather.stable.connections
                            .filter((c) => c.revealed)
                            .map((conn, i) => (
                              <div key={i} className="rounded-md border border-border bg-muted/20 p-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] shrink-0">{conn.entityType}</Badge>
                                <p className="text-xs text-muted-foreground">{conn.description}</p>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Active contracts */}
                      {selectedGodfather.activeContracts.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Active Contracts</p>
                          {selectedGodfather.activeContracts.map((contract) => {
                            const daysLeft = contract.deadlineDay - state.day;
                            return (
                              <div key={contract.id} className="rounded-md border border-border bg-muted/20 p-2 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-medium">{contract.description}</p>
                                  <Badge
                                    variant={daysLeft <= 3 ? "destructive" : "outline"}
                                    className="text-[10px] shrink-0"
                                  >
                                    {daysLeft > 0 ? `${daysLeft}d left` : "overdue"}
                                  </Badge>
                                </div>
                                <div className="flex gap-2 text-[10px] text-muted-foreground">
                                  <span>GF delivered: {contract.deliveredByGodfather ? "Yes" : "No"}</span>
                                  <span>You delivered: {contract.playerDelivered ? "Yes" : "No"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Stable summary */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Political Stable</p>
                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          <span>Governors: <strong className="text-foreground">{selectedGodfather.stable.governors.length}</strong></span>
                          <span>House bloc: <strong className="text-foreground">{selectedGodfather.stable.legislativeBloc.house}</strong></span>
                          <span>Senate bloc: <strong className="text-foreground">{selectedGodfather.stable.legislativeBloc.senate}</strong></span>
                          <span>Cabinet candidates: <strong className="text-foreground">{selectedGodfather.stable.cabinetCandidates.length}</strong></span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })()}

      {subTab === "intel" && (() => {
        const intel = state.intelligence;
        const dniCharacter = intel.dniId ? state.characters[intel.dniId] : null;
        const dniName = dniCharacter?.name ?? (intel.dniId || "No DNI Appointed");
        const activeOps = intel.activeOperations;
        const recentResults = [...intel.completedOperations].slice(-5).reverse();
        const canCommission = intel.dniId !== null && activeOps.length < intel.maxConcurrentOps;

        return (
          <div className="space-y-4">
            {/* DNI Status Card */}
            <Card className="border border-[#0A4D2C]/20" data-testid="intel-dni-status">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#C5A55A]" />
                    <p className="text-sm font-semibold">Director of National Intelligence</p>
                  </div>
                  <Badge variant={intel.dniId ? "default" : "secondary"} className="text-xs">
                    {intel.dniId ? "Active" : "Vacant"}
                  </Badge>
                </div>

                <p className="text-base font-semibold">{dniName}</p>

                {intel.dniId && (
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Competence</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{intel.dniCompetence}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0A4D2C]"
                          style={{ width: `${clamp(intel.dniCompetence, 0, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Loyalty</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{intel.dniLoyalty}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${clamp(intel.dniLoyalty, 0, 100)}%`,
                            backgroundColor: intel.dniLoyalty >= 60 ? "#0A4D2C" : intel.dniLoyalty >= 35 ? "#eab308" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Active Ops: <strong className="text-foreground">{activeOps.length}/{intel.maxConcurrentOps}</strong></span>
                      <span>Completed: <strong className="text-foreground">{intel.completedOperations.length}</strong></span>
                    </div>
                  </div>
                )}

                {!intel.dniId && (
                  <p className="text-xs text-muted-foreground">
                    No Director of National Intelligence has been appointed. Intelligence operations cannot be commissioned until a DNI is in place.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
              {/* Active Operations */}
              <Card className="border border-[#0A4D2C]/20" data-testid="intel-active-operations">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#C5A55A]" /> Active Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {activeOps.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No intelligence operations are currently running.</p>
                  ) : (
                    activeOps.map((op) => {
                      const elapsed = Math.max(0, state.day - op.startDay);
                      const totalDuration = Math.max(1, op.estimatedEndDay - op.startDay);
                      const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
                      const daysRemaining = Math.max(0, op.estimatedEndDay - state.day);
                      return (
                        <div key={op.id} className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{OP_TYPE_META[op.type]?.label ?? op.type}</p>
                              <Badge
                                variant={op.successProbability >= 70 ? "default" : op.successProbability >= 55 ? "outline" : "destructive"}
                                className="text-[11px]"
                              >
                                {op.successProbability}% success
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-[11px] tabular-nums">
                              {daysRemaining}d remaining
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{op.targetDescription}</p>
                          <div className="space-y-0.5">
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#C5A55A] transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground text-right tabular-nums">{progress}% complete</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Commission New Operation */}
              <Card className="border border-[#0A4D2C]/20" data-testid="intel-commission-panel">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#C5A55A]" /> Commission Operation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {!canCommission && intel.dniId && (
                    <p className="text-xs text-muted-foreground">All operation slots are in use. Wait for a current operation to conclude.</p>
                  )}
                  {!intel.dniId && (
                    <p className="text-xs text-muted-foreground">Appoint a DNI before commissioning operations.</p>
                  )}
                  {(Object.keys(OP_TYPE_META) as IntelOperationType[]).map((opType) => {
                    const meta = OP_TYPE_META[opType];
                    const cost = OP_COSTS[opType];
                    const duration = OP_DURATIONS[opType];
                    return (
                      <div key={opType} className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{meta.label}</p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] tabular-nums">{cost} PC</Badge>
                            <Badge variant="outline" className="text-[10px] tabular-nums">~{duration}d</Badge>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{meta.blurb}</p>
                        <Button
                          data-testid={`intel-commission-${opType}`}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          disabled={!canCommission}
                          onClick={() => {
                            commissionOperation(opType, undefined, meta.label);
                            toast({ title: `Operation Commissioned`, description: `${meta.label} has been authorised. The DNI will report when results are available.` });
                          }}
                        >
                          Commission
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <Card className="border border-[#0A4D2C]/20" data-testid="intel-recent-results">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#C5A55A]" /> Recent Intelligence Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {recentResults.map((result) => (
                    <div key={result.operationId} className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium">{OP_TYPE_META[result.type]?.label ?? result.type}</p>
                        <Badge
                          variant={result.success ? "default" : result.exposed ? "destructive" : "secondary"}
                          className="text-[11px]"
                        >
                          {result.success ? "Success" : result.exposed ? "Exposed" : "Failed"}
                        </Badge>
                      </div>
                      {result.findings.length > 0 ? (
                        <div className="space-y-1">
                          {result.findings.map((finding, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] mr-1.5">{finding.type}</Badge>
                              {finding.description}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {result.exposed
                            ? "The operation was detected. Expect political fallout."
                            : "No actionable intelligence was recovered."}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}
    </div>
  );
}
