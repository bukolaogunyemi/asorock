import type {
  IntelOperationType,
  IntelOperation,
  IntelFinding,
  IntelResult,
  IntelligenceState,
} from "./intelligenceTypes";

const BASE_DURATIONS: Record<IntelOperationType, number> = {
  "investigate-person": 21,
  "monitor-godfather": 30,
  "counter-intel": 14,
  "opposition-research": 21,
  "media-intel": 10,
  "security-assessment": 10,
};

const PC_COSTS: Record<IntelOperationType, number> = {
  "investigate-person": 8,
  "monitor-godfather": 12,
  "counter-intel": 6,
  "opposition-research": 10,
  "media-intel": 4,
  "security-assessment": 4,
};

const FINDING_TYPES: Record<IntelOperationType, IntelFinding["type"][]> = {
  "investigate-person": ["hook", "connection", "loyalty-assessment"],
  "monitor-godfather": ["connection", "strategy-intel", "threat-warning"],
  "counter-intel": ["threat-warning", "hook"],
  "opposition-research": ["strategy-intel", "hook", "connection"],
  "media-intel": ["media-source", "strategy-intel"],
  "security-assessment": ["threat-warning", "loyalty-assessment"],
};

let opCounter = 0;

function generateOpId(): string {
  opCounter++;
  return `intel-op-${Date.now()}-${opCounter}`;
}

export function defaultIntelligenceState(): IntelligenceState {
  return {
    dniId: null,
    dniCompetence: 0,
    dniLoyalty: 0,
    activeOperations: [],
    completedOperations: [],
    maxConcurrentOps: 2,
  };
}

export function calculateSuccessProbability(competence: number): number {
  return Math.min(90, Math.max(50, 50 + competence * 0.4));
}

export function calculateDuration(baseDays: number, competence: number): number {
  return Math.round(baseDays * (1 - competence / 200));
}

export function commissionOperation(
  state: IntelligenceState,
  type: IntelOperationType,
  targetId: string | undefined,
  description: string,
  currentDay: number
): IntelligenceState {
  if (state.dniId === null) {
    return state;
  }

  if (state.activeOperations.length >= state.maxConcurrentOps) {
    return state;
  }

  const baseDuration = BASE_DURATIONS[type];
  const duration = calculateDuration(baseDuration, state.dniCompetence);
  const successProbability = calculateSuccessProbability(state.dniCompetence);

  const operation: IntelOperation = {
    id: generateOpId(),
    type,
    targetId,
    targetDescription: description,
    startDay: currentDay,
    estimatedEndDay: currentDay + duration,
    politicalCapitalCost: PC_COSTS[type],
    successProbability,
    status: "active",
  };

  return {
    ...state,
    activeOperations: [...state.activeOperations, operation],
  };
}

export function resolveOperation(
  operation: IntelOperation,
  competence: number
): IntelResult {
  const success = operation.successProbability >= 60;
  const exposed = !success && operation.successProbability < 55;

  const findings: IntelFinding[] = [];

  if (success) {
    const possibleTypes = FINDING_TYPES[operation.type];
    const findingCount = Math.min(possibleTypes.length, 1 + Math.floor(competence / 50));

    for (let i = 0; i < findingCount; i++) {
      findings.push({
        type: possibleTypes[i % possibleTypes.length],
        targetId: operation.targetId ?? operation.id,
        description: `${possibleTypes[i % possibleTypes.length]} finding from ${operation.type} on ${operation.targetDescription}`,
        evidence: Math.min(100, 40 + competence * 0.5),
        deployable: competence >= 50,
      });
    }
  }

  return {
    operationId: operation.id,
    type: operation.type,
    success,
    exposed,
    findings,
  };
}

export function processIntelligenceTurn(
  state: IntelligenceState,
  currentDay: number
): IntelligenceState {
  const stillActive: IntelOperation[] = [];
  const newResults: IntelResult[] = [];

  for (const op of state.activeOperations) {
    if (currentDay >= op.estimatedEndDay) {
      const result = resolveOperation(op, state.dniCompetence);
      newResults.push(result);
    } else {
      stillActive.push(op);
    }
  }

  return {
    ...state,
    activeOperations: stillActive,
    completedOperations: [...state.completedOperations, ...newResults],
  };
}
