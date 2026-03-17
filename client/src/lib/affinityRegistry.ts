// client/src/lib/affinityRegistry.ts
// Inter-NPC relationship mesh — affinity computation, appointment ripple,
// coalition pressure, rivalry eruptions, gender friction, link seeding & cleanup.

import type {
  GameState,
  ActiveEvent,
  Consequence,
  GameInboxMessage,
  CharacterState,
} from "./gameTypes";
import { getZoneForState } from "./zones";

// ══════════════════════════════════════════════════════════════
// NPCLink — explicit relationship between two NPC characters
// ══════════════════════════════════════════════════════════════

export interface NPCLink {
  characterA: string;
  systemA: string;
  characterB: string;
  systemB: string;
  type: "mentor" | "rival" | "ally" | "patron-client" | "kinship";
  strength: number; // 1 (mild), 2 (moderate), 3 (strong)
}

// ══════════════════════════════════════════════════════════════
// computeAffinity — implicit affinity score between two characters
// ══════════════════════════════════════════════════════════════

/**
 * Compute an implicit affinity score between two characters based on shared attributes.
 * Returns a value from -20 to +20 (current formula is additive positives only, capped at 24).
 * The range reflects that characters with nothing in common score 0, while maximum overlap
 * yields +24 (zone +5, faction +7, religion +3, ethnicity +6, gender +3).
 */
export function computeAffinity(
  charA: CharacterState,
  charB: CharacterState,
): number {
  let score = 0;

  // Same geopolitical zone
  const zoneA = charA.state ? getZoneForState(charA.state)?.name : undefined;
  const zoneB = charB.state ? getZoneForState(charB.state)?.name : undefined;
  if (zoneA && zoneB && zoneA === zoneB) {
    score += 5;
  }

  // Same faction
  if (charA.faction && charB.faction && charA.faction === charB.faction) {
    score += 7;
  }

  // Same religion
  if (charA.religion && charB.religion && charA.religion === charB.religion) {
    score += 3;
  }

  // Same ethnicity
  if (charA.ethnicity && charB.ethnicity && charA.ethnicity === charB.ethnicity) {
    score += 6;
  }

  // Same gender
  if (charA.gender && charB.gender && charA.gender === charB.gender) {
    score += 3;
  }

  // Clamp to -20 to +20 range per spec
  return Math.max(-20, Math.min(20, score));
}

// ══════════════════════════════════════════════════════════════
// processAppointmentRipple — relationship shifts from appoint/dismiss
// ══════════════════════════════════════════════════════════════

const APPOINTMENT_RIPPLE: Record<NPCLink["type"], { appoint: number; dismiss: number }> = {
  "mentor":         { appoint: 5,  dismiss: -8 },
  "patron-client":  { appoint: 5,  dismiss: -8 },
  "rival":          { appoint: -3, dismiss: 3  },
  "ally":           { appoint: 3,  dismiss: -5 },
  "kinship":        { appoint: 2,  dismiss: -3 },
};

export interface AppointmentRippleResult {
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
}

/**
 * Scan npcLinks for references to characterName and produce relationship-shift consequences.
 * @param action "appoint" or "dismiss"
 * @param isHighPrestige true for military chiefs, paramount agency directors, key bilateral ambassadors
 * @param characterGender optional gender of the character being appointed/dismissed
 */
