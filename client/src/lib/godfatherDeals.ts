// client/src/lib/godfatherDeals.ts
import type {
  Godfather,
  GodfatherArchetype,
  GodfatherContract,
  GodfatherDeal,
  PatronageState,
} from "./godfatherTypes";
import type { LeverCost } from "./legislativeTypes";

// ── Deal context definitions ──────────────────────────────────────────

type DealContext =
  | "legislative-support"
  | "security-crisis"
  | "appointment"
  | "campaign-funding"
  | "media-coverage"
  | "street-protest";

interface OfferTemplate {
  godfatherOffers: string;
  playerOwes: string;
  estimatedCost: LeverCost[];
  estimatedBenefit: string;
}

// What each archetype can offer per context
const ARCHETYPE_OFFERS: Record<GodfatherArchetype, Partial<Record<DealContext, OfferTemplate>>> = {
  "business-oligarch": {
    "legislative-support": {
      godfatherOffers: "Mobilise legislative bloc to vote for your bill",
      playerOwes: "Award federal infrastructure contracts to allied companies",
      estimatedCost: [{ type: "politicalCapital", amount: 15 }],
      estimatedBenefit: "12-18 House votes, 3-5 Senate votes",
    },
    "security-crisis": {
      godfatherOffers: "Fund private security logistics and intelligence networks",
      playerOwes: "Grant import duty waivers on industrial inputs",
      estimatedCost: [{ type: "approval", amount: 5 }],
      estimatedBenefit: "Rapid security asset deployment in affected zone",
    },
    "appointment": {
      godfatherOffers: "Provide vetted technocrat nominees for cabinet positions",
      playerOwes: "Appoint allied candidates to regulatory agencies",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Competent minister with private sector credibility",
    },
    "campaign-funding": {
      godfatherOffers: "Channel N5 billion through legitimate business fronts",
      playerOwes: "Protect monopoly positions in cement and energy sectors",
      estimatedCost: [{ type: "approval", amount: 8 }],
      estimatedBenefit: "Major campaign war chest for midterm mobilisation",
    },
    "media-coverage": {
      godfatherOffers: "Direct owned media houses to run favourable coverage",
      playerOwes: "Block media reform bills and licensing reviews",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Positive coverage across 3 national newspapers",
    },
    "street-protest": {
      godfatherOffers: "Hire counter-protest organisers through business associations",
      playerOwes: "Fast-track land allocations in Abuja and Lagos",
      estimatedCost: [{ type: "approval", amount: 6 }],
      estimatedBenefit: "Defuse street opposition within 48 hours",
    },
  },
  "military-elder": {
    "legislative-support": {
      godfatherOffers: "Apply backroom pressure on retired officers in legislature",
      playerOwes: "A favour to be named later",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Quiet compliance from military-aligned legislators",
    },
    "security-crisis": {
      godfatherOffers: "Activate intelligence contacts and retired field commanders",
      playerOwes: "The general remembers those who remember him",
      estimatedCost: [{ type: "politicalCapital", amount: 5 }],
      estimatedBenefit: "Operational intelligence and crisis de-escalation",
    },
    "appointment": {
      godfatherOffers: "Recommend trusted officers for security appointments",
      playerOwes: "A debt of honour, to be settled in kind",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Loyal and competent security leadership",
    },
    "campaign-funding": {
      godfatherOffers: "Arrange discreet funding through defence contractors",
      playerOwes: "Ensure defence procurement flows through preferred channels",
      estimatedCost: [{ type: "approval", amount: 10 }],
      estimatedBenefit: "Untraceable campaign funding with plausible deniability",
    },
    "media-coverage": {
      godfatherOffers: "Lean on editors through old establishment networks",
      playerOwes: "Respect for the institution — no military reform bills",
      estimatedCost: [{ type: "politicalCapital", amount: 6 }],
      estimatedBenefit: "Negative stories quietly spiked",
    },
    "street-protest": {
      godfatherOffers: "Coordinate with security services to contain unrest",
      playerOwes: "Future consideration when the time comes",
      estimatedCost: [{ type: "approval", amount: 8 }],
      estimatedBenefit: "Protests contained without visible crackdown",
    },
  },
  "party-boss": {
    "legislative-support": {
      godfatherOffers: "Whip party caucus into line for your bill",
      playerOwes: "Channel constituency project funds through party structures",
      estimatedCost: [{ type: "politicalCapital", amount: 12 }, { type: "partyLoyalty", amount: -5 }],
      estimatedBenefit: "Reliable party-line votes in both chambers",
    },
    "security-crisis": {
      godfatherOffers: "Mobilise party youth wing as community stabilisers",
      playerOwes: "Expand party patronage slots in affected zone",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Community-level crisis response through party networks",
    },
    "appointment": {
      godfatherOffers: "Smooth confirmation hearings through party machinery",
      playerOwes: "Reserve deputy minister positions for party nominees",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Swift Senate confirmation for key appointments",
    },
    "campaign-funding": {
      godfatherOffers: "Activate party fundraising apparatus nationwide",
      playerOwes: "Increase party committee budget allocations",
      estimatedCost: [{ type: "partyLoyalty", amount: -8 }],
      estimatedBenefit: "Grassroots funding network across all 36 states",
    },
    "media-coverage": {
      godfatherOffers: "Deploy party spokespersons across all media platforms",
      playerOwes: "Publicly credit party leadership for policy successes",
      estimatedCost: [{ type: "politicalCapital", amount: 5 }],
      estimatedBenefit: "Coordinated party messaging on all channels",
    },
    "street-protest": {
      godfatherOffers: "Counter-mobilise party supporters for solidarity rallies",
      playerOwes: "Release blocked LGA funds to party-controlled councils",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Matching counter-protests to neutralise opposition",
    },
  },
  "labour-civil": {
    "legislative-support": {
      godfatherOffers: "Deliver union-aligned legislators for your bill",
      playerOwes: "Protect minimum wage provisions and labour protections",
      estimatedCost: [{ type: "approval", amount: 5 }],
      estimatedBenefit: "Labour bloc votes plus street credibility",
    },
    "security-crisis": {
      godfatherOffers: "Call off planned industrial actions during crisis",
      playerOwes: "Guarantee no retrenchment in public sector",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Industrial peace during critical security period",
    },
    "appointment": {
      godfatherOffers: "Endorse your labour minister pick publicly",
      playerOwes: "Appoint labour representative to economic council",
      estimatedCost: [{ type: "politicalCapital", amount: 6 }],
      estimatedBenefit: "Labour movement backing for economic appointments",
    },
    "campaign-funding": {
      godfatherOffers: "Organise worker solidarity rallies as campaign events",
      playerOwes: "Implement agreed wage increases before elections",
      estimatedCost: [{ type: "approval", amount: 8 }],
      estimatedBenefit: "Visible working-class support for your agenda",
    },
    "media-coverage": {
      godfatherOffers: "Issue joint union statements praising your policies",
      playerOwes: "Freeze planned privatisation of state enterprises",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Pro-worker media narrative boosting approval",
    },
    "street-protest": {
      godfatherOffers: "Redirect union members away from opposition protests",
      playerOwes: "Rescind fuel subsidy removal timeline",
      estimatedCost: [{ type: "approval", amount: 12 }],
      estimatedBenefit: "Major protest movement collapses without union backing",
    },
  },
  "religious-leader": {
    "legislative-support": {
      godfatherOffers: "Issue moral endorsement of your legislative agenda",
      playerOwes: "Block bills conflicting with religious values",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Moral authority lending weight to controversial bills",
    },
    "security-crisis": {
      godfatherOffers: "Call for calm through sermons and religious networks",
      playerOwes: "Protect religious institutions from regulatory oversight",
      estimatedCost: [{ type: "politicalCapital", amount: 5 }],
      estimatedBenefit: "Community de-escalation through trusted voices",
    },
    "appointment": {
      godfatherOffers: "Bless your appointments before religious communities",
      playerOwes: "Ensure zonal balance respects religious demographics",
      estimatedCost: [{ type: "politicalCapital", amount: 6 }],
      estimatedBenefit: "Religious community acceptance of cabinet picks",
    },
    "campaign-funding": {
      godfatherOffers: "Mobilise faithful for rallies and voter turnout",
      playerOwes: "Increase funding for religious education and pilgrimage",
      estimatedCost: [{ type: "approval", amount: 6 }],
      estimatedBenefit: "Mass mobilisation through houses of worship",
    },
    "media-coverage": {
      godfatherOffers: "Denounce media attacks on your government from the pulpit",
      playerOwes: "Shield religious broadcasting from licensing reforms",
      estimatedCost: [{ type: "politicalCapital", amount: 5 }],
      estimatedBenefit: "Religious media ecosystem rallying behind you",
    },
    "street-protest": {
      godfatherOffers: "Declare protests sinful and call faithful to stay home",
      playerOwes: "Exempt religious bodies from new tax regulations",
      estimatedCost: [{ type: "approval", amount: 8 }],
      estimatedBenefit: "Religious communities withdraw from protest movement",
    },
  },
  "regional-strongman": {
    "legislative-support": {
      godfatherOffers: "Deliver zonal legislators as a unified voting bloc",
      playerOwes: "Direct federal projects and appointments to the zone",
      estimatedCost: [{ type: "politicalCapital", amount: 12 }],
      estimatedBenefit: "Reliable zonal bloc voting in both chambers",
    },
    "security-crisis": {
      godfatherOffers: "Deploy ethnic militia networks to stabilise the zone",
      playerOwes: "Grant amnesty to allied militant groups",
      estimatedCost: [{ type: "approval", amount: 10 }],
      estimatedBenefit: "Immediate ground-level security in affected areas",
    },
    "appointment": {
      godfatherOffers: "Ensure zonal support for your appointee",
      playerOwes: "Appoint from his list of approved candidates",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Guaranteed zonal acceptance of your appointment",
    },
    "campaign-funding": {
      godfatherOffers: "Lock down the zone for your re-election campaign",
      playerOwes: "Increase zonal allocation in the next budget",
      estimatedCost: [{ type: "approval", amount: 8 }],
      estimatedBenefit: "Near-total electoral dominance in one geopolitical zone",
    },
    "media-coverage": {
      godfatherOffers: "Ensure regional media houses project your narrative",
      playerOwes: "Appoint zonal representatives to media regulatory bodies",
      estimatedCost: [{ type: "politicalCapital", amount: 6 }],
      estimatedBenefit: "Favourable regional media coverage across the zone",
    },
    "street-protest": {
      godfatherOffers: "Call off ethnic and regional protest movements",
      playerOwes: "Address long-standing zonal grievances publicly",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Regional protest movement stands down",
    },
  },
  "media-mogul": {
    "legislative-support": {
      godfatherOffers: "Run editorial campaigns supporting your bill",
      playerOwes: "Kill the media monopoly review bill in committee",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Public opinion shift favouring your legislation",
    },
    "security-crisis": {
      godfatherOffers: "Control the crisis narrative across owned platforms",
      playerOwes: "Block foreign media licensing in Nigerian market",
      estimatedCost: [{ type: "politicalCapital", amount: 6 }],
      estimatedBenefit: "Managed media narrative preventing panic",
    },
    "appointment": {
      godfatherOffers: "Provide positive coverage for controversial appointees",
      playerOwes: "Appoint media-friendly information minister",
      estimatedCost: [{ type: "politicalCapital", amount: 8 }],
      estimatedBenefit: "Smooth public reception of cabinet appointments",
    },
    "campaign-funding": {
      godfatherOffers: "Offer free prime-time advertising across all platforms",
      playerOwes: "Renew broadcast licences without competitive bidding",
      estimatedCost: [{ type: "approval", amount: 6 }],
      estimatedBenefit: "Millions in free media exposure",
    },
    "media-coverage": {
      godfatherOffers: "Full spectrum positive coverage across print, TV, digital",
      playerOwes: "Increase government advertising spend through his outlets",
      estimatedCost: [{ type: "politicalCapital", amount: 10 }],
      estimatedBenefit: "Dominant positive media narrative nationwide",
    },
    "street-protest": {
      godfatherOffers: "Black out protest coverage and amplify counter-narrative",
      playerOwes: "Drop defamation suit protections for online critics",
      estimatedCost: [{ type: "approval", amount: 8 }],
      estimatedBenefit: "Protest loses media oxygen and public visibility",
    },
  },
};

