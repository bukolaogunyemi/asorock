// client/src/lib/constitutionalPools.ts
import type { ConstitutionalCandidate } from "./constitutionalOfficers";
import { setConstitutionalPools } from "./constitutionalOfficers";
import type { Relationship } from "./gameTypes";

// Helper to reduce boilerplate — age is explicit (no Math.random)
function candidate(
  name: string,
  age: number,
  state: string,
  gender: "Male" | "Female",
  religion: "Muslim" | "Christian",
  loyalty: number,
  competence: number,
  ambition: number,
  faction: string,
  relationship: Relationship,
  agenda: string,
  opinion: string,
): ConstitutionalCandidate {
  const parts = name.replace(/^(Sen\.|Rt\. Hon\.|Hon\.|Justice|Barr\.|Prof\.|Dr\.|Alh\.|Hajiya|Chief|Engr\.) /, "").split(" ");
  const avatar = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
  return {
    name, portfolio: "", agenda, opinion, loyalty, competence, ambition,
    faction, relationship, avatar, age, state, gender, religion,
  };
}

// ── Pool structure: [positionIndex][zoneIndex][candidateIndex] ──
// Zone order matches GEOPOLITICAL_ZONES: NC=0, NW=1, NE=2, SW=3, SE=4, SS=5
// Position order: Senate President=0, Deputy Senate President=1, Speaker=2, Deputy Speaker=3

