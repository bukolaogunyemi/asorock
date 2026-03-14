// client/src/lib/legislativeEngine.ts
import type { GameState } from "./gameTypes";
import type { Bill, BillStage, LegislativeState, VoteProjection } from "./legislativeTypes";

// ── Chamber Seat Blocs ────────────────────────────────────────────────────────

interface BlocSeats {
  coreRuling: number;
  rulingAllies: number;
  mainOpposition: number;
  oppositionModerates: number;
  independents: number;
}

const HOUSE_BLOCS: BlocSeats = {
  coreRuling: 145,
  rulingAllies: 56,
  mainOpposition: 120,
  oppositionModerates: 34,
  independents: 5,
};

const SENATE_BLOCS: BlocSeats = {
  coreRuling: 56,
  rulingAllies: 22,
  mainOpposition: 22,
  oppositionModerates: 7,
  independents: 2,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Distribute `seats` across the 5 VoteProjection buckets given a support score
 * in [0, 1] (1 = fully in favour, 0 = fully opposed).
 *
 * The support score is treated as a cumulative probability: it represents
 * the fraction of the bloc that is on the "yes" side. Within the yes and no
 * halves, seats are further split between "firm" and "leaning" based on how
 * far the score is from 0.5. Members near the middle go to undecided.
 *
 *   support = 1.0  → all firmYes
 *   support = 0.5  → all undecided
 *   support = 0.0  → all firmNo
 */
function distributeBloc(
  seats: number,
  support: number,
): VoteProjection {
  const s = Math.max(0, Math.min(1, support));

  // Compute weights for 5 buckets using a piecewise linear mapping:
  //   Bucket boundaries at 0, 0.2, 0.4, 0.6, 0.8, 1.0
  //   [0.0–0.2] → firmNo, [0.2–0.4] → leaningNo,
  //   [0.4–0.6] → undecided, [0.6–0.8] → leaningYes, [0.8–1.0] → firmYes
  //
  // We model the bloc as having members whose individual support values are
  // spread around `s` with a triangular distribution of half-width 0.35.
  // Each bucket gets the integral of that distribution over its range.

  const halfWidth = 0.35;

  // CDF of triangular distribution centred at s with half-width h, at point x.
  // Clamped to [0, 1].
  const triCDF = (x: number): number => {
    if (x <= s - halfWidth) return 0;
    if (x >= s + halfWidth) return 1;
    if (x <= s) {
      const d = x - (s - halfWidth);
      return (d * d) / (2 * halfWidth * halfWidth);
    }
    // x > s
    const d = (s + halfWidth) - x;
    return 1 - (d * d) / (2 * halfWidth * halfWidth);
  };

  const boundaries = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const weights = boundaries
    .slice(1)
    .map((b, i) => triCDF(b) - triCDF(boundaries[i]));

  // Normalise (should already sum to 1, but guard against floating-point drift)
  const wSum = weights.reduce((a, b) => a + b, 0);
  const normWeights = wSum > 0 ? weights.map((w) => w / wSum) : weights.map(() => 0.2);

  // Allocate seats — largest-remainder for exact integer partition
  const exact   = normWeights.map((w) => w * seats);
  const floored = exact.map(Math.floor);
  const remainders = exact.map((v, i) => v - floored[i]);

  const allocated   = floored.reduce((a, b) => a + b, 0);
  const toDistribute = seats - allocated;

  const order = remainders
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r - a.r);

  for (let k = 0; k < toDistribute; k++) {
    floored[order[k].i]++;
  }

  // floored order: [firmNo, leaningNo, undecided, leaningYes, firmYes]
  return {
    firmNo:     floored[0],
    leaningNo:  floored[1],
    undecided:  floored[2],
    leaningYes: floored[3],
    firmYes:    floored[4],
  };
}

function addProjections(a: VoteProjection, b: VoteProjection): VoteProjection {
  return {
    firmYes:    a.firmYes    + b.firmYes,
    leaningYes: a.leaningYes + b.leaningYes,
    undecided:  a.undecided  + b.undecided,
    leaningNo:  a.leaningNo  + b.leaningNo,
    firmNo:     a.firmNo     + b.firmNo,
  };
}

function totalSeats(p: VoteProjection): number {
  return p.firmYes + p.leaningYes + p.undecided + p.leaningNo + p.firmNo;
}

// ── Layer 2: Faction cross-pressure ──────────────────────────────────────────

type SubjectTag = "economy" | "security" | "governance" | "social" | "constitutional";

