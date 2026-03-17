// client/src/lib/militaryEngine.ts
// Military leadership turn processing engine — pure functions, no mutations.
// Handles 6 military/police leadership positions:
//   - Player appoints at game start
//   - Competence affects security sector effectiveness
//   - Loyalty affects coup risk
//   - Vacancy creates security vacuum

import type {
  MilitaryPosition,
  MilitaryAppointment,
  MilitarySystemState,
  MilitaryCandidate,
  MilitaryPositionId,
} from "./militaryTypes";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
  GameInboxMessage,
} from "./gameTypes";
import { MILITARY_POSITIONS } from "./militaryTypes";
import { MILITARY_CANDIDATES } from "./militaryPool";
import { getZoneForState } from "./zones";

// ── Result type ──

export interface ProcessMilitaryResult {
  updatedMilitary: MilitarySystemState;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
  securityModifier: number;
  stabilityModifier: number;
  coupRiskLevel: number; // 0-100
}

// ── Helpers ──

function mkConsequence(
  id: string,
  source: string,
  description: string,
  effects: Effect[],
  delayDays = 0,
): Consequence {
  return { id, sourceEvent: source, description, effects, delayDays };
}

function mkEffect(target: Effect["target"], delta: number, description: string): Effect {
  return { target, delta, description };
}

// ── 1. seedMilitarySystem ──

function militaryCandidateToCharacter(
  candidate: MilitaryCandidate,
  position: MilitaryPosition,
): CharacterState {
  return {
    name: candidate.name,
    portfolio: position.title,
    competencies: candidate.competencies,
    faction: "Military",
    relationship: candidate.loyalty >= 70 ? "Friendly" : candidate.loyalty >= 50 ? "Neutral" : "Wary",
    avatar: candidate.avatar,
    traits: [...candidate.traits],
    hooks: [],
    biography: candidate.bio,
    education: candidate.education,
    religion: candidate.religion,
    ethnicity: candidate.ethnicity,
    age: candidate.age,
    state: candidate.state,
    gender: candidate.gender,
    title: `${candidate.rank}, ${position.title}`,
    careerHistory: [],
    interactionLog: [],
  };
}

/**
 * Seed the military system — does NOT auto-fill appointments.
 * Returns empty appointments for player to fill at game start.
 * If `autoFill` is true, picks the highest-competence candidate per position.
 */
export function seedMilitarySystem(
  seed: number,
  autoFill = true,
): { state: MilitarySystemState; characters: Record<string, CharacterState> } {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const characters: Record<string, CharacterState> = {};
  const appointments: MilitaryAppointment[] = [];
  const usedCandidates = new Set<string>();

  for (const position of MILITARY_POSITIONS) {
    if (!autoFill) {
      appointments.push({
        positionId: position.id,
        characterName: null,
        appointedDay: 0,
      });
      continue;
    }

    const qualified = MILITARY_CANDIDATES.filter(
      c => c.qualifiedFor.includes(position.id) && !usedCandidates.has(c.name),
    );

    if (qualified.length === 0) {
      appointments.push({
        positionId: position.id,
        characterName: null,
        appointedDay: 0,
      });
      continue;
    }

    // Zone-balanced selection — pick from top candidates with randomness
    const zoneUsage: Record<string, number> = {};
    for (const appt of appointments) {
      if (appt.characterName) {
        const cand = MILITARY_CANDIDATES.find(c => c.name === appt.characterName);
        if (cand) zoneUsage[cand.zone] = (zoneUsage[cand.zone] ?? 0) + 1;
      }
    }

    const sorted = [...qualified].sort((a, b) => {
      // Prefer underrepresented zones, then higher competence
      const zoneDiff = (zoneUsage[a.zone] ?? 0) - (zoneUsage[b.zone] ?? 0);
      if (zoneDiff !== 0) return zoneDiff;
      return b.competence - a.competence;
    });

    const topN = sorted.slice(0, Math.min(3, sorted.length));
    const pick = topN[Math.floor(rng() * topN.length)];

    usedCandidates.add(pick.name);

    const charState = militaryCandidateToCharacter(pick, position);
    characters[pick.name] = charState;

    appointments.push({
      positionId: position.id,
      characterName: pick.name,
      appointedDay: 0,
    });
  }

  return {
    state: {
      positions: MILITARY_POSITIONS,
      appointments,
      coupRisk: 0,
      securityEffectiveness: 50,
    },
    characters,
  };
}