// Fallback template when no archetype-context match exists
const FALLBACK_TEMPLATE: OfferTemplate = {
  godfatherOffers: "General political support and back-channel influence",
  playerOwes: "Unspecified political considerations",
  estimatedCost: [{ type: "politicalCapital", amount: 10 }],
  estimatedBenefit: "Broad political support from influential power broker",
};

// ── Disposition ordering ──────────────────────────────────────────────

const DISPOSITION_ORDER = ["friendly", "neutral", "cold", "hostile"] as const;
type Disposition = (typeof DISPOSITION_ORDER)[number];

function worsenDisposition(current: Disposition): Disposition {
  const idx = DISPOSITION_ORDER.indexOf(current);
  if (idx < DISPOSITION_ORDER.length - 1) {
    return DISPOSITION_ORDER[idx + 1];
  }
  return current;
}

// ── Favour demand templates ───────────────────────────────────────────

const FAVOUR_DEMANDS: Record<string, { low: string; mid: string; high: string }> = {
  appointment: {
    low: "Appoint an ally to a minor advisory board position",
    mid: "Appoint a loyalist to a federal parastatal board",
    high: "Appoint a handpicked candidate as a cabinet minister",
  },
  contract: {
    low: "Steer a small maintenance contract to a preferred vendor",
    mid: "Award a mid-tier federal construction project without competitive bidding",
    high: "Grant a multi-billion naira sole-source infrastructure contract",
  },
  policy: {
    low: "Delay implementation of a minor regulatory change",
    mid: "Quietly shelve a reform bill that threatens allied interests",
    high: "Reverse a major policy position to protect entrenched interests",
  },
  protection: {
    low: "Ensure EFCC does not investigate a minor associate",
    mid: "Quash an ongoing corruption investigation into a key ally",
    high: "Grant blanket immunity to inner circle members from prosecution",
  },
};

