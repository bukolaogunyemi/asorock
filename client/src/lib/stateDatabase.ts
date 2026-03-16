// State Database — all 37 Nigerian states (36 + FCT) with real-world data

export interface StateData {
  name: string;
  capital: string;
  yearCreated: number;
  zone: string;
  lgaCount: number;
  population: string;
  ethnicGroups: string[];
  keyEconomies: string[];
  description: string;
}

export const STATE_DATABASE: Record<string, StateData> = {
  // ── North-Central ──────────────────────────────────────
  benue: {
    name: "Benue",
    capital: "Makurdi",
    yearCreated: 1976,
    zone: "North-Central",
    lgaCount: 23,
    population: "6.0 million",
    ethnicGroups: ["Tiv", "Idoma", "Igede"],
    keyEconomies: ["Agriculture", "Yam farming", "Sorghum", "Cassava"],
    description:
      "Known as the 'Food Basket of the Nation', Benue is one of Nigeria's leading agricultural states, famous for yam and sorghum production along the Benue River valley.",
  },
  kogi: {
    name: "Kogi",
    capital: "Lokoja",
    yearCreated: 1991,
    zone: "North-Central",
    lgaCount: 21,
    population: "4.5 million",
    ethnicGroups: ["Igala", "Ebira", "Okun", "Bassa"],
    keyEconomies: ["Mining", "Agriculture", "Trade", "Iron ore"],
    description:
      "Located at the confluence of the Niger and Benue rivers, Kogi is Nigeria's confluence state. Lokoja, its capital, was the first administrative capital of the territory that became Nigeria.",
  },
  kwara: {
    name: "Kwara",
    capital: "Ilorin",
    yearCreated: 1967,
    zone: "North-Central",
    lgaCount: 16,
    population: "3.4 million",
    ethnicGroups: ["Yoruba", "Nupe", "Baruba", "Fulani"],
    keyEconomies: ["Agriculture", "Trade", "Textile", "Tourism"],
    description:
      "Kwara State, known as the 'State of Harmony', bridges the North and South with a rich blend of Yoruba and Northern cultures. Ilorin is a major commercial centre in central Nigeria.",
  },
  nasarawa: {
    name: "Nasarawa",
    capital: "Lafia",
    yearCreated: 1996,
    zone: "North-Central",
    lgaCount: 13,
    population: "2.8 million",
    ethnicGroups: ["Eggon", "Tiv", "Gwandara", "Alago", "Mada"],
    keyEconomies: ["Mining", "Agriculture", "Solid minerals", "Fishing"],
    description:
      "Nasarawa State is rich in solid mineral resources including baryte, coal, gemstone, and columbite. It serves as the nearest state to the Federal Capital Territory.",
  },
  niger: {
    name: "Niger",
    capital: "Minna",
    yearCreated: 1976,
    zone: "North-Central",
    lgaCount: 25,
    population: "5.6 million",
    ethnicGroups: ["Nupe", "Gwari", "Kambari", "Hausa"],
    keyEconomies: ["Agriculture", "Hydroelectricity", "Mining", "Timber"],
    description:
      "Niger is the largest state in Nigeria by land area, home to the Kainji and Jebba hydroelectric dams which supply a significant portion of Nigeria's electricity. The state is endowed with mineral resources.",
  },
  plateau: {
    name: "Plateau",
    capital: "Jos",
    yearCreated: 1976,
    zone: "North-Central",
    lgaCount: 17,
    population: "4.2 million",
    ethnicGroups: ["Berom", "Anaguta", "Afizere", "Jarawa", "Fulani"],
    keyEconomies: ["Tourism", "Agriculture", "Mining", "Tin", "Columbite"],
    description:
      "Plateau State, the 'Home of Peace and Tourism', sits on the Jos Plateau with a cool climate. Once Nigeria's leading tin producer, it is now known for vegetable farming and eco-tourism.",
  },
  fct: {
    name: "FCT",
    capital: "Abuja",
    yearCreated: 1976,
    zone: "North-Central",
    lgaCount: 6,
    population: "3.6 million",
    ethnicGroups: ["Gbagyi", "Gade", "Bassa", "Koro", "Ganagana"],
    keyEconomies: ["Government", "Real estate", "Commerce", "Hospitality"],
    description:
      "The Federal Capital Territory was carved out to serve as Nigeria's neutral capital. Abuja, purpose-built and inaugurated in 1991, replaced Lagos as the seat of federal government and is the political nerve centre of Nigeria.",
  },

  // ── North-West ──────────────────────────────────────────
  jigawa: {
    name: "Jigawa",
    capital: "Dutse",
    yearCreated: 1991,
    zone: "North-West",
    lgaCount: 27,
    population: "5.8 million",
    ethnicGroups: ["Hausa", "Fulani", "Manga", "Badawa"],
    keyEconomies: ["Agriculture", "Cotton", "Groundnut", "Livestock"],
    description:
      "Jigawa State is one of Nigeria's most agriculturally active states, with a largely rural population engaged in crop farming and pastoralism. The state is known for groundnut, cotton, and millet production.",
  },
  kaduna: {
    name: "Kaduna",
    capital: "Kaduna",
    yearCreated: 1967,
    zone: "North-West",
    lgaCount: 23,
    population: "9.3 million",
    ethnicGroups: ["Hausa", "Fulani", "Gbagyi", "Kaje", "Kadara", "Adara"],
    keyEconomies: ["Manufacturing", "Agriculture", "Textile", "Steel", "Education"],
    description:
      "Kaduna is the political and commercial hub of North-West Nigeria. Historically the seat of the defunct Northern Region government, it remains a major industrial and educational centre with large textile and steel industries.",
  },
  kano: {
    name: "Kano",
    capital: "Kano",
    yearCreated: 1967,
    zone: "North-West",
    lgaCount: 44,
    population: "15.9 million",
    ethnicGroups: ["Hausa", "Fulani", "Kanawa"],
    keyEconomies: ["Trade", "Groundnut", "Leather", "Textile", "Manufacturing"],
    description:
      "Kano is the most populous state in Nigeria and the commercial capital of the North. One of Africa's oldest cities, it has been a trans-Saharan trade hub for centuries and remains a major manufacturing and trading centre.",
  },
  katsina: {
    name: "Katsina",
    capital: "Katsina",
    yearCreated: 1987,
    zone: "North-West",
    lgaCount: 34,
    population: "8.8 million",
    ethnicGroups: ["Hausa", "Fulani"],
    keyEconomies: ["Agriculture", "Livestock", "Trade", "Groundnut", "Cotton"],
    description:
      "Katsina State, known as the 'Home of Hospitality', has a rich history as the seat of the Katsina Emirate. The state is largely agricultural, with strong livestock rearing and cross-border trade with Niger Republic.",
  },
  kebbi: {
    name: "Kebbi",
    capital: "Birnin Kebbi",
    yearCreated: 1991,
    zone: "North-West",
    lgaCount: 21,
    population: "4.4 million",
    ethnicGroups: ["Hausa", "Fulani", "Dakarkari", "Kambari"],
    keyEconomies: ["Agriculture", "Fishing", "Rice farming", "Livestock"],
    description:
      "Kebbi State is Nigeria's foremost rice-producing state. Located along the Kebbi and Sokoto rivers, it is also known for fishing and livestock. The annual Argungu Fishing Festival is one of Nigeria's most celebrated cultural events.",
  },
  sokoto: {
    name: "Sokoto",
    capital: "Sokoto",
    yearCreated: 1976,
    zone: "North-West",
    lgaCount: 23,
    population: "5.3 million",
    ethnicGroups: ["Hausa", "Fulani", "Gobir"],
    keyEconomies: ["Agriculture", "Trade", "Livestock", "Groundnut", "Phosphate"],
    description:
      "Sokoto State is home to the Sultanate of Sokoto, the most spiritually influential Islamic institution in Nigeria. The Sokoto Caliphate, founded in 1804, shaped the religious and political landscape of northern Nigeria.",
  },
  zamfara: {
    name: "Zamfara",
    capital: "Gusau",
    yearCreated: 1996,
    zone: "North-West",
    lgaCount: 14,
    population: "4.5 million",
    ethnicGroups: ["Hausa", "Fulani", "Zabarmawa"],
    keyEconomies: ["Gold mining", "Agriculture", "Livestock", "Trade"],
    description:
      "Zamfara is Nigeria's leading gold-producing state, with significant artisanal and small-scale gold mining. The state has faced major security challenges from banditry in recent years.",
  },

  // ── North-East ──────────────────────────────────────────
  adamawa: {
    name: "Adamawa",
    capital: "Yola",
    yearCreated: 1991,
    zone: "North-East",
    lgaCount: 21,
    population: "4.3 million",
    ethnicGroups: ["Fulani", "Chamba", "Kilba", "Mumuye", "Bachama"],
    keyEconomies: ["Agriculture", "Livestock", "Cotton", "Tourism"],
    description:
      "Adamawa State, the 'Land of Beauty', borders Cameroon to the east and is known for its scenic highlands and diverse ethnic groups. Cotton farming and livestock are major economic activities.",
  },
  bauchi: {
    name: "Bauchi",
    capital: "Bauchi",
    yearCreated: 1976,
    zone: "North-East",
    lgaCount: 20,
    population: "7.0 million",
    ethnicGroups: ["Hausa", "Fulani", "Gerawa", "Zaar", "Tafawa Balewa"],
    keyEconomies: ["Agriculture", "Livestock", "Tourism", "Tin mining", "Cassiterite"],
    description:
      "Bauchi State is home to the Yankari Game Reserve, Nigeria's largest and most visited wildlife park. The state has rich mineral deposits and a diverse agricultural economy.",
  },
  borno: {
    name: "Borno",
    capital: "Maiduguri",
    yearCreated: 1976,
    zone: "North-East",
    lgaCount: 27,
    population: "5.9 million",
    ethnicGroups: ["Kanuri", "Shuwa Arab", "Babur", "Mandara"],
    keyEconomies: ["Agriculture", "Trade", "Livestock", "Fish"],
    description:
      "Borno is the largest state in North-East Nigeria and the historical heartland of the ancient Kanem-Bornu Empire. It has suffered greatly from the Boko Haram insurgency that began in 2009 but is undergoing significant reconstruction.",
  },
  gombe: {
    name: "Gombe",
    capital: "Gombe",
    yearCreated: 1996,
    zone: "North-East",
    lgaCount: 11,
    population: "3.3 million",
    ethnicGroups: ["Tangale", "Waja", "Fulani", "Hausa"],
    keyEconomies: ["Agriculture", "Trade", "Limestone", "Livestock"],
    description:
      "Gombe State, known as the 'Jewel in the Savannah', is a commercial and administrative hub for North-East Nigeria. It has significant limestone deposits used in cement manufacturing.",
  },
  taraba: {
    name: "Taraba",
    capital: "Jalingo",
    yearCreated: 1991,
    zone: "North-East",
    lgaCount: 16,
    population: "3.7 million",
    ethnicGroups: ["Jukun", "Mumuye", "Chamba", "Fulani", "Tiv"],
    keyEconomies: ["Agriculture", "Fishing", "Livestock", "Tourism"],
    description:
      "Taraba State, the 'Nature's Gift to the Nation', is richly endowed with natural resources including fertile land, forests, and rivers. It is one of Nigeria's most biodiverse states.",
  },
  yobe: {
    name: "Yobe",
    capital: "Damaturu",
    yearCreated: 1991,
    zone: "North-East",
    lgaCount: 17,
    population: "3.3 million",
    ethnicGroups: ["Kanuri", "Hausa", "Fulani", "Shuwa Arab"],
    keyEconomies: ["Agriculture", "Livestock", "Trade", "Fishing"],
    description:
      "Yobe State borders Niger Republic and Chad to the north. The state has faced significant humanitarian challenges from the Boko Haram conflict and is known for its desert-edge ecology.",
  },

  // ── South-West ──────────────────────────────────────────
  ekiti: {
    name: "Ekiti",
    capital: "Ado-Ekiti",
    yearCreated: 1996,
    zone: "South-West",
    lgaCount: 16,
    population: "3.3 million",
    ethnicGroups: ["Yoruba (Ekiti)"],
    keyEconomies: ["Agriculture", "Cocoa", "Timber", "Education"],
    description:
      "Ekiti State, known as the 'Fountain of Knowledge', has one of the highest concentrations of academics and professors per capita in Africa. Cocoa farming and timber are key economic activities.",
  },
  lagos: {
    name: "Lagos",
    capital: "Ikeja",
    yearCreated: 1967,
    zone: "South-West",
    lgaCount: 20,
    population: "24.0 million",
    ethnicGroups: ["Yoruba", "Awori", "Egun"],
    keyEconomies: ["Finance", "Trade", "Manufacturing", "Technology", "Entertainment", "Seaport"],
    description:
      "Lagos is Nigeria's commercial capital and one of Africa's largest cities. Nigeria's principal seaport and financial hub, it contributes over 30% of Nigeria's GDP. Victoria Island and Lekki are major business districts.",
  },
  ogun: {
    name: "Ogun",
    capital: "Abeokuta",
    yearCreated: 1976,
    zone: "South-West",
    lgaCount: 20,
    population: "7.1 million",
    ethnicGroups: ["Yoruba", "Egba", "Ijebu", "Yewa"],
    keyEconomies: ["Manufacturing", "Agriculture", "Cement", "Ceramics", "Tourism"],
    description:
      "Ogun State is Nigeria's industrial hub, hosting the highest concentration of manufacturing industries. It borders Lagos and Benin Republic. Abeokuta, its capital, is famous for its Olumo Rock heritage site.",
  },
  ondo: {
    name: "Ondo",
    capital: "Akure",
    yearCreated: 1976,
    zone: "South-West",
    lgaCount: 18,
    population: "5.0 million",
    ethnicGroups: ["Yoruba", "Ijaw", "Ilaje"],
    keyEconomies: ["Cocoa", "Bitumen", "Timber", "Oil palm", "Fishing"],
    description:
      "Ondo State is Nigeria's largest cocoa-producing state and holds the world's largest bitumen deposit. It is also a significant timber and oil palm producer along the Atlantic coast.",
  },
  osun: {
    name: "Osun",
    capital: "Osogbo",
    yearCreated: 1991,
    zone: "South-West",
    lgaCount: 30,
    population: "4.7 million",
    ethnicGroups: ["Yoruba", "Ife", "Ijesa"],
    keyEconomies: ["Agriculture", "Cocoa", "Timber", "Tourism", "Gold mining"],
    description:
      "Osun State is the heartland of Yoruba culture. The Osun-Osogbo Sacred Grove, a UNESCO World Heritage Site, draws visitors worldwide. Gold and other minerals are mined in the state.",
  },
  oyo: {
    name: "Oyo",
    capital: "Ibadan",
    yearCreated: 1976,
    zone: "South-West",
    lgaCount: 33,
    population: "8.3 million",
    ethnicGroups: ["Yoruba", "Oyo", "Ogbomosho"],
    keyEconomies: ["Agriculture", "Cocoa", "Trade", "Education", "Manufacturing"],
    description:
      "Oyo State is home to Ibadan, the largest city in sub-Saharan Africa by area. The ancient Oyo Empire was one of West Africa's great pre-colonial kingdoms. The state is a leading cocoa producer and educational centre.",
  },

  // ── South-East ──────────────────────────────────────────
  abia: {
    name: "Abia",
    capital: "Umuahia",
    yearCreated: 1991,
    zone: "South-East",
    lgaCount: 17,
    population: "3.7 million",
    ethnicGroups: ["Igbo", "Ngwa", "Ohuhu"],
    keyEconomies: ["Oil", "Trade", "Manufacturing", "Crafts", "Agriculture"],
    description:
      "Abia State, known as the 'God's Own State', is a commercial hub famous for the Aba market and its manufacturing of shoes, garments, and other consumer goods. Oil production also contributes significantly to its economy.",
  },
  anambra: {
    name: "Anambra",
    capital: "Awka",
    yearCreated: 1991,
    zone: "South-East",
    lgaCount: 21,
    population: "6.0 million",
    ethnicGroups: ["Igbo", "Nnewi", "Onitsha", "Awka"],
    keyEconomies: ["Trade", "Manufacturing", "Oil", "Commerce", "Education"],
    description:
      "Anambra State is Nigeria's most densely populated state and a commercial powerhouse. Onitsha hosts one of Africa's largest markets. The state has a strong entrepreneurial culture and is home to many of Nigeria's prominent business leaders.",
  },
  ebonyi: {
    name: "Ebonyi",
    capital: "Abakaliki",
    yearCreated: 1996,
    zone: "South-East",
    lgaCount: 13,
    population: "3.4 million",
    ethnicGroups: ["Igbo", "Izzi", "Ikwo", "Ezza"],
    keyEconomies: ["Agriculture", "Rice farming", "Lead mining", "Zinc mining", "Salt"],
    description:
      "Ebonyi State, the 'Salt of the Nation', is one of Nigeria's youngest states. It is a leading rice producer and has significant deposits of lead, zinc, salt, limestone, and other minerals.",
  },
  enugu: {
    name: "Enugu",
    capital: "Enugu",
    yearCreated: 1991,
    zone: "South-East",
    lgaCount: 17,
    population: "5.0 million",
    ethnicGroups: ["Igbo", "Udi", "Nkanu"],
    keyEconomies: ["Coal", "Agriculture", "Trade", "Education", "Manufacturing"],
    description:
      "Enugu, the 'Coal City State', was Nigeria's coal-mining capital during the colonial era. It served as the capital of the Eastern Region and remains the cultural and political capital of Igboland.",
  },
  imo: {
    name: "Imo",
    capital: "Owerri",
    yearCreated: 1976,
    zone: "South-East",
    lgaCount: 27,
    population: "5.4 million",
    ethnicGroups: ["Igbo", "Owerri", "Mbaise", "Orlu"],
    keyEconomies: ["Oil", "Agriculture", "Trade", "Academics"],
    description:
      "Imo State, the 'Eastern Heartland', has significant oil and gas production and is one of the South-East's most developed states. Owerri is a vibrant commercial city known for its entertainment scene.",
  },

  // ── South-South ─────────────────────────────────────────
  "akwa ibom": {
    name: "Akwa Ibom",
    capital: "Uyo",
    yearCreated: 1987,
    zone: "South-South",
    lgaCount: 31,
    population: "5.9 million",
    ethnicGroups: ["Ibibio", "Annang", "Oron", "Ekid"],
    keyEconomies: ["Oil & gas", "Agriculture", "Hospitality", "Manufacturing", "Fishing"],
    description:
      "Akwa Ibom is Nigeria's largest oil-producing state by volume, accounting for a significant share of national crude output. Uyo is one of Nigeria's fastest-growing cities with modern infrastructure.",
  },
  bayelsa: {
    name: "Bayelsa",
    capital: "Yenagoa",
    yearCreated: 1996,
    zone: "South-South",
    lgaCount: 8,
    population: "2.3 million",
    ethnicGroups: ["Ijaw", "Nembe", "Brass"],
    keyEconomies: ["Oil & gas", "Fishing", "Agriculture", "Timber"],
    description:
      "Bayelsa State, the 'Glory of all Lands', is located deep in the Niger Delta and is one of Nigeria's most oil-rich states. The state is largely creeks and waterways, making water transport essential.",
  },
  "cross river": {
    name: "Cross River",
    capital: "Calabar",
    yearCreated: 1967,
    zone: "South-South",
    lgaCount: 18,
    population: "4.0 million",
    ethnicGroups: ["Efik", "Boki", "Ejagham", "Bekwarra", "Yako"],
    keyEconomies: ["Tourism", "Agriculture", "Cocoa", "Timber", "Carnival"],
    description:
      "Cross River State is Nigeria's foremost tourism state. Calabar hosts Nigeria's most famous annual carnival and is one of the country's cleanest cities. The state has extensive rainforest reserves and borders Cameroon.",
  },
  delta: {
    name: "Delta",
    capital: "Asaba",
    yearCreated: 1991,
    zone: "South-South",
    lgaCount: 25,
    population: "5.7 million",
    ethnicGroups: ["Urhobo", "Ijaw", "Itsekiri", "Isoko", "Ukwuani"],
    keyEconomies: ["Oil & gas", "Agriculture", "Timber", "Manufacturing", "Trade"],
    description:
      "Delta State is a major oil-producing state in the Niger Delta with diverse ethnic groups. Warri is its commercial hub and one of Nigeria's most important oil-service cities. The state also has significant agricultural and forestry resources.",
  },
  edo: {
    name: "Edo",
    capital: "Benin City",
    yearCreated: 1991,
    zone: "South-South",
    lgaCount: 18,
    population: "4.7 million",
    ethnicGroups: ["Bini (Edo)", "Esan", "Owan", "Akoko-Edo", "Etsako"],
    keyEconomies: ["Oil", "Agriculture", "Trade", "Rubber", "Tourism"],
    description:
      "Edo State is home to the ancient Benin Kingdom, one of Africa's oldest and most sophisticated pre-colonial civilisations, famous for its bronze artworks. Benin City's centuries-old palace walls are a UNESCO tentative heritage site.",
  },
  rivers: {
    name: "Rivers",
    capital: "Port Harcourt",
    yearCreated: 1967,
    zone: "South-South",
    lgaCount: 23,
    population: "7.3 million",
    ethnicGroups: ["Ijaw", "Ikwerre", "Ogoni", "Ekpeye", "Andoni"],
    keyEconomies: ["Oil & gas", "Petrochemicals", "Shipping", "Trade", "Manufacturing"],
    description:
      "Rivers State is Nigeria's oil and gas nerve centre. Port Harcourt, the Garden City, hosts the headquarters of Nigeria's major oil companies and is a major seaport. The state contributes a substantial share of Nigeria's oil revenue.",
  },
};

/** Case-insensitive lookup for a state by name */
export function getStateData(stateName: string): StateData | undefined {
  return STATE_DATABASE[stateName.toLowerCase()];
}
