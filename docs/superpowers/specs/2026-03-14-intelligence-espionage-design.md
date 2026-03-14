# Intelligence & Espionage — Design Spec

**Sub-Project D** of the Aso Rock game feature roadmap (A through F).

**Goal:** Expand the existing hooks system into a full intelligence apparatus where the player appoints a Director of National Intelligence during onboarding, passively receives intelligence through the DNI's work, commissions active intelligence operations against specific targets, and deploys intelligence through three channels (leverage, trade, blackmail) — each with distinct risk/reward profiles.

---

## 1. Core Architecture

The Intelligence & Espionage system has three layers:

### 1.1 Passive Intelligence

The existing hooks system continues to generate compromising information through events and character interactions. The DNI's competence determines frequency and accuracy. This runs in the background with no player input.

| DNI Competence | Passive Hook Rate | Accuracy | Counter-Intelligence |
|---------------|-------------------|----------|---------------------|
| High (70+) | 1 hook every 15-30 days | High — findings are reliable | Early warning of plots, coup attempts, godfather moves |
| Medium (40-69) | 1 hook every 30-45 days | Decent — occasional false leads | Some warnings, occasionally misses threats |
| Low (<40) | 1 hook every 60-90 days | Poor — sometimes false leads | Blind spots — threats arrive without warning |

### 1.2 Active Operations

The player commissions specific intelligence operations: investigating people, monitoring godfather networks, running counter-intelligence sweeps. Limited to 2-3 simultaneous operations (scaling with DNI competence). Each costs political capital, takes time, and carries risk of exposure.

### 1.3 Intelligence Deployment

When the player has actionable intelligence (hooks or operation results), they choose how to use it: leverage (private pressure for cooperation), trade (currency with godfathers or allies), or blackmail (coercive control with blowback risk). Each deployment option has distinct consequences.

### 1.4 The Director of National Intelligence

The DNI is appointed during onboarding as a core appointment. Their competence gates the entire system's effectiveness — hook generation rate, operation success probability, operation speed, and counter-intelligence warnings. Their loyalty determines leak risk — a disloyal DNI may warn targets, share your intelligence portfolio with godfathers, or feed false information.

