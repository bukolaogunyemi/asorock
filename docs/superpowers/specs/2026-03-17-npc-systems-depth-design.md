# NPC Systems Depth — Design Spec

**Date:** 2026-03-17
**Status:** Draft
**Scope:** 5 interconnected enhancements to NPC character systems

## Overview

This spec covers 5 work items that deepen the NPC systems in the game. They are designed to be implemented in order, as each builds on the previous:

1. **Unified Dismissal Engine** — Player-initiated removal of appointed officials
2. **Godfather ↔ New Systems Bridge** — Godfathers exert pressure across diplomats, military, directors, traditional rulers, and religious leaders
3. **Traditional Ruler / Religious Leader Activation** — These 52 characters become active participants rather than background decoration
4. **Cabinet Appointment Engine Depth** — Minister competence mechanically affects governance sectors
5. **Inter-NPC Relationships** — Affinity tags and explicit links create a relationship mesh between characters

## Terminology

- **Presidential Aides** (Tier 1): 8 positions — Personal Assistant, Chief of Staff, SGF, NSA, CEA, Political Adviser, DNI, National Media Adviser
- **Cabinet Ministers** (Tier 2): 16 portfolios across 5 clusters
- **HC**: Hand-crafted (manually written character data)
- **Escalation stage**: Godfather pressure level 0-4

---

## 1. Unified Dismissal Engine

### New file: `dismissalEngine.ts`

### Core function

```typescript
type DismissableSystem = "minister" | "director" | "diplomat" | "military" | "aide";

interface DismissalResult {
  updatedState: Partial<GameState>;
  events: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
}

function processDismissal(
  state: GameState,
  systemType: DismissableSystem,
  positionId: string,
  reason?: string
): DismissalResult;
```

### What it does per dismissal

1. **Removes the character** from their position (sets appointment to null/vacant).
2. **Records vacancy:** Sets `vacantSinceDay: state.day` on the position.
3. **Generates consequences** scaled by position prestige:
   - Ministers: −3 approval, −2 stability
   - Directors: −1 approval
   - Diplomats: −2 approval (bilateral), −1 (minor)
   - Military: −4 approval, −3 stability
   - Aides: −2 approval
4. **Checks godfather interest:** If any godfather had an interest in this position (via `cabinetCandidates`, `militaryInterests`, `diplomaticInterests`, `directorInterests`), that godfather's escalation increases by 1 stage.
5. **Checks faction alignment:** The dismissed person's faction loses 5 relationship points with the player.
6. **Creates inbox message:** `"[Name] has been relieved of duties as [Position]"`
7. **Triggers existing vacancy escalation** for that system (diplomat 7-day inbox → 14-day decision; minister replacement appointment event; etc.).
8. **Marks character for lifecycle career mobility** (15% chance they resurface elsewhere).

### Player trigger mechanism

New reducer action: `DISMISS_OFFICIAL`

```typescript
{ type: "DISMISS_OFFICIAL"; systemType: DismissableSystem; positionId: string; reason?: string }
```

Dispatched from existing management views:
- Minister encounter screen: new "Relieve of Duties" button alongside commend/warn/probation
- Director management view: new dismiss option
- Diplomat/Military/Aide management views: same pattern

### Confirmation UI

Before executing, the UI shows a confirmation with projected consequences:

> "Dismissing Gen. Tsafe as Defence Minister will cost −3 approval, −2 stability. The Northern Caucus faction will react negatively. Alhaji Dantata (godfather) has interests in this portfolio and may escalate."

The confirmation lists:
- Approval and stability cost
- Affected faction(s)
- Any godfather(s) with interest in this position
- Whether a replacement pool exists or is exhausted

### System-specific data paths

| System type | Read from | Write vacancy to |
|---|---|---|
| `"minister"` | `state.cabinetAppointments[portfolioKey]` + `state.characters[name]` | Set `cabinetAppointments[key] = null`, remove from `characters` |
| `"director"` | `state.directors.appointments[positionId]` | Set `appointments[positionId].characterName = null`, set `vacantSinceDay` |
| `"diplomat"` | `state.diplomats.appointments[postId]` | Set `appointments[postId].characterName = null`, set `vacantSinceDay` |
| `"military"` | `state.military.appointments[positionId]` | Set `appointments[positionId].characterName = null`, set `vacantSinceDay` |
| `"aide"` | `state.appointments[]` (AppointmentState array) + `state.characters[name]` | Remove from `appointments` array, remove from `characters`. For PA specifically, also clear `state.personalAssistant`. |

