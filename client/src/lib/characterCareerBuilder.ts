import type { CareerEntry } from "./competencyTypes";

interface CareerBuilderInput {
  previousOffices?: string[];
  currentPosition?: string;
  professionalBackground?: string;
  age?: number;
}

const CAREER_TEMPLATES: Record<string, { young: string[]; mid: string[]; senior: string[] }> = {
  Lawyer: {
    young: ["Associate, Legal Chambers"],
    mid: ["Senior Advocate of Nigeria", "Managing Partner, Legal Associates"],
    senior: ["Chairman, Nigerian Bar Association Chapter", "Senior Counsel"],
  },
  Banker: {
    young: ["Branch Manager, Commercial Bank"],
    mid: ["Executive Director, Merchant Bank", "Regional Director, Banking Operations"],
    senior: ["Board Member, Central Bank Advisory", "Chairman, Banking Association"],
  },
  "Military Officer": {
    young: ["Captain, Nigerian Army"],
    mid: ["Colonel, Nigerian Army", "Brigadier General, Nigerian Army"],
    senior: ["Major General (Rtd.)", "GOC, Military Division"],
  },
  Academic: {
    young: ["Lecturer, Federal University"],
    mid: ["Professor, Federal University", "Dean, Faculty of Arts & Sciences"],
    senior: ["Vice Chancellor, State University"],
  },
  "Civil Servant": {
    young: ["Administrative Officer, Federal Ministry"],
    mid: ["Director, Federal Ministry", "Permanent Secretary, State Government"],
    senior: ["Head of Civil Service", "Secretary to Government"],
  },
  Politician: {
    young: ["LGA Councillor"],
    mid: ["Member, State House of Assembly", "Commissioner, State Government"],
    senior: ["Special Adviser to Governor", "Party Chairman, State Chapter"],
  },
  Engineer: {
    young: ["Project Engineer, Federal Works"],
    mid: ["Chief Engineer, State Infrastructure", "Director, Federal Roads Authority"],
    senior: ["Permanent Secretary, Works & Infrastructure"],
  },
  Doctor: {
    young: ["Medical Officer, Teaching Hospital"],
    mid: ["Consultant Physician, Federal Medical Centre", "Chief Medical Director"],
    senior: ["Chairman, Medical Board"],
  },
  Diplomat: {
    young: ["Third Secretary, Nigerian Embassy"],
    mid: ["Counsellor, Nigerian High Commission", "Minister-Counsellor, Permanent Mission"],
    senior: ["Ambassador Extraordinary", "Director-General, Ministry of Foreign Affairs"],
  },
  Businessman: {
    young: ["Managing Director, Trading Company"],
    mid: ["CEO, Manufacturing Group", "Chairman, Chamber of Commerce"],
    senior: ["Industrialist and Philanthropist", "Board Chairman, Conglomerate"],
  },
  Journalist: {
    young: ["Reporter, National Daily"],
    mid: ["Editor, Major Publication", "Bureau Chief, Television Network"],
    senior: ["Chairman, Media Group", "Director-General, Broadcasting"],
  },
  Economist: {
    young: ["Research Analyst, Central Bank"],
    mid: ["Director, Economic Planning", "Chief Economist, Development Bank"],
    senior: ["Economic Adviser to Government", "Board Member, African Development Bank"],
  },
};

export function buildCareerHistory(input: CareerBuilderInput): CareerEntry[] {
  const entries: CareerEntry[] = [];
  const age = input.age ?? 50;
  const ageGroup = age < 46 ? "young" : age < 61 ? "mid" : "senior";

  if (input.previousOffices?.length) {
    for (const office of input.previousOffices) {
      const match = office.match(/^(.+?)(?:\s*\((\d{4}[-–]\d{4})\))?$/);
      entries.push({
        position: match?.[1]?.trim() ?? office,
        period: match?.[2] ?? "",
        current: false,
      });
    }
  } else if (input.professionalBackground) {
    const template = CAREER_TEMPLATES[input.professionalBackground] ?? CAREER_TEMPLATES["Politician"];
    if (template) {
      entries.push(...template.young.map(p => ({ position: p, period: "", current: false })));
      if (ageGroup !== "young") {
        entries.push(...template.mid.map(p => ({ position: p, period: "", current: false })));
      }
      if (ageGroup === "senior") {
        entries.push(...template.senior.map(p => ({ position: p, period: "", current: false })));
      }
    }
  }

  if (input.currentPosition) {
    entries.push({ position: input.currentPosition, period: "Present", current: true });
  }

  if (entries.length === 0) {
    entries.push({ position: "Public Service", period: "", current: false });
  }

  return entries;
}
