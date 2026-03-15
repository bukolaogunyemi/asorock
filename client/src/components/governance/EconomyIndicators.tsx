import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useGame } from "@/lib/GameContext";
import type { ChartConfig } from "@/lib/governanceSections";
import type { EconomicSnapshot, EconomicState } from "@/lib/economicTypes";

interface Props {
  charts: ChartConfig[];
}

function getNestedValue(obj: Record<string, unknown>, path: string): number {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return 0;
    current = (current as Record<string, unknown>)[part];
  }
  return Number(current ?? 0);
}

function formatValue(value: number, format?: string): string {
  if (!format) return value.toFixed(1);
  return format.replace("{value}", value.toFixed(1));
}

function checkWarning(config: ChartConfig, value: number): string | null {
  if (config.crisisThreshold) {
    const { condition, value: threshold, message } = config.crisisThreshold;
    if ((condition === "gt" && value > threshold) || (condition === "lt" && value < threshold)) {
      return message;
    }
  }
  if (config.warningThreshold) {
    const { condition, value: threshold, message } = config.warningThreshold;
    if ((condition === "gt" && value > threshold) || (condition === "lt" && value < threshold)) {
      return message;
    }
  }
  return null;
}

function SingleChart({ config, economy }: { config: ChartConfig; economy: EconomicState }) {
  const econRecord = economy as unknown as Record<string, unknown>;
  const history = economy.history ?? [];
  const currentValue = getNestedValue(econRecord, config.currentKey);
  const warning = checkWarning(config, currentValue);

  // Build chart data from history
  const data = useMemo(() => {
    if (!config.historyKey) return [];
    return history.map((snap: EconomicSnapshot, i: number) => ({
      idx: i,
      value: (snap as unknown as Record<string, unknown>)[config.historyKey!] as number ?? 0,
    }));
  }, [history, config.historyKey]);

  // Bar chart special case
  if (config.type === "bar" && config.bars) {
    const barData = config.bars.map(b => ({
      name: b.label,
      value: getNestedValue(econRecord, b.key),
    }));

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/60">{config.title}</h4>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.05)" />
              <XAxis type="number" tick={{ fontSize: 9, fill: "rgba(245,158,11,0.4)" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "rgba(245,158,11,0.4)" }} width={55} />
              <Tooltip
                contentStyle={{ background: "#0a1f14", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "rgba(245,158,11,0.7)" }}
              />
              <Bar dataKey="value" fill="rgba(245,158,11,0.6)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Revenue vs Expenditure (stacked-area with current values only)
  if (config.type === "stacked-area") {
    const rev = getNestedValue(econRecord, "revenue.total");
    const exp = getNestedValue(econRecord, "expenditure.total");
    const deficit = exp > rev;
    const barData = [
      { name: "Revenue", value: rev },
      { name: "Expenditure", value: exp },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/60">{config.title}</h4>
          <span className="text-xs font-mono text-amber-200">N{rev.toFixed(1)}T / N{exp.toFixed(1)}T</span>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(245,158,11,0.4)" }} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(245,158,11,0.4)" }} />
              <Tooltip
                contentStyle={{ background: "#0a1f14", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="value" fill={deficit ? "rgba(239,68,68,0.6)" : "rgba(34,197,94,0.6)"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {deficit && <p className="text-[10px] text-red-400 mt-1">Fiscal deficit — borrowing required</p>}
      </div>
    );
  }

  // Line/area charts
  const lineColor = config.id.includes("fx") || config.id.includes("inflation") || config.id.includes("unemployment") || config.id.includes("debt")
    ? "rgba(239,68,68,0.8)" // red for negative metrics
    : "rgba(34,197,94,0.8)"; // green for positive

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-baseline justify-between mb-1">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/60">{config.title}</h4>
        <span className="text-xs font-mono text-amber-200">{formatValue(currentValue, config.format)}</span>
      </div>
      {data.length > 1 ? (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.05)" />
              <XAxis dataKey="idx" tick={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(245,158,11,0.3)" }} width={35} />
              <Tooltip
                contentStyle={{ background: "#0a1f14", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 11 }}
                labelFormatter={() => ""}
              />
              <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-amber-400/20 text-xs">
          Awaiting data...
        </div>
      )}
      {warning && <p className="text-[10px] text-amber-400 mt-1">{warning}</p>}
    </div>
  );
}

export function EconomyIndicators({ charts }: Props) {
  const { state } = useGame();
  const economy = state.economy;

  // Responsive grid: 2 columns for 4 charts, 3 columns for 6
  const cols = charts.length <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="flex flex-col h-full gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">
        Key Indicators
      </h3>
      <div className={`grid ${cols} gap-2 flex-1 min-h-0`}>
        {charts.map(config => (
          <div key={config.id} className="min-h-[120px]">
            <SingleChart config={config} economy={economy} />
          </div>
        ))}
      </div>
    </div>
  );
}
