// client/src/lib/judiciaryEngine.ts
// Judiciary turn processing engine — pure functions, no mutations.

import { getZoneForState } from "./zones";
import { getJudiciaryPool, type JusticeCandidate } from "./judiciaryPool";
import { seededRandom, pick } from "./seededRandom";
import type {
  JudiciaryState,
  JusticeProfile,
  JudicialPhilosophy,
} from "./judiciaryTypes";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
  EventChoice,
} from "./gameTypes";

// ── Result types ──

export interface ProcessJudiciaryResult {
  updatedJudiciary: JudiciaryState;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
}

export interface SeatJudiciaryResult {
  state: JudiciaryState;
  characters: Record<string, CharacterState>;
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

function philosophyLabel(p: JudicialPhilosophy): string {
  switch (p) {
    case "originalist": return "Strict textualist — interprets the constitution as written";
    case "activist": return "Judicial activist — willing to expand constitutional rights";
    case "deferential": return "Executive-deferential — gives latitude to government action";
    case "independent": return "Fiercely independent — unpredictable but fair-minded";
  }
}

function candidateToCharacterState(
  candidate: JusticeCandidate,
  portfolio: string,
): CharacterState {
  return {
    name: candidate.name,
    portfolio,
    competencies: {
      professional: {
        economics: 50,
        diplomacy: 50,
        security: 40,
        media: 40,
        legal: candidate.competence,
        administration: Math.round(candidate.competence * 0.8),
        technology: 35,
      },
      personal: {
        loyalty: 50,
        charisma: 50,
        leadership: 55,
        ambition: 45,
        integrity: candidate.integrity,
        resilience: 55,
        intrigue: 30,
      },
    },
    faction: "Independent",
    relationship: "Neutral",
    avatar: candidate.avatar,
    traits: candidate.traits,
    hooks: [],
    biography: candidate.bio,
    education: candidate.education,
    religion: candidate.religion,
    ethnicity: candidate.ethnicity,
    careerHistory: [],
    interactionLog: [],
    age: candidate.age,
    state: candidate.state,
    gender: candidate.gender,
  };
}

// ── 1. seatJudiciary ──

export function seatJudiciary(seed: number): SeatJudiciaryResult {
  const rng = seededRandom(seed);
  const pool = getJudiciaryPool();
  const characters: Record<string, CharacterState> = {};

  // Pick 10 SC justices from 25-pool, zone-balanced
  const scJustices = pickZoneBalanced(rng, pool.supremeCourtPool, 10);
  const scProfiles: JusticeProfile[] = scJustices.map((c, i) => ({
    characterName: c.name,
    philosophy: c.philosophy,
    seniorityRank: i + 1,
    appointedDay: 0,
    retirementAge: c.retirementAge,
  }));

  for (const c of scJustices) {
    characters[c.name] = candidateToCharacterState(c, "Supreme Court Justice");
  }

  // Pick 20 CA justices from 50-pool, zone-balanced
  const caJustices = pickZoneBalanced(rng, pool.appealCourtPool, 20);
  const caProfiles: JusticeProfile[] = caJustices.map((c, i) => ({
    characterName: c.name,
    philosophy: c.philosophy,
    seniorityRank: i + 1,
    appointedDay: 0,
    retirementAge: c.retirementAge,
  }));

  for (const c of caJustices) {
    characters[c.name] = candidateToCharacterState(c, "Court of Appeal Justice");
  }

  return {
    state: {
      supremeCourt: {
        justices: scProfiles,
        chiefJustice: null,
        cjnConfirmed: false,
      },
      courtOfAppeal: {
        justices: caProfiles,
        president: null,
        pcaConfirmed: false,
      },
      pendingNomination: {
        position: null,
        nominee: null,
        hearingDay: null,
      },
    },
    characters,
  };
}

function pickZoneBalanced(
  rng: () => number,
  pool: JusticeCandidate[],
  count: number,
): JusticeCandidate[] {
  const selected: JusticeCandidate[] = [];
  const usedNames = new Set<string>();
  const zoneUsage: Record<string, number> = {};

  const remaining = [...pool];

  while (selected.length < count && remaining.length > 0) {
    // Sort by zone underrepresentation
    remaining.sort((a, b) => {
      const za = a.zone;
      const zb = b.zone;
      return (zoneUsage[za] ?? 0) - (zoneUsage[zb] ?? 0);
    });

    // Pick from top candidates with some randomness
    const topN = remaining.slice(0, Math.min(3, remaining.length));
    const picked = topN[Math.floor(rng() * topN.length)];

    if (!usedNames.has(picked.name)) {
      selected.push(picked);
      usedNames.add(picked.name);
      zoneUsage[picked.zone] = (zoneUsage[picked.zone] ?? 0) + 1;
    }

    const idx = remaining.indexOf(picked);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  return selected;
}

// ── 2. processJudiciaryNominations ──

export function processJudiciaryNominations(
  state: GameState,
  rng: () => number,
): { events: ActiveEvent[]; updatedJudiciary: JudiciaryState } {
  const judiciary = state.judiciary;
  const events: ActiveEvent[] = [];

  // Day 35 (week 5): If CJN not confirmed → generate CJN nomination event
  if (
    state.day >= 35 &&
    !judiciary.supremeCourt.cjnConfirmed &&
    judiciary.pendingNomination.position !== "cjn"
  ) {
    const justices = judiciary.supremeCourt.justices;
    if (justices.length > 0) {
      const choices: EventChoice[] = justices.map((j, i) => {
        const char = state.characters[j.characterName];
        const compLabel = char
          ? `Competence: ${char.competencies.professional.legal}/100`
          : "";
        return {
          id: `nominate-cjn-${i}`,
          label: `Nominate ${j.characterName}`,
          context: `${philosophyLabel(j.philosophy)}. ${compLabel}. Seniority rank #${j.seniorityRank}.`,
          consequences: [
            mkConsequence(
              `cjn-nom-${j.characterName}`,
              "judiciary-nomination",
              `${j.characterName} nominated as Chief Justice of Nigeria`,
              [mkEffect("stability", 1, "Judicial nomination signals governance progress")],
            ),
          ],
        };
      });

      events.push({
        id: `judiciary-cjn-nomination-${state.day}`,
        title: "Supreme Court: Chief Justice Nomination",
        severity: "info",
        description:
          "The Supreme Court bench awaits your nomination for Chief Justice of Nigeria (CJN). " +
          "This appointment will shape the judiciary's direction for years to come. " +
          "Consider each justice's judicial philosophy, competence, and seniority.",
        category: "governance",
        source: "contextual",
        choices,
        createdDay: state.day,
      });
    }
  }

  // After CJN confirmed: If PCA not confirmed → generate PCA nomination event
  if (
    judiciary.supremeCourt.cjnConfirmed &&
    !judiciary.courtOfAppeal.pcaConfirmed &&
    judiciary.pendingNomination.position !== "pca" &&
    judiciary.pendingNomination.position !== "cjn" // not mid-CJN process
  ) {
    // Wait at least 3 days after CJN hearing resolved
    const cjnHearingDay = judiciary.pendingNomination.hearingDay;
    const readyForPCA = cjnHearingDay === null || state.day >= cjnHearingDay + 3;

    if (readyForPCA && state.day >= 38) {
      const justices = judiciary.courtOfAppeal.justices;
      if (justices.length > 0) {
        const choices: EventChoice[] = justices.map((j, i) => {
          const char = state.characters[j.characterName];
          const compLabel = char
            ? `Competence: ${char.competencies.professional.legal}/100`
            : "";
          return {
            id: `nominate-pca-${i}`,
            label: `Nominate ${j.characterName}`,
            context: `${philosophyLabel(j.philosophy)}. ${compLabel}. Seniority rank #${j.seniorityRank}.`,
            consequences: [
              mkConsequence(
                `pca-nom-${j.characterName}`,
                "judiciary-nomination",
                `${j.characterName} nominated as President of the Court of Appeal`,
                [mkEffect("stability", 1, "PCA nomination signals governance progress")],
              ),
            ],
          };
        });

        events.push({
          id: `judiciary-pca-nomination-${state.day}`,
          title: "Court of Appeal: President Nomination",
          severity: "info",
          description:
            "With the Chief Justice confirmed, the Court of Appeal now requires a President (PCA). " +
            "Select from the seated justices to lead this critical appellate court.",
          category: "governance",
          source: "contextual",
          choices,
          createdDay: state.day,
        });
      }
    }
  }

  return { events, updatedJudiciary: judiciary };
}

// ── 3. processConfirmationHearing ──

export function processConfirmationHearing(
  state: GameState,
  rng: () => number,
): {
  consequences: Consequence[];
  updatedJudiciary: JudiciaryState;
  events: ActiveEvent[];
} {
  const judiciary = state.judiciary;
  const pending = judiciary.pendingNomination;
  const consequences: Consequence[] = [];
  const events: ActiveEvent[] = [];

  if (!pending.position || !pending.nominee || pending.hearingDay === null) {
    return { consequences, updatedJudiciary: judiciary, events };
  }

  if (state.day !== pending.hearingDay) {
    return { consequences, updatedJudiciary: judiciary, events };
  }

  // Senate votes
  const nominee = pending.nominee;
  const char = state.characters[nominee];
  let confirmChance = 0.75;
  if (char) {
    const comp = char.competencies.professional.legal;
    const integ = char.competencies.personal.integrity;
    // High competence + integrity boost chance, low values reduce it
    confirmChance = Math.min(0.95, Math.max(0.25, 0.5 + (comp - 60) / 200 + (integ - 60) / 200));
  }

  const confirmed = rng() < confirmChance;

  if (confirmed) {
    let updatedJudiciary: JudiciaryState;

    if (pending.position === "cjn") {
      updatedJudiciary = {
        ...judiciary,
        supremeCourt: {
          ...judiciary.supremeCourt,
          chiefJustice: nominee,
          cjnConfirmed: true,
        },
        pendingNomination: { position: null, nominee: null, hearingDay: null },
      };

      events.push({
        id: `judiciary-cjn-confirmed-${state.day}`,
        title: "Chief Justice Confirmed",
        severity: "info",
        description: `The Senate has confirmed ${nominee} as Chief Justice of Nigeria. The judiciary now has its head.`,
        category: "governance",
        source: "contextual",
        choices: [
          {
            id: "acknowledge-cjn",
            label: "Welcome the Chief Justice",
            context: "A milestone for your administration's governance agenda.",
            consequences: [
              mkConsequence(
                `cjn-confirmed-${state.day}`,
                "judiciary-confirmation",
                "CJN confirmed",
                [
                  mkEffect("approval", 2, "Judicial appointment boosts governance credibility"),
                  mkEffect("stability", 2, "Judiciary leadership stabilizes the rule of law"),
                ],
              ),
            ],
          },
        ],
        createdDay: state.day,
      });
    } else {
      updatedJudiciary = {
        ...judiciary,
        courtOfAppeal: {
          ...judiciary.courtOfAppeal,
          president: nominee,
          pcaConfirmed: true,
        },
        pendingNomination: { position: null, nominee: null, hearingDay: null },
      };

      events.push({
        id: `judiciary-pca-confirmed-${state.day}`,
        title: "Court of Appeal President Confirmed",
        severity: "info",
        description: `The Senate has confirmed ${nominee} as President of the Court of Appeal. The appellate judiciary is now fully led.`,
        category: "governance",
        source: "contextual",
        choices: [
          {
            id: "acknowledge-pca",
            label: "Welcome the PCA",
            context: "The appellate courts now have unified leadership.",
            consequences: [
              mkConsequence(
                `pca-confirmed-${state.day}`,
                "judiciary-confirmation",
                "PCA confirmed",
                [
                  mkEffect("approval", 1, "Appellate court leadership appointment well received"),
                  mkEffect("stability", 1, "Court of Appeal now fully operational"),
                ],
              ),
            ],
          },
        ],
        createdDay: state.day,
      });
    }

    return { consequences, updatedJudiciary, events };
  } else {
    // Rejected
    consequences.push(
      mkConsequence(
        `nomination-rejected-${state.day}`,
        "judiciary-rejection",
        `Senate rejected the nomination of ${nominee}`,
        [mkEffect("approval", -2, "Failed judicial nomination embarrasses the presidency")],
      ),
    );

    const updatedJudiciary: JudiciaryState = {
      ...judiciary,
      pendingNomination: { position: null, nominee: null, hearingDay: null },
    };

    events.push({
      id: `judiciary-nomination-rejected-${state.day}`,
      title: `${pending.position === "cjn" ? "CJN" : "PCA"} Nomination Rejected`,
      severity: "warning",
      description: `The Senate has rejected ${nominee}'s nomination as ${pending.position === "cjn" ? "Chief Justice of Nigeria" : "President of the Court of Appeal"}. You will need to nominate another candidate.`,
      category: "governance",
      source: "contextual",
      choices: [
        {
          id: "acknowledge-rejection",
          label: "Acknowledge the setback",
          context: "The nomination process must restart.",
          consequences: [],
        },
      ],
      createdDay: state.day,
    });

    return { consequences, updatedJudiciary, events };
  }
}

// ── 4. processJudiciaryRetirements ──

export function processJudiciaryRetirements(
  state: GameState,
  rng: () => number,
): { updatedJudiciary: JudiciaryState; events: ActiveEvent[] } {
  const judiciary = state.judiciary;
  const events: ActiveEvent[] = [];
  const currentDay = state.day;

  function processCourtRetirements(
    justices: JusticeProfile[],
    courtLabel: string,
  ): JusticeProfile[] {
    const remaining: JusticeProfile[] = [];

    for (const justice of justices) {
      const char = state.characters[justice.characterName];
      const baseAge = char?.age ?? 60;
      const effectiveAge = baseAge + (currentDay - justice.appointedDay) / 365;

      // Mandatory retirement at retirementAge
      if (effectiveAge >= justice.retirementAge) {
        events.push({
          id: `judiciary-retirement-mandatory-${justice.characterName}-${currentDay}`,
          title: `${courtLabel} Justice Retires`,
          severity: "info",
          description: `Justice ${justice.characterName} has reached the mandatory retirement age and will leave the ${courtLabel} bench.`,
          category: "governance",
          source: "contextual",
          choices: [
            {
              id: "acknowledge-retirement",
              label: "Acknowledge the retirement",
              context: `Justice ${justice.characterName} served with distinction.`,
              consequences: [],
            },
          ],
          createdDay: currentDay,
        });
        continue; // Remove from bench
      }

      // Voluntary retirement chance at 65+
      if (effectiveAge >= 65 && rng() < 0.005) {
        events.push({
          id: `judiciary-retirement-voluntary-${justice.characterName}-${currentDay}`,
          title: `${courtLabel} Justice Retires Voluntarily`,
          severity: "info",
          description: `Justice ${justice.characterName} has announced voluntary retirement from the ${courtLabel}.`,
          category: "governance",
          source: "contextual",
          choices: [
            {
              id: "acknowledge-voluntary-retirement",
              label: "Wish them well",
              context: "A seat on the bench is now vacant.",
              consequences: [],
            },
          ],
          createdDay: currentDay,
        });
        continue; // Remove from bench
      }

      remaining.push(justice);
    }

    return remaining;
  }

  const updatedSCJustices = processCourtRetirements(
    judiciary.supremeCourt.justices,
    "Supreme Court",
  );
  const updatedCAJustices = processCourtRetirements(
    judiciary.courtOfAppeal.justices,
    "Court of Appeal",
  );

  // If CJN or PCA retired, clear their positions
  let updatedSC = { ...judiciary.supremeCourt, justices: updatedSCJustices };
  if (
    updatedSC.chiefJustice &&
    !updatedSCJustices.some(j => j.characterName === updatedSC.chiefJustice)
  ) {
    updatedSC = { ...updatedSC, chiefJustice: null, cjnConfirmed: false };
  }

  let updatedCA = { ...judiciary.courtOfAppeal, justices: updatedCAJustices };
  if (
    updatedCA.president &&
    !updatedCAJustices.some(j => j.characterName === updatedCA.president)
  ) {
    updatedCA = { ...updatedCA, president: null, pcaConfirmed: false };
  }

  return {
    updatedJudiciary: {
      supremeCourt: updatedSC,
      courtOfAppeal: updatedCA,
      pendingNomination: judiciary.pendingNomination,
    },
    events,
  };
}

// ── 5. handleNominationChoice ──
// Called when the player resolves a CJN/PCA nomination event.
// Sets the pendingNomination on the judiciary state.

export function handleNominationChoice(
  judiciary: JudiciaryState,
  position: "cjn" | "pca",
  nomineeName: string,
  currentDay: number,
): JudiciaryState {
  return {
    ...judiciary,
    pendingNomination: {
      position,
      nominee: nomineeName,
      hearingDay: currentDay + 7,
    },
  };
}

// ── 6. processJudiciary (main orchestrator) ──

export function processJudiciary(
  state: GameState,
  rng: () => number,
): ProcessJudiciaryResult {
  const allEvents: ActiveEvent[] = [];
  const allConsequences: Consequence[] = [];

  // 1. Process confirmation hearings (must come first — check if hearing day matches)
  const hearingResult = processConfirmationHearing(state, rng);
  let currentJudiciary = hearingResult.updatedJudiciary;
  allEvents.push(...hearingResult.events);
  allConsequences.push(...hearingResult.consequences);

  // Update state with hearing results for subsequent steps
  const stateAfterHearing: GameState = {
    ...state,
    judiciary: currentJudiciary,
  };

  // 2. Process nominations (may generate new nomination events)
  const nominationResult = processJudiciaryNominations(stateAfterHearing, rng);
  currentJudiciary = nominationResult.updatedJudiciary;
  allEvents.push(...nominationResult.events);

  // 3. Process retirements
  const stateForRetirements: GameState = {
    ...stateAfterHearing,
    judiciary: currentJudiciary,
  };
  const retirementResult = processJudiciaryRetirements(stateForRetirements, rng);
  currentJudiciary = retirementResult.updatedJudiciary;
  allEvents.push(...retirementResult.events);

  return {
    updatedJudiciary: currentJudiciary,
    newEvents: allEvents,
    consequences: allConsequences,
  };
}