// ── 2. computeMilitaryEffect ──

export interface MilitaryEffectResult {
  securityModifier: number;
  stabilityModifier: number;
  coupRisk: number;
  securityEffectiveness: number;
}

export function computeMilitaryEffect(state: GameState): MilitaryEffectResult {
  const military = state.military;
  let secMod = 0;
  let stabMod = 0;
  let coupRisk = 0;
  let totalSecWeight = 0;
  let effectiveSecWeight = 0;

  for (const appt of military.appointments) {
    const pos = military.positions.find(p => p.id === appt.positionId);
    if (!pos) continue;

    totalSecWeight += pos.securityWeight;

    if (!appt.characterName) {
      // Vacant military position — serious consequences
      secMod -= 0.5 * pos.securityWeight;
      stabMod -= 0.3 * pos.stabilityWeight;
      coupRisk += 10 * pos.coupRiskWeight; // Vacuum invites conspiracies
      continue;
    }

    const character = state.characters[appt.characterName];
    if (!character) continue;

    const competence = character.competencies.professional.security;
    const loyalty = character.competencies.personal.loyalty;

    // Security modifier: competence above 70 helps, below hurts
    const competenceModifier = (competence - 70) / 100;
    secMod += competenceModifier * pos.securityWeight;
    stabMod += competenceModifier * pos.stabilityWeight * 0.5;

    // Coup risk: inversely related to loyalty
    // loyalty < 40 → significant coup risk contribution
    // loyalty > 70 → reduces coup risk
    const loyaltyFactor = (60 - loyalty) / 100; // negative when loyal
    coupRisk += loyaltyFactor * pos.coupRiskWeight * 20;

    effectiveSecWeight += (competence / 100) * pos.securityWeight;
  }

  const securityEffectiveness = totalSecWeight > 0
    ? Math.round((effectiveSecWeight / totalSecWeight) * 100)
    : 30; // Low default if no data

  return {
    securityModifier: Math.round(secMod * 100) / 100,
    stabilityModifier: Math.round(stabMod * 100) / 100,
    coupRisk: Math.max(0, Math.min(100, Math.round(coupRisk))),
    securityEffectiveness: Math.max(0, Math.min(100, securityEffectiveness)),
  };
}

// ── 3. processMilitaryEvents ──

