import { useState, useMemo, useCallback } from "react";
import { useGame } from "@/lib/GameContext";
import { POLICY_LEVER_DEFS } from "@/lib/gameData";
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

/* ─── Exported reform helpers (used by EconomySection) ─────────── */

export function reformBarColor(status: ReformProgress["status"]): string {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "stalled": return "bg-amber-500";
    case "complete": return "bg-emerald-400";
    default: return "bg-gray-300";
  }
}

export function reformStatusLabel(status: ReformProgress["status"]): { text: string; color: string } {
  switch (status) {
    case "active": return { text: "Active", color: "text-emerald-600" };
    case "stalled": return { text: "Stalled", color: "text-amber-600" };
    case "complete": return { text: "Complete", color: "text-emerald-500" };
    default: return { text: "Not Started", color: "text-gray-400" };
  }
}

/* ─── Inline Impact Panel ──────────────────────────────────────── */

interface InlineImpactProps {
  currentLabel: string;
  targetLabel: string;
  chips: { text: string; positive: boolean }[];
  onConfirm: () => void;
  onCancel: () => void;
}

function InlineImpactPanel({ currentLabel, targetLabel, chips, onConfirm, onCancel }: InlineImpactProps) {
  const positiveChips = chips.filter(c => c.positive);
  const negativeChips = chips.filter(c => !c.positive);

  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      {/* Direction indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-[#0a1f14]">{currentLabel}</span>
        <span className="text-xs text-[#d4af37]">→</span>
        <span className="text-[10px] font-bold text-[#d4af37]">{targetLabel}</span>
      </div>

      {/* Impact chips */}
      {positiveChips.length > 0 && (
        <div className="mb-1.5">
          <div className="flex flex-wrap gap-1">
            {positiveChips.map((chip, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {chip.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {negativeChips.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-1">
            {negativeChips.map((chip, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"
              >
                {chip.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-1.5 rounded-md text-[10px] font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#d4af37" }}
        >
          Apply
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md text-[10px] font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */

export function EconomyPolicyCorner({ levers }: Props) {
  const { state, proposePolicyChange } = useGame();
  const [pendingSelection, setPendingSelection] = useState<{
    lever: PolicyLeverKey;
    position: AnyPolicyPosition;
  } | null>(null);

  // Compute impact data for inline panel
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
    <div className="flex flex-col h-full gap-2">
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
          const isExpanded = pendingSelection?.lever === leverKey;

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

              {/* Inline impact panel — expands when this lever has a pending selection */}
              {isExpanded && pendingImpact && (
                <InlineImpactPanel
                  currentLabel={pendingImpact.currentLabel}
                  targetLabel={pendingImpact.targetLabel}
                  chips={pendingImpact.chips}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
