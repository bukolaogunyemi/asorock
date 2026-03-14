// client/src/lib/nameGenerator.test.ts
import { describe, expect, it } from "vitest";
import { generateName, createNameGenerator } from "./nameGenerator";
import { NAME_POOLS, ETHNIC_STATE_MAP } from "./nameDatabase";

describe("generateName", () => {
  it("returns a name from the correct ethnic group", () => {
    const result = generateName({ ethnicGroup: "Yoruba", gender: "male", seed: 42 });
    const pool = NAME_POOLS["Yoruba"];
    expect(pool.male).toContain(result.firstName);
    expect(pool.surnames).toContain(result.surname);
  });

  it("assigns a state from the correct ethnic group", () => {
    const result = generateName({ ethnicGroup: "Igbo", gender: "female", seed: 99 });
    expect(ETHNIC_STATE_MAP["Igbo"]).toContain(result.stateOfOrigin);
  });

  it("is deterministic with the same seed", () => {
    const a = generateName({ ethnicGroup: "Hausa", gender: "male", seed: 123 });
    const b = generateName({ ethnicGroup: "Hausa", gender: "male", seed: 123 });
    expect(a.firstName).toBe(b.firstName);
    expect(a.surname).toBe(b.surname);
  });

  it("produces different names with different seeds", () => {
    const a = generateName({ ethnicGroup: "Hausa", gender: "male", seed: 1 });
    const b = generateName({ ethnicGroup: "Hausa", gender: "male", seed: 999 });
    expect(a.firstName + a.surname).not.toBe(b.firstName + b.surname);
  });
});

describe("createNameGenerator", () => {
  it("generates unique names without collisions", () => {
    const gen = createNameGenerator(42);
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const result = gen.next({ ethnicGroup: "Yoruba", gender: i % 2 === 0 ? "male" : "female", role: "representative" });
      const fullName = `${result.firstName} ${result.surname}`;
      expect(names.has(fullName), `Duplicate name: ${fullName}`).toBe(false);
      names.add(fullName);
    }
  });

  it("assigns title based on role", () => {
    const gen = createNameGenerator(42);
    const result = gen.next({ ethnicGroup: "Igbo", gender: "male", role: "senator" });
    expect(result.title).toBe("Sen.");
  });
});
