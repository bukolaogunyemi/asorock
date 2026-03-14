import type {
  ActiveEvent,
  Consequence,
  GameInboxMessage,
  GameState,
  QuickActionDefinition,
} from "./gameTypes";

interface TriggerCondition {
  metric: "approval" | "treasury" | "stability" | "outrage" | "trust" | "stress" | "politicalCapital" | "judicialIndependence";
  comparator: ">" | "<" | ">=" | "<=";
  value: number;
}

interface ActiveEventTemplate extends Omit<ActiveEvent, "createdDay"> {
  triggerConditions?: TriggerCondition[];
  minDay?: number;
}

function mkC(
  id: string,
  source: string,
  description: string,
  effects: Consequence["effects"],
  delayDays = 0,
): Consequence {
  return { id, sourceEvent: source, description, effects, delayDays };
}

export const initialHeadlines = [
  "BREAKING: Senate debates Petroleum Industry Amendment after tense coalition lobbying",
  "CBN holds interest rate despite presidential pressure and market anxiety",
  "North-West governors demand emergency security summit with the Presidency",
  "Labour unions threaten coordinated strike over inflation and fuel prices",
  "Foreign reserves under pressure as import cover slips below five months",
  "ECOWAS capitals split over Nigeria's preferred Niger strategy",
] as const;

