import { describe, it, expect } from "vitest";
import { computeStakeholderSentiment, type StakeholderSentiment } from "./stakeholderSentiment";
import type { PolicyLeverState } from "./gameTypes";
import type { EconomicState } from "./economicTypes";

function makeLevers(overrides: Partial<Record<string, string>> = {}): PolicyLeverState {
  const defaults: Record<string, { position: string; pendingPosition: null; cooldownUntilDay: number }> = {
    fuelSubsidy: { position: "full", pendingPosition: null, cooldownUntilDay: 0 },
    fxPolicy: { position: "managed-float", pendingPosition: null, cooldownUntilDay: 0 },
    interestRate: { position: "neutral", pendingPosition: null, cooldownUntilDay: 0 },
    taxRate: { position: "standard", pendingPosition: null, cooldownUntilDay: 0 },
    cashTransfers: { position: "minimal", pendingPosition: null, cooldownUntilDay: 0 },
    importTariffs: { position: "moderate", pendingPosition: null, cooldownUntilDay: 0 },
    minimumWage: { position: "modest", pendingPosition: null, cooldownUntilDay: 0 },
    publicSectorHiring: { position: "normal", pendingPosition: null, cooldownUntilDay: 0 },
    electricityTariff: { position: "cost-reflective", pendingPosition: null, cooldownUntilDay: 0 },
    // Governance sector levers
    powerPrivatization: { position: "partial-private", pendingPosition: null, cooldownUntilDay: 0 },
    oilSectorReform: { position: "status-quo", pendingPosition: null, cooldownUntilDay: 0 },
    transportPriority: { position: "roads", pendingPosition: null, cooldownUntilDay: 0 },
    digitalInvestment: { position: "moderate", pendingPosition: null, cooldownUntilDay: 0 },
    healthcareFunding: { position: "basic", pendingPosition: null, cooldownUntilDay: 0 },
    drugProcurement: { position: "open-tender", pendingPosition: null, cooldownUntilDay: 0 },
    universityAutonomy: { position: "partial-autonomy", pendingPosition: null, cooldownUntilDay: 0 },
    educationBudgetSplit: { position: "balanced", pendingPosition: null, cooldownUntilDay: 0 },
    landReform: { position: "mixed", pendingPosition: null, cooldownUntilDay: 0 },
    agricSubsidies: { position: "input-subsidies", pendingPosition: null, cooldownUntilDay: 0 },
    borderPolicy: { position: "standard", pendingPosition: null, cooldownUntilDay: 0 },
    nationalIdPush: { position: "incentivized", pendingPosition: null, cooldownUntilDay: 0 },
    gasFlarePolicy: { position: "penalties", pendingPosition: null, cooldownUntilDay: 0 },
    climateAdaptation: { position: "moderate", pendingPosition: null, cooldownUntilDay: 0 },
    nyscReform: { position: "status-quo", pendingPosition: null, cooldownUntilDay: 0 },
    youthEnterprise: { position: "startup-ecosystem", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) {
    defaults[k] = { ...defaults[k], position: v! };
  }
  return defaults as unknown as PolicyLeverState;
}

function makeEconomy(overrides: Partial<EconomicState> = {}): Partial<EconomicState> {
  return { inflation: 12, unemploymentRate: 20, fxRate: 900, reserves: 30, debtToGdp: 30, ...overrides };
}

describe("computeStakeholderSentiment", () => {
  describe("International Institutions", () => {
    it("opposed when peg", () => {
      const result = computeStakeholderSentiment("international", makeLevers({ fxPolicy: "peg" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
    it("opposed when full subsidy", () => {
      const result = computeStakeholderSentiment("international", makeLevers({ fuelSubsidy: "full" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
    it("opposed when no transfers and high unemployment", () => {
      const result = computeStakeholderSentiment("international", makeLevers({ cashTransfers: "none" }), makeEconomy({ unemploymentRate: 35 }));
      expect(result.sentiment).toBe("opposed");
    });
    it("cautious when only reform side is strong", () => {
      const result = computeStakeholderSentiment("international", makeLevers({ fxPolicy: "free-float", fuelSubsidy: "targeted", taxRate: "standard" }), makeEconomy());
      expect(result.sentiment).toBe("cautious");
    });
    it("cautious when only social side is strong", () => {
      const result = computeStakeholderSentiment("international", makeLevers({ fuelSubsidy: "partial", cashTransfers: "moderate" }), makeEconomy({ inflation: 10 }));
      expect(result.sentiment).toBe("cautious");
    });
    it("supportive when both reform and social dimensions are strong", () => {
      const result = computeStakeholderSentiment("international",
        makeLevers({ fxPolicy: "free-float", fuelSubsidy: "targeted", taxRate: "standard", cashTransfers: "moderate" }),
        makeEconomy({ inflation: 10 }));
      expect(result.sentiment).toBe("supportive");
    });
  });
  describe("Business Community", () => {
    it("supportive when low tax, moderate tariffs, float FX", () => {
      const result = computeStakeholderSentiment("business", makeLevers({ taxRate: "low", importTariffs: "moderate", fxPolicy: "managed-float" }), makeEconomy());
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when high tax", () => {
      const result = computeStakeholderSentiment("business", makeLevers({ taxRate: "high" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
  });
  describe("Labour Unions", () => {
    it("supportive when union-demand wage and normal hiring", () => {
      const result = computeStakeholderSentiment("labour", makeLevers({ minimumWage: "union-demand", publicSectorHiring: "normal" }), makeEconomy());
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when subsidy removed and minimal transfers", () => {
      const result = computeStakeholderSentiment("labour", makeLevers({ fuelSubsidy: "removed", cashTransfers: "minimal" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
  });
  describe("Market Analysts", () => {
    it("supportive when reserves high, debt low, inflation low", () => {
      const result = computeStakeholderSentiment("analysts", makeLevers(), makeEconomy({ reserves: 35, debtToGdp: 30, inflation: 10 }));
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when reserves critically low", () => {
      const result = computeStakeholderSentiment("analysts", makeLevers(), makeEconomy({ reserves: 10 }));
      expect(result.sentiment).toBe("opposed");
    });
  });
  describe("Oil & Gas Sector", () => {
    const oilConfig = { id: "oil-industry", name: "Oil & Gas Sector", focus: "production stability",
      quoteTemplates: { supportive: "OK", cautious: "Hmm", opposed: "Bad" } };

    it("opposed when FX is peg", () => {
      const result = computeStakeholderSentiment("oil-industry", makeLevers({ fxPolicy: "peg" }), makeEconomy({ oilOutput: 1.5 }), oilConfig);
      expect(result.sentiment).toBe("opposed");
    });
    it("opposed when oil output critically low", () => {
      const result = computeStakeholderSentiment("oil-industry", makeLevers(), makeEconomy({ oilOutput: 1.0 }), oilConfig);
      expect(result.sentiment).toBe("opposed");
    });
    it("supportive when free-float, moderate tariffs, high output", () => {
      const result = computeStakeholderSentiment("oil-industry", makeLevers({ fxPolicy: "free-float", importTariffs: "moderate" }), makeEconomy({ oilOutput: 1.5 }), oilConfig);
      expect(result.sentiment).toBe("supportive");
    });
    it("cautious by default", () => {
      const result = computeStakeholderSentiment("oil-industry", makeLevers(), makeEconomy({ oilOutput: 1.5 }), oilConfig);
      expect(result.sentiment).toBe("cautious");
    });
  });

  describe("Bond Investors", () => {
    const bondConfig = { id: "bond-market", name: "Bond Investors", focus: "yields",
      quoteTemplates: { supportive: "OK", cautious: "Hmm", opposed: "Bad" } };

    it("opposed when debt-to-GDP too high", () => {
      const result = computeStakeholderSentiment("bond-market", makeLevers(), makeEconomy({ debtToGdp: 55 }), bondConfig);
      expect(result.sentiment).toBe("opposed");
    });
    it("opposed when reserves critically low", () => {
      const result = computeStakeholderSentiment("bond-market", makeLevers(), makeEconomy({ reserves: 10 }), bondConfig);
      expect(result.sentiment).toBe("opposed");
    });
    it("opposed when dovish rates and high inflation", () => {
      const result = computeStakeholderSentiment("bond-market", makeLevers({ interestRate: "dovish" }), makeEconomy({ inflation: 20 }), bondConfig);
      expect(result.sentiment).toBe("opposed");
    });
    it("supportive when debt low, reserves high, inflation controlled", () => {
      const result = computeStakeholderSentiment("bond-market", makeLevers(), makeEconomy({ debtToGdp: 30, reserves: 30, inflation: 10 }), bondConfig);
      expect(result.sentiment).toBe("supportive");
    });
  });

  describe("Manufacturers Association", () => {
    const mfgConfig = { id: "manufacturers", name: "Manufacturers Association", focus: "protection",
      quoteTemplates: { supportive: "OK", cautious: "Hmm", opposed: "Bad" } };

    it("opposed when tariffs are open", () => {
      const result = computeStakeholderSentiment("manufacturers", makeLevers({ importTariffs: "open" }), makeEconomy(), mfgConfig);
      expect(result.sentiment).toBe("opposed");
    });
    it("supportive when protective tariffs, float FX, non-hawkish rates", () => {
      const result = computeStakeholderSentiment("manufacturers", makeLevers({ importTariffs: "protective", fxPolicy: "managed-float", interestRate: "neutral" }), makeEconomy(), mfgConfig);
      expect(result.sentiment).toBe("supportive");
    });
    it("cautious by default", () => {
      const result = computeStakeholderSentiment("manufacturers", makeLevers({ importTariffs: "moderate" }), makeEconomy(), mfgConfig);
      expect(result.sentiment).toBe("cautious");
    });
  });

  it("returns a quote string", () => {
    const result = computeStakeholderSentiment("international", makeLevers(), makeEconomy());
    expect(result.quote).toBeTruthy();
    expect(typeof result.quote).toBe("string");
  });
});

// ── Helper config factory for new stakeholders ──────────────────
function makeConfig(id: string, name: string): import("./governanceSections").StakeholderConfig {
  return { id, name, focus: "test", quoteTemplates: { supportive: "Good", cautious: "Hmm", opposed: "Bad" } };
}

describe("New governance sector stakeholders", () => {

  /* ── Infrastructure ── */
  describe("Power Unions", () => {
    const cfg = makeConfig("power-unions", "Power Unions");
    it("supportive when state-run", () => {
      expect(computeStakeholderSentiment("power-unions", makeLevers({ powerPrivatization: "state-run" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when full-private", () => {
      expect(computeStakeholderSentiment("power-unions", makeLevers({ powerPrivatization: "full-private" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when partial-private", () => {
      expect(computeStakeholderSentiment("power-unions", makeLevers({ powerPrivatization: "partial-private" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });

  describe("Telecom Industry", () => {
    const cfg = makeConfig("telecom-industry", "Telecom Industry");
    it("supportive when aggressive digital investment", () => {
      expect(computeStakeholderSentiment("telecom-industry", makeLevers({ digitalInvestment: "aggressive" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when minimal digital investment", () => {
      expect(computeStakeholderSentiment("telecom-industry", makeLevers({ digitalInvestment: "minimal" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when moderate digital investment", () => {
      expect(computeStakeholderSentiment("telecom-industry", makeLevers({ digitalInvestment: "moderate" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });

  describe("International Development Partners", () => {
    const cfg = makeConfig("international-development-partners", "International Development Partners");
    it("supportive when full-private and aggressive digital", () => {
      expect(computeStakeholderSentiment("international-development-partners",
        makeLevers({ powerPrivatization: "full-private", digitalInvestment: "aggressive" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when state-run and peg FX", () => {
      expect(computeStakeholderSentiment("international-development-partners",
        makeLevers({ powerPrivatization: "state-run", fxPolicy: "peg" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  /* ── Health ── */
  describe("NMA (Nigerian Medical Association)", () => {
    const cfg = makeConfig("nma", "Nigerian Medical Association");
    it("supportive when universal-push funding and not international-partnership procurement", () => {
      expect(computeStakeholderSentiment("nma",
        makeLevers({ healthcareFunding: "universal-push", drugProcurement: "open-tender" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when underfunded", () => {
      expect(computeStakeholderSentiment("nma", makeLevers({ healthcareFunding: "underfunded" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when universal-push but international-partnership procurement", () => {
      expect(computeStakeholderSentiment("nma",
        makeLevers({ healthcareFunding: "universal-push", drugProcurement: "international-partnership" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });

  describe("Patient Advocacy", () => {
    const cfg = makeConfig("patient-advocacy", "Patient Advocacy Groups");
    it("supportive when universal-push funding", () => {
      expect(computeStakeholderSentiment("patient-advocacy", makeLevers({ healthcareFunding: "universal-push" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when underfunded", () => {
      expect(computeStakeholderSentiment("patient-advocacy", makeLevers({ healthcareFunding: "underfunded" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when basic funding", () => {
      expect(computeStakeholderSentiment("patient-advocacy", makeLevers({ healthcareFunding: "basic" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });

  /* ── Education ── */
  describe("ASUU", () => {
    const cfg = makeConfig("asuu", "ASUU");
    it("supportive when full-autonomy", () => {
      expect(computeStakeholderSentiment("asuu", makeLevers({ universityAutonomy: "full-autonomy" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when centralized", () => {
      expect(computeStakeholderSentiment("asuu", makeLevers({ universityAutonomy: "centralized" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when partial-autonomy", () => {
      expect(computeStakeholderSentiment("asuu", makeLevers({ universityAutonomy: "partial-autonomy" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });

  describe("NUT (Nigeria Union of Teachers)", () => {
    const cfg = makeConfig("nut", "Nigeria Union of Teachers");
    it("supportive when basic-heavy budget split", () => {
      expect(computeStakeholderSentiment("nut", makeLevers({ educationBudgetSplit: "basic-heavy" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when tertiary-heavy budget split", () => {
      expect(computeStakeholderSentiment("nut", makeLevers({ educationBudgetSplit: "tertiary-heavy" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  /* ── Agriculture ── */
  describe("Farmers Associations", () => {
    const cfg = makeConfig("farmers-associations", "Farmers Associations");
    it("supportive when communal land reform and input-subsidies", () => {
      expect(computeStakeholderSentiment("farmers-associations",
        makeLevers({ landReform: "communal", agricSubsidies: "input-subsidies" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when titling-program and no subsidies", () => {
      expect(computeStakeholderSentiment("farmers-associations",
        makeLevers({ landReform: "titling-program", agricSubsidies: "none" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  describe("Agribusiness Exporters", () => {
    const cfg = makeConfig("agribusiness-exporters", "Agribusiness Exporters");
    it("supportive when titling-program and full-mechanization", () => {
      expect(computeStakeholderSentiment("agribusiness-exporters",
        makeLevers({ landReform: "titling-program", agricSubsidies: "full-mechanization" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when communal land reform and no subsidies", () => {
      expect(computeStakeholderSentiment("agribusiness-exporters",
        makeLevers({ landReform: "communal", agricSubsidies: "none" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  /* ── Interior ── */
  describe("Police Commission", () => {
    const cfg = makeConfig("police-commission", "Police Commission");
    it("supportive when fortress border and mandatory ID", () => {
      expect(computeStakeholderSentiment("police-commission",
        makeLevers({ borderPolicy: "fortress", nationalIdPush: "mandatory" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when porous border and voluntary ID", () => {
      expect(computeStakeholderSentiment("police-commission",
        makeLevers({ borderPolicy: "porous", nationalIdPush: "voluntary" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  describe("Human Rights Orgs", () => {
    const cfg = makeConfig("human-rights-orgs", "Human Rights Organisations");
    it("supportive when non-fortress border and voluntary ID", () => {
      expect(computeStakeholderSentiment("human-rights-orgs",
        makeLevers({ borderPolicy: "standard", nationalIdPush: "voluntary" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when fortress border and mandatory ID", () => {
      expect(computeStakeholderSentiment("human-rights-orgs",
        makeLevers({ borderPolicy: "fortress", nationalIdPush: "mandatory" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  /* ── Environment ── */
  describe("Environmental NGOs", () => {
    const cfg = makeConfig("environmental-ngos", "Environmental NGOs");
    it("supportive when zero-flare and aggressive adaptation", () => {
      expect(computeStakeholderSentiment("environmental-ngos",
        makeLevers({ gasFlarePolicy: "zero-flare", climateAdaptation: "aggressive" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when tolerance flare", () => {
      expect(computeStakeholderSentiment("environmental-ngos",
        makeLevers({ gasFlarePolicy: "tolerance", climateAdaptation: "moderate" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("opposed when minimal climate adaptation", () => {
      expect(computeStakeholderSentiment("environmental-ngos",
        makeLevers({ gasFlarePolicy: "penalties", climateAdaptation: "minimal" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  describe("Industrial Polluters", () => {
    const cfg = makeConfig("industrial-polluters", "Industrial Polluters");
    it("supportive when tolerance flare and minimal adaptation", () => {
      expect(computeStakeholderSentiment("industrial-polluters",
        makeLevers({ gasFlarePolicy: "tolerance", climateAdaptation: "minimal" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when zero-flare policy", () => {
      expect(computeStakeholderSentiment("industrial-polluters",
        makeLevers({ gasFlarePolicy: "zero-flare", climateAdaptation: "minimal" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("opposed when aggressive climate adaptation", () => {
      expect(computeStakeholderSentiment("industrial-polluters",
        makeLevers({ gasFlarePolicy: "tolerance", climateAdaptation: "aggressive" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  /* ── Youth & Employment ── */
  describe("NYSC Alumni", () => {
    const cfg = makeConfig("nysc-alumni", "NYSC Alumni Association");
    it("supportive when reformed NYSC", () => {
      expect(computeStakeholderSentiment("nysc-alumni", makeLevers({ nyscReform: "reformed" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when scrapped", () => {
      expect(computeStakeholderSentiment("nysc-alumni", makeLevers({ nyscReform: "scrapped" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when status-quo", () => {
      expect(computeStakeholderSentiment("nysc-alumni", makeLevers({ nyscReform: "status-quo" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });

  describe("Tech Startup Ecosystem", () => {
    const cfg = makeConfig("tech-startup", "Tech Startup Ecosystem");
    it("supportive when startup-ecosystem and aggressive digital investment", () => {
      expect(computeStakeholderSentiment("tech-startup",
        makeLevers({ youthEnterprise: "startup-ecosystem", digitalInvestment: "aggressive" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when public-works and minimal digital investment", () => {
      expect(computeStakeholderSentiment("tech-startup",
        makeLevers({ youthEnterprise: "public-works", digitalInvestment: "minimal" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
  });

  describe("Youth Civic Groups", () => {
    const cfg = makeConfig("youth-civic", "Youth Civic Groups");
    it("supportive when reformed NYSC and non-minimal enterprise", () => {
      expect(computeStakeholderSentiment("youth-civic",
        makeLevers({ nyscReform: "reformed", youthEnterprise: "startup-ecosystem" }), makeEconomy(), cfg).sentiment).toBe("supportive");
    });
    it("opposed when scrapped NYSC and minimal enterprise", () => {
      expect(computeStakeholderSentiment("youth-civic",
        makeLevers({ nyscReform: "scrapped", youthEnterprise: "minimal" }), makeEconomy(), cfg).sentiment).toBe("opposed");
    });
    it("cautious when status-quo NYSC", () => {
      expect(computeStakeholderSentiment("youth-civic",
        makeLevers({ nyscReform: "status-quo", youthEnterprise: "startup-ecosystem" }), makeEconomy(), cfg).sentiment).toBe("cautious");
    });
  });
});
