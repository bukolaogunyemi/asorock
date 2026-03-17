// client/src/lib/judiciaryTypes.ts
// Type definitions for the judiciary system

export type JudicialPhilosophy = "originalist" | "activist" | "deferential" | "independent";

export interface JusticeProfile {
  characterName: string;
  philosophy: JudicialPhilosophy;
  seniorityRank: number;
  appointedDay: number;
  retirementAge: number;
}

export interface JudiciaryState {
  supremeCourt: {
    justices: JusticeProfile[];
    chiefJustice: string | null;
    cjnConfirmed: boolean;
  };
  courtOfAppeal: {
    justices: JusticeProfile[];
    president: string | null;
    pcaConfirmed: boolean;
  };
  pendingNomination: {
    position: "cjn" | "pca" | null;
    nominee: string | null;
    hearingDay: number | null;
  };
}
