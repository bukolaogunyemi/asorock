import { describe, it, expect } from "vitest";
import {
  PORTFOLIO_SECTOR_MAP,
  CABINET_CLUSTERS,
  CLUSTER_SECTOR_MAP,
  computeMinisterPerformance,
  computeMinisterStatus,
  computeMinisterialEffectiveness,
  competenceToBand,
  generateMinisterEvents,
  relationshipToScore,
  type MinisterStatusLabel,
} from "./cabinetSystem";
import type { CharacterState } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";

/** Create a minimal character with uniform professional competency */
function makeCharacter(
  name: string,
  portfolio: string,
  professionalValue: number,
  overrides?: { loyalty?: number; integrity?: number },
): CharacterState {
  return {
    name,
    portfolio,
    competencies: {
      professional: {
        economics: professionalValue,
        diplomacy: professionalValue,
        security: professionalValue,
        media: professionalValue,
        legal: professionalValue,
        administration: professionalValue,
        technology: professionalValue,
      },
      personal: {
        loyalty: overrides?.loyalty ?? 60,
        charisma: 50,
        leadership: 50,
        ambition: 50,
        integrity: overrides?.integrity ?? 50,
        resilience: 50,
        intrigue: 50,
      },
    },
    faction: "Northern Caucus",
    relationship: "Neutral",
    avatar: "",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
  };
}

describe("PORTFOLIO_SECTOR_MAP", () => {
  it("maps Finance to economy", () => {
    expect(PORTFOLIO_SECTOR_MAP["Finance"]).toBe("economy");
  });
  it("maps Health to healthSector", () => {
    expect(PORTFOLIO_SECTOR_MAP["Health"]).toBe("healthSector");
  });
  it("maps Justice to null (no sector)", () => {
    expect(PORTFOLIO_SECTOR_MAP["Justice"]).toBeNull();
  });
  it("maps Foreign Affairs to null", () => {
    expect(PORTFOLIO_SECTOR_MAP["Foreign Affairs"]).toBeNull();
  });
  it("has an entry for all 17 portfolios", () => {
    expect(Object.keys(PORTFOLIO_SECTOR_MAP)).toHaveLength(17);
  });
});

describe("CABINET_CLUSTERS", () => {
  it("has 5 clusters", () => {
    expect(CABINET_CLUSTERS).toHaveLength(5);
  });
  it("contains all 17 portfolios across all clusters", () => {
    const all = CABINET_CLUSTERS.flatMap((c) => c.portfolios);
    expect(all).toHaveLength(17);
  });
});

describe("computeMinisterPerformance", () => {
  it("computes weighted score for minister with sector", () => {
    const score = computeMinisterPerformance(80, 70, 60);
    expect(score).toBeCloseTo(74.5);
  });
  it("computes score for minister without sector", () => {
    const score = computeMinisterPerformance(null, 70, 60);
    expect(score).toBeCloseTo(65);
  });
  it("clamps to 0-100 range", () => {
    expect(computeMinisterPerformance(120, 120, 120)).toBe(100);
    expect(computeMinisterPerformance(-10, -10, -10)).toBe(0);
  });
});

describe("computeMinisterStatus", () => {
  it("returns New if appointed within 30 days", () => {
    expect(computeMinisterStatus(80, 80, false, 10, 25)).toBe("New");
  });
  it("returns On Probation if flag is set", () => {
    expect(computeMinisterStatus(70, 60, true, 100, 200)).toBe("On Probation");
  });
  it("returns Delivering when sector >= 60 and relationship >= 50", () => {
    expect(computeMinisterStatus(60, 50, false, 100, 200)).toBe("Delivering");
  });
  it("returns Under Pressure when sector 30-59", () => {
    expect(computeMinisterStatus(45, 60, false, 100, 200)).toBe("Under Pressure");
  });
  it("returns Failing when sector < 30", () => {
    expect(computeMinisterStatus(20, 60, false, 100, 200)).toBe("Failing");
  });
  it("returns Failing when relationship < 25", () => {
    expect(computeMinisterStatus(70, 20, false, 100, 200)).toBe("Failing");
  });
});

