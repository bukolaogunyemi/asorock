// entityActions.ts
// Action builder functions that return EntityAction[] for each entity type.
// Each action has: id, label, description, actionType, enabled (computed from GameState), disabledReason.

import type { GameState } from "./gameTypes";
import type { EntityAction } from "./entityTypes";

export function getStateActions(stateName: string, gameState: GameState): EntityAction[] {
  return [
    {
      id: "visit-state",
      label: "Visit State",
      description: "Presidential visit boosts loyalty and approval",
      actionType: "navigate",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
    {
      id: "deploy-security",
      label: "Deploy Security",
      description: "Send federal security forces to the state",
      actionType: "deploy",
      enabled: gameState.politicalCapital >= 5,
      disabledReason: gameState.politicalCapital < 5 ? "Need 5 political capital" : undefined,
    },
    {
      id: "allocate-project",
      label: "Allocate Project",
      description: "Federal infrastructure project for the state",
      actionType: "navigate",
      enabled: gameState.politicalCapital >= 10,
      disabledReason: gameState.politicalCapital < 10 ? "Need 10 political capital" : undefined,
    },
    {
      id: "remove-governor",
      label: "Remove Governor",
      description: "Declare state of emergency and suspend governor",
      actionType: "political",
      enabled: false,
      disabledReason: "Requires governor approval below 20 and active security crisis",
    },
  ];
}

export function getMinistryActions(portfolio: string, gameState: GameState): EntityAction[] {
  return [
    {
      id: "replace-minister",
      label: "Replace Minister",
      description: "Open cabinet replacement flow",
      actionType: "appoint",
      enabled: true,
    },
    {
      id: "inspect-ministry",
      label: "Inspect Ministry",
      description: "Intelligence action to check for corruption",
      actionType: "navigate",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
    {
      id: "issue-directive",
      label: "Issue Directive",
      description: "Set policy priority for this ministry",
      actionType: "political",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
  ];
}

export function getAgencyActions(agencyId: string, gameState: GameState): EntityAction[] {
  return [
    {
      id: "appoint-head",
      label: "Appoint Head",
      description: "Open agency appointment flow",
      actionType: "appoint",
      enabled: true,
    },
    {
      id: "investigate-agency",
      label: "Investigate Agency",
      description: "EFCC/ICPC referral for audit",
      actionType: "navigate",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
    {
      id: "expand-mandate",
      label: "Expand Mandate",
      description: "Increase agency authority and reach",
      actionType: "political",
      enabled: gameState.politicalCapital >= 8,
      disabledReason: gameState.politicalCapital < 8 ? "Need 8 political capital" : undefined,
    },
  ];
}

export function getCountryActions(countryName: string, gameState: GameState): EntityAction[] {
  return [
    {
      id: "send-delegation",
      label: "Send Delegation",
      description: "Diplomatic visit to improve relations",
      actionType: "diplomatic",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
    {
      id: "appoint-ambassador",
      label: "Appoint Ambassador",
      description: "Open ambassador appointment flow",
      actionType: "appoint",
      enabled: true,
    },
    {
      id: "propose-trade-deal",
      label: "Propose Trade Deal",
      description: "Initiate trade negotiation",
      actionType: "diplomatic",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
    {
      id: "recall-ambassador",
      label: "Recall Ambassador",
      description: "Downgrade diplomatic relations",
      actionType: "diplomatic",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
  ];
}

export function getConstitutionalOfficeActions(positionName: string, gameState: GameState): EntityAction[] {
  return [
    {
      id: "meet-officer",
      label: "Meet with Officer",
      description: "Private audience to build relationship",
      actionType: "navigate",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
    {
      id: "apply-pressure",
      label: "Apply Pressure",
      description: "Push legislative/judicial agenda",
      actionType: "political",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
  ];
}

export function getFactionActions(factionName: string, gameState: GameState): EntityAction[] {
  return [
    {
      id: "appease-faction",
      label: "Appease Faction",
      description: "Address grievances to reduce tension",
      actionType: "political",
      enabled: gameState.politicalCapital >= 8,
      disabledReason: gameState.politicalCapital < 8 ? "Need 8 political capital" : undefined,
    },
    {
      id: "purge-faction",
      label: "Purge Faction",
      description: "Remove faction members from positions",
      actionType: "political",
      enabled: gameState.politicalCapital >= 15,
      disabledReason: gameState.politicalCapital < 15 ? "Need 15 political capital" : undefined,
    },
    {
      id: "negotiate-faction",
      label: "Negotiate",
      description: "Offer concessions for loyalty",
      actionType: "political",
      enabled: gameState.politicalCapital >= 5,
      disabledReason: gameState.politicalCapital < 5 ? "Need 5 political capital" : undefined,
    },
    {
      id: "empower-faction",
      label: "Empower Faction",
      description: "Increase their influence",
      actionType: "political",
      enabled: gameState.phase === "playing",
      disabledReason: gameState.phase !== "playing" ? "Not in active game" : undefined,
    },
  ];
}

// No actions for international orgs (ECOWAS)
export function getInternationalOrgActions(): EntityAction[] {
  return [];
}
