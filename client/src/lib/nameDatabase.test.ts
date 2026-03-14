import { describe, expect, it } from "vitest";
import { NAME_POOLS, ETHNIC_STATE_MAP, TITLE_BY_ROLE } from "./nameDatabase";

describe("nameDatabase", () => {
  it("has pools for at least 8 ethnic groups", () => {
    expect(Object.keys(NAME_POOLS).length).toBeGreaterThanOrEqual(8);
  });

  it("every pool has male, female, and surname arrays with at least 10 entries", () => {
    for (const [group, pool] of Object.entries(NAME_POOLS)) {
      expect(pool.male.length, `${group} male`).toBeGreaterThanOrEqual(10);
      expect(pool.female.length, `${group} female`).toBeGreaterThanOrEqual(10);
      expect(pool.surnames.length, `${group} surnames`).toBeGreaterThanOrEqual(10);
    }
  });

  it("every ethnic group maps to at least one state", () => {
    for (const [group, states] of Object.entries(ETHNIC_STATE_MAP)) {
      expect(states.length, `${group} states`).toBeGreaterThanOrEqual(1);
    }
  });

  it("TITLE_BY_ROLE covers key roles", () => {
    expect(TITLE_BY_ROLE["senator"]).toBe("Sen.");
    expect(TITLE_BY_ROLE["representative"]).toBe("Hon.");
    expect(TITLE_BY_ROLE["governor"]).toBe("Gov.");
  });
});