### Integration points

- `GameContext.tsx`: New reducer case for `DISMISS_OFFICIAL`. Deprecates existing `DISMISS_MINISTER` action — the unified engine replaces it with `DISMISS_OFFICIAL` + `systemType: "minister"`.
- `gameEngine.ts`: Vacancy processing already exists per system; dismissal feeds into it
- `lifecycleEngine.ts`: Dismissed characters enter career mobility pipeline with exit reason `"fired"`

---

## 2. Godfather ↔ New Systems Bridge

### Type extension

**`GodfatherStable`** in `godfatherTypes.ts` gets 5 new optional fields:

```typescript
export interface GodfatherStable {
  governors: string[];
  legislativeBloc: { house: number; senate: number };
  cabinetCandidates: string[];
  connections: GodfatherConnection[];
  // NEW:
  militaryInterests?: string[];        // position IDs: ["chief-army-force"]
  diplomaticInterests?: string[];      // post IDs: ["amb-saudi", "amb-uae"]
  directorInterests?: string[];        // position IDs: ["cbn-governor"]
  traditionalRulerAllies?: string[];   // ruler IDs: ["sultan-sokoto"]
  religiousLeaderAllies?: string[];    // leader IDs: ["pres-muslim-society"]
}
```

**Design note:** The existing `connections: GodfatherConnection[]` field uses `entityType: "governor" | "legislator-bloc" | "cabinet" | "media" | "business" | "street"` for revealed narrative connections (shown to the player as discovered intel). The new flat arrays serve a different purpose — they are **engine-internal position interests** used by the appointment watch, dismissal reaction, and ally amplification mechanics. They are never directly revealed to the player; their effects are felt through events and consequences. The existing `interests: string[]` on `Godfather` tracks policy interests (e.g. "petroleum-policy", "infrastructure"), not position-specific interests. All three data structures coexist with distinct roles: `connections` = narrative discovery, `interests` = policy alignment, new arrays = positional pressure.

**`BusinessOligarchCandidate.stableTemplate`** in `businessOligarchTypes.ts` gets the same 5 new optional fields, so interests carry over during godfather seeding.

### Interest seeding logic

| Godfather archetype | Interests |
|---|---|
| Military elders | `militaryInterests` (2-3 positions), `directorInterests` (defence agencies) |
| Northern business oligarchs | `diplomaticInterests` (Saudi, UAE), `traditionalRulerAllies` (Sultan, emirs), `religiousLeaderAllies` (NSCIA) |
| Southern business oligarchs | `diplomaticInterests` (USA, UK), `directorInterests` (CBN, NNPC, customs) |
| Regional strongmen | `traditionalRulerAllies` (paramount rulers in their zone), `militaryInterests` (police/army chief) |
| Religious godfathers | `religiousLeaderAllies` (matching faith leader), `traditionalRulerAllies` (aligned rulers) |
| Party bosses | `directorInterests` (revenue agencies, electoral commission) |
| Media moguls | `directorInterests` (NBC, NTA), `diplomaticInterests` (prestige posts) |

For the 19 hardcoded godfathers: manually assign interests based on their profiles in `godfatherProfiles.ts`.

For the 20 business oligarchs: the seeding function in `businessOligarchEngine.ts` derives interests from `sector` and `zone`:
- Oil-gas from NW → `diplomaticInterests: ["amb-saudi", "amb-uae"]`, `directorInterests: ["nnpc-gmd"]`
- Banking-finance from SW → `directorInterests: ["cbn-governor"]`
- Conglomerate from NW → `traditionalRulerAllies` based on state's paramount ruler

### Engine integration — 3 new checks in `godfatherEngine.ts`

**1. Appointment watch**

When the player appoints anyone to a position a godfather has interest in, check: did the appointee match the godfather's zone/faction preference? If yes, reduce favour debt by 1. If no, increase escalation by 1 stage if the godfather is already active (escalation > 0).

**2. Dismissal reaction**