export function processAppointmentRipple(
  state: GameState,
  characterName: string,
  action: "appoint" | "dismiss",
  isHighPrestige: boolean,
  characterGender?: string,
): AppointmentRippleResult {
  const consequences: Consequence[] = [];
  const inboxMessages: GameInboxMessage[] = [];

  const links = state.npcLinks ?? [];

  for (const link of links) {
    // Find links where the character is involved
    let linkedChar: string | null = null;
    if (link.characterA === characterName) linkedChar = link.characterB;
    else if (link.characterB === characterName) linkedChar = link.characterA;
    if (!linkedChar) continue;

    const ripple = APPOINTMENT_RIPPLE[link.type];
    if (!ripple) continue;

    const delta = action === "appoint" ? ripple.appoint : ripple.dismiss;
    if (delta === 0) continue;

    // Find the linked character in state to check if they exist
    const linkedCharState = state.characters?.[linkedChar];
    if (!linkedCharState) continue;

    const actionLabel = action === "appoint" ? "appointment" : "dismissal";
    const description = `${linkedChar}'s relationship shifted by ${delta > 0 ? "+" : ""}${delta} due to ${characterName}'s ${actionLabel} (${link.type} link)`;

    consequences.push({
      id: `ripple-${linkedChar}-${action}-${state.day}`,
      sourceEvent: `appointment-ripple-${characterName}`,
      delayDays: 0,
      description,
      effects: [
        {
          target: "character",
          characterName: linkedChar,
          delta,
          description,
        },
      ],
    });
  }

  // Gender affinity: batched approval consequence for women in high-prestige positions
  if (
    isHighPrestige &&
    characterGender?.toLowerCase() === "female"
  ) {
    const genderDelta = action === "appoint" ? 1 : -1;
    const genderDesc = action === "appoint"
      ? "Women across government rally behind the appointment"
      : "Women's groups question the removal";

    consequences.push({
      id: `gender-solidarity-${action}-${state.day}`,
      sourceEvent: `gender-solidarity-${characterName}`,
      delayDays: 0,
      description: genderDesc,
      effects: [
        {
          target: "approval",
          delta: genderDelta,
          description: genderDesc,
        },
      ],
    });
  }

  return { consequences, inboxMessages };
}

// ══════════════════════════════════════════════════════════════
// processCoalitionPressure — godfather stage 3+ ally sympathy
// ══════════════════════════════════════════════════════════════

export interface CoalitionPressureResult {
  events: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
}

/**
 * Iterate godfathers at escalation stage 3+, find their links in npcLinks,
 * fire sympathy events at strength-weighted probability.
 */
export function processCoalitionPressure(
  state: GameState,
  rng: () => number,
): CoalitionPressureResult {
  const events: ActiveEvent[] = [];
  const consequences: Consequence[] = [];
  const inboxMessages: GameInboxMessage[] = [];

  if (!state.patronage?.godfathers?.length) return { events, consequences, inboxMessages };

  const links = state.npcLinks ?? [];

  for (const gf of state.patronage.godfathers) {
    if (gf.neutralized) continue;
    if (gf.escalationStage < 3) continue;

    // Find links where this godfather is characterA or characterB
    const gfLinks = links.filter(
      (l) => l.characterA === gf.name || l.characterB === gf.name,
    );

    for (const link of gfLinks) {
      // Strength-weighted probability: 40% str 3, 25% str 2, 10% str 1
      const threshold =
        link.strength === 3 ? 0.4 : link.strength === 2 ? 0.25 : 0.1;

      if (rng() >= threshold) continue;

      const allyName =
        link.characterA === gf.name ? link.characterB : link.characterA;

      events.push({
        id: `coalition-pressure-${gf.id}-${allyName}-${state.day}`,
        title: `${allyName} backs ${gf.name}`,
        severity: "warning",
        description: `${allyName} has expressed public support for ${gf.name}'s position, adding political pressure on the presidency.`,
        category: "politics",
        source: "godfather-pressure",
        choices: [
          {
            id: "acknowledge",
            label: "Acknowledge the pressure",
            context: "Accept that the coalition is growing.",
            consequences: [
              {
                id: `coalition-ack-${state.day}`,
                sourceEvent: `coalition-pressure-${gf.id}`,
                delayDays: 0,
                description: "Coalition pressure noted",
                effects: [
                  { target: "stability", delta: -1, description: "Growing coalition destabilises" },
                ],
              },
            ],
          },
          {
            id: "counter",
            label: "Counter the narrative",
            context: "Spend political capital to push back.",
            consequences: [
              {
                id: `coalition-counter-${state.day}`,
                sourceEvent: `coalition-pressure-${gf.id}`,
                delayDays: 0,
                description: "Countered coalition pressure",
                effects: [
                  { target: "politicalCapital", delta: -2, description: "Resources spent countering" },
                ],
              },
            ],
          },
        ],
        createdDay: state.day,
      });
    }
  }

  return { events, consequences, inboxMessages };
}

// ══════════════════════════════════════════════════════════════
// processRivalryEruptions — cross-system conflict events from rival links
// ══════════════════════════════════════════════════════════════

export interface RivalryEruptionResult {
  events: ActiveEvent[];
  consequences: Consequence[];
}

