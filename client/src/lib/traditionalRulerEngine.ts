// client/src/lib/traditionalRulerEngine.ts
// Traditional ruler system engine — pure functions, no mutations.
// Traditional rulers are auto-filled and NOT appointed/removed by player.
// Player can interact with them (audience, consult, etc.)
// Their disposition affects zone stability and approval.

import type {
  TraditionalRulerPosition,
  TraditionalRulerAppointment,
  TraditionalRulerSystemState,
  TraditionalRulerCandidate,
} from "./traditionalRulerTypes";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
  GameInboxMessage,
} from "./gameTypes";
import { TRADITIONAL_RULER_POSITIONS } from "./traditionalRulerTypes";
import { TRADITIONAL_RULER_CANDIDATES } from "./traditionalRulerPool";

// ── Result type ──

export interface ProcessTraditionalRulersResult {
  updatedTraditionalRulers: TraditionalRulerSystemState;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
  royalCouncilSupport: number;
}

// ── Helpers ──

function mkConsequence(
  id: string, source: string, description: string, effects: Effect[], delayDays = 0,
): Consequence {
  return { id, sourceEvent: source, description, effects, delayDays };
}

function mkEffect(target: Effect["target"], delta: number, description: string): Effect {
  return { target, delta, description };
}

// ── 1. seedTraditionalRulers ──

function candidateToCharacter(
  candidate: TraditionalRulerCandidate,
  position: TraditionalRulerPosition,
): CharacterState {
  const relationship = candidate.disposition === "supportive" ? "Friendly"
    : candidate.disposition === "neutral" ? "Neutral"
    : "Wary";
  return {
    name: candidate.name,
    portfolio: position.title,
    competencies: candidate.competencies,
    faction: "Traditional Institution",
    relationship,
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
    title: position.title,
    careerHistory: [],
    interactionLog: [],
  };
}

/**
 * Seed all 50 traditional ruler positions.
 * Picks 1 candidate per position (highest influence, with RNG variation).
 */
export function seedTraditionalRulers(
  seed: number,
): { state: TraditionalRulerSystemState; characters: Record<string, CharacterState> } {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const characters: Record<string, CharacterState> = {};
  const appointments: TraditionalRulerAppointment[] = [];
  const usedNames = new Set<string>();

  for (const position of TRADITIONAL_RULER_POSITIONS) {
    const qualified = TRADITIONAL_RULER_CANDIDATES.filter(
      c => c.qualifiedFor.includes(position.id) && !usedNames.has(c.name),
    );

    if (qualified.length === 0) continue;

    // Sort by influence with some randomness
    const sorted = [...qualified].sort((a, b) => {
      return (b.influence + rng() * 15) - (a.influence + rng() * 15);
    });

    const pick = sorted[0];
    usedNames.add(pick.name);

    const charState = candidateToCharacter(pick, position);
    characters[pick.name] = charState;

    appointments.push({
      positionId: position.id,
      characterName: pick.name,
      appointedDay: 0,
    });
  }

  return {
    state: {
      positions: TRADITIONAL_RULER_POSITIONS,
      appointments,
      royalCouncilSupport: 50,
    },
    characters,
  };
}

// ── 2. computeRoyalCouncilSupport ──

export function computeRoyalCouncilSupport(state: GameState): number {
  const rulers = state.traditionalRulers;
  let supportScore = 0;
  let totalWeight = 0;

  for (const appt of rulers.appointments) {
    const pos = rulers.positions.find(p => p.id === appt.positionId);
    if (!pos) continue;

    const character = state.characters[appt.characterName];
    if (!character) continue;

    totalWeight += pos.influenceWeight;

    // Disposition-based support
    const relationship = character.relationship;
    let dispositionScore: number;
    if (relationship === "Loyal" || relationship === "Friendly") dispositionScore = 80;
    else if (relationship === "Neutral") dispositionScore = 50;
    else if (relationship === "Wary") dispositionScore = 30;
    else dispositionScore = 10;

    supportScore += dispositionScore * pos.influenceWeight;
  }

  return totalWeight > 0
    ? Math.round(supportScore / totalWeight)
    : 50;
}

