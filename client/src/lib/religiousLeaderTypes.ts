// client/src/lib/religiousLeaderTypes.ts
import type { CharacterCompetencies } from "./competencyTypes";

export interface ReligiousLeaderPosition {
  id: string;
  title: string;
  religion: "Christianity" | "Islam";
  description: string;
  influenceWeight: number;
}

export interface ReligiousLeaderAppointment {
  positionId: string;
  characterName: string;
  appointedDay: number;
}

export interface ReligiousLeaderCandidate {
  name: string;
  state: string;
  zone: string;
  age: number;
  gender: "Male";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  disposition: "supportive" | "neutral" | "critical";
  influence: number;
  qualifiedFor: string[];
  competencies: {
    professional: CharacterCompetencies["professional"];
    personal: CharacterCompetencies["personal"];
  };
}

export interface ReligiousLeaderSystemState {
  positions: ReligiousLeaderPosition[];
  appointments: ReligiousLeaderAppointment[];
  interfaithHarmony: number;
  lastSummitDay?: number; // Day of last interfaith summit (60-day cooldown)
}

export const RELIGIOUS_LEADER_POSITIONS: ReligiousLeaderPosition[] = [
  {
    id: "pres-christian-society",
    title: "President, Christian Association of Nigeria",
    religion: "Christianity",
    description: "Head of CAN, the umbrella body for all Christian denominations in Nigeria. Speaks for over 80 million Nigerian Christians.",
    influenceWeight: 1.0,
  },
  {
    id: "pres-muslim-society",
    title: "President, Supreme Council for Islamic Affairs",
    religion: "Islam",
    description: "Head of NSCIA, the apex body for Islamic affairs in Nigeria. Coordinates Muslim positions on governance and sharia.",
    influenceWeight: 1.0,
  },
];

export const RELIGIOUS_LEADER_TRAITS = [
  "Ecumenical Leader", "Televangelist", "Social Justice Advocate",
  "Conservative Theologian", "Political Operator", "Youth Pastor",
  "Builder of Institutions", "Interfaith Diplomat", "Pan-Nigerian",
  "Prosperity Gospel", "Liberation Theology", "Islamic Scholar",
  "Sufi Mystic", "Modernist Muslim", "Conservative Cleric",
  "Community Builder", "Peacemaker", "Youth Engagement",
] as const;