This creates the classic appointment trade-off: a competent DNI means better intel from day one, but a politically convenient DNI (godfather's person, loyal but incompetent) means you've pleased someone while flying blind.

---

## 2. Active Operations

### 2.1 Operation Types

Six operation types the player can commission:

| Operation | Target | Base Duration | Base Cost (PC) | Result on Success |
|-----------|--------|---------------|----------------|-------------------|
| Investigate Person | Any character (governor, minister, godfather) | 14-30 days | 5-10 | Hook (compromising info), true loyalty assessment, hidden connections |
| Monitor Godfather Network | A specific godfather | 21-45 days | 8-15 | Reveals hidden stable connections, upcoming deals, escalation plans |
| Counter-Intelligence Sweep | Your own government | 10-20 days | 5-8 | Detects moles, leaks, cabinet members working against you, coup plotting |
| Opposition Research | Opposition party/figures | 14-30 days | 8-12 | Hooks on opposition leaders, their strategy, their godfather connections |
| Media Intelligence | Media landscape | 7-14 days | 3-6 | Reveals who's funding negative coverage, upcoming stories, media mogul agendas |
| Security Assessment | A region or crisis zone | 7-14 days | 3-6 | Early warning of security threats, faction militancy, unrest brewing |

### 2.2 Operation Limits & Scaling

**Concurrent operations:** Base 2 simultaneous. DNI competence 70+ allows 3. Each operation occupies a slot until resolved.

**Success probability:** Base 50% + (DNI competence × 0.4). A competence-80 DNI has 82% success rate. Failure means no result and political capital is wasted.

**Critical failure (10% of the failure space):** When an operation fails, there is a further 10% chance (of the failure probability) that it is a critical failure — the operation is discovered. For a competence-80 DNI with 82% success, there is an 18% failure chance, and 10% of that (1.8% absolute) is critical failure. The target learns they're being watched, which damages relationships and can trigger retaliation (godfather escalation, governor hostility, media backlash).

**Duration scaling:** Higher DNI competence completes operations faster: actual duration = base duration × (1 - competence/200). A competence-80 DNI completes a 30-day investigation in 18 days.

### 2.3 Operation Flow

1. Player selects operation type and target from the PoliticsTab intelligence panel.
2. DNI confirms: estimated duration, cost, success probability, and risk assessment.
3. Player commits political capital. Operation begins.
4. Each turn, operation progresses. The player sees a progress indicator but not interim results.
5. On completion: success produces findings (hooks, connections, assessments), failure produces nothing, critical failure triggers exposure event.

---

## 3. Intelligence Deployment

When the player has actionable intelligence (a hook from passive collection or an active operation result), they choose one of three deployment options:

### 3.1 Leverage (Private Pressure)

Show the intelligence to the target privately: "I know about the Abuja land deal."

- Target becomes more cooperative: loyalty increases, votes the player's way, backs down from opposition, fulfils requests.
- The target resents the player — if the player weakens (low approval, political crisis), leveraged characters may turn. Characters under leverage have a "resentment" flag that makes them unreliable under pressure.
- Renewable — the hook stays in the player's pocket. Can be referenced again if the target drifts.
- Best for: cabinet members, governors, legislators the player needs ongoing cooperation from.

### 3.2 Trade (Intelligence as Currency)

Share a hook with a third party to strengthen the player's position with them.

- Give a godfather dirt on their rival to sweeten a deal or reduce favour debt.
- Pass intelligence to an ally to help them in their own political battles.
- One-shot — once traded, the player loses control of the information. The recipient may use it in ways the player didn't intend.
- Best for: godfather negotiations, building alliances, reducing debts.

### 3.3 Blackmail (Coercive Control)

Force a character to act against their own interests under threat of exposure.

- Most effective short-term — near-guaranteed compliance on the specific demand.
- Creates a ticking time bomb: blackmailed characters accumulate a "desperation" counter (+5 per turn). When desperation hits 80, the character may: confess publicly (damages the player), flip to the opposition, attempt to destroy evidence, or trigger a crisis.
- Each subsequent blackmail demand on the same target increases desperation faster (+8 instead of +5).
- Best for: one-off critical votes, emergency situations where the player needs absolute compliance.

### 3.4 DNI Loyalty Risk

If the DNI's loyalty is below 40, intelligence deployments may leak:
- 15% chance per deployment that the DNI warns the target in advance (leverage becomes ineffective).
- 10% chance the DNI shares the player's hook inventory with a godfather (godfather gains leverage over the player).
- 5% chance the DNI feeds false information (operation results are fabricated — the player acts on bad intel).

These are the base rates at loyalty 40. Scaling formula: `actualRate = baseRate × (40 - loyalty) / 20`, clamped to 0. At loyalty 40, rates are as listed. At loyalty 30, rates are 1.5× (22.5%, 15%, 7.5%). At loyalty 20, rates are 2× (30%, 20%, 10%). At loyalty 0, rates are 2× (capped). Above loyalty 40, all leak rates are 0. Counter-intelligence sweeps can detect a disloyal DNI.

---

## 4. Data Model

### 4.1 Intelligence State

```typescript
interface IntelligenceState {
  dniId: string | null;              // character ID of appointed DNI
  dniCompetence: number;             // synced from DNI's CharacterState each turn
  dniLoyalty: number;                // synced from DNI's CharacterState each turn — low loyalty = leak risk
  activeOperations: IntelOperation[];
  completedOperations: IntelResult[];
  maxConcurrentOps: number;          // 2 base, 3 if DNI competence 70+
}
```

**DNI stat syncing:** Each turn, `dniCompetence` and `dniLoyalty` are refreshed from the DNI character's `CharacterState`. This means loyalty drift from events, faction pressure, or other systems is automatically reflected in intelligence effectiveness and leak risk. The cached values exist for convenient access; the DNI character remains the source of truth.

### 4.2 Operation Interfaces

```typescript
interface IntelOperation {
  id: string;
  type: IntelOperationType;
  targetId?: string;                 // character ID, godfather ID, or zone
  targetDescription: string;         // human-readable
  startDay: number;
  estimatedEndDay: number;           // adjusted by DNI competence
  politicalCapitalCost: number;
  successProbability: number;        // base 50 + (DNI competence × 0.4)
  status: "active" | "completed" | "failed" | "exposed";
}

type IntelOperationType =
  | "investigate-person"
  | "monitor-godfather"
  | "counter-intel"
  | "opposition-research"
  | "media-intel"
  | "security-assessment";

interface IntelResult {
  operationId: string;
  type: IntelOperationType;
  success: boolean;
  exposed: boolean;                  // was the operation discovered
  findings: IntelFinding[];
}

interface IntelFinding {
  type: "hook" | "connection" | "loyalty-assessment" | "threat-warning"
    | "strategy-intel" | "media-source";
  targetId: string;
  description: string;
  evidence: number;                  // 0-100, strength of the finding
  deployable: boolean;               // can be used as leverage/trade/blackmail
}
```

### 4.3 Hook Interface (Extended)

The existing `Hook` interface in `gameTypes.ts` has fields: `target`, `type` (financial/personal/political/criminal), `severity`, `discovered`, `usable`, `underInvestigation`, `used`. This spec **extends** the existing interface with new deployment fields rather than replacing it. All existing fields are preserved; the intelligence system adds deployment tracking on top.

```typescript
// Extends the existing Hook interface in gameTypes.ts — all existing fields preserved
interface Hook {
  // --- Existing fields (from gameTypes.ts, unchanged) ---
  id: string;
  target: string;
  type: "financial" | "personal" | "political" | "criminal";
  severity: "minor" | "major" | "devastating";
  description: string;
  discovered: boolean;
  usable: boolean;
  evidence: number;                  // 0-100, strength — shared scale with IntelFinding.evidence
  underInvestigation: boolean;
  used: boolean;

  // --- New intelligence deployment fields (all optional for backward compatibility) ---
  deployed?: boolean;                // true if used via leverage/trade/blackmail
  deploymentType?: "leverage" | "trade" | "blackmail";
  leverageTarget?: string;           // character ID of who was leveraged
  tradeRecipient?: string;           // character/godfather ID who received the intel
  blackmailDesperation?: number;     // 0-100, increases per turn when blackmailed
  sourceOperation?: string;          // operation ID that produced this hook, null if passive
}
```

**Migration note:** The `Hook` interface stays in `gameTypes.ts` (not moved to `intelligenceTypes.ts`). The new fields are added as optional properties so existing hook creation throughout `gameEngine.ts` remains compatible. `intelligenceTypes.ts` contains only the new types: `IntelligenceState`, `IntelOperation`, `IntelResult`, `IntelFinding`.

**Evidence field note:** `Hook.evidence` and `IntelFinding.evidence` share the same 0-100 scale. When an active operation produces a finding of type `"hook"`, `IntelFinding.evidence` is copied directly into the new `Hook.evidence` value. Passive hooks generated by the existing system continue to use `evidence` as they already do.

**Hook storage note:** Hooks currently live on each `CharacterState.hooks` array. The `IntelligenceState` does not duplicate this — it references hooks by ID. The intelligence engine queries hooks from `CharacterState` when needed for deployment. No centralized hook store is introduced.

---

## 5. Files & Integration Points

### New Files
- `client/src/lib/intelligenceEngine.ts` — operation management, passive hook generation, deployment logic, DNI competence gating, success/failure resolution
- `client/src/lib/intelligenceEngine.test.ts` — unit tests
- `client/src/lib/intelligenceTypes.ts` — TypeScript interfaces (IntelligenceState, IntelOperation, Hook, etc.)

### Modified Files
- `client/src/lib/gameTypes.ts` — add `IntelligenceState` to `GameState`, extend existing `Hook` interface with deployment fields (as optional properties for backward compatibility). Existing saves that lack `IntelligenceState` should default to an empty/initial state on load.
- `client/src/lib/GameContext.tsx` — initialize intelligence state, DNI appointment during onboarding
- `client/src/lib/gameEngine.ts` — process operations each turn (advance timers, resolve completions, tick blackmail desperation counters, check DNI loyalty leaks)
- `client/src/components/PoliticsTab.tsx` — PoliticsTab currently houses the legislative/political overview. The intelligence UI is added as a new panel/section within PoliticsTab (not replacing existing content): an "Intelligence" panel containing DNI status (name, competence, loyalty indicator), active operations list with progress bars, hook inventory with deployment buttons (leverage/trade/blackmail), and a "Commission Operation" button that opens the operation selection flow. If the intelligence section grows too large during implementation, it may be extracted to a dedicated `IntelligencePanel.tsx` component imported by PoliticsTab.
- `client/src/components/OnboardingFlow.tsx` — add DNI selection step with candidate pool (3 candidates per zone, same diversity rules as other appointments)

### Integration with Other Sub-Projects
- **Legislative Engine (A):** Intelligence can reveal how legislators will vote before a crisis. Security assessments provide early warning of regional unrest that might trigger emergency bills.
- **Godfather System (B):** Monitor Godfather Network reveals hidden stable connections (flips `revealed` flag on `GodfatherConnection`). Hooks enable the intelligence neutralization route (Sub-Project B, Section 5.2). Trading intelligence with godfathers reduces favour debt.
- **Federal Character (C):** Investigation can reveal that a candidate is a godfather plant. DNI is a Strategic appointment tracked by the federal character system.
- **Party Internals (E):** Opposition research reveals internal party dynamics and rival faction strategies. Counter-intelligence detects party members working against the player.
- **Economic Crisis (F):** Media intelligence reveals who's funding economic panic narratives. Security assessments provide early warning of economic disruption.