// ── Helpers — audience topic ──

function getAudienceTopic(pos: TraditionalRulerPosition, state: GameState): string {
  // Zone stability check
  if (state.stability < 40) {
    return `security concerns in the ${pos.zone === "NW" ? "Northwest" : pos.zone === "NE" ? "Northeast" : pos.zone === "NC" ? "North-Central" : pos.zone === "SW" ? "Southwest" : pos.zone === "SE" ? "Southeast" : "South-South"}`;
  }
  // Agriculture sector check
  if (state.agriculture && state.agriculture.health < 50) {
    return `the farming crisis affecting ${pos.state}`;
  }
  // Default topics by zone
  if (pos.zone === "NW" || pos.zone === "NE") return `security in the ${pos.zone === "NW" ? "Northwest" : "Northeast"}`;
  if (pos.zone === "SS") return "development in the Niger Delta";
  return `governance and development in ${pos.state}`;
}

function mkInbox(
  id: string, sender: string, role: string, subject: string,
  fullText: string, day: number, priority: "Normal" | "Urgent" | "Critical" = "Normal",
): GameInboxMessage {
  const initials = sender.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return {
    id,
    sender,
    role,
    initials,
    subject,
    preview: fullText.slice(0, 120),
    fullText,
    day,
    priority,
    read: false,
    source: "system",
  };
}

// ── 3. generateAudienceEvents (Task 10) ──

/**
 * Generate royal audience request events for paramount and first-class rulers.
 * Paramount rulers (influenceWeight >= 0.9): 5% chance per turn.
 * First-class rulers (influenceWeight >= 0.6 and < 0.9): 2% chance per turn.
 * Second-class rulers: skip (aggregate only).
 */
export function generateAudienceEvents(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;
  const rulers = state.traditionalRulers;

  for (const appt of rulers.appointments) {
    if (!appt.characterName) continue;
    const pos = rulers.positions.find(p => p.id === appt.positionId);
    if (!pos) continue;

    // Determine chance based on tier
    let chance = 0;
    if (pos.influenceWeight >= 0.9) {
      chance = 0.05; // paramount
    } else if (pos.influenceWeight >= 0.6) {
      chance = 0.02; // first-class
    } else {
      continue; // second-class — skip
    }

    if (rng() >= chance) continue;

    const character = state.characters[appt.characterName];
    if (!character) continue;

    const topic = getAudienceTopic(pos, state);
    const eventId = `royal-audience-${pos.id}-${currentDay}`;

    events.push({
      id: eventId,
      title: `Royal Audience Request: ${pos.title}`,
      severity: pos.tier === "paramount" ? "warning" : "info",
      description: `The ${pos.title} requests a royal audience to discuss ${topic}. This is a significant diplomatic gesture that requires presidential attention.`,
      category: "politics",
      source: "contextual",
      createdDay: currentDay,
      choices: [
        {
          id: `${eventId}-grant`,
          label: "Grant Audience",
          context: `Receive the ${pos.title} at Aso Rock. A sign of deep respect for traditional institutions.`,
          consequences: [
            mkConsequence(`${eventId}-grant-c`, eventId, "Royal audience granted", [
              mkEffect("character", 8, `Relationship with ${appt.characterName} strengthened`),
              mkEffect("approval", 2, `Approval boost in ${pos.zone} zone`),
              mkEffect("politicalCapital", -1, "Political capital spent on audience"),
            ]),
          ],
        },
        {
          id: `${eventId}-proxy`,
          label: "Send Proxy",
          context: "Send the Chief of Staff or SGF to attend on your behalf.",
          consequences: [
            mkConsequence(`${eventId}-proxy-c`, eventId, "Proxy sent to royal audience", [
              mkEffect("character", 3, `Modest goodwill from ${appt.characterName}`),
            ]),
          ],
        },
        {
          id: `${eventId}-decline`,
          label: "Decline",
          context: "The President's schedule does not allow for this meeting.",
          consequences: [
            mkConsequence(`${eventId}-decline-c`, eventId, "Royal audience declined", [
              mkEffect("character", -10, `${appt.characterName} feels disrespected`),
              mkEffect("approval", -1, `Disapproval in ${pos.zone} zone`),
            ]),
          ],
        },
      ],
    });

    // Only generate one audience event per turn to avoid flooding
    break;
  }

  return { events, inboxMessages, consequences };
}

