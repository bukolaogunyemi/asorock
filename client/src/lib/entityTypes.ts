// entityTypes.ts
import type { Relationship } from "./gameTypes";

export type EntityType =
  | "state" | "ministry" | "agency" | "country"
  | "international-org" | "constitutional-office" | "faction";

export interface EntityProfile {
  id: string;
  name: string;
  type: EntityType;
  typeLabel: string;
  description: string;
  metadata: EntityMetadata[];
  keyPersonnel: EntityPerson[];
  actions: EntityAction[];
  stats?: EntityStat[];
}

export interface EntityMetadata {
  label: string;
  value: string;
}

export interface EntityPerson {
  characterKey: string;
  name: string;
  role: string;
  relationship?: Relationship;
}

export interface EntityAction {
  id: string;
  label: string;
  description: string;
  actionType: "navigate" | "appoint" | "deploy" | "diplomatic" | "political";
  enabled: boolean;
  disabledReason?: string;
}

export interface EntityStat {
  label: string;
  value: number;
  max: number;
  color?: string;
}

// Badge color mapping for UI
export const ENTITY_TYPE_COLORS: Record<EntityType, { bg: string; text: string }> = {
  state: { bg: "bg-green-900/50", text: "text-green-300" },
  ministry: { bg: "bg-blue-900/50", text: "text-blue-300" },
  agency: { bg: "bg-amber-900/50", text: "text-amber-300" },
  country: { bg: "bg-purple-900/50", text: "text-purple-300" },
  "international-org": { bg: "bg-purple-900/50", text: "text-purple-300" },
  "constitutional-office": { bg: "bg-red-900/50", text: "text-red-300" },
  faction: { bg: "bg-orange-900/50", text: "text-orange-300" },
};

// Helper to parse entity IDs like "state:lagos" -> { type: "state", slug: "lagos" }
export function parseEntityId(entityId: string): { type: string; slug: string } | null {
  const colonIndex = entityId.indexOf(":");
  if (colonIndex === -1) return null;
  return {
    type: entityId.substring(0, colonIndex),
    slug: entityId.substring(colonIndex + 1),
  };
}

// Helper to slugify entity names for ID construction
// e.g., "Northern Caucus" -> "northern-caucus", "United States" -> "united-states"
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[&]/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
