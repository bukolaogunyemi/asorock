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
import { useGame } from "@/lib/GameContext";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { RelationshipIndicator } from "@/components/RelationshipIndicator";
import { AlertTriangle, ChevronDown, Landmark, Lock, Receipt, ShieldAlert, TrendingUp, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActiveEvent } from "@/lib/gameTypes";
import type { SectorState, CrisisIndicators, CascadeEvent } from "@/lib/economicTypes";
import { POLICY_LEVER_DEFS } from "@/lib/gameData";
import { HIGH_IMPACT_CHANGES } from "@/lib/gameEngine";
import type { PolicyLeverKey, AnyPolicyPosition } from "@/lib/gameTypes";
import type { PolicyModifiers } from "@/lib/gameData";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { classifyStance, STANCE_TEMPLATES, COMBINATION_WARNINGS, getStanceKey } from "@/lib/policyNarrative";

const ECON_SUBTABS = [
  { id: "overview", label: "Overview" },
  { id: "markets", label: "Markets" },
  { id: "policy", label: "Policy" },
  { id: "team", label: "Team" },
] as const;

const ACTIONS = [
  { id: "cbn-directive", label: "Lean On The CBN", blurb: "Stabilise the naira with a forceful intervention." },
  { id: "probe-commission", label: "Open Procurement Probe", blurb: "Recover reform credibility by going after leakage." },
  { id: "state-visit", label: "Broker Investor Confidence", blurb: "Travel, bargain, and bring back concessions." },
  { id: "national-address", label: "Address The Markets", blurb: "Frame pain as a plan before panic compounds." },
] as const;