// ── 3b. processStateVisit (Task 11) ──

/**
 * Process a player-initiated state visit to a traditional ruler.
 * Pure function — checks 14-day cooldown per ruler.
 * Returns updated state slice + events/consequences.
 */
export function processStateVisit(
  state: GameState,
  rulerId: string,
): { updatedTraditionalRulers: TraditionalRulerSystemState; events: ActiveEvent[]; consequences: Consequence[]; inboxMessages: GameInboxMessage[] } {
  const rulers = state.traditionalRulers;
  const appt = rulers.appointments.find(a => a.positionId === rulerId);
  const pos = rulers.positions.find(p => p.id === rulerId);
  const events: ActiveEvent[] = [];
  const consequences: Consequence[] = [];
  const inboxMessages: GameInboxMessage[] = [];

  if (!appt || !pos || !appt.characterName) {
    return { updatedTraditionalRulers: rulers, events, consequences, inboxMessages };
  }

  const character = state.characters[appt.characterName];
  if (!character) {
    return { updatedTraditionalRulers: rulers, events, consequences, inboxMessages };
  }

  // 14-day cooldown check
  const lastVisitDay = appt.lastStateVisitDay ?? 0;
  if (state.day - lastVisitDay < 14) {
    return { updatedTraditionalRulers: rulers, events, consequences, inboxMessages };
  }

  const currentDay = state.day;
  const visitId = `state-visit-${rulerId}-${currentDay}`;

  // Core visit effects
  const visitEffects: Effect[] = [
    mkEffect("character", 12, `Strong bond formed with ${appt.characterName}`),
    mkEffect("approval", 3, `Approval boost in ${pos.zone} zone`),
    mkEffect("politicalCapital", -2, "Political capital spent on state visit"),
  ];

  // Stability boost if zone stability is low
  if (state.stability < 50) {
    visitEffects.push(mkEffect("stability", 2, `Stability improved in ${pos.zone} after presidential visit`));
  }

  consequences.push(
    mkConsequence(visitId, "state-visit", `Presidential visit to ${pos.title}`, visitEffects),
  );

  // Endorsement bonus if relationship > 70 (Friendly or Loyal maps to high numeric)
  const relScore = character.relationship === "Loyal" ? 90 : character.relationship === "Friendly" ? 75 : character.relationship === "Neutral" ? 50 : 25;
  if (relScore > 70) {
    const endorsementId = `endorsement-${rulerId}-${currentDay}`;
    consequences.push(
      mkConsequence(endorsementId, "state-visit-endorsement", `${appt.characterName} publicly endorses the administration`, [
        mkEffect("approval", 4, `National approval boost from ${pos.title} endorsement — lasts 30 days`),
      ]),
    );

    inboxMessages.push(
      mkInbox(
        `endorsement-msg-${rulerId}-${currentDay}`,
        appt.characterName,
        pos.title,
        "Royal Endorsement After Presidential Visit",
        `Following your visit, ${appt.characterName}, the ${pos.title}, has issued a public endorsement of the administration. Their words carry significant weight across ${pos.state} and the broader ${pos.zone} zone. This endorsement is expected to boost national approval.`,
        currentDay,
      ),
    );
  }

  // Update the appointment with the visit day
  const updatedAppointments = rulers.appointments.map(a =>
    a.positionId === rulerId ? { ...a, lastStateVisitDay: currentDay } : a,
  );

  return {
    updatedTraditionalRulers: { ...rulers, appointments: updatedAppointments },
    events,
    consequences,
    inboxMessages,
  };
}

