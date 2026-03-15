import type { FactionState, ActiveEvent, VicePresidentState } from "./gameTypes";

export type PoliticalWeatherLevel = "Calm" | "Brewing" | "Stormy" | "Crisis";

export interface PoliticalWeather {
  level: PoliticalWeatherLevel;
  score: number;
  color: string;
}

const LEVEL_COLORS: Record<PoliticalWeatherLevel, string> = {
  Calm: "#22c55e",
  Brewing: "#eab308",
  Stormy: "#f97316",
  Crisis: "#ef4444",
};

export function computePoliticalWeather(
  factions: Record<string, FactionState>,
  vp: VicePresidentState,
  activeEvents: ActiveEvent[],
): PoliticalWeather {
  const factionList = Object.values(factions);
  const avgGrievance =
    factionList.length > 0
      ? factionList.reduce((sum, f) => sum + f.grievance, 0) / factionList.length
      : 0;

  let score = avgGrievance;

  if (vp.loyalty < 40) score += 15;

  for (const f of factionList) {
    if (f.stance === "Hostile") score += 10;
    else if (f.stance === "Opposed") score += 5;
  }

  const hasCrisisEvent = activeEvents.some((e) => {
    const text = `${e.title} ${e.description}`.toLowerCase();
    return text.includes("impeachment") || text.includes("coup");
  });
  if (hasCrisisEvent) score += 20;

  score = Math.min(100, Math.max(0, score));

  const level: PoliticalWeatherLevel =
    score <= 25 ? "Calm" : score <= 50 ? "Brewing" : score <= 75 ? "Stormy" : "Crisis";

  return { level, score, color: LEVEL_COLORS[level] };
}
