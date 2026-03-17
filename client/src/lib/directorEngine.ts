// client/src/lib/directorEngine.ts
// Director (agency head) turn processing engine — pure functions, no mutations.

import type { ProfessionalCompetencies } from "./competencyTypes";
import type {
  DirectorPosition,
  DirectorAppointment,
  DirectorSystemState,
  DirectorPositionId,
} from "./directorTypes";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
} from "./gameTypes";
import { pick } from "./seededRandom";

// ── Local types ──

export interface DepartureNotice {
  positionId: string;
  positionTitle: string;
  characterName: string;
  type: "resignation" | "retirement";
  departureDay: number;
}

export interface ProcessDirectorsResult {
  updatedDirectors: DirectorSystemState;
  sectorModifiers: Record<string, number>;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  departureNotices: DepartureNotice[];
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

// ── 1. computeDirectorEffect ──

export function computeDirectorEffect(
  position: DirectorPosition,
  character: CharacterState | null,
  _state: GameState,
): number {
  if (!character) {
    return -0.3 * position.weight;
  }
  const competence = character.competencies.professional[position.primaryCompetency];
  return ((competence - 70) / 100) * position.weight;
}

// ── 2. checkDirectorDepartures ──

export function checkDirectorDepartures(
  state: GameState,
  rng: () => number,
): { updatedState: DirectorSystemState; departures: DepartureNotice[] } {
  const departures: DepartureNotice[] = [];
  const currentDay = state.day;
  const directors = state.directors;

  // Process pending departures that have reached their day
  let appointments = directors.appointments.map((appt) => {
    if (
      appt.pendingDeparture &&
      appt.pendingDeparture.departureDay <= currentDay &&
      appt.characterName
    ) {
      const pos = directors.positions.find((p) => p.id === appt.positionId);
      departures.push({
        positionId: appt.positionId,
        positionTitle: pos?.title ?? appt.positionId,
        characterName: appt.characterName,
        type: appt.pendingDeparture.type,
        departureDay: appt.pendingDeparture.departureDay,
      });
      return {
        ...appt,
        characterName: null,
        pendingDeparture: undefined,
      } as DirectorAppointment;
    }
    return appt;
  });

  // Build vacancy tracking with newly departed
  const vacancyTracking = { ...directors.vacancyTracking };
  for (const d of departures) {
    vacancyTracking[d.positionId] = currentDay;
  }

  // Check for new resignations / retirements
  appointments = appointments.map((appt) => {
    if (!appt.characterName || appt.pendingDeparture) return appt;

    const character = state.characters[appt.characterName];
    if (!character) return appt;

    const loyalty = character.competencies.personal.loyalty;
    const ambition = character.competencies.personal.ambition;
    const relationship = character.relationship;

    // Resignation check
    let resignProb = 0.005;
    if (loyalty < 35) resignProb *= 2;
    if (ambition > 75) resignProb *= 1.5;
    if (relationship === "Hostile") resignProb *= 2;
    if (appt.isOriginal) resignProb *= 1.3;

    if (rng() < resignProb) {
      return {
        ...appt,
        pendingDeparture: {
          type: "resignation" as const,
          departureDay: currentDay + 14,
          notifiedDay: currentDay,
        },
      };
    }

    // Retirement check
    const age = character.age;
    const tenure = currentDay - appt.appointedDay;
    if (age && age > 62 && tenure > 180) {
      if (rng() < 0.008) {
        return {
          ...appt,
          pendingDeparture: {
            type: "retirement" as const,
            departureDay: currentDay + 14,
            notifiedDay: currentDay,
          },
        };
      }
    }

    return appt;
  });

  return {
    updatedState: {
      ...directors,
      appointments,
      vacancyTracking,
    },
    departures,
  };
}

// ── 3. processDirectorVacancies ──

export function processDirectorVacancies(state: GameState): ActiveEvent[] {
  const events: ActiveEvent[] = [];
  const { positions, appointments, vacancyTracking } = state.directors;
  const currentDay = state.day;
  const existingEventIds = new Set(state.activeEvents.map((e) => e.id));

  for (const appt of appointments) {
    if (appt.characterName !== null) continue;

    const vacatedDay = vacancyTracking[appt.positionId];
    if (vacatedDay === undefined) continue;

    const daysSinceVacancy = currentDay - vacatedDay;
    const position = positions.find((p) => p.id === appt.positionId);
    if (!position) continue;

    // Determine escalation tier
    let tier: "week" | "fortnight" | "month" | null = null;
    if (daysSinceVacancy >= 30) tier = "month";
    else if (daysSinceVacancy >= 14) tier = "fortnight";
    else if (daysSinceVacancy >= 7) tier = "week";

    if (!tier) continue;

    const eventId = `director-vacancy-${appt.positionId}`;
    if (existingEventIds.has(eventId)) continue;

    const severity: ActiveEvent["severity"] =
      tier === "month" ? "critical" : tier === "fortnight" ? "warning" : "info";

    const baseEffects: Effect[] = [];
    if (tier === "fortnight") {
      baseEffects.push(mkEffect("approval", -1, "Unfilled director position erodes confidence"));
    } else if (tier === "month") {
      baseEffects.push(mkEffect("stability", -2, "Prolonged vacancy destabilises governance"));
      baseEffects.push(mkEffect("approval", -2, "Extended vacancy draws public criticism"));
    }

    const reviewEffects: Effect[] = [...baseEffects];
    const delegateEffects: Effect[] = [...baseEffects];
    const leaveEffects: Effect[] = [
      ...baseEffects,
      mkEffect("stability", -1, "Continued vacancy signals indifference"),
    ];

    events.push({
      id: eventId,
      title: `Vacant Position: ${position.title}`,
      severity,
      description: `The position of ${position.title} in ${position.ministry} remains unfilled after ${daysSinceVacancy} days.`,
      category: "governance",
      source: "contextual",
      createdDay: currentDay,
      choices: [
        {
          id: `${eventId}-review`,
          label: "Review candidates",
          context: "Personally review the shortlist for this position.",
          consequences: reviewEffects.length
            ? [mkConsequence(`${eventId}-review-c`, eventId, "Review candidates", reviewEffects)]
            : [],
        },
        {
          id: `${eventId}-delegate`,
          label: "Delegate to Chief of Staff",
          context: "Let the Chief of Staff handle the appointment.",
          consequences: delegateEffects.length
            ? [mkConsequence(`${eventId}-delegate-c`, eventId, "Delegate selection", delegateEffects)]
            : [],
        },
        {
          id: `${eventId}-leave`,
          label: "Leave vacant for now",
          context: "Other priorities take precedence.",
          consequences: [
            mkConsequence(`${eventId}-leave-c`, eventId, "Position remains vacant", leaveEffects),
          ],
        },
      ],
    });
  }

  return events;
}

// ── 4. fireDirector ──

export function fireDirector(
  state: GameState,
  positionId: DirectorPositionId,
): { updatedState: DirectorSystemState; consequences: Consequence[] } {
  const directors = state.directors;
  const appt = directors.appointments.find((a) => a.positionId === positionId);
  if (!appt || !appt.characterName) {
    return { updatedState: directors, consequences: [] };
  }

  const position = directors.positions.find((p) => p.id === positionId);
  if (!position) {
    return { updatedState: directors, consequences: [] };
  }

  const newTechnocratsFired = directors.technocratsFired + (appt.isOriginal ? 1 : 0);

  const updatedAppointments = directors.appointments.map((a) =>
    a.positionId === positionId
      ? { ...a, characterName: null, pendingDeparture: undefined } as DirectorAppointment
      : a,
  );

  const vacancyTracking = { ...directors.vacancyTracking, [positionId]: state.day };

  const effects: Effect[] = [];

  // Prestige tier consequences
  if (position.prestigeTier === "strategic") {
    effects.push(mkEffect("stability", -2, "Firing a strategic director destabilises governance"));
    effects.push(mkEffect("approval", -1, "Public concern over strategic leadership change"));
  } else if (position.prestigeTier === "standard") {
    effects.push(mkEffect("stability", -1, "Director dismissal noted by observers"));
  }

  // Systemic consequences (ongoing) are handled by processSystemicConsequences()
  // fireDirector only applies the one-time prestige-tier consequences above

  const consequences: Consequence[] = effects.length
    ? [mkConsequence(`fire-director-${positionId}`, "director-dismissal", "Director fired", effects)]
    : [];

  return {
    updatedState: {
      ...directors,
      appointments: updatedAppointments,
      technocratsFired: newTechnocratsFired,
      vacancyTracking,
    },
    consequences,
  };
}

// ── 5. processSystemicConsequences ──

export function processSystemicConsequences(
  state: GameState,
): { consequences: Consequence[]; events: ActiveEvent[] } {
  const { technocratsFired } = state.directors;
  const consequences: Consequence[] = [];
  const events: ActiveEvent[] = [];
  const existingEventIds = new Set(state.activeEvents.map((e) => e.id));

  if (technocratsFired >= 3 && !existingEventIds.has("director-systemic-warning")) {
    events.push({
      id: "director-systemic-warning",
      title: "Civil Service Morale Declining",
      severity: "warning",
      description:
        "Multiple director dismissals have rattled the civil service. Senior bureaucrats are questioning whether competence matters more than political loyalty.",
      category: "governance",
      source: "contextual",
      createdDay: state.day,
      choices: [
        {
          id: "systemic-warn-ack",
          label: "Noted",
          context: "Acknowledge the warning.",
          consequences: [],
        },
      ],
    });
  }

  if (technocratsFired >= 5) {
    consequences.push(
      mkConsequence(
        "systemic-reputation-drag",
        "director-systemic",
        "International reputation suffers from institutional instability",
        [mkEffect("trust", -2, "International partners lose confidence")],
      ),
    );
  }

  if (technocratsFired >= 8) {
    consequences.push(
      mkConsequence(
        "systemic-sector-drag",
        "director-systemic",
        "Ongoing sector performance drag from depleted expertise",
        [mkEffect("stability", -1, "Institutional capacity eroded")],
      ),
    );
  }

  if (technocratsFired >= 12 && !existingEventIds.has("director-governance-crisis")) {
    events.push({
      id: "director-governance-crisis",
      title: "Governance Crisis: Institutional Collapse",
      severity: "critical",
      description:
        "The mass dismissal of experienced technocrats has hollowed out the federal bureaucracy. International observers are issuing warnings, and the opposition is calling for a vote of no confidence.",
      category: "governance",
      source: "contextual",
      createdDay: state.day,
      choices: [
        {
          id: "crisis-reform",
          label: "Announce civil service reform",
          context: "Promise institutional renewal.",
          consequences: [
            mkConsequence("crisis-reform-c", "director-governance-crisis", "Reform promised", [
              mkEffect("approval", 2, "Reform pledge calms some concerns"),
              mkEffect("stability", 1, "Signal of institutional care"),
            ]),
          ],
        },
        {
          id: "crisis-dismiss",
          label: "Dismiss the criticism",
          context: "Characterise the opposition as alarmist.",
          consequences: [
            mkConsequence("crisis-dismiss-c", "director-governance-crisis", "Criticism dismissed", [
              mkEffect("stability", -2, "Dismissiveness deepens the crisis"),
            ]),
          ],
        },
      ],
    });
  }

  return { consequences, events };
}

// ── 6. delegateToCoS ──

export function delegateToCoS(
  state: GameState,
  positionId: DirectorPositionId,
  candidatePool: CharacterState[],
  rng: () => number,
): string | null {
  const cos = Object.values(state.characters).find(
    (c) => c.portfolio === "Chief of Staff",
  );
  if (!cos) return null;

  const position = state.directors.positions.find((p) => p.id === positionId);
  if (!position) return null;

  // Filter to qualified candidates (competency > 30 in the relevant area)
  const competencyKey = position.primaryCompetency;
  const qualified = candidatePool.filter(
    (c) => c.competencies.professional[competencyKey] > 30,
  );
  if (qualified.length === 0) return null;

  const cosAdmin = cos.competencies.professional.administration;
  const cosLoyalty = cos.competencies.personal.loyalty;

  let candidates: CharacterState[];

  if (cosAdmin > 70) {
    // High competence: sort by relevant competency, pick randomly from top 3
    const sorted = [...qualified].sort(
      (a, b) =>
        b.competencies.professional[competencyKey] -
        a.competencies.professional[competencyKey],
    );
    candidates = sorted.slice(0, 3);
  } else if (cosAdmin < 50) {
    // Low competence: pick randomly from all qualified
    candidates = qualified;
  } else {
    // Medium: sort and pick from top half
    const sorted = [...qualified].sort(
      (a, b) =>
        b.competencies.professional[competencyKey] -
        a.competencies.professional[competencyKey],
    );
    candidates = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
  }

  // Low loyalty CoS may bias toward own faction
  if (cosLoyalty < 40 && rng() < 0.5) {
    const factionMatch = candidates.filter((c) => c.faction === cos.faction);
    if (factionMatch.length > 0) {
      return pick(rng, factionMatch).name;
    }
  }

  return pick(rng, candidates).name;
}

// ── 7. generateDirectorEvents ──

export function generateDirectorEvents(
  state: GameState,
  rng: () => number,
): ActiveEvent[] {
  const events: ActiveEvent[] = [];
  const { positions, appointments } = state.directors;

  for (const appt of appointments) {
    if (!appt.characterName) continue;
    if (rng() >= 0.02) continue;

    const character = state.characters[appt.characterName];
    if (!character) continue;

    const position = positions.find((p) => p.id === appt.positionId);
    if (!position) continue;

    const competence = character.competencies.professional[position.primaryCompetency];

    if (competence > 80) {
      // Check sector health to decide between success and request events
      // Sector health is approximated by checking if sector modifier is positive
      const sectorKey = position.sectorInfluence[0];
      const sectorValue = sectorKey ? (state as unknown as Record<string, unknown>)[sectorKey] : undefined;
      const sectorHealthy = typeof sectorValue === "number" && sectorValue > 60;

      if (sectorHealthy) {
        // High-competence + healthy sector → success event
        const eventId = `director-success-${appt.positionId}-${state.day}`;
        events.push({
          id: eventId,
          title: `${position.title}: Strong Results`,
          severity: "info",
          description: `${appt.characterName}, ${position.title}, is delivering excellent results in ${sectorKey ?? position.ministry}. Their leadership is widely praised.`,
          category: "governance",
          source: "contextual",
          createdDay: state.day,
          choices: [
            {
              id: `${eventId}-commend`,
              label: "Publicly commend the director",
              context: "Highlight their achievements.",
              consequences: [
                mkConsequence(`${eventId}-commend-c`, eventId, "Director commended", [
                  mkEffect("approval", 1, "Effective governance earns credit"),
                ]),
              ],
            },
            {
              id: `${eventId}-note`,
              label: "Take note",
              context: "Acknowledge internally.",
              consequences: [],
            },
          ],
        });
      } else {
        // High-competence + struggling sector → request event
        const eventId = `director-event-${appt.positionId}-${state.day}`;
        events.push({
          id: eventId,
          title: `${position.title}: Policy Proposal`,
          severity: "info",
          description: `${appt.characterName}, ${position.title}, has submitted a proposal to strengthen ${sectorKey ?? position.ministry} performance through targeted reforms.`,
          category: "governance",
          source: "contextual",
          createdDay: state.day,
          choices: [
            {
              id: `${eventId}-approve`,
              label: "Approve the proposal",
              context: "Back the director's initiative.",
              consequences: [
                mkConsequence(`${eventId}-approve-c`, eventId, "Proposal approved", [
                  mkEffect("approval", 1, "Effective governance earns credit"),
                ]),
              ],
            },
            {
              id: `${eventId}-defer`,
              label: "Defer for review",
              context: "Send it through proper channels.",
              consequences: [],
            },
          ],
        });
      }
    } else if (competence < 50) {
      // Low-competence blame event
      const eventId = `director-blame-${appt.positionId}-${state.day}`;
      events.push({
        id: eventId,
        title: `${position.title}: Under Fire`,
        severity: "warning",
        description: `Media outlets and opposition figures are blaming ${appt.characterName} for poor performance in ${position.ministry}. Calls for replacement are growing.`,
        category: "governance",
        source: "contextual",
        createdDay: state.day,
        choices: [
          {
            id: `${eventId}-defend`,
            label: "Defend the director",
            context: "Issue a statement of support.",
            consequences: [
              mkConsequence(`${eventId}-defend-c`, eventId, "Director defended", [
                mkEffect("approval", -1, "Public unconvinced by defence"),
              ]),
            ],
          },
          {
            id: `${eventId}-replace`,
            label: "Begin replacement process",
            context: "Acknowledge the need for change.",
            consequences: [
              mkConsequence(`${eventId}-replace-c`, eventId, "Replacement signalled", [
                mkEffect("stability", -1, "Transition creates uncertainty"),
              ]),
            ],
          },
        ],
      });
    }
  }

  return events;
}

// ── 8. processDirectors (main entry point) ──

export function processDirectors(
  state: GameState,
  rng: () => number,
): ProcessDirectorsResult {
  // 1. Compute sector modifiers
  const sectorModifiers: Record<string, number> = {};
  const { positions, appointments } = state.directors;

  for (const appt of appointments) {
    const position = positions.find((p) => p.id === appt.positionId);
    if (!position) continue;

    const character = appt.characterName ? state.characters[appt.characterName] ?? null : null;
    const modifier = computeDirectorEffect(position, character, state);

    for (const sector of position.sectorInfluence) {
      sectorModifiers[sector] = (sectorModifiers[sector] ?? 0) + modifier;
    }
  }

  // 2. Check departures
  const { updatedState: afterDepartures, departures } = checkDirectorDepartures(state, rng);

  // Create intermediate state for subsequent functions
  const stateAfterDepartures: GameState = { ...state, directors: afterDepartures };

  // 3. Process vacancies
  const vacancyEvents = processDirectorVacancies(stateAfterDepartures);

  // 4. Systemic consequences
  const { consequences: systemicConsequences, events: systemicEvents } =
    processSystemicConsequences(stateAfterDepartures);

  // 5. Director narrative events
  const directorEvents = generateDirectorEvents(stateAfterDepartures, rng);

  return {
    updatedDirectors: afterDepartures,
    sectorModifiers,
    newEvents: [...vacancyEvents, ...systemicEvents, ...directorEvents],
    consequences: systemicConsequences,
    departureNotices: departures,
  };
}
