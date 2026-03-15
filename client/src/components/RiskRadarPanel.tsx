import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useGame } from "../lib/GameContext";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const roundTo = (v: number) => Math.round(v * 10) / 10;

interface RiskAxis {
  label: string;
  compute: (s: {
    outrage: number;
    trust: number;
    treasury: number;
    stability: number;
    stress: number;
    judicialIndependence: number;
    factionAvg: number;
    govAvg: number;
  }) => number;
}

const RISK_AXES: RiskAxis[] = [
  {
    label: "Inflation",
    compute: (s) => clamp(3 + s.outrage * 0.07 + (100 - s.trust) * 0.02, 0, 10),
  },
  {
    label: "FX Stability",
    compute: (s) => clamp(3 + s.outrage * 0.05 + (1.4 - s.treasury) * 3.2, 0, 10),
  },
  {
    label: "Security",
    compute: (s) => clamp(2 + (100 - s.stability) * 0.08, 0, 10),
  },
  {
    label: "Executive Stress",
    compute: (s) => clamp(1 + s.stress * 0.09, 0, 10),
  },
  {
    label: "Judicial Pushback",
    compute: (s) => clamp(2 + (100 - s.judicialIndependence) * 0.07, 0, 10),
  },
  {
    label: "Coalition Drift",
    compute: (s) => clamp(2 + (100 - s.factionAvg) * 0.06, 0, 10),
  },
  {
    label: "Public Trust",
    compute: (s) => clamp(2 + (100 - s.trust) * 0.06, 0, 10),
  },
  {
    label: "State Relations",
    compute: (s) => clamp(2 + (100 - s.govAvg) * 0.06, 0, 10),
  },
];

export function RiskRadarPanel() {
  const { state } = useGame();

  const factions = Object.values(state.factions);
  const factionAvg =
    factions.length > 0
      ? factions.reduce((sum, f) => sum + f.loyalty, 0) / factions.length
      : 50;

  const governors = state.governors ?? [];
  const govAvg =
    governors.length > 0
      ? governors.reduce((sum, g) => sum + g.loyalty, 0) / governors.length
      : 50;

  const inputs = {
    outrage: state.outrage,
    trust: state.trust,
    treasury: state.treasury,
    stability: state.stability,
    stress: state.stress,
    judicialIndependence: state.judicialIndependence,
    factionAvg,
    govAvg,
  };

  const data = RISK_AXES.map((axis) => ({
    axis: axis.label,
    value: roundTo(axis.compute(inputs)),
  }));

  // Top 2 risks
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top2 = sorted.slice(0, 2);
  const summary = top2.map((r) => `${r.axis} (${r.value})`).join(", ");

  return (
    <div className="bg-[#0d2818] border border-[#1a3a2a] rounded-xl p-4">
      <h3 className="text-[#d4af37] text-sm font-bold mb-2 uppercase tracking-wider">
        Risk Radar
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#1a3a2a" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "#8ba89a", fontSize: 9 }}
            />
            <Radar
              dataKey="value"
              stroke="#ef4444"
              fill="#ef444480"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-[#8ba89a] mt-2">
        <span className="text-[#ef4444] font-medium">Top risks:</span>{" "}
        {summary}
      </p>
    </div>
  );
}