When `processDismissal` fires, if the dismissed person was in a position a godfather cares about, and the godfather's relationship is ≤ Neutral, the godfather generates a pressure event:

> "Alhaji Dantata is displeased with the removal of Gen. Tsafe. He demands consultation on the replacement."

Player choices:
- **Consult** (costs 1 political capital, godfather suggests a candidate from their network)
- **Ignore** (escalation +1)

**3. Ally amplification** (interim — replaced by Section 5b coalition pressure once `npcLinks` are implemented)

The `traditionalRulerAllies` and `religiousLeaderAllies` arrays on `GodfatherStable` are used during Item 2 implementation as a simple lookup: when a godfather escalates to stage 3+, iterate their ally arrays and generate sympathy events at 40% probability per ally. Once Item 5 is implemented, this logic is **removed** from `godfatherEngine.ts` and replaced by the `NPCLink`-based coalition pressure system in `affinityRegistry.ts`, which uses strength-weighted probabilities (40%/25%/10% for strength 3/2/1). The ally arrays on `GodfatherStable` remain as seeding data — they are used to generate the initial `NPCLink` entries during game start, then the link registry is the single source of truth for ally amplification going forward.

### Files modified

- `godfatherTypes.ts`: Extended `GodfatherStable`
- `businessOligarchTypes.ts`: Extended `stableTemplate`
- `godfatherEngine.ts`: 3 new check functions
- `godfatherProfiles.ts`: Interest data for 19 hardcoded godfathers
- `businessOligarchEngine.ts`: Interest derivation during seeding

---

## 3. Traditional Ruler / Religious Leader Activation

### Traditional Rulers — 3 new mechanics

#### 3a. Royal Audience System

Paramount rulers (8) can request audiences with the President.

**Frequency:** 5% chance per turn per paramount ruler. First-class rulers (20) at 2%. Second-class rulers (22) never request audiences individually — they only contribute to aggregate `royalCouncilSupport`.

**Event format:**

> "The Sultan of Sokoto requests a royal audience to discuss security in the Northwest"

Context drawn from ruler's zone + current game state (e.g. if NW stability < 40, topic is security; if agriculture sector < 50 in their zone, topic is farming crisis).

**Player choices:**
- **Grant Audience** (+8 relationship with ruler, +2 approval in their zone, −1 political capital)
- **Send Proxy** (CoS or SGF attends — +3 relationship, no approval change, no PC cost)
- **Decline** (−10 relationship, −1 approval in their zone, potential headline)

#### 3b. Player-Initiated State Visits

New reducer action: `INITIATE_STATE_VISIT`

```typescript
{ type: "INITIATE_STATE_VISIT"; rulerId: string }
```

Dispatched from a traditional ruler detail/list view (similar to minister summoning UI). 14-day cooldown per ruler, tracked via `lastStateVisitDay` on the ruler's appointment record. Player selects which paramount ruler to visit from the list of 8 paramount rulers.

**Effects:**
- +12 relationship with that ruler
- +3 approval in that zone
- +2 stability if zone stability is below 50
- −2 political capital

**Endorsement bonus:** If ruler's relationship is already above 70, they offer a public endorsement: +4 approval nationally for 30 days.

#### 3c. Public Statement Cycle

Each turn:
- Paramount or first-class ruler with relationship > 75: 3% chance of **public endorsement** (inbox message + headline + approval boost in their zone)
- Ruler with relationship < 25: 5% chance of **public criticism** (headline + approval penalty in their zone + stability −1)

This creates a feedback loop: neglect → criticism accumulates; engage → endorsements become a steady approval tailwind.

### Religious Leaders — 3 new mechanics

#### 3d. Festival/Observance Events

Every 90 game days: a major religious observance (alternating Christian/Muslim). The relevant leader generates an event:

- **Attend in person** (+10 relationship with leader, +3 approval with that faith demographic, −1 political capital)
- **Send official message** (+4 relationship, +1 approval)
- **No acknowledgment** (−8 relationship, −2 approval with that demographic, headline)

#### 3e. Interfaith Summit

Player-initiated, 60-day cooldown. Convenes both leaders together. Outcome depends on both relationships:

