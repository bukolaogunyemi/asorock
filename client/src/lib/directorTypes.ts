// client/src/lib/directorTypes.ts
// Type definitions for the director (agency head) system

import type { ProfessionalCompetencies } from "./competencyTypes";

// MinistryKey matches CABINET_CLUSTERS portfolio names from cabinetSystem.ts
export type MinistryKey =
  | "Finance" | "Health" | "Education" | "Agriculture & Rural Development"
  | "Works & Housing" | "Petroleum" | "Power" | "Labour & Employment"
  | "Interior" | "Trade & Investment" | "Communications & Digital Economy"
  | "Environment" | "Justice" | "Transport"
  | "Youth Development" | "Foreign Affairs" | "Defence";

export type DirectorPositionId = string;

export type PrestigeTier = "strategic" | "standard" | "routine";

export interface DirectorPosition {
  id: DirectorPositionId;
  title: string;
  ministry: MinistryKey;
  prestigeTier: PrestigeTier;
  sectorInfluence: string[];
  weight: number;
  primaryCompetency: keyof ProfessionalCompetencies;
}

export interface DirectorAppointment {
  positionId: DirectorPositionId;
  characterName: string | null;
  appointedDay: number;
  isOriginal: boolean;
  pendingDeparture?: {
    type: "resignation" | "retirement";
    departureDay: number;
    notifiedDay: number;
  };
}

export interface DirectorSystemState {
  positions: DirectorPosition[];
  appointments: DirectorAppointment[];
  technocratsFired: number;
  vacancyTracking: Record<DirectorPositionId, number>;
}
