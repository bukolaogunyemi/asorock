import { useGame } from "../lib/GameContext";
import { computeLegacyScore } from "../lib/legacyScore";
import { CharacterAvatar } from "./CharacterAvatar";

export function ProfilePanel() {
  const { state } = useGame();
  const legacyScore = computeLegacyScore(state.legacyMilestones);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white" style={{ width: 240 }}>
      {/* Dark header bar with name */}
      <div className="px-3 py-2" style={{ backgroundColor: "#0a1f14" }}>
        <h2 className="text-sm font-bold tracking-wide text-center uppercase" style={{ color: "#d4af37" }}>
          {state.presidentName}
        </h2>
      </div>

      {/* Body: avatar left + info right */}
      <div className="flex gap-3 px-3 py-2.5">
        {/* Avatar — emoji-based presidential portrait */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md shadow-inner"
          style={{
            border: "2px solid #d4af37",
            background: "linear-gradient(160deg, #2d4a3e 0%, #0a1f14 60%, #1a3a2a 100%)",
          }}
        >
          <CharacterAvatar
            name={state.presidentName}
            initials={state.presidentName.split(" ").map(w => w[0]).join("").slice(0, 2)}
            size="lg"
            gender={state.presidentGender ?? "Male"}
            role="President"
          />
        </div>

        {/* Bio details — readable sizes */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs text-gray-700">
            {state.presidentAge} years &ndash; {state.presidentState} - {state.presidentParty}
          </p>
          <p className="text-xs text-gray-600">
            President since May 1999
          </p>
          <p className="text-xs">
            <span className="text-gray-500">Political Capital:</span>{" "}
            <span className="font-bold" style={{ color: "#d4af37" }}>{state.politicalCapital}</span>
          </p>
          <p className="text-xs">
            <span className="text-gray-500">Legacy Score:</span>{" "}
            <span className="font-bold" style={{ color: "#22c55e" }}>{legacyScore}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
