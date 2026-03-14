# Legislative Engine — Design Spec

**Sub-Project A** of the Aso Rock game feature roadmap (A through F).

**Goal:** Transform the Legislature tab from a static display into a fully simulated bicameral legislative system where bills progress through both chambers, the player influences outcomes through strategic levers, and legislative crises create high-stakes decision points throughout the presidential term.

---

## 1. Core Architecture

The Legislative Engine has three layers:

### 1.1 Background Simulation

Bills progress through stages automatically over game days. The simulation runs every turn, advancing bills based on sponsorship strength, committee alignment, and political climate. Most bills resolve without player input. Results feed into the Political Adviser's briefings.

### 1.2 Adviser Briefing Layer

The Political Adviser (an existing appointment position) delivers legislative updates as inbox messages and daily brief items. This is the player's primary interface with the legislature during normal operations. The Adviser is the hands-on negotiator operating on the player's behalf — the player gives strategic direction, the Adviser executes.

### 1.3 Crisis Mode

When a bill hits a crisis trigger, the game escalates: a dedicated legislative crisis event appears with vote counts, faction breakdowns, and influence levers available as choices. This is where the player gets hands-on, spending resources and making trade-offs to secure or block passage. Crises occur 6-7 times per term.

---

## 2. Bicameral Bill System

### 2.1 Bill Structure

Each bill has:
- **Subject tag** — economy, security, governance, social, constitutional (determines which factions care)
- **Sponsor** — executive (player-proposed), ruling party backbench, opposition, or cross-party
- **House track** — Introduction → Committee → Floor Debate → Vote
- **Senate track** — Introduction → Committee → Floor Debate → Vote
- **After both pass** — Presidential Desk (21-day signing window)
- **Support/Opposition counts** — tracked separately per chamber, derived from bloc loyalty + faction modifiers
- **Stakes** — routine, significant, critical (determines whether it triggers crisis mode)
- **Effects** — what happens to game state if it passes or fails (approval, faction grievance, economic indicators, etc.)

### 2.2 Bill Generation

**Executive bills:** Player proposes from a contextual menu. Sources include campaign promises needing legislation, policy lever changes requiring enabling law, and event responses. ~2-3 available at any time.

**Autonomous bills:** The legislature generates 1-2 per month based on: faction grievance (high grievance → faction sponsors a bill addressing their complaint), economic conditions (recession → austerity/stimulus bills), political climate (election year → electoral reform), and random social issues from a curated pool.

**Crisis bills seeded per term:** Budget (annual, always crisis-level — 4 per term), electoral reform (year 3, pre-election), and 1-2 social/cultural flashpoints are seeded into the calendar at game start with some randomisation on timing and specific topic. Total: 6-7 crises per term.

### 2.3 Bill Progression

Both chambers process simultaneously but at different speeds:

- **Introduction:** 2-3 days
- **Committee:** 5-10 days (can stall here indefinitely if committee chair is hostile)
- **Floor Debate:** 3-5 days (opposition tactics can extend this)
- **Vote:** resolves in 1 day

Bills that stall for too long die. The player can spend political capital to unstall a bill or let it die quietly.

### 2.4 Bicameral Dynamics

The House (360 members) is larger and more volatile — party discipline is weaker, regional blocs matter more. The Senate (109 members) is smaller, more personality-driven — individual senators carry more weight, and the Senate President's alignment matters enormously (leveraging the constitutional officer selection system).

**Split outcomes create pressure:**
- Bill passes House easily but stalls in Senate → player must decide whether to spend capital whipping the Senate
- Bill fails House but passes Senate → player can try to revive or let it die
- Both chambers pass different versions → reconciliation needed (political capital cost + delay)
- Player's own bill passes with unwanted amendments → sign a diluted version or veto?

### 2.5 Veto Process

- **Signing:** free, effects apply immediately
- **Veto:** costs political capital (scaled to bill stakes — routine veto is cheap, vetoing a popular bill is expensive). Bill dies unless the legislature musters ⅔ override in both chambers.
- **Override probability:** influenced by approval rating — low approval makes overrides more likely
- **Pocket strategy:** the 21-day window lets the player delay. The Political Adviser warns if override momentum is building.

---

## 3. Vote Simulation

Votes are calculated in three layers for each chamber independently:

### 3.1 Layer 1 — Bloc Baseline

Each of the 5 blocs starts with a base vote from party discipline:

| Bloc | House | Senate | Default Lean | Defection Sensitivity |
|------|-------|--------|--------------|-----------------------|
| Core Ruling Party | 145 | 56 | With president | Party loyalty score |
| Ruling Allies | 56 | 22 | Loosely aligned | Patronage, higher defection |
| Main Opposition | 120 | 22 | Against president | Cross-cutting issues only |
| Opposition Moderates | 34 | 7 | Swing | Persuadable on most issues |
| Independents | 5 | 2 | Unpredictable | Constituency interest |

### 3.2 Layer 2 — Faction Cross-Pressure

Each bill's subject tag is checked against faction priorities. Factions that care about the issue pull members toward or away from the party line:

