import { useState } from "react";
import { createPortal } from "react-dom";
import type { Bill } from "@/lib/legislativeTypes";

interface SigningCeremonyModalProps {
  bill: Bill;
  onSign: () => void;
  onClose: () => void;
}

export function SigningCeremonyModal({ bill, onSign, onClose }: SigningCeremonyModalProps) {
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    setSigned(true);
    setTimeout(() => {
      onSign();
      onClose();
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-[480px] max-w-[85vw] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "#faf8f5" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3" style={{ backgroundColor: "#0a1f14" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Presidential Action</p>
          <h3 className="text-sm font-bold" style={{ color: "#d4af37" }}>Signing into Law</h3>
          <div className="h-0.5 w-16 mt-1 rounded" style={{ backgroundColor: "#d4af37" }} />
        </div>

        <div className="p-5 space-y-4">
          {/* Bill title */}
          <div className="text-center">
            <h4 className="text-base font-bold text-[#0a1f14]">{bill.title}</h4>
            {bill.sponsorCharacter && (
              <p className="text-xs text-gray-500 mt-1">
                Introduced by {bill.sponsorCharacter.name}
              </p>
            )}
          </div>

          {/* Effects */}
          {bill.effects.onPass.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {bill.effects.onPass.map((e, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    e.delta > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {e.target} {e.delta > 0 ? "+" : ""}{e.delta}
                </span>
              ))}
            </div>
          )}

          {/* Adviser quote */}
          <div className="rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-2">
            <p className="text-xs text-gray-700 italic">
              "This strengthens your legislative credentials, Mr. President."
            </p>
          </div>

          {/* Seal animation */}
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-transform duration-500 ${
                signed ? "scale-125" : "scale-100"
              }`}
              style={{ backgroundColor: "#d4af37", color: "white" }}
            >
              {signed ? "✓" : "🏛️"}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-3.5 border-t border-gray-200">
          <button
            onClick={handleSign}
            disabled={signed}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#d4af37" }}
          >
            {signed ? "Signed" : "Sign into Law"}
          </button>
          <button
            onClick={onClose}
            disabled={signed}
            className="px-5 py-2 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