export const quickActionDefinitions: QuickActionDefinition[] = [
  {
    id: "national-address",
    label: "National Address",
    icon: "Mic",
    summary: "Shape the national narrative and steady nerves.",
    context: "Deliver a televised national address focused on unity and economic sacrifice.",
    consequences: [
      mkC("qa-address-now", "quick-action-national-address", "National address calms nerves", [
        { target: "approval", delta: 2, description: "Presidential visibility reassures supporters" },
        { target: "trust", delta: 2, description: "Institutions look coordinated" },
        { target: "stress", delta: 1, description: "The address consumes personal bandwidth" },
      ]),
      mkC("qa-address-followup", "quick-action-national-address", "Narrative discipline improves market mood", [
        { target: "stability", delta: 2, description: "Elite panic subsides" },
      ], 2),
    ],
  },
  {
    id: "reshuffle-cabinet",
    label: "Reshuffle Cabinet",
    icon: "Shuffle",
    summary: "Replace weak performers and reassert authority.",
    context: "Initiate a targeted cabinet reshuffle to tighten discipline and improve delivery.",
    consequences: [
      mkC("qa-reshuffle-now", "quick-action-reshuffle-cabinet", "Cabinet reshuffle shocks the system", [
        { target: "politicalCapital", delta: -6, description: "Patronage networks resist the shake-up" },
        { target: "approval", delta: 3, description: "Public sees decisive leadership" },
        { target: "character", characterName: "Chief Adaeze Okonkwo", delta: -10, description: "Threatened allies bristle" },
      ]),
      mkC("qa-reshuffle-later", "quick-action-reshuffle-cabinet", "Fresh appointees improve coordination", [
        { target: "stability", delta: 3, description: "The executive team executes more cleanly" },
        { target: "trust", delta: 2, description: "Reform-minded observers approve" },
      ], 3),
    ],
  },
  {
    id: "emergency-powers",
    label: "Emergency Powers",
    icon: "ShieldAlert",
    summary: "Trade liberty for temporary control.",
    context: "Invoke emergency powers for four weeks to centralize response authority.",
    consequences: [
      mkC("qa-emergency-now", "quick-action-emergency-powers", "Emergency decree centralizes power", [
        { target: "stability", delta: 6, description: "Security agencies act faster" },
        { target: "trust", delta: -6, description: "Civil society sees democratic backsliding" },
        { target: "outrage", delta: 5, description: "Opposition frames the move as authoritarian" },
        { target: "politicalCapital", delta: -2, description: "Elite coalitions grow wary" },
      ]),
    ],
  },
  {
    id: "cbn-directive",
    label: "CBN Directive",
    icon: "Landmark",
    summary: "Lean on the central bank and accept the blowback.",
    context: "Issue a forceful directive to the CBN to intervene on rates and foreign exchange.",
    consequences: [
      mkC("qa-cbn-now", "quick-action-cbn-directive", "Pressure on the CBN jolts markets", [
        { target: "treasury", delta: 0.06, description: "Short-term liquidity relief arrives" },
        { target: "trust", delta: -5, description: "Institutional independence erodes" },
        { target: "character", characterName: "Hajia Fatima Waziri", delta: -9, description: "The CBN governor resents interference" },
      ]),
      mkC("qa-cbn-later", "quick-action-cbn-directive", "Market suspicion lingers after intervention", [
        { target: "approval", delta: -2, description: "Critics call the move desperate" },
        { target: "stability", delta: -1, description: "Investors price in political risk" },
      ], 2),
    ],
  },
  {
    id: "state-visit",
    label: "State Visit",
    icon: "Plane",
    summary: "Spend time in the field to build trust and broker deals.",
    context: "Launch a high-profile domestic or foreign visit to show presence and extract concessions.",
    consequences: [
      mkC("qa-visit-now", "quick-action-state-visit", "The visit buys goodwill", [
        { target: "approval", delta: 2, description: "Visibility lifts morale" },
        { target: "trust", delta: 2, description: "Partners feel seen" },
        { target: "treasury", delta: -0.03, description: "Travel and commitments cost money" },
      ]),
      mkC("qa-visit-later", "quick-action-state-visit", "Diplomatic follow-through pays off", [
        { target: "politicalCapital", delta: 3, description: "New understandings improve leverage" },
      ], 3),
    ],
  },
  {
    id: "probe-commission",
    label: "Probe Commission",
    icon: "Search",
    summary: "Open a corruption probe to regain the initiative.",
    context: "Launch a presidential commission into procurement leakages and sabotage networks.",
    consequences: [
      mkC("qa-probe-now", "quick-action-probe-commission", "Anti-corruption optics improve", [
        { target: "trust", delta: 4, description: "Public sees seriousness" },
        { target: "politicalCapital", delta: -2, description: "Power brokers resist scrutiny" },
        { target: "character", characterName: "Chief Adaeze Okonkwo", delta: -7, description: "Petroleum interests panic" },
      ]),
      mkC("qa-probe-later", "quick-action-probe-commission", "Commission findings shake the elite", [
        { target: "approval", delta: 1, description: "The move helps with reform voters" },
        { target: "stability", delta: -1, description: "Insiders retaliate quietly" },
      ], 4),
    ],
  },
  {
    id: "take-a-break",
    label: "Take a Break",
    icon: "Coffee",
    summary: "Buy breathing room for yourself at a political cost.",
    context: "Retreat for a short reset to lower stress and regain composure.",
    consequences: [
      mkC("qa-break-now", "quick-action-take-a-break", "A short retreat lowers stress", [
        { target: "stress", delta: -6, description: "Personal recovery kicks in" },
        { target: "politicalCapital", delta: -1, description: "Opponents mock the retreat" },
      ]),
    ],
  },
];