- A security bill pulls Northern Caucus members toward support regardless of party
- An oil revenue bill pulls Niger Delta members based on whether it helps or hurts their interests
- A social/religious bill can split along Muslim/Christian lines across all parties

The faction modifier is proportional to: faction's stake in the issue × faction's current grievance level × number of legislators in that faction within each bloc.

### 3.3 Layer 3 — Player Influence

Seven levers modify the count, with different effectiveness per chamber:

| Lever | Cost | House Effect | Senate Effect |
|-------|------|-------------|---------------|
| Spend Political Capital | Political capital | Flat boost | Flat boost |
| Offer Concessions | Bill effects diluted | Moderate | Strong (smaller body, specific deals) |
| Promise Patronage | Future obligations | Strong (more members competing) | Moderate |
| Address Joint Session | Approval risk | Equal (scaled by approval) | Equal (scaled by approval) |
| Executive Pressure | Relationship damage | Strong on ruling blocs, backfire risk | Strong on ruling blocs, backfire risk |
| Back-Channel Deals | Links bills together | Unavailable | Senate-only (personal dealmaking) |
| Go Public | Approval dependent | Strong (constituency pressure) | Weak (senators less responsive) |

The player picks 1-3 levers per crisis, not all seven. Each has a cost, estimated vote swing, risk/side effects, and chamber targeting.

---

## 4. Crisis Mode

### 4.1 Triggers

A legislative crisis fires when:
- **Budget bill** reaches Floor Debate stage (annual, ~4 per term)
- **Player-championed bill** is projected to fail in either chamber
- **Constitutional amendment** reaches Floor Debate (requires ⅔ — always high stakes)
- **Electoral reform bill** in year 3 of the term
- **Social/cultural flashpoint** bill hits Floor Debate with tight margin (< 10 vote difference)
- **Opposition surprise motion** — impeachment, vote of no confidence, emergency debate (triggered by low approval or high outrage)
- **Veto override attempt** — legislature tries to overturn a presidential veto

### 4.2 Crisis Event Structure

Each crisis presents:
1. **Situation brief** from the Political Adviser — what the bill is, why it matters, current vote projection in both chambers, which factions are the swing
2. **Vote breakdown panel** — visual showing the 5 blocs in both chambers, color-coded by lean (firm yes / leaning yes / undecided / leaning no / firm no)
3. **Available levers** — the 7 influence tools with: cost, estimated vote swing, risk/side effects, chamber targeting. Some greyed out based on context.
4. **Player picks 1-3 levers**
5. **Resolution** — votes resolve, consequences apply, Adviser delivers post-mortem

### 4.3 Multi-Round Crises

Some crises escalate across rounds:

**Budget crisis (longest, 3-4 rounds):**
1. Budget introduced, initial vote projection. Player sets strategy.
2. Committee stage — opposition proposes amendments. Accept (easier passage, diluted) or fight?
3. Floor vote. Final lever choices.
4. (If needed) Passes one chamber but deadlocked in the other. One more round.
5. Presidential desk — sign or veto?

**Social flashpoint (2 rounds):**
1. Floor vote crisis — pick levers.
2. Presidential desk — sign or veto?

**Constitutional amendment (3 rounds):**
1. Floor debate — requires ⅔, nearly impossible without cross-party support.
2. House vote.
3. Senate vote. (Each chamber is its own round because ⅔ is hard to secure.)

---

## 5. The Political Adviser

### 5.1 Deliverables

- **Daily legislative briefing** — 1-2 lines in the Daily Brief: "3 bills in progress. Petroleum Amendment heading to Senate vote Thursday. No issues." or "WARNING: Budget at risk — Northern Caucus threatening walkout."
- **Weekly legislative summary** — Inbox message every 7 game days: bills that advanced, bills that stalled, upcoming votes, faction mood shifts, and a recommendation.
- **Crisis alerts** — Delivers the situation brief as the opening of crisis events.
- **Post-vote debrief** — After significant votes: what happened, who defected, political implications.

### 5.2 Competence-Gated Quality

The Adviser's competence stat (from the character system) affects report quality:
- **High competence (70+):** accurate vote predictions (±3 votes), good lever recommendations, early crisis warnings
- **Medium competence (40-69):** rougher predictions (±10 votes), generic advice
- **Low competence (< 40):** can miss crises until late, predictions off by ±20, sometimes recommends the wrong lever

This creates genuine gameplay incentive to appoint a strong Political Adviser over a patronage pick.

---

## 6. Consequences & Integration

### 6.1 Bill Effects on Game State

- **Economic bills** (budget, petroleum, tax reform): modify macro indicators. A failed budget triggers austerity defaults — automatic spending cuts that hurt approval and faction relationships.
- **Security bills** (police reform, anti-terrorism): affect stability, security event frequency, Northern/NE faction satisfaction.
- **Governance bills** (electoral reform, constitutional amendments): change structural rules — electoral reform affects re-election dynamics.
- **Social bills** (anti-grazing, religious issues, social media): big approval swings along regional/religious lines. Net effect depends on coalition composition.

