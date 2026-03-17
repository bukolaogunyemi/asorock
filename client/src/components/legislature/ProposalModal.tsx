import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/GameContext";
import { getAvailableExecutiveBills } from "@/lib/legislativeEngine";
import { getSponsorCandidates } from "@/lib/sponsorCandidates";
import { CharacterAvatar } from "../CharacterAvatar";

interface ProposalModalProps {
  onClose: () => void;
}

const SECTORS = [
  { id: "economy", label: "Economy", icon: "💰", desc: "Trade, taxation, and fiscal policy" },
  { id: "security", label: "Security", icon: "🛡️", desc: "Defense, policing, and intelligence" },
  { id: "social", label: "Social", icon: "🏥", desc: "Healthcare, education, and welfare" },
  { id: "governance", label: "Governance", icon: "⚖️", desc: "Anti-corruption and institutional reform" },
  { id: "constitutional", label: "Constitutional", icon: "📜", desc: "Amendments and structural change" },
];

export function ProposalModal({ onClose }: ProposalModalProps) {
  const { state, proposeExecutiveBill } = useGame();
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<"chair" | "senior" | "junior" | null>(null);

  const availableBills = getAvailableExecutiveBills(state);
  const filteredBills = selectedSector
    ? availableBills.filter((b) => b.subjectTag === selectedSector)
    : availableBills;

  const sponsors = selectedSector ? getSponsorCandidates(selectedSector) : [];
  const selectedTemplate = availableBills.find((b) => b.id === selectedTemplateId);
  const selectedSponsor = sponsors.find((s) => s.tier === selectedTier);

  const handleSubmit = () => {
    if (selectedTemplateId && selectedTier) {
      proposeExecutiveBill(selectedTemplateId, selectedTier);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-[560px] max-w-[85vw] max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "#faf8f5" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 shrink-0 flex items-center justify-between" style={{ backgroundColor: "#0a1f14" }}>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Propose Bill</p>
            <h3 className="text-sm font-bold" style={{ color: "#d4af37" }}>
              {step === 1 && "Choose Sector"}
              {step === 2 && "Choose Policy Direction"}
              {step === 3 && "Choose Sponsor"}
              {step === 4 && "Review & Submit"}
            </h3>
          </div>
          <span className="text-[10px] text-gray-400">Step {step} of 4</span>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => { setSelectedSector(sector.id); setStep(2); }}
                  className="p-3 rounded-lg border border-gray-200 hover:border-[#d4af37] hover:bg-[#fdf9ef] transition-all text-left"
                >
                  <div className="text-lg mb-1">{sector.icon}</div>
                  <div className="text-xs font-bold text-[#0a1f14]">{sector.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{sector.desc}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              {filteredBills.length === 0 && (
                <div className="text-xs text-gray-400 italic py-4 text-center">
                  No bills available for this sector. Try another.
                </div>
              )}
              {filteredBills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => { setSelectedTemplateId(bill.id); setStep(3); }}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedTemplateId === bill.id
                      ? "border-[#d4af37] bg-[#fdf9ef]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0a1f14]">{bill.title}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                      bill.stakes === "critical" ? "bg-red-50 text-red-600" :
                      bill.stakes === "significant" ? "bg-amber-50 text-amber-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {bill.stakes}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{bill.description}</div>
                </button>
              ))}
              <button
                onClick={() => { setSelectedSector(null); setStep(1); }}
                className="text-[10px] text-gray-400 hover:text-gray-600 mt-2"
              >
                ← Back to sectors
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 mb-2">
                Choose an ally to champion this bill. Higher influence costs more but improves initial support.
              </p>
              {sponsors.map((sponsor) => (
                <button
                  key={sponsor.tier}
                  onClick={() => { setSelectedTier(sponsor.tier); setStep(4); }}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedTier === sponsor.tier
                      ? "border-[#d4af37] bg-[#fdf9ef]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CharacterAvatar
                      name={sponsor.name}
                      initials={sponsor.avatar}
                      size="sm"
                      gender={sponsor.gender === "male" ? "Male" : "Female"}
                      role="Legislator"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#0a1f14]">{sponsor.name}</div>
                      <div className="text-[9px] text-gray-500">
                        {sponsor.tier === "chair" ? "Committee Chair" : sponsor.tier === "senior" ? "Senior Backbencher" : "Junior Ally"}
                        {" · "}{sponsor.chamber === "house" ? "House" : "Senate"} · {sponsor.faction}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-green-600">+{sponsor.influenceBonus} support</div>
                      {sponsor.pcCost > 0 && (
                        <div className="text-[9px] text-red-500">{sponsor.pcCost} PC</div>
                      )}
                      {sponsor.pcCost === 0 && (
                        <div className="text-[9px] text-gray-400">Free</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setStep(2)}
                className="text-[10px] text-gray-400 hover:text-gray-600 mt-2"
              >
                ← Back to policy direction
              </button>
            </div>
          )}

          {step === 4 && selectedTemplate && selectedSponsor && (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-xs font-bold text-[#0a1f14]">{selectedTemplate.title}</div>
                <div className="text-[10px] text-gray-500 mt-1">{selectedTemplate.description}</div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {selectedSector}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {selectedTemplate.stakes}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <CharacterAvatar
                  name={selectedSponsor.name}
                  initials={selectedSponsor.avatar}
                  size="sm"
                  gender={selectedSponsor.gender === "male" ? "Male" : "Female"}
                  role="Legislator"
                />
                <div>
                  <div className="text-xs font-semibold text-[#0a1f14]">{selectedSponsor.name}</div>
                  <div className="text-[9px] text-gray-500">
                    Sponsor · +{selectedSponsor.influenceBonus} initial support
                    {selectedSponsor.pcCost > 0 && ` · ${selectedSponsor.pcCost} PC`}
                  </div>
                </div>
              </div>

              {/* Adviser comment */}
              <div className="rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#b8960c] mb-0.5">
                  Legislative Adviser
                </p>
                <p className="text-xs text-gray-700 italic">
                  "This bill faces {selectedTemplate.stakes === "critical" ? "strong" : "moderate"} opposition. The {selectedSector} sector is politically sensitive — expect amendments in committee."
                </p>
              </div>

              <button
                onClick={() => setStep(3)}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >
                ← Back to sponsor selection
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-3.5 border-t border-gray-200 shrink-0">
          {step === 4 ? (
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#d4af37" }}
            >
              Introduce Bill
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
