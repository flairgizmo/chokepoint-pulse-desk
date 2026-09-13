export type PersonGroup = 'c-suite' | 'heads' | 'founders' | 'board';

export interface Person {
  id: string;
  name: string;
  role: string;
  group: PersonGroup;
  initials: string;
  current: boolean;
  bio: string;
  note?: string;
  href?: string;
  photo?: string;
}

export const PEOPLE: Person[] = [
  {
    id: 'verdian',
    name: 'Gilbert Verdian',
    role: 'Founder & CEO',
    group: 'c-suite',
    initials: 'GV',
    current: true,
    href: 'verdianPeople',
    photo: '/people/verdian.jpg',
    bio: 'Former CISO at Vocalink, Mastercard’s UK payments infrastructure. Founded Quant in 2018 after leaving that chair in May 2018. Two decades securing government and bank rails. Put blockchain on the ISO agenda; CISO of the Year in 2017. Convenes ISO/TC 307 WG7.',
  },
  {
    id: 'hargreaves',
    name: 'Martin Hargreaves',
    role: 'Chief Product Officer · Financial Services',
    group: 'c-suite',
    initials: 'MH',
    current: true,
    href: 'hargreavesPeople',
    photo: '/people/hargreaves.jpg',
    bio: 'CPO for financial services. Thirteen years of Vocalink / Mastercard product, two payments patents, and a named author of IETF SATP — the gateway protocol, not a Quant SKU. SATP uses two-phase commit for atomic settlement.',
  },
  {
    id: 'russ',
    name: 'Lenna Russ',
    role: 'Chief Commercial Officer',
    group: 'c-suite',
    initials: 'LR',
    current: true,
    href: 'russPeople',
    photo: '/people/russ.jpg',
    bio: 'Joined Quant in 2024. Sales, marketing and product development. Previously CRO at Tradeteq — private debt and trade finance.',
  },
  {
    id: 'ashton',
    name: 'Phil Ashton',
    role: 'Chief HR Officer',
    group: 'c-suite',
    initials: 'PA',
    current: true,
    href: 'ashtonPeople',
    photo: '/people/ashton.jpg',
    bio: 'Joined Quant in 2022. People, employer brand and talent. Nearly thirty years in international HR.',
  },
  {
    id: 'riley',
    name: 'Dr Luke Riley',
    role: 'Head of Innovation',
    group: 'heads',
    initials: 'LR',
    current: true,
    href: 'rileyPeople',
    photo: '/people/riley.jpg',
    bio: 'Joined from King’s College London in September 2019 to run Quant Labs and Overledger R&D. Named on the ACM interoperability paper, the 2021 options note, and Flow Applications for AI agents.',
  },
  {
    id: 'sentelidis',
    name: 'Theodore Sentelidis',
    role: 'Head of Technology',
    group: 'heads',
    initials: 'TS',
    current: true,
    href: 'sentelidisPeople',
    photo: '/people/sentelidis.jpg',
    bio: 'Leads Quant’s engineering organisation. Public about-us title; joined 2020. Not a whitepaper-era author.',
  },
  {
    id: 'facer',
    name: 'Claire Facer',
    role: 'Senior Product Manager · SATP WG co-chair',
    group: 'heads',
    initials: 'CF',
    current: true,
    href: 'facerPeople',
    photo: '/people/facer.png',
    bio: 'Quant product manager and co-chair of the IETF SATP working group. The protocol is standardised at the IETF; Quant contributes and does not own it.',
  },
  {
    id: 'chiriac',
    name: 'Alexandru (Alex) Chiriac',
    role: 'Overledger architect',
    group: 'heads',
    initials: 'AC',
    current: true,
    href: 'chiriacPeople',
    photo: '/people/chiriac.jpg',
    bio: 'Overledger architect since 2018. Named SATP core author. Public bio lists connectors including Hyperledger Fabric, Corda, Polkadot and the XRP Ledger. Quant credits him with RLN delivery and vendor work on Project Rosalind — a concluded experiment, not a standing Basel mandate.',
  },
  {
    id: 'rawel',
    name: 'Kirat Rawel',
    role: 'Head of Sales',
    group: 'heads',
    initials: 'KR',
    current: true,
    href: 'rawelPeople',
    photo: '/people/rawel.jpg',
    bio: 'Joined 2023 from Finastra, Santander UK, Accenture, Citi and Google. Leads Quant’s sales organisation.',
  },
  {
    id: 'alves',
    name: 'João Alves',
    role: 'Lead Sales Engineer',
    group: 'heads',
    initials: 'JA',
    current: true,
    href: 'alvesPeople',
    photo: '/people/alves.jpg',
    bio: 'Listed on Quant’s about page as Lead Sales Engineer — the technical counterpart to the sales organisation.',
  },
  {
    id: 'baugh',
    name: 'Rachel Baugh',
    role: 'Communications',
    group: 'heads',
    initials: 'RB',
    current: true,
    photo: '/people/baugh.png',
    bio: 'Writes Quant’s public communications, including the Oracle Blockchain Platform Digital Assets partnership.',
  },
  {
    id: 'lovesey',
    name: 'Chris Lovesey',
    role: 'Technical Lead (community-identified)',
    group: 'heads',
    initials: 'CL',
    current: true,
    note: 'Identified by a 2026 community thread as Technical Lead. Previously Engineering Manager at Vocalink. Not on Quant’s about page. Initials only until Quant publishes a portrait.',
    bio: 'Named Technical Lead in a 2026 community thread. Previously Engineering Manager at Vocalink. Not listed on Quant’s public about page. No official portrait has been published.',
  },
  {
    id: 'tasca',
    name: 'Paolo Tasca',
    role: 'Co-founder · former Chief Strategist',
    group: 'founders',
    initials: 'PT',
    current: false,
    href: 'tascaSite',
    photo: '/people/tasca.jpg',
    bio: 'Digital economist who co-founded Quant, signed the Overledger whitepaper and the ordering patent, and wrote the books that name the Internet of Value. UCL CBT, Bundesbank, now Exponential Science. He had left Quant by 2022. The books remain.',
  },
  {
    id: 'paterson',
    name: 'Colin Paterson',
    role: 'Co-founder · former Chief Technology Officer',
    group: 'founders',
    initials: 'CP',
    current: false,
    bio: 'Quant’s first CTO. Cybersecurity and AI across health, defence, finance and utilities — Deutsche Bank and Vocalink appear in the public round-ups — then the whitepaper and the ordering patent. No longer with the company. Quant has not published a portrait.',
  },
  {
    id: 'mondelli',
    name: 'Gaetano Mondelli',
    role: 'Whitepaper inventor',
    group: 'founders',
    initials: 'GM',
    current: false,
    href: 'mondelliSite',
    photo: '/people/mondelli.jpg',
    note: 'Fourth author of the 2018 whitepaper and co-inventor on the US ordering patent. GitHub currently lists Amazon, London — not a current Quant officer. 2017 PoliTo / UCL CBT thesis record is in the library (full text secretated). Portrait is his published GitHub identity.',
    bio: 'Fourth author of the 2018 whitepaper and co-inventor on the US ordering patent. His own site states he invented Overledger. Documentary role is inventor, not a current staff title. The 2017 PoliTo / UCL CBT master’s thesis is a bibliographic record only.',
  },
  {
    id: 'belchior',
    name: 'Rafael Belchior',
    role: 'Former blockchain R&D engineer · SATP author',
    group: 'founders',
    initials: 'RB',
    current: false,
    href: 'belchior',
    photo: '/people/belchior.jpg',
    bio: 'Wrote the ACM interoperability paper while at Quant — the footnote reads “Work done while … at Quant Network”. Hyperledger Global Forum listed him as Quant’s blockchain R&D engineer. SATP core author, Cacti maintainer, CSUR survey. Now at Técnico Lisboa.',
  },
  {
    id: 'dietrich',
    name: 'Guy Dietrich',
    role: 'Board director',
    group: 'board',
    initials: 'GD',
    current: true,
    href: 'dietrichPeople',
    photo: '/people/dietrich.jpg',
    bio: 'Joined the Quant board in April 2019 from Rockefeller Capital Management. US expansion and institutional adjacency — not an operating executive.',
  },
  {
    id: 'smit',
    name: 'Neil Smit',
    role: 'Board director',
    group: 'board',
    initials: 'NS',
    current: true,
    href: 'smitPeople',
    photo: '/people/smit.jpg',
    bio: 'Vice Chairman of Comcast Corporation. Former President and CEO of Comcast Cable. Quant board director. Documented director — not an operating owner of the technology thesis.',
  },
  {
    id: 'yates',
    name: 'David Yates',
    role: 'Board director',
    group: 'board',
    initials: 'DY',
    current: true,
    href: 'yatesPeople',
    photo: '/people/yates.jpg',
    bio: 'Former CEO and Chairman of Vocalink. Joined the Quant board in October 2024. Payments-infrastructure lineage.',
  },
];