const TAG_TO_FACTION_TOPICS: Record<SubjectTag, string[]> = {
  economy:        ["economy", "fiscal", "budget", "trade"],
  security:       ["security", "military", "police"],
  social:         ["social", "welfare", "health", "education"],
  governance:     ["governance", "corruption", "institutions"],
  constitutional: ["constitution", "federal", "power"],
};

/**
 * Returns a small undecided-to-opposition shift (positive = more opposition,
 * negative = more support) based on faction grievances relevant to the bill.
 * Capped at ±10 seats.
 */
function factionCrossPressureShift(
  state: GameState,
  subjectTag: SubjectTag,
): number {
  const relevantTopics = TAG_TO_FACTION_TOPICS[subjectTag] ?? [];
  let shift = 0;

  for (const faction of Object.values(state.factions)) {
    if (faction.grievance <= 30) continue;

    // Check if this faction's name/topic loosely overlaps with the bill subject.
    const factionNameLower = faction.name.toLowerCase();
    const isRelevant = relevantTopics.some((t) => factionNameLower.includes(t));

    if (isRelevant) {
      // Grievance > 30 → push some seats toward opposition.
      // Scale: each 10 points above 30 grievance contributes ~1 seat shift.
      shift += Math.floor((faction.grievance - 30) / 10);
    }
  }

  // Cap between -10 and +10
  return Math.max(-10, Math.min(10, shift));
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface BillInfo {
  subjectTag: SubjectTag;
  sponsor: "executive" | "ruling-backbench" | "opposition" | "cross-party";
  stakes: "routine" | "significant" | "critical";
}

/**
 * calculateVoteProjection
 *
 * 3-layer vote model:
 *   Layer 1 — Bloc baselines (seats per party group, each with a lean score)
 *   Layer 2 — Faction cross-pressure shifts undecided seats
 *   Layer 3 — Distribute each bloc's seats into 5 VoteProjection buckets
 *
 * Total always sums exactly to the chamber size (360 House / 109 Senate).
 */
export function calculateVoteProjection(
  state: GameState,
  billInfo: BillInfo,
  chamber: "house" | "senate",
): VoteProjection {
  const blocs = chamber === "house" ? HOUSE_BLOCS : SENATE_BLOCS;
  const chamberSize = chamber === "house" ? 360 : 109;

  const loyalty = Math.max(0, Math.min(100, state.partyLoyalty ?? 70));
  const loyaltyRatio = loyalty / 100;

  // ── Layer 1: Determine lean scores ──────────────────────────────────────

  // Support score (0–1) for each bloc based on sponsor type and loyalty.
  let coreRulingLean: number;
  let rulingAlliesLean: number;
  let mainOppositionLean: number;
  let oppositionModeratesLean: number;

  switch (billInfo.sponsor) {
    case "executive":
      coreRulingLean        = loyaltyRatio;
      rulingAlliesLean      = loyaltyRatio * 0.75;
      mainOppositionLean    = 1 - loyaltyRatio;      // inverted
      oppositionModeratesLean = (1 - loyaltyRatio) * 0.5; // weakly against
      break;

    case "ruling-backbench":
      // Backbench bills: core ruling is lukewarm, opposition moderately opposed
      coreRulingLean        = loyaltyRatio * 0.8;
      rulingAlliesLean      = loyaltyRatio * 0.6;
      mainOppositionLean    = 1 - loyaltyRatio * 0.7;
      oppositionModeratesLean = 0.5 - loyaltyRatio * 0.2;
      break;

    case "opposition":
      // Opposite of executive: ruling bloc opposes, opposition supports
      coreRulingLean        = 1 - loyaltyRatio;
      rulingAlliesLean      = (1 - loyaltyRatio) * 0.7;
      mainOppositionLean    = loyaltyRatio;
      oppositionModeratesLean = loyaltyRatio * 0.5;
      break;

    case "cross-party":
      // Bipartisan: everyone moderate
      coreRulingLean        = 0.5 + (loyaltyRatio - 0.5) * 0.4;
      rulingAlliesLean      = 0.5 + (loyaltyRatio - 0.5) * 0.3;
      mainOppositionLean    = 0.5 - (loyaltyRatio - 0.5) * 0.3;
      oppositionModeratesLean = 0.5;
      break;

    default:
      coreRulingLean        = loyaltyRatio;
      rulingAlliesLean      = loyaltyRatio * 0.75;
      mainOppositionLean    = 1 - loyaltyRatio;
      oppositionModeratesLean = (1 - loyaltyRatio) * 0.5;
  }

  // Clamp all leans to [0, 1]
  coreRulingLean          = Math.max(0, Math.min(1, coreRulingLean));
  rulingAlliesLean        = Math.max(0, Math.min(1, rulingAlliesLean));
  mainOppositionLean      = Math.max(0, Math.min(1, mainOppositionLean));
  oppositionModeratesLean = Math.max(0, Math.min(1, oppositionModeratesLean));
  const independentsLean  = 0.5; // always 50/50

  // ── Layer 3: Distribute into 5 buckets ──────────────────────────────────

  const coreRulingProjection        = distributeBloc(blocs.coreRuling,        coreRulingLean);
  const rulingAlliesProjection      = distributeBloc(blocs.rulingAllies,      rulingAlliesLean);
  const mainOppositionProjection    = distributeBloc(blocs.mainOpposition,    mainOppositionLean);
  const oppositionModeratesProjection = distributeBloc(blocs.oppositionModerates, oppositionModeratesLean);
  const independentsProjection      = distributeBloc(blocs.independents,      independentsLean);

  // Combine all blocs
  let combined = addProjections(coreRulingProjection, rulingAlliesProjection);
  combined = addProjections(combined, mainOppositionProjection);
  combined = addProjections(combined, oppositionModeratesProjection);
  combined = addProjections(combined, independentsProjection);

  // ── Layer 2: Apply faction cross-pressure ───────────────────────────────
  const factionShift = factionCrossPressureShift(state, billInfo.subjectTag);

  // Shift seats from undecided toward firmNo/leaningNo (positive shift = more opposition)
  if (factionShift !== 0) {
    const magnitude = Math.abs(factionShift);
    const available = Math.min(magnitude, combined.undecided);
    combined.undecided -= available;
    if (factionShift > 0) {
      combined.leaningNo += available;
    } else {
      combined.leaningYes += available;
    }
  }

  // ── Rounding correction: ensure exact chamber total ──────────────────────
  const currentTotal = totalSeats(combined);
  const diff = chamberSize - currentTotal;

  if (diff !== 0) {
    // Adjust the undecided bucket (most neutral) to absorb rounding error
    combined.undecided = Math.max(0, combined.undecided + diff);

    // If undecided went negative, absorb via firmNo instead
    const recalcTotal = totalSeats(combined);
    const remaining = chamberSize - recalcTotal;
    if (remaining !== 0) {
      combined.firmNo = Math.max(0, combined.firmNo + remaining);
    }
  }

  return combined;
}

// ── Bill Progression ──────────────────────────────────────────────────────────

/** Stage progression order for both chambers */
const STAGE_ORDER: BillStage[] = ["introduction", "committee", "floor-debate", "vote", "passed", "failed"];

/** Default durations (in days) for each stage */
const STAGE_DURATIONS: Partial<Record<BillStage, number>> = {
  introduction: 3,
  committee: 7,
  "floor-debate": 4,
  vote: 1,
};

/** Maximum stall duration before a bill is killed */
const MAX_STALL_DAYS = 30;

/** Maximum number of active bills at once */
const MAX_ACTIVE_BILLS = 8;

/** Days the president has to sign a bill after both chambers pass */
const SIGNING_DEADLINE_DAYS = 21;

/**
 * Returns the initial empty LegislativeState.
 */
export function defaultLegislativeState(): LegislativeState {
  return {
    activeBills: [],
    passedBills: [],
    failedBills: [],
    pendingSignature: [],
    legislativeCalendar: [],
    adviserAccuracy: 70,
    sessionStats: {
      billsIntroduced: 0,
      billsPassed: 0,
      billsVetoed: 0,
      overrideAttempts: 0,
      overrideSuccesses: 0,
    },
  };
}

/**
 * Creates a Bill from a lightweight template. Both chambers start at
 * "introduction" with default stage durations.
 */
export function createBillFromTemplate(
  template: Pick<Bill, "title" | "description" | "subjectTag" | "stakes" | "effects"> & {
    sponsor?: Bill["sponsor"];
  },
  currentDay: number,
): Bill {
  return {
    id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: template.title,
    description: template.description,
    subjectTag: template.subjectTag,
    sponsor: template.sponsor ?? "executive",
    stakes: template.stakes,
    houseStage: "introduction",
    senateStage: "introduction",
    houseSupport: { firmYes: 0, leaningYes: 0, undecided: 0, leaningNo: 0, firmNo: 0 },
    senateSupport: { firmYes: 0, leaningYes: 0, undecided: 0, leaningNo: 0, firmNo: 0 },
    introducedOnDay: currentDay,
    signingDeadlineDay: null,
    effects: template.effects,
    amendments: [],
    isCrisis: false,
    houseStageDaysRemaining: STAGE_DURATIONS["introduction"]!,
    senateStageDaysRemaining: STAGE_DURATIONS["introduction"]!,
    houseStageEnteredDay: currentDay,
    senateStageEnteredDay: currentDay,
  };
}

/** Advance a single chamber stage to the next step. Returns updated stage + timer fields. */
function advanceChamberStage(
  currentStage: BillStage,
  enteredDay: number,
  currentDay: number,
): { stage: BillStage; daysRemaining: number; enteredDay: number } {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const nextStage = currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
    ? STAGE_ORDER[currentIndex + 1]
    : currentStage;

  const duration = STAGE_DURATIONS[nextStage] ?? 1;
  return {
    stage: nextStage,
    daysRemaining: duration,
    enteredDay: currentDay,
  };
}

/** Check if a bill passes its vote stage based on support projection and chamber size */
function billPassesVote(support: VoteProjection, chamberSize: number): boolean {
  return (support.firmYes + support.leaningYes) > chamberSize / 2;
}

/**
 * advanceBills
 *
 * Processes one game day of legislative activity:
 * - Decrements stage timers for each chamber of every active bill
 * - Advances bills to the next stage when their timer expires
 * - Resolves vote stages: passes or fails each chamber
 * - Moves fully-passed bills (both chambers) to pendingSignature
 * - Kills bills stalled 30+ days in a single stage
 * - Enforces an 8-bill active cap
 *
 * Returns the updated LegislativeState (does not mutate the input).
 */
export function advanceBills(state: GameState): LegislativeState {
  const current = state.legislature ?? defaultLegislativeState();
  const today = state.day;

  const newActiveBills: Bill[] = [];
  const newFailedBills: Bill[] = [...current.failedBills];
  const newPendingSignature: Bill[] = [...current.pendingSignature];

  for (const bill of current.activeBills) {
    let b = { ...bill };

    // ── House chamber ──
    if (b.houseStage !== "passed" && b.houseStage !== "failed") {
      // Check stall: if the bill has been in this stage more than MAX_STALL_DAYS
      const daysInHouseStage = today - b.houseStageEnteredDay;
      if (daysInHouseStage > MAX_STALL_DAYS) {
        // Kill the bill
        newFailedBills.push({ ...b, houseStage: "stalled", senateStage: "stalled" });
        continue;
      }

      b.houseStageDaysRemaining = Math.max(0, b.houseStageDaysRemaining - 1);

      if (b.houseStageDaysRemaining === 0) {
        if (b.houseStage === "vote") {
          // Resolve the vote
          const passes = billPassesVote(b.houseSupport, 360);
          b.houseStage = passes ? "passed" : "failed";
          b.houseStageEnteredDay = today;
        } else {
          // Advance to next stage
          const next = advanceChamberStage(b.houseStage, b.houseStageEnteredDay, today);
          b.houseStage = next.stage;
          b.houseStageDaysRemaining = next.daysRemaining;
          b.houseStageEnteredDay = next.enteredDay;
        }
      }
    }

    // ── Senate chamber ──
    if (b.senateStage !== "passed" && b.senateStage !== "failed") {
      const daysInSenateStage = today - b.senateStageEnteredDay;
      if (daysInSenateStage > MAX_STALL_DAYS) {
        newFailedBills.push({ ...b, houseStage: "stalled", senateStage: "stalled" });
        continue;
      }

      b.senateStageDaysRemaining = Math.max(0, b.senateStageDaysRemaining - 1);

      if (b.senateStageDaysRemaining === 0) {
        if (b.senateStage === "vote") {
          const passes = billPassesVote(b.senateSupport, 109);
          b.senateStage = passes ? "passed" : "failed";
          b.senateStageEnteredDay = today;
        } else {
          const next = advanceChamberStage(b.senateStage, b.senateStageEnteredDay, today);
          b.senateStage = next.stage;
          b.senateStageDaysRemaining = next.daysRemaining;
          b.senateStageEnteredDay = next.enteredDay;
        }
      }
    }

    // ── Check outcomes ──
    if (b.houseStage === "failed" || b.senateStage === "failed") {
      newFailedBills.push(b);
      continue;
    }

    if (b.houseStage === "passed" && b.senateStage === "passed") {
      // Move to president's desk
      newPendingSignature.push({ ...b, signingDeadlineDay: today + SIGNING_DEADLINE_DAYS });
      continue;
    }

    newActiveBills.push(b);
  }

  // Enforce active bill cap
  const cappedActiveBills = newActiveBills.slice(0, MAX_ACTIVE_BILLS);

  return {
    ...current,
    activeBills: cappedActiveBills,
    failedBills: newFailedBills,
    pendingSignature: newPendingSignature,
  };
}
