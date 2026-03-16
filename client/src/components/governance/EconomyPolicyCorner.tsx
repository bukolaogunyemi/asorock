import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/GameContext";
import { POLICY_LEVER_DEFS } from "@/lib/gameData";
import { ECONOMY_CONFIG } from "@/lib/governanceSections";
import type { PolicyLeverKey, AnyPolicyPosition, ReformProgress } from "@/lib/gameTypes";
import type { PolicyModifiers } from "@/lib/gameData";

interface Props {
  levers: PolicyLeverKey[];
}

/** Human-friendly labels for modifier keys */
const MODIFIER_LABELS: Record<keyof PolicyModifiers, { label: string; icon: string; invert?: boolean }> = {
  inflation:       { label: "Inflation", icon: "🔥" },
  fxRate:          { label: "FX Rate", icon: "💱" },
  reserves:        { label: "Reserves", icon: "🏦", invert: true },
  debtToGdp:       { label: "Debt/GDP", icon: "📊" },
  subsidyPressure: { label: "Subsidy Load", icon: "⚖" },
  approval:        { label: "Approval", icon: "👍", invert: true },
  treasury:        { label: "Treasury", icon: "💰", invert: true },
  trust:           { label: "Trust", icon: "🤝", invert: true },
};

/** Format a modifier value into a readable impact chip */
function formatImpact(key: keyof PolicyModifiers, value: number): { text: string; positive: boolean } | null {
  if (value === 0) return null;
  const meta = MODIFIER_LABELS[key];
  const isGood = meta.invert ? value > 0 : value < 0;
  const arrow = value > 0 ? "↑" : "↓";
  const absVal = Math.abs(value);
  let display: string;
  if (key === "fxRate") display = `${arrow}₦${absVal}`;
  else if (key === "approval" || key === "subsidyPressure") display = `${arrow}${absVal}`;
  else if (key === "treasury" || key === "reserves") display = `${arrow}₦${absVal.toFixed(2)}T`;
  else display = `${arrow}${absVal.toFixed(1)}%`;

  return { text: `${meta.icon} ${meta.label} ${display}`, positive: isGood };
}

function reformBarColor(status: ReformProgress["status"]): string {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "stalled": return "bg-amber-500";
    case "complete": return "bg-emerald-400";
    default: return "bg-gray-300";
  }
}

function reformStatusLabel(status: ReformProgress["status"]): { text: string; color: string } {
  switch (status) {
    case "active": return { text: "Active", color: "text-emerald-600" };
    case "stalled": return { text: "Stalled", color: "text-amber-600" };
    case "complete": return { text: "Complete", color: "text-emerald-500" };
    default: return { text: "Not Started", color: "text-gray-400" };
  }
}

/* ─── Policy Impact Modal ─────────────────────────────────────── */

interface ModalProps {
  leverName: string;
  currentLabel: string;
  targetLabel: string;
  chips: { text: string; positive: boolean }[];
  onConfirm: () => void;
  onCancel: () => void;
}

