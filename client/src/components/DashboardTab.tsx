import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { quickActionDefinitions } from "@/lib/gameContent";
import {
  Mic,
  Shuffle,
  ShieldAlert,
  Landmark,
  Plane,
  Search,
  Coffee,
  X,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { TrendIcon } from "@/components/TrendIcon";
import {
  indicatorSeries,
  budgetAllocation,
  riskRadar,
  eventFeed,
  presidentStats as fallbackPresidentStats,
  presidentTrends as fallbackPresidentTrends,
  presidentBioData,
  activeEvents,
  regionalApproval as fallbackRegionalApproval,
} from "@/lib/gameData";
import type { EventSeverity, TurnLogEntry } from "@/lib/gameTypes";

const BUDGET_COLOR = "hsl(42, 70%, 50%)";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const roundTo = (value: number, digits = 1) => Number(value.toFixed(digits));

const severityBadge = (severity: string) => {
  if (severity === "critical") return "destructive" as const;
  if (severity === "warning") return "outline" as const;
  return "secondary" as const;
};

const severityBorderClass = (severity: string) => {
  if (severity === "critical") return "border-l-4 border-l-red-500";
  if (severity === "warning") return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-blue-500";
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mic,
  Shuffle,
  ShieldAlert,
  Landmark,
  Plane,
  Search,
};

const trendColor = (direction: "up" | "down" | "stable") => {
  if (direction === "up") return "text-green-500";
  if (direction === "down") return "text-red-500";
  return "text-muted-foreground";
};

const governorLoyaltyColor = (loyalty: number) => {
  if (loyalty < 35) return "hsl(0, 60%, 50%)";
  if (loyalty < 55) return "hsl(42, 70%, 50%)";
  return "hsl(153, 60%, 32%)";
};

const zoneColor = (approval: number) => {
  if (approval < 35) return "hsl(0, 60%, 50%)";
  if (approval < 45) return "hsl(42, 70%, 50%)";
  return "hsl(153, 60%, 32%)";
};

const directionFromScore = (value: number, low = 45, high = 55): "up" | "down" | "stable" => {
  if (value >= high) return "up";
  if (value <= low) return "down";
  return "stable";
};

const severityFromLog = (entry: TurnLogEntry): EventSeverity => {
  const joined = `${entry.event} ${entry.effects.join(" ")}`.toLowerCase();
  if (joined.includes("critical") || joined.includes("fragile") || joined.includes("betray") || joined.includes("crisis")) {
    return "critical";
  }
  if (entry.category === "court" || entry.category === "chain" || joined.includes("pressure") || joined.includes("warning")) {
    return "warning";
  }
  return "info";
};

const zoneData: { id: string; name: string; abbr: string; path: string; labelX: number; labelY: number }[] = [
  { id: "NW", name: "North-West", abbr: "NW", path: "M48,52 L58,32 L80,22 L115,18 L130,28 L132,55 L120,72 L95,78 L65,75 L48,65 Z", labelX: 90, labelY: 48 },
  { id: "NE", name: "North-East", abbr: "NE", path: "M130,28 L155,15 L195,8 L235,25 L255,55 L240,85 L210,95 L175,90 L150,78 L132,55 Z", labelX: 190, labelY: 52 },
  { id: "NC", name: "North-Central", abbr: "NC", path: "M65,75 L95,78 L120,72 L132,55 L150,78 L175,90 L170,115 L145,130 L115,135 L80,125 L60,105 L50,85 Z", labelX: 115, labelY: 100 },
  { id: "SW", name: "South-West", abbr: "SW", path: "M28,115 L50,85 L60,105 L80,125 L85,145 L70,162 L45,165 L22,150 L18,130 Z", labelX: 52, labelY: 138 },
  { id: "SE", name: "South-East", abbr: "SE", path: "M145,130 L170,115 L190,125 L195,150 L180,168 L155,172 L135,160 L125,142 Z", labelX: 162, labelY: 148 },
  { id: "SS", name: "South-South", abbr: "SS", path: "M85,145 L115,135 L125,142 L135,160 L155,172 L145,192 L120,205 L90,200 L65,188 L45,165 L70,162 Z", labelX: 105, labelY: 175 },
];

interface GovernorInfo {
  name: string;
  zone: string;
  party: string;
  loyalty: number;
  approval: number;
  relationship: string;
  demands: string;
}

interface RegionalApprovalPoint {
  region: string;
  approval: number;
}

interface DashboardFeedItem {
  id: string;
  title: string;
  week: string;
  severity: EventSeverity;
  description: string;
  actions: { label: string; context: string }[];
}
function NigeriaMap({
  onZoneClick,
  governors,
  regionalApprovalData,
}: {
  onZoneClick: (zone: string, approval: number) => void;
  governors: GovernorInfo[];
  regionalApprovalData: RegionalApprovalPoint[];
}) {
  const governorByZone = Object.fromEntries(governors.map((governor) => [governor.zone, governor]));
  const approvalMap = Object.fromEntries(regionalApprovalData.map((region) => [region.region, region.approval]));

  const getZoneFill = (zoneName: string) => {
    const governor = governorByZone[zoneName];
    if (governor) return governorLoyaltyColor(governor.loyalty);
    return zoneColor(approvalMap[zoneName] ?? 40);
  };

  return (
    <svg viewBox="0 0 275 220" className="w-full h-auto max-h-[240px]" role="img" aria-label="Nigeria geopolitical zones map">
      {zoneData.map((zone) => {
        const approval = approvalMap[zone.name] ?? 40;
        return (
          <g key={zone.id}>
            <path
              d={zone.path}
              fill={getZoneFill(zone.name)}
              fillOpacity={0.6}
              stroke="hsl(var(--border))"
              strokeWidth={1.5}
              className="cursor-pointer hover:fill-opacity-80 transition-all"
              data-testid={`map-zone-${zone.id.toLowerCase()}`}
              onClick={() => onZoneClick(zone.name, approval)}
            />
            <text x={zone.labelX} y={zone.labelY} textAnchor="middle" className="text-[10px] font-medium fill-foreground pointer-events-none">
              {zone.abbr}
            </text>
            <text x={zone.labelX} y={zone.labelY + 12} textAnchor="middle" className="text-[8px] fill-foreground pointer-events-none">
              {approval}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GovernorPopover({ governor, onClose }: { governor: GovernorInfo; onClose: () => void }) {
  const loyaltyColor = governor.loyalty < 35
    ? "bg-red-500"
    : governor.loyalty < 55
      ? "bg-amber-500"
      : "bg-green-500";

  const relationBadge = (relationship: string) => {
    if (relationship === "Friendly" || relationship === "Loyal") return "default" as const;
    if (relationship === "Hostile") return "destructive" as const;
    return "outline" as const;
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 rounded-lg">
      <Card className="border border-border w-64 shadow-lg" data-testid="governor-popover">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{governor.name}</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose} data-testid="governor-popover-close">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={governor.party === "Ruling" ? "default" : governor.party === "Opposition" ? "destructive" : "secondary"} className="text-xs">
              {governor.party}
            </Badge>
            <span className="text-xs text-muted-foreground">{governor.zone}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Loyalty</span>
              <span className="text-xs tabular-nums font-medium">{governor.loyalty}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={loyaltyColor} style={{ width: `${governor.loyalty}%`, height: "100%" }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Approval</span>
              <span className="text-xs tabular-nums font-medium">{governor.approval}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-[hsl(42,70%,50%)]" style={{ width: `${governor.approval}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Relationship</span>
            <Badge variant={relationBadge(governor.relationship)} className="text-xs">
              {governor.relationship}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Demands</p>
            <p className="text-xs">{governor.demands}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardTab() {
  const { toast } = useToast();
  const { state, executeQuickAction, resolveEventChoice } = useGame();
  const [selectedGovernorZone, setSelectedGovernorZone] = useState<string | null>(null);

  const isPlaying = state.phase === "playing";
  const liveEvents = isPlaying ? state.activeEvents : activeEvents;
  const governors = isPlaying ? state.governors : [];
  const playerName = isPlaying ? state.presidentName : "[Player Name]";
  const playerTraits = isPlaying && state.presidentTraits.length > 0 ? state.presidentTraits : ["Charismatic", "Pragmatic", "Calculating"];
  const playerAge = isPlaying ? state.presidentAge : 55;
  const playerState = isPlaying ? state.presidentState : "Lagos";
  const playerEducation = isPlaying ? state.presidentEducation : "University of Lagos";
  const playerParty = isPlaying ? state.presidentParty : "ADU";
  const playerEra = isPlaying ? state.presidentEra : "2023";

  const action = (title: string, description: string) => () => {
    toast({ title, description });
  };

  const nameHash = playerName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const pick = <T,>(items: T[]) => items[nameHash % items.length];
  const pick2 = <T,>(items: T[]) => items[(nameHash + 3) % items.length];

  const dossierEducation = `${playerEducation}, ${pick(presidentBioData.postgrad)}`;
  const dossierFamily = pick(presidentBioData.familyDescriptions);
  const dossierCareer = `${pick(presidentBioData.previousPositions)}; prior: ${pick(presidentBioData.workHistory)}`;
  const dossierHobbies = `${pick(presidentBioData.hobbies)}, ${pick2(presidentBioData.hobbies)}`;

  const factionAverage = useMemo(() => {
    const factions = Object.values(state.factions);
    if (!factions.length) return 54;
    return factions.reduce((sum, faction) => sum + faction.loyalty, 0) / factions.length;
  }, [state.factions]);

  const governorInfos: GovernorInfo[] = governors.map((governor) => ({
    name: governor.name,
    zone: governor.zone,
    party: governor.party,
    loyalty: governor.loyalty,
    approval: governor.approval,
    relationship: governor.relationship,
    demands: governor.demands,
  }));

  const governorAverage = useMemo(() => {
    if (!governorInfos.length) return 46;
    return governorInfos.reduce((sum, governor) => sum + governor.approval, 0) / governorInfos.length;
  }, [governorInfos]);

  const selectedGovernor = selectedGovernorZone
    ? governorInfos.find((governor) => governor.zone === selectedGovernorZone) ?? null
    : null;
  const liveRegionalApproval = useMemo<RegionalApprovalPoint[]>(() => {
    if (!isPlaying || !governorInfos.length) return fallbackRegionalApproval;

    const approvalByZone = new Map<string, number[]>();
    governorInfos.forEach((governor) => {
      const current = approvalByZone.get(governor.zone) ?? [];
      current.push(Math.round((governor.approval + governor.loyalty) / 2));
      approvalByZone.set(governor.zone, current);
    });

    return zoneData.map((zone) => {
      const values = approvalByZone.get(zone.name) ?? [];
      const average = values.length
        ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        : fallbackRegionalApproval.find((entry) => entry.region === zone.name)?.approval ?? 40;
      return { region: zone.name, approval: average };
    });
  }, [governorInfos, isPlaying]);

  const approvalDelta = state.approvalHistory.length >= 2
    ? state.approvalHistory[state.approvalHistory.length - 1].approval - state.approvalHistory[state.approvalHistory.length - 2].approval
    : 0;

  const livePresidentStats = useMemo(() => {
    if (!isPlaying) return fallbackPresidentStats;

    const criticalCount = state.activeEvents.filter((event) => event.severity === "critical").length;
    const trust = state.trust;
    const approval = state.approval;
    const stamina = Math.round(state.health * 0.65 + (100 - state.stress) * 0.35);

    return [
      { stat: "Charisma", value: Math.round(approval * 0.55 + trust * 0.45) },
      { stat: "Diplomacy", value: Math.round(factionAverage * 0.6 + state.politicalCapital * 0.4) },
      { stat: "Economics", value: Math.round(clamp(40 + state.treasury * 18 + trust * 0.2 - state.outrage * 0.15, 0, 100)) },
      { stat: "Military", value: Math.round(clamp(45 + state.stability * 0.35 - criticalCount * 4, 0, 100)) },
      { stat: "Integrity", value: Math.round(clamp(35 + state.judicialIndependence * 0.5 - state.outrage * 0.15, 0, 100)) },
      { stat: "Party Loyalty", value: Math.round(clamp(factionAverage, 0, 100)) },
      { stat: "Leadership", value: Math.round(clamp(40 + state.politicalCapital * 0.45 + state.stability * 0.2 + approvalDelta * 3, 0, 100)) },
      { stat: "Negotiation", value: Math.round(clamp(40 + trust * 0.25 + state.politicalCapital * 0.35 + factionAverage * 0.25, 0, 100)) },
      { stat: "Crisis Mgmt", value: Math.round(clamp(35 + state.stability * 0.45 - state.stress * 0.3 - criticalCount * 5, 0, 100)) },
      { stat: "Public Speaking", value: Math.round(clamp(approval * 0.6 + trust * 0.4, 0, 100)) },
      { stat: "Intelligence", value: Math.round(clamp(40 + state.judicialIndependence * 0.2 + governorAverage * 0.3 + state.stability * 0.15, 0, 100)) },
      { stat: "Stamina", value: Math.round(clamp(stamina, 0, 100)) },
    ];
  }, [approvalDelta, factionAverage, governorAverage, isPlaying, state]);

  const liveTrends = useMemo<{ label: string; direction: "up" | "down" | "stable"; note: string }[]>(() => {
    if (!isPlaying) return fallbackPresidentTrends;
    return [
      { label: "Public Trust", direction: directionFromScore(state.trust), note: `${state.trust}% confidence in the presidency` },
      { label: "Party Standing", direction: directionFromScore(factionAverage, 48, 58), note: `${Math.round(factionAverage)}% coalition loyalty` },
      { label: "State Relations", direction: directionFromScore(governorAverage, 44, 54), note: `${Math.round(governorAverage)}% governor alignment` },
      {
        label: "Health",
        direction: state.health < 55 || state.stress > 65 ? "down" : state.health > 70 && state.stress < 45 ? "up" : "stable",
        note: `${state.health}% health with stress at ${state.stress}%`,
      },
    ];
  }, [factionAverage, governorAverage, isPlaying, state.health, state.stress, state.trust]);

  const liveIndicatorSeries = useMemo(() => {
    if (!isPlaying) return indicatorSeries;

    const history = state.approvalHistory.slice(-6);
    const filledHistory = history.length >= 3
      ? history
      : Array.from({ length: 6 }, (_, index) => ({
          day: Math.max(1, state.day - (5 - index)),
          approval: clamp(state.approval - (5 - index) * 2 + approvalDelta * Math.max(0, index - 3), 20, 95),
        }));

    return filledHistory.map((point, index) => ({
      week: `Day ${point.day}`,
      inflation: roundTo(clamp(11 + state.outrage * 0.11 + index * 0.4 - state.trust * 0.03, 7, 32)),
      fx: roundTo(clamp(7.4 + state.outrage * 0.04 + index * 0.15 - state.treasury * 0.2, 6, 16)),
      approval: point.approval,
    }));
  }, [approvalDelta, isPlaying, state.approval, state.approvalHistory, state.day, state.outrage, state.treasury, state.trust]);

  const liveBudgetAllocation = useMemo(() => {
    if (!isPlaying) return budgetAllocation;
    const budgetBase = Math.max(state.treasury * 7.6, 5.5);
    const allocations = [
      { sector: "Security", amount: budgetBase * (0.16 + (100 - state.stability) * 0.0008) },
      { sector: "Education", amount: budgetBase * 0.13 },
      { sector: "Health", amount: budgetBase * (0.11 + state.health * 0.0003) },
      { sector: "Infrastructure", amount: budgetBase * (0.18 + state.politicalCapital * 0.0005) },
      { sector: "Debt Service", amount: budgetBase * (0.24 + state.outrage * 0.0006) },
      { sector: "Transfers", amount: budgetBase * (0.08 + state.trust * 0.0004) },
    ];
    return allocations.map((allocation) => ({ ...allocation, amount: roundTo(allocation.amount, 2) }));
  }, [isPlaying, state.health, state.outrage, state.politicalCapital, state.stability, state.treasury, state.trust]);

  const liveRiskRadar = useMemo(() => {
    if (!isPlaying) return riskRadar;
    return [
      { axis: "Inflation", value: roundTo(clamp(3 + state.outrage * 0.07 + (100 - state.trust) * 0.02, 0, 10)) },
      { axis: "FX Stability", value: roundTo(clamp(3 + state.outrage * 0.05 + (1.4 - state.treasury) * 3.2, 0, 10)) },
      { axis: "Security", value: roundTo(clamp(2 + (100 - state.stability) * 0.08, 0, 10)) },
      { axis: "Executive Stress", value: roundTo(clamp(1 + state.stress * 0.09, 0, 10)) },
      { axis: "Judicial Pushback", value: roundTo(clamp(2 + (100 - state.judicialIndependence) * 0.07, 0, 10)) },
      { axis: "Coalition Drift", value: roundTo(clamp(2 + (100 - factionAverage) * 0.06, 0, 10)) },
      { axis: "Public Trust", value: roundTo(clamp(2 + (100 - state.trust) * 0.06, 0, 10)) },
      { axis: "State Relations", value: roundTo(clamp(2 + (100 - governorAverage) * 0.06, 0, 10)) },
    ];
  }, [factionAverage, governorAverage, isPlaying, state.judicialIndependence, state.outrage, state.stability, state.stress, state.trust, state.treasury]);

  const highestRisk = [...liveRiskRadar].sort((left, right) => right.value - left.value)[0];

  const liveEventFeed = useMemo<DashboardFeedItem[]>(() => {
    if (!isPlaying) return eventFeed.map((item) => ({ ...item, severity: item.severity as EventSeverity }));

    const urgentFiles: DashboardFeedItem[] = state.activeEvents.slice(0, 2).map((event) => ({
      id: `file-${event.id}`,
      title: event.title,
      week: `Day ${state.day}`,
      severity: event.severity,
      description: event.description,
      actions: [{ label: "Resolve in Office", context: `Open the Office tab and settle ${event.title.toLowerCase()}.` }],
    }));

    const headlineFeed: DashboardFeedItem[] = state.headlines.slice(0, 2).map((headline, index) => ({
      id: `headline-${state.day}-${index}`,
      title: headline,
      week: `Day ${state.day}`,
      severity: index === 0 && state.activeEvents.some((event) => event.severity === "critical") ? "critical" : "info",
      description: state.dailySummary?.items[index] ?? "Political and market observers are absorbing the latest turn of events.",
      actions: [{ label: "Track Impact", context: state.dailySummary?.headline ?? "Review the daily brief for the latest shift in the presidency." }],
    }));

    const turnFeed: DashboardFeedItem[] = [...state.turnLog].slice(-4).reverse().map((entry, index) => ({
      id: `turn-${state.day}-${index}`,
      title: entry.event,
      week: `Day ${entry.day}`,
      severity: severityFromLog(entry),
      description: entry.effects.length ? entry.effects.join(" • ") : "Administrative movement recorded inside the presidency.",
      actions: [{ label: "Review Outcome", context: entry.effects.join(" • ") || "Open the presidency dashboard to review the latest outcome." }],
    }));

    return [...urgentFiles, ...headlineFeed, ...turnFeed].slice(0, 6);
  }, [isPlaying, state.activeEvents, state.dailySummary, state.day, state.headlines, state.turnLog]);

  const handleZoneClick = (zone: string, approval: number) => {
    const governor = governorInfos.find((item) => item.zone === zone);
    if (governor) {
      setSelectedGovernorZone(zone);
      return;
    }

    toast({ title: zone, description: `Approval ${approval}% — ${approval < 35 ? "critical" : approval < 45 ? "at risk" : "holding"} in this zone.` });
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border" data-testid="president-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">President Character Sheet</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CharacterAvatar name="President" initials="PR" size="lg" />
                <div>
                  <p className="text-sm font-semibold">President {playerName}</p>
                  <p className="text-xs text-muted-foreground">{playerParty} · Aso Rock Villa</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {playerTraits.map((trait) => (
                  <Badge key={trait} variant="outline" className="text-xs">{trait}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs" data-testid="player-info">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">{playerAge}</span>
                <span className="text-muted-foreground">Origin</span>
                <span className="font-medium">{playerState} State</span>
                <span className="text-muted-foreground">Party</span>
                <span className="font-medium">{playerParty} ({playerEra})</span>
                <span className="text-muted-foreground">Education</span>
                <span className="font-medium">{dossierEducation}</span>
                <span className="text-muted-foreground">Family</span>
                <span className="font-medium">{dossierFamily}</span>
                <span className="text-muted-foreground">Career</span>
                <span className="font-medium">{dossierCareer}</span>
                <span className="text-muted-foreground">Interests</span>
                <span className="font-medium">{dossierHobbies}</span>
                <span className="text-muted-foreground font-semibold text-[hsl(42,70%,50%)]">Political Capital</span>
                <span className="font-bold text-[hsl(42,70%,50%)]">{isPlaying ? state.politicalCapital : 60}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {livePresidentStats.map((stat) => (
                <CompetencyBar key={stat.stat} value={stat.value} label={stat.stat} />
              ))}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5" data-testid="regional-approval">
                <p className="text-xs font-medium text-muted-foreground">Regional Approval</p>
                {liveRegionalApproval.map((region) => (
                  <div key={region.region} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{region.region}</span>
                      <span className="text-xs tabular-nums font-medium">{region.approval}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${region.approval}%`,
                          backgroundColor: region.approval < 35 ? "hsl(0, 60%, 50%)" : region.approval < 45 ? "hsl(42, 70%, 50%)" : "hsl(153, 60%, 32%)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3" data-testid="president-trends">
            <div className="flex flex-wrap items-center gap-4">
              {liveTrends.map((trend) => (
                <div key={trend.label} className="flex items-center gap-1.5">
                  <TrendIcon direction={trend.direction} />
                  <span className={`text-xs font-bold ${trendColor(trend.direction)}`}>{trend.label}</span>
                  <span className="text-xs text-muted-foreground">{trend.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3 grid grid-cols-1 md:grid-cols-3 gap-2" data-testid="president-actions">
            <Button
              data-testid="action-consult-advisers"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={action("Consult Advisers", "Senior aides are preparing a private readout on the latest pressure points in the federation.")}
            >
              <Users className="h-3.5 w-3.5 mr-1.5" /> Consult Advisers
            </Button>
            <Button
              data-testid="action-council-meeting"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={action("Call Council Meeting", "Cabinet secretariat notified. Key ministries are assembling briefing papers for an emergency council session.")}
            >
              <Landmark className="h-3.5 w-3.5 mr-1.5" /> Call Council Meeting
            </Button>
            <Button
              data-testid="action-emergency-session"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                if (isPlaying) {
                  executeQuickAction("emergency-powers");
                  toast({ title: "Emergency Session", description: "Emergency powers considered. The political cost is now reflected in the dashboard." });
                } else {
                  action("Declare Emergency Session", "Emergency powers briefing drafted for the incoming presidency.")();
                }
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Declare Emergency Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">National Indicators</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={liveIndicatorSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="inflation" name="Inflation %" stroke="hsl(0, 60%, 50%)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="fx" name="FX (₦/100)" stroke="hsl(42, 70%, 50%)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="approval" name="Approval %" stroke="hsl(153, 60%, 32%)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Federal Budget Allocation (₦T)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={liveBudgetAllocation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="sector" type="category" width={90} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => `₦${value}T`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="amount" fill={BUDGET_COLOR} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-2">
              <Button data-testid="rebalance-budget-btn" variant="outline" size="sm" onClick={action("Rebalance", "Budget office drafted three rebalance scenarios for your review in the next council meeting.")}>Rebalance</Button>
              <Button data-testid="publish-budget-btn" variant="outline" size="sm" onClick={action("Publish", "The budget envelope has been sent to the legislature with a note highlighting your fiscal priorities.")}>Publish</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Governance Risk Radar</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={liveRiskRadar} outerRadius={80}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Radar dataKey="value" stroke="hsl(0, 60%, 50%)" fill="hsl(0, 60%, 50%)" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground">
              Highest pressure point: <span className="font-medium text-foreground">{highestRisk.axis}</span> at {highestRisk.value}/10. Approval sits at {state.approval}% with trust at {state.trust}%.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border relative" data-testid="nigeria-map-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Nigeria — Geopolitical Zones</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <NigeriaMap onZoneClick={handleZoneClick} governors={governorInfos} regionalApprovalData={liveRegionalApproval} />
          </CardContent>
          {selectedGovernor && <GovernorPopover governor={selectedGovernor} onClose={() => setSelectedGovernorZone(null)} />}
        </Card>
      </div>

      <Card className="border border-border" data-testid="quick-actions-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            {quickActionDefinitions.filter((actionItem) => actionItem.id !== "take-a-break").map((actionItem) => {
              const Icon = iconMap[actionItem.icon];
              return (
                <Button
                  key={actionItem.id}
                  data-testid={`quick-action-${actionItem.label.toLowerCase().replace(/\s+/g, "-")}`}
                  variant="outline"
                  className="flex flex-col items-center justify-center gap-1.5 h-20 text-xs"
                  onClick={() => {
                    if (isPlaying) {
                      executeQuickAction(actionItem.id);
                      toast({ title: actionItem.label, description: actionItem.summary });
                    } else {
                      action(actionItem.label, actionItem.context)();
                    }
                  }}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {actionItem.label}
                </Button>
              );
            })}
            <Button
              data-testid="quick-action-take-a-break"
              variant="outline"
              className="flex flex-col items-center justify-center gap-1.5 h-20 text-xs"
              onClick={() => {
                if (isPlaying) {
                  executeQuickAction("take-a-break");
                  toast({ title: "Take a Break", description: "Stress eased slightly. The political class has noticed you took a breather." });
                } else {
                  action("Take a Break", "Campaign trail pause scheduled before inauguration.")();
                }
              }}
            >
              <Coffee className="h-5 w-5" />
              Take a Break
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border" data-testid="active-events-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Active Events — Decisions Required</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveEvents.map((event) => (
              <Card key={event.id} className={`border border-border ${severityBorderClass(event.severity)}`} data-testid={`active-event-${event.id}`}>
                <CardHeader className="p-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={severityBadge(event.severity)} className="text-xs">{event.severity}</Badge>
                    <CardTitle className="text-sm font-semibold">{event.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1 space-y-3">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex flex-col gap-1.5">
                    {event.choices.map((choice, index) => (
                      <Button
                        key={choice.label}
                        data-testid={`active-event-${event.id}-choice-${index}`}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          if (isPlaying) {
                            resolveEventChoice(event.id, index);
                            toast({ title: choice.label, description: `${event.title} updated.` });
                          } else {
                            action(choice.label, choice.context)();
                          }
                        }}
                      >
                        {choice.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Event Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Accordion type="multiple" className="w-full">
            {liveEventFeed.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-sm py-3" data-testid={`event-${item.id}`}>
                  <div className="flex items-center gap-2 text-left w-full">
                    <Badge variant={severityBadge(item.severity)} className="text-xs">{item.severity}</Badge>
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto mr-2">{item.week}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm space-y-3">
                  <p className="text-muted-foreground">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.actions.map((eventAction) => (
                      <Button
                        key={eventAction.label}
                        data-testid={`event-action-${item.id}-${eventAction.label.toLowerCase().replace(/\s+/g, "-")}`}
                        variant="outline"
                        size="sm"
                        onClick={action(eventAction.label, eventAction.context)}
                      >
                        {eventAction.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}


