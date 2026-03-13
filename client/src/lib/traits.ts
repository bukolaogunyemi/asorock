// Aso Rock — Character Trait System
// 12 traits that modify character behavior, loyalty drift, and betrayal risk

import type { CharacterState, GameState } from "./gameTypes";

// ── Types ───────────────────────────────────────────────

export interface Trait {
  id: string;
  label: string;
  description: string;
  category: "personality" | "ideology" | "competence";
  loyaltyDrift: number;       // per-turn loyalty change
  competenceModifier: number; // multiplier on competence effects
  betrayalModifier: number;   // added to betrayal threshold (negative = more likely)
  conflictsWith: string[];    // trait IDs that cannot co-exist
}

// ── 12 Traits ───────────────────────────────────────────

export const traitDefinitions: Record<string, Trait> = {
  ambitious: {
    id: "ambitious",
    label: "Ambitious",
    description: "Constantly seeks advancement; loyal only while rising",
    category: "personality",
    loyaltyDrift: -0.3,
    competenceModifier: 1.1,
    betrayalModifier: -10,
    conflictsWith: ["loyal"],
  },
  loyal: {
    id: "loyal",
    label: "Loyal",
    description: "Steadfast supporter; unlikely to defect",
    category: "personality",
    loyaltyDrift: 0.4,
    competenceModifier: 1.0,
    betrayalModifier: 15,
    conflictsWith: ["ambitious", "schemer"],
  },
  corrupt: {
    id: "corrupt",
    label: "Corrupt",
    description: "Diverts resources for personal gain",
    category: "personality",
    loyaltyDrift: -0.2,
    competenceModifier: 0.8,
    betrayalModifier: -5,
    conflictsWith: ["honest"],
  },
  competent: {
    id: "competent",
    label: "Competent",
    description: "Exceptionally skilled at their portfolio",
    category: "competence",
    loyaltyDrift: 0,
    competenceModifier: 1.25,
    betrayalModifier: 0,
    conflictsWith: [],
  },
  hawkish: {
    id: "hawkish",
    label: "Hawkish",
    description: "Favours military solutions and strong-arm tactics",
    category: "ideology",
    loyaltyDrift: 0,
    competenceModifier: 1.0,
    betrayalModifier: -3,
    conflictsWith: ["dovish"],
  },
  dovish: {
    id: "dovish",
    label: "Dovish",
    description: "Prefers diplomacy, negotiation, and soft power",
    category: "ideology",
    loyaltyDrift: 0.1,
    competenceModifier: 1.0,
    betrayalModifier: 5,
    conflictsWith: ["hawkish"],
  },
  populist: {
    id: "populist",
    label: "Populist",
    description: "Plays to the crowd; boosts approval but risks instability",
    category: "ideology",
    loyaltyDrift: -0.1,
    competenceModifier: 0.9,
    betrayalModifier: -5,
    conflictsWith: ["technocrat"],
  },
  technocrat: {
    id: "technocrat",
    label: "Technocrat",
    description: "Data-driven decision maker; effective but aloof",
    category: "ideology",
    loyaltyDrift: 0,
    competenceModifier: 1.2,
    betrayalModifier: 0,
    conflictsWith: ["populist"],
  },
  schemer: {
    id: "schemer",
    label: "Schemer",
    description: "Masterful political operator; always has an angle",
    category: "personality",
    loyaltyDrift: -0.4,
    competenceModifier: 1.05,
    betrayalModifier: -12,
    conflictsWith: ["loyal", "honest"],
  },
  honest: {
    id: "honest",
    label: "Honest",
    description: "Transparent and trustworthy; builds public confidence",
    category: "personality",
    loyaltyDrift: 0.2,
    competenceModifier: 1.0,
    betrayalModifier: 10,
    conflictsWith: ["corrupt", "schemer"],
  },
  zealous: {
    id: "zealous",
    label: "Zealous",
    description: "Ideologically driven; effective but inflexible",
    category: "ideology",
    loyaltyDrift: 0.1,
    competenceModifier: 1.1,
    betrayalModifier: -8,
    conflictsWith: ["pragmatic"],
  },
  pragmatic: {
    id: "pragmatic",
    label: "Pragmatic",
    description: "Flexible and outcome-oriented; willing to compromise",
    category: "ideology",
    loyaltyDrift: 0,
    competenceModifier: 1.05,
    betrayalModifier: 3,
    conflictsWith: ["zealous"],
  },
};