export const openingEventTemplates: ActiveEventTemplate[] = [
  {
    id: "ae-pipeline-crisis",
    title: "Niger Delta Pipeline Crisis",
    severity: "critical",
    description: "Militants have sabotaged the Trans-Forcados pipeline, cutting oil output by 180,000 bpd. Revenue is falling fast and local communities demand a renewed amnesty package.",
    category: "security",
    source: "opening",
    choices: [
      {
        id: "pipeline-military",
        label: "Military Response",
        context: "Deploy the JTF and air cover to retake the corridor.",
        consequences: [
          mkC("pipeline-military-now", "ae-pipeline-crisis", "The military response restores partial control", [
            { target: "treasury", delta: -0.08, description: "Emergency deployment burns cash" },
            { target: "stability", delta: 4, description: "Sabotage slows after force projection" },
            { target: "outrage", delta: 5, description: "Civilian casualties dominate the story" },
            { target: "trust", delta: -2, description: "Rights groups question the crackdown" },
          ]),
          mkC("pipeline-military-aftershock", "ae-pipeline-crisis", "The corridor reopens under heavy guard", [
            { target: "treasury", delta: 0.14, description: "Oil exports partially recover" },
            { target: "approval", delta: 1, description: "Some voters reward a show of strength" },
          ], 2),
        ],
      },
      {
        id: "pipeline-amnesty",
        label: "Negotiate Amnesty",
        context: "Reopen amnesty talks and buy time with a settlement package.",
        consequences: [
          mkC("pipeline-amnesty-now", "ae-pipeline-crisis", "Talks reopen with militant intermediaries", [
            { target: "treasury", delta: -0.05, description: "The settlement package is expensive" },
            { target: "stability", delta: 2, description: "Violence cools as talks begin" },
            { target: "outrage", delta: -3, description: "Communities welcome de-escalation" },
            { target: "politicalCapital", delta: -2, description: "Hawks call it appeasement" },
          ]),
          mkC("pipeline-amnesty-later", "ae-pipeline-crisis", "A fragile deal restores production", [
            { target: "treasury", delta: 0.11, description: "Output slowly recovers" },
            { target: "trust", delta: 1, description: "Local elites appreciate pragmatism" },
          ], 3),
        ],
      },
      {
        id: "pipeline-investment",
        label: "Community Investment",
        context: "Launch a Delta development package tied to local monitoring.",
        consequences: [
          mkC("pipeline-investment-now", "ae-pipeline-crisis", "A development package reframes the fight", [
            { target: "treasury", delta: -0.12, description: "The investment package is substantial" },
            { target: "trust", delta: 4, description: "Communities see a long-term offer" },
            { target: "outrage", delta: -2, description: "The public prefers infrastructure over force" },
            { target: "politicalCapital", delta: -3, description: "Fiscal conservatives grumble" },
          ]),
          mkC("pipeline-investment-later", "ae-pipeline-crisis", "Community patrols improve security", [
            { target: "stability", delta: 5, description: "Sabotage becomes harder to sustain" },
            { target: "approval", delta: 2, description: "The move looks statesmanlike" },
          ], 4),
        ],
      },
    ],
  },
  {
    id: "ae-imf-loan",
    title: "IMF Loan Proposal",
    severity: "info",
    description: "The IMF offers a standby facility tied to FX reform, subsidy discipline, and tax changes. Markets expect an answer soon.",
    category: "economy",
    source: "opening",
    choices: [
      {
        id: "imf-accept",
        label: "Accept Terms",
        context: "Take the money and absorb the reform backlash.",
        consequences: [
          mkC("imf-accept-now", "ae-imf-loan", "Markets welcome the IMF package", [
            { target: "treasury", delta: 0.22, description: "The facility improves liquidity" },
            { target: "trust", delta: 5, description: "Investors reward policy credibility" },
            { target: "approval", delta: -6, description: "Voters fear more pain" },
            { target: "outrage", delta: 6, description: "Street anger grows over conditionality" },
          ]),
          mkC("imf-accept-later", "ae-imf-loan", "Implementation pain follows the agreement", [
            { target: "stability", delta: 2, description: "Macro credibility improves" },
            { target: "approval", delta: -2, description: "Reform fatigue sets in" },
          ], 3),
        ],
      },
      {
        id: "imf-counter",
        label: "Counter-Propose",
        context: "Seek a phased package that spreads the pain across more time.",
        consequences: [
          mkC("imf-counter-now", "ae-imf-loan", "A phased reform pitch buys room", [
            { target: "treasury", delta: 0.11, description: "Partial support is unlocked" },
            { target: "trust", delta: 2, description: "Negotiators respect a serious counter" },
            { target: "approval", delta: -2, description: "Some backlash still lands" },
            { target: "politicalCapital", delta: 1, description: "The coalition likes the compromise" },
          ]),
          mkC("imf-counter-later", "ae-imf-loan", "Markets wait for proof", [
            { target: "stability", delta: 1, description: "The compromise steadies expectations" },
          ], 2),
        ],
      },
      {
        id: "imf-reject",
        label: "Reject Publicly",
        context: "Frame the offer as an unacceptable intrusion on sovereignty.",
        consequences: [
          mkC("imf-reject-now", "ae-imf-loan", "The rejection thrills nationalists and alarms markets", [
            { target: "approval", delta: 4, description: "Nationalist sentiment rallies briefly" },
            { target: "politicalCapital", delta: 2, description: "Party hardliners applaud" },
            { target: "trust", delta: -5, description: "Investors and donors recoil" },
            { target: "stability", delta: -3, description: "Markets price in turbulence" },
          ]),
          mkC("imf-reject-later", "ae-imf-loan", "Pressure returns without external support", [
            { target: "treasury", delta: -0.09, description: "Financing conditions worsen" },
            { target: "outrage", delta: 3, description: "Inflation bites harder" },
          ], 3),
        ],
      },
    ],
  },
  {
    id: "ae-governorship-elections",
    title: "Governorship Elections",
    severity: "warning",
    description: "Off-cycle governorship elections in three swing states are tilting away from the ruling party as cost-of-living anger rises.",
    category: "politics",
    source: "opening",
    choices: [
      {
        id: "elections-deploy-resources",
        label: "Deploy Resources",
        context: "Use the party machine and targeted spending to claw back the map.",
        consequences: [
          mkC("elections-deploy-now", "ae-governorship-elections", "The party machine roars to life", [
            { target: "treasury", delta: -0.04, description: "Campaign resources are diverted" },
            { target: "politicalCapital", delta: -5, description: "Favours are called in aggressively" },
            { target: "approval", delta: -2, description: "Rumours of interference spread" },
          ]),
          mkC("elections-deploy-later", "ae-governorship-elections", "A vote-buying scandal leaks", [
            { target: "trust", delta: -4, description: "Democratic credibility takes a hit" },
            { target: "outrage", delta: 4, description: "Civil society mobilizes" },
          ], 2),
        ],
      },
      {
        id: "elections-free-fair",
        label: "Free & Fair",
        context: "Let the vote stand and try to win moral authority instead.",
        consequences: [
          mkC("elections-fair-now", "ae-governorship-elections", "The presidency publicly protects the vote", [
            { target: "trust", delta: 5, description: "Institutions gain legitimacy" },
            { target: "approval", delta: 1, description: "Moderates respect the restraint" },
            { target: "politicalCapital", delta: -2, description: "Party bosses hate the gamble" },
          ]),
          mkC("elections-fair-later", "ae-governorship-elections", "Opposition wins but tension cools", [
            { target: "stability", delta: 2, description: "The peaceful outcome lowers temperature" },
          ], 2),
        ],
      },
      {
        id: "elections-delay",
        label: "Delay Elections",
        context: "Push INEC toward a security-based postponement.",
        consequences: [
          mkC("elections-delay-now", "ae-governorship-elections", "INEC delays the vote under pressure", [
            { target: "stability", delta: -3, description: "The opposition cries foul" },
            { target: "trust", delta: -6, description: "Democratic norms weaken" },
            { target: "politicalCapital", delta: 2, description: "The party buys time" },
          ]),
          mkC("elections-delay-later", "ae-governorship-elections", "International criticism intensifies", [
            { target: "approval", delta: -2, description: "Urban voters turn away" },
            { target: "outrage", delta: 3, description: "Student groups join the backlash" },
          ], 3),
        ],
      },
    ],
  },
];

