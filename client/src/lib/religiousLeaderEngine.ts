// client/src/lib/religiousLeaderEngine.ts
// Religious leader system engine — pure functions, no mutations.
// Religious leaders are auto-filled and NOT appointed/removed by player.
// Player can interact with them. Their disposition affects
// interfaith harmony, approval, and stability.

import type {
  ReligiousLeaderPosition,
  ReligiousLeaderAppointment,
  ReligiousLeaderSystemState,
  ReligiousLeaderCandidate,
} from "./religiousLeaderTypes";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
  GameInboxMessage,
} from "./gameTypes";
import { RELIGIOUS_LEADER_POSITIONS } from "./religiousLeaderTypes";
import { RELIGIOUS_LEADER_CANDIDATES } from "./religiousLeaderPool";

// ── Result type ──

export interface ProcessReligiousLeadersResult {
  updatedReligiousLeaders: ReligiousLeaderSystemState;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
  interfaithHarmony: number;
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

// ── 1. seedReligiousLeaders ──

function candidateToCharacter(
  candidate: ReligiousLeaderCandidate,
  position: ReligiousLeaderPosition,
): CharacterState {
  const relationship = candidate.disposition === "supportive" ? "Friendly"
    : candidate.disposition === "neutral" ? "Neutral"
    : "Wary";
  return {
    name: candidate.name,
    portfolio: position.title,
    competencies: candidate.competencies,
    faction: candidate.religion === "Christianity" ? "Christian Leaders" : "Islamic Leaders",
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
 * Seed both religious leader positions.
 * Picks 1 candidate per position (highest influence with RNG variation).
 */
export function seedReligiousLeaders(
  seed: number,
): { state: ReligiousLeaderSystemState; characters: Record<string, CharacterState> } {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const characters: Record<string, CharacterState> = {};
  const appointments: ReligiousLeaderAppointment[] = [];

  for (const position of RELIGIOUS_LEADER_POSITIONS) {
    const qualified = RELIGIOUS_LEADER_CANDIDATES.filter(
      c => c.qualifiedFor.includes(position.id),
    );

    if (qualified.length === 0) continue;

    // Sort by influence with slight randomness
    const sorted = [...qualified].sort((a, b) => {
      return (b.influence + rng() * 10) - (a.influence + rng() * 10);
    });

    const pick = sorted[0];
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
      positions: RELIGIOUS_LEADER_POSITIONS,
      appointments,
      interfaithHarmony: 50,
    },
    characters,
  };
}

// ── 2. computeInterfaithHarmony ──

export function computeInterfaithHarmony(state: GameState): number {
  const leaders = state.religiousLeaders;
  let christSupport = 50;
  let islamSupport = 50;

  for (const appt of leaders.appointments) {
    const pos = leaders.positions.find(p => p.id === appt.positionId);
    const character = state.characters[appt.characterName];
    if (!pos || !character) continue;

    const rel = character.relationship;
    const support = rel === "Loyal" || rel === "Friendly" ? 80
      : rel === "Neutral" ? 50
      : rel === "Wary" ? 30 : 10;

    if (pos.religion === "Christianity") christSupport = support;
    else islamSupport = support;
  }

  // Harmony is highest when both leaders are positive
  // Low when either is hostile
  return Math.round((christSupport + islamSupport) / 2);
}

// ── Helpers — inbox ──

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

// ── 3a. generateFestivalEvents (Task 12) ──

/**
 * Every 90 game days: a major religious observance.
 * Alternates Christian/Muslim based on day / 90.
 */
export function generateFestivalEvents(
  state: GameState,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;

  if (currentDay % 90 !== 0 || currentDay === 0) {
    return { events, inboxMessages, consequences };
  }

  const cycle = Math.floor(currentDay / 90) % 2;
  const isChristian = cycle === 0;
  const religion = isChristian ? "Christianity" : "Islam";
  const faithLabel = isChristian ? "Christian" : "Muslim";
  const positionId = isChristian ? "pres-christian-society" : "pres-muslim-society";

  const leaders = state.religiousLeaders;
  const appt = leaders.appointments.find(a => a.positionId === positionId);
  if (!appt || !appt.characterName) return { events, inboxMessages, consequences };

  const pos = leaders.positions.find(p => p.id === positionId);
  if (!pos) return { events, inboxMessages, consequences };

  const festivalName = isChristian ? "Christmas/Easter Observance" : "Eid Celebration";
  const eventId = `festival-${positionId}-${currentDay}`;

  events.push({
    id: eventId,
    title: `${faithLabel} Religious Observance: ${festivalName}`,
    severity: "info",
    description: `A major ${faithLabel} religious observance is underway. ${appt.characterName}, ${pos.title}, has invited the President to participate. Your response will shape relations with the ${faithLabel} community.`,
    category: "politics",
    source: "contextual",
    createdDay: currentDay,
    choices: [
      {
        id: `${eventId}-attend`,
        label: "Attend in Person",
        context: `Attend the ${festivalName} celebration personally. A powerful gesture of solidarity.`,
        consequences: [
          mkConsequence(`${eventId}-attend-c`, eventId, `President attends ${festivalName}`, [
            mkEffect("character", 10, `Strong bond with ${appt.characterName}`),
            mkEffect("approval", 3, `Approval boost among ${faithLabel} community`),
            mkEffect("politicalCapital", -1, "Political capital spent on attendance"),
          ]),
        ],
      },
      {
        id: `${eventId}-message`,
        label: "Send Official Message",
        context: `Issue a formal presidential message congratulating the ${faithLabel} community.`,
        consequences: [
          mkConsequence(`${eventId}-message-c`, eventId, `Presidential message for ${festivalName}`, [
            mkEffect("character", 4, `Goodwill from ${appt.characterName}`),
            mkEffect("approval", 1, `Modest approval among ${faithLabel} community`),
          ]),
        ],
      },
      {
        id: `${eventId}-ignore`,
        label: "No Acknowledgment",
        context: "The President makes no public acknowledgment of the observance.",
        consequences: [
          mkConsequence(`${eventId}-ignore-c`, eventId, `${festivalName} ignored by presidency`, [
            mkEffect("character", -8, `${appt.characterName} feels slighted`),
            mkEffect("approval", -2, `${faithLabel} community disappointed`),
          ]),
        ],
      },
    ],
  });

  return { events, inboxMessages, consequences };
}

// ── 3b. processInterfaithSummit (Task 12) ──

export interface InterfaithSummitResult {
  updatedReligiousLeaders: ReligiousLeaderSystemState;
  events: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
}

/**
 * Player-initiated interfaith summit with 60-day cooldown.
 * Outcome depends on both leaders' relationships.
 */
export function processInterfaithSummit(state: GameState): InterfaithSummitResult {
  const leaders = state.religiousLeaders;
  const events: ActiveEvent[] = [];
  const consequences: Consequence[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const currentDay = state.day;

  // 60-day cooldown — undefined means never summited, so skip cooldown
  if (leaders.lastSummitDay !== undefined && currentDay - leaders.lastSummitDay < 60) {
    return { updatedReligiousLeaders: leaders, events, consequences, inboxMessages };
  }

  // Get both leaders' relationship scores
  const christianAppt = leaders.appointments.find(a => a.positionId === "pres-christian-society");
  const muslimAppt = leaders.appointments.find(a => a.positionId === "pres-muslim-society");
  if (!christianAppt?.characterName || !muslimAppt?.characterName) {
    return { updatedReligiousLeaders: leaders, events, consequences, inboxMessages };
  }

  const christianChar = state.characters[christianAppt.characterName];
  const muslimChar = state.characters[muslimAppt.characterName];
  if (!christianChar || !muslimChar) {
    return { updatedReligiousLeaders: leaders, events, consequences, inboxMessages };
  }

  const relToScore = (rel: string): number => {
    if (rel === "Loyal") return 90;
    if (rel === "Friendly") return 75;
    if (rel === "Neutral") return 50;
    if (rel === "Wary") return 30;
    if (rel === "Distrustful") return 15;
    return 5; // Hostile
  };

  const christianScore = relToScore(christianChar.relationship);
  const muslimScore = relToScore(muslimChar.relationship);

  const summitId = `interfaith-summit-${currentDay}`;

  if (christianScore > 50 && muslimScore > 50) {
    // Both positive — harmony rises
    consequences.push(
      mkConsequence(summitId, "interfaith-summit", "Interfaith summit succeeds — both leaders support the initiative", [
        mkEffect("stability", 2, "Interfaith harmony bolsters national stability"),
        mkEffect("approval", 2, "Positive headlines from successful summit"),
      ]),
    );
    inboxMessages.push(
      mkInbox(
        `summit-success-${currentDay}`, "Interfaith Council", "Religious Affairs",
        "Interfaith Summit — Success",
        `The interfaith summit convened by the President was a resounding success. Both ${christianAppt.characterName} and ${muslimAppt.characterName} praised the initiative. Interfaith harmony has increased significantly.`,
        currentDay,
      ),
    );
  } else if (christianScore < 30 && muslimScore < 30) {
    // Both hostile — disaster
    consequences.push(
      mkConsequence(summitId, "interfaith-summit", "Interfaith summit is a disaster — both leaders hostile", [
        mkEffect("stability", -4, "Summit exposed deep religious divisions"),
        mkEffect("approval", -5, "Public embarrassment from failed summit"),
      ]),
    );
    inboxMessages.push(
      mkInbox(
        `summit-disaster-${currentDay}`, "Interfaith Council", "Religious Affairs",
        "Interfaith Summit — Disaster",
        `The interfaith summit was a catastrophic failure. Both religious leaders used the platform to publicly criticise the administration. National stability has been shaken.`,
        currentDay, "Critical",
      ),
    );
  } else if (christianScore < 30 || muslimScore < 30) {
    // One hostile — embarrassment
    const hostileLeader = christianScore < 30 ? christianAppt.characterName : muslimAppt.characterName;
    consequences.push(
      mkConsequence(summitId, "interfaith-summit", `${hostileLeader} uses summit to embarrass the President`, [
        mkEffect("approval", -3, "Negative coverage from interfaith summit"),
      ]),
    );
    inboxMessages.push(
      mkInbox(
        `summit-partial-${currentDay}`, "Interfaith Council", "Religious Affairs",
        "Interfaith Summit — Partial Failure",
        `The interfaith summit did not go as planned. ${hostileLeader} used the forum to publicly challenge the administration's policies, creating negative headlines.`,
        currentDay, "Urgent",
      ),
    );
  } else {
    // Mixed but no one hostile — mild positive
    consequences.push(
      mkConsequence(summitId, "interfaith-summit", "Interfaith summit produces modest results", [
        mkEffect("stability", 1, "Some progress on interfaith dialogue"),
        mkEffect("approval", 1, "Neutral-to-positive summit coverage"),
      ]),
    );
  }

  // Update the summit day
  const updatedReligiousLeaders: ReligiousLeaderSystemState = {
    ...leaders,
    lastSummitDay: currentDay,
    // Adjust interfaith harmony based on outcome
    interfaithHarmony: Math.max(0, Math.min(100,
      leaders.interfaithHarmony +
      (christianScore > 50 && muslimScore > 50 ? 10 :
       christianScore < 30 && muslimScore < 30 ? -5 :
       christianScore < 30 || muslimScore < 30 ? -5 : 3),
    )),
  };

  return { updatedReligiousLeaders, events, consequences, inboxMessages };
}

// ── 3c. generatePolicyReactions (Task 13) ──

/**
 * Religious leaders react to policy changes.
 * Checks policy levers for changes and generates reactions based on sensitivity map.
 */
export const RELIGIOUS_SENSITIVITY_MAP: Record<string, { affects: "both" | "christian" | "muslim"; sentiment: "positive" | "negative" }> = {
  educationBudgetSplit: { affects: "both", sentiment: "negative" },
  universityAutonomy: { affects: "both", sentiment: "negative" },
  landReform: { affects: "both", sentiment: "negative" },
  cashTransfers: { affects: "both", sentiment: "positive" },
  healthcareFunding: { affects: "both", sentiment: "positive" },
  borderPolicy: { affects: "muslim", sentiment: "negative" },
  nyscReform: { affects: "both", sentiment: "negative" },
};

export function generatePolicyReactions(
  state: GameState,
  previousPolicyState: Record<string, string> | undefined,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;

  if (!previousPolicyState || !state.policyLevers) {
    return { events, inboxMessages, consequences };
  }

  const leaders = state.religiousLeaders;

  for (const [leverKey, sensitivity] of Object.entries(RELIGIOUS_SENSITIVITY_MAP)) {
    const lever = (state.policyLevers as Record<string, { position: string }>)[leverKey];
    if (!lever) continue;

    const prevPosition = previousPolicyState[leverKey];
    if (!prevPosition || prevPosition === lever.position) continue;

    // A policy change happened — generate reactions
    const delta = sensitivity.sentiment === "positive" ? 5 : -5;
    const affectedPositions = sensitivity.affects === "both"
      ? ["pres-christian-society", "pres-muslim-society"]
      : sensitivity.affects === "christian"
        ? ["pres-christian-society"]
        : ["pres-muslim-society"];

    for (const posId of affectedPositions) {
      const appt = leaders.appointments.find(a => a.positionId === posId);
      if (!appt?.characterName) continue;
      const pos = leaders.positions.find(p => p.id === posId);
      if (!pos) continue;

      const faithLabel = pos.religion === "Christianity" ? "Christian" : "Muslim";
      const reactionId = `policy-reaction-${posId}-${leverKey}-${currentDay}`;
      const policyLabel = leverKey.replace(/([A-Z])/g, " $1").toLowerCase().trim();

      if (delta > 0) {
        inboxMessages.push(
          mkInbox(
            reactionId, appt.characterName, pos.title,
            `${faithLabel} Leaders Welcome Policy Change`,
            `${appt.characterName}, ${pos.title}, has praised the government's new ${policyLabel} policy. The ${faithLabel} community views this positively.`,
            currentDay,
          ),
        );
      } else {
        inboxMessages.push(
          mkInbox(
            reactionId, appt.characterName, pos.title,
            `${faithLabel} Leaders Criticise Policy Change`,
            `${appt.characterName}, ${pos.title}, has criticised the government's new ${policyLabel} policy. The ${faithLabel} community is deeply concerned about the implications.`,
            currentDay, "Urgent",
          ),
        );
      }

      consequences.push(
        mkConsequence(
          `${reactionId}-c`, "policy-reaction",
          `${faithLabel} leader reacts to ${policyLabel} change`,
          [mkEffect("character", delta, `${appt.characterName} reacts to policy change`)],
        ),
      );
    }

    // Only process the first policy change per turn
    break;
  }

  return { events, inboxMessages, consequences };
}

// ── 3 (legacy). processReligiousLeaderEvents ──

export function processReligiousLeaderEvents(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;

  // ~1.5% chance per turn
  if (rng() > 0.015) return { events, inboxMessages, consequences };

  const leaders = state.religiousLeaders;
  const appts = leaders.appointments.filter(a => a.characterName);
  if (appts.length === 0) return { events, inboxMessages, consequences };

  const randomAppt = appts[Math.floor(rng() * appts.length)];
  const pos = leaders.positions.find(p => p.id === randomAppt.positionId);
  const character = state.characters[randomAppt.characterName];
  if (!pos || !character) return { events, inboxMessages, consequences };

  const isCritical = character.relationship === "Wary" || character.relationship === "Distrustful" || character.relationship === "Hostile";

  if (isCritical) {
    const eventId = `religious-criticism-${pos.id}-${currentDay}`;
    const faithGroup = pos.religion === "Christianity" ? "Christian" : "Muslim";
    events.push({
      id: eventId,
      title: `${faithGroup} Leaders Express Concern`,
      severity: "warning",
      description: `${randomAppt.characterName}, ${pos.title}, has issued a communiqué expressing deep concern about the direction of governance. The ${faithGroup} community is paying attention. This could affect social cohesion.`,
      category: "politics",
      source: "contextual",
      createdDay: currentDay,
      choices: [
        {
          id: `${eventId}-meet`,
          label: `Invite ${randomAppt.characterName} for a private meeting`,
          context: "A gesture of respect and dialogue. May improve the relationship.",
          consequences: [
            mkConsequence(`${eventId}-meet-c`, eventId, "Religious leader engaged", [
              mkEffect("approval", 1, "Interfaith dialogue shows leadership"),
            ]),
          ],
        },
        {
          id: `${eventId}-ignore`,
          label: "No response",
          context: "The government has no obligation to religious leaders.",
          consequences: [
            mkConsequence(`${eventId}-ignore-c`, eventId, "Religious criticism unanswered", [
              mkEffect("stability", -1, `${faithGroup} community feels alienated`),
            ]),
          ],
        },
      ],
    });
  } else {
    // Positive or neutral — occasional supportive message
    const faithGroup = pos.religion === "Christianity" ? "Christian" : "Muslim";
    inboxMessages.push({
      id: `religious-support-${pos.id}-${currentDay}`,
      from: pos.title,
      subject: `${faithGroup} Leaders' Prayers`,
      body: `${randomAppt.characterName}, ${pos.title}, has called on the ${faithGroup} community to pray for the success of the administration and for peace in Nigeria. Their public support helps social cohesion.`,
      priority: "Normal",
      category: "politics",
      day: currentDay,
      read: false,
      archived: false,
    } as GameInboxMessage);
  }

  return { events, inboxMessages, consequences };
}

// ── 4. processReligiousLeaders (main entry point) ──

export function processReligiousLeaders(
  state: GameState,
  rng: () => number,
  previousPolicyState?: Record<string, string>,
): ProcessReligiousLeadersResult {
  const interfaithHarmony = computeInterfaithHarmony(state);

  const { events, inboxMessages, consequences } = processReligiousLeaderEvents(state, rng);

  // Festival events (Task 12)
  const festivals = generateFestivalEvents(state);

  // Policy reactions (Task 13)
  const policyReactions = generatePolicyReactions(state, previousPolicyState);

  const allEvents = [...events, ...festivals.events, ...policyReactions.events];
  const allInbox = [...inboxMessages, ...festivals.inboxMessages, ...policyReactions.inboxMessages];
  const allConsequences = [...consequences, ...festivals.consequences, ...policyReactions.consequences];

  // Low interfaith harmony → periodic stability damage
  if (interfaithHarmony < 25 && state.day % 30 === 0) {
    allConsequences.push(
      mkConsequence(
        `religious-tension-${state.day}`,
        "religious-tension",
        "Religious tension is escalating — both Christian and Muslim leaders are critical of government",
        [
          mkEffect("stability", -2, "Religious polarisation threatens social cohesion"),
          mkEffect("approval", -1, "Citizens feel government has failed interfaith dialogue"),
        ],
      ),
    );
  }

  return {
    updatedReligiousLeaders: {
      ...state.religiousLeaders,
      interfaithHarmony,
    },
    newEvents: allEvents,
    consequences: allConsequences,
    inboxMessages: allInbox,
    interfaithHarmony,
  };
}