const PIE_COLORS = [
  "hsl(153, 60%, 32%)",
  "hsl(42, 70%, 50%)",
  "hsl(205, 65%, 48%)",
  "hsl(14, 75%, 55%)",
  "hsl(330, 60%, 55%)",
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const roundTo = (value: number, digits = 1) => Number(value.toFixed(digits));
const formatCurrency = (value: number) => `N${value.toFixed(2)}T`;

const eventBadge = (severity: ActiveEvent["severity"]) => {
  if (severity === "critical") return "destructive" as const;
  if (severity === "warning") return "outline" as const;
  return "secondary" as const;
};

const riskBadge = (risk: number) => {
  if (risk >= 75) return "destructive" as const;
  if (risk >= 55) return "outline" as const;
  return "secondary" as const;
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

const INVERSE_FIELDS = new Set<keyof PolicyModifiers>(["inflation", "subsidyPressure", "debtToGdp", "fxRate"]);
const FIELD_LABELS: Record<string, string> = {
  approval: "Approval", treasury: "Treasury", trust: "Trust",
  inflation: "Inflation", subsidyPressure: "Subsidy Pressure",
  reserves: "Reserves", debtToGdp: "Debt/GDP", fxRate: "FX Rate",
};

export default function EconomyTab() {
  const { toast } = useToast();
  const { state, canResolveChoice, executeQuickAction, resolveEventChoice, proposePolicyChange } = useGame();
  const [subTab, setSubTab] = useState<(typeof ECON_SUBTABS)[number]["id"]>("overview");
  const [previewLever, setPreviewLever] = useState<PolicyLeverKey | null>(null);
  const [previewPosition, setPreviewPosition] = useState<AnyPolicyPosition | null>(null);
  const [narrativeOpen, setNarrativeOpen] = useState(false);

  const economyEvents = state.activeEvents.filter((event) => event.category === "economy");
  const financeInbox = state.inboxMessages.filter((message) =>
    /(finance|cbn|imf|treasury|firs|petroleum)/i.test(`${message.sender} ${message.subject} ${message.preview}`),
  ).slice(0, 5);

  const marketSeries = useMemo(() => {
    const history = state.macroHistory.length > 0 ? state.macroHistory : [{ day: state.day || 1, ...state.macroEconomy }];
    return history.map((point) => ({
      label: `D${point.day}`,
      inflation: point.inflation,
      fx: point.fxRate,
      reserves: point.reserves,
      debt: point.debtToGdp,
      oil: point.oilOutput,
    }));
  }, [state.day, state.macroEconomy, state.macroHistory]);

  const revenueMix = useMemo(() => {
    const raw = [
      { source: "Oil", value: 32 + state.macroEconomy.oilOutput * 14 },
      { source: "VAT", value: 16 + state.trust * 0.12 },
      { source: "Corporate Tax", value: 12 + state.politicalCapital * 0.09 },
      { source: "Customs", value: 10 + clamp(2200 - state.macroEconomy.fxRate, 0, 1800) * 0.006 },
      { source: "Other", value: 8 + state.macroEconomy.reserves * 0.3 + state.stability * 0.04 },
    ];
    const total = raw.reduce((sum, item) => sum + item.value, 0);
    let assigned = 0;
    return raw.map((item, index) => {
      const pct = index === raw.length - 1 ? 100 - assigned : Math.round((item.value / total) * 100);
      assigned += pct;
      return { ...item, pct };
    });
  }, [state.macroEconomy, state.politicalCapital, state.stability, state.trust]);

  const budgetPressure = useMemo(() => {
    const totalBudget = clamp(state.treasury * 8.5 + 6.5, 8, 24);
    return [
      { sector: "Debt Service", amount: roundTo(totalBudget * clamp(0.22 + state.macroEconomy.debtToGdp * 0.0035, 0.2, 0.42)) },
      { sector: "Security", amount: roundTo(totalBudget * clamp(0.15 + (100 - state.stability) * 0.0018, 0.14, 0.24)) },
      { sector: "Infrastructure", amount: roundTo(totalBudget * clamp(0.14 + state.trust * 0.0012, 0.12, 0.22)) },
      { sector: "Education", amount: roundTo(totalBudget * 0.11) },
      { sector: "Health", amount: roundTo(totalBudget * 0.1) },
      { sector: "Transfers", amount: roundTo(totalBudget * clamp(0.09 + state.macroEconomy.subsidyPressure * 0.0012, 0.08, 0.18)) },
    ];
  }, [state.macroEconomy, state.stability, state.treasury, state.trust]);


  const economyTeam = useMemo(() => {
    const orderedNames = [
      "Alhaji Bello Kazeem",
      "Hajia Fatima Waziri",
      "Chief Adaeze Okonkwo",
      "Engr. Chidi Nwosu",
    ];
    return orderedNames
      .map((name) => state.characters[name])
      .filter(Boolean)
      .map((character) => ({
        ...character,
        mandate:
          character.name === "Alhaji Bello Kazeem"
            ? "Keep the treasury liquid while holding the coalition together."
            : character.name === "Hajia Fatima Waziri"
              ? "Defend institutional credibility while markets test the presidency."
              : character.name === "Chief Adaeze Okonkwo"
                ? "Protect oil cash flow without triggering another scandal cycle."
                : "Turn capital projects into proof that reform delivers.",
      }));
  }, [state.characters]);

  function ImpactPreview({ leverKey, from, to }: { leverKey: PolicyLeverKey; from: AnyPolicyPosition; to: AnyPolicyPosition }) {
    const def = POLICY_LEVER_DEFS[leverKey];
    const fromMods = def.modifiers[from];
    const toMods = def.modifiers[to];
    const fields = Object.keys(fromMods) as (keyof PolicyModifiers)[];
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {fields.map((field) => {
          const delta = toMods[field] - fromMods[field];
          if (delta === 0) return null;
          const isGoodForPlayer = INVERSE_FIELDS.has(field) ? delta < 0 : delta > 0;
          const color = isGoodForPlayer ? "text-green-600" : "text-red-600";
          return (
            <span key={field} className={color}>
              {FIELD_LABELS[field] ?? field} {delta > 0 ? "+" : ""}{delta}
            </span>
          );
        })}
      </div>
    );
  }

  function PolicyLeverRow({ leverKey }: { leverKey: PolicyLeverKey }) {
    const def = POLICY_LEVER_DEFS[leverKey];
    const lever = state.policyLevers[leverKey];
    const isLocked = lever.cooldownUntilDay > state.day;
    const isPending = lever.pendingPosition !== null;
    const cooldownDays = lever.cooldownUntilDay - state.day;

    return (
      <div className="space-y-2 py-3 border-b last:border-b-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{def.displayName}</span>
          {isLocked && <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />{cooldownDays}d</Badge>}
          {isPending && <Badge className="text-xs bg-yellow-500/20 text-yellow-700">Pending</Badge>}
        </div>
        <ToggleGroup
          type="single"
          value={lever.position}
          disabled={isLocked || isPending}
          onValueChange={(val) => {
            if (val && val !== lever.position) {
              setPreviewLever(leverKey);
              setPreviewPosition(val as AnyPolicyPosition);
            }
          }}
          className="flex flex-wrap gap-1"
        >
          {def.positions.map((pos) => (
            <ToggleGroupItem key={pos.value} value={pos.value} className="text-xs px-2 py-1">
              {pos.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {previewLever === leverKey && previewPosition && (
          <ImpactPreview leverKey={leverKey} from={lever.position} to={previewPosition} />
        )}
        {previewLever === leverKey && previewPosition && (
          <div className="flex gap-2">
            <Button size="sm" className="text-xs" onClick={() => {
              proposePolicyChange(leverKey, previewPosition);
              setPreviewLever(null);
              setPreviewPosition(null);
            }}>
              Confirm Change
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => {
              setPreviewLever(null);
              setPreviewPosition(null);
            }}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  function PolicyNarrativePanel() {
    const levers = state.policyLevers;
    const stanceKey = getStanceKey(levers);
    const warnings = COMBINATION_WARNINGS.filter((w) => w.test(levers)).map((w) => w.message);

    let pcEstimate: string | null = null;
    if (previewLever && previewPosition) {
      const highImpact = HIGH_IMPACT_CHANGES[previewLever]?.includes(previewPosition) ?? false;
      pcEstimate = highImpact
        ? "Backroom Deal cost: 4 PC (high-impact change)"
        : "Backroom Deal cost: 2 PC";
    }

    return (
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Policy Outlook</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">{STANCE_TEMPLATES[stanceKey]}</p>
          {pcEstimate && (
            <p className="text-xs font-medium text-blue-600">{pcEstimate}</p>
          )}
          {warnings.map((msg, i) => (
            <Alert key={i} variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{msg}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    );
  }

  const runAction = (actionId: (typeof ACTIONS)[number]["id"], label: string) => {
    executeQuickAction(actionId);
    toast({ title: label, description: "Directive issued. The macro dashboard and daily brief will reflect the consequences." });
  };

  const coolingDown = (actionId: string) => {
    const lastUsed = state.lastActionAtDay[actionId];
    return lastUsed !== undefined && state.day - lastUsed < 2;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1" data-testid="economy-subtabs">
        {ECON_SUBTABS.map((tab) => (
          <button
            key={tab.id}
            data-testid={`econ-subtab-${tab.id}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="economy-kpis">
            {[
              { label: "Inflation", value: `${state.macroEconomy.inflation}%`, note: "Consumer prices now drive your approval more than speeches do.", icon: Receipt },
              { label: "FX Rate", value: `${state.macroEconomy.fxRate.toLocaleString()} /$`, note: "The naira is now an engine-owned pressure gauge.", icon: TrendingUp },
              { label: "Reserves", value: `$${state.macroEconomy.reserves.toFixed(1)}B`, note: "Thin buffers make every intervention more expensive.", icon: Wallet },
              { label: "Debt / GDP", value: `${state.macroEconomy.debtToGdp}%`, note: "Debt service now feeds directly into macro risk and policy room.", icon: Landmark },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="border border-border">
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" /> {metric.label}
                    </div>
                    <p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.note}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-4">
            <Card className="border border-border" data-testid="economy-live-files-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-semibold">Files On The Economic Desk</CardTitle>
                  <Badge variant="outline" className="text-xs">{economyEvents.length} live</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {economyEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No dedicated economy file is waiting right now. Use directives, watch the morning cabal, and check how macro drift changes the next daily brief.</p>
                ) : (
                  economyEvents.map((event) => (
                    <Card key={event.id} className="border border-border bg-muted/20">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={eventBadge(event.severity)} className="text-xs">{event.severity}</Badge>
                          <p className="text-sm font-semibold">{event.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <div className="grid gap-2">
                          {event.choices.map((choice, index) => {
                            const enabled = canResolveChoice(choice.requirements);
                            return (
                              <div key={`${event.id}-${choice.id}`} className="space-y-1">
                                <Button
                                  data-testid={`economy-event-${event.id}-choice-${index}`}
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
              </CardContent>
            </Card>

            <Card className="border border-border" data-testid="economy-directives-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Economic Directives</CardTitle>
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
                          data-testid={`economy-action-${action.id}`}
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

          <Alert className="py-3 px-4" data-testid="economy-warning">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="text-xs font-medium">Macro Warning</AlertTitle>
            <AlertDescription className="text-xs">
              Inflation is {state.macroEconomy.inflation}% and FX is hovering around {state.macroEconomy.fxRate.toLocaleString()} NGN/USD with reserves at ${state.macroEconomy.reserves.toFixed(1)}B. These are now real engine-tracked values, not UI estimates.
            </AlertDescription>
          </Alert>

          {/* === Active Cascades Alert === */}
          {state.economy && state.economy.activeCascades.filter((c) => !c.resolved).length > 0 && (
            <Alert variant="destructive" className="py-3 px-4" data-testid="economy-cascades-alert">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-medium">Active Economic Cascades</AlertTitle>
              <AlertDescription className="text-xs space-y-1.5">
                {state.economy.activeCascades.filter((c) => !c.resolved).map((cascade) => (
                  <div key={cascade.id} className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {cascade.type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </span>
                    <Badge variant="outline" className="text-[11px]">{cascade.turnsActive} turns</Badge>
                    <Badge
                      variant={cascade.severity >= 0.7 ? "destructive" : "secondary"}
                      className="text-[11px]"
                    >
                      Severity {Math.round(cascade.severity * 100)}%
                    </Badge>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* === Sectoral GDP Card === */}
          {state.economy && state.economy.sectors.length > 0 && (
            <Card className="border border-[#C5A55A]/30" data-testid="economy-sectoral-gdp">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-[#C5A55A]">Sectoral GDP Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={state.economy.sectors.map((s) => ({
                      name: s.name,
                      gdpValue: roundTo(s.gdpValue, 2),
                      growthRate: roundTo(s.growthRate, 1),
                      gdpShare: roundTo(s.gdpShare * 100, 1),
                    }))}
                    layout="vertical"
                    margin={{ left: 90, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={85} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number, name: string) => {
                        if (name === "GDP (T)") return [`N${value}T`, name];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="gdpValue" name="GDP (T)" fill="#C5A55A" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                  {state.economy.sectors.map((sector) => (
                    <div key={sector.id} className="rounded-md border border-border bg-muted/20 p-2 text-center space-y-0.5">
                      <p className="text-[11px] text-muted-foreground">{sector.name}</p>
                      <p className={`text-xs font-semibold tabular-nums ${sector.growthRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {sector.growthRate >= 0 ? "+" : ""}{roundTo(sector.growthRate, 1)}%
                      </p>
                      <p className="text-[11px] text-muted-foreground">{roundTo(sector.gdpShare * 100, 1)}% share</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* === Fiscal Balance Card === */}
          {state.economy && (
            <Card className="border border-[#C5A55A]/30" data-testid="economy-fiscal-balance">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-[#C5A55A]">Fiscal Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Streams</p>
                    {([
                      { label: "Oil Revenue", value: state.economy.revenue.oil },
                      { label: "Tax Revenue", value: state.economy.revenue.tax },
                      { label: "IGR", value: state.economy.revenue.igr },
                      { label: "Trade", value: state.economy.revenue.trade },
                      { label: "Borrowing", value: state.economy.revenue.borrowing },
                    ] as const).map((item) => {
                      const pct = state.economy!.revenue.total > 0 ? (item.value / state.economy!.revenue.total) * 100 : 0;
                      return (
                        <div key={item.label} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span>{item.label}</span>
                            <span className="tabular-nums">N{roundTo(item.value, 2)}T</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-green-600" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Expenditure breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expenditure</p>
                    {([
                      { label: "Recurrent", value: state.economy.expenditure.recurrent },
                      { label: "Capital", value: state.economy.expenditure.capital },
                      { label: "Debt Servicing", value: state.economy.expenditure.debtServicing },
                      { label: "Transfers", value: state.economy.expenditure.transfers },
                    ] as const).map((item) => {
                      const pct = state.economy!.expenditure.total > 0 ? (item.value / state.economy!.expenditure.total) * 100 : 0;
                      return (
                        <div key={item.label} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span>{item.label}</span>
                            <span className="tabular-nums">N{roundTo(item.value, 2)}T</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-red-500/80" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Net fiscal position */}
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-gradient-to-br from-[#0A4D2C]/10 to-transparent p-3">
                  {(() => {
                    const net = state.economy!.revenue.total - state.economy!.expenditure.total;
                    const isDeficit = net < 0;
                    return (
                      <>
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Net Fiscal Position</p>
                          <p className={`text-lg font-bold tabular-nums ${isDeficit ? "text-red-500" : "text-green-500"}`}>
                            {isDeficit ? "-" : "+"}N{roundTo(Math.abs(net), 2)}T
                          </p>
                        </div>
                        <div className="border-l border-border pl-3">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Treasury Liquidity</p>
                          <p className="text-lg font-bold tabular-nums">N{roundTo(state.economy!.treasuryLiquidity, 2)}T</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {roundTo(state.economy!.treasuryMonthsOfCover, 1)} months cover
                        </Badge>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* === Employment Card === */}
          {state.economy && (
            <Card className="border border-[#C5A55A]/30" data-testid="economy-employment">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-[#C5A55A]">Employment</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-start gap-6 flex-wrap">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Unemployment Rate</p>
                    <p className={`text-4xl font-bold tabular-nums ${
                      state.economy.unemploymentRate < 20 ? "text-green-500" :
                      state.economy.unemploymentRate <= 30 ? "text-yellow-500" :
                      "text-red-500"
                    }`}>
                      {roundTo(state.economy.unemploymentRate, 1)}%
                    </p>
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Sector Employment Weights</p>
                    {state.economy.sectors.map((sector) => (
                      <div key={sector.id} className="flex items-center gap-2">
                        <span className="text-xs w-24 shrink-0">{sector.name}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-[#C5A55A]" style={{ width: `${Math.min(sector.employmentWeight * 100, 100)}%` }} />
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground w-10 text-right">{roundTo(sector.employmentWeight * 100, 0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* === Crisis Dashboard Card === */}
          {state.economy && state.economy.crisisIndicators && (
            <Card className="border border-[#C5A55A]/30" data-testid="economy-crisis-dashboard">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-[#C5A55A]">Crisis Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {([
                    { key: "inflationZone" as const, label: "Inflation" },
                    { key: "unemploymentZone" as const, label: "Unemployment" },
                    { key: "fxZone" as const, label: "FX Pressure" },
                    { key: "debtZone" as const, label: "Debt Burden" },
                    { key: "treasuryZone" as const, label: "Treasury Health" },
                    { key: "oilOutputZone" as const, label: "Oil Output" },
                  ] as const).map((indicator) => {
                    const zone = state.economy!.crisisIndicators[indicator.key];
                    const dotColor = zone === "green" ? "bg-green-500" : zone === "yellow" ? "bg-yellow-500" : "bg-red-500";
                    return (
                      <div key={indicator.key} className="rounded-md border border-border bg-muted/20 p-3 flex items-center gap-2.5">
                        <span className={`h-3 w-3 rounded-full ${dotColor} shrink-0`} />
                        <div>
                          <p className="text-xs font-semibold">{indicator.label}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{zone}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {subTab === "markets" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="border border-border" data-testid="economy-markets-chart-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Market Pressure Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={marketSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area yAxisId="left" type="monotone" dataKey="reserves" name="Reserves ($B)" stroke="hsl(153, 60%, 32%)" fill="hsl(153, 60%, 32%)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                  <Area yAxisId="right" type="monotone" dataKey="fx" name="FX (NGN/USD)" stroke="hsl(14, 75%, 55%)" fill="hsl(14, 75%, 55%)" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
                  <Area yAxisId="left" type="monotone" dataKey="inflation" name="Inflation %" stroke="hsl(42, 70%, 50%)" fill="hsl(42, 70%, 50%)" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="economy-revenue-mix-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Revenue Mix</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 items-center">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueMix} dataKey="pct" nameKey="source" innerRadius={48} outerRadius={78} paddingAngle={3} isAnimationActive={false}>
                      {revenueMix.map((entry, index) => (
                        <Cell key={entry.source} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {revenueMix.map((item, index) => (
                  <div key={item.source} className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-sm font-medium">{item.source}</span>
                    </div>
                    <span className="text-sm tabular-nums">{item.pct}%</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Revenue shares now react to oil output, reserves, and the broader macro climate.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border xl:col-span-2" data-testid="economy-budget-pressure-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Budget Pressure</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetPressure}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="sector" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => `${value}T`} />
                  <Bar dataKey="amount" fill="hsl(42, 70%, 50%)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {subTab === "policy" && (
        <>
          {/* Desktop: two-column layout */}
          <div className="hidden xl:grid xl:grid-cols-[1.15fr_0.85fr] gap-4">
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Policy Levers</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {(Object.keys(POLICY_LEVER_DEFS) as PolicyLeverKey[]).map((key) => (
                  <PolicyLeverRow key={key} leverKey={key} />
                ))}
              </CardContent>
            </Card>
            <PolicyNarrativePanel />
          </div>

          {/* Tablet/mobile: single column with accordion narrative */}
          <div className="xl:hidden space-y-4">
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">Policy Levers</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {(Object.keys(POLICY_LEVER_DEFS) as PolicyLeverKey[]).map((key) => (
                  <PolicyLeverRow key={key} leverKey={key} />
                ))}
              </CardContent>
            </Card>
            <Collapsible open={narrativeOpen} onOpenChange={setNarrativeOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 text-sm font-semibold">
                Policy Outlook
                <ChevronDown className={`h-4 w-4 transition-transform ${narrativeOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <PolicyNarrativePanel />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </>
      )}

      {subTab === "team" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
          <Card className="border border-border" data-testid="economy-team-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Economic War Room</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
              {economyTeam.map((person) => (
                <Card key={person.name} className="border border-border bg-muted/20">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <CharacterAvatar name={person.name} initials={person.avatar} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.portfolio}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <CompetencyBar value={person.loyalty} label="Loyalty" />
                      <CompetencyBar value={person.competence} label="Competence" />
                      <CompetencyBar value={person.ambition} label="Ambition" />
                    </div>
                    <RelationshipIndicator relationship={person.relationship} />
                    <p className="text-xs text-muted-foreground">{person.mandate}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="economy-inbox-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Finance Inbox</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {financeInbox.length === 0 ? (
                <p className="text-xs text-muted-foreground">No economic memos are queued right now. The finance side of the state is temporarily quiet.</p>
              ) : (
                financeInbox.map((message) => (
                  <div key={message.id} className="rounded-md border border-border bg-muted/20 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{message.subject}</p>
                      <Badge variant={message.priority === "Critical" ? "destructive" : message.priority === "Urgent" ? "outline" : "secondary"} className="text-[11px]">{message.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{message.sender} - {message.preview}</p>
                  </div>
                ))
              )}
              <p className="text-xs text-muted-foreground">The inbox now sits on top of the same macro state that drives inflation, FX, reserves, and debt.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
