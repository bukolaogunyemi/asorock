// client/src/lib/lifecycleEngine.ts
// Generational turnover engine — handles aging, retirement, death, and career mobility
// across all NPC character systems.

import type { GameState, ActiveEvent, GameInboxMessage, Consequence, CharacterState } from "./gameTypes";
import type {
  LifecycleEvent,
  CareerTransition,
  ProcessLifecycleResult,
  ExitReason,
  LifecycleSystem,
} from "./lifecycleTypes";
import {
  RETIREMENT_AGE_THRESHOLDS,
  LIFECYCLE_CHECK_INTERVAL,
  BASE_HEALTH_CRISIS_PROBABILITY,
  BASE_VOLUNTARY_RETIREMENT_PROBABILITY,
} from "./lifecycleTypes";
import { cleanupNPCLinks } from "./affinityRegistry";

// ── Age tracking ──

/**
 * Compute the effective age of a character on a given game day.
 * Characters age 1 year every 365 game-days.
 */
export function effectiveAge(baseAge: number, appointedDay: number, currentDay: number): number {
  const daysPassed = currentDay - appointedDay;
  return baseAge + Math.floor(daysPassed / 365);
}

/**
 * Process aging for all characters. Returns names of characters whose age ticked up.
 * Only processes on yearly boundaries (day % 365 === 0).
 */
export function processAging(state: GameState): string[] {
  if (state.day % 365 !== 0) return [];

  const aged: string[] = [];
  for (const [name, char] of Object.entries(state.characters ?? {})) {
    if (char.age != null) {
      aged.push(name);
    }
  }
  return aged;
}

/**
 * Get the updated age for a character map after a year passes.
 */
export function ageCharacters(
  characters: Record<string, CharacterState>,
): Record<string, CharacterState> {
  const result: Record<string, CharacterState> = {};
  for (const [name, char] of Object.entries(characters)) {
    result[name] = char.age != null
      ? { ...char, age: char.age + 1 }
      : char;
  }
  return result;
}

// ── Retirement checks ──

interface PositionHolder {
  characterName: string;
  positionId: string;
  system: LifecycleSystem;
  appointedDay: number;
}

/**
 * Gather all position holders across systems into a flat list.
 */
function gatherPositionHolders(state: GameState): PositionHolder[] {
  const holders: PositionHolder[] = [];

  // Diplomats
  for (const appt of state.diplomats?.appointments ?? []) {
    if (appt.characterName) {
      holders.push({
        characterName: appt.characterName,
        positionId: appt.postId,
        system: "diplomats",
        appointedDay: appt.appointedDay ?? 0,
      });
    }
  }

  // Military
  for (const appt of state.military?.appointments ?? []) {
    if (appt.characterName) {
      holders.push({
        characterName: appt.characterName,
        positionId: appt.positionId,
        system: "military",
        appointedDay: appt.appointedDay ?? 0,
      });
    }
  }

  // Traditional rulers
  for (const appt of state.traditionalRulers?.appointments ?? []) {
    if (appt.characterName) {
      holders.push({
        characterName: appt.characterName,
        positionId: appt.positionId,
        system: "traditional-rulers",
        appointedDay: appt.appointedDay ?? 0,
      });
    }
  }

  // Religious leaders
  for (const appt of state.religiousLeaders?.appointments ?? []) {
    if (appt.characterName) {
      holders.push({
        characterName: appt.characterName,
        positionId: appt.positionId,
        system: "religious-leaders",
        appointedDay: appt.appointedDay ?? 0,
      });
    }
  }

  // Directors
  for (const appt of state.directors?.appointments ?? []) {
    if (appt.characterName) {
      holders.push({
        characterName: appt.characterName,
        positionId: appt.positionId,
        system: "directors",
        appointedDay: appt.appointedDay ?? 0,
      });
    }
  }

  return holders;
}

/**
 * Check if a character should be retired based on age thresholds.
 */
function checkRetirementAge(
  holder: PositionHolder,
  character: CharacterState | undefined,
  currentDay: number,
): ExitReason | null {
  if (!character?.age) return null;

  const threshold = RETIREMENT_AGE_THRESHOLDS[holder.system];
  if (!threshold) return null;

  const age = effectiveAge(character.age, holder.appointedDay, currentDay);
  if (age >= threshold) return "retirement-age";

  return null;
}

/**
 * Check for probabilistic health crisis events.
 * Probability increases for characters over 70.
 */
