// Entity Adapters — merges static database data with dynamic GameState
// to produce normalised EntityProfile objects.

import { parseEntityId, slugify } from "./entityTypes";
import type { EntityProfile, EntityPerson, EntityMetadata, EntityStat } from "./entityTypes";
import {
  getStateActions,
  getMinistryActions,
  getAgencyActions,
  getCountryActions,
  getConstitutionalOfficeActions,
  getFactionActions,
  getInternationalOrgActions,
} from "./entityActions";
import { getStateData } from "./stateDatabase";
import { getCountryData, ECOWAS_DATA, COUNTRY_DATABASE } from "./countryDatabase";
import { getMinistryData } from "./ministryDatabase";
import { getAgencyData } from "./agencyDatabase";
import { getFactionData, FACTION_DATABASE } from "./factionDatabase";
import { getConstitutionalOfficeData, CONSTITUTIONAL_OFFICE_DATABASE } from "./constitutionalOfficeDatabase";
import { getZoneForState } from "./zones";
import { diplomacyRelations } from "./gameData";
import type { GameState } from "./gameTypes";

// ── Helpers ──────────────────────────────────────────────────────────────────

function meta(label: string, value: string): EntityMetadata {
  return { label, value };
}

function stat(label: string, value: number, max: number, color?: string): EntityStat {
  return { label, value, max, color };
}

// Map diplomacy relation strings to numeric values
const RELATION_VALUE: Record<string, number> = {
  Strong: 80,
  Neutral: 50,
  Strained: 30,
  Tense: 15,
};

// ── State Adapter ─────────────────────────────────────────────────────────────

export function adaptStateToProfile(
  stateName: string,
  gameState: GameState
): EntityProfile | null {
  const data = getStateData(stateName);
  if (!data) return null;

  // Resolve zone name for this state — stateDatabase stores the zone as a string already,
  // but we use getZoneForState to confirm and get the canonical zone name.
  const zone = getZoneForState(data.name);
  const zoneName = zone?.name ?? data.zone;

  // Find the governor whose zone matches this state's zone
  const governor = gameState.governors.find(
    (g) => g.zone === zoneName
  ) ?? null;

  const keyPersonnel: EntityPerson[] = [];
  if (governor) {
    keyPersonnel.push({
      characterKey: governor.name,
      name: governor.name,
      role: "Governor",
      relationship: governor.relationship,
    });
  }

  return {
    id: `state:${slugify(data.name)}`,
    name: `${data.name} State`,
    type: "state",
    typeLabel: "State",
    description: data.description,
    metadata: [
      meta("Capital", data.capital),
      meta("Year Created", String(data.yearCreated)),
      meta("Population", data.population),
      meta("LGA Count", String(data.lgaCount)),
      meta("Zone", zoneName),
      meta("Ethnic Groups", data.ethnicGroups.join(", ")),
      meta("Key Economies", data.keyEconomies.join(", ")),
    ],
    keyPersonnel,
    stats: governor
      ? [
          stat("Governor Loyalty", governor.loyalty, 100),
          stat("Governor Approval", governor.approval, 100),
          stat("Governor Competence", governor.competence, 100),
        ]
      : [],
    actions: getStateActions(data.name, gameState),
  };
}

// ── Ministry Adapter ──────────────────────────────────────────────────────────

export function adaptMinistryToProfile(
  portfolio: string,
  gameState: GameState
): EntityProfile | null {
  const data = getMinistryData(portfolio);
  if (!data) return null;

  const keyPersonnel: EntityPerson[] = [];

  // Find minister via cabinetAppointments then characters
  const ministerName = gameState.cabinetAppointments[data.portfolio] ?? null;
  if (ministerName) {
    const character = gameState.characters[ministerName] ?? null;
    if (character) {
      keyPersonnel.push({
        characterKey: ministerName,
        name: character.name,
        role: "Minister",
        relationship: character.relationship,
      });
    } else {
      // Character key exists in appointments but not in characters map — show name only
      keyPersonnel.push({
        characterKey: ministerName,
        name: ministerName,
        role: "Minister",
      });
    }
  }

  return {
    id: `ministry:${slugify(data.portfolio)}`,
    name: data.fullName,
    type: "ministry",
    typeLabel: "Federal Ministry",
    description: data.mandate,
    metadata: [
      meta("Established", String(data.established)),
      meta("Mandate", data.mandate),
      meta("Key Responsibilities", data.responsibilities.join("; ")),
    ],
    keyPersonnel,
    actions: getMinistryActions(data.portfolio, gameState),
  };
}

