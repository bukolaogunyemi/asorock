// Constitutional Office Database — 5 offices matching POSITION_NAMES in constitutionalOfficers.ts

export interface ConstitutionalOfficeData {
  positionName: string;
  fullTitle: string;
  description: string;
  chamber?: string;
  keyPowers: string[];
}

/** Slugify a position name for use as a database key */
function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export const CONSTITUTIONAL_OFFICE_DATABASE: Record<string, ConstitutionalOfficeData> = {
  "senate-president": {
    positionName: "Senate President",
    fullTitle: "President of the Senate",
    description:
      "The Senate President presides over the Nigerian Senate, the upper chamber of the National Assembly. Elected by senators from among themselves, the Senate President is third in the presidential succession line after the President and Vice President. The office wields enormous influence over federal legislation, executive appointments, and national policy.",
    chamber: "Senate",
    keyPowers: [
      "Presiding over Senate sessions and debates",
      "Signing or withholding assent to Senate resolutions",
      "Referring bills and petitions to committees",
      "Representing the Senate in inter-institutional relations",
      "Maintaining order and decorum in the Senate chamber",
      "Serving as Acting President when required by law",
    ],
  },
  "deputy-senate-president": {
    positionName: "Deputy Senate President",
    fullTitle: "Deputy President of the Senate",
    description:
      "The Deputy Senate President assists the Senate President in presiding over the Senate and assumes the role of acting Senate President in the latter's absence. Elected by senators from among themselves, the Deputy Senate President is a key figure in Senate legislative management and constitutional succession.",
    chamber: "Senate",
    keyPowers: [
      "Presiding over Senate in the Senate President's absence",
      "Assisting in managing Senate legislative business",
      "Representing the Senate externally when delegated",
      "Chairing joint Senate committees when required",
      "Acting Senate President when Senate President is incapacitated",
    ],
  },
  "speaker-of-the-house": {
    positionName: "Speaker of the House",
    fullTitle: "Speaker of the House of Representatives",
    description:
      "The Speaker of the House of Representatives presides over Nigeria's lower legislative chamber of 360 members. Elected by House members, the Speaker manages legislative proceedings, controls the legislative calendar, and is the face of the House. The office is fourth in the presidential succession line and holds significant influence over budgetary and appropriation bills.",
    chamber: "House of Representatives",
    keyPowers: [
      "Presiding over House of Representatives sessions",
      "Controlling the House legislative calendar",
      "Referring bills to standing committees",
      "Certifying money and appropriation bills",
      "Maintaining order in the House chamber",
      "Representing the House in external relations",
    ],
  },
  "deputy-speaker": {
    positionName: "Deputy Speaker",
    fullTitle: "Deputy Speaker of the House of Representatives",
    description:
      "The Deputy Speaker assists the Speaker in managing House proceedings and assumes the Speaker's role in their absence. Elected by House members, the Deputy Speaker is involved in the day-to-day management of House affairs and serves as a key liaison between the Speaker's office and rank-and-file members.",
    chamber: "House of Representatives",
    keyPowers: [
      "Presiding over House in the Speaker's absence",
      "Assisting in managing House floor proceedings",
      "Liaising between Speaker's office and committee chairs",
      "Acting Speaker when Speaker is incapacitated",
      "Representing the House at inter-institutional events",
    ],
  },
  "chief-justice-of-nigeria": {
    positionName: "Chief Justice of Nigeria",
    fullTitle: "Chief Justice of Nigeria",
    description:
      "The Chief Justice of Nigeria (CJN) heads the Supreme Court of Nigeria and is the head of the Nigerian judiciary. The CJN administers the presidential oath of office and swears in other constitutional officers. The office is pivotal in interpreting the constitution, resolving inter-governmental disputes, and upholding judicial independence.",
    keyPowers: [
      "Presiding over the Supreme Court of Nigeria",
      "Administering the presidential oath of office",
      "Heading the National Judicial Council",
      "Final interpretation of the Nigerian Constitution",
      "Determining election petition appeals at the Supreme Court",
      "Appointing acting Chief Justice when required",
      "Safeguarding judicial independence from executive interference",
    ],
  },
};

/** Case-insensitive lookup by position name (exact match or slug) */
export function getConstitutionalOfficeData(
  positionName: string
): ConstitutionalOfficeData | undefined {
  const slug = slugify(positionName);
  if (CONSTITUTIONAL_OFFICE_DATABASE[slug]) return CONSTITUTIONAL_OFFICE_DATABASE[slug];
  // Fallback: scan all entries for exact positionName match
  return Object.values(CONSTITUTIONAL_OFFICE_DATABASE).find(
    (o) => o.positionName.toLowerCase() === positionName.toLowerCase()
  );
}
