import { describe, it, expect } from "vitest";
import {
  isFECMeetingDay,
  canConveneFEC,
  generateFECMemos,
} from "./fecMeetings";

describe("isFECMeetingDay", () => {
  it("returns true on day 30 (first monthly meeting after cabinet formation)", () => {
    expect(isFECMeetingDay(30)).toBe(true);
  });
  it("returns true on day 60", () => {
    expect(isFECMeetingDay(60)).toBe(true);
  });
  it("returns false on day 25", () => {
    expect(isFECMeetingDay(25)).toBe(false);
  });
  it("returns false before day 20 (cabinet still forming)", () => {
    expect(isFECMeetingDay(10)).toBe(false);
  });
});

describe("canConveneFEC", () => {
  it("returns true when no cooldown", () => {
    expect(canConveneFEC(0, 0, 50)).toBe(true);
  });
  it("returns false during cooldown", () => {
    expect(canConveneFEC(40, 54, 50)).toBe(false);
  });
  it("returns true after cooldown expires", () => {
    expect(canConveneFEC(40, 54, 55)).toBe(true);
  });
});

describe("generateFECMemos", () => {
  const makeSector = (health: number) => ({
    id: "test",
    health,
    momentum: 0,
    turnsSinceAttention: 0,
    crisisZone: "green" as const,
    activeCascades: [],
    indicators: {},
  });

  const mockState = {
    day: 50,
    cabinetAppointments: {
      Finance: "Test Minister",
      Health: "Health Minister",
      "Works & Housing": "Infra Minister",
      Education: "Edu Minister",
      "Agriculture & Rural Development": "Agric Minister",
      Interior: "Interior Minister",
      Environment: "Enviro Minister",
      "Youth Development": "Youth Minister",
    },
    characters: {
      "Test Minister": {
        name: "Test Minister",
        portfolio: "Finance",
        avatar: "\uD83D\uDCB0",
        relationship: "Friendly",
        competencies: { professional: { fiscal: 70 }, personal: {} },
        faction: "Northern Caucus",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Health Minister": {
        name: "Health Minister",
        portfolio: "Health",
        avatar: "\uD83C\uDFE5",
        relationship: "Neutral",
        competencies: { professional: { health: 60 }, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Infra Minister": {
        name: "Infra Minister",
        portfolio: "Works & Housing",
        avatar: "\uD83C\uDFD7\uFE0F",
        relationship: "Neutral",
        competencies: { professional: {}, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Edu Minister": {
        name: "Edu Minister",
        portfolio: "Education",
        avatar: "\uD83D\uDCDA",
        relationship: "Neutral",
        competencies: { professional: {}, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Agric Minister": {
        name: "Agric Minister",
        portfolio: "Agriculture & Rural Development",
        avatar: "\uD83C\uDF3E",
        relationship: "Neutral",
        competencies: { professional: {}, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Interior Minister": {
        name: "Interior Minister",
        portfolio: "Interior",
        avatar: "\uD83C\uDFDB\uFE0F",
        relationship: "Neutral",
        competencies: { professional: {}, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Enviro Minister": {
        name: "Enviro Minister",
        portfolio: "Environment",
        avatar: "\uD83C\uDF3F",
        relationship: "Neutral",
        competencies: { professional: {}, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
      "Youth Minister": {
        name: "Youth Minister",
        portfolio: "Youth Development",
        avatar: "\uD83D\uDC68\u200D\uD83D\uDCBB",
        relationship: "Neutral",
        competencies: { professional: {}, personal: {} },
        faction: "Technocrats",
        traits: [],
        hooks: [],
        careerHistory: [],
        interactionLog: [],
      },
    },
    ministerStatuses: {},
    economy: { gdp: 500 },
    healthSector: makeSector(25),
    infrastructure: makeSector(65),
    education: makeSector(55),
    agriculture: makeSector(70),
    interior: makeSector(50),
    environment: makeSector(80),
    youthEmployment: makeSector(40),
  } as any;

  it("returns 2-4 memos", () => {
    const memos = generateFECMemos(mockState);
    expect(memos.length).toBeGreaterThanOrEqual(2);
    expect(memos.length).toBeLessThanOrEqual(4);
  });

  it("generates urgent memos for sectors with health < 30", () => {
    const memos = generateFECMemos(mockState);
    const healthMemo = memos.find((m) => m.sectorAffected === "healthSector");
    expect(healthMemo).toBeDefined();
    expect(healthMemo!.urgency).toBe("urgent");
  });

  it("generates routine memos for sectors with health > 70", () => {
    const memos = generateFECMemos(mockState);
    const envMemo = memos.find((m) => m.sectorAffected === "environment");
    // environment has health 80, so it should be routine if included in the 4-memo cap
    if (envMemo) {
      expect(envMemo.urgency).toBe("routine");
    }
  });

  it("sorts urgent memos first", () => {
    const memos = generateFECMemos(mockState);
    if (memos.length >= 2) {
      const urgencyOrder = { urgent: 0, important: 1, routine: 2 };
      for (let i = 1; i < memos.length; i++) {
        expect(urgencyOrder[memos[i].urgency]).toBeGreaterThanOrEqual(
          urgencyOrder[memos[i - 1].urgency],
        );
      }
    }
  });

  it("each memo has valid EventChoice structure", () => {
    const memos = generateFECMemos(mockState);
    for (const memo of memos) {
      expect(memo.choices.length).toBeGreaterThanOrEqual(2);
      for (const choice of memo.choices) {
        expect(choice.id).toBeDefined();
        expect(choice.label).toBeDefined();
        expect(choice.context).toBeDefined();
        expect(choice.consequences).toBeDefined();
        expect(choice.consequences.length).toBeGreaterThanOrEqual(1);
        const c = choice.consequences[0];
        expect(c.id).toBeDefined();
        expect(c.sourceEvent).toBe(memo.id);
        expect(c.effects.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("caps at 4 memos even with many sectors", () => {
    const memos = generateFECMemos(mockState);
    expect(memos.length).toBeLessThanOrEqual(4);
  });
});
