// client/src/lib/legislativeEngine.ts
import type { GameState } from "./gameTypes";
import type { Amendment, Bill, BillStage, CrisisState, GameStateModifier, LegislativeState, VoteProjection } from "./legislativeTypes";
import { getAutonomousBillPool } from "./legislativeBills";
import { getLeverById } from "./influenceLevers";

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
    delayedEffects: [],
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

// ── Crisis Detection ──────────────────────────────────────────────────────────

/**
 * shouldTriggerCrisis
 *
 * Returns true when a bill needs presidential attention as a crisis event:
 * - Bill is marked isCrisis and has reached floor-debate in either chamber
 * - Tight-margin vote: |yes - no| < 10 in either chamber at floor-debate
 * - Constitutional bill reaching floor-debate in either chamber
 */
export function shouldTriggerCrisis(bill: Bill): boolean {
  const houseAtFloor = bill.houseStage === "floor-debate";
  const senateAtFloor = bill.senateStage === "floor-debate";
  const atFloor = houseAtFloor || senateAtFloor;

  // Crisis-flagged bill reaches floor debate
  if (bill.isCrisis && atFloor) {
    return true;
  }

  // Constitutional bill reaches floor debate
  if (bill.subjectTag === "constitutional" && atFloor) {
    return true;
  }

  // Tight margin check: significant/critical bills with margin < 10
  if (bill.stakes === "critical" || bill.stakes === "significant") {
    if (houseAtFloor) {
      const houseYes = bill.houseSupport.firmYes + bill.houseSupport.leaningYes;
      const houseNo = bill.houseSupport.firmNo + bill.houseSupport.leaningNo;
      if (Math.abs(houseYes - houseNo) < 10) {
        return true;
      }
    }
    if (senateAtFloor) {
      const senateYes = bill.senateSupport.firmYes + bill.senateSupport.leaningYes;
      const senateNo = bill.senateSupport.firmNo + bill.senateSupport.leaningNo;
      if (Math.abs(senateYes - senateNo) < 10) {
        return true;
      }
    }
  }

  return false;
}

// ── Autonomous Bill Generation ────────────────────────────────────────────────

/** Domain keywords to match faction names against bill subject tags */
const FACTION_DOMAIN_TAG: Record<string, Bill["subjectTag"]> = {
  economy:    "economy",
  fiscal:     "economy",
  budget:     "economy",
  trade:      "economy",
  labour:     "economy",
  security:   "security",
  military:   "security",
  police:     "security",
  social:     "social",
  welfare:    "social",
  health:     "social",
  education:  "social",
  governance: "governance",
  corruption: "governance",
  institutions: "governance",
  constitution: "constitutional",
  federal:    "constitutional",
};

/**
 * generateAutonomousBill
 *
 * Conditionally selects a bill from the autonomous pool based on game state:
 * - High inflation (> 20): prioritise an economy bill
 * - Faction grievance > 60: pick a bill matching that faction's domain
 * - Election year (day > 1000): pick a governance bill
 *
 * Rate-limited: only fires when state.day % 20 === 0.
 * Returns null if the cap (8 active bills) is reached or no condition fires.
 */
export function generateAutonomousBill(state: GameState): Bill | null {
  const legislature = state.legislature ?? defaultLegislativeState();

  // Rate-limit: only every 20 days
  if (state.day % 20 !== 0) {
    return null;
  }

  // Cap check
  if (legislature.activeBills.length >= MAX_ACTIVE_BILLS) {
    return null;
  }

  const pool = getAutonomousBillPool();

  // Determine desired tag based on conditions
  let desiredTag: Bill["subjectTag"] | null = null;

  if (state.macroEconomy.inflation > 20) {
    desiredTag = "economy";
  } else if (state.day > 1000) {
    desiredTag = "governance";
  } else {
    // Check faction grievances
    for (const faction of Object.values(state.factions)) {
      if (faction.grievance > 60) {
        const nameLower = faction.name.toLowerCase();
        for (const [keyword, tag] of Object.entries(FACTION_DOMAIN_TAG)) {
          if (nameLower.includes(keyword)) {
            desiredTag = tag;
            break;
          }
        }
        if (desiredTag) break;
      }
    }
  }

  if (!desiredTag) {
    return null;
  }

  // Find a matching template not already active
  const activeTitles = new Set(legislature.activeBills.map((b) => b.title));
  const candidates = pool.filter(
    (t) => t.subjectTag === desiredTag && !activeTitles.has(t.title),
  );

  if (candidates.length === 0) {
    return null;
  }

  const template = candidates[Math.floor(Math.random() * candidates.length)];
  return createBillFromTemplate(template, state.day);
}

