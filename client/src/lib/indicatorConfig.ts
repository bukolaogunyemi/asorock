export type IndicatorColor = "green" | "yellow" | "red";
export type TrendDirection = "up" | "down" | "none";

export interface IndicatorDef {
  key: string;
  label: string;
  sourceField: string;
  unit: string;
  navigateTo: { tab: string; subTab?: string };
  thresholds: { green: (v: number) => boolean; yellow: (v: number) => boolean };
  format: (v: number) => string;
  contextText?: (v: number) => string;
}

export const INDICATORS: IndicatorDef[] = [
  {
    key: "approval",
    label: "Approval",
    sourceField: "approval",
    unit: "%",
    navigateTo: { tab: "villa" },
    thresholds: { green: (v) => v > 60, yellow: (v) => v >= 40 },
    format: (v) => `${Math.round(v)}%`,
  },
  {
    key: "security",
    label: "Security",
    sourceField: "stability",
    unit: "",
    navigateTo: { tab: "security" },
    thresholds: { green: (v) => v > 70, yellow: (v) => v >= 40 },
    format: (v) => v > 70 ? "Stable" : v >= 40 ? "Elevated" : "Critical",
    contextText: (v) => v > 70 ? "Stable" : v >= 40 ? "Elevated" : "Critical",
  },
  {
    key: "treasury",
    label: "Treasury",
    sourceField: "treasury",
    unit: "₦T",
    navigateTo: { tab: "governance", subTab: "economy" },
    thresholds: { green: (v) => v > 1.5, yellow: (v) => v >= 0.8 },
    format: (v) => `₦${v.toFixed(1)}T`,
  },
  {
    key: "gdpGrowth",
    label: "GDP Growth",
    sourceField: "economy.gdpGrowthRate",
    unit: "%",
    navigateTo: { tab: "governance", subTab: "economy" },
    thresholds: { green: (v) => v > 0.05, yellow: (v) => v >= 0 },
    format: (v) => `${v.toFixed(3)}%`,
  },
  {
    key: "inflation",
    label: "Inflation",
    sourceField: "economy.inflation",
    unit: "%",
    navigateTo: { tab: "governance", subTab: "economy" },
    thresholds: { green: (v) => v < 10, yellow: (v) => v <= 20 },
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "oilOutput",
    label: "Oil Output",
    sourceField: "economy.oilOutput",
    unit: "M bpd",
    navigateTo: { tab: "governance", subTab: "economy" },
    thresholds: { green: (v) => v > 2.0, yellow: (v) => v >= 1.5 },
    format: (v) => `${v.toFixed(1)}M`,
  },
  {
    key: "fxRate",
    label: "FX Rate",
    sourceField: "economy.fxRate",
    unit: "₦/$",
    navigateTo: { tab: "governance", subTab: "economy" },
    thresholds: { green: (v) => v < 800, yellow: (v) => v <= 1200 },
    format: (v) => `₦${Math.round(v)}`,
  },
  {
    key: "stability",
    label: "Stability",
    sourceField: "stability",
    unit: "",
    navigateTo: { tab: "security" },
    thresholds: { green: (v) => v > 70, yellow: (v) => v >= 40 },
    format: (v) => `${Math.round(v)}`,
  },
];

export function getIndicatorColor(key: string, value: number): IndicatorColor {
  const ind = INDICATORS.find((i) => i.key === key);
  if (!ind) return "yellow";
  if (ind.thresholds.green(value)) return "green";
  if (ind.thresholds.yellow(value)) return "yellow";
  return "red";
}

export function getIndicatorTrend(
  current: number,
  previous: number | undefined,
): { direction: TrendDirection; delta: number } {
  if (previous === undefined) return { direction: "none", delta: 0 };
  const delta = Math.round((current - previous) * 100) / 100;
  if (delta > 0) return { direction: "up", delta };
  if (delta < 0) return { direction: "down", delta };
  return { direction: "none", delta: 0 };
}

export function getIndicatorValue(state: Record<string, unknown>, sourceField: string): number {
  const parts = sourceField.split(".");
  let val: unknown = state;
  for (const p of parts) val = (val as Record<string, unknown>)?.[p];
  return (val as number) ?? 0;
}