// ── 3c. generatePublicStatements (Task 11) ──

/**
 * Each turn, paramount and first-class rulers may issue public statements.
 * - Relationship > 75 (Friendly/Loyal): 3% chance → public endorsement
 * - Relationship < 25 (Wary/Distrustful/Hostile): 5% chance → public criticism
 */
export function generatePublicStatements(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;
  const rulers = state.traditionalRulers;

  for (const appt of rulers.appointments) {
    if (!appt.characterName) continue;
    const pos = rulers.positions.find(p => p.id === appt.positionId);
    if (!pos) continue;
    // Only paramount and first-class rulers issue public statements
    if (pos.tier === "second-class") continue;

    const character = state.characters[appt.characterName];
    if (!character) continue;

    const isSupportive = character.relationship === "Loyal" || character.relationship === "Friendly";
    const isCritical = character.relationship === "Wary" || character.relationship === "Distrustful" || character.relationship === "Hostile";

    if (isSupportive && rng() < 0.03) {
      // Public endorsement
      inboxMessages.push(
        mkInbox(
          `public-endorsement-${pos.id}-${currentDay}`,
          appt.characterName,
          pos.title,
          "Public Endorsement",
          `${appt.characterName}, the ${pos.title}, has publicly praised the government's recent initiatives. Their support carries significant weight in ${pos.state} and the broader ${pos.zone} zone.`,
          currentDay,
        ),
      );
      consequences.push(
        mkConsequence(
          `endorsement-effect-${pos.id}-${currentDay}`,
          "public-statement",
          `${pos.title} endorses the government`,
          [mkEffect("approval", 2, `Approval boost in ${pos.zone} from royal endorsement`)],
        ),
      );
      // Limit to one statement per turn
      break;
    } else if (isCritical && rng() < 0.05) {
      // Public criticism — generates headline + approval penalty + stability -1
      consequences.push(
        mkConsequence(
          `criticism-effect-${pos.id}-${currentDay}`,
          "public-statement",
          `${pos.title} criticises the government`,
          [
            mkEffect("approval", -2, `Approval penalty in ${pos.zone} from royal criticism`),
            mkEffect("stability", -1, "Traditional ruler criticism undermines government authority"),
          ],
        ),
      );
      inboxMessages.push(
        mkInbox(
          `public-criticism-${pos.id}-${currentDay}`,
          appt.characterName,
          pos.title,
          "Public Criticism",
          `${appt.characterName}, the ${pos.title}, has publicly criticised the federal government. Traditional rulers' forums in ${pos.state} are amplifying the message. This is damaging to your standing in the ${pos.zone} zone.`,
          currentDay,
          "Urgent",
        ),
      );
      break;
    }
  }

  return { events, inboxMessages, consequences };
}

// ── 3 (legacy). processTraditionalRulerEvents ──