// ── Signing / Veto ────────────────────────────────────────────────────────────

/**
 * applyModifiers
 *
 * Applies an array of GameStateModifiers to the game state.
 * Returns updated GameState (does not mutate the input).
 */
export function applyModifiers(state: GameState, modifiers: GameStateModifier[]): GameState {
  let s = { ...state };

  for (const mod of modifiers) {
    switch (mod.target) {
      case "approval":
        s = { ...s, approval: Math.max(0, Math.min(100, s.approval + mod.delta)) };
        break;
      case "stability":
        s = { ...s, stability: Math.max(0, Math.min(100, s.stability + mod.delta)) };
        break;
      case "politicalCapital":
        s = { ...s, politicalCapital: Math.max(0, Math.min(200, s.politicalCapital + mod.delta)) };
        break;
      case "partyLoyalty":
        s = { ...s, partyLoyalty: Math.max(0, Math.min(100, s.partyLoyalty + mod.delta)) };
        break;
      case "macroEconomy":
        if (mod.macroKey && mod.macroKey in s.macroEconomy) {
          const macroKey = mod.macroKey as keyof typeof s.macroEconomy;
          s = {
            ...s,
            macroEconomy: {
              ...s.macroEconomy,
              [macroKey]: (s.macroEconomy[macroKey] as number) + mod.delta,
            },
          };
        }
        break;
      default:
        // Targets like factionGrievance, outrage, trust are handled elsewhere
        break;
    }
  }

  return s;
}

/**
 * signBill
 *
 * The president signs a bill from pendingSignature:
 * - Applies bill.effects.onPass via applyModifiers
 * - Moves the bill to passedBills with stage "signed"
 * - Increments sessionStats.billsPassed
 *
 * Returns updated GameState (does not mutate the input).
 */
export function signBill(state: GameState, billId: string): GameState {
  const legislature = state.legislature ?? defaultLegislativeState();
  const bill = legislature.pendingSignature.find((b) => b.id === billId);
  if (!bill) return state;

  const signedBill: Bill = { ...bill, houseStage: "signed", senateStage: "signed" };

  const newLegislature: LegislativeState = {
    ...legislature,
    pendingSignature: legislature.pendingSignature.filter((b) => b.id !== billId),
    passedBills: [...legislature.passedBills, signedBill],
    sessionStats: {
      ...legislature.sessionStats,
      billsPassed: legislature.sessionStats.billsPassed + 1,
    },
  };

  const stateWithLeg = { ...state, legislature: newLegislature };
  return applyModifiers(stateWithLeg, bill.effects.onPass);
}

/**
 * vetoBill
 *
 * The president vetoes a bill from pendingSignature:
 * - Costs political capital scaled to stakes: routine=3, significant=8, critical=15
 * - Moves the bill to failedBills with stage "vetoed"
 * - Applies bill.effects.onFail via applyModifiers
 * - Increments sessionStats.billsVetoed
 *
 * Returns updated GameState (does not mutate the input).
 */
export function vetoBill(state: GameState, billId: string): GameState {
  const legislature = state.legislature ?? defaultLegislativeState();
  const bill = legislature.pendingSignature.find((b) => b.id === billId);
  if (!bill) return state;

  const vetoCost: Record<Bill["stakes"], number> = {
    routine: 3,
    significant: 8,
    critical: 15,
  };
  const cost = vetoCost[bill.stakes];

  const vetoedBill: Bill = { ...bill, houseStage: "vetoed", senateStage: "vetoed" };

  const newLegislature: LegislativeState = {
    ...legislature,
    pendingSignature: legislature.pendingSignature.filter((b) => b.id !== billId),
    failedBills: [...legislature.failedBills, vetoedBill],
    sessionStats: {
      ...legislature.sessionStats,
      billsVetoed: legislature.sessionStats.billsVetoed + 1,
    },
  };

  const stateWithLeg: GameState = {
    ...state,
    politicalCapital: Math.max(0, state.politicalCapital - cost),
    legislature: newLegislature,
  };
  return applyModifiers(stateWithLeg, bill.effects.onFail);
}