export const contextualEventTemplates: ActiveEventTemplate[] = [
  {
    id: "ctx-labour-strike",
    title: "Labour Strike Ultimatum",
    severity: "critical",
    description: "Labour unions have set a shutdown deadline over wages, transport costs, and subsidy pain.",
    category: "governance",
    source: "contextual",
    minDay: 3,
    triggerConditions: [
      { metric: "outrage", comparator: ">=", value: 52 },
    ],
    choices: [
      {
        id: "labour-relief-package",
        label: "Offer Relief Package",
        context: "Announce wage support and transport relief to split the unions.",
        consequences: [
          mkC("labour-relief-now", "ctx-labour-strike", "Temporary labour peace is bought", [
            { target: "treasury", delta: -0.09, description: "Relief funding strains the treasury" },
            { target: "outrage", delta: -8, description: "Street pressure eases" },
            { target: "approval", delta: 2, description: "Workers appreciate a concrete concession" },
          ]),
        ],
      },
      {
        id: "labour-negotiate",
        label: "Negotiate Hard",
        context: "Keep talks open but refuse the full labour package.",
        consequences: [
          mkC("labour-negotiate-now", "ctx-labour-strike", "Talks stretch into a tense stalemate", [
            { target: "politicalCapital", delta: -2, description: "The coalition spends time managing the room" },
            { target: "trust", delta: 1, description: "Some observers appreciate the process" },
            { target: "outrage", delta: -2, description: "The public sees movement, not resolution" },
          ]),
          mkC("labour-negotiate-later", "ctx-labour-strike", "A partial strike still lands", [
            { target: "stability", delta: -2, description: "Transport and banking slow down" },
          ], 2),
        ],
      },
      {
        id: "labour-crackdown",
        label: "Prepare Crackdown",
        context: "Signal that strategic sectors will stay open by force if necessary.",
        consequences: [
          mkC("labour-crackdown-now", "ctx-labour-strike", "Security services prepare to break pickets", [
            { target: "stability", delta: 2, description: "State capacity looks formidable" },
            { target: "trust", delta: -5, description: "Civil society sees intimidation" },
            { target: "outrage", delta: 6, description: "Workers radicalize" },
          ]),
        ],
      },
    ],
  },
  {
    id: "ctx-market-panic",
    title: "FX Market Panic",
    severity: "warning",
    description: "Importers, banks, and political insiders are scrambling as the naira weakens and reserves thin out.",
    category: "economy",
    source: "contextual",
    minDay: 4,
    triggerConditions: [
      { metric: "trust", comparator: "<=", value: 36 },
    ],
    choices: [
      {
        id: "fx-emergency-auction",
        label: "Emergency FX Auction",
        context: "Burn reserves now to settle the market.",
        consequences: [
          mkC("fx-auction-now", "ctx-market-panic", "The CBN stabilizes the market for a moment", [
            { target: "treasury", delta: -0.07, description: "Intervention is costly" },
            { target: "stability", delta: 3, description: "Panic selling slows" },
            { target: "approval", delta: 1, description: "Importers calm down" },
          ]),
        ],
      },
      {
        id: "fx-capital-controls",
        label: "Tighten Controls",
        context: "Restrict access and stop the bleed, whatever the investor reaction.",
        consequences: [
          mkC("fx-controls-now", "ctx-market-panic", "Controls trap dollars inside the system", [
            { target: "stability", delta: 1, description: "Immediate panic eases a bit" },
            { target: "trust", delta: -4, description: "Investors hate the signal" },
            { target: "outrage", delta: 2, description: "Businesses complain loudly" },
          ]),
        ],
      },
      {
        id: "fx-let-it-float",
        label: "Let It Float",
        context: "Take the hit now and argue that pain buys clarity.",
        consequences: [
          mkC("fx-float-now", "ctx-market-panic", "The naira reprices brutally", [
            { target: "trust", delta: 3, description: "Investors see a cleaner policy line" },
            { target: "approval", delta: -4, description: "Consumers feel the shock immediately" },
            { target: "outrage", delta: 5, description: "Cost-of-living anger spikes" },
          ]),
        ],
      },
    ],
  },
  {
    id: "ctx-judicial-showdown",
    title: "Judicial Showdown",
    severity: "warning",
    description: "A major ruling is expected in a politically sensitive case, and allies are demanding the presidency shape the outcome.",
    category: "governance",
    source: "contextual",
    minDay: 5,
    triggerConditions: [
      { metric: "judicialIndependence", comparator: "<=", value: 58 },
    ],
    choices: [
      {
        id: "judicial-comply",
        label: "Comply Publicly",
        context: "Accept the ruling and make a show of constitutional discipline.",
        consequences: [
          mkC("judicial-comply-now", "ctx-judicial-showdown", "The presidency submits to the ruling", [
            { target: "judicialIndependence", delta: 7, description: "Courts gain breathing room" },
            { target: "trust", delta: 4, description: "Institutions look credible" },
            { target: "politicalCapital", delta: -2, description: "Allies wanted a firmer hand" },
          ]),
        ],
      },
      {
        id: "judicial-pressure",
        label: "Lean on the Court",
        context: "Use intermediaries to shape the timing and tone of the ruling.",
        consequences: [
          mkC("judicial-pressure-now", "ctx-judicial-showdown", "Pressure tactics win short-term room", [
            { target: "politicalCapital", delta: 2, description: "Hardliners get what they wanted" },
            { target: "judicialIndependence", delta: -8, description: "The bench feels the squeeze" },
            { target: "trust", delta: -5, description: "The story leaks to the press" },
          ]),
        ],
      },
      {
        id: "judicial-delay",
        label: "Delay and Defer",
        context: "Keep the matter in procedural limbo and avoid a clear showdown.",
        consequences: [
          mkC("judicial-delay-now", "ctx-judicial-showdown", "The legal fight drags on", [
            { target: "stability", delta: -1, description: "Uncertainty lingers" },
            { target: "trust", delta: -2, description: "The public sees institutional games" },
          ]),
        ],
      },
    ],
  },
];

