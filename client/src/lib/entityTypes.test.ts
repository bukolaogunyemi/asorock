// entityTypes.test.ts
import { describe, it, expect } from "vitest";
import { parseEntityId, ENTITY_TYPE_COLORS, slugify } from "./entityTypes";

describe("parseEntityId", () => {
  it("parses state:lagos", () => {
    expect(parseEntityId("state:lagos")).toEqual({ type: "state", slug: "lagos" });
  });
  it("parses ministry:finance", () => {
    expect(parseEntityId("ministry:finance")).toEqual({ type: "ministry", slug: "finance" });
  });
  it("parses faction:northern-caucus", () => {
    expect(parseEntityId("faction:northern-caucus")).toEqual({ type: "faction", slug: "northern-caucus" });
  });
  it("returns null for invalid id", () => {
    expect(parseEntityId("nocolon")).toBeNull();
  });
  it("handles colons in slug", () => {
    expect(parseEntityId("country:united-states")).toEqual({ type: "country", slug: "united-states" });
  });
});

describe("slugify", () => {
  it("converts to lowercase with hyphens", () => {
    expect(slugify("Northern Caucus")).toBe("northern-caucus");
  });
  it("handles ampersands", () => {
    expect(slugify("Works & Housing")).toBe("works-and-housing");
  });
});

describe("ENTITY_TYPE_COLORS", () => {
  it("has colors for all entity types", () => {
    const types = ["state", "ministry", "agency", "country", "international-org", "constitutional-office", "faction"];
    for (const t of types) {
      expect(ENTITY_TYPE_COLORS[t as keyof typeof ENTITY_TYPE_COLORS]).toBeDefined();
    }
  });
});
