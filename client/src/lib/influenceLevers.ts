// client/src/lib/influenceLevers.ts
import type { InfluenceLever } from "./legislativeTypes";
import type { GameState } from "./gameTypes";

const INFLUENCE_LEVERS: InfluenceLever[] = [
  {
    id: "spend-political-capital",
    name: "Spend Political Capital",
    description:
      "Deploy accumulated presidential goodwill to pressure fence-sitters in both chambers for a flat vote boost.",
    costs: [{ type: "politicalCapital", amount: 8 }],
    houseSwing: 15,
    senateSwing: 15,
    sideEffects: [],
    available: (_state: GameState) => true,
  },
  {
    id: "offer-concessions",
    name: "Offer Concessions",
    description:
      "Dilute the bill with targeted amendments to win over reluctant senators and secure a broader coalition.",
    costs: [{ type: "billDilution", amount: 20 }],
    houseSwing: 10,
    senateSwing: 20,
    sideEffects: [],
    available: (_state: GameState) => true,
  },
  {
    id: "promise-patronage",
    name: "Promise Patronage",
    description:
      "Dangle project appointments and constituency allocations to mobilise ruling-bloc representatives at the cost of opposition grievance.",
    costs: [{ type: "politicalCapital", amount: 3 }],
    houseSwing: 20,
    senateSwing: 10,
    sideEffects: [
      { target: "factionGrievance", delta: 5, factionName: "opposition" },
    ],
    available: (_state: GameState) => true,
  },
  {
    id: "address-joint-session",
    name: "Address Joint Session",
    description:
      "Leverage your approval ratings to deliver a nationally-televised address that sways both chambers equally.",
    costs: [{ type: "approval", amount: 3 }],
    houseSwing: 12,
    senateSwing: 12,
    sideEffects: [],
    available: (state: GameState) => state.approval >= 40,
  },
  {
    id: "executive-pressure",
    name: "Executive Pressure",
    description:
      "Apply direct presidential authority over ruling-bloc members, trading party loyalty for a strong house push at the cost of national stability.",
    costs: [{ type: "partyLoyalty", amount: 5 }],
    houseSwing: 25,
    senateSwing: 15,
    sideEffects: [{ target: "stability", delta: -2 }],
    available: (_state: GameState) => true,
  },
  {
    id: "back-channel",
    name: "Back-Channel Deals",
    description:
      "Work through discreet intermediaries to flip individual senators without the visibility of a public campaign.",
    costs: [{ type: "politicalCapital", amount: 5 }],
    houseSwing: 0,
    senateSwing: 25,
    sideEffects: [],
    available: (_state: GameState) => true,
  },
  {
    id: "go-public",
    name: "Go Public",
    description:
      "Take the bill directly to the electorate with a major public campaign, generating grassroots pressure on House members at a cost to approval.",
    costs: [{ type: "approval", amount: 5 }],
    houseSwing: 20,
    senateSwing: 5,
    sideEffects: [],
    available: (state: GameState) => state.approval >= 50,
  },
];

export function getInfluenceLevers(): InfluenceLever[] {
  return INFLUENCE_LEVERS;
}

export function getLeverById(id: string): InfluenceLever | undefined {
  return INFLUENCE_LEVERS.find((lever) => lever.id === id);
}
