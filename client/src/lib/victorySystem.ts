// Aso Rock - Victory Paths & Failure States

import type { DefeatVictoryCounters } from "./gameTypes";

export interface VictoryPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  progressFn: (state: VictoryCheckState) => number;
}

export interface FailureState {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Returns a risk score 0-100; a score >= 100 triggers defeat. */
  riskFn: (state: VictoryCheckState) => number;
  /**
   * Optional hard-check that bypasses the risk score — returns true when this
   * defeat condition is definitively triggered (used for sector-based conditions
   * where the counter threshold tells us it has already fired).
   */
  hardCheck?: (state: VictoryCheckState) => boolean;
}

// Sector sub-state (mirrors GovernanceSectorState keys we need)
interface SectorView {
  health: number;
  crisisZone: "green" | "yellow" | "red";
  indicators: Record<string, number>;
}

export interface VictoryCheckState {
  approval: number;
  treasury: number;
  stability: number;
  politicalCapital: number;
  stress: number;
  outrage: number;
  trust: number;
  day: number;
  health: number;
  judicialIndependence: number;
  characters: Record<string, { competencies: { personal: { loyalty: number } }; relationship: string }>;
  factions: Record<string, { loyalty: number; influence: number }>;
  governors: { loyalty: number; relationship: string }[];
  activeCases: { status: string }[];
  vicePresident: { loyalty: number; ambition: number; relationship: string; mood: string };
  term: { current: number; daysUntilElection: number; reelectionsWon: number; overstayDays: number; governingPhase: string; electionMomentum: number };
  campaignPromises: { progress: number; status: string }[];
  healthCrisis: { rumorsActive: boolean; announced: boolean; concealmentActive: boolean };
  macroEconomy: { inflation: number; fxRate: number; reserves: number; debtToGdp: number; oilOutput: number; subsidyPressure: number };
  // Governance sector states (optional for backward-compat with existing tests)
  infrastructure?: SectorView;
  healthSector?: SectorView;
  education?: SectorView;
  agriculture?: SectorView;
  interior?: SectorView;
  environment?: SectorView;
  youthEmployment?: SectorView;
  // Policy levers (optional for backward-compat)
  policyLevers?: {
    powerPrivatization?: { position: string };
    oilSectorReform?: { position: string };
    transportPriority?: { position: string };
    digitalInvestment?: { position: string };
    healthcareFunding?: { position: string };
    drugProcurement?: { position: string };
    universityAutonomy?: { position: string };
    educationBudgetSplit?: { position: string };
    landReform?: { position: string };
    agricSubsidies?: { position: string };
    borderPolicy?: { position: string };
    nationalIdPush?: { position: string };
    gasFlarePolicy?: { position: string };
    climateAdaptation?: { position: string };
    nyscReform?: { position: string };
    youthEnterprise?: { position: string };
  };
  // Economy state for GDP growth tracking (optional for backward-compat)
  economy?: { gdpGrowthRate?: number };
  // Consecutive-turn counters for defeat/victory conditions
  defeatVictoryCounters?: DefeatVictoryCounters;
  // International reputation (0-100)
  internationalReputation?: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const averageFactionLoyalty = (state: VictoryCheckState) => {
  const factions = Object.values(state.factions);
  if (factions.length === 0) return 50;
  return factions.reduce((sum, faction) => sum + faction.loyalty, 0) / factions.length;
};
const fulfilledPromises = (state: VictoryCheckState) => state.campaignPromises.filter((promise) => promise.status === "fulfilled").length;
const brokenPromises = (state: VictoryCheckState) => state.campaignPromises.filter((promise) => promise.status === "broken").length;

export const victoryPaths: VictoryPath[] = [
  {
    id: "economic-miracle",
    name: "Economic Miracle",
    description: "GDP growth > 5%, inflation < 15%, FX stable for 60 days",
    icon: "TrendingUp",
    color: "hsl(153, 60%, 32%)",
    progressFn: (s) => {
      const treasuryScore = Math.min(18, Math.max(0, (s.treasury / 2.2) * 18));
      const inflationScore = Math.min(24, Math.max(0, ((35 - s.macroEconomy.inflation) / 20) * 24));
      const fxScore = Math.min(20, Math.max(0, ((2200 - s.macroEconomy.fxRate) / 1200) * 20));
      const reservesScore = Math.min(16, Math.max(0, ((s.macroEconomy.reserves - 18) / 20) * 16));
      const debtScore = Math.min(10, Math.max(0, ((60 - s.macroEconomy.debtToGdp) / 25) * 10));
      const promiseScore = Math.min(6, fulfilledPromises(s) * 2);
      const timeScore = Math.min(6, (s.day / 180) * 6);
      return Math.round(Math.min(100, treasuryScore + inflationScore + fxScore + reservesScore + debtScore + promiseScore + timeScore));
    },
  },
  {
    id: "security-champion",
    name: "Security Champion",
    description: "All theater effectiveness > 70%, incidents down 50%",
    icon: "Shield",
    color: "hsl(210, 70%, 50%)",
    progressFn: (s) => {
      const stabilityScore = Math.min(45, (s.stability / 100) * 45);
      const outrageControl = Math.min(20, ((100 - s.outrage) / 100) * 20);
      const governorScore = Math.min(20, (s.governors.reduce((sum, governor) => sum + governor.loyalty, 0) / Math.max(1, s.governors.length) / 100) * 20);
      const trustScore = Math.min(15, (s.trust / 100) * 15);
      return Math.round(Math.min(100, stabilityScore + outrageControl + governorScore + trustScore));
    },
  },
  {
    id: "democratic-legacy",
    name: "Democratic Legacy",
    description: "Legacy score > 80, 3+ major reforms passed, approval > 55%",
    icon: "Scale",
    color: "hsl(42, 70%, 50%)",
    progressFn: (s) => {
      const approvalScore = Math.min(28, (s.approval / 65) * 28);
      const trustScore = Math.min(24, (s.trust / 100) * 24);
      const judicialScore = Math.min(24, (s.judicialIndependence / 100) * 24);
      const promiseScore = Math.min(16, fulfilledPromises(s) * 4);
      const penalty = brokenPromises(s) * 3;
      return Math.round(clamp(approvalScore + trustScore + judicialScore + promiseScore - penalty, 0, 100));
    },
  },
  {
    id: "regional-hegemon",
    name: "Regional Hegemon",
    description: "ECOWAS leadership secured, 3+ trade deals signed, Niger crisis resolved",
    icon: "Globe",
    color: "hsl(195, 65%, 46%)",
    progressFn: (s) => {
      const pcScore = Math.min(36, (s.politicalCapital / 100) * 36);
      const trustScore = Math.min(24, (s.trust / 100) * 24);
      const stabilityScore = Math.min(18, (s.stability / 100) * 18);
      const dayScore = Math.min(10, (s.day / 240) * 10);
      const vpScore = Math.min(12, (s.vicePresident.loyalty / 100) * 12);
      return Math.round(Math.min(100, pcScore + trustScore + stabilityScore + dayScore + vpScore));
    },
  },
  {
    id: "party-machine",
    name: "Party Machine",
    description: "All factions loyalty > 60, re-election secured, party chairman removed",
    icon: "Users",
    color: "hsl(330, 60%, 50%)",
    progressFn: (s) => {
      const factionScore = Math.min(35, (averageFactionLoyalty(s) / 80) * 35);
      const reelectionScore = Math.min(25, s.term.reelectionsWon * 25);
      const momentumScore = Math.min(20, (s.term.electionMomentum / 100) * 20);
      const vpControlScore = Math.min(10, (s.vicePresident.loyalty / 100) * 10);
      const pcScore = Math.min(10, (s.politicalCapital / 100) * 10);
      return Math.round(Math.min(100, factionScore + reelectionScore + momentumScore + vpControlScore + pcScore));
    },
  },
  // ── New sector-based victory paths ──────────────────────────────────────────
  {
    id: "economic-titan",
    name: "Economic Titan",
    description: "Economy health > 80, GDP growth positive for 12+ turns, debt-to-GDP < 30",
    icon: "Landmark",
    color: "hsl(38, 80%, 45%)",
    progressFn: (s) => {
      const econHealth = s.economy ? Math.min(30, ((s.economy.gdpGrowthRate ?? 0) > 0 ? 30 : 0)) : 0;
      const gdpStreakScore = Math.min(30, ((s.defeatVictoryCounters?.gdpGrowthPositiveTurns ?? 0) / 12) * 30);
      const debtScore = s.macroEconomy.debtToGdp < 30 ? 25 : Math.min(25, Math.max(0, ((50 - s.macroEconomy.debtToGdp) / 20) * 25));
      const sectorEconHealth = s.agriculture?.health ?? 50;
      const sectorScore = Math.min(15, ((sectorEconHealth - 60) / 20) * 15);
      return Math.round(clamp(econHealth + gdpStreakScore + debtScore + sectorScore, 0, 100));
    },
  },
  {
    id: "peoples-champion",
    name: "People's Champion",
    description: "Health > 70, Education > 70, Youth > 65, approval > 75",
    icon: "Heart",
    color: "hsl(340, 70%, 50%)",
    progressFn: (s) => {
      const healthScore = Math.min(25, Math.max(0, (((s.healthSector?.health ?? 50) - 50) / 20) * 25));
      const educationScore = Math.min(25, Math.max(0, (((s.education?.health ?? 50) - 50) / 20) * 25));
      const youthScore = Math.min(20, Math.max(0, (((s.youthEmployment?.health ?? 50) - 45) / 20) * 20));
      const approvalScore = Math.min(30, Math.max(0, ((s.approval - 55) / 20) * 30));
      return Math.round(clamp(healthScore + educationScore + youthScore + approvalScore, 0, 100));
    },
  },
  {
    id: "reformer",
    name: "Reformer",
    description: "Infrastructure > 75, 4+ sectors green, all reform levers at most progressive position",
    icon: "Wrench",
    color: "hsl(210, 60%, 46%)",
    progressFn: (s) => {
      const infraHealth = s.infrastructure?.health ?? 50;
      const infraScore = Math.min(25, Math.max(0, ((infraHealth - 55) / 20) * 25));
      const sectors: Array<SectorView | undefined> = [
        s.infrastructure, s.healthSector, s.education, s.agriculture,
        s.interior, s.environment, s.youthEmployment,
      ];
      const greenCount = sectors.filter(sec => sec?.crisisZone === "green").length;
      const greenScore = Math.min(40, (greenCount / 4) * 40);
      // Count levers at their most progressive position
      const progressiveMap: Record<string, string> = {
        powerPrivatization: "full-private", oilSectorReform: "full-deregulation",
        transportPriority: "multimodal", digitalInvestment: "aggressive",
        healthcareFunding: "universal-push", drugProcurement: "international-partnership",
        universityAutonomy: "full-autonomy", educationBudgetSplit: "basic-heavy",
        landReform: "titling-program", agricSubsidies: "full-mechanization",
        borderPolicy: "fortress", nationalIdPush: "mandatory",
        gasFlarePolicy: "zero-flare", climateAdaptation: "aggressive",
        nyscReform: "reformed", youthEnterprise: "startup-ecosystem",
      };
      let progressiveLevers = 0;
      if (s.policyLevers) {
        for (const [key, targetPos] of Object.entries(progressiveMap)) {
          const lever = (s.policyLevers as Record<string, { position?: string } | undefined>)[key];
          if (lever?.position === targetPos) progressiveLevers++;
        }
      }
      const leverScore = Math.min(35, (progressiveLevers / Object.keys(progressiveMap).length) * 35);
      return Math.round(clamp(infraScore + greenScore + leverScore, 0, 100));
    },
  },
  {
    id: "statesman",
    name: "Statesman",
    description: "International reputation > 80, 5+ sectors green, no sectors red",
    icon: "Globe2",
    color: "hsl(195, 65%, 42%)",
    progressFn: (s) => {
      const repScore = Math.min(35, Math.max(0, (((s.internationalReputation ?? 50) - 50) / 30) * 35));
      const sectors: Array<SectorView | undefined> = [
        s.infrastructure, s.healthSector, s.education, s.agriculture,
        s.interior, s.environment, s.youthEmployment,
      ];
      const greenCount = sectors.filter(sec => sec?.crisisZone === "green").length;
      const redCount = sectors.filter(sec => sec?.crisisZone === "red").length;
      const greenScore = Math.min(40, (greenCount / 5) * 40);
      const noRedPenalty = redCount > 0 ? redCount * 15 : 0;
      const approvalScore = Math.min(25, Math.max(0, ((s.approval - 50) / 25) * 25));
      return Math.round(clamp(repScore + greenScore + approvalScore - noRedPenalty, 0, 100));
    },
  },
];

export const failureStates: FailureState[] = [
  {
    id: "economic-collapse",
    name: "Economic Collapse",
    description: "Treasury < 0, FX > 2500, inflation > 50%",
    icon: "TrendingDown",
    color: "hsl(0, 60%, 50%)",
    riskFn: (s) => {
      const treasuryRisk = s.treasury <= 0 ? 18 : Math.max(0, (1 - s.treasury / 2) * 14);
      const fxRisk = Math.max(0, ((s.macroEconomy.fxRate - 1800) / 900) * 24);
      const inflationRisk = Math.max(0, ((s.macroEconomy.inflation - 24) / 24) * 24);
      const reserveRisk = Math.max(0, ((25 - s.macroEconomy.reserves) / 20) * 16);
      const debtRisk = Math.max(0, ((s.macroEconomy.debtToGdp - 45) / 30) * 12);
      const outrageRisk = Math.max(0, (s.outrage / 100) * 18);
      return Math.round(Math.min(100, treasuryRisk + fxRisk + inflationRisk + reserveRisk + debtRisk + outrageRisk));
    },
  },
  {
    id: "military-coup",
    name: "Military Coup",
    description: "Stability < 15, military loyalty < 30, CDS relationship Hostile",
    icon: "Swords",
    color: "hsl(0, 70%, 40%)",
    riskFn: (s) => {
      const stabilityRisk = Math.max(0, ((100 - s.stability) / 100) * 40);
      const cds = s.characters["Maj. Gen. Christopher Musa"];
      const loyaltyRisk = cds ? Math.max(0, ((100 - cds.competencies.personal.loyalty) / 100) * 35) : 15;
      const approvalRisk = Math.max(0, ((100 - s.approval) / 100) * 25);
      return Math.round(Math.min(100, stabilityRisk + loyaltyRisk + approvalRisk));
    },
  },
  {
    id: "popular-revolution",
    name: "Popular Revolution",
    description: "Approval < 15%, outrage > 90, active nationwide strike",
    icon: "Flame",
    color: "hsl(15, 80%, 50%)",
    riskFn: (s) => {
      const approvalRisk = Math.max(0, ((100 - s.approval) / 100) * 35);
      const outrageRisk = Math.max(0, (s.outrage / 100) * 40);
      const trustDeficit = Math.max(0, ((100 - s.trust) / 100) * 25);
      return Math.round(Math.min(100, approvalRisk + outrageRisk + trustDeficit));
    },
  },
  {
    id: "party-removal",
    name: "Party Removal",
    description: "Party chairman influence > 90, 2/3 factions hostile, vote of no confidence",
    icon: "UserX",
    color: "hsl(280, 60%, 45%)",
    riskFn: (s) => {
      const chairman = s.characters["Chief Chidubem Okafor"];
      const chairmanRisk = chairman ? Math.max(0, ((100 - chairman.competencies.personal.loyalty) / 100) * 40) : 20;
      const factionRisk = Math.max(0, ((100 - averageFactionLoyalty(s)) / 100) * 35);
      const pcDeficit = Math.max(0, ((100 - s.politicalCapital) / 100) * 25);
      return Math.round(Math.min(100, chairmanRisk + factionRisk + pcDeficit));
    },
  },
  {
    id: "international-pariah",
    name: "International Pariah",
    description: "All diplomatic relations tense, sanctions imposed, IMF blacklisted",
    icon: "Ban",
    color: "hsl(0, 50%, 35%)",
    riskFn: (s) => {
      const trustDeficit = Math.max(0, ((100 - s.trust) / 100) * 40);
      const outrageRisk = Math.max(0, (s.outrage / 100) * 30);
      const stabilityDeficit = Math.max(0, ((100 - s.stability) / 100) * 30);
      return Math.round(Math.min(100, trustDeficit + outrageRisk + stabilityDeficit));
    },
  },
  {
    id: "health-crisis",
    name: "Health Crisis",
    description: "Stress > 95 or health collapse triggers incapacity",
    icon: "HeartPulse",
    color: "hsl(350, 70%, 50%)",
    riskFn: (s) => {
      const stressRisk = Math.round(Math.min(65, s.stress * 0.65));
      const healthRisk = Math.round(Math.max(0, (45 - s.health) * 1.5));
      const rumorRisk = s.healthCrisis.rumorsActive ? 12 : 0;
      return Math.round(Math.min(100, stressRisk + healthRisk + rumorRisk));
    },
  },
  {
    id: "electoral-defeat",
    name: "Election Loss",
    description: "The opposition defeats you at the ballot box and you concede power.",
    icon: "Vote",
    color: "hsl(225, 50%, 46%)",
    riskFn: (s) => {
      if (s.term.daysUntilElection > 180) return 0;
      const electionRisk = Math.max(0, ((55 - s.term.electionMomentum) / 55) * 55);
      const outrageRisk = Math.max(0, (s.outrage / 100) * 20);
      const promiseRisk = brokenPromises(s) * 4;
      return Math.round(Math.min(100, electionRisk + outrageRisk + promiseRisk));
    },
  },
  {
    id: "constitutional-crisis",
    name: "Constitutional Crisis",
    description: "A disputed result or incapacitation fractures the transfer of power.",
    icon: "ScrollText",
    color: "hsl(30, 65%, 50%)",
    riskFn: (s) => {
      const electionWindow = s.term.daysUntilElection <= 45 ? 1 : 0.4;
      const outrageRisk = Math.max(0, (s.outrage / 100) * 35) * electionWindow;
      const trustRisk = Math.max(0, ((100 - s.trust) / 100) * 25) * electionWindow;
      const healthRisk = s.healthCrisis.concealmentActive ? 20 : 0;
      return Math.round(Math.min(100, outrageRisk + trustRisk + healthRisk));
    },
  },
  {
    id: "succession-crisis",
    name: "Succession Crisis",
    description: "An ambitious VP and overstay talk turn elite politics into a transfer emergency.",
    icon: "UsersRound",
    color: "hsl(15, 55%, 42%)",
    riskFn: (s) => {
      const vpRisk = Math.max(0, ((100 - s.vicePresident.loyalty) / 100) * 40);
      const overstayRisk = Math.min(30, s.term.overstayDays * 0.5);
      const approvalRisk = s.term.current > 1 ? Math.max(0, ((45 - s.approval) / 45) * 30) : 0;
      return Math.round(Math.min(100, vpRisk + overstayRisk + approvalRisk));
    },
  },
  // ── New sector-based defeat conditions ──────────────────────────────────────
  {
    id: "famine",
    name: "Famine",
    description: "Food price index > 95 for 3+ consecutive turns — mass starvation",
    icon: "Wheat",
    color: "hsl(35, 80%, 40%)",
    hardCheck: (s) => (s.defeatVictoryCounters?.famineTurns ?? 0) >= 3,
    riskFn: (s) => {
      const foodPriceIndex = s.agriculture?.indicators?.foodPriceIndex ?? 60;
      const baseRisk = Math.max(0, ((foodPriceIndex - 70) / 25) * 70);
      const turnsRisk = Math.min(30, ((s.defeatVictoryCounters?.famineTurns ?? 0) / 3) * 30);
      return Math.round(Math.min(100, baseRisk + turnsRisk));
    },
  },
  {
    id: "health-catastrophe",
    name: "Health Catastrophe",
    description: "Epidemic risk > 80 AND health worker density < 0.5",
    icon: "Biohazard",
    color: "hsl(120, 60%, 30%)",
    hardCheck: (s) => {
      const epidemicRisk = s.healthSector?.indicators?.epidemicRisk ?? 0;
      const healthWorkerDensity = s.healthSector?.indicators?.healthWorkerDensity ?? 1.5;
      return epidemicRisk > 80 && healthWorkerDensity < 0.5;
    },
    riskFn: (s) => {
      const epidemicRisk = s.healthSector?.indicators?.epidemicRisk ?? 0;
      const hwd = s.healthSector?.indicators?.healthWorkerDensity ?? 1.5;
      const epidemicComponent = Math.max(0, ((epidemicRisk - 50) / 30) * 60);
      const hwdComponent = Math.max(0, ((1.5 - hwd) / 1.0) * 40);
      return Math.round(Math.min(100, epidemicComponent + hwdComponent));
    },
  },
  {
    id: "total-blackout",
    name: "Total Blackout",
    description: "Power generation < 2.0 GW for 5+ consecutive turns — national grid collapse",
    icon: "ZapOff",
    color: "hsl(240, 50%, 35%)",
    hardCheck: (s) => (s.defeatVictoryCounters?.blackoutTurns ?? 0) >= 5,
    riskFn: (s) => {
      const powerGW = s.infrastructure?.indicators?.powerGenerationGW ?? 5;
      const baseRisk = Math.max(0, ((3 - powerGW) / 1.5) * 60);
      const turnsRisk = Math.min(40, ((s.defeatVictoryCounters?.blackoutTurns ?? 0) / 5) * 40);
      return Math.round(Math.min(100, baseRisk + turnsRisk));
    },
  },
  {
    id: "youth-uprising",
    name: "Youth Uprising",
    description: "Social unrest risk > 90 AND youth unemployment > 55%",
    icon: "Megaphone",
    color: "hsl(15, 75%, 45%)",
    hardCheck: (s) => {
      const unrestRisk = s.youthEmployment?.indicators?.socialUnrestRisk ?? 0;
      const unemployment = s.youthEmployment?.indicators?.youthUnemploymentRate ?? 0;
      return unrestRisk > 90 && unemployment > 55;
    },
    riskFn: (s) => {
      const unrestRisk = s.youthEmployment?.indicators?.socialUnrestRisk ?? 0;
      const unemployment = s.youthEmployment?.indicators?.youthUnemploymentRate ?? 0;
      const unrestComponent = Math.max(0, ((unrestRisk - 60) / 30) * 65);
      const unemploymentComponent = Math.max(0, ((unemployment - 40) / 15) * 35);
      return Math.round(Math.min(100, unrestComponent + unemploymentComponent));
    },
  },
  {
    id: "governance-crisis",
    name: "Governance Crisis",
    description: "3+ sectors in red crisis zone for 4+ consecutive turns",
    icon: "AlertTriangle",
    color: "hsl(0, 65%, 42%)",
    hardCheck: (s) => (s.defeatVictoryCounters?.governanceCrisisTurns ?? 0) >= 4,
    riskFn: (s) => {
      const sectors: Array<SectorView | undefined> = [
        s.infrastructure, s.healthSector, s.education, s.agriculture,
        s.interior, s.environment, s.youthEmployment,
      ];
      const redCount = sectors.filter(sec => sec?.crisisZone === "red").length;
      const redComponent = Math.max(0, ((redCount - 1) / 2) * 55);
      const turnsComponent = Math.min(45, ((s.defeatVictoryCounters?.governanceCrisisTurns ?? 0) / 4) * 45);
      return Math.round(Math.min(100, redComponent + turnsComponent));
    },
  },
  {
    id: "environmental-catastrophe",
    name: "Environmental Catastrophe",
    description: "Flood displacement risk > 90 AND climate adaptation score < 10",
    icon: "Waves",
    color: "hsl(200, 70%, 38%)",
    hardCheck: (s) => {
      const floodRisk = s.environment?.indicators?.floodDisplacementRisk ?? 0;
      const climateAdaptation = s.environment?.indicators?.climateAdaptationScore ?? 50;
      return floodRisk > 90 && climateAdaptation < 10;
    },
    riskFn: (s) => {
      const floodRisk = s.environment?.indicators?.floodDisplacementRisk ?? 0;
      const climateAdaptation = s.environment?.indicators?.climateAdaptationScore ?? 50;
      const floodComponent = Math.max(0, ((floodRisk - 60) / 30) * 65);
      const adaptationComponent = Math.max(0, ((20 - climateAdaptation) / 15) * 35);
      return Math.round(Math.min(100, floodComponent + adaptationComponent));
    },
  },
];

export function computeVictoryProgress(state: VictoryCheckState): Record<string, number> {
  const result: Record<string, number> = {};
  for (const path of victoryPaths) {
    result[path.id] = path.progressFn(state);
  }
  return result;
}

export function computeFailureRisks(state: VictoryCheckState): Record<string, number> {
  const result: Record<string, number> = {};
  for (const fs of failureStates) {
    result[fs.id] = fs.riskFn(state);
  }
  return result;
}

export function checkVictory(state: VictoryCheckState): VictoryPath | null {
  for (const path of victoryPaths) {
    if (path.progressFn(state) >= 100) return path;
  }
  return null;
}

export function checkDefeat(state: VictoryCheckState): FailureState | null {
  for (const fs of failureStates) {
    // Hard-check overrides risk score for sector-based instant defeats
    if (fs.hardCheck && fs.hardCheck(state)) return fs;
    if (fs.riskFn(state) >= 100) return fs;
  }
  return null;
}
