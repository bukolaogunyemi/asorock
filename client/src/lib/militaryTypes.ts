// client/src/lib/militaryTypes.ts

import type { CharacterCompetencies } from "./competencyTypes";

// ── Position ID union ────────────────────────────────────
export type MilitaryPositionId =
  | "chief-defence-force"
  | "chief-army-force"
  | "chief-police-force"
  | "chief-community-police"
  | "chief-naval-force"
  | "chief-air-force";

// ── Core interfaces ──────────────────────────────────────
export interface MilitaryPosition {
  id: MilitaryPositionId;
  title: string;
  description: string;
  securityWeight: number;   // 0.0–1.0 — how much this affects security sector
  stabilityWeight: number;  // 0.0–0.5 — how much this affects political stability
  coupRiskWeight: number;   // 0.0–0.8 — how much this affects coup risk
}

export interface MilitaryAppointment {
  positionId: MilitaryPositionId;
  characterName: string | null;
  appointedDay: number;
}

export interface MilitaryCandidate {
  name: string;
  state: string;
  zone: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  rank: string;
  traits: string[];
  bio: string;
  education: string;
  competence: number;       // 55–92
  loyalty: number;          // 30–95 — loyalty to civilian authority
  qualifiedFor: MilitaryPositionId[];
  competencies: {
    professional: CharacterCompetencies["professional"];
    personal: CharacterCompetencies["personal"];
  };
  honorific?: string;
  traditionalTitle?: string;
  professionalBackground?: string;
  previousOffices?: string[];
  healthStatus?: "healthy" | "declining" | "critical";
  foreignConnections?: string[];
  avatarId?: string;
}

export interface MilitarySystemState {
  positions: MilitaryPosition[];
  appointments: MilitaryAppointment[];
  coupRisk: number;              // 0–100, computed from appointments
  securityEffectiveness: number; // 0–100
}

// ── Position definitions ─────────────────────────────────
export const MILITARY_POSITIONS: MilitaryPosition[] = [
  {
    id: "chief-defence-force",
    title: "Chief of Defence Staff",
    description:
      "Supreme military coordinator overseeing all armed forces branches. Reports directly to the Commander-in-Chief. Controls joint operations, inter-service cooperation, and strategic military planning.",
    securityWeight: 1.0,
    stabilityWeight: 0.5,
    coupRiskWeight: 0.8,
  },
  {
    id: "chief-army-force",
    title: "Chief of Army Staff",
    description:
      "Commands the Nigerian Army — the largest branch of the armed forces. Responsible for ground operations, counter-insurgency, and internal security deployments.",
    securityWeight: 0.9,
    stabilityWeight: 0.4,
    coupRiskWeight: 0.7,
  },
  {
    id: "chief-police-force",
    title: "Inspector General of Police",
    description:
      "Heads the Nigeria Police Force. Responsible for law enforcement, public order, and crime prevention across all 36 states and the FCT.",
    securityWeight: 0.8,
    stabilityWeight: 0.3,
    coupRiskWeight: 0.3,
  },
  {
    id: "chief-community-police",
    title: "Commandant General, Community Police Corps",
    description:
      "Leads community-oriented policing initiatives, neighbourhood watch coordination, and grassroots security intelligence. A newer institution designed to bridge the gap between citizens and security agencies.",
    securityWeight: 0.5,
    stabilityWeight: 0.2,
    coupRiskWeight: 0.1,
  },
  {
    id: "chief-naval-force",
    title: "Chief of Naval Staff",
    description:
      "Commands the Nigerian Navy. Responsible for maritime security, anti-piracy operations in the Gulf of Guinea, and protection of offshore oil infrastructure.",
    securityWeight: 0.6,
    stabilityWeight: 0.1,
    coupRiskWeight: 0.3,
  },
  {
    id: "chief-air-force",
    title: "Chief of Air Staff",
    description:
      "Commands the Nigerian Air Force. Responsible for air superiority, close air support for ground operations, surveillance, and strategic airlift capability.",
    securityWeight: 0.7,
    stabilityWeight: 0.2,
    coupRiskWeight: 0.5,
  },
];

// ── Military trait pool ──────────────────────────────────
export const MILITARY_TRAITS = [
  // Leadership / command
  "Strategist",
  "Tactician",
  "Disciplinarian",
  "Commanding Presence",
  "Battle-Hardened",
  "Iron Will",
  "Charismatic Leader",
  "Mentor",
  // Operational
  "Counter-Insurgency Expert",
  "Peacekeeping Veteran",
  "Intelligence Specialist",
  "Logistics Master",
  "Joint Operations Expert",
  "Maritime Specialist",
  "Air Combat Veteran",
  "Special Forces Background",
  // Political / institutional
  "Loyal to Civilian Rule",
  "Political Operator",
  "Reform-Minded",
  "Old Guard",
  "Anti-Corruption Crusader",
  "Institution Builder",
  "Diplomatic Soldier",
  "Media Savvy",
  // Character
  "Incorruptible",
  "Ambitious",
  "Cautious",
  "Aggressive",
  "Pragmatist",
  "Risk-Taker",
  "Stoic",
  "Ruthless",
  "Devout",
  "Networker",
  "Secretive",
  "Populist Officer",
] as const;

export type MilitaryTrait = (typeof MILITARY_TRAITS)[number];
