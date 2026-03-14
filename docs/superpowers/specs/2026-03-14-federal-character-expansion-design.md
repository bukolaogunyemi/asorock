# Federal Character Expansion — Design Spec

**Sub-Project C** of the Aso Rock game feature roadmap (A through F).

**Goal:** Expand the federal character principle from constitutional officers (already built) into a comprehensive scoring and constraint layer that tracks zonal balance across all federal appointments (cabinet, agencies, ambassadors) and budget allocation, creating real gameplay tension when the player must balance regional equity against competence, godfather demands, and political expediency.

---

## 1. Core Architecture

The Federal Character system is a **scoring and constraint layer** that sits on top of the appointment and budget systems. It has two components:

### 1.1 Appointment Balance

Tracks the zonal distribution of all federal appointments across four categories: cabinet ministers, agency/board heads, ambassadors, and constitutional officers (already built). Each appointment has a prestige weight. The system calculates a compliance score per zone and an overall Federal Character Compliance Score.

### 1.2 Budget Balance

During each budget cycle (Legislative Engine integration), tracks the regional distribution of discretionary spending. Zones that receive disproportionately low spending generate grievance; zones that receive disproportionately high spending generate resentment from others. Revenue-generating zones (SS oil region) may argue they deserve more — this creates a legitimate policy debate, not just a balance sheet exercise.

**Dependency note:** The budget balance component requires the Legislative Engine (Sub-Project A) to be built first. Specifically, it consumes a `BudgetAllocation` from budget bills — an array of `{ zone: string; amount: number }` entries representing discretionary spending per zone. The Federal Character system reads this data after budget passage; it does not generate or modify budget content. Until Sub-Project A is implemented, the budget balance component defaults to a neutral 16.7% per zone (no penalty, no bonus), and only appointment balance drives the compliance score.

### 1.3 Advisory Layer

The Political Adviser surfaces the compliance score in briefings and warns before the player makes appointments that would worsen imbalance. The system runs passively — it doesn't block anything, but consequences escalate with imbalance.

---

## 2. Appointment Categories & Prestige

### 2.1 Four Tracked Categories

| Category | Positions | Prestige Tier | Source |
|----------|-----------|---------------|--------|
| Constitutional Officers | Senate President, Deputy Senate President, Speaker, Deputy Speaker, CJN | Strategic | Already built — auto-populated from zones |
| Cabinet Ministers | 20 ministries (see list below) | Strategic for top 5, Standard for rest | Existing cabinet system, expanded candidate pools |
| Agency/Board Heads | 12 agencies (see list below) | Strategic for top 4, Standard for rest | New candidate pools |
| Ambassadors | 10 postings (see list below) | Prestige for major 5, Routine for rest | New candidate pools |

**Cabinet ministries (20):**
Strategic: Finance, Defence, Petroleum, Interior, Justice (Attorney General)
Standard: Foreign Affairs, Health, Education, Works & Housing, Agriculture, Trade & Investment, Transportation, Communications & Digital Economy, Power, Water Resources, Labour & Employment, Science & Technology, Environment, Mines & Steel, FCT

**Agency/board heads (12):**
Strategic: CBN Governor, NNPC GMD, EFCC Chairman, INEC Chairman
Standard: NPA Managing Director, NDDC Managing Director, FIRS Chairman, NIMASA DG, NCC Executive Vice-Chairman, NIMC DG, NSA, NEMA DG

**Ambassador postings (10):**
Prestige: United States, United Kingdom, United Nations, China, African Union
Routine: France, Saudi Arabia, South Africa, Germany, India

### 2.2 Prestige Weighting

- **Strategic (×3)** — Finance Minister, Defence Minister, Petroleum Minister, CBN Governor, NNPC GMD, and constitutional officers. These are the positions zones fight hardest over.
- **Standard (×2)** — Most cabinet seats and mid-tier agency heads.
- **Routine (×1)** — Junior ambassadorships, smaller boards.

The prestige weighting means a player can't game the system by giving a zone five ambassadorships and zero cabinet seats.

### 2.3 Candidate Pools

Pools are organized as `Record<PositionId, AppointmentCandidate[]>`, with each position having candidates spread across zones.

- **Cabinet** — Uses existing character pools from `handcraftedCharacters.ts`, expanded with more zone diversity. Strategic ministries get 2-3 candidates per zone (12-18 per ministry). Standard ministries get 1-2 per zone (6-12 per ministry).
- **Agency/Board heads** — New curated pools: 2-3 candidates per zone per position (12-18 per agency). Organized in `appointmentPools.ts`.
- **Ambassadors** — Lighter pools: 1-2 candidates per zone per posting (6-12 per posting). Organized in `appointmentPools.ts`.
- **Constitutional officers** — Already handled by the existing system with 150 candidates.

**Diversity rules** (matching constitutional officers precedent):
- Each position's pool must have at least 2 women per zone
- Each position's pool must have at least 2 candidates of each major religion (Christianity, Islam) per zone
- Candidates have full stats: name, state, zone, competence (30-95), loyalty (30-90), age, gender, religion

Total new content: ~80-100 new characters across agency and ambassador pools, plus expanding existing cabinet pools with ~40-60 additional characters for zonal diversity.

---

## 3. Compliance Score & Consequences

### 3.1 Score Calculation

The **Federal Character Compliance Score** (0-100, where 100 = perfectly balanced) is calculated from two components:

**Per-zone appointment calculation:**
- Each zone has an expected share of ~16.7% (1/6) of total prestige-weighted appointments.
- Zone's weighted appointments / Total weighted appointments = actual share.
- Deviation = |actual share - expected share|.
- Zones far below their expected share generate grievance; zones far above generate resentment from others.

