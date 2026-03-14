// Aso Rock — Event Chain System
// 6 branching narrative event chains with Nigerian political themes

import type { Consequence, GameState } from "./gameEngine";

// ── Types ───────────────────────────────────────────────

export interface EventChoice {
  label: string;
  requirements?: { metric: string; min: number }[];
  consequences: Consequence[];
  nextStepId?: string;
  chainEnd?: boolean;
}

export interface EventStep {
  id: string;
  narrative: string;
  choices: EventChoice[];
  autoAdvanceDays?: number;
}

export interface EventChain {
  id: string;
  title: string;
  description: string;
  category: "crisis" | "opportunity" | "intrigue" | "diplomacy";
  steps: EventStep[];
  triggerConditions: { metric: string; comparator: ">" | "<" | ">="; value: number }[];
}

// ── Helper: build consequence ───────────────────────────

function mkC(
  id: string,
  source: string,
  desc: string,
  effects: Consequence["effects"],
  delay = 0,
): Consequence {
  return { id, sourceEvent: source, delayDays: delay, effects, description: desc };
}

// ── Chain 1: Governors' Rebellion ───────────────────────

const governorsRebellion: EventChain = {
  id: "governors-rebellion",
  title: "Governors' Rebellion",
  description: "Six governors from the opposition threaten to form an autonomous fiscal bloc, challenging federal authority over revenue allocation.",
  category: "crisis",
  steps: [
    {
      id: "gr-1",
      narrative: "Six governors convene an emergency meeting in Enugu, issuing a communiqué demanding 50% of federally collected revenue be retained at source. The Nigeria Governors' Forum is split, and the press is in a frenzy. Your Chief of Staff warns this could embolden separatist sentiments across the South-East.",
      choices: [
        {
          label: "Negotiate at the Revenue Allocation Summit",
          consequences: [
            mkC("gr-1a", "governors-rebellion", "Summit concession costs political capital", [
              { target: "politicalCapital", delta: -8, description: "Concessions weaken federal authority" },
              { target: "stability", delta: 4, description: "Governors stand down temporarily" },
            ]),
          ],
          nextStepId: "gr-2-negotiate",
        },
        {
          label: "Freeze federal disbursements to rebel states",
          consequences: [
            mkC("gr-1b", "governors-rebellion", "Financial pressure on rebel governors", [
              { target: "stability", delta: -6, description: "Fiscal freeze escalates tensions" },
              { target: "outrage", delta: 8, description: "Citizens in affected states suffer" },
              { target: "politicalCapital", delta: 3, description: "Show of federal strength" },
            ]),
          ],
          nextStepId: "gr-2-freeze",
        },
        {
          label: "Deploy EFCC investigators to governors' offices",
          requirements: [{ metric: "politicalCapital", min: 40 }],
          consequences: [
            mkC("gr-1c", "governors-rebellion", "Anti-corruption offensive", [
              { target: "trust", delta: 5, description: "Public approves anti-corruption stance" },
              { target: "stability", delta: -3, description: "Governors retaliate in legislature" },
            ]),
          ],
          nextStepId: "gr-2-efcc",
        },
      ],
    },
    {
      id: "gr-2-negotiate",
      narrative: "The summit produces a compromise: a new revenue-sharing formula giving states 40% instead of the current 26.72%. Northern governors are furious, calling it a betrayal. The Senate Fiscal Committee demands emergency hearings.",
      choices: [
        {
          label: "Push the new formula through the National Assembly",
          consequences: [
            mkC("gr-2a", "governors-rebellion", "Legislative battle over revenue", [
              { target: "politicalCapital", delta: -12, description: "Burned bridges in the Senate" },
              { target: "stability", delta: 6, description: "Constitutional resolution achieved" },
              { target: "approval", delta: 5, description: "Southern states celebrate" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Delay implementation pending further study",
          consequences: [
            mkC("gr-2b", "governors-rebellion", "Stalling tactic buys time", [
              { target: "trust", delta: -4, description: "Both sides lose faith in process" },
              { target: "stress", delta: 5, description: "Unresolved crisis lingers" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "gr-2-freeze",
      narrative: "The freeze hits hard. Salaries go unpaid in three states. Workers take to the streets. Governor Nwosu calls it 'economic warfare against Igbo people' — the ethnic dimension makes international headlines.",
      choices: [
        {
          label: "Release partial funds as a goodwill gesture",
          consequences: [
            mkC("gr-2c", "governors-rebellion", "Partial release de-escalates", [
              { target: "outrage", delta: -5, description: "Workers receive back-pay" },
              { target: "politicalCapital", delta: -4, description: "Perceived as backing down" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Maintain the freeze and deploy security forces",
          consequences: [
            mkC("gr-2d", "governors-rebellion", "Heavy-handed response backfires", [
              { target: "stability", delta: -8, description: "Violent clashes in Enugu and Aba" },
              { target: "outrage", delta: 12, description: "International community condemns crackdown" },
              { target: "approval", delta: -6, description: "Nationwide disapproval" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "gr-2-efcc",
      narrative: "EFCC raids uncover ₦47 billion in diverted infrastructure funds across four governors' accounts. The evidence is damning, but one governor has a dossier on your campaign financing. Your Anti-Corruption Adviser warns: 'They'll take you down with them.'",
      choices: [
        {
          label: "Prosecute regardless — let the chips fall",
          consequences: [
            mkC("gr-2e", "governors-rebellion", "Full prosecution despite risk", [
              { target: "trust", delta: 10, description: "Landmark anti-corruption moment" },
              { target: "stress", delta: 10, description: "Personal exposure risk is extreme" },
              { target: "approval", delta: 8, description: "Public rallies behind anti-corruption drive" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Negotiate quietly — prosecute the weakest two",
          consequences: [
            mkC("gr-2f", "governors-rebellion", "Selective prosecution", [
              { target: "politicalCapital", delta: 5, description: "Pragmatic deal preserves leverage" },
              { target: "trust", delta: -3, description: "Insiders know the deal was cut" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
  ],
  triggerConditions: [
    { metric: "stability", comparator: "<", value: 45 },
  ],
};

// ── Chain 2: The Whistleblower ──────────────────────────

const whistleblower: EventChain = {
  id: "whistleblower",
  title: "The Whistleblower",
  description: "A senior NNPC official leaks documents revealing a massive oil subsidy fraud implicating party insiders and a sitting minister.",
  category: "intrigue",
  steps: [
    {
      id: "wb-1",
      narrative: "An encrypted flash drive arrives at Federal Capital TV containing 2,400 pages of NNPC documents showing ₦1.2 trillion in fraudulent subsidy claims. Three names are circled in red — one is your Petroleum Minister, Chief Adaeze Okonkwo. The story will break in 48 hours.",
      choices: [
        {
          label: "Get ahead of the story — announce an investigation",
          consequences: [
            mkC("wb-1a", "whistleblower", "Proactive investigation announced", [
              { target: "trust", delta: 6, description: "Transparent response earns credibility" },
              { target: "politicalCapital", delta: -5, description: "Party insiders feel exposed" },
            ]),
          ],
          nextStepId: "wb-2-investigate",
        },
        {
          label: "Summon the Petroleum Minister for a private confrontation",
          consequences: [
            mkC("wb-1b", "whistleblower", "Backroom confrontation", [
              { target: "stress", delta: 5, description: "Tense private meeting" },
            ]),
          ],
          nextStepId: "wb-2-confront",
        },
        {
          label: "Attempt to suppress the leak through media allies",
          consequences: [
            mkC("wb-1c", "whistleblower", "Media suppression attempted", [
              { target: "trust", delta: -8, description: "Cover-up suspicion spreads online" },
              { target: "outrage", delta: 6, description: "Social media erupts with #SubsidyScam" },
            ]),
          ],
          nextStepId: "wb-2-suppress",
        },
      ],
    },
    {
      id: "wb-2-investigate",
      narrative: "Your investigation panel confirms the fraud. The Minister offers to resign quietly, but the opposition smells blood and demands a public tribunal. NLC threatens a general strike unless all stolen funds are recovered.",
      choices: [
        {
          label: "Accept resignation and refer to EFCC",
          consequences: [
            mkC("wb-2a", "whistleblower", "Minister sacked and prosecuted", [
              { target: "approval", delta: 6, description: "Decisive action applauded" },
              { target: "politicalCapital", delta: -8, description: "Cabinet allies defect in fear" },
              { target: "trust", delta: 4, description: "Rule of law upheld" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Convene a public tribunal for maximum transparency",
          consequences: [
            mkC("wb-2b", "whistleblower", "Public tribunal becomes spectacle", [
              { target: "approval", delta: 10, description: "Nation watches justice in action" },
              { target: "stress", delta: 8, description: "Tribunal reveals uncomfortable truths" },
              { target: "stability", delta: -3, description: "Markets rattled by revelations" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "wb-2-confront",
      narrative: "Chief Okonkwo tearfully confesses but reveals the scheme was sanctioned by the previous administration's cabal — including your own party chairman. She offers evidence in exchange for immunity.",
      choices: [
        {
          label: "Grant limited immunity for full testimony",
          consequences: [
            mkC("wb-2c", "whistleblower", "Immunity deal unlocks deeper scandal", [
              { target: "politicalCapital", delta: -10, description: "Party chairman exposed — internal war begins" },
              { target: "trust", delta: 7, description: "Public sees genuine accountability" },
              { target: "approval", delta: 4, description: "Anti-corruption credentials strengthened" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Reject immunity — prosecute everyone",
          consequences: [
            mkC("wb-2d", "whistleblower", "Full prosecution alienates allies", [
              { target: "trust", delta: 10, description: "Historic anti-corruption stance" },
              { target: "politicalCapital", delta: -15, description: "Party in open revolt" },
              { target: "stress", delta: 8, description: "Political isolation intensifies" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "wb-2-suppress",
      narrative: "Your media strategy fails. A blogger with 3 million followers publishes the full documents. #SubsidyScam trends worldwide. CNN Africa runs a special report. Your Press Secretary is caught lying on camera.",
      choices: [
        {
          label: "Fire the Press Secretary and pivot to transparency",
          consequences: [
            mkC("wb-2e", "whistleblower", "Damage control after failed cover-up", [
              { target: "trust", delta: -5, description: "Credibility severely damaged" },
              { target: "outrage", delta: -3, description: "Firing provides partial catharsis" },
              { target: "approval", delta: -4, description: "Public sees incompetence" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Double down — call it opposition fabrication",
          consequences: [
            mkC("wb-2f", "whistleblower", "Conspiracy defense collapses", [
              { target: "trust", delta: -12, description: "All credibility destroyed" },
              { target: "outrage", delta: 10, description: "Civil society mobilizes" },
              { target: "stability", delta: -5, description: "NLC announces general strike" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
  ],
  triggerConditions: [
    { metric: "trust", comparator: "<", value: 40 },
  ],
};

// ── Chain 3: The General's Gambit ───────────────────────

const generalsGambit: EventChain = {
  id: "generals-gambit",
  title: "The General's Gambit",
  description: "A retired military chief begins consolidating support among active officers, raising fears of a constitutional crisis or coup attempt.",
  category: "crisis",
  steps: [
    {
      id: "gg-1",
      narrative: "Intelligence reports land on your desk: General Tunde Adesanya (ret.), the Lion of Maiduguri, has been holding secret meetings with serving brigade commanders. He's reportedly telling them the country is 'drifting toward catastrophe under civilian misrule.' The Defence Minister wants to arrest him. The NSA recommends surveillance first.",
      choices: [
        {
          label: "Order covert surveillance through the DSS",
          consequences: [
            mkC("gg-1a", "generals-gambit", "Surveillance operation launched", [
              { target: "stress", delta: 5, description: "Sleepless nights monitoring reports" },
              { target: "politicalCapital", delta: -2, description: "DSS resources diverted" },
            ]),
          ],
          nextStepId: "gg-2-surveil",
        },
        {
          label: "Invite the General for a private dinner at Aso Rock",
          consequences: [
            mkC("gg-1b", "generals-gambit", "Personal diplomacy with the General", [
              { target: "stress", delta: 3, description: "High-stakes dinner" },
            ]),
          ],
          nextStepId: "gg-2-dinner",
        },
        {
          label: "Publicly denounce military interference in politics",
          consequences: [
            mkC("gg-1c", "generals-gambit", "Public stance against military", [
              { target: "approval", delta: 4, description: "Democrats rally behind statement" },
              { target: "stability", delta: -5, description: "Military establishment offended" },
            ]),
          ],
          nextStepId: "gg-2-denounce",
        },
      ],
    },
    {
      id: "gg-2-surveil",
      narrative: "DSS intercepts reveal the General has secured pledges from commanders controlling 3 of 6 military divisions. He's meeting the Chief of Defence Staff tomorrow. Your intelligence chief says: 'We have 24 hours before this becomes a constitutional crisis.'",
      choices: [
        {
          label: "Sack the compromised CDS and replace with a loyalist",
          consequences: [
            mkC("gg-2a", "generals-gambit", "Military shake-up", [
              { target: "stability", delta: 5, description: "Loyalist CDS secures command chain" },
              { target: "politicalCapital", delta: -6, description: "Military old guard alienated" },
              { target: "stress", delta: 5, description: "Dramatic midnight reshuffle" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Leak the intercepts to the press — expose the plot",
          consequences: [
            mkC("gg-2b", "generals-gambit", "Plot exposed publicly", [
              { target: "approval", delta: 6, description: "Public outraged at coup attempt" },
              { target: "trust", delta: 3, description: "Transparency earns respect" },
              { target: "stability", delta: -3, description: "Military humiliated — unpredictable" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "gg-2-dinner",
      narrative: "Over jollof rice and palm wine, General Adesanya is disarmingly candid. He doesn't want power — he wants his pension restored and his protégés promoted. 'Give the boys their due, Mr. President, and this old soldier will go quietly.'",
      choices: [
        {
          label: "Accept the deal — restore pensions and promote his people",
          consequences: [
            mkC("gg-2c", "generals-gambit", "Deal with the General", [
              { target: "stability", delta: 8, description: "Military crisis averted quietly" },
              { target: "politicalCapital", delta: -5, description: "Seen as capitulating to military" },
              { target: "treasury", delta: -0.08, description: "Pension restoration costs" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Refuse and warn him against further plotting",
          consequences: [
            mkC("gg-2d", "generals-gambit", "Warning issued to the General", [
              { target: "stability", delta: -4, description: "General accelerates his plans" },
              { target: "stress", delta: 8, description: "Confrontation weighs heavily" },
              { target: "trust", delta: 3, description: "Principled stand noted" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "gg-2-denounce",
      narrative: "Your speech at Eagle Square draws massive crowds, but barracks across the country go quiet. The Defence Minister reports that three generals have submitted their resignations 'in protest.' The international community applauds, but your security chiefs are nervous.",
      choices: [
        {
          label: "Accept the resignations and appoint reform-minded officers",
          consequences: [
            mkC("gg-2e", "generals-gambit", "Military reform begins", [
              { target: "stability", delta: 3, description: "New officer corps more loyal" },
              { target: "approval", delta: 5, description: "Military reform celebrated" },
              { target: "politicalCapital", delta: -4, description: "Old guard plots revenge" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Quietly persuade them to stay — you need continuity",
          consequences: [
            mkC("gg-2f", "generals-gambit", "Pragmatic backtrack", [
              { target: "trust", delta: -4, description: "Reform rhetoric rings hollow" },
              { target: "stability", delta: 2, description: "Military continuity maintained" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
  ],
  triggerConditions: [
    { metric: "stability", comparator: "<", value: 40 },
    { metric: "approval", comparator: "<", value: 35 },
  ],
};

// ── Chain 4: ECOWAS Crisis ──────────────────────────────

const ecowasCrisis: EventChain = {
  id: "ecowas-crisis",
  title: "ECOWAS Crisis",
  description: "A military coup in a neighbouring West African state forces Nigeria to choose between military intervention, diplomacy, or isolation.",
  category: "diplomacy",
  steps: [
    {
      id: "ec-1",
      narrative: "The Togolese military has seized power, detaining the elected president. As ECOWAS chair, Nigeria is expected to lead the response. France is pushing for immediate intervention, while the AU urges restraint. Your military advisers estimate a stabilization force would cost ₦180 billion and 6 months.",
      choices: [
        {
          label: "Lead an ECOWAS military intervention",
          requirements: [{ metric: "politicalCapital", min: 50 }],
          consequences: [
            mkC("ec-1a", "ecowas-crisis", "Military intervention launched", [
              { target: "treasury", delta: -0.18, description: "₦180B military deployment costs" },
              { target: "trust", delta: 6, description: "Nigeria leads regional security" },
              { target: "stability", delta: -4, description: "Domestic opposition to foreign war" },
            ]),
          ],
          nextStepId: "ec-2-intervene",
        },
        {
          label: "Pursue aggressive diplomacy with sanctions",
          consequences: [
            mkC("ec-1b", "ecowas-crisis", "Diplomatic pressure campaign", [
              { target: "politicalCapital", delta: -4, description: "Shuttle diplomacy exhausting" },
              { target: "trust", delta: 3, description: "Seen as responsible leader" },
            ]),
          ],
          nextStepId: "ec-2-diplomacy",
        },
        {
          label: "Stay neutral — it's not Nigeria's problem",
          consequences: [
            mkC("ec-1c", "ecowas-crisis", "Nigeria steps back from ECOWAS role", [
              { target: "trust", delta: -6, description: "Regional credibility collapses" },
              { target: "politicalCapital", delta: 5, description: "Domestic populists approve" },
              { target: "treasury", delta: 0.05, description: "Funds saved" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "ec-2-intervene",
      narrative: "Nigerian troops cross the border to cheering crowds, but the junta retreats into the interior with the detained president as hostage. A Nigerian patrol is ambushed — 12 soldiers killed. The casualty photos dominate social media. Labour unions demand withdrawal.",
      choices: [
        {
          label: "Escalate — full military operation to rescue the president",
          consequences: [
            mkC("ec-2a", "ecowas-crisis", "Full-scale military operation", [
              { target: "treasury", delta: -0.12, description: "Additional military costs" },
              { target: "stability", delta: -6, description: "Anti-war protests in Lagos and Abuja" },
              { target: "approval", delta: -5, description: "War weariness sets in" },
              { target: "trust", delta: 4, description: "International community impressed" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Negotiate a ceasefire and transition plan",
          consequences: [
            mkC("ec-2b", "ecowas-crisis", "Ceasefire negotiations", [
              { target: "trust", delta: 5, description: "Statesmanship on display" },
              { target: "politicalCapital", delta: 3, description: "Opposition can't criticize peace" },
              { target: "approval", delta: 3, description: "Relief at de-escalation" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "ec-2-diplomacy",
      narrative: "Your sanctions regime bites. The junta's bank accounts are frozen, travel bans imposed. But they respond by expelling Nigerian workers — 200,000 Nigerians are stranded at the border. Nollywood releases a viral film about the crisis. Public pressure mounts to 'bring our people home.'",
      choices: [
        {
          label: "Launch a massive evacuation operation",
          consequences: [
            mkC("ec-2c", "ecowas-crisis", "Emergency evacuation of citizens", [
              { target: "approval", delta: 8, description: "Heroic rescue operation praised" },
              { target: "treasury", delta: -0.06, description: "Evacuation costs" },
              { target: "trust", delta: 2, description: "Citizens-first approach noted" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Threaten military action if citizens are harmed",
          consequences: [
            mkC("ec-2d", "ecowas-crisis", "Military ultimatum issued", [
              { target: "stress", delta: 8, description: "Brinkmanship at its peak" },
              { target: "trust", delta: -2, description: "Regional partners fear escalation" },
              { target: "stability", delta: -3, description: "War drums beat louder" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
  ],
  triggerConditions: [
    { metric: "trust", comparator: ">=", value: 30 },
  ],
};

// ── Chain 5: Fuel Price Riots ───────────────────────────

const fuelPriceRiots: EventChain = {
  id: "fuel-price-riots",
  title: "Fuel Price Riots",
  description: "A sudden spike in fuel prices triggers nationwide protests, with unions and opposition politicians fanning the flames.",
  category: "crisis",
  steps: [
    {
      id: "fp-1",
      narrative: "Petrol jumps from ₦620 to ₦950 per litre overnight after NNPC declares it can no longer absorb the subsidy gap. Long queues form at filling stations. The NLC announces a 48-hour warning strike. #RevolutionNow trends on Twitter. In Kano, youths set a filling station ablaze.",
      choices: [
        {
          label: "Announce a targeted palliative package for vulnerable Nigerians",
          consequences: [
            mkC("fp-1a", "fuel-price-riots", "Palliative spending announced", [
              { target: "treasury", delta: -0.15, description: "₦150B palliative package" },
              { target: "outrage", delta: -4, description: "Partial relief for citizens" },
              { target: "approval", delta: 3, description: "Compassionate response noted" },
            ]),
          ],
          nextStepId: "fp-2-palliative",
        },
        {
          label: "Address the nation — explain the economic necessity",
          consequences: [
            mkC("fp-1b", "fuel-price-riots", "Presidential address", [
              { target: "trust", delta: 3, description: "Honest communication appreciated" },
              { target: "outrage", delta: -2, description: "Some citizens understand" },
              { target: "stress", delta: 3, description: "Intense media scrutiny follows" },
            ]),
          ],
          nextStepId: "fp-2-address",
        },
        {
          label: "Reverse the price increase immediately",
          consequences: [
            mkC("fp-1c", "fuel-price-riots", "Price reversal announced", [
              { target: "outrage", delta: -10, description: "Streets celebrate" },
              { target: "treasury", delta: -0.25, description: "Subsidy restoration costs" },
              { target: "trust", delta: -5, description: "Policy inconsistency worries investors" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "fp-2-palliative",
      narrative: "The palliative package reaches 4 million households, but distribution is chaotic. Videos emerge of politicians diverting cash transfers to their supporters. The NLC calls the package 'crumbs from the master's table' and escalates to an indefinite strike.",
      choices: [
        {
          label: "Negotiate directly with NLC leadership",
          consequences: [
            mkC("fp-2a", "fuel-price-riots", "NLC negotiations yield compromise", [
              { target: "politicalCapital", delta: -6, description: "Major concessions to labour" },
              { target: "stability", delta: 5, description: "Strike called off" },
              { target: "approval", delta: 4, description: "Workers return, economy recovers" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Declare the strike illegal and deploy police",
          consequences: [
            mkC("fp-2b", "fuel-price-riots", "Crackdown on strikers", [
              { target: "outrage", delta: 12, description: "Videos of police brutality go viral" },
              { target: "stability", delta: -8, description: "Strike hardens into civil disobedience" },
              { target: "approval", delta: -7, description: "Public turns against government" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "fp-2-address",
      narrative: "Your 30-minute national address is measured and data-driven. Economists praise it, but market women in Onitsha say they can't eat statistics. The opposition leader gives a fiery response: 'The President speaks of macroeconomics while children go hungry.' Protests continue but are smaller.",
      choices: [
        {
          label: "Follow up with a CNG conversion subsidy programme",
          consequences: [
            mkC("fp-2c", "fuel-price-riots", "CNG programme launched", [
              { target: "treasury", delta: -0.08, description: "CNG conversion subsidies" },
              { target: "approval", delta: 5, description: "Practical solution wins support" },
              { target: "trust", delta: 4, description: "Policy follow-through demonstrated" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Stay the course — let the market adjust",
          consequences: [
            mkC("fp-2d", "fuel-price-riots", "Market adjustment strategy", [
              { target: "outrage", delta: 5, description: "Slow adjustment means ongoing pain" },
              { target: "treasury", delta: 0.1, description: "Subsidy savings accumulate" },
              { target: "trust", delta: 2, description: "Investors approve fiscal discipline" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
  ],
  triggerConditions: [
    { metric: "outrage", comparator: ">", value: 55 },
  ],
};

// ── Chain 6: Party Schism ───────────────────────────────

const partySchism: EventChain = {
  id: "party-schism",
  title: "Party Schism",
  description: "A powerful faction within your own party threatens to break away, taking key legislators and governors with them.",
  category: "intrigue",
  steps: [
    {
      id: "ps-1",
      narrative: "Your party's national chairman, Chief Bode Akinyemi, publicly accuses you of 'running a one-man show' and announces a 'reform caucus' with 47 senators and 3 governors. He demands a power-sharing agreement giving the party more control over appointments. The next party NEC meeting is in 5 days.",
      choices: [
        {
          label: "Broker a power-sharing deal before the NEC meeting",
          consequences: [
            mkC("ps-1a", "party-schism", "Power-sharing negotiations begin", [
              { target: "politicalCapital", delta: -8, description: "Significant concessions offered" },
              { target: "stability", delta: 3, description: "Party unity signal" },
            ]),
          ],
          nextStepId: "ps-2-deal",
        },
        {
          label: "Mobilize your loyalists to challenge Akinyemi at NEC",
          consequences: [
            mkC("ps-1b", "party-schism", "Party power struggle initiated", [
              { target: "politicalCapital", delta: -4, description: "Resources spent on internal fight" },
              { target: "stress", delta: 6, description: "Party warfare is exhausting" },
            ]),
          ],
          nextStepId: "ps-2-challenge",
        },
        {
          label: "Let them leave — build a new coalition",
          consequences: [
            mkC("ps-1c", "party-schism", "Accept the split", [
              { target: "politicalCapital", delta: -12, description: "Lost 47 senators overnight" },
              { target: "trust", delta: 4, description: "Bold leadership noted" },
              { target: "stability", delta: -5, description: "Legislative majority gone" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "ps-2-deal",
      narrative: "Negotiations are tense. Akinyemi wants the Finance Ministry and 4 ambassadorial slots. Your political adviser warns that giving in will embolden future blackmail. But losing 47 senators means your legislative agenda is dead.",
      choices: [
        {
          label: "Accept the deal — give them the Finance Ministry",
          consequences: [
            mkC("ps-2a", "party-schism", "Major concession to party rebels", [
              { target: "politicalCapital", delta: -10, description: "Party insiders see weakness" },
              { target: "stability", delta: 6, description: "Party reunited on paper" },
              { target: "approval", delta: -3, description: "Public sees political horse-trading" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Counter-offer — lesser ministries and two ambassadors",
          consequences: [
            mkC("ps-2b", "party-schism", "Partial deal reached", [
              { target: "politicalCapital", delta: -5, description: "Reasonable compromise" },
              { target: "stability", delta: 4, description: "Most rebels return to fold" },
              { target: "stress", delta: -3, description: "Crisis defused" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
    {
      id: "ps-2-challenge",
      narrative: "At the NEC meeting, your loyalists force a vote of no confidence against Akinyemi. It passes 67-42, but the defeated faction storms out. Within hours, they register a new party — the 'People's Democratic Movement.' They take 38 senators, 2 governors, and your entire South-West base.",
      choices: [
        {
          label: "Reach out to opposition senators for a grand coalition",
          consequences: [
            mkC("ps-2c", "party-schism", "Cross-party coalition formed", [
              { target: "politicalCapital", delta: 5, description: "New coalition gives legislative majority" },
              { target: "trust", delta: 3, description: "Bipartisan approach refreshing" },
              { target: "stability", delta: 2, description: "Government functional again" },
            ]),
          ],
          chainEnd: true,
        },
        {
          label: "Use federal might to punish defectors' states",
          consequences: [
            mkC("ps-2d", "party-schism", "Punitive measures against defectors", [
              { target: "outrage", delta: 8, description: "Political victimization condemned" },
              { target: "stability", delta: -6, description: "Constitutional crisis deepens" },
              { target: "trust", delta: -5, description: "Autocratic tendencies alarm observers" },
            ]),
          ],
          chainEnd: true,
        },
      ],
    },
  ],
  triggerConditions: [
    { metric: "politicalCapital", comparator: "<", value: 40 },
  ],
};

// ── All Chains ──────────────────────────────────────────

export const allEventChains: EventChain[] = [
  governorsRebellion,
  whistleblower,
  generalsGambit,
  ecowasCrisis,
  fuelPriceRiots,
  partySchism,
];

// ── Helper: check which chains should trigger ───────────

export function getTriggeredChains(
  state: GameState,
  existingChainIds: string[],
): EventChain[] {
  const metricValues: Record<string, number> = {
    approval: state.approval,
    treasury: state.treasury,
    stability: state.stability,
    politicalCapital: state.politicalCapital,
    stress: state.stress,
    outrage: state.outrage,
    trust: state.trust,
  };

  return allEventChains.filter((chain) => {
    // Skip already active chains
    if (existingChainIds.includes(chain.id)) return false;

    // All trigger conditions must be met
    return chain.triggerConditions.every((cond) => {
      const val = metricValues[cond.metric] ?? 0;
      switch (cond.comparator) {
        case ">": return val > cond.value;
        case "<": return val < cond.value;
        case ">=": return val >= cond.value;
        default: return false;
      }
    });
  });
}

// ── Helper: get step by id ──────────────────────────────

export function getChainStep(chain: EventChain, stepId: string): EventStep | undefined {
  return chain.steps.find((s) => s.id === stepId);
}

// ── Helper: get chain by id ─────────────────────────────

export function getChainById(chainId: string): EventChain | undefined {
  return allEventChains.find((c) => c.id === chainId);
}