/**
 * Iterate rival links. 2% chance per link per turn to generate a cross-system
 * conflict event with 3 choices (Support A / Support B / Neutral).
 */
export function processRivalryEruptions(
  state: GameState,
  rng: () => number,
): RivalryEruptionResult {
  const events: ActiveEvent[] = [];
  const consequences: Consequence[] = [];

  const links = state.npcLinks ?? [];
  const rivalLinks = links.filter((l) => l.type === "rival");

  for (const link of rivalLinks) {
    if (rng() >= 0.02) continue;

    const charA = state.characters?.[link.characterA];
    const charB = state.characters?.[link.characterB];
    if (!charA || !charB) continue;

    events.push({
      id: `rivalry-eruption-${link.characterA}-${link.characterB}-${state.day}`,
      title: `${link.characterA} vs ${link.characterB}`,
      severity: "warning",
      description: `${link.characterA} and ${link.characterB} are publicly clashing. Both expect presidential support.`,
      category: "politics",
      source: "contextual",
      choices: [
        {
          id: "support-a",
          label: `Support ${link.characterA}`,
          context: `Back ${link.characterA} in this dispute.`,
          consequences: [
            {
              id: `rivalry-a-${state.day}`,
              sourceEvent: `rivalry-${link.characterA}-${link.characterB}`,
              delayDays: 0,
              description: `Sided with ${link.characterA}`,
              effects: [
                { target: "character", characterName: link.characterA, delta: 10, description: `${link.characterA} is grateful for your support` },
                { target: "character", characterName: link.characterB, delta: -10, description: `${link.characterB} feels betrayed` },
              ],
            },
          ],
        },
        {
          id: "support-b",
          label: `Support ${link.characterB}`,
          context: `Back ${link.characterB} in this dispute.`,
          consequences: [
            {
              id: `rivalry-b-${state.day}`,
              sourceEvent: `rivalry-${link.characterA}-${link.characterB}`,
              delayDays: 0,
              description: `Sided with ${link.characterB}`,
              effects: [
                { target: "character", characterName: link.characterB, delta: 10, description: `${link.characterB} is grateful for your support` },
                { target: "character", characterName: link.characterA, delta: -10, description: `${link.characterA} feels betrayed` },
              ],
            },
          ],
        },
        {
          id: "neutral",
          label: "Stay neutral",
          context: "Refuse to take sides.",
          consequences: [
            {
              id: `rivalry-neutral-${state.day}`,
              sourceEvent: `rivalry-${link.characterA}-${link.characterB}`,
              delayDays: 0,
              description: "Presidential neutrality noted",
              effects: [
                { target: "character", characterName: link.characterA, delta: -3, description: `${link.characterA} is disappointed` },
                { target: "character", characterName: link.characterB, delta: -3, description: `${link.characterB} is disappointed` },
              ],
            },
          ],
        },
      ],
      createdDay: state.day,
    });
  }

  return { events, consequences };
}

// ══════════════════════════════════════════════════════════════
// processGenderFriction — conservative backlash against women in high positions
// ══════════════════════════════════════════════════════════════

/** Position IDs considered high-prestige for gender friction checks */
const HIGH_PRESTIGE_POSITIONS = new Set([
  "chief-army-staff", "chief-naval-staff", "chief-air-staff",
  "chief-defence-staff", "inspector-general-police", "comptroller-customs",
  "cbn-governor", "nnpc-gmd", "director-dss",
  "amb-usa", "amb-uk", "amb-china", "amb-france", "amb-germany",
]);

export interface GenderFrictionResult {
  events: ActiveEvent[];
  consequences: Consequence[];
}

/**
 * Find women in high-prestige positions. Check traditional rulers / religious leaders
 * with integrity < 50. 4% chance per eligible critic per turn to generate a reaction event.
 */