export function processMilitaryEvents(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const currentDay = state.day;

  // Check for vacant positions
  for (const appt of state.military.appointments) {
    if (appt.characterName !== null) continue;

    const pos = state.military.positions.find(p => p.id === appt.positionId);
    if (!pos) continue;

    // Generate urgent event for vacant military leadership
    const eventId = `military-vacancy-${pos.id}-${currentDay}`;
    const existingEventIds = new Set(state.activeEvents.map(e => e.id));
    if (existingEventIds.has(eventId)) continue;

    // Only fire every 14 days to avoid spam
    if (currentDay % 14 !== 0) continue;

    const qualified = MILITARY_CANDIDATES.filter(c =>
      c.qualifiedFor.includes(pos.id) &&
      !state.military.appointments.some(a => a.characterName === c.name),
    );

    const candidates = qualified
      .sort((a, b) => b.competence - a.competence)
      .slice(0, 5);

    if (candidates.length === 0) continue;

    const choices = candidates.map((candidate, idx) => ({
      id: `${eventId}-pick-${idx}`,
      label: `Appoint ${candidate.rank} ${candidate.name}`,
      context: `${candidate.name} (${candidate.state}) — Security: ${candidate.competence}, Loyalty: ${candidate.loyalty}. ${candidate.traits.slice(0, 2).join(", ")}.`,
      consequences: [
        mkConsequence(
          `${eventId}-pick-${idx}-c`,
          eventId,
          `${candidate.name} appointed as ${pos.title}`,
          [
            ...(candidate.competence >= 80
              ? [mkEffect("stability", 1, "Strong military appointment boosts confidence")]
              : []),
            ...(candidate.loyalty < 50
              ? [mkEffect("trust", -1, "Appointment of officer with questionable loyalty raises concerns")]
              : []),
          ],
        ),
      ],
    }));

    events.push({
      id: eventId,
      title: `Vacant: ${pos.title}`,
      severity: "critical",
      description: `The position of ${pos.title} remains vacant. The security establishment is operating without coordinated leadership. The National Security Adviser has urged an immediate appointment.`,
      category: "security",
      source: "cabinet-appointment",
      createdDay: currentDay,
      choices,
    });
  }

  // Random military event (2% per turn)
  if (rng() < 0.02) {
    const filledPositions = state.military.appointments.filter(a => a.characterName);
    if (filledPositions.length > 0) {
      const randomAppt = filledPositions[Math.floor(rng() * filledPositions.length)];
      const pos = state.military.positions.find(p => p.id === randomAppt.positionId);
      const character = state.characters[randomAppt.characterName!];

      if (pos && character) {
        const competence = character.competencies.professional.security;
        const loyalty = character.competencies.personal.loyalty;

        if (competence > 80 && rng() > 0.5) {
          // Positive: successful operation
          const eventId = `military-success-${pos.id}-${currentDay}`;
          inboxMessages.push({
            id: eventId,
            from: pos.title,
            subject: `Operational Success Report`,
            body: `${randomAppt.characterName} reports a successful security operation. Their leadership has improved morale and operational capability within the ${pos.title.replace("Chief, ", "")} command.`,
            priority: "Normal",
            category: "security",
            day: currentDay,
            read: false,
            archived: false,
          } as GameInboxMessage);
        } else if (loyalty < 40 && rng() > 0.7) {
          // Warning: loyalty concern
          const eventId = `military-loyalty-warning-${pos.id}-${currentDay}`;
          events.push({
            id: eventId,
            title: `Security Brief: ${pos.title}`,
            severity: "warning",
            description: `Intelligence reports suggest that ${randomAppt.characterName}, ${pos.title}, has been holding private meetings with political figures outside normal channels. The DSS recommends close monitoring.`,
            category: "security",
            source: "contextual",
            createdDay: currentDay,
            choices: [
              {
                id: `${eventId}-monitor`,
                label: "Increase surveillance",
                context: "Direct the DSS to monitor closely without alerting the officer.",
                consequences: [],
              },
              {
                id: `${eventId}-summon`,
                label: "Summon for a meeting",
                context: "Call them to Aso Rock for a direct conversation about their activities.",
                consequences: [
                  mkConsequence(`${eventId}-summon-c`, eventId, "Military chief summoned", [
                    mkEffect("trust", 1, "Proactive engagement with military leadership"),
                  ]),
                ],
              },
              {
                id: `${eventId}-replace`,
                label: "Begin replacing them quietly",
                context: "Start the process of finding a replacement. This may leak.",
                consequences: [
                  mkConsequence(`${eventId}-replace-c`, eventId, "Military restructuring initiated", [
                    mkEffect("stability", -1, "Military leadership change creates uncertainty"),
                  ]),
                ],
              },
            ],
          });
        }
      }
    }
  }

  return { events, inboxMessages };
}

// ── 4. processMilitary (main entry point) ──

export function processMilitary(
  state: GameState,
  rng: () => number,
): ProcessMilitaryResult {
  // 1. Compute military effect
  const { securityModifier, stabilityModifier, coupRisk, securityEffectiveness } =
    computeMilitaryEffect(state);

  // 2. Process events
  const { events, inboxMessages } = processMilitaryEvents(state, rng);

  // 3. Build consequences
  const consequences: Consequence[] = [];

  // High coup risk warning
  if (coupRisk > 60 && state.day % 30 === 0) {
    consequences.push(
      mkConsequence(
        `military-coup-risk-${state.day}`,
        "military-instability",
        "Military leadership loyalty concerns raise coup risk",
        [
          mkEffect("stability", -2, "Whispered conspiracies undermine governance"),
          mkEffect("trust", -1, "Intelligence agencies report military unrest"),
        ],
      ),
    );
  }

  // Count vacant positions
  const vacantCount = state.military.appointments.filter(a => !a.characterName).length;
  if (vacantCount >= 3 && state.day % 7 === 0) {
    consequences.push(
      mkConsequence(
        `military-vacuum-${state.day}`,
        "military-vacancy",
        `${vacantCount} military leadership positions remain vacant — security vacuum`,
        [
          mkEffect("stability", -1, "Security apparatus lacks coordinated leadership"),
        ],
      ),
    );
  }

  // Update state
  const updatedMilitary: MilitarySystemState = {
    ...state.military,
    coupRisk,
    securityEffectiveness,
  };

  return {
    updatedMilitary,
    newEvents: events,
    consequences,
    inboxMessages,
    securityModifier,
    stabilityModifier,
    coupRiskLevel: coupRisk,
  };
}