describe("relationshipToScore", () => {
  it("maps Loyal to 95", () => {
    expect(relationshipToScore("Loyal")).toBe(95);
  });
  it("maps unknown to 50", () => {
    expect(relationshipToScore("Unknown")).toBe(50);
  });
});

// ── Task 14: Ministerial Effectiveness Tests ──────────────────────────────

describe("competenceToBand", () => {
  it("returns 1.15 for competence >= 80", () => {
    expect(competenceToBand(80)).toBe(1.15);
    expect(competenceToBand(95)).toBe(1.15);
  });
  it("returns 1.0 for competence 60-79", () => {
    expect(competenceToBand(60)).toBe(1.0);
    expect(competenceToBand(79)).toBe(1.0);
  });
  it("returns 0.85 for competence 40-59", () => {
    expect(competenceToBand(40)).toBe(0.85);
    expect(competenceToBand(59)).toBe(0.85);
  });
  it("returns 0.70 for competence < 40", () => {
    expect(competenceToBand(39)).toBe(0.70);
    expect(competenceToBand(0)).toBe(0.70);
  });
});

describe("computeMinisterialEffectiveness", () => {
  it("returns multipliers for all sectors when all ministers are filled with high competence", () => {
    const characters: Record<string, CharacterState> = {};
    const cabinetAppointments: Record<string, string | null> = {};

    // Fill all portfolios with competence 85 ministers
    for (const cluster of CABINET_CLUSTERS) {
      for (const portfolio of cluster.portfolios) {
        const name = `Minister-${portfolio}`;
        cabinetAppointments[portfolio] = name;
        characters[name] = makeCharacter(name, portfolio, 85);
      }
    }

    const result = computeMinisterialEffectiveness({ cabinetAppointments, characters });

    // All sectors should have 1.15 multiplier (avg competence 85 → band 80+)
    expect(result["economy"]).toBe(1.15);
    expect(result["treasury"]).toBe(1.15);
    expect(result["healthSector"]).toBe(1.15);
    expect(result["education"]).toBe(1.15);
    expect(result["infrastructure"]).toBe(1.15);
    expect(result["interior"]).toBe(1.15);
    expect(result["stability"]).toBe(1.15);
    expect(result["agriculture"]).toBe(1.15);
    expect(result["environment"]).toBe(1.15);
  });

  it("treats vacant portfolios as 0 competence, dragging the average down", () => {
    const characters: Record<string, CharacterState> = {};
    const cabinetAppointments: Record<string, string | null> = {};

    // Fill only Finance (competence 90), leave Petroleum and Trade vacant
    cabinetAppointments["Finance"] = "Minister-Finance";
    characters["Minister-Finance"] = makeCharacter("Minister-Finance", "Finance", 90);
    cabinetAppointments["Petroleum"] = null;
    cabinetAppointments["Trade & Investment"] = null;

    // Fill other clusters minimally
    for (const cluster of CABINET_CLUSTERS) {
      if (cluster.id === "economic") continue;
      for (const portfolio of cluster.portfolios) {
        cabinetAppointments[portfolio] = null;
      }
    }

    const result = computeMinisterialEffectiveness({ cabinetAppointments, characters });

    // Economic cluster: (90 + 0 + 0) / 3 = 30 → band < 40 → 0.70
    expect(result["economy"]).toBe(0.70);
    expect(result["treasury"]).toBe(0.70);
  });

  it("computes correct band for medium competence cluster", () => {
    const characters: Record<string, CharacterState> = {};
    const cabinetAppointments: Record<string, string | null> = {};

    // Fill all portfolios with competence 65
    for (const cluster of CABINET_CLUSTERS) {
      for (const portfolio of cluster.portfolios) {
        const name = `Minister-${portfolio}`;
        cabinetAppointments[portfolio] = name;
        characters[name] = makeCharacter(name, portfolio, 65);
      }
    }

    const result = computeMinisterialEffectiveness({ cabinetAppointments, characters });

    // All should be 1.0 (avg 65 → band 60-79)
    expect(result["economy"]).toBe(1.0);
    expect(result["infrastructure"]).toBe(1.0);
  });

  it("handles completely vacant cabinet with all 0.70 multipliers", () => {
    const cabinetAppointments: Record<string, string | null> = {};
    for (const cluster of CABINET_CLUSTERS) {
      for (const portfolio of cluster.portfolios) {
        cabinetAppointments[portfolio] = null;
      }
    }

    const result = computeMinisterialEffectiveness({ cabinetAppointments, characters: {} });

    // All vacant → avg 0 → band < 40 → 0.70
    for (const sectors of Object.values(CLUSTER_SECTOR_MAP)) {
      for (const sector of sectors) {
        expect(result[sector]).toBe(0.70);
      }
    }
  });

  it("returns different multipliers for clusters with different competence levels", () => {
    const characters: Record<string, CharacterState> = {};
    const cabinetAppointments: Record<string, string | null> = {};

    // Economic cluster: high competence (85)
    for (const portfolio of ["Finance", "Petroleum", "Trade & Investment"]) {
      const name = `Minister-${portfolio}`;
      cabinetAppointments[portfolio] = name;
      characters[name] = makeCharacter(name, portfolio, 85);
    }

    // Resources cluster: low competence (30)
    for (const portfolio of ["Agriculture & Rural Development", "Environment"]) {
      const name = `Minister-${portfolio}`;
      cabinetAppointments[portfolio] = name;
      characters[name] = makeCharacter(name, portfolio, 30);
    }

    // Fill rest as vacant
    for (const cluster of CABINET_CLUSTERS) {
      if (cluster.id === "economic" || cluster.id === "resources") continue;
      for (const portfolio of cluster.portfolios) {
        cabinetAppointments[portfolio] = null;
      }
    }

    const result = computeMinisterialEffectiveness({ cabinetAppointments, characters });

    expect(result["economy"]).toBe(1.15);     // 85 avg → 80+ band
    expect(result["agriculture"]).toBe(0.70);  // 30 avg → <40 band
    expect(result["environment"]).toBe(0.70);
  });
});

