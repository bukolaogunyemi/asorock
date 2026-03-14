import type { MacroKey, PolicyLeverKey, ChoiceRequirement } from "./gameTypes";

// ── Temperament ─────────────────────────────────────────
export type FactionTemperament = "patient" | "volatile" | "pragmatic" | "calculating" | "ideological";

// ── Demand Choice IDs ───────────────────────────────────
export type DemandChoiceId = "concede" | "partial" | "deflect" | "refuse";

// ── Policy Preference ───────────────────────────────────
export interface PolicyPreference {
  leverKey: PolicyLeverKey | string;
  favored: string[];
  opposed: string[];
  weight: number; // 0.5–2.0
}

// ── Macro Sensitivity ───────────────────────────────────
export interface MacroSensitivity {
  key: MacroKey;
  ideal: number;
  weight: number;
}

// ── Demand Choice Archetype ─────────────────────────────
export interface DemandChoiceArchetype {
  id: DemandChoiceId;
  label: string;
  context: string;
  loyaltyDelta: number;
  grievanceDelta: number;
  pcDelta: number;
  approvalDelta?: number;
  stabilityDelta?: number;
  triggerChainEvent?: boolean;
  requirements?: ChoiceRequirement[];
}

// ── Demand Template ─────────────────────────────────────
export interface DemandTemplate {
  grievanceLevel: 20 | 40 | 70 | 90 | 100;
  title: string;
  description: string;
  deadlineDays: number;
  choiceArchetypes: DemandChoiceArchetype[];
}

// ── Faction Profile ─────────────────────────────────────
export interface FactionProfile {
  key: string;
  policyPreferences: PolicyPreference[];
  macroSensitivities: MacroSensitivity[];
  demandTemplates: DemandTemplate[];
  temperament: FactionTemperament;
  loyaltyInertia: number; // 0.3–1.0
}

// ── Constants ───────────────────────────────────────────
export const GRIEVANCE_THRESHOLDS = [20, 40, 70, 90, 100] as const;
export const GRIEVANCE_DECAY_RATE = 0.3;
export const GRIEVANCE_VOLATILE_DECAY_MULTIPLIER = 2.0;
export const POLICY_FAVOR_BONUS = 0.4;
export const POLICY_OPPOSE_PENALTY = 0.6;
export const MACRO_SENSITIVITY_SCALE = 0.02;
export const AMBIENT_APPROVAL_WEIGHT = 0.01;
export const AMBIENT_STABILITY_WEIGHT = 0.01;
export const THRESHOLD_REARM_BUFFER = 10;
export const DEMAND_CONCEDE_GRIEVANCE_REDUCTION = 20;
export const DEMAND_PARTIAL_GRIEVANCE_REDUCTION = 12;
export const DEMAND_DEFLECT_GRIEVANCE_REDUCTION = 5;
export const DEMAND_EXPIRE_TIER70_LOYALTY_LOSS = 10;
export const DEMAND_EXPIRE_TIER90_LOYALTY_LOSS = 18;
export const DEMAND_EXPIRE_GRIEVANCE_GAIN = 8;
export const DEMAND_EXPIRE_STABILITY_LOSS = 3;

// ── Temperament Modifiers ───────────────────────────────
export interface TemperamentModifiers {
  driftMultiplier: number;
  grievanceRate: number;
  decayMultiplier: number;
  layer1Multiplier: number;
  layer23Multiplier: number;
}

export const TEMPERAMENT_MODIFIERS: Record<FactionTemperament, TemperamentModifiers> = {
  patient:     { driftMultiplier: 0.5, grievanceRate: 1.2, decayMultiplier: 1.0, layer1Multiplier: 1.0, layer23Multiplier: 1.0 },
  volatile:    { driftMultiplier: 1.6, grievanceRate: 1.0, decayMultiplier: 2.0, layer1Multiplier: 1.0, layer23Multiplier: 1.0 },
  pragmatic:   { driftMultiplier: 1.0, grievanceRate: 1.0, decayMultiplier: 1.0, layer1Multiplier: 1.0, layer23Multiplier: 1.0 },
  calculating: { driftMultiplier: 0.3, grievanceRate: 1.5, decayMultiplier: 1.0, layer1Multiplier: 1.0, layer23Multiplier: 1.0 },
  ideological: { driftMultiplier: 1.0, grievanceRate: 1.8, decayMultiplier: 1.0, layer1Multiplier: 2.0, layer23Multiplier: 0.5 },
};

