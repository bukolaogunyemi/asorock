// client/src/lib/diplomatTypes.ts
// Type definitions for the expanded diplomat/ambassador system
// 40 key bilateral posts + 10 international institution reps + ~30 minor embassies

import type { CharacterCompetencies } from "./competencyTypes";

export type AmbassadorPostId = string; // e.g., "amb-usa", "inst-un-ny", "minor-cuba"

export type PostPrestige = "strategic" | "standard" | "routine";

export type PostCategory = "bilateral" | "institution" | "minor";

export type LanguageRequirement = "French" | "Arabic" | "Mandarin" | "Portuguese" | "Spanish" | "Russian" | "None";

export interface AmbassadorPost {
  id: AmbassadorPostId;
  title: string;             // "Ambassador to the United States"
  country: string;           // "United States"
  region: string;            // "North America", "Europe", "Asia", "Africa", "Middle East", "South America", "Oceania"
  category: PostCategory;    // bilateral, institution, or minor
  prestige: PostPrestige;
  internationalWeight: number; // 0.1-1.0, affects internationalReputation
  tradeWeight: number;         // 0.0-0.8, trade/economic relationship importance
  militaryWeight: number;      // 0.0-0.6, security/military cooperation importance
  languageRequired: LanguageRequirement; // required language for the post
}

export interface AmbassadorAppointment {
  postId: AmbassadorPostId;
  characterName: string | null;
  appointedDay: number;
  rotationDueDay: number;       // ambassadors rotate every 2-3 years (~730-1095 days)
  vacantSinceDay: number | null; // tracks how long a post has been vacant
}

export interface DiplomaticIncident {
  postId: AmbassadorPostId;
  day: number;
  type: "gaffe" | "protocol-breach" | "trade-dispute" | "security-leak" | "bilateral-success" | "treaty-signed";
  description: string;
  resolved: boolean;
}

export interface DiplomatSystemState {
  posts: AmbassadorPost[];
  appointments: AmbassadorAppointment[];
  incidents: DiplomaticIncident[];
  diplomaticEffectiveness: number; // aggregate score, 0-100
}

// ── Candidate type ──

export interface DiplomatCandidate {
  name: string;
  state: string;
  zone: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  competence: number;           // diplomatic competence, 50-95
  languageSkills: LanguageRequirement[]; // languages spoken (besides English)
  qualifiedFor: AmbassadorPostId[];
  competencies: {
    professional: CharacterCompetencies["professional"];
    personal: CharacterCompetencies["personal"];
  };
  honorific?: string;
  traditionalTitle?: string;
  professionalBackground?: string;
  previousOffices?: string[];
  healthStatus?: "healthy" | "declining" | "critical";
  foreignConnections?: string[];
  avatarId?: string;
}
