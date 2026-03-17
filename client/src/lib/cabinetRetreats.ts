import type { GameState } from "./gameTypes";
import { PORTFOLIO_SECTOR_MAP } from "./cabinetSystem";

export interface RetreatSectorOption {
  key: string;
  label: string;
}

export const RETREAT_SECTOR_OPTIONS: RetreatSectorOption[] = [
  { key: "healthSector", label: "Health" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "education", label: "Education" },
  { key: "agriculture", label: "Agriculture" },
  { key: "interior", label: "Interior" },
  { key: "environment", label: "Environment" },
  { key: "youthEmployment", label: "Youth & Employment" },
  { key: "economy", label: "Economy" },
];

const GOVERNANCE_SECTOR_KEYS = [
  "healthSector",
  "infrastructure",
  "education",
  "agriculture",
  "interior",
  "environment",
  "youthEmployment",
];

/**
 * Returns true if a quarterly cabinet retreat is due.
 * Not due during the first 30 days (cabinet formation period).
 */
export function isRetreatDue(
  lastRetreatDay: number,
  currentDay: number
): boolean {
  if (currentDay <= 30) return false;
  if (lastRetreatDay === 0) return currentDay > 90;
  return currentDay - lastRetreatDay >= 90;
}

/**
 * Returns true if the current game day falls within the October budget window.
 * Game starts May 29 = day 1. October roughly spans days 126-156 in each year.
 */
export function isOctoberBudgetMonth(day: number): boolean {
  const dayInYear = (day - 1) % 365;
  return dayInYear >= 125 && dayInYear <= 155;
}

/**
 * Apply the effects of a cabinet retreat:
 * - Boost momentum for prioritized governance sectors
 * - Boost loyalty for all ministers (extra for those whose portfolio matches a priority)
 * - Record the retreat in state
 */
export function applyRetreatEffects(
  state: GameState,
  priorities: string[]
): void {
  const prioritySet = new Set(priorities);

  // Apply momentum bonus to prioritized governance sectors
  for (const key of priorities) {
    if (key === "economy") continue;
    if (GOVERNANCE_SECTOR_KEYS.includes(key)) {
      const sector = state[key as keyof GameState] as { momentum: number };
      sector.momentum += 2;
    }
  }

  // Boost loyalty for all appointed ministers
  for (const [portfolio, characterName] of Object.entries(
    state.cabinetAppointments
  )) {
    if (!characterName) continue;
    const character = state.characters[characterName];
    if (!character) continue;

    // Base loyalty boost for attending retreat
    character.loyalty = Math.min(100, (character.loyalty ?? 0) + 3);

    // Extra boost if minister's sector is prioritized
    const sectorKey = PORTFOLIO_SECTOR_MAP[portfolio];
    if (sectorKey && prioritySet.has(sectorKey)) {
      character.loyalty = Math.min(100, (character.loyalty ?? 0) + 5);
    }
  }

  // Record retreat
  state.cabinetRetreats.lastRetreatDay = state.day;
  state.cabinetRetreats.priorities = priorities;
}
