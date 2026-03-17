// client/src/lib/governorTypes.ts
// Type definitions for the governor system

export interface GovernorAppointment {
  state: string;
  characterName: string;
  party: string;
  electedDay: number;
  term: number;
  cooperation: number;
}

export interface GovernorSystemState {
  governors: GovernorAppointment[];
  forumChair: string | null;
  forumChairElectedDay: number | null;
  nextElectionDay: number;
}