function checkHealthCrisis(
  character: CharacterState | undefined,
  currentDay: number,
  rng: () => number,
): ExitReason | null {
  if (!character?.age) return null;

  const age = character.age;
  if (age < 70) return null;

  // Probability scales with age above 70
  const ageOver70 = age - 70;
  const probability = BASE_HEALTH_CRISIS_PROBABILITY * (1 + ageOver70 * 0.3);

  // Monthly check (scaled from annual probability)
  const monthlyProb = probability / 12;
  if (rng() < monthlyProb) {
    return rng() < 0.3 ? "death" : "health-crisis";
  }

  return null;
}

/**
 * Check for voluntary retirement based on character traits.
 * Characters with low ambition and high integrity are more likely to retire.
 */
function checkVoluntaryRetirement(
  character: CharacterState | undefined,
  holder: PositionHolder,
  currentDay: number,
  rng: () => number,
): ExitReason | null {
  if (!character?.age) return null;
  if (character.age < 58) return null; // Too young to voluntarily retire

  // Systems where voluntary retirement doesn't apply
  if (holder.system === "traditional-rulers" || holder.system === "religious-leaders") {
    return null;
  }

  const ambition = character.competencies?.personal?.ambition ?? 50;
  const integrity = character.competencies?.personal?.integrity ?? 50;

  // Low ambition + high integrity = higher retirement probability
  const retirementInclination = (100 - ambition + integrity) / 200;
  const ageBonus = (character.age - 58) * 0.01;
  const probability = BASE_VOLUNTARY_RETIREMENT_PROBABILITY * retirementInclination + ageBonus;

  const monthlyProb = probability / 12;
  if (rng() < monthlyProb) return "voluntary-retirement";

  return null;
}

// ── Career mobility ──

/**
 * Check if a recently-exited character can transition to a new role.
 * For example:
 * - Retired diplomats might become political advisors or traditional ruler candidates
 * - Retired military officers might enter politics (common in Nigeria)
 * - Former directors might move to diplomatic service
 */
export function checkCareerMobility(
  exit: LifecycleEvent,
  character: CharacterState | undefined,
  rng: () => number,
): CareerTransition | null {
  if (!character) return null;
  if (exit.reason === "death") return null;
  if (exit.reason === "scandal") return null;

  const age = character.age ?? 60;
  if (age > 72) return null; // Too old for career transition

  const ambition = character.competencies?.personal?.ambition ?? 50;

  // Only ambitious characters seek new roles
  if (ambition < 45) return null;

  // 15% base chance of career transition, modified by ambition
  const transitionChance = 0.15 * (ambition / 60);
  if (rng() >= transitionChance) return null;

  // Determine destination based on source system
  const destinations = getCareerDestinations(exit.system);
  if (destinations.length === 0) return null;

  const dest = destinations[Math.floor(rng() * destinations.length)];

  return {
    characterName: exit.characterName,
    fromSystem: exit.system,
    fromPosition: exit.positionId,
    toSystem: dest.system,
    toPosition: dest.role,
    day: exit.day,
  };
}

function getCareerDestinations(
  fromSystem: LifecycleSystem,
): { system: LifecycleSystem; role: string }[] {
  switch (fromSystem) {
    case "military":
      return [
        { system: "godfathers", role: "political-patron" },
        { system: "cabinet", role: "security-adviser" },
      ];
    case "diplomats":
      return [
        { system: "cabinet", role: "foreign-affairs-adviser" },
        { system: "godfathers", role: "international-broker" },
      ];
    case "directors":
      return [
        { system: "diplomats", role: "diplomatic-service" },
        { system: "cabinet", role: "ministerial-candidate" },
      ];
    case "judiciary":
      return [
        { system: "godfathers", role: "legal-patron" },
      ];
    default:
      return [];
  }
}

// ── Event generation ──

function createExitEvent(exit: LifecycleEvent): ActiveEvent {
  const reasonText: Record<ExitReason, string> = {
    "retirement-age": "has reached mandatory retirement age",
    "voluntary-retirement": "has voluntarily retired from service",
    "death": "has passed away",
    "health-crisis": "has been incapacitated due to a health crisis",
    "scandal": "has resigned following a scandal",
    "term-limit": "has reached the end of their term",
    "election-loss": "has lost their election",
    "fired": "has been dismissed",
    "career-move": "is transitioning to a new role",
  };

  const isGrave = exit.reason === "death";
  const systemLabel = exit.system.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());

  return {
    id: `lifecycle-${exit.system}-${exit.positionId}-${exit.day}`,
    title: isGrave
      ? `Death of ${exit.characterName}`
      : `${exit.characterName} — ${systemLabel} Departure`,
    description: `${exit.characterName} ${reasonText[exit.reason]}. The position of ${exit.positionId} is now vacant.`,
    day: exit.day,
    urgency: isGrave ? "critical" : "standard",
    category: "personnel",
    choices: isGrave
      ? [
          { label: "Issue condolence statement", consequences: [{ id: `condolence-${exit.day}`, target: "approval", delta: 2 }] },
          { label: "Acknowledge privately", consequences: [] },
        ]
      : [
          { label: "Begin replacement search", consequences: [] },
          { label: "Leave position vacant", consequences: [{ id: `vacancy-${exit.day}`, target: "approval", delta: -1 }] },
        ],
  };
}

