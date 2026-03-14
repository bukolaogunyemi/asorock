/**
 * Nigerian Name Database
 *
 * Provides curated pools of authentic Nigerian names organised by ethnic group.
 * Used for procedural character generation in the Aso Rock simulation.
 */

export interface NamePool {
  male: string[];
  female: string[];
  surnames: string[];
}

// ---------------------------------------------------------------------------
// NAME_POOLS — at least 20 male, 20 female, 20 surnames per ethnic group
// ---------------------------------------------------------------------------

export const NAME_POOLS: Record<string, NamePool> = {
  Hausa: {
    male: [
      "Abubakar", "Aliyu", "Aminu", "Bello", "Dahiru",
      "Garba", "Hamisu", "Ibrahim", "Ismail", "Kabiru",
      "Lawal", "Maikudi", "Musa", "Nura", "Rabiu",
      "Salihu", "Sani", "Shehu", "Umar", "Yakubu",
      "Adamu", "Bashir", "Faruk", "Haruna", "Idris",
    ],
    female: [
      "Aisha", "Bilkisu", "Fadimatu", "Fatima", "Hafsat",
      "Hauwa", "Hindatu", "Khadija", "Laraba", "Maryam",
      "Ramatu", "Rakiya", "Sadiya", "Safiya", "Saratu",
      "Sumayya", "Umma", "Yagana", "Zainab", "Zuwaira",
      "Asma", "Binta", "Habiba", "Nana", "Rabi",
    ],
    surnames: [
      "Abdullahi", "Abubakar", "Aliyu", "Bello", "Danbatta",
      "Dankwambo", "Garba", "Gusau", "Hassan", "Ibrahim",
      "Inuwa", "Jibrin", "Lawal", "Makarfi", "Musa",
      "Rabiu", "Ringim", "Sani", "Umar", "Yakubu",
      "Danmusa", "Gwamna", "Kagara", "Kankarofi", "Lawan",
    ],
  },

  Fulani: {
    male: [
      "Ardo", "Bello", "Danbatta", "Danjuma", "Dikko",
      "Garba", "Hamidu", "Isa", "Jafaru", "Ladan",
      "Mamman", "Modibo", "Muhammadu", "Murtala", "Nuhu",
      "Saddiq", "Sule", "Tanko", "Usman", "Yahaya",
      "Abubakar", "Aliyu", "Dahiru", "Haliru", "Idris",
    ],
    female: [
      "Amina", "Binta", "Dije", "Fatima", "Fula",
      "Hadiza", "Hannatu", "Hassana", "Hindatu", "Kande",
      "Mairama", "Maryam", "Nana", "Rabi", "Rahmatu",
      "Rukayya", "Sadiya", "Salamatu", "Turai", "Zainab",
      "Asma", "Bilkisu", "Hauwa", "Inna", "Ladidi",
    ],
    surnames: [
      "Abdullahi", "Abubakar", "Aliyu", "Bello", "Danbatta",
      "Danjuma", "Dikko", "Garba", "Hassan", "Isa",
      "Jafaru", "Ladan", "Mamman", "Modibo", "Murtala",
      "Nuhu", "Sule", "Tanko", "Usman", "Yahaya",
      "Adamu", "Fulani", "Haliru", "Jibril", "Sokoto",
    ],
  },

  Yoruba: {
    male: [
      "Adebayo", "Adekola", "Adeniyi", "Adewale", "Akinwale",
      "Babatunde", "Biodun", "Dare", "Emeka", "Femi",
      "Gbenga", "Kehinde", "Kunle", "Lanre", "Lekan",
      "Niyi", "Olu", "Segun", "Tunde", "Wale",
      "Abiodun", "Akintunde", "Dayo", "Idowu", "Rotimi",
    ],
    female: [
      "Adaeze", "Adunola", "Aina", "Arike", "Bisi",
      "Bukola", "Doyin", "Folake", "Funmilayo", "Gbemisola",
      "Iyabo", "Kemi", "Lara", "Morenikeji", "Ngozi",
      "Nike", "Remi", "Shade", "Titilola", "Yetunde",
      "Abimbola", "Aduke", "Bosede", "Dupe", "Idowu",
    ],
    surnames: [
      "Abiodun", "Adebayo", "Adeleke", "Adesanya", "Afolabi",
      "Ajayi", "Akinwale", "Alabi", "Akande", "Adeyanju",
      "Balogun", "Famuyiwa", "Fawehimi", "Ipaye", "Lawal",
      "Makinde", "Oladele", "Oduya", "Ogunleye", "Okonkwo",
      "Olawale", "Adegoke", "Aregbe", "Adeniyi", "Wole",
    ],
  },

  Igbo: {
    male: [
      "Azubuike", "Chidi", "Chiedozie", "Chijioke", "Chikwuemeka",
      "Chinedu", "Chinonso", "Chisom", "Chizaram", "Ebuka",
      "Emeka", "Ikechukwu", "Jideofor", "Kenechukwu", "Nnamdi",
      "Obiajulu", "Obinna", "Ogochukwu", "Okechukwu", "Onyekachi",
      "Chukwuemeka", "Ifeanyi", "Kelechi", "Somto", "Ugochukwu",
    ],
    female: [
      "Adaeze", "Adaora", "Amaka", "Chidinma", "Chioma",
      "Ebele", "Ezinne", "Ifunanya", "Ijeoma", "Ngozi",
      "Nkechi", "Nkiruka", "Nneka", "Ogechi", "Olachi",
      "Onyinye", "Sinachi", "Somkene", "Uchechi", "Ugochi",
      "Chinyere", "Obiageli", "Ogechukwu", "Ujunwa", "Chisom",
    ],
    surnames: [
      "Achebe", "Adichie", "Agu", "Anyanwu", "Chukwu",
      "Dike", "Eze", "Ihejirika", "Ikpeazu", "Mbah",
      "Mbeki", "Ngige", "Nnamdi", "Nwosu", "Obiora",
      "Obi", "Ojukwu", "Okafor", "Okonkwo", "Okoro",
      "Onyeka", "Orji", "Enwerem", "Amogu", "Uzor",
    ],
  },

  Ijaw: {
    male: [
      "Alagoa", "Amain", "Dokubo", "Doubiye", "Ekiyor",
      "Eremie", "Godspower", "Igwe", "Keme", "Loveday",
      "Melford", "Nengi", "Preye", "Prosper", "Seigha",
      "Sobomabo", "Solomon", "Success", "Taribo", "Timipre",
      "Agbeyegbe", "Baribote", "Dikibo", "Ebifa", "Okilo",
    ],
    female: [
      "Adokiye", "Alagoa", "Amina", "Ayo", "Bibi",
      "Bioye", "Diepreye", "Ebiere", "Ebinimi", "Ebiye",
      "Esther", "Igoni", "Itimi", "Kenikeni", "Lossor",
      "Nengi", "Perepamo", "Preye", "Seibiye", "Tariebi",
      "Binaebi", "Ebiakpo", "Keme", "Pereoye", "Zifagha",
    ],
    surnames: [
      "Agbeyegbe", "Alagoa", "Baribote", "Dokubo", "Doubiye",
      "Ebifa", "Eremie", "Ikpoki", "Inko-Tariah", "Kpakol",
      "Loveday", "Melford", "Miere", "Okilo", "Opukiri",
      "Perekeme", "Preye", "Sobomabo", "Timi", "Tonye",
      "Diepreye", "Keme", "Saro-Wiwa", "Sylva", "Yarhere",
    ],
  },

  Tiv: {
    male: [
      "Abadom", "Ager", "Akon", "Akpen", "Alagoa",
      "Atule", "Ayaghe", "Ayila", "Dzua", "Fanen",
      "Gbaa", "Iember", "Iorliam", "Iornum", "Iorwuese",
      "Jato", "Kpav", "Msughter", "Mtsor", "Orkar",
      "Aande", "Adejoh", "Iorfa", "Shima", "Terfa",
    ],
    female: [
      "Abagbe", "Abula", "Adaeze", "Aindoo", "Anande",
      "Asema", "Ayila", "Benen", "Doo", "Dzua",
      "Fanen", "Gbenda", "Iember", "Ihyul", "Iveren",
      "Kpev", "Momnde", "Msugh", "Ngohile", "Ngohol",
      "Amande", "Doosuur", "Kwande", "Mbayem", "Terwase",
    ],
    surnames: [
      "Adi", "Ager", "Akperan", "Atule", "Ayaghe",
      "Ayila", "Dzua", "Gbaa", "Igbana", "Iorbee",
      "Iorfa", "Iorsher", "Jato", "Kpav", "Mtsor",
      "Nyityo", "Ode", "Orkar", "Shima", "Terfa",
      "Akor", "Aper", "Gbinde", "Suswam", "Terkula",
    ],
  },

  Kanuri: {
    male: [
      "Abba", "Abubakar", "Alamin", "Ali", "Baba",
      "Bukar", "Bulama", "Fannami", "Gana", "Hassan",
      "Ibrahim", "Idris", "Kachalla", "Kagu", "Kaka",
      "Maina", "Mali", "Modu", "Mohammed", "Mustapha",
      "Ajiboro", "Gambari", "Kashim", "Kyari", "Lawan",
    ],
    female: [
      "Aisha", "Alti", "Amina", "Asibi", "Baba",
      "Fanama", "Fatima", "Goni", "Hadiza", "Halima",
      "Hauwa", "Kaka", "Kande", "Kiri", "Lami",
      "Maryam", "Ramatou", "Ranna", "Safiya", "Zara",
      "Asabe", "Bintu", "Fatimatu", "Kaltume", "Ngamari",
    ],
    surnames: [
      "Abba", "Abubakar", "Ali", "Bulama", "Bukar",
      "Fannami", "Gana", "Gambari", "Hassan", "Ibrahim",
      "Idris", "Kachalla", "Kashim", "Kyari", "Lawan",
      "Maina", "Modu", "Mustapha", "Ngamdu", "Wakil",
      "Borno", "Gujba", "Kaka", "Monguno", "Yerima",
    ],
  },

  Edo: {
    male: [
      "Aigbe", "Aikhionbare", "Aimuamwosa", "Airen", "Aiyede",
      "Asoro", "Ehigie", "Ehis", "Ekhere", "Ekhosuehi",
      "Ekundayo", "Eriata", "Eribo", "Eriya", "Eseoghene",
      "Igbinoba", "Iyamu", "Izevbekhai", "Obahiagbon", "Ogbimi",
      "Aisosa", "Akhigbe", "Eghosa", "Ighalo", "Osaro",
    ],
    female: [
      "Adaeze", "Aghogho", "Aimienrovbe", "Airen", "Airhiavbere",
      "Asemota", "Avenbuan", "Edo", "Eghosa", "Ehikhamenor",
      "Ehinomen", "Ekene", "Eromosele", "Eseoghene", "Iyobosa",
      "Iyoma", "Obianwe", "Oghomwen", "Osagie", "Osayande",
      "Adesuwa", "Akhigbe", "Eloho", "Omoruyi", "Uwa",
    ],
    surnames: [
      "Aigbe", "Aikhionbare", "Airen", "Asoro", "Ehigie",
      "Ekhosuehi", "Eribo", "Eseoghene", "Igbinoba", "Iyamu",
      "Obahiagbon", "Obeki", "Ehanire", "Ogbeide", "Ogbimi",
      "Ogieva", "Okonoboh", "Omoruyi", "Osagie", "Osunbor",
      "Akhigbe", "Edomwonyi", "Ighodaro", "Nosa", "Ezomo",
    ],
  },

  Efik: {
    male: [
      "Abasiodiong", "Abia", "Adiaha", "Akpan", "Akwa",
      "Ani", "Bassey", "Edem", "Effiom", "Ekpenyong",
      "Etim", "Eyo", "Henshaw", "Ita", "Nkana",
      "Nsa", "Ntuen", "Orok", "Oton", "Ukpong",
      "Akan", "Duke", "Ekong", "Esuene", "Otu",
    ],
    female: [
      "Abasiama", "Adiaha", "Adieze", "Affiong", "Akanawa",
      "Akpan", "Atim", "Ayamba", "Bassey", "Ekom",
      "Enoabasi", "Enyeneobong", "Etido", "Eyo", "Ima",
      "Imabong", "Imaobong", "Mkpanang", "Nsisong", "Ntiense",
      "Arit", "Edisua", "Emem", "Idorenyin", "Iniobong",
    ],
    surnames: [
      "Abasiodiong", "Akpan", "Bassey", "Duke", "Edem",
      "Effiom", "Ekong", "Ekpenyong", "Etim", "Eyo",
      "Henshaw", "Ita", "Nkana", "Nsa", "Ntuen",
      "Ntiense", "Orok", "Oton", "Ukpong", "Usoro",
      "Akan", "Ekpe", "Esuene", "Oku", "Otu",
    ],
  },

  Nupe: {
    male: [
      "Abubakar", "Adefulu", "Aliyu", "Attahiru", "Baba",
      "Dantsoho", "Etsu", "Garba", "Gimba", "Hassan",
      "Ibrahim", "Idris", "Jiya", "Kolo", "Lawal",
      "Maikudi", "Musa", "Ndayako", "Pategi", "Saba",
      "Alhassan", "Bello", "Gana", "Makama", "Ndagi",
    ],
    female: [
      "Aisha", "Amina", "Asabe", "Ayat", "Binta",
      "Fatima", "Hadiza", "Hafsat", "Halima", "Hauwa",
      "Inna", "Kande", "Maryam", "Nana", "Rabi",
      "Rakiya", "Safiya", "Saratu", "Umma", "Zainab",
      "Asmau", "Bilkisu", "Fati", "Khadija", "Ramatu",
    ],
    surnames: [
      "Abubakar", "Aliyu", "Attahiru", "Dantsoho", "Etsu",
      "Garba", "Gimba", "Hassan", "Ibrahim", "Jiya",
      "Kolo", "Lawal", "Makama", "Musa", "Ndagi",
      "Ndayako", "Pategi", "Saba", "Salau", "Usman",
      "Bello", "Gana", "Kutigi", "Nupe", "Wushishi",
    ],
  },

  Urhobo: {
    male: [
      "Agbon", "Akpomuvie", "Arenyeka", "Avwerhotta", "Ayoola",
      "Azoge", "Efeizomor", "Efemwonyi", "Egba", "Egbo",
      "Ejiro", "Ekpeki", "Enaohwo", "Enakimio", "Erhuvwu",
      "Eruotor", "Esisi", "Eyakevwe", "Iyoha", "Oghogho",
      "Arhiavbere", "Ekpe", "Emami", "Ighovie", "Ugolo",
    ],
    female: [
      "Adaeze", "Adire", "Agbon", "Arere", "Avwekasa",
      "Eghogho", "Ejiro", "Eloho", "Emuesiri", "Enaohwo",
      "Erhunse", "Eruotor", "Ese", "Esiri", "Ewomazino",
      "Ifeoma", "Omawumi", "Oritsematosan", "Ovie", "Ufuoma",
      "Edirin", "Egbe", "Eyinomoefe", "Oghenekaro", "Uyoyou",
    ],
    surnames: [
      "Agbon", "Akpomuvie", "Arenyeka", "Arhiavbere", "Avwerhotta",
      "Azoge", "Efeizomor", "Egba", "Ejiro", "Ekpeki",
      "Enaohwo", "Erhuvwu", "Eruotor", "Esisi", "Iyoha",
      "Mukoro", "Oghogho", "Okpara", "Omatsone", "Ovie",
      "Edirin", "Ekpe", "Emami", "Obaro", "Ugolo",
    ],
  },
};

