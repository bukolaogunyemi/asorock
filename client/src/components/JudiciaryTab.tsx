import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/lib/GameContext";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CompetencyBar } from "@/components/CompetencyBar";
import { RelationshipIndicator } from "@/components/RelationshipIndicator";
import { Scale, Gavel, ShieldAlert, UserCheck, Ban } from "lucide-react";

const judiciaryPersonnel = [
  {
    name: "Justice Adewale Fashola",
    title: "Chief Justice of Nigeria",
    shortTitle: "CJN",
    avatar: "AF",
    gender: "Male",
    loyalty: 55,
    competence: 70,
    relationship: "Neutral" as const,
    note: "Traditionalist. Unlikely to challenge executive but protective of judicial turf.",
  },
  {
    name: "Justice Hauwa Daramola",
    title: "President, Court of Appeal",
    shortTitle: "PCA",
    avatar: "HD",
    gender: "Female",
    loyalty: 45,
    competence: 80,
    relationship: "Wary" as const,
    note: "Reform-minded. Has ruled against government before.",
  },
  {
    name: "Justice Kwame Mensah",
    title: "President, ECOWAS Court",
    shortTitle: "ECOWAS",
    avatar: "EA",
    gender: "Male",
    loyalty: 40,
    competence: 75,
    relationship: "Neutral" as const,
    note: "International jurist. Concerned about regional human rights record.",
  },
  {
    name: "Barr. Lanre Adekunle",
    title: "Attorney General & Minister of Justice",
    shortTitle: "AG",
    avatar: "LA",
    gender: "Male",
    loyalty: 72,
    competence: 68,
    relationship: "Friendly" as const,
    note: "Loyalist. Will pursue government legal strategy but has limits.",
  },
];

const independenceColor = (v: number) => {
  if (v >= 50) return "bg-green-500";
  if (v >= 30) return "bg-amber-500";
  return "bg-red-500";
};

const independenceLabel = (v: number) => {
  if (v >= 70) return "Strong";
  if (v >= 50) return "Moderate";
  if (v >= 30) return "Weakened";
  return "Compromised";
};

const statusColor = (s: string) => {
  if (s === "Decided") return "secondary" as const;
  if (s === "Deliberation") return "default" as const;
  if (s === "Hearing") return "outline" as const;
  return "outline" as const;
};

const stakesColor = (s: string) => {
  if (s === "Constitutional") return "destructive" as const;
  if (s === "High") return "destructive" as const;
  if (s === "Medium") return "outline" as const;
  return "secondary" as const;
};

const statusSteps = ["Filed", "Hearing", "Deliberation", "Decided"];

export default function JudiciaryTab() {
  const { toast } = useToast();
  const { state } = useGame();
  const action = (title: string, msg: string) => () =>
    toast({ title, description: msg });

  const isPlaying = state.phase === "playing";
  const judicialIndependence = isPlaying ? state.judicialIndependence : 65;
  const activeCases = isPlaying ? state.activeCases : [];

  return (
    <div className="space-y-4">
      {/* Row 1: Judicial Independence + Personnel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Judicial Independence Meter */}
        <Card className="border border-border" data-testid="judicial-independence-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Judicial Independence</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Independence Index</span>
              <span className="text-xs font-medium">{independenceLabel(judicialIndependence)}</span>
            </div>
            <div className="space-y-1">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${independenceColor(judicialIndependence)}`}
                  style={{ width: `${judicialIndependence}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold tabular-nums">{judicialIndependence}%</span>
                <Scale className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {judicialIndependence >= 50
                ? "Courts operating with reasonable autonomy. Rulings generally respected."
                : "Judicial independence under pressure. Court rulings may face executive resistance."}
            </p>
          </CardContent>
        </Card>

        {/* Judiciary Personnel */}
        <Card className="border border-border xl:col-span-2" data-testid="judiciary-personnel-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Judiciary Personnel</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {judiciaryPersonnel.map((p) => (
                <Card key={p.name} className="border border-border bg-muted/30">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <CharacterAvatar name={p.name} initials={p.avatar} size="md" gender={p.gender} role={p.title} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.title}</p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{p.shortTitle}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <CompetencyBar value={p.loyalty} label="Loyalty" />
                      <CompetencyBar value={p.competence} label="Competence" />
                    </div>
                    <RelationshipIndicator relationship={p.relationship} />
                    <p className="text-xs text-muted-foreground italic">{p.note}</p>
                    <Button
                      data-testid={`summon-${p.shortTitle.toLowerCase()}`}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={action(
                        `Summon ${p.shortTitle}`,
                        `continue_conversation: Summon ${p.name} (${p.shortTitle}) — request a private judicial briefing.`
                      )}
                    >
                      Summon for Briefing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Active Court Cases */}
      <Card className="border border-border" data-testid="court-cases-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Active Court Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {activeCases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No active court cases. Start a campaign to see live judicial proceedings.
            </p>
          ) : (
            <div className="space-y-3">
              {activeCases.map((c) => {
                const stepIndex = statusSteps.indexOf(c.status);
                return (
                  <Card key={c.id} className="border border-border bg-muted/30">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.plaintiff} vs {c.defendant}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant={statusColor(c.status)} className="text-xs">{c.status}</Badge>
                          <Badge variant={stakesColor(c.stakes)} className="text-xs">{c.stakes}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{c.court}</Badge>
                        {c.status !== "Decided" && (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {c.daysToDecision} days to decision
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                      {/* Status Progress */}
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, i) => (
                          <div key={step} className="flex items-center gap-1">
                            <div
                              className={`h-1.5 rounded-full flex-1 min-w-[40px] ${
                                i <= stepIndex ? "bg-green-500" : "bg-muted"
                              }`}
                            />
                            <span className={`text-[10px] ${
                              i <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground"
                            }`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 3: Judicial Actions */}
      <Card className="border border-border" data-testid="judicial-actions-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Judicial Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              data-testid="influence-ruling-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Influence Ruling",
                "continue_conversation: Influence Ruling — attempt to sway a pending court decision through backchannels. Risk: judicial independence drops, potential scandal."
              )}
            >
              <Gavel className="h-3.5 w-3.5 mr-2" />
              Influence Ruling
            </Button>
            <Button
              data-testid="appoint-judge-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Appoint Judge",
                "continue_conversation: Appoint Friendly Judge — nominate a loyalist to a vacant judicial position. Costs political capital."
              )}
            >
              <UserCheck className="h-3.5 w-3.5 mr-2" />
              Appoint Friendly Judge
            </Button>
            <Button
              data-testid="accept-ruling-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Accept Ruling",
                "continue_conversation: Accept Ruling — publicly comply with a court decision. Boosts judicial independence and trust."
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5 mr-2" />
              Accept Ruling
            </Button>
            <Button
              data-testid="defy-court-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={action(
                "Defy Court Order",
                "continue_conversation: Defy Court Order — refuse to comply with a judicial ruling. Severe consequences: judicial independence plummets, international condemnation, trust collapse."
              )}
            >
              <Ban className="h-3.5 w-3.5 mr-2" />
              Defy Court Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