function createExitInboxMessage(exit: LifecycleEvent): GameInboxMessage {
  return {
    id: `lifecycle-inbox-${exit.system}-${exit.positionId}-${exit.day}`,
    subject: exit.reason === "death"
      ? `Passing of ${exit.characterName}`
      : `${exit.characterName} Retirement Notice`,
    from: "Chief of Staff",
    day: exit.day,
    priority: exit.reason === "death" ? "high" : "medium",
    body: `${exit.characterName} has departed their position in the ${exit.system} system. You may need to consider a replacement.`,
    read: false,
    category: "personnel",
  };
}

function createTransitionInboxMessage(transition: CareerTransition): GameInboxMessage {
  return {
    id: `career-transition-${transition.characterName}-${transition.day}`,
    subject: `${transition.characterName} — New Role`,
    from: "Chief of Staff",
    day: transition.day,
    priority: "low",
    body: `${transition.characterName} has transitioned from ${transition.fromSystem} to a role in ${transition.toSystem}. Their experience may prove valuable in their new capacity.`,
    read: false,
    category: "personnel",
  };
}

// ── Main entry point ──

/**
 * Process lifecycle events for the current turn.
 * Only runs significant checks every LIFECYCLE_CHECK_INTERVAL days.
 * Aging runs every 365 days.
 */
export function processLifecycle(
  state: GameState,
  rng: () => number,
): ProcessLifecycleResult {
  const result: ProcessLifecycleResult = {
    exits: [],
    transitions: [],
    agedCharacters: [],
    newEvents: [],
    inboxMessages: [],
    consequences: [],
  };

  // Aging — once per game-year
  if (state.day % 365 === 0) {
    result.agedCharacters = processAging(state);
  }

  // Retirement/death checks — monthly
  if (state.day % LIFECYCLE_CHECK_INTERVAL !== 0) return result;

  const holders = gatherPositionHolders(state);

  for (const holder of holders) {
    const character = state.characters?.[holder.characterName];

    // Check mandatory retirement age
    let exitReason = checkRetirementAge(holder, character, state.day);

    // Check health crisis (probabilistic)
    if (!exitReason) {
      exitReason = checkHealthCrisis(character, state.day, rng);
    }

    // Check voluntary retirement (probabilistic)
    if (!exitReason) {
      exitReason = checkVoluntaryRetirement(character, holder, state.day, rng);
    }

    if (exitReason) {
      const exit: LifecycleEvent = {
        characterName: holder.characterName,
        system: holder.system,
        positionId: holder.positionId,
        reason: exitReason,
        day: state.day,
      };

      result.exits.push(exit);

      // Only generate player-facing events for significant departures
      if (exitReason === "death" || holder.system !== "directors") {
        result.newEvents.push(createExitEvent(exit));
      }
      result.inboxMessages.push(createExitInboxMessage(exit));

      // Check career mobility for non-death exits
      const transition = checkCareerMobility(exit, character, rng);
      if (transition) {
        result.transitions.push(transition);
        result.inboxMessages.push(createTransitionInboxMessage(transition));
      }
    }
  }

  // Generate consequences for multiple exits in the same turn
  if (result.exits.length >= 3) {
    result.consequences.push({
      id: `mass-departure-${state.day}`,
      target: "stability",
      delta: -2,
    });
  }

  // Cleanup NPC links for exiting characters
  if (result.exits.length > 0 && state.npcLinks?.length > 0) {
    let links = [...state.npcLinks];
    for (const exit of result.exits) {
      // Check if this character has a career transition
      const transition = result.transitions.find(
        (t) => t.characterName === exit.characterName,
      );
      if (transition) {
        // Career transition: update system references
        links = cleanupNPCLinks(links, exit.characterName, "transition", transition.toSystem);
      } else if (exit.reason === "death" || exit.reason === "retirement-age" || exit.reason === "voluntary-retirement") {
        // Permanent exit: remove all links
        links = cleanupNPCLinks(links, exit.characterName, "remove");
      }
    }
    result.updatedNPCLinks = links;
  }

  return result;
}
