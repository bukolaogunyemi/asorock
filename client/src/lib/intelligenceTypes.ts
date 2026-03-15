// client/src/lib/intelligenceTypes.ts
export type IntelOperationType =
  | "investigate-person"
  | "monitor-godfather"
  | "counter-intel"
  | "opposition-research"
  | "media-intel"
  | "security-assessment";

export interface IntelOperation {
  id: string;
  type: IntelOperationType;
  targetId?: string;
  targetDescription: string;
  startDay: number;
  estimatedEndDay: number;
  politicalCapitalCost: number;
  successProbability: number;
  status: "active" | "completed" | "failed" | "exposed";
}

export interface IntelFinding {
  type: "hook" | "connection" | "loyalty-assessment" | "threat-warning" | "strategy-intel" | "media-source";
  targetId: string;
  description: string;
  evidence: number;
  deployable: boolean;
}

export interface IntelResult {
  operationId: string;
  type: IntelOperationType;
  success: boolean;
  exposed: boolean;
  findings: IntelFinding[];
}

export interface IntelligenceState {
  dniId: string | null;
  dniCompetence: number;
  dniLoyalty: number;
  activeOperations: IntelOperation[];
  completedOperations: IntelResult[];
  maxConcurrentOps: number;
}
