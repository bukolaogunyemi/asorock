# Aso Rock — Developer Handover Document

**Game**: Aso Rock — Nigerian Presidential Governance Simulation  
**Status**: Prototype / Design Reference (all data is hardcoded)  
**Last Updated**: March 2026  
**Created by**: ailopin.co  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Game State & Data Model](#5-game-state--data-model)
6. [Game Engine](#6-game-engine)
7. [Onboarding Flow](#7-onboarding-flow)
8. [Main Game UI](#8-main-game-ui)
9. [Victory & Defeat System](#9-victory--defeat-system)
10. [Event Chain System](#10-event-chain-system)
11. [Character Trait System](#11-character-trait-system)
12. [UI Components & Design System](#12-ui-components--design-system)
13. [Design Requirements & Constraints](#13-design-requirements--constraints)
14. [Known Bugs & Incomplete Features](#14-known-bugs--incomplete-features)
15. [Build & Deploy](#15-build--deploy)
16. [Development Priorities](#16-development-priorities)

---

## 1. Project Overview

Aso Rock is a political strategy simulation game where the player takes on the role of the President of Nigeria. The game proceeds on a **day-by-day** turn system (not weekly). The player navigates economic crises, security threats, political intrigue, diplomatic challenges, and media management while trying to achieve one of 5 victory conditions and avoid 6 failure states.

### Core Gameplay Loop

1. Player creates their president (name, age, traits, party, era, VP selection)
2. Goes through a multi-step onboarding (election night, inauguration, appointments, intel briefing, media chat)
3. Enters the main dashboard with 11 tabs covering all aspects of governance
4. Each day: review events in the Inbox/Office, make decisions, manage crises
5. Click "Proceed" to advance to the next day (blocked if critical decisions are pending)
6. Game ends when a victory condition is met OR a failure state triggers

### Current State

This is a **UI prototype with a functional game engine skeleton**. All data (cabinet members, economic indicators, security threats, events, etc.) is **hardcoded** in `gameData.ts`. The game engine processes turns with random drift, random events, delayed consequences, and victory/defeat checks. But there is no persistent backend — everything resets on page refresh.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3.1 |
| Build Tool | Vite | 7.3.0 |
| Language | TypeScript | 5.6.3 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | shadcn/ui (Radix primitives) | Various |
| Charts | Recharts | 2.15.2 |
| Animation | Framer Motion | 11.13.1 |
| Icons | Lucide React | 0.453.0 |
| Routing | Wouter (hash-based) | 3.3.5 |
| State | React Context + useReducer | — |

### Key Dependencies
- `wouter` with `useHashLocation` — required for iframe-compatible routing
- `framer-motion` — used for page transitions in onboarding and victory/defeat overlay
- `recharts` — all charts (line, bar, pie, radar, area) across Economy, Security, Media, Legacy tabs
- `shadcn/ui` — Card, Badge, Button, Tabs, Toast, Dialog, Input, Label, etc.

### No Backend Required
This is a purely client-side application. There is no server, no database, no API. Just `npm install && npm run dev`.

---

## 3. Project Structure

```
aso-rock/
├── client/
│   ├── index.html                     # Entry HTML
│   └── src/
│       ├── main.tsx                   # React root mount
│       ├── App.tsx                    # Top-level router + dark mode + providers
│       ├── pages/
│       │   ├── Home.tsx               # Main game page (tab navigation, news ticker, Proceed button)
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── OnboardingFlow.tsx      # ★ LARGEST FILE (1,674 lines) — entire onboarding sequence
│       │   ├── DashboardTab.tsx        # Home/overview dashboard (777 lines)
│       │   ├── PoliticsTab.tsx         # Power brokers, factions, timeline (552 lines)
│       │   ├── EconomyTab.tsx          # Macro metrics, revenue, budget, CBN, markets (522 lines)
│       │   ├── DecisionsTab.tsx        # Active events + quick actions (492 lines, "Office" tab)
│       │   ├── SecurityTab.tsx         # Threats, theaters, personnel (423 lines)
│       │   ├── DiplomacyTab.tsx        # Relations, trade, personnel (417 lines)
│       │   ├── MediaTab.tsx            # Sentiment, narratives, personnel (364 lines)
│       │   ├── LegislatureTab.tsx      # Senate/House composition, bills (341 lines)
│       │   ├── LegacyTab.tsx           # Legacy score, milestones, approval history (340 lines)
│       │   ├── JudiciaryTab.tsx        # Court cases, independence meter (309 lines)
│       │   ├── CabinetTab.tsx          # Minister cards with competency bars (234 lines)
│       │   ├── PublicAffairsTab.tsx    # Regional approval, governors (281 lines)
│       │   ├── TopBar.tsx             # Header with approval/treasury/security cards
│       │   ├── InboxPanel.tsx         # Slide-over inbox with messages
│       │   ├── CompetencyBar.tsx      # Color-coded mini-bars (replaces star ratings)
│       │   ├── CharacterAvatar.tsx    # Avatar circle with initials
│       │   ├── VictoryDefeatOverlay.tsx # End-game screen
│       │   ├── PerplexityAttribution.tsx # "a product of ailopin.co" footer
│       │   ├── RelationshipIndicator.tsx # Loyalty/relationship visual
│       │   ├── TrendIcon.tsx          # Up/down/stable arrow
│       │   ├── StarRating.tsx         # DEPRECATED — replaced by CompetencyBar
│       │   └── ui/                    # shadcn/ui primitives (do not edit directly)
│       ├── lib/
│       │   ├── GameContext.tsx         # ★ React context + reducer (state management)
│       │   ├── gameEngine.ts          # ★ Turn processing, consequences, random events
│       │   ├── gameData.ts            # ★ All hardcoded game data (668 lines)
│       │   ├── victorySystem.ts       # ★ 5 victory paths + 6 failure states
│       │   ├── eventChains.ts         # ★ 6 branching narrative event chains (824 lines)
│       │   ├── traits.ts             # ★ 12 character traits with mechanical effects
│       │   ├── queryClient.ts         # React Query client (unused/minimal)
│       │   └── utils.ts              # cn() utility for className merging
│       └── hooks/
│           ├── use-toast.ts           # Toast notification hook
│           └── use-mobile.tsx         # Mobile detection hook
├── dist/                              # Build output (static files)
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── tsconfig.json
```

---

## 4. Architecture Overview

### State Management

```
App.tsx
 └─ GameProvider (React Context + useReducer)
     ├─ state.phase === "setup"  → OnboardingFlow
     ├─ state.phase === "playing" → Home (main game)
     └─ state.phase === "victory"|"defeat" → VictoryDefeatOverlay
```

The entire game state lives in a single `GameState` object managed by `useReducer` in `GameContext.tsx`. There are 5 action types:

| Action | Description |
|--------|-------------|
| `START_CAMPAIGN` | Initialize game state from onboarding config |
| `END_DAY` | Process one turn (consequences → drift → random events → court cases → stress → outrage → victory/defeat check → advance date) |
| `ADD_CONSEQUENCE` | Queue a delayed consequence |
| `APPLY_EFFECTS` | Immediately apply effects (used for player decisions) |
| `RESET` | Return to setup phase |

### Routing

- Uses `wouter` with `useHashLocation` for iframe-compatible hash-based routing
- Currently only one route: `/` → Home component
- The game phase (`setup`, `playing`, `victory`, `defeat`) determines which top-level component renders — not the router

### Dark Mode

- Managed via `useState` + `useEffect` in `App.tsx`
- Toggles `.dark` class on `document.documentElement`
- **No localStorage** — dark mode resets on refresh (intentional constraint for iframe sandboxing)

### Critical Constraint: No Storage APIs

The game is designed to run in a sandboxed iframe. **Do not use**:
- `localStorage`
- `sessionStorage`
- `indexedDB`
- Cookies

All state must be in-memory React state or passed as URL params.

---

## 5. Game State & Data Model

### Core Metrics (0–100 unless noted)

| Metric | Range | Description |
|--------|-------|-------------|
| `approval` | 0–100 | Public approval rating |
| `treasury` | Float (₦ trillions) | Government liquid funds |
| `politicalCapital` | 0–100 | Ability to push through decisions |
| `stability` | 0–100 | National stability index |
| `outrage` | 0–100 | Public anger level |
| `trust` | 0–100 | Institutional trust |
| `stress` | 0–100 | Presidential stress (HIDDEN from player — internal engine variable only) |
| `health` | 0–100 | Presidential health |
| `judicialIndependence` | 0–100 | How independent the judiciary is |

### President Properties

```typescript
presidentName: string
presidentOrigin: string      // Background archetype ("Lagos Politician", etc.)
presidentTraits: string[]    // Selected during onboarding
presidentAge: number
presidentGender: string      // Stored but NOT displayed
presidentState: string       // Nigerian state of origin
presidentEducation: string
presidentParty: string       // APC, PDP, LP, NNPP, APGA
presidentEra: string         // "1999", "2007", "2015", "2023"
```

### Characters (NPC Key Figures)

```typescript
interface CharacterState {
  name: string
  portfolio: string           // Their role/title
  loyalty: number             // 0–100
  competence: number          // 0–100
  ambition: number            // 0–100
  faction: string             // Which faction they belong to
  relationship: "Loyal" | "Friendly" | "Neutral" | "Wary" | "Distrustful" | "Hostile"
  avatar: string              // 2-letter initials
  traits: string[]            // From trait system
  betrayalThreshold: number   // Loyalty below this → risk of betrayal
  hooks: Hook[]               // Blackmail/leverage material
}
```

### Factions

7 factions: Northern Caucus, South-West Alliance, South-East Bloc, Presidential Guard, Military Circle, Technocrats, Youth Movement. Each has `influence` (static weight) and `loyalty` (dynamic, starts at 50).

### Other State
- `governors: GovernorState[]` — 6 zonal governors
- `activeCases: CourtCase[]` — 5 initial court cases that count down to decisions
- `activeChains: EventChainInstance[]` — Tracks multi-step narrative events
- `pendingConsequences: Consequence[]` — Queued effects with delay timers
- `turnLog: TurnLogEntry[]` — History of events and effects

---

## 6. Game Engine

**File**: `client/src/lib/gameEngine.ts`

### Turn Processing (`processTurn`)

Called when the player clicks "Proceed". Executes in this order:

1. **Process due consequences** — Any `pendingConsequences` with `delayDays <= 0` are applied. Others have their delay decremented.
2. **Metric drift** — Small random changes to all core metrics (±0.5 approval, ±0.02 treasury, etc.)
3. **Random event generation** — 8 possible random events, each with a probability. Stress > 50 increases negative event probability by 30%.
4. **Advance court cases** — Decrement `daysToDecision`; cases at 0 become "Decided"
5. **Stress effects** — If stress > 50, approval drops slightly. If stress > 70, drops more.
6. **Outrage effects** — If outrage > 80, both approval and stability decay.
7. **Victory/defeat check** — If any victory path reaches 100% → victory. If any failure risk reaches 100% → defeat.
8. **Advance day + date** — Increment day counter, advance the date string by 1 day.

### Effect System

Effects modify the game state through a `target` + `delta` model:

```typescript
interface Effect {
  target: "approval" | "treasury" | "stability" | "outrage" | "trust" | "stress" | "politicalCapital" | "character" | "faction" | "metric"
  characterName?: string  // For character-targeted effects
  factionName?: string    // For faction-targeted effects
  delta: number           // Amount to add (negative for decrease)
  description: string     // Human-readable description
}
```

### Consequences (Delayed Effects)

```typescript
interface Consequence {
  id: string
  sourceEvent: string     // Which event caused this
  delayDays: number       // How many turns before it fires
  effects: Effect[]
  description: string
}
```

### Date Format

Dates are stored as human-readable strings: `"29 May 2023"`, `"14 March 2025"`. The `advanceDate()` function parses and increments by 1 day.

---

## 7. Onboarding Flow

**File**: `client/src/components/OnboardingFlow.tsx` (1,674 lines)

This is the largest single file and handles the entire pre-game sequence. It's a 12-step wizard:

| Step | Title | Description |
|------|-------|-------------|
| 0 | Intro Cinematic | Title screen with coat of arms animation, "Begin Your Presidency" button |
| 1 | Who Are You? | First name, last name, age (number input), gender, state of origin, education |
| 2 | Define Your Character | Select 3 personality traits, 2 ideologies, and difficulty level (easy/standard/hard/nightmare) |
| 3 | Choose Your Party & Era | Select political party (5 options) and starting era (1999/2007/2015/2023) |
| 4 | Choose Your Running Mate | 5 VP candidates displayed as dossier cards with competency bars, traits, bio (Education/Family/Career structured fields) |
| 5 | Election Night | Animated vote count with regional breakdown, newspaper headline reveal |
| 6 | Newspaper Headlines | Post-election press coverage |
| 7 | Inauguration Day | Select 3 campaign promises from a list |
| 8 | Choose Your Personal Assistant | 4 PA candidates in dossier format |
| 9 | Key Appointments | Appoint Chief of Staff, SSA Intel, and other positions from candidate pools |
| 10 | Intelligence Briefing | Multi-section classified briefing on threats, economy, politics |
| 11 | First Media Chat | Simulated press conference with 3 questions, each with 3 response options |

### Critical Design Rules for Onboarding

- **Age field**: Must be a number input, initialized to empty string `""` (not `"0"`), converted to number only at save time
- **Gender**: Stored in state but **NEVER displayed** on any candidate profile (VP, PA, appointments)
- **Candidate profiles**: Always show **3–5 character traits** per candidate
- **Bio format**: Structured into dossier fields (Education, Family, Career) — NOT a wall of text
- **Media chat responses**: Must **NOT be color-coded** (no green/red/yellow indicating good/bad). Player should judge on their own merit.
- **Media chat response order**: Must be **randomized per question** (not always in the same order)
- **Difficulty selection**: Appears in Step 2 alongside traits/ideologies. Three levels modify starting approval multiplier and crisis frequency.

### How Onboarding Feeds into Game State

At the end of Step 11, `startCampaign(config)` is called with a `CampaignConfig` object. This triggers `initializeGameState()` which:
1. Applies origin modifiers (e.g., "Lagos Politician" gives +5 approval, +0.1 treasury)
2. Sets the starting date based on selected era
3. Builds the character map from `cabinetRoster` + `characters` arrays
4. Initializes all factions at loyalty 50
5. Sets up default governors, court cases
6. Transitions game phase from `"setup"` to `"playing"`

---

## 8. Main Game UI

**File**: `client/src/pages/Home.tsx`

### Layout Structure

```
┌─────────────────────────────────────┐
│ TopBar (Aso Rock title, date,       │
│   inbox button, dark mode toggle)   │
│ ┌─ Approval ─┐┌─ Treasury ─┐┌─ Security ─┐
│ │  43% (↓2)  ││ ₦1.1T      ││  Elevated   │
│ └────────────┘└─────────────┘└─────────────┘
├─────────────────────────────────────┤
│ News Ticker (scrolling headlines)   │
├─────────────────────────────────────┤
│ Tab Bar: Home │ Office │ Cabinet │  │
│  Politics │ Economy │ Security │    │
│  Legislature │ Judiciary │          │
│  Diplomacy │ Media │ Public │       │
│  Legacy                  [Proceed →]│
├─────────────────────────────────────┤
│                                     │
│  Active Tab Content                 │
│                                     │
├─────────────────────────────────────┤
│ "a product of ailopin.co"           │
└─────────────────────────────────────┘
```

### Tab Navigation

- "Home" (Dashboard icon) is a **Button**, not a TabsTrigger — it's outside the TabsList
- All other tabs use shadcn `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`
- The "Proceed" button is in the tab bar row, separated by a divider
- **Proceed is disabled** when there are unresolved critical events

### Tab Breakdown

| Tab Name | Component | Sub-tabs | Key Content |
|----------|-----------|----------|-------------|
| Home | DashboardTab | None | Overview cards, president profile, faction loyalty, quick actions, governor map |
| Office | DecisionsTab | None | Active events with 3 choices each, quick action buttons |
| Cabinet | CabinetTab | None | Grid of minister cards with competency bars, loyalty, traits |
| Politics | PoliticsTab | Overview, Power Brokers, Factions, Timeline | Power dynamics, political events, faction influence |
| Economy | EconomyTab | Overview, Revenue, Budget, CBN, Markets | Macro metrics, charts, policy levers, personnel |
| Security | SecurityTab | Overview, Theaters, Procurement, Personnel | Threat radar, theater effectiveness, incidents chart |
| Legislature | LegislatureTab | None | Senate/House composition, whip tracker, active bills |
| Judiciary | JudiciaryTab | None | Court cases, independence meter |
| Diplomacy | DiplomacyTab | None | Relations table, trade pipeline, personnel |
| Media | MediaTab | None | Sentiment chart, narratives, headlines, personnel |
| Public Affairs | PublicAffairsTab | None | Regional approval, governors |
| Legacy | LegacyTab | None | Legacy score, pillar breakdown, approval history, milestones |

### Sub-tab System

Economy, Security, and Politics tabs use internal sub-tab navigation. Each sub-tab renders **distinct content** — they are NOT duplicating the same view. The sub-tab state is managed with local `useState` within each tab component.

---

## 9. Victory & Defeat System

**File**: `client/src/lib/victorySystem.ts`

### 5 Victory Paths

| ID | Name | Key Conditions | Color |
|----|------|---------------|-------|
| `economic-miracle` | Economic Miracle | High treasury, stability, time in office | Nigerian green |
| `security-champion` | Security Champion | High stability, approval, trust | Blue |
| `democratic-legacy` | Democratic Legacy | High approval, trust, judicial independence | Gold |
| `regional-hegemon` | Regional Hegemon | High political capital, trust, time | Purple |
| `party-machine` | Party Machine | High faction loyalty, political capital, approval | Pink |

Each path has a `progressFn` that calculates a 0–100 progress score from the current game state. When any path reaches **100**, the game enters the `"victory"` phase.

### 6 Failure States

| ID | Name | Key Risk Factors |
|----|------|-----------------|
| `economic-collapse` | Economic Collapse | Low treasury, low stability, high outrage |
| `military-coup` | Military Coup | Low stability, low CDS loyalty, low approval |
| `popular-revolution` | Popular Revolution | Low approval, high outrage, low trust |
| `party-removal` | Party Removal | Low party chairman loyalty, low faction loyalty, low political capital |
| `international-pariah` | International Pariah | Low trust, high outrage, low stability |
| `health-crisis` | Health Crisis | Stress directly maps to risk (stress = risk percentage) |

When any failure risk reaches **100**, the game enters the `"defeat"` phase.

### Progress & Risk Display

Both victory progress and failure risks are recalculated after every state change (turn processing, player decisions) and stored in `state.victoryProgress` and `state.failureRisks`. These are displayed in the Legacy tab and Dashboard.

---

## 10. Event Chain System

**File**: `client/src/lib/eventChains.ts` (824 lines)

6 multi-step branching narrative event chains:

| Chain | Category | Trigger Condition |
|-------|----------|------------------|
| Governors' Rebellion | Crisis | stability < 45 |
| The Whistleblower | Intrigue | trust < 40 |
| The General's Gambit | Crisis | stability < 40 AND approval < 35 |
| ECOWAS Crisis | Diplomacy | trust >= 30 |
| Fuel Price Riots | Crisis | outrage > 55 |
| Party Schism | Intrigue | politicalCapital < 40 |

### Chain Structure

Each chain has:
- **Trigger conditions**: Metric thresholds that activate the chain
- **Steps**: Narrative text + 2-3 choices
- **Branching**: Each choice leads to a different next step or ends the chain
- **Consequences**: Each choice applies immediate effects to game state metrics
- **Requirements**: Some choices require minimum metric values (e.g., politicalCapital >= 50)

### Example Flow (Governors' Rebellion)

```
Step 1: Six governors threaten fiscal revolt
  ├─ Choice A: Negotiate → Step 2a (compromise formula)
  ├─ Choice B: Freeze funds → Step 2b (crisis escalates)
  └─ Choice C: Deploy EFCC → Step 2c (corruption raid)
       └─ Step 2c: EFCC finds ₦47B
            ├─ Prosecute regardless → Chain End
            └─ Negotiate quietly → Chain End
```

### Integration Note

The event chain system is **defined but not fully integrated** into the UI. The `getTriggeredChains()` function exists to check which chains should fire based on current state, but the DecisionsTab currently uses the hardcoded `activeEvents` from `gameData.ts` instead of dynamically triggered chains. **This is a priority area for development.**

---

## 11. Character Trait System

**File**: `client/src/lib/traits.ts` (267 lines)

### 12 Traits

| Trait | Category | Loyalty Drift | Competence Mod | Betrayal Mod |
|-------|----------|:---:|:---:|:---:|
| Ambitious | Personality | -0.3/turn | ×1.1 | -10 |
| Loyal | Personality | +0.4/turn | ×1.0 | +15 |
| Corrupt | Personality | -0.2/turn | ×0.8 | -5 |
| Competent | Competence | 0/turn | ×1.25 | 0 |
| Hawkish | Ideology | 0/turn | ×1.0 | -3 |
| Dovish | Ideology | +0.1/turn | ×1.0 | +5 |
| Populist | Ideology | -0.1/turn | ×0.9 | -5 |
| Technocrat | Ideology | 0/turn | ×1.2 | 0 |
| Schemer | Personality | -0.4/turn | ×1.05 | -12 |
| Honest | Personality | +0.2/turn | ×1.0 | +10 |
| Zealous | Ideology | +0.1/turn | ×1.1 | -8 |
| Pragmatic | Ideology | 0/turn | ×1.05 | +3 |

### Trait Mechanics

- **Loyalty Drift**: Applied per turn to shift character loyalty
- **Competence Modifier**: Multiplier on competence-based outcomes
- **Betrayal Modifier**: Added to betrayal threshold (negative = more likely to betray)
- **Conflicts**: Some traits are mutually exclusive (e.g., Ambitious ↔ Loyal, Hawkish ↔ Dovish)

### Betrayal Risk Calculation

```
adjustedThreshold = base betrayalThreshold + sum(trait betrayal modifiers)
loyaltyGap = adjustedThreshold - currentLoyalty
risk = loyaltyGap × (ambition / 100) × stressFactor × 2
isAtRisk = loyalty < adjustedThreshold AND ambition > 70
```

**Note**: The trait drift and betrayal systems are **defined but not yet actively called** during turn processing. The `processTurn` function doesn't currently invoke `getTraitEffect` or `checkBetrayalRisk`. This needs to be wired up.

---

## 12. UI Components & Design System

### Color Palette

| Role | HSL | Usage |
|------|-----|-------|
| Nigerian Green | `hsl(153, 60%, 32%)` | Primary buttons, accent, charts |
| Gold | `hsl(42, 70%, 50%)` | Accent, highlights, warnings |
| Red | `hsl(0, 60%, 50%)` | Destructive, critical severity |
| Blue | `hsl(200, 60%, 45%)` | Chart secondary, info |
| Purple | `hsl(280, 50%, 50%)` | Chart tertiary |

### Competency Bars (replaces star ratings)

```
90+  → Expert    → Green  (bg-emerald-500)
70–89 → Excellent → Blue   (bg-blue-500)
50–69 → Good      → Gold   (bg-[hsl(42,70%,50%)])
30–49 → Fair      → Amber  (bg-amber-500)
<30   → Weak      → Red    (bg-red-500)
```

Three variants exported from `CompetencyBar.tsx`:
- `CompetencyBar` — Full-size bar with label, fill bar, and numeric value (used in cabinet/personnel cards)
- `CompetencyBarSmall` — Compact bar for 1–5 scale (used in onboarding VP/PA selection)
- `SentimentIndicator` — 5-dot pip display for loyalty/sentiment on a 1–5 scale

### Toast Notifications

All action buttons use shadcn toasts with a `continue_conversation:` prefix in the description for action context. Example:

```typescript
toast({
  title: "Deploy Air Support",
  description: "continue_conversation: Authorise 2 additional attack helicopters..."
});
```

### Dark Mode

CSS variables in `index.css` with `:root` (light) and `.dark` (dark) blocks. The dark theme uses deep green/charcoal backgrounds with warm gold foreground accents.

### Typography

- Primary font: `General Sans`, fallback `Inter`
- Serif: Georgia
- Mono: JetBrains Mono

### Animations

- Onboarding uses `framer-motion` `AnimatePresence` for step transitions
- News ticker uses CSS `@keyframes` scroll animation
- Charts use Recharts built-in animations

---

## 13. Design Requirements & Constraints

These are explicit requirements from the game designer that must be maintained:

### Hard Rules

1. **No gender display** on any candidate/personnel profile (VP, PA, CoS, ministers, etc.). Gender is stored internally but never shown to the player.
2. **3–5 traits per candidate** on all profiles.
3. **Media chat responses are NOT color-coded**. No green/red/yellow indicating "good" or "bad" responses. The player must use their own judgment.
4. **Media chat response order is randomized** per question.
5. **Stress is hidden from the player**. It is removed from the top bar and footer. It remains as an internal game engine variable affecting gameplay.
6. **No footer info bar**. The footer only contains "a product of ailopin.co".
7. **Proceed button** (not "End Day") sits in the tab bar next to Inbox. It is **disabled when critical decisions are pending**.
8. **Dashboard tab icon is Home** (house icon), not "Dashboard" text. The tab formerly called "Oval Office" is now just "Office".
9. **Bio fields are structured**: Education, Family, Career — not a wall of paragraph text.
10. **Sub-tabs must show distinct content** per sub-tab. Economy's "Overview" must differ from "Revenue", etc.
11. **No `localStorage` / `sessionStorage` / `indexedDB` / cookies** — sandboxed iframe environment.
12. **Day-by-day turns**, not weekly.
13. **Cabinet cards have no "High"/"Low" capacity indicators** in the corner.

### UI Preferences

- Dark, professional aesthetic — think "presidential briefing room"
- Responsive but desktop-first
- Compact information density — the player is a president receiving briefings
- Charts should be understated (muted colors, clean lines)
- News ticker should pause on hover

---

## 14. Known Bugs & Incomplete Features

### Bugs (Verified but Unfixed)

1. **Turn processing doesn't call trait system**: `processTurn()` doesn't invoke `getTraitEffect()` for loyalty drift, `checkBetrayalRisk()`, or competence modifiers. Traits are assigned but have no mechanical impact during gameplay.

2. **Event chains not dynamically triggered**: `DecisionsTab` uses hardcoded `activeEvents` from `gameData.ts` instead of the `eventChains.ts` dynamic system. `getTriggeredChains()` is never called. The 6 branching narrative chains exist in code but aren't surfaced to the player.

3. **Decisions don't persist consequences**: When a player picks a choice in DecisionsTab, the toast fires but no `APPLY_EFFECTS` or `ADD_CONSEQUENCE` action is dispatched to the game state. Decisions are cosmetic only.

4. **Random events only in turn log**: Random events generated during `processTurn` are logged to `turnLog` but not surfaced in the UI (no notification, no inbox message, no toast).

5. **Governor state is static**: Governors are initialized with defaults and never change. No mechanics modify governor loyalty, approval, or relationships.

6. **Court case outcomes have no effects**: Cases count down and reach "Decided" status, but no consequences are applied when a case is decided.

7. **Inbox messages are static**: The inbox shows a hardcoded set of messages. No new messages are generated based on game events.

8. **News ticker is static**: Headlines don't change based on game state or day number.

9. **Quick Actions are toast-only**: Dashboard quick actions (National Address, Reshuffle Cabinet, etc.) show a toast but don't modify game state.

10. **Hooks system unused**: `CharacterState` has a `hooks: Hook[]` field for blackmail/leverage mechanics, but no UI or engine logic references it.

11. **Victory/defeat progress formulas are simplistic**: Current formulas are placeholder linear calculations. They need to be more nuanced with compound conditions and thresholds.

12. **Difficulty levels expanded**: The onboarding defines 4 levels (easy, standard, hard, nightmare) with corresponding modifiers in GameContext. The engine applies `approvalMult` and `crisisFreqMult` from `difficultyModifiers` but these multipliers are not yet factored into `processTurn()`.

### Incomplete Features

1. **Save/load system**: No game state persistence. Everything resets on refresh. A save/load system is needed (could use URL-encoded state, server-side storage, or file export).

2. **Dynamic event generation**: Currently only 8 random events in a fixed pool. Need a system to generate contextual events based on current game state, active crises, faction relationships, etc.

3. **Cabinet reshuffle mechanics**: The "Reshuffle Cabinet" quick action exists in UI but there's no system for firing/hiring ministers and seeing the downstream effects.

4. **Dialogue/negotiation system**: No system for conversations with NPCs (governors, faction leaders, foreign diplomats). The media chat in onboarding is a template for this.

5. **Time-based content**: Economic indicators, headlines, narratives should evolve based on the current day and player decisions. Currently all data is static.

6. **Multiplayer/advisor mode**: No consideration for multiple players or AI advisors.

---

## 15. Build & Deploy

### Quick Start

```bash
npm install
npm run dev       # Vite dev server on http://localhost:5173
```

### Type Check

```bash
npm run check     # Runs tsc --noEmit (should report 0 errors)
```

### Production Build

```bash
npm run build     # Outputs to dist/
npm run preview   # Preview production build on http://localhost:5000
```

### Deploy

The `dist/` directory contains everything needed:
- `index.html` (entry point)
- `assets/` (JS bundles, CSS)

Upload to any static hosting: Vercel, Netlify, S3, GitHub Pages, etc. No server required.

### Build Configuration

- **Vite config** (`vite.config.ts`):
  - `root: client/` — source files live in `client/`
  - `base: "./"` — relative asset paths for any hosting path
  - `outDir: dist/`
  - Path alias: `@` → `client/src/`

- **Tailwind config** (`tailwind.config.ts`):
  - `darkMode: ["class"]`
  - Custom color system using CSS variables
  - Custom border radius, fonts, keyframes
  - Plugins: `tailwindcss-animate`, `@tailwindcss/typography`

---

## 16. Development Priorities

Recommended order for building out the actual game:

### Phase 1: Wire Up Core Mechanics

1. **Connect decisions to game state** — When player picks a choice in DecisionsTab, dispatch `APPLY_EFFECTS` with the choice's consequences. This is the most impactful single change.
2. **Wire trait system into turn processing** — Add loyalty drift, competence modifiers, and betrayal checks to `processTurn()`.
3. **Activate event chain triggers** — Call `getTriggeredChains()` during turn processing, surface triggered chains as new events in the UI.
4. **Apply court case outcomes** — When a case reaches "Decided", apply consequences to relevant metrics.

### Phase 2: Dynamic Content

5. **Dynamic event generation** — Replace/supplement the static random event pool with contextual events based on state.
6. **Dynamic news ticker** — Generate headlines from recent events and game state.
7. **Dynamic inbox messages** — Generate new messages based on events, faction moods, character actions.
8. **Evolving economic indicators** — Tie charts and data tables to actual game state changes.

### Phase 3: Depth Systems

9. **Cabinet reshuffle mechanics** — Full system for hiring/firing ministers with downstream effects.
10. **NPC dialogue system** — Conversation system with characters (governors, faction leaders, foreign leaders).
11. **Hooks/blackmail system** — Implement the evidence gathering and leverage mechanics.
12. **Governor mechanics** — Make governors responsive to player decisions, with demands and consequences.

### Phase 4: Polish & Persistence

13. **Save/load system** — State serialization and persistence.
14. **Tutorial/help system** — Onboarding tooltips, game mechanic explanations.
15. **Sound design** — Ambient sounds, notification sounds, event sounds.
16. **Mobile optimization** — Responsive design improvements for mobile play.

---

## Appendix A: Key Type Exports

For quick reference, the main types you'll work with:

```typescript
// From gameEngine.ts
GameState, Effect, Consequence, CharacterState, Hook, FactionState,
EventChainInstance, CourtCase, GovernorState, TurnLogEntry

// From GameContext.tsx
CampaignConfig, GameAction

// From victorySystem.ts
VictoryPath, FailureState, VictoryCheckState

// From eventChains.ts
EventChain, EventStep, EventChoice

// From traits.ts
Trait, TraitEffect, BetrayalRisk

// From gameData.ts
Character, IntriguePlot, TheaterRow, Bill, DiplomacyPartner, TradeDeal,
ActiveEvent, GameEvent, SecurityPersonnel, EconomicPersonnel,
MediaPersonnel, DiplomacyPersonnel, PowerBroker, PoliticalEvent,
LegacyMilestone
```

## Appendix B: File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| OnboardingFlow.tsx | 1,674 | Full onboarding wizard |
| eventChains.ts | 824 | 6 branching narrative chains |
| DashboardTab.tsx | 777 | Home/overview tab |
| gameData.ts | 668 | All hardcoded game data |
| PoliticsTab.tsx | 552 | Power brokers, factions |
| EconomyTab.tsx | 522 | Economy sub-tabs |
| DecisionsTab.tsx | 492 | Office / active events |
| gameEngine.ts | 456 | Core turn processing |
| SecurityTab.tsx | 423 | Security sub-tabs |
| DiplomacyTab.tsx | 417 | Diplomatic relations |
| MediaTab.tsx | 364 | Media sentiment |
| LegislatureTab.tsx | 341 | Senate/House |
| LegacyTab.tsx | 340 | Legacy scoring |
| GameContext.tsx | 324 | State management |
| JudiciaryTab.tsx | 309 | Court cases |
| CabinetTab.tsx | 234 | Minister grid |
| victorySystem.ts | 242 | Win/loss conditions |
| traits.ts | 267 | Character trait system |
| Home.tsx | 209 | Main page shell |
| **Total** | **~15,839** | **All source files** |