// ── Task 15: Minister Event Generation Tests ──────────────────────────────

describe("generateMinisterEvents", () => {
  /** Create a seeded RNG that returns values from a predetermined sequence */
  function makeRng(values: number[]): () => number {
    let idx = 0;
    return () => {
      const v = values[idx % values.length];
      idx++;
      return v;
    };
  }

  function makeMinimalState(overrides?: {
    cabinetAppointments?: Record<string, string | null>;
    characters?: Record<string, CharacterState>;
  }) {
    return {
      cabinetAppointments: overrides?.cabinetAppointments ?? {},
      characters: overrides?.characters ?? {},
      day: 100,
      date: "Thursday, 8 June, 2023",
    };
  }

  describe("initiative events", () => {
    it("generates initiative event for minister with competence > 80 when rng < 0.03", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      // One high-competence minister
      cabinetAppointments["Finance"] = "Dr. Adamu";
      characters["Dr. Adamu"] = makeCharacter("Dr. Adamu", "Finance", 85);

      // Fill rest as vacant
      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          if (portfolio !== "Finance") cabinetAppointments[portfolio] = cabinetAppointments[portfolio] ?? null;
        }
      }

      // RNG: first call for initiative check = 0.01 (< 0.03, triggers), second for proposal selection
      const rng = makeRng([0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const initiativeEvents = result.newEvents.filter((e) => e.id.includes("initiative"));
      expect(initiativeEvents.length).toBe(1);
      expect(initiativeEvents[0].choices).toHaveLength(3); // Approve, Defer, Reject
      expect(initiativeEvents[0].choices[0].label).toBe("Approve");
      expect(initiativeEvents[0].choices[1].label).toBe("Defer");
      expect(initiativeEvents[0].choices[2].label).toBe("Reject");
    });

    it("does not generate initiative event when competence <= 80", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Finance"] = "Minister A";
      characters["Minister A"] = makeCharacter("Minister A", "Finance", 75);

      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          if (portfolio !== "Finance") cabinetAppointments[portfolio] = null;
        }
      }

      const rng = makeRng([0.01, 0.5]); // Would trigger if competence was > 80
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const initiativeEvents = result.newEvents.filter((e) => e.id.includes("initiative"));
      expect(initiativeEvents.length).toBe(0);
    });

    it("does not generate initiative event when rng >= 0.03", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Finance"] = "Dr. Adamu";
      characters["Dr. Adamu"] = makeCharacter("Dr. Adamu", "Finance", 90);

      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          if (portfolio !== "Finance") cabinetAppointments[portfolio] = null;
        }
      }

      const rng = makeRng([0.05, 0.5]); // 0.05 >= 0.03, does not trigger
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const initiativeEvents = result.newEvents.filter((e) => e.id.includes("initiative"));
      expect(initiativeEvents.length).toBe(0);
    });
  });

  describe("sabotage events", () => {
    it("generates sabotage event for minister with loyalty < 40 when rng < 0.02", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Defence"] = "Gen. Tsafe";
      characters["Gen. Tsafe"] = makeCharacter("Gen. Tsafe", "Defence", 50, { loyalty: 30 });

      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          if (portfolio !== "Defence") cabinetAppointments[portfolio] = null;
        }
      }

      // RNG sequence: initiative check (skipped since competence not > 80),
      // then sabotage check = 0.01 (< 0.02), sabotage description selection
      const rng = makeRng([0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const sabotageEvents = result.newEvents.filter((e) => e.id.includes("sabotage"));
      expect(sabotageEvents.length).toBe(1);
      expect(sabotageEvents[0].choices).toHaveLength(4); // Confront, Probation, Dismiss, Monitor
      expect(sabotageEvents[0].choices[0].label).toBe("Confront privately");
      expect(sabotageEvents[0].choices[1].label).toBe("Place on probation");
      expect(sabotageEvents[0].choices[2].label).toBe("Dismiss immediately");
      expect(sabotageEvents[0].choices[3].label).toBe("Monitor quietly");
    });

    it("does not generate sabotage event when loyalty >= 40", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Defence"] = "Gen. Loyal";
      characters["Gen. Loyal"] = makeCharacter("Gen. Loyal", "Defence", 50, { loyalty: 60 });

      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          if (portfolio !== "Defence") cabinetAppointments[portfolio] = null;
        }
      }

      const rng = makeRng([0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const sabotageEvents = result.newEvents.filter((e) => e.id.includes("sabotage"));
      expect(sabotageEvents.length).toBe(0);
    });

    it("dismiss choice has approval and stability consequences", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Defence"] = "Gen. Tsafe";
      characters["Gen. Tsafe"] = makeCharacter("Gen. Tsafe", "Defence", 50, { loyalty: 20 });

      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          if (portfolio !== "Defence") cabinetAppointments[portfolio] = null;
        }
      }

      const rng = makeRng([0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const sabotageEvents = result.newEvents.filter((e) => e.id.includes("sabotage"));
      expect(sabotageEvents.length).toBe(1);
      const dismissChoice = sabotageEvents[0].choices.find((c) => c.label === "Dismiss immediately");
      expect(dismissChoice).toBeDefined();
      expect(dismissChoice!.consequences).toHaveLength(1);
      expect(dismissChoice!.consequences[0].effects.some((e) => e.target === "approval")).toBe(true);
      expect(dismissChoice!.consequences[0].effects.some((e) => e.target === "stability")).toBe(true);
    });
  });

  describe("clash events", () => {
    it("generates clash event when two ministers in same cluster have loyalty difference > 30", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      // Two ministers in economic cluster with loyalty diff > 30
      cabinetAppointments["Finance"] = "Minister A";
      characters["Minister A"] = makeCharacter("Minister A", "Finance", 60, { loyalty: 80 });
      cabinetAppointments["Petroleum"] = "Minister B";
      characters["Minister B"] = makeCharacter("Minister B", "Petroleum", 60, { loyalty: 40 });
      cabinetAppointments["Trade & Investment"] = null;

      for (const cluster of CABINET_CLUSTERS) {
        if (cluster.id === "economic") continue;
        for (const portfolio of cluster.portfolios) {
          cabinetAppointments[portfolio] = null;
        }
      }

      // No initiative or sabotage checks consume RNG (competence not > 80, loyalty not < 40)
      // First RNG call is the clash check, needs < 0.02; second is clash description selection
      const rng = makeRng([0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const clashEvents = result.newEvents.filter((e) => e.id.includes("clash"));
      expect(clashEvents.length).toBe(1);
      expect(clashEvents[0].choices).toHaveLength(3); // Mediate, Back one, Ignore
      expect(clashEvents[0].choices[0].label).toBe("Mediate");
      expect(clashEvents[0].choices[2].label).toBe("Ignore");
    });

    it("does not generate clash event when loyalty difference <= 30", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Finance"] = "Minister A";
      characters["Minister A"] = makeCharacter("Minister A", "Finance", 60, { loyalty: 60 });
      cabinetAppointments["Petroleum"] = "Minister B";
      characters["Minister B"] = makeCharacter("Minister B", "Petroleum", 60, { loyalty: 50 });
      cabinetAppointments["Trade & Investment"] = null;

      for (const cluster of CABINET_CLUSTERS) {
        if (cluster.id === "economic") continue;
        for (const portfolio of cluster.portfolios) {
          cabinetAppointments[portfolio] = null;
        }
      }

      const rng = makeRng([0.5, 0.5, 0.5, 0.5, 0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const clashEvents = result.newEvents.filter((e) => e.id.includes("clash"));
      expect(clashEvents.length).toBe(0);
    });

    it("mediate choice costs political capital", () => {
      const characters: Record<string, CharacterState> = {};
      const cabinetAppointments: Record<string, string | null> = {};

      cabinetAppointments["Finance"] = "Minister A";
      characters["Minister A"] = makeCharacter("Minister A", "Finance", 60, { loyalty: 85 });
      cabinetAppointments["Petroleum"] = "Minister B";
      characters["Minister B"] = makeCharacter("Minister B", "Petroleum", 60, { loyalty: 30 });
      cabinetAppointments["Trade & Investment"] = null;

      for (const cluster of CABINET_CLUSTERS) {
        if (cluster.id === "economic") continue;
        for (const portfolio of cluster.portfolios) {
          cabinetAppointments[portfolio] = null;
        }
      }

      // No initiative or sabotage checks consume RNG; first call is clash check
      const rng = makeRng([0.01, 0.5]);
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters }), rng);

      const clashEvents = result.newEvents.filter((e) => e.id.includes("clash"));
      expect(clashEvents.length).toBe(1);
      const mediateChoice = clashEvents[0].choices.find((c) => c.label === "Mediate");
      expect(mediateChoice).toBeDefined();
      expect(mediateChoice!.consequences[0].effects.some((e) => e.target === "politicalCapital" && e.delta === -1)).toBe(true);
    });
  });

  describe("empty cabinet", () => {
    it("generates no events for completely vacant cabinet", () => {
      const cabinetAppointments: Record<string, string | null> = {};
      for (const cluster of CABINET_CLUSTERS) {
        for (const portfolio of cluster.portfolios) {
          cabinetAppointments[portfolio] = null;
        }
      }

      const rng = makeRng([0.001]); // Very low, would trigger everything if ministers existed
      const result = generateMinisterEvents(makeMinimalState({ cabinetAppointments, characters: {} }), rng);

      expect(result.newEvents).toHaveLength(0);
    });
  });
});