// ── Agency Adapter ────────────────────────────────────────────────────────────

export function adaptAgencyToProfile(
  agencyId: string,
  gameState: GameState
): EntityProfile | null {
  const data = getAgencyData(agencyId);
  if (!data) return null;

  const typeLabel =
    data.prestigeTier === "strategic" ? "Strategic Agency" : "Federal Agency";

  // Find the character whose portfolio matches this agency's acronym
  const matchingChar = Object.values(gameState.characters).find(
    (c) => c.portfolio.toUpperCase() === data.acronym.toUpperCase()
  ) ?? null;

  const keyPersonnel: EntityPerson[] = [];
  if (matchingChar) {
    keyPersonnel.push({
      characterKey: matchingChar.name,
      name: matchingChar.name,
      role: "Head",
      relationship: matchingChar.relationship,
    });
  }

  return {
    id: `agency:${data.id}`,
    name: `${data.fullName} (${data.acronym})`,
    type: "agency",
    typeLabel,
    description: data.mandate,
    metadata: [
      meta("Acronym", data.acronym),
      meta("Established", String(data.established)),
      ...(data.parentMinistry ? [meta("Parent Ministry", data.parentMinistry)] : []),
      meta("Prestige Tier", data.prestigeTier),
    ],
    keyPersonnel,
    actions: getAgencyActions(data.id, gameState),
  };
}

// ── Country Adapter ───────────────────────────────────────────────────────────

export function adaptCountryToProfile(
  countrySlug: string,
  gameState: GameState
): EntityProfile | null {
  // Try direct slug lookup first
  const data = COUNTRY_DATABASE[countrySlug] ?? getCountryData(countrySlug);
  if (!data) return null;

  // Find relation status from diplomacyRelations (matches by country name)
  const relation = diplomacyRelations.find(
    (r) => r.partner.toLowerCase() === data.name.toLowerCase()
  ) ?? null;

  const relValue = relation ? (RELATION_VALUE[relation.relation] ?? 50) : 50;

  return {
    id: `country:${countrySlug}`,
    name: data.name,
    type: "country",
    typeLabel: "Country",
    description: data.description,
    metadata: [
      meta("Capital", data.capital),
      meta("Population", data.population),
      meta("GDP", data.gdp),
      meta("Region", data.region),
      meta("Head of State", data.headOfState),
      meta("Key Exports", data.keyExports.join(", ")),
    ],
    keyPersonnel: [
      {
        characterKey: "ambassador-placeholder",
        name: "Not assigned",
        role: "Ambassador",
      },
    ],
    stats: [
      stat(
        "Relations",
        relValue,
        100,
        relValue >= 70 ? "green" : relValue >= 40 ? "yellow" : "red"
      ),
    ],
    actions: getCountryActions(data.name, gameState),
  };
}

// ── International Org Adapter ─────────────────────────────────────────────────

export function adaptInternationalOrgToProfile(
  orgSlug: string,
  gameState: GameState
): EntityProfile | null {
  // For now only ECOWAS is in the database
  if (orgSlug !== "ecowas") return null;

  const data = ECOWAS_DATA;

  return {
    id: `international-org:${orgSlug}`,
    name: data.name,
    type: "international-org",
    typeLabel: "International Organization",
    description: data.description,
    metadata: [
      meta("Headquarters", data.headquarters),
      meta("Secretary-General", data.secretaryGeneral),
      meta("Member States", data.memberStates.join(", ")),
    ],
    keyPersonnel: [],
    actions: getInternationalOrgActions(),
  };
}

// ── Constitutional Office Adapter ─────────────────────────────────────────────