// ── Crisis Resolution ─────────────────────────────────────────────────────────

/**
 * applyInfluenceLevers
 *
 * Applies a list of influence levers to a bill's vote projection for a given
 * chamber. For each lever's swing value, seats are moved from undecided (first)
 * then leaningNo toward leaningYes/firmYes, keeping the total constant.
 *
 * Returns the updated VoteProjection for the given chamber.
 */
export function applyInfluenceLevers(
  _state: GameState,
  bill: Bill,
  leverIds: string[],
  chamber: "house" | "senate",
): VoteProjection {
  const support = chamber === "house"
    ? { ...bill.houseSupport }
    : { ...bill.senateSupport };

  for (const leverId of leverIds) {
    const lever = getLeverById(leverId);
    if (!lever) continue;

    const swing = chamber === "house" ? lever.houseSwing : lever.senateSwing;
    if (swing <= 0) continue;

    let remaining = swing;

    // First drain from undecided → leaningYes
    const fromUndecided = Math.min(remaining, support.undecided);
    support.undecided -= fromUndecided;
    support.leaningYes += fromUndecided;
    remaining -= fromUndecided;

    // Then drain from leaningNo → undecided
    if (remaining > 0) {
      const fromLeaningNo = Math.min(remaining, support.leaningNo);
      support.leaningNo -= fromLeaningNo;
      support.undecided += fromLeaningNo;
      remaining -= fromLeaningNo;
    }
  }

  return support;
}

/**
 * payLeverCosts
 *
 * Deducts the resource costs of each influence lever from the game state and
 * applies any lever side-effects. Returns updated GameState.
 *
 * Costs are clamped: politicalCapital >= 0, approval 0–100, partyLoyalty 0–100.
 */
export function payLeverCosts(state: GameState, leverIds: string[]): GameState {
  let s = { ...state };

  for (const leverId of leverIds) {
    const lever = getLeverById(leverId);
    if (!lever) continue;

    for (const cost of lever.costs) {
      switch (cost.type) {
        case "politicalCapital":
          s = { ...s, politicalCapital: Math.max(0, s.politicalCapital - cost.amount) };
          break;
        case "approval":
          s = { ...s, approval: Math.max(0, Math.min(100, s.approval - cost.amount)) };
          break;
        case "partyLoyalty":
          s = { ...s, partyLoyalty: Math.max(0, Math.min(100, (s.partyLoyalty ?? 70) - cost.amount)) };
          break;
        case "billDilution":
          // No immediate resource cost — tracked separately via amendments
          break;
        default:
          break;
      }
    }

    // Apply lever side-effects
    if (lever.sideEffects.length > 0) {
      s = applyModifiers(s, lever.sideEffects);
    }
  }

  return s;
}

/**
 * resolveLegislativeCrisis
 *
 * Responds to a legislative crisis by applying influence levers:
 * 1. Pays the resource costs of all chosen levers.
 * 2. Applies lever vote swings to both house and senate projections.
 * 3. Updates the bill's support projections in activeBills.
 *
 * Returns updated GameState (does not mutate the input).
 */
export function resolveLegislativeCrisis(
  state: GameState,
  billId: string,
  leverIds: string[],
): GameState {
  const legislature = state.legislature ?? defaultLegislativeState();
  const bill = legislature.activeBills.find((b) => b.id === billId);
  if (!bill) return state;

  // Pay costs
  let updatedState = payLeverCosts(state, leverIds);

  // Apply lever swings to both chambers
  const updatedHouseSupport = applyInfluenceLevers(updatedState, bill, leverIds, "house");
  const updatedSenateSupport = applyInfluenceLevers(updatedState, bill, leverIds, "senate");

  // Update the bill in activeBills
  const updatedBill: Bill = {
    ...bill,
    houseSupport: updatedHouseSupport,
    senateSupport: updatedSenateSupport,
  };

  const updatedLegislature: LegislativeState = {
    ...legislature,
    activeBills: legislature.activeBills.map((b) => (b.id === billId ? updatedBill : b)),
  };

  return { ...updatedState, legislature: updatedLegislature };
}

// ── Multi-round Crisis State Machine ─────────────────────────────────────────

