import { useGame } from "@/lib/GameContext";
import { getConsequences } from "@/lib/federalCharacter";
import type { ZoneBalance } from "@/lib/federalCharacterTypes";

const ZONE_LABELS: Record<string, string> = {
  NW: "North-West",
  NE: "North-East",
  NC: "North-Central",
  SW: "South-West",
  SE: "South-East",
  SS: "South-South",
};

const ZONE_COLORS: Record<string, { bar: string; text: string }> = {
  NW: { bar: "bg-emerald-500", text: "text-emerald-400" },
  NE: { bar: "bg-blue-500", text: "text-blue-400" },
  NC: { bar: "bg-purple-500", text: "text-purple-400" },
  SW: { bar: "bg-amber-500", text: "text-amber-400" },
  SE: { bar: "bg-red-500", text: "text-red-400" },
  SS: { bar: "bg-cyan-500", text: "text-cyan-400" },
};

const ZONE_ORDER = ["NW", "NE", "NC", "SW", "SE", "SS"];

export default function FederalCharacterPanel() {
  const { state } = useGame();
  const fc = state.federalCharacter;
  if (!fc) return null;

  const score = fc.complianceScore;
  const consequences = getConsequences(score);
  const zones: ZoneBalance[] = ZONE_ORDER.map((z) => fc.zoneScores[z]).filter(Boolean);

  // Find the max actual share for scaling bars
  const maxShare = Math.max(...zones.map((z) => z.actualShare), 1 / 6);

  // Score color
  const scoreColor =
    score >= 70 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const scoreBg =
    score >= 70
      ? "bg-green-500/10 border-green-500/30"
      : score >= 50
        ? "bg-amber-500/10 border-amber-500/30"
        : "bg-red-500/10 border-red-500/30";

  // Count filled appointments per zone
  const zoneCounts: Record<string, number> = {};
  for (const z of ZONE_ORDER) zoneCounts[z] = 0;
  for (const a of fc.appointments) {
    if (a.appointeeZone) {
      zoneCounts[a.appointeeZone] = (zoneCounts[a.appointeeZone] ?? 0) + 1;
    }
  }
  const totalFilled = Object.values(zoneCounts).reduce((s, n) => s + n, 0);
  const expectedPerZone = totalFilled > 0 ? totalFilled / 6 : 0;

  return (
    <div className="space-y-4">
      {/* Compliance Score */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
          Federal Character Compliance
        </h3>
        <div
          className={`rounded-lg border p-3 flex items-center gap-3 ${scoreBg}`}
          data-testid="fc-compliance-score"
        >
          <div className={`text-3xl font-bold tabular-nums leading-none ${scoreColor}`}>
            {Math.round(score)}
          </div>
          <div className="space-y-0.5 min-w-0">
            <span
              className={`inline-block text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                consequences.level === "balanced"
                  ? "bg-green-500/20 text-green-500"
                  : consequences.level === "mild"
                    ? "bg-amber-500/20 text-amber-500"
                    : consequences.level === "moderate"
                      ? "bg-orange-500/20 text-orange-500"
                      : "bg-red-500/20 text-red-500"
              }`}
            >
              {consequences.level}
            </span>
            <p className="text-[10px] text-gray-500 leading-snug">{consequences.description}</p>
          </div>
        </div>
      </div>

      {/* Zone Distribution Chart */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-2">
          Geopolitical Zone Distribution
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2.5">
          {zones.map((z) => {
            const barPct = maxShare > 0 ? (z.actualShare / maxShare) * 100 : 0;
            const colors = ZONE_COLORS[z.zone] ?? { bar: "bg-gray-400", text: "text-gray-500" };
            const count = zoneCounts[z.zone] ?? 0;

            return (
              <div key={z.zone} data-testid={`fc-zone-${z.zone}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-semibold text-gray-700">
                    {ZONE_LABELS[z.zone] ?? z.zone}
                  </span>
                  <span className="text-[10px] text-gray-500 tabular-nums">
                    {count} / {expectedPerZone.toFixed(1)} expected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${colors.bar}`}
                      style={{ width: `${Math.max(barPct, 2)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium tabular-nums w-12 text-right ${colors.text}`}>
                    {(z.actualShare * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