export const GROUP_LABEL: Record<PersonGroup, string> = {
  'c-suite': 'The public C-suite, in the order Quant lists them: the founder, then product, commercial, people.',
  heads: 'The heads and architects who made Overledger, Fusion, Flow and the IETF SATP contributions speak.',
  founders:
    'The co-founders, the first CTO, the Overledger inventors, and the research engineer who wrote the ACM paper while at Quant. Some have left. The documents remain.',
  board: 'Documented directors. They sit with the company. They do not operate the technology thesis.',
};

export interface OverledgerBuilder {
  id: string;
  era: string;
  role: string;
}

/** Builders of the interoperability layer — role + era, not a leftover caption. */
export const OVERLEDGER_BUILDERS: OverledgerBuilder[] = [
  { id: 'verdian', era: '2015–', role: 'Founder. Gateway thesis. ISO/TC 307.' },
  { id: 'tasca', era: '2018–2022', role: 'Whitepaper and ordering patent. Left; the books remain.' },
  { id: 'paterson', era: '2018–', role: 'First CTO. Whitepaper and ordering patent. Documentary.' },
  { id: 'mondelli', era: '2018–', role: 'Fourth whitepaper author. Ordering patent. Inventor, not a current officer.' },
  { id: 'chiriac', era: '2018–', role: 'Overledger architect. SATP core author. Named connectors.' },
  { id: 'riley', era: '2019–', role: 'Quant Labs. Interoperability taxonomy. Flow Applications.' },
  { id: 'hargreaves', era: 'SATP era', role: 'CPO. SATP author. Payments patents before DLT.' },
  { id: 'facer', era: 'SATP WG', role: 'Product. IETF SATP co-chair.' },
  { id: 'belchior', era: 'while at Quant', role: 'ACM interoperability paper. SATP author. Now Técnico Lisboa.' },
  { id: 'sentelidis', era: '2020–', role: 'Head of Technology. Engineering organisation.' },
  { id: 'lovesey', era: 'community-identified', role: 'Technical Lead in a 2026 thread. Not on Quant’s about page.' },
];
