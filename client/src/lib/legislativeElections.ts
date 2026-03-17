// client/src/lib/legislativeElections.ts
// Legislative leadership election engine — generates decision-desk events
// for Senate President, Deputy Senate President, Speaker, Deputy Speaker
// and auto-fills floor leaders, whips, and committee chairs.

import type { ActiveEvent, Consequence, GameState } from "./gameTypes";
import type { LegislativeLeader, LegislatureLeadership } from "./legislativeTypes";
import type { Senator } from "./senatorPool";
import type { HouseRep } from "./houseRepPool";
import { getSenatorPool } from "./senatorPool";
import { getHouseRepPool } from "./houseRepPool";
import type { CharacterState } from "./gameTypes";

// ── Constants ───────────────────────────────────────────────────────────────

const SENATE_ELECTION_DAY = 14;
const HOUSE_ELECTION_DAY = 21;
const POST_ELECTION_FILL_DAY = 28;

/** Ruling party abbreviation used to decide ruling-vs-opposition splits */
const RULING_PARTY = "ADU";

/** Allied parties whose members can contest ruling-side leadership positions */
const ALLIED_PARTIES = new Set(["ADU", "TLA", "PAP"]);

// ── Helper: generate avatar initials ────────────────────────────────────────

function avatarFromName(name: string): string {
  const cleaned = name.replace(/^(Sen\.|Rt\. Hon\.|Hon\.) /, "");
  const parts = cleaned.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// ── Core: generate a leadership election event ──────────────────────────────

export function generateLeadershipElectionEvent(
  chamber: "senate" | "house",
  position: string,
  candidates: { name: string; party: string; state: string; bio: string }[],
  day: number,
): ActiveEvent {
  const chamberLabel = chamber === "senate" ? "Senate" : "House";
  const eventId = `leg-election-${chamber}-${position.toLowerCase().replace(/\s+/g, "-")}-d${day}`;

  const choices = candidates.map((c, i) => {
    const choiceId = `${eventId}-choice-${i}`;
    return {
      id: choiceId,
      label: `Endorse ${c.name} (${c.party}, ${c.state})`,
      context: c.bio,
      consequences: [
        {
          id: `${choiceId}-con`,
          sourceEvent: eventId,
          delayDays: 0,
          effects: [
            {
              target: "politicalCapital" as const,
              delta: -2,
              description: `Political capital spent endorsing ${c.name} for ${position}.`,
            },
          ],
          description: `You endorsed ${c.name} for ${position}.`,
        },
      ],
    };
  });

  return {
    id: eventId,
    title: `${chamberLabel}: ${position} Election`,
    severity: "info",
    description: `The ${chamberLabel} is holding its leadership election for the position of ${position}. Your endorsement carries weight but is not a guarantee.`,
    category: "politics",
    source: "contextual",
    choices,
    createdDay: day,
  };
}

// ── Senate elections (day 14) ───────────────────────────────────────────────

export function generateSenateElections(
  state: GameState,
  rng: () => number,
): ActiveEvent[] {
  const senators = getSenatorPool();
  const events: ActiveEvent[] = [];

  // Senate President — top 4 from ruling/allied parties by influence+competence
  const spCandidates = senators
    .filter((s) => ALLIED_PARTIES.has(s.party))
    .sort((a, b) => (b.influence + b.competence) - (a.influence + a.competence))
    .slice(0, 4)
    .map((s) => ({ name: s.name, party: s.party, state: s.state, bio: s.bio }));

  if (spCandidates.length > 0) {
    events.push(
      generateLeadershipElectionEvent("senate", "Senate President", spCandidates, state.day),
    );
  }

  // Deputy Senate President — top 4 from different zones than SP candidates
  const spZones = new Set(spCandidates.map((c) => {
    const senator = senators.find((s) => s.name === c.name);
    return senator?.zone;
  }));

  const dspCandidates = senators
    .filter((s) => ALLIED_PARTIES.has(s.party) && !spZones.has(s.zone))
    .sort((a, b) => (b.influence + b.competence) - (a.influence + a.competence))
    .slice(0, 4)
    .map((s) => ({ name: s.name, party: s.party, state: s.state, bio: s.bio }));

  if (dspCandidates.length > 0) {
    events.push(
      generateLeadershipElectionEvent("senate", "Deputy Senate President", dspCandidates, state.day),
    );
  }

  return events;
}

// ── House elections (day 21) ────────────────────────────────────────────────

export function generateHouseElections(
  state: GameState,
  rng: () => number,
): ActiveEvent[] {
  const reps = getHouseRepPool();
  const events: ActiveEvent[] = [];

  // Speaker — top 4 from ruling/allied parties by influence+competence
  const speakerCandidates = reps
    .filter((r) => ALLIED_PARTIES.has(r.party))
    .sort((a, b) => (b.influence + b.competence) - (a.influence + a.competence))
    .slice(0, 4)
    .map((r) => ({ name: r.name, party: r.party, state: r.state, bio: r.bio }));

  if (speakerCandidates.length > 0) {
    events.push(
      generateLeadershipElectionEvent("house", "Speaker of the House", speakerCandidates, state.day),
    );
  }

  // Deputy Speaker — top 4 from different zones
  const speakerZones = new Set(speakerCandidates.map((c) => {
    const rep = reps.find((r) => r.name === c.name);
    return rep?.zone;
  }));

  const dsCandidates = reps
    .filter((r) => ALLIED_PARTIES.has(r.party) && !speakerZones.has(r.zone))
    .sort((a, b) => (b.influence + b.competence) - (a.influence + a.competence))
    .slice(0, 4)
    .map((r) => ({ name: r.name, party: r.party, state: r.state, bio: r.bio }));

  if (dsCandidates.length > 0) {
    events.push(
      generateLeadershipElectionEvent("house", "Deputy Speaker", dsCandidates, state.day),
    );
  }

  return events;
}

// ── Post-election auto-fill ─────────────────────────────────────────────────

export function fillPostElectionPositions(
  state: GameState,
  rng: () => number,
): { leaders: LegislativeLeader[]; characters: Record<string, CharacterState> } {
  const senators = getSenatorPool();
  const reps = getHouseRepPool();
  const leaders: LegislativeLeader[] = [];
  const characters: Record<string, CharacterState> = {};

  // Helper: pick best from pool by competence, filtered by party predicate
  const pickBest = <T extends { name: string; competence: number; party: string }>(
    pool: T[],
    partyFilter: (party: string) => boolean,
    exclude: Set<string>,
  ): T | undefined => {
    return pool
      .filter((p) => partyFilter(p.party) && !exclude.has(p.name))
      .sort((a, b) => b.competence - a.competence)[0];
  };

  const usedNames = new Set<string>();

  // Collect already-elected leader names
  for (const leader of state.legislature.leadership.senateLeaders) {
    usedNames.add(leader.characterName);
  }
  for (const leader of state.legislature.leadership.houseLeaders) {
    usedNames.add(leader.characterName);
  }

  const isRuling = (party: string) => ALLIED_PARTIES.has(party);
  const isOpposition = (party: string) => !ALLIED_PARTIES.has(party);

  // Senate floor positions
  const senatePositions: { position: string; filter: (party: string) => boolean }[] = [
    { position: "Senate Majority Leader", filter: isRuling },
    { position: "Senate Minority Leader", filter: isOpposition },
    { position: "Senate Chief Whip", filter: isRuling },
    { position: "Senate Minority Whip", filter: isOpposition },
  ];

  for (const { position, filter } of senatePositions) {
    const pick = pickBest(senators, filter, usedNames);
    if (pick) {
      usedNames.add(pick.name);
      leaders.push({
        characterName: pick.name,
        position,
        chamber: "senate",
        electedDay: state.day,
      });
      characters[pick.name] = senatorToCharacterState(pick, position);
    }
  }

  // House floor positions
  const housePositions: { position: string; filter: (party: string) => boolean }[] = [
    { position: "House Majority Leader", filter: isRuling },
    { position: "House Minority Leader", filter: isOpposition },
    { position: "House Chief Whip", filter: isRuling },
    { position: "House Minority Whip", filter: isOpposition },
  ];

  for (const { position, filter } of housePositions) {
    const pick = pickBest(reps, filter, usedNames);
    if (pick) {
      usedNames.add(pick.name);
      leaders.push({
        characterName: pick.name,
        position,
        chamber: "house",
        electedDay: state.day,
      });
      characters[pick.name] = repToCharacterState(pick, position);
    }
  }

  return { leaders, characters };
}

// ── CharacterState converters ───────────────────────────────────────────────

function senatorToCharacterState(senator: Senator, portfolio: string): CharacterState {
  return {
    name: senator.name,
    portfolio,
    competencies: {
      personal: {
        loyalty: senator.loyalty,
        charisma: 55,
        leadership: senator.influence,
        ambition: 60,
        integrity: 55,
        resilience: 55,
        intrigue: 40,
      },
      professional: {
        economics: Math.round(senator.competence * 0.8),
        diplomacy: Math.round(senator.influence * 0.9),
        security: 45,
        media: 50,
        legal: Math.round(senator.competence * 0.9),
        administration: senator.competence,
        technology: 40,
      },
    },
    faction: senator.party,
    relationship: senator.loyalty >= 70 ? "Friendly" : senator.loyalty >= 50 ? "Neutral" : "Wary",
    avatar: senator.avatar,
    traits: senator.traits,
    hooks: [],
    biography: senator.bio,
    education: senator.education,
    religion: senator.religion,
    ethnicity: senator.ethnicity,
    party: senator.party,
    careerHistory: [],
    interactionLog: [],
    age: senator.age,
    state: senator.state,
    gender: senator.gender,
  };
}

function repToCharacterState(rep: HouseRep, portfolio: string): CharacterState {
  return {
    name: rep.name,
    portfolio,
    competencies: {
      personal: {
        loyalty: rep.loyalty,
        charisma: 55,
        leadership: rep.influence,
        ambition: 60,
        integrity: 55,
        resilience: 55,
        intrigue: 40,
      },
      professional: {
        economics: Math.round(rep.competence * 0.8),
        diplomacy: Math.round(rep.influence * 0.9),
        security: 45,
        media: 50,
        legal: Math.round(rep.competence * 0.9),
        administration: rep.competence,
        technology: 40,
      },
    },
    faction: rep.party,
    relationship: rep.loyalty >= 70 ? "Friendly" : rep.loyalty >= 50 ? "Neutral" : "Wary",
    avatar: rep.avatar,
    traits: rep.traits,
    hooks: [],
    biography: rep.bio,
    education: rep.education,
    religion: rep.religion,
    ethnicity: rep.ethnicity,
    party: rep.party,
    careerHistory: [],
    interactionLog: [],
    age: rep.age,
    state: rep.state,
    gender: rep.gender,
  };
}

// ── Seed legislature at game start ──────────────────────────────────────────

export function seedLegislature(
  seed: number,
): { characters: Record<string, CharacterState>; leadership: LegislatureLeadership } {
  // Simple inline RNG to avoid import cycles
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const senators = getSenatorPool();
  const reps = getHouseRepPool();
  const characters: Record<string, CharacterState> = {};

  // Create CharacterState entries for top senators (those most likely to matter)
  // We don't add all 109+360 — just the top ~20 from each chamber by influence+competence
  const topSenators = [...senators]
    .sort((a, b) => (b.influence + b.competence) - (a.influence + a.competence))
    .slice(0, 20);

  for (const senator of topSenators) {
    characters[senator.name] = senatorToCharacterState(senator, "Senator");
  }

  const topReps = [...reps]
    .sort((a, b) => (b.influence + b.competence) - (a.influence + a.competence))
    .slice(0, 20);

  for (const rep of topReps) {
    characters[rep.name] = repToCharacterState(rep, "House Representative");
  }

  return {
    characters,
    leadership: {
      senateLeaders: [],
      houseLeaders: [],
      leadershipElectionsDone: false,
      committeesFilled: false,
    },
  };
}

// ── Main orchestrator ───────────────────────────────────────────────────────

export interface ProcessLegislatureLeadershipResult {
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  updatedLeadership: LegislatureLeadership;
  newCharacters: Record<string, CharacterState>;
}

export function processLegislatureLeadership(
  state: GameState,
  rng: () => number,
): ProcessLegislatureLeadershipResult {
  const newEvents: ActiveEvent[] = [];
  const consequences: Consequence[] = [];
  let leadership = { ...state.legislature.leadership };
  const newCharacters: Record<string, CharacterState> = {};

  // Day 14: Senate leadership elections
  if (state.day === SENATE_ELECTION_DAY && leadership.senateLeaders.length === 0) {
    const senateEvents = generateSenateElections(state, rng);
    newEvents.push(...senateEvents);
  }

  // Day 21: House leadership elections
  if (state.day === HOUSE_ELECTION_DAY && leadership.houseLeaders.length === 0) {
    const houseEvents = generateHouseElections(state, rng);
    newEvents.push(...houseEvents);
  }

  // Day 28+: Auto-fill floor leaders and whips if elections are done
  if (
    state.day >= POST_ELECTION_FILL_DAY &&
    !leadership.committeesFilled &&
    leadership.senateLeaders.length >= 0 &&
    leadership.houseLeaders.length >= 0
  ) {
    const { leaders, characters } = fillPostElectionPositions(state, rng);

    const senateLeaders = [
      ...leadership.senateLeaders,
      ...leaders.filter((l) => l.chamber === "senate"),
    ];
    const houseLeaders = [
      ...leadership.houseLeaders,
      ...leaders.filter((l) => l.chamber === "house"),
    ];

    leadership = {
      senateLeaders,
      houseLeaders,
      leadershipElectionsDone: true,
      committeesFilled: true,
    };

    Object.assign(newCharacters, characters);
  }

  return { newEvents, consequences, updatedLeadership: leadership, newCharacters };
}
