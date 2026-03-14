# Party Internals — Design Spec

**Sub-Project E** of the Aso Rock game feature roadmap (A through F).

**Goal:** Create a living party ecosystem where the player manages their ruling party's internal power structure (National Working Committee), contends with two active opposition parties that strategise against them, navigates legislator and governor defections, and faces a Year 3 party convention that determines control of the party machinery heading into re-election.

---

## 1. Core Architecture

The Party Internals system has four layers:

### 1.1 Party Structure — National Working Committee (NWC)

Every party has an NWC of 8 members representing the party's executive leadership. The NWC is pre-populated at game start for all 8 parties. Each party's NWC must include at least one member from each geopolitical zone.

The **National Chairman** is the most important NWC member — they control party discipline, endorsements, and the convention process. A chairman aligned with the player is an asset; a hostile chairman can block the player's re-election bid, refuse to discipline disloyal legislators, or publicly criticise the president.

### 1.2 Opposition Parties

Two main opposition parties get full simulation: their own NWC, a leader (the party chairman acts as the player's political rival), legislative bloc, and active strategy. The remaining 5 parties are background — they have leaders, seat counts, and can join coalitions, but don't independently strategise.

Each main opposition party picks a strategy (Obstruct, Negotiate, or Attack) that shifts periodically based on player approval, stability, and the electoral cycle.

### 1.3 Defection Mechanics

Legislators and governors have a defection risk that builds from loyalty drift. Below party loyalty 40, they're "at risk." Actual defection requires a trigger: active player poaching (spending political capital), a godfather pulling their people, a party crisis, or the approaching convention/election cycle. The player can recruit opposition legislators and must defend against poaching of their own.

### 1.4 Party Convention

In Year 3, each party holds a convention to elect a new NWC. This is a multi-stage event: pre-convention manoeuvring (backing candidates, spending PC, using hooks), the convention vote (influenced by the player's accumulated party loyalty, faction support, and godfather backing), and post-convention fallout (losers may defect, fractures may emerge). The convention is the unofficial start of the re-election cycle.

---

## 2. Party Structure & NWC

### 2.1 NWC Positions (8 per party)

| Position | Role in Gameplay | Prestige |
|----------|-----------------|----------|
| National Chairman | Controls party discipline, endorsements, convention agenda. Most powerful NWC member. | Strategic |
| Vice Chairman | Succeeds chairman if removed. Often from a different zone than the chairman. | Standard |
| National Secretary | Manages party administration. Controls membership rolls — can block or accelerate defections. | Standard |
| National Treasurer | Controls party funds. Determines how much money flows to the player's campaign vs. rivals. | Strategic |
| Publicity Secretary | Party messaging and media. A hostile one publicly criticises the president; an allied one amplifies the player's narrative. | Standard |
| Organising Secretary | Manages grassroots mobilisation. Determines party's ground-game strength in elections and conventions. | Standard |
| Legal Adviser | Handles intra-party disputes, challenges to convention results. Can legitimise or delegitimise player's actions. | Routine |
| Youth/Women Leader | Represents demographic blocs. Influences youth/women voter turnout and party demographics. | Routine |

### 2.2 NWC Composition Rules

- At least one member from each of the 6 geopolitical zones per party
- Chairman and Vice Chairman must be from different zones (north/south split is traditional)
- Each NWC member has: name, zone, state, competence (30-95), loyalty to player (ruling party) or to party leader (opposition), faction alignment, and a disposition toward the president (supportive/neutral/hostile)

### 2.3 Player's Relationship with NWC

The player doesn't directly control the ruling party's NWC — they influence it. A **Party Control Score** (0-100) measures how much of the NWC backs the player:
- Each NWC member's disposition (supportive = +12.5, neutral = +6, hostile = 0) contributes to the score
- Above 75: the player effectively controls the party — the chairman cooperates, discipline is enforced, the re-election bid is smooth
- 40-74: contested control — the NWC cooperates on some things but resists on others
- Below 40: the NWC is hostile — they may block the player's re-election, refuse to discipline defectors, or publicly side with challengers

---

## 3. Opposition & Defection

### 3.1 Two Main Opposition Parties

At game start, the two strongest non-ruling parties are designated as main opposition. Each gets:

- **Full NWC** (8 members, same structure as ruling party)
- **Opposition Leader** — the party chairman acts as the player's political rival. They have personality traits (aggression, cunning, popularity) that determine their strategy
- **Legislative bloc** — their House and Senate seat counts, which shift with defections
- **Active strategy** — one of three modes (Obstruct/Negotiate/Attack), reassessed every 30 days (fixed interval). Strategy can also shift immediately when a major event occurs (approval crosses a threshold, stability crisis, election cycle begins).

**Strategy selection logic:**
- **Obstruct** when: player approval is moderate (40-60), opposition sees opportunity to stall the agenda and erode support
- **Negotiate** when: player approval is high (60+) and opposition can't win a confrontation — better to extract concessions
- **Attack** when: player approval is low (<40), stability is shaky, or an election cycle is approaching — go for the kill with no-confidence motions, impeachment noise, media offensives

The two opposition parties may coordinate (forming a united front) or compete with each other (splitting the opposition vote, which benefits the player). Their coordination depends on whether they share similar ideology profiles — ideologically distant opposition parties are harder to unite.

### 3.2 Opposition Actions

Each strategy produces concrete gameplay effects:

| Strategy | Actions | Player Impact |
|----------|---------|---------------|
| Obstruct | Boycott legislative sessions, filibuster bills, challenge quorum | Bill passage requires more whipping effort; some bills stall entirely |
| Negotiate | Propose amendments, demand appointments or budget allocation | Player gains votes but at a cost — concessions erode party control or federal character balance |
| Attack | Media campaigns, public rallies, no-confidence motions, impeachment threats | Approval drops, stability pressure, forces player to spend PC on defence |

### 3.3 Defection Mechanics

**Defection operates on aggregate blocs, not individual legislators.** The current codebase models legislators as aggregate bloc seat counts (Core Ruling Party 145, Ruling Allies 56, etc.), not individual character records. Defection works probabilistically against these aggregates: when conditions trigger a defection event, a number of seats shift between party blocs. The `AtRiskEntry` in the data model represents a simulated "at risk" bloc segment (e.g., "12 ruling party legislators from NE zone at risk"), not individual character records. Governors, who do have individual `GovernorState` records, are tracked individually for defection.

**Governor party migration:** The existing `GovernorState.party` uses `"Ruling" | "Opposition" | "Independent"`. This will be extended to store the actual party ID (e.g., "ADU", "PFC") so the defection system can track which specific party a governor moves between. The generic union type is replaced with `string` (party ID), and a helper function maps party IDs to the ruling/opposition/independent category for backward compatibility with existing code.

When party loyalty for a bloc segment drops below 40, those seats are flagged "at risk" — visible to the player in the legislature view.

**Triggers that convert risk into actual defection:**
- **Player poaching** (active) — spend 5-10 PC to recruit an at-risk opposition legislator. Success probability based on their party loyalty (lower = easier) and inducements offered
- **Godfather pull** — a godfather moves their people to another party as part of a deal or escalation
- **Party crisis** — a convention loss, leadership dispute, or major scandal triggers a wave of defections
- **Election cycle** — in the 12 months before elections, defection rates double as politicians position for survival
- **Opposition poaching** (passive threat) — opposition parties attempt to recruit at-risk ruling party members. The player's Party Chairman can counter this if their disposition is supportive

**Defection consequences:**
- Legislative seat counts shift immediately
- The defector's zone may react (approval shift if a popular figure defects)
- Mass defection (3+ in a short period) triggers a "party crisis" media event
- Godfathers connected to the defector may shift allegiance

---

## 4. Party Convention

### 4.1 Convention Timing

The ruling party convention fires in Year 3 (around day 730-760). Opposition party conventions happen within the same window but are **auto-resolved** — the player has no direct interaction with opposition conventions. Opposition NWCs are reshuffled based on internal party dynamics, and the player learns the results as a news event. This is a fixed calendar event, not triggered by conditions. The convention marks the unofficial start of the re-election cycle.

### 4.2 Pre-Convention Phase (30 days before)

A "Convention Approaching" event fires, starting the manoeuvring phase:

- The player sees the current NWC and challengers for each position. Each position may have 1-3 challengers depending on how contested it is. The chairman race is always contested.
- The player can **back candidates** for any position by spending political capital (3-8 PC per endorsement depending on position prestige). Backing a candidate increases their convention vote share.
- The player can **use intelligence/hooks** to undermine rival candidates (deploying hooks via the Intelligence system).
- **Godfathers** may push their own candidates — a godfather with a deal may demand the player back their person for chairman or treasurer.
- **Faction alignment** matters — each faction has preferred candidates. Backing a candidate from an aligned faction costs less PC; backing one opposed by a powerful faction risks grievance.

### 4.3 Convention Vote Resolution

Each NWC position is resolved as a weighted vote:

- **Player influence** (PC spent, endorsements): 30% weight
- **Faction support** (how aligned the candidate is with major factions): 25% weight
- **Godfather backing** (godfathers spending influence on their candidates): 20% weight
- **Incumbent advantage** (sitting NWC members get +15% if running for re-election): 15%
- **Candidate competence** (raw quality of the person): 10% weight

The player doesn't need to contest every position — strategic focus on chairman and treasurer (the two Strategic positions) may be enough. Spreading resources too thin across all 8 races dilutes impact.

### 4.4 Post-Convention Fallout

- **Clean sweep by player** (6+ positions won by player's candidates): Party Control Score jumps to 80+, but triggers "authoritarian party boss" media narrative. Opposition attacks intensify. Some losing candidates may defect.
- **Balanced outcome** (3-5 positions): Party stays united. Mixed NWC means some resistance on player's agenda but no crisis.
- **Player loses key positions** (chairman or treasurer goes to a hostile candidate): Party Control Score drops below 50. The new chairman may publicly distance from the player, refuse to endorse re-election, or impose conditions (policy concessions, appointment changes).
- **Convention disputed** (if the Legal Adviser position is held by a hostile NWC member): Losing candidates may challenge results, triggering a party crisis event that requires resolution.

---

## 5. Data Model

### 5.1 Party State

```typescript
interface PartyState {
  id: string;                            // matches party ID from parties.ts (e.g., "ADU", "PFC")
  name: string;
  abbreviation: string;
  nwc: NWCMember[];                      // 8 members
  legislativeSeats: { house: number; senate: number };
  isRulingParty: boolean;
  isMainOpposition: boolean;             // true for the 2 main opposition parties
  partyControlScore?: number;            // 0-100, ruling party only
  oppositionStrategy?: OppositionStrategy;  // main opposition parties only
  strategyReassessmentDay?: number;      // when strategy next shifts
}

type OppositionStrategy = "obstruct" | "negotiate" | "attack";

interface NWCMember {
  characterId: string;
  name: string;
  position: NWCPosition;
  zone: string;
  state: string;
  competence: number;
  loyalty: number;                     // to player (ruling) or to party leader (opposition)
  disposition: "supportive" | "neutral" | "hostile";  // toward the president
  factionAlignment?: string;           // faction ID if aligned
  godfatherId?: string;               // if placed by a godfather
}

type NWCPosition =
  | "national-chairman"
  | "vice-chairman"
  | "national-secretary"
  | "national-treasurer"
  | "publicity-secretary"
  | "organising-secretary"
  | "legal-adviser"
  | "youth-women-leader";
```

### 5.2 Defection State

```typescript
interface DefectionState {
  atRiskLegislators: AtRiskEntry[];    // legislators with party loyalty < 40
  recentDefections: Defection[];       // last 90 days, for crisis tracking
  poachingCooldown: Record<string, number>;  // characterId → day cooldown expires
}

interface AtRiskEntry {
  id: string;                          // unique identifier for this at-risk segment
  currentParty: string;                // party ID
  zone: string;                        // geopolitical zone of the at-risk bloc
  seatCount: number;                   // number of seats at risk in this segment
  seatType: "house" | "senate";
  partyLoyalty: number;                // 0-100, below 40 = at risk
  defectionProbability: number;        // calculated from loyalty + triggers
}

interface Defection {
  id: string;
  fromParty: string;                   // party ID
  toParty: string;                     // party ID
  day: number;
  trigger: "player-poaching" | "godfather-pull" | "party-crisis" | "election-cycle" | "opposition-poaching";
  zone: string;
  seatType: "house" | "senate" | "governor";
  seatCount: number;                   // number of seats shifted (1 for governors, 1+ for legislators)
  governorId?: string;                 // GovernorState ID, only for governor defections
  description: string;                 // human-readable summary for event log
}
```

### 5.3 Convention State

```typescript
interface ConventionState {
  phase: "inactive" | "pre-convention" | "voting" | "post-convention";
  conventionDay: number;               // scheduled day (Year 3)
  races: ConventionRace[];             // one per NWC position
  playerPCSpent: number;               // total PC invested in convention
}

interface ConventionRace {
  position: NWCPosition;
  incumbent: string;                   // character ID
  challengers: ConventionCandidate[];
  playerBacked?: string;               // character ID the player endorsed
  winner?: string;                     // resolved after vote
}

interface ConventionCandidate {
  characterId: string;
  name: string;
  zone: string;
  competence: number;
  factionSupport: number;              // 0-100
  godfatherBacking?: string;           // godfather ID if backed
  playerEndorsed: boolean;
  voteShare?: number;                  // calculated during resolution
}
```

### 5.4 Overall Party Internals State

```typescript
interface PartyInternalsState {
  parties: PartyState[];               // all 8 parties
  rulingPartyId: string;
  mainOppositionIds: string[];         // 2 party IDs
  defections: DefectionState;
  convention: ConventionState;
  partyLoyaltyDrift: number;           // per-turn drift modifier from events/actions
}
```

### 5.5 Relationship to Existing Data Structures

**Legislative seats:** The existing codebase has two seat representations: `legislatureSeats` (ruling/opposition/independent totals) and `whipTracker` (5 named blocs with seat counts and loyalty). `PartyState.legislativeSeats` becomes the **source of truth** for per-party seat counts. The existing `whipTracker` blocs are derived from party data: "Core Ruling Party" = ruling party seats, "Ruling Allies" = sum of allied minor party seats, "Main Opposition" = sum of main opposition party seats, etc. When defections shift `PartyState.legislativeSeats`, the whipTracker blocs are recalculated. The existing `legislatureSeats` aggregate is also recalculated from party totals.

**partyLoyalty:** The existing `GameState.partyLoyalty` (0-100) represents the general party base's loyalty to the player. The new `PartyState.partyControlScore` (0-100) represents NWC-level control — how much the party leadership backs the player. These are **distinct concepts**: a player can have high base party loyalty (the rank-and-file love them) but low party control (the NWC executives are hostile). Both matter: `partyLoyalty` affects legislator voting behaviour and grassroots support; `partyControlScore` affects discipline enforcement, convention outcomes, and re-election endorsement. The existing `partyLoyalty` field is preserved and continues to function as before.

---

## 6. Files & Integration Points

### New Files
- `client/src/lib/partyEngine.ts` — party control score calculation, opposition strategy selection, defection risk assessment, defection resolution, convention vote resolution, NWC disposition drift
- `client/src/lib/partyEngine.test.ts` — unit tests
- `client/src/lib/partyTypes.ts` — TypeScript interfaces (PartyState, NWCMember, DefectionState, ConventionState, PartyInternalsState)
- `client/src/lib/partyProfiles.ts` — pre-populated NWC members for all 8 parties (~64 handcrafted characters: 8 per party), convention challenger pools (~3-4 challengers per contested position for ruling party convention)

### Modified Files
- `client/src/lib/gameTypes.ts` — add `PartyInternalsState` to `GameState`. Existing saves default to an initial state on load.
- `client/src/lib/GameContext.tsx` — initialize party internals state at game start, populate all 8 party NWCs, designate 2 main opposition parties based on seat counts
- `client/src/lib/gameEngine.ts` — each turn: drift NWC member dispositions, reassess opposition strategy on schedule, check defection risk for at-risk legislators, process opposition actions (obstruct/negotiate/attack effects on bills, approval, stability), advance convention phases when calendar triggers
- `client/src/lib/parties.ts` — existing party definitions remain; party internals system reads ideology profiles and vote shares from here
- `client/src/components/PoliticsTab.tsx` — PoliticsTab currently shows governor management, faction overview, and political metrics. Add a new party panel section (not replacing existing content): ruling party NWC roster with disposition indicators, Party Control Score gauge, opposition party strategy display (current strategy + leader info), at-risk legislator/bloc warnings, and convention countdown with manoeuvring UI during pre-convention phase. If the party section grows too large, extract to a dedicated `PartyPanel.tsx` component.
- `client/src/lib/gameTypes.ts` — extend `GovernorState.party` from `"Ruling" | "Opposition" | "Independent"` to `string` (party ID). Add helper function `getPartyCategory(partyId: string): "Ruling" | "Opposition" | "Independent"` for backward compatibility.
- `client/src/components/LegislatureTab.tsx` — defection risk indicators on individual legislators, party affiliation changes reflected in seat counts and bloc displays

### Integration with Other Sub-Projects
- **Legislative Engine (A):** Opposition strategy directly affects bill passage — obstruct reduces available votes, negotiate adds conditional votes, attack creates hostile legislative environment. Defections shift bloc seat counts mid-term.
- **Godfather System (B):** Godfathers push NWC candidates during conventions. Godfather-linked legislators may defect when their godfather switches allegiance. Party Boss archetype godfathers have direct influence on NWC composition.
- **Federal Character (C):** NWC zonal composition is tracked by federal character system. Convention outcomes affect zonal balance in party leadership.
- **Intelligence (D):** Opposition research reveals opposition party strategy and NWC internal dynamics. Counter-intelligence detects NWC members working against the player. Hooks can be deployed against hostile NWC members or used to influence convention outcomes.
- **Economic Crisis (F):** Economic crises accelerate party loyalty drift and increase defection risk. Opposition parties shift to "attack" strategy during economic downturns.
