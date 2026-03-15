import { useGame } from "../lib/GameContext";
import { computeLegacyScore, computePrestigeTier } from "../lib/legacyScore";
import { computePoliticalWeather } from "../lib/politicalWeather";

// ─── Weather icon helper ────────────────────────────────────────────────────

function weatherIcon(level: string): string {
  switch (level) {
    case "Calm":
      return "\u2600"; // sun
    case "Brewing":
      return "\u2601"; // cloud
    case "Stormy":
      return "\u26C8"; // storm
    case "Crisis":
      return "\uD83D\uDD25"; // fire
    default:
      return "\u2601";
  }
}

// ─── Initials helper ────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── ProfilePanel (compact horizontal layout) ───────────────────────────────

export function ProfilePanel() {
  const { state } = useGame();

  const legacyScore = computeLegacyScore(state.legacyMilestones);
  const prestige = computePrestigeTier(state.approval, state.legacyMilestones);
  const weather = computePoliticalWeather(
    state.factions,
    state.vicePresident,
    state.activeEvents,
  );

  const initials = getInitials(state.presidentName);

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {/* Avatar — smaller */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
        style={{
          borderColor: "#d4af37",
          background: "linear-gradient(135deg, #0a1f14 0%, #14382a 100%)",
          color: "#d4af37",
        }}
      >
        {initials}
      </div>

      {/* Name + bio + stats in a compact column */}
      <div className="min-w-0 flex-1">
        {/* Name */}
        <h2
          className="text-sm font-semibold tracking-wide truncate"
          style={{ color: "#d4af37" }}
        >
          {state.presidentName}
        </h2>

        {/* Biodata line */}
        <p className="text-[10px] text-gray-400 truncate">
          {state.presidentAge} yrs &middot; {state.presidentState} &middot;{" "}
          {state.presidentParty}
        </p>

        {/* Inline stats row */}
        <div className="flex items-center gap-2 mt-1">
          <StatPill label="PC" value={String(state.politicalCapital)} color="#d4af37" />
          <StatPill label="Legacy" value={String(legacyScore)} color="#22c55e" />
          <StatPill label={prestige.tier} value="" color={prestige.color} />
          <StatPill label="Day" value={String(state.day)} color="#93c5fd" />
          {/* Weather inline */}
          <span
            className="flex items-center gap-1 text-[10px] font-medium"
            style={{ color: weather.color }}
          >
            {weatherIcon(weather.level)} {weather.level}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── StatPill ───────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <span className="text-[10px] font-medium" style={{ color }}>
      {label}{value ? ` ${value}` : ""}
    </span>
  );
}
