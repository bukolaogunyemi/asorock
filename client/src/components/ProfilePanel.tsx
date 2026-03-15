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

// ─── ProfilePanel ───────────────────────────────────────────────────────────

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
    <div className="flex flex-col items-center gap-3 px-4 py-5">
      {/* Avatar */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] text-2xl font-bold"
        style={{
          borderColor: "#d4af37",
          background: "linear-gradient(135deg, #0a1f14 0%, #14382a 100%)",
          color: "#d4af37",
        }}
      >
        {initials}
      </div>

      {/* Name */}
      <h2
        className="text-center text-lg font-semibold tracking-wide"
        style={{ color: "#d4af37" }}
      >
        {state.presidentName}
      </h2>

      {/* Biodata line */}
      <p className="text-center text-xs text-gray-400">
        {state.presidentAge} yrs &middot; {state.presidentState} &middot;{" "}
        {state.presidentParty}
      </p>

      {/* 2x2 Stats Grid */}
      <div className="mt-2 grid w-full grid-cols-2 gap-2">
        <StatCell
          label="Pol. Capital"
          value={String(state.politicalCapital)}
          color="#d4af37"
        />
        <StatCell
          label="Legacy"
          value={String(legacyScore)}
          color="#22c55e"
        />
        <StatCell
          label="Prestige"
          value={prestige.tier}
          color={prestige.color}
        />
        <StatCell label="Day" value={String(state.day)} color="#93c5fd" />
      </div>

      {/* Political Weather Badge */}
      <div
        className="mt-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
        style={{
          backgroundColor: `${weather.color}15`,
          border: `1px solid ${weather.color}40`,
          color: weather.color,
        }}
      >
        <span>{weatherIcon(weather.level)}</span>
        <span>{weather.level}</span>
        <span className="text-xs opacity-60">({weather.score})</span>
      </div>
    </div>
  );
}

// ─── StatCell ───────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-lg px-2 py-2"
      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
    >
      <span className="text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <span className="mt-0.5 text-base font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
