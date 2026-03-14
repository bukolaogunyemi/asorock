import type { GameState, ActiveEvent, EventChoice, Consequence, Effect, PolicyLeverKey } from "./gameTypes";
import type {
  FactionProfile,
  FactionTemperament,
  DemandTemplate,
  DemandChoiceArchetype,
} from "./factionProfiles";
import {
  FACTION_PROFILES,
  GRIEVANCE_THRESHOLDS,
  GRIEVANCE_DECAY_RATE,
  POLICY_FAVOR_BONUS,
  POLICY_OPPOSE_PENALTY,
  MACRO_SENSITIVITY_SCALE,
  AMBIENT_APPROVAL_WEIGHT,
  AMBIENT_STABILITY_WEIGHT,
  THRESHOLD_REARM_BUFFER,
  TEMPERAMENT_MODIFIERS,
} from "./factionProfiles";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// ── Layer 1: Policy Alignment ───────────────────────────
function computePolicyLayer(profile: FactionProfile, state: GameState): number {
  let sum = 0;
  for (const pref of profile.policyPreferences) {
    // leverKey is typed as PolicyLeverKey|string in the profile interface;
    // guard handles any unknown keys gracefully at runtime.
    const leverState = state.policyLevers[pref.leverKey as PolicyLeverKey];
    if (!leverState) continue;
    const pos = leverState.position;
    if (pref.favored.includes(pos)) {
      sum += pref.weight * POLICY_FAVOR_BONUS;
    } else if (pref.opposed.includes(pos)) {
      sum -= pref.weight * POLICY_OPPOSE_PENALTY;
    }
  }
  return sum;
}

// ── Layer 2: Macro Satisfaction ──────────────────────────
function computeMacroLayer(profile: FactionProfile, state: GameState): number {
  let sum = 0;
  for (const sens of profile.macroSensitivities) {
    const current = state.macroEconomy[sens.key];
    sum -= Math.abs(current - sens.ideal) * sens.weight * MACRO_SENSITIVITY_SCALE;
  }
  return sum;
}

// ── Layer 3: Ambient Political Climate ──────────────────
function computeAmbientLayer(state: GameState): number {
  return (state.approval - 50) * AMBIENT_APPROVAL_WEIGHT + (state.stability - 50) * AMBIENT_STABILITY_WEIGHT;
}

// ── Main Drift Function ─────────────────────────────────
export function computeFactionDrift(profile: FactionProfile, state: GameState): number {
  const mods = TEMPERAMENT_MODIFIERS[profile.temperament];

  const layer1 = computePolicyLayer(profile, state) * mods.layer1Multiplier;
  const layer2 = computeMacroLayer(profile, state) * mods.layer23Multiplier;
  const layer3 = computeAmbientLayer(state) * mods.layer23Multiplier;

  const rawDelta = layer1 + layer2 + layer3;
  return rawDelta * mods.driftMultiplier * profile.loyaltyInertia;
}

// ── Grievance Update ────────────────────────────────────
export function updateGrievance(
  currentGrievance: number,
  driftDelta: number,
  temperament: FactionTemperament,
): number {
  const mods = TEMPERAMENT_MODIFIERS[temperament];
  let newGrievance = currentGrievance;

  if (driftDelta < 0) {
    // Negative drift increases grievance
    newGrievance += Math.abs(driftDelta) * mods.grievanceRate;
  } else if (driftDelta > 0) {
    // Positive drift slowly decays grievance
    const decayRate = GRIEVANCE_DECAY_RATE * mods.decayMultiplier;
    newGrievance -= driftDelta * decayRate;
  }

  return clamp(Math.round(newGrievance * 100) / 100, 0, 100);
}

// ── Grievance Threshold Checking ────────────────────────
export interface ThresholdCheckResult {
  firedThresholds: number[];
  events: ActiveEvent[];
  advisorLine: string | null;
  breakingPointConsequences: Consequence | null;
}

