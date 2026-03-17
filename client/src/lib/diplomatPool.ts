// client/src/lib/diplomatPool.ts
// Combined diplomat candidate pool — aggregates all batch files
// 200 HC bilateral + 50 HC institution + ~90 procedural minor = ~340 total candidates
// Re-exports posts and types for backward compatibility

import type { DiplomatCandidate } from "./diplomatTypes";
import { ALL_DIPLOMAT_POSTS, KEY_BILATERAL_POSTS, INSTITUTION_POSTS, MINOR_EMBASSY_POSTS, PLAYER_APPOINTED_POSTS, DIPLOMAT_TRAITS } from "./diplomatPosts";
import { DIPLOMAT_CANDIDATES_BATCH1 } from "./diplomatPoolBatch1";
import { DIPLOMAT_CANDIDATES_BATCH2 } from "./diplomatPoolBatch2";
import { DIPLOMAT_CANDIDATES_BATCH3 } from "./diplomatPoolBatch3";
import { DIPLOMAT_CANDIDATES_BATCH4 } from "./diplomatPoolBatch4";
import { DIPLOMAT_INSTITUTION_CANDIDATES } from "./diplomatInstitutionPool";
import { getMinorEmbassyCandidates } from "./diplomatMinorPool";

// ── Hand-crafted candidates (200 bilateral + 50 institution) ──
export const HC_DIPLOMAT_CANDIDATES: DiplomatCandidate[] = [
  ...DIPLOMAT_CANDIDATES_BATCH1,
  ...DIPLOMAT_CANDIDATES_BATCH2,
  ...DIPLOMAT_CANDIDATES_BATCH3,
  ...DIPLOMAT_CANDIDATES_BATCH4,
  ...DIPLOMAT_INSTITUTION_CANDIDATES,
];

/**
 * All diplomat candidates (HC + procedural minor).
 * Minor candidates are lazily generated on first access.
 */
export function getAllDiplomatCandidates(): DiplomatCandidate[] {
  return [...HC_DIPLOMAT_CANDIDATES, ...getMinorEmbassyCandidates()];
}

// Legacy export for backward compat with existing engine references
export const DIPLOMAT_CANDIDATES = HC_DIPLOMAT_CANDIDATES;

// ── Re-exports ──
export { ALL_DIPLOMAT_POSTS as AMBASSADOR_POSTS } from "./diplomatPosts";
export { KEY_BILATERAL_POSTS, INSTITUTION_POSTS, MINOR_EMBASSY_POSTS, PLAYER_APPOINTED_POSTS, DIPLOMAT_TRAITS } from "./diplomatPosts";
export type { DiplomatCandidate } from "./diplomatTypes";
