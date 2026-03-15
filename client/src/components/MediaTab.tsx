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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { PersonnelCard } from "@/components/PersonnelCard";
import { useGame } from "@/lib/GameContext";
import {
  AlertTriangle,
  Heart,
  MessageCircle,
  Newspaper,
  Repeat2,
  Share,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ACTIONS = [
  { id: "national-address", label: "Hold Press Conference", blurb: "Use the presidency itself to reset the frame." },
  { id: "state-visit", label: "Create A Positive Trip", blurb: "Generate tangible imagery and local coverage." },
  { id: "probe-commission", label: "Feed A Reform Story", blurb: "Let accountability, not denial, set the news cycle." },
  { id: "take-a-break", label: "Reduce Noise", blurb: "Reset tone, lower stress, and avoid compounding bad instincts." },
] as const;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const sourceForHeadline = (headline: string) => {
  if (/labour|strike|worker/i.test(headline)) return "The Reporter";
  if (/security|bandit|crisis|betrayal/i.test(headline)) return "Federal Capital TV";
  if (/market|treasury|naira|fx|cbn/i.test(headline)) return "BusinessDay";
  if (/governor|party|senate|election/i.test(headline)) return "The Cable";
  return "State House Wire";
};

const socialSentimentBadge = (sentiment: string) => {
  if (sentiment === "Negative") return "destructive" as const;
  if (sentiment === "Positive") return "default" as const;
  return "secondary" as const;
};

export default function MediaTab() {
  const { toast } = useToast();
  const { state, executeQuickAction } = useGame();

  const enrichedHeadlines = useMemo(() => (state.headlines.length > 0 ? state.headlines : ["The presidency is between story cycles."])
    .map((headline, index) => ({
      id: `${index}-${headline}`,
      source: sourceForHeadline(headline),
      title: headline,
      body: index === 0
        ? `${headline}. Editors are reading it through the lenses of trust ${state.trust}%, outrage ${state.outrage}%, and approval ${state.approval}%.`
        : `This line is reacting to the same live state: approval ${state.approval}%, stability ${state.stability}%, and treasury ${state.treasury.toFixed(2)}T.`,
    })), [state.approval, state.headlines, state.outrage, state.stability, state.treasury, state.trust]);

  const sentimentSeries = useMemo(() => {
    const history = state.approvalHistory.length > 0 ? state.approvalHistory : [{ day: state.day || 1, approval: state.approval || 43 }];
    return history.map((point, index) => {
      const positive = clamp(Math.round(point.approval * 0.55 + state.trust * 0.25 - state.outrage * 0.15), 8, 82);
      const negative = clamp(Math.round(state.outrage * 0.5 + (100 - point.approval) * 0.35 + index * 0.4), 10, 84);
      const neutral = clamp(100 - positive - negative, 6, 70);
      return { label: `D${point.day}`, positive, negative, neutral };
    });
  }, [state.approval, state.approvalHistory, state.day, state.outrage, state.trust]);

  const socialFeed = useMemo(() => {
    const seeds = [...state.turnLog].slice(-5).reverse();
    if (seeds.length === 0) {
      return [
        {
          id: "fallback-feed",
          handle: "@AsoRockWatch",
          name: "Aso Rock Watch",
          avatar: "AW",
          text: "Quiet cycles do not last in Abuja. The next decision will define the next headline.",
          likes: "2.4K",
          reposts: "1.1K",
          replies: "280",
          sentiment: "Neutral",
        },
      ];
    }

    return seeds.map((entry, index) => {
      const negative = /crisis|betrayal|anger|warning|fragile|strike/i.test(`${entry.event} ${entry.effects.join(" ")}`);
      const positive = /steady|calm|reform|restored|improves|goodwill/i.test(`${entry.event} ${entry.effects.join(" ")}`);
      return {
        id: `${entry.day}-${index}`,
        handle: ["@NaijaPulse", "@AsoVilla_NG", "@CivicLedger", "@PolicyDeskNG", "@StateHouseBeat"][index % 5],
        name: ["Naija Pulse", "Aso Villa", "Civic Ledger", "Policy Desk", "State House Beat"][index % 5],
        avatar: ["NP", "AV", "CL", "PD", "SB"][index % 5],
        text: `${entry.event}: ${entry.effects[0] ?? "The room is waiting for the presidency to shape the story."}`,
        likes: `${3 + index * 4}.${index + 1}K`,
        reposts: `${1 + index * 2}.${index + 3}K`,
        replies: `${280 + index * 140}`,
        sentiment: negative ? "Negative" : positive ? "Positive" : "Neutral",
      };
    });
  }, [state.turnLog]);

  const narrativeStakeholders = useMemo(() => {
    const names = [
      "Alhaji Bello Kazeem",
      "Brig. Kabiru Musa (Rtd)",
      "Chief Chidubem Okafor",
      "Comrade Ngozi Okafor",
    ];
    return names
      .map((name) => state.characters[name])
      .filter(Boolean)
      .map((character) => ({
        ...character,
        note:
          character.name === "Alhaji Bello Kazeem"
            ? "Every market wobble ends up with his face on television."
            : character.name === "Brig. Kabiru Musa (Rtd)"
              ? "Security success or failure is translating directly into your legitimacy."
              : character.name === "Chief Chidubem Okafor"
                ? "Party leaks change the tone of the press room before you even arrive."
                : "Labour rhetoric can set the emotional temperature of the whole week.",
      }));
  }, [state.characters]);

  const responseQueue = state.inboxMessages
    .filter((message) => message.priority === "Critical" || message.priority === "Urgent")
    .slice(0, 5);

  const negativeSentiment = sentimentSeries[sentimentSeries.length - 1]?.negative ?? 50;

  const runAction = (actionId: (typeof ACTIONS)[number]["id"], label: string) => {
    executeQuickAction(actionId);
    toast({ title: label, description: "Communications move logged. Watch the ticker and daily brief for the next narrative turn." });
  };

  const coolingDown = (actionId: string) => {
    const lastUsed = state.lastActionAtDay[actionId];
    return lastUsed !== undefined && state.day - lastUsed < 2;
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border" data-testid="headlines-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Headlines</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-2" data-testid="featured-headline">
            <Badge variant="outline" className="text-xs">{enrichedHeadlines[0]?.source}</Badge>
            <h3 className="text-sm font-semibold leading-snug">{enrichedHeadlines[0]?.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{enrichedHeadlines[0]?.body}</p>
          </div>
          <Accordion type="multiple" className="w-full">
            {enrichedHeadlines.slice(1).map((headline, index) => (
              <AccordionItem key={headline.id} value={`headline-${headline.id}`}>
                <AccordionTrigger className="text-sm py-2.5" data-testid={`headline-${index + 1}`}>
                  <div className="flex items-center gap-2 text-left">
                    <Badge variant="outline" className="text-xs shrink-0">{headline.source}</Badge>
                    <span className="font-medium">{headline.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{headline.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.95fr] gap-4">
        <Card className="border border-border" data-testid="media-sentiment-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Media Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sentimentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="positive" name="Positive" stroke="hsl(153, 60%, 32%)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="negative" name="Negative" stroke="hsl(0, 60%, 50%)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="neutral" name="Neutral" stroke="hsl(205, 65%, 48%)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border" data-testid="media-actions-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Communications Actions</CardTitle>
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
                      data-testid={`media-action-${action.id}`}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      disabled={disabled}
                      onClick={() => runAction(action.id, action.label)}
                    >
                      Execute
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
        <Card className="border border-border" data-testid="media-personnel-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Narrative Stakeholders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
            {narrativeStakeholders.map((person) => (
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
                note={person.note}
                className="bg-muted/20"
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border" data-testid="media-response-queue-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> Response Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {responseQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground">No urgent communications files are queued right now. The silence will not last.</p>
            ) : (
              responseQueue.map((message) => (
                <div key={message.id} className="rounded-md border border-border bg-muted/20 p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{message.subject}</p>
                    <Badge variant={message.priority === "Critical" ? "destructive" : "outline"} className="text-[11px]">{message.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{message.sender} - {message.preview}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Alert variant={negativeSentiment >= 55 ? "destructive" : "default"} className="py-3 px-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="text-xs font-medium">Media Warning</AlertTitle>
        <AlertDescription className="text-xs">
          Negative narrative pressure is running at roughly {negativeSentiment}%. The current lead story is "{enrichedHeadlines[0]?.title}". If you do not shape the next cycle yourself, opponents and markets will do it for you.
        </AlertDescription>
      </Alert>
    </div>
  );
}
