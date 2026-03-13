import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendIcon } from "@/components/TrendIcon";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  legacyBreakdown,
  legacyPillars,
  legacyMilestones,
  approvalHistory,
  legacyScore,
} from "@/lib/gameData";
import { useGame } from "@/lib/GameContext";
import { victoryPaths, failureStates } from "@/lib/victorySystem";
import {
  TrendingUp,
  Shield,
  Scale,
  Globe,
  Users,
  TrendingDown,
  Swords,
  Flame,
  UserX,
  Ban,
  HeartPulse,
} from "lucide-react";

const pillarBarColor = (score: number) => {
  if (score >= 60) return "hsl(153, 60%, 32%)";
  if (score >= 40) return "hsl(42, 70%, 50%)";
  return "hsl(0, 60%, 50%)";
};


const impactBadge = (impact: number) => {
  if (impact > 0) return "default" as const;
  if (impact < 0) return "destructive" as const;
  return "secondary" as const;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Shield,
  Scale,
  Globe,
  Users,
  TrendingDown,
  Swords,
  Flame,
  UserX,
  Ban,
  HeartPulse,
};

export default function LegacyTab() {
  const { state } = useGame();
  const isPlaying = state.phase === "playing";
  const victoryProgress = isPlaying ? state.victoryProgress : {};
  const failureRisks = isPlaying ? state.failureRisks : {};
  const milestoneRows = isPlaying && state.legacyMilestones.length > 0 ? state.legacyMilestones : legacyMilestones;
  const approvalHistoryData = isPlaying && state.approvalHistory.length > 0 ? state.approvalHistory : approvalHistory;
  const dynamicLegacyScore = isPlaying
    ? Math.max(0, Math.min(100, 45 + Math.round(milestoneRows.reduce((sum, milestone) => sum + milestone.impact, 0) / 2)))
    : legacyScore.current;
  const legacyGrade = dynamicLegacyScore >= 85 ? "A" : dynamicLegacyScore >= 75 ? "B" : dynamicLegacyScore >= 60 ? "C" : dynamicLegacyScore >= 45 ? "D" : "F";
  const legacyTrend = isPlaying
    ? milestoneRows.length > 0 && milestoneRows[milestoneRows.length - 1].impact < 0 ? "down" : "up"
    : legacyScore.trend;
  const legacyDescription = isPlaying
    ? `Legacy now reflects ${milestoneRows.length} recorded governing decisions with a net impact of ${milestoneRows.reduce((sum, milestone) => sum + milestone.impact, 0)}.`
    : legacyScore.description;

  return (
    <div className="space-y-4">
      {/* Row 1: Legacy Score + Legacy Pillars */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Overall Legacy Score */}
        <Card className="border border-border" data-testid="legacy-score-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Presidential Legacy Score</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {/* Score headline */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold tabular-nums">{dynamicLegacyScore}</span>
              <span className="text-lg text-muted-foreground">/100</span>
              <Badge variant="outline" className="text-xs ml-1">{legacyGrade}</Badge>
              <div className="flex items-center gap-1 ml-auto">
                <TrendIcon direction={legacyTrend} />
                <span className="text-xs tabular-nums text-green-500">
                  {dynamicLegacyScore - legacyScore.dayOneScore >= 0 ? `+${dynamicLegacyScore - legacyScore.dayOneScore}` : dynamicLegacyScore - legacyScore.dayOneScore} from Day 1
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{legacyDescription}</p>

            {/* Stacked bar */}
            <div className="flex w-full h-6 rounded-full overflow-hidden">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${legacyBreakdown.positive}%`,
                  backgroundColor: "hsl(153, 60%, 32%)",
                }}
              />
              <div
                className="h-full"
                style={{
                  width: `${legacyBreakdown.neutral}%`,
                  backgroundColor: "hsl(42, 70%, 50%)",
                }}
              />
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${legacyBreakdown.negative}%`,
                  backgroundColor: "hsl(0, 60%, 50%)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <span style={{ color: "hsl(153, 60%, 32%)" }}>Positive {legacyBreakdown.positive}%</span>
              {" · "}
              <span style={{ color: "hsl(42, 70%, 50%)" }}>Neutral {legacyBreakdown.neutral}%</span>
              {" · "}
              <span style={{ color: "hsl(0, 60%, 50%)" }}>Negative {legacyBreakdown.negative}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Legacy Pillars */}
        <Card className="border border-border" data-testid="legacy-pillars-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Legacy Pillars</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pillar</TableHead>
                  <TableHead className="text-xs">Score</TableHead>
                  <TableHead className="text-xs">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legacyPillars.map((p) => (
                  <TableRow key={p.pillar}>
                    <TableCell className="text-sm">{p.pillar}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm tabular-nums w-7">{p.score}</span>
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${p.score}%`,
                              backgroundColor: pillarBarColor(p.score),
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TrendIcon direction={p.trend} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Approval Over Time */}
      <Card className="border border-border" data-testid="approval-history-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Approval Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={approvalHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "Day", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[30, 65]}
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="approval"
                name="Approval %"
                stroke="hsl(153, 60%, 32%)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Decisions & Milestones */}
      <Card className="border border-border" data-testid="legacy-milestones-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Key Decisions & Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Decision</TableHead>
                <TableHead className="text-xs">Pillar</TableHead>
                <TableHead className="text-xs text-center">Impact</TableHead>
                <TableHead className="text-xs">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestoneRows.map((m) => (
                <TableRow key={m.title}>
                  <TableCell className="text-sm tabular-nums whitespace-nowrap">{m.date}</TableCell>
                  <TableCell className="text-sm font-medium">{m.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{m.pillar}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={impactBadge(m.impact)} className="text-xs tabular-nums">
                      {m.impact > 0 ? `+${m.impact}` : m.impact}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px]">{m.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Victory & Defeat Tracker */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Victory Paths */}
        <Card className="border border-border" data-testid="victory-paths-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Victory Paths</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {victoryPaths.map((path) => {
              const progress = victoryProgress[path.id] ?? 0;
              const IconComp = iconMap[path.icon];
              return (
                <div key={path.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {IconComp && <IconComp className="h-3.5 w-3.5" />}
                      <span className="text-xs font-medium">{path.name}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${progress > 75 ? "animate-pulse" : ""}`}
                      style={{ width: `${progress}%`, backgroundColor: path.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{path.description}</p>
                </div>
              );
            })}
            {!isPlaying && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Start a campaign to track victory progress.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Failure States */}
        <Card className="border border-border" data-testid="failure-states-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Failure Risks</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {failureStates.map((fs) => {
              const risk = failureRisks[fs.id] ?? 0;
              const IconComp = iconMap[fs.icon];
              return (
                <div key={fs.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {IconComp && <IconComp className="h-3.5 w-3.5" />}
                      <span className="text-xs font-medium">{fs.name}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${risk > 75 ? "text-red-500" : ""}`}>
                      {risk}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-red-500 transition-all ${risk > 75 ? "animate-pulse" : ""}`}
                      style={{ width: `${risk}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{fs.description}</p>
                </div>
              );
            })}
            {!isPlaying && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Start a campaign to track failure risks.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