export const startingInboxMessages: GameInboxMessage[] = [
  {
    id: "msg-finance-imf",
    sender: "Alhaji Bello Kazeem",
    role: "Finance Minister",
    initials: "BK",
    subject: "IMF Delegation Prep",
    preview: "The IMF team arrives in three days and wants a coherent fiscal line from the Presidency.",
    fullText: "Sir, the IMF team arrives in three days. I need your approval on the fiscal report before we can present our consolidated position. The current draft shows a deficit well above our public commitment. Without your sign-off by tomorrow, we risk looking unprepared and divided.",
    day: 1,
    priority: "Urgent",
    read: false,
    source: "seed",
    relatedEventId: "ae-imf-loan",
    responseOptions: [
      { label: "Approve the Report", actionId: "approve" },
      { label: "Revise the Numbers", actionId: "modify" },
      { label: "Delay the Meeting", actionId: "defer" },
    ],
  },
  {
    id: "msg-security-nw",
    sender: "Brig. Kabiru Musa (Rtd)",
    role: "National Security Adviser",
    initials: "KM",
    subject: "North-West Threat Window",
    preview: "Intelligence suggests coordinated attacks are being prepared across multiple northern states.",
    fullText: "Mr. President, our sources indicate a coordinated attack is being prepared across Zamfara, Katsina, and Sokoto. We have 48 to 72 hours before the threat matures. I need a political decision on whether to move early and accept the optics of a heavy deployment.",
    day: 1,
    priority: "Critical",
    read: false,
    source: "seed",
    relatedEventId: "ae-pipeline-crisis",
    responseOptions: [
      { label: "Authorise Deployment", actionId: "approve" },
      { label: "Order Surveillance First", actionId: "investigate" },
      { label: "Assign to NSA", actionId: "delegate" },
    ],
  },
  {
    id: "msg-party-unity",
    sender: "Chief Chidubem Okafor",
    role: "Party Chairman",
    initials: "CO",
    subject: "Party Unity Warning",
    preview: "The South-East caucus is threatening to break ranks over appointments and patronage.",
    fullText: "Your Excellency, I write to express concern about the growing division within our party. The South-East caucus believes your coalition is taking them for granted. If we do not move symbolically and quickly, I cannot guarantee discipline at the next NEC meeting.",
    day: 1,
    priority: "Normal",
    read: false,
    source: "seed",
    responseOptions: [
      { label: "Schedule Meeting", actionId: "engage" },
      { label: "Send Reassurance", actionId: "acknowledge" },
      { label: "Ignore for Now", actionId: "ignore-response" },
    ],
  },
  {
    id: "msg-labour-pressure",
    sender: "Comrade Ngozi Okafor",
    role: "Labour Leader",
    initials: "NO",
    subject: "Strike Notice",
    preview: "Labour is preparing a coordinated shutdown unless the Presidency moves on wages and transport relief.",
    fullText: "Mr. President, the NLC has formally resolved to commence a nationwide strike if our demands are ignored. The minimum wage review is stalled and subsidy pain is unbearable. We await a serious offer, not another speech.",
    day: 1,
    priority: "Urgent",
    read: false,
    source: "seed",
    responseOptions: [
      { label: "Open Negotiations", actionId: "engage" },
      { label: "Issue Public Statement", actionId: "acknowledge" },
      { label: "Stand Firm", actionId: "reject" },
    ],
  },
  {
    id: "msg-governors-fiscal",
    sender: "Gov. Musa Garba",
    role: "Governors Forum",
    initials: "MG",
    subject: "Fiscal Autonomy Request",
    preview: "Governors want an emergency discussion on revenue sharing and emergency support.",
    fullText: "On behalf of the Governors Forum, I request an emergency discussion on fiscal autonomy reforms. Several states are approaching salary defaults and will blame the Presidency if no bridge support emerges.",
    day: 1,
    priority: "Normal",
    read: false,
    source: "seed",
    responseOptions: [
      { label: "Grant Bridge Funding", actionId: "approve" },
      { label: "Negotiate Terms", actionId: "modify" },
      { label: "Refer to Budget Office", actionId: "delegate" },
    ],
  },
];

