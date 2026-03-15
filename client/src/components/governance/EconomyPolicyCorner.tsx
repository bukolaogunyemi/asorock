import { useGame } from "@/lib/GameContext";
import { POLICY_LEVER_DEFS } from "@/lib/gameData";
import type { PolicyLeverKey, AnyPolicyPosition } from "@/lib/gameTypes";

interface Props {
  levers: PolicyLeverKey[];
}

export function EconomyPolicyCorner({ levers }: Props) {
  const { state, proposePolicyChange } = useGame();

  return (
    <div className="flex flex-col h-full gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">
        Policy Levers
      </h3>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {levers.map(leverKey => {
          const def = POLICY_LEVER_DEFS[leverKey];
          if (!def) return null;

          const leverState = state.policyLevers[leverKey];
          if (!leverState) return null;

          const currentPos = leverState.position;
          const pendingPos = leverState.pendingPosition;
          const onCooldown = leverState.cooldownUntilDay > state.day;
          const cooldownDays = leverState.cooldownUntilDay - state.day;

          return (
            <div key={leverKey} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-200">{def.displayName}</span>
                {onCooldown && (
                  <span className="text-[10px] text-amber-400/40 flex items-center gap-1">
                    {cooldownDays}d cooldown
                  </span>
                )}
                {pendingPos && !onCooldown && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    Pending: {def.positions.find(p => p.value === pendingPos)?.label ?? pendingPos}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {def.positions.map(pos => {
                  const isCurrent = pos.value === currentPos;
                  const isDisabled = onCooldown || !!pendingPos;

                  return (
                    <button
                      key={pos.value}
                      onClick={() => {
                        if (!isCurrent && !isDisabled) {
                          proposePolicyChange(leverKey, pos.value as AnyPolicyPosition);
                        }
                      }}
                      disabled={isDisabled || isCurrent}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                        isCurrent
                          ? "bg-amber-500 text-black shadow-sm shadow-amber-500/30"
                          : isDisabled
                          ? "bg-gray-700/20 text-gray-600 cursor-not-allowed"
                          : "bg-amber-500/10 text-amber-400/70 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-400"
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
    </div>
  );
}
