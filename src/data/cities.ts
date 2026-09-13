export type CityKind =
  | 'Headquarters'
  | 'Banking'
  | 'Lab'
  | 'Standards'
  | 'Research'
  | 'Markets';

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  kind: CityKind;
  kicker: string;
  lede: string;
  body: string;
  href: string;
  photo?: string;
  photoCredit?: string;
}

export const CITIES: City[] = [
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    kind: 'Headquarters',
    kicker: 'Three programmes, one postcode',
    lede: 'Three programmes share a postcode. The company. The sterling. The lab. Graded separately.',
    body: 'London is three programmes sharing a postcode. Quant Network is the operating company and the technology partner UK Finance selected, on 26 September 2025, to provide Overledger and PayScript for live tokenised-sterling-deposit (GBTD) transactions with Barclays, HSBC, Lloyds Banking Group, NatWest, Nationwide and Santander, supported by EY and Linklaters. That is commercial-bank money, not a Bank of England CBDC. Separately, in February 2026 Quant was selected for the Bank of England Synchronisation Lab — a simulated RT2 environment; Quant’s own note says this is not endorsement or a live RTGS hook-up. A third thread is ISO and IETF work staffed from here (Verdian, Hargreaves, Riley, Facer, Chiriac). Each programme keeps its own source.',
    href: '/programmes#gbtd',
    photo: '/visuals/cities/london.jpg',
    photoCredit: 'Wikimedia Commons — Bank of England',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
    kind: 'Banking',
    kicker: 'Murex MX.3',
    lede: 'Overledger inside MX.3 — a book more than three hundred institutions already run.',
    body: 'On 25 March 2026 Murex and Quant announced a partnership to put tokenised deposits and digital-bond settlement inside MX.3. Overledger is the interoperability layer so MX.3 can talk to multiple public and private ledgers without a parallel stack. That is a named vendor integration — announced, with a joint press note — not a central-bank programme and not a GBTD membership. Euro-area clearing adjacency (Frankfurt, Zurich) is corridor geography around this pin.',
    href: '/programmes#murex',
    photo: '/visuals/cities/paris.jpg',
    photoCredit: 'Wikimedia Commons — La Défense, Paris',
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.006,
    kind: 'Markets',
    kicker: 'Oracle digital assets',
    lede: 'US counterparties and Oracle’s Fabric conversation. Not a digital dollar.',
    body: 'New York is where US capital-markets counterparties, Oracle’s digital-asset platform conversation, and Quant’s board-level US expansion (Guy Dietrich’s 2019 Rockefeller-era appointment) sit. Oracle’s February 2025 Blockchain Platform Digital Assets Edition blog names Overledger as the orchestration layer for unified-ledger workflows on Hyperledger Fabric. Do not read a digital-dollar CBDC into a gateway deployment; see the CBDC chapter for the liability test.',
    href: '/programmes#oracle',
    photo: '/visuals/cities/new-york.jpg',
    photoCredit: 'Wikimedia Commons — Federal Reserve Bank of New York',
  },
  {
    id: 'boston',
    name: 'Boston',
    country: 'United States',
    lat: 42.3601,
    lon: -71.0589,
    kind: 'Research',
    kicker: 'MIT SERC · Hardjono',
    lede: 'The ethics of computing, next to SATP. Landscape. Not a joint programme.',
    body: 'MIT’s Social and Ethical Responsibilities of Computing (SERC) is why Boston sits on this globe next to SATP. Hardjono co-authored Authenticated Delegation and Authorized AI Agents (arXiv 2501.09674) — the documentary join to Flow/MCP and x402. None of this is a Quant–MIT ethics joint programme. It is the academic corridor beside the IETF work.',
    href: '/standards#mit-ethics',
    photo: '/visuals/cities/boston.jpg',
    photoCredit: 'Wikimedia Commons — MIT Killian Court',
  },
  {
    id: 'cambridge',
    name: 'Cambridge',
    country: 'United States',
    lat: 42.3736,
    lon: -71.1097,
    kind: 'Research',
    kicker: 'MIT Connection Science',
    lede: 'Interoperability as a design philosophy. Same year as the whitepaper. A different room.',
    body: 'Cambridge, Massachusetts is the MIT room: Towards a Design Philosophy for Interoperable Blockchain Systems (2018), the IEEE TEMS architecture paper (2019), and the gateways-not-bridges vocabulary SATP later standardises. Same problem as the UCL whitepaper, different room. Not a Quant campus.',
    href: '/research',
    photo: '/visuals/cities/cambridge.jpg',
    photoCredit: 'Wikimedia Commons — MIT Building 10',
  },
  {
    id: 'washington',
    name: 'Washington',
    country: 'United States',
    lat: 38.9072,
    lon: -77.0369,
    kind: 'Markets',
    kicker: 'Policy adjacency',
    lede: 'The rooms that write policy sit here. A pin is not a mandate.',
    body: 'Washington is corridor geography for US institutional conversation around digital assets and payments policy. No Quant–Fed programme is on the public record. A named US official-sector credit will be added with a grade when a URL exists.',
    href: '/programmes',
    photo: '/visuals/cities/washington.jpg',
    photoCredit: 'Wikimedia Commons — Eccles Building, Federal Reserve Board',
  },
  {
    id: 'miami',
    name: 'Miami',
    country: 'United States',
    lat: 25.7617,
    lon: -80.1918,
    kind: 'Markets',
    kicker: 'Sibos 2026 · DISL51',
    lede: 'Sibos 2026. Stand DISL51. The industry floor — not a headquarters.',
    body: 'Posted from @quantnetwork: Discover Stage 28 September 10:30 with Murex on programmable settlement. Welcome drinks 29 September 16:30–18:30. Conference Stage 4 on 1 October. Conference geography, not a Quant headquarters.',
    href: '/programmes#sibos-2026',
    photo: '/visuals/cities/miami.jpg',
    photoCredit: 'Wikimedia Commons — Miami Beach Convention Center',
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    country: 'Germany',
    lat: 50.1109,
    lon: 8.6821,
    kind: 'Markets',
    kicker: 'Sibos 2025 · stand 13',
    lede: 'Sibos 2025. The euro-area floor. Not a campus.',
    body: 'Quant at Sibos 2025, Frankfurt, stand 13. Euro-area banking and TARGET2/TIPS adjacency. Frankfurt and Zurich are corridor nodes around the named Murex integration in Paris — not claimed Quant campuses.',
    href: '/programmes#sibos',
    photo: '/visuals/cities/frankfurt.jpg',
    photoCredit: 'Wikimedia Commons — European Central Bank, Frankfurt',
  },
  {
    id: 'zurich',
    name: 'Zurich',
    country: 'Switzerland',
    lat: 47.3769,
    lon: 8.5417,
    kind: 'Banking',
    kicker: 'Euro-area clearing',
    lede: 'Clearing geography around Paris. The books already sit here.',
    body: 'Zurich sits on the map as euro-area banking and clearing adjacency. Not a Quant office. Not a central-bank programme.',
    href: '/programmes',
    photo: '/visuals/cities/zurich.jpg',
    photoCredit: 'Wikimedia Commons — Swiss National Bank, Zurich',
  },
  {
    id: 'geneva',
    name: 'Geneva',
    country: 'Switzerland',
    lat: 46.2044,
    lon: 6.1432,
    kind: 'Standards',
    kicker: 'ISO/TC 307',
    lede: 'The room that writes the vocabulary down. Verdian proposed it in 2015.',
    body: 'ISO/TC 307 — Blockchain and distributed ledger technologies. Verdian convenes WG7 (interoperability). ISO/TS 23516:2026 (project 82098) is the DLT interoperability framework. ISO 22739 is the vocabulary companion. Standards are slow on purpose. Quant’s product bet is that the gateway layer can ship while the vocabulary is still being written in Geneva.',
    href: '/standards#iso',
    photo: '/visuals/cities/geneva.jpg',
    photoCredit: 'Wikimedia Commons — Palace of Nations, Geneva',
  },
  {
    id: 'basel',
    name: 'Basel',
    country: 'Switzerland',
    lat: 47.5596,
    lon: 7.5886,
    kind: 'Lab',
    kicker: 'BIS bibliography',
    lede: 'The BIS bibliography. Agora. Singleness of money. Citations, not a desk.',
    body: 'The BIS is in Basel. Project Agora, “singleness of money” speeches, and wholesale CBDC research live in that building’s bibliography. Quant staff have described work on BIS Innovation Hub / Bank of England Project Rosalind — a concluded CBDC API experiment run from London, not a standing Quant office in Basel. Oracle’s OBP DA blog quotes the BIS singleness-of-money line as the problem Overledger is hired to help with. Geography plus citations; not a secret mandate.',
    href: '/programmes#basel',
    photo: '/visuals/cities/basel.jpg',
    photoCredit: 'Wikimedia Commons — Bank for International Settlements, Basel',
  },
  {
    id: 'brussels',
    name: 'Brussels',
    country: 'Belgium',
    lat: 50.8503,
    lon: 4.3517,
    kind: 'Standards',
    kicker: 'INATBA',
    lede: 'INATBA. A policy room. Not a product you can buy.',
    body: 'INATBA is the International Association for Trusted Blockchain Applications. Policy room, not a Quant product. Brussels is the standards pin for that association, not a rumour.',
    href: '/standards#inatba',
    photo: '/visuals/cities/brussels.jpg',
    photoCredit: 'Wikimedia Commons — Berlaymont, Brussels',
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    lat: 38.7223,
    lon: -9.1393,
    kind: 'Research',
    kicker: 'Técnico Lisboa · Belchior',
    lede: 'The academic corridor that mapped interoperability, then SATP crash recovery.',
    body: 'Rafael Belchior wrote the ACM interoperability paper while at Quant and is now at Técnico Lisboa. The 2021 ACM Computing Surveys review, the 2023 ACM DLT paper with Riley and Hardjono, the IEEE S&P SoK, Hermes, Cacti — Lisbon is the research engine of the gateway thesis, not a Quant sales office.',
    href: '/people',
    photo: '/visuals/cities/lisbon.jpg',
    photoCredit: 'Wikimedia Commons — Instituto Superior Técnico, Lisbon',
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    kind: 'Banking',
    kicker: 'APAC corridor',
    lede: 'APAC coverage. Project Guardian is landscape. Quant is not the operator.',
    body: 'Singapore is APAC Overledger coverage and banking counterparties. Project Guardian (MAS wholesale tokenisation) is landscape on this pin. Quant is not claimed here as operator. A live corridor, not a claimed BIS programme.',
    href: '/programmes',
    photo: '/visuals/cities/singapore.jpg',
    photoCredit: 'Wikimedia Commons — Monetary Authority of Singapore',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    kind: 'Banking',
    kicker: 'Dentsu Soken',
    lede: 'Dentsu Soken, 14 January 2026. Announced. Not a Bank of Japan CBDC.',
    body: 'Japanese systems integrator Dentsu Soken partnered with Quant on 14 January 2026 on tokenised deposits and programmable settlement. StreamR is BOJ-NET compatible. Announced vendor work — not a Bank of Japan CBDC, and not GBTD. A 2026 Japanese patent, Quant says, protects the multi-DLT token method behind Fusion.',
    href: '/programmes#dentsu',
    photo: '/visuals/cities/tokyo.jpg',
    photoCredit: 'Wikimedia Commons — Bank of Japan',
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    country: 'China',
    lat: 22.3193,
    lon: 114.1694,
    kind: 'Banking',
    kicker: 'APAC counterparties',
    lede: 'A banking corridor. The books already sit here.',
    body: 'Hong Kong sits with Singapore, Tokyo and Sydney as APAC Overledger coverage and banking counterparties. A live corridor, not a claimed BIS programme.',
    href: '/programmes',
    photo: '/visuals/cities/hong-kong.jpg',
    photoCredit: 'Wikimedia Commons — Central, Hong Kong',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    kind: 'Standards',
    kicker: 'ISO adjacency',
    lede: 'APAC standards and banking. The secretariat is still Geneva.',
    body: 'Sydney sits on the globe as an APAC standards and banking node. ISO/TC 307 interoperability work is convened from the Quant side in London/Geneva; this pin is corridor geography, not a second ISO secretariat.',
    href: '/standards',
    photo: '/visuals/cities/sydney.jpg',
    photoCredit: 'Wikimedia Commons — Reserve Bank of Australia, Sydney',
  },
];