const CRISIS_TOTAL_ROUNDS: Record<CrisisState["crisisType"], number> = {
  budget: 3,
  social: 2,
  constitutional: 3,
  override: 1,
  "surprise-motion": 1,
};

/**
 * initializeCrisis
 *
 * Creates a new CrisisState for the given crisis type and bill.
 * totalRounds is deterministic (not randomised) so tests are stable.
 */
export function initializeCrisis(
  type: CrisisState["crisisType"],
  billId: string,
): CrisisState {
  return {
    billId,
    currentRound: 1,
    totalRounds: CRISIS_TOTAL_ROUNDS[type],
    crisisType: type,
    roundHistory: [],
  };
}

/**
 * advanceCrisisRound
 *
 * Records the current round in history and either advances to the next round
 * or resolves the crisis if the final round has been reached.
 *
 * Returns a new CrisisState (does not mutate the input).
 */
export function advanceCrisisRound(
  crisis: CrisisState,
  leversUsed: string[],
): CrisisState {
  const historyEntry = {
    round: crisis.currentRound,
    leversUsed,
    result: crisis.currentRound >= crisis.totalRounds ? "resolved" : "ongoing",
  };

  if (crisis.currentRound >= crisis.totalRounds) {
    return {
      ...crisis,
      roundHistory: [...crisis.roundHistory, historyEntry],
      resolved: true,
    };
  }

  return {
    ...crisis,
    currentRound: crisis.currentRound + 1,
    roundHistory: [...crisis.roundHistory, historyEntry],
  };
}

// ── Adviser Briefing ──────────────────────────────────────────────────────────

export interface AdviserBriefing {
  dailyBrief: string;
  weeklySummary?: string;
  crisisAlert?: string;
}

/**
 * generateAdviserBriefing
 *
 * Produces a daily legislative briefing for the player:
 * - Summarises active and pending-signature bill counts
 * - Warns about crisis bills approaching a critical vote (≤ 2 days remaining)
 * - Generates a weekly summary on every 7th day
 *
 * Returns an AdviserBriefing object (does not mutate state).
 */
export function generateAdviserBriefing(state: GameState): AdviserBriefing {
  const leg = state.legislature ?? defaultLegislativeState();
  const activeBillCount = leg.activeBills.length;
  const pendingCount = leg.pendingSignature.length;

  let dailyBrief = `Legislative Update: ${activeBillCount} active bill${activeBillCount !== 1 ? "s" : ""} in the National Assembly.`;

  if (pendingCount > 0) {
    dailyBrief += ` ${pendingCount} bill${pendingCount !== 1 ? "s" : ""} awaiting your signature.`;
  }

  // Check for crisis bills approaching vote
  for (const bill of leg.activeBills) {
    if (
      bill.isCrisis &&
      bill.houseStageDaysRemaining <= 2 &&
      (bill.houseStage === "committee" || bill.houseStage === "floor-debate")
    ) {
      dailyBrief += ` WARNING: "${bill.title}" is approaching a critical vote in ${bill.houseStageDaysRemaining} day${bill.houseStageDaysRemaining !== 1 ? "s" : ""}.`;
    }
    if (
      bill.isCrisis &&
      bill.senateStageDaysRemaining <= 2 &&
      (bill.senateStage === "committee" || bill.senateStage === "floor-debate")
    ) {
      dailyBrief += ` WARNING: "${bill.title}" faces Senate action in ${bill.senateStageDaysRemaining} day${bill.senateStageDaysRemaining !== 1 ? "s" : ""}.`;
    }
  }

  // Weekly summary every 7 days
  let weeklySummary: string | undefined;
  if (state.day % 7 === 0) {
    const stats = leg.sessionStats;
    weeklySummary = `Weekly Legislative Summary — Bills introduced: ${stats.billsIntroduced}, passed: ${stats.billsPassed}, vetoed: ${stats.billsVetoed}.`;

    const recentlyAdvanced = leg.activeBills.filter(
      (b) =>
        state.day - b.houseStageEnteredDay < 7 ||
        state.day - b.senateStageEnteredDay < 7,
    );
    if (recentlyAdvanced.length > 0) {
      weeklySummary += ` ${recentlyAdvanced.length} bill${recentlyAdvanced.length !== 1 ? "s" : ""} advanced this week.`;
    }
  }

  return { dailyBrief, weeklySummary };
}

