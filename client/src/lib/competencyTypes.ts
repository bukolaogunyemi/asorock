export interface ProfessionalCompetencies {
  economics: number;      // 0-100
  diplomacy: number;      // 0-100
  security: number;       // 0-100
  media: number;          // 0-100
  legal: number;          // 0-100
  administration: number; // 0-100
  technology: number;     // 0-100
}

export interface PersonalCompetencies {
  loyalty: number;     // 0-100
  charisma: number;    // 0-100
  leadership: number;  // 0-100
  ambition: number;    // 0-100
  integrity: number;   // 0-100
  resilience: number;  // 0-100
  intrigue: number;    // 0-100
}

export interface CharacterCompetencies {
  professional: ProfessionalCompetencies;
  personal: PersonalCompetencies;
}

export interface CareerEntry {
  position: string;
  period: string;
  current: boolean;
}

export interface InteractionEntry {
  day: number;
  date: string;
  description: string;
  category: "appointment" | "dismissal" | "summon" | "investigation" | "event" | "hook";
}

export const PROFESSIONAL_KEYS = [
  "economics", "diplomacy", "security", "media", "legal", "administration", "technology",
] as const;

export const PERSONAL_KEYS = [
  "loyalty", "charisma", "leadership", "ambition", "integrity", "resilience", "intrigue",
] as const;

export const PROFESSIONAL_LABELS: Record<keyof ProfessionalCompetencies, string> = {
  economics: "Economics",
  diplomacy: "Diplomacy",
  security: "Security",
  media: "Media",
  legal: "Legal",
  administration: "Administration",
  technology: "Technology",
};

export const PERSONAL_LABELS: Record<keyof PersonalCompetencies, string> = {
  loyalty: "Loyalty",
  charisma: "Charisma",
  leadership: "Leadership",
  ambition: "Ambition",
  integrity: "Integrity",
  resilience: "Resilience",
  intrigue: "Intrigue",
};