export function processGenderFriction(
  state: GameState,
  rng: () => number,
): GenderFrictionResult {
  const events: ActiveEvent[] = [];
  const consequences: Consequence[] = [];

  // Find women in high-prestige positions
  const womenInHighPositions: string[] = [];

  // Check military appointments
  for (const appt of state.military?.appointments ?? []) {
    if (!appt.characterName || !HIGH_PRESTIGE_POSITIONS.has(appt.positionId)) continue;
    const char = state.characters?.[appt.characterName];
    if (char?.gender?.toLowerCase() === "female") {
      womenInHighPositions.push(appt.characterName);
    }
  }

  // Check director appointments
  for (const appt of state.directors?.appointments ?? []) {
    if (!appt.characterName || !HIGH_PRESTIGE_POSITIONS.has(appt.positionId)) continue;
    const char = state.characters?.[appt.characterName];
    if (char?.gender?.toLowerCase() === "female") {
      womenInHighPositions.push(appt.characterName);
    }
  }

  // Check diplomat appointments
  for (const appt of state.diplomats?.appointments ?? []) {
    if (!appt.characterName) continue;
    const postId = appt.postId ?? (appt as any).positionId;
    if (!HIGH_PRESTIGE_POSITIONS.has(postId)) continue;
    const char = state.characters?.[appt.characterName];
    if (char?.gender?.toLowerCase() === "female") {
      womenInHighPositions.push(appt.characterName);
    }
  }

  if (womenInHighPositions.length === 0) return { events, consequences };

  // Find conservative critics: traditional rulers / religious leaders with integrity < 50
  const critics: Array<{ name: string; system: string }> = [];

  for (const appt of state.traditionalRulers?.appointments ?? []) {
    if (!appt.characterName) continue;
    const char = state.characters?.[appt.characterName];
    if (!char) continue;
    if (char.gender?.toLowerCase() === "female") continue; // Women don't generate this friction
    const integrity = char.competencies?.personal?.integrity ?? 50;
    if (integrity < 50) {
      critics.push({ name: appt.characterName, system: "traditional-rulers" });
    }
  }

  for (const appt of state.religiousLeaders?.appointments ?? []) {
    if (!appt.characterName) continue;
    const char = state.characters?.[appt.characterName];
    if (!char) continue;
    const integrity = char.competencies?.personal?.integrity ?? 50;
    if (integrity < 50) {
      critics.push({ name: appt.characterName, system: "religious-leaders" });
    }
  }

  // 4% chance per critic per woman per turn
  for (const woman of womenInHighPositions) {
    for (const critic of critics) {
      if (rng() >= 0.04) continue;

      events.push({
        id: `gender-friction-${critic.name}-${woman}-${state.day}`,
        title: `${critic.name} questions appointment`,
        severity: "warning",
        description: `${critic.name} has publicly questioned the appointment of ${woman} to a high-prestige position.`,
        category: "politics",
        source: "contextual",
        choices: [
          {
            id: "rebuke",
            label: "Rebuke publicly",
            context: `Defend ${woman}'s appointment and condemn the criticism.`,
            consequences: [
              {
                id: `gender-rebuke-${state.day}`,
                sourceEvent: `gender-friction-${critic.name}`,
                delayDays: 0,
                description: `Public rebuke of ${critic.name}`,
                effects: [
                  { target: "approval", delta: 3, description: "Public approves the progressive stance" },
                  { target: "character", characterName: critic.name, delta: -10, description: `${critic.name} is humiliated` },
                ],
              },
            ],
          },
          {
            id: "engage",
            label: "Engage privately",
            context: `Speak to ${critic.name} behind closed doors.`,
            consequences: [
              {
                id: `gender-engage-${state.day}`,
                sourceEvent: `gender-friction-${critic.name}`,
                delayDays: 0,
                description: `Private engagement with ${critic.name}`,
                effects: [
                  { target: "character", characterName: critic.name, delta: -3, description: `${critic.name} relents partially` },
                ],
              },
            ],
          },
          {
            id: "ignore",
            label: "Ignore",
            context: "Let the criticism stand without comment.",
            consequences: [
              {
                id: `gender-ignore-${state.day}`,
                sourceEvent: `gender-friction-${critic.name}`,
                delayDays: 0,
                description: "Gender criticism unchallenged",
                effects: [
                  { target: "approval", delta: -2, description: "Silence interpreted as agreement by progressives" },
                ],
              },
            ],
          },
        ],
        createdDay: state.day,
      });

      // Only one friction event per woman per turn
      break;
    }
  }

  return { events, consequences };
}

// ══════════════════════════════════════════════════════════════
// seedNPCLinks — generate 60-80 initial links at game start
// ══════════════════════════════════════════════════════════════