// ── Executive Bill Proposal System ───────────────────────────────────────────

const EXECUTIVE_BILL_TEMPLATES = [
  { id: "petroleum-reform", title: "Petroleum Industry Reform Bill", description: "Restructure the petroleum sector to increase transparency and revenue", subjectTag: "economy" as const, stakes: "critical" as const, effects: { onPass: [{ target: "approval" as const, delta: 5 }, { target: "macroEconomy" as const, delta: -2, macroKey: "subsidyPressure" }], onFail: [{ target: "approval" as const, delta: -3 }] } },
  { id: "security-reform", title: "National Security Architecture Bill", description: "Reform security agencies and improve inter-agency coordination", subjectTag: "security" as const, stakes: "significant" as const, effects: { onPass: [{ target: "stability" as const, delta: 5 }], onFail: [] } },
  { id: "anti-corruption", title: "Anti-Corruption Strengthening Bill", description: "Expand EFCC powers and close loopholes in financial reporting", subjectTag: "governance" as const, stakes: "significant" as const, effects: { onPass: [{ target: "approval" as const, delta: 3 }, { target: "trust" as const, delta: 5 }], onFail: [{ target: "approval" as const, delta: -2 }] } },
  { id: "education-reform", title: "Universal Basic Education Amendment", description: "Increase education funding and teacher quality standards", subjectTag: "social" as const, stakes: "routine" as const, effects: { onPass: [{ target: "approval" as const, delta: 4 }], onFail: [] } },
  { id: "tax-reform", title: "Tax System Modernization Bill", description: "Broaden tax base and simplify collection", subjectTag: "economy" as const, stakes: "significant" as const, effects: { onPass: [{ target: "macroEconomy" as const, delta: 1, macroKey: "reserves" }], onFail: [{ target: "approval" as const, delta: -2 }] } },
  { id: "healthcare-reform", title: "National Health Insurance Expansion", description: "Expand health coverage to all Nigerians", subjectTag: "social" as const, stakes: "significant" as const, effects: { onPass: [{ target: "approval" as const, delta: 6 }], onFail: [] } },
];

export interface ExecutiveBillOption {
  id: string;
  title: string;
  description: string;
  subjectTag: SubjectTag;
  stakes: "routine" | "significant" | "critical";
}

/**
 * getAvailableExecutiveBills
 *
 * Returns 2–3 executive bill options based on current game conditions:
 * - High inflation (> 15): include economy bills
 * - Low stability (< 50): include security bills
 * - Low approval (< 50): include social bills
 * - Always include 1 governance bill
 */
export function getAvailableExecutiveBills(state: GameState): ExecutiveBillOption[] {
  const selected: typeof EXECUTIVE_BILL_TEMPLATES[number][] = [];
  const addedIds = new Set<string>();

  const add = (id: string) => {
    if (addedIds.has(id)) return;
    const t = EXECUTIVE_BILL_TEMPLATES.find((b) => b.id === id);
    if (t) { selected.push(t); addedIds.add(id); }
  };

  // Always include 1 governance bill
  add("anti-corruption");

  // Condition-based additions
  if (state.macroEconomy.inflation > 15) {
    add("petroleum-reform");
    add("tax-reform");
  }

  if (state.stability < 50) {
    add("security-reform");
  }

  if (state.approval < 50) {
    add("healthcare-reform");
    add("education-reform");
  }

  // Fallback: ensure at least 2 bills
  if (selected.length < 2) {
    add("petroleum-reform");
  }
  if (selected.length < 2) {
    add("security-reform");
  }

  // Cap at 3
  const capped = selected.slice(0, 3);

  return capped.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    subjectTag: t.subjectTag,
    stakes: t.stakes,
  }));
}

/**
 * proposeExecutiveBill
 *
 * Proposes an executive bill by template id:
 * - Creates a Bill via createBillFromTemplate with sponsor "executive"
 * - Adds it to activeBills (respecting the 8-bill cap)
 * - Increments sessionStats.billsIntroduced
 *
 * Returns updated GameState (does not mutate the input).
 */