// ---------------------------------------------------------------------------
// ETHNIC_STATE_MAP — ethnic group → home states
// ---------------------------------------------------------------------------

export const ETHNIC_STATE_MAP: Record<string, string[]> = {
  Hausa: [
    "Kano", "Kaduna", "Katsina", "Sokoto", "Zamfara",
    "Kebbi", "Jigawa",
  ],
  Fulani: [
    "Sokoto", "Kebbi", "Zamfara", "Katsina", "Kano",
    "Adamawa", "Taraba",
  ],
  Yoruba: [
    "Lagos", "Ogun", "Oyo", "Osun", "Ondo",
    "Ekiti", "Kwara",
  ],
  Igbo: [
    "Anambra", "Imo", "Enugu", "Ebonyi", "Abia",
  ],
  Ijaw: [
    "Bayelsa", "Rivers", "Delta", "Ondo", "Edo",
  ],
  Tiv: [
    "Benue",
  ],
  Kanuri: [
    "Borno", "Yobe",
  ],
  Edo: [
    "Edo",
  ],
  Efik: [
    "Cross River", "Akwa Ibom",
  ],
  Nupe: [
    "Niger", "Kwara",
  ],
  Urhobo: [
    "Delta",
  ],
};

// ---------------------------------------------------------------------------
// TITLE_BY_ROLE — role identifier → formal title prefix
// ---------------------------------------------------------------------------

export const TITLE_BY_ROLE: Record<string, string> = {
  senator: "Sen.",
  representative: "Hon.",
  governor: "Gov.",
  minister: "Hon. Min.",
  ambassador: "Amb.",
  judge: "Hon. Justice",
  general: "Gen.",
  brigadier: "Brig.",
  admiral: "Adm.",
  commissioner: "Comm.",
  professor: "Prof.",
  doctor: "Dr.",
  chief: "Chief",
  alhaji: "Alh.",
  hajiya: "Hajiya",
  barrister: "Barr.",
  engineer: "Engr.",
};