const CITY_STILL: Record<string, string> = {
  paris: '/visuals/stills/gateway.jpg',
  'new-york': '/visuals/stories/city.jpg',
  boston: '/visuals/stories/exchange.jpg',
  cambridge: '/visuals/stills/history.jpg',
  washington: '/visuals/stories/canary.jpg',
  miami: '/visuals/stills/sterling.jpg',
  frankfurt: '/visuals/stories/exchange.jpg',
  zurich: '/visuals/stills/future.jpg',
  basel: '/visuals/stories/bis.jpg',
  lisbon: '/visuals/stills/london.jpg',
  singapore: '/visuals/stills/sterling.jpg',
  'hong-kong': '/visuals/stories/city.jpg',
  sydney: '/visuals/stills/hero.jpg',
};

export function cityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function cityVisual(city: City): { src: string; credit?: string } {
  if (city.photo) return { src: city.photo, credit: city.photoCredit };
  return { src: CITY_STILL[city.id] ?? '/visuals/stills/london.jpg' };
}

/** Sourced programme arcs — not live SWIFT. */
export const TOKEN_CORRIDORS: Array<[string, string, string]> = [
  ['london', 'tokyo', 'Dentsu Soken'],
  ['london', 'paris', 'Murex MX.3'],
  ['london', 'new-york', 'Oracle OBP DA'],
  ['london', 'miami', 'Sibos 2026'],
  ['london', 'frankfurt', 'Sibos 2025'],
];

export const SETTLEMENT_ROUTES: Array<[string, string]> = [
  ['london', 'paris'],
  ['london', 'frankfurt'],
  ['london', 'zurich'],
  ['london', 'new-york'],
  ['london', 'singapore'],
  ['paris', 'frankfurt'],
  ['singapore', 'tokyo'],
  ['tokyo', 'hong-kong'],
  ['hong-kong', 'sydney'],
];