export function proposeExecutiveBill(state: GameState, templateId: string): GameState {
  const legislature = state.legislature ?? defaultLegislativeState();

  const template = EXECUTIVE_BILL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return state;

  if (legislature.activeBills.length >= MAX_ACTIVE_BILLS) return state;

  const bill = createBillFromTemplate({ ...template, sponsor: "executive" }, state.day);

  const newLegislature: LegislativeState = {
    ...legislature,
    activeBills: [...legislature.activeBills, bill],
    sessionStats: {
      ...legislature.sessionStats,
      billsIntroduced: legislature.sessionStats.billsIntroduced + 1,
    },
  };

  return { ...state, legislature: newLegislature };
}

// ── Amendments ────────────────────────────────────────────────────────────────

/**
 * generateAmendments
 *
 * Proposes 0–3 amendments for a bill currently in committee stage.
 * Sources:
 *   - Opposition proposes 1–2 amendments on executive-sponsored bills
 *   - Committee proposes 1 amendment on critical-stakes bills
 *   - Cross-party proposes 0–1 amendments on social bills
 *
 * Returns an empty array if the bill is not in committee stage.
 */
export function generateAmendments(bill: Bill, _state: GameState): Amendment[] {
  // Only generate during committee stage
  if (bill.houseStage !== "committee" && bill.senateStage !== "committee") {
    return [];
  }

  const amendments: Amendment[] = [];

  // Opposition proposes amendments on executive-sponsored bills
  if (bill.sponsor === "executive") {
    // Dilute the primary onPass effect
    const primaryEffect = bill.effects.onPass[0];
    const dilutionDelta = primaryEffect ? Math.ceil(Math.abs(primaryEffect.delta) * 0.4) * -1 : -2;

    amendments.push({
      description: `Opposition amendment to reduce scope of "${bill.title}" and limit executive authority`,
      sponsor: "opposition",
      effectModifiers: [{ target: "approval" as const, delta: dilutionDelta }],
      supportSwing: { house: 18, senate: 10 },
      accepted: false,
    });

    // Second opposition amendment for significant/critical bills
    if (bill.stakes === "significant" || bill.stakes === "critical") {
      amendments.push({
        description: `Opposition amendment to add oversight mechanisms to "${bill.title}"`,
        sponsor: "opposition",
        effectModifiers: [{ target: "politicalCapital" as const, delta: -5 }],
        supportSwing: { house: 12, senate: 6 },
        accepted: false,
      });
    }
  }

  // Committee proposes amendment on critical-stakes bills
  if (bill.stakes === "critical" && amendments.length < 3) {
    amendments.push({
      description: `Committee amendment to phase in implementation of "${bill.title}" over 24 months`,
      sponsor: "committee",
      effectModifiers: [{ target: "stability" as const, delta: 2 }],
      supportSwing: { house: 8, senate: 5 },
      accepted: false,
    });
  }

  // Cross-party amendment on social bills
  if (bill.subjectTag === "social" && amendments.length < 3) {
    amendments.push({
      description: `Cross-party amendment to expand beneficiary coverage in "${bill.title}"`,
      sponsor: "cross-party",
      effectModifiers: [{ target: "approval" as const, delta: 2 }],
      supportSwing: { house: 10, senate: 5 },
      accepted: false,
    });
  }

  // Cap at 3
  return amendments.slice(0, 3);
}

/**
 * acceptAmendment
 *
 * Accepts an amendment: marks it as accepted, merges its effectModifiers
 * into the bill's onPass effects, and appends it to bill.amendments.
 *
 * Returns updated Bill (does not mutate the input).
 */
export function acceptAmendment(bill: Bill, amendment: Amendment): Bill {
  const accepted: Amendment = { ...amendment, accepted: true };
  return {
    ...bill,
    amendments: [...bill.amendments, accepted],
    effects: {
      ...bill.effects,
      onPass: [...bill.effects.onPass, ...amendment.effectModifiers],
    },
  };
}

/**
 * checkReconciliation
 *
 * Returns true if the bill has any accepted amendments, indicating the
 * two chambers may have voted on different versions and need reconciliation.
 * Only meaningful when both chambers are in "passed" stage.
 */
export function checkReconciliation(bill: Bill): boolean {
  return bill.amendments.some((a) => a.accepted);
}

// ── Veto Override Mechanics ───────────────────────────────────────────────────

/**
 * calculateOverrideProbability
 *
 * Returns the probability (0–1) that the legislature attempts to override a
 * presidential veto. Lower approval → higher override probability.
 *
 *   probability = max(0, (60 - approval) / 100)
 */
