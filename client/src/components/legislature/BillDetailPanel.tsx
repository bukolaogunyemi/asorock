import type { Bill, VoteProjection } from "@/lib/legislativeTypes";

const SUBJECT_TAG: Record<string, { bg: string; text: string }> = {
  economy: { bg: "bg-emerald-50", text: "text-emerald-700" },
  security: { bg: "bg-red-50", text: "text-red-700" },
  social: { bg: "bg-blue-50", text: "text-blue-700" },
  governance: { bg: "bg-amber-50", text: "text-amber-700" },
  constitutional: { bg: "bg-purple-50", text: "text-purple-700" },
};

const STAKES_TAG: Record<string, { bg: string; text: string }> = {
  routine: { bg: "bg-gray-100", text: "text-gray-600" },
  significant: { bg: "bg-amber-50", text: "text-amber-700" },
  critical: { bg: "bg-red-50", text: "text-red-700" },
};

const SPONSOR_LABELS: Record<string, string> = {
  executive: "Executive",
  "ruling-backbench": "Ruling Bench",
  opposition: "Opposition",
  "cross-party": "Cross-Party",
};

const STAGE_LABELS: Record<string, string> = {
  introduction: "Introduction",
  committee: "Committee",
  "floor-debate": "Floor Debate",
  vote: "Vote",
  passed: "Passed",
  failed: "Failed",
  stalled: "Stalled",
  vetoed: "Vetoed",
  signed: "Signed",
};

const VETO_COST: Record<string, number> = {
  routine: 3,
  significant: 8,
  critical: 15,
};

interface BillDetailPanelProps {
  bill: Bill;
  isPendingSignature: boolean;
  signingDeadlineDays: number | null;
  onSign: () => void;
  onVeto: () => void;
}

