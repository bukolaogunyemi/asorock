import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Flame, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { TrendIcon } from "@/components/TrendIcon";
import { narratives } from "@/lib/gameData";

const sentimentBadge = (s: string) => {
  if (s === "Negative") return "destructive" as const;
  if (s === "Positive") return "default" as const;
  return "secondary" as const;
};

const whistleblowers = [
  {
    name: "Mallam Ibrahim Danladi",
    role: "Former NNPC Auditor",
    avatar: "ID",
    info: "Claims to have evidence of diverted crude oil revenues. Currently in hiding.",
    risk: "High",
  },
  {
    name: "Dr. Amina Bello",
    role: "Ex-Health Ministry Director",
    avatar: "AB",
    info: "Alleges procurement fraud in the National Health Insurance Scheme rollout.",
    risk: "Medium",
  },
  {
    name: "Barr. Chidi Okonkwo",
    role: "Retired Civil Servant",
    avatar: "CO",
    info: "Possesses documents showing ghost workers in the Federal Payroll system.",
    risk: "High",
  },
];

const recentPolls = [
  { pollster: "NOI Polls", topic: "Presidential Approval", result: "43% Approve", date: "Day 40", trend: "down" as const },
  { pollster: "Afrobarometer", topic: "Economic Direction", result: "29% Right Track", date: "Day 38", trend: "down" as const },
  { pollster: "SBM Intel", topic: "Security Confidence", result: "34% Confident", date: "Day 36", trend: "stable" as const },
  { pollster: "NOI Polls", topic: "Fuel Subsidy Removal", result: "61% Oppose", date: "Day 35", trend: "up" as const },
  { pollster: "Afrobarometer", topic: "Trust in INEC", result: "22% Trust", date: "Day 33", trend: "down" as const },
];

export default function PublicAffairsTab() {
  const { toast } = useToast();
  const { state } = useGame();
  const action = (title: string, msg: string) => () =>
    toast({ title, description: msg });

  const isPlaying = state.phase === "playing";
  const outrage = isPlaying ? state.outrage : 42;
  const trust = isPlaying ? state.trust : 38;

  const [expandedWhistleblower, setExpandedWhistleblower] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Outrage vs Trust Meters */}
      <Card className="border border-border" data-testid="outrage-trust-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Public Sentiment — Outrage vs Trust</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-medium">Outrage</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-red-500">{outrage}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{ width: `${outrage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {outrage > 60 ? "Critical — protests likely" : outrage > 40 ? "Elevated — growing discontent" : "Manageable — public patience holds"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs font-medium">Trust</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-green-500">{trust}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${trust}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {trust > 60 ? "Strong — institutional credibility intact" : trust > 40 ? "Moderate — public skepticism rising" : "Low — government credibility at risk"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Narratives */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Top Narratives</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Narrative</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs text-right">Reach</TableHead>
                <TableHead className="text-xs">Sent.</TableHead>
                <TableHead className="text-xs text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {narratives.map((n) => (
                <TableRow key={n.narrative}>
                  <TableCell className="text-xs max-w-[180px]">{n.narrative}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{n.source}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{n.reach}</TableCell>
                  <TableCell>
                    <Badge variant={sentimentBadge(n.sentiment)} className="text-xs">
                      {n.sentiment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <TrendIcon direction={n.trend as "up" | "down" | "stable"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Polling */}
      <Card className="border border-border" data-testid="recent-polling-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Recent Polling</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Pollster</TableHead>
                <TableHead className="text-xs">Topic</TableHead>
                <TableHead className="text-xs">Result</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPolls.map((p) => (
                <TableRow key={`${p.pollster}-${p.topic}`}>
                  <TableCell className="text-xs font-medium">{p.pollster}</TableCell>
                  <TableCell className="text-xs">{p.topic}</TableCell>
                  <TableCell className="text-xs tabular-nums">{p.result}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="text-center">
                    <TrendIcon direction={p.trend} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Whistleblower Watch — Enhanced */}
      <Card className="border border-border" data-testid="whistleblower-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Whistleblower Watch
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {whistleblowers.map((w) => {
              const isExpanded = expandedWhistleblower === w.name;
              return (
                <Card key={w.name} className="border border-border bg-muted/30">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <CharacterAvatar name={w.name} initials={w.avatar} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.role}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={w.risk === "High" ? "destructive" : "outline"} className="text-xs flex-shrink-0">
                          {w.risk}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setExpandedWhistleblower(isExpanded ? null : w.name)}
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <>
                        <p className="text-xs text-muted-foreground">{w.info}</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid={`silence-${w.avatar.toLowerCase()}`}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={action(
                              "Silence Whistleblower",
                              `continue_conversation: Silence ${w.name} — apply pressure through legal threats, surveillance, or intermediaries. Risk: international backlash if exposed.`
                            )}
                          >
                            Silence
                          </Button>
                          <Button
                            data-testid={`negotiate-${w.avatar.toLowerCase()}`}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={action(
                              "Negotiate",
                              `continue_conversation: Negotiate with ${w.name} — offer settlement or position in exchange for silence. Costs political capital.`
                            )}
                          >
                            Negotiate
                          </Button>
                          <Button
                            data-testid={`refer-${w.avatar.toLowerCase()}`}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={action(
                              "Refer to EFCC/ICPC",
                              `continue_conversation: Refer ${w.name}'s allegations to EFCC/ICPC for formal investigation. Shows transparency but may expose allies.`
                            )}
                          >
                            Refer to EFCC/ICPC
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