function PolicyImpactModal({ leverName, currentLabel, targetLabel, chips, onConfirm, onCancel }: ModalProps) {
  const positiveChips = chips.filter(c => c.positive);
  const negativeChips = chips.filter(c => !c.positive);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-[420px] max-w-[90vw] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        style={{ backgroundColor: "#faf8f5" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5" style={{ backgroundColor: "#0a1f14" }}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Policy Change</p>
          <h3 className="text-sm font-bold" style={{ color: "#d4af37" }}>{leverName}</h3>
        </div>

        {/* Direction indicator */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Current</p>
            <p className="text-xs font-bold text-[#0a1f14]">{currentLabel}</p>
          </div>
          <div className="text-lg text-[#d4af37]">→</div>
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Proposed</p>
            <p className="text-xs font-bold" style={{ color: "#d4af37" }}>{targetLabel}</p>
          </div>
        </div>

        {/* Impact analysis */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2.5">Projected Impact</p>

          {positiveChips.length > 0 && (
            <div className="mb-2.5">
              <p className="text-[10px] font-semibold text-emerald-600 mb-1">Benefits</p>
              <div className="flex flex-wrap gap-1.5">
                {positiveChips.map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {chip.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {negativeChips.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-red-600 mb-1">Risks</p>
              <div className="flex flex-wrap gap-1.5">
                {negativeChips.map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200"
                  >
                    {chip.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-5 py-3.5 border-t border-gray-200">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#d4af37" }}
          >
            Apply Policy Change
          </button>
          <button
            onClick={onCancel}
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

/* ─── Main Component ──────────────────────────────────────────── */

export function EconomyPolicyCorner({ levers }: Props) {
  const { state, proposePolicyChange } = useGame();
  const [pendingSelection, setPendingSelection] = useState<{
    lever: PolicyLeverKey;
    position: AnyPolicyPosition;
  } | null>(null);

  const reforms = useMemo(() => {
    return ECONOMY_CONFIG.overview.reforms.map(def => {
      const progress = state.reforms?.find(r => r.id === def.id);
      return {
        ...def,
        progress: progress?.progress ?? 0,
        turnsActive: progress?.turnsActive ?? 0,
        status: (progress?.status ?? "not-started") as ReformProgress["status"],
      };
    });
  }, [state.reforms]);

  // Compute impact data for modal
  const pendingImpact = useMemo(() => {
    if (!pendingSelection) return null;
    const def = POLICY_LEVER_DEFS[pendingSelection.lever];
    if (!def) return null;
    const mods = def.modifiers[pendingSelection.position];
    if (!mods) return null;
    const currentPos = state.policyLevers[pendingSelection.lever]?.position;
    const currentLabel = def.positions.find(p => p.value === currentPos)?.label ?? String(currentPos);

    const chips: { text: string; positive: boolean }[] = [];
    for (const [key, value] of Object.entries(mods)) {
      const chip = formatImpact(key as keyof PolicyModifiers, value as number);
      if (chip) chips.push(chip);
    }
    return {
      targetLabel: def.positions.find(p => p.value === pendingSelection.position)?.label ?? pendingSelection.position,
      currentLabel,
      leverName: def.displayName,
      chips,
    };
  }, [pendingSelection, state.policyLevers]);

  const handleConfirm = useCallback(() => {
    if (pendingSelection) {
      proposePolicyChange(pendingSelection.lever, pendingSelection.position);
      setPendingSelection(null);
    }
  }, [pendingSelection, proposePolicyChange]);

  const handleCancel = useCallback(() => {
    setPendingSelection(null);
  }, []);

  return (
    <div className="flex flex-col h-full gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
        Policy Levers
      </h3>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {levers.map(leverKey => {
          const def = POLICY_LEVER_DEFS[leverKey];
          if (!def) return null;

          const leverState = state.policyLevers[leverKey];
          if (!leverState) return null;

          const currentPos = leverState.position;
          const pendingPos = leverState.pendingPosition;
          const onCooldown = leverState.cooldownUntilDay > state.day;
          const cooldownDays = leverState.cooldownUntilDay - state.day;
          const currentLabel = def.positions.find(p => p.value === currentPos)?.label ?? currentPos;

          return (
            <div key={leverKey} className="rounded-md border border-gray-200 bg-[#faf8f5] p-2.5">
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#0a1f14]">{def.displayName}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#b8960c]">
                  {currentLabel}
                </span>
              </div>

              {/* Status lines */}
              {onCooldown && (
                <p className="text-[10px] text-gray-400 mb-1.5">
                  🔒 Policy locked — {cooldownDays} day{cooldownDays !== 1 ? "s" : ""} remaining
                </p>
              )}
              {pendingPos && !onCooldown && (
                <p className="text-[10px] text-[#d4af37] mb-1.5">
                  ⏳ Pending shift → {def.positions.find(p => p.value === pendingPos)?.label ?? pendingPos}
                </p>
              )}

              {/* Segmented control */}
              <div className="flex rounded-md border border-gray-200 overflow-hidden">
                {def.positions.map((pos, i) => {
                  const isCurrent = pos.value === currentPos;
                  const isDisabled = onCooldown || !!pendingPos;

                  return (
                    <button
                      key={pos.value}
                      onClick={() => {
                        if (!isCurrent && !isDisabled) {
                          setPendingSelection({ lever: leverKey, position: pos.value });
                        }
                      }}
                      disabled={isDisabled || isCurrent}
                      className={`flex-1 py-1.5 text-[10px] font-medium transition-all
                        ${i > 0 ? "border-l border-gray-200" : ""}
                        ${isCurrent
                          ? "bg-[#d4af37] text-white"
                          : isDisabled
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                        }`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reform Progress — compact inline view */}
      {reforms.length > 0 && (
        <div className="shrink-0 border-t border-gray-200 pt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Active Reforms</h4>
          <div className="space-y-1.5">
            {reforms.map(reform => {
              const status = reformStatusLabel(reform.status);
              return (
                <div key={reform.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[#0a1f14] w-28 truncate shrink-0">{reform.title}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${reformBarColor(reform.status)}`}
                      style={{ width: `${reform.progress}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold w-12 text-right shrink-0 ${status.color}`}>
                    {reform.progress.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impact confirmation modal — portaled to body */}
      {pendingImpact && (
        <PolicyImpactModal
          leverName={pendingImpact.leverName}
          currentLabel={pendingImpact.currentLabel}
          targetLabel={pendingImpact.targetLabel}
          chips={pendingImpact.chips}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