- **Both > 50:** Harmony rises by 10, stability +2, positive headline
- **One < 30:** Hostile leader uses summit to publicly embarrass the player. Harmony −5, approval −3, negative headline
- **Both < 30:** Summit is a disaster. Stability −4, approval −5. Do not convene a summit without relationship groundwork.

#### 3f. Policy Reaction System

When the player makes policy choices (via policy levers or legislative bills), religious leaders react based on alignment with their constituency:

- Education curriculum changes → both leaders react
- Land use near religious sites → affected leader reacts
- Social welfare spending → both leaders generally positive
- Security spending in religiously sensitive zones → relevant leader reacts

Reaction: inbox message with sentiment shift (+/−5 relationship) and potential headline if strongly negative.

### Revised event frequency summary

| Character tier | Old frequency | New frequency | Player-initiated? |
|---|---|---|---|
| Paramount rulers (8) | 2% shared across 50 | 5% per ruler per turn | Yes — state visits |
| First-class rulers (20) | 2% shared across 50 | 2% per ruler per turn | No |
| Second-class rulers (22) | 2% shared across 50 | Aggregate only | No |
| Religious leaders (2) | 1.5% per turn | Festival every 90 days + 3% random | Yes — interfaith summit |

### Files modified

- `traditionalRulerEngine.ts`: Audience system, state visits, public statement cycle
- `religiousLeaderEngine.ts`: Festival events, interfaith summit, policy reactions
- `traditionalRulerTypes.ts`: New event type constants if needed
- `religiousLeaderTypes.ts`: New event type constants if needed

---

## 4. Cabinet Appointment Engine Depth

### Minister Competence → Sector Multiplier

#### New function: `computeMinisterialEffectiveness(state)` in `cabinetSystem.ts`

For each of the 5 cabinet clusters, compute average competence of filled portfolios:

| Cluster | Portfolios | Sectors affected | Notes |
|---|---|---|---|
| Economic | Finance, Petroleum, Trade & Investment | `economy`, treasury drift | Treasury drift: effectiveness multiplier applied to `macroEconomy` revenue calculation |
| Social | Health, Education, Youth Dev., Labour | `healthSector`, `education`, `youthEmployment` | Direct sector health multiplier via `processSectorTurns()` |
| Infrastructure | Works & Housing, Power, Comms, Transport | `infrastructure` | Direct sector health multiplier via `processSectorTurns()` |
| Security & Justice | Defence, Justice, Interior, Foreign Affairs | `interior`, stability | Only Interior maps to a governance sector. Defence/Justice/Foreign Affairs have no sector — their cluster effectiveness instead applies a direct modifier to `state.stability` drift (±0.5 per turn based on effectiveness band). This is applied in `gameEngine.ts` during the drift calculation step, not in `processSectorTurns()`. |
| Resources | Agriculture, Environment | `agriculture`, `environment` | Direct sector health multiplier via `processSectorTurns()` |

#### Effectiveness multiplier applied to sector health delta per turn

- Competence 80+: ×1.15 (sector improves 15% faster)
- Competence 60-79: ×1.0 (neutral)
- Competence 40-59: ×0.85 (sector degrades 15% faster)
- Competence <40: ×0.70 (actively harmful)
- Vacant portfolio: ×0.70 (a missing minister is as bad as a bad one)

Integrates into existing `processSectorTurns()` in `sectorTurnProcessor.ts` — multiply health delta by ministerial effectiveness before applying.

#### 3 new event types

**1. Minister Initiative Events (competence > 80, 3% per turn)**

High-competence minister proposes a beneficial policy:

> "Dr. Patel (Communications) proposes a national broadband rollout plan"

- **Approve:** +5 sector health over 30 days, −3 treasury, minister relationship +5
- **Defer:** No effect, minister relationship −3
- **Reject:** Minister relationship −8, risk of resignation if loyalty < 40

**2. Minister Sabotage Events (loyalty < 40, 2% per turn)**

Disloyal minister undermines policy:

> "Intelligence reports suggest the Defence Minister is leaking cabinet discussions to opposition senators"

- **Confront privately:** Loyalty +10 or −10 depending on minister's integrity (50/50)
- **Place on probation:** Uses existing probation mechanic
- **Dismiss immediately:** Triggers dismissal engine (Section 1)
- **Monitor quietly:** DNI generates follow-up event in 14 days with more evidence

