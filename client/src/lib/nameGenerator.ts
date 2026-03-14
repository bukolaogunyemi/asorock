// client/src/lib/nameGenerator.ts
import { NAME_POOLS, ETHNIC_STATE_MAP, TITLE_BY_ROLE } from "./nameDatabase";

/** Seeded random number generator (Lehmer / Park-Miller) */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface GeneratedName {
  firstName: string;
  surname: string;
  fullName: string;
  title: string;
  ethnicGroup: string;
  stateOfOrigin: string;
  gender: "male" | "female";
}

interface GenerateNameOptions {
  ethnicGroup: string;
  gender: "male" | "female";
  seed: number;
  role?: string;
}

/** Generate a single name (stateless, for one-off use) */
export function generateName(opts: GenerateNameOptions): GeneratedName {
  const rng = seededRandom(opts.seed);
  const pool = NAME_POOLS[opts.ethnicGroup];
  if (!pool) throw new Error(`No name pool for ethnic group: ${opts.ethnicGroup}`);

  const firstNames = opts.gender === "male" ? pool.male : pool.female;
  const firstName = firstNames[Math.floor(rng() * firstNames.length)];
  const surname = pool.surnames[Math.floor(rng() * pool.surnames.length)];
  const states = ETHNIC_STATE_MAP[opts.ethnicGroup] ?? ["FCT"];
  const stateOfOrigin = states[Math.floor(rng() * states.length)];
  const title = opts.role ? (TITLE_BY_ROLE[opts.role] ?? "") : "";

  return {
    firstName,
    surname,
    fullName: title ? `${title} ${firstName} ${surname}` : `${firstName} ${surname}`,
    title,
    ethnicGroup: opts.ethnicGroup,
    stateOfOrigin,
    gender: opts.gender,
  };
}

interface NameGeneratorNextOptions {
  ethnicGroup: string;
  gender: "male" | "female";
  role?: string;
}

/** Stateful generator that tracks used names for deduplication */
export function createNameGenerator(baseSeed: number) {
  const usedNames = new Set<string>();
  let counter = 0;

  return {
    next(opts: NameGeneratorNextOptions): GeneratedName {
      const maxAttempts = 100;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        counter++;
        const result = generateName({
          ...opts,
          seed: baseSeed * 31 + counter * 7 + attempt * 13,
        });
        const key = `${result.firstName} ${result.surname}`;
        if (!usedNames.has(key)) {
          usedNames.add(key);
          return result;
        }
      }
      // Fallback: append counter to surname for guaranteed uniqueness
      counter++;
      const fallback = generateName({ ...opts, seed: baseSeed + counter });
      fallback.surname = `${fallback.surname}-${counter}`;
      fallback.fullName = fallback.title
        ? `${fallback.title} ${fallback.firstName} ${fallback.surname}`
        : `${fallback.firstName} ${fallback.surname}`;
      usedNames.add(`${fallback.firstName} ${fallback.surname}`);
      return fallback;
    },

    /** Register an existing name to prevent collisions (for Tier 1 characters) */
    registerName(firstName: string, surname: string) {
      usedNames.add(`${firstName} ${surname}`);
    },
  };
}