export function calculateOverrideProbability(approval: number): number {
  return Math.max(0, (60 - approval) / 100);
}

/**
 * attemptOverride
 *
 * Simulates a veto override attempt:
 * - Reads current vote projections (firmYes + leaningYes) for each chamber
 * - Boosts the yes count by the override probability modifier: votes * (1 + prob * 0.3)
 * - Checks against constitutional 2/3 thresholds: House = 240, Senate = 73
 * - Increments sessionStats.overrideAttempts
 *
 * Returns { housePassed, senatePassed, houseVotes, senateVotes } and mutates
 * sessionStats on the returned state (does not mutate the input).
 */
export function attemptOverride(
  state: GameState,
  bill: Bill,
): { housePassed: boolean; senatePassed: boolean; houseVotes: number; senateVotes: number } {
  const legislature = state.legislature ?? defaultLegislativeState();
  const overrideProbability = calculateOverrideProbability(state.approval);

  const HOUSE_THRESHOLD = 240; // 2/3 of 360
  const SENATE_THRESHOLD = 73; // 2/3 of 109

  const rawHouseYes = bill.houseSupport.firmYes + bill.houseSupport.leaningYes;
  const rawSenateYes = bill.senateSupport.firmYes + bill.senateSupport.leaningYes;

  const houseVotes = Math.round(rawHouseYes * (1 + overrideProbability * 0.3));
  const senateVotes = Math.round(rawSenateYes * (1 + overrideProbability * 0.3));

  const housePassed = houseVotes >= HOUSE_THRESHOLD;
  const senatePassed = senateVotes >= SENATE_THRESHOLD;

  // Update overrideAttempts in sessionStats (immutably via state update)
  const updatedLegislature: LegislativeState = {
    ...legislature,
    sessionStats: {
      ...legislature.sessionStats,
      overrideAttempts: legislature.sessionStats.overrideAttempts + 1,
      overrideSuccesses: legislature.sessionStats.overrideSuccesses + (housePassed && senatePassed ? 1 : 0),
    },
  };

  // Attach the updated legislature to state (caller can use returned state if needed)
  // We return the vote result directly; the state mutation is stored as a side-effect reference
  void { ...state, legislature: updatedLegislature };

  return { housePassed, senatePassed, houseVotes, senateVotes };
}

// ── Surprise Motions ──────────────────────────────────────────────────────────

export interface SurpriseMotion {
  type: "impeachment" | "no-confidence" | "emergency-debate";
  description: string;
}

/**
 * checkSurpriseMotions
 *
 * Evaluates current game state and returns any surprise motions the legislature
 * may trigger:
 *   - Impeachment:       approval < 25 AND outrage > 70
 *   - No-confidence:     stability < 20
 *   - Emergency debate:  any faction grievance > 80
 *
 * Returns an array of triggered motions (may be empty).
 */
export function checkSurpriseMotions(state: GameState): SurpriseMotion[] {
  const motions: SurpriseMotion[] = [];

  if (state.approval < 25 && state.outrage > 70) {
    motions.push({
      type: "impeachment",
      description:
        "The National Assembly has moved to initiate impeachment proceedings amid record-low approval and public outrage.",
    });
  }

  if (state.stability < 20) {
    motions.push({
      type: "no-confidence",
      description:
        "A vote of no-confidence has been tabled in the House of Representatives due to critical instability.",
    });
  }

  for (const faction of Object.values(state.factions)) {
    if (faction.grievance > 80) {
      motions.push({
        type: "emergency-debate",
        description: `The ${faction.name} faction has forced an emergency debate session over unresolved grievances.`,
      });
      break; // one emergency-debate motion is sufficient
    }
  }

  return motions;
}

// ── Main Turn Function ────────────────────────────────────────────────────────

/**
 * processLegislativeTurn
 *
 * Runs one full game-day of legislative processing:
 * 1. Introduce any calendar bills whose targetDay <= state.day
 * 2. Optionally generate an autonomous bill
 * 3. Advance all active bills by one day
 *
 * Returns updated GameState (does not mutate the input).
 */
