// client/src/lib/unionTypes.ts
// Type definitions for the union leader system

export type UnionPositionId =
  | "chairman-teachers-union"
  | "chairman-labour-union"
  | "chairman-trade-congress"
  | "chairman-youth-forum"
  | "chairman-petroleum-workers"
  | "chairman-medical-association";

export interface UnionPosition {
  id: UnionPositionId;
  title: string;
  influence: string[];
  strikeThreshold: number;
}

export interface UnionLeaderState {
  positions: UnionPosition[];
  appointments: Record<UnionPositionId, string | null>;
}
