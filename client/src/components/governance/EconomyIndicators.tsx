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

/** Chart fills available space in its cell */
const CHART_HEIGHT = 100;

function SingleChart({ config, economy }: { config: ChartConfig; economy: EconomicState }) {
  const econRecord = economy as unknown as Record<string, unknown>;
  const history = economy.history ?? [];
  const currentValue = getNestedValue(econRecord, config.currentKey);
  const warning = checkWarning(config, currentValue);

  const data = useMemo(() => {
    if (!config.historyKey) return [];
    return history.map((snap: EconomicSnapshot, i: number) => ({
      idx: i,
      value: (snap as unknown as Record<string, unknown>)[config.historyKey!] as number ?? 0,
    }));
  }, [history, config.historyKey]);

  // Bar chart
  if (config.type === "bar" && config.bars) {
    const barData = config.bars.map(b => ({
      name: b.label,
      value: getNestedValue(econRecord, b.key),
    }));

    return (
      <div className="flex flex-col h-full">
        <h4 className="text-[11px] font-semibold text-gray-700 mb-1 shrink-0">{config.title}</h4>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#6b7280" }} width={48} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 10 }} />
              <Bar dataKey="value" fill="rgba(212,175,55,0.7)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Revenue vs Expenditure
  if (config.type === "stacked-area") {
    const rev = getNestedValue(econRecord, "revenue.total");
    const exp = getNestedValue(econRecord, "expenditure.total");
    const deficit = exp > rev;
    const barData = [
      { name: "Rev", value: rev },
      { name: "Exp", value: exp },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1 shrink-0">
          <h4 className="text-[11px] font-semibold text-gray-700">{config.title}</h4>
          <span className="text-[10px] font-mono text-[#0a1f14]">₦{rev.toFixed(1)}T / ₦{exp.toFixed(1)}T</span>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 10 }} />
              <Bar dataKey="value" fill={deficit ? "rgba(239,68,68,0.6)" : "rgba(34,197,94,0.6)"} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {deficit && <p className="text-[10px] text-red-500 font-medium mt-0.5 shrink-0">⚠ Fiscal deficit</p>}
      </div>
    );
  }

  // Line charts
  const lineColor = config.id.includes("fx") || config.id.includes("inflation") || config.id.includes("unemployment") || config.id.includes("debt")
    ? "#ef4444" : "#22c55e";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 shrink-0">
        <h4 className="text-[11px] font-semibold text-gray-700">{config.title}</h4>
        <span className="text-xs font-bold" style={{ color: lineColor }}>
          {formatValue(currentValue, config.format)}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.length > 0 ? data : [{ idx: 0, value: currentValue }]} margin={{ top: 2, right: 4, bottom: 0, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="idx" tick={false} />
            <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} width={30} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 10 }}
              labelFormatter={() => ""}
            />
            <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {warning && <p className="text-[10px] text-amber-600 font-medium mt-0.5 shrink-0">{warning}</p>}
    </div>
  );
}

export function EconomyIndicators({ charts }: Props) {
  const { state } = useGame();
  const economy = state.economy;

  return (
    <div className="flex flex-col h-full gap-1.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
        Key Indicators
      </h3>
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0 overflow-y-auto" style={{ gridAutoRows: "minmax(160px, 1fr)" }}>
        {charts.map(config => (
          <div key={config.id} className="rounded-md border border-gray-100 bg-[#faf8f5] p-2 flex flex-col min-h-0">
            <SingleChart config={config} economy={economy} />
          </div>
        ))}
      </div>
    </div>
  );
}