// ── Faction Profiles ────────────────────────────────────
export const FACTION_PROFILES: FactionProfile[] = [
  // ═══════════════════════════════════════════════════════
  // NORTHERN CAUCUS
  // ═══════════════════════════════════════════════════════
  {
    key: "Northern Caucus",
    temperament: "patient",
    loyaltyInertia: 0.8,
    policyPreferences: [
      { leverKey: "fuelSubsidy", favored: ["full", "partial"], opposed: ["removed"], weight: 1.8 },
      { leverKey: "cashTransfers", favored: ["moderate", "generous"], opposed: ["none"], weight: 1.5 },
      { leverKey: "publicSectorHiring", favored: ["normal", "expansion"], opposed: ["freeze"], weight: 1.2 },
      { leverKey: "minimumWage", favored: ["modest", "union-demand"], opposed: ["frozen"], weight: 1.0 },
      { leverKey: "importTariffs", favored: ["protective", "restrictive"], opposed: ["open"], weight: 0.8 },
    ],
    macroSensitivities: [
      { key: "inflation", ideal: 15, weight: 1.5 },
      { key: "subsidyPressure", ideal: 30, weight: 1.2 },
      { key: "fxRate", ideal: 800, weight: 0.8 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "Whispers from the Northern Delegation",
        description: "Northern legislators are quietly expressing displeasure with the direction of economic policy. Emissaries hint that the caucus expected more consideration for their constituencies.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "Northern Caucus — Growing Unease",
        description: "The Northern Caucus has sent a formal letter expressing concern over policies they view as neglecting the northern states. Backbench senators are beginning to grumble openly.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Reassure the Caucus",
            context: "Meet with Northern Caucus leaders and promise policy adjustments favorable to their base. Offer expanded subsidy protections and federal appointments.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -2,
          },
          {
            id: "deflect",
            label: "Acknowledge Concerns",
            context: "Issue a public statement acknowledging the North's concerns while deferring specific commitments. Buy time without making promises.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Hold the Line",
            context: "Privately inform caucus leaders that policy will be set on national merit, not regional pressure. Signal that loyalty is expected.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            stabilityDelta: -2,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "Northern Caucus Demands Audience",
        description: "The Northern Caucus has formally requested a presidential audience. Their delegation includes powerful governors and traditional rulers. Failure to address their grievances could fracture the ruling coalition.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Grand Concession",
            context: "Host a lavish presidential reception for the Northern delegation. Announce a northern development package including subsidies, infrastructure spending, and federal appointments.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            approvalDelta: -3,
            stabilityDelta: 3,
          },
          {
            id: "partial",
            label: "Selective Accommodation",
            context: "Meet privately with key caucus leaders. Offer targeted concessions on subsidies while maintaining the broader reform agenda. Appoint a northern figure to a visible role.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -1,
          },
          {
            id: "deflect",
            label: "Form a Committee",
            context: "Announce a presidential committee on northern development with a 90-day mandate. The optics look responsive, but the caucus knows this delays real action.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
          },
          {
            id: "refuse",
            label: "Reject the Ultimatum",
            context: "Publicly state that governance cannot be held hostage to regional demands. Frame the refusal as principled leadership, but risk alienating a powerful bloc.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            stabilityDelta: -5,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "Northern Caucus — Crisis Point",
        description: "The Northern Caucus is on the verge of open revolt. Key governors are threatening to withhold support for the budget, and senators are blocking legislation. The caucus leadership demands immediate, substantial concessions or they will formally break with the presidency.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Emergency Appeasement",
            context: "Summon an emergency cabinet session. Reverse key policies the North opposes, announce a massive northern infrastructure program, and reshuffle cabinet to give the North more representation.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -14,
            approvalDelta: -5,
            stabilityDelta: 5,
            requirements: [{ metric: "politicalCapital", min: 14, description: "Requires significant political capital reserves" }],
          },
          {
            id: "partial",
            label: "Negotiate Under Pressure",
            context: "Open direct negotiations with caucus power brokers. Offer a package that addresses their most urgent demands while preserving some reform priorities.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            approvalDelta: -2,
            stabilityDelta: 2,
          },
          {
            id: "refuse",
            label: "Call Their Bluff",
            context: "Publicly challenge the caucus to follow through on their threats. Bet that individual members will not risk their positions for collective action. A dangerous gamble.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            stabilityDelta: -8,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "Northern Caucus — Mass Defection",
        description: "The Northern Caucus has formally withdrawn support for the presidency. Northern governors are coordinating opposition, senators have crossed the aisle, and traditional rulers are calling for the president to resign. This is an existential threat to the administration.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Total Capitulation",
            context: "Agree to virtually all Northern demands. Reverse economic reforms, expand federal patronage, and publicly acknowledge the caucus's grievances. The presidency survives but at enormous cost.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: -8,
            stabilityDelta: 5,
          },
          {
            id: "deflect",
            label: "National Unity Appeal",
            context: "Address the nation on live television, calling for unity and framing the crisis as a test of democracy. Appeal directly to northern citizens over the heads of their leaders.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            approvalDelta: 3,
            stabilityDelta: -3,
          },
          {
            id: "refuse",
            label: "Declare Emergency Measures",
            context: "Invoke executive powers to govern without caucus support. Bypass the legislature through emergency decrees. A constitutional crisis looms, but the alternative is paralysis.",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SOUTH-WEST ALLIANCE
  // ═══════════════════════════════════════════════════════
  {
    key: "South-West Alliance",
    temperament: "pragmatic",
    loyaltyInertia: 0.6,
    policyPreferences: [
      { leverKey: "electricityTariff", favored: ["cost-reflective", "tiered"], opposed: ["subsidised"], weight: 1.5 },
      { leverKey: "fxPolicy", favored: ["managed-float", "free-float"], opposed: ["peg"], weight: 1.3 },
      { leverKey: "taxRate", favored: ["standard", "elevated"], opposed: ["low"], weight: 1.0 },
      { leverKey: "importTariffs", favored: ["moderate"], opposed: ["restrictive"], weight: 0.8 },
      { leverKey: "publicSectorHiring", favored: ["essential-only", "normal"], opposed: ["expansion"], weight: 0.7 },
    ],
    macroSensitivities: [
      { key: "fxRate", ideal: 750, weight: 1.8 },
      { key: "inflation", ideal: 12, weight: 1.3 },
      { key: "reserves", ideal: 40, weight: 1.0 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "South-West Alliance — Quiet Discontent",
        description: "Business leaders in Lagos and Ibadan are voicing frustration through back channels. The Alliance's representatives note that investor confidence is eroding under current policies.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "South-West Alliance — Business Community Restless",
        description: "The Manufacturers Association of Nigeria has issued a communique criticizing economic policy. South-West Alliance members are amplifying business complaints and questioning the administration's competence.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Pro-Business Reset",
            context: "Announce a comprehensive business-friendly policy package: FX liberalization, tariff rationalization, and electricity reform. The Alliance sees real movement toward their priorities.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: 2,
          },
          {
            id: "deflect",
            label: "Engage in Dialogue",
            context: "Invite Alliance business leaders to a presidential economic roundtable. Listen attentively and promise to study their proposals without making firm commitments.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Dismiss Market Panic",
            context: "Publicly state that economic policy serves all Nigerians, not just Lagos elites. Accuse the business community of self-serving hysteria.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            approvalDelta: 1,
            stabilityDelta: -2,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "South-West Alliance Demands Policy Shift",
        description: "The South-West Alliance has presented a formal policy memorandum demanding market-oriented reforms. Influential media owners aligned with the Alliance are running critical editorials. The business community threatens capital flight.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Embrace Market Reforms",
            context: "Announce a sweeping reform agenda aligned with Alliance priorities. Float the naira, rationalize tariffs, and move to cost-reflective electricity pricing. Markets rally but northern factions seethe.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            approvalDelta: 3,
            stabilityDelta: -2,
          },
          {
            id: "partial",
            label: "Phased Reform Package",
            context: "Offer a staged reform timeline that addresses the Alliance's key concerns—FX flexibility and electricity pricing—while maintaining social protection measures. A middle path that satisfies neither fully.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: 1,
          },
          {
            id: "deflect",
            label: "Cite Global Headwinds",
            context: "Blame external factors—oil prices, global recession, supply chains—for economic woes. Promise reforms 'when conditions allow' while subtly questioning the Alliance's patriotism.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
          },
          {
            id: "refuse",
            label: "Populist Pushback",
            context: "Publicly reject the Alliance's memorandum as an attempt by wealthy elites to dictate policy. Frame the administration as standing with ordinary Nigerians against oligarchic interests.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            approvalDelta: 2,
            stabilityDelta: -5,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "South-West Alliance — Public Opposition",
        description: "The South-West Alliance has gone public with their opposition. Major newspapers are running front-page criticism, Lagos business chambers have called for a vote of no confidence, and Alliance governors are withholding cooperation on federal programs.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Full Policy Reversal",
            context: "In a nationally televised address, announce the adoption of the Alliance's core reform demands. Replace the Finance Minister with an Alliance-backed technocrat. Markets surge but political capital bleeds.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -14,
            approvalDelta: 4,
            stabilityDelta: 3,
            requirements: [{ metric: "politicalCapital", min: 14, description: "Requires substantial political capital to execute" }],
          },
          {
            id: "partial",
            label: "Targeted Concessions",
            context: "Offer the Alliance their top two demands—FX reform and electricity deregulation—while holding firm on tariffs and fiscal policy. A pragmatic deal that splits the difference.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            approvalDelta: 2,
            stabilityDelta: 1,
          },
          {
            id: "refuse",
            label: "Power Play",
            context: "Use federal leverage to pressure Alliance governors. Threaten to redirect infrastructure spending and federal appointments away from the South-West. Escalation risks a deeper rift.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            stabilityDelta: -8,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "South-West Alliance — Opposition Pact",
        description: "The South-West Alliance has signed a formal pact with opposition parties. Lagos-based media conglomerates are running a coordinated campaign against the presidency. International investors are downgrading Nigeria. The economic and political establishment of the South-West has turned hostile.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Surrender to the Markets",
            context: "Agree to the Alliance's complete reform agenda and invite their chosen technocrats into cabinet. The administration survives but has effectively ceded economic policy to the South-West bloc.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: 5,
            stabilityDelta: 3,
          },
          {
            id: "deflect",
            label: "International Mediation",
            context: "Invite the IMF and World Bank to mediate economic policy discussions, framing the crisis as a national economic emergency rather than a political dispute. A novel gambit that may cool tempers.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            approvalDelta: -2,
            stabilityDelta: -3,
          },
          {
            id: "refuse",
            label: "Economic Nationalism",
            context: "Denounce the Alliance's pact with opposition as treasonous during an economic emergency. Impose capital controls and threaten regulatory action against hostile media. A dangerous authoritarian turn.",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SOUTH-EAST BLOC
  // ═══════════════════════════════════════════════════════
  {
    key: "South-East Bloc",
    temperament: "ideological",
    loyaltyInertia: 0.7,
    policyPreferences: [
      { leverKey: "cashTransfers", favored: ["moderate", "generous"], opposed: ["none", "minimal"], weight: 1.8 },
      { leverKey: "importTariffs", favored: ["moderate", "open"], opposed: ["restrictive"], weight: 1.4 },
      { leverKey: "fxPolicy", favored: ["free-float"], opposed: ["peg"], weight: 1.2 },
      { leverKey: "taxRate", favored: ["low", "standard"], opposed: ["high"], weight: 1.0 },
      { leverKey: "electricityTariff", favored: ["tiered"], opposed: ["market-rate"], weight: 0.8 },
    ],
    macroSensitivities: [
      { key: "fxRate", ideal: 700, weight: 0.5 },
      { key: "inflation", ideal: 10, weight: 0.3 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "South-East Bloc — Murmurs of Marginalization",
        description: "Igbo business associations are privately noting that federal investment continues to bypass the South-East. Community leaders express a familiar frustration through quiet diplomatic channels.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "South-East Bloc — Equity Complaints Surface",
        description: "The South-East Bloc has formally petitioned the presidency over the lopsided distribution of federal projects and appointments. Newspapers in Enugu and Owerri are running editorials about structural marginalization.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Address the Equity Gap",
            context: "Announce a special South-East development fund and appoint Igbo technocrats to visible federal positions. Publicly acknowledge historical imbalances in federal attention.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -1,
          },
          {
            id: "deflect",
            label: "Promise a Review",
            context: "Commission an audit of federal project distribution with a pledge to address any imbalances found. The gesture buys time without committing resources.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Reject Ethnic Framing",
            context: "Publicly reject the petition as divisive ethnic politics. Insist that federal resources are allocated on merit, not geography. The Bloc feels dismissed yet again.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            stabilityDelta: -2,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "South-East Bloc — Regional Autonomy Push",
        description: "The South-East Bloc is demanding constitutional reform to grant greater regional autonomy. Governors from the zone have issued a joint communique, and prominent Igbo organizations are staging solidarity rallies. The rhetoric is escalating.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Constitutional Dialogue",
            context: "Announce a national constitutional review conference with genuine South-East representation. Commit to restructuring discussions and immediate federal investments in the zone.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            approvalDelta: -2,
            stabilityDelta: 3,
          },
          {
            id: "partial",
            label: "Development Without Devolution",
            context: "Offer a substantial infrastructure and investment package for the South-East while deferring constitutional reform to a future agenda. Address the economic grievance without the political one.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -1,
          },
          {
            id: "deflect",
            label: "National Dialogue Forum",
            context: "Propose a broad national dialogue on restructuring that includes all zones, diluting the South-East's specific demands into a wider conversation. Slow-walking disguised as inclusion.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
          },
          {
            id: "refuse",
            label: "Defend National Unity",
            context: "Publicly warn against secessionist rhetoric and frame the autonomy push as a threat to Nigeria's territorial integrity. Deploy security assets to the region as a show of federal resolve.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            stabilityDelta: -5,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "South-East Bloc — Secession Rhetoric Intensifies",
        description: "Prominent South-East leaders are openly discussing secession. Mass rallies are drawing hundreds of thousands, and international media is covering the crisis. The Bloc's demands have escalated from reform to existential questions about Nigeria's federal structure.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Historic Restructuring Accord",
            context: "In a dramatic televised address, announce a comprehensive restructuring package: fiscal federalism, state police, resource control. The most significant constitutional shift since 1999.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -16,
            approvalDelta: -3,
            stabilityDelta: 5,
            requirements: [{ metric: "politicalCapital", min: 16, description: "Requires enormous political capital for constitutional reform" }],
          },
          {
            id: "partial",
            label: "Emergency Investment Surge",
            context: "Announce a massive federal investment program for the South-East: new rail links, industrial zones, and university expansions. Address economic marginalization while avoiding constitutional questions.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            approvalDelta: -1,
            stabilityDelta: 2,
          },
          {
            id: "refuse",
            label: "Federal Authority",
            context: "Invoke national security powers. Ban separatist organizations, arrest agitators, and deploy military forces. The international community condemns the crackdown, but the federal center holds—for now.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            stabilityDelta: -10,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "South-East Bloc — Breaking Point",
        description: "The South-East has reached a breaking point. State assemblies are passing sovereignty resolutions, diaspora communities are lobbying foreign governments, and civil disobedience has paralyzed commerce in the zone. Nigeria faces its gravest unity crisis in decades.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Sovereign National Conference",
            context: "Convene a sovereign national conference to renegotiate Nigeria's federal compact. A historic gamble that could either heal the nation or accelerate its dissolution.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: -5,
            stabilityDelta: -5,
          },
          {
            id: "deflect",
            label: "International Mediation",
            context: "Invite the African Union and ECOWAS to mediate the crisis. Frame Nigeria as committed to peaceful resolution while internationalizing what was a domestic dispute.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            approvalDelta: -3,
            stabilityDelta: -3,
          },
          {
            id: "refuse",
            label: "Martial Law in the South-East",
            context: "Declare a state of emergency in the South-East. Suspend civil liberties, impose curfews, and deploy the military in force. The federation survives by coercion, but at what cost?",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PRESIDENTIAL GUARD
  // ═══════════════════════════════════════════════════════
  {
    key: "Presidential Guard",
    temperament: "calculating",
    loyaltyInertia: 0.9,
    policyPreferences: [
      { leverKey: "publicSectorHiring", favored: ["normal", "expansion"], opposed: ["freeze"], weight: 1.6 },
      { leverKey: "fuelSubsidy", favored: ["full", "partial"], opposed: ["removed"], weight: 1.0 },
      { leverKey: "taxRate", favored: ["low", "standard"], opposed: ["high"], weight: 0.8 },
      { leverKey: "interestRate", favored: ["accommodative", "neutral"], opposed: ["hawkish"], weight: 0.6 },
    ],
    macroSensitivities: [
      { key: "inflation", ideal: 18, weight: 0.8 },
      { key: "reserves", ideal: 35, weight: 0.6 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "Presidential Guard — Loyalty Questions",
        description: "Senior aides close to the presidency are exchanging knowing glances in the corridors of Aso Rock. The inner circle senses that their influence is waning and their positions may not be as secure as assumed.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "Presidential Guard — Inner Circle Tensions",
        description: "Key members of the Presidential Guard are lobbying through intermediaries, expressing concern that recent policy shifts are undermining their patronage networks. Whisper campaigns about the president's judgment are circulating in Abuja drawing rooms.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Reward Loyalty",
            context: "Quietly expand patronage channels for the inner circle. Approve pending contracts, fast-track appointments, and ensure the Guard's networks are well-fed. Loyalty is maintained through tangible benefits.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -2,
          },
          {
            id: "deflect",
            label: "Private Assurances",
            context: "Hold discreet one-on-one meetings with key Guard members. Assure them of their importance while making no specific promises. Test their loyalty through ambiguity.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Assert Presidential Authority",
            context: "Send a clear signal through trusted channels that the president governs, not the inner circle. Remind them that proximity to power is a privilege, not a right.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            stabilityDelta: -2,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "Presidential Guard — Power Struggle",
        description: "The Presidential Guard is engaged in an open power struggle within Aso Rock. Rival factions within the inner circle are leaking damaging information to the press. The Chief of Staff is being openly challenged by ambitious deputies. The palace is consumed by intrigue.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Palace Reshuffle",
            context: "Conduct a comprehensive reshuffle of the presidential household. Promote Guard loyalists to key positions, remove troublemakers, and consolidate the inner circle's power. Order is restored through patronage.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            stabilityDelta: 3,
          },
          {
            id: "partial",
            label: "Selective Promotions",
            context: "Identify the most disgruntled Guard members and offer them visible promotions or lucrative assignments. Address the loudest voices while leaving the underlying power dynamics intact.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
          },
          {
            id: "deflect",
            label: "External Distraction",
            context: "Manufacture a diplomatic or security crisis that requires the Guard to rally around the presidency. Nothing unites an inner circle like a common external threat.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
            stabilityDelta: -3,
          },
          {
            id: "refuse",
            label: "Clean House",
            context: "Fire the most disloyal Guard members publicly and replace them with fresh faces. A bold move that either restores order or triggers a palace revolt.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            stabilityDelta: -5,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "Presidential Guard — Palace Crisis",
        description: "The Presidential Guard is in open revolt. Senior aides are refusing to execute orders, critical intelligence is being withheld, and rival camps within Aso Rock are preparing for a transition of power. The presidency is being hollowed out from within.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Total Inner Circle Reset",
            context: "Capitulate to the Guard's demands. Restore purged loyalists, approve all pending patronage requests, and give the inner circle effective veto power over policy. The president reigns but no longer rules.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -14,
            approvalDelta: -4,
            stabilityDelta: 5,
            requirements: [{ metric: "politicalCapital", min: 14, description: "Requires deep political capital to buy back loyalty" }],
          },
          {
            id: "partial",
            label: "Negotiate Terms",
            context: "Enter direct negotiations with Guard leadership. Offer a power-sharing arrangement that gives the inner circle guaranteed influence in exchange for renewed loyalty and operational cooperation.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            stabilityDelta: 2,
          },
          {
            id: "refuse",
            label: "Purge and Replace",
            context: "Launch a comprehensive purge of disloyal elements within the presidential household. Bring in outside loyalists and security personnel. Risk everything on maintaining presidential authority.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            stabilityDelta: -8,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "Presidential Guard — Constitutional Crisis",
        description: "The Presidential Guard has effectively staged a soft coup. The president is isolated within Aso Rock, surrounded by hostile aides who control access, information, and communications. Key allies have been turned. The machinery of government is being redirected by the inner circle.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Accept the New Reality",
            context: "Formally acknowledge the Guard's power by granting them institutional control over key government functions. The president becomes a figurehead, but the office survives.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: -6,
            stabilityDelta: 3,
          },
          {
            id: "deflect",
            label: "Appeal to the Military",
            context: "Bypass the Presidential Guard entirely and appeal directly to the military establishment for protection. A desperate move that could trigger either a rescue or a real coup.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            stabilityDelta: -8,
          },
          {
            id: "refuse",
            label: "Go Public",
            context: "Address the nation directly via emergency broadcast, exposing the palace conspiracy and calling on Nigerians to defend democratic governance. The ultimate gamble—public support versus institutional power.",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            approvalDelta: 5,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MILITARY CIRCLE
  // ═══════════════════════════════════════════════════════
  {
    key: "Military Circle",
    temperament: "calculating",
    loyaltyInertia: 0.85,
    policyPreferences: [
      { leverKey: "publicSectorHiring", favored: ["expansion", "normal"], opposed: ["freeze"], weight: 1.8 },
      { leverKey: "importTariffs", favored: ["protective", "restrictive"], opposed: ["open"], weight: 1.2 },
      { leverKey: "fuelSubsidy", favored: ["full", "partial"], opposed: ["removed"], weight: 0.8 },
      { leverKey: "taxRate", favored: ["low", "standard"], opposed: ["high"], weight: 0.6 },
    ],
    macroSensitivities: [
      { key: "reserves", ideal: 40, weight: 1.2 },
      { key: "oilOutput", ideal: 2.0, weight: 1.0 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "Military Circle — Budget Grumbling",
        description: "Senior officers are expressing quiet dissatisfaction through retired generals who serve as intermediaries. Defence procurement delays and budget shortfalls are straining patience in the barracks.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "Military Circle — Security Budget Complaints",
        description: "The Defence Chiefs have submitted a formal memorandum detailing equipment shortages and unpaid allowances. Retired generals are making pointed public comments about the state of national security under civilian leadership.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Approve Defence Spending",
            context: "Fast-track the supplementary defence budget. Approve pending procurement contracts and authorize hazard pay increases for deployed troops. The military brass is satisfied—for now.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -2,
          },
          {
            id: "deflect",
            label: "Security Council Review",
            context: "Convene the National Security Council to review defence spending priorities. Show the military that their concerns are being taken seriously without committing to specific allocations.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Civilian Oversight",
            context: "Publicly reaffirm civilian control over military budgets. Commission an independent audit of defence spending and signal that the era of military self-regulation is over.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            stabilityDelta: -3,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "Military Circle — Security Demands",
        description: "The Military Circle is demanding a dramatic increase in security spending and operational autonomy. Junior officers are reporting morale problems, and intelligence suggests unauthorized meetings among mid-ranking commanders. The generals want answers.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Security Emergency Package",
            context: "Declare a national security emergency and unlock massive additional defence funding. Grant the military expanded operational authority and fast-track all pending equipment purchases.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            approvalDelta: -3,
            stabilityDelta: 5,
          },
          {
            id: "partial",
            label: "Targeted Security Boost",
            context: "Approve priority procurement items and authorize a one-time troop welfare package. Address the most urgent operational needs while maintaining civilian budget oversight.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            stabilityDelta: 2,
          },
          {
            id: "deflect",
            label: "Promote and Rotate",
            context: "Announce a round of promotions for cooperative officers and rotate troublesome commanders to less influential postings. Divide the military leadership through career incentives.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
            stabilityDelta: -2,
          },
          {
            id: "refuse",
            label: "Assert Civilian Supremacy",
            context: "Publicly rebuke military interference in governance. Retire the most vocal generals and appoint reform-minded replacements. A principled stand that courts a dangerous backlash.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            stabilityDelta: -8,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "Military Circle — Coup Whispers",
        description: "Intelligence agencies are reporting irregular troop movements and unauthorized communications between garrison commanders. Retired generals are making thinly veiled public statements about 'corrective intervention.' The military establishment is testing the waters.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Total Military Accommodation",
            context: "Give the military everything they want: budget autonomy, operational independence, and guaranteed representation in economic policy. The price of continued democratic governance.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -16,
            stabilityDelta: 8,
            requirements: [{ metric: "politicalCapital", min: 16, description: "Requires massive political capital to appease the military" }],
          },
          {
            id: "partial",
            label: "Security Compact",
            context: "Negotiate a formal civil-military compact: increased budgets and respect for military autonomy in exchange for guaranteed loyalty to democratic governance. An uneasy truce.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            stabilityDelta: 3,
          },
          {
            id: "refuse",
            label: "Pre-emptive Strike",
            context: "Order the arrest of suspected coup plotters and replace garrison commanders with presidential loyalists. Strike first before the conspiracy matures. If the intelligence is wrong, the consequences are catastrophic.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            stabilityDelta: -12,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "Military Circle — The Generals Move",
        description: "The Military Circle has crossed the Rubicon. Tanks are positioned near key government buildings, military communications have gone dark, and the Service Chiefs have demanded a meeting with the president. Nigeria stands on the brink of its first coup in decades.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Accept Military Terms",
            context: "Accept the generals' terms in full: a national security government with military participation, expanded defence budgets, and amnesty for all involved. Democracy bends but does not break.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: -8,
            stabilityDelta: 5,
          },
          {
            id: "deflect",
            label: "International SOS",
            context: "Contact foreign embassies, the AU, and the UN before the situation deteriorates further. International pressure may be the only thing that prevents a full military takeover.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            stabilityDelta: -5,
          },
          {
            id: "refuse",
            label: "Rally Democratic Forces",
            context: "Broadcast an emergency address calling on all democratic institutions—the legislature, judiciary, civil society—to resist the military threat. Either the nation rallies, or the presidency falls.",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            approvalDelta: 5,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // TECHNOCRATS
  // ═══════════════════════════════════════════════════════
  {
    key: "Technocrats",
    temperament: "ideological",
    loyaltyInertia: 0.65,
    policyPreferences: [
      { leverKey: "fxPolicy", favored: ["free-float"], opposed: ["peg"], weight: 2.0 },
      { leverKey: "electricityTariff", favored: ["cost-reflective", "market-rate"], opposed: ["subsidised"], weight: 1.8 },
      { leverKey: "fuelSubsidy", favored: ["targeted", "removed"], opposed: ["full"], weight: 1.8 },
      { leverKey: "interestRate", favored: ["tightening", "hawkish"], opposed: ["accommodative"], weight: 1.5 },
      { leverKey: "taxRate", favored: ["elevated", "high"], opposed: ["low"], weight: 1.2 },
      { leverKey: "importTariffs", favored: ["open", "moderate"], opposed: ["restrictive"], weight: 1.0 },
    ],
    macroSensitivities: [
      { key: "inflation", ideal: 8, weight: 0.3 },
      { key: "debtToGdp", ideal: 25, weight: 0.2 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "Technocrats — Reform Concerns",
        description: "Senior economic advisers are privately expressing frustration that evidence-based policy recommendations are being ignored. Academic papers critical of current policy are circulating in Abuja think tanks.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "Technocrats — Policy Critique Goes Public",
        description: "Prominent economists and former officials aligned with the Technocrats have published an open letter criticizing the administration's economic management. International organizations are echoing their concerns.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Embrace Evidence-Based Policy",
            context: "Announce a formal policy review incorporating technocratic recommendations. Appoint respected economists to key advisory roles and commit to data-driven governance.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -1,
          },
          {
            id: "deflect",
            label: "Academic Symposium",
            context: "Invite the Technocrats to present their analysis at a presidential economic forum. The appearance of intellectual engagement may soothe egos without changing policy direction.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Question Their Credentials",
            context: "Publicly challenge the Technocrats' track record and dismiss their critique as ivory-tower theorizing disconnected from Nigerian realities. Populism over expertise.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            approvalDelta: 2,
            stabilityDelta: -2,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "Technocrats — Institutional Revolt",
        description: "Technocratic officials within the administration are threatening to resign en masse. The CBN, SEC, and BPE are effectively operating on autopilot as reform-minded appointees disengage. International ratings agencies have taken notice.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Full Reform Agenda",
            context: "Announce a comprehensive reform package designed by the Technocrats: subsidy removal, FX liberalization, fiscal consolidation. The markets celebrate but the streets may not.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            approvalDelta: -4,
            stabilityDelta: 3,
          },
          {
            id: "partial",
            label: "Gradual Reform Timeline",
            context: "Publish a phased reform roadmap that addresses the Technocrats' core concerns over 18 months. Fast enough to keep them engaged, slow enough to manage political fallout.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: -2,
          },
          {
            id: "deflect",
            label: "International Validation",
            context: "Invite the IMF to conduct an Article IV consultation, effectively outsourcing the policy debate to an international authority. Neither side gets what it wants immediately.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
          },
          {
            id: "refuse",
            label: "Political Pragmatism",
            context: "Publicly state that governance requires balancing economic orthodoxy with political reality. Replace departing Technocrats with politically loyal alternatives. Efficiency sacrificed for control.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            stabilityDelta: -4,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "Technocrats — Mass Resignation Threat",
        description: "The Technocrats have drafted a joint resignation letter signed by dozens of senior officials across economic ministries and regulatory agencies. Their departure would cripple the government's ability to manage the economy and destroy international credibility.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Technocratic Government",
            context: "Hand economic policy entirely to the Technocrats. Grant them cabinet positions, policy autonomy, and protection from political interference. The economy may recover but democratic accountability weakens.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -14,
            approvalDelta: -5,
            stabilityDelta: 5,
            requirements: [{ metric: "politicalCapital", min: 14, description: "Requires major political investment to restructure governance" }],
          },
          {
            id: "partial",
            label: "Reform Pact",
            context: "Negotiate a binding agreement with Technocratic leaders: specific reforms will be implemented on a fixed timeline in exchange for their continued service and public support.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            approvalDelta: -3,
            stabilityDelta: 2,
          },
          {
            id: "refuse",
            label: "Let Them Leave",
            context: "Accept the resignations and replace departing officials with political appointees. Bet that loyalty and determination can compensate for lost technical expertise. The markets will judge harshly.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            stabilityDelta: -6,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "Technocrats — Institutional Collapse",
        description: "The Technocrats have resigned en masse. Key regulatory agencies are leaderless, international credit ratings have been downgraded, and foreign investors are fleeing. The institutional backbone of economic governance has shattered.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Beg Them Back",
            context: "Publicly apologize for sidelining expert advice and offer the Technocrats unprecedented institutional guarantees. Their return comes with humiliating conditions but the alternative is economic freefall.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: -6,
            stabilityDelta: 3,
          },
          {
            id: "deflect",
            label: "International Emergency Team",
            context: "Request emergency technical assistance from the IMF, World Bank, and AfDB to fill the institutional vacuum. International experts stabilize operations but sovereignty takes a hit.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            approvalDelta: -3,
            stabilityDelta: -3,
          },
          {
            id: "refuse",
            label: "Populist Economics",
            context: "Declare that Nigeria does not need foreign-trained economists to manage its economy. Appoint political loyalists to all vacant positions and pursue a nationalist economic agenda. A leap into the unknown.",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            approvalDelta: 3,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // YOUTH MOVEMENT
  // ═══════════════════════════════════════════════════════
  {
    key: "Youth Movement",
    temperament: "volatile",
    loyaltyInertia: 0.4,
    policyPreferences: [
      { leverKey: "minimumWage", favored: ["union-demand", "populist"], opposed: ["frozen"], weight: 2.0 },
      { leverKey: "cashTransfers", favored: ["moderate", "generous"], opposed: ["none"], weight: 1.8 },
      { leverKey: "publicSectorHiring", favored: ["normal", "expansion"], opposed: ["freeze"], weight: 1.5 },
      { leverKey: "fuelSubsidy", favored: ["full", "partial"], opposed: ["removed"], weight: 1.3 },
      { leverKey: "electricityTariff", favored: ["subsidised", "tiered"], opposed: ["market-rate"], weight: 1.0 },
    ],
    macroSensitivities: [
      { key: "inflation", ideal: 10, weight: 1.8 },
      { key: "fxRate", ideal: 600, weight: 1.2 },
      { key: "subsidyPressure", ideal: 20, weight: 0.8 },
    ],
    demandTemplates: [
      {
        grievanceLevel: 20,
        title: "Youth Movement — Online Grumbling",
        description: "Nigerian Twitter and TikTok are buzzing with complaints about the cost of living. Youth influencers are posting videos comparing prices and mocking government economic pronouncements. The mood is souring.",
        deadlineDays: 0,
        choiceArchetypes: [],
      },
      {
        grievanceLevel: 40,
        title: "Youth Movement — Hashtag Trending",
        description: "A protest hashtag is trending nationally. Youth organizations are coordinating through social media, and student unions are passing resolutions of no confidence. The digital noise is spilling into real-world discontent.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Youth Economic Package",
            context: "Announce a comprehensive youth empowerment program: minimum wage increases, student loan forgiveness, and a national jobs initiative. Show the youth that their government is listening.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: 3,
          },
          {
            id: "deflect",
            label: "Social Media Engagement",
            context: "Launch a presidential social media campaign and hold a town hall with youth leaders. Engage the conversation without making policy commitments. Vibes over substance.",
            loyaltyDelta: 2,
            grievanceDelta: -5,
            pcDelta: -1,
          },
          {
            id: "refuse",
            label: "Dismiss Online Noise",
            context: "Publicly dismiss social media complaints as unrepresentative of Nigerian youth. Accuse foreign agents of stoking discontent online. The youth feel patronized and dismissed.",
            loyaltyDelta: -5,
            grievanceDelta: 8,
            pcDelta: 2,
            stabilityDelta: -2,
          },
        ],
      },
      {
        grievanceLevel: 70,
        title: "Youth Movement — Street Mobilization",
        description: "Youth organizations have called for nationwide protests. University campuses are shutting down, labor unions are expressing solidarity, and social media is flooded with protest coordination. The streets are about to speak.",
        deadlineDays: 30,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Emergency Relief Package",
            context: "Announce an emergency cost-of-living package: fuel subsidy restoration, electricity price rollback, minimum wage hike, and expanded cash transfers. Drain the treasury to cool the streets.",
            loyaltyDelta: 15,
            grievanceDelta: -25,
            pcDelta: -8,
            approvalDelta: 5,
            stabilityDelta: 5,
          },
          {
            id: "partial",
            label: "Targeted Youth Concessions",
            context: "Offer targeted measures—student transport subsidies, youth hiring quotas, skills training programs—while maintaining the broader economic framework. Enough to split moderate youth from radicals.",
            loyaltyDelta: 8,
            grievanceDelta: -15,
            pcDelta: -4,
            approvalDelta: 2,
          },
          {
            id: "deflect",
            label: "National Youth Dialogue",
            context: "Propose a 30-day national youth dialogue with guaranteed presidential participation. The offer of engagement may delay protests while buying time for economic conditions to improve.",
            loyaltyDelta: 0,
            grievanceDelta: -5,
            pcDelta: -2,
          },
          {
            id: "refuse",
            label: "Ban Protests",
            context: "Invoke public order laws to ban the planned protests. Deploy police to university campuses and social media gathering points. Confrontation risks another EndSARS moment.",
            loyaltyDelta: -10,
            grievanceDelta: 12,
            pcDelta: 3,
            stabilityDelta: -8,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 90,
        title: "Youth Movement — Nationwide Protests",
        description: "Millions of young Nigerians have taken to the streets in the largest demonstrations since EndSARS. Major cities are paralyzed, international media is broadcasting live, and the diaspora is organizing solidarity protests worldwide. The government faces an existential legitimacy crisis.",
        deadlineDays: 14,
        choiceArchetypes: [
          {
            id: "concede",
            label: "Total Policy Reversal",
            context: "Address the nation and announce a complete reversal of austerity measures. Restore all subsidies, raise minimum wage to demanded levels, and launch a massive public employment scheme. Fiscal ruin may follow, but the streets calm.",
            loyaltyDelta: 20,
            grievanceDelta: -30,
            pcDelta: -12,
            approvalDelta: 8,
            stabilityDelta: 8,
            requirements: [{ metric: "politicalCapital", min: 12, description: "Requires political capital to execute a credible reversal" }],
          },
          {
            id: "partial",
            label: "Negotiate with Protest Leaders",
            context: "Invite protest leaders to Aso Rock for direct negotiations. Offer substantial but not total concessions on their core demands. Test whether the movement has a leadership that can cut a deal.",
            loyaltyDelta: 10,
            grievanceDelta: -18,
            pcDelta: -7,
            approvalDelta: 4,
            stabilityDelta: 3,
          },
          {
            id: "refuse",
            label: "Crackdown",
            context: "Order security forces to disperse protests by force. Shut down social media platforms and impose curfews in major cities. The international community will condemn it, but the regime calculation is survival.",
            loyaltyDelta: -15,
            grievanceDelta: 15,
            pcDelta: 4,
            approvalDelta: -10,
            stabilityDelta: -12,
            triggerChainEvent: true,
          },
        ],
      },
      {
        grievanceLevel: 100,
        title: "Youth Movement — Revolution in the Air",
        description: "The youth protests have evolved into a decentralized revolution. Barricades are up in Lagos, Abuja, and Port Harcourt. Workers have joined with a general strike. International governments are issuing statements. The administration teeters on the edge of collapse.",
        deadlineDays: 0,
        choiceArchetypes: [
          {
            id: "concede",
            label: "New Social Contract",
            context: "Announce a fundamental restructuring of the social contract: constitutional reforms, economic redistribution, youth cabinet representation, and truth-and-reconciliation for protest casualties. The old Nigeria ends.",
            loyaltyDelta: 25,
            grievanceDelta: -40,
            pcDelta: -18,
            approvalDelta: 10,
            stabilityDelta: -5,
          },
          {
            id: "deflect",
            label: "Call Early Elections",
            context: "Announce early elections as a democratic release valve. Let the people decide the country's direction through the ballot box rather than the barricade. A dignified exit or a mandate for change.",
            loyaltyDelta: 5,
            grievanceDelta: -10,
            pcDelta: -5,
            approvalDelta: 5,
            stabilityDelta: -8,
          },
          {
            id: "refuse",
            label: "State of Emergency",
            context: "Declare a nationwide state of emergency. Suspend civil liberties, deploy the military, and attempt to restore order through overwhelming force. The last resort of a government that has lost its people.",
            loyaltyDelta: -20,
            grievanceDelta: 20,
            pcDelta: 6,
            approvalDelta: -15,
            stabilityDelta: -15,
            triggerChainEvent: true,
          },
        ],
      },
    ],
  },
];
