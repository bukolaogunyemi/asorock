// Aso Rock - Victory Paths & Failure States

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
  riskFn: (state: VictoryCheckState) => number;
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
    if (fs.riskFn(state) >= 100) return fs;
  }
  return null;
}