export function BillDetailPanel({
  bill,
  isPendingSignature,
  signingDeadlineDays,
  onSign,
  onVeto,
}: BillDetailPanelProps) {
  const subject = SUBJECT_TAG[bill.subjectTag] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const stakes = STAKES_TAG[bill.stakes] ?? { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${subject.bg} ${subject.text}`}>
              {bill.subjectTag.charAt(0).toUpperCase() + bill.subjectTag.slice(1)}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stakes.bg} ${stakes.text}`}>
              {bill.stakes.charAt(0).toUpperCase() + bill.stakes.slice(1)}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {SPONSOR_LABELS[bill.sponsor] ?? bill.sponsor}
            </span>
            {bill.isCrisis && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold">
                CRISIS
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-[#0a1f14]">{bill.title}</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{bill.description}</p>
        </div>

        {/* Vote Projections */}
        <div className="p-4 border-b border-gray-200">
          <SectionLabel>Vote Projections</SectionLabel>
          <VoteProjectionRow
            chamber="House"
            chamberSize={360}
            stage={bill.houseStage}
            daysRemaining={bill.houseStageDaysRemaining}
            projection={bill.houseSupport}
            majorityThreshold={181}
          />
          <div className="mt-3">
            <VoteProjectionRow
              chamber="Senate"
              chamberSize={109}
              stage={bill.senateStage}
              daysRemaining={bill.senateStageDaysRemaining}
              projection={bill.senateSupport}
              majorityThreshold={55}
            />
          </div>
          <VoteBarLegend />
        </div>

        {/* Amendments */}
        {bill.amendments.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <SectionLabel>
              Amendments ({bill.amendments.filter((a) => !a.accepted).length} pending)
            </SectionLabel>
            <div className="space-y-2">
              {bill.amendments.map((amendment, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    amendment.accepted
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#0a1f14]">
                      {amendment.accepted && "\u2713 "}
                      {amendment.description}
                    </span>
                    <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                      {amendment.sponsor}
                    </span>
                  </div>
                  <div className="text-[10px] text-green-600 mt-1">
                    +{amendment.supportSwing.house} House / +{amendment.supportSwing.senate} Senate support
                  </div>
                  {!amendment.accepted && (
                    <div className="flex gap-2 mt-2">
                      <button
                        disabled
                        className="flex-1 px-2 py-1.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 opacity-50 cursor-not-allowed"
                        title="Coming soon"
                      >
                        {"\u2713"} Accept
                      </button>
                      <button
                        disabled
                        className="flex-1 px-2 py-1.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 opacity-50 cursor-not-allowed"
                        title="Coming soon"
                      >
                        {"\u2717"} Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Effects */}
        <div className="p-4">
          {bill.effects.onPass.length > 0 && (
            <div className="mb-3">
              <SectionLabel>Effects if Passed</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {bill.effects.onPass.map((mod, i) => (
                  <EffectTag key={i} target={mod.target} delta={mod.delta} factionName={mod.factionName} macroKey={mod.macroKey} />
                ))}
              </div>
            </div>
          )}
          {bill.effects.onFail.length > 0 && (
            <div>
              <SectionLabel>Effects if Failed</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {bill.effects.onFail.map((mod, i) => (
                  <EffectTag key={i} target={mod.target} delta={mod.delta} factionName={mod.factionName} macroKey={mod.macroKey} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign/Veto bar */}
      {isPendingSignature && (
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={onSign}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            {"\u2713"} Sign Bill
          </button>
          <button
            onClick={onVeto}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            {"\u2717"} Veto ({VETO_COST[bill.stakes] ?? 8} PC)
          </button>
          {signingDeadlineDays !== null && (
            <span className={`text-[10px] shrink-0 font-medium ${signingDeadlineDays <= 5 ? "text-red-500" : "text-gray-400"}`}>
              {signingDeadlineDays}d left
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

function VoteProjectionRow({
  chamber,
  chamberSize,
  stage,
  daysRemaining,
  projection,
  majorityThreshold,
}: {
  chamber: string;
  chamberSize: number;
  stage: string;
  daysRemaining: number;
  projection: VoteProjection;
  majorityThreshold: number;
}) {
  const yesTotal = projection.firmYes + projection.leaningYes;
  const noTotal = projection.firmNo + projection.leaningNo;
  const pct = (n: number) => `${Math.max(1, Math.round((n / chamberSize) * 100))}%`;

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">
        {chamber} ({chamberSize}) &mdash;{" "}
        <span className="text-[#d4af37] font-semibold">{STAGE_LABELS[stage] ?? stage}</span>
        {daysRemaining > 0 && <span className="text-gray-400"> &mdash; {daysRemaining}d</span>}
      </div>
      <div className="flex h-4 rounded overflow-hidden">
        <div style={{ width: pct(projection.firmYes), backgroundColor: "#22c55e" }} className="flex items-center justify-center">
          {projection.firmYes > 20 && <span className="text-[8px] text-white font-bold">{projection.firmYes}</span>}
        </div>
        <div style={{ width: pct(projection.leaningYes), backgroundColor: "#86efac" }} className="flex items-center justify-center">
          {projection.leaningYes > 15 && <span className="text-[8px] text-green-900 font-bold">{projection.leaningYes}</span>}
        </div>
        <div style={{ width: pct(projection.undecided), backgroundColor: "#d1d5db" }} className="flex items-center justify-center">
          {projection.undecided > 10 && <span className="text-[8px] text-gray-600 font-bold">{projection.undecided}</span>}
        </div>
        <div style={{ width: pct(projection.leaningNo), backgroundColor: "#fb923c" }} className="flex items-center justify-center">
          {projection.leaningNo > 15 && <span className="text-[8px] text-white font-bold">{projection.leaningNo}</span>}
        </div>
        <div style={{ width: pct(projection.firmNo), backgroundColor: "#ef4444" }} className="flex items-center justify-center">
          {projection.firmNo > 20 && <span className="text-[8px] text-white font-bold">{projection.firmNo}</span>}
        </div>
      </div>
      <div className="flex justify-between mt-0.5 text-[10px]">
        <span className="text-green-600">{yesTotal} Yes</span>
        <span className="text-gray-400">{"\u25B2"} {majorityThreshold} majority</span>
        <span className="text-red-500">{noTotal} No</span>
      </div>
    </div>
  );
}

function VoteBarLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
      {[
        { color: "#22c55e", label: "Firm Yes" },
        { color: "#86efac", label: "Leaning Yes" },
        { color: "#d1d5db", label: "Undecided" },
        { color: "#fb923c", label: "Leaning No" },
        { color: "#ef4444", label: "Firm No" },
      ].map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1 text-[10px] text-gray-500">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function EffectTag({
  target,
  delta,
  factionName,
  macroKey,
}: {
  target: string;
  delta: number;
  factionName?: string;
  macroKey?: string;
}) {
  const isPositive = delta > 0;
  const label = factionName
    ? `${factionName} ${target}`
    : macroKey
      ? macroKey
      : target.charAt(0).toUpperCase() + target.slice(1);

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
        isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {label} {isPositive ? "+" : ""}{delta}
    </span>
  );
}
