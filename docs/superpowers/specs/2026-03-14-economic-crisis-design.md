# Economic Crisis Events — Design Spec

**Sub-Project F** of the Aso Rock game feature roadmap (A through F).

**Goal:** Replace the flat `MacroEconomicState` with a full sectoral GDP model, itemized revenue/expenditure fiscal pipeline, derived unemployment, and a tipping-point cascade system where economic crises propagate across metrics — transforming the economy from a backdrop into the game's central strategic challenge alongside politics.

---

## 1. Core Architecture

The economic system has four layers:

### 1.1 Sectoral GDP Model

GDP is the sum of 5 sector outputs. Each sector grows or contracts based on policy levers, external shocks, and momentum. The player's strategic choices (budget allocation, policy levers) determine which sectors thrive.

### 1.2 Revenue & Fiscal Pipeline

Government revenue flows from 5 streams (oil, tax, IGR, trade, borrowing) into the federal budget (set by the Legislative Engine), which is spent across 4 expenditure categories (recurrent, capital, debt servicing, transfers). Treasury liquidity — actual cash on hand — is the player's real constraint.

### 1.3 Crisis Thresholds & Cascades

Six economic metrics have green/yellow/red zones. When a metric enters red, it triggers cascade events that pull other metrics toward their own thresholds. Cascades escalate each turn until resolved through policy intervention. Recovery takes 2-3× longer than deterioration.

### 1.4 Unemployment (Derived Metric)

Unemployment is calculated each turn as a weighted output of sectoral performance — not a lever the player pulls directly. High unemployment triggers social unrest, security deterioration, and approval drops.

---

## 2. Sectoral GDP Model

### 2.1 The Five Sectors

| Sector | Base Share of GDP | Employment Weight | Growth Drivers | Key Policy Levers |
|--------|------------------|-------------------|----------------|-------------------|
| **Oil** | 38% | 5% | Oil output, global oil price, refinery investment | Fuel subsidy, FX policy |
| **Agriculture** | 24% | 40% | Fertilizer subsidies, infrastructure, import protection | Import tariffs, cash transfers, public sector hiring |
| **Manufacturing** | 15% | 25% | Power supply, borrowing costs, import costs, FX stability | Electricity tariff, interest rate, import tariffs, FX policy |
| **Services** | 16% | 20% | Consumer spending, FX stability, digital infrastructure | Interest rate, tax rate, minimum wage |
| **Tourism** | 7% | 10% | Security stability, visa policy, cultural investment, infrastructure | Zone security levels, budget allocation, FX policy |

### 2.2 Per-Turn Calculation

Each turn, for each sector:

1. Calculate `growthRate` = base momentum + sum of policy modifier effects + external shock effect + random variance (±1%)
2. Update sector GDP: `gdpValue = previousGdpValue × (1 + growthRate)`
3. Recalculate `gdpShare` from new absolute values
4. Update `momentum`: consecutive positive turns compound (momentum += 1), any negative turn resets to 0

Total GDP = sum of all sector `gdpValue` fields.

### 2.3 Policy Lever → Sector Effects

