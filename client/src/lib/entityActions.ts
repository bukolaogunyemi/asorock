// entityActions.ts — generates contextual actions for entity profile views

import type { EntityAction } from "./entityTypes";
import type { GameState } from "./gameTypes";

// ── State Actions ────────────────────────────────────────────────────────────

export function getStateActions(
  stateName: string,
  gameState: GameState
): EntityAction[] {
  const actions: EntityAction[] = [
    {
      id: `visit-${stateName}`,
      label: "Schedule State Visit",
      description: `Plan a presidential visit to ${stateName} State`,
      actionType: "navigate",
      enabled: true,
    },
    {
      id: `deploy-${stateName}`,
      label: "Deploy Federal Resources",
      description: `Allocate federal resources to ${stateName} State`,
      actionType: "deploy",
      enabled: true,
    },
  ];
  return actions;
}

// ── Ministry Actions ─────────────────────────────────────────────────────────

export function getMinistryActions(
  portfolio: string,
  gameState: GameState
): EntityAction[] {
  const hasMinister = !!gameState.cabinetAppointments[portfolio];
  return [
    {
      id: `appoint-${portfolio}`,
      label: hasMinister ? "Replace Minister" : "Appoint Minister",
      description: hasMinister
        ? `Replace the current Minister of ${portfolio}`
        : `Appoint a Minister of ${portfolio}`,
      actionType: "appoint",
      enabled: true,
    },
  ];
}

// ── Agency Actions ───────────────────────────────────────────────────────────

export function getAgencyActions(
  agencyId: string,
  gameState: GameState
): EntityAction[] {
  return [
    {
      id: `reform-${agencyId}`,
      label: "Reform Agency",
      description: "Initiate structural reforms for this agency",
      actionType: "political",
      enabled: true,
    },
  ];
}

// ── Country Actions ──────────────────────────────────────────────────────────

export function getCountryActions(
  countryName: string,
  gameState: GameState
): EntityAction[] {
  return [
    {
      id: `diplomatic-${countryName}`,
      label: "Diplomatic Engagement",
      description: `Initiate diplomatic engagement with ${countryName}`,
      actionType: "diplomatic",
      enabled: true,
    },
  ];
}

// ── Constitutional Office Actions ────────────────────────────────────────────

export function getConstitutionalOfficeActions(
  positionName: string,
  gameState: GameState
): EntityAction[] {
  return [
    {
      id: `engage-${positionName}`,
      label: "Engage Office Holder",
      description: `Schedule a meeting with the ${positionName}`,
      actionType: "political",
      enabled: true,
    },
  ];
}

// ── Faction Actions ──────────────────────────────────────────────────────────

export function getFactionActions(
  factionName: string,
  gameState: GameState
): EntityAction[] {
  return [
    {
      id: `negotiate-${factionName}`,
      label: "Negotiate",
      description: `Open negotiations with ${factionName}`,
      actionType: "political",
      enabled: true,
    },
  ];
}

// ── International Org Actions ────────────────────────────────────────────────

export function getInternationalOrgActions(): EntityAction[] {
  return [
    {
      id: "attend-summit",
      label: "Attend Summit",
      description: "Attend the next organizational summit",
      actionType: "diplomatic",
      enabled: true,
    },
  ];
}
