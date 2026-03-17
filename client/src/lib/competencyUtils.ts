import type {
  CharacterCompetencies,
  ProfessionalCompetencies,
  PersonalCompetencies,
} from "./competencyTypes";
import { seededRandom, randRange } from "./seededRandom";

// Portfolio → primary professional competency mapping
const PORTFOLIO_COMPETENCY_MAP: Record<string, keyof ProfessionalCompetencies> = {
  finance: "economics", economy: "economics", budget: "economics", revenue: "economics",
  trade: "economics", commerce: "economics", treasury: "economics", bank: "economics",
  defence: "security", defense: "security", military: "security", police: "security",
  security: "security", intelligence: "security", army: "security", navy: "security",
  justice: "legal", attorney: "legal", law: "legal", court: "legal", judicial: "legal",
  foreign: "diplomacy", ambassador: "diplomacy", diplomatic: "diplomacy", ecowas: "diplomacy",
  information: "communications", communication: "communications", media: "communications", press: "communications", broadcast: "communications",
  technology: "technology", digital: "technology", ict: "technology", cyber: "technology", science: "technology",
  admin: "administration", civil: "administration", establishment: "administration",
  secretary: "administration", governance: "administration", affairs: "administration",
  politics: "politics", political: "politics", party: "politics", coalition: "politics",
  management: "management", operations: "management", execution: "management", delivery: "management",
  education: "administration", health: "administration", works: "administration",
  transport: "administration", agriculture: "administration", power: "administration",
  housing: "administration", environment: "administration", labour: "administration",
  petroleum: "economics", oil: "economics", mines: "economics",
};

function inferPrimaryCompetency(portfolio: string): keyof ProfessionalCompetencies {
  const lower = portfolio.toLowerCase();
  for (const [keyword, comp] of Object.entries(PORTFOLIO_COMPETENCY_MAP)) {
    if (lower.includes(keyword)) return comp;
  }
  return "administration";
}

// Faction → competency tendencies
const FACTION_TENDENCIES: Record<string, Partial<Record<keyof ProfessionalCompetencies | keyof PersonalCompetencies, [number, number]>>> = {
  "Northern Caucus": { administration: [5, 15], resilience: [5, 15] },
  "South-West Alliance": { economics: [5, 15], charisma: [5, 10] },
  "Presidential Guard": { loyalty: [10, 20], intrigue: [5, 15] },
  "South-East Bloc": { economics: [5, 15], technology: [5, 10] },
  "Military Circle": { security: [10, 20], resilience: [10, 15] },
  "Technocrats": { technology: [5, 15], economics: [5, 10] },
  "Youth Movement": { communications: [5, 15], technology: [5, 15] },
};

export function migrateOldCompetencies(old: {
  loyalty: number;
  competence: number;
  ambition: number;
  portfolio: string;
}): CharacterCompetencies {
  const primary = inferPrimaryCompetency(old.portfolio);
  const rng = seededRandom(old.loyalty * 100 + old.competence * 10 + old.ambition);

  const professional: ProfessionalCompetencies = {
    economics: randRange(rng, 20, 50),
    diplomacy: randRange(rng, 20, 50),
    security: randRange(rng, 20, 50),
    communications: randRange(rng, 20, 50),
    legal: randRange(rng, 20, 50),
    administration: randRange(rng, 20, 50),
    management: randRange(rng, 20, 50),
    technology: randRange(rng, 20, 50),
    politics: randRange(rng, 20, 50),
  };
  professional[primary] = Math.max(professional[primary], old.competence);

  const personal: PersonalCompetencies = {
    loyalty: old.loyalty,
    charisma: randRange(rng, 25, 65),
    leadership: randRange(rng, 25, 65),
    ambition: old.ambition,
    integrity: randRange(rng, 25, 65),
    resilience: randRange(rng, 25, 65),
    intrigue: randRange(rng, 25, 65),
    discretion: randRange(rng, 25, 65),
  };

  return { professional, personal };
}

export function migrateHandcraftedCompetencies(
  old: { charisma: number; diplomacy: number; economics: number; military: number; leadership: number },
  loyalty: number,
  ambition: number,
): CharacterCompetencies {
  const rng = seededRandom(loyalty * 100 + ambition * 10 + old.charisma);

  const professional: ProfessionalCompetencies = {
    economics: old.economics * 20,
    diplomacy: old.diplomacy * 20,
    security: old.military * 20,
    communications: randRange(rng, 20, 50),
    legal: randRange(rng, 20, 50),
    administration: randRange(rng, 20, 50),
    management: randRange(rng, 20, 50),
    technology: randRange(rng, 20, 50),
    politics: randRange(rng, 20, 50),
  };

  const personal: PersonalCompetencies = {
    loyalty,
    charisma: old.charisma * 20,
    leadership: old.leadership * 20,
    ambition,
    integrity: randRange(rng, 25, 65),
    resilience: randRange(rng, 25, 65),
    intrigue: randRange(rng, 25, 65),
    discretion: randRange(rng, 25, 65),
  };

  return { professional, personal };
}

