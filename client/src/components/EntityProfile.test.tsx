import { describe, it, expect } from "vitest";
import EntityProfile from "./EntityProfile";

describe("EntityProfile", () => {
  it("exports a React component", () => {
    expect(typeof EntityProfile).toBe("function");
  });
});
