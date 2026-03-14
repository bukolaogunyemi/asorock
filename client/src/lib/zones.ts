export interface GeopoliticalZone {
  name: string;
  abbrev: string;
  states: string[];
  registered: number;
}

export const GEOPOLITICAL_ZONES: GeopoliticalZone[] = [
  { name: "North-Central", abbrev: "NC", states: ["Benue","Kogi","Kwara","Nasarawa","Niger","Plateau","FCT"], registered: 14_500_000 },
  { name: "North-West", abbrev: "NW", states: ["Jigawa","Kaduna","Kano","Katsina","Kebbi","Sokoto","Zamfara"], registered: 20_100_000 },
  { name: "North-East", abbrev: "NE", states: ["Adamawa","Bauchi","Borno","Gombe","Taraba","Yobe"], registered: 11_800_000 },
  { name: "South-West", abbrev: "SW", states: ["Ekiti","Lagos","Ogun","Ondo","Osun","Oyo"], registered: 16_700_000 },
  { name: "South-East", abbrev: "SE", states: ["Abia","Anambra","Ebonyi","Enugu","Imo"], registered: 9_800_000 },
  { name: "South-South", abbrev: "SS", states: ["Akwa Ibom","Bayelsa","Cross River","Delta","Edo","Rivers"], registered: 12_100_000 },
];

/** Look up the geopolitical zone for a Nigerian state */
export function getZoneForState(state: string): GeopoliticalZone | undefined {
  return GEOPOLITICAL_ZONES.find((z) => z.states.includes(state));
}
