import { describe, it, expect } from "vitest";
import { filterDecisions, filterHeadlines, filterBriefItems } from "./decisionFiltering";
import type { ActiveEvent } from "./gameTypes";

const mockEvents: ActiveEvent[] = [
  { id: "e1", title: "Security Crisis", severity: "critical", description: "test", category: "security", source: "contextual", choices: [], createdDay: 1 },
  { id: "e2", title: "Budget Review", severity: "warning", description: "test", category: "economy", source: "contextual", choices: [], createdDay: 1 },
  { id: "e3", title: "Scandal", severity: "info", description: "test", category: "media", source: "contextual", choices: [], createdDay: 1 },
];

describe("filterDecisions", () => {
  it("returns all events on villa tab", () => {
    expect(filterDecisions(mockEvents, "villa")).toHaveLength(3);
  });

  it("returns all events on cabinet tab", () => {
    expect(filterDecisions(mockEvents, "cabinet")).toHaveLength(3);
  });

  it("filters to security events on security tab", () => {
    const result = filterDecisions(mockEvents, "security");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e1");
  });

  it("sorts by severity on villa (critical first)", () => {
    const result = filterDecisions(mockEvents, "villa");
    expect(result[0].severity).toBe("critical");
  });

  it("returns empty array when no matching events for tab", () => {
    expect(filterDecisions(mockEvents, "legislature")).toHaveLength(0);
  });
});

describe("filterHeadlines", () => {
  it("returns all headlines on villa", () => {
    const headlines = ["Economy grows", "Security alert", "Political news"];
    expect(filterHeadlines(headlines, "villa")).toHaveLength(3);
  });
});