function getDemandSeverity(greed: number): "low" | "mid" | "high" {
  if (greed >= 70) return "high";
  if (greed >= 40) return "mid";
  return "low";
}

function generateDemandDescription(demand: string, greed: number): string {
  const category = FAVOUR_DEMANDS[demand] ?? FAVOUR_DEMANDS["contract"]!;
  const severity = getDemandSeverity(greed);
  return category[severity];
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Generate a deal proposal based on the godfather's archetype, deal style, and gameplay context.
 */
export function generateDealProposal(godfather: Godfather, context: string): GodfatherDeal {
  const template =
    ARCHETYPE_OFFERS[godfather.archetype]?.[context as DealContext] ?? FALLBACK_TEMPLATE;

  const dealType = godfather.dealStyle === "favour-bank" ? "favour" : "contract";

  // For favour-style deals, make terms vague
  const playerOwes =
    dealType === "favour"
      ? "A favour to be called in when needed"
      : template.playerOwes;

  return {
    godfatherId: godfather.id,
    type: dealType,
    godfatherOffers: template.godfatherOffers,
    playerOwes,
    estimatedCost: template.estimatedCost,
    estimatedBenefit: template.estimatedBenefit,
  };
}

/**
 * Accept a deal. Increases patronageIndex by 5, increments activeDeals.
 * For contract deals, adds a contract to the godfather's activeContracts.
 * For favour deals, increases the godfather's favourDebt.
 * Respects a 6-deal cap — returns unchanged state if cap reached.
 */
export function acceptDeal(
  patronageState: PatronageState,
  godfatherId: string,
  deal: GodfatherDeal,
): PatronageState {
  if (patronageState.activeDeals >= 6) {
    return patronageState;
  }

  const godfathers = patronageState.godfathers.map((gf) => {
    if (gf.id !== godfatherId) return gf;

    if (deal.type === "contract") {
      const contract: GodfatherContract = {
        id: `contract-${godfatherId}-${Date.now()}`,
        description: deal.playerOwes,
        deliveredByGodfather: true,
        deadlineDay: 0, // caller should set a real deadline
        playerDelivered: false,
        consequence: [],
      };
      return {
        ...gf,
        activeContracts: [...gf.activeContracts, contract],
      };
    }

    // favour-bank style
    return {
      ...gf,
      favourDebt: gf.favourDebt + 1,
    };
  });

  return {
    ...patronageState,
    godfathers,
    patronageIndex: patronageState.patronageIndex + 5,
    activeDeals: patronageState.activeDeals + 1,
  };
}

/**
 * Reject a deal. May worsen disposition if the godfather has high aggression (>70).
 */
export function rejectDeal(
  patronageState: PatronageState,
  godfatherId: string,
): PatronageState {
  const godfathers = patronageState.godfathers.map((gf) => {
    if (gf.id !== godfatherId) return gf;

    if (gf.traits.aggression > 70) {
      return {
        ...gf,
        disposition: worsenDisposition(gf.disposition),
      };
    }

    return gf;
  });

  return {
    ...patronageState,
    godfathers,
  };
}

/**
 * Check all active contracts across all godfathers for missed deadlines.
 * Missed deadlines (currentDay > deadlineDay && !playerDelivered) advance escalation stage.
 */
export function checkContractDeadlines(
  patronageState: PatronageState,
  currentDay: number,
): PatronageState {
  const godfathers = patronageState.godfathers.map((gf) => {
    const missedContracts = gf.activeContracts.filter(
      (c) => currentDay > c.deadlineDay && !c.playerDelivered && c.deliveredByGodfather,
    );

    if (missedContracts.length === 0) return gf;

    const newEscalation = Math.min(4, gf.escalationStage + missedContracts.length) as
      | 0
      | 1
      | 2
      | 3
      | 4;

    return {
      ...gf,
      escalationStage: newEscalation,
    };
  });

  return {
    ...patronageState,
    godfathers,
  };
}

/**
 * Godfather cashes in a favour. Deducts 1 from favourDebt.
 * Generates a demand description whose severity scales with the godfather's greed trait.
 */
export function cashInFavour(
  patronageState: PatronageState,
  godfatherId: string,
  demand: string,
): { state: PatronageState; demandDescription: string } {
  let demandDescription = "";

  const godfathers = patronageState.godfathers.map((gf) => {
    if (gf.id !== godfatherId) return gf;

    demandDescription = generateDemandDescription(demand, gf.traits.greed);

    return {
      ...gf,
      favourDebt: Math.max(0, gf.favourDebt - 1),
    };
  });

  return {
    state: {
      ...patronageState,
      godfathers,
    },
    demandDescription,
  };
}