export function cloneActiveEvent(event: ActiveEventTemplate, createdDay: number): ActiveEvent {
  return {
    ...event,
    createdDay,
    choices: event.choices.map((choice) => ({
      ...choice,
      requirements: choice.requirements?.map((requirement) => ({ ...requirement })),
      consequences: choice.consequences.map((consequence) => ({
        ...consequence,
        effects: consequence.effects.map((effect) => ({ ...effect })),
      })),
    })),
  };
}

export function getOpeningEvents(day: number): ActiveEvent[] {
  return openingEventTemplates.map((event) => cloneActiveEvent(event, day));
}

export function getQuickActionById(actionId: string): QuickActionDefinition | undefined {
  return quickActionDefinitions.find((action) => action.id === actionId);
}

export function getQuickActionByLabel(label: string): QuickActionDefinition | undefined {
  return quickActionDefinitions.find((action) => action.label === label);
}

export function cloneInboxMessages(messages = startingInboxMessages, date?: string): GameInboxMessage[] {
  return messages.map((message) => ({ ...message, ...(date ? { date } : {}) }));
}

function evaluateCondition(currentValue: number, condition: TriggerCondition): boolean {
  switch (condition.comparator) {
    case ">":
      return currentValue > condition.value;
    case "<":
      return currentValue < condition.value;
    case ">=":
      return currentValue >= condition.value;
    case "<=":
      return currentValue <= condition.value;
    default:
      return false;
  }
}

export function getTriggeredActiveEvents(state: GameState, activeIds: string[]): ActiveEvent[] {
  return contextualEventTemplates
    .filter((template) => !activeIds.includes(template.id))
    .filter((template) => !template.minDay || state.day >= template.minDay)
    .filter((template) => {
      if (!template.triggerConditions || template.triggerConditions.length === 0) {
        return false;
      }

      return template.triggerConditions.every((condition) => {
        const currentValue = state[condition.metric];
        return evaluateCondition(typeof currentValue === "number" ? currentValue : 0, condition);
      });
    })
    .slice(0, 1)
    .map((template) => cloneActiveEvent(template, state.day));
}
