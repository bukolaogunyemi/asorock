import { useState } from "react";
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
import { Info, AlertTriangle, Globe, Handshake, Users, Building2 } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { PersonnelCard } from "@/components/PersonnelCard";
import { migrateOldCompetencies } from "@/lib/competencyUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { diplomacyRelations, tradePipeline, ecowasStability, diplomacyPersonnel } from "@/lib/gameData";

interface AmbassadorPost {
  country: string;
  status: "Appointed" | "Vacant";
  ambassador?: string;
  initials?: string;
}

const initialPosts: AmbassadorPost[] = [
  { country: "United States", status: "Appointed", ambassador: "Amb. Adebowale Adefuye", initials: "AA" },
  { country: "China", status: "Vacant" },
  { country: "United Kingdom", status: "Vacant" },
  { country: "African Union", status: "Vacant" },
  { country: "United Nations (New York)", status: "Appointed", ambassador: "Amb. Tijjani Muhammad-Bande", initials: "TM" },
  { country: "Saudi Arabia", status: "Vacant" },
];

const relationBadge = (r: string) => {
  if (r === "Tense" || r === "Strained") return "destructive" as const;
  if (r === "Strong") return "default" as const;
  return "outline" as const;
};

const dealStatusBadge = (s: string) => {
  if (s === "Stalled") return "destructive" as const;
  if (s === "Signed") return "default" as const;
  if (s === "Pending Approval") return "outline" as const;
  return "secondary" as const;
};

const stabilityColor = (val: number) => {
  if (val >= 60) return "hsl(153, 60%, 32%)";
  if (val >= 40) return "hsl(42, 70%, 50%)";
  return "hsl(0, 60%, 50%)";
};

