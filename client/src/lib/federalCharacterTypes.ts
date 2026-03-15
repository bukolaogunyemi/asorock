// client/src/lib/federalCharacterTypes.ts
export interface FederalAppointment {
  positionId: string;
  positionName: string;
  category: "constitutional-officer" | "cabinet" | "agency" | "ambassador";
  prestigeTier: "strategic" | "standard" | "routine";
  appointeeId: string | null;
  appointeeZone: string | null;
  godfatherLinked?: string;
}

export interface ZoneBalance {
  zone: string;
  weightedAppointments: number;
  expectedShare: number;
  actualShare: number;
  deviation: number;
  grievanceContribution: number;
}

export interface FederalCharacterState {
  appointments: FederalAppointment[];
  complianceScore: number;
  zoneScores: Record<string, ZoneBalance>;
  budgetAllocation: Record<string, number>;
}

export interface AppointmentCandidate {
  characterId: string;
  name: string;
  zone: string;
  state: string;
  competence: number;
  loyalty: number;
  gender: string;
  religion: string;
  godfatherId?: string;
  qualifiedFor: string[];
}