Each of the 9 existing policy levers affects specific sectors with specific magnitudes and directions. Effects are applied as `PolicyModifier` objects with durations (policy lag — changes don't take full effect instantly).

| Policy Lever | Oil | Agriculture | Manufacturing | Services | Tourism |
|-------------|-----|-------------|---------------|----------|---------|
| **Fuel subsidy removal** | +2% (fiscal savings) | -1% (transport costs) | -1% (energy costs) | -1% (inflation) | neutral |
| **Electricity tariff increase** | neutral | -0.5% | -2% (major cost) | -1% | -0.5% |
| **FX float** | +2% (naira revenue) | -0.5% | -2% (import costs) | -1% | +1% (cheaper for visitors) |
| **Interest rate hike** | neutral | -0.5% | -1.5% (borrowing) | -1% | -0.5% |
| **Tax rate increase** | neutral | -0.5% | -1% | -1.5% | -0.5% |
| **Import tariffs up** | neutral | +1.5% (protection) | +1% (protection) | -0.5% (costs) | -0.5% |
| **Cash transfers** | neutral | +1% (rural spending) | neutral | +0.5% | neutral |
| **Minimum wage increase** | neutral | -0.5% (labor costs) | -1% (labor costs) | +0.5% (spending) | +0.5% (spending) |
| **Public sector hiring** | neutral | +0.5% | neutral | +1% (govt spending) | neutral |

These are base magnitudes. Actual effect = base × lever intensity (how far the lever is moved from neutral). Effects have a 2-3 turn onset delay and persist for 4-6 turns after the lever is changed.

### 2.4 Tourism Special Mechanics

Tourism has unique dynamics distinct from other sectors:

- **Security-gated:** Tourism growth is hard-capped by the worst-performing zone's security level. A security crisis in any zone suppresses national tourism even if other zones are stable. This creates a direct incentive to invest in security across all zones.
- **Slow to build, fast to collapse:** Tourism momentum builds over multiple turns (reputation, infrastructure) but a single major security event resets the momentum multiplier to 0. Consecutive peaceful turns compound growth; any crisis wipes the compounding.
- **FX sensitivity:** A weaker naira makes Nigeria cheaper for international tourists (growth boost) but raises import costs for tourism infrastructure.
- **Regional variation:** Different zones have different tourism potential — SW (Lagos, beaches), NC (Abuja, culture), SS (post-cleanup potential). Budget allocation to specific zones can unlock tourism potential.

### 2.5 External Shocks

Exogenous events the player cannot prevent but can mitigate:

- **Global oil price fluctuation:** ±20% swings, directly affects oil sector GDP and oil revenue. Arrives as a game event with narrative context.
- **Drought/flood:** Agriculture sector shock, -10% to -30% depending on severity. Zone-specific.
- **Global trade disruption:** Manufacturing and services impacted, -5% to -15%. Triggered by world events.

These arrive as events with 1-2 turns of warning (if intelligence system provides early detection) or as sudden shocks.

### 2.6 Unemployment Derivation

Unemployment is calculated each turn:

```
unemploymentRate = baseRate - Σ(sectorGrowthRate × sectorEmploymentWeight)
```

Clamped to 5-50%. Starting base rate is ~25% (reflecting Nigeria's real unemployment challenge).

Because agriculture has 40% employment weight, agricultural investment has the largest impact on unemployment. Oil growth barely moves the needle (5% weight). This creates a meaningful strategic trade-off: oil generates revenue but not jobs; agriculture generates jobs but less revenue per unit of GDP.

---

## 3. Revenue & Fiscal Pipeline

### 3.1 Revenue Streams

Five sources of government revenue, calculated each turn:

| Stream | Calculation | Key Drivers |
|--------|-------------|-------------|
| **Oil revenue** | Oil sector GDP × extraction rate - fuel subsidy cost | Oil output, global price, subsidy lever |
| **Tax revenue** | (Non-oil GDP) × effective tax rate × collection efficiency | Tax rate lever, GDP growth, anti-corruption |
| **IGR** | Base amount × (1 + GDP growth rate) × administrative efficiency | Economic activity, governance quality |
| **Trade revenue** | Import volume × tariff rate + export levies | Import tariff lever, FX policy, trade balance |
| **Borrowing** | Player-initiated or automatic (deficit financing) | Debt-to-GDP ratio, interest rate, credit rating |

Total revenue = oil + tax + IGR + trade + borrowing.

**Borrowing is special:** Unlike other streams, borrowing increases debt-to-GDP and future debt servicing costs. The player can choose to borrow to cover shortfalls, but each borrowing decision makes the debt tipping point closer. Automatic borrowing kicks in if treasury hits zero (emergency overdraft at punitive rates).

### 3.2 Expenditure Categories

Four spending categories, set primarily through the budget process (Legislative Engine):

| Category | What It Covers | Behaviour |
|----------|---------------|-----------|
| **Recurrent** | Public sector salaries, ministry overheads, running costs | Largely fixed. Grows with public sector hiring lever. Cutting it triggers strikes and approval collapse. |
| **Capital** | Infrastructure, sectoral investment, development projects | This is what drives GDP growth. Player's primary growth lever. Legislatively contested — godfathers want contracts here. |
| **Debt servicing** | Interest payments + principal on domestic and external debt | Non-discretionary — must be paid. Grows with cumulative borrowing. Can crowd out capital and transfers. |
| **Transfers** | Cash transfers, fuel subsidy payments, state allocations | Policy-driven. Subsidy and cash transfer levers determine size. Popular but fiscally expensive. |

Budget allocation is determined during the Legislative Engine's budget process. The split between these categories is what the legislature debates and the player negotiates.

### 3.3 Treasury Liquidity

The player's real constraint — actual cash available:

```
treasuryLiquidity = previousLiquidity + revenueCollected - expenditureObligations
```

`treasuryMonthsOfCover = treasuryLiquidity / monthlyObligations`

Treasury zones:
- **Green:** 3+ months of cover
- **Yellow:** 1-3 months
- **Red:** <1 month
- **Zero:** Government shutdown — salary arrears begin, public sector strikes, approval freefall

The budget sets *planned* spending, but actual spending depends on treasury having the cash. Revenue shortfalls (oil price drop, poor tax collection) mean the budget can't be fully executed even if approved — forcing the player into austerity, borrowing, or default.

---

## 4. Crisis Thresholds & Cascades

### 4.1 Tipping Points

Each metric has three zones:

| Metric | Green | Yellow Zone | Red Zone | Crisis Trigger |
|--------|-------|------------|----------|----------------|
| **Inflation** | <20% | 20-30% | 30%+ | Above 40%: hyperinflation spiral |
| **Unemployment** | <25% | 25-35% | 35%+ | Above 40%: mass unrest |
| **FX Rate** | <30% depreciation | 30-50% depreciation | 50%+ | Above 60%: currency crisis |
| **Debt-to-GDP** | <40% | 40-60% | 60%+ | Above 70%: debt trap |
| **Treasury** | 3+ months cover | 1-3 months | <1 month | Zero: government shutdown |
| **Oil Output** | >80% capacity | 60-80% capacity | <60% | Below 50%: fiscal emergency |

**Yellow zone:** Warning indicators appear on the Economy Tab dashboard. Minor negative effects begin (slightly faster deterioration, small approval penalty).

**Red zone:** Crisis indicators flash. Significant gameplay effects — approval penalties, zone unrest, opposition attacks. Cascades may trigger.

**Crisis trigger:** The metric has passed the point of self-reinforcing deterioration. Without aggressive intervention, the metric accelerates toward catastrophe.

### 4.2 Cascade Mechanics

When one metric enters red zone, it pulls connected metrics toward their thresholds:

| Cascade | Trigger | Propagation | Affected Metrics |
|---------|---------|-------------|-----------------|
| **Inflation → FX spiral** | Inflation >30% | High inflation → capital flight → naira depreciates → imports cost more → inflation accelerates | Inflation ↔ FX rate (reinforcing loop) |
| **Unemployment → security → tourism** | Unemployment >35% | Mass unemployment → zone unrest → security deteriorates → tourism collapses → more unemployment | Unemployment → zone security → tourism GDP → unemployment |
| **Debt → austerity → recession** | Debt-to-GDP >60% | Debt servicing crowds out capital expenditure → less investment → GDP stalls → tax revenue drops → must borrow more | Debt → capital expenditure → GDP growth → tax revenue → debt |
| **Oil shock → fiscal → arrears** | Oil output <60% | Oil revenue collapses → treasury can't meet obligations → salary arrears → strikes → services collapse | Oil revenue → treasury → recurrent spending → approval |
| **Currency → manufacturing → unemployment** | FX depreciation >50% | Naira crashes → imports unaffordable → factories close → unemployment spikes | FX rate → manufacturing GDP → unemployment |

**Propagation delay:** Each cascade step takes 2-5 turns to manifest. The player can see it coming and has a window to intervene.

**Severity escalation:** Each turn a cascade remains active, its `severity` counter increases by 1. Higher severity means the affected metrics deteriorate faster — creating the "death spiral" that rewards early intervention and punishes inaction.

**Resolution:** A cascade resolves when the trigger metric returns to yellow zone or better. However, the affected metrics don't snap back — they recover at their own rate (2-3× slower than deterioration).

### 4.3 Recovery Dynamics

Economic recovery is deliberately slow:

- Exiting red zone takes 2-3× the number of turns it took to enter
- Policy changes have a 2-3 turn onset delay before effects are felt
- Market confidence (an implicit modifier) takes time to rebuild — even good policy doesn't produce instant results
- This creates realistic economic drag and rewards consistent, sustained good policy over reactive pivoting

---

## 5. Data Model

### 5.1 Economic State

```typescript
interface EconomicState {
  // GDP & Sectors
  gdp: number;                          // total GDP in billions USD
  sectors: SectorState[];               // 5 sectors
  gdpGrowthRate: number;                // aggregate, derived from sectors

  // Employment
  unemploymentRate: number;             // 5-50%, derived from sectoral performance

  // Fiscal Pipeline
  revenue: RevenueState;
  expenditure: ExpenditureState;
  treasuryLiquidity: number;            // actual cash available
  treasuryMonthsOfCover: number;        // liquidity / monthly obligations

  // Existing metrics (preserved from MacroEconomicState, now connected)
  inflation: number;
  fxRate: number;
  reserves: number;
  debtToGdp: number;
  oilOutput: number;
  subsidyPressure: number;

  // Crisis tracking
  crisisIndicators: CrisisIndicators;
  activeCascades: CascadeEvent[];

  // History (for charts/trends)
  history: EconomicSnapshot[];          // last 12 turns for sparklines
}
```

**Migration note:** `EconomicState` replaces `MacroEconomicState` on `GameState`. The 6 existing fields (`inflation`, `fxRate`, `reserves`, `debtToGdp`, `oilOutput`, `subsidyPressure`) are preserved with the same names and types — they now live on `EconomicState` instead of `MacroEconomicState`. All existing code referencing these fields needs to update the parent object path.

### 5.2 Sector State

```typescript
interface SectorState {
  id: SectorId;
  name: string;
  gdpShare: number;                     // current % of total GDP
  gdpValue: number;                     // absolute value in billions
  growthRate: number;                    // current turn growth %
  employmentWeight: number;             // how much this sector affects unemployment
  momentum: number;                     // consecutive positive turns (0 = reset)
  policyModifiers: PolicyModifier[];    // active effects from player's lever settings
}

type SectorId = "oil" | "agriculture" | "manufacturing" | "services" | "tourism";

interface PolicyModifier {
  source: string;                       // which policy lever
  effect: number;                       // +/- percentage on growth rate
  duration: number;                     // turns remaining
}
```

### 5.3 Revenue & Expenditure

```typescript
interface RevenueState {
  total: number;
  oil: number;                          // NNPC remittances, royalties
  tax: number;                          // VAT, corporate, income
  igr: number;                          // internally generated revenue
  trade: number;                        // customs, import/export duties
  borrowing: number;                    // new debt issued this period
}

interface ExpenditureState {
  total: number;
  recurrent: number;                    // salaries, overheads
  capital: number;                      // infrastructure, sectoral investment
  debtServicing: number;                // interest + principal payments
  transfers: number;                    // subsidies, cash transfers
}
```

### 5.4 Crisis & Cascade

```typescript
interface CrisisIndicators {
  inflationZone: "green" | "yellow" | "red";
  unemploymentZone: "green" | "yellow" | "red";
  fxZone: "green" | "yellow" | "red";
  debtZone: "green" | "yellow" | "red";
  treasuryZone: "green" | "yellow" | "red";
  oilOutputZone: "green" | "yellow" | "red";
}

interface CascadeEvent {
  id: string;
  type: CascadeType;
  triggerMetric: string;                // what crossed the threshold
  affectedMetrics: string[];            // what's being pulled toward crisis
  turnsActive: number;
  severity: number;                     // escalates each turn if unresolved
  resolved: boolean;
}

type CascadeType =
  | "inflation-fx-spiral"
  | "unemployment-security-tourism"
  | "debt-austerity-recession"
  | "oil-fiscal-arrears"
  | "currency-manufacturing-unemployment";
```

### 5.5 History Snapshot

```typescript
interface EconomicSnapshot {
  day: number;
  gdp: number;
  unemploymentRate: number;
  inflation: number;
  fxRate: number;
  treasuryLiquidity: number;
  debtToGdp: number;
}
```

### 5.6 Clarifications

**MacroEconomicState replacement:** `EconomicState` fully replaces `MacroEconomicState`. The old interface is removed from `gameTypes.ts` and all references updated. The 6 existing fields are preserved with identical names and types on the new interface, so the migration is a path change (e.g., `gameState.macroEconomic.inflation` → `gameState.economy.inflation`), not a logic change.

**Existing policy levers:** The 9 policy levers remain in their current location (likely `gameTypes.ts` or `policyEngine.ts`). The economic engine reads lever settings and translates them into `PolicyModifier` objects on the affected sectors. No changes to the lever interface itself.

**Budget integration with Legislative Engine (Sub-Project A):** The Legislative Engine's budget process determines the `ExpenditureState` split. When the legislature approves a budget, it sets the allocation across recurrent, capital, debt servicing, and transfers. The economic engine then executes spending against treasury liquidity each turn. If the budget isn't approved, the previous year's allocation continues.

**Sector initialization:** Starting sector GDP values are set during game initialization based on a realistic Nigerian economic baseline. The base shares (38/24/15/16/7) represent the starting state; they shift over time based on differential growth rates.

---

## 6. Files & Integration Points

### New Files
- `client/src/lib/economicEngine.ts` — sectoral GDP calculations, revenue/expenditure processing, treasury management, crisis threshold checks, cascade propagation, unemployment derivation, policy lever → sector effect mapping, external shock processing, history snapshot recording
- `client/src/lib/economicEngine.test.ts` — unit tests
- `client/src/lib/economicTypes.ts` — TypeScript interfaces (`EconomicState`, `SectorState`, `RevenueState`, `ExpenditureState`, `CrisisIndicators`, `CascadeEvent`, `CascadeType`, `PolicyModifier`, `EconomicSnapshot`, `SectorId`)

### Modified Files
- `client/src/lib/gameTypes.ts` — remove `MacroEconomicState`, add `EconomicState` to `GameState` (as `economy: EconomicState`). Existing saves that lack `EconomicState` should be migrated on load by mapping old `MacroEconomicState` fields into the new structure with default values for new fields.
- `client/src/lib/gameEngine.ts` — each turn: call economic engine to advance sectors, calculate revenue, process expenditure, update treasury, derive unemployment, check crisis thresholds, propagate cascades, record snapshot. Replaces existing macro-economic update logic.
- `client/src/lib/policyEngine.ts` (or wherever policy levers are processed) — connect each of the 9 levers to their sector effects via `PolicyModifier` objects with magnitudes from Section 2.3 and durations of 4-6 turns.
- `client/src/components/EconomyTab.tsx` — expand from showing 6 flat metrics to: GDP with sectoral breakdown (visual chart), revenue vs expenditure fiscal balance, treasury liquidity with months-of-cover indicator, unemployment rate, crisis indicator dashboard (green/yellow/red per metric), trend sparklines from history array.
- `client/src/components/OnboardingFlow.tsx` — initialize sector GDP values and starting economic conditions based on scenario difficulty.

### Integration with Other Sub-Projects
- **Legislative Engine (A):** Budget process determines `ExpenditureState` allocation. Budget approval unlocks spending; rejection means last year's budget continues. Emergency economic bills triggered when crisis indicators hit red.
- **Godfather System (B):** Godfathers have economic interests — oil godfathers resist fuel subsidy removal, others want capital expenditure contracts in their zones. Godfather favours may inflate recurrent expenditure.
- **Federal Character (C):** Zone-level economic disparities (oil-producing vs agricultural zones) create federal character tensions. Budget allocation favouring one zone's dominant sector over another triggers zonal grievances.
- **Intelligence & Espionage (D):** Media intelligence reveals who funds economic panic narratives. Security assessments provide early warning of economic disruption. Economic crises may be manufactured by opposition.
- **Party Internals (E):** Economic performance is the #1 driver of party loyalty drift — GDP growth strengthens the ruling party, recession triggers defections. Opposition shifts to "attack" strategy when economic indicators hit yellow/red.
