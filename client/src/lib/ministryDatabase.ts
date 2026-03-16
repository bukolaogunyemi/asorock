// Ministry Database — 7 Federal Ministries

export interface MinistryData {
  portfolio: string;
  fullName: string;
  established: number;
  mandate: string;
  responsibilities: string[];
}

export const MINISTRY_DATABASE: Record<string, MinistryData> = {
  finance: {
    portfolio: "Finance",
    fullName: "Federal Ministry of Finance, Budget and National Planning",
    established: 1958,
    mandate:
      "To manage Nigeria's public finances, formulate fiscal policy, and coordinate national economic planning to ensure sustainable growth and equitable development.",
    responsibilities: [
      "Federal budget preparation and management",
      "Fiscal policy formulation",
      "Revenue mobilisation and management",
      "Debt management oversight",
      "National economic planning",
      "Supervision of financial institutions",
      "Tax policy coordination with FIRS",
    ],
  },
  petroleum: {
    portfolio: "Petroleum",
    fullName: "Federal Ministry of Petroleum Resources",
    established: 1971,
    mandate:
      "To regulate, supervise, and develop Nigeria's petroleum industry — covering exploration, production, refining, and distribution of crude oil and natural gas — to maximise national benefit.",
    responsibilities: [
      "Upstream oil and gas policy",
      "Licensing and concession awards",
      "Oversight of NNPC and its subsidiaries",
      "Petroleum industry regulation",
      "Gas development and monetisation",
      "Local content enforcement",
      "Environmental compliance in oil-producing areas",
    ],
  },
  justice: {
    portfolio: "Justice",
    fullName: "Federal Ministry of Justice",
    established: 1914,
    mandate:
      "As the chief law officer of the federation, to administer justice, provide legal advice to government, prosecute federal offences, and protect the rule of law and human rights.",
    responsibilities: [
      "Federal prosecution of criminal matters",
      "Legal advice to federal ministries and agencies",
      "Drafting of federal legislation",
      "Treaty negotiation and international law",
      "Extradition matters",
      "Supervision of prisons and correctional services",
      "Human rights and access to justice initiatives",
    ],
  },
  defence: {
    portfolio: "Defence",
    fullName: "Federal Ministry of Defence",
    established: 1960,
    mandate:
      "To formulate, coordinate, and implement defence policy for the protection of Nigeria's sovereignty, territorial integrity, and national interests at home and abroad.",
    responsibilities: [
      "Defence policy formulation",
      "Oversight of the Nigerian Armed Forces",
      "Civil-military relations",
      "Defence procurement and logistics",
      "Military intelligence coordination",
      "UN and AU peacekeeping commitments",
      "Veterans affairs",
    ],
  },
  health: {
    portfolio: "Health",
    fullName: "Federal Ministry of Health and Social Welfare",
    established: 1960,
    mandate:
      "To promote and protect the health of all Nigerians by developing policies, standards, and services that ensure accessible, quality, and equitable healthcare across the federation.",
    responsibilities: [
      "National health policy and planning",
      "Regulation of medical practice",
      "Oversight of federal tertiary hospitals",
      "Disease control and immunisation",
      "Pharmaceutical regulation (through NAFDAC)",
      "Health sector financing",
      "Social welfare programmes",
    ],
  },
  "works & housing": {
    portfolio: "Works & Housing",
    fullName: "Federal Ministry of Works and Housing",
    established: 1960,
    mandate:
      "To develop and maintain Nigeria's federal road infrastructure and public buildings, and to facilitate affordable housing development across the federation.",
    responsibilities: [
      "Federal road construction and maintenance",
      "Bridges and highway infrastructure",
      "Federal housing programmes",
      "Building standards and codes",
      "Infrastructure procurement",
      "Flood and erosion control structures",
      "Public buildings construction and maintenance",
    ],
  },
  education: {
    portfolio: "Education",
    fullName: "Federal Ministry of Education",
    established: 1960,
    mandate:
      "To develop, coordinate, and implement national education policy to ensure that all Nigerians have access to quality education at all levels, fostering human capital development.",
    responsibilities: [
      "National education policy",
      "Curriculum development",
      "Oversight of federal unity schools",
      "Higher education regulation",
      "Universal Basic Education (UBE) programme",
      "National Examination Council (NECO) supervision",
      "Student loans and scholarships",
      "Technical and vocational education",
    ],
  },
};

/** Case-insensitive lookup for a ministry by portfolio name */
export function getMinistryData(portfolio: string): MinistryData | undefined {
  return MINISTRY_DATABASE[portfolio.toLowerCase()];
}
