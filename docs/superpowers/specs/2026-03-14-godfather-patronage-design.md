# Godfather & Patronage System — Design Spec

**Sub-Project B** of the Aso Rock game feature roadmap (A through F).

**Goal:** Transform the existing static power broker display into a fully simulated godfather ecosystem where 20-25 godfathers operate autonomously, the player engages them through deals to solve problems, and the accumulation of patronage debt creates an escalating puppet-vs-independence tension across the presidential term.

---

## 1. Core Architecture

The Godfather & Patronage System has three layers:

### 1.1 Background Simulation

20-25 godfathers operate autonomously each turn. They manage their stables, pursue their interests, lobby on bills, and shift their disposition toward the player based on whether they're being served or ignored. Most of this runs silently — the player only sees effects (a governor turning hostile, a media narrative shifting, a legislative bloc swinging unexpectedly).

### 1.2 Approach & Deal Layer

When the player needs help (or when an aggressive godfather sees an opportunity), deals are proposed. The Political Adviser surfaces opportunities: "Alhaji Gambo could deliver those NW votes." The player initiates contact, negotiates, and accepts or rejects. Deals are either explicit contracts (business types) or favour-bank IOUs (political types). Each deal has visible costs and hidden systemic costs.

### 1.3 Retaliation & Escalation Layer

When deals are broken or godfathers are defied, a 4-stage escalation ladder fires: Reminder → Withdrawal → Active Opposition → Nuclear Option. Speed depends on godfather aggression trait. The player can neutralize godfathers through intelligence hooks or by leveraging high approval + political capital, but failure accelerates escalation to nuclear.

The player starts independent. Godfather entanglement is always a choice — but the game creates constant pressure to make that choice.

---

## 2. Godfather Profiles

### 2.1 Pool & Archetypes

20-25 godfathers spread across 7 archetypes and 6 geopolitical zones:

| Archetype | Count | Coverage |
|-----------|-------|----------|
| Business Oligarch | 4-5 | Oil, banking, manufacturing, telecoms, construction |
| Military/Security Elder | 2-3 | Retired generals, ex-heads of state |
| Party Machine Boss | 3-4 | National and zonal party kingmakers |
| Labour/Civil Society | 2 | NLC/TUC, activist networks |
| Religious Leader | 3-4 | Christian and Muslim across zones |
| Regional Strongman | 3-4 | Zonal "owners" with governor stables |
| Media Mogul | 2-3 | Print/TV empires, digital media |

Each zone has 3-4 godfathers present, ensuring the player always has options regardless of their political geography.

### 2.2 Godfather Attributes

Each godfather has:

- **Identity** — Name, archetype, zone, backstory
- **Traits** — Four personality dimensions that drive behaviour:

| Trait | Low | High |
|-------|-----|------|
| Aggression (0-100) | Waits to be approached, patient | Approaches player early, escalates demands quickly |
| Loyalty (0-100) | Transactional — will back opposition if neglected | Prefers to work with power, more forgiving |
| Greed (0-100) | Modest demands, accepts symbolic wins | Expensive — every favour costs real policy or money |
| Visibility (0-100) | Operates quietly, rarely in the news | Public-facing, uses media pressure as leverage |

