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
import { AlertTriangle, Briefcase, Key, Search, Users } from "lucide-react";
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
] as const;

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
    executeQuickAction,
    resolveChainChoice,
    resolveEventChoice,
    startHookInvestigation,
    useHook,
  } = useGame();
  const [subTab, setSubTab] = useState<(typeof POL_SUBTABS)[number]["id"]>("overview");

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

  const powerBrokers = useMemo(() => Object.values(state.characters)
    .map((character) => ({
      ...character,
      score: Math.round(character.ambition * 0.45 + character.competence * 0.2 + (100 - character.loyalty) * 0.35),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6), [state.characters]);

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

      {subTab === "brokers" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
          <Card className="border border-border" data-testid="politics-brokers-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Power Brokers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
              {powerBrokers.map((broker) => (
                <Card key={broker.name} className="border border-border bg-muted/20">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <CharacterAvatar name={broker.name} initials={broker.avatar} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{broker.name}</p>
                        <p className="text-xs text-muted-foreground">{broker.portfolio}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <CompetencyBar value={broker.loyalty} label="Loyalty" />
                      <CompetencyBar value={broker.competence} label="Competence" />
                      <CompetencyBar value={broker.ambition} label="Ambition" />
                    </div>
                    <RelationshipIndicator relationship={broker.relationship} />
                    <p className="text-xs text-muted-foreground">Broker score {broker.score}. This actor matters because ambition, competence, and disloyalty are combining into leverage.</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="politics-faction-notes-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Pressure Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {factionRows.slice(0, 5).map((faction) => (
                <div key={faction.name} className="rounded-md border border-border bg-muted/20 p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{faction.name}</p>
                    <Badge variant={factionBadge(faction.loyalty)} className="text-[11px]">tension {faction.tension}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Influence {faction.influence}. Loyalty {faction.loyalty}. When this bloc moves, it changes both your legislature and your succession anxiety at once.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
