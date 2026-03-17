// client/src/lib/lifecycleTypes.ts
// Types for generational turnover and career mobility across all NPC systems.

/**
 * Systems that participate in lifecycle processing.
 * Each system can have characters age, retire, die, or move between roles.
 */
export type LifecycleSystem =
  | "cabinet"
  | "directors"
  | "diplomats"
  | "military"
  | "judiciary"
  | "governors"
  | "legislature"
  | "traditional-rulers"
  | "religious-leaders"
  | "unions"
  | "godfathers";

/**
 * Reason a character exits a position.
 */
export type ExitReason =
  | "retirement-age"
  | "voluntary-retirement"
  | "death"
  | "health-crisis"
  | "scandal"
  | "term-limit"
  | "election-loss"
  | "fired"
  | "career-move";

/**
 * A lifecycle event that occurs during turn processing.
 */
export interface LifecycleEvent {
  characterName: string;
  system: LifecycleSystem;
  positionId: string;
  reason: ExitReason;
  day: number;
  replacement?: string; // Name of auto-replacement for non-player-appointed positions
}

/**
 * A career transition — character moves from one system/position to another.
 */
export interface CareerTransition {
  characterName: string;
  fromSystem: LifecycleSystem;
  fromPosition: string;
  toSystem: LifecycleSystem;
  toPosition: string;
  day: number;
}

/**
 * Age thresholds for different position types.
 * Characters reaching these ages trigger retirement processing.
 */
export const RETIREMENT_AGE_THRESHOLDS: Partial<Record<LifecycleSystem, number>> = {
  judiciary: 70,      // Constitutional retirement age for Supreme Court
  military: 62,       // Military retirement age
  "traditional-rulers": 90, // Very high — rulers serve for life, but can die
  "religious-leaders": 85,  // Can serve very long, but health events increase
  directors: 65,      // Civil service retirement
  diplomats: 65,      // Diplomatic service retirement
};

/**
 * Configuration for lifecycle processing frequency.
 * Lifecycle events don't need to run every turn — checking monthly is sufficient.
 */
export const LIFECYCLE_CHECK_INTERVAL = 30; // days

/**
 * Base probability of a health crisis event per year for characters over 70.
 * Increases linearly with age above 70.
 */
export const BASE_HEALTH_CRISIS_PROBABILITY = 0.02;

/**
 * Base probability of voluntary retirement per year for eligible characters.
 */
export const BASE_VOLUNTARY_RETIREMENT_PROBABILITY = 0.03;

/**
 * Result of lifecycle processing for a single turn.
 */
export interface ProcessLifecycleResult {
  /** Characters who exited their positions this turn */
  exits: LifecycleEvent[];
  /** Career transitions that occurred */
  transitions: CareerTransition[];
  /** Characters whose age increased (yearly anniversary) */
  agedCharacters: string[];
  /** Events to show the player */
  newEvents: import("./gameTypes").ActiveEvent[];
  /** Inbox messages for the player */
  inboxMessages: import("./gameTypes").GameInboxMessage[];
  /** Consequences (stat changes) */
  consequences: import("./gameTypes").Consequence[];
  /** Updated NPC links after cleanup of exiting characters */
  updatedNPCLinks?: import("./affinityRegistry").NPCLink[];
}
