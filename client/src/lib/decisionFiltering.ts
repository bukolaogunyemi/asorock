import type { ActiveEvent, BriefItem } from "./gameTypes";

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };

const TAB_TO_CATEGORY: Record<string, string[]> = {
  villa: [],
  cabinet: [],
  security: ["security"],
  governance: ["economy", "governance"],
  economy: ["economy"],
  infrastructure: ["governance"],
  health: ["governance"],
  education: ["governance"],
  politics: ["politics"],
  legislature: ["governance", "politics"],
  judiciary: ["governance"],
  diplomacy: ["diplomacy"],
  media: ["media"],
  legacy: [],
};

function isShowAll(tab: string): boolean {
  return tab === "villa" || tab === "cabinet";
}

export function filterDecisions(events: ActiveEvent[], tab: string): ActiveEvent[] {
  let filtered: ActiveEvent[];
  if (isShowAll(tab)) {
    filtered = [...events];
  } else {
    const categories = TAB_TO_CATEGORY[tab] ?? [];
    if (categories.length === 0) return [];
    filtered = events.filter((e) => categories.includes(e.category));
  }
  return filtered.sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2),
  );
}

export function filterHeadlines(headlines: string[], tab: string): string[] {
  if (isShowAll(tab)) return headlines;
  return headlines;
}

export function filterBriefItems(items: BriefItem[], tab: string): BriefItem[] {
  if (isShowAll(tab)) {
    return [...items].sort(
      (a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2),
    );
  }
  return items;
}