- **Disposition** — Toward the player: Friendly → Neutral → Cold → Hostile. Starts at Neutral for most; a few may start Friendly or Cold based on zone/party alignment.
- **Deal style** — Contract (explicit, timed demands) or Favour Bank (informal IOUs, cashed in later at godfather's discretion).
- **Interests** — 2-3 policy areas or economic sectors they care about. Bills and policy changes in these areas draw their attention.
- **Influence score** — 0-100, determines the size of their stable and the difficulty of neutralizing them.

---

## 3. The Stable System

Each godfather's value comes from who they control. The stable maps to existing game entities:

### 3.1 Stable Components

**Governor connections** — A godfather "owns" 1-3 governors they helped elect. When the player needs a governor's cooperation (regional support, policy endorsement, quelling local unrest), going through their godfather is faster and more reliable than direct engagement. If the player deals with the godfather, their governors become cooperative. If the godfather turns hostile, their governors become unresponsive or obstructive.

**Legislative blocs** — A godfather controls a voting bloc, sized by their influence: 5-20 House members, 2-8 senators. These aren't individually tracked — they're a modifier on the Legislative Engine's vote calculation. When the player deals with a godfather, their bloc shifts toward the player's position on relevant bills.

**Cabinet-eligible candidates** — A godfather has 1-2 protégés eligible for cabinet or board appointments. These are real characters with competence, loyalty, and other stats. Appointing a godfather's qualified candidate satisfies the deal without inherent quality penalty — the cost is that the person's primary loyalty runs to the godfather, not the player. They might leak cabinet deliberations, drag their feet on policies the godfather opposes, or resign dramatically if the player crosses the godfather. Only when the candidate is genuinely underqualified does a competence penalty apply. The real cost of any godfather appointment is opportunity cost — the player uses a slot to service a debt rather than build their own team.

**Media influence** (Media Mogul archetype) — Controls editorial direction of their outlets. Can provide positive coverage (approval boost), kill negative stories (scandal suppression), or run hostile campaigns (approval damage, outrage spikes).

**Economic levers** (Business Oligarch archetype) — Controls capital flows in their sector. Can provide campaign funding, investment signals (economic indicators improve), or capital flight (economic damage).

**Street power** (Labour/Religious archetypes) — Can mobilize or demobilize protests, strikes, and mass gatherings. Call off a strike or trigger one.

### 3.2 Visibility Model

The player starts seeing ~60% of each godfather's stable — the public knowledge connections that any Political Adviser would know. The remaining ~40% (hidden legislative bloc members, secret business interests, covert governor relationships) are revealed through:

- **Intelligence work** (Sub-Project D integration) — Directed investigation uncovers hidden connections.
- **Events** — Story moments reveal connections: "Sir, it appears Governor Adamu's sudden opposition to the petroleum bill traces back to Alhaji Gambo."
- **Deal experience** — Working with a godfather over time reveals more of their network.

---

## 4. Deal Mechanics

### 4.1 How Deals Start

**Player-initiated:** The player encounters a problem — a bill failing, a faction revolting, an election approaching. The Political Adviser surfaces the option: "Alhaji Gambo controls 12 House members from the NW. He could swing the vote. Want me to reach out?" The player sees the godfather's profile, visible stable, and deal style before committing.

**Godfather-initiated:** Inbox message from the godfather or an intermediary. "Chief Mbah requests a meeting. He says he can resolve the party discipline crisis — but he wants to discuss the Anambra highway contract." Frequency scales with the godfather's aggression trait and current trigger windows (see Section 6).

### 4.2 Two Deal Styles

**Contract deals** (Business Oligarchs, some Regional Strongmen):
- Explicit exchange: "I deliver X, you deliver Y by day Z."
- Timed — a countdown visible to the player. Miss the deadline and escalation begins.
- Clear terms the player can evaluate before accepting.
- Example: "I'll fund ₦15B for party operations this quarter. Award the coastal highway contract to my consortium within 45 days."

**Favour Bank deals** (Military Elders, Party Bosses, Religious Leaders, some Media Moguls):
- Informal: "I'll help you with this. We're friends, aren't we?"
- No explicit terms. The godfather delivers, and the player accrues a favour debt — a hidden counter.
- The godfather cashes in later, at their choosing, and what they ask may be disproportionate to what they gave.
- The player can refuse the cash-in, but that triggers escalation — and it feels worse because "you owe me."
- Example: The ex-General quietly calms the security establishment during a crisis. Three months later: "My nephew is qualified for the Defence Ministry. I trust you'll do the right thing."

### 4.3 Deal Limits

A player can have active deals with up to 6 godfathers simultaneously. Beyond that, the web of obligations becomes unmanageable — conflicting demands start appearing (two godfathers want the same contract, or one wants a bill the other opposes). Conflicting godfather interests create forced choices that damage at least one relationship.

### 4.4 What Deals Cost

**Visible costs** (the explicit deal terms):
- Appointments — giving a ministry or board seat to a godfather's person
- Contracts — directing federal spending to their interests (budget impact, potential scandal)
- Policy favours — supporting/blocking specific bills (may conflict with player's agenda)
- Campaign funding acceptance — money that comes with strings

**Hidden systemic costs:**
- **Patronage index rises** — Every deal contributes to a hidden patronage pressure score. See Section 5.3.
- **Leverage inversion** — The more deals with a godfather, the more leverage they have. They know where the bodies are buried. Neutralization becomes harder.
- **Faction trust erosion** — Factions not connected to the player's godfathers feel sidelined.

---

## 5. Consequences & Escalation

### 5.1 The Four-Stage Escalation Ladder

**Stage 0 — No conflict.** Normal operating state. The godfather is satisfied or hasn't been provoked.

**Stage 1 — Reminder.** Inbox message from the godfather or intermediary. Tone depends on personality — polite nudge from a loyal type, thinly veiled threat from an aggressive one. No gameplay effect yet. The player gets 1-3 reminders before escalation, spaced by aggression (high aggression = fewer reminders, faster escalation).

**Stage 2 — Withdrawal.** The godfather pulls their support. Their stable goes passive — governors stop cooperating, legislative bloc abstains or votes independently, media turns neutral-to-cold. The player loses whatever benefit they were getting. Reversible — a new deal or honouring the old one restores the relationship.

**Stage 3 — Active Opposition.** The godfather weaponizes their stable. Governors publicly criticize the player, legislative blocs vote against, media runs negative stories, business interests slow investment. The godfather may approach opposition figures with offers. Reversible, but expensive — requires a significant concession to pull them back.

**Stage 4 — Nuclear Option.** Archetype-specific crisis event:
- Business Oligarch → Capital flight, economic indicators drop, funds opposition campaign
- Military Elder → Security establishment unrest, quiet coup signals
- Party Boss → Party leadership challenge, blocks re-election machinery
- Labour → General strike, economic paralysis
- Religious Leader → Mass mobilization, public condemnation, community unrest
- Regional Strongman → Governors threaten non-cooperation, zonal crisis
- Media Mogul → Sustained scandal campaign, leaked documents, fabricated exposés

Nuclear events are rendered as crisis events (same system as Legislative Engine crises). Irreversible — the relationship is permanently hostile after this.

Escalation speed: High aggression godfathers move from Stage 1 to 4 in 30-45 days. Low aggression godfathers take 60-90 days. The nuclear threshold is modulated by greed and loyalty — greedy + disloyal godfathers go nuclear over smaller slights.

### 5.2 Neutralization

The player can permanently neutralize a godfather through three paths:

**Intelligence route** — Using hooks or investigation results (Sub-Project D) to expose corruption, tax evasion, or criminal activity. Requires specific evidence. If successful, the godfather's influence collapses — stable members distance themselves, public influence drops. If the evidence is weak or the attempt is botched, the godfather goes straight to Stage 4.

**Political power route** — When the player has high approval (65+) and sufficient political capital, they can move against a godfather publicly: anti-corruption probe, regulatory action against their business, or party restructuring that sidelines them. This is a visible confrontation that plays out over several turns. Success depends on approval holding steady during the fight — the godfather will hit back.

**Godfather-vs-godfather route** — The player uses one godfather to neutralize another. See Section 6.2.

All routes carry risk proportional to the godfather's influence score. Neutralizing a 90-influence oligarch is a major campaign; removing a 50-influence regional figure is manageable.

### 5.3 The Patronage Index

Every active godfather deal contributes to a hidden patronage index (0-100). Effects escalate across four tiers:

| Tier | Range | Effects |
|------|-------|---------|
| Clean | 0-20 | No penalties. Player is seen as independent. |
| Pragmatic | 21-45 | Mild media scrutiny. Reform factions notice. Minor approval ceiling reduction (~5%). |
| Compromised | 46-70 | Regular scandal risk. Reform factions lose trust. Approval ceiling drops to ~60%. Neutralizing godfathers becomes harder (they have leverage). |
| Captured | 71-100 | Sustained media attacks. Faction grievance spikes. Approval ceiling ~50%. Re-election narrative shifts to "puppet president." Godfathers dictate terms. |

A player who avoids godfathers entirely has no patronage penalty but faces a harder game. A player who uses them strategically keeps the index manageable. A player who relies on them heavily wins battles but loses the war.

---

## 6. Trigger Windows & Advanced Mechanics

### 6.1 Activity Spikes

Godfathers aren't equally active year-round. Their approach frequency and deal urgency scale up during specific windows:

**Election approach (18 months out):** Campaign funding offers surge. "₦5B for your war chest — let's talk about what happens after you win." Business Oligarchs and Party Bosses are most active. The player needs money and machinery; godfathers know it.

**Budget season:** Every annual budget cycle creates a feeding frenzy. "Insert this project in my region and I'll deliver the NE senators for passage." Regional Strongmen and Business Oligarchs push hardest. Integrates directly with the Legislative Engine's budget crisis events.

**Impeachment/no-confidence threats:** When the player faces institutional danger, godfathers appear as saviours. "I can kill this motion — my 15 House members will walk out and deny quorum." The price is steep because the player is desperate. Labour and Party Boss types dominate.

**Low approval / low stability:** When the player is weakened (approval below 35, stability below 30), godfathers smell blood. Some offer lifelines — "2-3 deals and you survive." Others extract maximum concessions. High-aggression godfathers escalate demands on existing deals.

**Post-crisis vulnerability:** After a major crisis (security incident, economic shock, faction revolt), godfathers who helped resolve it immediately push for payback, while those who didn't offer retroactive help at inflated prices.

The base approach frequency from the aggression trait gets multiplied during these windows — a normally patient godfather might make their first approach during budget season, while an aggressive one who was already circling becomes relentless.

### 6.2 Godfather vs. Godfather

The player can use one godfather to neutralize another:

**Direct commission:** The player asks Godfather A to move against Godfather B. This requires an existing relationship with A and costs a significant favour/contract. A uses their stable to undermine B — media exposés, governor defections, legislative bloc poaching.

**Engineered conflict:** The player creates conditions where two godfathers' interests clash. Award a contract that both want to just one. Support a bill that helps one's sector and hurts another's. Let them fight, then pick up the pieces.

**Proxy war consequences:** When godfathers fight each other, there's collateral damage — the player's legislative coalitions fracture, regional stability drops, media becomes chaotic. It's effective but messy.

**The winner gets stronger:** A godfather who successfully neutralizes a rival absorbs some of their stable — governors, blocs, business interests shift to the victor. The player has solved one problem but made the remaining godfather more powerful and harder to control.

This creates a strategic layer: maintain a balance of power among godfathers, or consolidate around one powerful patron and hope you can control them.

---

## 7. Data Model

### 7.1 Godfather Interface

```typescript
interface Godfather {
  id: string;
  name: string;
  archetype: GodfatherArchetype;
  zone: string;
  description: string;
  traits: GodfatherTraits;
  disposition: "friendly" | "neutral" | "cold" | "hostile";
  dealStyle: "contract" | "favour-bank";
  interests: string[];  // policy areas / economic sectors they care about
  stable: GodfatherStable;
  escalationStage: 0 | 1 | 2 | 3 | 4;  // 0 = no conflict
  favourDebt: number;  // for favour-bank types, how much the player owes
  activeContracts: GodfatherContract[];  // for contract types
  neutralized: boolean;
  influenceScore: number;  // 0-100, determines stable size and neutralization difficulty
}

type GodfatherArchetype =
  | "business-oligarch"
  | "military-elder"
  | "party-boss"
  | "labour-civil"
  | "religious-leader"
  | "regional-strongman"
  | "media-mogul";

interface GodfatherTraits {
  aggression: number;   // 0-100: how fast they approach and escalate
  loyalty: number;      // 0-100: tolerance before defecting to opposition
  greed: number;        // 0-100: how expensive their demands are
  visibility: number;   // 0-100: public-facing vs behind-the-scenes
}
```

### 7.2 Stable Interface

```typescript
interface GodfatherStable {
  governors: string[];          // governor IDs they influence
  legislativeBloc: {
    house: number;              // vote count they control in House
    senate: number;             // vote count they control in Senate
  };
  cabinetCandidates: string[];  // character IDs of their protégés
  connections: GodfatherConnection[];  // ~60% start with revealed=true, rest discovered over time
}

interface GodfatherConnection {
  entityType: "governor" | "legislator-bloc" | "cabinet" | "media" | "business" | "street";
  entityId?: string;            // for governors, characters
  description: string;          // human-readable: "Controls Channels TV editorial"
  effect: GameStateModifier[];  // what this connection can do when activated
  revealed: boolean;            // false = hidden, discovered through intelligence/events/deals
}
```

### 7.3 Deal Interfaces

```typescript
interface GodfatherContract {
  id: string;
  description: string;          // "Award coastal highway contract to Gambo Consortium"
  deliveredByGodfather: boolean; // has the godfather fulfilled their side
  deadlineDay: number;          // when the player must deliver
  playerDelivered: boolean;
  consequence: GameStateModifier[];  // what happens if player fails to deliver
}

interface GodfatherDeal {
  godfatherId: string;
  type: "contract" | "favour";
  godfatherOffers: string;      // what the godfather will do
  playerOwes: string;           // what the player must do (vague for favours)
  estimatedCost: LeverCost[];   // reuses LeverCost from Legislative Engine spec (Sub-Project A)
  estimatedBenefit: string;     // what the player gets
}
```

### 7.4 Patronage State (added to GameState)

```typescript
interface PatronageState {
  godfathers: Godfather[];
  patronageIndex: number;       // 0-100, accumulated corruption pressure
  activeDeals: number;          // count of current godfather entanglements
  neutralizedGodfathers: string[];  // IDs of permanently removed godfathers
  approachCooldowns: Record<string, number>;  // godfather ID → next eligible approach day (base: 14 days between approaches, halved during trigger windows)
}
```

### 7.5 GameStateModifier

Reuses the same `GameStateModifier` interface defined in the Legislative Engine spec (Sub-Project A). Targets: approval, stability, politicalCapital, partyLoyalty, factionGrievance, macroEconomy, outrage, trust.

---

## 8. Files & Integration Points

### New Files
- `client/src/lib/godfatherEngine.ts` — core simulation (background tick, approach logic, escalation, neutralization)
- `client/src/lib/godfatherEngine.test.ts` — unit tests
- `client/src/lib/godfatherProfiles.ts` — 20-25 handcrafted godfather definitions with traits, stables, and backstories (not procedurally generated — each has a unique identity and role in the political ecosystem)
- `client/src/lib/godfatherTypes.ts` — TypeScript interfaces (Godfather, GodfatherStable, GodfatherContract, etc.)
- `client/src/lib/godfatherDeals.ts` — deal generation, contract tracking, favour-bank accounting

### Modified Files
- `client/src/lib/gameTypes.ts` — add `PatronageState` to `GameState`
- `client/src/lib/GameContext.tsx` — initialize patronage state, call godfather simulation each turn
- `client/src/lib/gameEngine.ts` — integrate godfather turn processing into `processTurn()`
- `client/src/components/PoliticsTab.tsx` — rewrite power broker section to show godfather profiles, stables, active deals, and escalation status
- `client/src/lib/gameData.ts` — remove static `powerBrokers` array (replaced by simulation)
- `client/src/lib/gameContent.ts` — add godfather approach messages, deal templates, escalation warnings

### Integration with Other Sub-Projects
- **Legislative Engine (A):** Godfather legislative blocs feed into vote calculation as a modifier layer. Budget season triggers godfather activity spikes. The `powerBrokerTag` field on Bill is wired to godfather interests.
- **Federal Character (C):** Godfather appointment demands interact with zonal balancing requirements.
- **Intelligence (D):** Hidden stable connections revealed through intelligence work. Hooks enable neutralization route.
- **Party Internals (E):** Party Boss godfathers directly affect party discipline scores and re-election machinery.
- **Economic Crisis (F):** Business Oligarch godfathers can trigger or cushion economic shocks. Capital flight is a nuclear option.