export default function DiplomacyTab() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AmbassadorPost[]>(initialPosts);
  const action = (title: string, msg: string) => () =>
    toast({ title, description: msg });

  const recallAmbassador = (country: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.country === country ? { country: p.country, status: "Vacant" as const } : p
      )
    );
    toast({
      title: "Ambassador Recalled",
      description: `continue_conversation: Ambassador to ${country} has been recalled. The post is now vacant pending a new appointment.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Diplomatic Corps — Key Personnel */}
      <Card className="border border-border" data-testid="diplomacy-personnel-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Diplomatic Corps — Key Personnel</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {diplomacyPersonnel.map((p) => (
              <PersonnelCard
                key={p.name}
                name={p.name}
                avatar={p.avatar}
                title={p.title}
                age={p.age}
                state={p.state}
                gender={p.gender}
                competencies={migrateOldCompetencies({ loyalty: p.loyalty, competence: p.competence, ambition: 50, portfolio: p.title })}
                relationship={p.relationship}
                faction={p.shortTitle}
                note={`${p.tenure}. ${p.note}`}
                className="bg-muted/30"
                actions={
                  <Button
                    data-testid={`summon-${p.shortTitle.toLowerCase()}`}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={action(
                      `Summon ${p.shortTitle}`,
                      `continue_conversation: Summon ${p.name} (${p.shortTitle}) — request a private diplomatic briefing.`
                    )}
                  >
                    Summon for Briefing
                  </Button>
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Foreign Affairs Council Meeting */}
      <Card className="border border-border" data-testid="diplomacy-council-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Foreign Affairs Council Meeting</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <p className="text-xs text-muted-foreground">
            Convene the Foreign Affairs Council for briefings on regional security, trade negotiations, and international partnerships.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="diplo-meeting-ecowas"
              onClick={action("ECOWAS Brief", "continue_conversation: Foreign Affairs Council — ECOWAS: Regional stability assessment, Niger crisis update, and Nigeria's leadership role.")}>
              <Globe className="h-3.5 w-3.5 mr-1.5" /> ECOWAS Brief
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="diplo-meeting-trade"
              onClick={action("Trade Negotiations", "continue_conversation: Foreign Affairs Council — Trade: Review AfCFTA implementation, bilateral deals, and trade pipeline status.")}>
              <Handshake className="h-3.5 w-3.5 mr-1.5" /> Trade Negotiations
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="diplo-meeting-diaspora"
              onClick={action("Diaspora Affairs", "continue_conversation: Foreign Affairs Council — Diaspora: Engagement strategy, remittance flows, and dual-citizenship policy review.")}>
              <Users className="h-3.5 w-3.5 mr-1.5" /> Diaspora Affairs
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" data-testid="diplo-meeting-multilateral"
              onClick={action("Multilateral Strategy", "continue_conversation: Foreign Affairs Council — Multilateral: UN Security Council bid progress, AU chairmanship campaign, and IMF engagement.")}>
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> Multilateral Strategy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Relations + Trade */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Foreign Relations</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs">Relation</TableHead>
                  <TableHead className="text-xs text-right">Trade Vol.</TableHead>
                  <TableHead className="text-xs">Key Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diplomacyRelations.map((d) => (
                  <TableRow key={d.partner}>
                    <TableCell className="text-sm font-medium">{d.partner}</TableCell>
                    <TableCell>
                      <Badge variant={relationBadge(d.relation)} className="text-xs">
                        {d.relation}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{d.tradeVol}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                      {d.keyIssue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Trade Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Deal</TableHead>
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradePipeline.map((t) => (
                  <TableRow key={t.deal}>
                    <TableCell className="text-sm font-medium">{t.deal}</TableCell>
                    <TableCell className="text-sm">{t.partner}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{t.value}</TableCell>
                    <TableCell>
                      <Badge variant={dealStatusBadge(t.status)} className="text-xs">
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Feature 2: ECOWAS Regional Stability */}
      <Card className="border border-border" data-testid="ecowas-stability-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">ECOWAS Regional Stability Index</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ecowasStability} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                dataKey="country"
                type="category"
                width={90}
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                formatter={(v: number) => `${v}/100`}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="stability" radius={[0, 4, 4, 0]}>
                {ecowasStability.map((entry, i) => (
                  <Cell key={i} fill={stabilityColor(entry.stability)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Alert className="py-2 px-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs font-medium">Sahel Spillover Risk</AlertTitle>
            <AlertDescription className="text-xs">
              Niger (22) and Mali (18) instability threatens Nigerian border security. Military operations in NW correlated with Sahel crisis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Diplomatic Actions + Note */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Diplomatic Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <Button
              data-testid="ecowas-summit-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "ECOWAS Summit",
                "continue_conversation: ECOWAS Summit — attend emergency summit on Niger crisis. Must decide between hardline or compromise stance."
              )}
            >
              Attend ECOWAS Summit
            </Button>
            <Button
              data-testid="china-renegotiate-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "China Debt",
                "continue_conversation: Renegotiate China Debt — push for extended repayment terms on $4.5B rail corridor loan."
              )}
            >
              Renegotiate China Debt Terms
            </Button>
            <Button
              data-testid="us-security-pact-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "US Security Pact",
                "continue_conversation: US Security Pact — propose enhanced military cooperation agreement with Washington."
              )}
            >
              Propose US Security Pact
            </Button>
            <Button
              data-testid="opec-quota-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "OPEC+ Quota",
                "continue_conversation: OPEC+ Quota — lobby Saudi Arabia to raise Nigeria's production quota from 1.58 to 1.8 mbpd."
              )}
            >
              Lobby OPEC+ Quota Increase
            </Button>
          </CardContent>
        </Card>

        <Alert className="py-3 px-4 self-start">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">Diplomatic Context</AlertTitle>
          <AlertDescription className="text-xs">
            ECOWAS summit on Day 48 is a critical juncture. France is actively courting West African states for alternative leadership to Nigeria. China debt renegotiation window closes on Day 54. IMF delegation arrival on Day 45 overlaps with OPEC+ meeting — coordinate messaging carefully.
          </AlertDescription>
        </Alert>
      </div>

      {/* Ambassador Appointments */}
      <Card className="border border-border" data-testid="ambassador-appointments-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Ambassador Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {posts.map((post) => (
              <Card key={post.country} className="border border-border bg-muted/30">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Ambassador to {post.country}</p>
                    <Badge
                      variant={post.status === "Appointed" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {post.status}
                    </Badge>
                  </div>
                  {post.status === "Appointed" && post.ambassador ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CharacterAvatar
                          name={post.ambassador}
                          initials={post.initials ?? "??"}
                          size="sm"
                        />
                        <p className="text-xs font-medium">{post.ambassador}</p>
                      </div>
                      <Button
                        data-testid={`recall-${post.country.toLowerCase().replace(/[\s()]/g, "-")}`}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => recallAmbassador(post.country)}
                      >
                        Recall Ambassador
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground italic">Post vacant — awaiting presidential appointment</p>
                      <Button
                        data-testid={`appoint-${post.country.toLowerCase().replace(/[\s()]/g, "-")}`}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={action(
                          `Appoint Ambassador`,
                          `continue_conversation: Appoint Ambassador to ${post.country} — select from available candidates. Appointment affects bilateral relations and trade negotiations.`
                        )}
                      >
                        Appoint Ambassador
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
