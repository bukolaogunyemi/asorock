import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { RelationshipIndicator } from "@/components/RelationshipIndicator";
import { Briefcase, Shield, Scale, Megaphone, Shuffle, ClipboardCheck, Key } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cabinetRoster, factions } from "@/lib/gameData";
import { traitDefinitions } from "@/lib/traits";


const traitBadgeVariant = (category: string) => {
  if (category === "personality") return "outline" as const;
  if (category === "ideology") return "secondary" as const;
  return "default" as const;
};

export default function CabinetTab() {
  const { toast } = useToast();
  const { state } = useGame();
  const action = (title: string) => (msg: string) => () =>
    toast({ title, description: msg });

  const isPlaying = state.phase === "playing";

  return (
    <div className="space-y-4">
      {/* Cabinet Roster — Card Grid */}
      <Card className="border border-border" data-testid="cabinet-roster-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Cabinet Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {cabinetRoster.map((m) => {
              // Get live character data from GameContext if playing
              const charData = isPlaying ? state.characters[m.name] : null;
              const loyalty = charData?.loyalty ?? m.loyalty;
              const competence = charData?.competence ?? m.competence;
              const ambition = charData?.ambition ?? m.ambition;
              const relationship = charData?.relationship ?? m.relationship;
              const faction = charData?.faction ?? m.faction;
              const traits = charData?.traits ?? [];
              const hooks = charData?.hooks ?? [];

              return (
                <Card key={m.name} className="border border-border bg-muted/30">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <CharacterAvatar name={m.name} initials={m.avatar} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.portfolio}</p>
                          </div>
                          {hooks.length > 0 && (
                            <Key
                              className="h-3.5 w-3.5 text-amber-500 flex-shrink-0"
                              data-testid={`hook-indicator-${m.name.toLowerCase().replace(/\s+/g, "-")}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trait Badges */}
                    {traits.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {traits.map((t) => {
                          const def = traitDefinitions[t];
                          return (
                            <Badge
                              key={t}
                              variant={def ? traitBadgeVariant(def.category) : "outline"}
                              className="text-xs"
                              data-testid={`trait-badge-${t}`}
                            >
                              {def?.label ?? t}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <CompetencyBar value={loyalty} label="Loyalty" />
                      <CompetencyBar value={competence} label="Competence" />
                      <CompetencyBar value={ambition} label="Ambition" />
                    </div>

                    <div className="flex items-center justify-between">
                      <RelationshipIndicator relationship={relationship} />
                      <Badge variant="outline" className="text-xs">{faction}</Badge>
                    </div>
                    <Button
                      data-testid={`summon-${m.portfolio.toLowerCase().replace(/\s+/g, "-")}`}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => toast({ title: m.portfolio, description: `continue_conversation: Summon ${m.name} (${m.portfolio}) — request a private ministerial briefing on ${m.portfolio} matters.` })}
                    >
                      Summon for Briefing
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Faction Influence (unchanged chart) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Faction Influence</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={factions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="influence" fill="hsl(153, 60%, 32%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cabinet Meeting + Cabinet Actions */}
        <div className="space-y-4">
          <Card className="border border-border" data-testid="cabinet-meeting-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Cabinet Meeting</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  data-testid="economy-briefing-btn"
                  variant="outline"
                  className="flex flex-col items-center justify-center gap-1.5 h-20 text-xs"
                  onClick={() => toast({ title: "Cabinet Meeting", description: "continue_conversation: Economy Briefing — Finance Minister presents fiscal outlook, revenue projections, and IMF engagement update." })}
                >
                  <Briefcase className="h-5 w-5" />
                  Economy Briefing
                </Button>
                <Button
                  data-testid="security-briefing-btn"
                  variant="outline"
                  className="flex flex-col items-center justify-center gap-1.5 h-20 text-xs"
                  onClick={() => toast({ title: "Cabinet Meeting", description: "continue_conversation: Security Briefing — NSA and Defence Minister present threat assessment and operational updates." })}
                >
                  <Shield className="h-5 w-5" />
                  Security Briefing
                </Button>
                <Button
                  data-testid="legislative-strategy-btn"
                  variant="outline"
                  className="flex flex-col items-center justify-center gap-1.5 h-20 text-xs"
                  onClick={() => toast({ title: "Cabinet Meeting", description: "continue_conversation: Legislative Strategy — Attorney General briefs on pending bills, whip counts, and parliamentary tactics." })}
                >
                  <Scale className="h-5 w-5" />
                  Legislative Strategy
                </Button>
                <Button
                  data-testid="public-affairs-btn"
                  variant="outline"
                  className="flex flex-col items-center justify-center gap-1.5 h-20 text-xs"
                  onClick={() => toast({ title: "Cabinet Meeting", description: "continue_conversation: Public Affairs Review — Media team presents sentiment analysis, narrative tracking, and communications strategy." })}
                >
                  <Megaphone className="h-5 w-5" />
                  Public Affairs Review
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border" data-testid="cabinet-actions-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Cabinet Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Button
                data-testid="reshuffle-minister-btn"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => toast({ title: "Cabinet Reshuffle", description: "continue_conversation: Reshuffle Minister — select a minister to replace. Consider faction balance and competence needs." })}
              >
                <Shuffle className="h-3.5 w-3.5 mr-2" />
                Reshuffle Minister
              </Button>
              <Button
                data-testid="performance-review-btn"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => toast({ title: "Performance Review", description: "continue_conversation: Performance Review — evaluate minister performance metrics and issue warnings or commendations." })}
              >
                <ClipboardCheck className="h-3.5 w-3.5 mr-2" />
                Performance Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