**3. Minister Clash Events (two ministers in same cluster with loyalty difference > 30, 2% per turn)**

Ministers in same cluster with misaligned loyalties generate friction:

> "The Finance Minister and Trade Minister are publicly contradicting each other on tariff policy"

- **Mediate:** Costs political capital, both ministers +5 relationship
- **Back one side:** Winning minister +10, losing minister −15, sector direction boost
- **Ignore:** Cluster effectiveness drops by 10% for 30 days

#### Post-dismissal replacement

When a minister is dismissed, their portfolio goes vacant. Vacancy triggers a replacement appointment event (same format as day 2-18 sequence) with remaining candidates from that portfolio's pool. If pool is exhausted, a procedurally generated candidate is offered with lower average competence — representing the "you've burned through the A-list" reality.

### Files modified

- `cabinetSystem.ts`: `computeMinisterialEffectiveness()`, new event generators
- `sectorTurnProcessor.ts`: Apply ministerial multiplier to sector health delta
- `gameEngine.ts`: Wire minister events into turn processing pipeline

---

## 5. Inter-NPC Relationships via Affinity Tags

### Data model

Two structures: implicit affinities (computed on the fly) and explicit links (stored in state).

### Implicit affinities

**New function: `computeAffinity(characterA, characterB)` in `affinityRegistry.ts`**

Returns a score from −20 to +20 based on attribute overlap:

| Shared attribute | Affinity bonus |
|---|---|
| Same geopolitical zone | +5 |
| Same faction | +7 |
| Same religion | +3 |
| Same ethnicity | +6 |
| Same gender | +3 |

These are never stored — computed when needed for event generation and consequence calculation.

#### Gender-traditionalist friction

When a woman is appointed to a high-prestige position (military chief, paramount agency director, key bilateral ambassador), male traditional rulers and religious leaders with integrity < 50 have a 4% chance per turn to generate a negative reaction event:

> "The Emir of Kano has publicly questioned the appointment of a woman as Chief of Naval Staff"

- **Rebuke publicly:** +3 approval nationally, −10 relationship with that ruler, +5 relationship with all female characters
- **Engage privately:** −3 relationship with ruler (mild), no public effect
- **Ignore:** −2 approval in ruler's zone, female appointee's loyalty −5

This means gender becomes a strategic consideration: female appointees bring cross-system solidarity from other women in government (via gender affinity in appointment ripple) but may cost relationship points with conservative traditional/religious establishments.

### Explicit links

**New type in `affinityRegistry.ts`:**

```typescript
interface NPCLink {
  characterA: string;    // character ID or name
  systemA: string;       // system type identifier
  characterB: string;
  systemB: string;
  type: "mentor" | "rival" | "ally" | "patron-client" | "kinship";
  strength: number;      // 1 (mild), 2 (moderate), 3 (strong)
}
```

**New field on `GameState`:**

```typescript
npcLinks: NPCLink[];
```

#### Pre-seeding at game start (~60-80 links)

- Each of the 19 hardcoded godfathers gets 2-4 links to characters in other systems (~60 links)
- 10-15 rivalry links between competing traditional rulers, competing oligarchs in same sector, military chiefs from rival zones
- 5-10 kinship links (minister whose uncle is a traditional ruler, military chief whose brother is a senator)
- Business oligarch seeding generates links dynamically from `stableTemplate` (governor connections, traditional ruler allies)

### Engine integration — 3 effects

#### 5a. Appointment Ripple

**New function: `processAppointmentRipple(state, character, action)` in `affinityRegistry.ts`**

When the player appoints or dismisses someone, scan the link registry:

| Link type | On appointment | On dismissal |
|---|---|---|
| Mentor/patron of appointee | Player relationship +5 | N/A |
| Mentor/patron of dismissed | N/A | Player relationship −8 |
| Rival of appointee | Player relationship −3 | N/A |
| Rival of dismissed | N/A | Player relationship +3 |
| Ally of appointee | Player relationship +3 | N/A |
| Ally of dismissed | N/A | Player relationship −5 |
| Kinship of appointee | Player relationship +2 | N/A |
| Kinship of dismissed | N/A | Player relationship −3 |

