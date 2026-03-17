import type { Effect, GameState, MinisterStatus } from "./gameTypes";
import { PORTFOLIO_SECTOR_MAP } from "./cabinetSystem";

export interface Directive {
  id: string;
  label: string;
  description: string;
  sectorKey: string | null;
  effects: Array<{ target: Effect["target"]; delta: number; description: string }>;
}

const sk = (p: string) => PORTFOLIO_SECTOR_MAP[p] ?? null;

export const DIRECTIVES: Record<string, Directive[]> = {
  Finance: [
    { id: "fin-tighten", label: "Tighten Fiscal Controls", description: "Enforce stricter spending oversight across MDAs", sectorKey: sk("Finance"), effects: [{ target: "stability", delta: 2, description: "Tighter fiscal controls boost stability" }] },
    { id: "fin-revenue", label: "Accelerate Revenue Collection", description: "Intensify FIRS and Customs collection targets", sectorKey: sk("Finance"), effects: [{ target: "treasury", delta: 15, description: "Aggressive revenue drive increases treasury" }] },
    { id: "fin-emergency", label: "Release Emergency Funds", description: "Unlock contingency reserves for urgent needs", sectorKey: sk("Finance"), effects: [{ target: "treasury", delta: -20, description: "Emergency spending drains treasury" }, { target: "stability", delta: 3, description: "Rapid response stabilises situation" }] },
  ],
  Petroleum: [
    { id: "pet-audit", label: "Audit NNPC Accounts", description: "Order forensic audit of national oil company", sectorKey: sk("Petroleum"), effects: [{ target: "trust", delta: 3, description: "Transparency boosts public trust" }, { target: "treasury", delta: 5, description: "Recovered funds from audit" }] },
    { id: "pet-output", label: "Boost Oil Production", description: "Direct increased quota compliance from operators", sectorKey: sk("Petroleum"), effects: [{ target: "treasury", delta: 10, description: "Higher oil output grows revenue" }] },
  ],
  "Trade & Investment": [
    { id: "trade-zones", label: "Fast-Track Free Trade Zones", description: "Expedite approval of new export processing zones", sectorKey: sk("Trade & Investment"), effects: [{ target: "treasury", delta: 5, description: "Trade zone activity boosts revenue" }, { target: "approval", delta: 1, description: "Job creation improves approval" }] },
    { id: "trade-protect", label: "Tighten Import Controls", description: "Strengthen border enforcement against dumping", sectorKey: sk("Trade & Investment"), effects: [{ target: "stability", delta: 2, description: "Local industry protection aids stability" }] },
  ],
  Health: [
    { id: "health-vaccine", label: "Launch Vaccination Campaign", description: "Nationwide immunisation drive for preventable diseases", sectorKey: sk("Health"), effects: [{ target: "approval", delta: 2, description: "Public health push improves approval" }] },
    { id: "health-audit", label: "Audit Hospital Procurement", description: "Investigate inflated medical supply contracts", sectorKey: sk("Health"), effects: [{ target: "stability", delta: 1, description: "Procurement reform adds stability" }, { target: "trust", delta: 2, description: "Anti-corruption action builds trust" }] },
    { id: "health-phc", label: "Revitalise Primary Health Centres", description: "Deploy resources to upgrade rural health posts", sectorKey: sk("Health"), effects: [{ target: "approval", delta: 3, description: "Rural healthcare wins public approval" }, { target: "treasury", delta: -10, description: "PHC upgrades cost money" }] },
  ],
  Education: [
    { id: "edu-asuu", label: "Resolve ASUU Disputes", description: "Fast-track agreement with university lecturers union", sectorKey: sk("Education"), effects: [{ target: "stability", delta: 2, description: "Ending strikes stabilises campuses" }, { target: "treasury", delta: -8, description: "Concessions cost money" }] },
    { id: "edu-stem", label: "STEM Investment Push", description: "Channel funds to science and technology faculties", sectorKey: sk("Education"), effects: [{ target: "approval", delta: 1, description: "Education investment raises approval" }] },
    { id: "edu-almajiri", label: "Almajiri School Integration", description: "Integrate Quranic schools into formal education system", sectorKey: sk("Education"), effects: [{ target: "approval", delta: 2, description: "Inclusion improves approval" }, { target: "stability", delta: 1, description: "Education integration aids stability" }] },
  ],
  "Youth Development": [
    { id: "youth-npower", label: "Expand N-Power Programme", description: "Scale up youth employment and skills scheme", sectorKey: sk("Youth Development"), effects: [{ target: "approval", delta: 3, description: "Youth jobs boost approval" }, { target: "treasury", delta: -10, description: "Programme expansion costs" }] },
    { id: "youth-tech", label: "Launch Tech Hubs Initiative", description: "Fund innovation hubs in state capitals", sectorKey: sk("Youth Development"), effects: [{ target: "approval", delta: 2, description: "Tech investment impresses youth" }] },
  ],
  "Labour & Employment": [
    { id: "labour-wage", label: "Enforce Minimum Wage Compliance", description: "Crack down on states not paying minimum wage", sectorKey: sk("Labour & Employment"), effects: [{ target: "approval", delta: 2, description: "Wage enforcement wins workers" }, { target: "stability", delta: -1, description: "Governors resist enforcement" }] },
    { id: "labour-safety", label: "Workplace Safety Audit", description: "Inspect factories and construction sites nationwide", sectorKey: sk("Labour & Employment"), effects: [{ target: "trust", delta: 2, description: "Worker protection builds trust" }] },
  ],
  "Works & Housing": [
    { id: "works-roads", label: "Accelerate Road Repairs", description: "Priority maintenance on federal highways", sectorKey: sk("Works & Housing"), effects: [{ target: "approval", delta: 2, description: "Road improvements visible to public" }, { target: "treasury", delta: -8, description: "Construction costs" }] },
    { id: "works-housing", label: "Mass Housing Initiative", description: "Fast-track affordable housing construction", sectorKey: sk("Works & Housing"), effects: [{ target: "approval", delta: 3, description: "Housing drives approval" }, { target: "treasury", delta: -15, description: "Housing programme spending" }] },
  ],
  Power: [
    { id: "power-grid", label: "Emergency Grid Stabilisation", description: "Deploy mobile substations to prevent blackouts", sectorKey: sk("Power"), effects: [{ target: "stability", delta: 2, description: "Stable electricity reduces unrest" }, { target: "treasury", delta: -10, description: "Grid emergency spending" }] },
    { id: "power-metering", label: "Accelerate Meter Deployment", description: "Push DisCos to install prepaid meters faster", sectorKey: sk("Power"), effects: [{ target: "trust", delta: 2, description: "Fair billing builds trust" }, { target: "treasury", delta: 3, description: "Reduced estimated billing losses" }] },
  ],
  "Communications & Digital Economy": [
    { id: "comms-broadband", label: "Expand Rural Broadband", description: "Mandate telcos to extend coverage to underserved areas", sectorKey: sk("Communications & Digital Economy"), effects: [{ target: "approval", delta: 2, description: "Connectivity reaches more citizens" }] },
    { id: "comms-govtech", label: "Digitise Government Services", description: "Move permit and licensing processes online", sectorKey: sk("Communications & Digital Economy"), effects: [{ target: "trust", delta: 2, description: "E-governance reduces corruption" }, { target: "stability", delta: 1, description: "Efficient services improve stability" }] },
  ],
  Defence: [
    { id: "def-border", label: "Increase Border Patrols", description: "Deploy additional troops to porous border regions", sectorKey: sk("Defence"), effects: [{ target: "stability", delta: 2, description: "Border security reduces insecurity" }] },
    { id: "def-review", label: "Review Military Spending", description: "Audit defence procurement for value-for-money", sectorKey: sk("Defence"), effects: [{ target: "treasury", delta: 10, description: "Defence savings recovered" }, { target: "trust", delta: -2, description: "Military brass resent scrutiny" }] },
    { id: "def-equip", label: "Fast-Track Equipment Delivery", description: "Expedite pending arms and vehicle procurements", sectorKey: sk("Defence"), effects: [{ target: "stability", delta: 3, description: "Better-equipped forces improve security" }, { target: "treasury", delta: -15, description: "Accelerated procurement costs" }] },
  ],
  Justice: [
    { id: "jus-anticorrupt", label: "Intensify Anti-Corruption Drive", description: "Direct AGF to pursue high-profile corruption cases", sectorKey: sk("Justice"), effects: [{ target: "trust", delta: 3, description: "Anti-corruption action builds trust" }, { target: "stability", delta: -1, description: "Elites push back" }] },
    { id: "jus-reform", label: "Judicial Reform Initiative", description: "Push for faster case resolution in federal courts", sectorKey: sk("Justice"), effects: [{ target: "trust", delta: 2, description: "Justice system improvements" }] },
  ],
  Interior: [
    { id: "int-police", label: "Police Reform Directive", description: "Implement community policing and accountability measures", sectorKey: sk("Interior"), effects: [{ target: "trust", delta: 3, description: "Police reform builds public trust" }, { target: "stability", delta: 1, description: "Better policing improves stability" }] },
    { id: "int-identity", label: "National Identity Push", description: "Accelerate NIN registration and database cleanup", sectorKey: sk("Interior"), effects: [{ target: "stability", delta: 2, description: "Identity infrastructure aids governance" }] },
  ],
  "Foreign Affairs": [
    { id: "fa-diaspora", label: "Diaspora Engagement Drive", description: "Strengthen consular services and remittance channels", sectorKey: sk("Foreign Affairs"), effects: [{ target: "treasury", delta: 5, description: "Improved remittance flows" }, { target: "approval", delta: 1, description: "Diaspora outreach appreciated" }] },
    { id: "fa-trade", label: "Diplomatic Trade Mission", description: "Lead investment promotion to key partner nations", sectorKey: sk("Foreign Affairs"), effects: [{ target: "treasury", delta: 8, description: "Foreign investment inflows" }] },
  ],
  "Agriculture & Rural Development": [
    { id: "agric-inputs", label: "Distribute Farm Inputs", description: "Deliver subsidised seeds and fertiliser to smallholders", sectorKey: sk("Agriculture & Rural Development"), effects: [{ target: "approval", delta: 3, description: "Farmers benefit from input support" }, { target: "treasury", delta: -10, description: "Subsidy programme costs" }] },
    { id: "agric-silos", label: "Activate Grain Reserves", description: "Release strategic reserves to stabilise food prices", sectorKey: sk("Agriculture & Rural Development"), effects: [{ target: "stability", delta: 2, description: "Food price stability" }, { target: "approval", delta: 1, description: "Cheaper food wins approval" }] },
  ],
  Environment: [
    { id: "env-erosion", label: "Emergency Erosion Response", description: "Deploy resources to combat flooding and erosion hotspots", sectorKey: sk("Environment"), effects: [{ target: "stability", delta: 2, description: "Disaster response stabilises communities" }, { target: "treasury", delta: -8, description: "Emergency environmental spending" }] },
    { id: "env-enforce", label: "Enforce Pollution Standards", description: "Crack down on industrial polluters and gas flaring", sectorKey: sk("Environment"), effects: [{ target: "trust", delta: 2, description: "Environmental enforcement builds trust" }] },
  ],
};

export function getAvailableDirectives(portfolio: string): Directive[] {
  return DIRECTIVES[portfolio] ?? [];
}

export function canIssueDirective(
  ministerStatus: MinisterStatus,
  currentDay: number,
): boolean {
  return currentDay - ministerStatus.lastDirectiveDay >= 3;
}

export function applyDirective(
  state: GameState,
  ministerName: string,
  directiveId: string,
): Effect[] {
  // Find the directive across all portfolios
  let directive: Directive | undefined;
  for (const directives of Object.values(DIRECTIVES)) {
    directive = directives.find((d) => d.id === directiveId);
    if (directive) break;
  }
  if (!directive) return [];

  const effects: Effect[] = directive.effects.map((e) => ({
    target: e.target,
    delta: e.delta,
    description: e.description,
  }));

  // Apply effects to state
  for (const effect of effects) {
    const key = effect.target as keyof GameState;
    if (key in state && typeof state[key] === "number") {
      (state as unknown as Record<string, unknown>)[key] =
        (state[key] as number) + effect.delta;
    }
  }

  // Update minister status
  const status = state.ministerStatuses[ministerName];
  if (status) {
    status.lastDirectiveDay = state.day;
  }

  return effects;
}