/** Family connection keywords to scan for in connectionDescriptions */
const KINSHIP_KEYWORDS = [
  "brother-in-law", "sister-in-law", "son-in-law", "daughter-in-law",
  "father-in-law", "mother-in-law",
  "daughter of", "son of", "married into", "married to",
  "nephew", "niece", "uncle", "cousin",
];

/**
 * Generate initial NPCLink array from godfather interests, oligarch rivalries,
 * and kinship references in character descriptions.
 */
export function seedNPCLinks(state: GameState): NPCLink[] {
  const links: NPCLink[] = [];

  // 1. Godfathers → traditionalRulerAllies / religiousLeaderAllies → patron-client (strength 3)
  for (const gf of state.patronage?.godfathers ?? []) {
    for (const allyId of gf.stable.traditionalRulerAllies ?? []) {
      // Find character name for this ruler position
      const appt = state.traditionalRulers?.appointments?.find(
        (a) => a.positionId === allyId,
      );
      if (appt?.characterName) {
        links.push({
          characterA: gf.name,
          systemA: "godfathers",
          characterB: appt.characterName,
          systemB: "traditional-rulers",
          type: "patron-client",
          strength: 3,
        });
      }
    }

    for (const allyId of gf.stable.religiousLeaderAllies ?? []) {
      const appt = state.religiousLeaders?.appointments?.find(
        (a) => a.positionId === allyId,
      );
      if (appt?.characterName) {
        links.push({
          characterA: gf.name,
          systemA: "godfathers",
          characterB: appt.characterName,
          systemB: "religious-leaders",
          type: "patron-client",
          strength: 3,
        });
      }
    }

    // 2. Godfathers → military/director interests → check current holder zone match → ally (strength 2)
    for (const posId of gf.stable.militaryInterests ?? []) {
      const appt = state.military?.appointments?.find(
        (a) => a.positionId === posId,
      );
      if (!appt?.characterName) continue;
      const holderChar = state.characters?.[appt.characterName];
      if (!holderChar?.state) continue;
      const holderZone = getZoneForState(holderChar.state)?.name;
      if (holderZone === gf.zone) {
        links.push({
          characterA: gf.name,
          systemA: "godfathers",
          characterB: appt.characterName,
          systemB: "military",
          type: "ally",
          strength: 2,
        });
      }
    }

    for (const posId of gf.stable.directorInterests ?? []) {
      const appt = state.directors?.appointments?.find(
        (a) => a.positionId === posId,
      );
      if (!appt?.characterName) continue;
      const holderChar = state.characters?.[appt.characterName];
      if (!holderChar?.state) continue;
      const holderZone = getZoneForState(holderChar.state)?.name;
      if (holderZone === gf.zone) {
        links.push({
          characterA: gf.name,
          systemA: "godfathers",
          characterB: appt.characterName,
          systemB: "directors",
          type: "ally",
          strength: 2,
        });
      }
    }
  }

  // 3. Business oligarchs → find pairs in same sector with different zones → rival (strength 2, cap 15)
  const godfathers = state.patronage?.godfathers ?? [];
  // Group oligarchs by archetype to find oligarch-type godfathers
  const oligarchs = godfathers.filter((gf) => gf.archetype === "business-oligarch");
  let rivalCount = 0;
  const maxRivals = 15;

  for (let i = 0; i < oligarchs.length && rivalCount < maxRivals; i++) {
    for (let j = i + 1; j < oligarchs.length && rivalCount < maxRivals; j++) {
      const a = oligarchs[i];
      const b = oligarchs[j];
      // Check if they share interests (same policy areas) but different zones
      if (a.zone !== b.zone) {
        const sharedInterests = a.interests.filter((int) =>
          b.interests.some((bInt) => bInt === int),
        );
        if (sharedInterests.length > 0) {
          links.push({
            characterA: a.name,
            systemA: "godfathers",
            characterB: b.name,
            systemB: "godfathers",
            type: "rival",
            strength: 2,
          });
          rivalCount++;
        }
      }
    }
  }

  // 4. Kinship links from character descriptions referencing family connections
  const kinshipLinks: NPCLink[] = [];
  // Scan godfather descriptions and connectionDescriptions for kinship keywords
  for (const gf of godfathers) {
    const textsToScan = [
      gf.description,
      ...gf.stable.connections.map((c) => c.description),
    ];

    for (const text of textsToScan) {
      if (!text) continue;
      const lower = text.toLowerCase();
      const hasKinship = KINSHIP_KEYWORDS.some((kw) => lower.includes(kw));
      if (!hasKinship) continue;

      // Try to find a cross-system character from the same zone
      const crossSystemChars = Object.entries(state.characters ?? {}).filter(([name, char]) => {
        if (name === gf.name) return false;
        const charZone = char.state ? getZoneForState(char.state)?.name : undefined;
        return charZone === gf.zone && char.faction !== gf.archetype;
      });

      if (crossSystemChars.length > 0) {
        // Pick a deterministic match based on name hash
        const idx = gf.name.length % crossSystemChars.length;
        const [matchName] = crossSystemChars[idx];
        // Don't duplicate
        const alreadyLinked = [...links, ...kinshipLinks].some(
          (l) =>
            (l.characterA === gf.name && l.characterB === matchName) ||
            (l.characterA === matchName && l.characterB === gf.name),
        );
        if (!alreadyLinked) {
          kinshipLinks.push({
            characterA: gf.name,
            systemA: "godfathers",
            characterB: matchName,
            systemB: guessSystem(matchName, state),
            type: "kinship",
            strength: 2,
          });
        }
      }
    }
  }

  // If fewer than 5 kinship links found, supplement with zone-matched cross-system pairs
  if (kinshipLinks.length < 5) {
    const needed = 5 - kinshipLinks.length;
    const allChars = Object.entries(state.characters ?? {});
    let added = 0;

    for (let i = 0; i < allChars.length && added < needed; i++) {
      const [nameA, charA] = allChars[i];
      const zoneA = charA.state ? getZoneForState(charA.state)?.name : undefined;
      if (!zoneA) continue;

      for (let j = i + 1; j < allChars.length && added < needed; j++) {
        const [nameB, charB] = allChars[j];
        const zoneB = charB.state ? getZoneForState(charB.state)?.name : undefined;
        if (zoneA !== zoneB) continue;
        if (charA.faction === charB.faction) continue; // Cross-system pairs

        const alreadyLinked = [...links, ...kinshipLinks].some(
          (l) =>
            (l.characterA === nameA && l.characterB === nameB) ||
            (l.characterA === nameB && l.characterB === nameA),
        );
        if (!alreadyLinked) {
          kinshipLinks.push({
            characterA: nameA,
            systemA: guessSystem(nameA, state),
            characterB: nameB,
            systemB: guessSystem(nameB, state),
            type: "kinship",
            strength: 1,
          });
          added++;
        }
      }
    }
  }

  links.push(...kinshipLinks);

  return links;
}

