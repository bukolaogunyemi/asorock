// lgaGovernance.ts — Governance abstraction layer for 774 LGA chairpersons
// Computes aggregate governance quality without materialising CharacterState objects.

import { getChairpersonsForState } from "./lgaChairpersons";
import { getAllStates } from "./lgaData";

export interface StateGovernanceScore {
  state: string;
  quality: number;           // 0–100 — aggregate chairperson competence
  serviceDelivery: number;   // 0–100 — estimated service quality
  populationCoverage: number; // 0–100 — % of LGAs that are functionally adequate
}

export interface NationalGovernanceSummary {
  scores: StateGovernanceScore[];
  nationalAvgQuality: number;
  nationalAvgServiceDelivery: number;
  topPerformers: StateGovernanceScore[];   // top 5 states
  bottomPerformers: StateGovernanceScore[]; // bottom 5 states
}

/** Minimum competence threshold for an LGA to be considered "functionally adequate" */
const FUNCTIONAL_THRESHOLD = 40;

export function computeStateGovernance(state: string): StateGovernanceScore {
  const chairs = getChairpersonsForState(state);

  if (chairs.length === 0) {
    return { state, quality: 50, serviceDelivery: 50, populationCoverage: 100 };
  }

  const avgCompetence = chairs.reduce((sum, c) => sum + c.competence, 0) / chairs.length;
  const avgPopularity = chairs.reduce((sum, c) => sum + c.popularity, 0) / chairs.length;
  const functional = chairs.filter((c) => c.competence >= FUNCTIONAL_THRESHOLD).length;

  // Service delivery blends competence (70%) and popularity (30%)
  const serviceDelivery = Math.round(avgCompetence * 0.7 + avgPopularity * 0.3);
  const populationCoverage = Math.round((functional / chairs.length) * 100);

  return {
    state,
    quality: Math.round(avgCompetence),
    serviceDelivery: Math.min(100, Math.max(0, serviceDelivery)),
    populationCoverage: Math.min(100, Math.max(0, populationCoverage)),
  };
}

export function computeNationalGovernance(): NationalGovernanceSummary {
  const states = getAllStates();
  const scores: StateGovernanceScore[] = states.map(computeStateGovernance);

  const nationalAvgQuality = Math.round(
    scores.reduce((s, r) => s + r.quality, 0) / scores.length,
  );
  const nationalAvgServiceDelivery = Math.round(
    scores.reduce((s, r) => s + r.serviceDelivery, 0) / scores.length,
  );

  const sorted = [...scores].sort((a, b) => b.quality - a.quality);
  const topPerformers = sorted.slice(0, 5);
  const bottomPerformers = sorted.slice(-5).reverse();

  return {
    scores,
    nationalAvgQuality,
    nationalAvgServiceDelivery,
    topPerformers,
    bottomPerformers,
  };
}

/** Convenience — get governance for a single LGA by name */
export function getLGAGovernanceScore(
  state: string,
  lga: string,
): { competence: number; popularity: number; isFunctional: boolean } | null {
  const chairs = getChairpersonsForState(state);
  const chair = chairs.find((c) => c.lga === lga);
  if (!chair) return null;
  return {
    competence: chair.competence,
    popularity: chair.popularity,
    isFunctional: chair.competence >= FUNCTIONAL_THRESHOLD,
  };
}