Implicit gender affinity: when a woman is appointed to a high-prestige position, a single batched consequence is generated: `"female-solidarity-boost"` with effect `{ approval: +1, description: "Women across government rally behind the appointment" }`. This avoids iterating all ~860 positions to find female characters — the +1 approval proxy represents the aggregate solidarity effect. Similarly, dismissing a woman from a high-prestige position generates a batched `{ approval: -1, description: "Women's groups question the removal" }` consequence.

The player discovers these connections through consequences — appointing a military chief mentored by a specific godfather automatically improves that godfather's disposition without the player needing to know the link exists beforehand.

#### 5b. Coalition Pressure

When a godfather escalates to stage 3+, their linked allies across systems generate sympathy events:

- Godfather linked to Sultan → Sultan issues a supporting statement
- Godfather linked to a military chief → intelligence reports suggest military unease
- Godfather linked to 3 directors → those agencies slow-walk policy implementation (sector health temporarily drops)

Probability per ally link per escalation event: 40% for strength 3, 25% for strength 2, 10% for strength 1.

#### 5c. Rivalry Eruptions

Characters with `"rival"` links: 2% chance per turn per rivalry link to generate a conflict event. These are cross-system dramas:

> "The Ooni of Ife and Oba of Benin are publicly disputing precedence at a national ceremony. Both expect presidential support."

- **Support Ooni:** +10 Ooni relationship, −10 Oba relationship, SW approval +1
- **Support Oba:** Reverse
- **Stay neutral:** Both −3 relationship, stability preserved

> "Two business oligarchs competing for the CBN Governor's ear are destabilizing monetary policy discussions."

- **Summon both:** Costs political capital, temporarily resolves
- **Back one:** The other becomes hostile

### State footprint

`npcLinks` array: ~60-80 entries at game start, grows slightly via career mobility (retired military chief becomes godfather → new links). Total: ~80-120 small objects — negligible for browser game performance and save files.

**Link cleanup:** When a character exits the game via `lifecycleEngine` (death, retirement with no career transition), all `NPCLink` entries referencing that character are marked inactive by removing them from the array. This is handled in `lifecycleEngine.ts` as part of the exit processing — after generating departure events, filter `state.npcLinks` to remove entries where `characterA` or `characterB` matches the exiting character's ID. Characters who exit via career mobility (transition to a new system) retain their links — the link's `systemA`/`systemB` is updated to reflect their new role.

### Files created/modified

- **New:** `affinityRegistry.ts` — `computeAffinity()`, `processAppointmentRipple()`, `NPCLink` type, seeding function
- `gameTypes.ts`: Add `npcLinks: NPCLink[]` to `GameState`
- `GameContext.tsx`: Seed `npcLinks` at game start
- `godfatherEngine.ts`: Coalition pressure integration
- `dismissalEngine.ts`: Call `processAppointmentRipple` on dismissal
- `gameEngine.ts`: Call `processAppointmentRipple` on appointments, wire rivalry eruptions into turn pipeline

---

## Implementation Order

1. `dismissalEngine.ts` + `DISMISS_OFFICIAL` reducer (foundation)
2. `GodfatherStable` extension + 3 engine checks (depends on dismissal engine for reaction #2)
3. Traditional ruler / religious leader activation (depends on godfather bridge for ally amplification)
4. Cabinet depth — `computeMinisterialEffectiveness()` + events (depends on dismissal engine for sabotage → dismiss flow)
5. `affinityRegistry.ts` + ripple/coalition/rivalry (capstone, references all previous items)

## Testing Strategy

Each item gets its own test file following the existing `*.test.ts` pattern:
- `dismissalEngine.test.ts`: ~20 tests covering each system type, consequence generation, godfather reactions, vacancy triggering
- `godfatherEngine.test.ts`: Extended with ~15 new tests for appointment watch, dismissal reaction, ally amplification
- `traditionalRulerEngine.test.ts`: Extended with ~20 new tests for audiences, state visits, public statements
- `religiousLeaderEngine.test.ts`: Extended with ~15 new tests for festivals, summits, policy reactions
- `cabinetSystem.test.ts`: Extended with ~15 new tests for effectiveness multiplier, initiative/sabotage/clash events
- `affinityRegistry.test.ts`: ~25 new tests for affinity computation, appointment ripple, coalition pressure, rivalry eruptions