// ── Trait list (for iteration) ──────────────────────────

export const allTraitIds = Object.keys(traitDefinitions);

// ── Assign initial traits to characters ─────────────────

export function assignInitialTraits(
  characters: Record<string, CharacterState>,
): Record<string, CharacterState> {
  const updated: Record<string, CharacterState> = {};
  const traitIds = allTraitIds;

  for (const [name, char] of Object.entries(characters)) {
    // Already has traits? Skip
    if (char.traits.length > 0) {
      updated[name] = char;
      continue;
    }

    // Deterministic assignment based on character stats
    const traits: string[] = [];

    // Primary trait: based on dominant stat
    if (char.ambition > 75) {
      traits.push("ambitious");
    } else if (char.loyalty > 75) {
      traits.push("loyal");
    } else if (char.competence > 80) {
      traits.push("competent");
    }

    // Secondary trait: based on personality hash (deterministic from name)
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const secondaryPool = traitIds.filter((id) => {
      if (traits.includes(id)) return false;
      const trait = traitDefinitions[id];
      return !traits.some((t) => trait.conflictsWith.includes(t));
    });

    if (secondaryPool.length > 0) {
      const pick = secondaryPool[hash % secondaryPool.length];
      traits.push(pick);
    }

    updated[name] = { ...char, traits };
  }

  return updated;
}

// ── Get combined trait effect for a character ────────────

export interface TraitEffect {
  loyaltyDrift: number;
  competenceModifier: number;
  betrayalModifier: number;
}

export function getTraitEffect(character: CharacterState): TraitEffect {
  let loyaltyDrift = 0;
  let competenceModifier = 1.0;
  let betrayalModifier = 0;

  for (const traitId of character.traits) {
    const trait = traitDefinitions[traitId];
    if (!trait) continue;
    loyaltyDrift += trait.loyaltyDrift;
    competenceModifier *= trait.competenceModifier;
    betrayalModifier += trait.betrayalModifier;
  }

  return { loyaltyDrift, competenceModifier, betrayalModifier };
}

// ── Check betrayal risk ─────────────────────────────────

export interface BetrayalRisk {
  characterName: string;
  risk: number; // 0-100
  threshold: number;
  loyalty: number;
  isAtRisk: boolean;
  traits: string[];
}

export function checkBetrayalRisk(
  state: GameState,
): BetrayalRisk[] {
  const risks: BetrayalRisk[] = [];

  for (const [name, char] of Object.entries(state.characters)) {
    const effect = getTraitEffect(char);
    const adjustedThreshold = char.betrayalThreshold + effect.betrayalModifier;

    // Risk is higher when loyalty is below threshold and ambition is high
    const loyaltyGap = adjustedThreshold - char.loyalty;
    const ambitionFactor = char.ambition / 100;
    const stressFactor = state.stress > 50 ? 1.2 : 1.0;

    const risk = Math.max(0, Math.min(100,
      loyaltyGap * ambitionFactor * stressFactor * 2
    ));

    const isAtRisk = char.loyalty < adjustedThreshold && char.ambition > 70;

    risks.push({
      characterName: name,
      risk: Math.round(risk),
      threshold: Math.round(adjustedThreshold),
      loyalty: char.loyalty,
      isAtRisk,
      traits: char.traits,
    });
  }

  return risks.sort((a, b) => b.risk - a.risk);
}

// ── Get trait by id ─────────────────────────────────────

export function getTrait(id: string): Trait | undefined {
  return traitDefinitions[id];
}

