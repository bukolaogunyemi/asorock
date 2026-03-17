import { useState, useEffect } from "react";
import { useGame } from "@/lib/GameContext";
import { ChamberBanner } from "./legislature/ChamberBanner";
import { BillsTab } from "./legislature/BillsTab";
import { FloorTab } from "./legislature/FloorTab";
import { HistoryTab } from "./legislature/HistoryTab";
import { CrisisPanel } from "./legislature/CrisisPanel";
import { AdviserWhisper } from "./legislature/AdviserWhisper";
import { ProposalModal } from "./legislature/ProposalModal";
import { SigningCeremonyModal } from "./legislature/SigningCeremonyModal";
import { VetoConfirmationModal } from "./legislature/VetoConfirmationModal";
import type { AdviserContext } from "@/lib/legislativeAdviser";

type TabId = "bills" | "floor" | "history";

export default function LegislatureTab({
  onCharacterClick,
  onEntityClick: _onEntityClick,
}: {
  onCharacterClick?: (characterKey: string) => void;
  onEntityClick?: (entityId: string) => void;
} = {}) {
  const { state, signBill, vetoBill, resolveCrisis } = useGame();
  const legislature = state.legislature;

  const [activeTab, setActiveTab] = useState<TabId>("bills");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedLeverIds, setSelectedLeverIds] = useState<string[]>([]);

  // Modal state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [signingBillId, setSigningBillId] = useState<string | null>(null);
  const [vetoBillId, setVetoBillId] = useState<string | null>(null);

  // Clear selection if bill no longer exists
  useEffect(() => {
    if (!selectedBillId || !legislature) return;
    const allBills = [...legislature.activeBills, ...legislature.pendingSignature];
    if (!allBills.find((b) => b.id === selectedBillId)) {
      setSelectedBillId(null);
    }
  }, [selectedBillId, legislature]);

  if (!legislature) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        Legislature not yet initialised.
      </div>
    );
  }

  // Find selected bill for chamber banner
  const selectedBill =
    legislature.activeBills.find((b) => b.id === selectedBillId) ??
    legislature.pendingSignature.find((b) => b.id === selectedBillId) ??
    null;

  // Crisis check
  const isCrisis =
    selectedBill?.isCrisis && legislature.activeCrisis?.billId === selectedBill.id;

  // Modal bills
  const signingBill = signingBillId
    ? legislature.pendingSignature.find((b) => b.id === signingBillId) ?? null
    : null;
  const vetoBillObj = vetoBillId
    ? legislature.pendingSignature.find((b) => b.id === vetoBillId) ?? null
    : null;

  const toggleLever = (id: string) => {
    setSelectedLeverIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const handleResolve = () => {
    if (selectedBill) {
      resolveCrisis(selectedBill.id, selectedLeverIds);
      setSelectedLeverIds([]);
    }
  };

  const adviserContext: AdviserContext = {
    tab: activeTab,
    selectedBillId,
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: "bills", label: "Bills" },
    { id: "floor", label: "Floor" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="flex flex-col -m-4 h-[calc(100%+2rem)]">
      {/* Chamber Banner (persistent) */}
      <ChamberBanner selectedBill={selectedBill} onCharacterClick={onCharacterClick} />

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "text-[#d4af37] border-b-2 border-[#d4af37]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-[#faf8f5] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Crisis overlay takes priority */}
          {isCrisis && selectedBill ? (
            <CrisisPanel
              bill={selectedBill}
              crisis={legislature.activeCrisis}
              selectedLeverIds={selectedLeverIds}
              onToggleLever={toggleLever}
              onResolve={handleResolve}
            />
          ) : activeTab === "bills" ? (
            <BillsTab
              selectedBillId={selectedBillId}
              onSelectBill={setSelectedBillId}
              onOpenProposalModal={() => setShowProposalModal(true)}
              onSign={(billId) => setSigningBillId(billId)}
              onVeto={(billId) => setVetoBillId(billId)}
              onCharacterClick={onCharacterClick}
            />
          ) : activeTab === "floor" ? (
            <FloorTab onCharacterClick={onCharacterClick} />
          ) : (
            <HistoryTab />
          )}
        </div>

        {/* Adviser whisper */}
        <AdviserWhisper context={adviserContext} onCharacterClick={onCharacterClick} />
      </div>

      {/* Modals */}
      {showProposalModal && <ProposalModal onClose={() => setShowProposalModal(false)} />}
      {signingBill && (
        <SigningCeremonyModal
          bill={signingBill}
          onSign={() => { signBill(signingBill.id); setSigningBillId(null); }}
          onClose={() => setSigningBillId(null)}
        />
      )}
      {vetoBillObj && (
        <VetoConfirmationModal
          bill={vetoBillObj}
          onVeto={() => { vetoBill(vetoBillObj.id); setVetoBillId(null); }}
          onClose={() => setVetoBillId(null)}
        />
      )}
    </div>
  );
}