export function generateProceduralCompetencies(opts: {
  portfolio: string;
  faction: string;
  age: number;
  seed: number;
}): CharacterCompetencies {
  const rng = seededRandom(opts.seed);
  const primary = inferPrimaryCompetency(opts.portfolio);

  const professional: ProfessionalCompetencies = {
    economics: randRange(rng, 15, 50),
    diplomacy: randRange(rng, 15, 50),
    security: randRange(rng, 15, 50),
    communications: randRange(rng, 15, 50),
    legal: randRange(rng, 15, 50),
    administration: randRange(rng, 15, 50),
    management: randRange(rng, 15, 50),
    technology: randRange(rng, 15, 50),
    politics: randRange(rng, 15, 50),
  };
  professional[primary] = randRange(rng, 60, 85);
  if (opts.age > 50) professional.administration = Math.min(100, professional.administration + randRange(rng, 5, 15));

  const personal: PersonalCompetencies = {
    loyalty: randRange(rng, 30, 75),
    charisma: randRange(rng, 20, 70),
    leadership: randRange(rng, 20, 70),
    ambition: Math.max(10, randRange(rng, 80 - opts.age, 80 - Math.floor(opts.age * 0.4))),
    integrity: randRange(rng, 25, 65),
    resilience: randRange(rng, 25, 65),
    intrigue: randRange(rng, 15, 55),
    discretion: randRange(rng, 20, 60),
  };
  if (opts.age > 50) personal.leadership = Math.min(100, personal.leadership + randRange(rng, 3, 10));

  const tendencies = FACTION_TENDENCIES[opts.faction];
  if (tendencies) {
    for (const [key, [min, max]] of Object.entries(tendencies)) {
      const bonus = randRange(rng, min, max);
      if (key in professional) {
        professional[key as keyof ProfessionalCompetencies] = Math.min(100, professional[key as keyof ProfessionalCompetencies] + bonus);
      }
      if (key in personal) {
        personal[key as keyof PersonalCompetencies] = Math.min(100, personal[key as keyof PersonalCompetencies] + bonus);
      }
    }
  }

  return { professional, personal };
}

export function getTopN<T extends Record<string, number>>(
  competencies: T,
  n: number,
): { key: string; value: number }[] {
  return Object.entries(competencies)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

export function migratePACompetencies(
  old: { communication: number; discretion: number; organisation: number; networks: number; crisis: number },
): CharacterCompetencies {
  const rng = seededRandom(old.communication * 100 + old.discretion * 10 + old.organisation);

  const professional: ProfessionalCompetencies = {
    economics: randRange(rng, 20, 45),
    diplomacy: old.networks * 20,
    security: randRange(rng, 20, 45),
    communications: old.communication * 20,
    legal: randRange(rng, 20, 45),
    administration: old.organisation * 20,
    management: randRange(rng, 20, 45),
    technology: randRange(rng, 20, 45),
    politics: randRange(rng, 20, 45),
  };

  const personal: PersonalCompetencies = {
    loyalty: randRange(rng, 40, 70),
    charisma: randRange(rng, 30, 65),
    leadership: old.crisis * 20,
    ambition: randRange(rng, 30, 65),
    integrity: randRange(rng, 30, 65),
    resilience: randRange(rng, 30, 65),
    intrigue: old.discretion * 20,
    discretion: randRange(rng, 30, 65),
  };

  return { professional, personal };
}

export function migrateKeyCharCompetencies(
  old: { loyalty: number; administration: number; political: number; discretion: number; networks: number },
  charLoyalty: number,
  charAmbition: number,
): CharacterCompetencies {
  const rng = seededRandom(charLoyalty * 100 + charAmbition * 10 + old.political);

  const professional: ProfessionalCompetencies = {
    economics: randRange(rng, 20, 50),
    diplomacy: old.networks * 20,
    security: randRange(rng, 20, 50),
    communications: randRange(rng, 20, 50),
    legal: randRange(rng, 20, 50),
    administration: old.administration * 20,
    management: randRange(rng, 20, 50),
    technology: randRange(rng, 20, 50),
    politics: old.political * 20,
  };

  const personal: PersonalCompetencies = {
    loyalty: charLoyalty,
    charisma: old.political * 20,
    leadership: randRange(rng, 25, 65),
    ambition: charAmbition,
    integrity: randRange(rng, 25, 65),
    resilience: randRange(rng, 25, 65),
    intrigue: old.discretion * 20,
    discretion: randRange(rng, 25, 65),
  };

  return { professional, personal };
}

export function averageProfessionalCompetence(competencies: CharacterCompetencies): number {
  const prof = competencies.professional;
  return Math.round(
    (prof.economics + prof.diplomacy + prof.security + prof.communications + prof.legal + prof.administration + prof.management + prof.technology + prof.politics) / 9,
  );
}

export function deriveBetrayalThreshold(personal: {
  integrity: number;
  loyalty: number;
  ambition: number;
}): number {
  return Math.round(Math.max(15, personal.integrity * 0.6 + personal.loyalty * 0.3 - personal.ambition * 0.4));
}