/** Best-effort system type guess from state data */
function guessSystem(characterName: string, state: GameState): string {
  if (state.military?.appointments?.some((a) => a.characterName === characterName)) return "military";
  if (state.diplomats?.appointments?.some((a) => a.characterName === characterName)) return "diplomats";
  if (state.directors?.appointments?.some((a) => a.characterName === characterName)) return "directors";
  if (state.traditionalRulers?.appointments?.some((a) => a.characterName === characterName)) return "traditional-rulers";
  if (state.religiousLeaders?.appointments?.some((a) => a.characterName === characterName)) return "religious-leaders";
  if (state.patronage?.godfathers?.some((g) => g.name === characterName)) return "godfathers";
  // Check cabinet
  for (const [, name] of Object.entries(state.cabinetAppointments ?? {})) {
    if (name === characterName) return "cabinet";
  }
  return "unknown";
}

// ══════════════════════════════════════════════════════════════
// cleanupNPCLinks — remove/update links when a character exits
// ══════════════════════════════════════════════════════════════

/**
 * Clean up NPC links when a character exits the game.
 * - Death/retirement with no career transition: remove all links referencing charName
 * - Career transition: update systemA/systemB on matching links
 */
export function cleanupNPCLinks(
  links: NPCLink[],
  charName: string,
  exitReason: "remove" | "transition",
  newSystem?: string,
): NPCLink[] {
  if (exitReason === "remove") {
    return links.filter(
      (l) => l.characterA !== charName && l.characterB !== charName,
    );
  }

  // Career transition: update system references
  return links.map((l) => {
    if (l.characterA === charName && newSystem) {
      return { ...l, systemA: newSystem };
    }
    if (l.characterB === charName && newSystem) {
      return { ...l, systemB: newSystem };
    }
    return l;
  });
}