export function adaptConstitutionalOfficeToProfile(
  positionSlug: string,
  gameState: GameState
): EntityProfile | null {
  const data = CONSTITUTIONAL_OFFICE_DATABASE[positionSlug] ?? getConstitutionalOfficeData(positionSlug);
  if (!data) return null;

  // Match against constitutionalOfficers array by position name.
  // ConstitutionalCandidate (extends Character) uses `portfolio` as the position field.
  // Some mock/runtime objects may use a `position` field instead.
  const resolvedOfficer =
    gameState.constitutionalOfficers.find((o) => {
      const asAny = o as Record<string, unknown>;
      const posField = (asAny["position"] as string | undefined)?.toLowerCase();
      const portfolioField = (asAny["portfolio"] as string | undefined)?.toLowerCase();
      const target = data.positionName.toLowerCase();
      return posField === target || portfolioField === target;
    }) ?? null;

  const keyPersonnel: EntityPerson[] = [];
  if (resolvedOfficer) {
    keyPersonnel.push({
      characterKey: resolvedOfficer.name,
      name: resolvedOfficer.name,
      role: data.positionName,
      relationship: resolvedOfficer.relationship,
    });
  }

  return {
    id: `constitutional-office:${positionSlug}`,
    name: data.fullTitle,
    type: "constitutional-office",
    typeLabel: "Constitutional Office",
    description: data.description,
    metadata: [
      ...(data.chamber ? [meta("Chamber", data.chamber)] : []),
      meta("Key Powers", data.keyPowers.join("; ")),
    ],
    keyPersonnel,
    actions: getConstitutionalOfficeActions(data.positionName, gameState),
  };
}

// ── Faction Adapter ───────────────────────────────────────────────────────────

export function adaptFactionToProfile(
  factionSlug: string,
  gameState: GameState
): EntityProfile | null {
  const data = FACTION_DATABASE[factionSlug] ?? getFactionData(factionSlug);
  if (!data) return null;

  // Find faction live state — gameState.factions keyed by faction name
  const factionState = gameState.factions[data.name] ?? null;

  // Collect faction members from characters
  const members = Object.values(gameState.characters).filter(
    (c) => c.faction === data.name
  );

  const keyPersonnel: EntityPerson[] = members.map((c) => ({
    characterKey: c.name,
    name: c.name,
    role: "Member",
    relationship: c.relationship,
  }));

  const stats: EntityStat[] = factionState
    ? [
        stat("Influence", factionState.influence, 100),
        stat("Loyalty", factionState.loyalty, 100),
        stat("Grievance", factionState.grievance, 100),
      ]
    : [];

  return {
    id: `faction:${factionSlug}`,
    name: data.name,
    type: "faction",
    typeLabel: "Political Faction",
    description: data.description,
    metadata: [
      meta("Primary Zone", data.primaryZone),
      meta("Ideology", data.ideology),
      meta("Key Interests", data.keyInterests.join("; ")),
      ...(factionState ? [meta("Stance", factionState.stance)] : []),
    ],
    keyPersonnel,
    stats,
    actions: getFactionActions(data.name, gameState),
  };
}

// ── Primary Router ────────────────────────────────────────────────────────────

export function resolveEntityProfile(
  entityId: string,
  gameState: GameState
): EntityProfile | null {
  const parsed = parseEntityId(entityId);
  if (!parsed) return null;

  switch (parsed.type) {
    case "state":
      return adaptStateToProfile(parsed.slug, gameState);
    case "ministry":
      return adaptMinistryToProfile(parsed.slug, gameState);
    case "agency":
      return adaptAgencyToProfile(parsed.slug, gameState);
    case "country":
      return adaptCountryToProfile(parsed.slug, gameState);
    case "international-org":
      return adaptInternationalOrgToProfile(parsed.slug, gameState);
    case "constitutional-office":
      return adaptConstitutionalOfficeToProfile(parsed.slug, gameState);
    case "faction":
      return adaptFactionToProfile(parsed.slug, gameState);
    default:
      return null;
  }
}