const pools: ConstitutionalCandidate[][][] = [
  // ── Position 0: Senate President ──
  [
    // NC (North-Central) — 5 candidates, at least 2 women, at least 2 Muslim + 2 Christian
    [
      candidate("Sen. Terhemba Gbilimba", 58, "Benue", "Male", "Christian", 58, 72, 85, "Middle Belt Caucus", "Wary", "Push for Middle Belt autonomy and farmer-herder resolution framework.", "Cautiously supportive — expects agricultural policy concessions."),
      candidate("Sen. Hajiya Asabe Ndagi", 65, "Niger", "Female", "Muslim", 65, 68, 70, "Northern Caucus", "Neutral", "Strengthen federal allocations to North-Central states.", "Pragmatic — will cooperate if her state benefits."),
      candidate("Sen. Comfort Adikpo", 52, "Benue", "Female", "Christian", 52, 76, 78, "Middle Belt Caucus", "Wary", "Constitutional reform to address land use act.", "Distrustful of executive overreach but open to dialogue."),
      candidate("Sen. Suleiman Lemu", 72, "Niger", "Male", "Muslim", 72, 65, 60, "Northern Caucus", "Friendly", "Maintain party discipline and push through executive agenda.", "Old-guard loyalist — expects patronage."),
      candidate("Sen. Danjuma Jiya", 60, "Nasarawa", "Male", "Christian", 60, 74, 82, "Independent", "Neutral", "Bridge northern and southern legislative blocs.", "Calculating — support depends on committee assignments."),
    ],
    // NW (North-West)
    [
      candidate("Sen. Alh. Garba Kangiwa", 70, "Sokoto", "Male", "Muslim", 70, 68, 75, "Northern Caucus", "Friendly", "Consolidate northern legislative bloc under party umbrella.", "Loyal to party — expects reciprocity on northern appointments."),
      candidate("Sen. Hajiya Safiya Ringim", 62, "Jigawa", "Female", "Muslim", 62, 74, 68, "Northern Caucus", "Neutral", "Women's empowerment legislation and education reform.", "Pragmatic — will trade votes for women's affairs budget."),
      candidate("Sen. Abdulkadir Tsafe", 55, "Zamfara", "Male", "Muslim", 55, 70, 88, "Northern Populist", "Wary", "Security reform for banditry-affected North-West states.", "Publicly supportive but privately ambitious."),
      candidate("Sen. Hauwa Bichi", 68, "Kano", "Female", "Christian", 68, 72, 62, "Northern Caucus", "Friendly", "Healthcare infrastructure expansion in the North.", "Reliable ally — modest ambition."),
      candidate("Sen. Musa Gwandu", 48, "Kebbi", "Male", "Christian", 48, 66, 72, "Independent", "Neutral", "Minority rights within northern states.", "Transactional — needs assurance of protection."),
    ],
    // NE (North-East)
    [
      candidate("Sen. Kashim Askira", 65, "Borno", "Male", "Muslim", 65, 78, 70, "Northern Caucus", "Friendly", "Post-insurgency reconstruction and IDP resettlement.", "Loyal — expects defence spending prioritisation."),
      candidate("Sen. Falmata Gubio", 58, "Borno", "Female", "Muslim", 58, 72, 65, "Northern Caucus", "Neutral", "Humanitarian corridor legislation for North-East.", "Pragmatic — focused on constituency needs above politics."),
      candidate("Sen. Adamu Bogoro", 52, "Bauchi", "Male", "Christian", 52, 74, 80, "Middle Belt Caucus", "Wary", "Bridge North-East and Middle Belt interests.", "Cautious — burned by previous administration's promises."),
      candidate("Sen. Hannatu Kaigama", 60, "Taraba", "Female", "Christian", 60, 70, 68, "Middle Belt Caucus", "Neutral", "Agricultural reform and anti-grazing legislation.", "Open to cooperation on specific policy issues."),
      candidate("Sen. Bukar Damboa", 70, "Yobe", "Male", "Muslim", 70, 66, 60, "Northern Caucus", "Friendly", "Traditional institution preservation and Islamic education.", "Old-guard — loyal to party hierarchy."),
    ],
    // SW (South-West)
    [
      candidate("Sen. Babatunde Ipaye", 62, "Lagos", "Male", "Christian", 62, 76, 88, "South-West Alliance", "Wary", "Push constitutional reform to strengthen Senate powers over budget.", "Cautiously supportive — expects patronage and influence over appointments."),
      candidate("Sen. Folake Adesanya", 55, "Ogun", "Female", "Christian", 55, 80, 72, "South-West Alliance", "Neutral", "Judicial reform and anti-corruption legislation.", "Independent-minded — votes conviction over party line."),
      candidate("Sen. Alhaji Kolawole Alabi", 68, "Ogun", "Male", "Muslim", 68, 70, 65, "South-West Alliance", "Friendly", "Bridge Yoruba Muslim-Christian legislative cooperation.", "Pragmatic — leverage for cross-regional deals."),
      candidate("Sen. Modupe Ogundare", 50, "Oyo", "Female", "Muslim", 50, 72, 78, "South-West Alliance", "Neutral", "Education reform and youth employment legislation.", "Progressive — expects policy alignment."),
      candidate("Sen. Adeniyi Akande", 72, "Osun", "Male", "Christian", 72, 68, 55, "South-West Alliance", "Friendly", "Federalism and resource control for South-West.", "Elder statesman — reliable but demands respect."),
    ],
    // SE (South-East)
    [
      candidate("Sen. Chukwuemeka Nnadi", 48, "Enugu", "Male", "Christian", 48, 74, 90, "South-East Bloc", "Wary", "Restructuring and South-East development fund.", "Publicly loyal but privately calculating — eyes presidency."),
      candidate("Sen. Obiageli Ugwu", 55, "Ebonyi", "Female", "Christian", 55, 78, 72, "South-East Bloc", "Neutral", "Infrastructure development for South-East.", "Pragmatic technocrat — trades votes for project funding."),
      candidate("Sen. Ikechukwu Arinze", 62, "Anambra", "Male", "Christian", 62, 70, 80, "South-East Bloc", "Wary", "Constitutional amendment for state police.", "Ambitious — building cross-regional alliances."),
      candidate("Sen. Amaka Okafor", 58, "Imo", "Female", "Muslim", 58, 72, 68, "South-East Bloc", "Neutral", "Women's rights and social welfare legislation.", "Cooperative on gender issues regardless of party."),
      candidate("Sen. Alhaji Usman Okoro", 65, "Abia", "Male", "Muslim", 65, 66, 62, "Independent", "Friendly", "Inter-faith dialogue and minority rights.", "Unique voice — Muslim Igbo perspective."),
    ],
    // SS (South-South)
    [
      candidate("Sen. Dakoru Alagoa", 55, "Bayelsa", "Male", "Christian", 55, 72, 82, "Niger Delta Caucus", "Wary", "Resource control and Niger Delta development.", "Support contingent on oil revenue reform."),
      candidate("Sen. Isoken Ehanire", 60, "Edo", "Female", "Christian", 60, 78, 68, "South-South Alliance", "Neutral", "Environmental legislation and oil spill remediation.", "Policy-focused — less interested in patronage."),
      candidate("Sen. Ebikabowei Igali", 68, "Bayelsa", "Male", "Christian", 68, 70, 75, "Niger Delta Caucus", "Friendly", "Amnesty programme continuation and maritime security.", "Old-guard — transactional loyalty."),
      candidate("Sen. Arit Effiong", 52, "Cross River", "Female", "Muslim", 52, 76, 70, "South-South Alliance", "Neutral", "Tourism development and Cross River infrastructure.", "Moderate — open to executive agenda."),
      candidate("Sen. Ovie Uvwie", 58, "Delta", "Male", "Muslim", 58, 68, 78, "Niger Delta Caucus", "Wary", "Oil-producing community compensation framework.", "Ambitious — uses Delta oil leverage."),
    ],
  ],

  // ── Position 1: Deputy Senate President ──
  [
    // NC
    [
      candidate("Sen. Aondoakaa Tyoor", 55, "Benue", "Male", "Christian", 55, 70, 78, "Middle Belt Caucus", "Neutral", "Push for grazing reserve reform and farmer protection.", "Supportive if agriculture gets priority."),
      candidate("Sen. Hajiya Rakiya Mokwa", 62, "Niger", "Female", "Muslim", 62, 72, 65, "Northern Caucus", "Friendly", "Women's political participation in the North.", "Reliable — focuses on constituent service."),
      candidate("Sen. Joseph Agaie", 58, "Niger", "Male", "Christian", 58, 68, 72, "Middle Belt Caucus", "Wary", "Minority Christian rights in northern states.", "Cautious — needs assurance of inclusion."),
      candidate("Sen. Fatima Chatta", 50, "Kwara", "Female", "Muslim", 50, 76, 70, "Northern Caucus", "Neutral", "Education reform and girl-child enrollment.", "Technocratic — votes on merit."),
      candidate("Sen. Idris Lapai", 70, "Niger", "Male", "Muslim", 70, 64, 55, "Northern Caucus", "Friendly", "Traditional institution preservation.", "Loyal party man — modest ambition."),
    ],
    // NW
    [
      candidate("Sen. Bashir Fagge", 68, "Kano", "Male", "Muslim", 68, 70, 72, "Northern Caucus", "Friendly", "Industrial policy for Kano's manufacturing sector.", "Loyal — expects economic ministry access."),
      candidate("Sen. Hadiza Zurmi", 55, "Zamfara", "Female", "Muslim", 55, 74, 68, "Northern Caucus", "Neutral", "Security legislation for banditry-affected communities.", "Pragmatic — trades votes for security deployment."),
      candidate("Sen. Aminu Bunza", 62, "Kebbi", "Male", "Muslim", 62, 66, 75, "Northern Populist", "Wary", "Agricultural subsidies and rice self-sufficiency.", "Populist — plays to gallery but negotiable."),
      candidate("Sen. Maryam Gusau", 48, "Zamfara", "Female", "Christian", 48, 72, 65, "Northern Caucus", "Neutral", "Healthcare and maternal mortality reduction.", "Policy-focused — less interested in patronage."),
      candidate("Sen. Yakubu Gwandu", 58, "Kebbi", "Male", "Christian", 58, 68, 70, "Independent", "Neutral", "Minority rights and inter-faith harmony.", "Bridge-builder — valued for cross-party appeal."),
    ],
    // NE
    [
      candidate("Sen. Goni Marte", 62, "Borno", "Male", "Muslim", 62, 74, 68, "Northern Caucus", "Friendly", "Counter-terrorism and North-East reconstruction.", "Experienced — deep knowledge of security apparatus."),
      candidate("Sen. Yagana Dikwa", 55, "Borno", "Female", "Muslim", 55, 70, 65, "Northern Caucus", "Neutral", "IDP resettlement and women's rehabilitation.", "Humanitarian focus — cooperative on social bills."),
      candidate("Sen. Sunday Liman", 58, "Adamawa", "Male", "Christian", 58, 72, 78, "Middle Belt Caucus", "Wary", "Southern Adamawa autonomy and development.", "Cautious — expects visible development projects."),
      candidate("Sen. Hauwa Joda", 50, "Gombe", "Female", "Muslim", 50, 76, 62, "Northern Caucus", "Neutral", "Education infrastructure in North-East.", "Technocratic — respects competence over loyalty."),
      candidate("Sen. Adamu Askira", 65, "Borno", "Male", "Christian", 65, 68, 60, "Independent", "Friendly", "Christian minority protection in North-East.", "Grateful for inclusion — reliably loyal."),
    ],
    // SW
    [
      candidate("Sen. Kayode Oduya", 58, "Lagos", "Male", "Christian", 58, 78, 82, "South-West Alliance", "Wary", "Lagos infrastructure and smart city legislation.", "Ambitious — building gubernatorial platform."),
      candidate("Sen. Titilayo Adeleke", 62, "Osun", "Female", "Christian", 62, 74, 68, "South-West Alliance", "Neutral", "Cultural heritage preservation and creative economy.", "Moderate — votes party line mostly."),
      candidate("Sen. Alhaji Rasheed Alabi", 70, "Oyo", "Male", "Muslim", 70, 66, 55, "South-West Alliance", "Friendly", "Agricultural modernisation in South-West.", "Old-guard — reliable but uninspired."),
      candidate("Sen. Bukola Fawehinmi", 52, "Ondo", "Female", "Christian", 52, 80, 75, "South-West Alliance", "Neutral", "Anti-corruption and transparency legislation.", "Principled — may challenge executive on accountability."),
      candidate("Sen. Olumide Makinde", 55, "Oyo", "Male", "Muslim", 55, 72, 78, "South-West Alliance", "Wary", "Revenue sharing reform for South-West states.", "Calculating — support tied to fiscal concessions."),
    ],
    // SE
    [
      candidate("Sen. Obinna Mbah", 52, "Anambra", "Male", "Christian", 52, 76, 85, "South-East Bloc", "Wary", "South-East infrastructure deficit and federal appointments.", "Ambitious — positioning for higher office."),
      candidate("Sen. Chiamaka Igwe", 58, "Enugu", "Female", "Christian", 58, 72, 68, "South-East Bloc", "Neutral", "ICT development and tech hub legislation.", "Pragmatic — trades votes for project approvals."),
      candidate("Sen. Nnamdi Eze", 65, "Ebonyi", "Male", "Christian", 65, 68, 72, "South-East Bloc", "Friendly", "Mining sector regulation and solid minerals.", "Loyal — Ebonyi's interests above party."),
      candidate("Sen. Adaeze Soludo", 48, "Anambra", "Female", "Muslim", 48, 78, 70, "South-East Bloc", "Neutral", "Education quality and university autonomy.", "Academic background — evidence-based approach."),
      candidate("Sen. Alhaji Chidi Okonkwo", 60, "Imo", "Male", "Muslim", 60, 66, 62, "Independent", "Friendly", "Inter-faith commerce and trade legislation.", "Cooperative — valued for minority perspective."),
    ],
    // SS
    [
      candidate("Sen. Timipre Ekine", 58, "Bayelsa", "Male", "Christian", 58, 72, 78, "Niger Delta Caucus", "Wary", "Petroleum Industry Act amendments for host communities.", "Support tied to oil community benefits."),
      candidate("Sen. Ebiere Koroye", 55, "Bayelsa", "Female", "Christian", 55, 76, 65, "Niger Delta Caucus", "Neutral", "Environmental remediation and clean-up legislation.", "Policy-focused — bipartisan on environment."),
      candidate("Sen. Osaro Aigbokhan", 62, "Edo", "Male", "Christian", 62, 70, 72, "South-South Alliance", "Friendly", "Edo cultural preservation and tourism.", "Loyal — old establishment family."),
      candidate("Sen. Idara Bassey", 50, "Cross River", "Female", "Muslim", 50, 74, 68, "South-South Alliance", "Neutral", "Maritime economy and coastal development.", "Moderate — open to compromise."),
      candidate("Sen. Ovie Orhorhoro", 65, "Delta", "Male", "Muslim", 65, 68, 75, "Niger Delta Caucus", "Wary", "Delta state fiscal federalism.", "Leverages oil revenue arguments."),
    ],
  ],

  // ── Position 2: Speaker of the House ──
  [
    // NC
    [
      candidate("Rt. Hon. Msugh Anhange", 60, "Benue", "Male", "Christian", 60, 74, 78, "Middle Belt Caucus", "Neutral", "House reform and procedural modernisation.", "Efficient — respects institutional norms."),
      candidate("Rt. Hon. Hajiya Laraba Tsado", 65, "Niger", "Female", "Muslim", 65, 70, 65, "Northern Caucus", "Friendly", "Rural infrastructure and women's political representation.", "Reliable — party disciplinarian."),
      candidate("Rt. Hon. Emmanuel Ugba", 55, "Benue", "Male", "Christian", 55, 72, 82, "Middle Belt Caucus", "Wary", "Anti-grazing legislation and farmer protection.", "Ambitious — may use Speaker platform for governorship."),
      candidate("Rt. Hon. Bilkisu Batati", 52, "Niger", "Female", "Muslim", 52, 76, 68, "Northern Caucus", "Neutral", "Education and healthcare committee reform.", "Technocratic — competent chair."),
      candidate("Rt. Hon. Idris Kutigi", 68, "Niger", "Male", "Muslim", 68, 66, 58, "Northern Caucus", "Friendly", "Party cohesion and legislative-executive harmony.", "Old-guard — steady hand."),
    ],
    // NW
    [
      candidate("Rt. Hon. Abdullahi Kagara", 62, "Zamfara", "Male", "Muslim", 62, 70, 75, "Northern Caucus", "Friendly", "Security committee reform for North-West.", "Loyal — expects committee chairmanship allocation."),
      candidate("Rt. Hon. Zainab Shinkafi", 55, "Zamfara", "Female", "Muslim", 55, 74, 68, "Northern Caucus", "Neutral", "Girl-child education and anti-child-marriage legislation.", "Progressive for the region — principled."),
      candidate("Rt. Hon. Sani Argungu", 70, "Kebbi", "Male", "Muslim", 70, 66, 55, "Northern Caucus", "Friendly", "Agricultural subsidies and irrigation projects.", "Reliable — no surprises."),
      candidate("Rt. Hon. Fatima Dankwambo", 48, "Jigawa", "Female", "Christian", 48, 78, 72, "Northern Caucus", "Neutral", "Primary healthcare and maternal mortality.", "Young — energetic and reform-minded."),
      candidate("Rt. Hon. Matthew Bichi", 58, "Kano", "Male", "Christian", 58, 68, 70, "Independent", "Neutral", "Minority rights and interfaith dialogue.", "Bridge-builder in Kano politics."),
    ],
    // NE
    [
      candidate("Rt. Hon. Zulum Gwoza", 60, "Borno", "Male", "Muslim", 60, 76, 72, "Northern Caucus", "Friendly", "Emergency management and North-East reconstruction.", "Competent — field experience in crisis zones."),
      candidate("Rt. Hon. Asma'u Monguno", 55, "Borno", "Female", "Muslim", 55, 72, 65, "Northern Caucus", "Neutral", "Women's rehabilitation and vocational training.", "Compassionate — humanitarian focus."),
      candidate("Rt. Hon. Barnabas Bogoro", 58, "Bauchi", "Male", "Christian", 58, 70, 78, "Middle Belt Caucus", "Wary", "Christian minority representation.", "Cautious but competent."),
      candidate("Rt. Hon. Maimuna Kaigama", 52, "Taraba", "Female", "Christian", 52, 74, 68, "Middle Belt Caucus", "Neutral", "Agricultural reform and rural development.", "Cross-party appeal — moderate."),
      candidate("Rt. Hon. Ibrahim Bama", 65, "Borno", "Male", "Muslim", 65, 68, 60, "Northern Caucus", "Friendly", "Traditional institution support and Islamic education.", "Steady — loyal to party."),
    ],
    // SW
    [
      candidate("Rt. Hon. Femi Afolabi", 58, "Lagos", "Male", "Christian", 58, 78, 82, "South-West Alliance", "Wary", "Maintain house discipline and push through executive priority bills.", "Reliable ally — expects his bills fast-tracked in return."),
      candidate("Rt. Hon. Jumoke Adegoke", 55, "Ogun", "Female", "Christian", 55, 76, 70, "South-West Alliance", "Neutral", "Youth employment and digital economy legislation.", "Progressive — tech-savvy legislator."),
      candidate("Rt. Hon. Alhaji Rasheed Oladele", 65, "Oyo", "Male", "Muslim", 65, 70, 68, "South-West Alliance", "Friendly", "Federal road network and South-West infrastructure.", "Party stalwart — dependable."),
      candidate("Rt. Hon. Omolara Ajayi", 50, "Ekiti", "Female", "Christian", 50, 74, 75, "South-West Alliance", "Neutral", "Education reform and ASUU engagement.", "Academic connections — credible on education."),
      candidate("Rt. Hon. Wale Ipaye", 62, "Lagos", "Male", "Muslim", 62, 72, 78, "South-West Alliance", "Wary", "Financial regulation and fintech legislation.", "Lagos business connections — ambitious."),
    ],
    // SE
    [
      candidate("Rt. Hon. Chinedu Okwuosa", 55, "Anambra", "Male", "Christian", 55, 76, 80, "South-East Bloc", "Wary", "Industrial policy and SME support legislation.", "Ambitious — using House platform for visibility."),
      candidate("Rt. Hon. Ngozi Eze", 60, "Enugu", "Female", "Christian", 60, 74, 68, "South-East Bloc", "Neutral", "Women's economic empowerment and trade.", "Cooperative — focused on legislative output."),
      candidate("Rt. Hon. Azubuike Nwankwo", 52, "Abia", "Male", "Christian", 52, 70, 75, "South-East Bloc", "Wary", "Commerce and industry deregulation.", "Aba business community connections."),
      candidate("Rt. Hon. Chidinma Mbah", 48, "Ebonyi", "Female", "Muslim", 48, 78, 65, "South-East Bloc", "Neutral", "Mining regulation and solid minerals.", "Young technocrat — competent."),
      candidate("Rt. Hon. Alhaji Emeka Igwe", 62, "Imo", "Male", "Muslim", 62, 66, 60, "Independent", "Friendly", "Inter-faith harmony legislation.", "Valued minority voice."),
    ],
    // SS
    [
      candidate("Rt. Hon. Preye Alagoa", 58, "Bayelsa", "Male", "Christian", 58, 72, 78, "Niger Delta Caucus", "Wary", "PIB amendments and host community funds.", "Oil politics — transactional."),
      candidate("Rt. Hon. Esohe Osaghae", 55, "Edo", "Female", "Christian", 55, 78, 68, "South-South Alliance", "Neutral", "Creative economy and culture legislation.", "Progressive — policy-driven."),
      candidate("Rt. Hon. Bassey Henshaw", 62, "Cross River", "Male", "Christian", 62, 70, 72, "South-South Alliance", "Friendly", "Tourism and hospitality industry legislation.", "Moderate — easy to work with."),
      candidate("Rt. Hon. Ufuoma Edewor", 50, "Delta", "Female", "Muslim", 50, 74, 70, "Niger Delta Caucus", "Neutral", "Environmental protection and gas flaring ban.", "Principled on environment."),
      candidate("Rt. Hon. Ovie Erhie", 65, "Delta", "Male", "Muslim", 65, 68, 65, "Niger Delta Caucus", "Friendly", "Maritime legislation and waterways development.", "Loyal — community-focused."),
    ],
  ],

  // ── Position 3: Deputy Speaker ──
  [
    // NC
    [
      candidate("Hon. Sewuese Malu", 55, "Benue", "Female", "Christian", 55, 72, 68, "Middle Belt Caucus", "Neutral", "Youth development and sports legislation.", "Moderate — cooperative across party lines."),
      candidate("Hon. Abdullahi Zhitsu", 62, "Niger", "Male", "Muslim", 62, 68, 72, "Northern Caucus", "Friendly", "Rural electrification and infrastructure.", "Loyal — party discipline enforcer."),
      candidate("Hon. Grace Adikpo", 50, "Benue", "Female", "Christian", 50, 76, 65, "Middle Belt Caucus", "Neutral", "Agricultural processing and value chains.", "Technocratic — evidence-based."),
      candidate("Hon. Suleiman Doko", 58, "Niger", "Male", "Muslim", 58, 70, 78, "Northern Caucus", "Wary", "Mining reform and solid minerals development.", "Ambitious but competent."),
      candidate("Hon. James Agber", 65, "Benue", "Male", "Christian", 65, 66, 55, "Middle Belt Caucus", "Friendly", "Veteran affairs and peacekeeping.", "Experienced — no drama."),
    ],
    // NW
    [
      candidate("Hon. Suleiman Kankarofi", 60, "Kano", "Male", "Muslim", 60, 70, 72, "Northern Caucus", "Friendly", "Industrial zones and Kano economic corridor.", "Party loyalist — expects patronage."),
      candidate("Hon. Rahma Gwamna", 55, "Kaduna", "Female", "Muslim", 55, 74, 65, "Northern Caucus", "Neutral", "Maternal healthcare and family planning.", "Progressive voice in conservative zone."),
      candidate("Hon. Aminu Danmusa", 68, "Katsina", "Male", "Muslim", 68, 66, 58, "Northern Caucus", "Friendly", "Agricultural modernisation and livestock reform.", "Old-guard — reliable party vote."),
      candidate("Hon. Bilkisu Inuwa", 48, "Kaduna", "Female", "Christian", 48, 78, 70, "Northern Caucus", "Neutral", "Education technology and digital literacy.", "Young and energetic — reform-minded."),
      candidate("Hon. Daniel Makarfi", 55, "Kaduna", "Male", "Christian", 55, 72, 68, "Independent", "Neutral", "Southern Kaduna development and minority rights.", "Builds bridges across religious lines."),
    ],
    // NE
    [
      candidate("Hon. Bukar Ngala", 58, "Borno", "Male", "Muslim", 58, 74, 70, "Northern Caucus", "Friendly", "Security sector reform and civilian protection.", "Competent — field experience."),
      candidate("Hon. Safiya Damboa", 52, "Yobe", "Female", "Muslim", 52, 72, 65, "Northern Caucus", "Neutral", "Orphan welfare and IDP children's education.", "Compassionate — humanitarian legislator."),
      candidate("Hon. Timothy Liman", 55, "Adamawa", "Male", "Christian", 55, 70, 75, "Middle Belt Caucus", "Wary", "Christian minority advocacy and development.", "Cautious — needs visible wins."),
      candidate("Hon. Aisha Bama", 50, "Borno", "Female", "Muslim", 50, 76, 68, "Northern Caucus", "Neutral", "Healthcare infrastructure in conflict zones.", "Evidence-based — technocratic approach."),
      candidate("Hon. Haruna Bogoro", 65, "Bauchi", "Male", "Muslim", 65, 66, 60, "Northern Caucus", "Friendly", "Traditional medicine regulation and healthcare.", "Steady — loyal to party hierarchy."),
    ],
    // SW
    [
      candidate("Hon. Adebayo Ogunleye", 58, "Lagos", "Male", "Christian", 58, 74, 78, "South-West Alliance", "Wary", "Lagos-Ogun economic corridor and housing.", "Ambitious — gubernatorial aspirations."),
      candidate("Hon. Ronke Adeyanju", 55, "Oyo", "Female", "Christian", 55, 76, 68, "South-West Alliance", "Neutral", "Women in business and trade legislation.", "Cooperative — values legislative output."),
      candidate("Hon. Alhaji Waheed Olawale", 62, "Lagos", "Male", "Muslim", 62, 70, 72, "South-West Alliance", "Friendly", "Maritime sector and blue economy.", "Lagos Muslim community leader — influential."),
      candidate("Hon. Kikelomo Aregbe", 50, "Osun", "Female", "Christian", 50, 72, 65, "South-West Alliance", "Neutral", "Arts, culture, and creative economy.", "Moderate — easy to work with."),
      candidate("Hon. Tunde Lawal", 65, "Ogun", "Male", "Muslim", 65, 68, 60, "South-West Alliance", "Friendly", "Manufacturing and industrialisation.", "Party elder — dependable."),
    ],
    // SE
    [
      candidate("Hon. Tobenna Okafor", 52, "Anambra", "Male", "Christian", 52, 76, 80, "South-East Bloc", "Wary", "Trade and commerce deregulation.", "Ambitious — Onitsha business community."),
      candidate("Hon. Ifeoma Nwosu", 58, "Enugu", "Female", "Christian", 58, 74, 68, "South-East Bloc", "Neutral", "Technology and innovation legislation.", "Pragmatic — focused on output."),
      candidate("Hon. Kelechi Anyanwu", 55, "Imo", "Male", "Christian", 55, 70, 75, "South-East Bloc", "Wary", "South-East development commission.", "Vocal — pushes hard for constituency."),
      candidate("Hon. Adanna Eze", 48, "Ebonyi", "Female", "Muslim", 48, 78, 65, "South-East Bloc", "Neutral", "Rural development and agro-processing.", "Young technocrat — competent."),
      candidate("Hon. Alhaji Uzoma Igwe", 62, "Abia", "Male", "Muslim", 62, 66, 60, "Independent", "Friendly", "Inter-religious commerce and trade.", "Unique minority perspective."),
    ],
    // SS
    [
      candidate("Hon. Diepreye Timitimi", 55, "Bayelsa", "Male", "Christian", 55, 72, 75, "Niger Delta Caucus", "Wary", "Riverine infrastructure and waterways.", "Oil community advocate."),
      candidate("Hon. Ivie Osaghae", 52, "Edo", "Female", "Christian", 52, 76, 68, "South-South Alliance", "Neutral", "Women's health and reproductive rights.", "Progressive — principled legislator."),
      candidate("Hon. Edem Archibong", 58, "Cross River", "Male", "Christian", 58, 70, 72, "South-South Alliance", "Friendly", "Cross River border trade and customs.", "Connected — good federal relationships."),
      candidate("Hon. Oghenefejiro Edewor", 50, "Delta", "Female", "Muslim", 50, 74, 70, "Niger Delta Caucus", "Neutral", "Gas utilisation and petrochemical legislation.", "Technical background — credible."),
      candidate("Hon. Miebaka Sekibo", 60, "Rivers", "Male", "Muslim", 60, 68, 65, "Niger Delta Caucus", "Friendly", "Port development and maritime economy.", "Moderate — cooperative."),
    ],
  ],

];

/** Register the full candidate pools with the selection system */
export function registerConstitutionalPools() {
  setConstitutionalPools(pools);
}
