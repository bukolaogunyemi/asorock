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
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { useGame } from "@/lib/GameContext";
import { getInfluenceLevers } from "@/lib/influenceLevers";
import type { Bill, VoteProjection } from "@/lib/legislativeTypes";

// ── Colour helpers ─────────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  economy:        "bg-emerald-700 text-emerald-100",
  security:       "bg-red-700 text-red-100",
  social:         "bg-blue-700 text-blue-100",
  governance:     "bg-amber-700 text-amber-100",
  constitutional: "bg-purple-700 text-purple-100",
};

const STAKES_COLORS: Record<string, string> = {
  routine:     "bg-zinc-600 text-zinc-100",
  significant: "bg-yellow-700 text-yellow-100",
  critical:    "bg-red-700 text-red-100",
};

const SPONSOR_LABELS: Record<string, string> = {
  executive:          "Executive",
  "ruling-backbench": "Ruling Bench",
  opposition:         "Opposition",
  "cross-party":      "Cross-Party",
};

const STAGE_LABELS: Record<string, string> = {
  introduction: "Introduction",
  committee:    "Committee",
  "floor-debate": "Floor Debate",
  vote:         "Vote",
  passed:       "Passed",
  failed:       "Failed",
  stalled:      "Stalled",
  vetoed:       "Vetoed",
  signed:       "Signed",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function VoteBar({ projection, chamberSize }: { projection: VoteProjection; chamberSize: number }) {
  const total = chamberSize;
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

  return (
    <div className="flex h-3 rounded overflow-hidden w-full" title={
      `Firm Yes: ${projection.firmYes} | Leaning Yes: ${projection.leaningYes} | Undecided: ${projection.undecided} | Leaning No: ${projection.leaningNo} | Firm No: ${projection.firmNo}`
    }>
      <div className="bg-green-600"  style={{ width: pct(projection.firmYes) }} />
      <div className="bg-lime-500"   style={{ width: pct(projection.leaningYes) }} />
      <div className="bg-zinc-500"   style={{ width: pct(projection.undecided) }} />
      <div className="bg-orange-500" style={{ width: pct(projection.leaningNo) }} />
      <div className="bg-red-700"    style={{ width: pct(projection.firmNo) }} />
    </div>
  );
}

function VoteBarLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400 mt-1">
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-600 inline-block" />Firm Yes</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-lime-500 inline-block" />Leaning Yes</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-500 inline-block" />Undecided</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />Leaning No</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-700 inline-block" />Firm No</span>
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  const houseLabel = STAGE_LABELS[bill.houseStage] ?? bill.houseStage;
  const senateLabel = STAGE_LABELS[bill.senateStage] ?? bill.senateStage;
  const subjectClass = SUBJECT_COLORS[bill.subjectTag] ?? "bg-zinc-600 text-zinc-100";
  const stakesClass  = STAKES_COLORS[bill.stakes]     ?? "bg-zinc-600 text-zinc-100";

  return (
    <div
      className="rounded-lg border border-[#C5A55A]/20 bg-[#0A4D2C]/40 p-3 space-y-2"
      data-testid={`bill-card-${bill.id}`}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start gap-2">
        <span className="font-semibold text-sm text-[#C5A55A] flex-1 min-w-0">{bill.title}</span>
        {bill.isCrisis && (
          <Badge className="bg-red-800 text-red-100 text-xs shrink-0">
            <AlertTriangle className="w-3 h-3 mr-1 inline" />CRISIS
          </Badge>
        )}
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subjectClass}`}>
          {bill.subjectTag.charAt(0).toUpperCase() + bill.subjectTag.slice(1)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stakesClass}`}>
          {bill.stakes.charAt(0).toUpperCase() + bill.stakes.slice(1)}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-200">
          {SPONSOR_LABELS[bill.sponsor] ?? bill.sponsor}
        </span>
      </div>

      {/* Stage row */}
      <div className="text-xs text-zinc-400 space-y-0.5">
        <div>
          <span className="text-zinc-500">House: </span>
          <span className="text-zinc-200">{houseLabel}</span>
          {bill.houseStageDaysRemaining > 0 && bill.houseStage !== "passed" && bill.houseStage !== "failed" && (
            <span className="text-zinc-500"> ({bill.houseStageDaysRemaining}d)</span>
          )}
          <span className="text-zinc-500"> &nbsp;|&nbsp; Senate: </span>
          <span className="text-zinc-200">{senateLabel}</span>
          {bill.senateStageDaysRemaining > 0 && bill.senateStage !== "passed" && bill.senateStage !== "failed" && (
            <span className="text-zinc-500"> ({bill.senateStageDaysRemaining}d)</span>
          )}
        </div>
      </div>

      {/* Vote bars */}
      <div className="space-y-1">
        <div className="text-xs text-zinc-500">House projection (360 seats)</div>
        <VoteBar projection={bill.houseSupport} chamberSize={360} />
        <div className="text-xs text-zinc-500 mt-1">Senate projection (109 seats)</div>
        <VoteBar projection={bill.senateSupport} chamberSize={109} />
        <VoteBarLegend />
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed">{bill.description}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LegislatureTab({ onCharacterClick: _onCharacterClick, onEntityClick: _onEntityClick }: { onCharacterClick?: (characterKey: string) => void; onEntityClick?: (entityId: string) => void } = {}) {
  const { state, signBill, vetoBill, resolveCrisis } = useGame();
  const legislature = state.legislature;

  const [selectedLeverIds, setSelectedLeverIds] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // If legislature isn't initialised yet (e.g. in tests / loading), show a placeholder
  if (!legislature) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500">
        <FileText className="w-6 h-6 mr-2" />
        Legislature not yet initialised.
      </div>
    );
  }

  const { activeBills, pendingSignature, passedBills, failedBills, sessionStats } = legislature;

  // Find crisis bills (in active bills)
  const crisisBills = activeBills.filter((b) => b.isCrisis);

  const allLevers = getInfluenceLevers();

  const toggleLever = (id: string) => {
    setSelectedLeverIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── 1. Session Overview ──────────────────────────────────────────────── */}
      <Card className="border border-[#C5A55A]/30 bg-[#071f12]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold text-[#C5A55A] uppercase tracking-wider">
            Session Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C5A55A]">{sessionStats.billsIntroduced}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Introduced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{sessionStats.billsPassed}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{sessionStats.billsVetoed}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Vetoed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{activeBills.length}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Active</div>
            </div>
          </div>

          {/* Party loyalty gauge */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Party Loyalty</span>
              <span className="text-[#C5A55A] font-semibold">{state.partyLoyalty ?? 70}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-[#C5A55A] transition-all duration-500"
                style={{ width: `${state.partyLoyalty ?? 70}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Active Bills ──────────────────────────────────────────────────── */}
      <Card className="border border-[#C5A55A]/30 bg-[#071f12]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold text-[#C5A55A] uppercase tracking-wider">
            Active Bills ({activeBills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {activeBills.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No bills currently in the National Assembly.</p>
          ) : (
            activeBills.map((bill) => <BillCard key={bill.id} bill={bill} />)
          )}
        </CardContent>
      </Card>

      {/* ── 3. Presidential Desk ─────────────────────────────────────────────── */}
      {pendingSignature.length > 0 && (
        <Card className="border border-[#C5A55A]/40 bg-[#071f12]">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-[#C5A55A] uppercase tracking-wider">
              Presidential Desk ({pendingSignature.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {pendingSignature.map((bill) => {
              const daysLeft = bill.signingDeadlineDay !== null
                ? bill.signingDeadlineDay - state.day
                : null;
              return (
                <div
                  key={bill.id}
                  className="rounded-lg border border-[#C5A55A]/30 bg-[#0A4D2C]/30 p-3 space-y-2"
                  data-testid={`pending-bill-${bill.id}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-sm text-[#C5A55A] flex-1">{bill.title}</span>
                    {daysLeft !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${daysLeft <= 5 ? "bg-red-800 text-red-100" : "bg-zinc-700 text-zinc-200"}`}>
                        {daysLeft}d deadline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{bill.description}</p>

                  {/* Effects summary */}
                  {bill.effects.onPass.length > 0 && (
                    <div className="text-xs space-y-0.5">
                      <div className="text-zinc-500 font-medium">If signed:</div>
                      {bill.effects.onPass.map((mod, i) => (
                        <div key={i} className="text-emerald-400">
                          {mod.target}: {mod.delta > 0 ? "+" : ""}{mod.delta}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs"
                      onClick={() => signBill(bill.id)}
                      data-testid={`sign-bill-${bill.id}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Sign Bill
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 text-xs"
                      onClick={() => vetoBill(bill.id)}
                      data-testid={`veto-bill-${bill.id}`}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Veto Bill
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── 4. Crisis Panel ──────────────────────────────────────────────────── */}
      {crisisBills.length > 0 && crisisBills.map((crisisBill) => (
        <Card key={crisisBill.id} className="border border-red-700/50 bg-[#071f12]">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-red-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 inline mr-1.5 mb-0.5" />
              Legislative Crisis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">

            {/* Crisis alert */}
            <Alert className="border-red-700/50 bg-red-950/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-300 text-sm">{crisisBill.title}</AlertTitle>
              <AlertDescription className="text-xs text-red-200/70 mt-1">
                {crisisBill.description}
              </AlertDescription>
            </Alert>

            {/* Vote breakdown table */}
            <div>
              <div className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wider">Vote Breakdown</div>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700">
                    <TableHead className="text-xs text-zinc-400">Bucket</TableHead>
                    <TableHead className="text-xs text-zinc-400 text-right">House</TableHead>
                    <TableHead className="text-xs text-zinc-400 text-right">Senate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { label: "Firm Yes",    key: "firmYes",    color: "text-green-400" },
                    { label: "Leaning Yes", key: "leaningYes", color: "text-lime-400" },
                    { label: "Undecided",   key: "undecided",  color: "text-zinc-400" },
                    { label: "Leaning No",  key: "leaningNo",  color: "text-orange-400" },
                    { label: "Firm No",     key: "firmNo",     color: "text-red-400" },
                  ].map(({ label, key, color }) => (
                    <TableRow key={key} className="border-zinc-800">
                      <TableCell className={`text-xs font-medium ${color}`}>{label}</TableCell>
                      <TableCell className={`text-xs text-right tabular-nums ${color}`}>
                        {crisisBill.houseSupport[key as keyof VoteProjection]}
                      </TableCell>
                      <TableCell className={`text-xs text-right tabular-nums ${color}`}>
                        {crisisBill.senateSupport[key as keyof VoteProjection]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Influence levers */}
            <div>
              <div className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wider">Available Influence Levers</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allLevers.map((lever) => {
                  const isSelected = selectedLeverIds.includes(lever.id);
                  const isAvailable = lever.available(state, crisisBill);
                  return (
                    <button
                      key={lever.id}
                      disabled={!isAvailable}
                      onClick={() => toggleLever(lever.id)}
                      data-testid={`lever-${lever.id}`}
                      className={`text-left rounded-lg border p-2.5 text-xs transition-all ${
                        !isAvailable
                          ? "border-zinc-700/40 bg-zinc-900/20 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "border-[#C5A55A] bg-[#C5A55A]/10 cursor-pointer"
                            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 cursor-pointer"
                      }`}
                    >
                      <div className="font-semibold text-zinc-200 mb-0.5">{lever.name}</div>
                      <div className="text-zinc-400 mb-1.5 leading-relaxed">{lever.description}</div>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {lever.costs.map((cost, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-200">
                            -{cost.amount} {cost.type}
                          </span>
                        ))}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                          House +{lever.houseSwing}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                          Senate +{lever.senateSwing}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolve crisis button */}
            <Button
              disabled={selectedLeverIds.length === 0}
              onClick={() => {
                resolveCrisis(crisisBill.id, selectedLeverIds);
                setSelectedLeverIds([]);
              }}
              className="w-full bg-[#C5A55A] hover:bg-[#d4b567] text-[#071f12] font-bold text-sm"
              data-testid={`resolve-crisis-${crisisBill.id}`}
            >
              Resolve Crisis ({selectedLeverIds.length} lever{selectedLeverIds.length !== 1 ? "s" : ""} selected)
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* ── 5. Bill History ──────────────────────────────────────────────────── */}
      <Card className="border border-[#C5A55A]/20 bg-[#071f12]">
        <CardHeader className="p-4 pb-2">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setHistoryOpen((o) => !o)}
            data-testid="bill-history-toggle"
          >
            <CardTitle className="text-sm font-semibold text-[#C5A55A] uppercase tracking-wider">
              Bill History ({passedBills.length + failedBills.length})
            </CardTitle>
            {historyOpen
              ? <ChevronUp className="w-4 h-4 text-zinc-400" />
              : <ChevronDown className="w-4 h-4 text-zinc-400" />
            }
          </button>
        </CardHeader>

        {historyOpen && (
          <CardContent className="p-4 pt-0 space-y-2">
            {passedBills.length + failedBills.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No bills in history yet.</p>
            ) : (
              <>
                {passedBills.map((bill) => (
                  <div key={bill.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-zinc-800 last:border-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200 flex-1">{bill.title}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${SUBJECT_COLORS[bill.subjectTag] ?? "bg-zinc-600 text-zinc-100"}`}>
                      {bill.subjectTag}
                    </span>
                    <span className="text-emerald-400 font-medium">Signed</span>
                  </div>
                ))}
                {failedBills.map((bill) => {
                  const statusLabel = bill.houseStage === "vetoed" ? "Vetoed" : "Failed";
                  return (
                    <div key={bill.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-zinc-800 last:border-0">
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-zinc-400 flex-1">{bill.title}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${SUBJECT_COLORS[bill.subjectTag] ?? "bg-zinc-600 text-zinc-100"}`}>
                        {bill.subjectTag}
                      </span>
                      <span className="text-red-400 font-medium">{statusLabel}</span>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