export function processTraditionalRulerEvents(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;

  // ~2% chance per turn of a traditional ruler event
  if (rng() > 0.02) return { events, inboxMessages, consequences };

  const rulers = state.traditionalRulers;
  const allAppointments = rulers.appointments.filter(a => a.characterName);
  if (allAppointments.length === 0) return { events, inboxMessages, consequences };

  const randomAppt = allAppointments[Math.floor(rng() * allAppointments.length)];
  const pos = rulers.positions.find(p => p.id === randomAppt.positionId);
  const character = state.characters[randomAppt.characterName];
  if (!pos || !character) return { events, inboxMessages, consequences };

  const isCritical = character.relationship === "Wary" || character.relationship === "Distrustful" || character.relationship === "Hostile";
  const isSupportive = character.relationship === "Loyal" || character.relationship === "Friendly";

  if (isCritical && rng() > 0.4) {
    // Critical ruler makes public statement
    const eventId = `trad-ruler-criticism-${pos.id}-${currentDay}`;
    events.push({
      id: eventId,
      title: `Royal Criticism: ${pos.title}`,
      severity: pos.tier === "paramount" ? "warning" : "info",
      description: `${randomAppt.characterName}, the ${pos.title}, has publicly criticised the federal government's handling of ${pos.zone === "NW" || pos.zone === "NE" ? "security in the North" : pos.zone === "SS" ? "the Niger Delta" : "governance in their region"}. Traditional rulers' forums in ${pos.state} are amplifying the message.`,
      category: "politics",
      source: "contextual",
      createdDay: currentDay,
      choices: [
        {
          id: `${eventId}-audience`,
          label: `Grant an audience to the ${pos.title}`,
          context: "Invite them to Aso Rock for a private meeting. This is a gesture of respect.",
          consequences: [
            mkConsequence(`${eventId}-audience-c`, eventId, "Royal audience granted", [
              mkEffect("approval", 1, "Respect for traditional institutions noted"),
            ]),
          ],
        },
        {
          id: `${eventId}-ignore`,
          label: "Ignore the criticism",
          context: "Traditional rulers have no constitutional authority. Let it pass.",
          consequences: [
            mkConsequence(`${eventId}-ignore-c`, eventId, "Royal criticism ignored", [
              mkEffect("approval", -1, "Perceived disrespect for traditional institutions"),
            ]),
          ],
        },
        {
          id: `${eventId}-proxy`,
          label: "Send the Vice President to engage",
          context: "Dispatch the VP as an envoy to the traditional council.",
          consequences: [],
        },
      ],
    });
  } else if (isSupportive && rng() > 0.5) {
    // Supportive ruler endorses government
    inboxMessages.push({
      id: `trad-ruler-support-${pos.id}-${currentDay}`,
      from: pos.title,
      subject: `Royal Endorsement`,
      body: `${randomAppt.characterName}, the ${pos.title}, has publicly praised the government's recent initiatives. Their support carries significant weight in ${pos.state} and the broader ${pos.zone} zone.`,
      priority: "Normal",
      category: "politics",
      day: currentDay,
      read: false,
      archived: false,
    } as GameInboxMessage);
  }

  return { events, inboxMessages, consequences };
}

// ── 4. processTraditionalRulers (main entry point) ──

export function processTraditionalRulers(
  state: GameState,
  rng: () => number,
): ProcessTraditionalRulersResult {
  const royalCouncilSupport = computeRoyalCouncilSupport(state);

  const { events, inboxMessages, consequences } = processTraditionalRulerEvents(state, rng);

  // Royal audience events (Task 10)
  const audience = generateAudienceEvents(state, rng);

  // Public statements (Task 11)
  const statements = generatePublicStatements(state, rng);

  const allEvents = [...events, ...audience.events, ...statements.events];
  const allInbox = [...inboxMessages, ...audience.inboxMessages, ...statements.inboxMessages];
  const allConsequences = [...consequences, ...audience.consequences, ...statements.consequences];

  // Low council support creates periodic stability drain
  if (royalCouncilSupport < 30 && state.day % 30 === 0) {
    allConsequences.push(
      mkConsequence(
        `trad-ruler-low-support-${state.day}`,
        "traditional-ruler-crisis",
        "Traditional rulers' council is largely hostile to the government",
        [
          mkEffect("stability", -1, "Traditional institutions undermine government authority in their domains"),
          mkEffect("approval", -1, "Citizens influenced by traditional rulers' criticism"),
        ],
      ),
    );
  }

  return {
    updatedTraditionalRulers: {
      ...state.traditionalRulers,
      royalCouncilSupport,
    },
    newEvents: allEvents,
    consequences: allConsequences,
    inboxMessages: allInbox,
    royalCouncilSupport,
  };
}
