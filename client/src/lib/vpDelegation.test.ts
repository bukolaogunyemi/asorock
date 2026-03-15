import { describe, it, expect } from "vitest";
import { vpChoose } from "./gameEngine";
import type { EventChoice } from "./gameTypes";

const makeChoice = (id: string, approvalDelta: number, stabilityDelta: number): EventChoice => ({
  id,
  label: `Choice ${id}`,
  context: "test",
  consequences: [{
    id: `c-${id}`,
    sourceEvent: "test",
    delayDays: 0,
    effects: [
      { target: "approval", delta: approvalDelta, description: "test" },
      { target: "stability", delta: stabilityDelta, description: "test" },
    ],
    description: "test",
  }],
});

describe("vpChoose", () => {
  const choices = [
    makeChoice("good", 10, 5),
    makeChoice("safe", 1, 1),
    makeChoice("bad", -8, -3),
  ];

  it("loyal VP picks best positive outcome", () => {
    const result = vpChoose(choices, 80);
    expect(result.id).toBe("good");
  });

  it("moderate VP picks safest option", () => {
    const result = vpChoose(choices, 55);
    expect(result.id).toBe("safe");
  });

  it("disloyal VP picks most damaging option", () => {
    const result = vpChoose(choices, 30);
    expect(result.id).toBe("bad");
  });
});
