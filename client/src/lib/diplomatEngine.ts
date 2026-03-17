// client/src/lib/diplomatEngine.ts
// Diplomat/ambassador turn processing engine — pure functions, no mutations.
// Handles 40 bilateral + 10 institution + 30 minor posts with:
//   - Vacancy escalation (day 7 inbox, day 14 decision desk, day 30 briefing)
//   - Diplomatic effectiveness computation
//   - Rotation events
//   - Random diplomatic incidents for low/high competence ambassadors
//   - Trade, international reputation, and military cooperation modifiers

import type {
  AmbassadorPost,
  AmbassadorAppointment,
  DiplomatSystemState,
  DiplomaticIncident,
  DiplomatCandidate,
} from "./diplomatTypes";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
  GameInboxMessage,
} from "./gameTypes";
import {
  AMBASSADOR_POSTS,
  HC_DIPLOMAT_CANDIDATES,
  getAllDiplomatCandidates,
} from "./diplomatPool";
import { ALL_DIPLOMAT_POSTS, KEY_BILATERAL_POSTS, INSTITUTION_POSTS, MINOR_EMBASSY_POSTS } from "./diplomatPosts";
import { getZoneForState } from "./zones";

// ── Result types ──

export interface ProcessDiplomatsResult {
  updatedDiplomats: DiplomatSystemState;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
  internationalModifier: number;
  tradeModifier: number;
  militaryCoopModifier: number;
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

// ── 1. seedDiplomatSystem ──

function diplomatCandidateToCharacter(
  candidate: DiplomatCandidate,
  post: AmbassadorPost,
): CharacterState {
  return {
    name: candidate.name,
    portfolio: post.title,
    competencies: candidate.competencies,
    faction: "Foreign Service",
    relationship: "Neutral",
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
    title: post.title,
    careerHistory: [],
    interactionLog: [],
  };
}

/**
 * Seed the diplomat system at game start.
 * Fills all Tier 1 (bilateral) + Tier 2 (institution) posts from HC candidates.
 * Fills Tier 3 (minor) posts from procedural candidates.
 * Returns the diplomat state + character records.
 */
export function seedDiplomatSystem(
  seed: number,
): { state: DiplomatSystemState; characters: Record<string, CharacterState> } {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const characters: Record<string, CharacterState> = {};
  const appointments: AmbassadorAppointment[] = [];
  const usedCandidates = new Set<string>();
  const zoneUsage: Record<string, number> = {};

  const allCandidates = getAllDiplomatCandidates();

  for (const post of ALL_DIPLOMAT_POSTS) {
    const qualified = allCandidates.filter(
      c => c.qualifiedFor.includes(post.id) && !usedCandidates.has(c.name),
    );

    // Check language qualification
    const langQualified = post.languageRequired !== "None"
      ? qualified.filter(c => c.languageSkills.includes(post.languageRequired as any))
      : qualified;

    const pool = langQualified.length > 0 ? langQualified : qualified;

    if (pool.length === 0) {
      // Leave vacant — will trigger vacancy events
      appointments.push({
        postId: post.id,
        characterName: null,
        appointedDay: 0,
        rotationDueDay: 0,
        vacantSinceDay: 0,
      });
      continue;
    }

    // Sort by zone balance (prefer underrepresented zones)
    const sorted = [...pool].sort((a, b) => {
      return (zoneUsage[a.zone] ?? 0) - (zoneUsage[b.zone] ?? 0);
    });

    // Pick from top candidates with randomness
    const topN = sorted.slice(0, Math.min(3, sorted.length));
    const pick = topN[Math.floor(rng() * topN.length)];

    usedCandidates.add(pick.name);
    zoneUsage[pick.zone] = (zoneUsage[pick.zone] ?? 0) + 1;

    const charState = diplomatCandidateToCharacter(pick, post);
    characters[pick.name] = charState;

    // Rotation due in 730-1095 days (2-3 years)
    const rotationDue = 730 + Math.floor(rng() * 365);

    appointments.push({
      postId: post.id,
      characterName: pick.name,
      appointedDay: 0,
      rotationDueDay: rotationDue,
      vacantSinceDay: null,
    });
  }

  return {
    state: {
      posts: ALL_DIPLOMAT_POSTS,
      appointments,
      incidents: [],
      diplomaticEffectiveness: 50,
    },
    characters,
  };
}

// ── 2. computeDiplomaticEffect ──

export interface DiplomaticEffectResult {
  internationalReputationModifier: number;
  tradeModifier: number;
  militaryCoopModifier: number;
  effectiveness: number; // 0-100 aggregate score
}

export function computeDiplomaticEffect(
  state: GameState,
): DiplomaticEffectResult {
  const diplomats = state.diplomats;
  let intlMod = 0;
  let tradeMod = 0;
  let milMod = 0;
  let totalWeight = 0;
  let effectiveWeight = 0;

  for (const appt of diplomats.appointments) {
    const post = diplomats.posts.find(p => p.id === appt.postId);
    if (!post) continue;

    const postImportance = post.internationalWeight + post.tradeWeight + post.militaryWeight;
    totalWeight += postImportance;

    if (!appt.characterName) {
      // Vacant post penalty — proportional to post importance
      intlMod -= 0.3 * post.internationalWeight;
      tradeMod -= 0.2 * post.tradeWeight;
      milMod -= 0.2 * post.militaryWeight;
      continue;
    }

    const character = state.characters[appt.characterName];
    if (!character) continue;

    const competence = character.competencies.professional.diplomacy;
    // 70 is neutral — above boosts, below drags
    const competenceModifier = (competence - 70) / 100;

    intlMod += competenceModifier * post.internationalWeight;
    tradeMod += competenceModifier * post.tradeWeight;
    milMod += competenceModifier * post.militaryWeight;

    // Track effective weight (how much of total capacity is being utilized)
    const effectivenessContrib = Math.max(0, competence / 100) * postImportance;
    effectiveWeight += effectivenessContrib;
  }

  const effectiveness = totalWeight > 0
    ? Math.round((effectiveWeight / totalWeight) * 100)
    : 50;

  return {
    internationalReputationModifier: Math.round(intlMod * 100) / 100,
    tradeModifier: Math.round(tradeMod * 100) / 100,
    militaryCoopModifier: Math.round(milMod * 100) / 100,
    effectiveness: Math.max(0, Math.min(100, effectiveness)),
  };
}

// ── 3. processVacancyEscalation ──

/**
 * Vacancy escalation timeline:
 *   Day 7:  Inbox message (advisory)
 *   Day 14: Decision desk event (mandatory for strategic/standard posts)
 *   Day 30: Daily briefing mention + trust penalty
 */
export function processVacancyEscalation(
  state: GameState,
): { events: ActiveEvent[]; inboxMessages: GameInboxMessage[]; consequences: Consequence[] } {
  const events: ActiveEvent[] = [];
  const inboxMessages: GameInboxMessage[] = [];
  const consequences: Consequence[] = [];
  const currentDay = state.day;
  const existingEventIds = new Set(state.activeEvents.map(e => e.id));

  for (const appt of state.diplomats.appointments) {
    if (appt.characterName !== null) continue; // Not vacant
    if (appt.vacantSinceDay === null) continue;

    const post = state.diplomats.posts.find(p => p.id === appt.postId);
    if (!post) continue;

    const vacantDays = currentDay - appt.vacantSinceDay;

    // Day 7: inbox message
    if (vacantDays === 7) {
      inboxMessages.push({
        id: `diplomat-vacancy-inbox-${post.id}-${currentDay}`,
        from: "Ministry of Foreign Affairs",
        subject: `Vacant Post: ${post.title}`,
        body: `The ${post.title} position has been vacant for a week. The Ministry of Foreign Affairs advises that an appointment be made promptly to maintain Nigeria's diplomatic presence in ${post.country}.`,
        priority: post.prestige === "strategic" ? "Urgent" : "Normal",
        category: "diplomacy",
        day: currentDay,
        read: false,
        archived: false,
      } as GameInboxMessage);
    }

    // Day 14: decision desk event (for bilateral + institution posts)
    if (vacantDays === 14 && post.category !== "minor") {
      const eventId = `diplomat-vacancy-fill-${post.id}`;
      if (existingEventIds.has(eventId)) continue;

      const allCandidates = post.category === "minor"
        ? getAllDiplomatCandidates()
        : HC_DIPLOMAT_CANDIDATES;

      // Find top 5 qualified candidates not currently serving
      const currentAmbassadors = new Set(
        state.diplomats.appointments
          .filter(a => a.characterName)
          .map(a => a.characterName!),
      );

      const candidates = allCandidates
        .filter(c =>
          c.qualifiedFor.includes(post.id) &&
          !currentAmbassadors.has(c.name) &&
          (post.languageRequired === "None" || c.languageSkills.includes(post.languageRequired as any))
        )
        .sort((a, b) => b.competence - a.competence)
        .slice(0, 5);

      if (candidates.length === 0) continue;

      const choices = candidates.map((candidate, idx) => ({
        id: `${eventId}-pick-${idx}`,
        label: `Appoint ${candidate.name}`,
        context: `${candidate.name} (${candidate.state}, ${candidate.zone}) — Competence: ${candidate.competence}. ${candidate.traits.slice(0, 2).join(", ")}. Languages: ${candidate.languageSkills.length > 0 ? candidate.languageSkills.join(", ") : "English only"}.`,
        consequences: [
          mkConsequence(
            `${eventId}-pick-${idx}-c`,
            eventId,
            `${candidate.name} appointed as ${post.title}`,
            [
              ...(candidate.competence >= 80
                ? [mkEffect("approval", 1, "Strong diplomatic appointment")]
                : []),
              ...(post.prestige === "strategic" && candidate.competence < 60
                ? [mkEffect("trust", -1, "Weak appointment to strategic post")]
                : []),
            ],
          ),
        ],
      }));

      events.push({
        id: eventId,
        title: `Vacant Post: ${post.title}`,
        severity: post.prestige === "strategic" ? "critical" : "warning",
        description: `The ${post.title} position has been vacant for two weeks. Nigeria's diplomatic relations with ${post.country} are suffering. You must appoint an ambassador immediately.`,
        category: "diplomacy",
        source: "cabinet-appointment",
        createdDay: currentDay,
        choices,
      });
    }

    // Day 30+: ongoing trust/reputation penalty
    if (vacantDays >= 30 && vacantDays % 30 === 0 && post.category !== "minor") {
      const severity = post.prestige === "strategic" ? 2 : 1;
      consequences.push(
        mkConsequence(
          `diplomat-prolonged-vacancy-${post.id}-${currentDay}`,
          "diplomat-vacancy",
          `${post.title} has been vacant for ${vacantDays} days — damaging Nigeria's ${post.country} relations`,
          [
            mkEffect("trust", -severity, `Prolonged vacancy at ${post.country} post`),
            mkEffect("approval", -1, "Foreign policy failures attract criticism"),
          ],
        ),
      );
    }
  }

  return { events, inboxMessages, consequences };
}

// ── 4. processDiplomatRotation ──

export function processDiplomatRotation(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; updatedAppointments: AmbassadorAppointment[] } {
  const events: ActiveEvent[] = [];
  const currentDay = state.day;
  const existingEventIds = new Set(state.activeEvents.map(e => e.id));
  const updatedAppointments = state.diplomats.appointments.map(a => ({ ...a }));

  for (let i = 0; i < updatedAppointments.length; i++) {
    const appt = updatedAppointments[i];
    if (!appt.characterName) continue;
    if (appt.rotationDueDay > currentDay) continue;

    const post = state.diplomats.posts.find(p => p.id === appt.postId);
    if (!post) continue;

    const eventId = `diplomat-rotation-${appt.postId}`;
    if (existingEventIds.has(eventId)) continue;

    // Find replacement candidates
    const currentAmbassadors = new Set(
      state.diplomats.appointments
        .filter(a => a.characterName && a.postId !== appt.postId)
        .map(a => a.characterName!),
    );

    const allCandidates = post.category === "minor"
      ? getAllDiplomatCandidates()
      : HC_DIPLOMAT_CANDIDATES;

    const candidates = allCandidates
      .filter(c =>
        c.qualifiedFor.includes(post.id) &&
        c.name !== appt.characterName &&
        !currentAmbassadors.has(c.name) &&
        (post.languageRequired === "None" || c.languageSkills.includes(post.languageRequired as any))
      )
      .sort((a, b) => b.competence - a.competence)
      .slice(0, 5);

    if (candidates.length === 0) continue;

    const severity: ActiveEvent["severity"] =
      post.prestige === "strategic" ? "warning" : "info";

    const choices = candidates.map((candidate, idx) => ({
      id: `${eventId}-pick-${idx}`,
      label: `Appoint ${candidate.name}`,
      context: `${candidate.name} (${candidate.state}, ${candidate.zone}) — Competence: ${candidate.competence}. ${candidate.traits.slice(0, 2).join(", ")}. Languages: ${candidate.languageSkills.length > 0 ? candidate.languageSkills.join(", ") : "English only"}.`,
      consequences: [
        mkConsequence(
          `${eventId}-pick-${idx}-c`,
          eventId,
          `${candidate.name} appointed as ${post.title}`,
          [
            ...(candidate.competence >= 80
              ? [mkEffect("approval", 1, "Strong diplomatic appointment")]
              : []),
            ...(post.prestige === "strategic" && candidate.competence < 60
              ? [mkEffect("trust", -1, "Weak appointment to strategic post")]
              : []),
          ],
        ),
      ],
    }));

    // Add "extend current ambassador" option
    choices.push({
      id: `${eventId}-extend`,
      label: `Extend ${appt.characterName}'s tour`,
      context: `Keep ${appt.characterName} in post for another year. Their familiarity with the host country could be beneficial.`,
      consequences: [
        mkConsequence(
          `${eventId}-extend-c`,
          eventId,
          `${appt.characterName}'s tour extended at ${post.country}`,
          [],
        ),
      ],
    });

    events.push({
      id: eventId,
      title: `Ambassador Rotation: ${post.country}`,
      severity,
      description: `${appt.characterName}'s tour as ${post.title} has ended after ${Math.floor((currentDay - appt.appointedDay) / 365)} years. You may select a replacement or extend their posting.`,
      category: "diplomacy",
      source: "cabinet-appointment",
      createdDay: currentDay,
      choices,
    });
  }

  return { events, updatedAppointments };
}

// ── 5. generateDiplomaticIncidents ──

export function generateDiplomaticIncidents(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; incidents: DiplomaticIncident[] } {
  const events: ActiveEvent[] = [];
  const incidents: DiplomaticIncident[] = [];
  const currentDay = state.day;

  // Low probability per turn — but more posts = more chances
  const filledPosts = state.diplomats.appointments.filter(a => a.characterName);

  for (const appt of filledPosts) {
    // ~1% chance per filled post per turn
    if (rng() > 0.01) continue;

    const post = state.diplomats.posts.find(p => p.id === appt.postId);
    const character = state.characters[appt.characterName!];
    if (!post || !character) continue;

    const competence = character.competencies.professional.diplomacy;

    if (competence > 78) {
      // Positive diplomatic event
      const eventType = rng() > 0.5 ? "bilateral-success" : "treaty-signed";
      const eventId = `diplomat-success-${appt.postId}-${currentDay}`;

      incidents.push({
        postId: appt.postId,
        day: currentDay,
        type: eventType,
        description: `${appt.characterName} achieved a diplomatic win in ${post.country}`,
        resolved: false,
      });

      const isTradeWin = post.tradeWeight > 0.4;
      events.push({
        id: eventId,
        title: eventType === "treaty-signed"
          ? `Treaty Progress: ${post.country}`
          : `Diplomatic Win: ${post.country}`,
        severity: "info",
        description: eventType === "treaty-signed"
          ? `${appt.characterName}, ${post.title}, has advanced a bilateral framework agreement with ${post.country}. This could strengthen Nigeria's ${isTradeWin ? "trade ties" : "international standing"} significantly.`
          : `${appt.characterName}, ${post.title}, has secured a favourable outcome in bilateral talks. Their diplomatic skill is earning Nigeria goodwill in ${post.region}.`,
        category: "diplomacy",
        source: "contextual",
        createdDay: currentDay,
        choices: [
          {
            id: `${eventId}-commend`,
            label: "Publicly commend the ambassador",
            context: "Highlight the diplomatic achievement in the media.",
            consequences: [
              mkConsequence(`${eventId}-commend-c`, eventId, "Ambassador commended", [
                mkEffect("approval", 1, "Diplomatic success boosts presidential image"),
                ...(isTradeWin ? [mkEffect("stability", 1, "Trade agreement boosts economic confidence")] : []),
              ]),
            ],
          },
          {
            id: `${eventId}-note`,
            label: "Take note",
            context: "Acknowledge internally without fanfare.",
            consequences: [],
          },
        ],
      });
    } else if (competence < 55) {
      // Negative diplomatic incident
      const incidentTypes: DiplomaticIncident["type"][] = ["gaffe", "protocol-breach", "trade-dispute", "security-leak"];
      const incidentType = incidentTypes[Math.floor(rng() * incidentTypes.length)];
      const eventId = `diplomat-incident-${appt.postId}-${currentDay}`;

      const incidentDescriptions: Record<string, string> = {
        "gaffe": `made embarrassing public remarks about ${post.country}'s leadership`,
        "protocol-breach": `committed a serious diplomatic protocol violation at a state dinner`,
        "trade-dispute": `mishandled trade negotiations, resulting in a standoff with ${post.country}`,
        "security-leak": `was involved in a security breach at the embassy in ${post.country}`,
      };

      incidents.push({
        postId: appt.postId,
        day: currentDay,
        type: incidentType,
        description: `${appt.characterName} ${incidentDescriptions[incidentType]}`,
        resolved: false,
      });

      events.push({
        id: eventId,
        title: `Diplomatic Incident: ${post.country}`,
        severity: post.prestige === "strategic" ? "critical" : "warning",
        description: `${appt.characterName}, ${post.title}, has ${incidentDescriptions[incidentType]}. ${post.country}'s government has expressed displeasure through official channels.`,
        category: "diplomacy",
        source: "contextual",
        createdDay: currentDay,
        choices: [
          {
            id: `${eventId}-recall`,
            label: "Recall the ambassador immediately",
            context: "Remove them from the posting. Post becomes vacant until a replacement is found.",
            consequences: [
              mkConsequence(`${eventId}-recall-c`, eventId, "Ambassador recalled from post", [
                mkEffect("trust", 1, "Swift action shows diplomatic seriousness"),
                mkEffect("stability", -1, "Diplomatic reshuffle creates uncertainty"),
              ]),
            ],
          },
          {
            id: `${eventId}-reprimand`,
            label: "Issue a private reprimand",
            context: "Warn them but keep them in post. Risk of repeat incidents.",
            consequences: [
              mkConsequence(`${eventId}-reprimand-c`, eventId, "Ambassador reprimanded", [
                mkEffect("trust", -1, `${post.country} disappointed by lack of action`),
              ]),
            ],
          },
          ...(post.prestige === "strategic" ? [{
            id: `${eventId}-apologize`,
            label: "Issue a formal apology to the host government",
            context: "Diplomatic gesture to repair the relationship. May save the ambassador's position.",
            consequences: [
              mkConsequence(`${eventId}-apologize-c`, eventId, "Formal apology issued", [
                mkEffect("approval", -1, "Opposition mocks presidential apology"),
              ]),
            ],
          }] : []),
        ],
      });
    }
  }

  return { events, incidents };
}

// ── 6. processDiplomats (main entry point) ──

export function processDiplomats(
  state: GameState,
  rng: () => number,
): ProcessDiplomatsResult {
  // 1. Process vacancy escalation
  const vacancyResult = processVacancyEscalation(state);

  // 2. Check for rotations due
  const { events: rotationEvents, updatedAppointments } = processDiplomatRotation(state, rng);

  // 3. Generate diplomatic incidents
  const { events: incidentEvents, incidents: newIncidents } = generateDiplomaticIncidents(state, rng);

  // 4. Merge updated state
  const updatedDiplomats: DiplomatSystemState = {
    ...state.diplomats,
    appointments: updatedAppointments,
    incidents: [...state.diplomats.incidents, ...newIncidents].slice(-50), // Keep last 50
    diplomaticEffectiveness: 0, // Will be computed below
  };

  // 5. Compute diplomatic effect on intermediate state
  const stateWithUpdatedDiplomats: GameState = { ...state, diplomats: updatedDiplomats };
  const { internationalReputationModifier, tradeModifier, militaryCoopModifier, effectiveness } =
    computeDiplomaticEffect(stateWithUpdatedDiplomats);

  updatedDiplomats.diplomaticEffectiveness = effectiveness;

  // 6. Build consequences
  const consequences: Consequence[] = [...vacancyResult.consequences];

  // Aggregate vacancy penalty for strategic posts
  const vacantStrategic = updatedDiplomats.appointments.filter(appt => {
    if (appt.characterName) return false;
    const post = updatedDiplomats.posts.find(p => p.id === appt.postId);
    return post?.prestige === "strategic";
  });

  if (vacantStrategic.length > 0) {
    consequences.push(
      mkConsequence(
        `diplomat-vacancy-penalty-${state.day}`,
        "diplomat-vacancy",
        `${vacantStrategic.length} strategic ambassador post(s) remain vacant`,
        [
          mkEffect("trust", -1, "Vacant ambassadorial posts undermine international credibility"),
        ],
      ),
    );
  }

  return {
    updatedDiplomats,
    newEvents: [...vacancyResult.events, ...rotationEvents, ...incidentEvents],
    consequences,
    inboxMessages: vacancyResult.inboxMessages,
    internationalModifier: internationalReputationModifier,
    tradeModifier,
    militaryCoopModifier,
  };
}