export function checkGrievanceThresholds(
  factionKey: string,
  grievance: number,
  previouslyFired: number[],
  currentDay: number,
): ThresholdCheckResult {
  const profile = FACTION_PROFILES.find((p) => p.key === factionKey);
  if (!profile) return { firedThresholds: previouslyFired, events: [], advisorLine: null, breakingPointConsequences: null };

  // Re-arm thresholds: remove from fired list if grievance dropped 10+ below
  const firedThresholds = previouslyFired.filter(
    (threshold) => grievance >= threshold - THRESHOLD_REARM_BUFFER,
  );

  const events: ActiveEvent[] = [];
  let advisorLine: string | null = null;
  let breakingPointConsequences: Consequence | null = null;

  for (const threshold of GRIEVANCE_THRESHOLDS) {
    if (grievance < threshold) continue;
    if (firedThresholds.includes(threshold)) continue;

    firedThresholds.push(threshold);
    const template = profile.demandTemplates.find((t) => t.grievanceLevel === threshold);
    if (!template) continue;

    if (threshold === 20) {
      // Whisper: advisor line only, no event
      advisorLine = template.description.replace(/\{faction\}/g, factionKey);
    } else if (threshold === 100) {
      // Breaking point: direct consequences + reactive event
      breakingPointConsequences = buildBreakingPointConsequence(factionKey, currentDay);
      const reactiveEvent = hydrateDemandEvent(template, factionKey, currentDay);
      events.push(reactiveEvent);
    } else {
      // Tiers 40, 70, 90: standard demand events
      events.push(hydrateDemandEvent(template, factionKey, currentDay));
    }
  }

  return { firedThresholds, events, advisorLine, breakingPointConsequences };
}

// ── Breaking Point Consequence ──────────────────────────
function buildBreakingPointConsequence(factionKey: string, day: number): Consequence {
  return {
    id: `breaking-point-${factionKey}-${day}`,
    sourceEvent: `faction-demand-${factionKey}-100`,
    delayDays: 0,
    description: `The ${factionKey} has reached a breaking point — irreversible action taken.`,
    effects: [
      { target: "faction", factionName: factionKey, delta: -20, description: `${factionKey} loyalty collapses` },
      { target: "stability", delta: -10, description: "Political crisis destabilizes the nation" },
      { target: "approval", delta: -8, description: "Public confidence shaken by faction crisis" },
      { target: "grievance", factionName: factionKey, delta: -15, description: "Breaking point partially vents grievance" },
    ],
  };
}

// ── Event Hydration ─────────────────────────────────────
export function hydrateDemandEvent(
  template: DemandTemplate,
  factionName: string,
  createdDay: number,
): ActiveEvent {
  const choices: EventChoice[] = template.choiceArchetypes.map((arch) =>
    hydrateChoice(arch, factionName, template.grievanceLevel, createdDay),
  );

  return {
    id: `faction-demand-${factionName}-${template.grievanceLevel}-d${createdDay}`,
    title: template.title.replace(/\{faction\}/g, factionName),
    severity: template.grievanceLevel >= 90 ? "critical" : template.grievanceLevel >= 70 ? "warning" : "info",
    description: template.description.replace(/\{faction\}/g, factionName),
    category: "politics",
    source: "faction-demand",
    factionKey: factionName,
    choices,
    createdDay,
    expiresInDays: template.deadlineDays > 0 ? template.deadlineDays : undefined,
  };
}

function hydrateChoice(
  arch: DemandChoiceArchetype,
  factionName: string,
  grievanceLevel: number,
  day: number,
): EventChoice {
  const effects: Effect[] = [
    { target: "faction", factionName, delta: arch.loyaltyDelta, description: `${factionName} loyalty shift` },
    { target: "grievance", factionName, delta: arch.grievanceDelta, description: `${factionName} grievance shift` },
    { target: "politicalCapital", delta: arch.pcDelta, description: "Political capital cost" },
  ];

  if (arch.approvalDelta) {
    effects.push({ target: "approval", delta: arch.approvalDelta, description: "Public approval impact" });
  }
  if (arch.stabilityDelta) {
    effects.push({ target: "stability", delta: arch.stabilityDelta, description: "Stability impact" });
  }

  const consequences: Consequence[] = [
    {
      id: `fd-${factionName}-${grievanceLevel}-${arch.id}`,
      sourceEvent: `faction-demand-${factionName}-${grievanceLevel}`,
      delayDays: 0,
      effects,
      description: arch.context,
    },
  ];

  if (arch.triggerChainEvent) {
    consequences.push({
      id: `fd-chain-${factionName}-${grievanceLevel}-${arch.id}`,
      sourceEvent: `faction-demand-${factionName}-${grievanceLevel}`,
      delayDays: 7,
      effects: [
        { target: "stability", delta: -5, description: `Fallout from ${factionName} confrontation` },
        { target: "approval", delta: -3, description: "Crisis deepens public concern" },
      ],
      description: `The confrontation with ${factionName} has lasting consequences.`,
    });
  }

  return {
    id: arch.id,
    label: arch.label,
    context: arch.context,
    requirements: arch.requirements,
    consequences,
  };
}
