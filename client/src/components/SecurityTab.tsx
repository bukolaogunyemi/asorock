import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useGame } from "@/lib/GameContext";
import { PersonnelCard } from "@/components/PersonnelCard";
import { getChainById } from "@/lib/eventChains";
import {
  AlertTriangle,
  Eye,
  Shield,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActiveEvent } from "@/lib/gameTypes";

interface SecurityTabProps {
  view?: "intel" | "military" | "police";
}

const ACTIONS = [
  { id: "emergency-powers", label: "Emergency Measures", blurb: "Centralise command for a short, sharp response." },
  { id: "reshuffle-cabinet", label: "Shake The Command Chain", blurb: "Reassert authority over weak or divided operators." },
  { id: "national-address", label: "Speak To The Nation", blurb: "Project calm and reduce panic after security shocks." },
  { id: "state-visit", label: "Field Inspection", blurb: "Travel to the theatre and force visible follow-through." },
] as const;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const severityBadge = (severity: ActiveEvent["severity"]) => {
  if (severity === "critical") return "destructive" as const;
  if (severity === "warning") return "outline" as const;
  return "secondary" as const;
};

const statusBadge = (score: number) => {
  if (score >= 66) return "default" as const;
  if (score >= 45) return "outline" as const;
  return "destructive" as const;
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

export default function SecurityTab({ view = "intel" }: SecurityTabProps) {
  const { toast } = useToast();
  const {
    state,
    canResolveChoice,
    executeQuickAction,
    resolveChainChoice,
    resolveEventChoice,
  } = useGame();

  const securityEvents = state.activeEvents.filter((event) => event.category === "security");
  const crisisChains = useMemo(() => state.activeChains
    .filter((instance) => !instance.resolved)
    .map((instance) => {
      const chain = getChainById(instance.chainId);
      if (!chain || chain.category !== "crisis") return null;
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

  const threatAxes = useMemo(() => {
    const coupRisk = state.failureRisks["military-coup"] ?? 0;
    return [
      { axis: "Insurgency", value: clamp(Math.round((100 - state.stability) * 0.08 + 3), 2, 10) },
      { axis: "Civil Unrest", value: clamp(Math.round(state.outrage * 0.08 + (100 - state.trust) * 0.03), 2, 10) },
      { axis: "Coup Risk", value: clamp(Math.round(coupRisk * 0.1), 1, 10) },
      { axis: "Sabotage", value: clamp(Math.round(securityEvents.length * 2 + (100 - state.approval) * 0.03), 2, 10) },
      { axis: "Border Pressure", value: clamp(Math.round((100 - state.trust) * 0.05 + 3), 2, 10) },
      { axis: "Kidnapping", value: clamp(Math.round((100 - state.stability) * 0.06 + (100 - state.approval) * 0.03), 2, 10) },
    ];
  }, [securityEvents.length, state.approval, state.failureRisks, state.outrage, state.stability, state.trust]);

  const theaters = useMemo(() => {
    const zoneNotes: Record<string, string> = {
      "North-West": "Bandit corridors, farmer-herder reprisals, highway kidnappings",
      "North-East": "Counter-insurgency, humanitarian access, hold territory",
      "North-Central": "Communal violence and transport corridor disruption",
      "South-West": "Urban intelligence, ports, critical infrastructure",
      "South-East": "Separatist agitation, targeted raids, legitimacy deficit",
      "South-South": "Pipeline sabotage, piracy, oil corridor protection",
    };

    return state.governors.map((governor) => {
      const effectiveness = Math.round(clamp(
        governor.loyalty * 0.35 + governor.competence * 0.25 + state.stability * 0.3 - state.outrage * 0.12,
        18,
        92,
      ));
      return {
        zone: governor.zone,
        commander: governor.name,
        troops: Math.round(6200 + governor.competence * 40 + (100 - state.stability) * 55),
        effectiveness,
        status: effectiveness >= 66 ? "Holding" : effectiveness >= 45 ? "Stretched" : "Fragile",
        note: zoneNotes[governor.zone] ?? "National pressure point",
      };
    });
  }, [state.governors, state.outrage, state.stability]);

  const incidentBoard = useMemo(() => {
    const relevantEntries = [...state.turnLog]
      .filter((entry) => entry.category === "event" || entry.category === "system" || /security|bandit|military|attack|crisis/i.test(entry.event))
      .slice(-6)
      .reverse();

    if (relevantEntries.length > 0) {
      return relevantEntries.map((entry, index) => ({
        id: `${entry.day}-${index}`,
        title: entry.event,
        note: entry.effects[0] ?? "Security services are adjusting to the latest pressure.",
        urgency: /betrayal|crisis|fragile|anger/i.test(`${entry.event} ${entry.effects.join(" ")}`) ? "High" : "Medium",
      }));
    }

    return [
      {
        id: "fallback-security-brief",
        title: "Security apparatus is awaiting a new instruction",
        note: "No fresh security incident has entered the log yet, but stability is still shaping national risk.",
        urgency: "Medium",
      },
    ];
  }, [state.turnLog]);

  const commandTeam = useMemo(() => {
    const orderedNames = [
      "Brig. Kabiru Musa (Rtd)",
      "Gen. Yakubu Musa (Rtd)",
      "Barr. Funke Adeyemi",
      "Gov. Musa Garba",
    ];
    return orderedNames
      .map((name) => state.characters[name])
      .filter(Boolean)
      .map((character) => ({
        ...character,
        brief:
          character.name === "Brig. Kabiru Musa (Rtd)"
            ? "Pressing for a harder doctrine and faster authority loops."
            : character.name === "Gen. Yakubu Musa (Rtd)"
              ? "Measures you by whether field pressure eases rather than speeches land."
              : character.name === "Barr. Funke Adeyemi"
                ? "Wants legal cover for every exceptional measure you are considering."
                : "Watching whether the federation still looks governable from the states.",
      }));
  }, [state.characters]);

  const coupRisk = state.failureRisks["military-coup"] ?? 0;
  const popularRisk = state.failureRisks["popular-revolution"] ?? 0;

  const runAction = (actionId: (typeof ACTIONS)[number]["id"], label: string) => {
    executeQuickAction(actionId);
    toast({ title: label, description: "Security directive issued. Watch the next daily brief for consequences." });
  };

  const coolingDown = (actionId: string) => {
    const lastUsed = state.lastActionAtDay[actionId];
    return lastUsed !== undefined && state.day - lastUsed < 2;
  };

  // INTEL view: Overview KPIs + Security Files + Directives + Incident Board + Pressure Chart
  if (view === "intel") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="security-kpis">
          {[
            { label: "National Stability", value: `${state.stability}%`, note: "The broadest measure of coercive order and compliance." },
            { label: "Coup Risk", value: `${coupRisk}%`, note: "Driven by command loyalty, approval, and institutional stress." },
            { label: "Popular Blowback", value: `${popularRisk}%`, note: "Public anger can now spill into the street without warning." },
            { label: "Critical Files", value: `${securityEvents.length}`, note: "Security crises still waiting for a decision in the Office." },
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
          <Card className="border border-border" data-testid="security-live-files-card">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-semibold">Security Files</CardTitle>
                <Badge variant="outline" className="text-xs">{securityEvents.length} live</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {securityEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No dedicated security event is waiting right now. Keep an eye on stability, field sentiment, and the next crisis chain trigger.</p>
              ) : (
                securityEvents.map((event) => (
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
                                data-testid={`security-event-${event.id}-choice-${index}`}
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

              {crisisChains.length > 0 && (
                <Card className="border border-border bg-muted/20" data-testid="security-crisis-chain-card">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive" className="text-xs">chain</Badge>
                      <p className="text-sm font-semibold">{crisisChains[0].title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{crisisChains[0].narrative}</p>
                    <div className="grid gap-2">
                      {crisisChains[0].choices.map((choice, index) => {
                        const enabled = canResolveChoice(choice.requirements);
                        return (
                          <Button
                            key={`${crisisChains[0].chainId}-${index}`}
                            data-testid={`security-chain-${crisisChains[0].chainId}-choice-${index}`}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                            disabled={!enabled}
                            onClick={() => {
                              resolveChainChoice(crisisChains[0].chainId, index);
                              toast({ title: crisisChains[0].title, description: "Chain decision recorded." });
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

          <Card className="border border-border" data-testid="security-directives-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Security Directives</CardTitle>
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
                        data-testid={`security-action-${action.id}`}
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

        {/* Incident Board + Pressure Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
          <Card className="border border-border" data-testid="security-incidents-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Incident Board</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {incidentBoard.map((incident) => (
                <div key={incident.id} className="rounded-md border border-border bg-muted/20 p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{incident.title}</p>
                    <Badge variant={incident.urgency === "High" ? "destructive" : "outline"} className="text-[11px]">{incident.urgency}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{incident.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="security-pressure-chart-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Pressure Indicators</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={threatAxes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="axis" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(210, 70%, 50%)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Alert variant={coupRisk >= 70 ? "destructive" : "default"} className="py-3 px-4" data-testid="security-warning">
          <Siren className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">National Security Warning</AlertTitle>
          <AlertDescription className="text-xs">
            Command cohesion is being measured against stability, public anger, and whether crises keep outpacing your response tempo. A bad few turns from here can turn fragility into a constitutional emergency.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // MILITARY view: Threat Map + Theaters + Command Team + State Relations
  if (view === "military") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="border border-border" data-testid="security-threat-radar-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Threat Map</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={threatAxes} outerRadius={92}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Radar dataKey="value" stroke="hsl(0, 60%, 50%)" fill="hsl(0, 60%, 50%)" fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="security-theaters-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Operational Theaters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Zone</TableHead>
                    <TableHead className="text-xs">Commander</TableHead>
                    <TableHead className="text-xs text-right">Troops</TableHead>
                    <TableHead className="text-xs text-center">Effectiveness</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {theaters.map((theater) => (
                    <TableRow key={theater.zone}>
                      <TableCell className="text-sm font-medium">{theater.zone}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{theater.commander}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">{theater.troops.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-center tabular-nums">{theater.effectiveness}%</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge(theater.effectiveness)} className="text-xs">{theater.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <Card className="border border-border" data-testid="security-command-team-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Command Team</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
              {commandTeam.map((person) => (
                <PersonnelCard
                  key={person.name}
                  name={person.name}
                  avatar={person.avatar}
                  title={person.portfolio}
                  age={person.age}
                  state={person.state}
                  gender={person.gender}
                  competencies={person.competencies}
                  relationship={person.relationship}
                  faction={person.faction}
                  traits={person.traits}
                  note={person.brief}
                  className="bg-muted/20"
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="security-state-relations-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">State Security Relations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {state.governors.map((governor) => (
                <div key={governor.name} className="rounded-md border border-border bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{governor.name}</p>
                      <p className="text-xs text-muted-foreground">{governor.zone}</p>
                    </div>
                    <Badge variant={statusBadge(governor.loyalty)} className="text-xs">{governor.relationship}</Badge>
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Loyalty</span>
                      <span className="tabular-nums">{governor.loyalty}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-[hsl(210,70%,50%)]" style={{ width: `${governor.loyalty}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Current ask: {governor.demands}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // POLICE view: placeholder
  return (
    <div className="space-y-4">
      <Card><CardContent className="p-8 text-center text-muted-foreground">
        <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">Police Command</p>
        <p className="text-sm mt-1">Nigeria Police Force oversight, zonal commands, community policing, and internal affairs will be available here.</p>
      </CardContent></Card>
    </div>
  );
}