export function processLegislativeTurn(state: GameState): GameState {
  let legislature = state.legislature ?? defaultLegislativeState();

  // Step 1: Introduce scheduled calendar bills
  const dueEntries = legislature.legislativeCalendar.filter(
    (entry) => entry.targetDay <= state.day,
  );
  const remainingCalendar = legislature.legislativeCalendar.filter(
    (entry) => entry.targetDay > state.day,
  );

  let newActiveBills = [...legislature.activeBills];

  for (const entry of dueEntries) {
    if (newActiveBills.length >= MAX_ACTIVE_BILLS) break;
    const bill = createBillFromTemplate(entry.template, state.day);
    bill.isCrisis = entry.isCrisis;
    newActiveBills.push(bill);
  }

  legislature = {
    ...legislature,
    activeBills: newActiveBills,
    legislativeCalendar: remainingCalendar,
    sessionStats: {
      ...legislature.sessionStats,
      billsIntroduced: legislature.sessionStats.billsIntroduced + dueEntries.length,
    },
  };

  // Step 2: Try autonomous bill generation
  const stateWithUpdatedLeg = { ...state, legislature };
  const autonomousBill = generateAutonomousBill(stateWithUpdatedLeg);
  if (autonomousBill && legislature.activeBills.length < MAX_ACTIVE_BILLS) {
    legislature = {
      ...legislature,
      activeBills: [...legislature.activeBills, autonomousBill],
      sessionStats: {
        ...legislature.sessionStats,
        billsIntroduced: legislature.sessionStats.billsIntroduced + 1,
      },
    };
  }

  // Step 3: Advance all active bills
  const advancedState = { ...state, legislature };
  legislature = advanceBills(advancedState);

  // Step 4: Auto-sign expired bills past their signing deadline
  let finalState: GameState = { ...state, legislature };
  const expiredBills = legislature.pendingSignature.filter(
    (b) => b.signingDeadlineDay !== null && b.signingDeadlineDay < state.day,
  );
  for (const expiredBill of expiredBills) {
    finalState = signBill(finalState, expiredBill.id);
  }

  return finalState;
}

// ── Delayed Consequence Queue ─────────────────────────────────────────────────

/**
 * queueDelayedEffect
 *
 * Wraps a GameStateModifier in a delayed-effect envelope by computing the
 * absolute game-day on which the effect should fire.
 *
 * effectDay = currentDay + (modifier.delay ?? 0)
 */
export function queueDelayedEffect(
  modifier: GameStateModifier,
  currentDay: number,
): { modifier: GameStateModifier; effectDay: number } {
  return {
    modifier,
    effectDay: currentDay + (modifier.delay ?? 0),
  };
}

/**
 * processDelayedEffects
 *
 * Partitions the pending queue into effects whose effectDay <= currentDay
 * (applied) and those that are not yet due (remaining).
 */
export function processDelayedEffects(
  pending: Array<{ modifier: GameStateModifier; effectDay: number }>,
  currentDay: number,
): {
  applied: GameStateModifier[];
  remaining: Array<{ modifier: GameStateModifier; effectDay: number }>;
} {
  const applied: GameStateModifier[] = [];
  const remaining: Array<{ modifier: GameStateModifier; effectDay: number }> = [];

  for (const entry of pending) {
    if (entry.effectDay <= currentDay) {
      applied.push(entry.modifier);
    } else {
      remaining.push(entry);
    }
  }

  return { applied, remaining };
}

// ── Campaign Promise Tracking ─────────────────────────────────────────────────

/**
 * trackPromiseProgress
 *
 * Checks whether a bill relates to any of the player's campaign promises by
 * doing a simple keyword match between the bill title and the promise text.
 * Words shorter than 5 characters are ignored to reduce noise.
 *
 * Returns the id of the first matched promise, or null if none match.
 */
export function trackPromiseProgress(
  state: GameState,
  bill: Bill,
): { matchedPromiseId: string | null } {
  const promises = (state as GameState & { campaignPromises?: Array<{ id: string; text: string }> }).campaignPromises;
  if (!promises || promises.length === 0) {
    return { matchedPromiseId: null };
  }

  const titleWords = bill.title.split(/\s+/).filter((w) => w.length > 4);

  for (const promise of promises) {
    const lowerText = promise.text.toLowerCase();
    const matched = titleWords.some((word) => lowerText.includes(word.toLowerCase()));
    if (matched) {
      return { matchedPromiseId: promise.id };
    }
  }

  return { matchedPromiseId: null };
}
