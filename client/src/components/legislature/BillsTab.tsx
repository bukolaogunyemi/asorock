import { useMemo, useState } from "react";
import { useGame } from "@/lib/GameContext";
import { BillProgressDots } from "./BillProgressDots";
import { BillDetailPanel } from "./BillDetailPanel";
import { getAvailableExecutiveBills } from "@/lib/legislativeEngine";
import { getOppositionActivity } from "@/lib/legislativeAdviser";
import type { Bill } from "@/lib/legislativeTypes";

interface BillsTabProps {
  selectedBillId: string | null;
  onSelectBill: (billId: string) => void;
  onOpenProposalModal: () => void;
  onSign: (billId: string) => void;
  onVeto: (billId: string) => void;
  onCharacterClick?: (characterKey: string) => void;
}

const SUBJECT_TAG: Record<string, { bg: string; text: string }> = {
  economy: { bg: "bg-emerald-50", text: "text-emerald-700" },
  security: { bg: "bg-red-50", text: "text-red-700" },
  social: { bg: "bg-blue-50", text: "text-blue-700" },
  governance: { bg: "bg-amber-50", text: "text-amber-700" },
  constitutional: { bg: "bg-purple-50", text: "text-purple-700" },
};

export function BillsTab({
  selectedBillId,
  onSelectBill,
  onOpenProposalModal,
  onSign,
  onVeto,
  onCharacterClick,
}: BillsTabProps) {
  const { state } = useGame();
  const legislature = state.legislature;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const allBills = useMemo(() => {
    if (!legislature) return [];
    const map = new Map<string, Bill & { isPending: boolean }>();
    for (const b of legislature.activeBills) map.set(b.id, { ...b, isPending: false });
    for (const b of legislature.pendingSignature) {
      if (!map.has(b.id)) map.set(b.id, { ...b, isPending: true });
      else map.set(b.id, { ...map.get(b.id)!, isPending: true });
    }
    return Array.from(map.values());
  }, [legislature]);

  const selectedBill = allBills.find((b) => b.id === selectedBillId) ?? null;
  const isPendingSignature = selectedBill
    ? legislature?.pendingSignature.some((b) => b.id === selectedBill.id) ?? false
    : false;
  const signingDeadlineDays =
    selectedBill?.signingDeadlineDay != null ? selectedBill.signingDeadlineDay - state.day : null;

  const oppositionBills = allBills.filter(
    (b) => b.sponsor === "opposition" || b.sponsor === "cross-party",
  );
  const oppositionActivity = getOppositionActivity(state);

  const upcomingCalendar = legislature?.legislativeCalendar
    .filter((s) => s.targetDay > state.day)
    .sort((a, b) => a.targetDay - b.targetDay)
    .slice(0, 5) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Propose button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={onOpenProposalModal}
          className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#d4af37" }}
        >
          Propose Executive Bill
        </button>
      </div>

      {/* Bill pipeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 border-b border-gray-100">
          <span className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider">
            Active Bills
          </span>
          {allBills.length > 0 && (
            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[#d4af37] text-white font-bold">
              {allBills.length}
            </span>
          )}
        </div>

        {allBills.length === 0 ? (
          <div className="px-4 py-6 text-xs text-gray-400 italic text-center">
            No active bills. Propose one to begin.
          </div>
        ) : (
          allBills.map((bill) => {
            const isSelected = bill.id === selectedBillId;
            const tag = SUBJECT_TAG[bill.subjectTag] ?? { bg: "bg-gray-100", text: "text-gray-600" };
            return (
              <button
                key={bill.id}
                onClick={() => onSelectBill(bill.id)}
                className={`w-full text-left px-4 py-2.5 border-b border-gray-100 transition-colors ${
                  isSelected
                    ? "bg-[#fdf9ef] border-l-[3px] border-l-[#d4af37]"
                    : bill.isCrisis
                      ? "border-l-[3px] border-l-red-500 hover:bg-gray-50"
                      : bill.isPending
                        ? "border-l-[3px] border-l-[#d4af37] bg-[#fdf9ef]/50 hover:bg-[#fdf9ef]"
                        : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[#0a1f14] truncate">{bill.title}</span>
                  {bill.isCrisis ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold shrink-0">
                      CRISIS
                    </span>
                  ) : bill.isPending ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#fdf4e7] text-[#d4af37] font-bold shrink-0">
                      SIGN/VETO
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full ${tag.bg} ${tag.text} font-medium shrink-0`}
                    >
                      {bill.subjectTag.charAt(0).toUpperCase() + bill.subjectTag.slice(1)}
                    </span>
                  )}
                </div>
                {bill.sponsorCharacter && (
                  <div className="text-[9px] text-gray-500 mt-0.5">
                    Sponsored by {bill.sponsorCharacter.name}
                  </div>
                )}
                <BillProgressDots houseStage={bill.houseStage} senateStage={bill.senateStage} />
              </button>
            );
          })
        )}

        {/* Bill detail (when selected) */}
        {selectedBill && (
          <div className="border-t-2 border-[#d4af37]/30">
            <BillDetailPanel
              bill={selectedBill}
              isPendingSignature={isPendingSignature}
              signingDeadlineDays={signingDeadlineDays}
              onSign={() => onSign(selectedBill.id)}
              onVeto={() => onVeto(selectedBill.id)}
            />
          </div>
        )}

        {/* Legislative Calendar (collapsible) */}
        {upcomingCalendar.length > 0 && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider">
                Upcoming Bills
              </span>
              <span className="text-gray-400 text-xs">{calendarOpen ? "\u25B2" : "\u25BC"}</span>
            </button>
            {calendarOpen && (
              <div className="px-4 pb-3 space-y-1.5">
                {upcomingCalendar.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {entry.isCrisis && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      )}
                      <span className="text-[#0a1f14]">{entry.template.title}</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">
                      in {entry.targetDay - state.day} days
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Opposition Monitor */}
        {oppositionBills.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-2">
            <div className="text-[10px] font-bold text-[#0a1f14] uppercase tracking-wider mb-1.5">
              Opposition Watch
            </div>
            {oppositionBills.map((bill) => {
              const tag = SUBJECT_TAG[bill.subjectTag] ?? { bg: "bg-gray-100", text: "text-gray-600" };
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between py-1 text-[10px] text-gray-600"
                >
                  <span className="truncate">{bill.title}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${tag.bg} ${tag.text} text-[8px] font-medium shrink-0 ml-2`}>
                    {bill.subjectTag.charAt(0).toUpperCase() + bill.subjectTag.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