### 6.2 Ripple Effects Into Other Systems

- **Faction grievance** — Bills that hurt a faction's interests increase grievance. A faction that loses 3 bills in a row becomes hostile.
- **Party loyalty** — Vetoing your own party's bill costs loyalty. Passing opposition bills costs loyalty. Excessive Executive Pressure erodes internal trust.
- **Power brokers** (Sub-Project B) — Godfathers care about specific bills. Passing or blocking their priority legislation affects disposition.
- **Campaign promises** — Promises requiring legislation ("Reform the petroleum sector") track against actual legislative outcomes.
- **Approval** — Major bill outcomes shift approval along regional/religious/economic lines.

### 6.3 Uncontrollable Outcomes

- **Opposition victories** — Sometimes opposition bills pass despite the player's efforts. The legislature is not a rubber stamp.
- **Riders and amendments** — Bills can pass with provisions the player didn't want. Budget with an attached ₦200B Niger Delta clause.
- **Delayed consequences** — Popular spending bills trigger inflation 30-60 days later. Regulation bills cause investment flight.

---

## 7. Data Model

### 7.1 Bill Interface

```typescript
interface Bill {
  id: string;
  title: string;
  description: string;
  subjectTag: "economy" | "security" | "governance" | "social" | "constitutional";
  sponsor: "executive" | "ruling-backbench" | "opposition" | "cross-party";
  stakes: "routine" | "significant" | "critical";
  houseStage: BillStage;
  senateStage: BillStage;
  houseSupport: VoteProjection;
  senateSupport: VoteProjection;
  introducedOnDay: number;
  signingDeadlineDay: number | null; // set when both chambers pass
  effects: BillEffects;
  amendments: Amendment[];
  isCrisis: boolean;
}

type BillStage = "introduction" | "committee" | "floor-debate" | "vote" | "passed" | "failed" | "stalled" | "vetoed" | "signed";

interface VoteProjection {
  firmYes: number;
  leaningYes: number;
  undecided: number;
  leaningNo: number;
  firmNo: number;
}

interface BillEffects {
  onPass: GameStateModifier[];
  onFail: GameStateModifier[];
}

interface GameStateModifier {
  target: string;   // e.g., "approval", "factionGrievance.northernCaucus", "macroEconomy.inflation"
  delta: number;
  delay?: number;   // game days before effect applies
}
```

### 7.2 Legislative State (added to GameState)

```typescript
interface LegislativeState {
  activeBills: Bill[];
  passedBills: Bill[];  // history for reference
  failedBills: Bill[];
  pendingSignature: Bill[];  // on presidential desk
  legislativeCalendar: ScheduledBill[];  // seeded crisis bills
  adviserAccuracy: number;  // derived from adviser competence
  sessionStats: {
    billsIntroduced: number;
    billsPassed: number;
    billsVetoed: number;
    overrideAttempts: number;
    overrideSuccesses: number;
  };
}

interface ScheduledBill {
  template: Partial<Bill>;
  targetDay: number;  // when it gets introduced
  isCrisis: boolean;
}
```

### 7.3 Influence Lever Interface

```typescript
interface InfluenceLever {
  id: string;
  name: string;
  description: string;
  cost: { type: "politicalCapital" | "approval" | "partyLoyalty" | "factionRelationship"; amount: number };
  houseSwing: number;  // estimated votes gained
  senateSwing: number;
  sideEffects: GameStateModifier[];
  available: (state: GameState, bill: Bill) => boolean;  // e.g., Back-Channel unavailable in House
}
```

---

## 8. Files & Integration Points

### New Files
- `client/src/lib/legislativeEngine.ts` — core simulation (bill progression, vote calculation, autonomous bill generation)
- `client/src/lib/legislativeEngine.test.ts` — unit tests
- `client/src/lib/legislativeBills.ts` — bill templates, crisis bill pool, scheduled bill seeding
- `client/src/lib/legislativeTypes.ts` — TypeScript interfaces (Bill, VoteProjection, LegislativeState, etc.)
- `client/src/lib/influenceLevers.ts` — the 7 lever definitions with cost/effect calculations

### Modified Files
- `client/src/lib/gameTypes.ts` — add `LegislativeState` to `GameState`
- `client/src/lib/GameContext.tsx` — initialize legislative state, call simulation each turn
- `client/src/lib/gameEngine.ts` — integrate legislative turn processing into `processTurn()`
- `client/src/components/LegislatureTab.tsx` — rewrite to show live bill tracking, vote projections, crisis events
- `client/src/lib/gameData.ts` — remove static `whipTracker` and `activeBills` (replaced by simulation)
- `client/src/lib/gameContent.ts` — add Adviser briefing templates

### Integration with Existing Systems
- **Faction drift** (`factionDrift.ts`) — bill outcomes feed into grievance calculation
- **Ideology pressure** (`ideologyPressure.ts`) — executive bills tagged with ideology impact
- **Event chains** (`eventChains.ts`) — legislative crises rendered as event chain instances
- **Constitutional officers** (`constitutionalOfficers.ts`) — Senate President alignment affects Senate vote dynamics
