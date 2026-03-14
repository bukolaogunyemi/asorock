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
import { AlertTriangle } from "lucide-react";
import { PersonnelCard } from "@/components/PersonnelCard";
import { useGame } from "@/lib/GameContext";
import {
  senateSeats,
  houseSeats,
  whipTracker,
  activeBills,
} from "@/lib/gameData";

const SEAT_COLORS = {
  ruling: "hsl(153, 60%, 32%)",
  opposition: "hsl(0, 60%, 50%)",
  independent: "hsl(200, 60%, 45%)",
};

function SeatDots({ ruling, opposition, independent, size }: { ruling: number; opposition: number; independent: number; size: "senate" | "house" }) {
  const dotClass = size === "senate" ? "w-3 h-3 rounded-full" : "w-2.5 h-2.5 rounded-full";
  const dots: { color: string; group: string }[] = [];
  for (let i = 0; i < ruling; i++) dots.push({ color: SEAT_COLORS.ruling, group: "Ruling" });
  for (let i = 0; i < opposition; i++) dots.push({ color: SEAT_COLORS.opposition, group: "Opposition" });
  for (let i = 0; i < independent; i++) dots.push({ color: SEAT_COLORS.independent, group: "Independent" });
  return (
    <div className="flex flex-wrap gap-1">
      {dots.map((d, i) => (
        <div key={i} className={dotClass} style={{ backgroundColor: d.color }} title={d.group} />
      ))}
    </div>
  );
}

function SeatLegend() {
  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEAT_COLORS.ruling }} />
        <span className="text-xs text-muted-foreground">Ruling</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEAT_COLORS.opposition }} />
        <span className="text-xs text-muted-foreground">Opposition</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEAT_COLORS.independent }} />
        <span className="text-xs text-muted-foreground">Independent</span>
      </div>
    </div>
  );
}

const statusBadge = (s: string) => {
  if (s === "Stalled") return "destructive" as const;
  if (s === "Floor Debate") return "outline" as const;
  if (s === "Committee") return "secondary" as const;
  return "default" as const;
};

