import { describe, it, expect } from "vitest";
import { generateJudiciaryPool, getJudiciaryPool } from "./judiciaryPool";
import type { JudicialPhilosophy } from "./judiciaryTypes";

describe("generateJudiciaryPool", () => {
  const pool = generateJudiciaryPool(6001);

  it("generates 25 Supreme Court candidates", () => {
    expect(pool.supremeCourtPool).toHaveLength(25);
  });

  it("generates 50 Court of Appeal candidates", () => {
    expect(pool.appealCourtPool).toHaveLength(50);
  });

  it("has no duplicate names across both pools", () => {
    const allNames = [
      ...pool.supremeCourtPool.map(c => c.name),
      ...pool.appealCourtPool.map(c => c.name),
    ];
    const unique = new Set(allNames);
    expect(unique.size).toBe(allNames.length);
  });

  it("includes all 4 judicial philosophies across both pools", () => {
    const allPhilosophies = new Set<JudicialPhilosophy>([
      ...pool.supremeCourtPool.map(c => c.philosophy),
      ...pool.appealCourtPool.map(c => c.philosophy),
    ]);
    expect(allPhilosophies).toContain("originalist");
    expect(allPhilosophies).toContain("activist");
    expect(allPhilosophies).toContain("deferential");
    expect(allPhilosophies).toContain("independent");
  });

  it("has reasonable zone distribution in SC pool (at least 3 zones)", () => {
    const zones = new Set(pool.supremeCourtPool.map(c => c.zone));
    expect(zones.size).toBeGreaterThanOrEqual(3);
  });

  it("has reasonable zone distribution in CA pool (at least 4 zones)", () => {
    const zones = new Set(pool.appealCourtPool.map(c => c.zone));
    expect(zones.size).toBeGreaterThanOrEqual(4);
  });

  it("SC candidates have ages in expected range (52-68)", () => {
    for (const c of pool.supremeCourtPool) {
      expect(c.age).toBeGreaterThanOrEqual(52);
      expect(c.age).toBeLessThanOrEqual(68);
    }
  });

  it("CA candidates have ages in expected range (48-65)", () => {
    for (const c of pool.appealCourtPool) {
      expect(c.age).toBeGreaterThanOrEqual(48);
      expect(c.age).toBeLessThanOrEqual(65);
    }
  });

  it("retirement ages are in range 65-72", () => {
    const all = [...pool.supremeCourtPool, ...pool.appealCourtPool];
    for (const c of all) {
      expect(c.retirementAge).toBeGreaterThanOrEqual(65);
      expect(c.retirementAge).toBeLessThanOrEqual(72);
    }
  });

  it("court field is correct for each pool", () => {
    for (const c of pool.supremeCourtPool) {
      expect(c.court).toBe("supreme");
    }
    for (const c of pool.appealCourtPool) {
      expect(c.court).toBe("appeal");
    }
  });

  it("is deterministic — same seed produces same results", () => {
    const pool2 = generateJudiciaryPool(6001);
    expect(pool.supremeCourtPool.map(c => c.name)).toEqual(
      pool2.supremeCourtPool.map(c => c.name),
    );
    expect(pool.appealCourtPool.map(c => c.name)).toEqual(
      pool2.appealCourtPool.map(c => c.name),
    );
  });
});

describe("getJudiciaryPool", () => {
  it("returns the same cached instance on repeated calls", () => {
    const a = getJudiciaryPool();
    const b = getJudiciaryPool();
    expect(a).toBe(b);
  });
});