**Budget balance component:**
- During budget cycles, discretionary spending (infrastructure, development projects, special interventions) is tagged by primary beneficiary zone.
- The ratio of spending per zone vs. the ideal contributes a second dimension to the compliance score.
- Revenue-generating zones (SS oil region) may argue they deserve more — creating legitimate policy tension.

The overall score is a weighted average: 70% appointment balance + 30% budget balance. Appointment balance dominates because it's more directly under the player's control and more politically visible.

### 3.2 Consequence Escalation

| Imbalance Level | Score Range | Game State Effects |
|----------------|-------------|-------------------|
| Balanced | 85-100 | `factionGrievance` -2 per turn for all zones. `approval` +1 in underrepresented zones. Adviser praises balance. |
| Mild imbalance | 70-84 | Adviser notes imbalance in briefings. No mechanical penalty. Warning only. |
| Moderate imbalance | 45-69 | `factionGrievance` +3 per turn for each underrepresented zone. Legislative Engine vote modifier: -5 votes from affected zone's legislators on bills. `outrage` +2 in affected zones. Media event chain: "Federal character controversy." |
| Severe imbalance | Below 45 | Crisis event fires (rendered via event chain system). `factionGrievance` +8 per turn for shut-out zones. `approval` -5 per turn in affected zones. `stability` -3 per turn. Legislative boycott threat: affected zone's legislators abstain from all votes until addressed. |

### 3.3 The Godfather Intersection

A godfather demands the player appoint their person (from the NW) as Finance Minister. But the NW already has 3 strategic appointments and the SE has zero. Honouring the godfather deal worsens federal character compliance, which increases SE faction grievance. Refusing the godfather risks escalation. The Adviser warns: "Honouring this deal would drop SE representation to zero strategic positions." This is the kind of impossible choice that makes the game interesting.

---

## 4. Data Model

### 4.1 Federal Character State

```typescript
interface FederalCharacterState {
  appointments: FederalAppointment[];
  complianceScore: number;           // 0-100, overall balance
  zoneScores: Record<string, ZoneBalance>;  // per-zone breakdown
  budgetAllocation: Record<string, number>;  // zone → % of discretionary spending
}

interface FederalAppointment {
  positionId: string;
  positionName: string;
  category: "constitutional-officer" | "cabinet" | "agency" | "ambassador";
  prestigeTier: "strategic" | "standard" | "routine";  // ×3, ×2, ×1
  appointeeId: string | null;       // character ID, null if vacant
  appointeeZone: string | null;     // geopolitical zone
  godfatherLinked?: string;         // godfather ID if this appointment services a deal
}

interface ZoneBalance {
  zone: string;
  weightedAppointments: number;     // sum of prestige-weighted appointments
  expectedShare: number;            // ~16.7%
  actualShare: number;              // current percentage
  deviation: number;                // how far off ideal (negative = underrepresented)
  grievanceContribution: number;    // how much this feeds into faction grievance
}
```

### 4.2 Appointment Candidate

```typescript
interface AppointmentCandidate {
  characterId: string;
  name: string;
  zone: string;
  state: string;
  competence: number;
  loyalty: number;
  gender: string;
  religion: string;
  godfatherId?: string;             // if this candidate is a godfather's protégé
  qualifiedFor: string[];           // position IDs this candidate is eligible for
}
```

---

## 5. Files & Integration Points

### New Files
- `client/src/lib/federalCharacter.ts` — compliance score calculation, balance checking, consequence triggers
- `client/src/lib/federalCharacter.test.ts` — unit tests
- `client/src/lib/federalCharacterTypes.ts` — TypeScript interfaces (FederalCharacterState, FederalAppointment, ZoneBalance, etc.)
- `client/src/lib/appointmentPools.ts` — candidate pools for agencies and ambassadors (~80-100 handcrafted characters with zone, competence, loyalty, and other stats)

### Modified Files
- `client/src/lib/gameTypes.ts` — add `FederalCharacterState` to `GameState`
- `client/src/lib/GameContext.tsx` — initialize federal character state, recalculate compliance on appointment changes
- `client/src/lib/gameEngine.ts` — federal character check runs each turn, triggers consequences at threshold crossings
- `client/src/components/CabinetTab.tsx` — add federal character panel: overall compliance score (0-100 with color indicator), per-zone balance table (zone name, weighted count, deviation, status icon), and zone badge on each candidate during appointment selection. When the player is choosing a candidate, show a preview: "Appointing this candidate would change NW balance from 18% → 22% and SE balance from 12% → 12%."
- `client/src/lib/handcraftedCharacters.ts` — expand cabinet candidate pools with more zonal diversity

### Integration with Other Sub-Projects
- **Legislative Engine (A):** Budget bills include zonal spending allocation. Federal character score affects legislator willingness to support budgets (underrepresented zones vote against). Constitutional amendment bills on federal character can be sponsored by aggrieved factions.
- **Godfather System (B):** Godfather appointment demands are checked against compliance score. The Adviser warns when honouring a deal would worsen imbalance. Godfather protégé candidates appear in candidate pools with `godfatherId` linking. Interface contract: the Federal Character system exposes `getComplianceImpact(zone: string, prestigeTier: string): number` so the Godfather system can preview compliance impact before proposing deals. The `godfatherLinked` field on `FederalAppointment` is set when an appointment satisfies a godfather deal, allowing the system to flag which appointments are patronage-driven.
- **Intelligence (D):** Intelligence can reveal that a "qualified" candidate is actually a godfather plant, or that an appointee is working against the player's interests.
- **Party Internals (E):** Party factions organized along zonal lines pressure for their zone's representation. Zonal imbalance erodes party unity.
- **Economic Crisis (F):** Budget allocation imbalance can worsen economic conditions in neglected zones, triggering regional economic crises.