const stakesBadge = (s: string) => {
  if (s === "Critical") return "destructive" as const;
  if (s === "High") return "outline" as const;
  return "secondary" as const;
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function LegislatureTab() {
  const { toast } = useToast();
  const action = (title: string, msg: string) => () =>
    toast({ title, description: msg });

  const { state } = useGame();

  // Split constitutional officers into Senate and House leadership
  const senateLeadership = state.constitutionalOfficers.filter(
    (o) => o.portfolio === "Senate President" || o.portfolio === "Deputy Senate President"
  );
  const houseLeadership = state.constitutionalOfficers.filter(
    (o) => o.portfolio === "Speaker of the House" || o.portfolio === "Deputy Speaker"
  );
  const allLeaders = [...senateLeadership, ...houseLeadership];

  return (
    <div className="space-y-4">
      {/* Row 1: Senate + House donuts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-border" data-testid="senate-seats-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Senate — {senateSeats.total} seats</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <SeatDots ruling={senateSeats.ruling} opposition={senateSeats.opposition} independent={senateSeats.independent} size="senate" />
            <SeatLegend />
            <p className="text-xs text-muted-foreground">
              Majority threshold: 55 seats. Ruling party holds {senateSeats.ruling} — {senateSeats.ruling - 55}-seat margin.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border" data-testid="house-seats-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">House of Representatives — {houseSeats.total} seats</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <SeatDots ruling={houseSeats.ruling} opposition={houseSeats.opposition} independent={houseSeats.independent} size="house" />
            <SeatLegend />
            <p className="text-xs text-muted-foreground">
              Majority threshold: 181 seats. Ruling coalition holds {houseSeats.ruling} — {houseSeats.ruling - 181}-seat margin.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Legislative Leadership */}
      <Card className="border border-border" data-testid="legislative-leadership-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Legislative Leadership</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {allLeaders.map((c) => (
              <PersonnelCard
                key={c.name}
                name={c.name}
                avatar={c.avatar}
                title={c.portfolio}
                age={c.age}
                state={c.state}
                gender={c.gender}
                loyalty={c.loyalty}
                competence={c.competence}
                ambition={c.ambition}
                relationship={c.relationship}
                faction={c.faction}
                note={`Agenda: ${c.agenda}`}
                className="bg-muted/30"
                actions={
                  <div className="flex gap-2">
                    <Button
                      data-testid={`invite-${c.name.toLowerCase().replace(/[\s.()]+/g, "-")}`}
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={action(
                        `Invite ${c.name}`,
                        `continue_conversation: Invite ${c.name} — request a private meeting to discuss legislative agenda and negotiate support.`
                      )}
                    >
                      Invite
                    </Button>
                    <Button
                      data-testid={`send-proposal-${c.name.toLowerCase().replace(/[\s.()]+/g, "-")}`}
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={action(
                        `Send Proposal to ${c.name}`,
                        `continue_conversation: Send Proposal to ${c.name} — transmit executive proposal for review and consideration.`
                      )}
                    >
                      Send Proposal
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Whip Tracker */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Vote Whip Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Bloc</TableHead>
                <TableHead className="text-xs text-center">Seats</TableHead>
                <TableHead className="text-xs text-center">Loyalty %</TableHead>
                <TableHead className="text-xs">Leaning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {whipTracker.map((b) => (
                <TableRow key={b.bloc}>
                  <TableCell className="text-sm font-medium">{b.bloc}</TableCell>
                  <TableCell className="text-sm text-center tabular-nums">{b.seats}</TableCell>
                  <TableCell className="text-sm text-center tabular-nums">{b.loyalty}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        b.leaning === "Hostile"
                          ? "destructive"
                          : b.leaning === "Reliable"
                            ? "default"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {b.leaning}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Bills */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Active Bills</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Bill</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-center">Support</TableHead>
                <TableHead className="text-xs text-center">Opposition</TableHead>
                <TableHead className="text-xs">Stakes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBills.map((b) => (
                <TableRow key={b.name}>
                  <TableCell className="text-sm font-medium">{b.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadge(b.status)} className="text-xs">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-center tabular-nums">{b.support}</TableCell>
                  <TableCell className="text-sm text-center tabular-nums">{b.opposition}</TableCell>
                  <TableCell>
                    <Badge variant={stakesBadge(b.stakes)} className="text-xs">
                      {b.stakes}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legislative Actions + Callout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Legislative Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <Button
              data-testid="whip-votes-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Whip Votes",
                "continue_conversation: Whip Votes — deploy party machinery to secure votes on Petroleum Industry Amendment."
              )}
            >
              Whip Votes on PIB Amendment
            </Button>
            <Button
              data-testid="offer-concessions-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Offer Concessions",
                "continue_conversation: Offer Concessions — negotiate with opposition moderates for bipartisan support."
              )}
            >
              Offer Concessions to Moderates
            </Button>
            <Button
              data-testid="address-joint-session-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Address Joint Session",
                "continue_conversation: Address Joint Session — deliver a presidential address to both chambers of the National Assembly on priority legislation."
              )}
            >
              Address Joint Session
            </Button>
            <Button
              data-testid="executive-order-btn"
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={action(
                "Executive Order",
                "continue_conversation: Executive Order — bypass legislature with an executive order. Constitutional challenge risk. Use sparingly."
              )}
            >
              Executive Order
            </Button>
          </CardContent>
        </Card>

        <Alert variant="destructive" className="py-3 px-4 self-start">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-xs font-medium">High-Stakes Vote Incoming</AlertTitle>
          <AlertDescription className="text-xs">
            Petroleum Industry Amendment goes to floor vote on Day 45. Current whip count shows 188 for vs 152 against — 7 votes above threshold but 12 ruling allies are wavering. Senate President is conditioning support on patronage commitments.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
